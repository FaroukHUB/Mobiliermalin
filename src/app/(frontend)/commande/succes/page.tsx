import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, MapPin, Clock, Phone, Mail, CalendarCheck, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Commande confirmée',
  description: 'Votre paiement a été reçu. Merci pour votre commande.',
  robots: { index: false, follow: false },
}

const STRIPE_API = 'https://api.stripe.com/v1'

type StripeSession = {
  id?: string
  amount_total?: number
  customer_email?: string
  customer_details?: { email?: string; name?: string; phone?: string }
  metadata?: {
    fulfillment_mode?: 'pickup' | 'delivery'
    pickup_label?: string
    pickup_date?: string
    pickup_time?: string
    product_slug?: string
    customer_name?: string
    cal_booking_id?: string
    cal_booking_uid?: string
  }
}

async function fetchSession(sessionId: string): Promise<StripeSession | null> {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return null
  try {
    const res = await fetch(`${STRIPE_API}/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as StripeSession
  } catch {
    return null
  }
}

function formatPrice(cents?: number): string {
  if (typeof cents !== 'number') return ''
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

const SHOWROOM_ADDRESS = '18 chemin Noël Robion, 13821 La Penne-sur-Huveaune'
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent(SHOWROOM_ADDRESS)

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const session = session_id ? await fetchSession(session_id) : null

  const isPickup = session?.metadata?.fulfillment_mode === 'pickup'
  const pickupLabel = session?.metadata?.pickup_label
  const hasCalBooking = !!session?.metadata?.cal_booking_id
  const customerName = session?.customer_details?.name || session?.metadata?.customer_name
  const customerEmail = session?.customer_details?.email || session?.customer_email
  const amount = formatPrice(session?.amount_total)

  return (
    <section className="container py-16 md:py-24 max-w-3xl">
      {/* Confirmation */}
      <div className="text-center">
        <CheckCircle2 className="h-16 w-16 text-gold mx-auto" strokeWidth={1.25} />
        <h1 className="font-serif text-display mt-8">Commande confirmée</h1>
        <div className="gold-divider mt-6" />
        <p className="mt-6 text-ink-soft leading-relaxed">
          {customerName ? `Merci ${customerName}, ` : 'Merci pour votre confiance — '}
          votre paiement {amount ? <>de <strong className="text-ink">{amount}</strong></> : null} a bien été reçu.
        </p>
        {customerEmail && (
          <p className="mt-3 text-sm text-ink-mute">
            Une facture sera envoyée à <strong className="text-ink">{customerEmail}</strong> d&apos;ici quelques minutes.
          </p>
        )}
      </div>

      {/* Bloc retrait */}
      {isPickup && (
        <div className="mt-12 bg-ivory-light border border-line">
          <div className="bg-ink text-ivory px-6 md:px-8 py-5">
            <p className="eyebrow text-gold">Récupération de votre commande</p>
            <h2 className="font-serif text-2xl mt-2">Retrait au showroom</h2>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Créneau */}
            {pickupLabel && (
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                  <CalendarCheck className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-mute">
                    Votre créneau confirmé
                  </p>
                  <p className="font-serif text-lg text-ink mt-1 capitalize">
                    {pickupLabel}
                  </p>
                  {hasCalBooking && (
                    <p className="text-xs text-gold-dark mt-1.5 flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                      Réservation ajoutée à l&apos;agenda de notre équipe
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Adresse */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-mute">Adresse</p>
                <p className="font-serif text-lg text-ink mt-1 leading-snug">
                  18 chemin Noël Robion
                  <br />
                  13821 La Penne-sur-Huveaune
                </p>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-gold-dark hover:text-gold underline underline-offset-2"
                >
                  Voir sur Google Maps
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              </div>
            </div>

            {/* Horaires */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-mute">Horaires</p>
                <p className="text-ink mt-1">Lundi — Samedi, 10 h — 18 h</p>
                <p className="text-ink-mute text-sm mt-0.5">Dimanche : fermé</p>
              </div>
            </div>

            {/* Bonnes pratiques */}
            <div className="bg-ivory border border-line p-5 mt-2">
              <p className="text-xs uppercase tracking-widest text-ink-mute mb-3">
                Le jour J
              </p>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li>
                  • Présentez-vous à l&apos;adresse ci-dessus à l&apos;heure réservée.
                </li>
                <li>
                  • Munissez-vous d&apos;une <strong className="text-ink">pièce d&apos;identité</strong> et de votre <strong className="text-ink">numéro de commande</strong> (reçu par email).
                </li>
                <li>
                  • Prévoyez un véhicule adapté au gabarit du mobilier (ou contactez-nous si besoin d&apos;aide pour le transport).
                </li>
                <li>
                  • Pour modifier ou annuler le créneau, appelez-nous au moins <strong className="text-ink">24 h à l&apos;avance</strong>.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Bloc livraison (si jamais on a un mode livraison via Stripe direct) */}
      {!isPickup && session && (
        <div className="mt-12 bg-ivory-light border border-line p-6 md:p-8">
          <p className="eyebrow">Prochaine étape</p>
          <h2 className="font-serif text-2xl text-ink mt-2">Livraison de votre commande</h2>
          <p className="text-ink-soft mt-4 leading-relaxed">
            Notre équipe vous recontacte sous <strong className="text-ink">24 h ouvrées</strong> pour
            organiser la livraison à l&apos;adresse que vous avez renseignée.
          </p>
        </div>
      )}

      {/* Contact toujours visible */}
      <div className="mt-10 bg-ivory border border-line p-6 md:p-8">
        <p className="eyebrow">Une question ?</p>
        <h3 className="font-serif text-xl text-ink mt-2">Notre équipe est à votre écoute</h3>
        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <a
            href="tel:+33676617053"
            className="flex items-center gap-3 border border-line bg-ivory-light px-4 py-3 hover:border-gold transition"
          >
            <Phone className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-ink-mute">Téléphone</p>
              <p className="text-ink font-medium">06 76 61 70 53</p>
            </div>
          </a>
          <a
            href="mailto:mobiliermalin@gmail.com"
            className="flex items-center gap-3 border border-line bg-ivory-light px-4 py-3 hover:border-gold transition"
          >
            <Mail className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-ink-mute">Email</p>
              <p className="text-ink font-medium break-all">mobiliermalin@gmail.com</p>
            </div>
          </a>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link href="/boutique" className="btn-primary">
          Voir d&apos;autres produits
        </Link>
        <Link href="/" className="btn-outline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </section>
  )
}
