#!/usr/bin/env tsx
/**
 * Récupération des ANCIENS messages du formulaire contact depuis les
 * journaux d'envoi Brevo, pour les archiver en documents contactMessage
 * dans Sanity (comptage rétroactif sur le tableau de bord).
 *
 * Ce que Brevo permet de récupérer :
 *   - la date d'envoi
 *   - le sujet "[Site] <type de projet> — <nom du client>"
 *     → on en déduit le type de projet et le nom
 *
 * Ce que Brevo NE stocke PAS (à retrouver dans Gmail si besoin) :
 *   - le corps du message du client
 *   - son email et son téléphone (le destinataire des logs = l'admin)
 *
 * Limite de rétention : Brevo ne conserve les journaux transactionnels
 * que ~90 jours selon le plan. Au-delà, seule ta boîte Gmail fait foi.
 *
 * Usage :
 *   npx dotenv -e .env.local -- npx tsx scripts/import-brevo-contacts.ts             # dry-run
 *   npx dotenv -e .env.local -- npx tsx scripts/import-brevo-contacts.ts --apply --confirm=YES
 *   ... --days=30    # fenêtre de récupération (défaut 90)
 */

import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const sanityToken = process.env.SANITY_WRITE_TOKEN
const brevoKey = process.env.BREVO_API_KEY

if (!projectId) {
  console.error('❌ NEXT_PUBLIC_SANITY_PROJECT_ID manquant.')
  process.exit(1)
}
if (!brevoKey) {
  console.error('❌ BREVO_API_KEY manquant.')
  process.exit(1)
}

const args = process.argv.slice(2)
const isDryRun = !args.includes('--apply')
const confirm = args.find((a) => a.startsWith('--confirm='))?.split('=')[1]
const days = parseInt(args.find((a) => a.startsWith('--days='))?.split('=')[1] || '90', 10)

if (!isDryRun && !sanityToken) {
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
  token: sanityToken,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Labels du formulaire → valeur projectType stockée (miroir de
// PROJECT_TYPE_LABELS dans src/app/api/contact/route.ts)
const LABEL_TO_TYPE: Record<string, string> = {
  'Achat de mobilier reconditionné': 'achat',
  'Devis livraison pour un produit': 'devis-livraison',
  'Vidage de locaux / reprise': 'vidage',
  'Achat ET vidage': 'mixte',
  'Location longue durée (LLD)': 'lld',
  'Demande de devis détaillé': 'devis',
  'Autre demande': 'autre',
}

type BrevoEvent = {
  email?: string
  date?: string
  subject?: string
  messageId?: string
  event?: string
  tag?: string
}

/**
 * Parse le sujet "[Site] <label projet> — <nom>" (ou avec tiret simple
 * selon la version du template). Retourne null si le format est inconnu.
 */
function parseSubject(subject: string): { projectType: string; name: string } | null {
  const m = subject.match(/^\[Site\]\s*(.+?)\s*[—–-]\s*(.+)$/u)
  if (!m) return null
  const label = m[1].trim()
  const name = m[2].trim()
  return { projectType: LABEL_TO_TYPE[label] || 'autre', name }
}

async function fetchBrevoEvents(): Promise<BrevoEvent[]> {
  const all: BrevoEvent[] = []
  const limit = 100
  let offset = 0
  for (let page = 0; page < 50; page++) {
    const url = new URL('https://api.brevo.com/v3/smtp/statistics/events')
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('offset', String(offset))
    url.searchParams.set('days', String(days))
    url.searchParams.set('event', 'delivered')
    url.searchParams.set('tags', 'contact-form')

    const res = await fetch(url, {
      headers: { 'api-key': brevoKey!, accept: 'application/json' },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Brevo HTTP ${res.status} : ${body.slice(0, 300)}`)
    }
    const data = (await res.json()) as { events?: BrevoEvent[] }
    const events = data.events || []
    all.push(...events)
    if (events.length < limit) break
    offset += limit
  }
  return all
}

async function main() {
  console.log(
    `${isDryRun ? '🔍 DRY-RUN' : '🚀 APPLY'} — Import des anciens messages contact depuis Brevo (${days} derniers jours)\n`,
  )

  const events = await fetchBrevoEvents()
  console.log(`${events.length} événement(s) "delivered" avec le tag contact-form trouvés chez Brevo\n`)

  if (events.length === 0) {
    console.log(
      'Rien à importer. Rappel : Brevo ne garde les journaux que ~90 jours.\n' +
        'Pour les demandes plus anciennes, cherche "subject:[Site]" dans Gmail.',
    )
    return
  }

  // Dédoublonnage : messageIds déjà importés + docs créés par l'API
  const existingIds = await client.fetch<string[]>(
    `*[_type == "contactMessage" && defined(brevoMessageId)].brevoMessageId`,
  )
  const seen = new Set(existingIds)

  let created = 0
  let skipped = 0

  for (const ev of events) {
    const subject = ev.subject || ''
    const parsed = parseSubject(subject)
    if (!parsed) {
      console.warn(`  ⚠ Sujet non reconnu, ignoré : "${subject.slice(0, 80)}"`)
      skipped++
      continue
    }
    const key = ev.messageId || `${ev.date}-${subject}`
    if (seen.has(key)) {
      skipped++
      continue
    }
    seen.add(key)

    console.log(`  → ${ev.date?.slice(0, 10) || '?'} · ${parsed.name} · ${parsed.projectType}`)

    if (!isDryRun) {
      await client.create({
        _type: 'contactMessage',
        name: parsed.name,
        projectType: parsed.projectType,
        message:
          '(Message récupéré depuis les journaux Brevo : le contenu complet, ' +
          "l'email et le téléphone du client sont dans la boîte Gmail, " +
          `email du ${ev.date?.slice(0, 10) || '?'} avec le sujet "${subject}".)`,
        receivedAt: ev.date || new Date().toISOString(),
        handled: true,
        brevoMessageId: key,
      })
    }
    created++
  }

  console.log(
    `\n${isDryRun ? '✅ Dry-run terminé (aucune écriture).' : '✅ Import appliqué.'} ${created} importé(s), ${skipped} ignoré(s).`,
  )
  if (isDryRun && created > 0) {
    console.log(
      'Pour appliquer : npx dotenv -e .env.local -- npx tsx scripts/import-brevo-contacts.ts --apply --confirm=YES',
    )
  }
}

main().catch((err) => {
  console.error('❌ Erreur fatale :', err)
  process.exit(1)
})
