#!/usr/bin/env tsx
/**
 * Migration des anciens devis (créés avant le fix lineItems) :
 *
 *  - Devis "Panier (N articles)" : reconstitue les lignes détaillées
 *    depuis le bloc "Détail du panier" des notes client.
 *  - Devis mono-produit issus du formulaire : convertit le champ
 *    product en une ligne lineItems.
 *  - Corrige la TVA : les prix enregistrés étaient les prix TTC du
 *    site traités comme HT → conversion ÷ 1,20 (arrondi au centime).
 *
 * Sécurité :
 *  - Ne touche par défaut qu'aux statuts pending et draft (jamais
 *    envoyés au client). --all pour inclure les autres statuts.
 *  - Ne touche jamais un devis qui a déjà des lineItems.
 *  - Le champ product d'origine est conservé (masqué dans Studio).
 *
 * Usage :
 *   npx tsx scripts/migrate-quotes-lineitems.ts             # dry-run
 *   npx tsx scripts/migrate-quotes-lineitems.ts --apply --confirm=YES
 *   npx tsx scripts/migrate-quotes-lineitems.ts --apply --confirm=YES --all
 */

import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId) {
  console.error('❌ NEXT_PUBLIC_SANITY_PROJECT_ID manquant.')
  process.exit(1)
}

const args = process.argv.slice(2)
const isDryRun = !args.includes('--apply')
const confirm = args.find((a) => a.startsWith('--confirm='))?.split('=')[1]
const includeAll = args.includes('--all')

if (!isDryRun && !token) {
  console.error('❌ SANITY_WRITE_TOKEN manquant pour --apply.')
  process.exit(1)
}
if (!isDryRun && confirm !== 'YES') {
  console.error('❌ --apply requiert --confirm=YES.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const TVA_FACTOR = 1.2
const toHt = (ttc: number) => Math.round((ttc / TVA_FACTOR) * 100) / 100

type QuoteDoc = {
  _id: string
  numero?: string
  status?: string
  customerNotes?: string
  lineItems?: unknown[]
  product?: {
    name?: string
    slug?: string
    unitPrice?: number
    quantity?: number
    ref?: { _ref?: string }
  }
}

/**
 * Parse le bloc "Détail du panier" généré par l'ancien formulaire :
 *   - 2× Nom du produit · 1 234 € l'unité = 2 468 €
 * Les nombres fr-FR peuvent contenir espaces (dont insécables) et virgule.
 */
function parseCartNotes(notes: string): Array<{ name: string; priceTtc: number; quantity: number }> {
  const lines = notes.split('\n')
  const items: Array<{ name: string; priceTtc: number; quantity: number }> = []
  const re = /^\s*-\s*(\d+)\s*×\s*(.+?)\s*·\s*([\d\s  .,]+?)\s*€\s*l'unité/u
  for (const line of lines) {
    const m = line.match(re)
    if (!m) continue
    const quantity = parseInt(m[1], 10)
    const name = m[2].trim()
    const priceStr = m[3].replace(/[\s  ]/g, '').replace(',', '.')
    const priceTtc = parseFloat(priceStr)
    if (name && Number.isFinite(priceTtc) && priceTtc > 0 && quantity > 0) {
      items.push({ name, priceTtc, quantity })
    }
  }
  return items
}

async function main() {
  console.log(`${isDryRun ? '🔍 DRY-RUN' : '🚀 APPLY'} — Migration devis → lineItems (TVA corrigée)\n`)

  const statusFilter = includeAll
    ? ''
    : ` && status in ["pending", "draft"]`

  const quotes = await client.fetch<QuoteDoc[]>(
    `*[_type == "quote" && defined(product.name) && !defined(lineItems)${statusFilter}] {
      _id, numero, status, customerNotes, product
    } | order(_createdAt desc)`,
  )

  console.log(`${quotes.length} devis à migrer (statuts ${includeAll ? 'TOUS' : 'pending/draft'})\n`)

  let migrated = 0
  let skipped = 0

  for (const q of quotes) {
    const isComposite = q.product?.name?.startsWith('Panier (')
    let lineItems: Array<Record<string, unknown>> = []

    if (isComposite && q.customerNotes) {
      // Panier : reconstitue depuis les notes
      const parsed = parseCartNotes(q.customerNotes)
      if (parsed.length === 0) {
        console.warn(`  ⚠ ${q.numero} (${q.status}) : panier mais notes illisibles — SKIP (à traiter à la main)`)
        skipped++
        continue
      }
      lineItems = parsed.map((it, i) => ({
        _key: `mig-${i}`,
        _type: 'lineItem',
        name: it.name,
        unitPrice: toHt(it.priceTtc),
        quantity: it.quantity,
      }))
      // Contrôle de cohérence : la somme doit retomber sur le total composite
      const sumTtc = parsed.reduce((s, it) => s + it.priceTtc * it.quantity, 0)
      const composite = q.product?.unitPrice ?? 0
      if (Math.abs(sumTtc - composite) > 1) {
        console.warn(
          `  ⚠ ${q.numero} : somme lignes ${sumTtc} € ≠ total composite ${composite} € — SKIP (vérifier à la main)`,
        )
        skipped++
        continue
      }
    } else if (q.product?.name && typeof q.product.unitPrice === 'number') {
      // Mono-produit : une seule ligne, prix TTC site → HT
      lineItems = [
        {
          _key: 'mig-0',
          _type: 'lineItem',
          ...(q.product.ref?._ref && {
            ref: { _type: 'reference', _ref: q.product.ref._ref, _weak: true },
          }),
          name: q.product.name,
          ...(q.product.slug && { slug: q.product.slug }),
          unitPrice: toHt(q.product.unitPrice),
          quantity: q.product.quantity ?? 1,
        },
      ]
    } else {
      skipped++
      continue
    }

    const detail = lineItems
      .map((li) => `      ${li.quantity}× ${li.name} → ${li.unitPrice} € HT`)
      .join('\n')
    console.log(`  → ${q.numero} (${q.status}) : ${lineItems.length} ligne(s)\n${detail}`)

    if (!isDryRun) {
      await client.patch(q._id).set({ lineItems }).commit()
    }
    migrated++
  }

  console.log(
    `\n${isDryRun ? '✅ Dry-run terminé (aucune écriture).' : '✅ Migration appliquée.'} ${migrated} migrés, ${skipped} ignorés.`,
  )
  if (isDryRun && migrated > 0) {
    console.log('Pour appliquer : npx tsx scripts/migrate-quotes-lineitems.ts --apply --confirm=YES')
  }
}

main().catch((err) => {
  console.error('❌ Erreur fatale :', err)
  process.exit(1)
})
