'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

/**
 * Icône panier avec badge nombre d'articles.
 * Le badge n'apparaît que si le panier n'est pas vide.
 * Attendra que le context soit hydraté avant d'afficher le badge (évite
 * hydration mismatch entre serveur et client).
 */
export function CartIcon({ className = '' }: { className?: string }) {
  const { itemCount, isReady } = useCart()
  const count = isReady ? itemCount : 0

  return (
    <Link
      href="/panier"
      aria-label={
        count > 0 ? `Panier — ${count} article${count > 1 ? 's' : ''}` : 'Panier'
      }
      className={`p-2 hover:text-gold-dark relative inline-flex items-center ${className}`}
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-ivory text-[10px] font-bold flex items-center justify-center leading-none tabular-nums"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
