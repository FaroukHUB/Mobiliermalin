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
  Navigation,
  Clock,
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

const PAGE_KEY = 'meuble-aubagne'
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Magasin de meubles d\'occasion professionnels à 5 minutes d\'Aubagne'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Magasin de meubles d\'occasion à Aubagne — Showroom à 5 min, retrait sur place',
  description:
    'Magasin de meubles d\'occasion professionnels à 5 minutes d\'Aubagne (La Penne-sur-Huveaune). 200 pièces en stock : bureaux, fauteuils, armoires, rangements. Marques pro reconditionnées dans notre atelier local. Lundi-samedi sur rendez-vous.',
  keywords: [
    'magasin meuble aubagne',
    'magasin meuble bureau Aubagne',
    'magasin ameublement aubagne',
    'magasin meubles aubagne',
    'meuble aubagne',
    'meuble occasion Aubagne',
    'meubles occasion Aubagne',
    'meuble d\'occasion Aubagne',
    'meubles d\'occasion Aubagne',
    'mobilier de bureau Aubagne',
    'vente meuble occasion Aubagne',
    'meuble seconde main Aubagne',
    'meuble reconditionné Aubagne',
    'destockage meuble Aubagne',
  ],
  alternates: { canonical: `${siteUrl}/meuble-occasion-aubagne` },
  openGraph: {
    title: 'Magasin de meubles d\'occasion à Aubagne — Mobilier Malin',
    description:
      'Magasin de meubles d\'occasion professionnels à 5 minutes d\'Aubagne. Bureaux, fauteuils, armoires reconditionnés dans notre atelier local.',
    url: `${siteUrl}/meuble-occasion-aubagne`,
    type: 'website',
  },
}

const REVIEWS = [
  {
    author: 'Nono',
    date: '2026-02',
    text: "J'ai acheté un caisson avec dossiers suspendus, en bon état, en métal blanc comme je voulais. 30 € pas cher du tout. Et en plus, le patron nous l'a chargé dans le coffre de notre voiture. En cadeau, un accueil très aimable et le sourire.",
    context: 'Achat showroom · Aubagne',
  },
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité.",
    context: 'Équipement complet · Aubagne',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top — petit message également pour les livreurs qui ont été au top.",
    context: 'Achat + livraison · Aubagne',
  },
] as const

