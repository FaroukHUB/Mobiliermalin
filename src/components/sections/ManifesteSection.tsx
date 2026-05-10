import Image from 'next/image'
import Link from 'next/link'
import { Reveal } from '@/components/animations/Reveal'

export function ManifesteSection() {
  return (
    <section className="container py-20 md:py-32 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      <Reveal className="lg:col-span-6 order-2 lg:order-1">
        <p className="eyebrow">Notre manifeste</p>
        <h2 className="text-display mt-4 font-serif leading-[1.1]">
          Le mobilier de bureau ne se jette pas. Il se transmet.
        </h2>
        <div className="h-px w-12 bg-gold mt-7" />
        <div className="mt-7 space-y-5 text-ink-soft leading-relaxed">
          <p>
            Chaque année, des milliers de tonnes de mobilier de bureau
            d&apos;exception finissent en décharge. Bureaux Steelcase,
            fauteuils Herman Miller, armoires en acier de 30 ans qui n&apos;ont
            rien perdu de leur solidité — sacrifiés au prétexte d&apos;un
            déménagement, d&apos;un changement de couleur, d&apos;un design plus
            « tendance ».
          </p>
          <p>
            Nous croyons qu&apos;une chaise de qualité, pensée pour durer
            vingt-cinq ans, n&apos;a aucune raison d&apos;en finir au bout de
            cinq. Nous croyons qu&apos;équiper ses bureaux n&apos;a pas à
            coûter le prix du neuf, ni à peser sur la planète.
          </p>
          <p className="text-ink font-medium">
            Mobilier Malin sélectionne, restaure et redonne une seconde vie aux
            pièces qui méritent de continuer.
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
