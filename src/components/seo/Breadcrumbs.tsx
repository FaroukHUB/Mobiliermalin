import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Fil d'Ariane SEO-first :
 *   - rend un `<nav>` accessible (aria-label + aria-current sur le dernier)
 *   - injecte un JSON-LD `BreadcrumbList` conforme schema.org
 *   - remplace le path d'URL en SERP par une nav lisible → +CTR ~5-10%
 *
 * Usage :
 *   <Breadcrumbs items={[
 *     { name: 'Boutique', href: '/boutique' },
 *     { name: 'Fauteuils', href: '/categorie/fauteuil' },
 *     { name: 'Steelcase Leap V2' },  // dernier = pas de href
 *   ]} />
 *
 * L'accueil est toujours ajouté en tête, pas besoin de le passer.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export type BreadcrumbItem = {
  name: string
  href?: string
}

export function Breadcrumbs({
  items,
  className = '',
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  const allItems: BreadcrumbItem[] = [
    { name: 'Accueil', href: '/' },
    ...items,
  ]

  // JSON-LD : Google exige des URL absolues et un position 1-indexé.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      ...(item.href && { item: `${SITE_URL}${item.href}` }),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Fil d'Ariane"
        className={`container py-3 text-sm ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-1.5 text-ink-mute">
          {allItems.map((item, idx) => {
            const isLast = idx === allItems.length - 1
            const isFirst = idx === 0
            return (
              <li key={idx} className="flex items-center gap-1.5">
                {!isFirst && (
                  <ChevronRight
                    className="h-3.5 w-3.5 text-ink-mute/50 shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                )}
                {isLast || !item.href ? (
                  <span
                    aria-current="page"
                    className="text-ink font-medium truncate max-w-[220px] sm:max-w-none"
                  >
                    {isFirst ? (
                      <Home className="h-3.5 w-3.5 inline-block" strokeWidth={1.5} aria-label="Accueil" />
                    ) : (
                      item.name
                    )}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-gold-dark transition-colors underline-offset-2 hover:underline flex items-center gap-1"
                  >
                    {isFirst ? (
                      <>
                        <Home className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                        <span className="sr-only">Accueil</span>
                      </>
                    ) : (
                      item.name
                    )}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
