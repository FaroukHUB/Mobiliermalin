import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Truck, ArrowRight } from 'lucide-react'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title:
    'Zones desservies — livraison et retrait de mobilier de bureau',
  description:
    'Livraison et retrait de mobilier de bureau reconditionné dans toute la région PACA et au-delà. Marseille, Aubagne, Aix-en-Provence, Nice, Toulon, Avignon, La Ciotat, Orange. Retrait gratuit au showroom de La Penne-sur-Huveaune.',
  alternates: { canonical: '/zones-desservies' },
  openGraph: {
    title: 'Zones desservies — Mobilier Malin',
    description:
      'Livraison et retrait dans toute la région PACA et au-delà. Showroom à La Penne-sur-Huveaune.',
    type: 'website',
  },
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

// Ces villes correspondent aux pages existantes (URLs inchangées).
// Groupées par proximité géographique pour aider Google à comprendre
// notre zone de chalandise réelle.
const ZONES = [
  {
    name: 'Cœur PACA — Bouches-du-Rhône',
    intro:
      "Notre atelier et notre showroom se trouvent à La Penne-sur-Huveaune. Nous couvrons quotidiennement toute la métropole d'Aix-Marseille.",
    cities: [
      {
        name: 'Marseille',
        distanceLabel: 'À 20 min de notre atelier',
        bureauHref: '/bureau-occasion-marseille',
        fauteuilHref: '/fauteuil-occasion-marseille',
        meubleHref: '/meuble-occasion-marseille',
      },
      {
        name: 'Aubagne',
        distanceLabel: 'Notre showroom est à 5 min',
        bureauHref: '/bureau-occasion-aubagne',
        fauteuilHref: '/fauteuil-occasion-aubagne',
        meubleHref: '/meuble-occasion-aubagne',
      },
      {
        name: 'Aix-en-Provence',
        distanceLabel: 'Livraisons hebdomadaires',
        bureauHref: '/bureau-occasion-aix-en-provence',
        fauteuilHref: '/fauteuil-occasion-aix-en-provence',
      },
      {
        name: 'La Ciotat',
        distanceLabel: 'À 25 min par l\'A50',
        bureauHref: '/bureau-occasion-la-ciotat',
      },
    ],
  },
  {
    name: 'Côte varoise & Côte d\'Azur',
    intro:
      "Tournées régulières vers le Var et les Alpes-Maritimes. Journées de livraison groupées pour optimiser le trajet.",
    cities: [
      {
        name: 'Toulon',
        distanceLabel: 'Livraisons régulières',
        bureauHref: '/bureau-occasion-toulon',
        fauteuilHref: '/fauteuil-occasion-toulon',
      },
      {
        name: 'Nice',
        distanceLabel: 'Journées de livraison dédiées',
        bureauHref: '/bureau-occasion-nice',
        fauteuilHref: '/fauteuil-occasion-nice',
      },
    ],
  },
  {
    name: 'Vaucluse',
    intro: 'Tournées ponctuelles vers Avignon et le nord du Vaucluse.',
    cities: [
      {
        name: 'Avignon',
        distanceLabel: '1 h 15 par l\'A7',
        bureauHref: '/bureau-occasion-avignon',
      },
      {
        name: 'Orange',
        distanceLabel: '1 h 30 par l\'A7',
        bureauHref: '/bureau-occasion-orange',
      },
    ],
  },
]

// JSON-LD Service : nous SERVONS ces zones depuis notre unique établissement
// à La Penne-sur-Huveaune (pas de LocalBusiness fake par ville).
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${siteUrl}/zones-desservies#service`,
  name: 'Livraison et retrait de mobilier de bureau reconditionné',
  serviceType: 'Furniture delivery and pickup',
  provider: { '@id': `${siteUrl}/#organization` },
  areaServed: [
    { '@type': 'City', name: 'Marseille' },
    { '@type': 'City', name: 'Aubagne' },
    { '@type': 'City', name: 'Aix-en-Provence' },
    { '@type': 'City', name: 'La Ciotat' },
    { '@type': 'City', name: 'Toulon' },
    { '@type': 'City', name: 'Nice' },
    { '@type': 'City', name: 'Avignon' },
    { '@type': 'City', name: 'Orange' },
    { '@type': 'AdministrativeArea', name: 'Provence-Alpes-Côte d\'Azur' },
  ],
}

