'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

/**
 * Recherche du site — icône dans l'en-tête, champ déployé au clic.
 *
 * Le format icône laisse toute sa place au méga-menu ; une fois
 * ouvert, le champ occupe la largeur complète, ce qui permet
 * d'afficher des suggestions lisibles avec vignettes.
 *
 * Fermeture : croix, touche Échap, clic hors du panneau, ou
 * navigation vers un résultat.
 */

type ProductHit = {
  id: string
  name: string
  slug: string
  price: number
  inStock: boolean
  brand?: string
  conditionLabel?: string
  imageUrl?: string
}

type CategoryHit = { id: string; name: string; slug: string }

export function SiteSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<ProductHit[]>([])
  const [categories, setCategories] = useState<CategoryHit[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setProducts([])
    setCategories([])
  }, [])

  // Focus automatique à l'ouverture
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Échap ferme, clic à l'extérieur aussi
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open, close])

  // Recherche différée : on attend 250 ms de pause avant d'interroger
  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) {
      setProducts([])
      setCategories([])
      setLoading(false)
      return
    }
    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetch(`/api/recherche?q=${encodeURIComponent(term)}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((data: { products?: ProductHit[]; categories?: CategoryHit[] }) => {
          setProducts(data.products || [])
          setCategories(data.categories || [])
        })
        .catch(() => undefined)
        .finally(() => setLoading(false))
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = query.trim()
    if (!term) return
    close()
    router.push(`/boutique?q=${encodeURIComponent(term)}`)
  }

  const hasResults = products.length > 0 || categories.length > 0
  const showEmpty = query.trim().length >= 2 && !loading && !hasResults

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Rechercher"
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center border border-line bg-ivory text-ink-soft transition-colors hover:border-gold hover:text-gold-dark"
      >
        <Search className="h-4 w-4" strokeWidth={1.75} />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute inset-x-0 top-full z-40 border-b border-line bg-ivory-light shadow-lg"
        >
          <form onSubmit={submit} className="container flex items-center gap-4 py-5">
            <Search className="h-5 w-5 shrink-0 text-ink-mute" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un fauteuil, un bureau, une marque…"
              className="flex-1 border-b-2 border-ink bg-transparent py-2 font-serif text-lg text-ink placeholder:font-sans placeholder:text-base placeholder:text-ink-mute/70 focus:outline-none"
            />
            {loading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gold" />
            )}
            <span className="hidden shrink-0 text-xs uppercase tracking-widest text-ink-mute sm:inline">
              Entrée pour tout voir
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Fermer la recherche"
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-ink text-ivory transition-colors hover:bg-gold"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>

          {(hasResults || showEmpty) && (
            <div className="border-t border-line bg-ivory">
              <div className="container max-h-[60vh] overflow-y-auto py-4">
                {categories.length > 0 && (
                  <>
                    <p className="mb-2 text-[0.65rem] uppercase tracking-widest text-ink-mute">
                      Rayons
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/categorie/${c.slug}`}
                          onClick={close}
                          className="border border-line bg-ivory-light px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-gold hover:text-gold-dark"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {products.length > 0 && (
                  <>
                    <p className="mb-2 text-[0.65rem] uppercase tracking-widest text-ink-mute">
                      {products.length} produit{products.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1.5">
                      {products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/produit/${p.slug}`}
                          onClick={close}
                          className="flex items-center gap-4 border border-line bg-ivory-light p-2.5 transition-colors hover:border-gold"
                        >
                          <span className="relative block h-12 w-12 shrink-0 overflow-hidden bg-ivory-dark">
                            {p.imageUrl && (
                              <Image
                                src={p.imageUrl}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            {(p.brand || p.conditionLabel) && (
                              <span className="block text-[0.6rem] uppercase tracking-widest text-gold-dark">
                                {[p.brand, p.conditionLabel].filter(Boolean).join(' · ')}
                              </span>
                            )}
                            <span className="block truncate text-sm text-ink">
                              {p.name}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block font-medium text-ink">
                              {formatPrice(p.price)}
                            </span>
                            {!p.inStock && (
                              <span className="block text-[0.6rem] uppercase tracking-widest text-ink-mute">
                                Sur commande
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={submit}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gold-dark"
                    >
                      Voir tous les résultats
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </>
                )}

                {showEmpty && (
                  <p className="py-6 text-center text-sm text-ink-mute">
                    Aucun résultat pour «&nbsp;{query.trim()}&nbsp;». Notre stock
                    change chaque semaine :{' '}
                    <Link
                      href="/contact"
                      onClick={close}
                      className="text-gold-dark underline underline-offset-4"
                    >
                      dites-nous ce que vous cherchez
                    </Link>
                    .
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
