import type { Metadata } from 'next'
import Link from 'next/link'
import {
  TrendingUp,
  Building2,
  Award,
  FileBadge2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { Counter } from '@/components/animations/Counter'

export const metadata: Metadata = {
  title:
    'Attestation RSE — votre achat de mobilier reconditionné devient un atout business',
  description:
    "Avec chaque commande Mobilier Malin, recevez une attestation de valorisation RSE officielle : déduction Bilan Carbone, conformité loi AGEC, accès aux marchés publics, points pour vos labels (B-Corp, Lucie). ROI x2.5.",
  alternates: { canonical: '/attestation-rse' },
  keywords: [
    'attestation RSE mobilier',
    'attestation valorisation mobilier',
    'loi AGEC mobilier bureau',
    'bilan carbone mobilier',
    'B-Corp mobilier',
    'achats responsables entreprise',
    'CO2 évité mobilier reconditionné',
    'économie circulaire bureau',
  ],
}

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Bilan Carbone amélioré',
    body:
      "Les entreprises de plus de 50 salariés sont tenues de produire un Bilan Carbone. Notre attestation chiffre précisément les kilos de CO₂ évités par votre achat — un gain direct sur votre score, et une protection contre les futures taxes carbone.",
  },
  {
    icon: Building2,
    title: 'Loi AGEC : 20 % réemploi',
    body:
      "Mairies, écoles, hôpitaux, et plus largement la commande publique, doivent justifier de 20 % d'achats issus du réemploi. Sans attestation, ils ne peuvent pas le prouver. Avec, ils gagnent les marchés publics.",
  },
  {
    icon: Award,
    title: 'Labels & financements verts',
    body:
      "B-Corp, Lucie, ISO 26000, Engagé RSE… Tous ces labels exigent des preuves d'actions concrètes. Notre attestation alimente directement votre dossier. Bonus : certains prêts bancaires verts offrent des taux préférentiels (jusqu'à −0,2 %) aux entreprises qui réduisent leur impact.",
  },
  {
    icon: FileBadge2,
    title: 'Communication & marque',
    body:
      "Un argument concret pour votre site, vos réseaux, vos rapports annuels et vos investisseurs. Dépassez le greenwashing en publiant des chiffres certifiés : « 960 kg de CO₂ évités, mobilier réemployé certifié RSE ».",
  },
]

const PROCESS = [
  {
    num: '01',
    title: 'Vous commandez',
    body: 'Achat ou location, peu importe. Un seul fauteuil ou 200 postes. L\'attestation est gratuite et incluse dans toute commande professionnelle.',
  },
  {
    num: '02',
    title: 'Nous calculons votre impact',
    body: 'Pour chaque pièce, nous quantifions le CO₂ évité (vs un équivalent neuf) et la masse de matière détournée des décharges. Méthodologie ADEME conforme.',
  },
  {
    num: '03',
    title: 'Vous recevez votre attestation',
    body: 'Document officiel signé, daté, sur papier en-tête Mobilier Malin (SIRET 894 410 729 00020). Format PDF + version imprimable. Renouvelable annuellement.',
  },
]

