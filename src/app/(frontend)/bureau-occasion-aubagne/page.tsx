import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Coffee,
  Hand,
  Quote,
  ArrowRight,
  Navigation,
  HelpCircle,
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
import { RegionalToNationalLink } from '@/components/national/RegionalToNationalLink'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

// Slug de la catégorie cible
const CATEGORY_SLUG = 'bureau'
// Identifiant de la page locale dans Sanity
const PAGE_KEY = 'bureau-aubagne'
// Fallback Unsplash si rien n'a été uploadé dans Sanity (image style showroom mobilier)
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Espace de bureau ouvert équipé en mobilier d\'occasion près d\'Aubagne'

export const metadata: Metadata = {
  title: 'Vente de bureaux d\'occasion à Aubagne — Showroom à 5 min, retrait sur place',
  description:
    'Vente directe de bureaux d\'occasion à 5 minutes d\'Aubagne (La Penne-sur-Huveaune). Magasin de mobilier de bureau professionnel : 200 pièces en stock, lundi-samedi sur rendez-vous. Bureaux droits, angle, bench, assis-debout reconditionnés dans notre atelier local.',
  keywords: [
    'vente bureaux aubagne',
    'vente bureau Aubagne',
    'bureau occasion Aubagne',
    'mobilier bureau Aubagne',
    'magasin meuble Aubagne',
    'magasin meuble bureau Aubagne',
    'meuble Aubagne',
    'mobilier de bureau Aubagne',
    'magasin ameublement Aubagne',
    'showroom mobilier Aubagne',
    'bureau d\'occasion Aubagne',
    'retrait bureau Aubagne',
    'bureau professionnel Aubagne',
    'mobilier reconditionné Aubagne',
    'bureau La Penne-sur-Huveaune',
  ],
  alternates: { canonical: `${siteUrl}/bureau-occasion-aubagne` },
  openGraph: {
    title: 'Vente de bureaux d\'occasion à Aubagne — Mobilier Malin',
    description:
      'Vente directe de bureaux d\'occasion à 5 minutes d\'Aubagne. Magasin de mobilier de bureau professionnel reconditionné dans notre atelier local.',
    url: `${siteUrl}/bureau-occasion-aubagne`,
    type: 'website',
  },
}

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

const SHOWROOM_FULL_ADDRESS = `${LEGAL.showroom.ligne1}, ${LEGAL.showroom.codePostal} ${LEGAL.showroom.ville}`
const MAPS_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(SHOWROOM_FULL_ADDRESS)}&output=embed`
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SHOWROOM_FULL_ADDRESS)}`

// 3 avis Google réels (mêmes que Marseille mais recadrés sur l'expérience showroom)
const REVIEWS = [
  {
    author: 'Nono',
    rating: 5,
    text: "J'ai acheté un caisson avec dossiers suspendus, en bon état, en métal blanc comme je voulais. 30 € pas cher du tout. Et en plus, le patron nous l'a chargé dans le coffre de notre voiture. En cadeau, un accueil très aimable et le sourire.",
    angle: 'Accueil et aide au chargement sur place',
  },
  {
    author: 'Hafid Soual',
    rating: 5,
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité. De plus, super accueil de l'équipe.",
    angle: 'Équipement complet — accompagnement personnalisé',
  },
  {
    author: 'Sirine M.',
    rating: 5,
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top.",
    angle: 'Conseil professionnel à la vente',
  },
] as const

// Zones desservies depuis le showroom (communes voisines d'Aubagne)
const ZONES_DESSERVIES = [
  'Aubagne centre',
  'La Penne-sur-Huveaune',
  'Cuges-les-Pins',
  'Roquevaire',
  'Auriol',
  'Gémenos',
  'Carnoux-en-Provence',
  'La Ciotat',
  'Le Beausset',
]

