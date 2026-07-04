import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard, type ProductCardData } from './ProductCard'
import { urlFor, type SanityProduct } from '@/lib/sanity'

/**
 * "Vous aimerez aussi" — 4 pièces de la même catégorie affichées
 * en bas de la fiche produit. Renforce le maillage interne (cible
 * SEO n° 4 du plan) et augmente la profondeur de session.
 *
 * Ne s'affiche pas s'il n'y a aucun candidat.
 */

function sanityToCard(p: SanityProduct): ProductCardData {
  const firstImage = p.images?.[0]
  const imageUrl = firstImage
    ? urlFor(firstImage).width(900).height(1200).fit('crop').url()
    : undefined
  return {
    id: p._id,
    slug: p.slug.current,
    title: p.name,
    shortDescription: p.shortDescription,
    price: p.price,
    salePrice: p.salePrice,
    comparePrice: p.comparePrice,
    condition: p.condition,
    brandName: p.brand,
    imageUrl,
    imageAlt: firstImage?.alt || p.name,
    status: 'published',
  }
}

type RelatedProductsProps = {
  products: SanityProduct[]
  categoryName?: string
  categorySlug?: string
}

export function RelatedProducts({
  products,
  categoryName,
  categorySlug,
}: RelatedProductsProps) {
  if (!products || products.length === 0) return null

  return (
    <section
      className="bg-ivory-dark border-t border-line"
      aria-labelledby="related-products-heading"
    >
      <div className="container py-14 md:py-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="eyebrow">Vous aimerez aussi</p>
            <h2
              id="related-products-heading"
              className="text-h1 font-serif mt-2 leading-tight"
            >
              {categoryName ? (
                <>
                  D&apos;autres{' '}
                  <span className="text-gold-dark">
                    {categoryName.toLowerCase()}
                  </span>{' '}
                  disponibles
                </>
              ) : (
                'D\'autres pièces à découvrir'
              )}
            </h2>
          </div>

          {categorySlug && (
            <Link
              href={`/categorie/${categorySlug}`}
              className="btn-outline inline-flex items-center gap-2"
            >
              Voir toute la catégorie
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p._id} product={sanityToCard(p)} />
          ))}
        </div>
      </div>
    </section>
  )
}
