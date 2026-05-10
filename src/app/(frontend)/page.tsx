import type { Metadata } from 'next'
import { HeroSlider, type HeroSlide } from '@/components/HeroSlider'
import { ReassuranceBar } from '@/components/sections/ReassuranceBar'
import { ManifesteSection } from '@/components/sections/ManifesteSection'
import { BrandsSection } from '@/components/sections/BrandsSection'
import { CategoriesGrid } from '@/components/sections/CategoriesGrid'
import { LLDSection } from '@/components/sections/LLDSection'
import { RSESection } from '@/components/sections/RSESection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { ShowroomSection } from '@/components/sections/ShowroomSection'
import { ImpactSection } from '@/components/sections/ImpactSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { NewsletterSection } from '@/components/sections/NewsletterSection'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Mobilier de bureau d\'exception, à −60 % du prix neuf',
  description:
    'Steelcase, Herman Miller, Haworth, Vitra reconditionnés. Achat, location longue durée, vidage de locaux. Garanti 6 mois, attestation RSE. Marseille, Aubagne, Aix-en-Provence et toute la France.',
  alternates: { canonical: '/' },
  keywords: [
    'mobilier bureau reconditionné',
    'mobilier bureau occasion',
    'location longue durée mobilier bureau',
    'fauteuil ergonomique reconditionné',
    'Steelcase occasion',
    'Herman Miller reconditionné',
    'Haworth occasion',
    'Vitra reconditionné',
    'attestation RSE mobilier',
    'économie circulaire bureau',
    'mobilier bureau Marseille',
    'mobilier bureau Aubagne',
    'mobilier bureau Aix-en-Provence',
    'vidage locaux professionnels',
    'rachat mobilier entreprise',
    'loi AGEC mobilier',
  ],
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
      'Steelcase, Herman Miller, Haworth, Vitra. Pièces signées, restaurées avec exigence, garanties 6 mois.',
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
  {
    id: 'demo-2',
    title: "La location longue durée, désormais disponible",
    subtitle:
      'Équipez vos bureaux dès aujourd\'hui. Étalez sur 36 mois. SAV inclus.',
    image: {
      url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&q=80',
      alt: 'Bureau aménagé pour le travail moderne',
    },
    ctaPrimaryLabel: 'Découvrir l\'offre LLD',
    ctaPrimaryHref: '/location-mobilier-bureau',
    ctaSecondaryLabel: 'Demander un devis',
    ctaSecondaryHref: '/contact',
    textPosition: 'left',
    textColor: 'light',
    overlayOpacity: 45,
  },
]

export default async function HomePage() {
  const fromDb = await getHeroSlides()
  const slides = fromDb.length > 0 ? fromDb : FALLBACK_SLIDES

  return (
    <>
      <HeroSlider slides={slides} />
      <ReassuranceBar />
      <ManifesteSection />
      <BrandsSection />
      <CategoriesGrid />
      <LLDSection />
      <RSESection />
      <ServicesSection />
      <ProcessSection />
      <ShowroomSection />
      <ImpactSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
