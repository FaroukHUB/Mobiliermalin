import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Recycle,
  Building2,
  Truck,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { NationalDeliveryBanner } from '@/components/national/NationalDeliveryBanner'
import { NationalHero } from '@/components/national/NationalHero'
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
const pageUrl = `${siteUrl}/bureau-professionnel-occasion`

export const metadata: Metadata = {
  title: "Bureau professionnel d'occasion — Steelcase, Haworth, Vitra",
  description:
    "Bureaux professionnels d'occasion reconditionnés : droits, en angle, bench, assis-debout. Sélection de bureaux Steelcase, Haworth, Vitra et Majencia remis en état dans notre atelier local, avec livraison France.",
  keywords: [
    "bureau professionnel occasion",
    "bureau professionnel d'occasion",
    "bureau d'occasion professionnel",
    "bureau pro occasion",
    "mobilier bureau professionnel occasion",
    "bureau reconditionné",
    "bureau entreprise occasion",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Bureau professionnel d'occasion — Mobilier Malin",
    description:
      "Bureaux droits, angle, bench et assis-debout reconditionnés dans notre atelier local. Livraison France.",
    url: pageUrl,
    type: 'website',
  },
}

const FAQ = [
  {
    question: "Quelle est la différence entre un bureau professionnel et un bureau grand public ?",
    answer:
      "Un bureau professionnel est conçu pour un usage intensif quotidien : structure plus robuste, plateau plus épais, mécanismes durables et souvent une garantie plus longue. Les marques comme Steelcase, Haworth, Vitra ou Majencia proposent des modèles pensés pour équiper des entreprises pendant de nombreuses années.",
  },
  {
    question: "Un bureau reconditionné est-il fiable pour équiper une entreprise ?",
    answer:
      "Oui, à condition qu'il ait été correctement remis en état. Les bureaux professionnels des grandes marques sont conçus pour durer plusieurs cycles d'utilisation. Un bureau contrôlé, nettoyé, avec le mécanisme électrique testé si applicable, offre le même niveau de service qu'un modèle neuf pour un budget plus accessible.",
  },
  {
    question: "Quels types de bureaux professionnels reconditionnez-vous ?",
    answer:
      "Notre atelier reconditionne plusieurs formats : bureaux droits (1200 à 1800 mm), bureaux en L ou d'angle, benchs pour open space, bureaux assis-debout électriques ou manuels. La disponibilité varie selon les arrivages, il est utile de nous contacter pour un besoin précis ou en volume.",
  },
  {
    question: "Livrez-vous et installez-vous en entreprise ?",
    answer:
      "Nous livrons dans toute la région PACA de manière régulière et intervenons sur devis dans le reste de la France pour les commandes volumineuses. L'installation sur site est possible selon le volume et l'accès (étage, ascenseur). Les modalités précises sont établies avec chaque devis.",
  },
  {
    question: "Peut-on équiper progressivement un plateau ?",
    answer:
      "Oui, c'est fréquent. Nous gardons en mémoire les modèles commandés pour rester cohérent lors des commandes suivantes. Cela permet d'étaler l'investissement et de renouveler le mobilier au fil des besoins réels de l'entreprise.",
  },
  {
    question: "Fournissez-vous une attestation pour le reporting RSE ?",
    answer:
      "Oui, une attestation de valorisation est fournie pour chaque commande. Elle documente le mobilier remis en circulation et peut être intégrée aux rapports RSE ou aux marchés publics soumis à l'article 58 de la loi AGEC.",
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

export default async function BureauProfessionnelOccasionPage() {
  const landing = await getNationalLandingByKey('bureau-professionnel-occasion')
  const eyebrow = landing?.heroEyebrow || 'Sélection nationale'
  const title = landing?.heroTitle || "Bureau professionnel d'occasion"
  const intro = landing?.heroIntro || "Bureaux droits, bureaux d'angle, benchs open space et bureaux assis-debout, reconditionnés dans notre atelier local. Steelcase, Haworth, Vitra, Majencia et autres marques professionnelles, disponibles à l'unité ou en volume pour équiper un plateau complet."
  const heroImageUrl = landing?.heroImage
    ? urlFor(landing.heroImage).width(2400).height(1200).fit('crop').url()
    : null
  const sanityFaq = landing?.faq && landing.faq.length > 0 ? landing.faq : FAQ
  const products = await getProductsByCategoryDeep('bureau')
  const displayed = products.slice(0, 8)
  const productCards = displayed.map(sanityToCard)

  const collectionSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name: "Bureau professionnel d'occasion",
    description:
      "Sélection nationale de bureaux professionnels reconditionnés : Steelcase, Haworth, Vitra, Majencia.",
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

      <NationalHero
        breadcrumb={[{ name: "Bureau professionnel d'occasion" }]}
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        imageUrl={heroImageUrl}
        imageAlt={landing?.heroImage?.alt || title}
        ctas={[
          { label: 'Voir tous les bureaux', href: '/categorie/bureau' },
          { label: 'Devis en volume', href: '/contact', variant: 'outline' },
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
                  Structure, plateau, mécanismes, câblage électrique le cas
                  échéant : chaque bureau est vérifié avant sa mise en vente.
                  Les pièces manquantes ou défectueuses sont remplacées.
                </p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="bg-ivory p-6 border border-line h-full">
                <Building2 className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h2 className="font-serif text-lg text-ink mt-4">
                  Adapté aux plateaux entreprise
                </h2>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Nous équipons régulièrement des plateaux de plusieurs postes.
                  La disponibilité en série cohérente et le suivi dans la durée
                  permettent d'équiper progressivement sans casser l'harmonie
                  visuelle de l'espace.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160}>
              <div className="bg-ivory p-6 border border-line h-full">
                <Recycle className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h2 className="font-serif text-lg text-ink mt-4">
                  Démarche RSE documentée
                </h2>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Attestation de valorisation fournie pour chaque commande,
                  utile pour votre reporting extra-financier ou vos réponses
                  aux marchés publics soumis à l'article 58 de la loi AGEC.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Bloc éditorial court */}
      <section className="container py-14 md:py-20 max-w-3xl">
        <h2 className="font-serif text-h1 text-center leading-tight">
          Bien choisir son bureau professionnel d'occasion
        </h2>
        <div className="gold-divider mx-auto mt-6" />
        <div className="mt-8 space-y-5 text-ink-soft leading-relaxed">
          <p>
            Un bureau professionnel se distingue d'un modèle grand public
            par la robustesse de sa structure, l'épaisseur de son plateau
            et la qualité de ses mécanismes. Ces caractéristiques justifient
            un investissement plus élevé au neuf, mais rendent le
            reconditionnement particulièrement pertinent : ces bureaux sont
            conçus pour durer plusieurs cycles d'utilisation.
          </p>
          <p>
            Le choix du format dépend de l'usage. Un bureau droit convient
            à la plupart des postes individuels. Un bureau d'angle ou en L
            offre plus de surface de travail. Un bench s'intègre bien dans
            les open spaces et facilite la réorganisation. Les bureaux
            assis-debout, électriques ou manuels, permettent d'alterner les
            postures pour limiter la fatigue liée à la position assise
            prolongée.
          </p>
        </div>
      </section>

      {/* Grille produits */}
      <section className="container py-14 md:py-20 max-w-6xl">
        <div className="text-center mb-10">
          <p className="eyebrow">Notre stock</p>
          <h2 className="font-serif text-h1 mt-3">
            {productCards.length > 0
              ? 'Bureaux disponibles'
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
              <Link href="/categorie/bureau" className="btn-outline">
                Voir tous les bureaux
                <ArrowRight className="h-4 w-4 ml-1.5" strokeWidth={1.5} />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center bg-ivory-light border border-line p-10 max-w-2xl mx-auto">
            <p className="text-ink-soft">
              Notre stock évolue chaque semaine. Contactez-nous pour connaître
              les modèles actuellement disponibles ou pour un besoin en volume.
            </p>
            <Link href="/contact" className="btn-primary inline-flex mt-6">
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
            Ce que les entreprises nous demandent
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
          <p className="eyebrow text-gold">Équiper un plateau ou une équipe ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Devis personnalisé sous 24 h
          </h2>
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Décrivez votre besoin : nombre de postes, format des bureaux
            souhaité, contraintes d'espace ou de délai. Nous revenons vers
            vous avec une proposition adaptée à votre situation réelle.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink px-6 py-3 font-medium transition-colors"
            >
              Demander un devis
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link
              href="/mobilier-bureau-professionnel"
              className="text-ivory/80 hover:text-ivory underline underline-offset-4 text-sm inline-flex items-center gap-1.5"
            >
              Voir aussi notre offre mobilier complète
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
