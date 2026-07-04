import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Truck,
  Quote,
  ArrowRight,
  ShieldCheck,
  Store,
  Award,
  Sparkles,
  Recycle,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import {
  getLatestProducts,
  getCategoryHierarchy,
  getLocalPage,
  urlFor,
  type SanityProduct,
} from '@/lib/sanity'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { LEGAL } from '@/lib/legal'

const PAGE_KEY = 'meuble-marseille'
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Showroom de meubles d\'occasion professionnels près de Marseille'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Meubles d\'occasion à Marseille — Atelier & showroom, livraison',
  description:
    'Magasin de meubles d\'occasion à 10 min de Marseille : bureaux, fauteuils, armoires, rangements professionnels reconditionnés Steelcase, Vitra, Haworth dans notre atelier local. Livraison sur Marseille.',
  keywords: [
    'meuble occasion marseille',
    'meubles occasion marseille',
    'magasin meuble occasion marseille',
    'meuble d\'occasion marseille',
    'meubles d\'occasion marseille',
    'mobilier de bureau marseille',
    'vente meuble occasion marseille',
    'meuble seconde main marseille',
    'meuble reconditionné marseille',
    'destockage meuble marseille',
  ],
  alternates: { canonical: `${siteUrl}/meuble-occasion-marseille` },
  openGraph: {
    title: 'Meubles d\'occasion à Marseille — Mobilier Malin',
    description:
      'Magasin de meubles d\'occasion à 10 min de Marseille. Bureaux, fauteuils, armoires reconditionnés dans notre atelier local.',
    url: `${siteUrl}/meuble-occasion-marseille`,
    type: 'website',
  },
}

const REVIEWS = [
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité.",
    context: 'Équipement complet · Marseille',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top — petit message également pour les livreurs qui ont été au top.",
    context: 'Achat + livraison · Marseille',
  },
  {
    author: 'Nono',
    date: '2026-02',
    text: "J'ai acheté un caisson avec dossiers suspendus, en bon état, en métal blanc comme je voulais. 30 € pas cher du tout.",
    context: 'Achat showroom · Marseille',
  },
] as const

