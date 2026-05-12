import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Wallet,
  ShieldCheck,
  Repeat,
  Truck,
  Wrench,
  FileCheck2,
  Check,
  ArrowRight,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { getSiteSettings, urlFor } from '@/lib/sanity'

export const metadata: Metadata = {
  title:
    'Location longue durée mobilier de bureau — 36 mois, services inclus',
  description:
    'Louez votre mobilier de bureau reconditionné en LLD : pack 1 poste complet à partir de 51 €/mois HT. Livraison, montage, SAV 72 h, attestation RSE annuelle inclus. Marseille, PACA, France.',
  alternates: { canonical: '/location-mobilier-bureau' },
  keywords: [
    'location longue durée mobilier bureau',
    'LLD mobilier professionnel',
    'leasing mobilier de bureau',
    'location bureau Steelcase',
    'location fauteuil ergonomique',
    'OPEX mobilier entreprise',
  ],
}

const PILIERS = [
  {
    icon: Wallet,
    title: 'Trésorerie préservée',
    body:
      "Pas d'investissement initial à amortir. Vous étalez sur 36 mois et conservez votre cash pour ce qui fait grandir votre activité. Loyer 100 % déductible des charges.",
  },
  {
    icon: ShieldCheck,
    title: 'SAV & remplacement inclus',
    body:
      'Une chaise qui flanche, une roulette qui casse ? Intervention sous 72 h ouvrées avec matériel de remplacement équivalent. Aucun coût caché.',
  },
  {
    icon: Repeat,
    title: 'Évolutivité totale',
    body:
      "Vos effectifs grandissent ? On ajoute des postes au contrat. Vous déménagez ? On suit. Vous changez d'avis ? On remplace. Pas de pénalité.",
  },
]

const PRICING = [
  {
    item: 'Bureau 160 × 80 cm',
    brand: 'Steelcase / Clen',
    monthly: '18 €',
    cash: '119 €',
  },
  {
    item: 'Fauteuil ergonomique synchrone',
    brand: 'HÅG / Giroflex / Steelcase',
    monthly: '15 €',
    cash: '129 €',
  },
  {
    item: 'Caisson mobile 3 tiroirs',
    brand: 'Métal',
    monthly: '6 €',
    cash: '39 €',
  },
  {
    item: 'Armoire haute 180 cm',
    brand: 'Métal',
    monthly: '12 €',
    cash: '99 €',
  },
]

const TOTAL_PACK = 51

const SERVICES_INCLUS = [
  'Livraison sur site (Marseille, PACA, France)',
  'Montage et installation par notre équipe',
  'SAV sous 72 h ouvrées avec matériel de remplacement',
  'Attestation de valorisation RSE annuelle',
  'Reprise possible en fin de contrat',
  'Loyer 100 % déductible des charges (OPEX)',
]

const COMPARATIF = [
  ['Coût initial', "1 930 € TTC d'un coup", '0 € — premier loyer mensuel'],
  ['Trésorerie', 'Décaissée immédiatement', 'Étalée sur 36 mois'],
  ['SAV / casse', 'À votre charge', 'Inclus, intervention 72 h'],
  ['Vétusté', "À votre charge à l'achat suivant", 'Reprise et renouvellement'],
  ['Comptabilité', 'Immobilisation à amortir', 'Charge déductible (OPEX)'],
  ['TVA', '20 % à avancer', 'Récupérée sur chaque loyer'],
  ['Évolutivité', 'Revente au cas par cas', 'Ajout / retrait à tout moment'],
]

const FAQ = [
  {
    q: 'Quelle est la durée minimum du contrat ?',
    a: 'Nos contrats LLD démarrent à 36 mois. C\'est la durée optimale pour amortir le coût des services inclus tout en restant flexible. Une rupture anticipée reste possible avec préavis de 3 mois (indemnité de 50 % des loyers restants).',
  },
  {
    q: 'Que se passe-t-il à la fin des 36 mois ?',
    a: 'Vous avez trois choix : restituer le mobilier (gratuitement, on reprend), prolonger le contrat par périodes de 12 mois, ou racheter le mobilier à 10 % de la valeur neuve.',
  },
  {
    q: 'Le mobilier en location est-il neuf ou reconditionné ?',
    a: "Reconditionné, comme tout notre catalogue. Pièces signées (Steelcase, Herman Miller, Haworth, Vitra…), restaurées en atelier avec contrôle qualité 7 points et garantie pleine sur la durée du contrat.",
  },
  {
    q: 'Est-ce que je peux ajouter ou retirer des postes en cours de contrat ?',
    a: "Oui, à tout moment. Si vous embauchez : on ajoute un avenant au contrat avec les nouveaux postes au tarif en vigueur. Si vous réduisez : on récupère le matériel inutile, et on ajuste le loyer dès le mois suivant.",
  },
  {
    q: 'La TVA est-elle récupérable ?',
    a: 'Oui, comme pour toute location professionnelle. Vous récupérez 20 % de TVA sur chaque loyer mensuel, contre un seul ajustement à l\'achat.',
  },
  {
    q: 'Quelles sont les conditions financières exactes ?',
    a: "Loyer mensuel HT facturé à terme à échoir, prélèvement SEPA le 5 du mois. Dépôt de garantie d'un mois encaissé en début de contrat (restitué en fin de contrat sous déduction d'éventuels dégâts). Frais d'installation : 89 € HT forfait à régler avec le premier loyer. Assurance casse / vol optionnelle : 2 € HT/mois/poste.",
  },
  {
    q: 'Pour quelles entreprises la LLD est-elle pertinente ?',
    a: 'Start-up en croissance, cabinets qui ouvrent de nouveaux bureaux, ETI qui changent leur parc, associations qui veulent maîtriser leur budget. À l\'inverse, si vous préférez l\'investissement immobilier (CAPEX) ou que vous gardez le mobilier 10+ ans, l\'achat reste plus économique long terme.',
  },
  {
    q: 'Comment se passe la livraison et l\'installation ?',
    a: 'Sur rendez-vous, à la date qui vous convient. Notre équipe livre, monte, installe sur place, et vous remet une attestation de prise en charge. Le tout inclus dans les services, sans surcoût.',
  },
]

