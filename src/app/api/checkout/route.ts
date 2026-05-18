import { NextResponse, type NextRequest } from 'next/server'

const STRIPE_API = 'https://api.stripe.com/v1'

type CheckoutPayload = {
  productId?: string
  slug?: string
  name?: string
  price?: number
  quantity?: number
  fulfillmentMode?: 'pickup' | 'delivery'
  pickupDate?: string
  pickupTime?: string
  pickupLabel?: string
  customerName?: string
  customerEmail?: string
  calBookingId?: string | number
  calBookingUid?: string
}

/**
 * Crée une session Stripe Checkout pour l'achat d'un produit.
 * Si STRIPE_SECRET_KEY n'est pas configuré, retourne une erreur claire.
 *
 * Utilise l'API REST directement (pas le SDK) pour éviter d'alourdir le bundle.
 */
export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json(
      {
        error:
          "Le paiement en ligne n'est pas encore configuré. Contactez-nous pour finaliser votre commande.",
      },
      { status: 503 },
    )
  }

  let body: CheckoutPayload
  try {
    body = (await req.json()) as CheckoutPayload
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const {
    slug,
    name,
    price,
    quantity,
    fulfillmentMode,
    pickupDate,
    pickupTime,
    pickupLabel,
    customerName,
    customerEmail,
    calBookingId,
    calBookingUid,
  } = body
  if (!slug || !name || typeof price !== 'number' || price <= 0) {
    return NextResponse.json({ error: 'Données produit invalides' }, { status: 400 })
  }
  const qty = Math.max(1, Math.min(10, quantity || 1))
  const isPickup = fulfillmentMode === 'pickup'

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host')}`

  // Stripe Checkout Session creation via REST API
  // amount unitaire en centimes
  const unitAmount = Math.round(price * 100)

  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('success_url', `${siteUrl}/commande/succes?session_id={CHECKOUT_SESSION_ID}`)
  params.append('cancel_url', `${siteUrl}/produit/${slug}`)
  params.append('line_items[0][price_data][currency]', 'eur')
  params.append('line_items[0][price_data][product_data][name]', name)
  params.append(
    'line_items[0][price_data][product_data][metadata][slug]',
    slug,
  )
  params.append('line_items[0][price_data][unit_amount]', String(unitAmount))
  params.append('line_items[0][quantity]', String(qty))
  params.append('billing_address_collection', 'required')

  // En mode retrait : pas de collecte d'adresse de livraison (le client vient au showroom).
  // En mode livraison : on collecte l'adresse de livraison.
  if (!isPickup) {
    params.append('shipping_address_collection[allowed_countries][0]', 'FR')
    params.append('shipping_address_collection[allowed_countries][1]', 'BE')
    params.append('shipping_address_collection[allowed_countries][2]', 'LU')
    params.append('shipping_address_collection[allowed_countries][3]', 'CH')
  }

  params.append('locale', 'fr')
  params.append('automatic_tax[enabled]', 'false')

  // Phone collection (utile pour confirmer le créneau de retrait)
  if (isPickup) {
    params.append('phone_number_collection[enabled]', 'true')
  }

  // Pré-remplir l'email Stripe pour éviter au client de le ressaisir
  if (customerEmail && customerEmail.includes('@')) {
    params.append('customer_email', customerEmail)
  }

  // Metadata : retrouvable dans Stripe Dashboard et sur la page de succès
  params.append('metadata[product_slug]', slug)
  params.append('metadata[fulfillment_mode]', isPickup ? 'pickup' : 'delivery')
  if (customerName) params.append('metadata[customer_name]', customerName)
  if (isPickup && pickupDate && pickupTime) {
    params.append('metadata[pickup_date]', pickupDate)
    params.append('metadata[pickup_time]', pickupTime)
    if (pickupLabel) {
      params.append('metadata[pickup_label]', pickupLabel)
    }
    if (calBookingId) params.append('metadata[cal_booking_id]', String(calBookingId))
    if (calBookingUid) params.append('metadata[cal_booking_uid]', calBookingUid)
    // Affiché dans l'email de reçu Stripe automatique
    params.append(
      'payment_intent_data[description]',
      `Retrait au showroom — ${pickupLabel || `${pickupDate} ${pickupTime}`}`,
    )
  }

  try {
    const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[stripe] checkout session error', res.status, errText)
      return NextResponse.json(
        { error: 'Erreur Stripe lors de la création du paiement' },
        { status: 502 },
      )
    }

    const session = (await res.json()) as { url?: string; id?: string }
    if (!session.url) {
      return NextResponse.json(
        { error: 'Session Stripe créée sans URL' },
        { status: 502 },
      )
    }
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe] fetch failed', err)
    return NextResponse.json(
      { error: 'Connexion au service de paiement impossible' },
      { status: 502 },
    )
  }
}
