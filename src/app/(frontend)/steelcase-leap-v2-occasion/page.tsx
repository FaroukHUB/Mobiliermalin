import type { Metadata } from 'next'
import { NationalPageV2 } from '@/components/national/NationalPageV2'
import {
  searchProductsByName,
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
const pageUrl = `${siteUrl}/steelcase-leap-v2-occasion`

export const metadata: Metadata = {
  title: 'Steelcase Leap V2 d\'occasion : le fauteuil référence, reconditionné',
  description:
    "Steelcase Leap V2 reconditionné en atelier : dossier LiveBack, 7 réglages, certifié 180 kg. Guide complet d'achat d'occasion, prix, contrôles. Livraison France.",
  keywords: [
    'Steelcase Leap V2',
    'Leap V2 occasion',
    'Steelcase Leap V2 reconditionné',
    'Leap V2 prix',
    'fauteuil Leap occasion',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Steelcase Leap V2 d'occasion — Mobilier Malin",
    description: 'Le fauteuil référence des ergonomes, reconditionné en atelier. Livraison France.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Le fauteuil référence des ergonomes',
  heroTitle: "Steelcase Leap V2 d'occasion : la référence mondiale, reconditionnée en atelier",
  heroIntro:
    "Le Leap V2 est probablement le fauteuil de bureau professionnel le plus vendu au monde : dossier LiveBack qui épouse le dos, sept réglages, certification jusqu'à 180 kg. Reconditionné dans notre atelier avec pièces d'usure remplacées, il offre dix ans d'usage pour un tiers du prix neuf.",
}

const FALLBACK_FAQ = [
  {
    question: "Combien coûte un Leap V2 d'occasion ?",
    answer:
      "Comptez 400 à 650 € en reconditionné selon l'état, le revêtement (tissu ou cuir) et les options, contre 1300 à 1700 € neuf. Les exemplaires avec repose-tête ou sellerie cuir se négocient en haut de fourchette.",
  },
  {
    question: 'Le Leap V2 convient-il aux grandes tailles ?',
    answer:
      "Oui : il est certifié jusqu'à 180 kg selon la fiche produit Steelcase et sa profondeur d'assise réglable couvre une large plage de morphologies. Pour les très petites tailles (moins d'1m55), essayez avant achat : le showroom est là pour ça.",
  },
  {
    question: 'Quelle est la durée de vie restante d\'un Leap V2 reconditionné ?',
    answer:
      "Un Leap V2 est conçu pour un usage intensif de plus de dix ans. Reconditionné avec vérin et roulettes remplacés, il repart pour dix ans d'usage quotidien. Les pièces détachées restent disponibles pour l'entretenir au-delà.",
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

export default async function SteelcaseLeapV2Page() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('steelcase-leap-v2-occasion'),
    searchProductsByName(['leap']),
  ])
  const productCards = products.slice(0, 8).map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage ? urlFor(landing.heroImage).width(1600).url() : undefined

  const schemas = [
    buildArticleSchema({ pageUrl, headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt, lastUpdated: landing?.lastUpdated, heroImageUrl }),
    buildBreadcrumbSchema({ siteUrl, items: [
      { name: 'Marques', href: '/marques' },
      { name: 'Steelcase', href: '/marques/steelcase' },
      { name: 'Leap V2 occasion', href: '/steelcase-leap-v2-occasion' },
    ] }),
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: "Steelcase Leap V2 d'occasion", url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@type': 'Product', name: 'Steelcase Leap V2', brand: { '@type': 'Brand', name: 'Steelcase' } },
      ...(productCards.length > 0 && {
        mainEntity: {
          '@type': 'ItemList', numberOfItems: productCards.length,
          itemListElement: products.slice(0, 8).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/produit/${p.slug.current}` })),
        },
      }),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: "Steelcase Leap V2 d'occasion", rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire Leap V2', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { label: 'Pourquoi le Leap V2 est-il devenu la référence des fauteuils pros ?' },
    { label: 'Quels sont les réglages du Leap V2 et à quoi servent-ils ?' },
    { label: 'Leap V1 ou Leap V2 : comment les distinguer ?' },
    { label: 'Quelles finitions et options rechercher en occasion ?' },
    { label: "Que vérifier avant d'acheter un Leap V2 d'occasion ?" },
    { label: 'Comment nous reconditionnons chaque Leap V2' },
    { label: 'Quelles alternatives si le Leap V2 ne vous convient pas ?' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[
          { name: 'Marques', href: '/marques' },
          { name: 'Steelcase', href: '/marques/steelcase' },
          { name: 'Leap V2 occasion' },
        ]}
        ctas={[
          { label: 'Voir les Leap V2 en stock', href: '/boutique' },
          { label: 'Être alerté d\'une arrivée', href: '/contact', variant: 'outline' },
        ]}
        products={productCards} productsCtaHref="/boutique"
        productsTitle="Leap V2 et fauteuils Steelcase en stock"
        toc={toc}
        relatedLinks={[
          { href: '/marques/steelcase', label: 'Toute la marque Steelcase', eyebrow: 'Marque' },
          { href: '/marques/herman-miller', label: "L'alternative : Herman Miller Aeron", eyebrow: 'Marque' },
          { href: '/marques/haworth', label: "L'alternative : Haworth Zody", eyebrow: 'Marque' },
          { href: '/fauteuil-ergonomique', label: 'Tous les fauteuils ergonomiques', eyebrow: 'Sélection' },
          { href: '/guides/ergonomie/fauteuil-de-bureau-ergonomique-mal-de-dos', label: 'Choisir son fauteuil quand on a mal au dos', eyebrow: 'Guide' },
          { href: '/bureau-occasion-marseille', label: 'Essai au showroom près de Marseille', eyebrow: 'Local' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">Vos questions sur le Leap V2 d&apos;occasion</h2>
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
