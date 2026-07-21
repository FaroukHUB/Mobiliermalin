import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Truck,
  Quote,
  ArrowRight,
  ShoppingBag,
  FileText,
  CalendarCheck,
  CheckCircle2,
  Navigation,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import {
  getLatestProductsByCategoryDeep,
  getCategoryChildren,
  getLocalPage,
  urlFor,
  type SanityProduct,
} from '@/lib/sanity'

// Slug Sanity de la catégorie cible pour cette page
const CATEGORY_SLUG = 'bureau'
// Identifiant de la page locale dans Sanity (pour récupérer l'image hero éditée)
const PAGE_KEY = 'bureau-marseille'
// Fallback Unsplash si rien n'a été uploadé dans Sanity
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Espace bureau ouvert équipé en mobilier reconditionné — Marseille'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { LEGAL } from '@/lib/legal'
import { RegionalToNationalLink } from '@/components/national/RegionalToNationalLink'
import {
  MarseillePillarSections,
  FAQ_MARSEILLE,
} from '@/components/city/MarseillePillarSections'

export const revalidate = 86400 // 24h, pas besoin de revalider plus souvent

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Bureaux d\'occasion à Marseille — Reconditionnés, livrés, garantis',
  description:
    'Bureaux droits, bureaux d\'angle, bench et assis-debout d\'occasion reconditionnés. Steelcase, Haworth, Vitra. Atelier & showroom La Penne-sur-Huveaune, livraison Marseille.',
  keywords: [
    'bureau occasion Marseille',
    'bureau d\'occasion Marseille',
    'bureau professionnel Marseille',
    'bureau droit occasion',
    'bureau d\'angle occasion Marseille',
    'bench bureau Marseille',
    'bureau assis-debout occasion',
    'bureau reconditionné Marseille',
    'achat bureau Marseille',
  ],
  alternates: { canonical: `${siteUrl}/bureau-occasion-marseille` },
  openGraph: {
    title: 'Bureaux d\'occasion à Marseille — Mobilier Malin',
    description:
      'Bureaux droits, angle, bench et assis-debout reconditionnés. Atelier & showroom La Penne-sur-Huveaune, livraison Marseille.',
    url: `${siteUrl}/bureau-occasion-marseille`,
    type: 'website',
  },
}

// 3 avis Google clients réels (à mettre à jour quand on en a d'autres)
const REVIEWS = [
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité. De plus, super accueil de l'équipe.",
    context: 'Équipement de bureaux professionnels',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top — petit message également pour les livreurs qui ont été au top.",
    context: 'Matériel professionnel + livraison',
  },
  {
    author: 'Nono',
    date: '2026-02',
    text: "J'ai acheté un caisson avec dossiers suspendus, en bon état, en métal blanc comme je voulais. 30 € pas cher du tout. Et en plus, le patron nous l'a chargé dans le coffre de notre voiture. En cadeau, un accueil très aimable et le sourire.",
    context: 'Achat unitaire — particulier',
  },
] as const

const ZONES_MARSEILLE = [
  { code: '13001', name: 'Belsunce, Noailles, Centre-ville', detail: 'agences, cabinets d\'avocats' },
  { code: '13002', name: 'Joliette, Arenc', detail: 'startups Euroméditerranée, sièges de grands comptes' },
  { code: '13003', name: 'Belle de Mai, Saint-Mauront', detail: 'tiers-lieux, associations, structures culturelles' },
  { code: '13006', name: 'Castellane, Préfecture, Vauban', detail: 'professions libérales, cabinets médicaux' },
  { code: '13008', name: 'Prado, Bonneveine, Périer', detail: 'sociétés de services, conseil' },
  { code: '13009', name: 'Mazargues, Sainte-Marguerite', detail: 'PME industrielles, garages' },
  { code: '13015-16', name: 'L\'Estaque, Saint-Henri', detail: 'zones d\'activités, ateliers' },
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
  const imageUrl = firstImage?.asset
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

// Adresse showroom (utilisée pour la map embed)
const SHOWROOM_FULL_ADDRESS = `${LEGAL.showroom.ligne1}, ${LEGAL.showroom.codePostal} ${LEGAL.showroom.ville}`
const MAPS_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(SHOWROOM_FULL_ADDRESS)}&output=embed`
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SHOWROOM_FULL_ADDRESS)}`

