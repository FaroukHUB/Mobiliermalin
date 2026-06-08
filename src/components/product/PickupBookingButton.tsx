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
  const [refreshKey, setRefreshKey] = useState(0)

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
      // On passe directement à Stripe avec toutes les infos de retrait en
      // metadata. Le Cal booking sera créé APRÈS confirmation du paiement,
      // par le webhook /api/stripe/webhook → checkout.session.completed.
      // → Plus aucun risque de Cal booking "fantôme" si le client abandonne.
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
          customerPhone: slot.phone,
        }),
      })
      if (!checkoutRes.ok) {
        const data = (await checkoutRes.json().catch(() => ({}))) as { error?: string }
        // Si le serveur signale un slot pris entre temps, on rafraîchit la dispo
        if (checkoutRes.status === 409) {
          setRefreshKey((k) => k + 1)
        }
        throw new Error(data.error || 'Erreur lors de la création du paiement')
      }
      const data = (await checkoutRes.json()) as { url?: string }
      if (!data.url) throw new Error('URL de paiement manquante')
      window.location.href = data.url
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
        refreshKey={refreshKey}
      />
    </div>
  )
}
