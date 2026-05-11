'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ShoppingBag, ExternalLink, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SHOP_URL } from '@/lib/config'

const NAV = [
  { label: 'Accueil', href: '/', external: false },
  { label: 'Boutique', href: SHOP_URL, external: true },
  { label: 'Location LLD', href: '/location-mobilier-bureau', external: false },
  { label: 'Vidage de locaux', href: '/vidage-de-locaux', external: false },
  { label: 'Notre démarche', href: '/notre-demarche', external: false },
  { label: 'Contact', href: '/contact', external: false },
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
          {/* Pour utiliser un logo PNG : depose le fichier dans /public/logo.png
              et decommente le bloc Image ci-dessous (et commente le wordmark texte). */}
          {/* <Image
            src="/logo.png"
            alt="Mobilier Malin"
            width={240}
            height={72}
            priority
            className="h-12 md:h-16 w-auto object-contain"
          /> */}
          <span className="font-serif text-2xl tracking-tight text-ink">
            Mobilier <span className="text-gold-dark">Malin</span>
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden lg:flex items-center gap-8"
        >
          {NAV.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener"
                className="text-sm text-ink hover:text-gold-dark transition inline-flex items-center gap-1"
              >
                {item.label}
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-ink hover:text-gold-dark transition"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/contact"
            className="hidden md:inline-flex btn-gold !py-2 !px-4 text-xs"
          >
            Demander un devis
          </Link>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener"
            aria-label="Boutique en ligne"
            className="p-2 hover:text-gold-dark relative"
          >
            <ShoppingBag className="h-5 w-5" />
          </a>
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

      <div
        className={cn(
          'lg:hidden border-t border-line bg-ivory transition-[max-height] duration-300 overflow-hidden',
          mobileOpen ? 'max-h-[600px]' : 'max-h-0',
        )}
      >
        <nav aria-label="Navigation mobile" className="container py-6 flex flex-col gap-4">
          {NAV.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener"
                onClick={() => setMobileOpen(false)}
                className="text-base text-ink hover:text-gold-dark inline-flex items-center gap-2"
              >
                {item.label}
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-base text-ink hover:text-gold-dark"
              >
                {item.label}
              </Link>
            ),
          )}
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
