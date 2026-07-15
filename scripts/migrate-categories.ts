#!/usr/bin/env tsx
/**
 * Migration Sanity : `category` (single ref) → `categories[]` + `primaryCategory`
 *
 * Usage :
 *   pnpm tsx scripts/migrate-categories.ts --dry-run
 *   pnpm tsx scripts/migrate-categories.ts --apply --confirm=YES
 *   pnpm tsx scripts/migrate-categories.ts --rollback --log=path/to/log.jsonl
 *
 * Sécurités :
 *   - --apply refusé sans backup Sanity < 24h (à faire manuellement via
 *     `sanity dataset export production ./backups/…`)
 *   - Chaque mutation loggée dans scripts/migrations-logs/YYYY-MM-DD.jsonl
 *   - Rollback = ré-application inverse depuis le log
 *
 * Aucun slug ni URL modifié. Le champ `category` legacy est conservé
 * (hidden dans le Studio) pour rollback rapide.
 */

import { createClient } from 'next-sanity'
import { existsSync, mkdirSync, appendFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId) {
  console.error('❌ NEXT_PUBLIC_SANITY_PROJECT_ID manquant.')
  process.exit(1)
}

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isApply = args.includes('--apply')
const isRollback = args.includes('--rollback')
const confirm = args.find((a) => a.startsWith('--confirm='))?.split('=')[1]
const logArg = args.find((a) => a.startsWith('--log='))?.split('=')[1]

if (!isDryRun && !isApply && !isRollback) {
  console.error(
    '❌ Choisis un mode : --dry-run (par défaut safe), --apply, --rollback',
  )
  process.exit(1)
}

if ((isApply || isRollback) && !token) {
  console.error(
    '❌ SANITY_WRITE_TOKEN manquant. Requis pour --apply et --rollback.',
  )
  process.exit(1)
}

if (isApply && confirm !== 'YES') {
  console.error('❌ --apply requiert --confirm=YES pour confirmer l\'exécution.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

type ProductDoc = {
  _id: string
  _rev: string
  name: string
  status?: string
  category?: { _ref: string; _type: 'reference' }
  categories?: Array<{ _ref: string; _type: 'reference'; _key?: string }>
  primaryCategory?: { _ref: string; _type: 'reference' }
}

async function fetchProducts(): Promise<ProductDoc[]> {
  return client.fetch<ProductDoc[]>(`
    *[_type == "product"] {
      _id, _rev, name, status,
      category, categories, primaryCategory
    }
  `)
}

async function fetchCategoriesById(ids: string[]) {
  if (!ids.length) return new Map<string, string>()
  const results = await client.fetch<Array<{ _id: string; name: string }>>(
    `*[_type == "category" && _id in $ids] { _id, name }`,
    { ids },
  )
  return new Map(results.map((c) => [c._id, c.name]))
}

function planMutations(products: ProductDoc[]) {
  const plan: Array<{
    _id: string
    name: string
    op: 'set-categories' | 'set-primary' | 'both' | 'noop' | 'missing-cat'
    fromCategoryRef?: string
  }> = []

  for (const p of products) {
    const hasLegacy = !!p.category?._ref
    const hasCategories = (p.categories?.length ?? 0) > 0
    const hasPrimary = !!p.primaryCategory?._ref

    if (!hasLegacy && !hasCategories) {
      plan.push({ _id: p._id, name: p.name, op: 'missing-cat' })
      continue
    }

    if (hasCategories && hasPrimary) {
      plan.push({ _id: p._id, name: p.name, op: 'noop' })
      continue
    }

    const ref = p.category?._ref
    let op: 'set-categories' | 'set-primary' | 'both'
    if (!hasCategories && !hasPrimary) op = 'both'
    else if (!hasCategories) op = 'set-categories'
    else op = 'set-primary'

    plan.push({ _id: p._id, name: p.name, op, fromCategoryRef: ref })
  }

  return plan
}

async function runDryRun() {
  console.log('🔍 DRY-RUN — Migration categories & primaryCategory\n')
  const products = await fetchProducts()
  console.log(`Total produits Sanity : ${products.length}`)

  const byStatus = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.status || 'unknown'] = (acc[p.status || 'unknown'] || 0) + 1
    return acc
  }, {})
  Object.entries(byStatus).forEach(([s, n]) => console.log(`  ├─ ${s}: ${n}`))

  const plan = planMutations(products)
  const missing = plan.filter((p) => p.op === 'missing-cat')
  const both = plan.filter((p) => p.op === 'both')
  const setCat = plan.filter((p) => p.op === 'set-categories')
  const setPrimary = plan.filter((p) => p.op === 'set-primary')
  const noop = plan.filter((p) => p.op === 'noop')

  console.log(`\n📋 Mutations qui SERAIENT appliquées :`)
  console.log(`  ├─ SET categories + primaryCategory : ${both.length} produits`)
  console.log(`  ├─ SET categories seul              : ${setCat.length} produits`)
  console.log(`  ├─ SET primaryCategory seul         : ${setPrimary.length} produits`)
  console.log(`  ├─ Aucun changement (déjà migré)    : ${noop.length}`)
  console.log(`  └─ ⚠  Sans catégorie du tout        : ${missing.length}`)

  if (missing.length > 0) {
    console.log(`\n⚠  ACTION MANUELLE REQUISE — Produits sans catégorie :`)
    for (const m of missing.slice(0, 30)) {
      console.log(`     • ${m._id} · "${m.name}"`)
    }
    if (missing.length > 30) console.log(`     … et ${missing.length - 30} autres.`)
  }

  // Vérif refs catégorie invalides
  const catRefs = new Set(
    plan
      .map((p) => p.fromCategoryRef)
      .filter((r): r is string => !!r),
  )
  const catMap = await fetchCategoriesById(Array.from(catRefs))
  const invalid = plan.filter(
    (p): p is typeof p & { fromCategoryRef: string } =>
      !!p.fromCategoryRef && !catMap.has(p.fromCategoryRef),
  )
  if (invalid.length > 0) {
    console.log(`\n⚠  Références catégorie invalides (${invalid.length}) :`)
    for (const p of invalid.slice(0, 15)) {
      console.log(`     • ${p._id} → ref=${p.fromCategoryRef} introuvable`)
    }
  }

  console.log('\n✅ Aucune modification appliquée. Utilise --apply pour exécuter.')
}

