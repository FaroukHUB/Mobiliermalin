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
const PAGE_KEY = 'bureau-la-ciotat'
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Bureaux d\'occasion livrés à La Ciotat depuis l\'atelier de La Penne-sur-Huveaune'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Vente de bureaux d\'occasion à La Ciotat — Showroom à 25 min, livraison incluse',
  description:
    'La Ciotat est à 25 minutes de notre atelier par l\'A50. Vente directe et livraison rapide de bureaux d\'occasion Steelcase, Vitra, Haworth reconditionnés. Garantie 6 mois.',
  keywords: [
    'vente de meuble d\'occasion à la ciotat',
    'vente meuble la ciotat',
    'bureau occasion La Ciotat',
    'bureau d\'occasion La Ciotat',
    'mobilier bureau La Ciotat',
    'meuble occasion La Ciotat',
    'magasin meuble La Ciotat',
    'livraison bureau La Ciotat',
    'mobilier reconditionné La Ciotat',
    'bureau professionnel La Ciotat',
  ],
  alternates: { canonical: `${siteUrl}/bureau-occasion-la-ciotat` },
  openGraph: {
    title: 'Vente de bureaux d\'occasion à La Ciotat — Mobilier Malin',
    description:
      'Livraison rapide à La Ciotat (25 min par l\'A50). Bureaux Steelcase, Vitra, Haworth reconditionnés, garantis 6 mois.',
    url: `${siteUrl}/bureau-occasion-la-ciotat`,
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
    context: 'Achat showroom',
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

export default async function LaCiotatPage() {
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
        name: 'Mobilier de bureau à La Ciotat',
        item: `${siteUrl}/bureau-occasion-la-ciotat`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness-la-ciotat`,
    name: 'Mobilier Malin — Bureaux d\'occasion livrés à La Ciotat',
    description:
      'Vente et livraison de mobilier de bureau reconditionné Steelcase, Herman Miller, Haworth, Vitra à La Ciotat depuis notre atelier de La Penne-sur-Huveaune (25 min par l\'A50).',
    url: `${siteUrl}/bureau-occasion-la-ciotat`,
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
      { '@type': 'City', name: 'La Ciotat' },
      { '@type': 'City', name: 'Ceyreste' },
      { '@type': 'City', name: 'Cassis' },
      { '@type': 'City', name: 'Saint-Cyr-sur-Mer' },
      { '@type': 'City', name: 'Roquefort-la-Bédoule' },
      { '@type': 'City', name: 'Aubagne' },
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
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
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
              <li><Link href="/" className="hover:text-gold">Accueil</Link></li>
              <ChevronRight className="h-3 w-3" />
              <li className="text-gold">Bureaux d&apos;occasion à La Ciotat</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Zone proche · livraison rapide</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Vente et livraison de bureaux d&apos;occasion à La Ciotat
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              La Ciotat est à <strong className="text-ivory">25 minutes</strong>
              de notre atelier par l&apos;A50. Cette proximité nous permet
              d&apos;y livrer rapidement, à un tarif maîtrisé, et de
              revenir facilement si un ajustement est nécessaire après
              installation. Nos bureaux d&apos;occasion reconditionnés —
              Steelcase, Vitra, Haworth, Herman Miller — sont garantis
              six mois et livrés directement sur votre lieu de travail.
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

      {/* ═══ POURQUOI NOUS À LA CIOTAT ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Notre démarche</p>
          <h2 className="text-display mt-3 font-serif">
            La Ciotat fait partie de notre zone naturelle
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Notre atelier est implanté à La Penne-sur-Huveaune, à la
              sortie est de Marseille. L&apos;A50 nous mène jusqu&apos;à
              La Ciotat en vingt-cinq minutes, sans détour, par une route
              que nous empruntons régulièrement. Concrètement, livrer un
              bureau au port, dans le centre, à Ceyreste ou aux Lecques
              nous demande à peine plus de temps qu&apos;une livraison
              marseillaise.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Cette proximité change beaucoup de choses pour vous : pas
              besoin d&apos;attendre une tournée groupée pour bénéficier
              d&apos;un tarif raisonnable, et si un ajustement est
              nécessaire après installation — une pièce à reprendre, un
              caisson à compléter, un défaut qui apparaît — nous repassons
              sans facturer un nouveau déplacement complet.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              Nous équipons régulièrement des bureaux, cabinets et locaux
              professionnels à La Ciotat et dans les communes voisines :
              Cassis, Ceyreste, Saint-Cyr-sur-Mer, Roquefort-la-Bédoule,
              Aubagne. Pour chaque demande, nous étudions la meilleure
              organisation — livraison indépendante ou intégrée à une
              tournée déjà prévue — et nous vous proposons le tarif le
              plus juste.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ COMMENT ÇA SE PASSE — 3 ÉTAPES ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <p className="eyebrow">Concrètement</p>
              <h2 className="text-display mt-3 font-serif">
                Comment se déroule une commande depuis La Ciotat
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
                  Par mail, par téléphone ou depuis la fiche d&apos;un
                  produit qui vous intéresse. Indiquez-nous votre adresse
                  à La Ciotat et les contraintes d&apos;accès (étage,
                  ascenseur, centre piéton).
                </p>
              </article>
            </Reveal>

            <Reveal delay={80}>
              <article className="bg-ivory border border-line p-7 h-full">
                <CalendarDays className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-widest text-gold-dark mt-5">
                  2. Devis &amp; date de livraison
                </p>
                <h3 className="font-serif text-xl text-ink mt-2 leading-tight">
                  Nous vous proposons un créneau rapide
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Vous recevez sous 24 h ouvrées un devis détaillé. La
                  Ciotat étant à 25 minutes de l&apos;atelier, nous pouvons
                  généralement livrer sous quelques jours, à la date qui
                  vous arrange.
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
                  Nous installons et restons joignables
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Le jour J, nous nous présentons à l&apos;adresse convenue,
                  déchargeons et plaçons les bureaux. La garantie six mois
                  est activée à la remise — un défaut, un mécanisme qui
                  faiblit, nous intervenons.
                </p>
              </article>
            </Reveal>
          </div>

          <Reveal>
            <p className="mt-10 text-sm text-ink-mute text-center max-w-2xl mx-auto">
              Si vous préférez venir chercher votre commande, notre showroom
              est à La Penne-sur-Huveaune, à 25 minutes de La Ciotat par
              l&apos;A50. Visite sur rendez-vous, du lundi au samedi de
              10 h à 18 h.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ DERNIERS BUREAUX ═══ */}
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
          <p className="eyebrow text-gold mt-4">Vous êtes sur La Ciotat ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Indiquez-nous votre besoin, nous nous organisons
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Un bureau ou trente, un poste isolé ou un plateau complet —
            nous revenons vers vous sous 24 h ouvrées avec un devis
            détaillé. La Ciotat étant à 25 minutes de l&apos;atelier, la
            date de livraison que nous proposons est généralement très
            proche.
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
            <a href={`tel:${LEGAL.telephoneTel}`} className="inline-flex items-center gap-2 hover:text-gold">
              <Phone className="h-4 w-4" /> {LEGAL.telephone}
            </a>
            <a href={`mailto:${LEGAL.email}`} className="inline-flex items-center gap-2 hover:text-gold">
              <Mail className="h-4 w-4" /> {LEGAL.email}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
