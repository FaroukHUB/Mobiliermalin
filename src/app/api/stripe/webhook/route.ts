import { NextResponse, type NextRequest } from 'next/server'
import { cancelBooking, createBooking } from '@/lib/cal'
import {
  renderPickupAdminNotificationHtml,
  renderPickupCancellationHtml,
  renderPickupConfirmationHtml,
  sendEmail,
} from '@/lib/brevo'
import { getWriteClient, isSanityWriteConfigured } from '@/lib/sanity-write'
import { LEGAL } from '@/lib/legal'
import { upsertOrderFromStripeSession } from '@/lib/order'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // crypto-subtle nécessite Node, pas Edge

/**
 * Webhook Stripe pour gérer le cycle de vie d'une commande.
 *
 * Events écoutés :
 * - checkout.session.completed : paiement réussi → envoi email branded
 * - checkout.session.expired   : session abandonnée → annule le booking
 *   Cal + envoie email d'annulation
 * - checkout.session.async_payment_failed : paiement raté → idem
 *
 * Configuration requise sur Stripe Dashboard :
 *   1. Developers → Webhooks → Add endpoint
 *   2. URL : https://mobiliermalin.com/api/stripe/webhook
 *   3. Events : checkout.session.completed, checkout.session.expired,
 *              checkout.session.async_payment_failed
 *   4. Récupérer le "Signing secret" (whsec_...) et le coller dans Vercel
 *      en tant que STRIPE_WEBHOOK_SECRET
 */

type StripeSessionObject = {
  id?: string
  amount_total?: number
  customer_email?: string
  customer_details?: { email?: string; name?: string }
  metadata?: Record<string, string>
}

type StripeEvent = {
  id?: string
  type?: string
  data?: {
    object?: StripeSessionObject
  }
}

/**
 * Convertit "YYYY-MM-DD" + "HH:MM" (heure Paris) en ISO 8601 avec offset
 * dynamique (CEST +02:00 ou CET +01:00). Géré pour Cal.eu booking.
 */
function parisLocalToIso(date: string, time: string): string {
  const local = new Date(`${date}T${time}:00`)
  const parisTimeStr = local.toLocaleString('en-US', {
    timeZone: 'Europe/Paris',
    hour12: false,
  })
  const utcTimeStr = local.toLocaleString('en-US', { timeZone: 'UTC', hour12: false })
  const parisMs = new Date(parisTimeStr).getTime()
  const utcMs = new Date(utcTimeStr).getTime()
  const offsetMinutes = Math.round((parisMs - utcMs) / 60000)
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const oh = Math.floor(abs / 60).toString().padStart(2, '0')
  const om = (abs % 60).toString().padStart(2, '0')
  return `${date}T${time}:00.000${sign}${oh}:${om}`
}

/**
 * Vérifie la signature du webhook Stripe (HMAC-SHA256).
 * Format du header Stripe-Signature : "t=<timestamp>,v1=<signature>"
 */
