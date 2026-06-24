import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Phone,
  Mail,
  Truck,
  Quote,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PackageSearch,
  Hammer,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import {
  getLatestProductsByCategoryDeep,
  getCategoryChildren,
  getLocalPage,
  urlFor,
  type SanityProduct,
} from '@/lib/sanity'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { LEGAL } from '@/lib/legal'

const CATEGORY_SLUG = 'bureau'
const PAGE_KEY = 'bureau-nice'
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Bureau de marque reconditionné, marché du mobilier d\'occasion à Nice'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Bureaux d\'occasion à Nice — Steelcase, Vitra, Haworth livrés',
  description:
    'Bureaux reconditionnés de marque livrés à Nice et sur la Côte d\'Azur. Steelcase, Haworth, Vitra inspectés et garantis 6 mois. Devis livraison sous 24 h, alternative retrait à 2 h 30 par l\'A8.',
  keywords: [
    'bureau occasion Nice',
    'bureau d\'occasion Nice',
    'mobilier bureau Nice',
    'bureau Steelcase Nice',
    'bureau professionnel Côte d\'Azur',
    'bureau reconditionné Nice',
    'mobilier bureau occasion 06',
  ],
  alternates: { canonical: `${siteUrl}/bureau-occasion-nice` },
  openGraph: {
    title: 'Bureaux d\'occasion à Nice — Mobilier Malin',
    description:
      'Steelcase, Haworth, Vitra reconditionnés livrés à Nice. Garantie 6 mois, devis livraison sous 24 h.',
    url: `${siteUrl}/bureau-occasion-nice`,
    type: 'website',
  },
}

const REVIEWS = [
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité.",
    context: 'Équipement complet — économies réalisées',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top — petit message également pour les livreurs qui ont été au top.",
    context: 'Achat + livraison — service complet',
  },
  {
    author: 'Nono',
    date: '2026-02',
    text: "J'ai acheté un caisson avec dossiers suspendus, en bon état, en métal blanc comme je voulais. 30 € pas cher du tout.",
    context: 'Achat unitaire — rapport qualité-prix',
  },
] as const

// 4 raisons distinctives — propre à Nice, pas de répétition Marseille/Aubagne/Aix
const RAISONS_NICE = [
  {
    icon: PackageSearch,
    title: 'Le sourcing marque qui manque sur la Côte',
    text:
      "Sur Le Bon Coin azuréen, on trouve surtout du mobilier anonyme sans traçabilité ni garantie. Notre atelier remet en état du Steelcase, Vitra, Haworth, Herman Miller — des marques pensées pour tenir vingt ans en open space. La rareté locale justifie la distance.",
  },
  {
    icon: Hammer,
    title: 'Un atelier qui inspecte, ne se contente pas de revendre',
    text:
      "Chaque bureau passe par notre atelier de La Penne-sur-Huveaune : mécanismes vérifiés, vérins testés sur les assis-debout, plateaux retouchés si besoin, nettoyage en profondeur. C'est cette étape qui sépare l'occasion de la brocante.",
  },
  {
    icon: ShieldCheck,
    title: 'Garantie six mois — même livré à 200 km',
    text:
      "La distance ne change rien à la garantie. Tout poste vendu est couvert six mois, pièces et main-d'œuvre. Si un mécanisme cède pendant cette période, on règle le problème, point.",
  },
  {
    icon: Sparkles,
    title: 'Des prix qui absorbent le coût de livraison',
    text:
      "Un bureau Steelcase neuf à Nice : 900 à 1 400 €. Le même reconditionné par nos soins : 250 à 450 €, livraison incluse dans le devis. L'écart finance largement le déplacement, surtout dès qu'on équipe plusieurs postes.",
  },
]

const CONDITION_KEYS: Record<string, string> = {
  new: 'new',
  excellent: 'excellent',
  'very-good': 'very-good',
  good: 'good',
  fair: 'fair',
}

function sanityToCard(p: SanityProduct): ProductCardData {
  const firstImage = p.images?.[0]
  const imageUrl = firstImage
    ? urlFor(firstImage).width(800).height(800).fit('crop').url()
    : undefined
  return {
    id: p._id,
    slug: p.slug.current,
    title: p.name,
    shortDescription: p.shortDescription,
    price: p.price,
    comparePrice: p.comparePrice,
    condition: p.condition ? CONDITION_KEYS[p.condition] : undefined,
    brandName: p.brand,
    imageUrl,
    imageAlt: firstImage?.alt || p.name,
    status: 'published',
  }
}

