import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { NationalDeliveryBanner } from '@/components/national/NationalDeliveryBanner'
import { NationalHero } from '@/components/national/NationalHero'
import { EditorialPortableText } from '@/components/portable-text/EditorialPortableText'
import type { PortableTextBlock } from 'next-sanity'
import { getProductsByBrand, getNationalLandingByKey, urlFor, type SanityProduct } from '@/lib/sanity'
import { BRAND_OFFICIAL_URL } from '@/lib/schema-mappings'

export const revalidate = 3600

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'
const pageUrl = `${siteUrl}/marques/steelcase`

export const metadata: Metadata = {
  title: 'Steelcase reconditionné — Leap V2, Think, Series 1, Gesture',
  description:
    "Mobilier Steelcase reconditionné dans notre atelier local : fauteuils Leap V2, Think, Series 1, Gesture, bureaux Migration Bench et rangements. Livraison France entière, contrôle qualité 7 points.",
  keywords: [
    'Steelcase',
    'Steelcase reconditionné',
    'Steelcase occasion',
    'Steelcase Leap V2',
    'Steelcase Think',
    'Steelcase Series 1',
    'Steelcase Gesture',
    'fauteuil Steelcase',
    'bureau Steelcase',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Steelcase reconditionné — Mobilier Malin',
    description:
      'Mobilier Steelcase reconditionné : fauteuils Leap V2, Think, bureaux, rangements. Contrôle qualité en atelier, livraison France.',
    url: pageUrl,
    type: 'website',
  },
}

const MODELS_HIGHLIGHT = [
  {
    name: 'Steelcase Leap V2',
    pitch:
      "Fauteuil ergonomique polyvalent, l'un des plus vendus au monde en usage professionnel. Réglages complets, mécanisme LiveBack qui suit la courbure du dos.",
  },
  {
    name: 'Steelcase Think',
    pitch:
      "Fauteuil ergonomique intuitif à faibles réglages. Le mécanisme s'adapte automatiquement au poids de l'utilisateur, idéal pour les postes partagés.",
  },
  {
    name: 'Steelcase Series 1',
    pitch:
      "Fauteuil d'entrée de gamme dans la gamme professionnelle Steelcase. Bon rapport qualité-prix, mesh dorsal respirant, réglages simples.",
  },
  {
    name: 'Steelcase Gesture',
    pitch:
      "Conçu pour les postures technologiques modernes : usage tablette, smartphone, ordinateur portable. Accoudoirs 360° particulièrement adaptables.",
  },
]

const FAQ = [
  {
    question: "Pourquoi choisir un fauteuil Steelcase reconditionné plutôt qu'un modèle neuf ?",
    answer:
      "Les fauteuils Steelcase sont conçus pour un usage professionnel intensif. Reconditionnés dans les règles, ils offrent le même niveau de réglages et de confort qu'un modèle neuf pour un budget nettement plus accessible. Steelcase est aussi l'une des marques dont les pièces détachées restent disponibles longtemps, ce qui facilite le reconditionnement.",
  },
  {
    question: "Quel est le meilleur modèle Steelcase pour un usage quotidien intensif ?",
    answer:
      "Le Steelcase Leap V2 reste la référence pour un usage professionnel de plusieurs heures par jour. Il propose l'ensemble des réglages ergonomiques importants (hauteur d'assise, profondeur, soutien lombaire, accoudoirs 4D, tension de basculement) et son mécanisme LiveBack accompagne les mouvements du dos. Le Steelcase Gesture convient particulièrement aux personnes qui alternent ordinateur, tablette et smartphone.",
  },
  {
    question: "Comment identifier un vrai fauteuil Steelcase ?",
    answer:
      "Chaque fauteuil Steelcase authentique porte une plaque signalétique sous l'assise indiquant le modèle, la référence, la date de fabrication et le numéro de série. La qualité perçue au toucher (mécanismes en aluminium moulé, mousses haute densité, coutures régulières) reste également un bon indicateur. Nos fauteuils Steelcase reconditionnés sont vérifiés à ce niveau avant reconditionnement.",
  },
  {
    question: "Les fauteuils Steelcase reconditionnés sont-ils garantis ?",
    answer:
      "La garantie légale de conformité et la garantie légale contre les vices cachés s'appliquent à tout achat en France. Les pièces d'usure remplacées lors du reconditionnement (vérin, roulettes, mousse le cas échéant) sont couvertes selon nos conditions générales. Contactez-nous pour les modalités précises selon le modèle.",
  },
  {
    question: "Que fournissez-vous d'autre en Steelcase que les fauteuils ?",
    answer:
      "Selon les arrivages, notre stock peut également inclure des bureaux Steelcase (Migration Bench, Ology assis-debout), des tables de réunion et des solutions de rangement. La disponibilité varie, il est utile de nous contacter pour un besoin précis ou pour équiper un plateau complet.",
  },
  {
    question: "Livrez-vous les fauteuils Steelcase partout en France ?",
    answer:
      "Nous livrons dans toute la région PACA de manière régulière et intervenons dans le reste de la France sur devis. Le retrait au showroom d'Aubagne reste possible sur rendez-vous. Toutes les zones sont détaillées sur notre page dédiée aux zones desservies.",
  },
]

