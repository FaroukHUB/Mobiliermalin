import { NextResponse, type NextRequest } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'

const STRIPE_API = 'https://api.stripe.com/v1'

type LineItem = { name: string; unitPrice: number; quantity: number }

type QuoteDoc = {
  _id: string
  numero: string
  status: string
  validUntil?: string
  customer: { name: string; email: string }
  // Devis legacy (formulaire client) — un seul produit
  product?: { name: string; unitPrice: number; quantity: number }
  // Devis manuel (multi-produits) — array de lignes
  lineItems?: LineItem[]
  shippingFee?: number
  options?: { label: string; price: number }[]
  tvaRate?: number
  depositPercent?: number
}

/**
 * POST /api/devis/[uid]/accepter
 *
 * Crée une session Stripe Checkout pour le paiement intégral du devis.
 * Le client est redirigé vers Stripe. Au paiement réussi, le webhook
 * Stripe (checkout.session.completed) met le devis en statut "accepted".
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const { uid } = await params

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json(
      { error: 'Le paiement en ligne n\'est pas encore configuré. Contactez-nous.' },
      { status: 503 },
    )
  }

  // 1) Charger le devis depuis Sanity
  const quote = await sanityClient.fetch<QuoteDoc | null>(
    `*[_type == "quote" && _id == $id][0] {
      _id, numero, status, validUntil,
      customer, product,
      lineItems[]{ name, unitPrice, quantity },
      shippingFee, options, tvaRate, depositPercent
    }`,
    { id: uid },
  )

  if (!quote) {
    return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
  }

  // 2) Vérifications de statut
  if (quote.status === 'accepted') {
    return NextResponse.json({ error: 'Ce devis a déjà été accepté.' }, { status: 409 })
  }
  if (quote.status === 'refused') {
    return NextResponse.json({ error: 'Ce devis a été refusé.' }, { status: 409 })
  }
  if (quote.validUntil) {
    const expiresAt = new Date(quote.validUntil)
    if (expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Ce devis a expiré.' }, { status: 410 })
    }
  }

  // 3) Calcul du total TTC en centimes
  // Priorité : lineItems (devis manuel multi-produits) > product (devis legacy)
  const tvaRate = quote.tvaRate ?? 20
  const shippingFee = quote.shippingFee ?? 0
  const options = quote.options ?? []
  const linesTotal =
    Array.isArray(quote.lineItems) && quote.lineItems.length > 0
      ? quote.lineItems.reduce((s, li) => s + li.unitPrice * li.quantity, 0)
      : quote.product
        ? quote.product.unitPrice * quote.product.quantity
        : 0
  const optionsTotal = options.reduce((sum, o) => sum + o.price, 0)
  const subtotalHt = linesTotal + shippingFee + optionsTotal
  const tvaAmount = subtotalHt * (tvaRate / 100)
  const totalTtc = Math.round((subtotalHt + tvaAmount) * 100) // en centimes

  if (totalTtc <= 0) {
    return NextResponse.json({ error: 'Montant du devis invalide' }, { status: 400 })
  }

  // Acompte : si depositPercent est défini (1-99), le client ne règle
  // en ligne que ce pourcentage du total. Le solde est encaissé plus
  // tard selon les modalités convenues (hors Stripe).
  const depositPercent =
    typeof quote.depositPercent === 'number' &&
    quote.depositPercent >= 1 &&
    quote.depositPercent <= 99
      ? quote.depositPercent
      : null
  const amountToCharge = depositPercent
    ? Math.round((totalTtc * depositPercent) / 100)
    : totalTtc

  // 4) Construire la session Stripe Checkout
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || `https://${_req.headers.get('host')}`

  const stripeParams = new URLSearchParams()
  stripeParams.append('mode', 'payment')
  stripeParams.append(
    'success_url',
    `${siteUrl}/devis/${uid}/succes?session_id={CHECKOUT_SESSION_ID}`,
  )
  stripeParams.append('cancel_url', `${siteUrl}/devis/${uid}`)
  stripeParams.append('locale', 'fr')
  stripeParams.append('automatic_tax[enabled]', 'false')
  stripeParams.append('customer_email', quote.customer.email)
  stripeParams.append('billing_address_collection', 'required')
  stripeParams.append('phone_number_collection[enabled]', 'true')

  // Une seule ligne avec le total TTC (la TVA est déjà incluse dans le total)
  stripeParams.append('line_items[0][price_data][currency]', 'eur')
  // Label produit : nom du 1er lineItem, ou du legacy product, ou "Devis" seul
  const firstItemName =
    (Array.isArray(quote.lineItems) && quote.lineItems.length > 0
      ? quote.lineItems[0].name
      : quote.product?.name) || 'Devis Mobilier Malin'
  const itemCount =
    Array.isArray(quote.lineItems) && quote.lineItems.length > 1
      ? ` (+${quote.lineItems.length - 1} autre${quote.lineItems.length > 2 ? 's' : ''})`
      : ''
  stripeParams.append(
    'line_items[0][price_data][product_data][name]',
    depositPercent
      ? `Acompte ${depositPercent} % — Devis ${quote.numero} — ${firstItemName}${itemCount}`
      : `Devis ${quote.numero} — ${firstItemName}${itemCount}`,
  )
  stripeParams.append(
    'line_items[0][price_data][product_data][description]',
    depositPercent
      ? `Acompte de ${depositPercent} % sur un total de ${(totalTtc / 100).toFixed(2)} € TTC — solde à régler selon les modalités convenues`
      : `Mobilier + livraison + options (TTC incluant ${tvaRate}% TVA)`,
  )
  stripeParams.append('line_items[0][price_data][unit_amount]', String(amountToCharge))
  stripeParams.append('line_items[0][quantity]', '1')

  // Metadata : retrouvable dans Stripe Dashboard ET dans le webhook
  stripeParams.append('metadata[fulfillment_mode]', 'quote')
  stripeParams.append('metadata[quote_id]', quote._id)
  stripeParams.append('metadata[quote_numero]', quote.numero)
  stripeParams.append('metadata[customer_name]', quote.customer.name)
  if (depositPercent) {
    stripeParams.append('metadata[deposit_percent]', String(depositPercent))
    stripeParams.append('metadata[total_ttc_cents]', String(totalTtc))
  }
  stripeParams.append(
    'payment_intent_data[description]',
    depositPercent
      ? `Acompte ${depositPercent} % — devis ${quote.numero}`
      : `Acceptation devis ${quote.numero}`,
  )

  // ─── FACTURATION AUTOMATIQUE STRIPE ────────────────────────────
  // Après paiement, Stripe génère automatiquement une facture PDF
  // officielle (avec toutes les mentions légales tirées des Business
  // Settings du compte Stripe : SIRET, TVA, adresse) et l'envoie au
  // client par email dans les minutes qui suivent.
  //
  // Prérequis côté Stripe Dashboard : Settings → Business → Details
  // (nom légal, SIRET, TVA intracom) doivent être remplis.
  stripeParams.append('invoice_creation[enabled]', 'true')
  stripeParams.append(
    'invoice_creation[invoice_data][description]',
    `Devis ${quote.numero} accepté — Mobilier Malin`,
  )
  stripeParams.append(
    'invoice_creation[invoice_data][footer]',
    'Produits reconditionnés et contrôlés dans notre atelier de La Penne-sur-Huveaune. Retour sous 14 jours pour les particuliers (loi Hamon). Mobilier Malin — SARL 2 M.',
  )
  stripeParams.append(
    'invoice_creation[invoice_data][metadata][quote_numero]',
    quote.numero,
  )

  // 5) Création de la session Stripe
  try {
    const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripeParams.toString(),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[devis/accepter] stripe error', res.status, errText)
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
    console.error('[devis/accepter] fetch failed', err)
    return NextResponse.json(
      { error: 'Connexion au service de paiement impossible' },
      { status: 502 },
    )
  }
}