// Quartiers / arrondissements de Marseille livrés régulièrement
const QUARTIERS = [
  'Vieux-Port (1er, 2e)',
  'Préfecture / Castellane (6e)',
  'La Joliette / Euroméditerranée (2e)',
  'Le Prado / Périer (8e)',
  'La Valentine / La Pomme (11e)',
  'Saint-Loup / Saint-Marcel (10e)',
  'La Capelette (10e)',
  'Mazargues / Bonneveine (8e, 9e)',
  'Sainte-Marguerite / Saint-Tronc (9e, 10e)',
  'Les Olives / La Rose (13e)',
  'Saint-Antoine / Saint-Henri (15e, 16e)',
  'L\'Estaque (16e)',
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

const SHOWROOM_FULL_ADDRESS = `${LEGAL.showroom.ligne1}, ${LEGAL.showroom.codePostal} ${LEGAL.showroom.ville}`
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SHOWROOM_FULL_ADDRESS)}`

export default async function MeubleOccasionMarseillePage() {
  const [latestProducts, categoryGroups, localPage] = await Promise.all([
    getLatestProducts(8),
    getCategoryHierarchy(),
    getLocalPage(PAGE_KEY),
  ])

  const heroImageUrl = localPage.heroImage
    ? urlFor(localPage.heroImage).width(2000).url()
    : FALLBACK_HERO_URL
  const heroImageAlt = localPage.heroImage?.alt || FALLBACK_HERO_ALT

  const productCards = latestProducts.map(sanityToCard)
  const topLevelCategories = categoryGroups.map((g) => g.parent).slice(0, 6)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Meubles d\'occasion à Marseille',
        item: `${siteUrl}/meuble-occasion-marseille`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${siteUrl}/#furniturestore-marseille`,
    name: 'Mobilier Malin — Meubles d\'occasion à Marseille',
    description:
      'Magasin de meubles d\'occasion professionnels à 10 min de Marseille (La Penne-sur-Huveaune). Bureaux, fauteuils, armoires, rangements reconditionnés Steelcase, Herman Miller, Vitra, Haworth. Garantie 6 mois.',
    url: `${siteUrl}/meuble-occasion-marseille`,
    telephone: LEGAL.telephoneTel,
    email: LEGAL.email,
    priceRange: '€€',
    image: heroImageUrl,
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
      { '@type': 'City', name: 'Aubagne' },
      { '@type': 'City', name: 'La Penne-sur-Huveaune' },
      { '@type': 'City', name: 'Allauch' },
      { '@type': 'City', name: 'Plan-de-Cuques' },
      { '@type': 'City', name: 'Cassis' },
      { '@type': 'City', name: 'Aix-en-Provence' },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '18:00',
    },
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
              <li className="text-gold">Meubles d&apos;occasion à Marseille</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Showroom à 10 min de Marseille</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Meubles d&apos;occasion à Marseille
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Notre magasin de meubles d&apos;occasion est installé à La
              Penne-sur-Huveaune, à dix minutes du centre-ville de
              Marseille. Nous y reconditionnons en permanence des
              bureaux, fauteuils, armoires, rangements et cloisons
              professionnels de marques reconnues — Steelcase, Herman
              Miller, Vitra, Haworth. Chaque pièce passe par notre atelier
              avant sa mise en vente, et nous livrons sur l&apos;ensemble
              des arrondissements marseillais.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/boutique" className="btn-gold inline-flex items-center gap-2">
                Voir le catalogue
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link href="/contact" className="btn-outline-light">
                Visiter le showroom
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-ivory/70">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" /> Garantie 6 mois
              </span>
              <span className="inline-flex items-center gap-2">
                <Truck className="h-4 w-4 text-gold" /> Livraison Marseille
              </span>
              <span className="inline-flex items-center gap-2">
                <Award className="h-4 w-4 text-gold" /> Marques pro
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ POURQUOI NOUS À MARSEILLE ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Notre approche du meuble d&apos;occasion</p>
          <h2 className="text-display mt-3 font-serif">
            Pourquoi acheter ses meubles d&apos;occasion à Marseille chez
            nous plutôt qu&apos;en ligne
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Sur Le Bon Coin ou Facebook Marketplace, le choix est large
              mais la qualité est aléatoire : pas de garantie, pas de
              contrôle, pas de SAV. Chez Mobilier Malin, nous appliquons
              un protocole précis à chaque meuble qui entre dans
              l&apos;atelier de La Penne-sur-Huveaune : inspection en sept
              points, démontage si nécessaire, remplacement des pièces
              défectueuses, nettoyage professionnel, remontage et test.
              Rien n&apos;est mis en vente sans avoir passé cette étape.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Cette différence change tout pour vous : chaque pièce passe
              par un contrôle qualité 7 points dans notre atelier local
              avant sa mise en vente, vous bénéficiez du conseil d&apos;une
              équipe qui connaît chaque marque (Steelcase, Vitra, Haworth,
              Herman Miller, Majencia, USM Haller), et d&apos;un service de
              livraison sur tout Marseille — du Vieux-Port aux quartiers
              nord, en passant par le Prado et La Valentine.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              Côté tarif, l&apos;occasion vous permet d&apos;accéder à du
              mobilier qui coûte 1 200 € neuf pour 300 à 450 € chez nous,
              tout en conservant l&apos;essentiel de sa durée de vie. Et
              côté impact, chaque meuble reconditionné évite la
              fabrication d&apos;un meuble neuf — argument que nous
              documentons par une attestation RSE remise à chaque
              entreprise cliente.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ CATÉGORIES DE MEUBLES DISPONIBLES ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <p className="eyebrow">Notre catalogue</p>
              <h2 className="text-display mt-3 font-serif">
                Tous les types de meubles professionnels d&apos;occasion
              </h2>
              <div className="gold-divider mx-0 mt-6" />
              <p className="mt-6 text-lg text-ink-soft leading-relaxed">
                Nous proposons une gamme complète de mobilier
                professionnel reconditionné : bureaux, fauteuils
                ergonomiques, armoires, rangements, cloisons acoustiques,
                espaces détente.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {topLevelCategories.map((cat, i) => {
              const imageUrl = cat.image
                ? urlFor(cat.image).width(600).height(400).fit('crop').url()
                : null
              return (
                <Reveal key={cat._id} delay={i * 60}>
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
                        Voir la sélection <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                      </p>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>

          <Reveal>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/boutique" className="btn-gold inline-flex items-center gap-2">
                Voir tout le catalogue
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ DERNIERS MEUBLES ARRIVÉS ═══ */}
      {productCards.length > 0 && (
        <section className="container py-16 md:py-24">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="eyebrow">Arrivés à l&apos;atelier</p>
                <h2 className="text-display mt-3 font-serif leading-[1.05]">
                  Derniers meubles arrivés au showroom
                </h2>
                <div className="gold-divider mx-0 mt-6" />
              </div>
              <Link href="/boutique" className="text-sm text-gold-dark hover:text-gold underline underline-offset-4 self-end">
                Voir tout le catalogue →
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
              Notre stock évolue chaque semaine. Si vous cherchez un meuble
              spécifique qui n&apos;apparaît pas, contactez-nous : nous
              l&apos;avons peut-être en réserve, ou nous pouvons le
              rechercher pour vous lors de notre prochaine récupération.
            </p>
          </Reveal>
        </section>
      )}

      {/* ═══ SHOWROOM MARSEILLE ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <p className="eyebrow text-gold">Visite sur rendez-vous</p>
              <h2 className="text-display mt-3 font-serif text-ivory">
                Un showroom de 400 m² à dix minutes de Marseille
              </h2>
              <div className="h-px w-16 bg-gold mt-6" />
              <p className="mt-6 text-lg text-ivory/80 leading-relaxed">
                Plutôt que de commander à l&apos;aveugle, venez voir, toucher,
                essayer. Notre showroom de La Penne-sur-Huveaune présente
                en permanence environ deux cents pièces : bureaux droits
                et en angle, fauteuils ergonomiques de marques pro,
                armoires métalliques, caissons, cloisons acoustiques,
                espaces détente.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-ivory/80">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                  <span>{SHOWROOM_FULL_ADDRESS} — 10 min du centre de Marseille par l&apos;A50</span>
                </li>
                <li className="flex items-start gap-3">
                  <Store className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                  <span>Lundi-samedi, 10 h - 18 h, sur rendez-vous</span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                  <span>Livraison sur Marseille et toute la métropole Aix-Marseille-Provence</span>
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold inline-flex items-center gap-2"
                >
                  Itinéraire Google Maps
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
                <a href={`tel:${LEGAL.telephoneTel}`} className="btn-outline-light">
                  {LEGAL.telephone}
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-l-4 border-gold bg-ivory/5 p-6">
                  <Sparkles className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  <p className="mt-3 text-2xl font-serif text-ivory">200+</p>
                  <p className="text-xs uppercase tracking-widest text-ivory/60 mt-1">
                    pièces en stock
                  </p>
                </div>
                <div className="border-l-4 border-gold bg-ivory/5 p-6">
                  <Award className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  <p className="mt-3 text-2xl font-serif text-ivory">8+</p>
                  <p className="text-xs uppercase tracking-widest text-ivory/60 mt-1">
                    marques pro
                  </p>
                </div>
                <div className="border-l-4 border-gold bg-ivory/5 p-6">
                  <ShieldCheck className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  <p className="mt-3 text-2xl font-serif text-ivory">6 mois</p>
                  <p className="text-xs uppercase tracking-widest text-ivory/60 mt-1">
                    de garantie
                  </p>
                </div>
                <div className="border-l-4 border-gold bg-ivory/5 p-6">
                  <Recycle className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  <p className="mt-3 text-2xl font-serif text-ivory">-70 %</p>
                  <p className="text-xs uppercase tracking-widest text-ivory/60 mt-1">
                    vs prix neuf
                  </p>
                </div>
              </div>
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
              Ce que disent les clients marseillais
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

      {/* ═══ QUARTIERS DE MARSEILLE LIVRÉS ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24 max-w-5xl">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="eyebrow">Livraison Marseille</p>
              <h2 className="text-display mt-3 font-serif">
                Nous livrons dans tous les arrondissements de Marseille
              </h2>
              <div className="gold-divider mx-0 mt-6" />
              <p className="mt-6 text-ink-soft leading-relaxed">
                De la Joliette à Mazargues, du Vieux-Port à La Valentine,
                nous adaptons la livraison à votre adresse — y compris en
                centre-ville avec accès complexe ou en étage sans
                ascenseur.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QUARTIERS.map((q, i) => (
              <Reveal key={q} delay={i * 30}>
                <div className="bg-ivory border border-line p-4 text-sm text-ink-soft">
                  <MapPin className="h-4 w-4 text-gold inline mr-2" strokeWidth={1.5} />
                  {q}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-8 text-sm text-ink-mute">
              Vous êtes dans un autre quartier marseillais ou dans la
              métropole (Allauch, Plan-de-Cuques, Aubagne, Cassis,
              Aix-en-Provence) ? Nous livrons aussi — précisez-le simplement
              dans votre demande.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ LIENS VERS NOS AUTRES PAGES MARSEILLE ═══ */}
      <section className="container py-16 md:py-24 max-w-5xl">
        <Reveal>
          <div className="max-w-2xl mb-10">
            <p className="eyebrow">Pages spécialisées</p>
            <h2 className="text-display mt-3 font-serif">
              Vous cherchez un type précis de meuble ?
            </h2>
            <div className="gold-divider mx-0 mt-6" />
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-4">
          <Reveal>
            <Link
              href="/bureau-occasion-marseille"
              className="block group bg-ivory-light border border-line hover:border-gold transition-colors p-6"
            >
              <p className="eyebrow">Bureau d&apos;occasion</p>
              <p className="font-serif text-xl text-ink mt-2 group-hover:text-gold-dark transition">
                Bureaux professionnels d&apos;occasion à Marseille
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Bureaux droits, en angle, bench, assis-debout — Steelcase,
                Vitra, Haworth reconditionnés.
              </p>
              <p className="mt-3 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Voir la page <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </p>
            </Link>
          </Reveal>

          <Reveal delay={60}>
            <Link
              href="/fauteuil-occasion-marseille"
              className="block group bg-ivory-light border border-line hover:border-gold transition-colors p-6"
            >
              <p className="eyebrow">Fauteuil d&apos;occasion</p>
              <p className="font-serif text-xl text-ink mt-2 group-hover:text-gold-dark transition">
                Fauteuils ergonomiques d&apos;occasion à Marseille
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Sièges ergonomiques Steelcase Leap, Herman Miller Aeron,
                Vitra ID Chair — révisés en atelier.
              </p>
              <p className="mt-3 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Voir la page <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </p>
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <Link
              href="/vidage-de-locaux"
              className="block group bg-ivory-light border border-line hover:border-gold transition-colors p-6"
            >
              <p className="eyebrow">Service B2B</p>
              <p className="font-serif text-xl text-ink mt-2 group-hover:text-gold-dark transition">
                Vidage de locaux professionnels à Marseille
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Vous déménagez ou liquidez ? Nous récupérons votre mobilier
                pour le reconditionner et le revaloriser.
              </p>
              <p className="mt-3 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Voir la page <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </p>
            </Link>
          </Reveal>

          <Reveal delay={180}>
            <Link
              href="/location-mobilier-bureau"
              className="block group bg-ivory-light border border-line hover:border-gold transition-colors p-6"
            >
              <p className="eyebrow">Service B2B</p>
              <p className="font-serif text-xl text-ink mt-2 group-hover:text-gold-dark transition">
                Location longue durée de mobilier
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Une alternative à l&apos;achat pour vos bureaux temporaires
                ou en croissance — formule mensuelle.
              </p>
              <p className="mt-3 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Voir la page <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </p>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-20 max-w-3xl mx-auto text-center">
          <Truck className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
          <p className="eyebrow text-gold mt-4">Vous êtes sur Marseille ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Venez voir le showroom ou demandez un devis
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Pour un poste isolé, un plateau de dix bureaux ou
            l&apos;équipement complet d&apos;un cabinet — nous revenons
            vers vous sous 24 h ouvrées avec un devis détaillé incluant
            la livraison sur Marseille.
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