function sanityToCard(p: SanityProduct): ProductCardData {
  const firstImage = p.images?.[0]
  const imageUrl = firstImage
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
  }
}

export default async function MarqueSteelcasePage() {
  const landing = await getNationalLandingByKey('marques-steelcase')
  const eyebrow = landing?.heroEyebrow || 'Marque professionnelle'
  const title = landing?.heroTitle || 'Steelcase reconditionné'
  const intro = landing?.heroIntro || 'Fauteuils Leap V2, Think, Series 1, Gesture, bureaux Migration Bench et solutions de rangement Steelcase, remis en état dans notre atelier local. Une gamme professionnelle conçue pour un usage intensif, disponible avec livraison France entière ou retrait au showroom.'
  const heroImageUrl = landing?.heroImage
    ? urlFor(landing.heroImage).width(2400).height(1200).fit('crop').url()
    : null
  const sanityFaq = landing?.faq && landing.faq.length > 0 ? landing.faq : FAQ
  const products = await getProductsByBrand('Steelcase')
  const displayed = products.slice(0, 8)
  const productCards = displayed.map(sanityToCard)

  const officialUrl = BRAND_OFFICIAL_URL['Steelcase']

  const collectionSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name: 'Mobilier Steelcase reconditionné',
    description:
      'Sélection de mobilier Steelcase reconditionné dans notre atelier : fauteuils, bureaux, rangements.',
    url: pageUrl,
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: {
      '@type': 'Brand',
      name: 'Steelcase',
      ...(officialUrl && { sameAs: officialUrl }),
    },
  }
  if (displayed.length > 0) {
    collectionSchema.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: displayed.length,
      itemListElement: displayed.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}/produit/${p.slug.current}`,
      })),
    }
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: sanityFaq.map((qa: { question: string; answer: string }) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: { '@type': 'Answer', text: qa.answer },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([collectionSchema, faqSchema]),
        }}
      />

      <NationalHero
        breadcrumb={[
          { name: 'Marques', href: '/marques' },
          { name: 'Steelcase' },
        ]}
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        imageUrl={heroImageUrl}
        imageAlt={landing?.heroImage?.alt || title}
        ctas={[
          { label: 'Voir tous les Steelcase', href: '/boutique' },
          { label: 'Rechercher un modèle précis', href: '/contact', variant: 'outline' },
        ]}
      />

      {landing?.body && Array.isArray(landing.body) && landing.body.length > 0 && (
        <section className="container py-12 md:py-16 max-w-3xl">
          <EditorialPortableText value={landing.body as PortableTextBlock[]} />
        </section>
      )}

      {/* Arguments */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-14 md:py-20 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            <Reveal>
              <div className="bg-ivory p-6 border border-line h-full">
                <ShieldCheck className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h2 className="font-serif text-lg text-ink mt-4">
                  Contrôle qualité en atelier
                </h2>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Structure, mécanisme LiveBack, vérin, mousses, tissu ou
                  mesh : chaque fauteuil Steelcase est vérifié avant sa mise
                  en vente. Les pièces d'usure sont remplacées si nécessaire.
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="bg-ivory p-6 border border-line h-full">
                <Sparkles className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h2 className="font-serif text-lg text-ink mt-4">
                  Une marque conçue pour durer
                </h2>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Steelcase équipe les grands sièges sociaux du monde entier.
                  Les modèles professionnels sont conçus pour un usage
                  quotidien de plusieurs heures pendant de nombreuses années,
                  ce qui les rend particulièrement adaptés au reconditionnement.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="bg-ivory p-6 border border-line h-full">
                <Award className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h2 className="font-serif text-lg text-ink mt-4">
                  Attestation RSE fournie
                </h2>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Attestation de valorisation pour chaque commande. Les
                  fauteuils Steelcase reconditionnés remis en circulation
                  contribuent à limiter l'empreinte carbone du renouvellement
                  mobilier en entreprise.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Modèles emblématiques */}
      <section className="container py-14 md:py-20 max-w-5xl">
        <div className="text-center mb-10">
          <p className="eyebrow">Les modèles Steelcase</p>
          <h2 className="font-serif text-h1 mt-3">
            Quatre références professionnelles à connaître
          </h2>
          <div className="gold-divider mx-auto mt-6" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {MODELS_HIGHLIGHT.map((m, i) => (
            <Reveal key={m.name} delay={i * 60}>
              <article className="bg-ivory border border-line p-6 h-full">
                <h3 className="font-serif text-xl text-ink">{m.name}</h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  {m.pitch}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          <Link
            href="/guides/ergonomie/fauteuil-de-bureau-ergonomique-mal-de-dos"
            className="group flex items-center justify-between gap-3 p-4 bg-ivory-light border border-line hover:border-gold transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gold" strokeWidth={1.5} />
              <span className="font-medium text-ink text-sm">
                Fauteuil ergonomique et mal de dos : comment choisir
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-gold group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </Link>
          <Link
            href="/fauteuil-ergonomique"
            className="group flex items-center justify-between gap-3 p-4 bg-ivory-light border border-line hover:border-gold transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gold" strokeWidth={1.5} />
              <span className="font-medium text-ink text-sm">
                Notre sélection de fauteuils ergonomiques reconditionnés
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-gold group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* Grille produits */}
      <section className="container py-14 md:py-20 max-w-6xl">
        <div className="text-center mb-10">
          <p className="eyebrow">Notre stock Steelcase</p>
          <h2 className="font-serif text-h1 mt-3">
            {productCards.length > 0
              ? 'Produits Steelcase disponibles'
              : 'Bientôt en ligne'}
          </h2>
          <div className="gold-divider mx-auto mt-6" />
        </div>

        {productCards.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {productCards.map((c, i) => (
                <Reveal key={c.id} delay={i * 40}>
                  <ProductCard product={c} />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/boutique" className="btn-outline">
                Explorer tout le catalogue
                <ArrowRight className="h-4 w-4 ml-1.5" strokeWidth={1.5} />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center bg-ivory-light border border-line p-10 max-w-2xl mx-auto">
            <p className="text-ink-soft">
              Notre stock Steelcase évolue au rythme des arrivages. Contactez-nous
              pour un modèle précis, nous vous informerons dès qu'il est
              disponible.
            </p>
            <Link href="/contact" className="btn-primary inline-flex mt-6">
              Rechercher un Steelcase
            </Link>
          </div>
        )}
      </section>

      <NationalDeliveryBanner />

      {/* FAQ */}
      <section className="container py-16 md:py-20 max-w-3xl">
        <div className="text-center mb-10">
          <p className="eyebrow">Questions fréquentes</p>
          <h2 className="font-serif text-h1 mt-3">
            À propos du mobilier Steelcase reconditionné
          </h2>
          <div className="gold-divider mx-auto mt-6" />
        </div>
        <div className="space-y-3">
          {sanityFaq.map((qa: { question: string; answer: string }, i: number) => (
            <details
              key={i}
              className="group bg-ivory-light border border-line hover:border-gold/40 transition-colors"
            >
              <summary className="cursor-pointer p-5 flex items-center justify-between gap-4 list-none">
                <span className="font-serif text-base md:text-lg text-ink leading-snug">
                  {qa.question}
                </span>
                <span className="text-gold text-2xl transition-transform group-open:rotate-45 leading-none shrink-0">
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm md:text-base text-ink-soft leading-relaxed">
                {qa.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-ink text-ivory py-14 md:py-20">
        <div className="container max-w-3xl text-center">
          <p className="eyebrow text-gold">Cherche un modèle Steelcase précis ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Nous vous alertons dès sa disponibilité
          </h2>
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Si votre modèle exact n'est pas en stock actuellement, indiquez-nous
            la référence recherchée et vos contraintes (taille, coloris, budget).
            Nous vous préviendrons dès qu'il arrive à l'atelier.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink px-6 py-3 font-medium transition-colors"
            >
              Nous contacter
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
