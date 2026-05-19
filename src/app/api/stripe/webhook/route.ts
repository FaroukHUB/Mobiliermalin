import { NextResponse, type NextRequest } from 'next/server'
import { cancelBooking } from '@/lib/cal'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // crypto-subtle nécessite Node, pas Edge

/**
 * Webhook Stripe pour gérer les sessions abandonnées.
 *
 * Events écoutés :
 * - checkout.session.expired : session abandonnée → on annule le booking Cal
 *   pour libérer le créneau
 * - checkout.session.async_payment_failed : paiement raté → idem
 *
 * Configuration requise sur Stripe Dashboard :
 *   1. Developers → Webhooks → Add endpoint
 *   2. URL : https://mobiliermalin.vercel.app/api/stripe/webhook
 *   3. Events : checkout.session.expired, checkout.session.async_payment_failed
 *   4. Récupérer le "Signing secret" (whsec_...) et le coller dans Vercel
 *      en tant que STRIPE_WEBHOOK_SECRET
 */

type StripeEvent = {
  id?: string
  type?: string
  data?: {
    object?: {
      id?: string
      metadata?: Record<string, string>
    }
  }
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

  // Events qui doivent libérer le créneau
  const cancelEvents = new Set([
    'checkout.session.expired',
    'checkout.session.async_payment_failed',
  ])

  if (event.type && cancelEvents.has(event.type)) {
    const session = event.data?.object
    const bookingUid = session?.metadata?.cal_booking_uid
    const bookingId = session?.metadata?.cal_booking_id
    const ref = bookingUid || bookingId
    if (ref) {
      const result = await cancelBooking(
        ref,
        event.type === 'checkout.session.expired'
          ? 'Session Stripe expirée — créneau libéré'
          : 'Paiement Stripe échoué — créneau libéré',
      )
      if (!result.ok) {
        console.warn('[stripe-webhook] cancel booking failed', ref, result.error)
      } else {
        console.log('[stripe-webhook] booking cancelled', ref, event.type)
      }
    }
  }

  // On répond toujours 200 pour que Stripe n'essaie pas de rejouer
  return NextResponse.json({ received: true })
}