async function verifySignature(
  payload: string,
  header: string | null,
  secret: string,
): Promise<boolean> {
  if (!header) return false
  const parts = header.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=')
    if (k && v) acc[k] = v
    return acc
  }, {})
  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false

  // Tolérance de 5 min entre l'envoi et la réception
  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (age > 300) return false

  const signedPayload = `${timestamp}.${payload}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload))
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return expected === signature
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret non configuré' }, { status: 503 })
  }

  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  const valid = await verifySignature(rawBody, sig, secret)
  if (!valid) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
  }

  let event: StripeEvent
  try {
    event = JSON.parse(rawBody) as StripeEvent
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const session = event.data?.object
  const meta = session?.metadata || {}
  const fulfillmentMode = meta.fulfillment_mode
  const isPickup = fulfillmentMode === 'pickup'
  const isQuote = fulfillmentMode === 'quote'
  const pickupLabel = meta.pickup_label
  const customerEmail = session?.customer_details?.email || session?.customer_email
  const customerName = session?.customer_details?.name || meta.customer_name || ''
  const productName = meta.product_name || meta.product_slug || 'Votre commande'

  // ───── checkout.session.completed (devis) → mise à jour Sanity + emails ─────
  if (event.type === 'checkout.session.completed' && isQuote) {
    const quoteId = meta.quote_id
    const quoteNumero = meta.quote_numero
    if (quoteId && isSanityWriteConfigured()) {
      const writeClient = getWriteClient()!
      try {
        await writeClient
          .patch(quoteId)
          .set({
            status: 'accepted',
            acceptedAt: new Date().toISOString(),
            stripeSessionId: session?.id,
          })
          .commit()
      } catch (err) {
        console.error('[stripe-webhook] failed to update quote status', err)
      }
    }
    // Email confirmation client
    if (customerEmail && quoteNumero) {
      await sendEmail({
        to: { email: customerEmail, name: customerName || undefined },
        subject: `Devis ${quoteNumero} accepté — Mobilier Malin`,
        htmlContent: renderQuoteAcceptedHtml({
          customerName: customerName || 'Cher client',
          numero: quoteNumero,
          amountCents: session?.amount_total,
        }),
        tags: ['quote-accepted-customer'],
      })
    }
    // Email notification admin
    if (quoteNumero) {
      await sendEmail({
        to: { email: LEGAL.email, name: 'Mobilier Malin' },
        subject: `[Devis ${quoteNumero}] ✅ Accepté + payé`,
        htmlContent: renderQuoteAcceptedAdminHtml({
          customerName: customerName || '?',
          customerEmail: customerEmail || '?',
          numero: quoteNumero,
          quoteId: quoteId || '',
          amountCents: session?.amount_total,
        }),
        tags: ['quote-accepted-admin'],
      })
    }
  }

  // ───── checkout.session.completed (pickup) →
  //        0. Crée le doc Sanity `order` (idempotent, ne dupliquera pas)
  //        1. Crée le booking Cal.eu SI un créneau a été fourni
  //        2. Email confirmation client — TOUJOURS
  //        3. Email notification admin — TOUJOURS
  if (event.type === 'checkout.session.completed' && isPickup && customerEmail) {
    // 0) Création du document Sanity order avec facture URL + articles
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    if (stripeSecret && session) {
      const orderResult = await upsertOrderFromStripeSession(
        session as Parameters<typeof upsertOrderFromStripeSession>[0],
        stripeSecret,
      )
      if (orderResult.ok) {
        console.log(
          `[stripe-webhook] order ${orderResult.created ? 'created' : 'already existed'}: ${orderResult.id}`,
        )
      } else {
        console.warn('[stripe-webhook] order upsert failed', orderResult.error)
      }
    }

    const pickupDate = meta.pickup_date
    const pickupTime = meta.pickup_time
    const customerPhone = meta.customer_phone
    const cartSummary = meta.cart_summary || ''
    const totalItems = meta.total_items
    const distinctProducts = meta.distinct_products
    // Label affiché — soit le créneau réel, soit un fallback explicite
    const effectivePickupLabel =
      pickupLabel || 'Créneau à convenir — vous serez recontacté par téléphone'
    // Titre commande : nom produit unique, ou résumé panier multi-articles
    const orderTitle = distinctProducts && Number(distinctProducts) > 1
      ? `Panier ${totalItems || '?'} article${Number(totalItems) > 1 ? 's' : ''} · ${distinctProducts} référence${Number(distinctProducts) > 1 ? 's' : ''}`
      : productName

    // 1) Cal.com booking — uniquement si un créneau réel a été choisi
    let calBookingRef: string | number | undefined
    if (pickupDate && pickupTime && pickupLabel) {
      const startIso = parisLocalToIso(pickupDate, pickupTime)
      const calResult = await createBooking({
        start: startIso,
        attendee: {
          name: customerName || 'Client',
          email: customerEmail,
          phoneNumber: customerPhone,
          timeZone: 'Europe/Paris',
        },
        notes: `Retrait pour : ${orderTitle}${cartSummary ? `\nDétail : ${cartSummary}` : ''}`,
      })
      if (calResult.ok) {
        calBookingRef = calResult.bookingUid || calResult.bookingId
        console.log('[stripe-webhook] cal booking created', calBookingRef)
      } else {
        console.error('[stripe-webhook] cal booking creation failed', calResult.error)
      }
    } else {
      console.warn('[stripe-webhook] pickup order without slot — no Cal booking, admin will call customer', {
        sessionId: session?.id,
        hasCart: !!cartSummary,
      })
    }

    // 2) Email confirmation client — TOUJOURS
    const result = await sendEmail({
      to: { email: customerEmail, name: customerName || undefined },
      subject: pickupLabel
        ? `Confirmation de votre retrait — ${pickupLabel}`
        : `Confirmation de votre commande — Mobilier Malin`,
      htmlContent: renderPickupConfirmationHtml({
        customerName: customerName || 'Cher client',
        customerEmail,
        productName: orderTitle,
        amountCents: session?.amount_total,
        pickupLabel: effectivePickupLabel,
      }),
      tags: ['pickup-confirmation'],
    })
    if (!result.ok) {
      console.warn('[stripe-webhook] confirmation email failed', result.error)
    } else {
      console.log('[stripe-webhook] confirmation email sent to', customerEmail)
    }

    // 3) Email notification admin  — TOUJOURS
    // Ajoute le récap panier si présent, pour que l'admin sache ce qui a été commandé.
    const adminProductLine = cartSummary
      ? `${orderTitle}\n\nDétail du panier :\n${cartSummary.split(' | ').map((l) => `  · ${l}`).join('\n')}`
      : orderTitle
    const adminResult = await sendEmail({
      to: { email: LEGAL.email, name: 'Mobilier Malin' },
      subject: `🛒 Nouvelle commande RETRAIT — ${orderTitle}`,
      htmlContent: renderPickupAdminNotificationHtml({
        customerName: customerName || '(non renseigné)',
        customerEmail,
        customerPhone: customerPhone || '(non renseigné)',
        productName: adminProductLine,
        pickupLabel: effectivePickupLabel,
        amountCents: session?.amount_total,
        stripeSessionId: session?.id,
        calBookingRef: calBookingRef ? String(calBookingRef) : undefined,
      }),
      tags: ['pickup-admin-notification'],
    })
    if (!adminResult.ok) {
      console.warn('[stripe-webhook] admin email failed', adminResult.error)
    } else {
      console.log('[stripe-webhook] admin notification sent')
    }
  }

  // ───── checkout.session.expired / async_payment_failed → libère créneau ─────
  const cancelEvents = new Set([
    'checkout.session.expired',
    'checkout.session.async_payment_failed',
  ])
  if (event.type && cancelEvents.has(event.type)) {
    const bookingUid = meta.cal_booking_uid
    const bookingId = meta.cal_booking_id
    const ref = bookingUid || bookingId
    if (ref) {
      const cancelReason =
        event.type === 'checkout.session.expired'
          ? 'Session Stripe expirée — créneau libéré'
          : 'Paiement Stripe échoué — créneau libéré'
      const result = await cancelBooking(ref, cancelReason)
      if (!result.ok) {
        console.warn('[stripe-webhook] cancel booking failed', ref, result.error)
      } else {
        console.log('[stripe-webhook] booking cancelled', ref, event.type)
      }

      // Email d'annulation au client
      if (customerEmail && pickupLabel) {
        await sendEmail({
          to: { email: customerEmail, name: customerName || undefined },
          subject: `Votre créneau de retrait a été annulé — ${pickupLabel}`,
          htmlContent: renderPickupCancellationHtml({
            customerName: customerName || 'Cher client',
            pickupLabel,
            reason:
              event.type === 'checkout.session.expired'
                ? 'le paiement n\'a pas été finalisé dans les temps'
                : 'le paiement a échoué',
          }),
          tags: ['pickup-cancellation'],
        })
      }
    }
  }

  // On répond toujours 200 pour que Stripe n'essaie pas de rejouer
  return NextResponse.json({ received: true })
}

function formatPrice(cents?: number): string {
  if (typeof cents !== 'number') return ''
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderQuoteAcceptedHtml(input: {
  customerName: string
  numero: string
  amountCents?: number
}): string {
  const { customerName, numero, amountCents } = input
  const firstName = customerName.split(' ')[0] || customerName
  const price = formatPrice(amountCents)
  return `<!DOCTYPE html>
