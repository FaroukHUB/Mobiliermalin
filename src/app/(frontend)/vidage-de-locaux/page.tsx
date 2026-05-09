import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Truck, FileText, Recycle, Phone, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Vidage de locaux professionnels — Marseille, PACA, France',
  description:
    "Déménagement, fermeture, renouvellement de parc : Mobilier Malin vide vos locaux rapidement, proprement et de façon responsable. Visite gratuite sous 48 h, rachat possible, attestation de valorisation RSE.",
  alternates: { canonical: '/vidage-de-locaux' },
}

const STEPS = [
  {
    icon: Phone,
    num: '01',
    title: 'Premier contact',
    body:
      'Vous nous décrivez vos besoins en quelques mots : volume estimé, localisation, délais. Réponse sous 24 h par téléphone ou email.',
  },
  {
    icon: Calendar,
    num: '02',
    title: 'Visite sur site sous 48 h',
    body:
      'Nous nous déplaçons gratuitement pour évaluer votre mobilier. Vous recevez un devis chiffré sous 48 h, avec part rachat éventuel.',
  },
  {
    icon: Truck,
    num: '03',
    title: 'Enlèvement complet',
    body:
      "Notre équipe gère le démontage, l'évacuation et le nettoyage. Vous récupérez vos locaux propres, prêts à rendre les clés.",
  },
  {
    icon: Recycle,
    num: '04',
    title: 'Valorisation responsable',
    body:
      "Nous reconditionnons le mobilier en bon état, donnons aux associations le reste, recyclons les pièces non valorisables. Rien à la benne.",
  },
  {
    icon: FileText,
    num: '05',
    title: 'Attestation RSE',
    body:
      "Vous recevez une attestation de valorisation détaillée : précieuse pour votre rapport RSE, vos certifications et votre communication.",
  },
]

const BENEFITS = [
  'Visite gratuite sous 48 h',
  'Devis détaillé sans engagement',
  'Rachat possible selon état',
  'Démontage et nettoyage inclus',
  'Attestation de valorisation RSE',
  'Couverture Marseille, PACA et France',
  'Équipe professionnelle, ponctualité garantie',
  'Dons à des associations locales',
]

const SCENARIOS = [
  {
    title: 'Déménagement',
    body: 'Nouveaux locaux, mobilier qui ne suit pas. On reprend tout, on libère vos espaces aux dates demandées.',
  },
  {
    title: 'Fermeture / liquidation',
    body: "Cessation d'activité, faillite, redressement. Intervention rapide, attestation pour le mandataire.",
  },
  {
    title: 'Renouvellement de parc',
    body: 'Remplacement complet du mobilier. Vous évitez les coûts de mise au rebut, vous valorisez votre RSE.',
  },
  {
    title: 'Déstockage',
    body: 'Mobilier neuf en surplus, fins de séries. Rachat au juste prix, sans intermédiaire.',
  },
]

export default function VidageDeLocauxPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-ivory">
        <div className="container py-20 md:py-28 max-w-4xl">
          <p className="eyebrow text-gold">Service entreprises</p>
          <h1 className="text-display-xl mt-4 font-serif text-ivory">
            Vidage de locaux professionnels, simple et responsable
          </h1>
          <div className="h-px w-12 bg-gold mt-8" />
          <p className="mt-8 text-lg text-ivory/80 leading-relaxed">
            Déménagement, fermeture, renouvellement de parc, déstockage :
            Mobilier Malin reprend votre mobilier de bureau en une intervention
            rapide. Évacuation complète, rachat possible, attestation RSE.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/contact" className="btn-gold">
              Demander une visite gratuite
            </Link>
            <a href="tel:+33676617053" className="btn-outline-light">
              06 76 61 70 53
            </a>
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="container py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow">Pour qui ?</p>
          <h2 className="text-display mt-3 font-serif">Quatre situations, une solution</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line">
          {SCENARIOS.map((s) => (
            <div key={s.title} className="bg-ivory-light p-8 md:p-10">
              <h3 className="font-serif text-2xl text-ink">{s.title}</h3>
              <p className="text-ink-soft mt-3 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="eyebrow">Le déroulé</p>
            <h2 className="text-display mt-3 font-serif">5 étapes, zéro tracas</h2>
            <div className="gold-divider mt-6" />
          </div>
          <div className="space-y-6 max-w-4xl mx-auto">
            {STEPS.map(({ icon: Icon, num, title, body }) => (
              <article
                key={num}
                className="bg-ivory-light border border-line p-6 md:p-8 flex items-start gap-6"
              >
                <div className="shrink-0 hidden sm:flex flex-col items-center text-center">
                  <Icon className="h-7 w-7 text-gold" strokeWidth={1.25} />
                  <span className="font-serif text-2xl text-gold-dark mt-2">{num}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 sm:hidden mb-2">
                    <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                    <span className="font-serif text-lg text-gold-dark">{num}</span>
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl text-ink">{title}</h3>
                  <p className="text-ink-soft mt-2 leading-relaxed">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-20 md:py-28 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="eyebrow">Pourquoi Mobilier Malin</p>
          <h2 className="text-display mt-3 font-serif">
            La tranquillité d&apos;un partenaire qui s&apos;occupe de tout
          </h2>
          <div className="h-px w-12 bg-gold mt-6" />
          <p className="mt-6 text-ink-mute leading-relaxed">
            Plus de 500 entreprises nous font déjà confiance pour leurs vidages
            de locaux. Notre engagement : zéro mobilier à la benne, des délais
            tenus, une équipe professionnelle.
          </p>
        </div>
        <ul className="space-y-3">
          {BENEFITS.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 bg-ivory-light border border-line p-4 text-sm text-ink"
            >
              <Check className="h-5 w-5 text-gold-dark shrink-0 mt-0.5" strokeWidth={2} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-ink text-ivory">
        <div className="container py-20 md:py-28 text-center max-w-3xl mx-auto">
          <p className="eyebrow text-gold">Réponse sous 24 h</p>
          <h2 className="text-display mt-3 font-serif text-ivory">
            On regarde votre projet ensemble ?
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/70 leading-relaxed">
            Donnez-nous quelques infos (volume estimé, localisation, délais) et
            nous revenons vers vous sous 24 h avec une visite gratuite et un
            devis chiffré.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-gold">
              Demander un devis
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
