import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import { BLOG_ARTICLES } from '@/lib/blog-articles'
import { getFeaturedBlogPosts, categoryLabel, estimateReadMinutes } from '@/lib/sanity-blog'
import { urlFor } from '@/lib/sanity'

const FR_DATE = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

type Card = {
  slug: string
  title: string
  excerpt: string
  category: string
  heroImage: string
  heroImageAlt: string
  publishedAt: string
  readMinutes: number
}

/**
 * Section blog affichée sur la home entre les autres sections.
 * Priorité aux articles Sanity ; fallback sur les articles hardcodés
 * quand Sanity est vide ou renvoie moins de 3 posts.
 */
export async function BlogSection() {
  const sanityPosts = await getFeaturedBlogPosts(3)

  let cards: Card[] = sanityPosts.map((p) => ({
    slug: p.slug.current,
    title: p.title,
    excerpt: p.excerpt || '',
    category: categoryLabel(p.category),
    heroImage: p.heroImage
      ? urlFor(p.heroImage).width(900).height(600).fit('crop').url()
      : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
    heroImageAlt: p.heroImage?.alt || p.title,
    publishedAt: p.publishedAt,
    readMinutes: estimateReadMinutes(p.body),
  }))

  // Complète avec le hardcodé si Sanity a moins de 3
  if (cards.length < 3) {
    const sanitySlugs = new Set(cards.map((c) => c.slug))
    const fallback = BLOG_ARTICLES.filter((a) => !sanitySlugs.has(a.slug))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 3 - cards.length)
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        heroImage: a.heroImage,
        heroImageAlt: a.heroImageAlt,
        publishedAt: a.publishedAt,
        readMinutes: a.readMinutes,
      }))
    cards = [...cards, ...fallback]
  }

  if (cards.length === 0) return null

  return (
    <section className="bg-ivory-dark border-y border-line">
      <div className="container py-16 md:py-24">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="eyebrow">Nos conseils</p>
              <h2 className="text-h1 mt-3 font-serif leading-[1.1]">
                Guides &amp; comparatifs sur le mobilier reconditionné
              </h2>
              <p className="mt-5 text-ink-mute leading-relaxed">
                Choisir un fauteuil ergonomique, comprendre la différence entre
                occasion et reconditionné, valoriser vos décisions dans un
                bilan RSE — nos articles.
              </p>
            </div>
            <Link
              href="/blog"
              className="btn-outline inline-flex items-center gap-2 shrink-0"
            >
              Tous les articles
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <Reveal key={card.slug} delay={i * 80}>
              <Link
                href={`/blog/${card.slug}`}
                className="group flex flex-col h-full bg-ivory-light border border-line hover:border-gold transition-colors duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-ivory-dark">
                  <Image
                    src={card.heroImage}
                    alt={card.heroImageAlt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-widest text-gold-dark font-medium">
                    <span>{card.category}</span>
                    <span className="text-ink-mute/50">·</span>
                    <span className="text-ink-mute flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {card.readMinutes} min
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-ink mt-3 leading-tight group-hover:text-gold-dark transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed flex-1">
                    {card.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between pt-4 border-t border-line/60 text-xs">
                    <time
                      dateTime={card.publishedAt}
                      className="text-ink-mute"
                    >
                      {FR_DATE.format(new Date(card.publishedAt))}
                    </time>
                    <span className="inline-flex items-center gap-1.5 text-gold-dark font-medium group-hover:gap-2.5 transition-all">
                      Lire
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
