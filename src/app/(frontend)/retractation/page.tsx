import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, FileText, Clock, Wallet, Truck } from 'lucide-react'
import { RetractationForm } from '@/components/forms/RetractationForm'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Renoncer au contrat — Droit de rétractation',
  description:
    'Exercez votre droit de rétractation de 14 jours, gratuitement et en quelques clics. Formulaire dédié conforme à l\'ordonnance n°2026-2 du 19 juin 2026.',
  alternates: { canonical: '/retractation' },
  robots: { index: true, follow: true },
}

export default function RetractationPage() {
  return (
    <>
      {/* Hero — clair et direct */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-16 md:py-20 max-w-4xl">
          <p className="eyebrow">Droit de rétractation</p>
          <h1 className="text-display mt-4 font-serif">
            Renoncer au contrat — exercer votre droit de rétractation
          </h1>
          <div className="gold-divider mx-0 mt-6" />
          <p className="mt-6 text-lg text-ink-soft leading-relaxed">
            Conformément à la loi, vous disposez de 14 jours à compter de la
            réception de votre commande pour vous rétracter, sans avoir à
            justifier de motif et sans frais. Cette démarche est entièrement
            gratuite.
          </p>
        </div>
      </section>

      {/* Conditions clés — 4 points */}
      <section className="container py-16 md:py-20 max-w-5xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          <article className="bg-ivory-light border border-line p-6">
            <Clock className="h-7 w-7 text-gold" strokeWidth={1.5} />
            <h2 className="font-serif text-lg text-ink mt-4">14 jours</h2>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">
              À compter de la réception du bien, vous avez 14 jours pour
              notifier votre rétractation.
            </p>
          </article>

          <article className="bg-ivory-light border border-line p-6">
            <Wallet className="h-7 w-7 text-gold" strokeWidth={1.5} />
            <h2 className="font-serif text-lg text-ink mt-4">Gratuit</h2>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">
              L&apos;exercice du droit de rétractation ne donne lieu à aucun
              frais. Vous serez intégralement remboursé.
            </p>
          </article>

          <article className="bg-ivory-light border border-line p-6">
            <FileText className="h-7 w-7 text-gold" strokeWidth={1.5} />
            <h2 className="font-serif text-lg text-ink mt-4">Sans motif</h2>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">
              Aucune justification n&apos;est requise. Indiquer un motif
              reste possible mais facultatif.
            </p>
          </article>

          <article className="bg-ivory-light border border-line p-6">
            <Truck className="h-7 w-7 text-gold" strokeWidth={1.5} />
            <h2 className="font-serif text-lg text-ink mt-4">Retour 14 j</h2>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">
              Après notification, vous disposez de 14 jours pour nous
              renvoyer le bien dans son état d&apos;origine.
            </p>
          </article>
        </div>
      </section>

      {/* Formulaire */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-20 max-w-3xl">
          <div className="mb-10">
            <p className="eyebrow">Formulaire de rétractation</p>
            <h2 className="font-serif text-2xl md:text-3xl text-ink mt-3">
              Remplissez ce formulaire pour notifier votre rétractation
            </h2>
            <p className="mt-4 text-ink-soft leading-relaxed">
              Vous recevrez immédiatement un accusé de réception horodaté
              par email. Notre équipe vous recontacte sous 24 h ouvrées pour
              organiser le retour.
            </p>
          </div>

          <div className="bg-ivory border border-line p-6 md:p-10">
            <RetractationForm />
          </div>
        </div>
      </section>

      {/* Détail de la procédure */}
      <section className="container py-16 md:py-20 max-w-3xl">
        <p className="eyebrow">Comment se déroule la suite</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-3">
          De votre demande au remboursement
        </h2>
        <div className="gold-divider mx-0 mt-6" />

        <ol className="mt-10 space-y-7">
          <Step
            n={1}
            title="Vous remplissez le formulaire"
            text="Votre demande est horodatée et enregistrée. Un accusé de réception est envoyé immédiatement à votre adresse email."
          />
          <Step
            n={2}
            title="Nous vous recontactons sous 24 h ouvrées"
            text="Pour convenir des modalités de retour (créneau de récupération à votre adresse, ou dépôt au showroom de La Penne-sur-Huveaune)."
          />
          <Step
            n={3}
            title="Retour du produit sous 14 jours"
            text="Vous disposez de 14 jours à compter de votre notification pour nous renvoyer le bien, dans son état d'origine et son emballage si possible."
          />
          <Step
            n={4}
            title="Remboursement intégral sous 14 jours"
            text="Dès réception du produit (ou preuve d'envoi), nous vous remboursons l'intégralité des sommes versées, y compris les frais de livraison standard, par le moyen de paiement utilisé."
          />
        </ol>

        <div className="mt-12 p-6 bg-ivory-light border-l-4 border-gold text-sm text-ink-soft leading-relaxed">
          <p className="font-serif text-base text-ink mb-2">
            Une question avant d&apos;envoyer votre demande ?
          </p>
          <p>
            Contactez-nous directement, nous trouverons la solution la plus
            simple pour vous.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <a
              href={`tel:${LEGAL.telephoneTel}`}
              className="inline-flex items-center gap-2 text-gold-dark hover:text-gold"
            >
              <Phone className="h-4 w-4" /> {LEGAL.telephone}
            </a>
            <a
              href={`mailto:${LEGAL.email}`}
              className="inline-flex items-center gap-2 text-gold-dark hover:text-gold"
            >
              <Mail className="h-4 w-4" /> {LEGAL.email}
            </a>
          </div>
        </div>
      </section>

      {/* Base légale */}
      <section className="bg-ink text-ivory">
        <div className="container py-12 max-w-3xl">
          <p className="eyebrow text-gold">Base légale</p>
          <h2 className="font-serif text-xl text-ivory mt-3">
            Vos références juridiques
          </h2>
          <div className="h-px w-12 bg-gold mt-6" />
          <ul className="mt-6 space-y-3 text-sm text-ivory/75 leading-relaxed">
            <li>
              <strong className="text-ivory">Articles L221-18 à L221-28</strong> du
              Code de la consommation — droit de rétractation pour les contrats
              conclus à distance.
            </li>
            <li>
              <strong className="text-ivory">Ordonnance n°2026-2 du 19 juin 2026</strong> —
              obligation pour les sites e-commerce de proposer une fonction
              de rétractation aussi accessible que la commande, gratuite,
              clairement identifiable et disponible en permanence.
            </li>
          </ul>
          <p className="mt-6 text-xs text-ivory/55">
            Pour consulter les textes officiels :
            <a href="https://www.legifrance.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline ml-1">Légifrance</a>
            ·
            <a href="https://www.economie.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline ml-1">economie.gouv.fr</a>
          </p>
          <p className="mt-6 text-xs text-ivory/55">
            <Link href="/cgv" className="hover:text-gold">Conditions générales de vente</Link>
            {' · '}
            <Link href="/contact" className="hover:text-gold">Contact</Link>
          </p>
        </div>
      </section>
    </>
  )
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="flex gap-5">
      <span className="font-serif text-2xl text-gold leading-none shrink-0 w-10">
        {String(n).padStart(2, '0')}
      </span>
      <div>
        <h3 className="font-serif text-lg text-ink">{title}</h3>
        <p className="mt-2 text-sm text-ink-soft leading-relaxed">{text}</p>
      </div>
    </li>
  )
}
