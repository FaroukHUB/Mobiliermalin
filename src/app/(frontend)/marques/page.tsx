import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { getProductsByBrand } from '@/lib/sanity'
import { BRAND_OFFICIAL_URL } from '@/lib/schema-mappings'

/**
 * /marques — hub des marques distribuées.
 *
 * Page pilier du silo "marques" : elle reçoit les liens du fil d'Ariane
 * des pages marque (qui pointaient jusqu'ici vers une URL inexistante)
 * et redistribue vers chaque page dédiée.
 */

export const revalidate = 3600

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'
const pageUrl = `${siteUrl}/marques`

export const metadata: Metadata = {
  title: 'Marques de mobilier de bureau reconditionné : Steelcase, Herman Miller, Vitra…',
  description:
    'Les marques professionnelles que nous reconditionnons en atelier : Steelcase, Herman Miller, Vitra, Haworth et une dizaine d\'autres signatures. Prix, modèles, disponibilité.',
  keywords: [
    'marques mobilier de bureau',
    'Steelcase occasion',
    'Herman Miller occasion',
    'Vitra occasion',
    'Haworth occasion',
    'mobilier de bureau reconditionné marques',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: 'Marques distribuées — Mobilier Malin',
    description:
      'Steelcase, Herman Miller, Vitra, Haworth : le mobilier de bureau des grandes signatures, reconditionné en atelier.',
    url: pageUrl,
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

/** Marques disposant d'une page dédiée. */
const BRAND_PAGES = [
  {
    name: 'Steelcase',
    href: '/marques/steelcase',
    tagline: 'Leap V2, Think, Series 1, Gesture, Migration Bench',
    body: 'Le fabricant américain équipe les grandes entreprises depuis 1912. Ses fauteuils sont conçus pour un usage intensif et se reconditionnent particulièrement bien : pièces détachées disponibles, mécanismes robustes.',
  },
  {
    name: 'Herman Miller',
    href: '/marques/herman-miller',
    tagline: 'Aeron, Mirra, Sayl, Embody',
    body: 'La signature du design ergonomique américain. L\'Aeron, entré dans les collections du MoMA, reste l\'un des fauteuils de bureau les plus recherchés en reconditionné.',
  },
  {
    name: 'Vitra',
    href: '/marques/vitra',
    tagline: 'ID Chair, Physix, AC 5, Eames',
    body: 'L\'éditeur suisse associe design d\'auteur et fabrication européenne. Un mobilier qui traverse les décennies sans se démoder, autant en fauteuil de travail qu\'en assise de réunion.',
  },
  {
    name: 'Haworth',
    href: '/marques/haworth',
    tagline: 'Zody, Comforto, Fern',
    body: 'Le constructeur du Michigan mise sur l\'ergonomie assistée et les matériaux durables. Le Zody, avec son soutien lombaire asymétrique, est une alternative sérieuse aux références plus connues.',
  },
]

/**
 * Autres marques présentes au catalogue, sans page dédiée. Elles
 * pointent vers la boutique filtrée mentalement par le visiteur —
 * l'objectif est de montrer l'étendue du sourcing.
 */
const OTHER_BRANDS = [
  'USM Haller',
  'Majencia',
  'HÅG',
  'Knoll',
  'ICF',
  'Zuco',
  'Actiu',
  'Sedus',
  'Klöber',
  'Giroflex',
]

export default async function MarquesPage() {
  // Compte des pièces disponibles par marque (affiché seulement si > 0,
  // jamais de chiffre inventé).
  const counts = await Promise.all(
    BRAND_PAGES.map(async (b) => {
      const products = await getProductsByBrand(b.name)
      return { name: b.name, count: products.length }
    }),
  )
  const countByBrand = new Map(counts.map((c) => [c.name, c.count]))

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name: 'Marques de mobilier de bureau reconditionné',
    description:
      'Les marques professionnelles reconditionnées dans notre atelier de La Penne-sur-Huveaune.',
    url: pageUrl,
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: BRAND_PAGES.length,
      itemListElement: BRAND_PAGES.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        url: `${siteUrl}${b.href}`,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <Breadcrumbs items={[{ name: 'Marques' }]} />

      {/* Hero */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-12 md:py-20 max-w-3xl">
          <p className="eyebrow">Marques distribuées</p>
          <h1 className="text-display mt-3 font-serif leading-[1.05]">
            Les signatures du mobilier de bureau, reconditionnées en atelier
          </h1>
          <div className="gold-divider mx-0 mt-7" />
          <p className="mt-7 text-lg text-ink-soft leading-relaxed">
            Nous sourçons du mobilier professionnel auprès d&apos;entreprises
            qui renouvellent leurs espaces. Ces marques ont un point commun :
            elles ont été conçues pour durer plus de dix ans en usage
            intensif, avec des pièces détachées disponibles. C&apos;est
            précisément ce qui rend leur reconditionnement pertinent.
          </p>
        </div>
      </section>

      {/* Marques avec page dédiée */}
      <section className="container py-14 md:py-20">
        <Reveal>
          <div className="max-w-2xl mb-10">
            <p className="eyebrow">Nos sélections</p>
            <h2 className="font-serif text-h1 mt-2">
              Quatre marques, quatre pages dédiées
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {BRAND_PAGES.map((brand, i) => {
            const count = countByBrand.get(brand.name) ?? 0
            return (
              <Reveal key={brand.name} delay={i * 80}>
                <Link
                  href={brand.href}
                  className="group flex flex-col h-full bg-ivory-light border border-line hover:border-gold transition-colors duration-300 p-6 md:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl text-ink group-hover:text-gold-dark transition-colors">
                        {brand.name}
                      </h3>
                      <p className="mt-1.5 text-xs uppercase tracking-widest text-gold-dark">
                        {brand.tagline}
                      </p>
                    </div>
                    <ArrowRight
                      className="h-5 w-5 text-gold shrink-0 mt-1 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="mt-4 text-sm text-ink-soft leading-relaxed flex-1">
                    {brand.body}
                  </p>
                  {count > 0 && (
                    <p className="mt-5 text-xs uppercase tracking-widest text-ink-mute">
                      {count} pièce{count > 1 ? 's' : ''} disponible
                      {count > 1 ? 's' : ''}
                    </p>
                  )}
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Autres marques */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-14 md:py-20">
          <Reveal>
            <div className="max-w-2xl mb-8">
              <p className="eyebrow">Également au catalogue</p>
              <h2 className="font-serif text-h1 mt-2">
                Les autres signatures que nous reconditionnons
              </h2>
              <p className="mt-4 text-ink-soft leading-relaxed">
                Notre stock évolue au rythme des entreprises qui renouvellent
                leur mobilier. Ces marques passent régulièrement par notre
                atelier, sans page dédiée pour l&apos;instant.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex flex-wrap gap-2">
              {OTHER_BRANDS.map((name) => (
                <span
                  key={name}
                  className="text-sm text-ink-soft border border-line bg-ivory-light px-4 py-2"
                >
                  {name}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={200}>
            <Link
              href="/boutique"
              className="mt-8 inline-flex items-center gap-2 btn-outline"
            >
              Voir tout le catalogue
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Pourquoi ces marques */}
      <section className="container py-14 md:py-20 max-w-4xl">
        <Reveal>
          <div className="text-center mb-10">
            <p className="eyebrow">Notre exigence</p>
            <h2 className="text-h1 font-serif mt-3">
              Pourquoi nous sélectionnons ces marques
            </h2>
            <div className="gold-divider mx-auto mt-6" />
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-px bg-line border border-line">
          {[
            {
              title: 'Conçues pour l\'usage intensif',
              body: 'Ce mobilier a été dimensionné pour des open-spaces occupés huit heures par jour. Après quelques années de service, il lui reste l\'essentiel de sa durée de vie.',
            },
            {
              title: 'Pièces détachées disponibles',
              body: 'Vérins, roulettes, accoudoirs, mécanismes : les composants d\'usure se remplacent. C\'est ce qui nous permet de garantir nos reconditionnements.',
            },
            {
              title: 'Contrôlées dans notre atelier',
              body: 'Chaque pièce est démontée, nettoyée en profondeur, testée réglage par réglage à La Penne-sur-Huveaune avant sa mise en vente.',
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="bg-ivory-light p-7 md:p-8 h-full">
                <Check className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-xl text-ink mt-5 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-ink-soft mt-3 leading-relaxed">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sites officiels — liens sortants d'autorité */}
      <section className="container pb-14 md:pb-20 max-w-4xl">
        <p className="text-xs uppercase tracking-widest text-ink-mute mb-3">
          Sites officiels des fabricants
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {BRAND_PAGES.map((b) => {
            const url = BRAND_OFFICIAL_URL[b.name]
            if (!url) return null
            return (
              <a
                key={b.name}
                href={url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-ink-mute hover:text-gold-dark underline underline-offset-4"
              >
                {b.name}
              </a>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-20 text-center max-w-3xl mx-auto">
          <p className="eyebrow text-gold">Une marque précise en tête ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Dites-nous ce que vous cherchez
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/70 leading-relaxed">
            Notre stock change chaque semaine. Si le modèle que vous cherchez
            n&apos;est pas en ligne, décrivez-le-nous : nous vous prévenons
            dès qu&apos;il entre à l&apos;atelier.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Nous contacter
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <a href="tel:+33676617053" className="btn-outline-light">
              06 76 61 70 53
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
