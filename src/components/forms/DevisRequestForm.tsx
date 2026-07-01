'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

type CartItem = {
  id?: string
  slug: string
  name: string
  price: number
  quantity: number
}

interface DevisRequestFormProps {
  productId?: string
  productName: string
  productSlug?: string
  productPrice: number
  cartItems?: CartItem[]
}

export function DevisRequestForm({
  productId,
  productName,
  productSlug,
  productPrice,
  cartItems,
}: DevisRequestFormProps) {
  const hasCart = Array.isArray(cartItems) && cartItems.length > 0
  const cartSubtotal = hasCart
    ? cartItems!.reduce((sum, it) => sum + it.price * it.quantity, 0)
    : 0
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [quoteNumero, setQuoteNumero] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const fd = new FormData(e.currentTarget)
    const payload: Record<string, unknown> = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      company: fd.get('company') || undefined,
      street: fd.get('street'),
      postalCode: fd.get('postalCode'),
      city: fd.get('city'),
      floor: fd.get('floor') || undefined,
      elevator: fd.get('elevator'),
      instructions: fd.get('instructions') || undefined,
      customerNotes: fd.get('customerNotes') || undefined,
    }
    if (hasCart) {
      payload.items = cartItems
    } else {
      payload.productId = productId
      payload.productName = productName
      payload.productSlug = productSlug
      payload.productPrice = productPrice
    }

    try {
      const res = await fetch('/api/devis/demande', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        numero?: string
        error?: string
      }
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }
      setQuoteNumero(data.numero || '')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-ivory-light border border-gold p-8 md:p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-gold-dark mx-auto" strokeWidth={1.5} />
        <h2 className="font-serif text-2xl text-ink mt-6">Demande de devis enregistrée</h2>
        {quoteNumero && (
          <p className="mt-3 text-sm text-ink-mute">
            Référence : <strong className="text-ink">{quoteNumero}</strong>
          </p>
        )}
        <div className="gold-divider mt-6" />
        <p className="text-ink-soft mt-6 leading-relaxed max-w-md mx-auto">
          Notre équipe vous transmet votre devis personnalisé sous{' '}
          <strong className="text-ink">24 h ouvrées</strong>, avec les frais de
          livraison adaptés à votre adresse.
        </p>
        <p className="text-ink-mute text-sm mt-4">
          Un email d&apos;accusé de réception vous a été envoyé.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Produit(s) récap */}
      {hasCart ? (
        <div className="bg-ivory-light border-l-4 border-gold p-4">
          <p className="text-xs uppercase tracking-widest text-ink-mute mb-2">
            Articles demandés ({cartItems!.length})
          </p>
          <ul className="space-y-1.5 text-sm">
            {cartItems!.map((it) => (
              <li key={it.slug} className="flex items-baseline justify-between gap-3">
                <span className="text-ink">
                  <strong>{it.quantity}×</strong> {it.name}
                </span>
                <span className="text-ink-mute tabular-nums shrink-0">
                  {(it.price * it.quantity).toLocaleString('fr-FR')} €
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-line flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-widest text-ink-mute">
              Sous-total produits
            </span>
            <strong className="text-ink text-lg">
              {cartSubtotal.toLocaleString('fr-FR')} €
            </strong>
          </div>
          <p className="text-xs text-ink-mute mt-2">
            Hors livraison — sera ajoutée dans le devis final.
          </p>
        </div>
      ) : (
        <div className="bg-ivory-light border-l-4 border-gold p-4">
          <p className="text-xs uppercase tracking-widest text-ink-mute mb-1">
            Produit concerné
          </p>
          <p className="font-serif text-base text-ink">{productName}</p>
          <p className="text-sm text-ink-mute mt-0.5">
            Prix produit :{' '}
            <strong className="text-ink">
              {productPrice.toLocaleString('fr-FR')} €
            </strong>{' '}
            (hors livraison)
          </p>
        </div>
      )}

      {/* Coordonnées */}
      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-ink-mute">
          Vos coordonnées
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prénom & Nom" name="name" required autoComplete="name" />
          <Field label="Société (optionnel)" name="company" autoComplete="organization" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email" name="email" type="email" required autoComplete="email" />
          <Field label="Téléphone" name="phone" type="tel" required autoComplete="tel" />
        </div>
      </section>

      {/* Adresse de livraison */}
      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-ink-mute">
          Adresse de livraison
        </h3>
        <Field label="Adresse (rue et numéro)" name="street" required autoComplete="street-address" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Code postal" name="postalCode" required autoComplete="postal-code" />
          <Field label="Ville" name="city" required autoComplete="address-level2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Étage (optionnel)" name="floor" />
          <div>
            <label className="mm-label" htmlFor="elevator">
              Ascenseur disponible
            </label>
            <select id="elevator" name="elevator" className="mm-input" defaultValue="unknown">
              <option value="unknown">Ne sait pas</option>
              <option value="yes">Oui</option>
              <option value="no">Non</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mm-label" htmlFor="instructions">
            Précisions d&apos;accès (optionnel)
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={2}
            className="mm-input"
            placeholder="Ex: rue piétonne, parking limité, digicode, etc."
          />
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-3">
        <h3 className="text-xs uppercase tracking-widest text-ink-mute">
          Besoin particulier ? (optionnel)
        </h3>
        <textarea
          name="customerNotes"
          rows={3}
          className="mm-input"
          placeholder="Ex: livraison souhaitée avant le 15, besoin de montage sur site, évacuation de l'ancien mobilier..."
        />
      </section>

      <p className="text-xs text-ink-mute leading-relaxed">
        En envoyant cette demande, vous acceptez d&apos;être contacté par
        Mobilier Malin pour la transmission de votre devis. Vos données ne sont
        ni revendues ni utilisées à des fins commerciales.
      </p>

      {status === 'error' && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" strokeWidth={1.75} />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-gold w-full sm:w-auto inline-flex items-center justify-center gap-2"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            Recevoir mon devis personnalisé
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </>
        )}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  autoComplete?: string
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
        className="mm-input"
      />
    </div>
  )
}
