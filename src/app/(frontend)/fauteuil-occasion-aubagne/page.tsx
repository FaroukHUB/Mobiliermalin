import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Phone,
  Mail,
  Quote,
  ArrowRight,
  Coffee,
  ListChecks,
  Timer,
  MapPin,
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

const CATEGORY_SLUG = 'fauteuil'
const PAGE_KEY = 'fauteuil-aubagne'
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1589384267710-7a25bc24ab28?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Fauteuils ergonomiques alignés en showroom — Aubagne'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Fauteuils de bureau d\'occasion à Aubagne — Essai libre au showroom',
  description:
    'Showroom Aubagne (La Penne-sur-Huveaune) : essayez côte à côte plusieurs fauteuils ergonomiques avant d\'acheter. Steelcase, Herman Miller, Vitra reconditionnés, garantis 6 mois.',
  keywords: [
    'fauteuil bureau occasion Aubagne',
    'fauteuil ergonomique Aubagne',
    'showroom fauteuil Aubagne',
    'siège ergonomique La Penne-sur-Huveaune',
    'fauteuil reconditionné Aubagne',
  ],
  alternates: { canonical: `${siteUrl}/fauteuil-occasion-aubagne` },
  openGraph: {
    title: 'Fauteuils de bureau d\'occasion à Aubagne — Mobilier Malin',
    description:
      'Essayez côte à côte avant d\'acheter. Steelcase, Herman Miller, Vitra reconditionnés, garantis 6 mois.',
    url: `${siteUrl}/fauteuil-occasion-aubagne`,
    type: 'website',
  },
}

const REVIEWS = [
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "Super accueil de l'équipe — j'ai pu essayer plusieurs modèles avant de me décider, ce qui change tout.",
    context: 'Essai et conseil personnalisé',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Les prix sont très attractifs et le vendeur est vraiment au top. Pour un fauteuil de bureau, c'est rassurant de pouvoir le tester.",
    context: 'Essai showroom',
  },
  {
    author: 'Nono',
    date: '2026-02',
    text: "Le patron nous a accueillis avec le sourire, on a pris notre temps. C'est ce genre de service qui manque ailleurs.",
    context: 'Accueil — visite libre',
  },
] as const

