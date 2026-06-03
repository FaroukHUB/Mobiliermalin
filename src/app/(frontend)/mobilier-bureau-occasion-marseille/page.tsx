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
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { getSiteSettings, urlFor } from '@/lib/sanity'
import { LEGAL } from '@/lib/legal'

export const revalidate = 86400 // 24h, pas besoin de revalider plus souvent

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title:
    'Mobilier de bureau d\'occasion à Marseille — Reconditionné, livré, garanti',
  description:
    'Mobilier de bureau professionnel d\'occasion livré à Marseille : Steelcase, Herman Miller, Haworth, Vitra reconditionnés. Showroom à 15 min de la Joliette, garantie 6 mois, devis sous 24 h.',
  keywords: [
    'mobilier de bureau occasion Marseille',
    'meuble occasion Marseille',
    'bureau occasion Marseille',
    'fauteuil bureau Marseille',
    'mobilier professionnel Marseille',
    'équiper bureaux Marseille',
    'vente mobilier bureau Marseille',
  ],
  alternates: { canonical: `${siteUrl}/mobilier-bureau-occasion-marseille` },
  openGraph: {
    title: 'Mobilier de bureau d\'occasion à Marseille — Mobilier Malin',
    description:
      'Steelcase, Herman Miller, Haworth, Vitra reconditionnés. Livraison Marseille, retrait au showroom, garantie 6 mois.',
    url: `${siteUrl}/mobilier-bureau-occasion-marseille`,
    type: 'website',
  },
}

// 3 avis Google clients réels (à mettre à jour quand on en a d'autres)
const REVIEWS = [
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité. De plus, super accueil de l'équipe.",
    context: 'Équipement de bureaux professionnels',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top — petit message également pour les livreurs qui ont été au top.",
    context: 'Matériel professionnel + livraison',
  },
  {
    author: 'Nono',
    date: '2026-02',
    text: "J'ai acheté un caisson avec dossiers suspendus, en bon état, en métal blanc comme je voulais. 30 € pas cher du tout. Et en plus, le patron nous l'a chargé dans le coffre de notre voiture. En cadeau, un accueil très aimable et le sourire.",
    context: 'Achat unitaire — particulier',
  },
] as const

const ZONES_MARSEILLE = [
  { code: '13001', name: 'Belsunce, Noailles, Centre-ville', detail: 'agences, cabinets d\'avocats' },
  { code: '13002', name: 'Joliette, Arenc', detail: 'startups Euroméditerranée, sièges de grands comptes' },
  { code: '13003', name: 'Belle de Mai, Saint-Mauront', detail: 'tiers-lieux, associations, structures culturelles' },
  { code: '13006', name: 'Castellane, Préfecture, Vauban', detail: 'professions libérales, cabinets médicaux' },
  { code: '13008', name: 'Prado, Bonneveine, Périer', detail: 'sociétés de services, conseil' },
  { code: '13009', name: 'Mazargues, Sainte-Marguerite', detail: 'PME industrielles, garages' },
  { code: '13015-16', name: 'L\'Estaque, Saint-Henri', detail: 'zones d\'activités, ateliers' },
]

