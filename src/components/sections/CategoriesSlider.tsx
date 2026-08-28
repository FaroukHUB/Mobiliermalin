'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Carrousel horizontal des catégories — une seule ligne.
 *
 * Défilement natif : molette horizontale, glissement tactile, et
 * flèches sur les écrans larges. Les flèches se désactivent aux
 * extrémités plutôt que de disparaître, pour éviter le déplacement
 * des éléments autour.
 *
 * L'accroche par point (scroll-snap) aligne toujours une carte sur le
 * bord gauche : pas de vignette coupée en début de piste.
 */

export type SliderCategory = {
  slug: string
  label: string
  href: string
  fromPrice: string
  image: string
  imageAlt: string
}

export function CategoriesSlider({ items }: { items: SliderCategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateEdges()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [updateEdges])

  const scrollBy = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    // Un peu moins que la largeur visible : on garde une carte de repère.
    el.scrollBy({ left: direction * (el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Flèches — écrans larges uniquement, le tactile suffit ailleurs */}
      <div className="absolute -top-14 right-0 hidden items-center gap-2 md:flex">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={atStart}
          aria-label="Catégories précédentes"
          className="flex h-10 w-10 items-center justify-center border border-line bg-ivory-light text-ink transition-colors hover:border-gold hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          disabled={atEnd}
          aria-label="Catégories suivantes"
          className="flex h-10 w-10 items-center justify-center border border-line bg-ivory-light text-ink transition-colors hover:border-gold hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-ink"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {/* Fondu à droite : suggère qu'il reste des catégories à voir */}
      {!atEnd && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 md:w-20"
          style={{
            background: 'linear-gradient(270deg, #FAF9F6, rgba(250,249,246,0))',
          }}
          aria-hidden="true"
        />
      )}

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 md:gap-4"
      >
        {items.map((c) => (
          <Link
            key={c.slug}
            href={c.href}
            className="group block w-[46%] shrink-0 snap-start border border-line bg-ivory-light transition-colors duration-300 hover:border-gold sm:w-[31%] lg:w-[19%]"
          >
            <div className="relative aspect-square overflow-hidden bg-ivory-dark">
              <Image
                src={c.image}
                alt={c.imageAlt}
                fill
                sizes="(min-width: 1024px) 19vw, (min-width: 640px) 31vw, 46vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center bg-ivory opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4 text-ink" strokeWidth={1.5} />
              </div>
            </div>
            <div className="p-4 md:p-5">
              <p className="text-[0.7rem] font-medium uppercase tracking-widest text-gold-dark">
                {c.fromPrice}
              </p>
              <h3 className="mt-1.5 font-serif text-base leading-tight text-ink md:text-lg">
                {c.label}
              </h3>
            </div>
          </Link>
        ))}

        {/* Dernière carte : accès au catalogue complet */}
        <Link
          href="/boutique"
          className="group flex w-[46%] shrink-0 snap-start flex-col border border-ink bg-ink text-ivory transition-colors duration-300 hover:border-gold-dark hover:bg-gold-dark sm:w-[31%] lg:w-[19%]"
        >
          <div className="flex aspect-square items-center justify-center">
            <ArrowRight
              className="h-10 w-10 text-gold transition group-hover:translate-x-1 group-hover:text-ivory"
              strokeWidth={1.25}
            />
          </div>
          <div className="mt-auto p-4 md:p-5">
            <p className="text-[0.7rem] font-medium uppercase tracking-widest text-gold group-hover:text-ivory">
              Catalogue complet
            </p>
            <h3 className="mt-1.5 font-serif text-base leading-tight text-ivory md:text-lg">
              Voir tous nos produits
            </h3>
          </div>
        </Link>
      </div>
    </div>
  )
}
