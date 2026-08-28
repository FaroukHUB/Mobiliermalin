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
const pageUrl = `${siteUrl}/marques/steelcase`

export const metadata: Metadata = {
  title: 'Steelcase reconditionné : Leap V2, Think, Series 1, Gesture, Migration',
  description:
    "Mobilier Steelcase reconditionné dans notre atelier : fauteuils Leap V2, Think, Series 1, Gesture, bureaux Migration Bench, rangements Universal. Livraison France.",
  keywords: [
    'Steelcase',
    'Steelcase reconditionné',
    'Steelcase occasion',
    'Leap V2 occasion',
    'Steelcase Think',
    'Steelcase Series 1',
    'Steelcase Gesture',
    'Migration Bench',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Steelcase reconditionné — Mobilier Malin',
    description:
      'Sélection de mobilier Steelcase reconditionné : fauteuils, bureaux, rangements.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Marque professionnelle emblématique',
  heroTitle: 'Steelcase reconditionné : la valeur sûre du mobilier pro depuis 1912',
  heroIntro:
    'Fauteuils Leap V2, Think, Series 1, Gesture, bureaux Migration Bench et solutions Universal. Une gamme professionnelle conçue pour un usage intensif, disponible en reconditionné avec livraison France.',
}

const FALLBACK_FAQ = [
  {
    question: 'Où est fabriqué le mobilier Steelcase vendu en France ?',
    answer:
      "Steelcase dispose d'une filière européenne héritée du rapprochement avec le groupe allemand Werndl à la fin des années 1990. Une partie du mobilier vendu en Europe est fabriquée sur des sites européens.",
  },
  {
    question: "Comment savoir de quelle année est un Steelcase reconditionné ?",
    answer:
      "Chaque pièce Steelcase porte un numéro de série qui permet de retracer son année de fabrication auprès du service client de la marque.",
  },
]

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
    stock: p.stock,
    createdAt: p._createdAt,
  }
}

export default async function MarqueSteelcasePage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('marques-steelcase'),
    getProductsByBrand('Steelcase'),
  ])
  const productCards = products.slice(0, 8).map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage
    ? urlFor(landing.heroImage).width(1600).url()
    : undefined
  const officialUrl = BRAND_OFFICIAL_URL['Steelcase']

  const schemas = [
    buildArticleSchema({
      pageUrl,
      headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt,
      lastUpdated: landing?.lastUpdated,
      heroImageUrl,
    }),
    buildBreadcrumbSchema({
      siteUrl,
      items: [
        { name: 'Marques', href: '/marques' },
        { name: 'Steelcase', href: '/marques/steelcase' },
      ],
    }),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#collection`,
      name: 'Mobilier Steelcase reconditionné',
      url: pageUrl,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: {
        '@type': 'Brand',
        name: 'Steelcase',
        ...(officialUrl && { sameAs: officialUrl }),
      },
      ...(productCards.length > 0 && {
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: productCards.length,
          itemListElement: products.slice(0, 8).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${siteUrl}/produit/${p.slug.current}`,
          })),
        },
      }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({
        '@type': 'Question',
        name: qa.question,
        acceptedAnswer: { '@type': 'Answer', text: qa.answer },
      })),
    },
    buildAggregateOfferSchema({ pageUrl, name: 'Mobilier Steelcase reconditionné', rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire Steelcase', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { label: 'Steelcase, une entreprise centenaire : les repères essentiels' },
    { label: 'Pourquoi le mobilier Steelcase est-il aussi recherché en reconditionné ?' },
    { label: 'Quels sont les fauteuils Steelcase les plus emblématiques ?' },
    { label: 'Bureaux et solutions Steelcase : la gamme workspace' },
    { label: "Comment reconnaître un vrai Steelcase d'une copie ?" },
    { label: 'Notre process de reconditionnement, spécifique aux Steelcase' },
    { label: 'Comparatif Steelcase, Herman Miller, Haworth : qui choisir ?' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <NationalPageV2
        landing={landing}
        fallback={FALLBACK}
        breadcrumb={[
          { name: 'Marques', href: '/marques' },
          { name: 'Steelcase' },
        ]}
        ctas={[
          { label: 'Voir la sélection Steelcase', href: '/boutique' },
          { label: 'Rechercher un modèle', href: '/contact', variant: 'outline' },
        ]}
        products={productCards}
        productsCtaHref="/boutique"
        productsTitle="Notre sélection Steelcase reconditionnée"
        toc={toc}
        relatedLinks={[
          { href: '/steelcase-leap-v2-occasion', label: 'Le Leap V2 en détail : guide d\'achat occasion', eyebrow: 'Modèle star' },
          { href: '/fauteuil-ergonomique', label: 'Tous les fauteuils ergonomiques (Leap, Aeron, Zody…)', eyebrow: 'Sélection' },
          { href: '/marques/herman-miller', label: 'La marque Herman Miller (Aeron)', eyebrow: 'Marque' },
          { href: '/marques/haworth', label: 'La marque Haworth (Zody)', eyebrow: 'Marque' },
          { href: '/marques/vitra', label: 'La marque Vitra (Physix)', eyebrow: 'Marque' },
          { href: '/bureau-professionnel-occasion', label: "Bureaux professionnels d'occasion", eyebrow: 'Sélection' },
          { href: '/mobilier-de-bureau-occasion', label: "L'univers complet du mobilier occasion", eyebrow: 'HUB' },
          { href: '/guides/ergonomie/fauteuil-de-bureau-ergonomique-mal-de-dos', label: 'Choisir son fauteuil quand on a mal au dos', eyebrow: 'Guide' },
          { href: '/notre-demarche', label: 'Notre atelier et notre démarche', eyebrow: 'À propos' },
          { href: '/bureau-occasion-marseille', label: 'Retrait ou livraison à Marseille', eyebrow: 'Local' },
        ]}
      />

      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">
          Ce que vous devez savoir sur les Steelcase reconditionnés
        </h2>
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
