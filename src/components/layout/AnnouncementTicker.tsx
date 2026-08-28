/**
 * Bandeau défilant en haut du site.
 *
 * Piloté depuis Sanity (Réglages du site → 📢 Bandeau défilant) :
 * activation, messages et vitesse. La séquence de messages est rendue
 * deux fois et la piste translatée de -50 % : la boucle est donc
 * parfaitement continue, sans saut visible.
 *
 * Le défilement s'arrête au survol, et ne démarre pas du tout pour les
 * visiteurs qui ont désactivé les animations dans leur système.
 */

export type TickerItem = {
  label: string
  detail?: string
}

interface AnnouncementTickerProps {
  items: TickerItem[]
  /** Durée d'un tour complet, en secondes. */
  speed?: number
}

export function AnnouncementTicker({ items, speed = 38 }: AnnouncementTickerProps) {
  if (!items || items.length === 0) return null

  const sequence = (hidden: boolean) => (
    <div className="flex flex-none" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span
          key={`${item.label}-${i}`}
          className="inline-flex items-center whitespace-nowrap px-6 md:px-8"
        >
          <span className="text-gold mr-2 text-[0.6rem]" aria-hidden="true">
            ✦
          </span>
          {item.label}
          {item.detail && (
            <span className="ml-2 text-ivory/55">· {item.detail}</span>
          )}
        </span>
      ))}
    </div>
  )

  return (
    <div
      className="ticker-bar relative overflow-hidden bg-ink py-2.5 text-[0.72rem] tracking-wide text-ivory"
      aria-label="Nos engagements"
    >
      {/* Fondus latéraux : le texte entre et sort en douceur */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-24"
        style={{ background: 'linear-gradient(90deg, #1A1A1A, transparent)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-24"
        style={{ background: 'linear-gradient(270deg, #1A1A1A, transparent)' }}
        aria-hidden="true"
      />

      <div
        className="ticker-track flex w-max"
        style={{ animationDuration: `${speed}s` }}
      >
        {sequence(false)}
        {sequence(true)}
      </div>
    </div>
  )
}
