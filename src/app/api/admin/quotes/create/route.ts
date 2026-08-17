/**
 * POST /api/admin/quotes/create
 *
 * Crée un devis manuel dans Sanity depuis /admin/nouveau-devis
 * et envoie automatiquement l'email au client avec le lien vers
 * la page devis (où il pourra accepter + payer).
 *
 * Protégé par header x-admin-secret === ADMIN_IMPORT_SECRET.
 * Nécessite SANITY_WRITE_TOKEN pour créer le doc Sanity.
 *
 * Body :
 * {
 *   customer: { name, email, phone?, company? },
 *   shippingAddress: { street, postalCode, city, floor?, elevator?, instructions? },
 *   lineItems: [{ name, unitPrice, quantity, slug?, refId? }],
 *   shippingFee?: number,
 *   options?: [{ label, price }],
 *   tvaRate?: number,   // par défaut 20
 *   validUntilDays?: number,  // par défaut 30
 *   pdfNotes?: string,
 *   internalNotes?: string,
 * }
 *
 * Réponse :
 * {
 *   ok: true,
 *   uid: 'abc123...',
 *   numero: 'DEV-2026-0042',
 *   url: 'https://mobiliermalin.com/devis/abc123...',
 *   emailSent: true
 * }
 */

import { NextResponse } from 'next/server'
import { getWriteClient, isSanityWriteConfigured } from '@/lib/sanity-write'
import { sendEmail } from '@/lib/brevo'
import { LEGAL } from '@/lib/legal'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type LineItemIn = {
  name?: string
  unitPrice?: number
  quantity?: number
  slug?: string
  refId?: string
}

type OptionIn = {
  label?: string
  price?: number
}

type Payload = {
  documentType?: 'quote' | 'invoice'
  customer?: {
    name?: string
    email?: string
    phone?: string
    company?: string
  }
  shippingAddress?: {
    street?: string
    postalCode?: string
    city?: string
    floor?: string
    elevator?: 'yes' | 'no' | 'unknown'
    instructions?: string
  }
  lineItems?: LineItemIn[]
  shippingFee?: number
  depositPercent?: number
  options?: OptionIn[]
  tvaRate?: number
  validUntilDays?: number
  pdfNotes?: string
  internalNotes?: string
}

async function generateNumero(documentType: 'quote' | 'invoice'): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = documentType === 'invoice' ? 'FAC' : 'DEV'
  const client = getWriteClient()
  if (!client) return `${prefix}-${year}-0001`
  const count = await client.fetch<number>(
    `count(*[_type == "quote" && numero match "${prefix}-${year}-*"])`,
  )
  const next = (count || 0) + 1
  return `${prefix}-${year}-${String(next).padStart(4, '0')}`
}

