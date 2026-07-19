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
const pageUrl = `${siteUrl}/bureau-assis-debout-occasion`

export const metadata: Metadata = {
  title: 'Bureau assis-debout d\'occasion : Steelcase Migration, Linak reconditionnés',
  description:
    "Bureaux assis-debout électriques reconditionnés : Steelcase Migration Bench, Vitra, Kinnarps. Livraison France, garantie moteur, prévention TMS.",
  keywords: [
    "bureau assis-debout occasion",
    'bureau assis debout electrique occasion',
    'sit stand desk occasion',
    'Steelcase Migration',
    'bureau reglable en hauteur',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Bureau assis-debout d'occasion — Mobilier Malin",
    description: 'Bureaux électriques réglables reconditionnés en atelier local.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Prévention TMS + confort',
  heroTitle: "Bureau assis-debout d'occasion : la santé au poste, sans le prix du neuf",
  heroIntro:
    "Bureaux assis-debout électriques reconditionnés dans notre atelier. Steelcase Migration Bench, Kinnarps, Vitra, moteurs Linak testés à charge maximale. Livraison France, contrôle du système électrique inclus.",
}

const FALLBACK_FAQ = [
  {
    question: "Un bureau assis-debout reconditionné est-il vraiment fiable ?",
    answer:
      "Oui, à condition que le moteur ait été testé à charge maximale et que les câbles aient été vérifiés. C'est le premier point de contrôle dans notre atelier pour ce type de mobilier. Un bureau électrique bien reconditionné tient 10 à 15 ans d'usage supplémentaires.",
  },
  {
    question: "Combien coûte un bureau assis-debout d'occasion ?",
    answer:
      "Fourchette typique de 600 à 900 euros selon la marque, la largeur et l'état esthétique. Un Steelcase Migration neuf coûte entre 1500 et 2500 euros selon les options.",
  },
  {
    question: "Le bureau est-il livré monté ?",
    answer:
      "Selon les modèles et la zone de livraison. Précisez au devis si vous souhaitez la livraison avec montage. Nous coordonnons avec des équipes en région PACA pour cette prestation.",
  },
]

function sanityToCard(p: SanityProduct): ProductCardData {
  const firstImage = p.images?.[0]
  const imageUrl = firstImage ? urlFor(firstImage).width(900).height(1200).fit('crop').url() : undefined
  return {
    id: p._id, slug: p.slug.current, title: p.name, shortDescription: p.shortDescription,
    price: p.price, salePrice: p.salePrice, comparePrice: p.comparePrice, condition: p.condition,
    brandName: p.brand, imageUrl, imageAlt: firstImage?.alt || p.name, status: 'published',
  }
}

export default async function BureauAssisDeboutOccasionPage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('bureau-assis-debout-occasion'),
    getProductsByCategoryDeep('bureau'),
  ])
  const productCards = products.slice(0, 8).map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage ? urlFor(landing.heroImage).width(1600).url() : undefined

  const schemas = [
    buildArticleSchema({ pageUrl, headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt, lastUpdated: landing?.lastUpdated, heroImageUrl }),
    buildBreadcrumbSchema({ siteUrl, items: [{ name: "Bureau assis-debout d'occasion", href: '/bureau-assis-debout-occasion' }] }),
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: "Bureaux assis-debout d'occasion", url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` },
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: "Bureaux assis-debout d'occasion", rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire bureau assis-debout', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { id: 'pourquoi', label: "Pourquoi passer au bureau assis-debout en 2026 ?" },
    { id: 'sante', label: 'Ce que dit l\'INRS sur la position debout au travail' },
    { id: 'modeles', label: 'Quels sont les modèles pros disponibles en occasion ?' },
    { id: 'moteur', label: 'Comment vérifier l\'état du moteur électrique ?' },
    { id: 'prix', label: 'Combien coûte réellement un assis-debout reconditionné ?' },
    { id: 'installation', label: 'Installation, câblage, alimentation : les prérequis' },
    { id: 'rse', label: 'Bilan RSE : l\'assis-debout reconditionné vs neuf' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[{ name: "Bureau assis-debout d'occasion" }]}
        ctas={[{ label: 'Nous consulter sur le stock', href: '/contact' }, { label: 'Voir les bureaux', href: '/categorie/bureau', variant: 'outline' }]}
        products={productCards} productsCtaHref="/categorie/bureau"
        productsTitle="Bureaux et assis-debout en stock"
        toc={toc}
        relatedLinks={[
          { href: '/mobilier-de-bureau-occasion', label: "HUB mobilier de bureau occasion", eyebrow: 'HUB' },
          { href: '/bureau-professionnel-occasion', label: "Bureau pro classique", eyebrow: 'Alternative' },
          { href: '/bureau-occasion', label: "Bureau d'occasion (autres formats)", eyebrow: 'Alternative' },
          { href: '/fauteuil-ergonomique', label: 'Fauteuil ergonomique associé', eyebrow: 'Complément' },
          { href: '/mobilier-bureau-eco-responsable', label: 'Angle RSE et impact carbone', eyebrow: 'RSE' },
          { href: '/marques/steelcase', label: 'Marque Steelcase (Migration Bench)', eyebrow: 'Marque' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">Vos questions sur l&apos;assis-debout d&apos;occasion</h2>
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
