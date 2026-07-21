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
const pageUrl = `${siteUrl}/bureau-occasion`

export const metadata: Metadata = {
  title: 'Bureau d\'occasion : le meilleur rapport qualité/prix pour votre poste',
  description:
    "Bureau d'occasion reconditionné pour télétravail, TPE, freelance ou petite entreprise. Modèles Steelcase, Haworth, IKEA Bekant. Livraison France, retrait showroom.",
  keywords: [
    "bureau d'occasion",
    'bureau occasion',
    'bureau seconde main',
    'bureau pas cher',
    'bureau télétravail occasion',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Bureau d'occasion — Mobilier Malin",
    description: 'Bureaux reconditionnés pour télétravail, freelance, TPE. Livraison France.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

const FALLBACK = {
  heroEyebrow: 'Reconditionné qualité pro, prix accessible',
  heroTitle: "Bureau d'occasion : la même qualité pour un tiers du prix",
  heroIntro:
    "Une sélection de bureaux reconditionnés dans notre atelier local, adaptés au télétravail, aux freelances, aux TPE. Marques professionnelles Steelcase, Haworth, Vitra, Majencia, IKEA Bekant. Contrôle qualité complet avant vente.",
}

const FALLBACK_FAQ = [
  {
    question: "Quelle est la différence avec un bureau professionnel d'occasion ?",
    answer:
      "Le bureau professionnel d'occasion cible plutôt les entreprises qui équipent un plateau en volume. Cette page présente des bureaux à l'unité, pour un usage télétravail, freelance ou petite structure. Les mêmes marques pros restent disponibles.",
  },
  {
    question: 'Puis-je acheter un seul bureau ?',
    answer:
      "Oui, tous nos bureaux sont vendus à l'unité. Aucun minimum de commande. La sélection est visible dans notre catégorie bureau.",
  },
  {
    question: "Livrez-vous à domicile pour un particulier ou freelance ?",
    answer:
      "Oui, la livraison à domicile est possible partout en région PACA de manière régulière et sur devis pour le reste de la France métropolitaine. Précisez si un escalier ou un ascenseur est présent pour un devis exact.",
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

export default async function BureauOccasionPage() {
  const [landing, products] = await Promise.all([
    getNationalLandingByKey('bureau-occasion'),
    getProductsByCategoryDeep('bureau'),
  ])
  const productCards = products.slice(0, 8).map(sanityToCard)
  const faq = landing?.faq && landing.faq.length > 0 ? landing.faq : FALLBACK_FAQ
  const heroImageUrl = landing?.heroImage ? urlFor(landing.heroImage).width(1600).url() : undefined

  const schemas = [
    buildArticleSchema({
      pageUrl, headline: landing?.heroTitle || FALLBACK.heroTitle,
      description: landing?.seo?.metaDescription || landing?.heroIntro || FALLBACK.heroIntro,
      author: landing?.author || 'Équipe Mobilier Malin',
      publishedAt: landing?.publishedAt, lastUpdated: landing?.lastUpdated, heroImageUrl,
    }),
    buildBreadcrumbSchema({ siteUrl, items: [{ name: "Bureau d'occasion", href: '/bureau-occasion' }] }),
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${pageUrl}#collection`,
      name: "Bureaux d'occasion reconditionnés", url: pageUrl, isPartOf: { '@id': `${siteUrl}/#website` },
      ...(productCards.length > 0 && {
        mainEntity: {
          '@type': 'ItemList', numberOfItems: productCards.length,
          itemListElement: products.slice(0, 8).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${siteUrl}/produit/${p.slug.current}` })),
        },
      }),
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map((qa) => ({ '@type': 'Question', name: qa.question, acceptedAnswer: { '@type': 'Answer', text: qa.answer } })) },
    buildAggregateOfferSchema({ pageUrl, name: "Bureaux d'occasion", rows: landing?.pricingRanges || [] }),
    buildDefinedTermSetSchema({ pageUrl, name: 'Glossaire bureau', terms: landing?.glossary || [] }),
    buildVideoObjectSchema(landing?.videoEmbed),
  ].filter(Boolean)

  const toc = [
    { id: 'pourquoi', label: "Pourquoi acheter un bureau d'occasion en 2026 ?" },
    { id: 'formats', label: 'Quels formats de bureaux existent en occasion ?' },
    { id: 'teletravail', label: 'Quel bureau choisir pour le télétravail ?' },
    { id: 'freelance', label: 'Bureau pour freelance ou indépendant : que privilégier ?' },
    { id: 'verifier', label: 'Comment vérifier la qualité avant achat ?' },
    { id: 'budget', label: "Budget : combien prévoir selon l'usage ?" },
    { id: 'livraison', label: 'Livraison à domicile : comment ça se passe ?' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <NationalPageV2
        landing={landing} fallback={FALLBACK}
        breadcrumb={[{ name: "Bureau d'occasion" }]}
        ctas={[{ label: 'Voir tous les bureaux', href: '/categorie/bureau' }, { label: 'Poser une question', href: '/contact', variant: 'outline' }]}
        products={productCards} productsCtaHref="/categorie/bureau"
        productsTitle="Bureaux disponibles en stock"
        toc={toc}
        relatedLinks={[
          { href: '/mobilier-de-bureau-occasion', label: "L'univers complet du mobilier occasion", eyebrow: 'HUB' },
          { href: '/bureau-professionnel-occasion', label: "Version BtoB pour entreprises", eyebrow: 'Vertical' },
          { href: '/bureau-assis-debout-occasion', label: 'Bureau assis-debout d\'occasion', eyebrow: 'Vertical' },
          { href: '/fauteuil-ergonomique', label: 'Fauteuil ergonomique pour aller avec', eyebrow: 'Complément' },
          { href: '/chaise-bureau-occasion', label: 'Chaise de bureau d\'occasion', eyebrow: 'Complément' },
          { href: '/bureau-occasion-marseille', label: 'Livraison à Marseille', eyebrow: 'Local' },
          { href: '/bureau-occasion-aubagne', label: 'Livraison à Aubagne', eyebrow: 'Local' },
          { href: '/bureau-occasion-aix-en-provence', label: 'Livraison à Aix-en-Provence', eyebrow: 'Local' },
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
