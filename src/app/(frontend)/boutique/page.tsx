import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { getAllProducts, getAllCategories, urlFor, type SanityProduct, type SanityCategory } from '@/lib/sanity'
import { CATEGORIES as STATIC_CATEGORIES } from '@/lib/categories-data'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Boutique — Catalogue de mobilier de bureau reconditionné',
  description:
    'Découvrez tout notre catalogue de mobilier de bureau premium reconditionné : bureaux, fauteuils, armoires, tables de réunion, caissons. Marques Steelcase, Herman Miller, Haworth, Vitra, préparés dans notre atelier local.',
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

type SortKey = 'recent' | 'price-asc' | 'price-desc'

/** Prix effectivement payé : le soldé s'il est actif, sinon le prix. */
function effectivePrice(p: SanityProduct): number {
  return p.salePrice && p.salePrice < p.price ? p.salePrice : p.price
}

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tri?: string; marque?: string; budget?: string }>
}) {
  const params = await searchParams
  const [allProducts, sanityCategories] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ])

  // ── Filtres appliqués sur le catalogue ──
  const search = (params.q || '').trim().toLowerCase()
  const brandFilter = (params.marque || '').trim()
  const budget = (params.budget || '').trim()
  const sort: SortKey =
    params.tri === 'price-asc' || params.tri === 'price-desc'
      ? params.tri
      : 'recent'

  // Marques réellement présentes au catalogue, pour ne proposer que
  // des filtres qui donnent des résultats.
  const availableBrands = [
    ...new Set(allProducts.map((p) => p.brand).filter(Boolean) as string[]),
  ].sort((a, b) => a.localeCompare(b, 'fr'))

  let products = allProducts
  if (search) {
    products = products.filter((p) =>
      [p.name, p.brand, p.shortDescription]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(search)),
    )
  }
  if (brandFilter) {
    products = products.filter((p) => p.brand === brandFilter)
  }
  if (budget === '-100') {
    products = products.filter((p) => effectivePrice(p) < 100)
  } else if (budget === '100-200') {
    const inRange = (v: number) => v >= 100 && v <= 200
    products = products.filter((p) => inRange(effectivePrice(p)))
  } else if (budget === '200+') {
    products = products.filter((p) => effectivePrice(p) > 200)
  }

  if (sort === 'price-asc') {
    products = [...products].sort((a, b) => effectivePrice(a) - effectivePrice(b))
  } else if (sort === 'price-desc') {
    products = [...products].sort((a, b) => effectivePrice(b) - effectivePrice(a))
  }

  // Conserve les filtres actifs quand on change un seul critère
  const buildHref = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams()
    const merged = {
      q: params.q,
      tri: params.tri,
      marque: params.marque,
      budget: params.budget,
      ...patch,
    }
    for (const [k, v] of Object.entries(merged)) {
      if (v) next.set(k, v)
    }
    const qs = next.toString()
    return qs ? `/boutique?${qs}` : '/boutique'
  }

  const hasActiveFilter = !!(search || brandFilter || budget || params.tri)

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
      <Breadcrumbs items={[{ name: 'Boutique' }]} />

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
      {/* Tri, budget et marque — l'état est dans l'URL, donc partageable
          et indexable proprement */}
      <section className="border-b border-line bg-ivory">
        <div className="container py-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.65rem] uppercase tracking-widest text-ink-mute mr-1">
              Trier
            </span>
            {(
              [
                { key: 'recent', label: 'Nouveautés' },
                { key: 'price-asc', label: 'Prix croissant' },
                { key: 'price-desc', label: 'Prix décroissant' },
              ] as const
            ).map((opt) => {
              const active = sort === opt.key
              return (
                <Link
                  key={opt.key}
                  href={buildHref({ tri: opt.key === 'recent' ? undefined : opt.key })}
                  className={`border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? 'border-ink bg-ink text-ivory'
                      : 'border-line bg-ivory-light text-ink-soft hover:border-gold'
                  }`}
                >
                  {opt.label}
                </Link>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.65rem] uppercase tracking-widest text-ink-mute mr-1">
              Budget
            </span>
            {(
              [
                { key: '-100', label: 'Moins de 100 €' },
                { key: '100-200', label: '100 à 200 €' },
                { key: '200+', label: 'Plus de 200 €' },
              ] as const
            ).map((opt) => {
              const active = budget === opt.key
              return (
                <Link
                  key={opt.key}
                  href={buildHref({ budget: active ? undefined : opt.key })}
                  className={`border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? 'border-gold bg-gold/10 text-gold-dark font-medium'
                      : 'border-line bg-ivory-light text-ink-soft hover:border-gold'
                  }`}
                >
                  {opt.label}
                </Link>
              )
            })}
          </div>

          {availableBrands.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.65rem] uppercase tracking-widest text-ink-mute mr-1">
                Marque
              </span>
              {availableBrands.slice(0, 8).map((b) => {
                const active = brandFilter === b
                return (
                  <Link
                    key={b}
                    href={buildHref({ marque: active ? undefined : b })}
                    className={`border px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? 'border-gold bg-gold/10 text-gold-dark font-medium'
                        : 'border-line bg-ivory-light text-ink-soft hover:border-gold'
                    }`}
                  >
                    {b}
                  </Link>
                )
              })}
            </div>
          )}

          {hasActiveFilter && (
            <Link
              href="/boutique"
              className="ml-auto text-xs uppercase tracking-widest text-gold-dark underline underline-offset-4"
            >
              Tout effacer
            </Link>
          )}
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <p className="text-sm text-ink-mute">
              {search && (
                <>
                  Résultats pour «&nbsp;<strong className="text-ink">{search}</strong>&nbsp;» ·{' '}
                </>
              )}
              {products.length > 0
                ? `${products.length} produit${products.length > 1 ? 's' : ''} disponible${products.length > 1 ? 's' : ''}`
                : hasActiveFilter
                  ? 'Aucun produit ne correspond'
                  : 'Catalogue en cours d\'enrichissement'}
            </p>
          </div>
        </Reveal>

        {products.length === 0 && hasActiveFilter && (
          <Reveal>
            <div className="bg-ivory-light border border-line p-10 text-center max-w-2xl mx-auto">
              <p className="font-serif text-2xl text-ink">
                Rien ne correspond à cette recherche
              </p>
              <p className="text-ink-mute mt-3 leading-relaxed">
                Notre stock se renouvelle chaque semaine et tout n&apos;est pas
                toujours en ligne. Dites-nous ce que vous cherchez, nous vous
                répondons sous 24 h.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/contact" className="btn-primary">
                  Décrire ma recherche
                </Link>
                <Link href="/boutique" className="btn-outline">
                  Voir tout le catalogue
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((p, i) => (
              <Reveal key={p._id} delay={Math.min(i, 8) * 50}>
                <ProductCard product={sanityToCard(p)} />
              </Reveal>
            ))}
          </div>
        ) : hasActiveFilter ? null : (
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
