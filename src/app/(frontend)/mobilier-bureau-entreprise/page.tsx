import type { Metadata } from 'next'
import { NationalPageV2 } from '@/components/national/NationalPageV2'
import {
  getFeaturedProducts,
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
const pageUrl = `${siteUrl}/mobilier-bureau-entreprise`

export const metadata: Metadata = {
  title: 'Mobilier de bureau pour entreprise : équiper vos plateaux en reconditionné',
  description:
    "Équipement mobilier de bureau pour entreprises : 10 à 200 postes reconditionnés, devis volume, reprise mobilier existant, livraison France, attestation RSE.",
  keywords: [
    'mobilier de bureau entreprise',
    'equipement bureau entreprise',
    'amenagement bureaux entreprise',
    'plateau entreprise reconditionne',
    'equiper open space',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Mobilier de bureau pour entreprise — Mobilier Malin',
    description: 'Reconditionné pour vos plateaux : devis en volume, reprise, attestation RSE.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Solutions BtoB clé en main',
  heroTitle: "Mobilier de bureau pour entreprise : équiper vos plateaux, sans surpayer, sans compromis",
  heroIntro:
    "Vous aménagez, réorganisez ou renouvelez vos espaces de travail ? Notre atelier vous accompagne du chiffrage à la livraison, avec du mobilier reconditionné de marques pros. Reprise de votre mobilier existant possible, attestation RSE fournie.",
}

const FALLBACK_FAQ = [
  {
    question: "À partir de combien de postes travaillez-vous ?",
    answer:
      "Aucun minimum, mais nos avantages BtoB (remise volume, coordination livraison, reprise mobilier existant) sont particulièrement pertinents à partir de 10 postes. Nous équipons régulièrement des projets de 10 à 200 postes.",
  },
  {
    question: "Reprenez-vous notre mobilier existant si nous achetons du neuf occasion ?",
    answer:
      "Oui, sous conditions. Nous étudions le rachat ou l'évacuation gratuite selon le volume, l'état, les marques et l'accessibilité. Cette prestation est chiffrée séparément au devis.",
  },
  {
    question: "Fournissez-vous une attestation pour notre bilan RSE ?",
    answer:
      "Oui, une attestation de valorisation est fournie sur demande à chaque commande, avec chiffrage carbone évité indicatif. Elle est utilisable dans les rapports RSE et les réponses aux marchés publics.",
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

export default async function MobilierBureauEntreprisePage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('mobilier-bureau-entreprise'),
    getFeaturedProducts(8),
  ])
  const productCards = products.map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage ? urlFor(landing.heroImage).width(1600).url() : undefined

  const schemas = [
    buildArticleSchema({ pageUrl, headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt, lastUpdated: landing?.lastUpdated, heroImageUrl }),
    buildBreadcrumbSchema({ siteUrl, items: [{ name: 'Mobilier de bureau entreprise', href: '/mobilier-bureau-entreprise' }] }),
    { '@context': 'https://schema.org', '@type': 'Service', '@id': `${pageUrl}#service`,
      name: 'Équipement mobilier de bureau pour entreprises', url: pageUrl,
      provider: { '@type': 'Organization', name: 'Mobilier Malin', url: siteUrl },
      areaServed: { '@type': 'Country', name: 'France' },
      serviceType: 'Équipement mobilier de bureau reconditionné pour entreprises' },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: 'Mobilier de bureau entreprise', rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire équipement bureau entreprise', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { label: "Comment se passe l'accompagnement pour équiper une entreprise ?" },
    { label: 'Comment on analyse vos besoins réels ?' },
    { label: 'Comment est chiffré un projet mobilier pro reconditionné ?' },
    { label: 'Reprise ou débarras de votre mobilier existant' },
    { label: 'Livraison, installation, coordination avec vos équipes' },
    { label: 'Attestation RSE, bilan carbone évité et marchés publics' },
    { label: 'SAV, garanties et interventions ultérieures' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[{ name: 'Mobilier de bureau entreprise' }]}
        ctas={[{ label: 'Demander un devis', href: '/contact' }, { label: 'Nous appeler', href: '/contact', variant: 'outline' }]}
        products={productCards} productsCtaHref="/boutique"
        productsTitle="Extraits du catalogue disponible"
        toc={toc}
        relatedLinks={[
          { href: '/bureau-professionnel-occasion', label: 'Bureau professionnel d\'occasion', eyebrow: 'Vertical' },
          { href: '/fauteuil-ergonomique', label: 'Fauteuil ergonomique pour vos collaborateurs', eyebrow: 'Vertical' },
          { href: '/bureau-assis-debout-occasion', label: 'Assis-debout pour cadres', eyebrow: 'Vertical' },
          { href: '/table-reunion-occasion', label: 'Tables de réunion', eyebrow: 'Vertical' },
          { href: '/mobilier-bureau-eco-responsable', label: 'Angle RSE et marchés publics', eyebrow: 'RSE' },
          { href: '/rachat-mobilier-bureau', label: 'Rachat de votre mobilier existant', eyebrow: 'Service' },
          { href: '/vidage-de-locaux', label: 'Vidage complet de vos locaux', eyebrow: 'Service' },
          { href: '/attestation-rse', label: 'Nos attestations RSE', eyebrow: 'Preuve' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">L&apos;équipement mobilier BtoB en détail</h2>
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
