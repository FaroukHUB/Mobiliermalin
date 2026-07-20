import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PortableTextBlock } from 'next-sanity'
import { EditorialPortableText } from '@/components/portable-text/EditorialPortableText'
import { slugifyHeading } from '@/lib/slugify'
import { urlFor } from '@/lib/sanity'

/**
 * Rendu "landing premium" du corps éditorial des pages nationales.
 *
 * Au lieu d'une colonne unique de texte (rendu blog), le Portable Text
 * est découpé en sections au niveau de chaque H2 :
 *  - chaque section devient une bande pleine largeur, fond alterné
 *    ivoire / ivoire foncé, numérotée (01, 02, ...)
 *  - la première image d'une section est sortie du flux et affichée
 *    en vis-à-vis du texte (2 colonnes sur desktop, sticky)
 *  - un bandeau CTA conversion est injecté après la 2e section
 *  - les sections redondantes avec les blocs dédiés de la page sont
 *    filtrées (sommaire interne, "continuer votre exploration"...)
 *
 * Les ancres du sommaire restent valides : l'id du H2 est dérivé du
 * même slugifyHeading que TableOfContents.
 */

type Block = Record<string, unknown> & {
  _type?: string
  style?: string
  children?: Array<{ text?: string }>
}

type Section = {
  heading: string
  id: string
  blocks: Block[]
  sideImage: { url: string; alt: string; caption?: string } | null
  compact: boolean
}

// Sections dont le contenu fait doublon avec les blocs dédiés de la
// page (TableOfContents, RelatedContent) : on ne les rend pas.
const SKIP_H2 =
  /^(sur cette page|sommaire|ce que vous (trouverez|allez trouver)|au sommaire|continuer votre|explorer les|pour aller plus loin)/i

// Sections rendues en mode compact (texte plus petit, pas d'image
// latérale) : sources, références.
const COMPACT_H2 = /^(sources? (et|&) r[ée]f[ée]rences?|sources?$)/i

function textOf(block: Block): string {
  if (block._type !== 'block' || !Array.isArray(block.children)) return ''
  return block.children.map((c) => c?.text ?? '').join('')
}

function extractImage(
  blocks: Block[],
): { image: Section['sideImage']; rest: Block[] } {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b._type === 'inlineImage' && typeof b.url === 'string') {
      return {
        image: {
          url: b.url,
          alt: (b.alt as string) || '',
          caption: b.caption as string | undefined,
        },
        rest: [...blocks.slice(0, i), ...blocks.slice(i + 1)],
      }
    }
    if (b._type === 'image' && b.asset) {
      try {
        const url = urlFor(b as never).width(1200).url()
        return {
          image: {
            url,
            alt: (b.alt as string) || '',
            caption: b.caption as string | undefined,
          },
          rest: [...blocks.slice(0, i), ...blocks.slice(i + 1)],
        }
      } catch {
        // asset invalide : on laisse l'image dans le flux
      }
    }
  }
  return { image: null, rest: blocks }
}

function splitSections(blocks: Block[]): { preamble: Block[]; sections: Section[] } {
  const preamble: Block[] = []
  const sections: Section[] = []
  let current: { heading: string; blocks: Block[] } | null = null

  for (const b of blocks) {
    if (b._type === 'block' && b.style === 'h2') {
      if (current) {
        sections.push(buildSection(current.heading, current.blocks))
      }
      current = { heading: textOf(b), blocks: [] }
    } else if (current) {
      current.blocks.push(b)
    } else {
      preamble.push(b)
    }
  }
  if (current) sections.push(buildSection(current.heading, current.blocks))

  return {
    preamble,
    sections: sections.filter((s) => !SKIP_H2.test(s.heading.trim())),
  }
}

function buildSection(heading: string, blocks: Block[]): Section {
  const compact = COMPACT_H2.test(heading.trim())
  // On retire aussi les dividers en tête/queue de section (ils
  // servaient à séparer visuellement dans le rendu colonne unique,
  // les bandes s'en chargent maintenant).
  const cleaned = blocks.filter(
    (b, i) =>
      !(b._type === 'divider' && (i === 0 || i === blocks.length - 1)),
  )
  const { image, rest } = compact
    ? { image: null, rest: cleaned }
    : extractImage(cleaned)
  return {
    heading,
    id: slugifyHeading(heading),
    blocks: rest,
    sideImage: image,
    compact,
  }
}

