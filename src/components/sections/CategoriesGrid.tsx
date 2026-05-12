import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import {
  CATEGORIES as STATIC_CATEGORIES,
  getCategoryBySlug,
} from '@/lib/categories-data'
import { urlFor, type SanityCategory } from '@/lib/sanity'

type DisplayCategory = {
  slug: string
  label: string
  description: string
  href: string
  fromPrice: string
  image: string
  imageAlt: string
}

interface CategoriesGridProps {
  categories?: SanityCategory[]
}

/**
 * Convertit une catégorie Sanity en données d'affichage.
 * Si une catégorie hardcodée correspond au slug, on enrichit avec ses prix/desc.
 * Sinon, valeurs par défaut.
 */
function sanityToDisplay(c: SanityCategory): DisplayCategory {
  const slug = c.slug.current
  const staticData = getCategoryBySlug(slug)
  return {
    slug,
    label: c.name,
    description: c.description || staticData?.shortTagline || '',
    href: `/categorie/${slug}`,
    fromPrice: staticData?.fromPriceLabel || 'Découvrir',
    image: c.image
      ? urlFor(c.image).width(800).height(800).fit('crop').url()
      : staticData?.fallbackImage ||
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    imageAlt: c.image?.alt || staticData?.fallbackImageAlt || c.name,
  }
}

function staticToDisplay(c: (typeof STATIC_CATEGORIES)[number]): DisplayCategory {
  return {
    slug: c.slug,
    label: c.name,
    description: c.shortTagline,
    href: `/categorie/${c.slug}`,
    fromPrice: c.fromPriceLabel,
    image: c.fallbackImage,
    imageAlt: c.fallbackImageAlt,
  }
}

export function CategoriesGrid({ categories = [] }: CategoriesGridProps = {}) {
  // Si on a des catégories Sanity, on les affiche.
  // Sinon, on fallback sur les 7 catégories hardcodées (avant que le client n'ait rempli Sanity).
  const displayed: DisplayCategory[] =
    categories.length > 0
      ? categories.map(sanityToDisplay)
      : STATIC_CATEGORIES.map(staticToDisplay)

  return (
    <section className="container py-20 md:py-28">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow">Catalogue</p>
          <h2 className="text-display mt-3 font-serif">
            {displayed.length === 1
              ? "Une exigence"
              : `${displayed.length} univers, une exigence`}
          </h2>
          <div className="gold-divider mt-6" />
          <p className="mt-6 text-ink-mute">
            Chaque pièce est inspectée, nettoyée et reconditionnée avant
            livraison. Marques premium, état contrôlé, garantie 6 mois.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {displayed.map((c, i) => (
          <Reveal key={c.slug} delay={i * 60}>
            <Link
              href={c.href}
              className="group block bg-ivory-light border border-line hover:border-gold transition-colors duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-ivory-dark">
                <Image
                  src={c.image}
                  alt={c.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-ivory/95 backdrop-blur px-2.5 py-1 text-[0.65rem] uppercase tracking-widest text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Disponible
                </div>
                <div className="absolute bottom-3 right-3 h-10 w-10 bg-ivory translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-ink" strokeWidth={1.5} />
                </div>
              </div>
              <div className="p-5">
                <p className="text-[0.7rem] uppercase tracking-widest text-gold-dark font-medium">
                  {c.fromPrice}
                </p>
                <h3 className="font-serif text-lg md:text-xl text-ink mt-1.5 leading-tight">
                  {c.label}
                </h3>
                {c.description && (
                  <p className="text-xs text-ink-mute mt-1.5 leading-relaxed">
                    {c.description}
                  </p>
                )}
              </div>
            </Link>
          </Reveal>
        ))}

        {/* Card "Voir tout" */}
        <Reveal delay={displayed.length * 60}>
          <Link
            href="/boutique"
            className="group flex flex-col bg-ink text-ivory border border-ink hover:bg-gold-dark hover:border-gold-dark transition-colors duration-300 h-full"
          >
            <div className="aspect-square flex items-center justify-center">
              <ArrowRight
                className="h-10 w-10 text-gold group-hover:text-ivory group-hover:translate-x-1 transition"
                strokeWidth={1.25}
              />
            </div>
            <div className="p-5 mt-auto">
              <p className="text-[0.7rem] uppercase tracking-widest text-gold font-medium group-hover:text-ivory">
                Catalogue complet
              </p>
              <h3 className="font-serif text-lg md:text-xl mt-1.5 leading-tight text-ivory">
                Voir tous nos produits
              </h3>
              <p className="text-xs text-ivory/70 mt-1.5 leading-relaxed">
                Recherche, filtres, panier
              </p>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
