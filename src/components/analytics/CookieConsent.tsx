'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'mm_cookie_consent_v1'
export const CONSENT_EVENT = 'mm:consent-change'

export type ConsentState = {
  analytics: boolean
  marketing: boolean
  ts: string
  version: 1
}

function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentState
    if (parsed?.version !== 1) return null
    return parsed
  } catch {
    return null
  }
}

function writeConsent(consent: Omit<ConsentState, 'ts' | 'version'>) {
  if (typeof window === 'undefined') return
  const payload: ConsentState = { ...consent, ts: new Date().toISOString(), version: 1 }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: payload }))
}

export function CookieConsent() {
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const existing = readConsent()
    if (!existing) {
      setOpen(true)
    } else {
      setAnalytics(existing.analytics)
      setMarketing(existing.marketing)
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: existing }))
    }
    const reopen = () => {
      const cur = readConsent()
      setAnalytics(cur?.analytics ?? false)
      setMarketing(cur?.marketing ?? false)
      setDetailsOpen(true)
      setOpen(true)
    }
    ;(window as Window & { openCookieSettings?: () => void }).openCookieSettings = reopen
    return () => {
      delete (window as Window & { openCookieSettings?: () => void }).openCookieSettings
    }
  }, [])

  if (!open) return null

  const acceptAll = () => {
    writeConsent({ analytics: true, marketing: true })
    setOpen(false)
  }
  const rejectAll = () => {
    writeConsent({ analytics: false, marketing: false })
    setOpen(false)
  }
  const saveCustom = () => {
    writeConsent({ analytics, marketing })
    setOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-3xl bg-ivory border border-line shadow-2xl">
        <div className="p-5 sm:p-6">
          <h2 id="cookie-consent-title" className="font-serif text-lg sm:text-xl text-ink">
            Vos préférences en matière de cookies
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Nous utilisons des cookies pour faire fonctionner le site et, avec votre accord, mesurer
            l&apos;audience afin d&apos;améliorer votre expérience. Vous pouvez tout accepter, tout
            refuser, ou personnaliser vos choix. Vous pourrez modifier votre décision à tout moment
            depuis la page{' '}
            <Link href="/cookies" className="text-gold-dark underline hover:no-underline">
              Cookies
            </Link>
            .
          </p>

          {detailsOpen && (
            <div className="mt-5 space-y-3 border-t border-line pt-5">
              <Category
                title="Cookies strictement nécessaires"
                description="Indispensables au fonctionnement du site (panier, paiement Stripe, session). Toujours actifs."
                checked
                disabled
              />
              <Category
                title="Mesure d'audience (Google Analytics)"
                description="Statistiques anonymisées de fréquentation pour améliorer le site. Données transférées chez Google (États-Unis) avec garanties contractuelles."
                checked={analytics}
                onChange={setAnalytics}
              />
              <Category
                title="Marketing &amp; personnalisation"
                description="Aucun cookie marketing déposé actuellement. Catégorie présente pour conformité future."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            <button
              type="button"
              onClick={acceptAll}
              className="order-1 sm:order-3 bg-ink text-ivory px-5 py-2.5 text-sm font-medium hover:bg-gold-dark transition-colors"
            >
              Tout accepter
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="order-2 sm:order-2 bg-ivory text-ink border border-ink px-5 py-2.5 text-sm font-medium hover:bg-ivory-dark transition-colors"
            >
              Tout refuser
            </button>
            {detailsOpen ? (
              <button
                type="button"
                onClick={saveCustom}
                className="order-3 sm:order-1 text-sm text-ink-soft hover:text-ink underline px-2 py-2.5"
              >
                Enregistrer mes choix
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                className="order-3 sm:order-1 text-sm text-ink-soft hover:text-ink underline px-2 py-2.5"
              >
                Personnaliser
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Category({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (v: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 accent-gold-dark disabled:opacity-50"
      />
      <span className="flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block text-xs text-ink-soft mt-0.5 leading-relaxed">{description}</span>
      </span>
    </label>
  )
}
