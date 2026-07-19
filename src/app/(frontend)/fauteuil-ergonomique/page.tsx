import type { Metadata } from 'next'
import { NationalPageV2 } from '@/components/national/NationalPageV2'
import {
  getProductsByCategoryDeep,
  getNationalLandingByKey,
  urlFor,
  type SanityProduct,
} from '@/lib/sanity'
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
const pageUrl = `${siteUrl}/fauteuil-ergonomique`

export const metadata: Metadata = {
  title: 'Fauteuil ergonomique reconditionné : Steelcase, Herman Miller, Vitra',
  description:
    "Sélection nationale de fauteuils ergonomiques reconditionnés Steelcase Leap V2, Herman Miller Aeron, Haworth Zody, Vitra Physix. Livraison France, garantie, essai showroom.",
  keywords: [
    'fauteuil ergonomique',
    'fauteuil ergonomique reconditionné',
    'fauteuil ergonomique occasion',
    'fauteuil de bureau ergonomique',
    'chaise ergonomique',
    'siège ergonomique bureau',
    'Steelcase Leap V2',
    'Herman Miller Aeron',
    'Haworth Zody',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Fauteuil ergonomique reconditionné : Steelcase, Aeron, Vitra',
    description:
      "Sélection de fauteuils ergonomiques Steelcase, Herman Miller, Vitra, Haworth reconditionnés dans notre atelier local. Livraison France entière.",
    url: pageUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fauteuil ergonomique reconditionné',
    description:
      'Sélection nationale : Leap V2, Aeron, Zody, Physix. Livraison France.',
  },
}

const FALLBACK = {
  heroEyebrow: 'Sélection nationale reconditionnée',
  heroTitle: 'Fauteuil ergonomique reconditionné',
  heroIntro:
    "Une sélection de fauteuils ergonomiques professionnels remis en état dans notre atelier. Modèles Steelcase, Herman Miller, Haworth, Vitra, conçus pour un usage quotidien intensif.",
}

const FALLBACK_FAQ = [
  {
    question: "Qu'est-ce qui rend un fauteuil de bureau vraiment ergonomique ?",
    answer:
      "Un fauteuil ergonomique offre au minimum cinq réglages indépendants : hauteur d'assise, profondeur d'assise, soutien lombaire, hauteur des accoudoirs et tension du basculement. Ces réglages permettent d'adapter le siège à la morphologie de l'utilisateur et à la durée d'utilisation.",
  },
  {
    question: 'Un fauteuil ergonomique reconditionné vaut-il un modèle neuf ?',
    answer:
      'Pour les grandes marques professionnelles (Steelcase, Herman Miller, Vitra, Haworth), oui, à condition que le fauteuil ait été correctement remis en état. Les pièces d\'usure remplacées suffisent à restaurer une durée de vie de 10 à 15 ans en usage quotidien.',
  },
  {
    question: 'Livrez-vous partout en France ?',
    answer:
      'Livraison régulière dans toute la région PACA. Pour le reste de la France métropolitaine, expédition sur devis en fonction du volume et de la zone.',
  },
]

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

export default async function FauteuilErgonomiquePage() {
  const [landing, primaryProducts] = await Promise.all([
    getNationalLandingByKey('fauteuil-ergonomique'),
    getProductsByCategoryDeep('fauteuils-ergonomiques'),
  ])
  const products =
    primaryProducts.length > 0
      ? primaryProducts
      : await getProductsByCategoryDeep('fauteuil')
  const productCards = products.slice(0, 8).map(sanityToCard)

  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage
    ? urlFor(landing.heroImage).width(1600).url()
    : undefined

  const articleSchema = buildArticleSchema({
    pageUrl,
    headline:
      landing?.heroTitle || 'Fauteuil ergonomique reconditionné',
    description:
      landing?.seo?.metaDescription ||
      landing?.heroIntro ||
      FALLBACK.heroIntro,
    author: landing?.author || 'Équipe Mobilier Malin',
    publishedAt: landing?.publishedAt,
    lastUpdated: landing?.lastUpdated,
    heroImageUrl,
  })
  const breadcrumbSchema = buildBreadcrumbSchema({
    siteUrl,
    items: [{ name: 'Fauteuil ergonomique', href: '/fauteuil-ergonomique' }],
  })
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: { '@type': 'Answer', text: qa.answer },
    })),
  }
  const collectionSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name: 'Fauteuils ergonomiques reconditionnés',
    url: pageUrl,
    isPartOf: { '@id': `${siteUrl}/#website` },
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
  }
  const offerSchema = buildAggregateOfferSchema({
    pageUrl,
    name: 'Fauteuils ergonomiques reconditionnés',
    rows: landing?.pricingRanges || [],
  })
  const glossarySchema = buildDefinedTermSetSchema({
    pageUrl,
    name: 'Glossaire ergonomie du siège',
    terms: landing?.glossary || [],
  })
  const videoSchema = buildVideoObjectSchema(landing?.videoEmbed)

  const schemas = [
    articleSchema,
    breadcrumbSchema,
    collectionSchema,
    faqSchema,
    offerSchema,
    glossarySchema,
    videoSchema,
  ].filter(Boolean)

  const toc = [
    { id: 'reglages', label: "Qu'est-ce qui définit un fauteuil vraiment ergonomique ?" },
    { id: 'reconditionne', label: 'Pourquoi passer au reconditionné plutôt qu\'au neuf ?' },
    { id: 'modeles', label: 'Quels sont les modèles pros reconnus par les ergonomes ?' },
    { id: 'qualite', label: 'Comment vérifier la qualité d\'un fauteuil reconditionné ?' },
    { id: 'morphologie', label: 'Quel fauteuil choisir selon votre morphologie et votre usage ?' },
    { id: 'process', label: 'Notre process de remise en état, étape par étape' },
    { id: 'livraison', label: 'Livraison, essai, garantie : ce qu\'il faut savoir' },
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
        breadcrumb={[{ name: 'Fauteuil ergonomique' }]}
        ctas={[
          { label: 'Voir la sélection', href: '/categorie/fauteuil' },
          { label: 'Demander conseil', href: '/contact', variant: 'outline' },
        ]}
        products={productCards}
        productsCtaHref="/categorie/fauteuil"
        productsTitle="Nos fauteuils ergonomiques en stock"
        toc={toc}
        relatedLinks={[
          { href: '/guides/ergonomie/fauteuil-de-bureau-ergonomique-mal-de-dos', label: 'Choisir un fauteuil quand on a mal au dos', eyebrow: 'Guide' },
          { href: '/guides/ergonomie/chaise-gaming-vs-chaise-ergonomique', label: 'Chaise gaming vs chaise ergonomique', eyebrow: 'Guide' },
          { href: '/bureau-professionnel-occasion', label: 'Bureau professionnel d\'occasion', eyebrow: 'Sélection' },
          { href: '/bureau-assis-debout-occasion', label: 'Bureau assis-debout d\'occasion', eyebrow: 'Sélection' },
          { href: '/marques/steelcase', label: 'La marque Steelcase (Leap, Gesture, Series 1)', eyebrow: 'Marque' },
          { href: '/bureau-occasion-marseille', label: 'Mobilier de bureau à Marseille', eyebrow: 'Livraison locale' },
        ]}
      />

      {/* FAQ rendue en HTML pour être visible (FAQ JSON-LD ci-dessus) */}
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">
          Vous vous posez ces questions ? Voici nos réponses.
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
