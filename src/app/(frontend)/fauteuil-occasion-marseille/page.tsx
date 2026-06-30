import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Phone,
  Mail,
  Quote,
  ArrowRight,
  Activity,
  Award,
  Wrench,
  Eye,
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
const PAGE_KEY = 'fauteuil-marseille'
const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Fauteuil de bureau ergonomique reconditionné — showroom près de Marseille'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Fauteuils de bureau d\'occasion à Marseille — Steelcase, Herman Miller, Vitra',
  description:
    'Fauteuils ergonomiques reconditionnés à Marseille : Steelcase Leap, Herman Miller Aeron, Vitra ID. Inspectés mécanisme par mécanisme, garantis 6 mois, essayables au showroom.',
  keywords: [
    'fauteuil bureau occasion Marseille',
    'fauteuil ergonomique Marseille',
    'siège bureau occasion Marseille',
    'Steelcase Leap occasion',
    'Herman Miller Aeron occasion',
    'fauteuil reconditionné Marseille',
    'siège ergonomique professionnel',
  ],
  alternates: { canonical: `${siteUrl}/fauteuil-occasion-marseille` },
  openGraph: {
    title: 'Fauteuils de bureau d\'occasion à Marseille — Mobilier Malin',
    description:
      'Steelcase, Herman Miller, Vitra reconditionnés. Inspectés mécanisme par mécanisme, garantis 6 mois.',
    url: `${siteUrl}/fauteuil-occasion-marseille`,
    type: 'website',
  },
}

const REVIEWS = [
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité.",
    context: 'Sièges professionnels — économies',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top.",
    context: 'Matériel pro — conseil',
  },
  {
    author: 'Nono',
    date: '2026-02',
    text: "Un bon état général, en métal blanc comme je voulais. Et en plus, le patron nous l'a chargé dans le coffre. Un accueil très aimable et le sourire.",
    context: 'Achat unitaire — accueil',
  },
] as const