export default async function MarseillePage() {
  const settings = await getSiteSettings()
  const showroomImageUrl = settings.showroomImage
    ? urlFor(settings.showroomImage).width(1600).url()
    : null

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Mobilier de bureau à Marseille',
        item: `${siteUrl}/mobilier-bureau-occasion-marseille`,
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness-marseille`,
    name: 'Mobilier Malin — Mobilier de bureau d\'occasion (Marseille)',
    description:
      'Vente et livraison de mobilier de bureau reconditionné Steelcase, Herman Miller, Haworth, Vitra pour les entreprises et particuliers de Marseille et alentours.',
    url: `${siteUrl}/mobilier-bureau-occasion-marseille`,
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
      <section className="relative bg-ink text-ivory overflow-hidden">
        {showroomImageUrl && (
          <div className="absolute inset-0 opacity-30">
            <Image
              src={showroomImageUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
          </div>
        )}

        <div className="container relative py-16 md:py-24">
          <nav aria-label="Fil d'Ariane" className="text-xs text-ivory/60">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link href="/" className="hover:text-gold">Accueil</Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li className="text-gold">Mobilier de bureau à Marseille</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Marseille &amp; alentours</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05]">
              Mobilier de bureau d&apos;occasion à Marseille
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Steelcase, Herman Miller, Haworth, Vitra reconditionnés —
              récupérés dans des entreprises qui déménagent, inspectés et
              remis en état dans notre atelier à 15 minutes de la Joliette.
              Livraison Marseille intra-muros, retrait possible au showroom,
              garantie 6 mois sur chaque pièce.
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

      {/* ═══ POURQUOI DES ENTREPRISES MARSEILLAISES ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Le tissu économique marseillais</p>
          <h2 className="text-display mt-3 font-serif">
            Pourquoi des entreprises marseillaises choisissent le mobilier reconditionné
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Marseille a ses particularités. Un mélange dense de PME
              industrielles historiques dans les arrondissements nord, de
              startups montées dans le sillage d&apos;Euroméditerranée à la
              Joliette, et de cabinets libéraux installés du centre-ville au
              huitième. Le point commun de tous ces acteurs : équiper un
              poste de travail sans absorber le budget de la première année.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              C&apos;est là qu&apos;on intervient. À 15 minutes de la
              Joliette, notre atelier de La Penne-sur-Huveaune reçoit chaque
              semaine du mobilier déposé par des entreprises qui se
              réorganisent — déménagements, fermetures de sites, mutations
              vers du télétravail hybride. Les pièces qui en sortent sont
              celles qu&apos;on retrouve dans les sièges des grands groupes :
              fauteuils Steelcase Leap, Herman Miller Aeron, tables de réunion
              Haworth, banquettes Vitra. Tout passe par notre processus de
              reconditionnement avant d&apos;être proposé.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              Notre clientèle marseillaise se répartit assez naturellement
              entre trois profils : les indépendants et professions libérales
              qui équipent leur premier bureau pro, les PME et startups en
              phase de croissance qui équipent 5 à 50 postes d&apos;un coup,
              et les associations ou structures publiques qui cherchent du
              mobilier durable à budget contrôlé. À chacun, la même réponse :
              du mobilier signé, contrôlé, garanti — sans le ticket d&apos;entrée
              du neuf.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ AVIS GOOGLE ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="eyebrow">Avis Google vérifiés</p>
              <h2 className="text-display mt-3 font-serif">
                Ce que disent nos clients à Marseille
              </h2>
              <div className="gold-divider mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {REVIEWS.map((review, i) => (
              <Reveal key={review.author} delay={i * 80}>
                <article className="bg-ivory border border-line p-6 md:p-7 h-full flex flex-col">
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

          <Reveal>
            <p className="mt-10 text-center text-xs text-ink-mute">
              Avis Google publics — visibles sur notre fiche entreprise.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ LOGISTIQUE MARSEILLE ═══ */}
      <section className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">Notre service à Marseille</p>
              <h2 className="text-display mt-3 font-serif leading-[1.05]">
                Atelier à 15 min de la Joliette
              </h2>
              <div className="gold-divider mx-0 mt-6" />
              <p className="mt-6 text-ink-soft leading-relaxed">
                Trois manières de récupérer votre mobilier, selon votre
                besoin et votre rythme. Pas de tarif unique de livraison
                imposé — on s&apos;adapte à votre adresse et au volume.
              </p>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal>
              <article className="bg-ivory-light border-l-4 border-gold p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-ink">Retrait au showroom</h3>
                    <p className="mt-2 text-ink-soft leading-relaxed">
                      Vous venez à La Penne-sur-Huveaune, vous testez sur place
                      le fauteuil, vous repartez avec votre commande dans le
                      coffre. Notre équipe vous aide à charger — comme le
                      souligne Nono dans son avis, c&apos;est inclus.
                      Ouvert lundi-samedi de 10 h à 18 h sur rendez-vous.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={80}>
              <article className="bg-ivory-light border-l-4 border-gold p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <Truck className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-ink">
                      Livraison Marseille intra-muros
                    </h3>
                    <p className="mt-2 text-ink-soft leading-relaxed">
                      Nous nous déplaçons dans tous les arrondissements
                      marseillais. Délai moyen : 5 à 7 jours après validation
                      de la commande. Le coût exact dépend du volume,
                      de l&apos;adresse précise et de l&apos;étage. Tout est
                      détaillé dans le devis transmis sous 24 h ouvrées.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={160}>
              <article className="bg-ivory-light border-l-4 border-gold p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-gold shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-ink">
                      Évaluation sur site pour les gros volumes
                    </h3>
                    <p className="mt-2 text-ink-soft leading-relaxed">
                      Pour les commandes de plus de 10 postes, on peut se
                      déplacer chez vous, mesurer l&apos;espace, conseiller
                      sur l&apos;aménagement, et bâtir le devis sur la base
                      de votre réalité — pas d&apos;une grille générique.
                      C&apos;est sans engagement.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ ZONES DESSERVIES ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow text-gold">Tous les arrondissements</p>
              <h2 className="text-display mt-3 font-serif text-ivory leading-[1.05]">
                De Joliette à Bonneveine, on livre où vous êtes
              </h2>
              <div className="h-px w-16 bg-gold mt-8" />
              <p className="mt-8 text-ivory/75 leading-relaxed">
                Quelques exemples de zones où on intervient régulièrement.
                Si votre adresse n&apos;est pas listée, demandez-nous —
                Marseille est notre terrain de jeu naturel.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-ivory/10 border border-ivory/10">
            {ZONES_MARSEILLE.map((zone, i) => (
              <Reveal key={zone.code} delay={i * 40}>
                <div className="bg-ink p-6 h-full">
                  <p className="font-serif text-2xl text-gold">{zone.code}</p>
                  <p className="text-ivory font-medium mt-2">{zone.name}</p>
                  <p className="text-sm text-ivory/60 mt-1.5">{zone.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMMENT ÇA SE PASSE ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <div className="text-center mb-14">
            <p className="eyebrow">Étape par étape</p>
            <h2 className="text-display mt-3 font-serif">
              Comment ça se passe, concrètement
            </h2>
            <div className="gold-divider mt-6" />
          </div>
        </Reveal>

        <ol className="space-y-6">
          {[
            {
              title: 'Vous nous contactez',
              text: 'Par téléphone au 06 76 61 70 53, par mail ou via le formulaire en ligne. On répond le jour même en semaine.',
            },
            {
              title: 'On échange sur votre besoin',
              text: 'Type de mobilier, volume, budget approximatif, deadline éventuelle. 10 minutes suffisent pour cadrer.',
            },
            {
              title: 'Visite du showroom ou photos précises',
              text: 'Soit vous venez tester sur place à La Penne-sur-Huveaune, soit on vous envoie des photos détaillées des pièces qui correspondent à votre besoin.',
            },
            {
              title: 'Devis transmis sous 24 h ouvrées',
              text: 'PDF clair avec le détail des pièces, les frais de livraison adaptés à votre adresse, les options (montage, étage, évacuation de l\'ancien mobilier).',
            },
            {
              title: 'Validation et règlement',
              text: 'Stripe pour les paiements en ligne par carte. Virement possible pour les commandes professionnelles. Acompte ou paiement intégral selon vos préférences.',
            },
            {
              title: 'Livraison ou retrait',
              text: 'Livraison Marseille sous 5 à 7 jours, ou retrait immédiat au showroom selon votre choix.',
            },
          ].map((step, i) => (
            <Reveal key={step.title} delay={i * 60}>
              <li className="flex gap-5">
                <span className="shrink-0 font-serif text-3xl text-gold-dark w-12">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <div className="border-l border-line pl-5 pb-1">
                  <h3 className="font-serif text-lg text-ink leading-snug">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-ink-soft leading-relaxed">{step.text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="bg-ivory-dark border-t border-line">
        <div className="container py-16 md:py-20 max-w-3xl mx-auto text-center">
          <p className="eyebrow text-gold-dark">Prêt à équiper vos bureaux ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ink">
            Devis sous 24 h, sans engagement
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ink-soft leading-relaxed">
            Décrivez-nous votre besoin — un poste isolé ou 50 bureaux à
            équiper — et notre équipe revient vers vous le jour même en
            semaine, avec un devis personnalisé adapté à votre adresse
            marseillaise.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              Recevoir un devis
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
        </div>
      </section>
    </>
  )
}
