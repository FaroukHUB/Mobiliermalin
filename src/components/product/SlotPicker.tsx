'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, X, MapPin, Loader2, ArrowRight, AlertCircle } from 'lucide-react'

interface SlotPickerProps {
  open: boolean
  onClose: () => void
  onConfirm: (slot: {
    date: string
    time: string
    label: string
    name: string
    email: string
    phone: string
  }) => void
  loading?: boolean
  errorMessage?: string | null
}

const TIME_SLOTS_MORNING = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30']
const TIME_SLOTS_AFTERNOON = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']

type DateOption = {
  iso: string
  weekday: string
  dayNum: string
  month: string
  isToday: boolean
  isTomorrow: boolean
}

/**
 * Formate une Date au format YYYY-MM-DD selon l'heure LOCALE (et pas UTC).
 * Évite le bug du décalage UTC qui transformait Mardi 00:00 Paris en Lundi 22:00 UTC.
 */
function toLocalISODate(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

function generateDates(): DateOption[] {
  const dates: DateOption[] = []
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  // Skip today (need at least J+1 for préparation) → start from tomorrow
  for (let i = 1; i <= 21 && dates.length < 14; i++) {
    const d = new Date(todayMidnight)
    d.setDate(todayMidnight.getDate() + i)
    if (d.getDay() === 0) continue // Dimanche fermé
    dates.push({
      iso: toLocalISODate(d),
      weekday: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
      dayNum: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
      isToday: false,
      isTomorrow: i === 1,
    })
  }
  return dates
}

function formatSlotLabel(iso: string, time: string): string {
  const d = new Date(iso + 'T00:00:00')
  const weekday = d.toLocaleDateString('fr-FR', { weekday: 'long' })
  const dayNum = d.getDate()
  const month = d.toLocaleDateString('fr-FR', { month: 'long' })
  return `${weekday} ${dayNum} ${month} à ${time}`
}

type AvailabilityState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; configured: boolean; availableSet: Set<string> }
  | { status: 'error'; message: string }

/**
 * Construit la clé "YYYY-MM-DD|HH:MM" à partir d'un ISO 8601.
 * On compare en local Europe/Paris pour faire matcher les créneaux Cal
 * (qui peuvent arriver en +02:00 ou +01:00 selon DST) avec nos slots fixes.
 */
function isoToLocalKey(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  // toLocaleString avec timeZone='Europe/Paris' nous donne la version locale Paris
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const get = (type: string) => parts.find((p) => p.type === type)?.value || ''
  return `${get('year')}-${get('month')}-${get('day')}|${get('hour')}:${get('minute')}`
}

