import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PortableText, type PortableTextBlock } from 'next-sanity'
import { ArrowRight, Clock, User, Info, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'
import {
  getGuideArticleBySlug,
  getAllGuideArticleSlugs,
  guideArticleOgImageUrl,
} from '@/lib/sanity-guides'
import { urlFor } from '@/lib/sanity'
import { formatPrice } from '@/lib/utils'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'
import { guideArticleBreadcrumb } from '@/lib/breadcrumbs'

export const revalidate = 60
export const dynamicParams = true

type Params = { cluster: string; slug: string }

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export async function generateStaticParams() {
  const all = await getAllGuideArticleSlugs()
  return all
    .filter((a) => a.clusterSlug && a.articleSlug)
    .map((a) => ({ cluster: a.clusterSlug, slug: a.articleSlug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { cluster, slug } = await params
  const article = await getGuideArticleBySlug(cluster, slug)
  if (!article) return { title: 'Article introuvable' }

  const title = article.seo?.metaTitle || article.title
  const description = article.seo?.metaDescription || article.excerpt
  const ogImageUrl = guideArticleOgImageUrl(article)
  const canonical = article.seo?.canonicalUrl || `/guides/${cluster}/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    ...(article.seo?.noIndex && { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article._updatedAt,
      authors: article.author ? [article.author] : undefined,
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
  }
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { cluster, slug } = await params
  const article = await getGuideArticleBySlug(cluster, slug)
  if (!article) notFound()

  const heroUrl = article.heroImage
    ? urlFor(article.heroImage).width(1600).height(900).fit('crop').url()
    : null

  // JSON-LD Article — E-E-A-T, dates, auteur.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${siteUrl}/guides/${cluster}/${slug}#article`,
    headline: article.title,
    ...(article.excerpt && { description: article.excerpt }),
    ...(heroUrl && { image: heroUrl }),
    ...(article.publishedAt && { datePublished: article.publishedAt }),
    dateModified: article._updatedAt,
    ...(article.author && {
      author: { '@type': 'Person', name: article.author },
    }),
    publisher: { '@id': `${siteUrl}/#organization` },
    mainEntityOfPage: `${siteUrl}/guides/${cluster}/${slug}`,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/guides/${cluster}`,
      name: article.cluster.name,
    },
  }

  // JSON-LD FAQPage — émis UNIQUEMENT si des FAQ sont visibles dans l'UI
  const faqSchema =
    article.faq && article.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faq.map((qa) => ({
            '@type': 'Question',
            name: qa.question,
            acceptedAnswer: { '@type': 'Answer', text: qa.answer },
          })),
        }
      : null

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema ? [articleSchema, faqSchema] : articleSchema),
        }}
      />

      <Breadcrumbs items={guideArticleBreadcrumb(article)} />

      <article className="container py-8 md:py-14 max-w-3xl">
        {/* En-tête article */}
        <header>
          <Link
            href={`/guides/${cluster}`}
            className="eyebrow inline-block hover:text-gold-dark transition-colors"
          >
            ← {article.cluster.name}
          </Link>
          <h1 className="text-display font-serif mt-4 leading-tight">
            {article.title}
          </h1>
          <div className="gold-divider mt-6" />
          {article.excerpt && (
            <p className="mt-6 text-lg text-ink-soft leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <div className="mt-6 flex items-center gap-4 text-xs text-ink-mute">
            {article.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                {article.author}
              </span>
            )}
            {article.publishedAt && (
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            )}
            {article.readingTimeMinutes && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                {article.readingTimeMinutes} min de lecture
              </span>
            )}
          </div>
        </header>

        {/* Hero image */}
        {heroUrl && (
          <div className="relative aspect-[16/9] bg-ivory-dark my-10 overflow-hidden">
            <Image
              src={heroUrl}
              alt={article.heroImage?.alt || article.title}
              fill
              priority
              sizes="(min-width: 768px) 720px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        {/* Corps de l'article — typography riche */}
        <div className="mt-10 max-w-none">
          {article.body ? (
            <PortableText
              value={article.body as PortableTextBlock[]}
              components={{
                block: {
                  // H2 : titre visible, séparateur or, espace vertical clair
                  h2: ({ children }) => (
                    <h2 className="font-serif text-2xl md:text-3xl text-ink mt-14 mb-6 leading-tight scroll-mt-24">
                      {children}
                    </h2>
                  ),
                  // H3 : sous-titre distinct
                  h3: ({ children }) => (
                    <h3 className="font-serif text-xl md:text-2xl text-ink mt-10 mb-4 leading-snug">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="font-serif text-lg text-ink mt-8 mb-3 leading-snug">
                      {children}
                    </h4>
                  ),
                  // Paragraphe : lisible, respiration
                  normal: ({ children }) => (
                    <p className="text-base md:text-lg text-ink-soft leading-relaxed mb-6">
                      {children}
                    </p>
                  ),
                  // Blockquote design or, italique
                  blockquote: ({ children }) => (
                    <blockquote className="my-8 pl-6 border-l-4 border-gold italic text-lg text-ink leading-relaxed">
                      {children}
                    </blockquote>
                  ),
                },
                marks: {
                  strong: ({ children }) => (
                    <strong className="font-semibold text-ink">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic">{children}</em>
                  ),
                  link: ({ value, children }) => (
                    <a
                      href={value?.href}
                      className="text-gold-dark underline underline-offset-2 hover:text-gold"
                      target={value?.href?.startsWith('http') ? '_blank' : undefined}
                      rel={value?.href?.startsWith('http') ? 'noopener' : undefined}
                    >
                      {children}
                    </a>
                  ),
                },
                list: {
                  bullet: ({ children }) => (
                    <ul className="my-6 space-y-2.5 pl-2">{children}</ul>
                  ),
                  number: ({ children }) => (
                    <ol className="my-6 space-y-2.5 pl-2 list-decimal list-inside">
                      {children}
                    </ol>
                  ),
                },
                listItem: {
                  bullet: ({ children }) => (
                    <li className="flex gap-3 text-base md:text-lg text-ink-soft leading-relaxed">
                      <span
                        className="text-gold shrink-0 mt-2 h-1.5 w-1.5 rounded-full bg-gold inline-block"
                        aria-hidden="true"
                      />
                      <span className="flex-1">{children}</span>
                    </li>
                  ),
                },
                types: {
                  // Image Sanity uploadée (via Studio)
                  image: ({ value }) => {
                    if (!value?.asset) return null
                    const url = urlFor(value).width(1600).url()
                    return (
                      <figure className="my-10 -mx-4 md:mx-0">
                        <div className="relative aspect-[16/9] bg-ivory-dark overflow-hidden">
                          <Image
                            src={url}
                            alt={value.alt || ''}
                            fill
                            sizes="(min-width: 768px) 720px, 100vw"
                            className="object-cover"
                          />
                        </div>
                        {value.caption && (
                          <figcaption className="mt-3 text-sm text-ink-mute text-center italic">
                            {value.caption}
                          </figcaption>
                        )}
                      </figure>
                    )
                  },
                  // Image via URL externe (Unsplash, etc.) — utilisée par le seed markdown
                  inlineImage: ({ value }) => {
                    if (!value?.url) return null
                    return (
                      <figure className="my-10 -mx-4 md:mx-0">
                        <div className="relative aspect-[16/9] bg-ivory-dark overflow-hidden">
                          <Image
                            src={value.url}
                            alt={value.alt || ''}
                            fill
                            sizes="(min-width: 768px) 720px, 100vw"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        {value.caption && (
                          <figcaption className="mt-3 text-sm text-ink-mute text-center italic">
                            {value.caption}
                          </figcaption>
                        )}
                      </figure>
                    )
                  },
                  // Callout (info / warning / success / tip)
                  callout: ({ value }) => {
                    const variant = value?.variant || 'info'
                    const config = {
                      info: {
                        Icon: Info,
                        bg: 'bg-blue-50',
                        border: 'border-blue-300',
                        iconColor: 'text-blue-700',
                        label: 'Info',
                      },
                      warning: {
                        Icon: AlertTriangle,
                        bg: 'bg-amber-50',
                        border: 'border-amber-300',
                        iconColor: 'text-amber-700',
                        label: 'Attention',
                      },
                      success: {
                        Icon: CheckCircle2,
                        bg: 'bg-green-50',
                        border: 'border-green-300',
                        iconColor: 'text-green-700',
                        label: 'À retenir',
                      },
                      tip: {
                        Icon: Lightbulb,
                        bg: 'bg-gold/10',
                        border: 'border-gold',
                        iconColor: 'text-gold-dark',
                        label: 'Astuce',
                      },
                    }[variant as 'info' | 'warning' | 'success' | 'tip']
                    const { Icon, bg, border, iconColor, label } = config
                    return (
                      <aside
                        className={`my-8 p-5 md:p-6 border-l-4 ${bg} ${border} flex gap-4`}
                      >
                        <Icon
                          className={`h-5 w-5 md:h-6 md:w-6 ${iconColor} shrink-0 mt-1`}
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-widest font-semibold text-ink-mute mb-2">
                            {label}
                          </p>
                          <p className="text-ink leading-relaxed">
                            {(value.content || []).map(
                              (
                                span: { text?: string; marks?: string[] },
                                i: number,
                              ) => {
                                const isBold = span.marks?.includes('strong')
                                const isItalic = span.marks?.includes('em')
                                if (isBold)
                                  return <strong key={i}>{span.text}</strong>
                                if (isItalic) return <em key={i}>{span.text}</em>
                                return <span key={i}>{span.text}</span>
                              },
                            )}
                          </p>
                        </div>
                      </aside>
                    )
                  },
                  // Séparateur horizontal
                  divider: () => (
                    <div className="my-12 flex items-center justify-center">
                      <div className="h-px w-16 bg-gold" />
                    </div>
                  ),
                  // Tableau structuré (data-table) — responsive avec scroll horizontal
                  dataTable: ({ value }) => {
                    const headers: string[] = value?.headers || []
                    const rows: Array<{ cells?: string[] }> = value?.rows || []
                    if (headers.length === 0) return null
                    return (
                      <figure className="my-10 -mx-4 md:mx-0">
                        {value?.caption && (
                          <figcaption className="text-center font-serif text-lg text-ink mb-4">
                            {value.caption}
                          </figcaption>
                        )}
                        <div className="overflow-x-auto border border-line">
                          <table className="w-full text-sm">
                            <thead className="bg-ink text-ivory">
                              <tr>
                                {headers.map((h, i) => (
                                  <th
                                    key={i}
                                    className="text-left px-4 py-3 font-serif whitespace-nowrap"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                              {rows.map((row, ri) => (
                                <tr
                                  key={ri}
                                  className={ri % 2 === 0 ? 'bg-ivory' : 'bg-ivory-light'}
                                >
                                  {(row.cells || []).map((cell, ci) => (
                                    <td
                                      key={ci}
                                      className="px-4 py-3 text-ink-soft align-top"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </figure>
                    )
                  },
                  // HTML brut — usage avancé, avec sanitize minimal (retire les balises dangereuses)
                  htmlEmbed: ({ value }) => {
                    if (!value?.html) return null
                    // Sanitize très basique : retire les balises interdites listées
                    // dans la description schema (script, style, form, input).
                    const clean = String(value.html)
                      .replace(/<\s*script[\s\S]*?<\/\s*script\s*>/gi, '')
                      .replace(/<\s*style[\s\S]*?<\/\s*style\s*>/gi, '')
                      .replace(/<\s*form[\s\S]*?<\/\s*form\s*>/gi, '')
                      .replace(/<\s*input[^>]*>/gi, '')
                      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
                    return (
                      <div
                        className="my-8 prose prose-lg max-w-none [&_table]:w-full [&_table]:border [&_table]:border-line [&_th]:bg-ink [&_th]:text-ivory [&_th]:p-3 [&_th]:font-serif [&_th]:text-left [&_td]:p-3 [&_td]:border-t [&_td]:border-line"
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: clean }}
                      />
                    )
                  },
                  // Produit associé (Sanity ref → carte cliquable)
                  productEmbed: ({ value }) => {
                    if (!value?.product) return null
                    return (
                      <aside className="my-8 p-6 bg-ivory-dark border-l-4 border-gold">
                        <p className="text-sm text-ink-mute">
                          {value.accroche || 'Produit associé'}
                        </p>
                        <Link
                          href={`/produit/${value.product.slug?.current || ''}`}
                          className="mt-2 text-gold-dark hover:text-gold underline"
                        >
                          Voir le produit →
                        </Link>
                      </aside>
                    )
                  },
                },
              }}
            />
          ) : (
            <p className="text-ink-mute italic">Contenu en cours de rédaction.</p>
          )}
        </div>

        {/* Produits mis en avant — AVANT la FAQ (pousse à la conversion pendant que le lecteur est engagé) */}
        {article.featuredProducts && article.featuredProducts.length > 0 && (
          <section className="mt-14 pt-10 border-t border-line">
            <h2 className="font-serif text-2xl text-ink mb-6 text-center">
              Sélection de produits
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {article.featuredProducts.map((p) => {
                const img = p.images?.[0]
                  ? urlFor(p.images[0]).width(600).height(600).fit('crop').url()
                  : null
                const displayPrice =
                  p.salePrice && p.salePrice < p.price ? p.salePrice : p.price
                return (
                  <Link
                    key={p._id}
                    href={`/produit/${p.slug.current}`}
                    className="group flex flex-col bg-ivory border border-line hover:border-gold transition-colors overflow-hidden"
                  >
                    {img && (
                      <div className="relative aspect-square bg-ivory-dark overflow-hidden">
                        <Image
                          src={img}
                          alt={p.name}
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      {p.brand && (
                        <p className="text-xs uppercase tracking-widest text-ink-mute">
                          {p.brand}
                        </p>
                      )}
                      <h3 className="font-serif text-base text-ink mt-1 leading-tight">
                        {p.name}
                      </h3>
                      <p className="mt-2 text-lg text-ink font-serif">
                        {formatPrice(displayPrice)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* CTA catégorie principale (maillage descendant) */}
        {article.primaryProductCategory && (
          <section className="mt-14 pt-10 border-t border-line">
            <div className="bg-ink text-ivory p-8 md:p-10 text-center">
              <p className="eyebrow text-gold">Découvrir le catalogue</p>
              <h3 className="font-serif text-2xl md:text-3xl mt-3">
                Voir tous nos {article.primaryProductCategory.name.toLowerCase()}
              </h3>
              <Link
                href={`/categorie/${article.primaryProductCategory.slug.current}`}
                className="mt-6 inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink px-6 py-3 font-medium transition-colors"
              >
                Explorer la catégorie
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </section>
        )}

        {/* FAQ inline (visible ET dans le JSON-LD FAQPage) — après les CTA produits */}
        {article.faq && article.faq.length > 0 && (
          <section className="mt-14 pt-10 border-t border-line">
            <h2 className="font-serif text-2xl text-ink mb-6">
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {article.faq.map((qa, i) => (
                <details
                  key={i}
                  className="group bg-ivory-light border border-line hover:border-gold/40 transition-colors"
                >
                  <summary className="cursor-pointer p-5 flex items-center justify-between gap-4 list-none">
                    <span className="font-serif text-base md:text-lg text-ink leading-snug">
                      {qa.question}
                    </span>
                    <span className="text-gold text-2xl transition-transform group-open:rotate-45 leading-none shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-sm md:text-base text-ink-soft leading-relaxed whitespace-pre-line">
                    {qa.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Articles frères — cocon horizontal */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <section className="mt-14 pt-10 border-t border-line">
            <h2 className="font-serif text-2xl text-ink mb-6">
              À lire aussi dans « {article.cluster.name} »
            </h2>
            <ul className="space-y-3">
              {article.relatedArticles.map((rel) => (
                <li key={rel._id}>
                  <Link
                    href={`/guides/${rel.cluster.slug.current}/${rel.slug.current}`}
                    className="group flex items-start gap-3 p-4 bg-ivory-light border border-line hover:border-gold transition-colors"
                  >
                    <ArrowRight
                      className="h-4 w-4 text-gold mt-1 shrink-0 group-hover:translate-x-1 transition-transform"
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="font-serif text-base text-ink group-hover:text-gold-dark transition-colors">
                        {rel.title}
                      </p>
                      {rel.excerpt && (
                        <p className="mt-1 text-sm text-ink-soft leading-relaxed line-clamp-2">
                          {rel.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  )
}
