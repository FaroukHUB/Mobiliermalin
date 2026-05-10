'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Accueil', href: '/' },
  { label: 'Boutique', href: '/boutique' },
  { label: 'Location LLD', href: '/location-mobilier-bureau' },
  { label: 'Vidage de locaux', href: '/vidage-de-locaux' },
  { label: 'Notre démarche', href: '/notre-demarche' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full bg-ivory/90 backdrop-blur supports-[backdrop-filter]:bg-ivory/75 border-b border-line">
      <div className="container flex items-center justify-between h-20">
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
          aria-label="Mobilier Malin — accueil"
        >
          <span className="font-serif text-2xl tracking-tight text-ink">
            Mobilier <span className="text-gold-dark">Malin</span>
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden lg:flex items-center gap-8"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink hover:text-gold-dark transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/contact"
            className="hidden md:inline-flex btn-gold !py-2 !px-4 text-xs"
          >
            Demander un devis
          </Link>
          <button
            type="button"
            aria-label="Rechercher"
            className="p-2 hover:text-gold-dark hidden sm:inline-flex"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/compte"
            aria-label="Mon compte"
            className="p-2 hover:text-gold-dark hidden sm:inline-flex"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/panier"
            aria-label="Panier"
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

      {/* Menu mobile */}
      <div
        className={cn(
          'lg:hidden border-t border-line bg-ivory transition-[max-height] duration-300 overflow-hidden',
          mobileOpen ? 'max-h-[600px]' : 'max-h-0',
        )}
      >
        <nav aria-label="Navigation mobile" className="container py-6 flex flex-col gap-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-base text-ink hover:text-gold-dark"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="btn-gold mt-2 self-start"
          >
            Demander un devis
          </Link>
        </nav>
      </div>
    </header>
  )
}
