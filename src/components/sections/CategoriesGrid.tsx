import { Reveal } from '@/components/animations/Reveal'
import { CategoriesSlider } from '@/components/sections/CategoriesSlider'
import {
  CATEGORIES as STATIC_CATEGORIES,
  getCategoryBySlug,
} from '@/lib/categories-data'
import { urlFor, type SanityCategory } from '@/lib/sanity'

type DisplayCategory = {
  slug: string
  label: string
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
    <section className="container pt-20 md:pt-28 pb-10 md:pb-14">
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
            livraison. Marques premium, contrôlés dans notre atelier local.
          </p>
        </div>
      </Reveal>

      <CategoriesSlider items={displayed} />

    </section>
  )
}
