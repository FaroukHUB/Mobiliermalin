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
const pageUrl = `${siteUrl}/marques/vitra`

export const metadata: Metadata = {
  title: 'Vitra reconditionné : Physix, ID Chair, sièges design d\'occasion',
  description:
    "Sièges et mobilier Vitra reconditionnés : Physix, ID Chair, gammes direction. L'éditeur suisse de design, remis en état en atelier. Livraison France.",
  keywords: [
    'Vitra',
    'Vitra occasion',
    'Vitra Physix occasion',
    'fauteuil Vitra reconditionné',
    'ID Chair Vitra',
    'mobilier Vitra bureau',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Vitra reconditionné — Mobilier Malin',
    description: 'Physix, ID Chair et mobilier Vitra reconditionnés en atelier. Livraison France.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Le design suisse au bureau',
  heroTitle: 'Vitra reconditionné : le mobilier de design, sans le prix du neuf',
  heroIntro:
    "Sièges et mobilier Vitra remis en état dans notre atelier : Physix, ID Chair, gammes de direction. L'éditeur suisse qui a fait entrer le design dans les bureaux, accessible en reconditionné avec livraison France.",
}

const FALLBACK_FAQ = [
  {
    question: 'Vitra est-elle une marque de mobilier de bureau ou de design ?',
    answer:
      "Les deux : Vitra édite à la fois du mobilier de bureau professionnel (Physix, ID Chair) et des pièces de design iconiques (les rééditions Eames pour l'Europe notamment). C'est cette double culture qui donne aux sièges Vitra leur esthétique reconnaissable.",
  },
  {
    question: 'Le mobilier Vitra garde-t-il sa valeur en occasion ?',
    answer:
      "Oui, mieux que la plupart des marques de bureau : l'attrait design entretient une demande au-delà du marché professionnel (particuliers, architectes, collectionneurs). Un siège Vitra bien entretenu se revend des années plus tard.",
  },
  {
    question: 'Avez-vous du Vitra en stock en permanence ?',
    answer:
      "Le flux est irrégulier : Vitra équipe surtout les directions et les sièges sociaux design, moins les grands plateaux. Dites-nous ce que vous cherchez, nous vous alertons dès qu'une pièce arrive.",
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

export default async function MarqueVitraPage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('marques-vitra'),
    getProductsByBrand('Vitra'),
  ])
  const productCards = products.slice(0, 8).map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage ? urlFor(landing.heroImage).width(1600).url() : undefined
  const officialUrl = BRAND_OFFICIAL_URL['Vitra']

  const schemas = [
    buildArticleSchema({ pageUrl, headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt, lastUpdated: landing?.lastUpdated, heroImageUrl }),
    buildBreadcrumbSchema({ siteUrl, items: [
      { name: 'Marques', href: '/marques' },
      { name: 'Vitra', href: '/marques/vitra' },
    ] }),
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: 'Mobilier Vitra reconditionné', url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@type': 'Brand', name: 'Vitra', ...(officialUrl && { sameAs: officialUrl }) },
      ...(productCards.length > 0 && {
        mainEntity: {
          '@type': 'ItemList', numberOfItems: productCards.length,
          itemListElement: products.slice(0, 8).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/produit/${p.slug.current}` })),
        },
      }),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: 'Mobilier Vitra reconditionné', rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire Vitra', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { label: "Vitra, l'éditeur suisse qui a fait entrer le design au bureau" },
    { label: 'Quels sièges Vitra trouve-t-on en occasion ?' },
    { label: "Le Physix et l'ID Chair en détail" },
    { label: 'Pourquoi le mobilier Vitra garde-t-il sa valeur ?' },
    { label: 'Comment reconnaître un authentique Vitra ?' },
    { label: "Vitra ou les marques américaines : quelle différence d'approche ?" },
    { label: 'Livraison, essai et disponibilités' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[
          { name: 'Marques', href: '/marques' },
          { name: 'Vitra' },
        ]}
        ctas={[
          { label: 'Voir les Vitra en stock', href: '/boutique' },
          { label: 'Rechercher un modèle', href: '/contact', variant: 'outline' },
        ]}
        products={productCards} productsCtaHref="/boutique"
        productsTitle="Notre sélection Vitra"
        toc={toc}
        relatedLinks={[
          { href: '/fauteuil-ergonomique', label: 'Tous les fauteuils ergonomiques reconditionnés', eyebrow: 'Sélection' },
          { href: '/marques/steelcase', label: 'La marque Steelcase', eyebrow: 'Marque' },
          { href: '/marques/herman-miller', label: 'La marque Herman Miller (Aeron)', eyebrow: 'Marque' },
          { href: '/marques/haworth', label: 'La marque Haworth (Zody)', eyebrow: 'Marque' },
          { href: '/mobilier-bureau-entreprise', label: 'Équiper une entreprise (BtoB)', eyebrow: 'BtoB' },
          { href: '/mobilier-de-bureau-occasion', label: "L'univers complet du mobilier occasion", eyebrow: 'HUB' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">Ce qu&apos;on nous demande sur Vitra</h2>
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
