'use client'

import { useState } from 'react'
import { CalendarCheck, Loader2 } from 'lucide-react'
import { SlotPicker } from './SlotPicker'

interface PickupBookingButtonProps {
  productId: string
  slug: string
  name: string
  price: number
}

export function PickupBookingButton({ productId, slug, name, price }: PickupBookingButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm(slot: {
    date: string
    time: string
    label: string
    name: string
    email: string
  }) {
    setLoading(true)
    setError(null)
    try {
      // 1) On crée d'abord la réservation Cal.eu (apparaît dans Google Cal de l'équipe)
      const calRes = await fetch('/api/cal/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: slot.date,
          time: slot.time,
          name: slot.name,
          email: slot.email,
          productName: name,
          productSlug: slug,
        }),
      })
      const calData = (await calRes.json().catch(() => ({}))) as {
        ok?: boolean
        bookingId?: string | number
        bookingUid?: string
        error?: string
        configured?: boolean
      }
      if (!calRes.ok || calData.ok === false) {
        throw new Error(
          calData.error ||
            'Le créneau n\'a pas pu être réservé. Il a peut-être été pris pendant votre saisie — essayez un autre créneau.',
        )
      }

      // 2) On lance le checkout Stripe avec le bookingId en metadata + email prérempli
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          slug,
          name,
          price,
          quantity: 1,
          fulfillmentMode: 'pickup',
          pickupDate: slot.date,
          pickupTime: slot.time,
          pickupLabel: slot.label,
          customerName: slot.name,
          customerEmail: slot.email,
          calBookingId: calData.bookingId,
          calBookingUid: calData.bookingUid,
        }),
      })
      if (!checkoutRes.ok) {
        const data = (await checkoutRes.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || 'Erreur lors de la création du paiement')
      }
      const data = (await checkoutRes.json()) as { url?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('URL de paiement manquante')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="btn-gold inline-flex items-center gap-2 w-full justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </>
        ) : (
          <>
            <CalendarCheck className="h-4 w-4" strokeWidth={1.5} />
            Choisir un créneau et payer
          </>
        )}
      </button>
      <SlotPicker
        open={open}
        onClose={() => !loading && setOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        errorMessage={error}
      />
    </div>
  )
}
