'use client'

import { useState } from 'react'
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react'

interface AcceptQuoteButtonProps {
  quoteUid: string
  numero: string
  totalTtc: number
  customerEmail: string
  documentType?: 'quote' | 'invoice'
  /** Acompte en % (1-99) : le bouton affiche et prélève ce montant seulement. */
  depositPercent?: number
}

export function AcceptQuoteButton({
  quoteUid,
  numero,
  totalTtc,
  customerEmail,
  documentType = 'quote',
  depositPercent,
}: AcceptQuoteButtonProps) {
  const isInvoice = documentType === 'invoice'
  const hasDeposit =
    typeof depositPercent === 'number' && depositPercent >= 1 && depositPercent <= 99
  const amountToPay = hasDeposit
    ? Math.round(totalTtc * (depositPercent / 100) * 100) / 100
    : totalTtc
  const buttonLabel = hasDeposit
    ? `Accepter et régler l'acompte de ${depositPercent} % :`
    : isInvoice
      ? 'Payer maintenant'
      : 'Accepter et payer'
  const docLabel = isInvoice ? 'Facture' : 'Devis'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalStr = amountToPay.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/devis/${encodeURIComponent(quoteUid)}/accepter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
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
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-gold w-full inline-flex items-center justify-center gap-2 text-base py-4"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Redirection vers le paiement…
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
            {buttonLabel} {totalStr} €
          </>
        )}
      </button>
      {error && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-sm text-red-800 p-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}
      <p className="mt-3 text-center text-xs text-ink-mute">
        {docLabel} {numero} · Le paiement sera prélevé sur votre carte associée à{' '}
        <strong>{customerEmail}</strong>
      </p>
    </div>
  )
}
