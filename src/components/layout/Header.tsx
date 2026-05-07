import Link from 'next/link'
import { ShoppingBag, Search, User, Menu } from 'lucide-react'

const NAV = [
  { label: 'Boutique', href: '/boutique' },
  { label: 'Catégories', href: '/categories' },
  { label: 'Vendre votre mobilier', href: '/vendre' },
  { label: 'Débarras', href: '/debarras' },
  { label: 'Notre démarche', href: '/a-propos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-ivory/90 backdrop-blur supports-[backdrop-filter]:bg-ivory/75 border-b border-line">
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3" aria-label="Mobilier Malin — accueil">
          <span className="font-serif text-2xl tracking-tight text-ink">
            Mobilier <span className="text-gold-dark">Malin</span>
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink hover:text-gold-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Rechercher"
            className="p-2 hover:text-gold-dark"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/compte"
            aria-label="Mon compte"
            className="p-2 hover:text-gold-dark"
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
            aria-label="Menu"
            className="p-2 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
