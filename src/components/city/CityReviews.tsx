import Link from 'next/link'
import { Quote, Star, ArrowRight } from 'lucide-react'
import { GOOGLE_REVIEWS, GOOGLE_REVIEW_URL } from '@/lib/reviews'
import { Reveal } from '@/components/animations/Reveal'

/**
 * Bloc "Avis clients" partagé sur les pages ville.
 *
 * Règles SEO :
 *   - Aucun JSON-LD Review émis ici (pas de duplication ×8 villes)
 *   - data-nosnippet sur le conteneur → Google n'utilise PAS le texte
 *     des avis en meta description SERP (garde le contrôle)
 *   - Les vraies reviews restent au niveau Organization (source unique)
 *
 * Les avis affichés sont les mêmes sur toutes les villes MAIS le texte
 * SANS balisage empêche que Google interprète ça comme du "site avec
 * 3 avis répétés partout" — c'est un simple contenu témoignage éditorial.
 */

type Props = {
  /** Titre custom (par défaut : "Ce que disent nos clients") */
  heading?: string
  /** Message contextuel court sous le titre */
  intro?: string
}

export function CityReviews({
  heading = 'Ce que disent nos clients',
  intro,
}: Props) {
  return (
    <section className="bg-ivory-dark border-y border-line py-14 md:py-20">
      <div className="container max-w-6xl">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-1 text-gold mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-current"
                  strokeWidth={0}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="eyebrow">Avis vérifiés Google</p>
            <h2 className="font-serif text-h1 mt-3">{heading}</h2>
            <div className="gold-divider mx-auto mt-6" />
            {intro && (
              <p className="mt-6 text-ink-soft leading-relaxed">{intro}</p>
            )}
          </div>
        </Reveal>

        {/*
          data-nosnippet : Google et les autres crawlers ne pourront pas
          extraire le texte des avis pour l'utiliser comme snippet SERP.
          Empêche que le résultat de recherche affiche à ta place une
          citation d'avis client à la place du meta description choisi.
        */}
        <div
          data-nosnippet
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {GOOGLE_REVIEWS.map((review, i) => (
            <Reveal key={review.author} delay={i * 80}>
              <article className="bg-ivory border border-line p-6 md:p-7 h-full flex flex-col">
                <Quote className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <p className="mt-4 text-ink-soft leading-relaxed italic flex-1">
                  « {review.text} »
                </p>
                <footer className="mt-5 pt-5 border-t border-line">
                  <p className="font-serif text-base text-ink">{review.author}</p>
                  <p className="text-xs text-ink-mute mt-1">
                    ★★★★★ &nbsp;·&nbsp; {review.context}
                  </p>
                </footer>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gold-dark hover:text-gold underline underline-offset-2"
          >
            Voir tous les avis Google
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}
