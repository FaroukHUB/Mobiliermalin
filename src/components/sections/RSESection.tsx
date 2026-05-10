import Link from 'next/link'
import { FileBadge2, Building2, Award, TrendingUp, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { Counter } from '@/components/animations/Counter'

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Bilan Carbone amélioré',
    body: 'Chaque lot acheté apporte des kilos de CO₂ évités, déductibles directement dans votre rapport RSE annuel.',
  },
  {
    icon: Building2,
    title: 'Loi AGEC : 20 % de réemploi',
    body: 'Mairies, écoles, hôpitaux et grandes entreprises doivent prouver 20 % d\'achats de réemploi. Notre attestation, c\'est votre preuve.',
  },
  {
    icon: Award,
    title: 'Labels & financements',
    body: 'B-Corp, Lucie, ISO 26000, prêts verts à taux préférentiels — votre engagement responsable devient un actif financier.',
  },
  {
    icon: FileBadge2,
    title: 'Communication & marque employeur',
    body: 'Un argument concret pour vos clients, vos investisseurs et vos talents. Dépassez le greenwashing avec des chiffres.',
  },
]

export function RSESection() {
  return (
    <section className="bg-ink text-ivory relative overflow-hidden">
      {/* Décor or */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 20%, rgba(201,169,97,0.12) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(201,169,97,0.08) 0%, transparent 50%)',
        }}
      />

      <div className="container relative py-20 md:py-32">
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow text-gold">Attestation RSE</p>
            <h2 className="text-display mt-4 font-serif text-ivory leading-[1.1]">
              Votre achat devient un atout business
            </h2>
            <div className="h-px w-12 bg-gold mt-7" />
            <p className="mt-7 text-lg text-ivory/80 leading-relaxed">
              Chaque pièce livrée s&apos;accompagne de son <strong className="text-ivory">attestation
              de valorisation RSE</strong> : un document officiel qui transforme
              votre achat de mobilier en avantages concrets — fiscaux,
              concurrentiels, et de marque.
            </p>
          </Reveal>
        </div>

        {/* ROI bloc */}
        <Reveal delay={150}>
          <div className="mt-16 bg-ivory text-ink p-8 md:p-12 max-w-4xl">
            <p className="eyebrow">Le calcul qui change tout</p>
            <p className="font-serif text-2xl md:text-3xl mt-4 text-ink leading-snug">
              Une PME qui équipe 5 postes chez nous pour <strong className="text-gold-dark">690 €</strong> économise{' '}
              <strong className="text-gold-dark">1&nbsp;700 €</strong> vs neuf et évite{' '}
              <strong className="text-gold-dark">
                <Counter end={960} suffix=" kg" /> de CO₂
              </strong>.
            </p>
            <div className="mt-6 pt-6 border-t border-line grid grid-cols-3 gap-6">
              <div>
                <p className="font-serif text-3xl text-gold-dark">
                  <Counter end={1700} prefix="" suffix=" €" />
                </p>
                <p className="text-xs uppercase tracking-widest text-ink-mute mt-1">
                  Économie directe
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl text-gold-dark">
                  ROI <Counter end={2.5} format={false} suffix="" prefix="x" />
                </p>
                <p className="text-xs uppercase tracking-widest text-ink-mute mt-1">
                  Retour sur investissement
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl text-gold-dark">
                  <Counter end={960} suffix=" kg" />
                </p>
                <p className="text-xs uppercase tracking-widest text-ink-mute mt-1">
                  CO₂ évités
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Bénéfices grille */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ivory/10 border border-ivory/10">
          {BENEFITS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="bg-ink p-7 h-full">
                <Icon className="h-7 w-7 text-gold" strokeWidth={1.25} />
                <h3 className="font-serif text-lg text-ivory mt-5 leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-ivory/70 mt-3 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              href="/attestation-rse"
              className="btn-gold inline-flex items-center gap-2"
            >
              En savoir plus sur l&apos;attestation
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link href="/contact" className="btn-outline-light">
              Demander un devis avec attestation
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