<html lang="fr"><body style="margin:0;padding:0;background:#F0EBE3;font-family:Georgia,serif;color:#1a1a1a;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:32px 16px;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:#FAF7F2;border:1px solid #e5e1d9;">
<tr><td style="background:#1a1a1a;color:#FAF7F2;padding:32px;text-align:center;">
<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B89A5B;font-family:'Helvetica Neue',Arial,sans-serif;">Mobilier Malin</div>
<h1 style="margin:8px 0 0;font-size:26px;font-weight:normal;">Devis accepté et payé ✓</h1>
<div style="margin-top:8px;font-size:14px;opacity:0.8;">${escapeHtml(numero)}</div>
</td></tr>
<tr><td style="padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#3D3D3D;">
<p style="margin:0 0 16px;">Bonjour ${escapeHtml(firstName)},</p>
<p style="margin:0 0 16px;">Merci pour votre confiance. Votre paiement${price ? ` de <strong style="color:#1a1a1a;">${price}</strong>` : ''} a bien été reçu.</p>
<p style="margin:0 0 16px;">Notre équipe vous recontacte sous <strong>24 à 48 h ouvrées</strong> pour planifier la livraison.</p>
<hr style="border:none;border-top:1px solid #e5e1d9;margin:24px 0;">
<p style="margin:0 0 8px;font-size:13px;color:#6B6B6B;">Une question ?</p>
<p style="margin:0;font-size:14px;">📞 <a href="tel:${LEGAL.telephoneTel}" style="color:#1a1a1a;">${LEGAL.telephone}</a> · ✉️ <a href="mailto:${LEGAL.email}" style="color:#1a1a1a;">${LEGAL.email}</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}

