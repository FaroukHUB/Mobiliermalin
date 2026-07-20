import Image from 'next/image'
import { PortableText, type PortableTextBlock } from 'next-sanity'
import { Info, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import { slugifyHeading } from '@/lib/slugify'

/**
 * Extrait le texte plain d'un block Portable Text depuis sa data brute
 * (value.children[].text). Bien plus fiable que de tenter d'extraire
 * depuis les React nodes children, qui varient selon la version de
 * next-sanity.
 */
function textOfBlock(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const b = value as { _type?: string; children?: Array<{ text?: string }> }
  if (b._type !== 'block' || !Array.isArray(b.children)) return ''
  return b.children.map((c) => c?.text ?? '').join('')
}

/**
 * Renderer PortableText éditorial partagé.
 * Utilisé par :
 *   - guides guideArticle (via /guides/[cluster]/[slug]/page.tsx)
 *   - landing pages nationales (via nationalLandingPage.body)
 *
 * Supporte les types custom : image (upload Sanity), inlineImage (URL
 * externe), callout (4 variantes), divider, dataTable (tableau
 * structuré), videoEmbed (YouTube/Vimeo), htmlEmbed (HTML brut avec
 * sanitize minimal).
 */

// Extrait un ID YouTube d'une URL YouTube/youtu.be
function ytId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}
// Extrait un ID Vimeo
function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m ? m[1] : null
}

export function EditorialPortableText({ value }: { value: PortableTextBlock[] }) {
  return (
    <PortableText
      value={value}
      components={{
        block: {
          h2: ({ value, children }) => {
            const id = slugifyHeading(textOfBlock(value))
            return (
              <h2
                id={id || undefined}
                className="font-serif text-2xl md:text-3xl text-ink mt-14 mb-6 leading-tight scroll-mt-24"
              >
                {children}
              </h2>
            )
          },
          h3: ({ value, children }) => {
            const id = slugifyHeading(textOfBlock(value))
            return (
              <h3
                id={id || undefined}
                className="font-serif text-xl md:text-2xl text-ink mt-10 mb-4 leading-snug scroll-mt-24"
              >
                {children}
              </h3>
            )
          },
          h4: ({ children }) => (
            <h4 className="font-serif text-lg text-ink mt-8 mb-3 leading-snug">
              {children}
            </h4>
          ),
          normal: ({ children }) => (
            <p className="text-base md:text-lg text-ink-soft leading-relaxed mb-6">
              {children}
            </p>
          ),
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
          em: ({ children }) => <em className="italic">{children}</em>,
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
          callout: ({ value }) => {
            const variant = value?.variant || 'info'
            const config = {
              info: { Icon: Info, bg: 'bg-blue-50', border: 'border-blue-300', iconColor: 'text-blue-700', label: 'Info' },
              warning: { Icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-300', iconColor: 'text-amber-700', label: 'Attention' },
              success: { Icon: CheckCircle2, bg: 'bg-green-50', border: 'border-green-300', iconColor: 'text-green-700', label: 'À retenir' },
              tip: { Icon: Lightbulb, bg: 'bg-gold/10', border: 'border-gold', iconColor: 'text-gold-dark', label: 'Astuce' },
            }[variant as 'info' | 'warning' | 'success' | 'tip']
            const { Icon, bg, border, iconColor, label } = config
            return (
              <aside className={`my-8 p-5 md:p-6 border-l-4 ${bg} ${border} flex gap-4`}>
                <Icon className={`h-5 w-5 md:h-6 md:w-6 ${iconColor} shrink-0 mt-1`} strokeWidth={1.75} aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest font-semibold text-ink-mute mb-2">{label}</p>
                  <p className="text-ink leading-relaxed">
                    {(value.content || []).map((span: { text?: string; marks?: string[] }, i: number) => {
                      const isBold = span.marks?.includes('strong')
                      const isItalic = span.marks?.includes('em')
                      if (isBold) return <strong key={i}>{span.text}</strong>
                      if (isItalic) return <em key={i}>{span.text}</em>
                      return <span key={i}>{span.text}</span>
                    })}
                  </p>
                </div>
              </aside>
            )
          },
          divider: () => (
            <div className="my-12 flex items-center justify-center">
              <div className="h-px w-16 bg-gold" />
            </div>
          ),
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
                          <th key={i} className="text-left px-4 py-3 font-serif whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {rows.map((row, ri) => (
                        <tr key={ri} className={ri % 2 === 0 ? 'bg-ivory' : 'bg-ivory-light'}>
                          {(row.cells || []).map((cell, ci) => (
                            <td key={ci} className="px-4 py-3 text-ink-soft align-top">
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
          videoEmbed: ({ value }) => {
            if (!value?.url) return null
            const yt = ytId(value.url)
            const vm = vimeoId(value.url)
            const embedUrl = yt
              ? `https://www.youtube.com/embed/${yt}`
              : vm
                ? `https://player.vimeo.com/video/${vm}`
                : null
            if (!embedUrl) return null
            return (
              <figure className="my-10 -mx-4 md:mx-0">
                <div className="relative aspect-video bg-ink overflow-hidden">
                  <iframe
                    src={embedUrl}
                    title={value.title || 'Vidéo'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    loading="lazy"
                  />
                </div>
                {(value.title || value.description) && (
                  <figcaption className="mt-3 text-sm text-ink-mute text-center italic">
                    {value.title || value.description}
                  </figcaption>
                )}
              </figure>
            )
          },
          htmlEmbed: ({ value }) => {
            if (!value?.html) return null
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
        },
      }}
    />
  )
}
