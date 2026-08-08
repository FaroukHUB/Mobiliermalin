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
const pageUrl = `${siteUrl}/marques/herman-miller`

export const metadata: Metadata = {
  title: 'Herman Miller reconditionné : Aeron, Mirra 2, Sayl, Embody d\'occasion',
  description:
    "Fauteuils Herman Miller reconditionnés : Aeron (tailles A/B/C), Mirra 2, Sayl, Embody. Authentification, remise en état atelier, livraison France.",
  keywords: [
    'Herman Miller',
    'Herman Miller occasion',
    'Aeron occasion',
    'Herman Miller Aeron reconditionné',
    'Mirra 2 occasion',
    'fauteuil Herman Miller',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Herman Miller reconditionné — Mobilier Malin',
    description: "Aeron, Mirra 2, Sayl, Embody reconditionnés en atelier. Livraison France.",
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'La marque iconique du design de bureau',
  heroTitle: "Herman Miller reconditionné : l'Aeron et ses frères, enfin accessibles",
  heroIntro:
    "Fauteuils Herman Miller remis en état dans notre atelier : Aeron (tailles A, B, C), Mirra 2, Sayl, Embody. Des sièges présents au MoMA, conçus pour des décennies d'usage, à une fraction du prix neuf. Livraison France, essai au showroom selon disponibilités.",
}

const FALLBACK_FAQ = [
  {
    question: "Pourquoi l'Aeron est-il si cher, même d'occasion ?",
    answer:
      "L'Aeron est le fauteuil de bureau le plus célèbre au monde : conception 1994 toujours en production, mesh intégral, trois tailles, réputation de quasi-indestructibilité. La demande en occasion dépasse largement l'offre, ce qui soutient les prix. Il reste deux à trois fois moins cher que le neuf.",
  },
  {
    question: "Quelle taille d'Aeron choisir (A, B ou C) ?",
    answer:
      "La taille B convient à la majorité des morphologies (environ 1m60 à 1m90). La taille A s'adresse aux petites morphologies, la C aux grandes tailles et gabarits importants. La taille est gravée sous l'assise (points en relief sur le dossier : 1 point = A, 2 = B, 3 = C).",
  },
  {
    question: "Avez-vous des Herman Miller en stock en permanence ?",
    answer:
      "Le stock Herman Miller est plus irrégulier que le Steelcase : les entreprises françaises en sont moins équipées. Décrivez-nous votre recherche, nous vous prévenons dès qu'un modèle correspondant arrive en atelier.",
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

export default async function MarqueHermanMillerPage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('marques-herman-miller'),
    getProductsByBrand('Herman Miller'),
  ])
  const productCards = products.slice(0, 8).map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage ? urlFor(landing.heroImage).width(1600).url() : undefined
  const officialUrl = BRAND_OFFICIAL_URL['Herman Miller']

  const schemas = [
    buildArticleSchema({ pageUrl, headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt, lastUpdated: landing?.lastUpdated, heroImageUrl }),
    buildBreadcrumbSchema({ siteUrl, items: [
      { name: 'Marques', href: '/marques' },
      { name: 'Herman Miller', href: '/marques/herman-miller' },
    ] }),
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: 'Mobilier Herman Miller reconditionné', url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@type': 'Brand', name: 'Herman Miller', ...(officialUrl && { sameAs: officialUrl }) },
      ...(productCards.length > 0 && {
        mainEntity: {
          '@type': 'ItemList', numberOfItems: productCards.length,
          itemListElement: products.slice(0, 8).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/produit/${p.slug.current}` })),
        },
      }),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: 'Fauteuils Herman Miller reconditionnés', rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire Herman Miller', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { label: "Herman Miller, l'icône du design de bureau américain" },
    { label: "Pourquoi l'Aeron est-il si recherché en occasion ?" },
    { label: 'Aeron Classic ou Aeron Remastered : quelles différences ?' },
    { label: 'Quels autres modèles Herman Miller trouve-t-on en reconditionné ?' },
    { label: 'Comment authentifier un vrai Herman Miller ?' },
    { label: 'Herman Miller ou Steelcase : comment choisir ?' },
    { label: 'Prix, entretien et pièces détachées' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[
          { name: 'Marques', href: '/marques' },
          { name: 'Herman Miller' },
        ]}
        ctas={[
          { label: 'Voir les Herman Miller en stock', href: '/boutique' },
          { label: 'Rechercher un modèle', href: '/contact', variant: 'outline' },
        ]}
        products={productCards} productsCtaHref="/boutique"
        productsTitle="Notre sélection Herman Miller"
        toc={toc}
        relatedLinks={[
          { href: '/fauteuil-ergonomique', label: 'Tous les fauteuils ergonomiques reconditionnés', eyebrow: 'Sélection' },
          { href: '/steelcase-leap-v2-occasion', label: "L'alternative : Steelcase Leap V2 d'occasion", eyebrow: 'Modèle' },
          { href: '/marques/steelcase', label: 'La marque Steelcase', eyebrow: 'Marque' },
          { href: '/marques/haworth', label: 'La marque Haworth (Zody)', eyebrow: 'Marque' },
          { href: '/marques/vitra', label: 'La marque Vitra', eyebrow: 'Marque' },
          { href: '/guides/ergonomie/fauteuil-de-bureau-ergonomique-mal-de-dos', label: 'Choisir son fauteuil quand on a mal au dos', eyebrow: 'Guide' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">Ce qu&apos;on nous demande sur Herman Miller</h2>
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
