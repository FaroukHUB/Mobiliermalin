import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { urlFor, type SanityProduct } from '@/lib/sanity'

/**
 * "Entrées cette semaine à l'atelier" — les dernières pièces publiées.
 *
 * Alimentée automatiquement par la date d'ajout dans Sanity : rien à
 * gérer, la section se met à jour à chaque nouveau produit publié.
 * Elle montre qu'un stock de pièces uniques vit, et donne une raison
 * de revenir sur le site.
 */

interface LatestArrivalsProps {
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
    stock: p.stock,
    createdAt: p._createdAt,
  }
}

export function LatestArrivals({ products }: LatestArrivalsProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="container py-16 md:py-20">
      <Reveal>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Arrivages</p>
            <h2 className="text-h1 mt-2 font-serif">
              Entrées cette semaine à l&apos;atelier
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-ink-mute">
              Notre stock se renouvelle au rythme des entreprises qui changent
              de mobilier. Voici les dernières pièces contrôlées et mises en
              ligne.
            </p>
          </div>
          <Link
            href="/boutique"
            className="btn-outline inline-flex shrink-0 items-center gap-2"
          >
            Tout le catalogue
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {products.map((p, i) => (
          <Reveal key={p._id} delay={i * 60}>
            <ProductCard product={sanityToCard(p)} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
