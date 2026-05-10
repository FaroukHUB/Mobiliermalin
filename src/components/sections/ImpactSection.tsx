import Link from 'next/link'
import { Reveal } from '@/components/animations/Reveal'
import { Counter } from '@/components/animations/Counter'

export function ImpactSection() {
  return (
    <section className="bg-ivory-dark border-y border-line">
      <div className="container py-20 md:py-28 grid lg:grid-cols-2 gap-16 items-center">
        <Reveal>
          <p className="eyebrow">Notre engagement</p>
          <h2 className="text-display mt-3 font-serif text-ink leading-[1.1]">
            Chaque meuble sauvé est une victoire pour la planète
          </h2>
          <div className="h-px w-12 bg-gold mt-6" />
          <p className="mt-6 text-ink-soft leading-relaxed">
            Le meilleur déchet est celui qu&apos;on ne produit pas. Depuis
            2021, Mobilier Malin œuvre pour donner une seconde vie au mobilier
            de bureau d&apos;entreprises en transformation : déménagements,
            renouvellements de parc, fermetures.
          </p>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Nous formalisons cet engagement avec des attestations de
            valorisation RSE pour nos partenaires et des dons réguliers à des
            associations locales.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/notre-demarche" className="btn-primary">
              Notre démarche
            </Link>
            <Link href="/vidage-de-locaux" className="btn-outline">
              Vidage de locaux
            </Link>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="grid grid-cols-2 gap-px bg-line">
            <div className="bg-ivory-light p-8 md:p-10 flex flex-col justify-center min-h-[180px]">
              <p className="font-serif text-4xl md:text-5xl text-gold-dark leading-none">
                <Counter end={500} prefix="+" />
              </p>
              <p className="text-xs uppercase tracking-widest text-ink-mute mt-3 leading-relaxed">
                Entreprises accompagnées
              </p>
            </div>
            <div className="bg-ivory-light p-8 md:p-10 flex flex-col justify-center min-h-[180px]">
              <p className="font-serif text-4xl md:text-5xl text-gold-dark leading-none">
                <Counter end={12000} />
              </p>
              <p className="text-xs uppercase tracking-widest text-ink-mute mt-3 leading-relaxed">
                Pièces remises en circulation
              </p>
            </div>
            <div className="bg-ivory-light p-8 md:p-10 flex flex-col justify-center min-h-[180px]">
              <p className="font-serif text-4xl md:text-5xl text-gold-dark leading-none">
                <Counter end={840} suffix=" t" />
              </p>
              <p className="text-xs uppercase tracking-widest text-ink-mute mt-3 leading-relaxed">
                CO₂ évités en 2023
              </p>
            </div>
            <div className="bg-ivory-light p-8 md:p-10 flex flex-col justify-center min-h-[180px]">
              <p className="font-serif text-4xl md:text-5xl text-gold-dark leading-none">
                <Counter end={60} prefix="−" suffix=" %" />
              </p>
              <p className="text-xs uppercase tracking-widest text-ink-mute mt-3 leading-relaxed">
                Économies vs neuf
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
