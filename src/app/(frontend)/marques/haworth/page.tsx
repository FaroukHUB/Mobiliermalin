import type { Metadata } from 'next'
import { NationalPageV2 } from '@/components/national/NationalPageV2'
import {
  getProductsByBrand,
  getNationalLandingByKey,
  urlFor,
  type SanityProduct,
} from '@/lib/sanity'
import { BRAND_OFFICIAL_URL } from '@/lib/schema-mappings'
import {
  buildArticleSchema,
  buildAggregateOfferSchema,
  buildBreadcrumbSchema,
  buildDefinedTermSetSchema,
  buildVideoObjectSchema,
} from '@/lib/national-schema'
import type { ProductCardData } from '@/components/product/ProductCard'

export const revalidate = 3600
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'
const pageUrl = `${siteUrl}/marques/haworth`

export const metadata: Metadata = {
  title: 'Haworth reconditionné : Zody, Fern, Comforto d\'occasion',
  description:
    "Fauteuils Haworth reconditionnés : Zody (système PAL), Fern, gammes Comforto. Le géant discret du mobilier pro, remis en état en atelier. Livraison France.",
  keywords: [
    'Haworth',
    'Haworth occasion',
    'Haworth Zody occasion',
    'Zody reconditionné',
    'Haworth Fern',
    'Comforto occasion',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Haworth reconditionné — Mobilier Malin',
    description: 'Zody, Fern et Comforto reconditionnés en atelier. Livraison France.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Le géant discret du mobilier pro',
  heroTitle: 'Haworth reconditionné : la qualité des grands, au prix du discret',
  heroIntro:
    "Fauteuils Haworth remis en état dans notre atelier : Zody et son soutien lombaire PAL plébiscité par les utilisateurs sensibles du dos, Fern, gammes Comforto. Moins connu du grand public que Steelcase ou Herman Miller, donc souvent mieux valorisé en occasion. Livraison France.",
}

const FALLBACK_FAQ = [
  {
    question: 'Pourquoi Haworth est-il moins connu que Steelcase ou Herman Miller ?',
    answer:
      "Haworth vend historiquement en direct aux grandes entreprises, sans la présence grand public de ses concurrents. Résultat : une notoriété moindre, mais une qualité de fabrication comparable, et des prix d'occasion souvent plus doux à qualité égale.",
  },
  {
    question: "Qu'est-ce que le système PAL du Zody ?",
    answer:
      "PAL (Pelvic and Lumbar support) est le soutien breveté du Zody : deux réglages indépendants pour le bassin et les lombaires, ajustables de chaque côté. C'est ce qui rend le Zody particulièrement apprécié des utilisateurs qui souffrent du bas du dos.",
  },
  {
    question: 'Que valent les gammes Comforto ?',
    answer:
      "Comforto est la filière allemande historique de Haworth en Europe : des fauteuils robustes très présents dans les administrations et grandes entreprises européennes. En occasion, c'est un excellent rapport qualité/prix pour équiper des postes en volume.",
  },
]

function sanityToCard(p: SanityProduct): ProductCardData {
  const firstImage = p.images?.[0]
  const imageUrl = firstImage?.asset ? urlFor(firstImage).width(900).height(1200).fit('crop').url() : undefined
  return {
    id: p._id, slug: p.slug.current, title: p.name, shortDescription: p.shortDescription,
    price: p.price, salePrice: p.salePrice, comparePrice: p.comparePrice, condition: p.condition,
    brandName: p.brand, imageUrl, imageAlt: firstImage?.alt || p.name, status: 'published',
  }
}

export default async function MarqueHaworthPage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('marques-haworth'),
    getProductsByBrand('Haworth'),
  ])
  const productCards = products.slice(0, 8).map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage ? urlFor(landing.heroImage).width(1600).url() : undefined
  const officialUrl = BRAND_OFFICIAL_URL['Haworth']

  const schemas = [
    buildArticleSchema({ pageUrl, headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt, lastUpdated: landing?.lastUpdated, heroImageUrl }),
    buildBreadcrumbSchema({ siteUrl, items: [
      { name: 'Marques', href: '/marques' },
      { name: 'Haworth', href: '/marques/haworth' },
    ] }),
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: 'Mobilier Haworth reconditionné', url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@type': 'Brand', name: 'Haworth', ...(officialUrl && { sameAs: officialUrl }) },
      ...(productCards.length > 0 && {
        mainEntity: {
          '@type': 'ItemList', numberOfItems: productCards.length,
          itemListElement: products.slice(0, 8).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/produit/${p.slug.current}` })),
        },
      }),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: 'Fauteuils Haworth reconditionnés', rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire Haworth', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { label: 'Haworth, le géant discret du mobilier de bureau' },
    { label: 'Le Zody : le fauteuil validé par les ergonomes' },
    { label: 'Quels autres modèles Haworth en occasion (Fern, Comforto) ?' },
    { label: 'Pourquoi Haworth est-il un excellent plan en reconditionné ?' },
    { label: 'Comment authentifier un Haworth ?' },
    { label: 'Haworth, Steelcase ou Herman Miller : le match' },
    { label: 'Prix constatés et disponibilités' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[
          { name: 'Marques', href: '/marques' },
          { name: 'Haworth' },
        ]}
        ctas={[
          { label: 'Voir les Haworth en stock', href: '/boutique' },
          { label: 'Rechercher un modèle', href: '/contact', variant: 'outline' },
        ]}
        products={productCards} productsCtaHref="/boutique"
        productsTitle="Notre sélection Haworth"
        toc={toc}
        relatedLinks={[
          { href: '/fauteuil-ergonomique', label: 'Tous les fauteuils ergonomiques reconditionnés', eyebrow: 'Sélection' },
          { href: '/guides/ergonomie/fauteuil-de-bureau-ergonomique-mal-de-dos', label: 'Choisir son fauteuil quand on a mal au dos', eyebrow: 'Guide' },
          { href: '/marques/steelcase', label: 'La marque Steelcase', eyebrow: 'Marque' },
          { href: '/marques/herman-miller', label: 'La marque Herman Miller (Aeron)', eyebrow: 'Marque' },
          { href: '/marques/vitra', label: 'La marque Vitra', eyebrow: 'Marque' },
          { href: '/mobilier-de-bureau-occasion', label: "L'univers complet du mobilier occasion", eyebrow: 'HUB' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">Ce qu&apos;on nous demande sur Haworth</h2>
        <div className="h-px w-16 bg-gold mb-8" />
        <dl className="space-y-6">
          {faq.map((qa, i) => (
            <div key={i} className="border-b border-line pb-6 last:border-0">
              <dt className="font-serif text-lg text-ink mb-2">{qa.question}</dt>
              <dd className="text-ink-soft leading-relaxed">{qa.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  )
}
