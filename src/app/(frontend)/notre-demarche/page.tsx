import type { Metadata } from 'next'
import Link from 'next/link'
import { Quote, Recycle, ShieldCheck, Coins } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Notre démarche — réemploi du mobilier de bureau',
  description:
    "Mobilier Malin a été fondée en 2021 à Aubagne par Djamel Djennad pour donner une seconde vie au mobilier d'entreprise. Notre histoire, nos valeurs, notre engagement RSE.",
  alternates: { canonical: '/notre-demarche' },
}

const TIMELINE = [
  {
    year: '2020',
    title: 'Le déclic',
    subtitle: 'Une idée née sur le terrain',
    body:
      "Lors de missions de déménagement professionnel à Marseille, Djamel Djennad constate une réalité simple : d'importants volumes de mobilier de bureau de qualité, encore parfaitement utilisables, n'ont pas de filière organisée pour leur seconde vie. L'idée germe : créer ce maillon manquant.",
  },
  {
    year: '2021',
    title: 'La création',
    subtitle: 'Naissance de Mobilier Malin à Aubagne',
    body:
      "La SARL 2 M, sous le nom commercial Mobilier Malin, voit le jour à Aubagne. Les premiers stocks se constituent : quelques dizaines de fauteuils et bureaux récupérés, nettoyés, contrôlés. Les premiers clients — TPE locales, professions libérales — sont conquis par le rapport qualité-prix.",
  },
  {
    year: '2022',
    title: 'La montée en puissance',
    subtitle: 'Le bouche-à-oreille fait son travail',
    body:
      "Sans publicité, uniquement par recommandations, l'activité s'accélère. L'entrepôt d'Aubagne se remplit et se vide au rythme des acquisitions. Des grandes entreprises marseillaises confient le vidage de leurs locaux, et Mobilier Malin constitue des lots de mobilier premium à prix imbattables.",
  },
  {
    year: '2023',
    title: "L'engagement RSE formalisé",
    subtitle: 'Plus qu\'un commerce : une mission',
    body:
      "Mobilier Malin structure sa démarche RSE : attestations de valorisation pour les entreprises donneuses, dons réguliers à des associations locales pour le mobilier non revendable, partenariats avec des structures d'insertion. 840 tonnes de CO₂ évitées sur l'année.",
  },
  {
    year: '2024',
    title: 'Le cap des 500 entreprises',
    subtitle: 'La confiance, à grande échelle',
    body:
      "Plus de 500 entreprises accompagnées, de la start-up de 3 personnes à la grande entreprise équipant 200 postes de travail. Les avis Google 5 étoiles s'enchaînent. Mobilier Malin s'impose comme la référence du mobilier de bureau reconditionné en région PACA.",
  },
  {
    year: '2025',
    title: "Aujourd'hui",
    subtitle: "Le même engagement, à plus grande échelle",
    body:
      "L'équipe grandit, le stock s'enrichit, mais l'ADN reste intact : du mobilier d'exception à -60 % du prix neuf, un service humain et réactif, et la conviction que chaque meuble sauvé est une victoire pour la planète.",
  },
]

const VALUES = [
  {
    icon: Recycle,
    title: 'Réemploi avant tout',
    body:
      "Le meilleur déchet est celui qu'on ne produit pas. Chaque meuble récupéré est une ressource, pas un rebut.",
  },
  {
    icon: ShieldCheck,
    title: 'Honnêteté & transparence',
    body:
      "Chaque pièce est décrite avec précision. L'état du mobilier est évalué et communiqué clairement, sans embellissement.",
  },
  {
    icon: Coins,
    title: 'Accessibilité',
    body:
      "Un beau bureau ergonomique ne devrait pas être réservé aux grandes entreprises. Le mobilier premium devient accessible à tous.",
  },
]

const STATS = [
  { value: '+500', label: 'Entreprises accompagnées' },
  { value: '12 000', label: 'Pièces remises en circulation' },
  { value: '840 t', label: 'CO₂ évités en 2023' },
  { value: '−60 %', label: 'vs prix du neuf' },
]

