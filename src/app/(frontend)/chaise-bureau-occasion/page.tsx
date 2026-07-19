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
const pageUrl = `${siteUrl}/chaise-bureau-occasion`

export const metadata: Metadata = {
  title: 'Chaise de bureau d\'occasion : fauteuils pros reconditionnés à prix accessibles',
  description:
    "Chaises et fauteuils de bureau d'occasion reconditionnés Steelcase, Haworth, Herman Miller. Pour télétravail, TPE, freelance. Livraison France, essai showroom.",
  keywords: [
    "chaise de bureau d'occasion",
    "chaise bureau occasion",
    'siège bureau occasion',
    'fauteuil bureau seconde main',
    'chaise bureau pas cher',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Chaise de bureau d'occasion — Mobilier Malin",
    description: 'Sélection nationale de chaises et fauteuils de bureau reconditionnés.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Sièges pros reconditionnés',
  heroTitle: "Chaise de bureau d'occasion : la qualité pro sans le budget neuf",
  heroIntro:
    "Chaises et fauteuils de bureau reconditionnés dans notre atelier local. Marques professionnelles conçues pour un usage quotidien. Adaptés au télétravail, freelance, TPE. Livraison France, retrait au showroom.",
}

const FALLBACK_FAQ = [
  {
    question: "Chaise de bureau ou fauteuil ergonomique : quelle différence ?",
    answer:
      "La chaise de bureau désigne le siège de travail au sens large, du modèle basique au fauteuil ergonomique haut de gamme. Le fauteuil ergonomique est une sous-catégorie avec réglages complets et conception intensive. Notre catalogue couvre les deux segments.",
  },
  {
    question: 'Peut-on avoir une chaise de bureau reconditionnée sous les 200 euros ?',
    answer:
      "Oui, plusieurs modèles pros entrée de gamme (Steelcase Series 1 en état correct, Amia, chaises visiteurs pros) se trouvent régulièrement entre 150 et 250 euros dans notre atelier.",
  },
  {
    question: "Livrez-vous à un particulier en télétravail ?",
    answer:
      "Oui, sans restriction. Livraison en région PACA et sur devis pour le reste de la France. Retrait au showroom possible sans rendez-vous obligatoire pour un seul modèle.",
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

export default async function ChaiseBureauOccasionPage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('chaise-bureau-occasion'),
    getProductsByCategoryDeep('fauteuil'),
  ])
  const productCards = products.slice(0, 8).map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage ? urlFor(landing.heroImage).width(1600).url() : undefined

  const schemas = [
    buildArticleSchema({ pageUrl, headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt, lastUpdated: landing?.lastUpdated, heroImageUrl }),
    buildBreadcrumbSchema({ siteUrl, items: [{ name: "Chaise de bureau d'occasion", href: '/chaise-bureau-occasion' }] }),
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: "Chaises de bureau d'occasion", url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` },
      ...(productCards.length > 0 && {
        mainEntity: {
          '@type': 'ItemList', numberOfItems: productCards.length,
          itemListElement: products.slice(0, 8).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/produit/${p.slug.current}` })),
        },
      }),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: "Chaises de bureau d'occasion", rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire chaise de bureau', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { id: 'difference', label: 'Chaise ou fauteuil : quelle différence exactement ?' },
    { id: 'categories', label: 'Quelles catégories de chaises trouve-t-on en occasion ?' },
    { id: 'teletravail', label: 'Quelle chaise pour le télétravail à petit budget ?' },
    { id: 'ergonomie', label: 'À partir de quel prix a-t-on une vraie ergonomie ?' },
    { id: 'entretien', label: "Comment entretenir une chaise reconditionnée ?" },
    { id: 'prix', label: 'Fourchettes de prix constatées' },
    { id: 'livraison', label: 'Livraison et retrait au showroom' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[{ name: "Chaise de bureau d'occasion" }]}
        ctas={[{ label: 'Voir les chaises et fauteuils', href: '/categorie/fauteuil' }, { label: 'Demander conseil', href: '/contact', variant: 'outline' }]}
        products={productCards} productsCtaHref="/categorie/fauteuil"
        productsTitle="Notre sélection actuelle"
        toc={toc}
        relatedLinks={[
          { href: '/fauteuil-ergonomique', label: 'Vraie ergonomie pro (Leap, Aeron, Zody)', eyebrow: 'Montée en gamme' },
          { href: '/mobilier-de-bureau-occasion', label: "HUB mobilier de bureau occasion", eyebrow: 'HUB' },
          { href: '/bureau-occasion', label: "Bureau d'occasion associé", eyebrow: 'Complément' },
          { href: '/guides/ergonomie/chaise-gaming-vs-chaise-ergonomique', label: 'Chaise gaming vs ergonomique', eyebrow: 'Guide' },
          { href: '/guides/ergonomie/fauteuil-de-bureau-ergonomique-mal-de-dos', label: 'Choisir en cas de mal de dos', eyebrow: 'Guide' },
          { href: '/bureau-occasion-marseille', label: 'Livraison Marseille', eyebrow: 'Local' },
        ]}
      />
      <section className="container py-14 md:py-20 max-w-3xl">
        <p className="eyebrow text-gold">Questions fréquentes</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">Vos questions avant d&apos;acheter</h2>
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
