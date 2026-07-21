import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { type ProductCardData } from '@/components/product/ProductCard'
import { FeaturedProductsCarousel } from '@/components/sections/FeaturedProductsCarousel'
import { urlFor, type SanityProduct } from '@/lib/sanity'

interface FeaturedProductsProps {
  products: SanityProduct[]
}

const CONDITION_KEYS: Record<string, string> = {
  new: 'new',
  excellent: 'excellent',
  'very-good': 'very-good',
  good: 'good',
  fair: 'fair',
}

function sanityToCard(p: SanityProduct): ProductCardData {
  const firstImage = p.images?.[0]
  const imageUrl = firstImage?.asset
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
    condition: p.condition ? CONDITION_KEYS[p.condition] : undefined,
    brandName: p.brand,
    imageUrl,
    imageAlt: firstImage?.alt || p.name,
    status: 'published',
  }
}

/**
 * Section "Coups de cœur" sur la home : produits mis en avant via le toggle
 * "Produit en avant" dans Sanity Studio. Affichés en carousel horizontal
 * avec "peek effect" (2 visibles mobile + 3e à moitié, 4 desktop + 5e à
 * moitié). Auto-cachée si aucun produit featured n'existe.
 */
export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null

  const cards = products.map(sanityToCard)

  return (
    <section className="bg-ivory border-b border-line">
      <div className="container py-20 md:py-28">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">Coups de cœur</p>
            <h2 className="text-display mt-3 font-serif">
              Pièces sélectionnées par l&apos;équipe
            </h2>
            <div className="gold-divider mt-6" />
            <p className="mt-6 text-ink-mute">
              Notre sélection du moment — pièces signées, état exceptionnel,
              à saisir avant qu&apos;elles ne s&apos;envolent.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <FeaturedProductsCarousel cards={cards} />
        </Reveal>

        <Reveal>
          <div className="mt-12 text-center">
            <Link
              href="/boutique"
              className="btn-outline inline-flex items-center gap-2"
            >
              Voir tout le catalogue
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
