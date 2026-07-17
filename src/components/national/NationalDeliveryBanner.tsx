import Link from 'next/link'
import { Truck, MapPin, ArrowRight } from 'lucide-react'

/**
 * Bloc "Livraison France entière" partagé sur les landing pages nationales.
 *
 * Pointe vers /zones-desservies (hub local Sprint 2) pour capter les
 * visiteurs qui veulent vérifier la couverture géographique. Le texte
 * reste neutre sur les tarifs (aucun montant fictif, ne dépend pas
 * d'une politique commerciale figée).
 */
export function NationalDeliveryBanner() {
  return (
    <section className="bg-ivory-dark border-y border-line">
      <div className="container py-14 md:py-16 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Truck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Livraison France
            </p>
            <h2 className="font-serif text-h1 mt-3 leading-tight">
              Livraison partout en France, retrait au showroom
            </h2>
            <p className="mt-4 text-ink-soft leading-relaxed">
              Notre atelier se trouve à La Penne-sur-Huveaune, à 5 minutes
              d'Aubagne et 20 minutes de Marseille. Nous livrons dans toute
              la région PACA sur devis et intervenons au-delà pour les
              commandes volumineuses. Le retrait au showroom est possible
              sur rendez-vous.
            </p>
          </div>
          <div className="bg-ivory border border-line p-6 md:p-7">
            <p className="text-xs uppercase tracking-widest text-ink-mute">
              Nos zones desservies
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold shrink-0" strokeWidth={1.5} />
                Bouches-du-Rhône (Marseille, Aubagne, Aix-en-Provence, La Ciotat)
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold shrink-0" strokeWidth={1.5} />
                Var, Alpes-Maritimes (Toulon, Nice)
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold shrink-0" strokeWidth={1.5} />
                Vaucluse (Avignon, Orange)
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold shrink-0" strokeWidth={1.5} />
                Autres régions sur devis
              </li>
            </ul>
            <Link
              href="/zones-desservies"
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-gold-dark hover:text-gold underline underline-offset-2"
            >
              Voir toutes les zones desservies
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
