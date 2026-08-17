'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

/**
 * Popup promo de la page d'accueil — piloté par Sanity (Réglages du
 * site → 🎉 Popup promo).
 *
 * Règles :
 *  - Affiché UNIQUEMENT là où le composant est monté (la home)
 *  - À CHAQUE affichage/rafraîchissement de la page d'accueil
 *    (pas de mémorisation : demande explicite de l'admin)
 *  - Fermeture : croix, clic sur le fond, touche Échap, ou clic sur
 *    le bouton d'action (qui navigue vers la promo).
 */

interface HomePromoPopupProps {
  imageUrl: string
  imageAlt: string
  href: string
  buttonLabel: string
  campaignId: string
}

export function HomePromoPopup({
  imageUrl,
  imageAlt,
  href,
  buttonLabel,
}: HomePromoPopupProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 900)
    return () => clearTimeout(t)
  }, [])

  const dismiss = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    // Bloque le scroll de la page derrière le popup
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, dismiss])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Offre promotionnelle"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={dismiss}
    >
      {/* Fond assombri */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Carte */}
      <div
        className="relative max-w-sm w-full max-h-[90vh] flex flex-col bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="absolute -top-3 -right-3 z-10 h-9 w-9 flex items-center justify-center rounded-full bg-ink text-ivory hover:bg-gold transition-colors shadow-lg"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        <div className="overflow-y-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-auto block"
          />
        </div>

        <div className="p-3 bg-ivory border-t border-line">
          <Link
            href={href}
            onClick={dismiss}
            className="btn-gold w-full inline-flex items-center justify-center text-center py-3.5 text-sm md:text-base"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
