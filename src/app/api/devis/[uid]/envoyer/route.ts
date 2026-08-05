import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuotePdf, type QuotePdfInput } from '@/components/pdf/QuotePdf'
import { getWriteClient, isSanityWriteConfigured } from '@/lib/sanity-write'
import { sanityClient } from '@/lib/sanity'
import { LEGAL } from '@/lib/legal'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type QuoteDoc = {
  _id: string
  numero: string
  status: string
  validUntil?: string
  _createdAt: string
  customer: {
    name: string
    email: string
    phone?: string
    company?: string
  }
  shippingAddress: {
    street: string
    postalCode: string
    city: string
    floor?: string
    elevator?: 'yes' | 'no' | 'unknown'
  }
  product: {
    name: string
    unitPrice: number
    quantity: number
  }
  shippingFee?: number
  options?: { label: string; price: number }[]
  tvaRate?: number
  pdfNotes?: string
}

/**
 * POST /api/devis/[uid]/envoyer
 *
 * Génère le PDF du devis et l'envoie au client par email (avec lien
 * d'acceptation menant à la page /devis/[uid]). Met à jour le statut
 * Sanity à "sent" + sentAt.
 *
 * Sécurité : protégé par une clé partagée DEVIS_ACTION_SECRET (env var)
 * pour empêcher n'importe qui sur internet de spammer.
 *
 * Body optionnel :
 *   { force?: boolean }        renvoi autorisé même si déjà envoyé
 *   { mode?: 'facture' }       envoie une FACTURE (PDF intitulé FACTURE,
 *                              email SANS lien de paiement). Le numéro
 *                              affiché devient FAC-... (dérivé du numéro
 *                              devis si le doc n'est pas déjà une facture).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  // Auth simple par clé partagée (header X-Devis-Secret)
  const secret = process.env.DEVIS_ACTION_SECRET
  if (secret) {
    const provided = req.headers.get('x-devis-secret')
    if (provided !== secret) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
  }

  const { uid } = await params
  const body = (await req.json().catch(() => ({}))) as { mode?: string }
  const isInvoice = body.mode === 'facture'

  // 1) Lecture du devis depuis Sanity
  const quote = await sanityClient.fetch<QuoteDoc | null>(
    `*[_type == "quote" && _id == $id][0] {
      _id, numero, status, validUntil, _createdAt,
      customer, shippingAddress, product,
      shippingFee, options, tvaRate, pdfNotes
    }`,
    { id: uid },
  )
  if (!quote) {
    return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
  }

  // 2) Génération du PDF
  const emittedAt = new Date()
  const validUntil = quote.validUntil
    ? new Date(quote.validUntil)
    : new Date(emittedAt.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Numéro affiché : en mode facture, si le doc porte encore un numéro
  // de devis (DEV-...), on le dérive en FAC-... pour rester cohérent
  // avec la numérotation FAC-YYYY-XXXX du schéma.
  const displayNumero = isInvoice
    ? quote.numero.startsWith('FAC')
      ? quote.numero
      : quote.numero.replace(/^DEV/, 'FAC')
    : quote.numero

  const pdfInput: QuotePdfInput = {
    numero: displayNumero,
    docKind: isInvoice ? 'facture' : 'devis',
    emittedAt,
    validUntil,
    customer: quote.customer,
    shippingAddress: quote.shippingAddress,
    product: quote.product,
    shippingFee: quote.shippingFee || 0,
    options: quote.options || [],
    tvaRate: quote.tvaRate ?? 20,
    pdfNotes: quote.pdfNotes,
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(QuotePdf(pdfInput))
  } catch (err) {
    console.error('[devis/envoyer] PDF render error', err)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 },
    )
  }

  // 3) Email au client avec PDF en pièce jointe — un seul appel Brevo
  const brevoKey = process.env.BREVO_API_KEY
  const brevoSender = process.env.BREVO_SENDER_EMAIL
  const brevoName = process.env.BREVO_SENDER_NAME || 'Mobilier Malin'
  if (!brevoKey || !brevoSender) {
    return NextResponse.json(
      { error: 'Brevo non configuré : impossible d\'envoyer l\'email' },
      { status: 503 },
    )
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host')}`
  const acceptUrl = `${siteUrl}/devis/${uid}`

  const totalTtc = computeTotalTtc(pdfInput)
  const customerHtml = isInvoice
    ? renderInvoiceEmailHtml({
        numero: displayNumero,
        customerName: quote.customer.name,
        productName: quote.product.name,
        totalTtc,
      })
    : renderClientEmailHtml({
        numero: quote.numero,
        customerName: quote.customer.name,
        productName: quote.product.name,
        totalTtc,
        validUntil,
        acceptUrl,
      })

  const pdfBase64 = pdfBuffer.toString('base64')

  // BCC admin : copie du devis client (même PDF, même contenu) vers la
  // boîte admin pour traçabilité. Configurable via DEVIS_ADMIN_BCC_EMAIL,
  // fallback sur LEGAL.email (mobiliermalin@gmail.com).
  const adminBccEmail = process.env.DEVIS_ADMIN_BCC_EMAIL || LEGAL.email
  const bcc = adminBccEmail
    ? [{ email: adminBccEmail, name: 'Mobilier Malin (copie admin)' }]
    : undefined

  let brevoStatus = 0
  let brevoBody = ''
  try {
    const fullRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: brevoName, email: brevoSender },
        to: [{ email: quote.customer.email, name: quote.customer.name }],
        bcc,
        replyTo: process.env.BREVO_REPLY_TO_EMAIL
          ? {
              email: process.env.BREVO_REPLY_TO_EMAIL,
              name: process.env.BREVO_REPLY_TO_NAME || 'Mobilier Malin',
            }
          : undefined,
        subject: isInvoice
          ? `Votre facture Mobilier Malin — ${displayNumero}`
          : `Votre devis Mobilier Malin — ${quote.numero}`,
        htmlContent: customerHtml,
        tags: [isInvoice ? 'invoice-sent' : 'quote-sent'],
        attachment: [
          {
            name: `${displayNumero}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    })
    brevoStatus = fullRes.status
    brevoBody = await fullRes.text().catch(() => '')
    if (!fullRes.ok) {
      console.error('[devis/envoyer] brevo failed', brevoStatus, brevoBody.slice(0, 500))
      return NextResponse.json(
        {
          error: `Brevo a refusé l'envoi (status ${brevoStatus}).`,
          debug: { brevoStatus, brevoBody: brevoBody.slice(0, 500) },
        },
        { status: 502 },
      )
    }
  } catch (err) {
    console.error('[devis/envoyer] brevo network error', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur réseau Brevo' },
      { status: 502 },
    )
  }

  // 4) Mise à jour Sanity.
  //    Devis  : status="sent" + sentAt.
  //    Facture : invoiceSentAt uniquement — on ne touche pas au statut
  //    (un devis "accepted" doit le rester).
  if (isSanityWriteConfigured()) {
    const client = getWriteClient()!
    try {
      if (isInvoice) {
        await client
          .patch(uid)
          .set({ invoiceSentAt: emittedAt.toISOString() })
          .commit()
      } else {
        await client
          .patch(uid)
          .set({ status: 'sent', sentAt: emittedAt.toISOString() })
          .commit()
      }
    } catch (err) {
      console.error('[devis/envoyer] sanity patch error', err)
    }
  }

  return NextResponse.json({
    ok: true,
    mode: isInvoice ? 'facture' : 'devis',
    numero: displayNumero,
    acceptUrl: isInvoice ? null : acceptUrl,
    totalTtc,
    sentTo: quote.customer.email,
    adminBcc: adminBccEmail || null,
    brevoStatus,
  })
}

function computeTotalTtc(input: QuotePdfInput): number {
  const productTotal = input.product.unitPrice * input.product.quantity
  const optionsTotal = input.options.reduce((sum, o) => sum + o.price, 0)
  const subtotalHt = productTotal + input.shippingFee + optionsTotal
  const tvaAmount = subtotalHt * (input.tvaRate / 100)
  return subtotalHt + tvaAmount
}

function renderClientEmailHtml(input: {
  numero: string
  customerName: string
  productName: string
  totalTtc: number
  validUntil: Date
  acceptUrl: string
}): string {
  const { numero, customerName, productName, totalTtc, validUntil, acceptUrl } = input
  const firstName = customerName.split(' ')[0] || customerName
  const totalStr = totalTtc.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const validStr = validUntil.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return `<!DOCTYPE html>
<html lang="fr"><body style="margin:0;padding:0;background:#F0EBE3;font-family:Georgia,serif;color:#1a1a1a;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:32px 16px;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:#FAF7F2;border:1px solid #e5e1d9;">

<tr><td style="background:#1a1a1a;color:#FAF7F2;padding:32px;text-align:center;">
<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B89A5B;font-family:'Helvetica Neue',Arial,sans-serif;">Mobilier Malin</div>
<h1 style="margin:8px 0 0;font-size:26px;font-weight:normal;">Votre devis personnalisé</h1>
<div style="margin-top:8px;font-size:14px;opacity:0.8;">${escapeHtml(numero)}</div>
</td></tr>

<tr><td style="padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#3D3D3D;">

<p style="margin:0 0 16px;">Bonjour ${escapeHtml(firstName)},</p>
<p style="margin:0 0 16px;">Comme convenu, voici votre devis pour <strong style="color:#1a1a1a;">${escapeHtml(productName)}</strong>, incluant les frais de livraison adaptés à votre adresse.</p>
<p style="margin:0 0 16px;">Le détail complet se trouve dans le PDF joint à cet email.</p>

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F0EBE3;border-left:3px solid #B89A5B;margin:24px 0;">
<tr><td style="padding:20px 24px;">
<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6B6B6B;margin-bottom:4px;">Montant total TTC</div>
<div style="font-size:28px;color:#1a1a1a;font-family:Georgia,serif;">${totalStr} €</div>
<div style="font-size:12px;color:#6B6B6B;margin-top:8px;">Valable jusqu'au ${escapeHtml(validStr)}</div>
</td></tr>
</table>

<div style="text-align:center;margin:32px 0;">
<a href="${acceptUrl}" style="display:inline-block;background:#B89A5B;color:#FAF7F2;padding:14px 32px;text-decoration:none;font-weight:500;font-size:15px;letter-spacing:0.5px;">Accepter ce devis et régler →</a>
</div>

<p style="margin:0 0 16px;font-size:13px;color:#6B6B6B;">L'acceptation se fait en un clic, suivie d'un paiement sécurisé par carte bancaire. Aucun engagement avant ce clic.</p>

<hr style="border:none;border-top:1px solid #e5e1d9;margin:24px 0;">

<p style="margin:0 0 8px;font-size:13px;color:#6B6B6B;">Une question, un ajustement à apporter ?</p>
<p style="margin:0;font-size:14px;">📞 <a href="tel:${LEGAL.telephoneTel}" style="color:#1a1a1a;">${LEGAL.telephone}</a> · ✉️ <a href="mailto:${LEGAL.email}" style="color:#1a1a1a;">${LEGAL.email}</a></p>

</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

/**
 * Email facture : même charte que l'email devis mais SANS aucun lien
 * ni bouton de paiement. La facture est en pièce jointe, point.
 */