// Zones desservies depuis le showroom (communes voisines d'Aubagne)
const ZONES_DESSERVIES = [
  'Aubagne centre',
  'Aubagne Camp Major',
  'Aubagne Les Passons',
  'La Penne-sur-Huveaune',
  'Cuges-les-Pins',
  'Roquevaire',
  'Auriol',
  'Gémenos',
  'Carnoux-en-Provence',
  'Cassis',
  'La Ciotat',
  'Belcodène',
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

export default async function MeubleOccasionAubagnePage() {
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
        name: 'Meubles d\'occasion à Aubagne',
        item: `${siteUrl}/meuble-occasion-aubagne`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${siteUrl}/#furniturestore-aubagne`,
    name: 'Mobilier Malin — Magasin de meubles d\'occasion à Aubagne',
    description:
      'Magasin de meubles d\'occasion professionnels à 5 minutes d\'Aubagne (La Penne-sur-Huveaune). Bureaux, fauteuils, armoires, rangements reconditionnés Steelcase, Herman Miller, Vitra, Haworth. Garantie 6 mois, retrait sur place ou livraison.',
    url: `${siteUrl}/meuble-occasion-aubagne`,
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
      { '@type': 'City', name: 'Aubagne' },
      { '@type': 'City', name: 'La Penne-sur-Huveaune' },
      { '@type': 'City', name: 'Gémenos' },
      { '@type': 'City', name: 'Roquevaire' },
      { '@type': 'City', name: 'Auriol' },
      { '@type': 'City', name: 'Cuges-les-Pins' },
      { '@type': 'City', name: 'Carnoux-en-Provence' },
      { '@type': 'City', name: 'Cassis' },
      { '@type': 'City', name: 'La Ciotat' },
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
              <li className="text-gold">Meubles d&apos;occasion à Aubagne</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Showroom à 5 min d&apos;Aubagne</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Magasin de meubles d&apos;occasion à Aubagne
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Notre magasin de meubles d&apos;occasion est installé à
              La Penne-sur-Huveaune, à <strong className="text-ivory">5
              minutes du centre d&apos;Aubagne</strong>. Vous y trouvez en
              permanence environ deux cents pièces de mobilier
              professionnel reconditionné : bureaux, fauteuils ergonomiques,
              armoires, rangements, cloisons. Marques pro uniquement
              (Steelcase, Vitra, Haworth, Herman Miller), garantie six
              mois, accueil sur rendez-vous du lundi au samedi.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href={`tel:${LEGAL.telephoneTel}`} className="btn-gold inline-flex items-center gap-2">
                <Phone className="h-4 w-4" strokeWidth={1.5} />
                Prendre rendez-vous
              </a>
              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-light inline-flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" strokeWidth={1.5} />
                Itinéraire
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-ivory/70">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" /> Garantie 6 mois
              </span>
              <span className="inline-flex items-center gap-2">
                <Award className="h-4 w-4 text-gold" /> Marques pro
              </span>
              <span className="inline-flex items-center gap-2">
                <Store className="h-4 w-4 text-gold" /> Visite showroom
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ POURQUOI NOUS À AUBAGNE ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Notre approche du meuble d&apos;occasion</p>
          <h2 className="text-display mt-3 font-serif">
            Le seul magasin de meubles d&apos;occasion pro à Aubagne
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              À Aubagne et alentours, on trouve plusieurs magasins de
              meubles neufs et quelques dépôts-ventes pour le mobilier de
              maison. Mais pour du <strong className="text-ink">mobilier
              professionnel reconditionné de marque</strong> — bureaux
              Steelcase, fauteuils Herman Miller, armoires métalliques pro,
              caissons à serrure — il n&apos;existait pas de magasin
              spécialisé à proximité. C&apos;est ce vide que nous comblons
              depuis La Penne-sur-Huveaune.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Notre atelier prépare chaque meuble avant la mise en vente :
              inspection en sept points, démontage si nécessaire,
              remplacement des pièces défectueuses, nettoyage
              professionnel, remontage, test. Rien n&apos;est exposé sans
              avoir passé cette étape. Ça change tout par rapport à un
              achat sur Le Bon Coin ou en dépôt-vente classique : équipe
              technique locale joignable après achat, conseil par une équipe
              qui connaît chaque marque, aide au chargement, livraison
              possible sur tout le secteur Aubagne-Marseille.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              Côté tarif, l&apos;occasion vous permet d&apos;accéder à du
              mobilier qui coûte 1 200 € neuf pour 300 à 450 € chez nous.
              C&apos;est valable autant pour un cabinet libéral
              aubagnais qui équipe ses bureaux qu&apos;pour un particulier
              qui aménage son télétravail à la maison.
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
                professionnel reconditionné. Tout est exposé au showroom
                et essayable sur place.
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

      {/* ═══ SHOWROOM AUBAGNE ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <p className="eyebrow text-gold">Visite sur rendez-vous</p>
              <h2 className="text-display mt-3 font-serif text-ivory">
                Un showroom de 400 m² à cinq minutes d&apos;Aubagne
              </h2>
              <div className="h-px w-16 bg-gold mt-6" />
              <p className="mt-6 text-lg text-ivory/80 leading-relaxed">
                Plutôt que d&apos;acheter à l&apos;aveugle, venez voir,
                toucher, essayer. Notre showroom présente en permanence
                environ deux cents pièces : bureaux droits et en angle,
                fauteuils ergonomiques, armoires métalliques, caissons,
                cloisons acoustiques, espaces détente. L&apos;atelier est
                juste à côté — vous voyez d&apos;où sortent les meubles,
                comment on les démonte et les contrôle avant chaque vente.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-ivory/80">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                  <span>{SHOWROOM_FULL_ADDRESS} — 5 min d&apos;Aubagne par la D560 ou la D8n</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                  <span>Lundi-samedi, 10 h - 18 h, sur rendez-vous</span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                  <span>Aide au chargement gratuite · livraison Aubagne et alentours sur devis</span>
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
              Ce que disent les clients aubagnais
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

      {/* ═══ ZONES DESSERVIES ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24 max-w-5xl">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="eyebrow">Livraison Aubagne &amp; environs</p>
              <h2 className="text-display mt-3 font-serif">
                Aubagne et toutes les communes voisines
              </h2>
              <div className="gold-divider mx-0 mt-6" />
              <p className="mt-6 text-ink-soft leading-relaxed">
                Du centre d&apos;Aubagne aux communes des alentours, en
                passant par la vallée de l&apos;Huveaune et la côte
                cassidaine — nous livrons rapidement ou vous accueillons
                au showroom pour un retrait sur place.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ZONES_DESSERVIES.map((q, i) => (
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
              Vous êtes dans une commune voisine non listée (Marseille,
              Toulon, Aix-en-Provence) ? Nous livrons aussi — précisez-le
              simplement dans votre demande.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ LIENS VERS PAGES SPÉCIALISÉES AUBAGNE ═══ */}
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
              href="/bureau-occasion-aubagne"
              className="block group bg-ivory-light border border-line hover:border-gold transition-colors p-6"
            >
              <p className="eyebrow">Bureau d&apos;occasion</p>
              <p className="font-serif text-xl text-ink mt-2 group-hover:text-gold-dark transition">
                Vente de bureaux d&apos;occasion à Aubagne
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
              href="/fauteuil-occasion-aubagne"
              className="block group bg-ivory-light border border-line hover:border-gold transition-colors p-6"
            >
              <p className="eyebrow">Fauteuil d&apos;occasion</p>
              <p className="font-serif text-xl text-ink mt-2 group-hover:text-gold-dark transition">
                Fauteuils ergonomiques à Aubagne
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
              href="/rachat-mobilier-bureau"
              className="block group bg-ivory-light border border-line hover:border-gold transition-colors p-6"
            >
              <p className="eyebrow">Service B2B</p>
              <p className="font-serif text-xl text-ink mt-2 group-hover:text-gold-dark transition">
                Rachat &amp; déstockage de mobilier
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Vous fermez vos locaux ? Nous rachetons votre mobilier
                pro avec enlèvement inclus.
              </p>
              <p className="mt-3 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Voir la page <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </p>
            </Link>
          </Reveal>

          <Reveal delay={180}>
            <Link
              href="/vidage-de-locaux"
              className="block group bg-ivory-light border border-line hover:border-gold transition-colors p-6"
            >
              <p className="eyebrow">Service B2B</p>
              <p className="font-serif text-xl text-ink mt-2 group-hover:text-gold-dark transition">
                Vidage de locaux professionnels
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Pour les déménagements, fermetures ou rénovations sur
                Aubagne et alentours.
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
          <Store className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
          <p className="eyebrow text-gold mt-4">Vous êtes sur Aubagne ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Venez voir le showroom ou demandez un devis
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Visite sur rendez-vous, café offert, conseils sans pression.
            Notre équipe est à votre disposition pour vous présenter le
            mobilier qui correspond à votre besoin — qu&apos;il
            s&apos;agisse d&apos;un poste isolé, d&apos;un cabinet
            complet ou d&apos;un plateau d&apos;open-space.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href={`tel:${LEGAL.telephoneTel}`} className="btn-gold inline-flex items-center gap-2">
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              Prendre rendez-vous
            </a>
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
