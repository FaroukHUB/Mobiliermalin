import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight, Truck, FileText, Clock, ShieldCheck } from 'lucide-react'
import { getProductBySlug } from '@/lib/sanity'
import { DevisRequestForm } from '@/components/forms/DevisRequestForm'

export const metadata: Metadata = {
  title: 'Demander un devis livraison',
  description: 'Devis personnalisé pour la livraison de votre mobilier reconditionné, sous 24 h ouvrées.',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ produit?: string; nom?: string; prix?: string }>
}

export default async function DevisRequestPage({ searchParams }: Props) {
  const { produit, nom, prix } = await searchParams

  // Si un slug produit est passé, on tente de le charger depuis Sanity pour
  // pré-remplir nom + prix + id. Sinon on utilise les query params en fallback.
  let productId: string | undefined
  let productName = nom || 'Produit personnalisé'
  let productSlug = produit
  let productPrice = prix ? Number(prix) : 0

  if (produit) {
    const product = await getProductBySlug(produit)
    if (product) {
      productId = product._id
      productName = product.name
      productSlug = product.slug.current
      productPrice = product.price
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
