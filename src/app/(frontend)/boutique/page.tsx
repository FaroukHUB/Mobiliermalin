import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { getAllProducts, getAllCategories, urlFor, type SanityProduct, type SanityCategory } from '@/lib/sanity'
import { CATEGORIES as STATIC_CATEGORIES } from '@/lib/categories-data'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Boutique — Catalogue de mobilier de bureau reconditionné',
  description:
    'Découvrez tout notre catalogue de mobilier de bureau premium reconditionné : bureaux, fauteuils, armoires, tables de réunion, caissons. Marques Steelcase, Herman Miller, Haworth, Vitra. Garantis 6 mois.',
  alternates: { canonical: '/boutique' },
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
    condition: p.condition ? CONDITION_KEYS[p.condition] : undefined,
    brandName: p.brand,
    imageUrl,
    imageAlt: firstImage?.alt || p.name,
    status: 'published',
  }
}

type FilterGroup = {
  parentSlug: string | null
  parentName: string | null
  children: { slug: string; name: string }[]
}

function groupByParent(categories: SanityCategory[]): FilterGroup[] {
  // Catégories racines (sans parent)
  const roots = categories.filter((c) => !c.parent)
  // Catégories enfants (avec parent)
  const childrenByParent = new Map<string, SanityCategory[]>()
  for (const c of categories) {
    if (c.parent) {
      const list = childrenByParent.get(c.parent._id) || []
      list.push(c)
      childrenByParent.set(c.parent._id, list)
    }
  }
  return roots.map((root) => ({
    parentSlug: root.slug.current,
    parentName: root.name,
    children: (childrenByParent.get(root._id) || []).map((c) => ({
      slug: c.slug.current,
      name: c.name,
    })),
  }))
}

export default async function BoutiquePage() {
  const [products, sanityCategories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ])

  // Si on a des catégories Sanity, on les groupe par parent.
  // Sinon, on fallback à plat sur les 7 catégories hardcodées.
  const filterGroups: FilterGroup[] =
    sanityCategories.length > 0
      ? groupByParent(sanityCategories)
      : [
          {
            parentSlug: null,
            parentName: null,
            children: STATIC_CATEGORIES.map((c) => ({ slug: c.slug, name: c.name })),
          },
        ]

  return (
    <>
      {/* Hero */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-12 md:py-16 max-w-4xl">
          <p className="eyebrow">Catalogue</p>
          <h1 className="text-display-xl mt-4 font-serif leading-[1.05]">
            Notre catalogue
          </h1>
          <div className="gold-divider mx-0 mt-8" />
          <p className="mt-8 text-lg text-ink-soft leading-relaxed max-w-2xl">
            Toutes nos pièces inspectées, nettoyées et reconditionnées dans
            notre atelier de La Penne-sur-Huveaune. Steelcase, Herman Miller,
            Haworth, Vitra — livraison France entière.
          </p>
        </div>
      </section>

      {/* Filtres catégories — hiérarchie parent → enfants */}
      <section className="border-b border-line bg-ivory-light">
        <div className="container py-6 space-y-4">
          {filterGroups.map((group, idx) => (
            <div
              key={group.parentSlug || `flat-${idx}`}
              className="flex items-center gap-2 flex-wrap"
            >
              {group.parentSlug && group.parentName ? (
                <Link
                  href={`/categorie/${group.parentSlug}`}
                  className="text-xs uppercase tracking-widest text-ink font-medium border border-ink bg-ink text-ivory px-3 py-1.5 hover:bg-gold-dark hover:border-gold-dark transition whitespace-nowrap"
                >
                  {group.parentName}
                </Link>
              ) : (
                <span className="text-xs uppercase tracking-widest text-ink-mute mr-2 whitespace-nowrap">
                  Filtrer par :
                </span>
              )}
              {group.children.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categorie/${c.slug}`}
                  className="text-xs uppercase tracking-widest text-ink-soft border border-line bg-ivory px-3 py-1.5 hover:border-gold hover:text-gold-dark transition whitespace-nowrap"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Produits */}
      <section className="container py-16 md:py-20">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <p className="text-sm text-ink-mute">
              {products.length > 0
                ? `${products.length} produit${products.length > 1 ? 's' : ''} disponible${products.length > 1 ? 's' : ''}`
                : 'Catalogue en cours d\'enrichissement'}
            </p>
          </div>
        </Reveal>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((p, i) => (
              <Reveal key={p._id} delay={Math.min(i, 8) * 50}>
                <ProductCard product={sanityToCard(p)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="bg-ivory-light border border-line p-10 md:p-16 text-center max-w-3xl mx-auto">
              <p className="eyebrow">Stock en constante évolution</p>
              <h2 className="font-serif text-2xl md:text-3xl text-ink mt-4">
                Le catalogue arrive bientôt
              </h2>
              <p className="text-ink-mute mt-4 leading-relaxed">
                Nous renouvelons notre stock chaque semaine. En attendant que
                tout soit listé en ligne, contactez-nous : nous avons sûrement
                ce que vous cherchez dans notre showroom d&apos;Aubagne.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/contact" className="btn-primary">
                  Nous contacter
                </Link>
                <a href="tel:+33676617053" className="btn-outline">
                  06 76 61 70 53
                </a>
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* CTA final */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-20 text-center max-w-3xl mx-auto">
          <p className="eyebrow text-gold">Vous ne trouvez pas votre bonheur ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            On a sûrement la pièce qu&apos;il vous faut
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/70 leading-relaxed">
            Notre stock dépasse souvent ce qui est listé en ligne. Décrivez-nous
            votre besoin et notre équipe vous propose les pièces disponibles
            sous 24 h.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Demander un devis sur-mesure
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <a href="tel:+33676617053" className="btn-outline-light">
              06 76 61 70 53
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
