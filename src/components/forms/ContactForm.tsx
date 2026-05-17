'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const PROJECT_TYPES = [
  { value: 'achat', label: 'Achat de mobilier reconditionné' },
  { value: 'devis-livraison', label: 'Devis livraison pour un produit' },
  { value: 'vidage', label: 'Vidage de locaux / reprise' },
  { value: 'mixte', label: 'Achat ET vidage' },
  { value: 'lld', label: 'Location longue durée (LLD)' },
  { value: 'devis', label: 'Demande de devis détaillé' },
  { value: 'autre', label: 'Autre demande' },
]

function buildPrefilledMessage(produit?: string | null, prix?: string | null): string {
  if (!produit && !prix) return ''
  const parts = ['Bonjour,\n\nJe souhaite recevoir un devis pour la livraison du produit suivant :']
  if (produit) parts.push(`• Produit : ${produit}`)
  if (prix) parts.push(`• Prix indiqué : ${prix} €`)
  parts.push('\nMerci de me communiquer :')
  parts.push('— Le coût de livraison vers mon adresse')
  parts.push('— Les délais et options possibles (montage, étage, etc.)')
  parts.push('\nAdresse de livraison : …')
  parts.push('Étage : …  |  Ascenseur : oui / non')
  parts.push('\nCordialement,')
  return parts.join('\n')
}

export function ContactForm() {
  const searchParams = useSearchParams()
  const presetType = searchParams.get('type')
  const presetProduit = searchParams.get('nom') || searchParams.get('produit')
  const presetPrix = searchParams.get('prix')

  const initialType =
    presetType && PROJECT_TYPES.some((t) => t.value === presetType) ? presetType : ''
  const initialMessage = buildPrefilledMessage(presetProduit, presetPrix)

  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())

    try {
      const res = await fetch('/api/contact', {
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
        err instanceof Error ? err.message : "Une erreur est survenue, merci de réessayer.",
      )
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-ivory-light border border-gold p-8 md:p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-gold-dark mx-auto" strokeWidth={1.5} />
        <h3 className="font-serif text-2xl text-ink mt-6">Message bien reçu</h3>
        <p className="text-ink-soft mt-3 leading-relaxed">
          Merci pour votre demande. Nous revenons vers vous sous 24 h ouvrées.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-8 btn-outline"
        >
          Envoyer un autre message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Prénom & Nom" name="name" required autoComplete="name" />
        <Field label="Société (optionnel)" name="company" autoComplete="organization" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Email professionnel"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <Field label="Téléphone" name="phone" type="tel" autoComplete="tel" />
      </div>

      <div>
        <label className="mm-label">
          Type de projet <span className="text-gold-dark">*</span>
        </label>
        <select
          name="projectType"
          required
          className="mm-input"
          defaultValue={initialType}
        >
          <option value="" disabled>
            Sélectionnez…
          </option>
          {PROJECT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mm-label">
          Décrivez votre besoin <span className="text-gold-dark">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={initialMessage ? 10 : 5}
          className="mm-input"
          placeholder="Volume estimé, localisation, délais, références produits, etc."
          defaultValue={initialMessage}
        />
      </div>

      <p className="text-xs text-ink-mute leading-relaxed">
        En envoyant ce formulaire, vous acceptez d&apos;être contacté par
        Mobilier Malin pour le traitement de votre demande. Vos données ne sont
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
        className="btn-primary w-full sm:w-auto"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>Envoyer ma demande →</>
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
