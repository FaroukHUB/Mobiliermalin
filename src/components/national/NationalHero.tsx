import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { LEGAL } from '@/lib/legal'

/**
 * Hero partagé pour les pages nationales (/fauteuil-ergonomique,
 * /bureau-professionnel-occasion, /marques/steelcase, etc.).
 *
 * Aligné visuellement sur le hero des pages régionales
 * (bureau-occasion-marseille & co) : full-bleed 520-600 px, image
 * background + gradient ink, breadcrumb inline en ivoire, eyebrow +
 * H1 serif + divider or + intro + CTAs.
 *
 * Si aucune image n'est fournie, on rend un fond ink solide (pas de
 * layout shift) — l'admin peut brancher une image via le champ
 * heroImage du document Sanity nationalLandingPage.
 */
export type NationalHeroCTA = {
  label: string
  href: string
  variant?: 'gold' | 'outline'
}

export type NationalHeroProps = {
  breadcrumb: { name: string; href?: string }[]
  eyebrow: string
  title: string
  intro: string
  imageUrl?: string | null
  imageAlt?: string
  ctas?: NationalHeroCTA[]
  showPhone?: boolean
}

export function NationalHero({
  breadcrumb,
  eyebrow,
  title,
  intro,
  imageUrl,
  imageAlt,
  ctas = [],
  showPhone = true,
}: NationalHeroProps) {
  const isExternalImage =
    !!imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('cdn.sanity.io')

  return (
    <section className="relative bg-ink text-ivory overflow-hidden min-h-[520px] md:min-h-[600px] flex items-center">
      {imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            unoptimized={isExternalImage}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/75 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        </div>
      )}
      {!imageUrl && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(184,154,91,0.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(184,154,91,0.10), transparent 55%)',
          }}
          aria-hidden="true"
        />
      )}

      <div className="container relative py-16 md:py-24 w-full">
        <nav aria-label="Fil d'Ariane" className="text-xs text-ivory/60">
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <Link href="/" className="hover:text-gold">
                Accueil
              </Link>
            </li>
            {breadcrumb.map((item, i) => {
              const isLast = i === breadcrumb.length - 1
              return (
                <span key={i} className="contents">
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  <li className={isLast ? 'text-gold' : ''}>
                    {item.href && !isLast ? (
                      <Link href={item.href} className="hover:text-gold">
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                  </li>
                </span>
              )
            })}
          </ol>
        </nav>

        <div className="mt-10 max-w-3xl">
          <p className="eyebrow text-gold">{eyebrow}</p>
          <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
            {title}
          </h1>
          <div className="h-px w-16 bg-gold mt-8" />
          <p className="mt-8 text-lg text-ivory/85 leading-relaxed whitespace-pre-line">
            {intro}
          </p>

          {(ctas.length > 0 || showPhone) && (
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {ctas.map((cta, i) => (
                <Link
                  key={i}
                  href={cta.href}
                  className={
                    cta.variant === 'outline'
                      ? 'btn-outline-light'
                      : 'btn-gold inline-flex items-center gap-2'
                  }
                >
                  {cta.label}
                  {cta.variant !== 'outline' && (
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </Link>
              ))}
              {showPhone && (
                <a
                  href={`tel:${LEGAL.telephoneTel}`}
                  className="btn-outline-light"
                >
                  {LEGAL.telephone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
