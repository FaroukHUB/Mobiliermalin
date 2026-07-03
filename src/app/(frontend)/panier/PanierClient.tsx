'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Store,
  Truck,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/utils'

export function PanierClient() {
  const { items, subtotal, distinctCount, isReady, updateQuantity, removeItem, clear } =
    useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Anti-hydration mismatch : le contenu du panier est côté client
  if (!isReady) {
    return (
      <section className="container py-24 md:py-32 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gold" />
      </section>
    )
  }

  // ─── Panier vide ─────────────────────────────────────
  if (items.length === 0) {
    return (
      <>
        <section className="bg-ivory-dark border-b border-line">
          <div className="container py-8">
            <nav className="text-xs text-ink-mute">
              <Link href="/" className="hover:text-gold-dark">Accueil</Link>
              <span className="mx-2">›</span>
              <span className="text-ink">Panier</span>
            </nav>
          </div>
        </section>

        <section className="container py-24 md:py-32 text-center max-w-2xl">
          <ShoppingBag className="h-12 w-12 text-gold mx-auto" strokeWidth={1.5} />
          <h1 className="text-display mt-6 font-serif">Votre panier est vide</h1>
          <div className="gold-divider mt-6" />
          <p className="mt-6 text-ink-mute leading-relaxed">
            Vous n&apos;avez encore ajouté aucun article. Découvrez notre
            catalogue de mobilier de bureau professionnel reconditionné.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/boutique" className="btn-gold inline-flex items-center gap-2">
              Explorer le catalogue
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link href="/" className="btn-outline">
              Retour à l&apos;accueil
            </Link>
          </div>
        </section>
      </>
    )
  }

  // ─── Panier avec articles ────────────────────────────
  // Checkout direct — le créneau de retrait sera choisi APRÈS le paiement,
  // sur la page /commande/succes, avec vérification serveur du paiement.
  const handleCheckout = async () => {
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((it) => ({
            id: it.id,
            slug: it.slug,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
          })),
          fulfillmentMode: 'pickup',
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setCheckoutError(data.error || 'Erreur lors de la création du paiement')
        setCheckoutLoading(false)
        return
      }
      const data = (await res.json()) as { url?: string }
      if (!data.url) {
        setCheckoutError('URL de paiement manquante')
        setCheckoutLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setCheckoutError('Connexion au service de paiement impossible')
      setCheckoutLoading(false)
    }
  }

  // Construit la query string pour /demander-devis avec la liste des items
  const devisHref = (() => {
    const params = new URLSearchParams()
    items.forEach((it, i) => {
      params.append(`items[${i}][slug]`, it.slug)
      params.append(`items[${i}][name]`, it.name)
      params.append(`items[${i}][price]`, String(it.price))
      params.append(`items[${i}][quantity]`, String(it.quantity))
    })
    return `/demander-devis?${params.toString()}`
  })()

  return (
    <>
      {/* Fil d'Ariane */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-8">
          <nav className="text-xs text-ink-mute">
            <Link href="/" className="hover:text-gold-dark">Accueil</Link>
            <span className="mx-2">›</span>
            <span className="text-ink">Panier ({distinctCount})</span>
          </nav>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="eyebrow">Votre sélection</p>
              <h1 className="text-display mt-2 font-serif leading-[1.05]">
                Panier — {distinctCount} article{distinctCount > 1 ? 's' : ''}
              </h1>
            </div>
            <button
              type="button"
              onClick={clear}
              className="text-xs text-ink-mute hover:text-promo underline underline-offset-2 uppercase tracking-widest"
            >
              Vider le panier
            </button>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-12">
            {/* ─── Liste des articles ─── */}
            <div className="space-y-4">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity
                const canIncrement =
                  typeof item.maxStock !== 'number' ||
                  item.quantity < item.maxStock
                return (
                  <article
                    key={item.id}
                    className="bg-ivory-light border border-line p-4 md:p-5 grid grid-cols-[80px_1fr_auto] md:grid-cols-[110px_1fr_auto] gap-4 md:gap-5 items-start"
                  >
                    {/* Photo */}
                    <Link
                      href={`/produit/${item.slug}`}
                      className="relative aspect-square bg-ivory-dark overflow-hidden block"
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt || item.name}
                          fill
                          sizes="110px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-ink-mute/40 uppercase tracking-widest">
                          Photo
                        </div>
                      )}
                    </Link>

                    {/* Infos */}
                    <div className="min-w-0">
                      {(item.brand || item.conditionLabel) && (
                        <p className="text-[0.6rem] uppercase tracking-widest text-gold-dark font-medium">
                          {[item.brand, item.conditionLabel]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      <Link
                        href={`/produit/${item.slug}`}
                        className="font-serif text-base md:text-lg text-ink hover:text-gold-dark leading-tight line-clamp-2 mt-1 block"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-ink-mute mt-1">
                        {formatPrice(item.price)}
                        <span className="ml-1 text-[0.7em] opacity-60 tracking-wider uppercase">
                          TTC
                        </span>{' '}
                        l&apos;unité
                      </p>
                      {typeof item.maxStock === 'number' &&
                        item.maxStock <= 3 && (
                          <p className="mt-1 text-[0.65rem] uppercase tracking-widest text-promo">
                            Plus que {item.maxStock} en stock
                          </p>
                        )}

                      {/* Contrôles quantité + suppression */}
                      <div className="mt-3 flex items-center gap-4 flex-wrap">
                        <div className="inline-flex items-center border border-line bg-ivory">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            aria-label="Diminuer la quantité"
                            className="h-8 w-8 flex items-center justify-center hover:bg-ivory-dark disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <span className="w-10 text-center text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={!canIncrement}
                            aria-label="Augmenter la quantité"
                            className="h-8 w-8 flex items-center justify-center hover:bg-ivory-dark disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center gap-1 text-xs text-ink-mute hover:text-promo transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          Retirer
                        </button>
                      </div>
                    </div>

                    {/* Total ligne */}
                    <div className="text-right">
                      <p className="font-serif text-lg md:text-xl text-ink">
                        {formatPrice(lineTotal)}
                        <span className="ml-1 text-[0.5em] font-sans tracking-wider opacity-60 align-baseline uppercase">
                          TTC
                        </span>
                      </p>
                    </div>
                  </article>
                )
              })}

              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 text-sm text-gold-dark hover:text-gold mt-4"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                Continuer mes achats
              </Link>
            </div>

            {/* ─── Récap + CTAs ─── */}
            <aside className="lg:sticky lg:top-24 h-max">
              <div className="bg-ivory-dark border border-line p-6 md:p-7">
                <p className="eyebrow">Récapitulatif</p>
                <div className="gold-divider mx-0 mt-4 mb-6" />

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between text-ink-soft">
                    <dt>
                      Sous-total ({distinctCount} article
                      {distinctCount > 1 ? 's' : ''})
                    </dt>
                    <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-mute text-xs">
                    <dt>Livraison</dt>
                    <dd>Calculée à l&apos;étape suivante</dd>
                  </div>
                </dl>

                <div className="mt-6 pt-6 border-t border-line flex justify-between items-baseline">
                  <span className="font-medium text-ink">Total</span>
                  <span className="font-serif text-2xl text-ink">
                    {formatPrice(subtotal)}
                    <span className="ml-1 text-[0.5em] font-sans tracking-wider opacity-60 align-baseline uppercase">
                      TTC
                    </span>
                  </span>
                </div>

                {/* CTA #1 — Paiement direct, créneau choisi après */}
                <div className="mt-8 space-y-3">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="btn-gold w-full inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirection…
                      </>
                    ) : (
                      <>
                        <Store className="h-4 w-4" strokeWidth={1.5} />
                        Payer maintenant
                      </>
                    )}
                  </button>
                  <p className="text-[0.7rem] text-center text-ink-mute leading-relaxed">
                    Retrait showroom La Penne-sur-Huveaune · Vous choisissez votre créneau juste après le paiement
                  </p>
                </div>

                {/* Séparateur */}
                <div className="my-6 flex items-center gap-3 text-[0.65rem] uppercase tracking-widest text-ink-mute">
                  <span className="flex-1 h-px bg-line" />
                  ou
                  <span className="flex-1 h-px bg-line" />
                </div>

                {/* CTA #2 — Devis livraison */}
                <div className="space-y-3">
                  <Link
                    href={devisHref}
                    className="btn-outline w-full inline-flex items-center justify-center gap-2"
                  >
                    <Truck className="h-4 w-4" strokeWidth={1.5} />
                    Demander un devis livraison
                  </Link>
                  <p className="text-[0.7rem] text-center text-ink-mute leading-relaxed">
                    Réponse sous 24 h ouvrées · Adapté à votre adresse
                  </p>
                </div>

                {checkoutError && (
                  <p className="mt-4 text-xs text-promo bg-promo/5 border border-promo/20 p-3">
                    {checkoutError}
                  </p>
                )}

                <ul className="mt-8 pt-6 border-t border-line space-y-3 text-xs text-ink-mute">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                    <span>Garantie 6 mois sur tous les produits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Store className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                    <span>Showroom La Penne-sur-Huveaune (13821)</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

    </>
  )
}