export default function ZonesDesserviesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <Breadcrumbs items={[{ name: 'Zones desservies' }]} />

      <section className="container py-12 md:py-20 max-w-4xl text-center">
        <p className="eyebrow flex items-center justify-center gap-2">
          <MapPin className="h-4 w-4" strokeWidth={1.5} />
          Notre couverture géographique
        </p>
        <h1 className="text-display font-serif mt-4 leading-tight">
          Zones desservies
        </h1>
        <div className="gold-divider mx-auto mt-6" />
        <p className="mt-8 text-ink-soft leading-relaxed">
          Notre atelier et notre showroom se trouvent à{' '}
          <strong className="text-ink">La Penne-sur-Huveaune</strong> (13400),
          à 5 min d'Aubagne et 20 min de Marseille. De là, nous rayonnons
          dans toute la région PACA et livrons ponctuellement au-delà.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn-primary">
            Demander un devis livraison
          </Link>
          <a
            href={`tel:${LEGAL.telephoneTel}`}
            className="btn-outline"
          >
            {LEGAL.telephone}
          </a>
        </div>
      </section>

      {ZONES.map((zone) => (
        <section key={zone.name} className="container py-10 md:py-14 max-w-5xl">
          <div className="border-l-4 border-gold pl-6 mb-8">
            <h2 className="font-serif text-2xl md:text-3xl text-ink">
              {zone.name}
            </h2>
            <p className="mt-2 text-ink-soft leading-relaxed">{zone.intro}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {zone.cities.map((city) => (
              <div
                key={city.name}
                className="bg-ivory-light border border-line p-6"
              >
                <h3 className="font-serif text-xl text-ink">{city.name}</h3>
                <p className="text-xs text-ink-mute mt-1">
                  {city.distanceLabel}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {city.bureauHref && (
                    <li>
                      <Link
                        href={city.bureauHref}
                        className="inline-flex items-center gap-2 text-ink hover:text-gold-dark transition-colors"
                      >
                        <ArrowRight className="h-3 w-3 text-gold" strokeWidth={1.5} />
                        Bureaux d'occasion à {city.name}
                      </Link>
                    </li>
                  )}
                  {city.fauteuilHref && (
                    <li>
                      <Link
                        href={city.fauteuilHref}
                        className="inline-flex items-center gap-2 text-ink hover:text-gold-dark transition-colors"
                      >
                        <ArrowRight className="h-3 w-3 text-gold" strokeWidth={1.5} />
                        Fauteuils d'occasion à {city.name}
                      </Link>
                    </li>
                  )}
                  {city.meubleHref && (
                    <li>
                      <Link
                        href={city.meubleHref}
                        className="inline-flex items-center gap-2 text-ink hover:text-gold-dark transition-colors"
                      >
                        <ArrowRight className="h-3 w-3 text-gold" strokeWidth={1.5} />
                        Meubles d'occasion à {city.name}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="bg-ink text-ivory py-14 md:py-20 mt-14">
        <div className="container max-w-3xl text-center">
          <Truck className="h-8 w-8 text-gold mx-auto" strokeWidth={1.25} />
          <h2 className="font-serif text-2xl md:text-3xl mt-4">
            Votre ville n'est pas listée ?
          </h2>
          <p className="mt-4 text-ivory/85 leading-relaxed">
            Nous livrons régulièrement au-delà de la région PACA sur devis.
            Contactez-nous pour un chiffrage transport précis selon le volume
            et votre localisation.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink px-6 py-3 font-medium transition-colors"
          >
            Demander un devis transport
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </>
  )
}
