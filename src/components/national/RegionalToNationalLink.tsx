import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Petit bloc discret à injecter dans les pages régionales pour pointer
 * vers la landing nationale correspondante, sans concurrencer le
 * positionnement local de la page hôte.
 *
 * Usage :
 *   <RegionalToNationalLink
 *     landingHref="/fauteuil-ergonomique"
 *     label="Voir aussi notre sélection nationale de fauteuils ergonomiques"
 *   />
 */

type Props = {
  landingHref: string
  label: string
}

export function RegionalToNationalLink({ landingHref, label }: Props) {
  return (
    <section className="container py-6 max-w-4xl">
      <Link
        href={landingHref}
        className="group flex items-center justify-between gap-4 p-4 md:p-5 bg-ivory-light border border-line hover:border-gold transition-colors"
      >
        <span className="text-sm md:text-base text-ink font-medium">
          {label}
        </span>
        <ArrowRight
          className="h-4 w-4 text-gold shrink-0 group-hover:translate-x-1 transition-transform"
          strokeWidth={1.5}
        />
      </Link>
    </section>
  )
}
