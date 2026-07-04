import Link from 'next/link'
import Image from 'next/image'
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from 'next-sanity'
import { ArrowRight, Info, AlertTriangle, CheckCircle2, Sparkles, StickyNote } from 'lucide-react'
import { urlFor } from '@/lib/sanity'

/**
 * Rend un article de blog Sanity avec la palette WordPress-like
 * complète : titres, listes, blockquote, images, galeries, callouts,
 * blocs de code, vidéos YouTube/Vimeo, tableaux, boutons CTA,
 * séparateurs.
 */

// ─── EMBEDS VIDÉO ─────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:.*v=|.*\/|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  )
  return m ? m[1] : null
}
function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? m[1] : null
}

// ─── CALLOUT VARIANTS ─────────────────────────────────────────────
const CALLOUT_STYLES: Record<
  string,
  { className: string; icon: typeof Info }
> = {
  info: {
    className: 'bg-gold/5 border-l-4 border-gold text-ink-soft',
    icon: Info,
  },
  success: {
    className: 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-950',
    icon: CheckCircle2,
  },
  warning: {
    className: 'bg-amber-50 border-l-4 border-amber-500 text-amber-950',
    icon: AlertTriangle,
  },
  gold: {
    className: 'bg-ink text-ivory border-l-4 border-gold',
    icon: Sparkles,
  },
  note: {
    className: 'bg-ivory-dark border-l-4 border-line text-ink-soft',
    icon: StickyNote,
  },
}

// ─── LINK RESOLVER ────────────────────────────────────────────────
function resolveInternalHref(ref: {
  _type?: string
  slug?: { current?: string }
  pageKey?: string
}): string {
  if (!ref) return '#'
  const slug = ref.slug?.current
  switch (ref._type) {
    case 'product':
      return slug ? `/produit/${slug}` : '#'
    case 'category':
      return slug ? `/categorie/${slug}` : '#'
    case 'blogPost':
      return slug ? `/blog/${slug}` : '#'
    case 'localPage':
      return ref.pageKey ? `/${ref.pageKey}` : '#'
    default:
      return '#'
  }
}

