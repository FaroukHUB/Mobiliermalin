import { NextResponse, type NextRequest } from 'next/server'
import { createBooking, isCalConfigured } from '@/lib/cal'

export const dynamic = 'force-dynamic'

type BookingPayload = {
  date?: string // YYYY-MM-DD
  time?: string // HH:MM (Paris)
  name?: string
  email?: string
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

  const { date, time, name, email, productName, productSlug } = body

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
    attendee: { name, email, timeZone: 'Europe/Paris' },
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
