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
const pageUrl = `${siteUrl}/cabine-acoustique-bureau`

export const metadata: Metadata = {
  title: 'Cabine acoustique de bureau : box phonique d\'occasion reconditionnée',
  description:
    "Cabines acoustiques et box phoniques d'occasion pour open space : 1 à 6 places, reconditionnées en atelier. Appels, visio, concentration. Livraison France.",
  keywords: [
    'cabine acoustique bureau',
    'box acoustique',
    'cabine acoustique individuelle',
    'cabine téléphonique bureau',
    'phone box open space',
    'cabine acoustique occasion',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Cabine acoustique de bureau — Mobilier Malin',
    description:
      "Cabines acoustiques d'occasion reconditionnées pour open space. 1 à 6 places, livraison France.",
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Silence et concentration en open space',
  heroTitle: "Cabine acoustique de bureau : le calme retrouvé, au prix de l'occasion",
  heroIntro:
    "Cabines acoustiques individuelles et box de réunion phoniques, reconditionnées dans notre atelier. La solution pour les appels, les visios et la concentration en open space, sans travaux et sans le budget du neuf. Livraison et installation partout en France.",
}

const FALLBACK_FAQ = [
  {
    question: "À quoi sert une cabine acoustique en open space ?",
    answer:
      "Elle isole un collaborateur (ou un petit groupe) du bruit ambiant pour passer des appels, faire des visios ou se concentrer, sans quitter le plateau. C'est l'alternative sans travaux à la construction de salles fermées.",
  },
  {
    question: "Quelle taille de cabine choisir ?",
    answer:
      "La cabine 1 place (environ 1 m²) couvre les appels et visios individuels. Les box 2 à 4 places accueillent les points rapides et entretiens. Au-delà (4-6 places), on parle de véritable salle de réunion acoustique mobile.",
  },
  {
    question: "Une cabine acoustique d'occasion est-elle vraiment moins chère ?",
    answer:
      "Oui, c'est un des écarts neuf/occasion les plus importants du mobilier de bureau : les cabines neuves sont onéreuses, et le reconditionné permet d'équiper un open space pour une fraction du budget. Contactez-nous pour connaître les modèles en stock et leurs prix.",
  },
  {
    question: "Comment se passe la livraison d'une cabine acoustique ?",
    answer:
      "Une cabine se livre démontée ou semi-démontée puis se remonte sur site (comptez une demi-journée selon le modèle). Nous coordonnons livraison et montage, en France entière sur devis. Précisez l'accès (ascenseur, largeur de portes) lors de votre demande.",
  },
  {
    question: "Les cabines nécessitent-elles un raccordement électrique ?",
    answer:
      "La plupart des modèles ont ventilation et éclairage intégrés, alimentés par une simple prise 220V standard. Aucun travaux : la cabine se branche comme un meuble.",
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

export default async function CabineAcoustiqueBureauPage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('cabine-acoustique-bureau'),
    searchProductsByName(['cabine', 'box acoustique', 'alcove', 'alcôve', 'phone box']),
  ])
  const productCards = products.slice(0, 8).map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage ? urlFor(landing.heroImage).width(1600).url() : undefined

  const schemas = [
    buildArticleSchema({ pageUrl, headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt, lastUpdated: landing?.lastUpdated, heroImageUrl }),
    buildBreadcrumbSchema({ siteUrl, items: [{ name: 'Cabine acoustique de bureau', href: '/cabine-acoustique-bureau' }] }),
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: "Cabines acoustiques de bureau d'occasion", url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` },
      ...(productCards.length > 0 && {
        mainEntity: {
          '@type': 'ItemList', numberOfItems: productCards.length,
          itemListElement: products.slice(0, 8).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/produit/${p.slug.current}` })),
        },
      }),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: "Cabines acoustiques d'occasion", rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire acoustique de bureau', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { label: 'Pourquoi les open spaces adoptent les cabines acoustiques ?' },
    { label: 'Quels formats de cabines existent (1 à 6 places) ?' },
    { label: 'Que dit la réglementation sur le bruit au travail ?' },
    { label: "Comment vérifier la qualité d'une cabine d'occasion ?" },
    { label: 'Installation, ventilation, électricité : les prérequis' },
    { label: 'Cabine acoustique ou salle fermée : que choisir ?' },
    { label: 'Livraison et montage partout en France' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[{ name: 'Cabine acoustique de bureau' }]}
        ctas={[{ label: 'Voir les cabines en stock', href: '/boutique' }, { label: 'Demander un devis', href: '/contact', variant: 'outline' }]}
        products={productCards} productsCtaHref="/boutique"
        productsTitle="Cabines et solutions acoustiques en stock"
        toc={toc}
        relatedLinks={[
          { href: '/mobilier-de-bureau-occasion', label: "L'univers complet du mobilier occasion", eyebrow: 'HUB' },
          { href: '/mobilier-bureau-entreprise', label: 'Équiper une entreprise (BtoB)', eyebrow: 'BtoB' },
          { href: '/table-reunion-occasion', label: 'Tables de réunion d\'occasion', eyebrow: 'Complément' },
          { href: '/bureau-professionnel-occasion', label: "Bureaux professionnels d'occasion", eyebrow: 'Complément' },
          { href: '/mobilier-bureau-eco-responsable', label: 'Angle RSE et marchés publics', eyebrow: 'RSE' },
          { href: '/bureau-occasion-marseille', label: 'Livraison Marseille et PACA', eyebrow: 'Local' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">L&apos;essentiel sur les cabines acoustiques</h2>
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
