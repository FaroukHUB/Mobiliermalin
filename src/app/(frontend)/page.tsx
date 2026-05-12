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
import { SHOP_URL } from '@/lib/config'
import { getHeroSlides, getSiteSettings, urlFor, type SanityImage } from '@/lib/sanity'

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

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: "Du mobilier de bureau d'exception, à −60 %",
    subtitle:
      'Steelcase, Herman Miller, Haworth, Vitra. Pièces signées, restaurées avec exigence, garanties 6 mois.',
    image: {
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
      alt: 'Open-space moderne avec mobilier de bureau premium',
    },
    ctaPrimaryLabel: 'Voir le catalogue',
    ctaPrimaryHref: SHOP_URL,
    ctaSecondaryLabel: 'Vidage de locaux',
    ctaSecondaryHref: '/vidage-de-locaux',
    textPosition: 'left',
    textColor: 'light',
    overlayOpacity: 40,
  },
  {
    id: 'slide-2',
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

function sanityImageToMedia(image?: SanityImage, alt?: string): { url: string; alt?: string } | undefined {
  if (!image) return undefined
  return { url: urlFor(image).width(2000).url(), alt: image.alt || alt }
}

export default async function HomePage() {
  const [sanitySlides, settings] = await Promise.all([
    getHeroSlides(),
    getSiteSettings(),
  ])

  const slides: HeroSlide[] = sanitySlides.length
    ? sanitySlides.map((s) => ({
        id: s._id,
        title: s.title,
        subtitle: s.subtitle,
        image: { url: urlFor(s.image).width(2000).url(), alt: s.image.alt || s.title },
        imageMobile: s.imageMobile
          ? { url: urlFor(s.imageMobile).width(1000).url(), alt: s.imageMobile.alt || s.title }
          : undefined,
        ctaPrimaryLabel: s.ctaPrimaryLabel,
        ctaPrimaryHref: s.ctaPrimaryHref,
        ctaSecondaryLabel: s.ctaSecondaryLabel,
        ctaSecondaryHref: s.ctaSecondaryHref,
        textPosition: s.textPosition,
        textColor: s.textColor,
        overlayOpacity: s.overlayOpacity,
      }))
    : FALLBACK_SLIDES

  return (
    <>
      <HeroSlider slides={slides} />
      <ReassuranceBar />
      <ManifesteSection image={sanityImageToMedia(settings.manifesteImage, 'Notre manifeste')} />
      <BrandsSection />
      <CategoriesGrid />
      <LLDSection image={sanityImageToMedia(settings.lldSectionImage, 'Location longue durée')} />
      <RSESection />
      <ServicesSection />
      <ProcessSection />
      <ShowroomSection image={sanityImageToMedia(settings.showroomImage, 'Showroom Aubagne')} />
      <ImpactSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