export default function NotreDemarchePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-20 md:py-28 max-w-4xl">
          <p className="eyebrow">Notre histoire</p>
          <h1 className="text-display-xl mt-4 font-serif">
            Du mobilier d&apos;exception, qui mérite une seconde adresse
          </h1>
          <div className="gold-divider mx-0 mt-8" />
          <p className="mt-8 text-lg text-ink-soft leading-relaxed">
            Le tissu économique se transforme en permanence : déménagements,
            croissances, fusions, fermetures. Avec lui, des volumes
            considérables de mobilier de qualité — Steelcase, Herman Miller,
            Haworth, Vitra — cherchent une nouvelle adresse chaque année.
          </p>
          <p className="mt-4 text-lg text-ink leading-relaxed font-medium">
            Mobilier Malin a été créée pour fluidifier ce passage et donner à
            ces pièces une seconde vie utile.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="container py-20 md:py-28">
        <div className="max-w-2xl mb-16">
          <p className="eyebrow">Notre parcours</p>
          <h2 className="text-display mt-3 font-serif">De 2020 à aujourd&apos;hui</h2>
        </div>

        <div className="space-y-12 max-w-4xl">
          {TIMELINE.map((step, i) => (
            <div
              key={step.year}
              className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 md:gap-12 pb-12 border-b border-line last:border-b-0 last:pb-0"
            >
              <div>
                <p className="font-serif text-4xl md:text-5xl text-gold-dark leading-none">
                  {step.year}
                </p>
                <p className="mt-2 text-xs uppercase tracking-widest text-ink-mute">
                  Étape {i + 1}
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl md:text-3xl text-ink leading-tight">
                  {step.title}
                </h3>
                <p className="text-sm uppercase tracking-widest text-gold-dark mt-2">
                  {step.subtitle}
                </p>
                <p className="mt-5 text-ink-soft leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Founder quote */}
      <section className="bg-ink text-ivory">
        <div className="container py-20 md:py-28 max-w-3xl text-center">
          <Quote className="h-10 w-10 text-gold mx-auto" strokeWidth={1.25} />
          <blockquote className="mt-8 font-serif text-2xl md:text-3xl leading-snug text-ivory">
            « J&apos;ai vu passer beaucoup de beau mobilier sans qu&apos;une
            filière dédiée n&apos;existe pour leur donner une nouvelle vie.
            Mobilier Malin, c&apos;est l&apos;idée simple que les entreprises
            devraient pouvoir s&apos;équiper bien sans payer plein tarif — et
            que ces pièces méritent de continuer à servir. »
          </blockquote>
          <div className="h-px w-12 bg-gold mx-auto my-8" />
          <p className="font-serif text-lg text-gold">Djamel Djennad</p>
          <p className="text-xs uppercase tracking-widest text-ivory/60 mt-1">
            Gérant fondateur
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="eyebrow">En chiffres</p>
          <h2 className="text-display mt-3 font-serif">L&apos;impact, concrètement</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-ivory-light p-8 md:p-10 text-center min-h-[160px] flex flex-col justify-center"
            >
              <p className="font-serif text-4xl md:text-5xl text-gold-dark leading-none">
                {s.value}
              </p>
              <p className="text-xs uppercase tracking-widest text-ink-mute mt-4 leading-relaxed">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="eyebrow">Nos valeurs</p>
            <h2 className="text-display mt-3 font-serif">Ce qui nous guide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-ivory-light p-8 md:p-10 flex flex-col gap-5"
              >
                <Icon className="h-8 w-8 text-gold" strokeWidth={1.25} />
                <h3 className="font-serif text-2xl text-ink leading-tight">
                  {title}
                </h3>
                <p className="text-ink-soft leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-20 md:py-28 max-w-3xl text-center">
        <p className="eyebrow">Et vous ?</p>
        <h2 className="text-display mt-3 font-serif">
          Envie d&apos;écrire la prochaine page avec nous ?
        </h2>
        <div className="gold-divider mt-6" />
        <p className="mt-6 text-ink-mute leading-relaxed">
          Que vous souhaitiez équiper vos bureaux ou nous confier le vidage de
          vos locaux, on est là.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/contact" className="btn-gold">
            Nous contacter
          </Link>
          <Link href="/boutique" className="btn-outline">
            Voir le catalogue
          </Link>
        </div>
      </section>
    </>
  )
}
