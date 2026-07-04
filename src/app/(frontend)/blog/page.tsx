import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock } from 'lucide-react'
import { BLOG_ARTICLES, type BlogArticle } from '@/lib/blog-articles'
import {
  getAllBlogPosts,
  categoryLabel,
  estimateReadMinutes,
  type SanityBlogPost,
} from '@/lib/sanity-blog'
import { urlFor } from '@/lib/sanity'

export const revalidate = 60

export const metadata: Metadata = {
  title:
    'Blog & conseils — mobilier de bureau reconditionné | Mobilier Malin',
  description:
    'Guides d\'achat, comparatifs de marques, analyses RSE. Nos conseils pour bien choisir votre mobilier de bureau professionnel reconditionné.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog Mobilier Malin — guides, comparatifs, RSE',
    description:
      'Guides pratiques, comparatifs de marques (Steelcase, Herman Miller, Haworth, Vitra) et analyses RSE du mobilier reconditionné.',
  },
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

const FR_DATE = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/**
 * Article unifié pour l'affichage — provient soit de Sanity soit
 * du registre hardcodé (fallback tant que Djamel n'a rien publié).
 */
type UnifiedArticle = {
  slug: string
  title: string
  excerpt: string
  category: string
  heroImage: string
  heroImageAlt: string
  publishedAt: string
  readMinutes: number
  source: 'sanity' | 'static'
}

function sanityToUnified(p: SanityBlogPost): UnifiedArticle {
  const heroUrl = p.heroImage
    ? urlFor(p.heroImage).width(1600).height(900).fit('crop').url()
    : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80'
  return {
    slug: p.slug.current,
    title: p.title,
    excerpt: p.excerpt || '',
    category: categoryLabel(p.category),
    heroImage: heroUrl,
    heroImageAlt: p.heroImage?.alt || p.title,
    publishedAt: p.publishedAt,
    readMinutes: estimateReadMinutes(p.body),
    source: 'sanity',
  }
}

function staticToUnified(a: BlogArticle): UnifiedArticle {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    heroImage: a.heroImage,
    heroImageAlt: a.heroImageAlt,
    publishedAt: a.publishedAt,
    readMinutes: a.readMinutes,
    source: 'static',
  }
}

export default async function BlogPage() {
  const sanityPosts = await getAllBlogPosts()

  // Fusion : Sanity prioritaire. Un article statique n'est affiché que
  // si son slug n'est pas déjà repris par un article Sanity.
  const sanitySlugs = new Set(sanityPosts.map((p) => p.slug.current))
  const merged: UnifiedArticle[] = [
    ...sanityPosts.map(sanityToUnified),
    ...BLOG_ARTICLES.filter((a) => !sanitySlugs.has(a.slug)).map(staticToUnified),
  ].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog Mobilier Malin',
    url: `${siteUrl}/blog`,
    blogPost: merged.map((a) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      description: a.excerpt,
      url: `${siteUrl}/blog/${a.slug}`,
      datePublished: a.publishedAt,
      author: { '@type': 'Organization', name: 'Mobilier Malin' },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-16 md:py-20 max-w-3xl">
          <p className="eyebrow">Blog &amp; conseils</p>
          <h1 className="text-display mt-4 font-serif leading-[1.05]">
            Guides, comparatifs et conseils sur le mobilier reconditionné
          </h1>
          <div className="gold-divider mx-0 mt-6" />
          <p className="mt-6 text-lg text-ink-soft leading-relaxed">
            Comparatifs de marques (Steelcase, Herman Miller, Haworth, Vitra),
            guides d&apos;achat pour bien choisir, analyses RSE pour valoriser
            vos décisions dans votre bilan carbone — tout ce qu&apos;on aurait
            aimé lire avant d&apos;acheter du mobilier professionnel.
          </p>
        </div>
      </section>

      <section className="container py-14 md:py-20">
        {merged.length === 0 ? (
          <div className="text-center max-w-xl mx-auto bg-ivory-light border border-line p-10">
            <p className="font-serif text-2xl text-ink">Aucun article pour l&apos;instant</p>
            <p className="mt-3 text-ink-mute">
              Nos premiers articles arrivent bientôt. En attendant, découvrez
              notre catalogue.
            </p>
            <Link href="/boutique" className="mt-6 btn-outline inline-block">
              Voir la boutique
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merged.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group flex flex-col bg-ivory-light border border-line hover:border-gold transition-colors duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-ivory-dark">
                  <Image
                    src={article.heroImage}
                    alt={article.heroImageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-widest text-gold-dark font-medium">
                    <span>{article.category}</span>
                    <span className="text-ink-mute/50">·</span>
                    <span className="text-ink-mute flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.5} />
                      {article.readMinutes} min
                    </span>
                  </div>
                  <h2 className="font-serif text-xl md:text-2xl text-ink mt-3 leading-tight group-hover:text-gold-dark transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed flex-1">
                    {article.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-line/60 text-xs">
                    <time
                      dateTime={article.publishedAt}
                      className="text-ink-mute"
                    >
                      {FR_DATE.format(new Date(article.publishedAt))}
                    </time>
                    <span className="inline-flex items-center gap-1.5 text-gold-dark font-medium group-hover:gap-2.5 transition-all">
                      Lire
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-20 text-center max-w-3xl mx-auto">
          <p className="eyebrow text-gold">Besoin d&apos;un conseil personnalisé ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Notre équipe répond à vos questions
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/70 leading-relaxed">
            Un projet d&apos;aménagement, un doute sur une marque, un besoin
            d&apos;équipement en volume : nous vous répondons sous 24 h ouvrées
            avec du concret, sans engagement.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Nous contacter
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link href="/boutique" className="btn-outline-light">
              Voir la boutique
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