export function SlotPicker({ open, onClose, onConfirm, loading, errorMessage }: SlotPickerProps) {
  const dates = useMemo(generateDates, [])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availability, setAvailability] = useState<AvailabilityState>({ status: 'idle' })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Sélectionne le premier jour par défaut
  useEffect(() => {
    if (open && !selectedDate && dates.length > 0) {
      setSelectedDate(dates[0].iso)
    }
  }, [open, selectedDate, dates])

  // Lock body scroll quand ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  // Fetch availability une fois quand la modal s'ouvre
  useEffect(() => {
    if (!open || dates.length === 0) return
    if (availability.status !== 'idle') return

    const start = dates[0].iso
    const end = dates[dates.length - 1].iso
    setAvailability({ status: 'loading' })

    fetch(`/api/cal/availability?start=${start}&end=${end}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{
          configured: boolean
          slots: string[]
          debug?: { reason?: string; status?: number; body?: string }
        }>
      })
      .then((data) => {
        if (!data.configured) {
          setAvailability({ status: 'error', message: 'Cal non configuré' })
          return
        }
        // En cas d'erreur API, debug contient reason/status/body
        if (data.debug && (data.debug as { reason?: string }).reason) {
          const d = data.debug as { reason?: string; status?: number; body?: string }
          console.warn('[SlotPicker] Cal API ERR — reason:', d.reason)
          console.warn('[SlotPicker] Cal API ERR — status:', d.status)
          console.warn('[SlotPicker] Cal API ERR — body:', d.body)
          setAvailability({ status: 'error', message: 'Disponibilité en temps réel indisponible' })
          return
        }
        // Succès : on log un échantillon pour debug du parsing
        if (data.debug) {
          const d = data.debug as { totalSlots?: number; sampleSlot?: string; rawSample?: string }
          console.log('[SlotPicker] Cal API OK — totalSlots:', d.totalSlots)
          console.log('[SlotPicker] Cal API OK — sampleSlot:', d.sampleSlot)
          if (d.totalSlots === 0) {
            console.log('[SlotPicker] Cal API OK — rawSample:', d.rawSample)
          }
        }
        const keys = data.slots.map(isoToLocalKey).filter(Boolean)
        console.log('[SlotPicker] mapped keys (5 first):', keys.slice(0, 5))
        const set = new Set(keys)
        setAvailability({ status: 'ready', configured: true, availableSet: set })
      })
      .catch((err) => {
        console.warn('[SlotPicker] availability error', err)
        setAvailability({ status: 'error', message: 'Disponibilité en temps réel indisponible' })
      })
  }, [open, dates, availability.status])

  if (!open) return null

  /** Renvoie true si le créneau est disponible (ou si Cal n'est pas configuré). */
  function isSlotAvailable(date: string, time: string): boolean {
    if (availability.status !== 'ready') return true // pendant le chargement, on n'interdit rien
    if (!availability.configured) return true
    return availability.availableSet.has(`${date}|${time}`)
  }

  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const trimmedPhone = phone.replace(/[^\d+]/g, '') // garde uniquement chiffres et +
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
  const isValidPhone = trimmedPhone.length >= 9 // tolérant : portable FR (10) ou intl (+33...)
  const canConfirm =
    !!selectedDate &&
    !!selectedTime &&
    trimmedName.length >= 2 &&
    isValidEmail &&
    isValidPhone &&
    !loading

  function handleConfirm() {
    if (!selectedDate || !selectedTime || !canConfirm) return
    onConfirm({
      date: selectedDate,
      time: selectedTime,
      label: formatSlotLabel(selectedDate, selectedTime),
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-picker-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-ivory border border-line shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-ivory border-b border-line px-6 md:px-8 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Retrait au showroom</p>
            <h2 id="slot-picker-title" className="font-serif text-2xl md:text-3xl text-ink mt-2">
              Choisissez votre créneau
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-mute hover:text-ink p-1"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 md:px-8 py-6 space-y-6">
          {/* Adresse rappel */}
          <div className="bg-ivory-light border border-line p-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-ink font-medium">Showroom Mobilier Malin</p>
                <p className="text-ink-soft mt-0.5">
                  18 chemin Noël Robion, 13821 La Penne-sur-Huveaune
                </p>
                <p className="text-ink-mute text-xs mt-1">
                  Ouvert lundi — samedi, 10 h — 18 h (dimanche fermé)
                </p>
              </div>
            </div>
          </div>

          {/* Date picker */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-gold" strokeWidth={1.5} />
              <p className="text-xs uppercase tracking-widest text-ink-mute">
                Date du retrait
              </p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {dates.map((d) => {
                const isSelected = selectedDate === d.iso
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.iso)
                      setSelectedTime(null)
                    }}
                    className={`flex flex-col items-center min-w-[68px] py-3 px-2 border transition ${
                      isSelected
                        ? 'border-gold bg-gold/10 text-ink'
                        : 'border-line bg-ivory-light text-ink-soft hover:border-gold/40'
                    }`}
                  >
                    <span className="text-[0.65rem] uppercase tracking-widest text-ink-mute">
                      {d.isTomorrow ? 'Demain' : d.weekday}
                    </span>
                    <span className="font-serif text-xl mt-1 leading-none">{d.dayNum}</span>
                    <span className="text-[0.65rem] uppercase tracking-widest text-ink-mute mt-1">
                      {d.month}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time picker */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-gold" strokeWidth={1.5} />
              <p className="text-xs uppercase tracking-widest text-ink-mute">
                Heure du retrait
              </p>
            </div>

            {availability.status === 'loading' && (
              <div className="flex items-center gap-2 text-xs text-ink-mute mb-3">
                <Loader2 className="h-3 w-3 animate-spin" />
                Vérification des créneaux disponibles…
              </div>
            )}
            {availability.status === 'error' && (
              <p className="text-[0.7rem] text-ink-mute mb-3">
                Disponibilité en temps réel indisponible — confirmez votre créneau par téléphone si nécessaire.
              </p>
            )}

            <p className="text-xs text-ink-mute mb-2">Matin</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
              {TIME_SLOTS_MORNING.map((t) => {
                const isSelected = selectedTime === t
                const isAvailable = selectedDate ? isSlotAvailable(selectedDate, t) : true
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedTime(t)}
                    className={`py-2.5 px-2 text-sm border transition ${
                      !isAvailable
                        ? 'border-line bg-ivory text-ink-mute/40 cursor-not-allowed line-through'
                        : isSelected
                          ? 'border-gold bg-gold/10 text-ink font-medium'
                          : 'border-line bg-ivory-light text-ink-soft hover:border-gold/40'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-ink-mute mb-2">Après-midi</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {TIME_SLOTS_AFTERNOON.map((t) => {
                const isSelected = selectedTime === t
                const isAvailable = selectedDate ? isSlotAvailable(selectedDate, t) : true
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedTime(t)}
                    className={`py-2.5 px-2 text-sm border transition ${
                      !isAvailable
                        ? 'border-line bg-ivory text-ink-mute/40 cursor-not-allowed line-through'
                        : isSelected
                          ? 'border-gold bg-gold/10 text-ink font-medium'
                          : 'border-line bg-ivory-light text-ink-soft hover:border-gold/40'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Récap créneau */}
          {selectedDate && selectedTime && (
            <div className="bg-gold/5 border border-gold/30 p-4">
              <p className="text-xs uppercase tracking-widest text-gold-dark mb-1">
                Votre créneau
              </p>
              <p className="font-serif text-base text-ink capitalize">
                {formatSlotLabel(selectedDate, selectedTime)}
              </p>
            </div>
          )}

          {/* Mini-form nom + email — n'apparaît qu'après sélection */}
          {selectedDate && selectedTime && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-ink-mute">
                Vos coordonnées pour la confirmation
              </p>
              <div className="space-y-3">
                <div>
                  <label htmlFor="slot-name" className="sr-only">Prénom & Nom</label>
                  <input
                    id="slot-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Prénom & Nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="mm-input"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="slot-email" className="sr-only">Email</label>
                    <input
                      id="slot-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="mm-input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="slot-phone" className="sr-only">Téléphone</label>
                    <input
                      id="slot-phone"
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      placeholder="Téléphone (ex: 06 12 34 56 78)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                      className="mm-input"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-xs text-red-800 p-3">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" strokeWidth={1.75} />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="btn-gold w-full inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirmation et redirection…
              </>
            ) : (
              <>
                Confirmer et payer
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </>
            )}
          </button>

          <p className="text-xs text-ink-mute text-center leading-relaxed">
            Votre créneau est réservé puis vous êtes redirigé vers le paiement sécurisé Stripe.
            Un email de confirmation vous sera envoyé.
          </p>
        </div>
      </div>
    </div>
  )
}
