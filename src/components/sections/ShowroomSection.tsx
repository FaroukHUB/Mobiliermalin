import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Phone } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import type { MediaImage } from '@/lib/site-settings'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80'
const FALLBACK_ALT = 'Showroom Mobilier Malin à Aubagne'

interface ShowroomSectionProps {
  image?: MediaImage
}

export function ShowroomSection({ image }: ShowroomSectionProps = {}) {
  const src = image?.url || FALLBACK_IMAGE
  const alt = image?.alt || FALLBACK_ALT

  return (
    <section className="bg-ivory-dark border-y border-line">
      <div className="container py-20 md:py-32 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal>
          <p className="eyebrow">Showroom — Aubagne</p>
          <h2 className="text-display mt-4 font-serif leading-[1.1]">
            Touchez, essayez, repartez avec
          </h2>
          <div className="h-px w-12 bg-gold mt-7" />
          <p className="mt-7 text-ink-soft leading-relaxed">
            Notre entrepôt-showroom à La Penne-sur-Huveaune (entre Marseille et
            Aubagne) accueille en moyenne 200 pièces réparties par catégorie.
            Vous pouvez essayer un fauteuil, comparer deux bureaux, vérifier
            l&apos;état d&apos;une armoire — bref, prendre votre décision en
            confiance.
          </p>
          <p className="mt-3 text-ink-soft leading-relaxed">
            Sur rendez-vous, du lundi au samedi de 10 h à 18 h. Café offert,
            conseils sans pression.
          </p>

          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
              <p className="text-ink leading-relaxed">
                18 chemin Noël Robion
                <br />
                13821 La Penne-sur-Huveaune
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
              <p className="text-ink">Lundi — Samedi, 10 h — 18 h (sur rendez-vous)</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
              <a href="tel:+33676617053" className="text-ink hover:text-gold-dark">
                06 76 61 70 53
              </a>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              Prendre rendez-vous
            </Link>
            <a href="tel:+33676617053" className="btn-outline">
              Appeler maintenant
            </a>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative aspect-[4/3] bg-ivory-light overflow-hidden">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/60 to-transparent h-32" />
            <div className="absolute bottom-5 left-5 right-5 text-ivory">
              <p className="text-[0.65rem] uppercase tracking-widest text-gold">
                Plus de 500 entreprises accompagnées
              </p>
              <p className="font-serif text-lg mt-1">
                Marseille · Aubagne · Aix-en-Provence
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
