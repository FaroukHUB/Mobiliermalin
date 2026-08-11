import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, ShieldCheck, Truck, Star, Sparkles, Award, TrendingUp } from 'lucide-react'
import { PortableText, type PortableTextBlock } from 'next-sanity'
import {
  CATEGORIES,
  getCategoryBySlug as getStaticCategory,
  getCategoryRelated,
} from '@/lib/categories-data'
import { Reveal } from '@/components/animations/Reveal'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { CategoryFAQ } from '@/components/category/CategoryFAQ'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { categoryBreadcrumb } from '@/lib/breadcrumbs'
import {
  getProductsByCategory,
  getProductsByCategoryDeep,
  getCategoryBySlugSanity,
  urlFor,
  type SanityProduct,
  type SanityCategory,
} from '@/lib/sanity'

// Icônes disponibles pour keyAdvantages
const ICON_MAP: Record<string, typeof ShieldCheck> = {
  ShieldCheck, Truck, Star, Sparkles, Award, TrendingUp, Check,
}

export const revalidate = 60
export const dynamicParams = true // accept slugs not in generateStaticParams

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export function generateStaticParams() {
  // Pré-rend les 7 catégories connues. Les nouvelles Sanity sont rendues à la demande.
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

type Params = { slug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const staticCat = getStaticCategory(slug)
  const sanityCat = await getCategoryBySlugSanity(slug)
  const name = sanityCat?.name || staticCat?.name
  if (!name) return { title: 'Catégorie introuvable' }

  // SEO O5 : si la catégorie est vide (aucun produit publié), on la
  // noindex pour éviter le thin content. `follow: true` préserve la
  // circulation du PageRank vers les catégories sœurs / hub / home.
  // React dédup automatiquement le fetch produits avec le composant.
  const hasChildren = (sanityCat?.children?.length ?? 0) > 0
  const products = hasChildren
    ? await getProductsByCategoryDeep(slug)
    : await getProductsByCategory(slug)
  const isEmpty = products.length === 0

  return {
    title: staticCat
      ? `${name} reconditionnés — ${staticCat.fromPriceLabel}`
      : `${name} — Catalogue`,
    description:
      sanityCat?.description ||
      staticCat?.shortTagline ||
      `${name} reconditionnés dans notre atelier local. Livraison France.`,
    alternates: { canonical: `/categorie/${slug}` },
    ...(isEmpty && {
      robots: { index: false, follow: true },
    }),
  }
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
    condition: p.condition,
    brandName: p.brand,
    imageUrl,
    imageAlt: firstImage?.alt || p.name,
    status: 'published',
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const staticData = getStaticCategory(slug)

  // Toujours essayer Sanity : sa description / image / variantes ont priorité sur le statique.
  const sanityCat: SanityCategory | null = await getCategoryBySlugSanity(slug)

  if (!staticData && !sanityCat) notFound()

  const hasChildren = (sanityCat?.children?.length ?? 0) > 0
  // Si la catégorie a des enfants → on agrège tous les produits des sous-catégories.
  // Sinon → on prend uniquement les produits attachés à cette catégorie.
  const [products, related] = await Promise.all([
    hasChildren ? getProductsByCategoryDeep(slug) : getProductsByCategory(slug),
    Promise.resolve(staticData ? getCategoryRelated(slug, 3) : []),
  ])

  // Merge : Sanity prioritaire (ce que le client a saisi), fallback sur le statique.
  // Si le client a écrit une description Sanity, on n'affiche plus le longDescription
  // hardcodé pour éviter la double description.
  const name = sanityCat?.name || staticData!.name
  const shortTagline = sanityCat?.description || staticData?.shortTagline || ''
  const longDescription = sanityCat?.description ? '' : staticData?.longDescription || ''
  const heroImage = sanityCat?.image
    ? urlFor(sanityCat.image).width(800).url()
    : staticData?.fallbackImage ||
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
  const heroImageAlt = sanityCat?.image?.alt || staticData?.fallbackImageAlt || name
  const fromPriceLabel = staticData?.fromPriceLabel || 'Découvrir'
  const variants =
    sanityCat?.variants && sanityCat.variants.length > 0
      ? sanityCat.variants
      : staticData?.variants || []

  // JSON-LD CollectionPage (page pilier) + ItemList produits.
  // FAQPage émis plus bas UNIQUEMENT si sanityCat.faq contient des questions
  // visibles dans l'UI (règle : jamais de FAQ balisée absente de la page).
  const collectionSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${siteUrl}/categorie/${slug}#collection`,
    name,
    ...(sanityCat?.description && { description: sanityCat.description }),
    url: `${siteUrl}/categorie/${slug}`,
    isPartOf: { '@id': `${siteUrl}/#website` },
  }
  if (products.length > 0) {
    collectionSchema.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}/produit/${p.slug.current}`,
      })),
    }
  }
  const faqSchema =
    sanityCat?.faq && sanityCat.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: sanityCat.faq.map((qa) => ({
            '@type': 'Question',
            name: qa.question,
            acceptedAnswer: { '@type': 'Answer', text: qa.answer },
          })),
        }
      : null

  // Nouveau hero image dédié pilier, fallback sur heroImage existant
  const pillarHeroImage = sanityCat?.heroImage
    ? urlFor(sanityCat.heroImage).width(2000).height(900).fit('crop').url()
    : null

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema ? [collectionSchema, faqSchema] : collectionSchema),
        }}
      />

      <Breadcrumbs
        items={categoryBreadcrumb({
          name,
          slug: { current: slug },
          parent: sanityCat?.parent
            ? { name: sanityCat.parent.name, slug: sanityCat.parent.slug }
            : null,
        })}
      />

      {/* Hero */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-8 md:py-14">
          <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16 items-center">
            <div>
              <p className="eyebrow">{fromPriceLabel}</p>
              <h1 className="text-display mt-3 font-serif leading-[1.05]">
                {name}
              </h1>
              <div className="gold-divider mx-0 mt-7" />
              {shortTagline && (
                <p className="mt-7 text-lg text-ink-soft leading-relaxed">
                  {shortTagline}.
                </p>
              )}
              {longDescription && longDescription !== shortTagline && (
                <p className="mt-4 text-ink-mute leading-relaxed">
                  {longDescription}
                </p>
              )}

              {variants.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs uppercase tracking-widest text-ink-mute mb-3">
                    Variantes disponibles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <span
                        key={v}
                        className="text-xs uppercase tracking-widest text-ink-mute border border-line bg-ivory-light px-3 py-1.5"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Reveal delay={150}>
              <div className="relative aspect-[4/5] bg-ivory-light overflow-hidden hidden lg:block">
                <Image
                  src={heroImage}
                  alt={heroImageAlt}
                  fill
                  sizes="400px"
                  className="object-cover"
                  priority
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Produits — juste sous le hero : on vend d'abord, on raconte ensuite */}
      <section className="container py-16 md:py-20">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="eyebrow">Notre sélection</p>
              <h2 className="font-serif text-h1 mt-2">
                {products.length > 0
                  ? `${products.length} ${products.length > 1 ? 'pièces disponibles' : 'pièce disponible'}`
                  : 'Pièces disponibles sur demande'}
              </h2>
            </div>
            <Link href="/contact" className="btn-outline">
              Demander un devis personnalisé
            </Link>
          </div>
        </Reveal>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((p, i) => (
              <Reveal key={p._id} delay={i * 50}>
                <ProductCard product={sanityToCard(p)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="bg-ivory-light border border-line p-10 md:p-16 text-center">
              <p className="font-serif text-2xl text-ink">
                Notre stock évolue chaque semaine
              </p>
              <p className="text-ink-mute mt-3 max-w-xl mx-auto leading-relaxed">
                Les pièces de cette catégorie ne sont pas encore listées en
                ligne, mais elles sont disponibles à notre showroom d&apos;Aubagne.
                Décrivez-nous votre besoin, nous revenons sous 24 h.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/contact" className="btn-primary">
                  Demander la disponibilité
                </Link>
                <a href="tel:+33676617053" className="btn-outline">
                  06 76 61 70 53
                </a>
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* ═════════════ SECTIONS PILIER (conditionnelles Sanity) ═════════════ */}

      {/* Hero image pilier */}
      {pillarHeroImage && (
        <section className="container max-w-6xl mt-10">
          <div className="relative aspect-[21/9] bg-ivory-dark overflow-hidden">
            <Image
              src={pillarHeroImage}
              alt={sanityCat?.heroImage?.alt || name}
              fill
              priority
              sizes="(min-width: 1024px) 1200px, 100vw"
              className="object-cover"
            />
          </div>
        </section>
      )}

      {/* Introduction pilier (contenu SEO riche) */}
      {sanityCat?.pillarIntro && Array.isArray(sanityCat.pillarIntro) && sanityCat.pillarIntro.length > 0 && (
        <section className="container py-12 md:py-16 max-w-3xl">
          <div className="prose prose-lg max-w-none text-ink-soft leading-relaxed">
            <PortableText value={sanityCat.pillarIntro as PortableTextBlock[]} />
          </div>
        </section>
      )}

      {/* Points clés (avantages) */}
      {sanityCat?.keyAdvantages && sanityCat.keyAdvantages.length > 0 && (
        <section className="bg-ivory-dark border-y border-line">
          <div className="container py-12 md:py-16 max-w-6xl">
            <div className={`grid gap-6 ${sanityCat.keyAdvantages.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {sanityCat.keyAdvantages.map((adv, i) => {
                const Icon = (adv.icon && ICON_MAP[adv.icon]) || Check
                return (
                  <div key={i} className="bg-ivory p-6 border border-line">
                    <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                    <h3 className="font-serif text-lg text-ink mt-4">
                      {adv.title}
                    </h3>
                    {adv.description && (
                      <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                        {adv.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Guide d'achat */}
      {sanityCat?.buyingGuide && Array.isArray(sanityCat.buyingGuide) && sanityCat.buyingGuide.length > 0 && (
        <section className="container py-14 md:py-20 max-w-3xl">
          <div className="text-center mb-10">
            <p className="eyebrow">Guide d'achat</p>
            <h2 className="text-h1 font-serif mt-3">
              Comment choisir votre {name.toLowerCase()}
            </h2>
            <div className="gold-divider mx-auto mt-6" />
          </div>
          <div className="prose prose-lg max-w-none text-ink-soft leading-relaxed">
            <PortableText value={sanityCat.buyingGuide as PortableTextBlock[]} />
          </div>
        </section>
      )}

      {/* Tableau comparatif */}
      {sanityCat?.comparisonRows && sanityCat.comparisonRows.length > 0 && (
        <section className="container py-14 md:py-20 max-w-5xl">
          <div className="text-center mb-10">
            <p className="eyebrow">Comparatif</p>
            <h2 className="text-h1 font-serif mt-3">Entrée de gamme, milieu ou premium ?</h2>
            <div className="gold-divider mx-auto mt-6" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-line">
              <thead className="bg-ink text-ivory">
                <tr>
                  <th className="text-left px-4 py-3 font-serif">Critère</th>
                  <th className="text-left px-4 py-3 font-serif">Entrée de gamme</th>
                  <th className="text-left px-4 py-3 font-serif">Milieu de gamme</th>
                  <th className="text-left px-4 py-3 font-serif">Haut de gamme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sanityCat.comparisonRows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-ivory' : 'bg-ivory-light'}>
                    <td className="px-4 py-3 font-medium text-ink">{row.criterion}</td>
                    <td className="px-4 py-3 text-ink-soft">{row.entryLevel || '—'}</td>
                    <td className="px-4 py-3 text-ink-soft">{row.midRange || '—'}</td>
                    <td className="px-4 py-3 text-ink-soft">{row.premium || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Erreurs fréquentes */}
      {sanityCat?.commonMistakes && sanityCat.commonMistakes.length > 0 && (
        <section className="bg-ivory-dark border-y border-line">
          <div className="container py-14 md:py-20 max-w-4xl">
            <div className="text-center mb-10">
              <p className="eyebrow">Erreurs fréquentes</p>
              <h2 className="text-h1 font-serif mt-3">Ce qu'il faut éviter</h2>
              <div className="gold-divider mx-auto mt-6" />
            </div>
            <div className="space-y-4">
              {sanityCat.commonMistakes.map((m, i) => (
                <div key={i} className="bg-ivory border-l-4 border-gold p-5">
                  <p className="font-serif text-lg text-ink">
                    <span className="text-gold-dark uppercase text-xs tracking-widest font-medium mr-2">
                      ❌
                    </span>
                    {m.mistake}
                  </p>
                  {m.solution && (
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed pl-5">
                      <span className="text-green-700 font-medium">✓ </span>
                      {m.solution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sous-catégories (si la catégorie est un parent) */}
      {hasChildren && (
        <section className="container py-12 md:py-16 border-b border-line">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="eyebrow">Explorer</p>
              <h2 className="font-serif text-h1 mt-2">Sous-catégories</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {sanityCat!.children!.map((child, i) => {
              const childImage = child.image
                ? urlFor(child.image).width(900).height(1200).fit('crop').url()
                : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80'
              return (
                <Reveal key={child._id} delay={i * 60}>
                  <Link
                    href={`/categorie/${child.slug.current}`}
                    className="group block bg-ivory-light border border-line hover:border-gold transition-colors duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden bg-ivory-dark">
                      <Image
                        src={childImage}
                        alt={child.image?.alt || child.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[0.7rem] uppercase tracking-widest text-gold-dark font-medium">
                        Découvrir
                      </p>
                      <h3 className="font-serif text-lg md:text-xl text-ink mt-1.5 leading-tight">
                        {child.name}
                      </h3>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </section>
      )}

      {/* Highlights — seulement si on a des données statiques riches */}
      {staticData && staticData.highlights.length > 0 && (
        <section className="bg-ivory-dark border-y border-line">
          <div className="container py-16 md:py-20">
            <Reveal>
              <div className="max-w-2xl mb-10">
                <p className="eyebrow">Notre exigence</p>
                <h2 className="text-h1 mt-2 font-serif">
                  Ce qui distingue nos {name.toLowerCase()}
                </h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
              {staticData.highlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 80}>
                  <div className="bg-ivory-light p-7 md:p-9 h-full">
                    <Check className="h-6 w-6 text-gold" strokeWidth={1.5} />
                    <h3 className="font-serif text-xl text-ink mt-5 leading-tight">
                      {h.title}
                    </h3>
                    <p className="text-sm text-ink-soft mt-3 leading-relaxed">
                      {h.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Landing nationale liée à la catégorie (maillage vers pages "hub" nationales) */}
      {(slug === 'fauteuil' || slug === 'fauteuils-ergonomiques') && (
        <section className="container py-6 max-w-4xl">
          <Link
            href="/fauteuil-ergonomique"
            className="group flex items-center justify-between gap-4 p-4 md:p-5 bg-ivory-light border border-line hover:border-gold transition-colors"
          >
            <span className="text-sm md:text-base text-ink font-medium">
              Découvrir notre sélection nationale de fauteuils ergonomiques
            </span>
            <ArrowRight
              className="h-4 w-4 text-gold shrink-0 group-hover:translate-x-1 transition-transform"
              strokeWidth={1.5}
            />
          </Link>
        </section>
      )}
      {slug === 'bureau' && (
        <section className="container py-6 max-w-4xl">
          <Link
            href="/bureau-professionnel-occasion"
            className="group flex items-center justify-between gap-4 p-4 md:p-5 bg-ivory-light border border-line hover:border-gold transition-colors"
          >
            <span className="text-sm md:text-base text-ink font-medium">
              Découvrir notre sélection nationale de bureaux professionnels d'occasion
            </span>
            <ArrowRight
              className="h-4 w-4 text-gold shrink-0 group-hover:translate-x-1 transition-transform"
              strokeWidth={1.5}
            />
          </Link>
        </section>
      )}

      {/* Cocon éditorial : clusters de guides liés à cette catégorie */}
      {sanityCat?.relatedGuideClusters && sanityCat.relatedGuideClusters.length > 0 && (
        <section className="container py-14 md:py-20 max-w-5xl">
          <div className="text-center mb-10">
            <p className="eyebrow">Approfondir</p>
            <h2 className="text-h1 font-serif mt-3">Nos guides sur le sujet</h2>
            <div className="gold-divider mx-auto mt-6" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sanityCat.relatedGuideClusters.map((c) => (
              <Link
                key={c._id}
                href={`/guides/${c.slug.current}`}
                className="group block bg-ivory border border-line hover:border-gold p-5 transition-colors"
              >
                <p className="eyebrow text-gold-dark">Cluster</p>
                <h3 className="font-serif text-lg text-ink mt-2 group-hover:text-gold-dark transition-colors">
                  {c.name}
                </h3>
                {c.tagline && (
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-2">
                    {c.tagline}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-gold-dark font-medium">
                  Voir les guides
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ — priorité : (1) Sanity pilier, (2) statique riche, (3) fallback générique */}
      {sanityCat?.faq && sanityCat.faq.length > 0 ? (
        <section className="container py-16 md:py-20 max-w-3xl">
          <div className="text-center mb-10">
            <p className="eyebrow">Questions fréquentes</p>
            <h2 className="text-h1 mt-2 font-serif">À propos des {name.toLowerCase()}</h2>
          </div>
          <div className="space-y-3">
            {sanityCat.faq.map((qa, i) => (
              <details key={i} className="group bg-ivory-light border border-line">
                <summary className="cursor-pointer p-5 md:p-6 flex items-center justify-between gap-4 list-none">
                  <span className="font-serif text-base md:text-lg text-ink leading-snug">
                    {qa.question}
                  </span>
                  <span className="text-gold text-2xl transition-transform group-open:rotate-45 leading-none shrink-0">
                    +
                  </span>
                </summary>
                <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-ink-soft leading-relaxed whitespace-pre-line">
                  {qa.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      ) : staticData && staticData.faq.length > 0 ? (
        <section className="container py-16 md:py-20 max-w-3xl">
          <Reveal>
            <div className="text-center mb-10">
              <p className="eyebrow">Questions fréquentes</p>
              <h2 className="text-h1 mt-2 font-serif">À propos de cette catégorie</h2>
            </div>
          </Reveal>
          <div className="space-y-3">
            {staticData.faq.map((item, i) => (
              <Reveal key={item.q} delay={i * 50}>
                <details className="group bg-ivory-light border border-line">
                  <summary className="cursor-pointer p-5 md:p-6 flex items-center justify-between gap-4 list-none">
                    <span className="font-serif text-base md:text-lg text-ink leading-snug">
                      {item.q}
                    </span>
                    <span className="text-gold text-2xl transition-transform group-open:rotate-45 leading-none shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-ink-soft leading-relaxed">
                    {item.a}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      ) : (
        <CategoryFAQ
          categoryName={name}
          fromPriceLabel={fromPriceLabel !== 'Découvrir' ? fromPriceLabel : undefined}
          productCount={products.length}
        />
      )}

      {related.length > 0 && (
        <section className="bg-ivory-dark border-t border-line">
          <div className="container py-16 md:py-20">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="eyebrow">Découvrez aussi</p>
                <h2 className="text-h1 mt-2 font-serif">D&apos;autres univers</h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((c, i) => (
                <Reveal key={c.slug} delay={i * 80}>
                  <Link
                    href={`/categorie/${c.slug}`}
                    className="group block bg-ivory-light border border-line hover:border-gold transition"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-ivory-dark">
                      <Image
                        src={c.fallbackImage}
                        alt={c.fallbackImageAlt}
                        fill
                        sizes="(min-width: 640px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[0.65rem] uppercase tracking-widest text-gold-dark">
                        {c.fromPriceLabel}
                      </p>
                      <h3 className="font-serif text-lg text-ink mt-1.5 group-hover:text-gold-dark transition">
                        {c.name}
                      </h3>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-20 text-center max-w-3xl mx-auto">
          <p className="eyebrow text-gold">Besoin d&apos;un conseil ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Visite gratuite, devis sous 24 h
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/70 leading-relaxed">
            Notre équipe vous aide à choisir le bon produit, à composer un poste
            de travail complet, ou à équiper plusieurs salariés à la fois.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Demander un devis
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
