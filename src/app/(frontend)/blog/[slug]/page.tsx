import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronRight, Clock, Tag } from 'lucide-react'
import {
  BLOG_ARTICLES,
  getAllBlogSlugs,
  getBlogArticle,
} from '@/lib/blog-articles'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

const FR_DATE = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

type Params = { slug: string }

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) return { title: 'Article introuvable' }
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [{ url: article.heroImage }],
    },
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) notFound()

  const related = article.relatedSlugs
    .map((s) => BLOG_ARTICLES.find((a) => a.slug === s))
    .filter((a): a is (typeof BLOG_ARTICLES)[number] => !!a)

  // JSON-LD BlogPosting
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: article.heroImage,
    url: `${siteUrl}/blog/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'Mobilier Malin',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mobilier Malin',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${article.slug}`,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${siteUrl}/blog/${article.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema, breadcrumbSchema]),
        }}
      />

      {/* Breadcrumb */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-4">
          <nav aria-label="Fil d'Ariane" className="text-xs text-ink-mute">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link href="/" className="hover:text-gold-dark">
                  Accueil
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li>
                <Link href="/blog" className="hover:text-gold-dark">
                  Blog
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li className="text-ink truncate max-w-[400px]">{article.title}</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Hero */}
      <section className="container pt-12 md:pt-16 pb-8 max-w-3xl">
        <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-widest text-gold-dark font-medium">
          <span>{article.category}</span>
          <span className="text-ink-mute/50">·</span>
          <time
            dateTime={article.publishedAt}
            className="text-ink-mute normal-case tracking-wider"
          >
            {FR_DATE.format(new Date(article.publishedAt))}
          </time>
          <span className="text-ink-mute/50">·</span>
          <span className="text-ink-mute flex items-center gap-1 normal-case tracking-wider">
            <Clock className="h-3 w-3" strokeWidth={1.5} />
            {article.readMinutes} min de lecture
          </span>
        </div>
        <h1 className="text-display font-serif mt-5 leading-[1.1]">
          {article.title}
        </h1>
        <div className="gold-divider mx-0 mt-8" />
      </section>

      {/* Hero image */}
      <section className="container max-w-4xl">
        <div className="relative aspect-[16/9] overflow-hidden bg-ivory-dark">
          <Image
            src={article.heroImage}
            alt={article.heroImageAlt}
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Intro */}
      <section className="container py-12 max-w-3xl">
        {article.intro.map((p, i) => (
          <p
            key={i}
            className={`text-ink-soft leading-relaxed ${
              i === 0 ? 'text-lg first-letter:text-4xl first-letter:font-serif first-letter:text-gold-dark first-letter:mr-1 first-letter:float-left first-letter:leading-none first-letter:mt-1' : 'mt-5 text-base'
            }`}
          >
            {p}
          </p>
        ))}
      </section>

      {/* Sommaire */}
      <section className="container max-w-3xl mb-10">
        <div className="bg-ivory-light border border-line p-6">
          <p className="text-xs uppercase tracking-widest text-ink-mute mb-4">
            Sommaire
          </p>
          <ol className="space-y-2">
            {article.sections.map((s, i) => (
              <li key={s.id} className="text-sm text-ink-soft">
                <a
                  href={`#${s.id}`}
                  className="hover:text-gold-dark inline-flex gap-2"
                >
                  <span className="text-gold-dark font-medium">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{s.heading}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sections */}
      <article className="container max-w-3xl pb-12">
        {article.sections.map((section) => (
          <section key={section.id} className="mt-14 first:mt-0 scroll-mt-24" id={section.id}>
            <h2 className="font-serif text-2xl md:text-3xl text-ink leading-snug">
              {section.heading}
              <span className="block h-px w-10 bg-gold mt-4" aria-hidden />
            </h2>

            {section.paragraphs.map((p, i) => (
              <p
                key={i}
                className="mt-5 text-ink-soft leading-relaxed"
              >
                {p}
              </p>
            ))}

            {section.bullets && section.bullets.length > 0 && (
              <ul className="mt-6 space-y-3">
                {section.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-ink-soft leading-relaxed"
                  >
                    <span className="text-gold shrink-0 mt-1.5">◆</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.callout && (
              <div className="mt-8 bg-ink text-ivory p-6 md:p-7 border-l-4 border-gold">
                <p className="eyebrow text-gold">{section.callout.title}</p>
                <p className="mt-3 text-ivory/85 leading-relaxed">
                  {section.callout.body}
                </p>
                <Link
                  href={section.callout.href}
                  className="mt-5 inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
                >
                  {section.callout.hrefLabel}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            )}
          </section>
        ))}

        {/* Conclusion */}
        <section className="mt-14 pt-10 border-t border-line/60">
          <p className="eyebrow">En résumé</p>
          {article.conclusion.map((p, i) => (
            <p
              key={i}
              className="mt-4 text-ink-soft leading-relaxed"
            >
              {p}
            </p>
          ))}
        </section>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-10 flex items-center gap-3 flex-wrap">
            <Tag className="h-4 w-4 text-ink-mute" strokeWidth={1.5} />
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs uppercase tracking-widest text-ink-mute border border-line bg-ivory-light px-3 py-1.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* CTA — vers la boutique */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-12 md:py-16 max-w-3xl text-center">
          <p className="eyebrow">Passer à l&apos;action</p>
          <h2 className="font-serif text-h1 mt-3">
            Voir notre stock actuel
          </h2>
          <p className="mt-4 text-ink-soft leading-relaxed">
            Fauteuils, bureaux, armoires, tables de réunion — nos pièces
            reconditionnées, contrôlées et garanties 6 mois.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/boutique" className="btn-gold inline-flex items-center gap-2">
              Découvrir la boutique
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link href="/contact" className="btn-outline">
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      </section>

      {/* Articles liés */}
      {related.length > 0 && (
        <section className="container py-14 md:py-20 max-w-4xl">
          <div className="text-center mb-10">
            <p className="eyebrow">À lire aussi</p>
            <h2 className="font-serif text-h1 mt-2">Autres articles du blog</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {related.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="group flex flex-col bg-ivory-light border border-line hover:border-gold transition-colors duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-ivory-dark">
                  <Image
                    src={a.heroImage}
                    alt={a.heroImageAlt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="p-6">
                  <p className="text-[0.65rem] uppercase tracking-widest text-gold-dark font-medium">
                    {a.category}
                  </p>
                  <h3 className="font-serif text-lg text-ink mt-2 leading-tight group-hover:text-gold-dark transition-colors">
                    {a.title}
                  </h3>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                    {a.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
