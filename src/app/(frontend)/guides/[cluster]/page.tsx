import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock } from 'lucide-react'
import {
  getGuideClusterBySlug,
  getGuideArticlesByClusterSlug,
} from '@/lib/sanity-guides'
import { urlFor } from '@/lib/sanity'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { guideClusterBreadcrumb } from '@/lib/breadcrumbs'

export const revalidate = 60
export const dynamicParams = true

type Params = { cluster: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { cluster } = await params
  const c = await getGuideClusterBySlug(cluster)
  if (!c) return { title: 'Cluster introuvable' }

  const title = c.seo?.metaTitle || `${c.name} — Guides Mobilier Malin`
  const description =
    c.seo?.metaDescription ||
    c.tagline ||
    `Tous nos guides et conseils sur "${c.name}" pour bien choisir votre mobilier de bureau reconditionné.`

  return {
    title,
    description,
    alternates: { canonical: `/guides/${cluster}` },
    ...(c.seo?.noIndex && { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default async function ClusterHubPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { cluster } = await params
  const [c, articles] = await Promise.all([
    getGuideClusterBySlug(cluster),
    getGuideArticlesByClusterSlug(cluster),
  ])
  if (!c) notFound()

  const heroImageUrl = c.image ? urlFor(c.image).width(1600).height(800).fit('crop').url() : null

  return (
    <>
      <Breadcrumbs items={guideClusterBreadcrumb(c)} />

      <section className="container py-10 md:py-16 max-w-4xl text-center">
        <p className="eyebrow">Cluster de guides</p>
        <h1 className="text-display font-serif mt-3 leading-tight">{c.name}</h1>
        <div className="gold-divider mx-auto mt-6" />
        {c.tagline && (
          <p className="mt-6 text-lg text-ink-soft leading-relaxed">
            {c.tagline}
          </p>
        )}
        {c.description && (
          <div className="mt-6 text-ink-soft leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
            {c.description}
          </div>
        )}
      </section>

      {heroImageUrl && (
        <section className="container max-w-5xl">
          <div className="relative aspect-[16/8] bg-ivory-dark overflow-hidden">
            <Image
              src={heroImageUrl}
              alt={c.name}
              fill
              priority
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
            />
          </div>
        </section>
      )}

      <section className="container py-14 md:py-20 max-w-6xl">
        <h2 className="font-serif text-2xl md:text-3xl text-ink text-center mb-10">
          {articles.length > 0
            ? `${articles.length} article${articles.length > 1 ? 's' : ''} dans ce cluster`
            : 'Articles à venir'}
        </h2>

        {articles.length === 0 ? (
          <div className="text-center text-ink-mute py-14">
            <p>Les premiers articles de ce cluster arrivent bientôt.</p>
            <Link href="/guides" className="btn-outline mt-6 inline-flex">
              ← Retour aux guides
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {articles.map((article) => {
              const imgUrl = article.heroImage
                ? urlFor(article.heroImage).width(800).height(500).fit('crop').url()
                : null
              return (
                <Link
                  key={article._id}
                  href={`/guides/${c.slug.current}/${article.slug.current}`}
                  className="group flex flex-col bg-ivory border border-line hover:border-gold transition-colors overflow-hidden"
                >
                  {imgUrl && (
                    <div className="relative aspect-[16/10] bg-ivory-dark overflow-hidden">
                      <Image
                        src={imgUrl}
                        alt={article.heroImage?.alt || article.title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-serif text-lg md:text-xl text-ink group-hover:text-gold-dark transition-colors leading-snug">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-ink-mute">
                      {article.readingTimeMinutes && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={1.5} />
                          {article.readingTimeMinutes} min
                        </span>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1 text-gold-dark uppercase tracking-widest font-medium">
                        Lire
                        <ArrowRight
                          className="h-3 w-3 transition-transform group-hover:translate-x-1"
                          strokeWidth={1.5}
                        />
                      </span>
                    </div>
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
