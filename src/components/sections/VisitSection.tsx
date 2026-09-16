import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Phone, Car, Navigation } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import type { MediaImage } from '@/lib/site-settings'

/**
 * « Venez nous rendre visite au dépôt », juste sous le hero.
 *
 * Répond à une confusion réelle : beaucoup de visiteurs ne savent pas
 * qu'ils peuvent venir voir et essayer le mobilier sur place. Cette
 * bande le dit tout de suite, avant les produits, avec l'adresse, les
 * horaires, le téléphone, et l'itinéraire en un clic.
 *
 * Tous les textes reprennent ceux de la section Showroom déjà en ligne :
 * rien n'est promis ici qui ne le soit pas ailleurs sur le site.
 */

interface VisitSectionProps {
  /** Photo du showroom (Réglages du site). Sans photo, un aplat sobre. */
  image?: MediaImage
}

export function VisitSection({ image }: VisitSectionProps = {}) {
  return (
    <section className="bg-ivory-light border-b border-line" aria-labelledby="visite-titre">
      <div className="container py-12 md:py-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
        <Reveal>
          <p className="eyebrow">Dépôt-showroom · La Penne-sur-Huveaune</p>
          <h2 id="visite-titre" className="text-display mt-3 font-serif leading-[1.1]">
            Venez nous rendre visite au dépôt
          </h2>
          <p className="mt-6 text-ink-soft leading-relaxed">
            Notre entrepôt-showroom à La Penne-sur-Huveaune (entre Marseille et
            Aubagne) accueille en moyenne 200 pièces réparties par catégorie.
            Vous pouvez essayer un fauteuil, comparer deux bureaux, vérifier
            l&apos;état d&apos;une armoire.
          </p>
          <p className="mt-3 text-ink-soft leading-relaxed">
            Ouvert du lundi au samedi de 9 h à 18 h, et le dimanche sur
            rendez-vous. Café offert, conseils sans pression.
          </p>

          <dl className="mt-7 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-gold-dark mt-0.5 shrink-0" strokeWidth={1.5} />
              <div>
                <dt className="sr-only">Adresse</dt>
                <dd className="text-ink leading-relaxed">
                  18 chemin Noël Robion
                  <br />
                  13821 La Penne-sur-Huveaune
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-gold-dark mt-0.5 shrink-0" strokeWidth={1.5} />
              <div>
                <dt className="sr-only">Horaires</dt>
                <dd className="text-ink leading-relaxed">
                  Lundi au samedi, 9 h à 18 h
                  <br />
                  Dimanche sur rendez-vous
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-gold-dark mt-0.5 shrink-0" strokeWidth={1.5} />
              <div>
                <dt className="sr-only">Téléphone</dt>
                <dd>
                  <a href="tel:+33676617053" className="text-ink hover:text-gold-dark">
                    06 76 61 70 53
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Car className="h-4 w-4 text-gold-dark mt-0.5 shrink-0" strokeWidth={1.5} />
              <div>
                <dt className="sr-only">Accès</dt>
                <dd className="text-ink leading-relaxed">5 min d&apos;Aubagne, 20 min de Marseille</dd>
              </div>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/itineraire" className="btn-primary inline-flex items-center gap-2">
              <Navigation className="h-4 w-4" strokeWidth={1.5} />
              Itinéraire
            </Link>
            <a href="tel:+33676617053" className="btn-outline">
              Appeler maintenant
            </a>
            <Link href="/contact" className="btn-outline">
              Prendre rendez-vous (dimanche)
            </Link>
          </div>
        </Reveal>

        <Reveal delay={150}>
          {/* La photo du dépôt, cliquable vers l'itinéraire Maps ou Waze */}
          <Link
            href="/itineraire"
            className="group relative block aspect-[4/3] bg-ivory-dark border border-line overflow-hidden"
            aria-label="Ouvrir l'itinéraire vers le dépôt"
          >
            {image?.url ? (
              <Image
                src={image.url}
                alt={image.alt || 'Dépôt-showroom Mobilier Malin à La Penne-sur-Huveaune'}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-gold" strokeWidth={1.25} />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/60 to-transparent h-28" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-ivory-light text-ink text-xs font-medium px-3 py-2">
              <Navigation className="h-3.5 w-3.5 text-gold-dark" strokeWidth={1.5} />
              Ouvrir dans Maps ou Waze
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
