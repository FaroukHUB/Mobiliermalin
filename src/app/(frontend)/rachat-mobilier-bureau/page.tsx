import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Phone,
  Mail,
  Truck,
  ArrowRight,
  Banknote,
  PackageOpen,
  ClipboardCheck,
  Recycle,
  ShieldCheck,
  Building2,
  Sparkles,
  Quote,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { LEGAL } from '@/lib/legal'

const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Rachat et déstockage de mobilier de bureau professionnel à Marseille'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Rachat & déstockage de mobilier de bureau professionnel — Marseille, PACA',
  description:
    'Nous rachetons votre mobilier de bureau professionnel à Marseille et dans toute la région PACA : bureaux, fauteuils, armoires, cloisons. Évaluation gratuite, paiement cash, enlèvement organisé sous 7 à 15 jours.',
  keywords: [
    'rachat meuble occasion',
    'rachat mobilier bureau',
    'rachat de meuble cash',
    'destockage bureau',
    'destockage meuble',
    'destockage mobilier de bureau professionnel',
    'destockage mobilier de bureau occasion',
    'destockage meuble marseille',
    'rachat mobilier bureau marseille',
    'rachat mobilier professionnel',
    'rachat bureau entreprise',
    'destockage armoire métallique',
    'reprise mobilier bureau',
    'rachat meuble bois',
  ],
  alternates: { canonical: `${siteUrl}/rachat-mobilier-bureau` },
  openGraph: {
    title: 'Rachat & déstockage de mobilier de bureau — Mobilier Malin',
    description:
      'Nous rachetons votre mobilier de bureau professionnel à Marseille et en PACA. Évaluation gratuite, paiement cash, enlèvement organisé.',
    url: `${siteUrl}/rachat-mobilier-bureau`,
    type: 'website',
  },
}

const ELIGIBLE_ITEMS = [
  { label: 'Bureaux droits, angle, bench, assis-debout', detail: 'Steelcase, Vitra, Haworth, Majencia…' },
  { label: 'Fauteuils ergonomiques', detail: 'Aeron, Leap, Think, ID Chair, Aluminium Group…' },
  { label: 'Armoires métalliques & en bois', detail: 'Avec ou sans rideau, hautes et basses' },
  { label: 'Caissons mobiles & sur pieds', detail: '2 ou 3 tiroirs, dossiers suspendus' },
  { label: 'Cloisons acoustiques & cabines phoniques', detail: 'Framery, Akustic, marques équivalentes' },
  { label: 'Tables de réunion & chaises d\'accueil', detail: 'Verre, bois, métal — toutes finitions' },
  { label: 'Espaces détente & lounge', detail: 'Canapés, fauteuils club, poufs, tables basses' },
  { label: 'Mobilier de cuisine d\'entreprise', detail: 'Tables, chaises hautes, plans de service' },
] as const

const NOT_ELIGIBLE = [
  'Mobilier IKEA, Habitat, Conforama (occasion grand public)',
  'Pièces en très mauvais état (cassées, instables, moisissures)',
  'Mobilier sans valeur de revente (placage abîmé, mécanismes HS)',
  'Petites quantités isolées (< 5 pièces de valeur)',
] as const

