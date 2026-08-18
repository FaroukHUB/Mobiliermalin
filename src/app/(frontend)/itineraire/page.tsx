import type { Metadata } from 'next'
import { MapPin } from 'lucide-react'

/**
 * /itineraire?q=<adresse>
 *
 * Page de choix d'application GPS, ouverte par le QR code du bon de
 * livraison : le livreur scanne, puis choisit Google Maps ou Waze.
 * L'adresse voyage dans l'URL (aucune donnée stockée).
 */

export const metadata: Metadata = {
  title: 'Itinéraire de livraison',
  robots: { index: false, follow: false },
}

/** Pin Google Maps (le repère rouge iconique), dessiné inline. */
function GoogleMapsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#EA4335"
      />
      <circle cx="12" cy="9" r="2.6" fill="#FFFFFF" />
    </svg>
  )
}

/** Bulle Waze (cyan, yeux et sourire), dessinée inline. */
function WazeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        d="M12 3c5 0 9 3.6 9 8.1 0 4.4-4 8-9 8-.6 0-1.2-.05-1.8-.15L6 21v-3.2c-1.9-1.5-3-3.6-3-5.7C3 6.6 7 3 12 3z"
        fill="#33CCFF"
      />
      <circle cx="9.4" cy="10" r="1.15" fill="#1A1A1A" />
      <circle cx="14.6" cy="10" r="1.15" fill="#1A1A1A" />
      <path
        d="M8.8 13.2c.8 1.1 1.9 1.7 3.2 1.7s2.4-.6 3.2-1.7"
        stroke="#1A1A1A"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default async function ItinerairePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const address = (q || '').trim()

  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`

  return (
    <section className="container py-16 md:py-24 max-w-md text-center">
      <MapPin className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
      <h1 className="font-serif text-2xl md:text-3xl mt-4">
        Itinéraire de livraison
      </h1>
      <div className="gold-divider mx-auto mt-5" />

      {address ? (
        <>
          <p className="mt-6 text-ink-soft leading-relaxed">
            Destination :
            <br />
            <span className="font-medium text-ink">{address}</span>
          </p>
          <div className="mt-8 space-y-3">
            <a
              href={gmapsUrl}
              className="btn-gold w-full inline-flex items-center justify-center gap-2.5 py-4 text-base"
            >
              <GoogleMapsIcon />
              Ouvrir dans Google Maps
            </a>
            <a
              href={wazeUrl}
              className="btn-outline w-full inline-flex items-center justify-center gap-2.5 py-4 text-base"
            >
              <WazeIcon />
              Ouvrir dans Waze
            </a>
          </div>
          <p className="mt-6 text-xs text-ink-mute">
            La navigation se lance dans l&apos;application choisie.
          </p>
        </>
      ) : (
        <p className="mt-6 text-ink-soft leading-relaxed">
          Aucune adresse fournie. Scannez le QR code du bon de livraison
          pour ouvrir l&apos;itinéraire.
        </p>
      )}
    </section>
  )
}
