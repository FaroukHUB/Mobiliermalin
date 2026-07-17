import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, Award, Sparkles, BookOpen } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { NationalDeliveryBanner } from '@/components/national/NationalDeliveryBanner'
import { EditorialPortableText } from '@/components/portable-text/EditorialPortableText'
import type { PortableTextBlock } from 'next-sanity'
import {
  getProductsByCategoryDeep,
  getNationalLandingByKey,
  urlFor,
  type SanityProduct,
} from '@/lib/sanity'

export const revalidate = 3600

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'
const pageUrl = `${siteUrl}/fauteuil-ergonomique`

export const metadata: Metadata = {
  title: 'Fauteuil ergonomique reconditionné — Steelcase, Herman Miller, Vitra',
  description:
    "Fauteuil ergonomique reconditionné pour le télétravail et l'usage professionnel intensif. Sélection de modèles Steelcase, Herman Miller, Haworth et Vitra remis en état dans notre atelier local, avec livraison France.",
  keywords: [
    'fauteuil ergonomique',
    'fauteuil ergonomique reconditionné',
    'fauteuil ergonomique occasion',
    'fauteuil de bureau ergonomique',
    'chaise ergonomique',
    'siège ergonomique bureau',
    'Steelcase Leap V2',
    'Herman Miller Aeron',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Fauteuil ergonomique reconditionné — Mobilier Malin',
    description:
      "Sélection de fauteuils ergonomiques Steelcase, Herman Miller, Vitra reconditionnés dans notre atelier local.",
    url: pageUrl,
    type: 'website',
  },
}