// Checklist concrète — différent des "4 modèles iconiques" de Marseille
const CHECKLIST = [
  {
    title: 'Le vérin pneumatique tient',
    detail:
      "Asseyez-vous, levez-vous, ré-asseyez-vous trois fois de suite. Le siège doit revenir à sa hauteur initiale sans descendre lentement. Un vérin fatigué, c'est un fauteuil à remettre en cause — chez nous, il est remplacé avant la vente.",
  },
  {
    title: 'Le mécanisme de basculement répond',
    detail:
      "Penchez-vous en arrière, relâchez la tension, ressentez la reprise. Un bon synchrone ou un Kinemat doit accompagner naturellement, sans à-coup ni blocage. Tous les mécanismes sont testés un à un.",
  },
  {
    title: 'Les accoudoirs ne flottent pas',
    detail:
      "Posez vos coudes, exercez une pression latérale. Pas de jeu, pas de claquement. Sur les modèles 4D (Aeron, Leap), vérifiez les quatre axes — hauteur, largeur, profondeur, rotation.",
  },
  {
    title: 'Le mesh ou la mousse a de la mémoire',
    detail:
      "Pressez fort avec la paume sur l'assise, retirez. Sur un mesh sain, la surface reprend instantanément. Sur une mousse, elle remonte en quelques secondes. Si elle reste creusée, le siège est en fin de vie.",
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
    ? urlFor(firstImage).width(1000).height(1250).fit('crop').url()
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

export default async function FauteuilAubagnePage() {
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
        name: 'Fauteuils de bureau à Aubagne',
        item: `${siteUrl}/fauteuil-occasion-aubagne`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${siteUrl}/#furniturestore-fauteuil-aubagne`,
    name: 'Mobilier Malin — Fauteuils de bureau d\'occasion (Aubagne)',
    description:
      'Showroom de fauteuils ergonomiques reconditionnés à La Penne-sur-Huveaune, à proximité immédiate d\'Aubagne. Essai libre avant achat, garantie 6 mois.',
    url: `${siteUrl}/fauteuil-occasion-aubagne`,
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
              <li><Link href="/" className="hover:text-gold">Accueil</Link></li>
              <ChevronRight className="h-3 w-3" />
              <li className="text-gold">Fauteuils d&apos;occasion à Aubagne</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Showroom à 5 minutes d&apos;Aubagne</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Fauteuils de bureau d&apos;occasion à Aubagne
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Notre showroom de La Penne-sur-Huveaune, à cinq minutes
              d&apos;Aubagne par la D8, présente en permanence une sélection
              de fauteuils ergonomiques reconditionnés. Nous vous invitons à
              venir les essayer côte à côte : c&apos;est la seule manière
              honnête de choisir un siège que vous occuperez huit heures par
              jour.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
                Itinéraire vers le showroom
              </a>
              <a href={`tel:${LEGAL.telephoneTel}`} className="btn-outline-light">
                {LEGAL.telephone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NOTRE MÉTHODE D'ESSAI — SECTION SIGNATURE ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Notre méthode d&apos;essai</p>
          <h2 className="text-display mt-3 font-serif">
            Trois fauteuils alignés, trente minutes pour décider
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <Reveal>
            <article className="bg-ivory-light border border-line p-6 h-full">
              <Timer className="h-7 w-7 text-gold" strokeWidth={1.5} />
              <p className="text-xs uppercase tracking-widest text-gold-dark mt-4">10 min</p>
              <h3 className="font-serif text-lg text-ink mt-2">
                Présélection
              </h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Vous nous décrivez votre morphologie, votre temps d&apos;assise
                quotidien, votre budget. Nous sortons deux ou trois modèles
                pertinents — un Steelcase Leap, un Aeron, un Vitra ID.
              </p>
            </article>
          </Reveal>

          <Reveal delay={80}>
            <article className="bg-ivory-light border border-line p-6 h-full">
              <Timer className="h-7 w-7 text-gold" strokeWidth={1.5} />
              <p className="text-xs uppercase tracking-widest text-gold-dark mt-4">15 min</p>
              <h3 className="font-serif text-lg text-ink mt-2">
                Essai côte à côte
              </h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Vous passez d&apos;un siège à l&apos;autre. Cinq minutes
                chacun, sans pression. Nous vous montrons les réglages au
                fur et à mesure — hauteur, profondeur, accoudoirs,
                basculement.
              </p>
            </article>
          </Reveal>

          <Reveal delay={160}>
            <article className="bg-ivory-light border border-line p-6 h-full">
              <Coffee className="h-7 w-7 text-gold" strokeWidth={1.5} />
              <p className="text-xs uppercase tracking-widest text-gold-dark mt-4">5 min</p>
              <h3 className="font-serif text-lg text-ink mt-2">
                Décision (ou réflexion)
              </h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Café offert, on récapitule les avantages de chaque modèle.
                Si vous repartez sans rien, ce n&apos;est pas grave — on
                aura au moins clarifié vos besoins pour la suite.
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ═══ CHECKLIST AVANT ACHAT — STRUCTURE UNIQUE ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-3xl mb-12">
              <ListChecks className="h-10 w-10 text-gold mb-6" strokeWidth={1.5} />
              <p className="eyebrow text-gold">Ce que nous vérifions, ce que vous pouvez vérifier</p>
              <h2 className="text-display mt-3 font-serif text-ivory leading-[1.05]">
                Quatre tests rapides à faire sur n&apos;importe quel
                fauteuil d&apos;occasion
              </h2>
              <div className="h-px w-16 bg-gold mt-8" />
              <p className="mt-8 text-ivory/75 leading-relaxed">
                Nous appliquons ces vérifications à chaque siège qui passe
                dans notre atelier. Mais c&apos;est aussi utile de les
                connaître si vous comparez plusieurs offres ailleurs.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
            {CHECKLIST.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <article className="border-l-2 border-gold pl-6 py-2">
                  <p className="text-xs uppercase tracking-widest text-gold">
                    Test {i + 1}
                  </p>
                  <h3 className="font-serif text-xl text-ivory mt-2">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-ivory/75 leading-relaxed">
                    {item.detail}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AVIS GOOGLE ═══ */}
      <section className="container py-16 md:py-24">
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

      {/* ═══ DERNIERS FAUTEUILS ═══ */}
      {productCards.length > 0 && (
        <section className="bg-ivory-dark border-y border-line">
          <div className="container py-16 md:py-24">
            <Reveal>
              <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
                <div>
                  <p className="eyebrow">Arrivés à l&apos;atelier</p>
                  <h2 className="text-display mt-3 font-serif leading-[1.05]">
                    Nos derniers fauteuils disponibles
                  </h2>
                  <div className="gold-divider mx-0 mt-6" />
                </div>
                <Link href="/categorie/fauteuils-ergonomiques" className="text-sm text-gold-dark hover:text-gold underline underline-offset-4 self-end">
                  Voir tous les fauteuils →
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

      {/* ═══ SOUS-CATÉGORIES ═══ */}
      {featuredCategories.length > 0 && (
        <section className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="eyebrow">Familles de sièges</p>
              <h2 className="text-display mt-3 font-serif">
                Direction, opérationnel, accueil, réunion
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

      {/* ═══ CTA FINAL — TON VISITE ═══ */}
      <section className="bg-ivory-dark border-t border-line">
        <div className="container py-16 md:py-20 max-w-3xl mx-auto text-center">
          <Coffee className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
          <p className="eyebrow text-gold-dark mt-4">Visite sans engagement</p>
          <h2 className="font-serif text-h1 mt-3 text-ink">
            Le café est offert. Le fauteuil, à vous de le tester.
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ink-soft leading-relaxed">
            Showroom ouvert du lundi au samedi, de 10 h à 18 h. Cinq minutes
            d&apos;Aubagne par la D8. Un appel pour caler le créneau, et
            nous préparons les modèles qui correspondent à votre profil
            avant votre arrivée.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href={`tel:${LEGAL.telephoneTel}`} className="btn-primary inline-flex items-center gap-2">
              <Phone className="h-4 w-4" /> {LEGAL.telephone}
            </a>
            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Itinéraire
            </a>
          </div>

          <p className="mt-8 text-sm text-ink-mute">
            {LEGAL.showroom.ligne1} — {LEGAL.showroom.codePostal} {LEGAL.showroom.ville}
          </p>
          <p className="mt-2 text-sm text-ink-mute">
            <a href={`mailto:${LEGAL.email}`} className="hover:text-gold-dark inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> {LEGAL.email}
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