export default async function NicePage() {
  const [latestProducts, subCategories, localPage] = await Promise.all([
    getLatestProductsByCategoryDeep(CATEGORY_SLUG, 4),
    getCategoryChildren(CATEGORY_SLUG),
    getLocalPage(PAGE_KEY),
  ])

  const heroImageUrl = localPage.heroImage
    ? urlFor(localPage.heroImage).width(2000).url()
    : FALLBACK_HERO_URL
  const heroImageAlt = localPage.heroImage?.alt || FALLBACK_HERO_ALT

  const featuredCategories = subCategories.slice(0, 4)
  const productCards = latestProducts.map(sanityToCard)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Mobilier de bureau à Nice',
        item: `${siteUrl}/bureau-occasion-nice`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness-nice`,
    name: 'Mobilier Malin — Mobilier de bureau d\'occasion livré à Nice',
    description:
      'Vente et livraison de mobilier de bureau reconditionné Steelcase, Herman Miller, Haworth, Vitra à Nice et sur la Côte d\'Azur depuis notre atelier de La Penne-sur-Huveaune.',
    url: `${siteUrl}/bureau-occasion-nice`,
    telephone: LEGAL.telephoneTel,
    email: LEGAL.email,
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: LEGAL.showroom.ligne1,
      addressLocality: LEGAL.showroom.ville,
      postalCode: LEGAL.showroom.codePostal,
      addressRegion: 'Provence-Alpes-Côte d\'Azur',
      addressCountry: 'FR',
    },
    areaServed: [
      { '@type': 'City', name: 'Nice' },
      { '@type': 'City', name: 'Cagnes-sur-Mer' },
      { '@type': 'City', name: 'Saint-Laurent-du-Var' },
      { '@type': 'City', name: 'Antibes' },
      { '@type': 'City', name: 'Sophia Antipolis' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '3',
      bestRating: '5',
      worstRating: '1',
    },
    review: REVIEWS.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      datePublished: `${r.date}-01`,
      reviewBody: r.text,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* ═══ HERO ═══ */}
      <section className="relative bg-ink text-ivory overflow-hidden min-h-[520px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={heroImageUrl}
            alt={heroImageAlt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/75 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        </div>

        <div className="container relative py-16 md:py-24 w-full">
          <nav aria-label="Fil d'Ariane" className="text-xs text-ivory/60">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link href="/" className="hover:text-gold">Accueil</Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li className="text-gold">Bureaux d&apos;occasion à Nice</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Nice &amp; Côte d&apos;Azur</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Bureaux d&apos;occasion livrés à Nice
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Steelcase, Haworth, Vitra, Herman Miller — du mobilier de bureau
              de marque, inspecté en atelier, livré sur Nice et toute la Côte
              d&apos;Azur. Notre activité est basée à La Penne-sur-Huveaune ;
              on dessert Nice par l&apos;A8, environ deux heures et demie de
              route. Devis livraison transmis sous 24 h ouvrées.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
                Demander un devis livraison
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <a href={`tel:${LEGAL.telephoneTel}`} className="btn-outline-light">
                {LEGAL.telephone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INTRO — POURQUOI VENIR CHERCHER UN MARSEILLAIS DEPUIS NICE ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Acheter à 200 km, est-ce que ça a du sens ?</p>
          <h2 className="text-display mt-3 font-serif">
            Sur Nice, le marché de l&apos;occasion est saturé d&apos;anonyme.
            On vient remplir le vide laissé par les marques.
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Le marché de l&apos;occasion à Nice est dynamique — Le Bon Coin,
              Vinted Pro, dépôts-vente, brocanteurs. Mais quand on cherche un
              vrai bureau de marque, inspecté, garanti, livré, on tombe vite
              dans un trou. Le matériel pro tertiaire de qualité circule
              surtout entre Lyon et Marseille, où se trouvent les grandes
              entreprises qui renouvellent leurs plateaux régulièrement.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Notre atelier récupère ces flux, démonte, inspecte, nettoie,
              remonte. Le résultat : un Steelcase ou un Vitra qui a vécu
              cinq à huit ans, qui en a encore dix devant lui, et qu&apos;on
              vend à un tiers du neuf — frais de livraison Nice compris dans
              le devis. Pour une PME azuréenne qui équipe plus de trois
              postes, l&apos;équation est rentable, même à 200 km.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ 4 RAISONS — STRUCTURE NEUVE (≠ 3 profils Aix, ≠ FAQ Aubagne, ≠ paths Marseille) ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <p className="eyebrow">Quatre raisons concrètes</p>
              <h2 className="text-display mt-3 font-serif">
                Pourquoi des entreprises niçoises commandent chez un
                marseillais
              </h2>
              <div className="gold-divider mx-0 mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {RAISONS_NICE.map((raison, i) => {
              const Icon = raison.icon
              return (
                <Reveal key={raison.title} delay={i * 80}>
                  <article className="bg-ivory border border-line p-7 md:p-8 h-full">
                    <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
                    <h3 className="font-serif text-xl text-ink mt-5 leading-tight">
                      {raison.title}
                    </h3>
                    <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                      {raison.text}
                    </p>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ DERNIERS BUREAUX ARRIVÉS ═══ */}
      {productCards.length > 0 && (
        <section className="container py-16 md:py-24">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="eyebrow">Arrivés à l&apos;atelier</p>
                <h2 className="text-display mt-3 font-serif leading-[1.05]">
                  Nos derniers bureaux disponibles
                </h2>
                <div className="gold-divider mx-0 mt-6" />
              </div>
              <Link href="/categorie/bureau" className="text-sm text-gold-dark hover:text-gold underline underline-offset-4 self-end">
                Voir tous les bureaux →
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {productCards.map((card, i) => (
              <Reveal key={card.id} delay={i * 60}>
                <ProductCard product={card} />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-8 text-sm text-ink-mute text-center max-w-2xl mx-auto">
              Le stock évolue. Si vous cherchez un modèle précis qui
              n&apos;apparaît pas, demandez-nous par téléphone ou par mail —
              on l&apos;a peut-être en réserve, ou il peut arriver à la
              prochaine vague de récupération.
            </p>
          </Reveal>
        </section>
      )}

      {/* ═══ MODE LIVRAISON NICE — SANS INVENTER DE TOURNÉES ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="eyebrow text-gold">Comment ça se passe</p>
                <h2 className="text-display mt-3 font-serif text-ivory leading-[1.05]">
                  La livraison à Nice, étape par étape
                </h2>
                <div className="h-px w-16 bg-gold mt-8" />
              </div>
            </Reveal>

            <div className="space-y-6">
              <Reveal>
                <article className="border-l-2 border-gold pl-6 pb-2">
                  <p className="text-xs uppercase tracking-widest text-gold">Étape 1</p>
                  <h3 className="font-serif text-xl text-ivory mt-2">
                    Vous nous indiquez votre besoin
                  </h3>
                  <p className="mt-3 text-ivory/75 leading-relaxed text-sm">
                    Soit en parcourant le catalogue et en demandant un devis
                    sur la fiche produit, soit par téléphone si vous avez
                    déjà une idée précise du volume (5 bureaux, 20 postes
                    complets, etc.).
                  </p>
                </article>
              </Reveal>

              <Reveal delay={80}>
                <article className="border-l-2 border-gold pl-6 pb-2">
                  <p className="text-xs uppercase tracking-widest text-gold">Étape 2</p>
                  <h3 className="font-serif text-xl text-ivory mt-2">
                    Devis livraison personnalisé sous 24 h ouvrées
                  </h3>
                  <p className="mt-3 text-ivory/75 leading-relaxed text-sm">
                    On vous transmet un PDF détaillé : produit, transport
                    A8 jusqu&apos;à votre adresse niçoise, accès, étage,
                    montage si besoin. Pas de tarif générique opaque — le
                    coût exact dépend de votre cas.
                  </p>
                </article>
              </Reveal>

              <Reveal delay={160}>
                <article className="border-l-2 border-gold pl-6 pb-2">
                  <p className="text-xs uppercase tracking-widest text-gold">Étape 3</p>
                  <h3 className="font-serif text-xl text-ivory mt-2">
                    Paiement sécurisé en ligne
                  </h3>
                  <p className="mt-3 text-ivory/75 leading-relaxed text-sm">
                    Vous validez le devis directement depuis l&apos;email
                    reçu (Stripe). Aucune avance demandée tant que vous
                    n&apos;avez pas accepté.
                  </p>
                </article>
              </Reveal>

              <Reveal delay={240}>
                <article className="border-l-2 border-gold pl-6 pb-2">
                  <p className="text-xs uppercase tracking-widest text-gold">Étape 4</p>
                  <h3 className="font-serif text-xl text-ivory mt-2">
                    Livraison Nice et garantie 6 mois
                  </h3>
                  <p className="mt-3 text-ivory/75 leading-relaxed text-sm">
                    Date convenue ensemble, déchargement sur place, mise en
                    place si demandée. Garantie six mois activée le jour de
                    la livraison — un mécanisme défaillant, on revient ou
                    on échange.
                  </p>
                </article>
              </Reveal>

              <Reveal delay={320}>
                <article className="border-l-2 border-ivory/30 pl-6">
                  <p className="text-xs uppercase tracking-widest text-ivory/50">
                    Alternative
                  </p>
                  <h3 className="font-serif text-xl text-ivory mt-2">
                    Vous venez à La Penne-sur-Huveaune
                  </h3>
                  <p className="mt-3 text-ivory/75 leading-relaxed text-sm">
                    2 h 30 par l&apos;A8 depuis Nice, sortie La
                    Penne-sur-Huveaune. Showroom de 200 m², visite sur
                    rendez-vous, lundi-samedi 10 h-18 h. Café offert. Vous
                    repartez avec votre commande dans le coffre.
                  </p>
                </article>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ AVIS GOOGLE ═══ */}
      <section className="container py-16 md:py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="eyebrow">Avis Google vérifiés</p>
            <h2 className="text-display mt-3 font-serif">
              Ce que disent les entreprises qu&apos;on équipe
            </h2>
            <div className="gold-divider mt-6" />
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {REVIEWS.map((review, i) => (
            <Reveal key={review.author} delay={i * 80}>
              <article className="bg-ivory-light border border-line p-6 md:p-7 h-full flex flex-col">
                <Quote className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <p className="mt-4 text-ink-soft leading-relaxed italic flex-1">
                  « {review.text} »
                </p>
                <footer className="mt-5 pt-5 border-t border-line">
                  <p className="font-serif text-base text-ink">{review.author}</p>
                  <p className="text-xs text-ink-mute mt-1">
                    ★★★★★ &nbsp;·&nbsp; {review.context}
                  </p>
                </footer>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ SOUS-CATÉGORIES BUREAU ═══ */}
      {featuredCategories.length > 0 && (
        <section className="bg-ivory-dark border-y border-line">
          <div className="container py-16 md:py-24">
            <Reveal>
              <div className="max-w-2xl mb-10">
                <p className="eyebrow">Types de bureaux</p>
                <h2 className="text-display mt-3 font-serif">
                  Droit, en angle, bench ou assis-debout
                </h2>
                <div className="gold-divider mx-0 mt-6" />
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredCategories.map((cat, i) => {
                const imageUrl = cat.image
                  ? urlFor(cat.image).width(600).height(400).fit('crop').url()
                  : null
                return (
                  <Reveal key={cat._id} delay={i * 80}>
                    <Link
                      href={`/categorie/${cat.slug.current}`}
                      className="group block bg-ivory border border-line hover:border-gold transition-colors duration-300"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden bg-ivory-dark">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={cat.image?.alt || cat.name}
                            fill
                            sizes="(min-width: 768px) 33vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-ink-mute/30 text-xs uppercase tracking-widest">
                            {cat.name}
                          </div>
                        )}
                      </div>
                      <div className="p-5 md:p-6">
                        <h3 className="font-serif text-xl text-ink leading-tight">{cat.name}</h3>
                        {cat.description && (
                          <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                        <p className="mt-4 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                          Découvrir <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CTA FINAL — TON FRANC, DIRECT ═══ */}
      <section className="container py-16 md:py-24 max-w-3xl mx-auto text-center">
        <Truck className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
        <p className="eyebrow text-gold-dark mt-4">Premier contact</p>
        <h2 className="font-serif text-h1 mt-3 text-ink">
          Décrivez votre projet, on chiffre la livraison
        </h2>
        <div className="h-px w-12 bg-gold mx-auto mt-6" />
        <p className="mt-6 text-ink-soft leading-relaxed">
          Un poste pour un cabinet de Cimiez, dix bureaux pour un siège
          d&apos;agence à l&apos;Arenas, vingt postes pour un coworking sur
          le Port. Plus le volume est clair, plus le devis est précis — et
          plus l&apos;équation économique avec Nice tient debout.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            Demander un devis
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <Link href="/boutique" className="btn-outline">
            Voir le catalogue
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-ink-mute">
          <a
            href={`tel:${LEGAL.telephoneTel}`}
            className="inline-flex items-center gap-2 hover:text-gold-dark"
          >
            <Phone className="h-4 w-4" /> {LEGAL.telephone}
          </a>
          <a
            href={`mailto:${LEGAL.email}`}
            className="inline-flex items-center gap-2 hover:text-gold-dark"
          >
            <Mail className="h-4 w-4" /> {LEGAL.email}
          </a>
        </div>
      </section>
    </>
  )
}
