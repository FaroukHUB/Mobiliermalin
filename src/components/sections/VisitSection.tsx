import Link from 'next/link'
import { MapPin, Clock, Phone, Car, Navigation } from 'lucide-react'

/**
 * Encart « Venez nous rendre visite au dépôt », façon magazine.
 *
 * Placé sous le hero et la barre de rassurance, avant les catégories.
 * Il répond à une confusion réelle, beaucoup de visiteurs ne savent pas
 * qu'ils peuvent venir voir et essayer le mobilier sur place.
 *
 * Fond beige du site, titre en grand, un tampon « Ouvert du lundi au samedi »
 * posé de travers, et une vraie carte Google encadrée à la manière
 * d'une photo de magazine. Les textes reprennent ceux déjà en ligne
 * sur le site, sans chiffre de stock : on ne promet rien qu'on ne
 * tienne pas.
 */

const ADDRESS = '18 chemin Noël Robion, 13821 La Penne-sur-Huveaune'

// Carte Google sans clé ni script : une simple iframe, chargée en
// différé pour ne pas peser sur l'arrivée sur la page.
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&z=15&hl=fr&output=embed`

export function VisitSection() {
  return (
    <section
      className="relative overflow-hidden bg-ivory-dark text-ink border-b border-line"
      aria-labelledby="visite-titre"
    >
      {/* Filigrane typographique, purement décoratif */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute -right-6 -top-20 font-serif leading-none text-ink/[0.06] text-[11rem] md:text-[17rem]"
      >
        Dépôt
      </div>

      <div className="container relative py-10 md:py-14 grid lg:grid-cols-[1fr_minmax(300px,420px)] gap-10 lg:gap-16 items-center">
        {/* ── Texte ── */}
        <div>
          <span className="inline-flex items-center gap-2 bg-ink text-ivory text-[0.65rem] tracking-widest uppercase px-3 py-1.5">
            <MapPin className="h-3 w-3 text-gold" strokeWidth={2} />
            Dépôt-showroom · La Penne-sur-Huveaune
          </span>

          <h2
            id="visite-titre"
            className="mt-5 font-serif text-display leading-[1.02] tracking-tight"
          >
            Venez nous rendre
            <br />
            visite au dépôt.
          </h2>

          <p className="mt-5 max-w-xl text-ink/85 leading-relaxed text-[1.05rem]">
            Essayez un fauteuil, comparez deux bureaux, vérifiez l&apos;état
            d&apos;une armoire, et repartez avec. Café offert, conseils sans
            pression.
          </p>

          <ul className="mt-7 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
              <span>
                18 chemin Noël Robion
                <br />
                13821 La Penne-sur-Huveaune
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
              <span>
                Lundi au samedi, 9 h à 18 h
                <br />
                Dimanche sur rendez-vous
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
              <a href="tel:+33676617053" className="underline underline-offset-4 decoration-ink/40 hover:decoration-ink">
                06 76 61 70 53
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Car className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.75} />
              <span>5 min d&apos;Aubagne, 20 min de Marseille</span>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/itineraire"
              className="inline-flex items-center gap-2 bg-ink text-ivory px-6 py-3.5 text-xs tracking-widest uppercase hover:bg-ink-soft transition-colors"
            >
              <Navigation className="h-4 w-4" strokeWidth={1.75} />
              Itinéraire
            </Link>
            <a
              href="tel:+33676617053"
              className="inline-flex items-center gap-2 border border-ink text-ink px-6 py-3.5 text-xs tracking-widest uppercase hover:bg-ink hover:text-ivory transition-colors"
            >
              Appeler maintenant
            </a>
            <Link
              href="/contact"
              className="text-sm underline underline-offset-4 decoration-ink/40 hover:decoration-ink"
            >
              Prendre rendez-vous pour le dimanche
            </Link>
          </div>
        </div>

        {/* ── Carte, encadrée comme une photo de magazine ── */}
        <div className="relative pt-6 lg:pt-0">
          {/* Tampon posé de travers */}
          <div className="absolute -top-1 left-2 lg:-top-6 lg:-left-6 z-10 -rotate-6 bg-ivory-light border border-ink/10 shadow-lg px-4 py-2.5">
            <p className="font-serif text-lg leading-tight">Ouvert du lundi au samedi</p>
            <p className="text-[0.7rem] tracking-widest uppercase text-ink-mute mt-0.5">
              9 h à 18 h · dimanche sur rendez-vous
            </p>
          </div>

          <div className="relative aspect-[4/3] border-[6px] border-ink bg-ivory-dark shadow-[14px_14px_0_0_#1A1A1A]">
            <iframe
              title="Carte du dépôt Mobilier Malin, 18 chemin Noël Robion, La Penne-sur-Huveaune"
              src={MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>

          <Link
            href="/itineraire"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 decoration-ink/40 hover:decoration-ink"
          >
            <Navigation className="h-4 w-4" strokeWidth={1.75} />
            Ouvrir dans Maps ou Waze
          </Link>
        </div>
      </div>
    </section>
  )
}