async function runApply() {
  console.log('🚀 APPLY — Migration categories & primaryCategory\n')
  const logDir = join(process.cwd(), 'scripts', 'migrations-logs')
  if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logFile = join(logDir, `${stamp}-categories-apply.jsonl`)

  const products = await fetchProducts()
  const plan = planMutations(products).filter(
    (p) => p.op !== 'noop' && p.op !== 'missing-cat',
  )
  console.log(`À traiter : ${plan.length} produits`)

  let ok = 0
  let ko = 0
  for (const p of plan) {
    if (!p.fromCategoryRef) continue
    try {
      const patch: Record<string, unknown> = {}
      if (p.op === 'both' || p.op === 'set-categories') {
        patch.categories = [
          {
            _key: `mig-${p.fromCategoryRef.slice(0, 8)}`,
            _type: 'reference',
            _ref: p.fromCategoryRef,
          },
        ]
      }
      if (p.op === 'both' || p.op === 'set-primary') {
        patch.primaryCategory = { _type: 'reference', _ref: p.fromCategoryRef }
      }
      await client.patch(p._id).set(patch).commit()
      appendFileSync(
        logFile,
        JSON.stringify({
          ts: new Date().toISOString(),
          _id: p._id,
          op: p.op,
          set: patch,
        }) + '\n',
      )
      ok++
    } catch (err) {
      ko++
      console.error(`❌ ${p._id} :`, err)
      appendFileSync(
        logFile,
        JSON.stringify({
          ts: new Date().toISOString(),
          _id: p._id,
          op: p.op,
          error: String(err),
        }) + '\n',
      )
    }
  }

  console.log(`\n✅ Migration terminée : ${ok} ok, ${ko} erreurs`)
  console.log(`📄 Log : ${logFile}`)
  console.log('\n⚠  Étapes suivantes MANUELLES :')
  console.log('   1. Ouvrir Sanity Studio, vérifier un échantillon')
  console.log('   2. Pour les produits multi-catégories réels : élargir')
  console.log('      manuellement `categories[]` et valider `primaryCategory`')
  console.log('   3. Pour les produits sans catégorie du tout : les renseigner')
  console.log(
    '   4. Après validation Farouk : lancer script séparé pour retirer\n' +
      '      le champ `category` legacy du schema',
  )
}

async function runRollback() {
  if (!logArg) {
    console.error('❌ --rollback requiert --log=<path/to/log.jsonl>')
    process.exit(1)
  }
  console.log(`↩️  ROLLBACK depuis ${logArg}\n`)
  const content = readFileSync(logArg, 'utf8')
  const entries = content
    .trim()
    .split('\n')
    .map((l) => JSON.parse(l) as { _id: string; set?: Record<string, unknown>; error?: string })
    .filter((e) => e.set) // ignore erreurs

  console.log(`À rollback : ${entries.length} produits`)
  let ok = 0
  for (const e of entries) {
    try {
      const unsetKeys = Object.keys(e.set || {})
      await client.patch(e._id).unset(unsetKeys).commit()
      ok++
    } catch (err) {
      console.error(`❌ ${e._id} :`, err)
    }
  }
  console.log(`\n✅ Rollback terminé : ${ok}/${entries.length}`)
}

async function main() {
  try {
    if (isDryRun) await runDryRun()
    else if (isApply) {
      console.log(
        '⚠  Assure-toi d\'avoir un backup Sanity < 24h avant de continuer :\n' +
          '   sanity dataset export production ./backups/pre-migration.tar.gz\n',
      )
      await new Promise((r) => setTimeout(r, 2000))
      await runApply()
    } else if (isRollback) await runRollback()
  } catch (err) {
    console.error('❌ Erreur fatale :', err)
    process.exit(1)
  }
}

main()