// FAQ pratique (cadrage showroom)
const FAQ = [
  {
    q: 'Comment venir au showroom depuis Aubagne ?',
    a: 'Notre showroom est à La Penne-sur-Huveaune, à environ 5 minutes du centre d\'Aubagne en voiture par la D560 ou la D8n. Sortie A50 si vous venez de plus loin. Parking gratuit devant.',
  },
  {
    q: 'Faut-il prendre rendez-vous ?',
    a: 'Oui, la visite se fait sur rendez-vous, du lundi au samedi entre 10 h et 18 h. Ça nous permet de vous accueillir personnellement, de préparer le mobilier qui correspond à votre besoin, et d\'avoir le temps de répondre à vos questions sans précipitation.',
  },
  {
    q: 'Que peut-on tester sur place ?',
    a: 'Tout. Vous pouvez vous asseoir sur les fauteuils, ajuster les réglages, mesurer un bureau, vérifier l\'état d\'une armoire, ouvrir les tiroirs d\'un caisson. C\'est même fortement recommandé avant un achat — surtout pour les fauteuils ergonomiques où le confort dépend de votre morphologie.',
  },
  {
    q: 'Combien de pièces y a-t-il en stock ?',
    a: 'Environ 200 pièces réparties par catégorie : bureaux, fauteuils, armoires, caissons, tables de réunion. Le stock se renouvelle au rythme de nos arrivages. Si vous cherchez un modèle précis qui n\'est pas exposé, demandez — il est peut-être en réserve.',
  },
  {
    q: 'Aidez-vous à charger le mobilier dans le véhicule ?',
    a: 'Oui, systématiquement. Que vous veniez en citadine pour un caisson ou en utilitaire pour 5 bureaux, notre équipe vous aide à charger et à arrimer correctement. Sans supplément.',
  },
  {
    q: 'Faut-il un grand véhicule ?',
    a: 'Ça dépend de votre commande. Un fauteuil ou un caisson rentre dans le coffre d\'une berline. Pour un bureau de 160 cm ou une armoire, prévoyez un break, un SUV avec banquette rabattable, ou un utilitaire. Si vous n\'avez pas le véhicule adapté, on peut organiser une livraison.',
  },
  {
    q: 'Les particuliers sont-ils les bienvenus ?',
    a: 'Bien sûr. Notre clientèle est mixte depuis le début : indépendants, particuliers qui aménagent un télétravail à domicile, professions libérales, PME, associations. Les tarifs et les conditions sont les mêmes pour tous.',
  },
  {
    q: 'Et si le mobilier ne convient pas une fois chez moi ?',
    a: 'Vous avez 14 jours pour faire jouer votre droit de rétractation (particuliers, loi Hamon). Pour les professionnels, on examine au cas par cas avec bienveillance — l\'objectif est que vous soyez content du résultat final.',
  },
]

