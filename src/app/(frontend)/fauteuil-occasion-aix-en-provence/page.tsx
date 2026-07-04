import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Phone,
  Mail,
  Quote,
  ArrowRight,
  Scale,
  PenTool,
  Stethoscope,
  Briefcase,
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
const PAGE_KEY = 'fauteuil-aix-en-provence'
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Fauteuils ergonomiques pour cabinets et professions libérales — Aix-en-Provence'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Fauteuils de bureau d\'occasion à Aix-en-Provence — Cabinets et professions libérales',
  description:
    'Fauteuils ergonomiques reconditionnés pour avocats, comptables, architectes et médecins libéraux d\'Aix-en-Provence. Steelcase, Herman Miller, Vitra livrés sur le Pays d\'Aix.',
  keywords: [
    'fauteuil bureau occasion Aix-en-Provence',
    'fauteuil ergonomique Aix',
    'siège bureau cabinet Aix',
    'fauteuil professionnel libéral Aix',
    'fauteuil reconditionné Aix-en-Provence',
  ],
  alternates: { canonical: `${siteUrl}/fauteuil-occasion-aix-en-provence` },
  openGraph: {
    title: 'Fauteuils de bureau d\'occasion à Aix-en-Provence — Mobilier Malin',
    description:
      'Sièges ergonomiques reconditionnés pour les professions assises du Pays d\'Aix. Garantie 6 mois.',
    url: `${siteUrl}/fauteuil-occasion-aix-en-provence`,
    type: 'website',
  },
}

const REVIEWS = [
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité.",
    context: 'Cabinet — équipement complet',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top.",
    context: 'Achat professionnel — conseil',
  },
  {
    author: 'Nono',
    date: '2026-02',
    text: "Un caisson en bon état, en métal blanc comme je voulais. Un accueil très aimable et le sourire.",
    context: 'Service — accueil',
  },
] as const

