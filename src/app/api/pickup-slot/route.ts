/**
 * POST /api/pickup-slot
 *
 * Endpoint appelé depuis /commande/succes une fois le paiement Stripe
 * confirmé, pour attacher un créneau de retrait à la commande.
 *
 * Vérifications côté serveur (aucune confiance au navigateur) :
 *  1. Le session_id existe dans Stripe
 *  2. payment_status === 'paid'
 *  3. fulfillment_mode === 'pickup'
 *  4. Aucun créneau n'a déjà été fixé (pickup_label absent)
 *
 * Actions si tout est OK :
 *  - Créer le booking Cal.eu
 *  - Envoyer email de confirmation au client
 *  - Envoyer email récapitulatif à Djamel
 *  - Mettre à jour la metadata de la session Stripe pour tracer le créneau
 *    (source de vérité pour les prochaines visites de la page succès)
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createBooking } from '@/lib/cal'
import {
  renderPickupAdminNotificationHtml,
  renderPickupConfirmationHtml,
  sendEmail,
} from '@/lib/brevo'
import { LEGAL } from '@/lib/legal'

const STRIPE_API = 'https://api.stripe.com/v1'

type SlotPayload = {
  sessionId?: string
  date?: string // YYYY-MM-DD
  time?: string // HH:MM
  label?: string // "mardi 3 septembre à 14 h 30"
  name?: string
  email?: string
  phone?: string
}

type StripeSession = {
  id?: string
  payment_status?: 'paid' | 'unpaid' | 'no_payment_required'
  amount_total?: number
  customer_email?: string
  customer_details?: { email?: string; name?: string; phone?: string }
  metadata?: Record<string, string>
}

/**
 * Convertit "YYYY-MM-DD" + "HH:MM" (heure Paris) en ISO 8601 avec offset
 * dynamique (CEST +02:00 ou CET +01:00). Dupliqué du webhook pour
 * garder ce fichier autonome — même logique, même sortie.
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

async function fetchStripeSession(
  stripeKey: string,
  sessionId: string,
): Promise<StripeSession | null> {
  try {
    const res = await fetch(`${STRIPE_API}/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as StripeSession
  } catch {
    return null
  }
}

/**
 * Update la metadata d'une session Stripe pour y ajouter les infos de
 * créneau. Permet à la page /commande/succes d'afficher la confirmation
 * lors des visites suivantes.
 */
