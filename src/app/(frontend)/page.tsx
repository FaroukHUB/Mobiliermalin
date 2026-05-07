import Link from 'next/link'
import { HeroSlider, type HeroSlide } from '@/components/HeroSlider'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 60 // ISR : régénération toutes les 60s

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
    // Pas de DB connectée en dev / env preview : fallback gracieux
    console.warn('[hero] fallback demo slides:', err)
    return []
  }
}

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: 'demo-1',
    title: "Le mobilier de bureau, autrement",
    subtitle:
      'Sélection rigoureuse de mobilier professionnel d\'occasion. Économique, écologique, sans compromis sur la qualité.',
    image: {
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
      alt: 'Bureau moderne aménagé avec mobilier de qualité',
    },
    ctaPrimaryLabel: 'Découvrir la boutique',
    ctaPrimaryHref: '/boutique',
    ctaSecondaryLabel: 'Notre démarche',
    ctaSecondaryHref: '/a-propos',
    textPosition: 'left',
    textColor: 'light',
    overlayOpacity: 35,
  },
]

export default async function HomePage() {
  const fromDb = await getHeroSlides()
  const slides = fromDb.length > 0 ? fromDb : FALLBACK_SLIDES

  return (
    <>
      <HeroSlider slides={slides} />

      {/* Bandeau de réassurance */}
      <section className="border-y border-line bg-ivory-dark">
        <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { t: 'Garantie 12 mois', s: 'Sur tout le mobilier' },
            { t: 'Livraison & installation', s: 'Partout en France' },
            { t: 'Économie circulaire', s: 'Jusqu\'à -70% vs neuf' },
            { t: 'Sélection exigeante', s: 'Contrôle qualité 7 points' },
          ].map((item) => (
            <div key={item.t}>
              <p className="font-serif text-lg text-ink">{item.t}</p>
              <p className="text-xs text-ink-mute mt-1 uppercase tracking-widest">{item.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Catégories phares */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <p className="eyebrow">Catalogue</p>
          <h2 className="text-display mt-3">Explorer par catégorie</h2>
          <div className="gold-divider mt-6" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { label: 'Bureaux', href: '/categorie/bureaux' },
            { label: 'Fauteuils', href: '/categorie/fauteuils' },
            { label: 'Rangements', href: '/categorie/rangements' },
            { label: 'Salles de réunion', href: '/categorie/salles-de-reunion' },
            { label: 'Tables basses', href: '/categorie/tables-basses' },
            { label: 'Cloisons & acoustique', href: '/categorie/cloisons' },
            { label: 'Accessoires', href: '/categorie/accessoires' },
            { label: 'Lots & open-spaces', href: '/categorie/lots' },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group aspect-[4/5] bg-ivory-light border border-line p-6 flex flex-col justify-end hover:border-gold transition"
            >
              <p className="font-serif text-xl text-ink group-hover:text-gold-dark transition">
                {c.label}
              </p>
              <p className="text-xs uppercase tracking-widest text-ink-mute mt-2">Découvrir →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Vendre votre mobilier */}
      <section className="bg-ink text-ivory">
        <div className="container py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow text-gold">Service entreprises</p>
            <h2 className="text-display font-serif text-ivory mt-3">
              Nous rachetons votre mobilier de bureau
            </h2>
            <p className="text-ivory/70 mt-4">
              Liquidation, déménagement, renouvellement de parc, déstockage : nous reprenons votre mobilier en une intervention rapide et professionnelle. Estimation gratuite sous 48h.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/vendre" className="btn-gold">
                Demander une estimation
              </Link>
              <Link href="/debarras" className="btn-outline-light">
                Service débarras
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { v: '48h', l: 'Réponse devis' },
              { v: '7 j/7', l: 'Intervention' },
              { v: 'France', l: 'Couverture' },
            ].map((s) => (
              <div key={s.l} className="border border-ivory/20 p-6">
                <p className="font-serif text-3xl text-gold">{s.v}</p>
                <p className="text-xs uppercase tracking-widest text-ivory/60 mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
