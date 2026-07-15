import { cn } from '@/lib/utils'

/**
 * Reveal — CSS-only, server component, zéro JS.
 *
 * Historique : la V1 utilisait un IntersectionObserver + useState. Avec 365
 * instances dans le codebase (audit 2026-07), ça générait 365 hydratations
 * client + 365 observers en mémoire → coût CWV/INP non négligeable.
 *
 * V2 : animation-timeline: view() (Chrome 115+, Firefox 129+, Safari 26+).
 * Sur navigateurs sans support → contenu visible immédiatement (fallback
 * gracieux via @supports, cf. globals.css .reveal). Aucune régression SEO —
 * au contraire : le contenu est SSR-rendable et lisible par les crawlers.
 *
 * API 100 % identique à la V1 : aucun fichier appelant à modifier.
 */

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Délai avant début d'animation en ms. Défaut : 0 */
  delay?: number
  /** Distance en pixels du slide-up. Défaut : 8 (sobre) */
  offset?: number
  /** @deprecated Ignoré en V2 (l'`animation-range` CSS pilote le seuil). */
  threshold?: number
  /** Rend le contenu visible immédiatement (au-dessus du fold) */
  immediate?: boolean
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer'
}

export function Reveal({
  children,
  className,
  delay = 0,
  offset = 8,
  immediate = false,
  as: Tag = 'div',
}: RevealProps) {
  const style: React.CSSProperties = {
    ['--reveal-delay' as string]: `${delay}ms`,
    ['--reveal-offset' as string]: `${offset}px`,
  }

  return (
    <Tag
      className={cn('reveal', immediate && 'reveal-immediate', className)}
      style={style}
    >
      {children}
    </Tag>
  )
}
