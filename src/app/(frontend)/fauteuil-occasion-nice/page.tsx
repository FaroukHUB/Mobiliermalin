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
import { RegionalToNationalLink } from '@/components/national/RegionalToNationalLink'

const CATEGORY_SLUG = 'fauteuil'
const PAGE_KEY = 'fauteuil-nice'
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Fauteuils ergonomiques reconditionnés livrés à Nice'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  // Template layout ajoute « | Mobilier Malin ».
  title: 'Fauteuils de bureau d\'occasion livrés à Nice — Côte d\'Azur',
  description:
    'Nous livrons nos fauteuils ergonomiques reconditionnés à Nice et sur la Côte d\'Azur. Steelcase, Herman Miller, Vitra inspectés dans notre atelier de La Penne-sur-Huveaune.',
  keywords: [
    'fauteuil bureau occasion Nice',
    'fauteuil ergonomique Nice',
    'livraison fauteuil Nice',
    'siège bureau Côte d\'Azur',
    'fauteuil reconditionné Nice',
  ],
  alternates: { canonical: `${siteUrl}/fauteuil-occasion-nice` },
  openGraph: {
    title: 'Fauteuils de bureau d\'occasion livrés à Nice — Mobilier Malin',
    description:
      'Fauteuils ergonomiques reconditionnés livrés à Nice. Steelcase, Herman Miller, Vitra, préparés dans notre atelier local.',
    url: `${siteUrl}/fauteuil-occasion-nice`,
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
    text: "Un bon état, comme je voulais. Le patron nous l'a chargé dans le coffre. Un accueil aimable.",
    context: 'Service client',
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

export default async function FauteuilNicePage() {
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
        name: 'Fauteuils de bureau à Nice',
        item: `${siteUrl}/fauteuil-occasion-nice`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness-fauteuil-nice`,
    name: 'Mobilier Malin — Fauteuils de bureau d\'occasion livrés à Nice',
    description:
      'Livraison de fauteuils ergonomiques reconditionnés Steelcase, Herman Miller, Vitra à Nice et sur la Côte d\'Azur depuis notre atelier de La Penne-sur-Huveaune.',
    url: `${siteUrl}/fauteuil-occasion-nice`,
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
      { '@type': 'City', name: 'Antibes' },
      { '@type': 'City', name: 'Sophia Antipolis' },
    ],
    // aggregateRating + review[] retirés (Sprint 5) — voir bureau-nice.
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

      
      <RegionalToNationalLink landingHref="/fauteuil-ergonomique" label="Voir aussi notre sélection nationale de fauteuils ergonomiques" />
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
              <li className="text-gold">Fauteuils d&apos;occasion à Nice</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Livraison Côte d&apos;Azur incluse</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Fauteuils de bureau d&apos;occasion livrés à Nice
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Nous recevons régulièrement des demandes de fauteuils
              ergonomiques depuis Nice et la Côte d&apos;Azur. Le fauteuil
              étant l&apos;une des pièces de mobilier de bureau les plus
              simples à transporter, nous l&apos;intégrons systématiquement
              à nos tournées de livraison azuréennes — sans surcoût excessif
              et avec la même garantie que sur Marseille.
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

      {/* ═══ POURQUOI L'OCCASION POUR LE FAUTEUIL EST PARTICULIÈREMENT PERTINENTE ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Le cas particulier du fauteuil</p>
          <h2 className="text-display mt-3 font-serif">
            Pourquoi le fauteuil est la catégorie où l&apos;occasion fait
            le plus de sens
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Un fauteuil de bureau de marque est conçu pour résister à un
              minimum de quinze ans d&apos;utilisation professionnelle
              intensive. Les composants critiques — vérin pneumatique,
              mécanisme synchrone, accoudoirs 4D, dossier en mesh — sont
              dimensionnés pour cette durée de vie. Pourtant, la plupart des
              sièges que nous récupérons ont entre cinq et huit ans : ils
              ont à peine entamé leur potentiel.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Acheter un fauteuil reconditionné de marque, c&apos;est donc
              accéder à un produit qui a encore l&apos;essentiel de sa durée
              de vie devant lui, à un prix divisé par trois. À la condition
              que le reconditionnement ait été fait sérieusement —
              c&apos;est précisément la part de notre travail dans
              l&apos;atelier de La Penne-sur-Huveaune.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              Pour Nice, l&apos;équation est encore plus claire : un fauteuil
              occupe peu de place dans le fourgon, son poids reste modéré,
              il peut être livré seul ou groupé avec d&apos;autres commandes
              de la tournée Côte d&apos;Azur. Le surcoût de transport est
              donc maîtrisé.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ NOTRE ORGANISATION LIVRAISON NICE — REPREND L'ANGLE BUREAU/NICE ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <p className="eyebrow">Notre organisation</p>
              <h2 className="text-display mt-3 font-serif">
                Le fauteuil rejoint la prochaine tournée Côte d&apos;Azur
              </h2>
              <div className="gold-divider mx-0 mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
            <Reveal>
              <article className="bg-ivory border-l-4 border-gold p-7">
                <PackageCheck className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-ink mt-5">
                  Préparation sous 48 h après commande
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Une fois votre devis accepté, nous préparons votre
                  fauteuil : derniers contrôles, ajustement éventuel des
                  réglages selon votre profil, emballage pour le transport.
                  Il rejoint le lot de la prochaine tournée Côte
                  d&apos;Azur.
                </p>
              </article>
            </Reveal>

            <Reveal delay={80}>
              <article className="bg-ivory border-l-4 border-gold p-7">
                <Truck className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-ink mt-5">
                  Livraison à l&apos;adresse, créneau confirmé
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Nous vous communiquons la date de la prochaine tournée
                  Nice au moment du devis. Vous validez ou en proposez une
                  autre. Le jour J, livraison sur votre lieu de travail ou
                  à votre domicile niçois — étage et accès à préciser au
                  préalable.
                </p>
              </article>
            </Reveal>
          </div>

          <Reveal>
            <p className="mt-10 text-sm text-ink-mute max-w-3xl">
              Si vous préférez venir chercher vous-même, notre showroom est
              à La Penne-sur-Huveaune, à environ 2 h 30 de Nice par
              l&apos;A8. Visite sur rendez-vous, du lundi au samedi de
              10 h à 18 h.
            </p>
          </Reveal>
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
          <Truck className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
          <p className="eyebrow text-gold mt-4">Vous êtes sur Nice ou la Côte d&apos;Azur ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Indiquez-nous votre besoin, nous calons la prochaine tournée
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Un fauteuil ergonomique, deux pour un cabinet, dix pour un
            plateau — nous revenons vers vous sous 24 h ouvrées avec un
            devis détaillé incluant la livraison.
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
