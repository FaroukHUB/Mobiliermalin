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
  Briefcase,
  Building2,
  Users,
  Navigation,
  Route,
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
const PAGE_KEY = 'bureau-aix-en-provence'
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Bureau d\'entreprise équipé en mobilier reconditionné — Aix-en-Provence'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Bureaux d\'occasion à Aix-en-Provence — Livrés depuis notre atelier',
  description:
    'Bureaux reconditionnés Steelcase, Haworth, Vitra pour cabinets, startups et professions libérales d\'Aix. Livraison Pôle d\'Activités, La Duranne, Arbois, centre. Garantie 6 mois, devis sous 24 h.',
  keywords: [
    'bureau occasion Aix-en-Provence',
    'bureau d\'occasion Aix',
    'mobilier de bureau Aix-en-Provence',
    'bureau professionnel Aix',
    'bureau reconditionné Aix',
    'bureau Pôle Activités Aix',
    'bureau La Duranne',
    'cabinet équipement bureau Aix',
  ],
  alternates: { canonical: `${siteUrl}/bureau-occasion-aix-en-provence` },
  openGraph: {
    title: 'Bureaux d\'occasion à Aix-en-Provence — Mobilier Malin',
    description:
      'Bureaux reconditionnés livrés sur le bassin aixois depuis notre atelier. Cabinets, startups, professions libérales — garantie 6 mois.',
    url: `${siteUrl}/bureau-occasion-aix-en-provence`,
    type: 'website',
  },
}

const REVIEWS = [
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité.",
    context: 'Équipement complet d\'un cabinet',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top — petit message également pour les livreurs qui ont été au top.",
    context: 'Achat professionnel + livraison',
  },
  {
    author: 'Nono',
    date: '2026-02',
    text: "J'ai acheté un caisson avec dossiers suspendus, en bon état, en métal blanc comme je voulais. Et en plus, le patron nous l'a chargé dans le coffre.",
    context: 'Achat unitaire',
  },
] as const

