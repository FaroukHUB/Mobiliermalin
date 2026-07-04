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
  CalendarDays,
  MessageSquare,
  PackageCheck,
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
  'Bureaux d\'occasion livrés à Nice depuis l\'atelier de La Penne-sur-Huveaune'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Bureaux d\'occasion livrés à Nice — Mobilier Malin',
  description:
    'Nous recevons de nombreuses demandes depuis Nice et la Côte d\'Azur. Pour y répondre, nous avons mis en place des journées de livraison dédiées. Bureaux Steelcase, Vitra, Haworth reconditionnés dans notre atelier local.',
  keywords: [
    'bureau occasion Nice',
    'bureau d\'occasion Nice',
    'mobilier bureau Nice',
    'bureau professionnel Nice',
    'livraison bureau Nice',
    'mobilier bureau Côte d\'Azur',
  ],
  alternates: { canonical: `${siteUrl}/bureau-occasion-nice` },
  openGraph: {
    title: 'Bureaux d\'occasion livrés à Nice — Mobilier Malin',
    description:
      'Journées de livraison dédiées à Nice et la Côte d\'Azur. Bureaux Steelcase, Vitra, Haworth reconditionnés dans notre atelier local.',
    url: `${siteUrl}/bureau-occasion-nice`,
    type: 'website',
  },
}

