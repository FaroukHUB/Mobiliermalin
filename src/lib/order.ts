/**
 * Helpers pour créer et retrouver des documents `order` Sanity à partir
 * des sessions Stripe. Utilisés par le webhook et par la route d'import
 * des commandes passées.
 */

import { getWriteClient, isSanityWriteConfigured } from './sanity-write'

const STRIPE_API = 'https://api.stripe.com/v1'

type StripeSession = {
  id?: string
  payment_status?: string
  amount_total?: number
  currency?: string
  customer_email?: string
  customer_details?: {
    email?: string
    name?: string
    phone?: string
    address?: {
      line1?: string
      line2?: string
      postal_code?: string
      city?: string
      country?: string
    }
  }
  shipping_details?: {
    address?: {
      line1?: string
      line2?: string
      postal_code?: string
      city?: string
      country?: string
    }
  }
  payment_intent?: string
  invoice?: string | { id: string; hosted_invoice_url?: string; invoice_pdf?: string }
  metadata?: Record<string, string>
  created?: number
}

type StripeInvoice = {
  id?: string
  hosted_invoice_url?: string
  invoice_pdf?: string
  number?: string
}

type StripeLineItem = {
  quantity?: number
  amount_total?: number
  price?: {
    unit_amount?: number
    product?: {
      name?: string
      metadata?: Record<string, string>
    }
  }
}

/**
 * Format CDE-YYYY-NNNN — récupère le nombre de commandes déjà créées
 * dans l'année et incrémente. Fallback aléatoire si Sanity indisponible.
 */
export async function generateOrderNumero(): Promise<string> {
  const client = getWriteClient()
  const year = new Date().getFullYear()
  if (!client) {
    return `CDE-${year}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`
  }
  try {
    const count = await client.fetch<number>(
      'count(*[_type == "order" && numero match $prefix])',
      { prefix: `CDE-${year}-*` },
    )
    const next = (count || 0) + 1
    return `CDE-${year}-${next.toString().padStart(4, '0')}`
  } catch {
    return `CDE-${year}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`
  }
}

/** Retrouve un document order existant pour cette session Stripe */
export async function findOrderBySessionId(sessionId: string) {
  const client = getWriteClient()
  if (!client) return null
  try {
    return await client.fetch<{ _id: string } | null>(
      '*[_type == "order" && stripeSessionId == $id][0]{ _id }',
      { id: sessionId },
    )
  } catch {
    return null
  }
}

/** Récupère la facture Stripe (URL PDF hébergée) associée à une session */
async function fetchStripeInvoice(
  stripeKey: string,
  invoiceId: string,
): Promise<StripeInvoice | null> {
  try {
    const res = await fetch(`${STRIPE_API}/invoices/${invoiceId}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    })
    if (!res.ok) return null
    return (await res.json()) as StripeInvoice
  } catch {
    return null
  }
}

/** Récupère les line items d'une session */
async function fetchLineItems(
  stripeKey: string,
  sessionId: string,
): Promise<StripeLineItem[]> {
  try {
    const res = await fetch(
      `${STRIPE_API}/checkout/sessions/${sessionId}/line_items?limit=100&expand[]=data.price.product`,
      { headers: { Authorization: `Bearer ${stripeKey}` } },
    )
    if (!res.ok) return []
    const data = (await res.json()) as { data?: StripeLineItem[] }
    return data.data || []
  } catch {
    return []
  }
}

/**
 * Crée (ou met à jour) un document order Sanity à partir d'une session
 * Stripe complète. Idempotent : si l'order existe déjà (même
 * stripeSessionId), retourne le document existant sans le dupliquer.
 */
export async function upsertOrderFromStripeSession(
  session: StripeSession,
  stripeKey: string,
): Promise<{ ok: true; created: boolean; id: string } | { ok: false; error: string }> {
  if (!isSanityWriteConfigured()) {
    return { ok: false, error: 'SANITY_WRITE_TOKEN absent' }
  }
  const client = getWriteClient()
  if (!client) {
    return { ok: false, error: 'Client Sanity indisponible' }
  }
  if (!session.id) {
    return { ok: false, error: 'Session sans ID' }
  }
  if (session.payment_status !== 'paid') {
    return { ok: false, error: 'Paiement non confirmé' }
  }

  // Idempotence : ne pas dupliquer
  const existing = await findOrderBySessionId(session.id)
  if (existing) {
    return { ok: true, created: false, id: existing._id }
  }

  // Enrichissement : facture + line items
  const invoiceId =
    typeof session.invoice === 'string' ? session.invoice : session.invoice?.id
  const invoice = invoiceId ? await fetchStripeInvoice(stripeKey, invoiceId) : null
  const lineItems = await fetchLineItems(stripeKey, session.id)

  const meta = session.metadata || {}
  const numero = await generateOrderNumero()
  const placedAt =
    typeof session.created === 'number'
      ? new Date(session.created * 1000).toISOString()
      : new Date().toISOString()

  const fulfillmentMode = meta.fulfillment_mode === 'delivery' ? 'delivery' : 'pickup'
  const cust = session.customer_details
  const shipAddr = session.shipping_details?.address

  const items = lineItems.map((li) => ({
    _type: 'object',
    _key: `it-${Math.random().toString(36).slice(2, 10)}`,
    name: li.price?.product?.name || '(article sans nom)',
    slug: li.price?.product?.metadata?.slug || undefined,
    unitPriceCents: li.price?.unit_amount || 0,
    quantity: li.quantity || 1,
  }))

  const doc = {
    _type: 'order',
    numero,
    status: 'paid',
    placedAt,
    customer: {
      name: cust?.name || meta.customer_name || undefined,
      email: cust?.email || session.customer_email || undefined,
      phone: cust?.phone || meta.customer_phone || undefined,
    },
    shippingAddress:
      fulfillmentMode === 'delivery' && shipAddr
        ? {
            line1: shipAddr.line1,
            line2: shipAddr.line2,
            postalCode: shipAddr.postal_code,
            city: shipAddr.city,
            country: shipAddr.country || 'FR',
          }
        : undefined,
    fulfillmentMode,
    pickupSlot:
      fulfillmentMode === 'pickup'
        ? {
            label: meta.pickup_label || undefined,
            date: meta.pickup_date || undefined,
            time: meta.pickup_time || undefined,
            calBookingRef: meta.cal_booking_uid || meta.cal_booking_id || undefined,
          }
        : undefined,
    items,
    amountTotalCents: session.amount_total,
    currency: (session.currency || 'eur').toUpperCase(),
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
    stripeInvoiceId: invoice?.id || (typeof invoiceId === 'string' ? invoiceId : undefined),
    stripeInvoiceUrl: invoice?.hosted_invoice_url || undefined,
    stripeReceiptUrl: undefined, // renseigné plus tard si besoin
  }

  try {
    const created = await client.create(doc)
    return { ok: true, created: true, id: created._id }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erreur Sanity create',
    }
  }
}

/**
 * Met à jour le champ pickupSlot d'un order après que le client a
 * choisi son créneau sur /commande/succes.
 */
export async function updateOrderPickupSlot(
  sessionId: string,
  slot: { label: string; date: string; time: string; calBookingRef?: string },
): Promise<boolean> {
  const client = getWriteClient()
  if (!client) return false
  const existing = await findOrderBySessionId(sessionId)
  if (!existing) return false
  try {
    await client
      .patch(existing._id)
      .set({
        pickupSlot: {
          label: slot.label,
          date: slot.date,
          time: slot.time,
          calBookingRef: slot.calBookingRef,
        },
      })
      .commit()
    return true
  } catch {
    return false
  }
}