// ─── COMPONENTS ───────────────────────────────────────────────────
export const blogPortableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-5 text-ink-soft leading-relaxed text-[17px]">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-serif text-2xl md:text-3xl text-ink mt-14 mb-3 leading-snug scroll-mt-24">
        {children}
        <span className="block h-px w-10 bg-gold mt-3" aria-hidden />
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-serif text-xl md:text-2xl text-ink mt-10 mb-2 leading-snug">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-serif text-lg md:text-xl text-ink mt-8 mb-2 leading-snug">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-8 border-l-4 border-gold pl-6 py-2 italic text-ink font-serif text-lg md:text-xl leading-relaxed">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="mt-5 space-y-2.5 text-ink-soft text-[17px]">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-5 space-y-2.5 text-ink-soft text-[17px] list-decimal list-inside marker:text-gold-dark marker:font-medium">
        {children}
      </ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => (
      <li className="flex items-start gap-3 leading-relaxed">
        <span className="text-gold shrink-0 mt-2 text-xs">◆</span>
        <span>{children}</span>
      </li>
    ),
    number: ({ children }) => (
      <li className="leading-relaxed pl-1">{children}</li>
    ),
  },

  marks: {
    strong: ({ children }) => (
      <strong className="text-ink font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => (
      <span className="underline underline-offset-2 decoration-gold/60">
        {children}
      </span>
    ),
    'strike-through': ({ children }) => (
      <span className="line-through opacity-70">{children}</span>
    ),
    code: ({ children }) => (
      <code className="bg-ivory-dark text-ink px-1.5 py-0.5 text-[0.9em] font-mono border border-line rounded-sm">
        {children}
      </code>
    ),
    highlight: ({ children }) => (
      <mark className="bg-gold/25 text-ink px-1 py-0.5 rounded-sm">
        {children}
      </mark>
    ),
    link: ({ value, children }) => {
      const href = value?.href || '#'
      const isExternal = /^https?:\/\//i.test(href)
      return (
        <a
          href={href}
          target={value?.openInNewTab || isExternal ? '_blank' : undefined}
          rel={
            value?.openInNewTab || isExternal ? 'noopener noreferrer' : undefined
          }
          className="text-gold-dark underline underline-offset-2 hover:text-gold decoration-gold/60"
        >
          {children}
        </a>
      )
    },
    internalLink: ({ value, children }) => (
      <Link
        href={resolveInternalHref(value?.reference || {})}
        className="text-gold-dark underline underline-offset-2 hover:text-gold decoration-gold/60"
      >
        {children}
      </Link>
    ),
  },

  types: {
    // ─── IMAGE ─────────────────────────────────────────────────────
    image: ({ value }) => {
      if (!value?.asset) return null
      const size = value.size || 'normal'
      const alt = value.alt || ''
      const caption = value.caption

      const url = urlFor(value).width(1600).url()

      if (size === 'wide') {
        return (
          <figure className="my-10 -mx-4 md:-mx-16">
            <div className="relative aspect-[16/9] bg-ivory-dark overflow-hidden">
              <Image src={url} alt={alt} fill sizes="100vw" className="object-cover" />
            </div>
            {caption && (
              <figcaption className="mt-3 text-center text-sm text-ink-mute italic">
                {caption}
              </figcaption>
            )}
          </figure>
        )
      }

      if (size === 'small-left' || size === 'small-right') {
        const floatClass =
          size === 'small-left'
            ? 'md:float-left md:mr-6 md:mb-3'
            : 'md:float-right md:ml-6 md:mb-3'
        return (
          <figure className={`my-6 md:my-2 md:w-1/3 ${floatClass}`}>
            <div className="relative aspect-[4/3] bg-ivory-dark overflow-hidden">
              <Image src={url} alt={alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
            {caption && (
              <figcaption className="mt-2 text-xs text-ink-mute italic">
                {caption}
              </figcaption>
            )}
          </figure>
        )
      }

      // normal
      return (
        <figure className="my-8">
          <div className="relative aspect-[16/10] bg-ivory-dark overflow-hidden">
            <Image src={url} alt={alt} fill sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" />
          </div>
          {caption && (
            <figcaption className="mt-3 text-sm text-ink-mute italic text-center">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    },

    // ─── GALERIE ───────────────────────────────────────────────────
    gallery: ({ value }) => {
      const images = value?.images || []
      if (images.length === 0) return null
      const cols = Math.min(images.length, 4)
      const gridClass =
        cols === 2
          ? 'grid-cols-2'
          : cols === 3
            ? 'grid-cols-3'
            : 'grid-cols-2 md:grid-cols-4'
      return (
        <div className={`my-10 grid gap-3 ${gridClass}`}>
          {images.map((img: { _key?: string; alt?: string; asset?: unknown }, i: number) => {
            const url = urlFor(img).width(800).height(1000).fit('crop').url()
            return (
              <div
                key={img._key || i}
                className="relative aspect-[4/5] bg-ivory-dark overflow-hidden"
              >
                <Image
                  src={url}
                  alt={img.alt || ''}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            )
          })}
        </div>
      )
    },

    // ─── CALLOUT ───────────────────────────────────────────────────
    callout: ({ value }) => {
      const variant = value?.variant || 'info'
      const cfg = CALLOUT_STYLES[variant] || CALLOUT_STYLES.info
      const Icon = cfg.icon
      const isGold = variant === 'gold'
      return (
        <div className={`my-8 p-6 md:p-7 ${cfg.className}`}>
          <div className="flex items-start gap-3">
            <Icon className={`h-5 w-5 mt-1 shrink-0 ${isGold ? 'text-gold' : ''}`} strokeWidth={1.75} />
            <div className="flex-1">
              {value.title && (
                <h4 className={`font-serif text-lg mb-2 ${isGold ? 'text-ivory' : 'text-ink'}`}>
                  {value.title}
                </h4>
              )}
              <div className={`text-[15px] leading-relaxed ${isGold ? 'text-ivory/85' : ''}`}>
                <PortableText
                  value={value.body || []}
                  components={{
                    block: {
                      normal: ({ children }) => (
                        <p className="not-first:mt-3">{children}</p>
                      ),
                    },
                    marks: {
                      strong: ({ children }) => (
                        <strong className={isGold ? 'text-ivory' : 'text-ink'}>{children}</strong>
                      ),
                    },
                  }}
                />
              </div>
              {value.ctaLabel && value.ctaHref && (
                <Link
                  href={value.ctaHref}
                  className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${isGold ? 'text-gold hover:text-gold-light' : 'text-gold-dark hover:text-gold'}`}
                >
                  {value.ctaLabel}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )
    },

    // ─── CODE BLOCK ────────────────────────────────────────────────
    codeBlock: ({ value }) => {
      const language = value?.language || 'text'
      const filename = value?.filename
      const code = value?.code || ''
      return (
        <div className="my-8 bg-ink text-ivory border border-gold/20 overflow-hidden">
          {(filename || language !== 'text') && (
            <div className="flex items-center justify-between px-4 py-2 bg-ivory/5 border-b border-gold/20 text-xs">
              <span className="text-gold/80 font-mono">{filename || ''}</span>
              <span className="uppercase tracking-wider text-ivory/60">{language}</span>
            </div>
          )}
          <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
            <code className="font-mono text-ivory/90">{code}</code>
          </pre>
        </div>
      )
    },

    // ─── VIDÉO (YouTube / Vimeo) ───────────────────────────────────
    videoEmbed: ({ value }) => {
      const url = value?.url
      if (!url) return null
      const yt = getYouTubeId(url)
      const vm = getVimeoId(url)
      let embedUrl: string | null = null
      if (yt) embedUrl = `https://www.youtube-nocookie.com/embed/${yt}`
      else if (vm) embedUrl = `https://player.vimeo.com/video/${vm}`
      if (!embedUrl) {
        return (
          <p className="my-8 text-sm text-ink-mute italic">
            Vidéo :{' '}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline"
            >
              {url}
            </a>
          </p>
        )
      }
      return (
        <figure className="my-10">
          <div className="relative aspect-video bg-ink overflow-hidden">
            <iframe
              src={embedUrl}
              title={value.caption || 'Vidéo intégrée'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-3 text-sm text-ink-mute italic text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },

    // ─── TABLEAU ───────────────────────────────────────────────────
    table: ({ value }) => {
      const rows = value?.rows || []
      if (rows.length === 0) return null
      return (
        <figure className="my-8">
          <div className="overflow-x-auto border border-line">
            <table className="w-full text-[15px]">
              <tbody>
                {rows.map(
                  (
                    row: { _key?: string; cells?: string[]; isHeader?: boolean },
                    i: number,
                  ) => {
                    const Cells = row.isHeader ? 'th' : 'td'
                    return (
                      <tr
                        key={row._key || i}
                        className={
                          row.isHeader
                            ? 'bg-ink text-ivory'
                            : i % 2 === 0
                              ? 'bg-ivory-light'
                              : 'bg-ivory'
                        }
                      >
                        {(row.cells || []).map((cell, j) => (
                          <Cells
                            key={j}
                            className={`px-4 py-3 border-r border-line/60 last:border-r-0 text-left align-top ${row.isHeader ? 'font-serif font-medium uppercase tracking-widest text-xs' : 'text-ink-soft'}`}
                          >
                            {cell}
                          </Cells>
                        ))}
                      </tr>
                    )
                  },
                )}
              </tbody>
            </table>
          </div>
          {value.caption && (
            <figcaption className="mt-3 text-xs text-ink-mute italic text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },

    // ─── CTA BUTTON ────────────────────────────────────────────────
    ctaButton: ({ value }) => {
      const align = value?.align || 'left'
      const variant = value?.variant || 'gold'
      const alignClass =
        align === 'center'
          ? 'text-center'
          : align === 'right'
            ? 'text-right'
            : 'text-left'
      const btnClass =
        variant === 'gold'
          ? 'btn-gold inline-flex items-center gap-2'
          : variant === 'outline'
            ? 'btn-outline inline-flex items-center gap-2'
            : 'text-gold-dark hover:text-gold underline underline-offset-2 inline-flex items-center gap-1.5'
      return (
        <div className={`my-10 ${alignClass}`}>
          <Link href={value?.href || '#'} className={btnClass}>
            {value?.label || 'En savoir plus'}
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      )
    },

    // ─── SÉPARATEUR ────────────────────────────────────────────────
    divider: ({ value }) => {
      const variant = value?.variant || 'gold'
      if (variant === 'space') return <div className="my-16" />
      if (variant === 'line') return <hr className="my-10 border-t border-line" />
      return (
        <div className="my-12 flex items-center justify-center">
          <span className="h-px w-16 bg-gold" aria-hidden />
        </div>
      )
    },
  },
}

export function BlogPortableText({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={blogPortableTextComponents} />
}
