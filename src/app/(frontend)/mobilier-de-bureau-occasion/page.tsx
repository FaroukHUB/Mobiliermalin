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
const pageUrl = `${siteUrl}/mobilier-de-bureau-occasion`

export const metadata: Metadata = {
  title: 'Mobilier de bureau occasion : bureaux, fauteuils, rangements pros reconditionnés',
  description:
    "L'univers complet du mobilier de bureau d'occasion reconditionné : bureaux, fauteuils, tables de réunion, rangements. Marques pros Steelcase, Herman Miller, Haworth. Livraison France.",
  keywords: [
    'mobilier de bureau occasion',
    'mobilier bureau reconditionné',
    'mobilier pro occasion',
    'meuble bureau occasion',
    'mobilier bureau seconde main',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Mobilier de bureau occasion — Mobilier Malin',
    description:
      "L'univers complet du reconditionné : bureaux, fauteuils, tables, rangements.",
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'HUB univers reconditionné',
  heroTitle: "Mobilier de bureau d'occasion : l'univers complet du reconditionné pro",
  heroIntro:
    "Bureaux, fauteuils, tables de réunion, rangements, mobilier d'accueil : notre atelier reconditionne tous types de mobilier de bureau professionnel. Marques Steelcase, Herman Miller, Haworth, Vitra. Livraison France.",
}

const FALLBACK_FAQ = [
  {
    question: "Quels types de mobilier de bureau peut-on trouver en occasion reconditionnée ?",
    answer:
      "Bureaux droits, bench, angle, assis-debout, fauteuils ergonomiques, chaises visiteurs, tables de réunion, caissons, armoires, mobilier d'accueil. Notre atelier remet en état tous ces meubles, essentiellement issus de fins de baux d'entreprises PACA et grand quart sud-est.",
  },
  {
    question: 'Est-ce moins cher que du neuf ?',
    answer:
      'Oui, de l\'ordre d\'un tiers à un quart du prix neuf selon les modèles et l\'état esthétique. Un fauteuil Steelcase Leap V2 neuf coûte 1500 €, la même référence reconditionnée se trouve entre 400 et 650 €.',
  },
  {
    question: "Livrez-vous partout en France ?",
    answer:
      "Livraison régulière en région PACA et sur devis pour le reste de la France métropolitaine. Retrait sur rendez-vous au showroom de La Penne-sur-Huveaune.",
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

export default async function MobilierDeBureauOccasionPage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('mobilier-de-bureau-occasion'),
    getFeaturedProducts(8),
  ])
  const productCards = products.map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage ? urlFor(landing.heroImage).width(1600).url() : undefined

  const schemas = [
    buildArticleSchema({
      pageUrl, headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt, lastUpdated: landing?.lastUpdated, heroImageUrl,
    }),
    buildBreadcrumbSchema({ siteUrl, items: [{ name: 'Mobilier de bureau occasion', href: '/mobilier-de-bureau-occasion' }] }),
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: "Mobilier de bureau d'occasion", url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` },
      ...(productCards.length > 0 && {
        mainEntity: {
          '@type': 'ItemList', numberOfItems: productCards.length,
          itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/produit/${p.slug.current}` })),
        },
      }),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: 'Mobilier de bureau reconditionné', rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire mobilier de bureau', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { id: 'quoi', label: "Qu'est-ce que le mobilier de bureau reconditionné exactement ?" },
    { id: 'univers', label: 'Quels sont les grands univers de mobilier de bureau pro ?' },
    { id: 'marques', label: 'Quelles marques trouve-t-on en occasion pro ?' },
    { id: 'quand', label: 'Quand faut-il choisir le reconditionné plutôt que le neuf ?' },
    { id: 'reconnaitre', label: 'Comment reconnaître un vrai reconditionné en atelier ?' },
    { id: 'rse', label: 'Quel est l\'impact environnemental du reconditionné ?' },
    { id: 'livraison', label: 'Comment se passe la livraison en France ?' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[{ name: 'Mobilier de bureau occasion' }]}
        ctas={[{ label: 'Voir la boutique', href: '/boutique' }, { label: 'Nous contacter', href: '/contact', variant: 'outline' }]}
        products={productCards}
        productsCtaHref="/boutique"
        productsTitle="Une sélection de notre catalogue reconditionné"
        toc={toc}
        relatedLinks={[
          { href: '/bureau-occasion', label: "Bureau d'occasion (grand public + TPE)", eyebrow: 'Vertical' },
          { href: '/bureau-professionnel-occasion', label: "Bureau professionnel d'occasion (BtoB)", eyebrow: 'Vertical' },
          { href: '/fauteuil-ergonomique', label: 'Fauteuil ergonomique reconditionné', eyebrow: 'Vertical' },
          { href: '/chaise-bureau-occasion', label: 'Chaise de bureau d\'occasion', eyebrow: 'Vertical' },
          { href: '/bureau-assis-debout-occasion', label: 'Bureau assis-debout d\'occasion', eyebrow: 'Vertical' },
          { href: '/table-reunion-occasion', label: "Table de réunion d'occasion", eyebrow: 'Vertical' },
          { href: '/mobilier-bureau-entreprise', label: 'Équiper une entreprise (BtoB)', eyebrow: 'Guide' },
          { href: '/mobilier-bureau-eco-responsable', label: 'Mobilier de bureau éco-responsable', eyebrow: 'RSE' },
          { href: '/marques/steelcase', label: 'Marque Steelcase', eyebrow: 'Marque' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">L&apos;essentiel à savoir avant d&apos;acheter</h2>
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