export default async function MarseillePage() {
  const [latestProducts, subCategories, localPage] = await Promise.all([
    getLatestProductsByCategoryDeep(CATEGORY_SLUG, 4),
    getCategoryChildren(CATEGORY_SLUG),
    getLocalPage(PAGE_KEY),
  ])

  // Image hero : priorité au champ Sanity si l'admin a uploadé, sinon fallback Unsplash
  const heroImageUrl = localPage.heroImage
    ? urlFor(localPage.heroImage).width(2000).url()
    : FALLBACK_HERO_URL
  const heroImageAlt = localPage.heroImage?.alt || FALLBACK_HERO_ALT

  // Les sous-catégories de "Bureau" (bureau droit, angle, bench, assis-debout)
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
        name: 'Mobilier de bureau à Marseille',
        item: `${siteUrl}/bureau-occasion-marseille`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness-marseille`,
    name: 'Mobilier Malin — Mobilier de bureau d\'occasion (Marseille)',
    description:
      'Vente et livraison de mobilier de bureau reconditionné Steelcase, Herman Miller, Haworth, Vitra pour les entreprises et particuliers de Marseille et alentours.',
    url: `${siteUrl}/bureau-occasion-marseille`,
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
      { '@type': 'City', name: 'Marseille' },
      { '@type': 'City', name: 'La Penne-sur-Huveaune' },
      { '@type': 'City', name: 'Aubagne' },
      { '@type': 'City', name: 'Aix-en-Provence' },
    ],
    // aggregateRating + review[] retirés (Sprint 5) — voir bureau-nice.
}

  // FAQPage schema — émis UNIQUEMENT si les Q/R sont visibles dans l'UI
  // (le composant <MarseillePillarSections /> les affiche).
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_MARSEILLE.map((qa) => ({
      '@type': 'Question',
      name: qa.q,
      acceptedAnswer: { '@type': 'Answer', text: qa.a },
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
      
      <RegionalToNationalLink landingHref="/bureau-professionnel-occasion" label="Voir aussi notre sélection nationale de bureaux professionnels d'occasion" />
<script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ═══ HERO ═══ */}
      <section className="relative bg-ink text-ivory overflow-hidden min-h-[520px] md:min-h-[600px] flex items-center">
        {/* Image fond — open space bureau */}
        <div className="absolute inset-0">
          <Image
            src={heroImageUrl}
            alt={heroImageAlt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Gradient sombre pour la lisibilité du texte */}
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
              <li className="text-gold">Bureaux d&apos;occasion à Marseille</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Marseille &amp; alentours</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Bureaux d&apos;occasion à Marseille
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Bureaux droits, bureaux d&apos;angle, bench collaboratifs et
              assis-debout électriques — reconditionnés dans notre atelier
              de La Penne-sur-Huveaune, à 15 minutes de la Joliette. Plateaux
              mélaminé chêne, blanc, gris ou bois véritable, signés Steelcase,
              Haworth, Vitra. Livraison Marseille, retrait au showroom,
              contrôle qualité 7 points sur place avant chaque vente.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
                Demander un devis
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <a href={`tel:${LEGAL.telephoneTel}`} className="btn-outline-light">
                {LEGAL.telephone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ POURQUOI DES ENTREPRISES MARSEILLAISES ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Postes de travail à Marseille</p>
          <h2 className="text-display mt-3 font-serif">
            Le bureau, le premier équipement qu&apos;une entreprise doit choisir
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              À Marseille comme ailleurs, le bureau structure la journée. Que
              ce soit dans une agence du 8e qui équipe ses commerciaux, une
              startup montée à la Joliette qui s&apos;installe dans 200 m²
              d&apos;open-space, ou un cabinet d&apos;avocats du centre-ville
              qui renouvelle ses postes, le choix du bureau dicte tout le
              reste : le confort, la posture, et finalement la productivité.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Le neuf à 800-1 500 € pièce, c&apos;est l&apos;option à laquelle
              beaucoup d&apos;entreprises marseillaises renoncent. L&apos;occasion
              reconditionnée, c&apos;est la même chose — Steelcase, Haworth,
              Vitra — à un tiers ou un quart du prix. À condition d&apos;avoir
              en face un atelier qui inspecte, nettoie, et garantit ce qu&apos;il
              vend. C&apos;est ce qu&apos;on fait à La Penne-sur-Huveaune, à
              15 minutes de la Joliette.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              Notre stock tourne autour de quatre types de postes : le bureau
              droit standard (120, 140, 160 cm) qui équipe l&apos;essentiel des
              open-spaces, le bureau d&apos;angle pour les directions et
              postes premium, le bench collaboratif qui aligne 4 à 8 postes
              sur un même plan, et l&apos;assis-debout électrique qui transforme
              l&apos;ergonomie au quotidien. Chacun a son public à Marseille —
              et chacun passe par notre atelier avant de partir.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ AVIS GOOGLE ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="eyebrow">Avis Google vérifiés</p>
              <h2 className="text-display mt-3 font-serif">
                Ce que disent nos clients à Marseille
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

          <Reveal>
            <p className="mt-10 text-center text-xs text-ink-mute">
              Avis Google publics — visibles sur notre fiche entreprise.
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
              Ces bureaux viennent d&apos;être reconditionnés dans notre atelier. Notre
              stock évolue chaque semaine — si vous cherchez un modèle précis ou
              un volume particulier qui n&apos;apparaît pas, demandez-nous, on l&apos;a
              peut-être en réserve.
            </p>
          </Reveal>
        </section>
      )}

      {/* ═══ LOGISTIQUE MARSEILLE ═══ */}
      <section className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">Notre service à Marseille</p>
              <h2 className="text-display mt-3 font-serif leading-[1.05]">
                Atelier à 15 min de la Joliette
              </h2>
              <div className="gold-divider mx-0 mt-6" />
              <p className="mt-6 text-ink-soft leading-relaxed">
                Trois manières de récupérer votre mobilier, selon votre
                besoin et votre rythme. Pas de tarif unique de livraison
                imposé — on s&apos;adapte à votre adresse et au volume.
              </p>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal>
              <article className="bg-ivory-light border-l-4 border-gold p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-ink">Retrait au showroom</h3>
                    <p className="mt-2 text-ink-soft leading-relaxed">
                      Vous venez à La Penne-sur-Huveaune, vous testez sur place
                      le fauteuil, vous repartez avec votre commande dans le
                      coffre. Notre équipe vous aide à charger — comme le
                      souligne Nono dans son avis, c&apos;est inclus.
                      Ouvert lundi-samedi de 10 h à 18 h sur rendez-vous.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={80}>
              <article className="bg-ivory-light border-l-4 border-gold p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <Truck className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-ink">
                      Livraison Marseille intra-muros
                    </h3>
                    <p className="mt-2 text-ink-soft leading-relaxed">
                      Nous nous déplaçons dans tous les arrondissements
                      marseillais. Délai moyen : 5 à 7 jours après validation
                      de la commande. Le coût exact dépend du volume,
                      de l&apos;adresse précise et de l&apos;étage. Tout est
                      détaillé dans le devis transmis sous 24 h ouvrées.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={160}>
              <article className="bg-ivory-light border-l-4 border-gold p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-ink">
                      Évaluation sur site pour les gros volumes
                    </h3>
                    <p className="mt-2 text-ink-soft leading-relaxed">
                      Pour les commandes de plus de 10 postes, on peut se
                      déplacer chez vous, mesurer l&apos;espace, conseiller
                      sur l&apos;aménagement, et bâtir le devis sur la base
                      de votre réalité — pas d&apos;une grille générique.
                      C&apos;est sans engagement.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ ZONES DESSERVIES ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow text-gold">Tous les arrondissements</p>
              <h2 className="text-display mt-3 font-serif text-ivory leading-[1.05]">
                De Joliette à Bonneveine, on livre où vous êtes
              </h2>
              <div className="h-px w-16 bg-gold mt-8" />
              <p className="mt-8 text-ivory/75 leading-relaxed">
                Quelques exemples de zones où on intervient régulièrement.
                Si votre adresse n&apos;est pas listée, demandez-nous —
                Marseille est notre terrain de jeu naturel.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-ivory/10 border border-ivory/10">
            {ZONES_MARSEILLE.map((zone, i) => (
              <Reveal key={zone.code} delay={i * 40}>
                <div className="bg-ink p-6 h-full">
                  <p className="font-serif text-2xl text-gold">{zone.code}</p>
                  <p className="text-ivory font-medium mt-2">{zone.name}</p>
                  <p className="text-sm text-ivory/60 mt-1.5">{zone.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOUS-CATÉGORIES BUREAU ═══ */}
      {featuredCategories.length > 0 && (
        <section className="bg-ivory-light border-y border-line">
          <div className="container py-16 md:py-24">
            <Reveal>
              <div className="max-w-2xl mb-10">
                <p className="eyebrow">Types de bureaux</p>
                <h2 className="text-display mt-3 font-serif">
                  Droit, en angle, bench ou assis-debout — chaque besoin son format
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

      {/* ═══ COMMENT COMMANDER (2 PATHS RÉELS) ═══ */}
      <section className="container py-16 md:py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="eyebrow">Deux façons de commander</p>
            <h2 className="text-display mt-3 font-serif">
              Achat en ligne ou devis livraison — vous choisissez
            </h2>
            <div className="gold-divider mt-6" />
            <p className="mt-6 text-ink-mute">
              Selon que vous préférez venir chercher votre commande à La Penne-sur-Huveaune
              ou que nous vous livrions à votre adresse marseillaise, le parcours diffère.
              Aucun engagement avant validation.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Path A — Achat + Retrait */}
          <Reveal>
            <article className="bg-ivory-light border border-line p-6 md:p-8 h-full flex flex-col">
              <div className="flex items-center gap-3 pb-5 border-b border-line">
                <ShoppingBag className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-ink">
                  Achat en ligne + retrait au showroom
                </h3>
              </div>
              <p className="text-xs text-ink-mute mt-4 uppercase tracking-widest">
                Idéal si vous habitez à Marseille ou alentours
              </p>
              <ol className="mt-4 space-y-4 flex-1">
                <li className="flex gap-3">
                  <CalendarCheck className="h-4 w-4 text-gold-dark shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-sm text-ink-soft leading-relaxed">
                    <strong className="text-ink">1.</strong> Vous parcourez le catalogue et
                    cliquez <em>« Choisir un créneau et payer »</em> sur le produit qui vous plaît.
                  </p>
                </li>
                <li className="flex gap-3">
                  <CalendarCheck className="h-4 w-4 text-gold-dark shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-sm text-ink-soft leading-relaxed">
                    <strong className="text-ink">2.</strong> Vous sélectionnez votre créneau
                    de retrait (lundi-samedi 10 h-18 h) dans notre calendrier connecté.
                  </p>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-gold-dark shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-sm text-ink-soft leading-relaxed">
                    <strong className="text-ink">3.</strong> Vous payez en ligne par carte
                    via Stripe (paiement sécurisé). Confirmation immédiate par email.
                  </p>
                </li>
                <li className="flex gap-3">
                  <MapPin className="h-4 w-4 text-gold-dark shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-sm text-ink-soft leading-relaxed">
                    <strong className="text-ink">4.</strong> Vous venez à La Penne-sur-Huveaune
                    au créneau choisi. On vous aide à charger dans votre véhicule.
                  </p>
                </li>
              </ol>
              <div className="mt-6 pt-6 border-t border-line">
                <Link href="/boutique" className="btn-gold inline-flex items-center gap-2 w-full justify-center">
                  Voir le catalogue
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            </article>
          </Reveal>

          {/* Path B — Devis livraison */}
          <Reveal delay={120}>
            <article className="bg-ink text-ivory border border-ink p-6 md:p-8 h-full flex flex-col">
              <div className="flex items-center gap-3 pb-5 border-b border-ivory/15">
                <Truck className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-ivory">
                  Devis livraison à votre adresse
                </h3>
              </div>
              <p className="text-xs text-gold mt-4 uppercase tracking-widest">
                Idéal pour vous faire livrer, ou pour les commandes volumineuses
              </p>
              <ol className="mt-4 space-y-4 flex-1">
                <li className="flex gap-3">
                  <FileText className="h-4 w-4 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-sm text-ivory/85 leading-relaxed">
                    <strong className="text-ivory">1.</strong> Sur la fiche d&apos;un produit,
                    vous cliquez <em>« Demander un devis »</em>.
                  </p>
                </li>
                <li className="flex gap-3">
                  <FileText className="h-4 w-4 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-sm text-ivory/85 leading-relaxed">
                    <strong className="text-ivory">2.</strong> Vous remplissez le formulaire :
                    votre adresse de livraison, étage, accès, besoins particuliers.
                  </p>
                </li>
                <li className="flex gap-3">
                  <Clock className="h-4 w-4 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-sm text-ivory/85 leading-relaxed">
                    <strong className="text-ivory">3.</strong> Sous <strong className="text-gold">24 h ouvrées</strong>,
                    vous recevez par email un devis PDF détaillé : produit, frais de livraison
                    adaptés à votre adresse, options éventuelles.
                  </p>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-sm text-ivory/85 leading-relaxed">
                    <strong className="text-ivory">4.</strong> Vous cliquez « Accepter et payer »
                    dans l&apos;email — paiement intégral en ligne via Stripe.
                  </p>
                </li>
                <li className="flex gap-3">
                  <Truck className="h-4 w-4 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <p className="text-sm text-ivory/85 leading-relaxed">
                    <strong className="text-ivory">5.</strong> Livraison à votre adresse marseillaise
                    sous 5 à 7 jours après paiement.
                  </p>
                </li>
              </ol>
              <div className="mt-6 pt-6 border-t border-ivory/15">
                <Link href="/boutique" className="btn-outline-light inline-flex items-center gap-2 w-full justify-center">
                  Parcourir et demander un devis
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ═══ MAP + ITINÉRAIRE ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
            <Reveal>
              <div>
                <p className="eyebrow">Showroom &amp; atelier</p>
                <h2 className="text-display mt-3 font-serif leading-[1.05]">
                  Venir nous voir depuis Marseille
                </h2>
                <div className="gold-divider mx-0 mt-6" />
                <p className="mt-6 text-ink-soft leading-relaxed">
                  Notre showroom est à La Penne-sur-Huveaune, à la sortie de l&apos;A50,
                  à environ 20 minutes du Vieux-Port et 15 minutes de la Joliette.
                  Visite sur rendez-vous, café offert.
                </p>

                <dl className="mt-8 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-ink-mute mb-1">Adresse</dt>
                      <dd className="text-ink leading-snug">
                        {LEGAL.showroom.ligne1}<br />
                        {LEGAL.showroom.codePostal} {LEGAL.showroom.ville}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-ink-mute mb-1">Horaires</dt>
                      <dd className="text-ink">Lundi — Samedi, 10 h — 18 h<br />
                        <span className="text-ink-mute text-xs">(sur rendez-vous)</span>
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-ink-mute mb-1">Contact</dt>
                      <dd>
                        <a href={`tel:${LEGAL.telephoneTel}`} className="text-ink hover:text-gold-dark">
                          {LEGAL.telephone}
                        </a>
                      </dd>
                    </div>
                  </div>
                </dl>

                <a
                  href={MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold inline-flex items-center gap-2 mt-8"
                >
                  <Navigation className="h-4 w-4" strokeWidth={1.5} />
                  Itinéraire depuis ma position
                </a>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="relative aspect-[4/3] md:aspect-[5/4] bg-ivory-light border border-line overflow-hidden">
                <iframe
                  src={MAPS_EMBED_URL}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation showroom Mobilier Malin"
                  className="absolute inset-0"
                  allow="fullscreen"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ CONTENU PILIER MARSEILLE (quartiers + cas usage + FAQ ville) ═══ */}
      <MarseillePillarSections />

      {/* ═══ CTA FINAL ═══ */}
      <section className="bg-ivory-dark border-t border-line">
        <div className="container py-16 md:py-20 max-w-3xl mx-auto text-center">
          <p className="eyebrow text-gold-dark">Prêt à équiper vos bureaux ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ink">
            Devis sous 24 h, sans engagement
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ink-soft leading-relaxed">
            Décrivez-nous votre besoin — un poste isolé ou 50 bureaux à
            équiper — et notre équipe revient vers vous le jour même en
            semaine, avec un devis personnalisé adapté à votre adresse
            marseillaise.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              Recevoir un devis
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
        </div>
      </section>
    </>
  )
}
