/**
 * Client API Cal.com / Cal.eu pour la vérification de disponibilité et
 * la création de réservations. Tolérant de l'absence d'env vars : si la
 * clé API n'est pas configurée, les fonctions retournent un résultat
 * neutre permettant au flux existant (Stripe) de continuer à fonctionner.
 *
 * Cal.eu (instance européenne) utilise la même API que Cal.com.
 * Endpoint par défaut : https://api.cal.com/v2
 */

const DEFAULT_API_BASE = 'https://api.cal.com/v2'
const API_VERSION_SLOTS = '2024-09-04'
const API_VERSION_BOOKINGS = '2024-08-13'

type SlotsResponse = {
  data?: {
    slots?: Record<string, Array<{ time?: string; start?: string }>>
  }
}

export type AvailableSlot = {
  /** ISO 8601 ex: 2026-05-14T10:00:00+02:00 */
  start: string
}

function getCalConfig(): {
  apiKey: string
  eventTypeId: string
  apiBase: string
} | null {
  const apiKey = process.env.CAL_API_KEY
  const eventTypeId = process.env.CAL_EVENT_TYPE_ID
  if (!apiKey || !eventTypeId) return null
  return {
    apiKey,
    eventTypeId,
    apiBase: process.env.CAL_API_BASE || DEFAULT_API_BASE,
  }
}

export function isCalConfigured(): boolean {
  return getCalConfig() !== null
}

/**
 * Récupère les créneaux disponibles pour une plage de dates.
 * Si Cal n'est pas configuré, retourne null (le frontend sait alors
 * qu'il doit afficher tous les créneaux comme disponibles).
 */
export async function getAvailableSlots(
  startDate: string, // YYYY-MM-DD
  endDate: string, // YYYY-MM-DD
  timeZone: string = 'Europe/Paris',
): Promise<AvailableSlot[] | null> {
  const config = getCalConfig()
  if (!config) return null

  const url = new URL(`${config.apiBase}/slots/available`)
  url.searchParams.set('eventTypeId', config.eventTypeId)
  url.searchParams.set('startTime', `${startDate}T00:00:00.000Z`)
  url.searchParams.set('endTime', `${endDate}T23:59:59.999Z`)
  url.searchParams.set('timeZone', timeZone)

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'cal-api-version': API_VERSION_SLOTS,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.warn('[cal] availability fetch failed', res.status, await res.text().catch(() => ''))
      return null
    }

    const json = (await res.json()) as SlotsResponse
    const slotsByDate = json.data?.slots || {}
    const flat: AvailableSlot[] = []
    for (const date of Object.keys(slotsByDate)) {
      for (const s of slotsByDate[date] || []) {
        const start = s.start || s.time
        if (start) flat.push({ start })
      }
    }
    return flat
  } catch (err) {
    console.warn('[cal] availability fetch error', err)
    return null
  }
}

export type CreateBookingInput = {
  start: string // ISO 8601 avec timezone, ex: 2026-05-14T10:00:00+02:00
  attendee: {
    name: string
    email: string
    phoneNumber?: string
    timeZone?: string
  }
  metadata?: Record<string, string>
  notes?: string
}

export type CreateBookingResult = {
  ok: boolean
  bookingId?: number | string
  bookingUid?: string
  error?: string
}

/**
 * Crée une réservation sur Cal.com. Si Cal n'est pas configuré, retourne
 * un succès neutre pour ne pas bloquer le flow Stripe.
 */
export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const config = getCalConfig()
  if (!config) return { ok: true } // pas de booking créé, mais on ne bloque pas

  try {
    const res = await fetch(`${config.apiBase}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'cal-api-version': API_VERSION_BOOKINGS,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start: input.start,
        eventTypeId: Number(config.eventTypeId),
        attendee: {
          name: input.attendee.name,
          email: input.attendee.email,
          phoneNumber: input.attendee.phoneNumber,
          timeZone: input.attendee.timeZone || 'Europe/Paris',
          language: 'fr',
        },
        metadata: input.metadata,
        bookingFieldsResponses: input.notes ? { notes: input.notes } : undefined,
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[cal] booking creation failed', res.status, errText)
      return { ok: false, error: `Cal API ${res.status}` }
    }

    const json = (await res.json()) as {
      data?: { id?: number; uid?: string }
    }
    return {
      ok: true,
      bookingId: json.data?.id,
      bookingUid: json.data?.uid,
    }
  } catch (err) {
    console.error('[cal] booking creation error', err)
    return { ok: false, error: 'Erreur réseau Cal' }
  }
}