// 4 modèles iconiques que Mobilier Malin remet en circulation — propre à cette page
const MODELES_ICONIQUES = [
  {
    brand: 'Herman Miller',
    model: 'Aeron',
    signature: 'La référence absolue du fauteuil de bureau depuis 1994',
    detail:
      "Dossier en mesh PostureFit, soutien lombaire ajustable, accoudoirs 4D, mécanisme Kinemat. Conçu pour s'adapter à toutes les morphologies. Présent dans les sièges de grandes entreprises du monde entier.",
  },
  {
    brand: 'Steelcase',
    model: 'Leap V2',
    signature: 'Le siège favori des bureaux d\'études et cabinets de conseil',
    detail:
      "Système LiveBack qui suit la courbure naturelle de la colonne, dossier flexible Natural Glide, profondeur d'assise réglable. Particulièrement adapté aux journées longues devant écran.",
  },
  {
    brand: 'Vitra',
    model: 'ID Chair',
    signature: 'L\'ergonomie scandinave signée Antonio Citterio',
    detail:
      "Design épuré, mécanisme FlowMotion qui réagit aux moindres mouvements du dos. Les modèles ID Trim et ID Mesh sont les plus courants dans le tertiaire de prestige.",
  },
  {
    brand: 'Haworth',
    model: 'Comforto / Zody',
    signature: 'L\'alternative américaine moins connue, tout aussi performante',
    detail:
      "Soutien lombaire dynamique PAL (Pelvic and Asymmetric Lumbar) breveté. Plus rare en occasion, donc souvent récupéré dans le cadre de réaménagements de sièges sociaux régionaux.",
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

export default async function FauteuilMarseillePage() {
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
        name: 'Fauteuils de bureau à Marseille',
        item: `${siteUrl}/fauteuil-occasion-marseille`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness-fauteuil-marseille`,
    name: 'Mobilier Malin — Fauteuils de bureau d\'occasion (Marseille)',
    description:
      'Vente de fauteuils de bureau ergonomiques reconditionnés Steelcase, Herman Miller, Haworth, Vitra à Marseille. Inspectés en atelier, garantis 6 mois.',
    url: `${siteUrl}/fauteuil-occasion-marseille`,
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
              <li className="text-gold">Fauteuils d&apos;occasion à Marseille</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Ergonomie professionnelle</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Fauteuils de bureau d&apos;occasion à Marseille
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Un siège de bureau, c&apos;est huit heures par jour, deux cents
              jours par an. Nous remettons en circulation des fauteuils
              ergonomiques Steelcase, Herman Miller, Vitra et Haworth — les
              modèles conçus dès l&apos;origine pour tenir vingt ans en
              environnement professionnel. Inspectés mécanisme par mécanisme
              dans notre atelier de La Penne-sur-Huveaune, garantis six mois.
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

      {/* ═══ INTRO — POURQUOI LE FAUTEUIL EST UN INVESTISSEMENT À PART ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Le poste de travail commence par l&apos;assise</p>
          <h2 className="text-display mt-3 font-serif">
            Le fauteuil n&apos;est pas un accessoire de bureau, c&apos;est
            la pièce qui détermine tout le reste
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Un bureau, un caisson, une armoire — ces meubles travaillent peu.
              Un fauteuil de bureau, lui, encaisse une journée entière de
              pression, de mouvements, de réajustements. C&apos;est la pièce
              qui s&apos;use le plus vite, et celle dont la qualité a le plus
              d&apos;impact direct sur le confort et la santé des
              collaborateurs.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Le marché du fauteuil neuf reflète cette exigence : un Steelcase
              Leap V2 dépasse 1 200 € pièce, un Herman Miller Aeron grimpe à
              1 600 €. À ces prix, peu d&apos;entreprises marseillaises
              équipent l&apos;ensemble de leurs équipes avec le bon matériel.
              Beaucoup se rabattent sur des sièges génériques à 200 €, qui
              tiennent dix-huit mois avant que le piston cède ou que la mousse
              s&apos;affaisse.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              L&apos;occasion reconditionnée résout cette équation : nous
              proposons exactement les mêmes modèles iconiques, vérifiés un
              à un dans notre atelier, à un tiers ou un quart de leur prix
              neuf. Avec une garantie de six mois pour couvrir l&apos;usage.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ 4 MODÈLES ICONIQUES — STRUCTURE PROPRE À CETTE PAGE ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-3xl mb-14">
              <p className="eyebrow text-gold">Les références que nous remettons en circulation</p>
              <h2 className="text-display mt-3 font-serif text-ivory leading-[1.05]">
                Quatre modèles iconiques du fauteuil ergonomique
              </h2>
              <div className="h-px w-16 bg-gold mt-8" />
              <p className="mt-8 text-ivory/75 leading-relaxed">
                Ces sièges représentent l&apos;essentiel de notre stock
                fauteuils. La disponibilité varie selon les arrivages — si le
                modèle exact que vous cherchez n&apos;est pas en ligne au
                moment de votre visite, indiquez-nous votre préférence, nous
                pouvons souvent l&apos;identifier sur les prochains chantiers
                de récupération.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-px bg-ivory/10 border border-ivory/10">
            {MODELES_ICONIQUES.map((m, i) => (
              <Reveal key={`${m.brand}-${m.model}`} delay={i * 60}>
                <article className="bg-ink p-7 md:p-8 h-full">
                  <p className="text-xs uppercase tracking-widest text-gold">{m.brand}</p>
                  <h3 className="font-serif text-2xl text-ivory mt-2">{m.model}</h3>
                  <p className="mt-3 text-sm text-ivory/70 italic">{m.signature}</p>
                  <p className="mt-5 text-sm text-ivory/75 leading-relaxed">
                    {m.detail}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ POURQUOI ESSAYER AVANT D'ACHETER ═══ */}
      <section className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <Eye className="h-10 w-10 text-gold" strokeWidth={1.5} />
              <p className="eyebrow mt-6">Showroom ou achat en ligne</p>
              <h2 className="text-display mt-3 font-serif leading-[1.05]">
                Bien choisir son fauteuil ergonomique
              </h2>
              <div className="gold-divider mx-0 mt-6" />
              <p className="mt-6 text-ink-soft leading-relaxed">
                Vous pouvez commander directement en ligne — chaque fiche
                produit détaille la morphologie ciblée, les réglages
                disponibles et l&apos;état précis du siège. Si vous
                préférez essayer avant d&apos;acheter, notre showroom de
                La Penne-sur-Huveaune est ouvert du lundi au samedi. Voici
                les trois points qui font la différence dans le choix.
              </p>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal>
              <article className="bg-ivory-light border-l-4 border-gold p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <Activity className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-ink">
                      La morphologie change tout
                    </h3>
                    <p className="mt-2 text-ink-soft leading-relaxed">
                      Un Aeron taille B convient à la plupart des
                      utilisateurs, mais un Leap V2 sera mieux adapté aux
                      personnes plus grandes. Cinq minutes d&apos;essai
                      suffisent à trancher — et évitent une erreur
                      d&apos;équipement à 700 € pièce.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={80}>
              <article className="bg-ivory-light border-l-4 border-gold p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <Wrench className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-ink">
                      Nous expliquons les réglages
                    </h3>
                    <p className="mt-2 text-ivory-light leading-relaxed text-ink-soft">
                      Un siège ergonomique non réglé reste un mauvais siège.
                      Hauteur d&apos;assise, profondeur, tension du
                      basculement, accoudoirs 4D, soutien lombaire — nous
                      prenons le temps de tout passer en revue lors de votre
                      visite.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={160}>
              <article className="bg-ivory-light border-l-4 border-gold p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <Award className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-ink">
                      Voir l&apos;état réel du fauteuil
                    </h3>
                    <p className="mt-2 text-ink-soft leading-relaxed">
                      Nos photos sont fidèles, mais une visite au showroom
                      permet d&apos;apprécier la matière du mesh, la mémoire
                      de la mousse, l&apos;état du piétement. Nous classons
                      chaque siège selon son état (excellent, très bon, bon)
                      — vous voyez de quoi il s&apos;agit concrètement.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ DERNIERS FAUTEUILS ARRIVÉS ═══ */}
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

      {/* ═══ SOUS-CATÉGORIES (si renseignées en Sanity) ═══ */}
      {featuredCategories.length > 0 && (
        <section className="bg-ivory-dark border-y border-line">
          <div className="container py-16 md:py-24">
            <Reveal>
              <div className="max-w-2xl mb-10">
                <p className="eyebrow">Familles de sièges</p>
                <h2 className="text-display mt-3 font-serif">
                  Direction, opérationnel, réunion, accueil
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

      {/* ═══ CTA FINAL ═══ */}
      <section className="container py-16 md:py-24 max-w-3xl mx-auto text-center">
        <p className="eyebrow text-gold-dark">Visite ou conseil</p>
        <h2 className="font-serif text-h1 mt-3 text-ink">
          Venez tester nos sièges, ou demandez-nous conseil
        </h2>
        <div className="h-px w-12 bg-gold mx-auto mt-6" />
        <p className="mt-6 text-ink-soft leading-relaxed">
          Notre showroom de La Penne-sur-Huveaune se trouve à quinze minutes
          de la Joliette. Nous y présentons en permanence une sélection de
          fauteuils ergonomiques de marque, tous reconditionnés. Vous pouvez
          également nous décrire vos contraintes (taille, durée d&apos;assise,
          budget) — nous vous orientons vers les modèles adaptés.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
            Demander conseil
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
      </section>
    </>
  )
}
