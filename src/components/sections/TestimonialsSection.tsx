'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Testimonial = {
  author: string
  role?: string
  date?: string
  rating: number
  text: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    author: 'Anaïs N.',
    role: 'Local Guide · Google',
    date: 'Mars 2025',
    rating: 5,
    text:
      "Super achat. Les meubles sont beaux, solides et confortables. C'est exactement ce qu'il me fallait pour mon coin bureau. Foncez !",
  },
  {
    author: 'Shanya K.',
    date: 'Avril 2025',
    rating: 5,
    text:
      'Très satisfaite de mon achat : excellent rapport qualité/prix et matériel en très bon état. Équipe accueillante et professionnelle, livraison rapide et efficace. Je recommande !',
  },
  {
    author: 'Nelia L.',
    date: 'Mai 2025',
    rating: 5,
    text:
      'Excellent ! Accueil chaleureux, service professionnel et de qualité. Une très bonne expérience, je recommande sans hésiter.',
  },
  {
    author: 'Hafid S.',
    date: 'Août 2025',
    rating: 5,
    text:
      "J'ai équipé mes bureaux avec Mobilier Malin, ce qui m'a permis de réaliser de belles économies pour un matériel de qualité. Super accueil de l'équipe.",
  },
  {
    author: 'Sirine M.',
    role: 'Local Guide · Google',
    date: '2025',
    rating: 5,
    text:
      'Matériel professionnel juste incroyable, les prix sont très attractifs et le vendeur vraiment au top. Petit message aussi pour les livreurs qui ont été au top.',
  },
  {
    author: 'Carlos P.',
    date: 'Octobre 2024',
    rating: 5,
    text:
      "Super expérience. Vendeur et équipe de logistique au top. J'ai trouvé bureaux, fauteuils, armoires, caissons du premier coup. Merci pour les petits cadeaux et la livraison rapide !",
  },
  {
    author: 'Hmz B.',
    date: 'Octobre 2024',
    rating: 5,
    text:
      "Acheté bureaux, chaises, armoires, caissons à très bon prix. Bon accueil et réactif pour la livraison. Merci l'équipe, à très bientôt !",
  },
]

export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', containScroll: 'trimSnaps' },
    [Autoplay({ delay: 7000, stopOnInteraction: true, stopOnMouseEnter: true })],
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section className="container py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="eyebrow">Avis Google vérifiés</p>
        <h2 className="text-display mt-3 font-serif">
          Ce que disent nos clients
        </h2>
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-gold text-gold" />
          ))}
          <span className="ml-2 text-sm text-ink-mute">
            <strong className="text-ink">5,0</strong> sur Google · Plus de 9 avis
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-3"
              >
                <article className="bg-ivory-light border border-line p-8 h-full flex flex-col">
                  <Quote className="h-6 w-6 text-gold mb-4" strokeWidth={1.5} />
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star key={k} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed flex-1">
                    « {t.text} »
                  </p>
                  <div className="mt-6 pt-6 border-t border-line">
                    <p className="font-serif text-base text-ink">{t.author}</p>
                    {(t.role || t.date) && (
                      <p className="text-xs text-ink-mute mt-1">
                        {[t.role, t.date].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {scrollSnaps.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Avis précédent"
              className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center bg-ivory border border-line hover:border-gold hover:text-gold-dark transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Avis suivant"
              className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center bg-ivory border border-line hover:border-gold hover:text-gold-dark transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="flex justify-center items-center gap-2 mt-8">
              {scrollSnaps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Aller au groupe ${i + 1}`}
                  aria-current={i === selectedIndex}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === selectedIndex ? 'w-8 bg-gold' : 'w-2 bg-line hover:bg-ink-mute',
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