export default async function LLDPage() {
  const settings = await getSiteSettings()
  const heroImageUrl = settings.lldHeroImage
    ? urlFor(settings.lldHeroImage).width(1600).url()
    : 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80'
  const heroImageAlt =
    settings.lldHeroImage?.alt ||
    'Bureau professionnel équipé en location longue durée'

  return (
    <>
      {/* Hero */}
      <section className="relative bg-ink text-ivory overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(201,169,97,0.15) 0%, transparent 50%)',
          }}
        />
        <div className="container relative py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow text-gold">Nouveau · Service entreprises</p>
            <h1 className="text-display-xl mt-4 font-serif text-ivory leading-[1.05]">
              La location longue durée, pour préserver votre trésorerie
            </h1>
            <div className="h-px w-12 bg-gold mt-7" />
            <p className="mt-7 text-lg text-ivory/80 leading-relaxed">
              Équipez vos bureaux dès aujourd&apos;hui en mobilier de marque
              reconditionné. Étalez le coût sur 36 mois. SAV, livraison,
              montage et attestation RSE inclus dans le loyer.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/contact?type=lld" className="btn-gold">
                Demander un devis LLD
              </Link>
              <a href="tel:+33676617053" className="btn-outline-light">
                07 64 32 — Djamel
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] bg-ivory/10 overflow-hidden">
            <Image
              src={heroImageUrl}
              alt={heroImageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Piliers */}
      <section className="container py-20 md:py-28">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="eyebrow">Pourquoi la LLD</p>
            <h2 className="text-display mt-3 font-serif">Trois bénéfices, une décision</h2>
            <div className="gold-divider mt-6" />
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-px bg-line border border-line">
          {PILIERS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="bg-ivory-light p-8 md:p-10 h-full flex flex-col gap-5">
                <Icon className="h-8 w-8 text-gold" strokeWidth={1.25} />
                <h3 className="font-serif text-2xl text-ink leading-tight">{title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pack mis en avant */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-20 md:py-28">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="eyebrow">Notre offre type</p>
              <h2 className="text-display mt-3 font-serif">
                Le pack 1 poste complet
              </h2>
              <p className="mt-6 text-ink-mute">
                Bureau · Fauteuil ergonomique · Caisson · Armoire — tout pour
                équiper un collaborateur dans les règles de l&apos;art.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="bg-ivory-light border border-gold max-w-3xl mx-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-ivory-dark">
                    <th className="text-left p-4 font-medium text-ink-mute uppercase tracking-widest text-xs">
                      Élément
                    </th>
                    <th className="text-left p-4 font-medium text-ink-mute uppercase tracking-widest text-xs hidden sm:table-cell">
                      Marques
                    </th>
                    <th className="text-right p-4 font-medium text-ink-mute uppercase tracking-widest text-xs">
                      Loyer / mois
                    </th>
                    <th className="text-right p-4 font-medium text-ink-mute uppercase tracking-widest text-xs hidden md:table-cell">
                      Achat comptant
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PRICING.map((row) => (
                    <tr key={row.item} className="border-b border-line last:border-b-0">
                      <td className="p-4 text-ink font-medium">{row.item}</td>
                      <td className="p-4 text-ink-mute text-xs hidden sm:table-cell">
                        {row.brand}
                      </td>
                      <td className="p-4 text-right text-ink font-medium">
                        {row.monthly}
                      </td>
                      <td className="p-4 text-right text-ink-mute hidden md:table-cell">
                        {row.cash}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-ivory-dark border-t-2 border-gold">
                    <td className="p-5 font-serif text-lg text-ink" colSpan={2}>
                      Pack 1 poste complet
                    </td>
                    <td className="p-5 text-right">
                      <span className="font-serif text-3xl text-gold-dark">{TOTAL_PACK} €</span>
                      <span className="block text-xs text-ink-mute mt-1">
                        / mois HT
                      </span>
                    </td>
                    <td className="p-5 text-right hidden md:table-cell text-ink-mute">
                      386 €
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={250}>
            <div className="mt-10 max-w-3xl mx-auto bg-ink text-ivory p-8 text-center">
              <p className="text-xs uppercase tracking-widest text-gold">Exemple 5 postes</p>
              <p className="font-serif text-2xl md:text-3xl mt-3 leading-snug">
                <strong className="text-gold">255 € HT/mois</strong> pendant 36 mois,
                <br className="hidden md:block" />
                {' '}au lieu de 1 930 € TTC d&apos;achat immédiat.
              </p>
              <Link href="/contact?type=lld" className="btn-gold mt-8 inline-flex">
                Recevoir un devis personnalisé
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services inclus */}
      <section className="container py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <p className="eyebrow">Sans surcoût</p>
          <h2 className="text-display mt-3 font-serif">Tout est inclus dans le loyer</h2>
          <div className="h-px w-12 bg-gold mt-6" />
          <p className="mt-6 text-ink-soft leading-relaxed">
            Notre engagement : pas de coût caché. Le loyer mensuel couvre
            l&apos;ensemble des services qui rendent l&apos;équipement facile,
            de la livraison au remplacement.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-px bg-line border border-line">
            <div className="bg-ivory-light p-5 text-center">
              <Truck className="h-6 w-6 text-gold mx-auto" strokeWidth={1.25} />
              <p className="text-xs uppercase tracking-widest text-ink-mute mt-3">
                Livraison
              </p>
            </div>
            <div className="bg-ivory-light p-5 text-center">
              <Wrench className="h-6 w-6 text-gold mx-auto" strokeWidth={1.25} />
              <p className="text-xs uppercase tracking-widest text-ink-mute mt-3">
                Montage
              </p>
            </div>
            <div className="bg-ivory-light p-5 text-center">
              <FileCheck2 className="h-6 w-6 text-gold mx-auto" strokeWidth={1.25} />
              <p className="text-xs uppercase tracking-widest text-ink-mute mt-3">
                Attestation RSE
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <ul className="space-y-3">
            {SERVICES_INCLUS.map((s) => (
              <li
                key={s}
                className="flex items-start gap-3 bg-ivory-light border border-line p-4 text-sm text-ink"
              >
                <Check className="h-5 w-5 text-gold-dark shrink-0 mt-0.5" strokeWidth={2} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Comparatif Achat vs Location */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-20 md:py-28">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="eyebrow">Comparatif</p>
              <h2 className="text-display mt-3 font-serif">Achat ou location ?</h2>
              <p className="mt-4 text-ink-mute">
                Vue d&apos;ensemble pour aider votre décision (exemple 5 postes
                de travail complets).
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="bg-ivory-light border border-line max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ivory-dark border-b border-line">
                    <th className="text-left p-4 text-xs uppercase tracking-widest text-ink-mute font-medium">
                      Critère
                    </th>
                    <th className="text-left p-4 text-xs uppercase tracking-widest text-ink-mute font-medium">
                      Achat comptant
                    </th>
                    <th className="text-left p-4 text-xs uppercase tracking-widest text-gold-dark font-medium bg-ivory">
                      Location LLD
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF.map(([crit, a, b]) => (
                    <tr key={crit} className="border-b border-line last:border-b-0">
                      <td className="p-4 font-medium text-ink">{crit}</td>
                      <td className="p-4 text-ink-mute">{a}</td>
                      <td className="p-4 text-ink bg-ivory">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-20 md:py-28 max-w-3xl">
        <Reveal>
          <div className="text-center mb-14">
            <p className="eyebrow">Questions fréquentes</p>
            <h2 className="text-display mt-3 font-serif">Tout ce qu&apos;on vous demande</h2>
            <div className="gold-divider mt-6" />
          </div>
        </Reveal>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <details className="group bg-ivory-light border border-line">
                <summary className="cursor-pointer p-6 flex items-center justify-between gap-4 list-none">
                  <span className="font-serif text-lg text-ink leading-snug">
                    {item.q}
                  </span>
                  <span className="text-gold text-2xl transition-transform group-open:rotate-45 leading-none">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-ink-soft leading-relaxed">
                  {item.a}
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-ivory">
        <div className="container py-20 md:py-28 text-center max-w-3xl mx-auto">
          <p className="eyebrow text-gold">On en parle ?</p>
          <h2 className="text-display mt-3 font-serif text-ivory leading-[1.1]">
            Recevez votre devis LLD personnalisé
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/70 leading-relaxed">
            Donnez-nous votre nombre de postes et votre localisation. Nous
            revenons sous 24 h avec une grille tarifaire détaillée et la
            visite gratuite de vos locaux.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact?type=lld" className="btn-gold">
              Demander un devis LLD
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
