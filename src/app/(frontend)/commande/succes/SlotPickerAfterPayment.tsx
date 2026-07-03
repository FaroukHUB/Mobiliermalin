'use client'

import { useState } from 'react'
import { CalendarCheck, Loader2, AlertCircle } from 'lucide-react'
import { SlotPicker } from '@/components/product/SlotPicker'

interface Props {
  sessionId: string
  defaultName?: string
  defaultEmail?: string
  defaultPhone?: string
}

export function SlotPickerAfterPayment({
  sessionId,
  defaultName,
  defaultEmail,
  defaultPhone,
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [confirmedLabel, setConfirmedLabel] = useState<string | null>(null)

  async function handleConfirm(slot: {
    date: string
    time: string
    label: string
    name: string
    email: string
    phone: string
  }) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/pickup-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          date: slot.date,
          time: slot.time,
          label: slot.label,
          name: slot.name,
          email: slot.email,
          phone: slot.phone,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        pickupLabel?: string
        error?: string
      }
      if (!res.ok || !data.ok) {
        if (res.status === 409) {
          setRefreshKey((k) => k + 1)
        }
        throw new Error(data.error || 'Erreur lors de la réservation du créneau')
      }
      setConfirmedLabel(data.pickupLabel || slot.label)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  if (confirmedLabel) {
    // Confirmation inline après réussite — l'utilisateur voit son créneau
    // sans avoir à recharger la page.
    return (
      <div className="mt-12 bg-ivory-light border border-gold p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
            <CalendarCheck className="h-6 w-6 text-gold-dark" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="eyebrow text-gold-dark">Créneau confirmé</p>
            <h2 className="font-serif text-2xl text-ink mt-2 capitalize">
              {confirmedLabel}
            </h2>
            <p className="mt-3 text-sm text-ink-soft leading-relaxed">
              Un email de confirmation vient de vous être envoyé, et le rendez-vous
              a été ajouté à notre agenda. Rendez-vous à l&apos;adresse indiquée
              ci-dessous.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <div className="bg-ivory-light border border-line">
        <div className="bg-ink text-ivory px-6 md:px-8 py-5">
          <p className="eyebrow text-gold">Étape suivante</p>
          <h2 className="font-serif text-2xl mt-2">
            Choisissez votre créneau de retrait
          </h2>
        </div>

        <div className="p-6 md:p-8">
          <p className="text-ink-soft leading-relaxed">
            Votre commande est réservée. Sélectionnez maintenant le jour et
            l&apos;heure de votre retrait au showroom de La Penne-sur-Huveaune,
            du lundi au samedi entre 10 h et 18 h.
          </p>

          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={loading}
            className="btn-gold mt-6 inline-flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
              </>
            ) : (
              <>
                <CalendarCheck className="h-4 w-4" strokeWidth={1.5} />
                Choisir un créneau
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 flex items-start gap-3 bg-promo/5 border border-promo/20 p-4 text-sm text-promo">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <p className="mt-4 text-xs text-ink-mute">
            Si vous préférez fixer votre créneau plus tard, un lien vous a été
            envoyé par email pour revenir sur cette page à tout moment.
          </p>
        </div>
      </div>

      <SlotPicker
        open={open}
        onClose={() => !loading && setOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        errorMessage={error}
        refreshKey={refreshKey}
      />
    </div>
  )
}