async function updateSessionMetadata(
  stripeKey: string,
  sessionId: string,
  metadata: Record<string, string>,
): Promise<boolean> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(metadata)) {
    if (v) params.append(`metadata[${k}]`, v)
  }
  try {
    const res = await fetch(`${STRIPE_API}/checkout/sessions/${sessionId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[pickup-slot] failed to update session metadata', res.status, err)
      return false
    }
    return true
  } catch (err) {
    console.error('[pickup-slot] update metadata network error', err)
    return false
  }
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json(
      { error: 'Service de paiement non configuré' },
      { status: 503 },
    )
  }

  let body: SlotPayload
  try {
    body = (await req.json()) as SlotPayload
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const { sessionId, date, time, label, name, email, phone } = body
  if (!sessionId || !date || !time || !label || !name || !email || !phone) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }
  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }
  // Sécurité : sessionId doit ressembler à un cs_... Stripe (évite les injections)
  if (!/^cs_(test|live)_[a-zA-Z0-9]+$/.test(sessionId)) {
    return NextResponse.json({ error: 'Identifiant de session invalide' }, { status: 400 })
  }

  // 1) Vérifie côté Stripe que la session existe et est bien payée
  const session = await fetchStripeSession(stripeKey, sessionId)
  if (!session) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  }
  if (session.payment_status !== 'paid') {
    return NextResponse.json(
      { error: 'Le paiement de cette session n\'est pas confirmé' },
      { status: 403 },
    )
  }
  const meta = session.metadata || {}
  if (meta.fulfillment_mode !== 'pickup') {
    return NextResponse.json(
      { error: 'Cette commande n\'est pas en mode retrait' },
      { status: 400 },
    )
  }
  if (meta.pickup_label) {
    // Créneau déjà fixé sur cette commande — on renvoie l'info existante
    return NextResponse.json({
      ok: true,
      alreadyBooked: true,
      pickupLabel: meta.pickup_label,
    })
  }

  // 2) Crée le Cal.eu booking (mêmes règles que le flux fiche produit)
  const startIso = parisLocalToIso(date, time)
  const productName =
    meta.product_name || meta.cart_summary || 'Commande Mobilier Malin'
  const calResult = await createBooking({
    start: startIso,
    attendee: {
      name,
      email,
      phoneNumber: phone,
      timeZone: 'Europe/Paris',
    },
    notes: `Retrait pour : ${productName}`,
  })

  if (!calResult.ok) {
    // Si Cal.eu répond "slot occupé", on remonte 409 pour que le picker
    // rafraîchisse la dispo côté navigateur.
    const errMsg = (calResult.error || '').toLowerCase()
    const isSlotConflict =
      errMsg.includes('unavailable') ||
      errMsg.includes('slot') ||
      errMsg.includes('booking')
    return NextResponse.json(
      {
        error:
          'Ce créneau vient d\'être pris. Merci d\'en choisir un autre.',
        details: calResult.error,
      },
      { status: isSlotConflict ? 409 : 502 },
    )
  }

  const calBookingRef = calResult.bookingUid || calResult.bookingId

  // 3) Update metadata Stripe pour tracer le créneau
  await updateSessionMetadata(stripeKey, sessionId, {
    pickup_date: date,
    pickup_time: time,
    pickup_label: label,
    customer_name: name,
    customer_phone: phone,
    cal_booking_uid: calResult.bookingUid ? String(calResult.bookingUid) : '',
    cal_booking_id: calResult.bookingId ? String(calResult.bookingId) : '',
  })

  // 4) Emails — best-effort, on ne bloque pas si Brevo échoue
  const customerEmail = email
  const customerName = name
  const cartSummary = meta.cart_summary
  const distinctProducts = meta.distinct_products
  const totalItems = meta.total_items
  const orderTitle =
    distinctProducts && Number(distinctProducts) > 1
      ? `Panier ${totalItems || '?'} article${Number(totalItems) > 1 ? 's' : ''} · ${distinctProducts} référence${Number(distinctProducts) > 1 ? 's' : ''}`
      : productName

  // Email client — confirmation du créneau
  await sendEmail({
    to: { email: customerEmail, name: customerName },
    subject: `Créneau confirmé — ${label}`,
    htmlContent: renderPickupConfirmationHtml({
      customerName,
      customerEmail,
      productName: orderTitle,
      amountCents: session.amount_total,
      pickupLabel: label,
    }),
    tags: ['pickup-slot-confirmed'],
  }).catch((err) => console.warn('[pickup-slot] customer email failed', err))

  // Email admin — récap complet
  const adminProductLine = cartSummary
    ? `${orderTitle}\n\nDétail du panier :\n${cartSummary.split(' | ').map((l) => `  · ${l}`).join('\n')}`
    : orderTitle
  await sendEmail({
    to: { email: LEGAL.email, name: 'Mobilier Malin' },
    subject: `🛒 Créneau retrait choisi — ${orderTitle}`,
    htmlContent: renderPickupAdminNotificationHtml({
      customerName,
      customerEmail,
      customerPhone: phone,
      productName: adminProductLine,
      pickupLabel: label,
      amountCents: session.amount_total,
      stripeSessionId: sessionId,
      calBookingRef: calBookingRef ? String(calBookingRef) : undefined,
    }),
    tags: ['pickup-slot-admin'],
  }).catch((err) => console.warn('[pickup-slot] admin email failed', err))

  return NextResponse.json({
    ok: true,
    pickupLabel: label,
    calBookingRef,
  })
}
