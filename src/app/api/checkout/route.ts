import { NextResponse, type NextRequest } from 'next/server'

const STRIPE_API = 'https://api.stripe.com/v1'

type SingleItemPayload = {
  productId?: string
  slug?: string
  name?: string
  price?: number
  quantity?: number
}

type MultiItemPayload = {
  items: Array<{
    id?: string
    slug: string
    name: string
    price: number
    quantity: number
  }>
}

type CheckoutPayload = (SingleItemPayload | MultiItemPayload) & {
  fulfillmentMode?: 'pickup' | 'delivery'
  pickupDate?: string
  pickupTime?: string
  pickupLabel?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  calBookingId?: string | number
  calBookingUid?: string
}

/**
 * Crée une session Stripe Checkout.
 * Accepte deux formats de payload :
 *  - Legacy (fiche produit isolée) : { slug, name, price, quantity, ... }
 *  - Panier : { items: [{slug, name, price, quantity}, ...], ... }
 *
 * En mode pickup on peut inclure des metadata de créneau
 * (pickupDate/pickupTime/calBooking…). En mode multi-items, le créneau
 * de retrait est convenu séparément (par téléphone/email après paiement).
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

  // Normalise en un tableau d'items commun
  type LineItem = { slug: string; name: string; price: number; quantity: number }
  let lineItems: LineItem[] = []

  if ('items' in body && Array.isArray(body.items)) {
    // Panier
    lineItems = body.items
      .filter(
        (it): it is LineItem =>
          typeof it.slug === 'string' &&
          typeof it.name === 'string' &&
          typeof it.price === 'number' &&
          it.price > 0 &&
          typeof it.quantity === 'number' &&
          it.quantity > 0,
      )
      .map((it) => ({
        slug: it.slug,
        name: it.name,
        price: it.price,
        quantity: Math.min(50, Math.max(1, Math.floor(it.quantity))),
      }))
  } else {
    // Fiche produit isolée (legacy)
    const legacy = body as SingleItemPayload
    if (
      legacy.slug &&
      legacy.name &&
      typeof legacy.price === 'number' &&
      legacy.price > 0
    ) {
      lineItems = [
        {
          slug: legacy.slug,
          name: legacy.name,
          price: legacy.price,
          quantity: Math.max(1, Math.min(10, legacy.quantity || 1)),
        },
      ]
    }
  }

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: 'Aucun article valide à facturer' },
      { status: 400 },
    )
  }

  const {
    fulfillmentMode,
    pickupDate,
    pickupTime,
    pickupLabel,
    customerName,
    customerEmail,
    customerPhone,
    calBookingId,
    calBookingUid,
  } = body as CheckoutPayload
  const isPickup = fulfillmentMode === 'pickup'

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host')}`

  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('success_url', `${siteUrl}/commande/succes?session_id={CHECKOUT_SESSION_ID}`)
  // Cancel URL : retour au panier s'il y a plusieurs items, sinon fiche produit
  const cancelUrl =
    lineItems.length > 1
      ? `${siteUrl}/panier`
      : `${siteUrl}/produit/${lineItems[0].slug}`
  params.append('cancel_url', cancelUrl)

  // Line items — un bloc par produit distinct
  lineItems.forEach((it, i) => {
    const unitAmount = Math.round(it.price * 100)
    params.append(`line_items[${i}][price_data][currency]`, 'eur')
    params.append(`line_items[${i}][price_data][product_data][name]`, it.name)
    params.append(
      `line_items[${i}][price_data][product_data][metadata][slug]`,
      it.slug,
    )
    params.append(`line_items[${i}][price_data][unit_amount]`, String(unitAmount))
    params.append(`line_items[${i}][quantity]`, String(it.quantity))
  })

  params.append('billing_address_collection', 'required')

  // Livraison → collecte d'adresse ; retrait → pas d'adresse de livraison
  if (!isPickup) {
    params.append('shipping_address_collection[allowed_countries][0]', 'FR')
    params.append('shipping_address_collection[allowed_countries][1]', 'BE')
    params.append('shipping_address_collection[allowed_countries][2]', 'LU')
    params.append('shipping_address_collection[allowed_countries][3]', 'CH')
  }

  params.append('locale', 'fr')
  params.append('automatic_tax[enabled]', 'false')

  if (isPickup) {
    params.append('phone_number_collection[enabled]', 'true')
  }

  if (customerEmail && customerEmail.includes('@')) {
    params.append('customer_email', customerEmail)
  }

  // Metadata globales
  const firstSlug = lineItems[0].slug
  const firstName = lineItems[0].name
  const totalItems = lineItems.reduce((sum, it) => sum + it.quantity, 0)
  params.append('metadata[product_slug]', firstSlug)
  params.append('metadata[product_name]', firstName)
  params.append('metadata[fulfillment_mode]', isPickup ? 'pickup' : 'delivery')
  params.append('metadata[distinct_products]', String(lineItems.length))
  params.append('metadata[total_items]', String(totalItems))

  // Résumé lisible des articles pour Djamel (limité à 500 chars pour Stripe metadata)
  const summary = lineItems
    .map((it) => `${it.quantity}× ${it.name}`)
    .join(' | ')
    .slice(0, 500)
  params.append('metadata[cart_summary]', summary)

  if (customerName) params.append('metadata[customer_name]', customerName)
  if (customerPhone) params.append('metadata[customer_phone]', customerPhone)
  if (isPickup && pickupDate && pickupTime) {
    params.append('metadata[pickup_date]', pickupDate)
    params.append('metadata[pickup_time]', pickupTime)
    if (pickupLabel) {
      params.append('metadata[pickup_label]', pickupLabel)
    }
    if (calBookingId) params.append('metadata[cal_booking_id]', String(calBookingId))
    if (calBookingUid) params.append('metadata[cal_booking_uid]', calBookingUid)
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
