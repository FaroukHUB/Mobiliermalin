import type { Metadata } from 'next'
import { HeroSlider, type HeroSlide } from '@/components/HeroSlider'
import { ReassuranceBar } from '@/components/sections/ReassuranceBar'
import { CategoriesGrid } from '@/components/sections/CategoriesGrid'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { ImpactSection } from '@/components/sections/ImpactSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Mobilier de bureau d\'exception, à −60 % du prix neuf',
  description:
    'Steelcase, Herman Miller, Haworth, Vitra. Mobilier de bureau reconditionné premium, garanti 6 mois. Livraison Marseille, Aubagne, Aix-en-Provence et toute la France.',
  alternates: { canonical: '/' },
}

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const payload = await getPayloadClient()
    const now = new Date().toISOString()
    const result = await payload.find({
      collection: 'hero-slides',
      where: {
        and: [
          { status: { equals: 'published' } },
          {
            or: [
              { startsAt: { exists: false } },
              { startsAt: { less_than_equal: now } },
            ],
          },
          {
            or: [
              { endsAt: { exists: false } },
              { endsAt: { greater_than_equal: now } },
            ],
          },
        ],
      },
      sort: 'order',
      depth: 2,
      limit: 10,
    })

    return result.docs
      .map((raw): HeroSlide | null => {
        const doc = raw as unknown as {
          id: string | number
          title: string
          subtitle?: string
          image?: { url?: string; alt?: string }
          imageMobile?: { url?: string; alt?: string }
          ctaPrimaryLabel?: string
          ctaPrimaryHref?: string
          ctaSecondaryLabel?: string
          ctaSecondaryHref?: string
          textPosition?: HeroSlide['textPosition']
          textColor?: HeroSlide['textColor']
          overlayOpacity?: number
        }
        if (!doc.image?.url) return null
        return {
          id: String(doc.id),
          title: doc.title,
          subtitle: doc.subtitle,
          image: { url: doc.image.url, alt: doc.image.alt },
          imageMobile: doc.imageMobile?.url
            ? { url: doc.imageMobile.url, alt: doc.imageMobile.alt }
            : undefined,
          ctaPrimaryLabel: doc.ctaPrimaryLabel,
          ctaPrimaryHref: doc.ctaPrimaryHref,
          ctaSecondaryLabel: doc.ctaSecondaryLabel,
          ctaSecondaryHref: doc.ctaSecondaryHref,
          textPosition: doc.textPosition,
          textColor: doc.textColor,
          overlayOpacity: doc.overlayOpacity,
        }
      })
      .filter((s): s is HeroSlide => s !== null)
  } catch (err) {
    console.warn('[hero] fallback demo slides:', err)
    return []
  }
}

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'demo-1',
    title: "Du mobilier de bureau d'exception, à −60 %",
    subtitle:
      'Steelcase, Herman Miller, Haworth, Vitra. Pièces signées, restaurées avec exigence et garanties 6 mois.',
    image: {
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
      alt: 'Open-space moderne avec mobilier de bureau premium',
    },
    ctaPrimaryLabel: 'Voir le catalogue',
    ctaPrimaryHref: '/boutique',
    ctaSecondaryLabel: 'Vidage de locaux',
    ctaSecondaryHref: '/vidage-de-locaux',
    textPosition: 'left',
    textColor: 'light',
    overlayOpacity: 40,
  },
]

export default async function HomePage() {
  const fromDb = await getHeroSlides()
  const slides = fromDb.length > 0 ? fromDb : FALLBACK_SLIDES

  return (
    <>
      <HeroSlider slides={slides} />
      <ReassuranceBar />
      <ServicesSection />
      <CategoriesGrid />
      <ImpactSection />
      <TestimonialsSection />

      {/* CTA final */}
      <section className="bg-ink text-ivory">
        <div className="container py-20 md:py-28 text-center max-w-3xl mx-auto">
          <p className="eyebrow text-gold">Parlons de votre projet</p>
          <h2 className="text-display mt-3 font-serif text-ivory">
            Acheter, vider, ou les deux ?
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/70 leading-relaxed">
            Décrivez-nous votre besoin : équipement de bureaux, vidage de
            locaux, conseil sur un projet d&apos;aménagement. Réponse sous 24 h
            par un humain, pas par un robot.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href="/contact" className="btn-gold">
              Demander un devis
            </a>
            <a
              href="tel:+33676617053"
              className="btn-outline-light"
            >
              06 76 61 70 53
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
