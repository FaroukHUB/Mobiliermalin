import { NextResponse, type NextRequest } from 'next/server'
import { getWriteClient, isSanityWriteConfigured } from '@/lib/sanity-write'
import { sendEmail, isBrevoConfigured } from '@/lib/brevo'
import { LEGAL } from '@/lib/legal'

export const dynamic = 'force-dynamic'

type Payload = {
  name?: string
  email?: string
  phone?: string
  company?: string
  street?: string
  postalCode?: string
  city?: string
  floor?: string
  elevator?: 'yes' | 'no' | 'unknown'
  instructions?: string
  productId?: string
  productName?: string
  productSlug?: string
  productPrice?: number
  customerNotes?: string
}

/**
 * Génère un numéro de devis au format DEV-YYYY-XXXX en se basant sur le
 * nombre de devis existants pour l'année en cours.
 */
async function generateQuoteNumber(): Promise<string> {
  const client = getWriteClient()
  if (!client) return `DEV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
  const year = new Date().getFullYear()
  const count = await client.fetch<number>(
    `count(*[_type == "quote" && numero match $prefix])`,
    { prefix: `DEV-${year}-*` },
  )
  const next = (count || 0) + 1
  return `DEV-${year}-${next.toString().padStart(4, '0')}`
}

export async function POST(req: NextRequest) {
  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide' }, { status: 400 })
  }

  // Validation minimale
  const required = ['name', 'email', 'phone', 'street', 'postalCode', 'city', 'productName', 'productPrice']
  for (const f of required) {
    if (!body[f as keyof Payload]) {
      return NextResponse.json({ ok: false, error: `Champ requis : ${f}` }, { status: 400 })
    }
  }
  if (!body.email!.includes('@')) {
    return NextResponse.json({ ok: false, error: 'Email invalide' }, { status: 400 })
  }

  const numero = await generateQuoteNumber()

  // Validité par défaut : J+30
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 30)
  const validUntilIso = validUntil.toISOString().slice(0, 10)

  const docPayload = {
    _type: 'quote',
    numero,
    status: 'pending',
    validUntil: validUntilIso,
    customer: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company || undefined,
    },
    shippingAddress: {
      street: body.street,
      postalCode: body.postalCode,
      city: body.city,
      floor: body.floor || undefined,
      elevator: body.elevator || 'unknown',
      instructions: body.instructions || undefined,
    },
    product: {
      ref: body.productId ? { _type: 'reference', _ref: body.productId } : undefined,
      name: body.productName,
      slug: body.productSlug,
      unitPrice: body.productPrice,
      quantity: 1,
    },
    shippingFee: 0,
    tvaRate: LEGAL.tauxTvaDefaut,
    customerNotes: body.customerNotes || undefined,
  }

  // 1) Création du document dans Sanity (si write client configuré)
  let createdId: string | null = null
  if (isSanityWriteConfigured()) {
    const client = getWriteClient()!
    try {
      const created = await client.create(docPayload)
      createdId = created._id
    } catch (err) {
      console.error('[devis/demande] sanity create error', err)
      return NextResponse.json(
        { ok: false, error: 'Erreur lors de l\'enregistrement de la demande' },
        { status: 500 },
      )
    }
  } else {
    console.warn('[devis/demande] SANITY_WRITE_TOKEN absent — demande non enregistrée dans Sanity')
  }

  // 2) Email à Djamel (best-effort)
  if (isBrevoConfigured()) {
    const elevatorLabel = body.elevator === 'yes' ? 'Oui' : body.elevator === 'no' ? 'Non' : 'Inconnu'
    const sanityLink = createdId
      ? `https://mobiliermalin.vercel.app/studio/desk/quote;${createdId}`
      : ''
    const adminHtml = `<!DOCTYPE html>
<html lang="fr"><body style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f5;padding:24px;color:#1a1a1a;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e1d9;">
    <tr><td style="background:#1a1a1a;color:#fff;padding:24px;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B89A5B;">Mobilier Malin — Admin</div>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:normal;">📋 Nouvelle demande de devis</h1>
      <div style="margin-top:8px;font-size:14px;opacity:0.8;">${numero}</div>
    </td></tr>
    <tr><td style="padding:24px;font-size:14px;line-height:1.6;">
      <h3 style="margin:0 0 8px;font-size:13px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1.5px;">Client</h3>
      <p style="margin:0 0 16px;">
        <strong>${escapeHtml(body.name!)}</strong>${body.company ? ` (${escapeHtml(body.company)})` : ''}<br>
        ${escapeHtml(body.email!)}<br>
        ${escapeHtml(body.phone!)}
      </p>

      <h3 style="margin:0 0 8px;font-size:13px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1.5px;">Adresse de livraison</h3>
      <p style="margin:0 0 16px;">
        ${escapeHtml(body.street!)}<br>
        ${escapeHtml(body.postalCode!)} ${escapeHtml(body.city!)}<br>
        ${body.floor ? `Étage : ${escapeHtml(body.floor)} — ` : ''}Ascenseur : ${elevatorLabel}
        ${body.instructions ? `<br><em>${escapeHtml(body.instructions)}</em>` : ''}
      </p>

      <h3 style="margin:0 0 8px;font-size:13px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1.5px;">Produit</h3>
      <p style="margin:0 0 16px;">
        ${escapeHtml(body.productName!)}<br>
        Prix : <strong>${(body.productPrice || 0).toLocaleString('fr-FR')} €</strong>
      </p>

      ${body.customerNotes ? `<h3 style="margin:0 0 8px;font-size:13px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1.5px;">Note du client</h3><p style="margin:0 0 16px;font-style:italic;">${escapeHtml(body.customerNotes)}</p>` : ''}

      ${sanityLink ? `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e1d9;">
        <a href="${sanityLink}" style="display:inline-block;background:#B89A5B;color:#fff;padding:10px 20px;text-decoration:none;font-weight:500;">Ouvrir dans Sanity Studio →</a>
      </div>` : ''}
    </td></tr>
  </table>
</body></html>`

    await sendEmail({
      to: { email: LEGAL.email, name: 'Mobilier Malin' },
      subject: `[Devis ${numero}] Nouvelle demande — ${body.productName} pour ${body.name}`,
      htmlContent: adminHtml,
      replyTo: { email: body.email!, name: body.name },
      tags: ['quote-request-admin'],
    })
  }

  // 3) Email d'accusé de réception au client
  if (isBrevoConfigured()) {
    const customerHtml = `<!DOCTYPE html>
<html lang="fr"><body style="font-family:Georgia,serif;background:#F0EBE3;padding:32px 16px;color:#1a1a1a;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#FAF7F2;border:1px solid #e5e1d9;">
    <tr><td style="background:#1a1a1a;color:#FAF7F2;padding:32px;text-align:center;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B89A5B;font-family:'Helvetica Neue',Arial,sans-serif;">Mobilier Malin</div>
      <h1 style="margin:8px 0 0;font-size:24px;font-weight:normal;">Demande de devis bien reçue</h1>
    </td></tr>
    <tr><td style="padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#3D3D3D;">
      <p style="margin:0 0 16px;">Bonjour ${escapeHtml(body.name!.split(' ')[0] || body.name!)},</p>
      <p style="margin:0 0 16px;">Nous avons bien reçu votre demande de devis pour <strong style="color:#1a1a1a;">${escapeHtml(body.productName!)}</strong>.</p>
      <p style="margin:0 0 16px;">Notre équipe revient vers vous sous <strong>24 h ouvrées</strong> avec un devis personnalisé incluant les frais de livraison adaptés à votre adresse.</p>

      <div style="background:#F0EBE3;border-left:3px solid #B89A5B;padding:16px 20px;margin:24px 0;">
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6B6B6B;margin-bottom:6px;">Référence demande</div>
        <div style="font-size:18px;color:#1a1a1a;">${numero}</div>
      </div>

      <p style="margin:0 0 16px;">En attendant, n'hésitez pas à nous joindre pour toute question :</p>
      <p style="margin:0;">📞 <a href="tel:${LEGAL.telephoneTel}" style="color:#1a1a1a;">${LEGAL.telephone}</a><br>✉️ <a href="mailto:${LEGAL.email}" style="color:#1a1a1a;">${LEGAL.email}</a></p>
    </td></tr>
  </table>
</body></html>`

    await sendEmail({
      to: { email: body.email!, name: body.name },
      subject: `Demande de devis ${numero} — Mobilier Malin`,
      htmlContent: customerHtml,
      tags: ['quote-request-customer'],
    })
  }

  return NextResponse.json({
    ok: true,
    numero,
    quoteId: createdId,
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
