#!/usr/bin/env tsx
/**
 * Reprise de l'historique de gestion dans Sanity.
 *
 * Reprend les deux fichiers de suivi tenus jusqu'ici sous tableur :
 *
 *   1. Tableau_Gestion_Mobilier_Malin.xlsx
 *      → onglet « Frais fixes »  : les charges qui tombent tous les mois
 *      → onglet « Tableau de bord » : les encaissements mensuels de
 *        janvier à juin 2026, saisis en total (aucun détail vente par
 *        vente n'existe dans le fichier, l'onglet Encaissements est vide)
 *
 *   2. Vente_Mobilier_Malin_du_01_08_au_31_08.csv
 *      → les 32 ventes d'août 2026, ligne par ligne
 *
 * Les mois de janvier à juin deviennent une écriture de report par mois
 * (« Report d'encaissements »), pour que le résultat annuel soit juste
 * sans inventer un détail qu'on n'a pas. Août est repris en détail
 * puisqu'on l'a. Juillet n'est chiffré nulle part dans le fichier : il
 * est laissé de côté, à saisir à la main si le montant est retrouvé.
 *
 * Le script est idempotent : chaque document a un _id déterministe,
 * un second passage écrase au lieu de dupliquer.
 *
 * Usage :
 *   npx dotenv -e .env.local -- npx tsx scripts/import-gestion.ts               # dry-run
 *   npx dotenv -e .env.local -- npx tsx scripts/import-gestion.ts --apply --confirm=YES
 *   ... --only=ventes|charges|reports   # limite l'import à un bloc
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
const only = args.find((a) => a.startsWith('--only='))?.split('=')[1]

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

const eur = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

// ─── 1. Charges fixes mensuelles ─────────────────────────────
// Onglet « Frais fixes » du classeur. Seules les lignes chiffrées sont
// reprises : électricité, assurance et comptabilité y sont vides.

const FIXED_CHARGES = [
  { key: 'loyer', label: 'Loyer', category: 'loyer', amountTtc: 5000 },
  { key: 'salaires', label: 'Salaires / charges', category: 'salaires', amountTtc: 4000 },
  { key: 'telecom', label: 'Téléphone / Internet', category: 'web', amountTtc: 150 },
  // Les 460 € de l'onglet « Frais fixes » sont l'abonnement Bon Coin.
  // Ils apparaissaient aussi en dépense variable dans le tableau de
  // bord du classeur : ils ne sont comptés qu'une fois ici.
  { key: 'leboncoin', label: 'Abonnement Bon Coin', category: 'publicite', amountTtc: 460 },
]

// ─── 2. Encaissements mensuels de report ─────────────────────
// Onglet « Tableau de bord », colonne B. Juillet n'est pas chiffré
// (formule sur un onglet vide) : volontairement absent de la liste.

const MONTHLY_CARRY = [
  { month: '01', label: 'Janvier', amount: 11506 },
  { month: '02', label: 'Février', amount: 7444.4 },
  { month: '03', label: 'Mars', amount: 14900.4 },
  { month: '04', label: 'Avril', amount: 7603.6 },
  { month: '05', label: 'Mai', amount: 10217.2 },
  { month: '06', label: 'Juin', amount: 14798 },
]
const CARRY_YEAR = '2026'

/** Dernier jour du mois, pour dater le report en fin de période. */
function lastDayOf(year: string, month: string): string {
  const d = new Date(Number(year), Number(month), 0)
  return `${year}-${month}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── 3. Ventes d'août 2026, ligne par ligne ──────────────────
// Recopie fidèle du CSV : aucun montant n'est corrigé ni réinterprété.

type RawSale = {
  date: string
  client: string
  designation: string
  amount: number
  shipping: number
  payment: string
  type: string
  note?: string
}

const AUGUST_SALES: RawSale[] = [
  { date: '03/08/2026', client: 'RENAUD FLAVIGNY', designation: 'Bureau droit pro 140x80 chêne clair voile de fond + 1 fauteuil sedus', amount: 185, shipping: 69, payment: 'Carte bancaire', type: 'Livraison Cocolis' },
  { date: '03/08/2026', client: 'CITYNOX', designation: 'Bureau Steelcase 160 x 80 cm Blanc Laqué avec Passe-Câbles et Pieds Aluminium', amount: 156, shipping: 60, payment: 'Carte bancaire', type: 'Livraison Cocolis', note: 'Livraison COCOLIS prévue le 20/08/2026' },
  { date: '05/08/2026', client: 'RW ROBOTICS', designation: '3 fauteuil KHOLER', amount: 252, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '06/08/2026', client: 'RICHARD SEBASTEN', designation: '1 Caisson métalique', amount: 96, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '07/08/2026', client: 'FRANCE CLEAN', designation: '2 armoires basse', amount: 120, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '11/08/2026', client: 'ciota', designation: '1 armoire 2m metalique', amount: 200, shipping: 0, payment: 'Espèces', type: 'Autre livraison' },
  { date: '11/08/2026', client: 'chabal', designation: '2 fauteuil klober', amount: 120, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '13/08/2026', client: 'asso chapitre 2', designation: "4 chaise d'accueil", amount: 144, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '13/08/2026', client: 'PHOCEEO', designation: '1 armoire haute 2 chaise 2 caisson', amount: 250, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '14/08/2026', client: 'volpi gael', designation: '8 bureau + 1 bench', amount: 1458, shipping: 0, payment: 'Carte bancaire', type: 'Autre livraison', note: 'livraison prévu mardi' },
  { date: '14/08/2026', client: 'famille en action', designation: '1 bureau alcoves + 1 fauteuil + 1 armoire metalique', amount: 416, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '17/08/2026', client: 'ADRIAN POSTEA', designation: '2 bureau 140x80 + 1 fauteuil ergonomique klober + 4 chaises lucil + 1 table ronde', amount: 708, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '17/08/2026', client: 'INGRID LOUISE', designation: '2 Bureau Alcôve + 4 Fauteuil ergonomique KLOBER + 7 Bureau professionnel droit 140 x 80 cm chêne clair', amount: 831, shipping: 0, payment: 'Carte bancaire', type: 'Autre livraison', note: 'Acompte de 50 % sur une commande de 1 662 € TTC. Solde encaissé le 24/08/2026.' },
  { date: '22/08/2026', client: 'Varun Sohanda', designation: '1 chaise klober', amount: 60, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '22/08/2026', client: 'achour tani', designation: '1 chaise sedus', amount: 20, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '22/08/2026', client: 'Robin Andreani', designation: '1 bureau', amount: 116, shipping: 0, payment: 'Carte bancaire', type: 'Autre livraison' },
  { date: '23/08/2026', client: 'mustapha', designation: '11 chaises de formation', amount: 600, shipping: 0, payment: 'Espèces', type: 'Autre livraison' },
  { date: '23/08/2026', client: 'RP concierge', designation: '1 chaise steelcase reply air', amount: 120, shipping: 0, payment: 'leboncoin', type: 'Autre livraison' },
  { date: '23/08/2026', client: 'hanan sitbon', designation: '1 chaise klober', amount: 60, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '24/08/2026', client: 'INGRID LOUISE', designation: '2 Bureau Alcôve + 4 Fauteuil ergonomique KLOBER + 7 Bureau professionnel droit 140 x 80 cm chêne clair', amount: 831, shipping: 0, payment: 'Carte bancaire', type: 'Autre livraison', note: 'Solde de la commande de 1 662 € TTC. Acompte de 50 % encaissé le 17/08/2026.' },
  { date: '24/08/2026', client: 'DURIVEAU', designation: '1 armoire', amount: 72, shipping: 0, payment: 'Carte bancaire', type: 'Sur place' },
  { date: '24/08/2026', client: 'GARNIER EMILE', designation: '1 bureau 140x80', amount: 96, shipping: 0, payment: 'stripe', type: 'Sur place' },
  { date: '25/08/2026', client: 'EMMANUEL MENGES', designation: '2 chaise steelcase reply air', amount: 240, shipping: 0, payment: 'stripe', type: 'Sur place' },
  { date: '25/08/2026', client: 'Matthieu Foltyn', designation: '1 armoire metalique', amount: 40, shipping: 0, payment: 'stripe', type: 'Sur place' },
  { date: '25/08/2026', client: 'jarrar nassim', designation: 'canapé adamo', amount: 550, shipping: 0, payment: 'Espèces', type: 'Sur place', note: 'lavage 60 euros lydie' },
  { date: '26/08/2026', client: 'alexandre', designation: '1 vestiaire metalique 2 portes', amount: 50, shipping: 0, payment: 'Espèces', type: 'Sur place' },
  // Les 50 € et 96 € sont cités dans le commentaire mais la colonne
  // « frais de livraison » du suivi les laisse à 0 : impossible de
  // savoir s'ils sont compris dans le montant encaissé ou facturés à
  // part. On reprend la colonne telle quelle, le commentaire garde
  // l'information pour trancher plus tard.
  { date: '27/08/2026', client: 'ballester', designation: 'Armoire basse + 1 armoire mi haute', amount: 206, shipping: 0, payment: 'stripe', type: 'Autre livraison', note: 'livraison a aix prevue lundi 31/08 facturé 50€' },
  { date: '27/08/2026', client: 'Rebbecca', designation: '2 bureau assis debout', amount: 396, shipping: 0, payment: 'stripe', type: 'Autre livraison', note: 'livraison a aix prevue lundi 31/08 facturé 96€' },
  { date: '28/08/2026', client: 'client leboncoin', designation: '1 armoire basse', amount: 60, shipping: 0, payment: 'Espèces', type: 'Sur place' },
  { date: '28/08/2026', client: 'oriaderm medical', designation: 'bureaux', amount: 733.2, shipping: 0, payment: 'stripe', type: 'Autre livraison' },
  { date: '30/08/2026', client: 'Melanie bassette', designation: '1 bureau + 1 chaise', amount: 112, shipping: 0, payment: 'stripe', type: 'Sur place' },
  { date: '31/08/2026', client: 'rousseaux myriam', designation: '1 caisson', amount: 56, shipping: 0, payment: 'stripe', type: 'Autre livraison' },
]

const PAYMENT_MAP: Record<string, string> = {
  'Carte bancaire': 'cb',
  Espèces: 'especes',
  stripe: 'stripe',
  leboncoin: 'leboncoin',
  Virement: 'virement',
  Chèque: 'cheque',
}

const TYPE_MAP: Record<string, string> = {
  'Sur place': 'sur-place',
  'Livraison Cocolis': 'livraison-cocolis',
  'Autre livraison': 'autre-livraison',
}

/** DD/MM/YYYY → YYYY-MM-DD */
function toIsoDate(fr: string): string {
  const [d, m, y] = fr.split('/')
  return `${y}-${m}-${d}`
}

/**
 * Canal de la vente. Le CSV ne le note pas : on le déduit du mode de
 * paiement. Stripe = paiement en ligne donc site, Bon Coin = Bon Coin,
 * carte bancaire sur TPE ou espèces = encaissé au showroom.
 */
function channelOf(payment: string): string {
  if (payment === 'stripe') return 'site'
  if (payment === 'leboncoin') return 'leboncoin'
  return 'showroom'
}

// ─── Exécution ───────────────────────────────────────────────

async function main() {
  console.log(`\n📊 Reprise de l'historique de gestion — ${projectId}/${dataset}`)
  console.log(isDryRun ? '   Mode : SIMULATION (aucune écriture)\n' : '   Mode : ÉCRITURE RÉELLE\n')

  const docs: Array<Record<string, unknown>> = []

  // Charges fixes
  if (!only || only === 'charges') {
    for (const c of FIXED_CHARGES) {
      docs.push({
        _id: `fixedCharge-${c.key}`,
        _type: 'fixedCharge',
        label: c.label,
        category: c.category,
        amountTtc: c.amountTtc,
        tvaRate: c.category === 'salaires' ? 0 : 20,
        startDate: `${CARRY_YEAR}-01-01`,
        notes: 'Repris du tableur de gestion (onglet Frais fixes).',
      })
    }
    const total = FIXED_CHARGES.reduce((s, c) => s + c.amountTtc, 0)
    console.log(`🔁 Charges fixes : ${FIXED_CHARGES.length} lignes, ${eur(total)} / mois`)
    for (const c of FIXED_CHARGES) console.log(`   · ${c.label.padEnd(26)} ${eur(c.amountTtc)}`)
    console.log('')
  }

  // Reports mensuels janvier → juin
  if (!only || only === 'reports') {
    for (const m of MONTHLY_CARRY) {
      docs.push({
        _id: `sale-report-${CARRY_YEAR}-${m.month}`,
        _type: 'sale',
        date: lastDayOf(CARRY_YEAR, m.month),
        customerName: 'Report tableur',
        designation: `Report d'encaissements — ${m.label} ${CARRY_YEAR}`,
        amountCollected: m.amount,
        shippingFee: 0,
        paymentMethod: 'autre',
        saleType: 'sur-place',
        channel: 'autre',
        notes:
          'Total du mois repris du tableur de gestion. Le détail vente par vente ' +
          "n'existait pas dans le fichier : cette ligne remplace l'ensemble du mois.",
        autoCreated: false,
      })
    }
    const total = MONTHLY_CARRY.reduce((s, m) => s + m.amount, 0)
    console.log(`📅 Reports mensuels : ${MONTHLY_CARRY.length} mois, ${eur(total)}`)
    for (const m of MONTHLY_CARRY) console.log(`   · ${m.label.padEnd(12)} ${eur(m.amount)}`)
    console.log(
      "   · Juillet      non chiffré dans le fichier : le mois reste marqué non\n" +
        '                  renseigné dans Pilotage, et se complète depuis le tableau',
    )
    console.log('')
  }

  // Ventes d'août, en détail
  if (!only || only === 'ventes') {
    AUGUST_SALES.forEach((s, i) => {
      docs.push({
        _id: `sale-import-2026-08-${String(i + 1).padStart(2, '0')}`,
        _type: 'sale',
        date: toIsoDate(s.date),
        customerName: s.client,
        designation: s.designation,
        amountCollected: s.amount,
        shippingFee: s.shipping,
        paymentMethod: PAYMENT_MAP[s.payment] || 'autre',
        saleType: TYPE_MAP[s.type] || 'sur-place',
        channel: channelOf(s.payment),
        ...(s.note && { notes: s.note }),
        autoCreated: false,
      })
    })
    const total = AUGUST_SALES.reduce((s, x) => s + x.amount, 0)
    const ship = AUGUST_SALES.reduce((s, x) => s + x.shipping, 0)
    console.log(`💰 Ventes d'août : ${AUGUST_SALES.length} lignes, ${eur(total)}`)
    console.log(`   dont frais de livraison facturés : ${eur(ship)}\n`)

    // Montants répétés : ce ne sont pas des doublons de saisie mais des
    // règlements en deux fois. La note de chaque ligne le précise.
    const seen = new Map<string, string[]>()
    for (const s of AUGUST_SALES) {
      const k = `${s.client.toLowerCase()}|${s.amount}`
      seen.set(k, [...(seen.get(k) || []), s.date])
    }
    for (const [k, dates] of seen) {
      if (dates.length > 1) {
        const [name, amt] = k.split('|')
        console.log(
          `ℹ️  ${name} — ${eur(Number(amt))} × ${dates.length} (${dates.join(', ')}) : acompte puis solde.`,
        )
      }
    }
    console.log('')
  }

  if (isDryRun) {
    console.log(`\n🔎 Simulation : ${docs.length} documents seraient créés ou mis à jour.`)
    console.log('   Relance avec --apply --confirm=YES pour écrire dans Sanity.\n')
    return
  }

  let ok = 0
  for (const doc of docs) {
    try {
      await client.createOrReplace(doc as never)
      ok++
    } catch (err) {
      console.error(`❌ ${doc._id} :`, err instanceof Error ? err.message : err)
    }
  }
  console.log(`\n✅ ${ok}/${docs.length} documents écrits dans Sanity.\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
