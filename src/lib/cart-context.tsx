'use client'

/**
 * Contexte panier — état global + persistance localStorage.
 *
 * Un panier = un tableau d'items (produits distincts avec quantité).
 * Persistance : localStorage clé "mobilier-malin-cart-v1".
 *
 * Les prix stockés sont les prix effectifs (salePrice si actif, sinon
 * price). On garde aussi maxStock pour éviter au client de dépasser
 * le stock disponible.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'mobilier-malin-cart-v1'

export type CartItem = {
  id: string // Sanity _id — identifie de manière unique
  slug: string
  name: string
  price: number // Prix effectif TTC (ce que le client paiera)
  imageUrl?: string
  imageAlt?: string
  quantity: number
  maxStock?: number
  brand?: string
  conditionLabel?: string
}

type AddInput = Omit<CartItem, 'quantity'> & { quantity?: number }

type CartContextValue = {
  items: CartItem[]
  itemCount: number // somme des quantités
  distinctCount: number // nombre de lignes
  subtotal: number // total TTC
  isReady: boolean // true dès que localStorage est chargé (évite hydration mismatch)
  addItem: (item: AddInput) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clear: () => void
  hasItem: (id: string) => boolean
}

const CartContext = createContext<CartContextValue | null>(null)

function clampQuantity(quantity: number, maxStock?: number): number {
  const q = Math.max(1, Math.floor(quantity))
  if (typeof maxStock === 'number' && maxStock > 0) {
    return Math.min(q, maxStock)
  }
  return q
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isReady, setIsReady] = useState(false)

  // Hydratation depuis localStorage — 1 fois au mount côté client
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed)) {
          // Filtre défensif : garde uniquement les items bien formés
          const clean = parsed.filter(
            (it): it is CartItem =>
              typeof it === 'object' &&
              it !== null &&
              typeof (it as CartItem).id === 'string' &&
              typeof (it as CartItem).slug === 'string' &&
              typeof (it as CartItem).name === 'string' &&
              typeof (it as CartItem).price === 'number' &&
              typeof (it as CartItem).quantity === 'number',
          )
          setItems(clean)
        }
      }
    } catch {
      // localStorage indisponible ou corrompu — on démarre avec un panier vide
    }
    setIsReady(true)
  }, [])

  // Persistance à chaque changement (après hydratation)
  useEffect(() => {
    if (!isReady) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Quota localStorage dépassé ou mode privé — silencieux
    }
  }, [items, isReady])

  const addItem = useCallback((input: AddInput) => {
    const requestedQty = input.quantity ?? 1
    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.id === input.id)
      if (existingIdx >= 0) {
        // Déjà présent → incrémente la quantité (borné par le stock)
        const next = [...prev]
        const merged: CartItem = { ...next[existingIdx] }
        merged.quantity = clampQuantity(
          merged.quantity + requestedQty,
          input.maxStock ?? merged.maxStock,
        )
        next[existingIdx] = merged
        return next
      }
      // Nouveau produit
      const newItem: CartItem = {
        id: input.id,
        slug: input.slug,
        name: input.name,
        price: input.price,
        imageUrl: input.imageUrl,
        imageAlt: input.imageAlt,
        quantity: clampQuantity(requestedQty, input.maxStock),
        maxStock: input.maxStock,
        brand: input.brand,
        conditionLabel: input.conditionLabel,
      }
      return [...prev, newItem]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        if (quantity <= 0) return it // on empêche le passage à 0 depuis ici
        return { ...it, quantity: clampQuantity(quantity, it.maxStock) }
      }),
    )
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, it) => sum + it.quantity, 0)
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0)
    return {
      items,
      itemCount,
      distinctCount: items.length,
      subtotal,
      isReady,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      hasItem: (id: string) => items.some((it) => it.id === id),
    }
  }, [items, isReady, addItem, removeItem, updateQuantity, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>')
  }
  return ctx
}