// 5 pôles tertiaires d'Aix — différenciation vs 7 arrondissements (Marseille) et 9 zones tags (Aubagne)
const POLES_AIX = [
  {
    name: 'Pôle d\'Activités d\'Aix-en-Provence',
    aka: 'Les Milles',
    profile:
      'Le premier parc d\'activités économiques de la région : sièges sociaux, services aux entreprises, ingénierie, conseil. Les bureaux droits 140-160 cm et les bench y dominent.',
    icon: Building2,
  },
  {
    name: 'La Duranne',
    aka: 'Quartier d\'affaires moderne',
    profile:
      'Cabinets, agences, sociétés tech. Architecture récente, open spaces ouverts — terrain naturel pour des postes assis-debout électriques et des bureaux d\'angle clairs.',
    icon: Briefcase,
  },
  {
    name: 'Technopôle de l\'Arbois',
    aka: 'Recherche & environnement',
    profile:
      'Pépinière de startups, laboratoires, structures publiques. Budgets contraints, besoin d\'équiper vite et bien — l\'occasion reconditionnée est faite pour ça.',
    icon: Users,
  },
  {
    name: 'Centre-ville historique',
    aka: 'Cours Mirabeau & intra-muros',
    profile:
      'Cabinets d\'avocats, notaires, experts-comptables, agences immobilières. Locaux anciens, parfois exigus — on conseille sur les formats compacts et les caissons mobiles.',
    icon: Building2,
  },
  {
    name: 'Jas-de-Bouffan & Pioline',
    aka: 'Tertiaire ouest',
    profile:
      'Zones commerciales et tertiaires mixtes. Pour les PME qui veulent renouveler 5 à 15 postes d\'un coup, sans grever leur trésorerie.',
    icon: Building2,
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

const SHOWROOM_FULL_ADDRESS = `${LEGAL.showroom.ligne1}, ${LEGAL.showroom.codePostal} ${LEGAL.showroom.ville}`
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SHOWROOM_FULL_ADDRESS)}`

export default async function AixEnProvencePage() {
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
        name: 'Mobilier de bureau à Aix-en-Provence',
        item: `${siteUrl}/bureau-occasion-aix-en-provence`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness-aix`,
    name: 'Mobilier Malin — Mobilier de bureau d\'occasion (Aix-en-Provence)',
    description:
      'Vente et livraison de mobilier de bureau reconditionné Steelcase, Herman Miller, Haworth, Vitra pour les entreprises, cabinets et professions libérales d\'Aix-en-Provence.',
    url: `${siteUrl}/bureau-occasion-aix-en-provence`,
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
      { '@type': 'City', name: 'Aix-en-Provence' },
      { '@type': 'City', name: 'Les Milles' },
      { '@type': 'City', name: 'La Duranne' },
      { '@type': 'City', name: 'Bouc-Bel-Air' },
      { '@type': 'City', name: 'Vitrolles' },
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
              <li className="text-gold">Bureaux d&apos;occasion à Aix-en-Provence</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Pays d&apos;Aix &amp; alentours</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Bureaux d&apos;occasion à Aix-en-Provence
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Pour les cabinets du centre, les agences de La Duranne, les
              startups de l&apos;Arbois et les sièges des Milles — du mobilier
              de bureau reconditionné à un quart du prix du neuf. Steelcase,
              Haworth, Vitra. Notre atelier est à La Penne-sur-Huveaune, à
              35 minutes d&apos;Aix par l&apos;A8 ou l&apos;A52 : la livraison
              tient en une demi-journée.
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

      {/* ═══ POURQUOI L'OCCASION POUR LE TERTIAIRE AIXOIS ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Une économie de service à équiper</p>
          <h2 className="text-display mt-3 font-serif">
            Aix-en-Provence vit du tertiaire — équiper ses postes ne devrait pas
            grever le compte de résultat
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Le bassin aixois concentre une densité rare de cabinets, d&apos;agences
              et de bureaux d&apos;études. Sur ces métiers, le mobilier est le
              second poste d&apos;investissement après l&apos;informatique — et
              pourtant celui qu&apos;on laisse traîner le plus longtemps, parce
              que le neuf coûte cher et que l&apos;occasion classique n&apos;inspire
              pas confiance.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Notre offre se situe entre les deux : du mobilier de marque
              (Steelcase, Haworth, Vitra) inspecté, nettoyé et garanti six mois,
              à un tiers ou un quart du prix neuf. Les bureaux qu&apos;on remet
              en circulation sont récupérés sur des chantiers de réaménagement
              régionaux — beaucoup proviennent justement d&apos;entreprises
              aixoises qui changent leurs plateaux tous les sept à dix ans.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ PROFILS CLIENTS AIXOIS ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="eyebrow">Qui équipe-t-on à Aix ?</p>
              <h2 className="text-display mt-3 font-serif">
                Trois profils d&apos;entreprises, trois besoins d&apos;équipement
              </h2>
              <div className="gold-divider mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Reveal>
              <article className="bg-ivory border border-line p-6 md:p-7 h-full">
                <Briefcase className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-ink mt-4">
                  Cabinets &amp; professions libérales
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Avocats, notaires, experts-comptables, médecins, architectes.
                  Le plus souvent : un poste de direction haut de gamme (bureau
                  d&apos;angle, fauteuil ergonomique), deux à trois postes
                  collaborateurs, un caisson mobile par personne.
                </p>
              </article>
            </Reveal>

            <Reveal delay={80}>
              <article className="bg-ivory border border-line p-6 md:p-7 h-full">
                <Users className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-ink mt-4">
                  Startups &amp; agences
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  La Duranne, l&apos;Arbois, Pôle Média. Open-space, bench
                  collaboratif 4 ou 6 postes, assises ergonomiques, fauteuils
                  de réunion. On équipe parfois une équipe entière en une
                  seule livraison.
                </p>
              </article>
            </Reveal>

            <Reveal delay={160}>
              <article className="bg-ivory border border-line p-6 md:p-7 h-full">
                <Building2 className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-ink mt-4">
                  PME &amp; sièges sociaux
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Les Milles, Jas-de-Bouffan, Pioline. Renouvellements
                  partiels (10 à 30 postes), uniformisation d&apos;un plateau,
                  ajout d&apos;assis-debout. Devis détaillé avec frais de
                  livraison adaptés à l&apos;adresse précise.
                </p>
              </article>
            </Reveal>
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

      {/* ═══ DERNIERS BUREAUX ARRIVÉS ═══ */}
      {productCards.length > 0 && (
        <section className="bg-ivory-dark border-y border-line">
          <div className="container py-16 md:py-24">
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
          </div>
        </section>
      )}

      {/* ═══ 5 PÔLES TERTIAIRES — DIFFÉRENCIATION VS MARSEILLE/AUBAGNE ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow text-gold">Les zones d&apos;activité d&apos;Aix</p>
              <h2 className="text-display mt-3 font-serif text-ivory leading-[1.05]">
                De Cours Mirabeau aux Milles, on intervient partout
              </h2>
              <div className="h-px w-16 bg-gold mt-8" />
              <p className="mt-8 text-ivory/75 leading-relaxed">
                Cinq grands pôles concentrent la vie professionnelle aixoise.
                Chacun a ses contraintes — accès véhicule, étages, créneaux
                de livraison — et chacun a ses formats de bureaux dominants.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid md:grid-cols-2 gap-px bg-ivory/10 border border-ivory/10">
            {POLES_AIX.map((pole, i) => {
              const Icon = pole.icon
              return (
                <Reveal key={pole.name} delay={i * 60}>
                  <article className="bg-ink p-7 h-full">
                    <div className="flex items-start gap-4">
                      <Icon className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                      <div>
                        <h3 className="font-serif text-xl text-ivory leading-tight">
                          {pole.name}
                        </h3>
                        <p className="text-xs uppercase tracking-widest text-gold mt-1.5">
                          {pole.aka}
                        </p>
                        <p className="mt-4 text-sm text-ivory/75 leading-relaxed">
                          {pole.profile}
                        </p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ SOUS-CATÉGORIES BUREAU ═══ */}
      {featuredCategories.length > 0 && (
        <section className="container py-16 md:py-24">
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
        </section>
      )}

      {/* ═══ LOGISTIQUE VERS AIX ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="eyebrow">Atelier → Aix</p>
                <h2 className="text-display mt-3 font-serif leading-[1.05]">
                  Une demi-journée entre notre atelier et votre adresse
                </h2>
                <div className="gold-divider mx-0 mt-6" />
                <p className="mt-6 text-ink-soft leading-relaxed">
                  La Penne-sur-Huveaune et le pays d&apos;Aix sont reliés par
                  l&apos;A8 et l&apos;A52 — moins d&apos;une heure de
                  fourgon, livraison fréquente, créneaux flexibles.
                </p>
              </div>
            </Reveal>

            <div className="space-y-6">
              <Reveal>
                <article className="bg-ivory border-l-4 border-gold p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <Truck className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                    <div>
                      <h3 className="font-serif text-xl text-ink">
                        Livraison sur le bassin aixois
                      </h3>
                      <p className="mt-2 text-ink-soft leading-relaxed">
                        On dessert tout le pays d&apos;Aix : Les Milles, La
                        Duranne, Arbois, centre-ville, Jas-de-Bouffan, mais
                        aussi Bouc-Bel-Air, Cabriès, Vitrolles. Le coût
                        dépend du volume, de l&apos;adresse et de l&apos;étage —
                        tout est détaillé dans le devis transmis sous 24 h ouvrées.
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>

              <Reveal delay={80}>
                <article className="bg-ivory border-l-4 border-gold p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <Route className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                    <div>
                      <h3 className="font-serif text-xl text-ink">
                        Visite au showroom depuis Aix
                      </h3>
                      <p className="mt-2 text-ink-soft leading-relaxed">
                        35 minutes par l&apos;A8 puis l&apos;A52, sortie La
                        Penne-sur-Huveaune. Notre showroom de 200 m² réunit
                        en permanence une centaine de pièces. Café offert,
                        visite sur rendez-vous, lundi-samedi 10 h-18 h.
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>

              <Reveal delay={160}>
                <article className="bg-ivory border-l-4 border-gold p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                    <div>
                      <h3 className="font-serif text-xl text-ink">
                        Évaluation sur site pour les gros volumes
                      </h3>
                      <p className="mt-2 text-ink-soft leading-relaxed">
                        Au-delà de dix postes, on peut se déplacer dans vos
                        locaux aixois, mesurer l&apos;espace, conseiller sur
                        l&apos;agencement et bâtir le devis sur votre réalité —
                        pas une grille générique. Sans engagement.
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="container py-16 md:py-24 max-w-3xl mx-auto text-center">
        <p className="eyebrow text-gold-dark">Prêt à équiper vos bureaux aixois ?</p>
        <h2 className="font-serif text-h1 mt-3 text-ink">
          Devis sous 24 h, sans engagement
        </h2>
        <div className="h-px w-12 bg-gold mx-auto mt-6" />
        <p className="mt-6 text-ink-soft leading-relaxed">
          Décrivez-nous votre besoin — un poste isolé pour un cabinet du Cours
          Mirabeau ou trente bureaux pour un siège des Milles — et notre
          équipe revient vers vous le jour même en semaine.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            Recevoir un devis
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <Link href="/boutique" className="btn-outline">
            Voir le catalogue
          </Link>
          <a
            href={MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" strokeWidth={1.5} />
            Itinéraire showroom
          </a>
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
