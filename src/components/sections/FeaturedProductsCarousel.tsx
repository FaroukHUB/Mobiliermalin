'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'

interface FeaturedProductsCarouselProps {
  cards: ProductCardData[]
}

/**
 * Carousel horizontal avec "peek effect".
 * - Mobile : 1.5 carte (60 % par carte, 1 pleine + 1/2 qui dépasse)
 * - Tablet (md) : 2.5 cartes (40 % par carte)
 * - Desktop (≥ lg) : 3 cartes pleines + ~1/2 qui dépasse (≈30 % par carte)
 *
 * Flèches gauche/droite désactivées en début/fin de course.
 */
export function FeaturedProductsCarousel({ cards }: FeaturedProductsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: false,
    slidesToScroll: 1,
    skipSnaps: false,
    containScroll: 'trimSnaps',
  })

  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const onScroll = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onScroll()
    emblaApi.on('select', onScroll)
    emblaApi.on('reInit', onScroll)
    return () => {
      emblaApi.off('select', onScroll)
      emblaApi.off('reInit', onScroll)
    }
  }, [emblaApi, onScroll])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div className="relative">
      {/* Viewport */}
      <div className="overflow-hidden -mx-3 md:-mx-4" ref={emblaRef}>
        <div className="flex">
          {cards.map((card) => (
            <div
              key={card.id}
              className="shrink-0 basis-1/2 md:basis-1/3 lg:basis-1/4 px-2 md:px-3"
            >
              <ProductCard product={card} />
            </div>
          ))}
        </div>
      </div>

      {/* Boutons navigation */}
      <button
        type="button"
        onClick={scrollPrev}
        disabled={!canPrev}
        className="hidden md:flex absolute -left-2 lg:-left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-ivory shadow-md border border-line items-center justify-center text-ink hover:border-gold hover:text-gold-dark transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-ink"
        aria-label="Précédent"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        disabled={!canNext}
        className="hidden md:flex absolute -right-2 lg:-right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-ivory shadow-md border border-line items-center justify-center text-ink hover:border-gold hover:text-gold-dark transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-ink"
        aria-label="Suivant"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* Indicateur swipe mobile */}
      <p className="md:hidden text-center text-xs text-ink-mute mt-4">
        ← Faites glisser pour voir plus →
      </p>
    </div>
  )
}