// 4 profils métiers — angle propre à Aix (tertiaire dense)
const PROFILS_METIERS = [
  {
    icon: Scale,
    metier: 'Avocats &amp; juristes',
    quartier: 'Centre-ville, Cours Mirabeau',
    duree: '9 à 11 h par jour',
    recommande: 'Steelcase Leap V2 ou Herman Miller Aeron taille B',
    detail:
      "Postures variées tout au long de la journée — lecture, rédaction, visioconférence, réception client. Besoin d'un dossier qui suit la flexion, d'accoudoirs réglables pour soulager les épaules à l'écrit.",
  },
  {
    icon: Briefcase,
    metier: 'Experts-comptables &amp; auditeurs',
    quartier: 'Pôle d\'Activités, Jas-de-Bouffan',
    duree: '8 à 10 h par jour',
    recommande: 'Steelcase Leap, Haworth Zody ou Vitra ID Mesh',
    detail:
      "Travail intensif sur double écran, périodes de pics fiscaux où l'assise dépasse douze heures. Le mécanisme synchrone et le soutien lombaire dynamique sont les critères qui priment.",
  },
  {
    icon: PenTool,
    metier: 'Architectes &amp; designers',
    quartier: 'La Duranne, Arbois',
    duree: '7 à 9 h par jour',
    recommande: 'Herman Miller Aeron, Vitra ID Trim ou Vitra Pacific',
    detail:
      "Alternance entre poste informatique et table à dessin, déplacements fréquents. Le piétement à roulettes souples et la rotation de l'assise sont déterminants pour le confort.",
  },
  {
    icon: Stethoscope,
    metier: 'Médecins &amp; professions médicales',
    quartier: 'Centre-ville, Pôle Santé',
    duree: '6 à 8 h par jour',
    recommande: 'Vitra ID Mesh, Steelcase Think ou Herman Miller Mirra',
    detail:
      "Position alternée debout/assis, consultation puis rédaction de dossiers. Besoin d'un siège qui se règle vite entre deux patients et qui supporte les changements de posture.",
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

export default async function FauteuilAixPage() {
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
        name: 'Fauteuils de bureau à Aix-en-Provence',
        item: `${siteUrl}/fauteuil-occasion-aix-en-provence`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness-fauteuil-aix`,
    name: 'Mobilier Malin — Fauteuils de bureau d\'occasion (Aix-en-Provence)',
    description:
      'Sièges ergonomiques reconditionnés Steelcase, Herman Miller, Vitra livrés aux cabinets, professions libérales et entreprises d\'Aix-en-Provence.',
    url: `${siteUrl}/fauteuil-occasion-aix-en-provence`,
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
              <li className="text-gold">Fauteuils d&apos;occasion à Aix-en-Provence</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Pays d&apos;Aix — Tertiaire libéral</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Fauteuils de bureau d&apos;occasion à Aix-en-Provence
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Le tissu économique aixois est dominé par les professions
              assises — cabinets juridiques, expertise comptable, conseil,
              architecture, médecine libérale. Nous proposons à cette
              clientèle des fauteuils ergonomiques de marque, reconditionnés
              dans notre atelier de La Penne-sur-Huveaune, livrés sur tout
              le Pays d&apos;Aix.
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

      {/* ═══ INTRO — POURQUOI L'OCCASION POUR UN CABINET ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">L&apos;équation budget &amp; santé</p>
          <h2 className="text-display mt-3 font-serif">
            Le bon siège n&apos;est pas un luxe, c&apos;est une condition
            d&apos;exercice
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Les troubles musculo-squelettiques sont la première cause
              d&apos;arrêt maladie de longue durée chez les cadres et
              professions libérales. Le siège de bureau, mal choisi ou
              vieillissant, en est l&apos;un des facteurs identifiés. Pour
              un cabinet aixois où un associé travaille dix heures par jour,
              c&apos;est un risque opérationnel autant qu&apos;un sujet de
              confort.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Le marché du fauteuil ergonomique neuf est saturé de modèles
              haut de gamme — Steelcase Leap, Herman Miller Aeron, Vitra ID
              — affichés entre 1 000 et 1 800 € pièce. À ce tarif,
              l&apos;équipement complet d&apos;un cabinet de quatre
              collaborateurs représente un investissement de plusieurs
              milliers d&apos;euros, souvent reporté.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              Nous proposons ces mêmes modèles, reconditionnés un à un dans
              notre atelier, à un tiers ou un quart de leur prix neuf. Notre
              équipe technique reste joignable directement après achat. Et
              nous livrons sur tout le Pays d&apos;Aix, en moins d&apos;une
              heure depuis La Penne-sur-Huveaune.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ 4 PROFILS MÉTIERS — SECTION SIGNATURE ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <p className="eyebrow">Adapter le siège à votre métier</p>
              <h2 className="text-display mt-3 font-serif">
                Quatre profils que nous équipons régulièrement à Aix
              </h2>
              <div className="gold-divider mx-0 mt-6" />
              <p className="mt-6 text-ink-soft leading-relaxed">
                Ces recommandations s&apos;appuient sur les retours de nos
                clients aixois et sur les caractéristiques techniques de
                chaque modèle. Elles sont indicatives — la morphologie
                individuelle reste le critère premier.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {PROFILS_METIERS.map((p, i) => {
              const Icon = p.icon
              return (
                <Reveal key={p.metier} delay={i * 80}>
                  <article className="bg-ivory border border-line p-7 md:p-8 h-full">
                    <div className="flex items-start gap-4">
                      <Icon className="h-7 w-7 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                      <div className="flex-1">
                        <h3
                          className="font-serif text-xl text-ink leading-tight"
                          dangerouslySetInnerHTML={{ __html: p.metier }}
                        />
                        <p className="text-xs uppercase tracking-widest text-ink-mute mt-2">
                          {p.quartier}
                        </p>
                      </div>
                    </div>
                    <dl className="mt-6 space-y-3 text-sm">
                      <div className="flex justify-between gap-4 pb-3 border-b border-line">
                        <dt className="text-ink-mute">Temps d&apos;assise quotidien</dt>
                        <dd className="text-ink text-right font-medium">{p.duree}</dd>
                      </div>
                      <div className="pb-3 border-b border-line">
                        <dt className="text-ink-mute mb-1">Modèles recommandés</dt>
                        <dd className="text-ink font-medium">{p.recommande}</dd>
                      </div>
                    </dl>
                    <p className="mt-5 text-sm text-ink-soft leading-relaxed">
                      {p.detail}
                    </p>
                  </article>
                </Reveal>
              )
            })}
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

      {/* ═══ CTA FINAL ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-20 max-w-3xl mx-auto text-center">
          <p className="eyebrow text-gold">Cabinets, professions libérales, sièges sociaux</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Décrivez votre activité, nous recommandons le modèle
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Nature du travail, morphologie des collaborateurs, contraintes
            d&apos;espace, budget — ces informations nous permettent de vous
            orienter vers le siège qui convient réellement. Devis détaillé
            sous 24 h ouvrées, livraison Pays d&apos;Aix incluse.
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
