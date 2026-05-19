import { NextResponse, type NextRequest } from 'next/server'
import { cancelBooking, createBooking, isCalConfigured } from '@/lib/cal'

export const dynamic = 'force-dynamic'

type BookingPayload = {
  date?: string // YYYY-MM-DD
  time?: string // HH:MM (Paris)
  name?: string
  email?: string
  phone?: string
  productName?: string
  productSlug?: string
}

/**
 * Convertit "YYYY-MM-DD" + "HH:MM" (heure Paris) en ISO 8601 avec offset.
 * En CEST (mars-octobre) → +02:00. En CET (novembre-février) → +01:00.
 */
function parisLocalToIso(date: string, time: string): string {
  // Construit une Date "naïve" en local-server, puis convertit
  const local = new Date(`${date}T${time}:00`)
  // Détermine l'offset Paris pour cette date précise
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
 * POST /api/cal/booking
 * Body: { date, time, name, email, productName?, productSlug? }
 * Réponse : { ok, bookingId?, bookingUid?, error?, configured }
 *
 * Si Cal n'est pas configuré (clé API absente), retourne ok:true sans booking
 * pour ne pas bloquer le flow Stripe.
 */
export async function POST(req: NextRequest) {
  let body: BookingPayload
  try {
    body = (await req.json()) as BookingPayload
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide' }, { status: 400 })
  }

  const { date, time, name, email, phone, productName, productSlug } = body

  if (!date || !time || !name || !email) {
    return NextResponse.json(
      { ok: false, error: 'Champs requis : date, time, name, email' },
      { status: 400 },
    )
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json(
      { ok: false, error: 'Format invalide pour date ou time' },
      { status: 400 },
    )
  }
  if (!email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'Email invalide' }, { status: 400 })
  }

  if (!isCalConfigured()) {
    return NextResponse.json({ ok: true, configured: false })
  }

  const startIso = parisLocalToIso(date, time)
  const notes = productName
    ? `Retrait pour le produit : ${productName}${productSlug ? ` (${productSlug})` : ''}`
    : undefined

  const result = await createBooking({
    start: startIso,
    attendee: {
      name,
      email,
      phoneNumber: phone || undefined,
      timeZone: 'Europe/Paris',
    },
    notes,
    metadata: productSlug ? { productSlug } : undefined,
  })

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Erreur Cal' },
      { status: 502 },
    )
  }
  return NextResponse.json({
    ok: true,
    configured: true,
    bookingId: result.bookingId,
    bookingUid: result.bookingUid,
  })
}

/**
 * DELETE /api/cal/booking?ref=<bookingUid_ou_bookingId>
 *
 * Rollback : annule une réservation Cal.eu (utilisé quand le client
 * a réservé un créneau mais que la création de la session Stripe échoue
 * derrière → on libère le créneau immédiatement plutôt qu'attendre
 * l'expiration).
 */
export async function DELETE(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) {
    return NextResponse.json({ ok: false, error: 'Paramètre ref requis' }, { status: 400 })
  }
  if (!isCalConfigured()) {
    return NextResponse.json({ ok: true, configured: false })
  }
  const result = await cancelBooking(ref, 'Rollback automatique : checkout Stripe échoué')
  return NextResponse.json({ ok: result.ok, error: result.error })
}
