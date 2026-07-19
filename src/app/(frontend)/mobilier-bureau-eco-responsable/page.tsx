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
const pageUrl = `${siteUrl}/mobilier-bureau-eco-responsable`

export const metadata: Metadata = {
  title: 'Mobilier de bureau éco-responsable : reconditionné, RSE, marchés publics',
  description:
    "Mobilier de bureau éco-responsable pour entreprises et acheteurs publics : reconditionné, attestation carbone, article R2172-4 CCP. Traçabilité complète.",
  keywords: [
    'mobilier bureau eco responsable',
    'mobilier bureau rse',
    'mobilier bureau seconde main entreprise',
    'reemploi mobilier bureau',
    'marches publics mobilier reemploi',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Mobilier de bureau éco-responsable — Mobilier Malin',
    description: 'Reconditionné, attestation carbone, marchés publics R2172-4.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Économie circulaire du mobilier pro',
  heroTitle: "Mobilier de bureau éco-responsable : la solution qui coche toutes les cases RSE",
  heroIntro:
    "Le reconditionné évite jusqu'à 90% des émissions carbone d'un mobilier neuf équivalent, selon les données ADEME. Nous fournissons attestation de valorisation et traçabilité pour vos rapports RSE et vos réponses aux marchés publics soumis à l'article R2172-4 du Code de la commande publique.",
}

const FALLBACK_FAQ = [
  {
    question: "Le mobilier reconditionné compte-t-il pour l'article R2172-4 des marchés publics ?",
    answer:
      "Oui. Depuis 2021, cet article impose aux acheteurs publics d'inclure une part de produits issus du réemploi, de la réutilisation ou intégrant des matières recyclées dans leurs marchés. Le mobilier reconditionné répond directement au critère de réemploi.",
  },
  {
    question: "Fournissez-vous un chiffrage carbone évité par commande ?",
    answer:
      "Oui, une attestation de valorisation avec chiffrage carbone indicatif est délivrée sur demande. Le calcul s'appuie sur les moyennes ADEME du mobilier de bureau, croisées avec le volume et le type de meubles achetés.",
  },
  {
    question: "Quelle traçabilité pour un audit RSE ?",
    answer:
      "Origine des lots (fins de bail, réorganisations), documentation photo, contrôles réalisés en atelier : ces éléments sont disponibles sur les commandes en volume et fournis à titre justificatif.",
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

export default async function MobilierBureauEcoResponsablePage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('mobilier-bureau-eco-responsable'),
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
    buildBreadcrumbSchema({ siteUrl, items: [{ name: 'Mobilier de bureau éco-responsable', href: '/mobilier-bureau-eco-responsable' }] }),
    { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: 'Mobilier de bureau éco-responsable', url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` } },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: 'Mobilier de bureau éco-responsable', rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire RSE mobilier', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { id: 'definition', label: "Qu'est-ce qu'un mobilier de bureau vraiment éco-responsable ?" },
    { id: 'ademe', label: 'Ce que dit l\'ADEME sur le mobilier professionnel' },
    { id: 'reemploi', label: 'Réemploi, recyclage, seconde main : les vraies différences' },
    { id: 'marches-publics', label: 'Marchés publics : l\'article R2172-4 en clair' },
    { id: 'attestation', label: 'Attestation de valorisation : ce qu\'elle contient' },
    { id: 'rapports', label: 'Comment intégrer le reconditionné dans vos rapports RSE' },
    { id: 'labels', label: 'Labels, certifications, ecolabel : où en est le marché ?' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[{ name: 'Mobilier de bureau éco-responsable' }]}
        ctas={[{ label: 'Demander une attestation RSE', href: '/attestation-rse' }, { label: 'Nous contacter', href: '/contact', variant: 'outline' }]}
        products={productCards} productsCtaHref="/boutique"
        productsTitle="Notre catalogue éco-responsable"
        toc={toc}
        relatedLinks={[
          { href: '/mobilier-bureau-entreprise', label: "Équiper une entreprise (BtoB)", eyebrow: 'Vertical' },
          { href: '/mobilier-de-bureau-occasion', label: "HUB mobilier de bureau occasion", eyebrow: 'HUB' },
          { href: '/bureau-professionnel-occasion', label: "Bureaux pros reconditionnés", eyebrow: 'Vertical' },
          { href: '/attestation-rse', label: 'Nos attestations RSE', eyebrow: 'Preuve' },
          { href: '/notre-demarche', label: 'Notre démarche atelier', eyebrow: 'À propos' },
          { href: '/rachat-mobilier-bureau', label: 'Rachat de votre mobilier existant', eyebrow: 'Service' },
          { href: '/vidage-de-locaux', label: 'Vidage complet valorisé', eyebrow: 'Service' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">Éco-responsabilité et marchés publics</h2>
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
