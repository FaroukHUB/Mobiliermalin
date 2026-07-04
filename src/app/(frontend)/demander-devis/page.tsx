import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight, Truck, FileText, Clock, ShieldCheck } from 'lucide-react'
import { getProductBySlug } from '@/lib/sanity'
import { DevisRequestForm } from '@/components/forms/DevisRequestForm'

export const metadata: Metadata = {
  title: 'Demander un devis livraison',
  description: 'Devis personnalisé pour la livraison de votre mobilier reconditionné, sous 24 h ouvrées.',
  // noindex,follow → la page reste hors du SERP tout en laissant Google
  // suivre les liens sortants (produit → fiche produit → catégorie).
  robots: { index: false, follow: true },
}

type CartItem = {
  slug: string
  name: string
  price: number
  quantity: number
}

// Accepte les query params du panier : items[0][slug]=…&items[0][name]=…&items[0][price]=…&items[0][quantity]=…
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseCartItems(
  params: Record<string, string | string[] | undefined>,
): CartItem[] {
  const collected: Record<number, Partial<CartItem>> = {}
  for (const [key, rawValue] of Object.entries(params)) {
    // Format attendu : items[N][field]
    const match = key.match(/^items\[(\d+)\]\[(slug|name|price|quantity)\]$/)
    if (!match) continue
    const idx = Number(match[1])
    const field = match[2] as keyof CartItem
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue
    if (typeof value !== 'string') continue
    if (!collected[idx]) collected[idx] = {}
    if (field === 'price' || field === 'quantity') {
      const num = Number(value)
      if (!Number.isNaN(num) && num > 0) {
        collected[idx][field] = num
      }
    } else {
      collected[idx][field] = value
    }
  }
  return Object.keys(collected)
    .map(Number)
    .sort((a, b) => a - b)
    .map((i) => collected[i])
    .filter(
      (it): it is CartItem =>
        typeof it.slug === 'string' &&
        typeof it.name === 'string' &&
        typeof it.price === 'number' &&
        typeof it.quantity === 'number',
    )
}

export default async function DevisRequestPage({ searchParams }: Props) {
  const params = await searchParams
  const produit = typeof params.produit === 'string' ? params.produit : undefined
  const nom = typeof params.nom === 'string' ? params.nom : undefined
  const prix = typeof params.prix === 'string' ? params.prix : undefined

  const cartItems = parseCartItems(params)

  // Si un slug produit est passé (legacy), on tente de le charger depuis Sanity pour
  // pré-remplir nom + prix + id. Sinon on utilise les query params en fallback.
  let productId: string | undefined
  let productName = nom || 'Produit personnalisé'
  let productSlug = produit
  let productPrice = prix ? Number(prix) : 0

  if (produit && cartItems.length === 0) {
    const product = await getProductBySlug(produit)
    if (product) {
      productId = product._id
      productName = product.name
      productSlug = product.slug.current
      productPrice =
        product.salePrice && product.salePrice < product.price
          ? product.salePrice
          : product.price
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-10 md:py-14 max-w-4xl">
          <nav aria-label="Fil d'Ariane" className="text-xs text-ink-mute">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link href="/" className="hover:text-gold-dark">
                  Accueil
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              {productSlug ? (
                <>
                  <li>
                    <Link href={`/produit/${productSlug}`} className="hover:text-gold-dark">
                      {productName}
                    </Link>
                  </li>
                  <ChevronRight className="h-3 w-3" />
                </>
              ) : null}
              <li className="text-ink">Demande de devis</li>
            </ol>
          </nav>

          <p className="eyebrow mt-6">Livraison sur devis</p>
          <h1 className="text-display mt-3 font-serif leading-[1.05]">
            Recevez votre devis personnalisé
          </h1>
          <div className="gold-divider mx-0 mt-6" />
          <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-2xl">
            Indiquez-nous votre adresse de livraison et nous vous transmettons
            un devis détaillé sous 24 h ouvrées, avec frais de transport
            adaptés à votre situation.
          </p>
        </div>
      </section>

      {/* Réassurance */}
      <section className="bg-ivory border-b border-line">
        <div className="container py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-ink font-medium">Réponse sous 24 h</p>
                <p className="text-ink-mute text-xs mt-0.5">Jours ouvrés, lun-sam</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-ink font-medium">Devis PDF détaillé</p>
                <p className="text-ink-mute text-xs mt-0.5">Valable 30 jours, sans engagement</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-ink font-medium">Aucun engagement</p>
                <p className="text-ink-mute text-xs mt-0.5">Vous acceptez ou non en un clic</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section className="container py-12 md:py-16 max-w-3xl">
        <div className="bg-ivory-light border border-line p-6 md:p-10">
          <Suspense fallback={<div className="h-96 animate-pulse bg-ivory" />}>
            <DevisRequestForm
              productId={productId}
              productName={productName}
              productSlug={productSlug}
              productPrice={productPrice}
              cartItems={cartItems.length > 0 ? cartItems : undefined}
            />
          </Suspense>
        </div>

        <div className="mt-8 text-center text-sm text-ink-mute">
          <Truck className="h-4 w-4 inline-block mr-1.5 text-gold" strokeWidth={1.5} />
          Vous préférez retirer au showroom ?{' '}
          {productSlug && (
            <Link href={`/produit/${productSlug}`} className="text-gold-dark hover:text-gold underline">
              Retour à la fiche produit
            </Link>
          )}
        </div>
      </section>
    </>
  )
}
