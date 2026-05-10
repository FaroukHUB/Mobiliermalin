'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type HeroSlide = {
  id: string | number
  title: string
  subtitle?: string
  image: { url: string; alt?: string; width?: number; height?: number }
  imageMobile?: { url: string; alt?: string; width?: number; height?: number }
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  textPosition?: 'left' | 'center' | 'right'
  textColor?: 'light' | 'dark'
  overlayOpacity?: number
}

interface HeroSliderProps {
  slides: HeroSlide[]
  autoplayDelay?: number
}

export function HeroSlider({ slides, autoplayDelay = 6000 }: HeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: false },
    [
      Autoplay({
        delay: autoplayDelay,
        // L'autoplay reprend apres une interaction (clic / swipe).
        // Sinon il s'arretait definitivement, ce qui donnait l'impression
        // que le slider "n'etait pas automatique".
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        playOnInit: true,
      }),
    ],
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  if (!slides.length) return null

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Mises en avant"
      className="relative w-full"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <SlideItem key={slide.id} slide={slide} isFirst={index === 0} />
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Slide précédente"
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center bg-ivory/80 backdrop-blur hover:bg-gold text-ink transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Slide suivante"
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center bg-ivory/80 backdrop-blur hover:bg-gold text-ink transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Aller à la slide ${i + 1}`}
                aria-current={i === selectedIndex}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === selectedIndex ? 'w-10 bg-gold' : 'w-2 bg-ivory/60 hover:bg-ivory',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function SlideItem({ slide, isFirst }: { slide: HeroSlide; isFirst: boolean }) {
  const position = slide.textPosition || 'left'
  const positionClass = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[position]

  const textColorClass = slide.textColor === 'dark' ? 'text-ink' : 'text-ivory'
  const overlay = Math.min(80, Math.max(0, slide.overlayOpacity ?? 35)) / 100
  const TitleTag = isFirst ? 'h1' : 'h2'

  // Gradient directionnel : sombre du cote du texte, transparent de l'autre cote.
  // Pour textColor=light on assombrit, pour textColor=dark on eclaircit.
  const overlayBase = slide.textColor === 'dark' ? '255, 255, 255' : '26, 26, 26'
  const a1 = overlay
  const a2 = overlay * 0.7
  const a3 = overlay * 0.35
  const overlayGradient =
    position === 'right'
      ? `linear-gradient(to left, rgba(${overlayBase}, ${a1}) 0%, rgba(${overlayBase}, ${a2}) 30%, rgba(${overlayBase}, ${a3}) 55%, rgba(${overlayBase}, 0) 75%)`
      : position === 'center'
        ? `linear-gradient(to bottom, rgba(${overlayBase}, ${a3}) 0%, rgba(${overlayBase}, ${a1}) 100%)`
        : `linear-gradient(to right, rgba(${overlayBase}, ${a1}) 0%, rgba(${overlayBase}, ${a2}) 30%, rgba(${overlayBase}, ${a3}) 55%, rgba(${overlayBase}, 0) 75%)`

  return (
    <div className="relative flex-[0_0_100%] min-w-0">
      <div className="relative h-[68vh] min-h-[480px] max-h-[820px] w-full">
        {slide.imageMobile && (
          <Image
            src={slide.imageMobile.url}
            alt={slide.imageMobile.alt || slide.title}
            fill
            priority={isFirst}
            sizes="100vw"
            className="object-cover md:hidden"
          />
        )}
        <Image
          src={slide.image.url}
          alt={slide.image.alt || slide.title}
          fill
          priority={isFirst}
          sizes="100vw"
          className={cn('object-cover', slide.imageMobile && 'hidden md:block')}
        />

        <div
          className="absolute inset-0"
          style={{ background: overlayGradient }}
          aria-hidden
        />

        <div className="relative z-10 h-full container">
          <div className={cn('flex flex-col justify-center h-full max-w-2xl gap-6', positionClass, textColorClass)}>
            <p
              className={cn(
                'eyebrow',
                slide.textColor === 'dark' ? 'text-gold-dark' : 'text-gold',
              )}
            >
              Mobilier Malin
            </p>
            <TitleTag className={cn('text-display-xl font-serif', textColorClass)}>
              {slide.title}
            </TitleTag>
            {slide.subtitle && (
              <p className={cn('text-base md:text-lg max-w-xl', slide.textColor === 'dark' ? 'text-ink/80' : 'text-ivory/90')}>
                {slide.subtitle}
              </p>
            )}
            {(slide.ctaPrimaryLabel || slide.ctaSecondaryLabel) && (
              <div className="flex flex-wrap gap-3 pt-2">
                {slide.ctaPrimaryLabel && slide.ctaPrimaryHref && (
                  <Link href={slide.ctaPrimaryHref} className="btn-gold">
                    {slide.ctaPrimaryLabel}
                  </Link>
                )}
                {slide.ctaSecondaryLabel && slide.ctaSecondaryHref && (
                  <Link
                    href={slide.ctaSecondaryHref}
                    className={slide.textColor === 'dark' ? 'btn-outline' : 'btn-outline-light'}
                  >
                    {slide.ctaSecondaryLabel}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
