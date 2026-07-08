import type { Metadata } from 'next'
import { HeroSlider, type HeroSlide } from '@/components/HeroSlider'
import { ReassuranceBar } from '@/components/sections/ReassuranceBar'
import { ManifesteSection } from '@/components/sections/ManifesteSection'
import { BrandsSection } from '@/components/sections/BrandsSection'
import { CategoriesGrid } from '@/components/sections/CategoriesGrid'
import { FeaturedProducts } from '@/components/sections/FeaturedProducts'
import { ExceptionPieces } from '@/components/sections/ExceptionPieces'
import { LLDSection } from '@/components/sections/LLDSection'
import { RSESection } from '@/components/sections/RSESection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { ShowroomSection } from '@/components/sections/ShowroomSection'
import { ImpactSection } from '@/components/sections/ImpactSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { BlogSection } from '@/components/sections/BlogSection'
import { NewsletterSection } from '@/components/sections/NewsletterSection'
import { SHOP_URL } from '@/lib/config'
import { getHeroSlides, getSiteSettings, getTopLevelCategories, getFeaturedProducts, getExceptionProducts, urlFor, type SanityImage } from '@/lib/sanity'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Mobilier de bureau d\'occasion reconditionné — Mobilier Malin',
  description:
    'Mobilier de bureau d\'occasion reconditionné : Steelcase, Herman Miller, Haworth, Vitra. Atelier & showroom à La Penne-sur-Huveaune, contrôle qualité 7 points, livraison Marseille & PACA.',
  alternates: { canonical: '/' },
  keywords: [
    'mobilier de bureau d\'occasion',
    'mobilier bureau reconditionné',
    'mobilier bureau occasion Marseille',
    'mobilier bureau Aubagne',
    'meuble occasion Marseille',
    'bureau occasion',
    'fauteuil bureau occasion',
    'fauteuil ergonomique reconditionné',
    'Steelcase occasion',
    'Herman Miller reconditionné',
    'Haworth occasion',
    'Vitra reconditionné',
    'ICF occasion',
    'Zuco reconditionné',
    'Actiu occasion',
    'Urban Mesh reconditionné',
    'mobilier professionnel Marseille',
    'mobilier bureau Aix-en-Provence',
    'location longue durée mobilier bureau',
    'rachat mobilier entreprise',
    'vidage locaux professionnels',
    'attestation RSE mobilier',
    'loi AGEC mobilier',
  ],
}

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: "Du mobilier de bureau d'exception, à −60 %",
    subtitle:
      'Steelcase, Herman Miller, Haworth, Vitra. Pièces signées, restaurées avec exigence dans notre atelier local.',
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
  const [sanitySlides, settings, sanityCategories, featuredProducts, exceptionProducts] = await Promise.all([
    getHeroSlides(),
    getSiteSettings(),
    getTopLevelCategories(),
    getFeaturedProducts(8),
    getExceptionProducts(3),
  ])

  const slides: HeroSlide[] = sanitySlides.length
    ? sanitySlides.map((s) => ({
        id: s._id,
        title: s.title,
        subtitle: s.subtitle,
        // .fit('crop') active le hotspot défini dans Sanity :
        // même quand on crop en format paysage large (desktop) ou
        // portrait haut (mobile), la zone focale choisie par Djamel
        // reste visible au centre du cadrage.
        image: {
          url: urlFor(s.image).width(2560).height(1000).fit('crop').url(),
          alt: s.image.alt || s.title,
        },
        // Si Djamel n'a PAS uploadé une image mobile dédiée, on
        // recadre automatiquement l'image desktop en portrait
        // (800×1000) autour du hotspot — la zone importante reste
        // toujours visible sur téléphone.
        imageMobile: s.imageMobile
          ? {
              url: urlFor(s.imageMobile).width(800).height(1000).fit('crop').url(),
              alt: s.imageMobile.alt || s.title,
            }
          : {
              url: urlFor(s.image).width(800).height(1000).fit('crop').url(),
              alt: s.image.alt || s.title,
            },
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
      <FeaturedProducts products={featuredProducts} />
      <ReassuranceBar />
      <ManifesteSection image={sanityImageToMedia(settings.manifesteImage, 'Notre manifeste')} />
      <BrandsSection />
      <ExceptionPieces products={exceptionProducts} />
      <CategoriesGrid categories={sanityCategories} />
      <LLDSection image={sanityImageToMedia(settings.lldSectionImage, 'Location longue durée')} />
      <RSESection />
      <ServicesSection />
      <ProcessSection />
      <ShowroomSection image={sanityImageToMedia(settings.showroomImage, 'Showroom Aubagne')} />
      <ImpactSection />
      <TestimonialsSection />
      <BlogSection />
      <NewsletterSection />
    </>
  )
}