function renderQuoteAcceptedAdminHtml(input: {
  customerName: string
  customerEmail: string
  numero: string
  quoteId: string
  amountCents?: number
}): string {
  const { customerName, customerEmail, numero, quoteId, amountCents } = input
  const price = formatPrice(amountCents)
  const studioLink = quoteId
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'}/studio/structure/devisLivraison;${quoteId}`
    : ''
  return `<!DOCTYPE html>
<html lang="fr"><body style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f5;padding:24px;color:#1a1a1a;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e1d9;">
<tr><td style="background:#1a1a1a;color:#fff;padding:24px;">
<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B89A5B;">Mobilier Malin — Admin</div>
<h1 style="margin:8px 0 0;font-size:22px;font-weight:normal;">✅ Devis accepté et payé</h1>
</td></tr>
<tr><td style="padding:24px;font-size:14px;line-height:1.6;">
<p style="margin:0 0 12px;"><strong>${escapeHtml(numero)}</strong></p>
<p style="margin:0 0 8px;">Client : <strong>${escapeHtml(customerName)}</strong></p>
<p style="margin:0 0 8px;">Email : ${escapeHtml(customerEmail)}</p>
${price ? `<p style="margin:0 0 16px;">Montant reçu : <strong style="font-size:18px;">${price}</strong></p>` : ''}
<p style="margin:16px 0;">→ Contacter le client pour planifier la livraison sous 24-48h ouvrées.</p>
${studioLink ? `<div style="margin-top:24px;"><a href="${studioLink}" style="display:inline-block;background:#B89A5B;color:#fff;padding:10px 20px;text-decoration:none;font-weight:500;">Voir le devis dans Studio →</a></div>` : ''}
</td></tr></table></body></html>`
}