export type BodyCta = { href: string; label: string }

export function NationalBodySections({
  blocks,
  cta,
}: {
  blocks: PortableTextBlock[]
  cta?: BodyCta
}) {
  const { preamble, sections } = splitSections(blocks as unknown as Block[])
  if (preamble.length === 0 && sections.length === 0) return null

  let n = 0

  return (
    <div>
      {preamble.length > 0 && (
        <section className="container max-w-3xl py-10">
          <EditorialPortableText value={preamble as unknown as PortableTextBlock[]} />
        </section>
      )}

      {sections.map((s, idx) => {
        const isBand = idx % 2 === 1
        const imageLeft = idx % 4 === 2 // alterne le côté de l'image
        n += 1
        const num = String(n).padStart(2, '0')

        if (s.compact) {
          return (
            <section
              key={s.id || idx}
              id={s.id || undefined}
              className="scroll-mt-24 bg-ink text-ivory"
            >
              <div className="container max-w-4xl py-10 md:py-12">
                <p className="eyebrow text-gold mb-4">{s.heading}</p>
                <div className="text-sm [&_p]:!text-ivory/70 [&_p]:!text-sm [&_li]:!text-ivory/70 [&_li]:!text-sm [&_a]:!text-gold [&_span.flex-1]:!text-ivory/70">
                  <EditorialPortableText
                    value={s.blocks as unknown as PortableTextBlock[]}
                  />
                </div>
              </div>
            </section>
          )
        }

        return (
          <section
            key={s.id || idx}
            id={s.id || undefined}
            className={`scroll-mt-24 ${isBand ? 'bg-ivory-dark/50 border-y border-line' : ''}`}
          >
            <div className="container max-w-6xl py-14 md:py-20">
              {/* En-tête de section */}
              <div className="max-w-3xl">
                <p className="eyebrow text-gold">
                  <span className="tabular-nums">{num}</span>
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-ink mt-3 leading-tight">
                  {s.heading}
                </h2>
                <div className="h-px w-16 bg-gold mt-6" />
              </div>

              {/* Corps : 2 colonnes si image latérale, sinon colonne lecture */}
              {s.sideImage ? (
                <div
                  className={`mt-10 grid gap-10 lg:gap-14 lg:grid-cols-2 items-start`}
                >
                  <figure
                    className={`lg:sticky lg:top-24 ${imageLeft ? '' : 'lg:order-2'}`}
                  >
                    <div className="relative aspect-[4/3] bg-ivory-dark overflow-hidden">
                      <Image
                        src={s.sideImage.url}
                        alt={s.sideImage.alt}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                        unoptimized={
                          s.sideImage.url.startsWith('http') &&
                          !s.sideImage.url.includes('cdn.sanity.io')
                        }
                      />
                    </div>
                    {s.sideImage.caption && (
                      <figcaption className="mt-3 text-sm text-ink-mute italic">
                        {s.sideImage.caption}
                      </figcaption>
                    )}
                  </figure>
                  <div className={imageLeft ? 'lg:order-2' : ''}>
                    <EditorialPortableText
                      value={s.blocks as unknown as PortableTextBlock[]}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-8 max-w-3xl">
                  <EditorialPortableText
                    value={s.blocks as unknown as PortableTextBlock[]}
                  />
                </div>
              )}
            </div>

            {/* CTA conversion après la 2e section */}
            {idx === 1 && cta && (
              <div className="bg-ink text-ivory">
                <div className="container max-w-6xl py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <p className="eyebrow text-gold">Disponible maintenant</p>
                    <p className="font-serif text-xl md:text-2xl mt-2">
                      Le stock change chaque semaine, les belles pièces partent vite.
                    </p>
                  </div>
                  <Link
                    href={cta.href}
                    className="btn-gold inline-flex items-center gap-2 shrink-0"
                  >
                    {cta.label}
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
