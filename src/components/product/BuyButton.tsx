'use client'

import { useState } from 'react'
import { Loader2, ShoppingBag } from 'lucide-react'

interface BuyButtonProps {
  productId: string
  slug: string
  name: string
  price: number
}

export function BuyButton({ productId, slug, name, price }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, slug, name, price, quantity: 1 }),
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
        onClick={handleClick}
        disabled={loading}
        className="btn-gold inline-flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirection…
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            Acheter — {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)}
            <span className="ml-1 text-[0.65em] tracking-wider opacity-70 uppercase">TTC</span>
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
