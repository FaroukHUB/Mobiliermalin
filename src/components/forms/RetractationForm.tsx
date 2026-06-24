'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function RetractationForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())

    try {
      const res = await fetch('/api/retractation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }
      setStatus('success')
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Une erreur est survenue, merci de réessayer.',
      )
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-ivory-light border border-gold p-8 md:p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-gold-dark mx-auto" strokeWidth={1.5} />
        <h3 className="font-serif text-2xl text-ink mt-6">Demande enregistrée</h3>
        <p className="text-ink-soft mt-3 leading-relaxed">
          Votre demande de rétractation a bien été reçue et horodatée. Un
          accusé de réception vient de vous être envoyé par email. Nous
          revenons vers vous sous 24 h ouvrées pour organiser le retour.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-8 btn-outline"
        >
          Nouvelle demande
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Nom et prénom" name="name" required autoComplete="name" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Téléphone (facultatif)" name="phone" type="tel" autoComplete="tel" />
        <Field label="N° de commande" name="orderNumber" placeholder="ex: MM-2026-1234" />
      </div>

      <div>
        <label className="mm-label" htmlFor="address">
          Adresse postale (pour le remboursement)
        </label>
        <textarea
          id="address"
          name="address"
          rows={2}
          className="mm-input"
          autoComplete="street-address"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Date de commande" name="orderDate" type="date" />
        <Field label="Date de réception" name="receptionDate" type="date" />
      </div>

      <div>
        <label className="mm-label" htmlFor="products">
          Produits concernés <span className="text-gold-dark">*</span>
        </label>
        <textarea
          id="products"
          name="products"
          required
          rows={3}
          className="mm-input"
          placeholder="Désignation, quantité, référence si connue…"
        />
      </div>

      <div>
        <label className="mm-label" htmlFor="reason">
          Motif (facultatif)
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          className="mm-input"
          placeholder="Le motif n'est pas obligatoire pour exercer votre droit de rétractation."
        />
      </div>

      <div className="bg-ivory-dark border border-line p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="confirm"
            value="yes"
            required
            className="mt-1 h-4 w-4 accent-gold-dark shrink-0"
          />
          <span className="text-sm text-ink-soft leading-relaxed">
            Je notifie par la présente à Mobilier Malin (SARL 2 M, 18 chemin
            Noël Robion, 13821 La Penne-sur-Huveaune) ma volonté de me
            rétracter du contrat portant sur les produits indiqués ci-dessus,
            conformément à mon droit légal de rétractation de 14 jours.
          </span>
        </label>
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" strokeWidth={1.75} />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary w-full sm:w-auto inline-flex items-center gap-2"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>Envoyer ma demande de rétractation</>
        )}
      </button>

      <p className="text-xs text-ink-mute leading-relaxed">
        Conformément à l&apos;ordonnance n°2026-2 du 19 juin 2026,
        l&apos;exercice de votre droit de rétractation est entièrement
        gratuit. Vos données sont transmises uniquement pour le traitement
        de cette demande.
      </p>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  autoComplete?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="mm-label" htmlFor={name}>
        {label}
        {required && <span className="text-gold-dark"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mm-input"
      />
    </div>
  )
}
