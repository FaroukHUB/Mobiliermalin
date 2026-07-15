import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen } from 'lucide-react'
import { getAllGuideClusters } from '@/lib/sanity-guides'
import { urlFor } from '@/lib/sanity'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'

export const revalidate = 60

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title:
    'Guides d\'achat & conseils — mobilier de bureau reconditionné',
  description:
    'Nos guides pratiques pour choisir, entretenir et optimiser votre mobilier de bureau professionnel reconditionné. Ergonomie, achat B2B, RSE, marques, entretien, aménagement.',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'Guides d\'achat & conseils Mobilier Malin',
    description:
      'Ergonomie, achat B2B, RSE, guides marques, entretien, aménagement d\'espaces professionnels.',
    url: `${siteUrl}/guides`,
    type: 'website',
  },
}

export default async function GuidesHubPage() {
  const clusters = await getAllGuideClusters()
  const visibleClusters = clusters.filter((c) => !c.seo?.noIndex)

  return (
    <>
      <Breadcrumbs items={[{ name: 'Guides' }]} />

      <section className="container py-12 md:py-20 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4" strokeWidth={1.5} />
            Guides Mobilier Malin
          </p>
          <h1 className="text-display font-serif mt-4 leading-tight">
            Nos guides d'achat et conseils
          </h1>
          <div className="gold-divider mx-auto mt-6" />
          <p className="mt-8 text-ink-soft leading-relaxed">
            Conseils pratiques, comparatifs de marques, guides ergonomiques
            et retours d'expérience. Que vous équipiez votre home office ou
            l'ensemble d'un plateau, vous trouverez ici la réponse à vos
            questions sur le mobilier de bureau professionnel reconditionné.
          </p>
        </div>

        {visibleClusters.length === 0 ? (
          <div className="text-center text-ink-mute py-20">
            <p>Les premiers guides arrivent très prochainement.</p>
            <Link
              href="/boutique"
              className="btn-outline mt-8 inline-flex"
            >
              Voir le catalogue en attendant
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {visibleClusters.map((cluster) => {
              const imageUrl = cluster.image
                ? urlFor(cluster.image).width(800).height(600).fit('crop').url()
                : null
              return (
                <Link
                  key={cluster._id}
                  href={`/guides/${cluster.slug.current}`}
                  className="group flex flex-col bg-ivory border border-line hover:border-gold transition-colors overflow-hidden"
                >
                  {imageUrl && (
                    <div className="relative aspect-[4/3] bg-ivory-dark overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={cluster.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="font-serif text-xl text-ink group-hover:text-gold-dark transition-colors">
                      {cluster.name}
                    </h2>
                    {cluster.tagline && (
                      <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-3">
                        {cluster.tagline}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-dark font-medium">
                      Découvrir
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        strokeWidth={1.5}
                      />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