function buildClientEmailHtml(args: {
  documentType: 'quote' | 'invoice'
  customerName: string
  numero: string
  total: number
  validUntil: string
  viewUrl: string
}): string {
  const priceStr = args.total.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const isInvoice = args.documentType === 'invoice'
  const docLabel = isInvoice ? 'facture' : 'devis'
  const introLine = isInvoice
    ? `Comme convenu, voici votre facture pour <strong style="color: #1a1a1a;">${priceStr} € TTC</strong>. Le paiement en ligne par carte bancaire est disponible directement via le bouton ci-dessous.`
    : `Suite à notre échange, voici votre devis personnalisé pour <strong style="color: #1a1a1a;">${priceStr} € TTC</strong>.`
  const validityLine = isInvoice
    ? ''
    : `<p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">Ce devis est valide jusqu'au <strong style="color: #1a1a1a;">${args.validUntil}</strong>. Vous pouvez le consulter en détail et régler directement en ligne par carte bancaire via le lien ci-dessous.</p>`
  const ctaLabel = isInvoice ? 'Payer la facture' : 'Consulter et régler le devis'
  return `<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; background: #f5f4f0; padding: 40px 20px; color: #1a1a1a; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: white; padding: 40px 32px; border-radius: 4px;">
    <p style="color: #c8a25b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">
      Mobilier Malin
    </p>
    <h1 style="font-family: Georgia, serif; font-size: 28px; margin: 0 0 24px; color: #1a1a1a;">
      Votre ${docLabel} n° ${args.numero}
    </h1>

    <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
      Bonjour ${args.customerName || ''},
    </p>

    <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">${introLine}</p>

    ${validityLine}

    <div style="text-align: center; margin: 32px 0;">
      <a href="${args.viewUrl}"
         style="background: #c8a25b; color: white; padding: 14px 32px;
                text-decoration: none; font-weight: 600; font-family: sans-serif;
                letter-spacing: 0.5px; display: inline-block; border-radius: 2px;">
        ${ctaLabel}
      </a>
    </div>

    <p style="color: #6a6a6a; font-size: 14px; line-height: 1.6;">
      Une question ? Répondez simplement à cet email, ou contactez-nous au ${LEGAL.telephone}.
    </p>

    <hr style="border: none; border-top: 1px solid #e6e2d8; margin: 32px 0;" />

    <p style="color: #9a9a9a; font-size: 12px; line-height: 1.5; font-family: sans-serif;">
      Mobilier Malin — ${LEGAL.raisonSociale} ${LEGAL.formeJuridique}<br>
      ${LEGAL.showroom.ligne1}, ${LEGAL.showroom.codePostal} ${LEGAL.showroom.ville}<br>
      SIREN ${LEGAL.siren} · TVA ${LEGAL.tvaIntracom}
    </p>
  </div>
</body>
</html>`
}