export default async function AubagneBureauPage() {
  const [latestProducts, subCategories, localPage] = await Promise.all([
    getLatestProductsByCategoryDeep(CATEGORY_SLUG, 4),
    getCategoryChildren(CATEGORY_SLUG),
    getLocalPage(PAGE_KEY),
  ])

  const heroImageUrl = localPage.heroImage
    ? urlFor(localPage.heroImage).width(2000).url()
    : FALLBACK_HERO_URL
  const heroImageAlt = localPage.heroImage?.alt || FALLBACK_HERO_ALT
  const productCards = latestProducts.map(sanityToCard)
  const featuredCategories = subCategories.slice(0, 4)

  // JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Bureaux d\'occasion à Aubagne',
        item: `${siteUrl}/bureau-occasion-aubagne`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${siteUrl}/#localbusiness-aubagne`,
    name: 'Mobilier Malin — Showroom de bureaux d\'occasion (Aubagne)',
    description:
      'Showroom et atelier de reconditionnement de bureaux d\'occasion à La Penne-sur-Huveaune, à 5 minutes d\'Aubagne. 200 pièces en moyenne, visite sur rendez-vous.',
    url: `${siteUrl}/bureau-occasion-aubagne`,
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
      { '@type': 'City', name: 'Aubagne' },
      { '@type': 'City', name: 'La Penne-sur-Huveaune' },
      { '@type': 'City', name: 'Gémenos' },
      { '@type': 'City', name: 'Cuges-les-Pins' },
      { '@type': 'City', name: 'Roquevaire' },
      { '@type': 'City', name: 'La Ciotat' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '18:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '3',
      bestRating: '5',
      worstRating: '1',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
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
      <section className="relative bg-ink text-ivory overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={heroImageUrl}
            alt={heroImageAlt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ink/95 via-ink/70 to-ink/40" />
        </div>

        <div className="container relative py-16 md:py-20 w-full">
          <nav aria-label="Fil d'Ariane" className="text-xs text-ivory/60">
            <ol className="flex items-center gap-2 flex-wrap">
              <li><Link href="/" className="hover:text-gold">Accueil</Link></li>
              <ChevronRight className="h-3 w-3" />
              <li className="text-gold">Bureaux d&apos;occasion à Aubagne</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Vente directe · Aubagne &amp; environs</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Vente de bureaux d&apos;occasion à Aubagne
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Notre magasin de mobilier de bureau professionnel est à
              <strong className="text-ivory"> 5 minutes du centre d&apos;Aubagne</strong>,
              à La Penne-sur-Huveaune. Environ 200 pièces en stock, en vente
              directe : bureaux droits, en angle, bench et assis-debout
              reconditionnés. Lundi au samedi sur rendez-vous, café offert,
              conseils sans pression.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href={`tel:${LEGAL.telephoneTel}`} className="btn-gold inline-flex items-center gap-2">
                <Phone className="h-4 w-4" strokeWidth={1.5} />
                Prendre rendez-vous
              </a>
              <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn-outline-light inline-flex items-center gap-2">
                <Navigation className="h-4 w-4" strokeWidth={1.5} />
                Itinéraire
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TOUCHEZ, ESSAYEZ, REPARTEZ AVEC ═══ */}
      <section className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
          <Reveal>
            <div>
              <p className="eyebrow">L&apos;expérience showroom</p>
              <h2 className="text-display mt-3 font-serif leading-[1.1]">
                Touchez, essayez, repartez avec
              </h2>
              <div className="gold-divider mx-0 mt-7" />
              <p className="mt-7 text-ink-soft leading-relaxed">
                Acheter du mobilier de bureau d&apos;occasion sur photo, c&apos;est
                acceptable pour un caisson. Pour un fauteuil ergonomique ou un
                bureau qui va vous accompagner dix ans, c&apos;est insuffisant.
                C&apos;est pour ça que le showroom existe : vous venez, vous
                vous asseyez, vous comparez, vous tranchez en connaissance de
                cause.
              </p>
              <p className="mt-5 text-ink-soft leading-relaxed">
                Notre atelier est juste à côté — vous pouvez voir d&apos;où sort
                le mobilier, comment on le démonte, comment on le contrôle
                point par point avant chaque vente. Pas d&apos;effet vitrine.
                Tout est ouvert.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="bg-ivory-light border border-line p-6 text-center">
                <Hand className="h-7 w-7 text-gold mx-auto" strokeWidth={1.25} />
                <p className="font-serif text-xl text-ink mt-4">~200</p>
                <p className="text-xs uppercase tracking-widest text-ink-mute mt-2">
                  pièces en stock
                </p>
              </div>
              <div className="bg-ivory-light border border-line p-6 text-center">
                <Clock className="h-7 w-7 text-gold mx-auto" strokeWidth={1.25} />
                <p className="font-serif text-xl text-ink mt-4">Lun-Sam</p>
                <p className="text-xs uppercase tracking-widest text-ink-mute mt-2">
                  10 h — 18 h
                </p>
              </div>
              <div className="bg-ivory-light border border-line p-6 text-center">
                <Coffee className="h-7 w-7 text-gold mx-auto" strokeWidth={1.25} />
                <p className="font-serif text-xl text-ink mt-4">Café</p>
                <p className="text-xs uppercase tracking-widest text-ink-mute mt-2">
                  offert, sans pression
                </p>
              </div>
              <div className="bg-ivory-light border border-line p-6 text-center">
                <MapPin className="h-7 w-7 text-gold mx-auto" strokeWidth={1.25} />
                <p className="font-serif text-xl text-ink mt-4">5 min</p>
                <p className="text-xs uppercase tracking-widest text-ink-mute mt-2">
                  du centre d&apos;Aubagne
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ VENTE DE BUREAUX À AUBAGNE — bloc SEO ciblé ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-20 max-w-4xl">
          <Reveal>
            <p className="eyebrow">Vente directe à Aubagne</p>
            <h2 className="text-display mt-3 font-serif leading-[1.1]">
              Vente de bureaux à Aubagne : comment ça se passe
            </h2>
            <div className="gold-divider mx-0 mt-6" />
          </Reveal>

          <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
            <Reveal>
              <p>
                Notre magasin de mobilier de bureau professionnel à Aubagne
                propose la vente directe de bureaux d&apos;occasion
                reconditionnés : pas de revendeur intermédiaire, pas de
                catalogue théorique. Vous prenez rendez-vous, vous venez
                voir, vous testez, vous repartez avec le bureau, le caisson
                ou le fauteuil qui vous convient — payé sur place, livré
                ou retiré le jour même quand c&apos;est possible.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <p>
                Nous sommes une <strong className="text-ink">alternative
                concrète aux magasins de meubles d&apos;Aubagne classiques</strong>
                pour les professionnels et les indépendants qui équipent
                leur cabinet, leur bureau ou leur atelier sur le secteur
                Aubagne — Gémenos — La Penne-sur-Huveaune — Roquevaire —
                Cassis. La différence : du mobilier signé Steelcase, Vitra,
                Haworth ou Herman Miller à des prix qui ressemblent à ceux
                d&apos;un dépôt-vente, mais avec un vrai contrôle technique
                dans notre atelier avant chaque vente.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <p>
                Que vous cherchiez un bureau seul, l&apos;équipement complet
                d&apos;un open-space, un fauteuil ergonomique ou une armoire
                de rangement, nous avons en moyenne deux cents pièces en
                stock — toutes visibles, toutes essayables. Et si vous
                préférez réserver d&apos;abord et venir chercher plus tard,
                c&apos;est possible aussi.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ AVIS GOOGLE (cadrage accueil) ═══ */}
      <section className="bg-ivory border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <p className="eyebrow">Ce qu&apos;on en dit</p>
              <h2 className="text-display mt-3 font-serif leading-[1.1]">
                L&apos;accueil au showroom, vu par nos clients
              </h2>
              <div className="gold-divider mx-0 mt-7" />
            </div>
          </Reveal>

          <div className="space-y-6 max-w-4xl">
            {REVIEWS.map((review, i) => (
              <Reveal key={review.author} delay={i * 100}>
                <article className="bg-ivory border border-line p-6 md:p-8 flex gap-5">
                  <Quote className="h-7 w-7 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <p className="text-ink-soft leading-relaxed italic">
                      « {review.text} »
                    </p>
                    <div className="mt-4 pt-4 border-t border-line flex items-center justify-between flex-wrap gap-2">
                      <p className="font-serif text-base text-ink">
                        {review.author}
                        <span className="text-gold ml-2">★★★★★</span>
                      </p>
                      <p className="text-xs text-ink-mute uppercase tracking-widest">
                        {review.angle}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DERNIERS BUREAUX ═══ */}
      {productCards.length > 0 && (
        <section className="container py-16 md:py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="eyebrow">Visibles au showroom</p>
              <h2 className="text-display mt-3 font-serif">
                Nos derniers bureaux en stock
              </h2>
              <div className="gold-divider mt-6" />
              <p className="mt-6 text-ink-mute">
                Une partie de ce qu&apos;on a actuellement à La Penne. Le stock
                évolue chaque semaine — venez voir, ou demandez si vous cherchez
                un modèle précis.
              </p>
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
            <div className="mt-10 text-center">
              <Link href="/categorie/bureau" className="btn-outline inline-flex items-center gap-2">
                Voir tous les bureaux
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* ═══ SOUS-CATÉGORIES BUREAU ═══ */}
      {featuredCategories.length > 0 && (
        <section className="bg-ivory-light border-t border-line">
          <div className="container py-16 md:py-20">
            <Reveal>
              <p className="eyebrow text-center">Choisissez votre format</p>
              <h2 className="text-h1 mt-3 font-serif text-center">
                Les types de bureaux qu&apos;on travaille
              </h2>
            </Reveal>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
              {featuredCategories.map((cat, i) => {
                const imageUrl = cat.image
                  ? urlFor(cat.image).width(500).height(400).fit('crop').url()
                  : null
                return (
                  <Reveal key={cat._id} delay={i * 70}>
                    <Link
                      href={`/categorie/${cat.slug.current}`}
                      className="group block bg-ivory border border-line hover:border-gold transition-colors"
                    >
                      <div className="relative aspect-[5/4] overflow-hidden bg-ivory-dark">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={cat.image?.alt || cat.name}
                            fill
                            sizes="(min-width: 1024px) 25vw, 50vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-ink-mute/30 text-xs uppercase tracking-widest text-center px-2">
                            {cat.name}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-serif text-base text-ink leading-tight">
                          {cat.name}
                        </h3>
                        <p className="mt-2 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          Voir <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
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

      {/* ═══ FAQ PRATIQUE ═══ */}
      <section className="container py-16 md:py-24 max-w-3xl">
        <Reveal>
          <div className="text-center mb-12">
            <HelpCircle className="h-10 w-10 text-gold mx-auto" strokeWidth={1.25} />
            <p className="eyebrow mt-4">À savoir avant de venir</p>
            <h2 className="text-display mt-3 font-serif">
              Vos questions, nos réponses
            </h2>
            <div className="gold-divider mt-6" />
          </div>
        </Reveal>

        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 40}>
              <details className="group bg-ivory-light border border-line">
                <summary className="cursor-pointer p-5 md:p-6 flex items-center justify-between gap-4 list-none">
                  <span className="font-serif text-base md:text-lg text-ink leading-snug">
                    {item.q}
                  </span>
                  <span className="text-gold text-2xl transition-transform group-open:rotate-45 leading-none shrink-0">
                    +
                  </span>
                </summary>
                <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-ink-soft leading-relaxed">
                  {item.a}
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ MAP + ZONES DESSERVIES ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16">
            <Reveal>
              <div className="relative aspect-[5/4] bg-ivory/5 border border-ivory/10 overflow-hidden">
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

            <Reveal delay={120}>
              <div>
                <p className="eyebrow text-gold">Showroom Mobilier Malin</p>
                <h2 className="text-display mt-3 font-serif text-ivory leading-[1.1]">
                  Adresse et accès
                </h2>
                <div className="h-px w-12 bg-gold mt-7" />

                <dl className="mt-8 space-y-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-widest text-ivory/50 mb-1">Adresse</dt>
                      <dd className="text-ivory leading-snug">
                        {LEGAL.showroom.ligne1}<br />
                        {LEGAL.showroom.codePostal} {LEGAL.showroom.ville}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-widest text-ivory/50 mb-1">Horaires</dt>
                      <dd className="text-ivory">Lundi — Samedi, 10 h — 18 h
                        <span className="block text-ivory/50 text-xs mt-0.5">(sur rendez-vous)</span>
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-widest text-ivory/50 mb-1">Téléphone</dt>
                      <dd>
                        <a href={`tel:${LEGAL.telephoneTel}`} className="text-ivory hover:text-gold">
                          {LEGAL.telephone}
                        </a>
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-8 pt-8 border-t border-ivory/15">
                  <p className="text-[0.65rem] uppercase tracking-widest text-ivory/50 mb-3">
                    Communes couramment desservies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ZONES_DESSERVIES.map((z) => (
                      <span
                        key={z}
                        className="text-xs text-ivory/80 bg-ivory/5 border border-ivory/10 px-3 py-1.5"
                      >
                        {z}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="bg-ivory-dark border-t border-line">
        <div className="container py-16 md:py-20 text-center max-w-2xl mx-auto">
          <p className="eyebrow">Visite gratuite</p>
          <h2 className="font-serif text-h1 mt-3 text-ink">
            On vous attend au showroom
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ink-soft leading-relaxed">
            Un café, 200 pièces à voir, et notre équipe pour vous orienter.
            Pas d&apos;engagement à venir : la visite seule vous donnera une
            bien meilleure idée de ce qu&apos;est le mobilier reconditionné qu&apos;un
            catalogue en ligne.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href={`tel:${LEGAL.telephoneTel}`} className="btn-primary inline-flex items-center gap-2">
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              {LEGAL.telephone}
            </a>
            <a href={`mailto:${LEGAL.email}`} className="btn-outline inline-flex items-center gap-2">
              <Mail className="h-4 w-4" strokeWidth={1.5} />
              Écrire un email
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
