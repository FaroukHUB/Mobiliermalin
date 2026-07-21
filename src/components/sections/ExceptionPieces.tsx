import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { urlFor, type SanityProduct } from '@/lib/sanity'
import { formatPrice } from '@/lib/utils'

interface ExceptionPiecesProps {
  products: SanityProduct[]
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  excellent: 'Excellent état',
  'very-good': 'Très bon état',
  good: 'Bon état',
  fair: 'État correct',
}

/**
 * Section premium "Pièces d'exception" sur la home.
 * Fond sombre, cartes ivoires en relief, 3 produits maximum.
 * Pour le mobilier rare, signature, prix élevés.
 *
 * Auto-cachée si aucun produit n'a le toggle "Pièce d'exception".
 */
export function ExceptionPieces({ products }: ExceptionPiecesProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="bg-ink text-ivory relative overflow-hidden">
      {/* Effet d'éclairage discret en haut */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />

      <div className="container relative py-20 md:py-28">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-[0.25em]">
              <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
              Sélection signature
              <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
            </div>
            <h2 className="text-display mt-5 font-serif text-ivory leading-[1.1]">
              Nos pièces d&apos;exception
            </h2>
            <div className="h-px w-16 bg-gold mx-auto mt-7" />
            <p className="mt-7 text-ivory/70 leading-relaxed">
              Modèles iconiques, éditions limitées, pièces de collection.
              Chaque mois, quelques raretés passent par notre atelier —
              celles qu&apos;on prend le temps de présenter une par une.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {products.map((p, i) => {
            const firstImage = p.images?.[0]
            const imageUrl = firstImage?.asset
              ? urlFor(firstImage).width(900).height(1100).fit('crop').url()
              : null
            const conditionLabel = p.condition ? CONDITION_LABELS[p.condition] : null
            return (
              <Reveal key={p._id} delay={i * 100}>
                <Link
                  href={`/produit/${p.slug.current}`}
                  className="group block bg-ivory text-ink border border-gold/30 hover:border-gold transition-colors duration-500 relative"
                >
                  {/* Image (4:5 portrait) */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-ivory-dark">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={firstImage?.alt || p.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-ink-mute/40 text-xs uppercase tracking-widest">
                        Photo à venir
                      </div>
                    )}

                    {/* Badge "Exception" en haut à gauche */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-ink text-gold px-3 py-1.5 text-[0.65rem] uppercase tracking-widest">
                      <Star className="h-3 w-3" strokeWidth={1.5} />
                      Exception
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="p-6">
                    {(p.brand || conditionLabel) && (
                      <p className="text-[0.65rem] uppercase tracking-widest text-gold-dark font-medium">
                        {[p.brand, conditionLabel].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <h3 className="font-serif text-xl text-ink mt-2 leading-snug line-clamp-2 group-hover:text-gold-dark transition">
                      {p.name}
                    </h3>
                    {p.shortDescription && (
                      <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-2">
                        {p.shortDescription}
                      </p>
                    )}
                    <div className="mt-5 pt-5 border-t border-line flex items-baseline justify-between">
                      <span
                        className={`font-serif text-2xl ${
                          p.salePrice && p.salePrice < p.price ? 'text-promo' : 'text-ink'
                        }`}
                      >
                        {formatPrice(p.salePrice && p.salePrice < p.price ? p.salePrice : p.price)}
                        <span className="ml-1 text-[0.5em] font-sans tracking-wider opacity-60 align-baseline uppercase">
                          TTC
                        </span>
                      </span>
                      <span className="text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                        Découvrir <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>

        <Reveal>
          <p className="mt-12 text-center text-xs uppercase tracking-widest text-ivory/40">
            Pièces uniques — disponibilité en temps réel sur les fiches produit
          </p>
        </Reveal>
      </div>
    </section>
  )
}
