import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/animations/Reveal'

export function ManifesteSection() {
  return (
    <section className="container py-20 md:py-32 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      <Reveal className="lg:col-span-6 order-2 lg:order-1">
        <p className="eyebrow">Notre manifeste</p>
        <h2 className="text-display mt-4 font-serif leading-[1.1]">
          Le mobilier de bureau ne se jette pas. Il circule.
        </h2>
        <div className="h-px w-12 bg-gold mt-7" />
        <div className="mt-7 space-y-5 text-ink-soft leading-relaxed">
          <p>
            Le monde du travail évolue vite. Les entreprises grandissent,
            déménagent, fusionnent, repensent leurs espaces. Et avec elles,
            d&apos;immenses volumes de mobilier — souvent signés Steelcase,
            Herman Miller, Haworth ou Vitra — changent de mains chaque année.
          </p>
          <p>
            Notre métier est d&apos;être <strong className="text-ink">le pont
            intelligent</strong> entre celles qui s&apos;en séparent et
            celles qui souhaitent s&apos;équiper. Pour les premières, nous
            simplifions une étape souvent fastidieuse. Pour les secondes, nous
            rendons accessible un mobilier de qualité, à prix maîtrisé.
          </p>
          <p className="text-ink font-medium">
            Mobilier Malin sélectionne, restaure et redistribue. Au profit
            des entreprises, des budgets, et de la planète.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/notre-demarche" className="btn-primary">
            Découvrir notre histoire
          </Link>
          <Link href="/attestation-rse" className="btn-outline">
            Notre engagement RSE
          </Link>
        </div>
      </Reveal>

      <Reveal delay={150} className="lg:col-span-6 order-1 lg:order-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory-dark">
          <Image
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80"
            alt="Espace de bureau aménagé avec mobilier de qualité"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          {/* Petit cadre or décoratif */}
          <div className="absolute inset-4 border border-gold/40 pointer-events-none" />
        </div>
      </Reveal>
    </section>
  )
}
