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
              className="btn-gold w-full inline-flex items-center justify-center py-4 text-base"
            >
              Ouvrir dans Google Maps
            </a>
            <a
              href={wazeUrl}
              className="btn-outline w-full inline-flex items-center justify-center py-4 text-base"
            >
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
