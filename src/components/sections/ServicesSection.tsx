import Link from 'next/link'
import { Armchair, Building2, ArrowRight, Check } from 'lucide-react'

export function ServicesSection() {
  return (
    <section className="container py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="eyebrow">Nos services</p>
        <h2 className="text-display mt-3 font-serif">
          Deux façons de travailler ensemble
        </h2>
        <div className="gold-divider mt-6" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Service 1 — Achat */}
        <article className="relative bg-ivory-light border border-line p-8 md:p-12 flex flex-col">
          <span className="absolute top-6 right-6 text-[0.65rem] uppercase tracking-widest text-gold-dark border border-gold-dark/30 px-3 py-1">
            Le plus demandé
          </span>
          <Armchair className="h-10 w-10 text-gold" strokeWidth={1.25} />
          <h3 className="font-serif text-2xl md:text-3xl text-ink mt-6">
            Achat de mobilier reconditionné
          </h3>
          <p className="text-ink-mute mt-3 leading-relaxed">
            Équipez vos bureaux avec des pièces signées, à prix réduit.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Steelcase, Herman Miller, Haworth, Vitra',
              'Contrôlé, nettoyé et garanti 6 mois',
              'Livraison et installation incluses',
              'De 1 à 500+ postes équipés',
            ].map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-ink-soft">
                <Check className="h-4 w-4 text-gold-dark mt-0.5 shrink-0" strokeWidth={2} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/boutique"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-gold-dark group"
          >
            Voir le catalogue
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>
        </article>

        {/* Service 2 — Vidage */}
        <article className="relative bg-ink text-ivory p-8 md:p-12 flex flex-col">
          <span className="absolute top-6 right-6 text-[0.65rem] uppercase tracking-widest text-gold border border-gold/30 px-3 py-1">
            Déménagement / Fermeture
          </span>
          <Building2 className="h-10 w-10 text-gold" strokeWidth={1.25} />
          <h3 className="font-serif text-2xl md:text-3xl text-ivory mt-6">
            Vidage de locaux professionnels
          </h3>
          <p className="text-ivory/70 mt-3 leading-relaxed">
            Libérez vos espaces rapidement, proprement et de façon responsable.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Visite gratuite de vos locaux sous 48 h',
              'Enlèvement complet du mobilier',
              'Rachat possible selon état',
              'Attestation de valorisation RSE',
            ].map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-ivory/80">
                <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" strokeWidth={2} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/vidage-de-locaux"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-light group"
          >
            Demander un devis
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
          </Link>
        </article>
      </div>
    </section>
  )
}
