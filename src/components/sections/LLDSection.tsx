import Link from 'next/link'
import Image from 'next/image'
import { Wallet, ShieldCheck, Repeat, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'

const PILIERS = [
  {
    icon: Wallet,
    title: 'Trésorerie préservée',
    body: 'Pas de gros achat à amortir. Vous étalez sur 36 mois et conservez votre capacité d\'investissement pour ce qui fait grandir votre activité.',
  },
  {
    icon: ShieldCheck,
    title: 'Tranquillité incluse',
    body: 'Livraison, montage, SAV sous 72 h avec matériel de remplacement, attestation RSE annuelle. Tout est inclus dans le loyer mensuel.',
  },
  {
    icon: Repeat,
    title: 'Évolutivité totale',
    body: 'Effectifs qui grandissent ou diminuent ? Mobilier qui ne convient plus ? On adapte votre parc à tout moment, sans pénalité.',
  },
]

export function LLDSection() {
  return (
    <section className="relative bg-ivory-light overflow-hidden">
      {/* Décor or discret en haut */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="container py-20 md:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <Reveal className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative aspect-[4/5] bg-ivory-dark overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1542435503-956c469947f6?w=1000&q=80"
                alt="Open-space moderne équipé en location longue durée"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              {/* Carte prix en surimpression */}
              <div className="absolute bottom-6 left-6 right-6 bg-ivory/95 backdrop-blur p-5 border border-gold">
                <p className="text-[0.65rem] uppercase tracking-widest text-gold-dark font-medium">
                  Pack 1 poste de travail complet
                </p>
                <p className="font-serif text-3xl text-ink mt-2">
                  51 € <span className="text-base text-ink-mute">/ mois HT</span>
                </p>
                <p className="text-xs text-ink-mute mt-2 leading-relaxed">
                  Bureau · Fauteuil · Caisson · Armoire — sur 36 mois, services inclus
                </p>
              </div>
            </div>
          </Reveal>

          {/* Texte */}
          <Reveal delay={150} className="lg:col-span-7 order-1 lg:order-2">
            <p className="eyebrow">Nouveau · Service entreprises</p>
            <h2 className="text-display mt-4 font-serif leading-[1.1]">
              La location longue durée, pour préserver votre trésorerie
            </h2>
            <div className="h-px w-12 bg-gold mt-7" />
            <p className="mt-7 text-ink-soft leading-relaxed">
              Équipez vos bureaux dès aujourd&apos;hui. Étalez le coût sur 36
              mois. Décidez à la fin : vous restituez, vous prolongez, ou vous
              rachetez à 10 % de la valeur neuve.
            </p>
            <p className="mt-3 text-ink-soft leading-relaxed">
              Idéal pour les start-up en croissance, les cabinets qui ouvrent
              de nouveaux bureaux, les entreprises qui préfèrent l&apos;OPEX au
              CAPEX.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-px bg-line border border-line">
              {PILIERS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-ivory-light p-6 flex flex-col gap-3">
                  <Icon className="h-6 w-6 text-gold" strokeWidth={1.25} />
                  <h3 className="font-serif text-lg text-ink leading-tight">
                    {title}
                  </h3>
                  <p className="text-xs text-ink-mute leading-relaxed">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/location-mobilier-bureau"
                className="btn-gold inline-flex items-center gap-2"
              >
                Découvrir l&apos;offre LLD
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link href="/contact" className="btn-outline">
                Demander un devis
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