export default function RSEPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-20 md:py-28 max-w-4xl">
          <p className="eyebrow">Attestation de valorisation RSE</p>
          <h1 className="text-display-xl mt-4 font-serif leading-[1.05]">
            Votre achat devient un atout business
          </h1>
          <div className="gold-divider mx-0 mt-8" />
          <p className="mt-8 text-lg text-ink-soft leading-relaxed">
            Avec chaque commande Mobilier Malin, vous recevez gratuitement une
            <strong className="text-ink"> attestation officielle de valorisation
            RSE</strong> : un document qui transforme votre achat de mobilier
            en arguments fiscaux, concurrentiels, et de marque.
          </p>
          <p className="mt-4 text-lg text-ink-soft leading-relaxed">
            Pas un papier de plus à classer. Une <strong className="text-ink">arme
            commerciale</strong> pour votre entreprise.
          </p>
        </div>
      </section>

      {/* ROI bloc */}
      <section className="container py-20 md:py-28 max-w-4xl">
        <Reveal>
          <div className="bg-ink text-ivory p-8 md:p-12">
            <p className="eyebrow text-gold">Le calcul qui change tout</p>
            <p className="font-serif text-2xl md:text-3xl mt-4 leading-snug">
              Une PME qui équipe 5 postes chez nous pour{' '}
              <strong className="text-gold">690 €</strong> économise{' '}
              <strong className="text-gold">1 700 €</strong> vs neuf et évite{' '}
              <strong className="text-gold">
                <Counter end={960} suffix=" kg" /> de CO₂
              </strong>
              .
            </p>
            <p className="mt-4 text-ivory/70 leading-relaxed">
              Sur le marché carbone, 1 tonne de CO₂ se valorise environ 80 €.
              Votre attestation « vaut » donc 77 € pour votre PME. Soit un
              retour sur investissement supérieur à <strong className="text-gold">x2,5</strong>.
              Qui dit non ?
            </p>
            <div className="mt-8 pt-8 border-t border-ivory/15 grid grid-cols-3 gap-6">
              <div>
                <p className="font-serif text-3xl text-gold">
                  <Counter end={1700} suffix=" €" />
                </p>
                <p className="text-xs uppercase tracking-widest text-ivory/60 mt-1">
                  Économie directe
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl text-gold">x2,5</p>
                <p className="text-xs uppercase tracking-widest text-ivory/60 mt-1">
                  ROI
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl text-gold">
                  <Counter end={960} suffix=" kg" />
                </p>
                <p className="text-xs uppercase tracking-widest text-ivory/60 mt-1">
                  CO₂ évités
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Bénéfices */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-20 md:py-28">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="eyebrow">À quoi ça sert</p>
              <h2 className="text-display mt-3 font-serif">
                Quatre usages concrets pour votre entreprise
              </h2>
              <div className="gold-divider mt-6" />
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-px bg-line border border-line max-w-5xl mx-auto">
            {BENEFITS.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 80}>
                <article className="bg-ivory-light p-8 md:p-10 h-full">
                  <Icon className="h-8 w-8 text-gold" strokeWidth={1.25} />
                  <h3 className="font-serif text-2xl text-ink mt-5 leading-tight">
                    {title}
                  </h3>
                  <p className="text-ink-soft mt-4 leading-relaxed text-sm">
                    {body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container py-20 md:py-28">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="eyebrow">Comment l&apos;obtenir</p>
            <h2 className="text-display mt-3 font-serif">Trois étapes, zéro paperasse</h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6 md:gap-10 max-w-5xl mx-auto">
          {PROCESS.map((s, i) => (
            <Reveal key={s.num} delay={i * 100}>
              <div className="text-center">
                <p className="font-serif text-5xl md:text-6xl text-gold-dark leading-none">
                  {s.num}
                </p>
                <h3 className="font-serif text-xl text-ink mt-4 leading-tight">
                  {s.title}
                </h3>
                <p className="text-ink-soft mt-3 leading-relaxed text-sm max-w-sm mx-auto">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Exemple visuel d'attestation (placeholder) */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-20 md:py-28 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <p className="eyebrow">À quoi ça ressemble</p>
            <h2 className="text-display mt-3 font-serif leading-[1.1]">
              Un document simple, signé, opposable
            </h2>
            <div className="h-px w-12 bg-gold mt-6" />
            <ul className="mt-8 space-y-3 text-sm">
              {[
                'Identité de votre entreprise + SIRET',
                'Inventaire détaillé du mobilier valorisé',
                'Quantification CO₂ évité (méthodologie ADEME)',
                'Masse totale détournée des décharges',
                'Signature et tampon Mobilier Malin (SIRET 894 410 729 00020)',
                'Format PDF + version papier disponible',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 bg-ivory-light border border-line p-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-gold-dark shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={150}>
            <div className="aspect-[3/4] bg-ivory-light border border-line p-8 md:p-12 flex flex-col">
              {/* Maquette visuelle d'attestation */}
              <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
                <div>
                  <p className="font-serif text-lg text-ink">
                    Mobilier <span className="text-gold-dark">Malin</span>
                  </p>
                  <p className="text-[0.65rem] uppercase tracking-widest text-ink-mute mt-1">
                    SARL 2 M · SIRET 894 410 729 00020
                  </p>
                </div>
                <div className="h-12 w-12 border border-gold flex items-center justify-center">
                  <span className="font-serif text-lg text-gold-dark">RSE</span>
                </div>
              </div>
              <p className="text-[0.65rem] uppercase tracking-widest text-gold-dark text-center">
                Attestation de valorisation
              </p>
              <h3 className="font-serif text-2xl text-ink text-center mt-4">
                Économie circulaire vérifiée
              </h3>
              <div className="my-auto py-8 text-center">
                <p className="text-xs text-ink-mute uppercase tracking-widest">
                  CO₂ évités
                </p>
                <p className="font-serif text-5xl text-gold-dark mt-2">960 kg</p>
                <p className="text-xs text-ink-mute uppercase tracking-widest mt-6">
                  Pièces réemployées
                </p>
                <p className="font-serif text-5xl text-gold-dark mt-2">23</p>
              </div>
              <div className="border-t border-line pt-4 flex justify-between text-xs text-ink-mute">
                <span>Délivrée le {new Date().toLocaleDateString('fr-FR')}</span>
                <span>Djamel Djennad</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="container py-20 md:py-28 max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow">Prêt à transformer votre achat</p>
          <h2 className="text-display mt-3 font-serif">
            Chaque commande, son attestation
          </h2>
          <div className="gold-divider mt-6" />
          <p className="mt-6 text-ink-mute leading-relaxed">
            L&apos;attestation est gratuite et incluse dans toute commande
            professionnelle. Pour les commandes &gt; 1 000 € HT, nous vous la
            délivrons avant livraison pour valoriser votre achat dès la
            décision.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/boutique" className="btn-primary">
              Voir le catalogue
            </Link>
            <Link href="/contact" className="btn-outline inline-flex items-center gap-2">
              Demander un devis avec attestation
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
