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
const pageUrl = `${siteUrl}/bureau-professionnel-occasion`

export const metadata: Metadata = {
  title: "Bureau professionnel d'occasion : Steelcase, Haworth, Vitra reconditionnés",
  description:
    "Bureaux professionnels reconditionnés Steelcase, Haworth, Vitra : droit, bench, angle, assis-debout. Devis en volume, livraison France, atelier PACA.",
  keywords: [
    "bureau professionnel d'occasion",
    'bureau pro reconditionné',
    'mobilier bureau entreprise occasion',
    'bureau bench occasion',
    'bureau assis-debout occasion',
    'Steelcase Migration',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Bureau professionnel d'occasion — Mobilier Malin",
    description:
      "Bureaux droits, bench, angle, assis-debout Steelcase, Haworth, Vitra reconditionnés en atelier local.",
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Équiper vos postes de travail',
  heroTitle: "Bureau professionnel d'occasion : équiper une entreprise sans céder sur la qualité",
  heroIntro:
    "Bureaux droits, benchs, d'angle et assis-debout, reconditionnés dans notre atelier. Signés Steelcase, Haworth, Vitra, Majencia. À l'unité ou en volume pour équiper un plateau complet.",
}

const FALLBACK_FAQ = [
  {
    question: "Un bureau d'occasion pro tient-il aussi longtemps qu'un bureau neuf ?",
    answer:
      "Oui, dès lors qu'il a été reconditionné en atelier. Un Steelcase, Haworth ou Vitra reconditionné dans les règles tient 10 à 15 ans supplémentaires en usage quotidien.",
  },
  {
    question: 'Comment obtenir un devis pour équiper 10, 20 ou 50 postes ?',
    answer:
      'Contactez-nous par téléphone ou via le formulaire. Pour les projets à partir de 15 postes, nous proposons une visite sur site en PACA ou un échange visio. Devis sous 48 à 72 heures.',
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

export default async function BureauProfessionnelOccasionPage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('bureau-professionnel-occasion'),
    getProductsByCategoryDeep('bureau'),
  ])
  const productCards = products.slice(0, 8).map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage
    ? urlFor(landing.heroImage).width(1600).url()
    : undefined

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
      items: [{ name: "Bureau professionnel d'occasion", href: '/bureau-professionnel-occasion' }],
    }),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${pageUrl}#collection`,
      name: "Bureaux professionnels d'occasion",
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
    buildAggregateOfferSchema({ pageUrl, name: "Bureaux professionnels d'occasion", rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire mobilier de bureau pro', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { label: "Quand faut-il choisir un bureau professionnel d'occasion ?" },
    { label: 'Quels sont les quatre grands types de bureaux pros ?' },
    { label: 'Comment dimensionner un bureau selon le métier occupé ?' },
    { label: 'Équiper un plateau complet : par où commencer ?' },
    { label: "Bureau reconditionné vs bureau d'occasion : quelle différence ?" },
    { label: "Bilan environnemental : ce que dit l'ADEME" },
    { label: 'Nos garanties et modalités' },
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
        breadcrumb={[{ name: "Bureau professionnel d'occasion" }]}
        ctas={[
          { label: 'Voir tous les bureaux', href: '/categorie/bureau' },
          { label: 'Devis en volume', href: '/contact', variant: 'outline' },
        ]}
        products={productCards}
        productsCtaHref="/categorie/bureau"
        productsTitle="Nos bureaux professionnels en stock"
        toc={toc}
        relatedLinks={[
          { href: '/mobilier-de-bureau-occasion', label: "L'univers complet du mobilier de bureau occasion", eyebrow: 'HUB' },
          { href: '/bureau-assis-debout-occasion', label: 'Bureau assis-debout reconditionné', eyebrow: 'Vertical' },
          { href: '/table-reunion-occasion', label: 'Table de réunion d\'occasion', eyebrow: 'Vertical' },
          { href: '/mobilier-bureau-entreprise', label: 'Équiper une entreprise (BtoB)', eyebrow: 'Guide BtoB' },
          { href: '/mobilier-bureau-eco-responsable', label: 'Angle RSE et marchés publics', eyebrow: 'RSE' },
          { href: '/rachat-mobilier-bureau', label: 'Rachat de votre mobilier existant', eyebrow: 'Service' },
          { href: '/bureau-occasion-marseille', label: 'Livraison Marseille et alentours', eyebrow: 'Local' },
        ]}
      />

      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">
          Les réponses aux questions les plus posées
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