export default function RachatMobilierBureauPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Rachat & déstockage de mobilier de bureau',
        item: `${siteUrl}/rachat-mobilier-bureau`,
      },
    ],
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Rachat & déstockage de mobilier de bureau professionnel',
    provider: {
      '@type': 'Organization',
      name: 'Mobilier Malin',
      url: siteUrl,
      telephone: LEGAL.telephoneTel,
      email: LEGAL.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: LEGAL.showroom.ligne1,
        addressLocality: LEGAL.showroom.ville,
        postalCode: LEGAL.showroom.codePostal,
        addressCountry: 'FR',
      },
    },
    areaServed: [
      { '@type': 'City', name: 'Marseille' },
      { '@type': 'City', name: 'Aubagne' },
      { '@type': 'City', name: 'Aix-en-Provence' },
      { '@type': 'City', name: 'Toulon' },
      { '@type': 'City', name: 'Nice' },
      { '@type': 'AdministrativeArea', name: 'Provence-Alpes-Côte d\'Azur' },
    ],
    description:
      'Évaluation, rachat et enlèvement de mobilier de bureau professionnel pour entreprises, cabinets et collectivités. Marques pro uniquement (Steelcase, Vitra, Haworth, Herman Miller, Majencia, USM…). Paiement cash sur facture, enlèvement organisé sous 7 à 15 jours.',
    offers: {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'EUR',
        description: 'Prix de rachat sur évaluation',
      },
    },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* ═══ HERO ═══ */}
      <section className="relative bg-ink text-ivory overflow-hidden min-h-[520px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={FALLBACK_HERO_URL}
            alt={FALLBACK_HERO_ALT}
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
              <li className="text-gold">Rachat &amp; déstockage de mobilier</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">Service B2B · Évaluation gratuite</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Nous rachetons votre mobilier de bureau professionnel
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Vous déménagez, vous fermez vos locaux, vous renouvelez votre
              parc mobilier ? Nous rachetons votre mobilier de bureau
              professionnel à Marseille et dans toute la région PACA :
              évaluation gratuite sur place ou sur photos, proposition de
              rachat cash, enlèvement organisé par nos équipes sous 7 à
              15 jours.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
                Demander une évaluation
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <a href={`tel:${LEGAL.telephoneTel}`} className="btn-outline-light">
                {LEGAL.telephone}
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-ivory/70">
              <span className="inline-flex items-center gap-2">
                <Banknote className="h-4 w-4 text-gold" /> Paiement cash
              </span>
              <span className="inline-flex items-center gap-2">
                <Truck className="h-4 w-4 text-gold" /> Enlèvement inclus
              </span>
              <span className="inline-flex items-center gap-2">
                <Recycle className="h-4 w-4 text-gold" /> Attestation RSE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ POURQUOI NOUS PLUTÔT QU'UNE DÉCHÈTERIE ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">Notre proposition</p>
          <h2 className="text-display mt-3 font-serif">
            Plutôt que de jeter, revendez-nous votre mobilier
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Vider des locaux professionnels en déchèterie, c&apos;est du
              temps, des bennes, des allers-retours, parfois des coûts
              élevés. Et c&apos;est surtout du mobilier qui partait pour
              encore dix à quinze ans de vie utile mis à la casse pour
              rien. Nous vous proposons une alternative simple : nous
              rachetons les pièces qui ont de la valeur, nous nous
              chargeons de l&apos;enlèvement complet, et vous récupérez un
              chèque ou un virement plutôt qu&apos;une facture.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Concrètement, notre activité repose sur le reconditionnement
              de mobilier de bureau professionnel — Steelcase, Vitra,
              Haworth, Herman Miller, Majencia, USM Haller. Nous rachetons
              donc en priorité ces marques et ces gammes, parce que nous
              savons les remettre en circulation en sortie d&apos;atelier.
              Pour les pièces génériques ou en mauvais état, nous étudions
              au cas par cas et nous orientons vers nos partenaires de
              valorisation.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              Le bénéfice est triple : vous économisez le coût d&apos;une
              benne et d&apos;un déménagement, vous valorisez financièrement
              votre actif mobilier, et vous documentez votre démarche RSE
              avec une attestation de valorisation que nous vous remettons.
              Pour une entreprise qui ferme un plateau ou rénove un siège,
              cela représente facilement plusieurs milliers d&apos;euros
              de différence.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ COMMENT ÇA SE PASSE — 4 ÉTAPES ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <p className="eyebrow">Notre process</p>
              <h2 className="text-display mt-3 font-serif">
                Quatre étapes, de la demande au paiement
              </h2>
              <div className="gold-divider mx-0 mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Reveal>
              <article className="bg-ivory border border-line p-7 h-full">
                <ClipboardCheck className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-widest text-gold-dark mt-5">
                  1. Inventaire
                </p>
                <h3 className="font-serif text-xl text-ink mt-2 leading-tight">
                  Vous nous décrivez votre lot
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Par mail ou téléphone : nombre de postes, types de
                  meubles, marques si vous les connaissez, photos si
                  possible. Une dizaine de minutes suffisent pour démarrer.
                </p>
              </article>
            </Reveal>

            <Reveal delay={80}>
              <article className="bg-ivory border border-line p-7 h-full">
                <Building2 className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-widest text-gold-dark mt-5">
                  2. Visite sur place
                </p>
                <h3 className="font-serif text-xl text-ink mt-2 leading-tight">
                  Nous venons évaluer
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Sous 5 jours ouvrés, nous passons dans vos locaux pour
                  contrôler l&apos;état réel et identifier les marques.
                  Cette visite est gratuite et sans engagement.
                </p>
              </article>
            </Reveal>

            <Reveal delay={160}>
              <article className="bg-ivory border border-line p-7 h-full">
                <Banknote className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-widest text-gold-dark mt-5">
                  3. Proposition chiffrée
                </p>
                <h3 className="font-serif text-xl text-ink mt-2 leading-tight">
                  Offre de rachat par écrit
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Vous recevez sous 48 h une proposition détaillée pièce
                  par pièce, avec la date d&apos;enlèvement proposée. Vous
                  acceptez, négociez ou déclinez — sans pression.
                </p>
              </article>
            </Reveal>

            <Reveal delay={240}>
              <article className="bg-ivory border border-line p-7 h-full">
                <PackageOpen className="h-7 w-7 text-gold" strokeWidth={1.5} />
                <p className="text-xs uppercase tracking-widest text-gold-dark mt-5">
                  4. Enlèvement &amp; règlement
                </p>
                <h3 className="font-serif text-xl text-ink mt-2 leading-tight">
                  Nous vidons, vous êtes payés
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Le jour J, notre équipe arrive, démonte, charge et part
                  avec le mobilier. Règlement par chèque ou virement à
                  l&apos;enlèvement, attestation RSE remise en main propre.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ CE QU'ON RACHÈTE / CE QU'ON NE RACHÈTE PAS ═══ */}
      <section className="container py-16 md:py-24 max-w-6xl">
        <Reveal>
          <div className="max-w-2xl mb-12">
            <p className="eyebrow">Périmètre</p>
            <h2 className="text-display mt-3 font-serif">
              Ce que nous rachetons — et ce que nous ne rachetons pas
            </h2>
            <div className="gold-divider mx-0 mt-6" />
            <p className="mt-6 text-ink-soft leading-relaxed">
              Pour vous éviter une perte de temps, voici notre périmètre
              clair. Si vous êtes au-dessus du seuil ou avec du mobilier
              pro, contactez-nous. Sinon, nous vous orientons vers une
              solution adaptée.
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-8">
          <Reveal>
            <div className="bg-ivory-light border-l-4 border-gold p-7 h-full">
              <p className="eyebrow text-gold-dark">Nous rachetons</p>
              <ul className="mt-6 space-y-4">
                {ELIGIBLE_ITEMS.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <Sparkles className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-ink font-medium">{item.label}</p>
                      <p className="text-sm text-ink-mute mt-0.5">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="bg-ivory-light border-l-4 border-ink-mute p-7 h-full">
              <p className="eyebrow">Hors périmètre</p>
              <ul className="mt-6 space-y-4">
                {NOT_ELIGIBLE.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="h-4 w-4 mt-1 shrink-0 text-ink-mute">×</span>
                    <p className="text-ink-soft">{item}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-ink-mute">
                Pour le mobilier hors périmètre, nous pouvons quand même
                organiser un vidage payant via notre service
                <Link href="/vidage-de-locaux" className="text-gold-dark hover:text-gold underline underline-offset-2 ml-1">
                  vidage de locaux
                </Link>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ DÉSTOCKAGE — section dédiée ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-24 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <p className="eyebrow text-gold">Déstockage mobilier de bureau</p>
              <h2 className="text-display mt-3 font-serif text-ivory">
                Stock dormant ou fin de série ? Nous l&apos;intégrons aussi
              </h2>
              <div className="h-px w-16 bg-gold mt-6" />
              <p className="mt-6 text-lg text-ivory/80 leading-relaxed">
                Au-delà du rachat de mobilier en fin d&apos;usage, nous
                déstockons aussi les fins de série, les invendus, les
                échantillonneurs et les stocks dormants de mobilier
                professionnel. Le principe est le même : évaluation,
                proposition, enlèvement, paiement.
              </p>
              <p className="mt-4 text-lg text-ivory/80 leading-relaxed">
                Idéal si vous êtes revendeur, distributeur, fabricant ou
                courtier en aménagement et qu&apos;une partie de votre
                stock ne tourne plus.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="space-y-4">
                <div className="bg-ivory/5 border-l-4 border-gold p-6">
                  <p className="eyebrow text-gold">Lots concernés</p>
                  <p className="mt-3 text-ivory/90">
                    À partir de 10 pièces, toutes catégories : bureaux,
                    sièges, armoires, accessoires.
                  </p>
                </div>
                <div className="bg-ivory/5 border-l-4 border-gold p-6">
                  <p className="eyebrow text-gold">Délai</p>
                  <p className="mt-3 text-ivory/90">
                    Évaluation sous 5 jours, enlèvement entre 7 et 15 jours
                    après accord.
                  </p>
                </div>
                <div className="bg-ivory/5 border-l-4 border-gold p-6">
                  <p className="eyebrow text-gold">Règlement</p>
                  <p className="mt-3 text-ivory/90">
                    Chèque ou virement le jour de l&apos;enlèvement.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ TÉMOIGNAGE ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <article className="bg-ivory-dark border-l-4 border-gold p-8 md:p-10">
            <Quote className="h-8 w-8 text-gold" strokeWidth={1.5} />
            <p className="mt-5 text-xl md:text-2xl font-serif text-ink leading-relaxed">
              « Nous fermions un plateau de 600 m² sur Marseille avec deux
              semaines de préavis. Mobilier Malin est venu évaluer le
              vendredi, nous a fait une offre le lundi, et tout était
              enlevé le jeudi suivant. Sur la facture théorique de
              déchèterie qu&apos;on avait reçue, on est passés en plus
              en revenus — pas seulement en économie. »
            </p>
            <footer className="mt-6 pt-6 border-t border-line">
              <p className="font-serif text-base text-ink">Responsable office, cabinet conseil — Marseille 8e</p>
              <p className="text-xs text-ink-mute mt-1 uppercase tracking-widest">
                Rachat de 45 postes complets · 2025
              </p>
            </footer>
          </article>
        </Reveal>
      </section>

      {/* ═══ ZONE GÉOGRAPHIQUE ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-20 max-w-4xl">
          <Reveal>
            <p className="eyebrow">Zone d&apos;intervention</p>
            <h2 className="text-display mt-3 font-serif">
              Marseille et toute la région PACA
            </h2>
            <div className="gold-divider mx-0 mt-6" />
            <p className="mt-6 text-ink-soft leading-relaxed">
              Nous intervenons depuis notre atelier de La Penne-sur-Huveaune
              sur tout le bassin Aix-Marseille-Provence (Marseille, Aubagne,
              Aix-en-Provence, Cassis, La Ciotat, Vitrolles, Marignane), sur
              l&apos;ouest du Var (Toulon, La Seyne-sur-Mer, La Garde,
              Hyères) et ponctuellement sur la Côte d&apos;Azur (Cannes,
              Antibes, Nice) pour les lots importants. Pour les volumes
              dépassant 50 postes, nous organisons aussi des déplacements
              en France.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ LIENS CONNEXES ═══ */}
      <section className="container py-16 md:py-24 max-w-5xl">
        <Reveal>
          <div className="max-w-2xl mb-10">
            <p className="eyebrow">Services connexes</p>
            <h2 className="text-display mt-3 font-serif">
              Vous cherchez aussi…
            </h2>
            <div className="gold-divider mx-0 mt-6" />
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-4">
          <Reveal>
            <Link
              href="/vidage-de-locaux"
              className="block group bg-ivory-light border border-line hover:border-gold transition-colors p-6"
            >
              <p className="eyebrow">Service B2B</p>
              <p className="font-serif text-xl text-ink mt-2 group-hover:text-gold-dark transition">
                Vidage complet de locaux professionnels
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Mobilier + déchets + équipements : nous vidons l&apos;intégralité
                des locaux, y compris ce qui n&apos;est pas revendable.
              </p>
              <p className="mt-3 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                Voir la page <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </p>
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <Link
              href="/meuble-occasion-marseille"
              className="block group bg-ivory-light border border-line hover:border-gold transition-colors p-6"
            >
              <p className="eyebrow">Boutique</p>
              <p className="font-serif text-xl text-ink mt-2 group-hover:text-gold-dark transition">
                Voir notre catalogue de mobilier d&apos;occasion
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                Découvrez ce que nous reconditionnons et revendons :
                bureaux, fauteuils, armoires, cloisons.
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
          <Banknote className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
          <p className="eyebrow text-gold mt-4">Évaluation gratuite, sans engagement</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Décrivez-nous votre lot, nous revenons sous 48 h
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Plus votre description est précise (marques, nombre de postes,
            photos, contraintes d&apos;enlèvement, délai), plus vite nous
            pouvons vous faire une offre. Une équipe interne, pas de
            sous-traitance, pas de surprise sur le délai.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Demander une évaluation
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <a href={`tel:${LEGAL.telephoneTel}`} className="btn-outline-light">
              {LEGAL.telephone}
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-ivory/60">
            <a href={`tel:${LEGAL.telephoneTel}`} className="inline-flex items-center gap-2 hover:text-gold">
              <Phone className="h-4 w-4" /> {LEGAL.telephone}
            </a>
            <a href={`mailto:${LEGAL.email}`} className="inline-flex items-center gap-2 hover:text-gold">
              <Mail className="h-4 w-4" /> {LEGAL.email}
            </a>
          </div>

          <p className="mt-8 text-xs text-ivory/40 inline-flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" />
            Attestation de valorisation RSE remise après enlèvement
          </p>
        </div>
      </section>
    </>
  )
}