function renderInvoiceEmailHtml(input: {
  numero: string
  customerName: string
  productName: string
  totalTtc: number
}): string {
  const { numero, customerName, productName, totalTtc } = input
  const firstName = customerName.split(' ')[0] || customerName
  const totalStr = totalTtc.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return `<!DOCTYPE html>
<html lang="fr"><body style="margin:0;padding:0;background:#F0EBE3;font-family:Georgia,serif;color:#1a1a1a;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:32px 16px;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:#FAF7F2;border:1px solid #e5e1d9;">

<tr><td style="background:#1a1a1a;color:#FAF7F2;padding:32px;text-align:center;">
<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B89A5B;font-family:'Helvetica Neue',Arial,sans-serif;">Mobilier Malin</div>
<h1 style="margin:8px 0 0;font-size:26px;font-weight:normal;">Votre facture</h1>
<div style="margin-top:8px;font-size:14px;opacity:0.8;">${escapeHtml(numero)}</div>
</td></tr>

<tr><td style="padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#3D3D3D;">

<p style="margin:0 0 16px;">Bonjour ${escapeHtml(firstName)},</p>
<p style="margin:0 0 16px;">Veuillez trouver en pièce jointe votre facture pour <strong style="color:#1a1a1a;">${escapeHtml(productName)}</strong>.</p>

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F0EBE3;border-left:3px solid #B89A5B;margin:24px 0;">
<tr><td style="padding:20px 24px;">
<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#6B6B6B;margin-bottom:4px;">Montant total TTC</div>
<div style="font-size:28px;color:#1a1a1a;font-family:Georgia,serif;">${totalStr} €</div>
</td></tr>
</table>

<p style="margin:0 0 16px;font-size:13px;color:#6B6B6B;">Le règlement s'effectue selon les modalités convenues avec notre équipe. Conservez cette facture pour votre comptabilité.</p>

<hr style="border:none;border-top:1px solid #e5e1d9;margin:24px 0;">

<p style="margin:0 0 8px;font-size:13px;color:#6B6B6B;">Une question sur cette facture ?</p>
<p style="margin:0;font-size:14px;">📞 <a href="tel:${LEGAL.telephoneTel}" style="color:#1a1a1a;">${LEGAL.telephone}</a> · ✉️ <a href="mailto:${LEGAL.email}" style="color:#1a1a1a;">${LEGAL.email}</a></p>

</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
