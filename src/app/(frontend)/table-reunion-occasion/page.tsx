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
const pageUrl = `${siteUrl}/table-reunion-occasion`

export const metadata: Metadata = {
  title: 'Table de réunion d\'occasion : conférence, comptoir, board reconditionnés',
  description:
    "Tables de réunion reconditionnées pour cabinet, salle de conférence ou espace de coworking. 4 à 20 places, formats rectangulaires, ovales, modulables. Livraison France.",
  keywords: [
    "table de réunion occasion",
    "table conférence occasion",
    "table réunion pro reconditionnée",
    "salle de réunion mobilier",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Table de réunion d'occasion — Mobilier Malin",
    description: 'Tables reconditionnées pour salles de réunion 4 à 20 places.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Salles de réunion équipées',
  heroTitle: "Table de réunion d'occasion : équiper vos espaces collaboratifs en reconditionné",
  heroIntro:
    "Tables de conférence, comptoirs de réunion, boards ovales et modulables, remis en état dans notre atelier. De 4 à 20 places, formats adaptés aux cabinets, agences, sièges sociaux et coworkings. Livraison France.",
}

const FALLBACK_FAQ = [
  {
    question: "Quels formats de tables de réunion trouve-t-on en occasion ?",
    answer:
      "Rectangulaires classiques (140 à 320 cm), ovales premium (jusqu'à 400 cm), boards modulables assemblés à partir de plateaux plus petits, mange-debout hauts pour réunions courtes. Tous ces formats reviennent régulièrement dans notre atelier.",
  },
  {
    question: 'Peut-on avoir une table de réunion pour 12 personnes en reconditionné ?',
    answer:
      "Oui, ce format est courant sur le marché du reconditionné pro. Comptez entre 700 et 1500 euros selon la marque, l'état et le matériau du plateau (mélaminé, placage bois, bois massif).",
  },
  {
    question: "Livrez-vous et installez-vous sur site ?",
    answer:
      "Livraison en région PACA et sur devis pour le reste de la France. Le montage sur site peut être ajouté à la commande. Prévoir l'accessibilité (largeur porte, ascenseur, monte-charge) pour un devis précis.",
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

export default async function TableReunionOccasionPage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('table-reunion-occasion'),
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
    buildBreadcrumbSchema({ siteUrl, items: [{ name: "Table de réunion d'occasion", href: '/table-reunion-occasion' }] }),
    { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: "Tables de réunion d'occasion", url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` } },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: "Tables de réunion d'occasion", rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire table de réunion', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { id: 'usage', label: 'À quoi sert vraiment une table de réunion aujourd\'hui ?' },
    { id: 'formats', label: 'Quels formats existent (rectangulaire, ovale, modulable) ?' },
    { id: 'dimensions', label: 'Combien de personnes selon la taille du plateau ?' },
    { id: 'materiaux', label: 'Mélaminé, placage, bois massif : que privilégier ?' },
    { id: 'cablage', label: 'Câblage intégré et prises pour salles connectées' },
    { id: 'complementaire', label: "Mobilier complémentaire : chaises visiteurs, écran, comptoir" },
    { id: 'installation', label: 'Livraison, montage, accessibilité' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[{ name: "Table de réunion d'occasion" }]}
        ctas={[{ label: 'Demander un devis', href: '/contact' }, { label: 'Voir le catalogue', href: '/boutique', variant: 'outline' }]}
        products={productCards} productsCtaHref="/boutique"
        productsTitle="Mobilier de réunion en stock"
        toc={toc}
        relatedLinks={[
          { href: '/mobilier-de-bureau-occasion', label: "HUB mobilier de bureau occasion", eyebrow: 'HUB' },
          { href: '/bureau-professionnel-occasion', label: "Équiper les postes de travail", eyebrow: 'Complément' },
          { href: '/mobilier-bureau-entreprise', label: "Équiper une entreprise complète", eyebrow: 'BtoB' },
          { href: '/mobilier-bureau-eco-responsable', label: 'Angle RSE marchés publics', eyebrow: 'RSE' },
          { href: '/bureau-occasion-marseille', label: 'Livraison Marseille', eyebrow: 'Local' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">Ce qu&apos;il faut savoir sur les tables de réunion d&apos;occasion</h2>
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
