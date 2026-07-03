'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Check, ArrowRight, Plus, Minus } from 'lucide-react'
import { useCart, type CartItem } from '@/lib/cart-context'

type Props = {
  product: Omit<CartItem, 'quantity'>
  variant?: 'primary' | 'inline' // primary : gros bouton fiche produit ; inline : discret dans une carte
  className?: string
}

export function AddToCartButton({
  product,
  variant = 'primary',
  className = '',
}: Props) {
  const { addItem, hasItem, isReady } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const alreadyInCart = isReady && hasItem(product.id)

  const maxStock = product.maxStock
  const canIncrement =
    typeof maxStock !== 'number' || quantity < maxStock
  const canDecrement = quantity > 1

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Empêche la navigation du <Link> parent quand le bouton est
    // imbriqué dans une carte cliquable (catalogue).
    e.preventDefault()
    e.stopPropagation()
    addItem({ ...product, quantity })
    setJustAdded(true)
    // Reset l'état après 2s pour que le bouton redevienne cliquable normalement
    setTimeout(() => setJustAdded(false), 2000)
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleAdd}
        aria-label={alreadyInCart ? 'Déjà au panier' : 'Ajouter au panier'}
        className={`inline-flex items-center justify-center gap-1.5 h-8 px-3 bg-ivory/95 backdrop-blur border border-line hover:border-gold text-[0.65rem] uppercase tracking-widest font-medium text-ink hover:text-gold-dark transition ${className}`}
      >
        {justAdded ? (
          <>
            <Check className="h-3.5 w-3.5 text-gold" strokeWidth={2} /> Ajouté
          </>
        ) : alreadyInCart ? (
          <>
            <Check className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} /> Au panier
          </>
        ) : (
          <>
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} /> Ajouter
          </>
        )}
      </button>
    )
  }

  // Variant primary — gros bouton "Ajouter au panier" + sélecteur quantité
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Sélecteur de quantité borné par le stock */}
        <div className="inline-flex items-center border border-line bg-ivory h-11">
          <button
            type="button"
            onClick={() => canDecrement && setQuantity(quantity - 1)}
            disabled={!canDecrement}
            aria-label="Diminuer la quantité"
            className="h-full w-11 flex items-center justify-center hover:bg-ivory-dark disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Minus className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <span
            aria-label={`Quantité ${quantity}`}
            className="w-11 text-center text-sm tabular-nums font-medium"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => canIncrement && setQuantity(quantity + 1)}
            disabled={!canIncrement}
            aria-label="Augmenter la quantité"
            className="h-full w-11 flex items-center justify-center hover:bg-ivory-dark disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Bouton d'ajout */}
        <button
          type="button"
          onClick={handleAdd}
          className={
            justAdded || alreadyInCart
              ? 'btn-outline inline-flex items-center gap-2'
              : 'btn-gold inline-flex items-center gap-2'
          }
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2} /> Ajouté au panier
            </>
          ) : alreadyInCart ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.5} /> Dans le panier
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} /> Ajouter au panier
            </>
          )}
        </button>

        {(justAdded || alreadyInCart) && (
          <Link
            href="/panier"
            className="inline-flex items-center gap-1.5 text-sm text-gold-dark hover:text-gold underline underline-offset-2 transition"
          >
            Voir le panier <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        )}
      </div>

      {/* Hint stock disponible */}
      {typeof maxStock === 'number' && maxStock > 0 && (
        <p className="mt-2 text-xs text-ink-mute">
          {maxStock <= 3 ? (
            <span className="text-promo font-medium">
              Plus que {maxStock} en stock
            </span>
          ) : (
            <>{maxStock} disponibles en stock</>
          )}
        </p>
      )}
    </div>
  )
}
