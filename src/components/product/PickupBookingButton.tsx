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

  async function handleConfirm(slot: { date: string; time: string; label: string }) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
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
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || 'Erreur lors de la création du paiement')
      }
      const data = (await res.json()) as { url?: string }
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
      {error && <p className="text-xs text-red-700">{error}</p>}
      <SlotPicker
        open={open}
        onClose={() => !loading && setOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </div>
  )
}
