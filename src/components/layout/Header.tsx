'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ShoppingBag, Menu, X, ChevronDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SHOP_URL } from '@/lib/config'

export type MenuCategory = {
  id: string
  name: string
  slug: string
  children: { id: string; name: string; slug: string }[]
}

interface HeaderProps {
  logo?: { url: string; alt?: string }
  categories?: MenuCategory[]
}

// Pages secondaires de la nav (à côté du mega-menu Catalogue)
const SECONDARY_NAV = [
  { label: 'Services', href: '#', children: [
    { label: 'Location longue durée', href: '/location-mobilier-bureau' },
    { label: 'Vidage de locaux', href: '/vidage-de-locaux' },
    { label: 'Attestation RSE', href: '/attestation-rse' },
    { label: 'Charte qualité', href: '/charte-qualite' },
  ]},
  { label: 'Notre démarche', href: '/notre-demarche' },
  { label: 'Contact', href: '/contact' },
] as const

export function Header({ logo, categories = [] }: HeaderProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState<'catalogue' | 'services' | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const closeTimer = useRef<NodeJS.Timeout | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  // Fermeture sur ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMegaOpen(null)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Fermeture quand on clique en dehors du header
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!headerRef.current?.contains(e.target as Node)) {
        setMegaOpen(null)
      }
    }
    if (megaOpen) {
      document.addEventListener('mousedown', onClick)
      return () => document.removeEventListener('mousedown', onClick)
    }
  }, [megaOpen])

  // Hover-intent : ouvre direct, ferme avec délai (évite les fermetures intempestives)
  function openMega(name: 'catalogue' | 'services') {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMegaOpen(name)
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setMegaOpen(null), 180)
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 w-full bg-ivory/90 backdrop-blur supports-[backdrop-filter]:bg-ivory/75 border-b border-line"
    >
      <div className="container flex items-center justify-between h-24 md:h-28">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
          aria-label="Mobilier Malin — accueil"
        >
          {logo ? (
            <Image
              src={logo.url}
              alt={logo.alt || 'Mobilier Malin'}
              width={320}
              height={96}
              priority
              className="h-16 md:h-20 w-auto object-contain"
            />
          ) : (
            <span className="font-serif text-2xl tracking-tight text-ink">
              Mobilier <span className="text-gold-dark">Malin</span>
            </span>
          )}
        </Link>

        {/* Nav desktop */}
        <nav
          aria-label="Navigation principale"
          className="hidden lg:flex items-center gap-1"
        >
          {/* Catalogue (mega-menu) */}
          {categories.length > 0 && (
            <div
              className="relative"
              onMouseEnter={() => openMega('catalogue')}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                onClick={() => setMegaOpen(megaOpen === 'catalogue' ? null : 'catalogue')}
                aria-expanded={megaOpen === 'catalogue'}
                aria-haspopup="true"
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 text-sm transition',
                  megaOpen === 'catalogue'
                    ? 'text-gold-dark'
                    : 'text-ink hover:text-gold-dark',
                )}
              >
                Catalogue
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform',
                    megaOpen === 'catalogue' && 'rotate-180',
                  )}
                  strokeWidth={2}
                />
              </button>
            </div>
          )}

          {/* Services dropdown */}
          <div
            className="relative"
            onMouseEnter={() => openMega('services')}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              onClick={() => setMegaOpen(megaOpen === 'services' ? null : 'services')}
              aria-expanded={megaOpen === 'services'}
              aria-haspopup="true"
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm transition',
                megaOpen === 'services'
                  ? 'text-gold-dark'
                  : 'text-ink hover:text-gold-dark',
              )}
            >
              Services
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  megaOpen === 'services' && 'rotate-180',
                )}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Liens simples */}
          <Link
            href="/notre-demarche"
            className="px-4 py-2 text-sm text-ink hover:text-gold-dark transition"
          >
            Notre démarche
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2 text-sm text-ink hover:text-gold-dark transition"
          >
            Contact
          </Link>
        </nav>

        {/* CTA + panier + burger */}
        <div className="flex items-center gap-1">
          <Link
            href="/contact"
            className="hidden md:inline-flex btn-gold !py-2 !px-4 text-xs"
          >
            Demander un devis
          </Link>
          <Link
            href={SHOP_URL}
            aria-label="Boutique"
            className="p-2 hover:text-gold-dark relative"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ═══ MEGA-MENU CATALOGUE ═══ */}
      {megaOpen === 'catalogue' && categories.length > 0 && (
        <div
          className="hidden lg:block absolute left-0 right-0 top-full bg-ivory border-t border-line shadow-lg"
          onMouseEnter={() => openMega('catalogue')}
          onMouseLeave={scheduleClose}
        >
          <div className="container py-10 md:py-12">
            <div className="grid grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-8">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <Link
                    href={`/categorie/${cat.slug}`}
                    onClick={() => setMegaOpen(null)}
                    className="block group"
                  >
                    <p className="font-serif text-lg text-ink group-hover:text-gold-dark transition">
                      {cat.name}
                    </p>
                    <div className="h-px w-8 bg-gold mt-2 group-hover:w-16 transition-all duration-300" />
                  </Link>
                  {cat.children.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {cat.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/categorie/${child.slug}`}
                            onClick={() => setMegaOpen(null)}
                            className="text-sm text-ink-soft hover:text-gold-dark transition inline-flex items-center gap-1.5 group"
                          >
                            <span className="text-gold-dark/40 group-hover:text-gold-dark transition">→</span>
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-line flex items-center justify-between flex-wrap gap-4">
              <p className="text-xs text-ink-mute uppercase tracking-widest">
                Stock renouvelé chaque semaine — pièces signées, garanties 6 mois
              </p>
              <Link
                href="/boutique"
                onClick={() => setMegaOpen(null)}
                className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark hover:text-gold transition"
              >
                Voir tout le catalogue
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DROPDOWN SERVICES ═══ */}
      {megaOpen === 'services' && (
        <div
          className="hidden lg:block absolute top-full bg-ivory border border-line shadow-lg min-w-[260px]"
          style={{ left: 'calc(50% - 130px)' }}
          onMouseEnter={() => openMega('services')}
          onMouseLeave={scheduleClose}
        >
          <ul className="py-3">
            {SECONDARY_NAV[0].children.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMegaOpen(null)}
                  className="block px-5 py-2.5 text-sm text-ink hover:bg-ivory-dark hover:text-gold-dark transition"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ═══ NAV MOBILE ═══ */}
      <div
        className={cn(
          'lg:hidden border-t border-line bg-ivory transition-[max-height] duration-300 overflow-hidden',
          mobileOpen ? 'max-h-[1200px] overflow-y-auto' : 'max-h-0',
        )}
      >
        <nav aria-label="Navigation mobile" className="container py-6 flex flex-col">
          {/* Catalogue (accordéon mobile) */}
          {categories.length > 0 && (
            <div className="border-b border-line">
              <button
                type="button"
                onClick={() =>
                  setMobileExpanded(mobileExpanded === 'catalogue' ? null : 'catalogue')
                }
                className="w-full flex items-center justify-between py-3 text-base text-ink"
                aria-expanded={mobileExpanded === 'catalogue'}
              >
                <span>Catalogue</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    mobileExpanded === 'catalogue' && 'rotate-180',
                  )}
                  strokeWidth={2}
                />
              </button>
              {mobileExpanded === 'catalogue' && (
                <div className="pb-4 space-y-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="pl-3">
                      <Link
                        href={`/categorie/${cat.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="font-serif text-base text-ink"
                      >
                        {cat.name}
                      </Link>
                      {cat.children.length > 0 && (
                        <ul className="mt-1 ml-2 space-y-1.5">
                          {cat.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/categorie/${child.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="text-sm text-ink-soft inline-flex items-center gap-1.5"
                              >
                                <span className="text-gold-dark/50">→</span>
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  <Link
                    href="/boutique"
                    onClick={() => setMobileOpen(false)}
                    className="ml-3 inline-flex items-center gap-2 text-sm font-medium text-gold-dark pt-2"
                  >
                    Voir tout le catalogue
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Services (accordéon mobile) */}
          <div className="border-b border-line">
            <button
              type="button"
              onClick={() =>
                setMobileExpanded(mobileExpanded === 'services' ? null : 'services')
              }
              className="w-full flex items-center justify-between py-3 text-base text-ink"
              aria-expanded={mobileExpanded === 'services'}
            >
              <span>Services</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  mobileExpanded === 'services' && 'rotate-180',
                )}
                strokeWidth={2}
              />
            </button>
            {mobileExpanded === 'services' && (
              <ul className="pb-4 pl-3 space-y-2">
                {SECONDARY_NAV[0].children.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm text-ink-soft inline-flex items-center gap-1.5"
                    >
                      <span className="text-gold-dark/50">→</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Liens simples */}
          <Link
            href="/notre-demarche"
            onClick={() => setMobileOpen(false)}
            className="py-3 text-base text-ink border-b border-line"
          >
            Notre démarche
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="py-3 text-base text-ink border-b border-line"
          >
            Contact
          </Link>

          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="btn-gold mt-4 self-start"
          >
            Demander un devis
          </Link>
        </nav>
      </div>
    </header>
  )
}