export async function POST(req: Request) {
  // Auth
  const providedSecret = req.headers.get('x-admin-secret')
  if (providedSecret !== process.env.ADMIN_IMPORT_SECRET) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!isSanityWriteConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'SANITY_WRITE_TOKEN absent dans Vercel Env Vars.' },
      { status: 500 },
    )
  }

  let body: Payload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide' }, { status: 400 })
  }

  // Validation
  const errors: string[] = []
  if (!body.customer?.name?.trim()) errors.push('customer.name manquant')
  if (!body.customer?.email?.trim()) errors.push('customer.email manquant')
  if (!body.shippingAddress?.street?.trim()) errors.push('shippingAddress.street manquant')
  if (!body.shippingAddress?.postalCode?.trim()) errors.push('shippingAddress.postalCode manquant')
  if (!body.shippingAddress?.city?.trim()) errors.push('shippingAddress.city manquant')
  if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
    errors.push('Au moins une ligne de devis est requise')
  } else {
    body.lineItems.forEach((li, i) => {
      if (!li.name?.trim()) errors.push(`Ligne ${i + 1} : nom manquant`)
      if (typeof li.unitPrice !== 'number' || li.unitPrice < 0) {
        errors.push(`Ligne ${i + 1} : prix unitaire invalide`)
      }
      if (typeof li.quantity !== 'number' || li.quantity < 1) {
        errors.push(`Ligne ${i + 1} : quantité invalide`)
      }
    })
  }
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, error: errors.join(' / ') }, { status: 400 })
  }

  const client = getWriteClient()
  if (!client) {
    return NextResponse.json({ ok: false, error: 'Client Sanity indisponible' }, { status: 500 })
  }

  // Calculs
  const lineItemsClean = (body.lineItems || []).map((li) => ({
    _type: 'lineItem',
    _key: `li-${Math.random().toString(36).slice(2, 10)}`,
    name: li.name!.trim(),
    unitPrice: li.unitPrice!,
    quantity: li.quantity!,
    ...(li.slug && { slug: li.slug }),
    ...(li.refId && { ref: { _type: 'reference' as const, _ref: li.refId, _weak: true } }),
  }))

  const optionsClean = (body.options || [])
    .filter((o) => o.label?.trim() && typeof o.price === 'number' && o.price >= 0)
    .map((o) => ({
      _type: 'option',
      _key: `opt-${Math.random().toString(36).slice(2, 10)}`,
      label: o.label!.trim(),
      price: o.price!,
    }))

  const shippingFee = typeof body.shippingFee === 'number' ? body.shippingFee : 0
  const depositPercent =
    typeof body.depositPercent === 'number' &&
    body.depositPercent >= 1 &&
    body.depositPercent <= 99
      ? body.depositPercent
      : null
  const tvaRate = typeof body.tvaRate === 'number' ? body.tvaRate : 20

  const subtotalHt =
    lineItemsClean.reduce((s, li) => s + li.unitPrice * li.quantity, 0) +
    optionsClean.reduce((s, o) => s + o.price, 0) +
    shippingFee
  const totalTtc = subtotalHt * (1 + tvaRate / 100)

  // Détermine le type de doc (devis vs facture)
  const documentType: 'quote' | 'invoice' =
    body.documentType === 'invoice' ? 'invoice' : 'quote'

  // Génère le numéro et la date de validité
  const numero = await generateNumero(documentType)
  const validUntilDays = body.validUntilDays || 30
  const validUntilDate = new Date(Date.now() + validUntilDays * 86400_000)
  const validUntilISO = validUntilDate.toISOString().split('T')[0]

  // Crée le doc Sanity
  const now = new Date().toISOString()
  const doc: Record<string, unknown> = {
    _type: 'quote',
    documentType,
    numero,
    status: 'sent',
    validUntil: validUntilISO,
    customer: {
      name: body.customer!.name!.trim(),
      email: body.customer!.email!.trim(),
      ...(body.customer!.phone && { phone: body.customer!.phone.trim() }),
      ...(body.customer!.company && { company: body.customer!.company.trim() }),
    },
    shippingAddress: {
      street: body.shippingAddress!.street!.trim(),
      postalCode: body.shippingAddress!.postalCode!.trim(),
      city: body.shippingAddress!.city!.trim(),
      ...(body.shippingAddress!.floor && { floor: body.shippingAddress!.floor.trim() }),
      elevator: body.shippingAddress!.elevator || 'unknown',
      ...(body.shippingAddress!.instructions && {
        instructions: body.shippingAddress!.instructions.trim(),
      }),
    },
    lineItems: lineItemsClean,
    shippingFee,
    ...(depositPercent && { depositPercent }),
    options: optionsClean,
    tvaRate,
    sentAt: now,
    ...(body.internalNotes && { internalNotes: body.internalNotes.trim() }),
    ...(body.pdfNotes && { pdfNotes: body.pdfNotes.trim() }),
  }

  let created: { _id: string }
  try {
    created = await client.create(doc as never)
  } catch (err) {
    console.error('[quotes/create] Sanity error:', err)
    return NextResponse.json(
      { ok: false, error: 'Erreur Sanity : ' + (err instanceof Error ? err.message : 'inconnue') },
      { status: 500 },
    )
  }

  // Envoie l'email au client (adapté selon le type de doc)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'
  const viewUrl = `${siteUrl}/devis/${created._id}`
  const html = buildClientEmailHtml({
    documentType,
    customerName: body.customer!.name!.trim(),
    numero,
    total: totalTtc,
    validUntil: validUntilDate.toLocaleDateString('fr-FR'),
    viewUrl,
  })

  const emailSubject =
    documentType === 'invoice'
      ? `Votre facture Mobilier Malin ${numero}`
      : `Votre devis Mobilier Malin ${numero}`

  const emailResult = await sendEmail({
    to: { email: body.customer!.email!.trim(), name: body.customer!.name!.trim() },
    subject: emailSubject,
    htmlContent: html,
    tags: [documentType === 'invoice' ? 'invoice' : 'quote', 'manual'],
  })

  return NextResponse.json({
    ok: true,
    uid: created._id,
    numero,
    url: viewUrl,
    emailSent: emailResult.ok,
    emailError: emailResult.error,
    totalTtc,
  })
}
