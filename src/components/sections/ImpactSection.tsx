import Link from 'next/link'

const STATS = [
  { value: '+500', label: 'Entreprises accompagnées' },
  { value: '12 000', label: 'Pièces remises en circulation' },
  { value: '840 t', label: 'CO₂ évités en 2023' },
  { value: '−60 %', label: 'Économies vs neuf' },
]

export function ImpactSection() {
  return (
    <section className="bg-ivory-dark border-y border-line">
      <div className="container py-20 md:py-28 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="eyebrow">Notre engagement</p>
          <h2 className="text-display mt-3 font-serif text-ink">
            Chaque meuble sauvé est une victoire pour la planète
          </h2>
          <div className="h-px w-12 bg-gold mt-6" />
          <p className="mt-6 text-ink-soft leading-relaxed">
            Le meilleur déchet est celui qu&apos;on ne produit pas. Depuis 2021,
            Mobilier Malin œuvre pour donner une seconde vie au mobilier de
            bureau d&apos;entreprises en transformation : déménagements,
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
        </div>

        <div className="grid grid-cols-2 gap-px bg-line">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-ivory-light p-8 md:p-10 flex flex-col justify-center min-h-[180px]"
            >
              <p className="font-serif text-4xl md:text-5xl text-gold-dark">
                {s.value}
              </p>
              <p className="text-xs uppercase tracking-widest text-ink-mute mt-3 leading-relaxed">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