const FAQ = [
  {
    question: "Qu'est-ce qui rend un fauteuil de bureau vraiment ergonomique ?",
    answer:
      "Un fauteuil ergonomique offre au minimum cinq réglages indépendants : hauteur d'assise, profondeur d'assise, soutien lombaire, hauteur des accoudoirs et tension du basculement. Ces réglages permettent d'adapter le siège à la morphologie de l'utilisateur et à la durée d'utilisation. Le confort perçu au premier essai ne suffit pas à déterminer la qualité ergonomique d'un modèle.",
  },
  {
    question: "Un fauteuil ergonomique reconditionné vaut-il un modèle neuf ?",
    answer:
      "Pour les grandes marques professionnelles (Steelcase, Herman Miller, Vitra, Haworth), oui, à condition que le fauteuil ait été correctement remis en état par un professionnel. Un fauteuil reconditionné dans les règles peut offrir un confort comparable à celui d'un modèle neuf pour un budget nettement plus accessible.",
  },
  {
    question: "Quelle marque de fauteuil ergonomique choisir ?",
    answer:
      "Le choix dépend principalement de votre morphologie, de votre usage quotidien et de votre budget. Les grandes marques professionnelles proposent des modèles conçus pour un usage intensif : Steelcase Leap V2, Herman Miller Aeron, Haworth Zody, Vitra Physix ou HÅG Capisco. Chacune a ses spécificités, et le meilleur fauteuil reste celui qui s'adapte à vous.",
  },
  {
    question: "Comment savoir si mon fauteuil actuel est vraiment adapté ?",
    answer:
      "Plusieurs signes peuvent alerter : douleurs récurrentes après une journée de travail, sensation de glisser vers l'avant du siège, besoin fréquent de changer de position, dossier qui ne revient plus. Notre guide « Quel fauteuil de bureau ergonomique choisir pour le mal de dos » détaille les critères à vérifier avant de remplacer un siège.",
  },
  {
    question: "Livrez-vous partout en France ?",
    answer:
      "Nous livrons dans toute la région PACA de manière régulière et intervenons dans le reste de la France sur devis pour les commandes volumineuses. Le retrait au showroom d'Aubagne reste possible sur rendez-vous. Toutes les zones sont détaillées sur notre page dédiée aux zones desservies.",
  },
  {
    question: "Puis-je essayer un fauteuil avant l'achat ?",
    answer:
      "Oui, notre showroom se trouve à La Penne-sur-Huveaune, à 5 minutes d'Aubagne et 20 minutes de Marseille. Vous pouvez essayer plusieurs modèles sur rendez-vous du lundi au samedi, sans engagement. Pour les visiteurs éloignés, nous conseillons également par téléphone selon votre morphologie et votre usage.",
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

export default async function FauteuilErgonomiquePage() {
  // Fetch Sanity landing (contenu éditable) + produits en parallèle
  const [landing, primaryProducts] = await Promise.all([
    getNationalLandingByKey('fauteuil-ergonomique'),
    getProductsByCategoryDeep('fauteuils-ergonomiques'),
  ])
  const products =
    primaryProducts.length > 0
      ? primaryProducts
      : await getProductsByCategoryDeep('fauteuil')
  const displayed = products.slice(0, 8)
  const productCards = displayed.map(sanityToCard)

  // Overrides Sanity (fallback sur les valeurs hardcodées si le
  // document n'existe pas ou n'est pas encore rempli).
  const eyebrow = landing?.heroEyebrow || 'Sélection nationale'
  const title = landing?.heroTitle || 'Fauteuil ergonomique reconditionné'
  const intro =
    landing?.heroIntro ||
    "Sélection de fauteuils ergonomiques Steelcase, Herman Miller, Vitra et Haworth, remis en état dans notre atelier local. Des modèles conçus pour un usage professionnel intensif, disponibles avec livraison partout en France ou retrait au showroom."
  const heroImageUrl = landing?.heroImage
    ? urlFor(landing.heroImage).width(2400).height(1200).fit('crop').url()
    : null
  const sanityFaq = landing?.faq && landing.faq.length > 0 ? landing.faq : FAQ

  const collectionSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name: "Fauteuil ergonomique reconditionné",
    description:
      "Sélection nationale de fauteuils ergonomiques reconditionnés : Steelcase, Herman Miller, Haworth, Vitra.",
    url: pageUrl,
    isPartOf: { '@id': `${siteUrl}/#website` },
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

      <Breadcrumbs items={[{ name: 'Fauteuil ergonomique' }]} />

      {/* Hero */}
      <section className="container py-14 md:py-20 max-w-4xl text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="text-display font-serif mt-4 leading-[1.05]">
          {title}
        </h1>
        <div className="gold-divider mx-auto mt-6" />
        <p className="mt-8 text-lg text-ink-soft leading-relaxed whitespace-pre-line">
          {intro}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/boutique" className="btn-primary">
            Voir la sélection
            <ArrowRight className="h-4 w-4 ml-1.5" strokeWidth={1.5} />
          </Link>
          <Link href="/contact" className="btn-outline">
            Demander conseil
          </Link>
        </div>
      </section>

      {heroImageUrl && (
        <section className="container max-w-6xl">
          <div className="relative aspect-[21/9] bg-ivory-dark overflow-hidden">
            <Image
              src={heroImageUrl}
              alt={landing?.heroImage?.alt || title}
              fill
              priority
              sizes="(min-width: 1024px) 1200px, 100vw"
              className="object-cover"
              unoptimized={heroImageUrl.startsWith('http') && !heroImageUrl.includes('cdn.sanity.io')}
            />
          </div>
        </section>
      )}

      {/* Corps éditorial Sanity (rendu seulement si l'admin a rempli le champ body) */}
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
                  Contrôle qualité 7 points
                </h2>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Structure, mécanismes, vérin, mousse, tissu, roulettes et
                  sécurité : chaque fauteuil est vérifié avant sa mise en
                  vente. Les pièces d'usure sont remplacées si nécessaire.
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="bg-ivory p-6 border border-line h-full">
                <Sparkles className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h2 className="font-serif text-lg text-ink mt-4">
                  Marques professionnelles
                </h2>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Steelcase, Herman Miller, Vitra, Haworth, HÅG : des
                  fauteuils conçus pour un usage quotidien de plusieurs
                  heures, avec des réglages complets et une durée de vie
                  pensée pour durer.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="bg-ivory p-6 border border-line h-full">
                <Award className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h2 className="font-serif text-lg text-ink mt-4">
                  Démarche RSE documentée
                </h2>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Une attestation de valorisation est fournie pour chaque
                  commande. Le mobilier reconditionné remis en circulation
                  contribue à limiter l'impact environnemental des achats
                  professionnels.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Bloc éditorial court */}
      <section className="container py-14 md:py-20 max-w-3xl">
        <h2 className="font-serif text-h1 text-center leading-tight">
          Comment choisir un fauteuil ergonomique adapté à votre usage
        </h2>
        <div className="gold-divider mx-auto mt-6" />
        <div className="mt-8 space-y-5 text-ink-soft leading-relaxed">
          <p>
            Un fauteuil ergonomique n'est pas simplement un fauteuil confortable.
            Il s'adapte à votre morphologie grâce à plusieurs réglages
            indépendants : hauteur et profondeur d'assise, soutien lombaire,
            accoudoirs et tension du basculement. La qualité de ces réglages
            distingue un vrai fauteuil professionnel d'un modèle grand public.
          </p>
          <p>
            Pour un usage inférieur à quatre heures par jour, un modèle
            intermédiaire peut convenir. Au-delà, il devient préférable de se
            tourner vers un fauteuil conçu pour un usage professionnel intensif,
            avec un soutien lombaire réglable et des matériaux durables. Nos
            guides détaillent ces critères et les erreurs à éviter avant achat.
          </p>
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
            href="/guides/ergonomie/chaise-gaming-vs-chaise-ergonomique"
            className="group flex items-center justify-between gap-3 p-4 bg-ivory-light border border-line hover:border-gold transition-colors"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gold" strokeWidth={1.5} />
              <span className="font-medium text-ink text-sm">
                Chaise gaming ou ergonomique : que choisir pour travailler
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-gold group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      {/* Grille produits */}
      <section className="container py-14 md:py-20 max-w-6xl">
        <div className="text-center mb-10">
          <p className="eyebrow">Notre stock</p>
          <h2 className="font-serif text-h1 mt-3">
            {productCards.length > 0
              ? 'Fauteuils ergonomiques disponibles'
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
              <Link href="/categorie/fauteuil" className="btn-outline">
                Voir tous les fauteuils
                <ArrowRight className="h-4 w-4 ml-1.5" strokeWidth={1.5} />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center bg-ivory-light border border-line p-10 max-w-2xl mx-auto">
            <p className="text-ink-soft">
              Notre stock évolue chaque semaine. Contactez-nous pour connaître
              les modèles actuellement disponibles ou vous inscrire à notre
              alerte stock.
            </p>
            <Link
              href="/contact"
              className="btn-primary inline-flex mt-6"
            >
              Nous contacter
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
            Ce que vous devez savoir avant d'acheter
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
          <p className="eyebrow text-gold">Une question ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Notre équipe vous aide à choisir
          </h2>
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Décrivez-nous votre morphologie et votre usage : nous vous
            orientons vers deux ou trois modèles pertinents dans notre stock
            actuel, sans engagement.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink px-6 py-3 font-medium transition-colors"
            >
              Recevoir un conseil
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
