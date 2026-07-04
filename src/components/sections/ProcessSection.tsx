import { Reveal } from '@/components/animations/Reveal'

const STEPS = [
  {
    num: '01',
    title: 'Sélection rigoureuse',
    body: 'Nous achetons directement aux entreprises en transformation. Marques premium, état contrôlé, provenance documentée.',
  },
  {
    num: '02',
    title: 'Reconditionnement en atelier',
    body: 'Démontage, nettoyage profond, remplacement des pièces d\'usure, contrôle qualité 7 points dans nos ateliers d\'Aubagne.',
  },
  {
    num: '03',
    title: 'Mise en catalogue',
    body: 'Photographie professionnelle, fiche détaillée avec dimensions, état, provenance. Fiche technique et attestation RSE générées.',
  },
  {
    num: '04',
    title: 'Livraison & installation',
    body: 'De 1 à 500 postes. Marseille, PACA, France entière. Montage sur place inclus pour les commandes professionnelles.',
  },
  {
    num: '05',
    title: 'Suivi & seconde vie',
    body: 'Attestation de valorisation RSE, SAV réactif, rachat possible si vous changez d\'avis. Une relation, pas une transaction.',
  },
]

export function ProcessSection() {
  return (
    <section className="container py-20 md:py-32">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow">Comment ça marche</p>
          <h2 className="text-display mt-3 font-serif">
            Cinq étapes, une exigence
          </h2>
          <div className="gold-divider mt-6" />
          <p className="mt-6 text-ink-mute">
            De l&apos;atelier à votre bureau, chaque pièce passe par un parcours
            méthodique pour garantir qualité et fiabilité.
          </p>
        </div>
      </Reveal>

      <div className="relative max-w-4xl mx-auto">
        {/* Ligne verticale or */}
        <div
          aria-hidden
          className="hidden md:block absolute left-[88px] top-4 bottom-4 w-px bg-gradient-to-b from-gold/0 via-gold/40 to-gold/0"
        />

        <ol className="space-y-10 md:space-y-14">
          {STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 80}>
              <li className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 md:gap-12 items-start">
                <div className="flex md:flex-col items-baseline md:items-start gap-3 md:gap-1 md:relative">
                  <span className="font-serif text-5xl md:text-6xl text-gold-dark leading-none md:relative md:z-10 md:bg-ivory md:pr-4">
                    {step.num}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-ink-mute md:mt-2">
                    Étape {i + 1}
                  </span>
                </div>
                <div className="md:pt-2">
                  <h3 className="font-serif text-2xl md:text-3xl text-ink leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-ink-soft leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