const REVIEWS = [
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité.",
    context: 'Équipement complet',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top — petit message également pour les livreurs qui ont été au top.",
    context: 'Achat + livraison',
  },
  {
    author: 'Nono',
    date: '2026-02',
    text: "J'ai acheté un caisson avec dossiers suspendus, en bon état, en métal blanc comme je voulais. 30 € pas cher du tout.",
    context: 'Achat unitaire',
  },
] as const

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
    name: 'Mobilier Malin — Bureaux d\'occasion livrés à Nice',
    description:
      'Livraison de mobilier de bureau reconditionné Steelcase, Herman Miller, Haworth, Vitra à Nice et sur la Côte d\'Azur depuis notre atelier de La Penne-sur-Huveaune.',
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
            <p className="eyebrow text-gold">Nouveau — livraison Côte d&apos;Azur</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Nous livrons désormais nos bureaux d&apos;occasion à Nice
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Nous recevons de nombreuses demandes depuis Nice et la Côte
              d&apos;Azur. Plutôt que de continuer à les traiter au cas par
              cas, nous avons fait le choix d&apos;organiser des journées de
              livraison dédiées à la région niçoise. Cela nous permet de
              mieux planifier nos déplacements et de proposer un tarif de
              livraison plus accessible.
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

      {/* ═══ POURQUOI CETTE ORGANISATION — TON SINCÈRE ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Notre démarche</p>
          <h2 className="text-display mt-3 font-serif">
            Pourquoi nous avons ouvert une ligne de livraison sur Nice
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Notre atelier est implanté à La Penne-sur-Huveaune, près de
              Marseille. C&apos;est là que nous inspectons, démontons,
              nettoyons et remontons chaque bureau avant de le proposer à
              la vente. Pendant longtemps, nous avons livré principalement
              sur Marseille, Aubagne et Aix — les villes accessibles dans
              la journée.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Depuis plusieurs mois, nous constatons qu&apos;un nombre
              croissant de demandes nous parviennent depuis Nice et la
              Côte d&apos;Azur, souvent à la suite de nos annonces Le Bon
              Coin. Au début, nous les déclinions ou facturions le
              déplacement au cas par cas — une organisation peu lisible,
              aussi bien pour nos clients que pour nous.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              Nous avons donc choisi de structurer cette zone autrement :
              nous prévoyons désormais une à deux journées de livraison
              dédiées à la Côte d&apos;Azur. Cette mutualisation des
              déplacements nous permet d&apos;offrir un tarif de
              livraison nettement plus compétitif que si nous réalisions
              un aller-retour uniquement pour votre commande. C&apos;est
              cette nouvelle organisation qui rend notre offre pertinente
              à Nice.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ COMMENT ÇA SE PASSE — 3 ÉTAPES SIMPLES ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <p className="eyebrow">Concrètement</p>
              <h2 className="text-display mt-3 font-serif">
                Comment se déroule une commande depuis Nice
              </h2>
              <div className="gold-divider mx-0 mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            <Reveal>
              <article className="bg-ivory border border-line p-7 h-full">
                <MessageSquare className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-widest text-gold-dark mt-5">
                  1. Vous nous contactez
                </p>
                <h3 className="font-serif text-xl text-ink mt-2 leading-tight">
                  Nous échangeons sur votre besoin
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Par mail, par téléphone ou depuis la fiche d&apos;un produit
                  qui vous intéresse. Indiquez-nous ce que vous cherchez, votre
                  adresse à Nice, ainsi que les contraintes d&apos;accès
                  (étage, ascenseur, créneau).
                </p>
              </article>
            </Reveal>

            <Reveal delay={80}>
              <article className="bg-ivory border border-line p-7 h-full">
                <CalendarDays className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-widest text-gold-dark mt-5">
                  2. Nous fixons une date ensemble
                </p>
                <h3 className="font-serif text-xl text-ink mt-2 leading-tight">
                  Nous vous proposons la prochaine tournée
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Vous recevez sous 24 h ouvrées un devis détaillé : produit,
                  frais de livraison adaptés à votre adresse, et date de la
                  prochaine journée de livraison Côte d&apos;Azur prévue. Si
                  cette date ne vous convient pas, nous vous en proposons une
                  autre.
                </p>
              </article>
            </Reveal>

            <Reveal delay={160}>
              <article className="bg-ivory border border-line p-7 h-full">
                <PackageCheck className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-widest text-gold-dark mt-5">
                  3. Livraison &amp; garantie
                </p>
                <h3 className="font-serif text-xl text-ink mt-2 leading-tight">
                  Nous vous livrons et restons joignables
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Le jour de la livraison, nous nous présentons à
                  l&apos;adresse convenue. Notre équipe technique reste
                  joignable après achat — un mécanisme qui faiblit, un
                  défaut qui apparaît, on reprend contact avec la
                  personne de l&apos;atelier qui a préparé la pièce.
                  Même à 200 km.
                </p>
              </article>
            </Reveal>
          </div>

          <Reveal>
            <p className="mt-10 text-sm text-ink-mute text-center max-w-2xl mx-auto">
              Si vous préférez venir chercher votre commande, notre showroom
              se trouve à La Penne-sur-Huveaune, à environ 2 h 30 par
              l&apos;A8. Visite sur rendez-vous, du lundi au samedi de 10 h
              à 18 h.
            </p>
          </Reveal>
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
              Notre stock évolue régulièrement. Si vous cherchez un modèle
              précis qui n&apos;apparaît pas, contactez-nous : nous
              l&apos;avons peut-être en réserve, ou il peut arriver lors
              de la prochaine vague de récupération.
            </p>
          </Reveal>
        </section>
      )}

      {/* ═══ AVIS GOOGLE ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="eyebrow">Avis Google vérifiés</p>
              <h2 className="text-display mt-3 font-serif">
                Ce que disent les clients que nous équipons
              </h2>
              <div className="gold-divider mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {REVIEWS.map((review, i) => (
              <Reveal key={review.author} delay={i * 80}>
                <article className="bg-ivory border border-line p-6 md:p-7 h-full flex flex-col">
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
        </div>
      </section>

      {/* ═══ SOUS-CATÉGORIES BUREAU ═══ */}
      {featuredCategories.length > 0 && (
        <section className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="eyebrow">Types de bureaux disponibles</p>
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
        </section>
      )}

      {/* ═══ CTA FINAL ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-20 max-w-3xl mx-auto text-center">
          <Truck className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
          <p className="eyebrow text-gold mt-4">Vous êtes sur Nice ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Indiquez-nous votre besoin, nous nous organisons
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Un bureau ou trente, un poste isolé ou un plateau complet — plus
            votre besoin est précis, plus nous pouvons positionner la
            livraison sur la prochaine tournée Côte d&apos;Azur. Nous
            revenons vers vous sous 24 h ouvrées avec un devis détaillé.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Demander un devis
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link href="/boutique" className="btn-outline-light">
              Voir le catalogue
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-ivory/60">
            <a
              href={`tel:${LEGAL.telephoneTel}`}
              className="inline-flex items-center gap-2 hover:text-gold"
            >
              <Phone className="h-4 w-4" /> {LEGAL.telephone}
            </a>
            <a
              href={`mailto:${LEGAL.email}`}
              className="inline-flex items-center gap-2 hover:text-gold"
            >
              <Mail className="h-4 w-4" /> {LEGAL.email}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
