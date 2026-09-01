/**
 * Enregistrement automatique des ventes.
 *
 * Dès qu'un client paie sur le site ou accepte un devis, une ligne est
 * créée dans le registre des ventes avec TOUT le détail : chaque
 * produit, les frais de livraison, les prestations ajoutées. C'est ce
 * qui remplace la saisie manuelle du tableau Excel.
 *
 * Les montants du registre sont en TTC, comme dans le suivi de caisse :
 * un devis stocke des prix HT, on applique donc son taux de TVA.
 *
 * Aucune de ces fonctions ne lève : un échec d'enregistrement ne doit
 * jamais bloquer un paiement déjà encaissé. En cas de problème, la
 * vente se ressaisit à la main dans Studio.
 */

import { getWriteClient, isSanityWriteConfigured } from './sanity-write'

const round2 = (n: number) => Math.round(n * 100) / 100

export type SaleLine = {
  _key: string
  _type: 'saleLine'
  name: string
  quantity: number
  unitPrice: number
  kind: 'product' | 'shipping' | 'option'
}

let lineSeq = 0
const nextKey = () => `l${Date.now().toString(36)}${(lineSeq++).toString(36)}`

/** Une vente existe-t-elle déjà pour ce document source ? */
async function alreadyRegistered(
  field: 'sourceQuote' | 'sourceOrder',
  id: string,
): Promise<boolean> {
  const client = getWriteClient()
  if (!client) return false
  try {
    const found = await client.fetch<string | null>(
      `*[_type == "sale" && ${field}._ref == $id][0]._id`,
      { id },
    )
    return !!found
  } catch {
    return false
  }
}

// ─── Depuis un devis accepté ────────────────────────────────

export type QuoteForSale = {
  _id: string
  numero?: string
  customer?: { name?: string; company?: string }
  shippingAddress?: { city?: string }
  lineItems?: Array<{ name?: string; unitPrice?: number; quantity?: number }>
  product?: { name?: string; unitPrice?: number; quantity?: number }
  shippingFee?: number
  selectedDelivery?: { label?: string; price?: number }
  options?: Array<{ label?: string; price?: number }>
  tvaRate?: number
  depositPercent?: number
}

/** Champs à récupérer pour construire une vente à partir d'un devis. */
export const QUOTE_FOR_SALE_PROJECTION = `{
  _id, numero, customer, shippingAddress,
  lineItems[]{ name, unitPrice, quantity },
  product{ name, unitPrice, quantity },
  shippingFee, selectedDelivery, options[]{ label, price },
  tvaRate, depositPercent
}`

/**
 * Construit le document de vente correspondant à un devis, sans rien
 * écrire. Partagé par le webhook Stripe et l'action Studio « enregistrer
 * dans les ventes » : les deux chemins produisent exactement la même
 * ligne, avec le même détail et les mêmes conversions.
 *
 * `paymentMethod` et `date` se surchargent pour un règlement hors ligne,
 * qui n'a ni la date ni le moyen de paiement d'un encaissement Stripe.
 */
export function buildSaleFromQuote(
  q: QuoteForSale,
  opts: { paymentMethod?: string; date?: string; channel?: string } = {},
): Record<string, unknown> {
  const tvaFactor = 1 + (q.tvaRate ?? 20) / 100
  const ttc = (ht: number) => round2(ht * tvaFactor)

  // 1) Les produits — lineItems prioritaire sur le champ legacy
  const rawLines =
    Array.isArray(q.lineItems) && q.lineItems.length > 0
      ? q.lineItems
      : q.product?.name
        ? [q.product]
        : []
  const lines: SaleLine[] = rawLines
    .filter((l) => l?.name)
    .map((l) => ({
      _key: nextKey(),
      _type: 'saleLine' as const,
      name: l.name as string,
      quantity: l.quantity ?? 1,
      unitPrice: ttc(l.unitPrice ?? 0),
      kind: 'product' as const,
    }))

  // 2) La livraison — formule choisie par le client, sinon tarif unique
  const shippingHt = q.selectedDelivery?.label
    ? (q.selectedDelivery.price ?? 0)
    : (q.shippingFee ?? 0)
  const shippingTtc = ttc(shippingHt)
  if (shippingTtc > 0) {
    lines.push({
      _key: nextKey(),
      _type: 'saleLine',
      name:
        q.selectedDelivery?.label ||
        (q.shippingAddress?.city ? `Livraison à ${q.shippingAddress.city}` : 'Livraison'),
      quantity: 1,
      unitPrice: shippingTtc,
      kind: 'shipping',
    })
  }

  // 3) Les prestations ajoutées (montage, évacuation…)
  for (const o of q.options || []) {
    if (!o?.label) continue
    lines.push({
      _key: nextKey(),
      _type: 'saleLine',
      name: o.label,
      quantity: 1,
      unitPrice: ttc(o.price ?? 0),
      kind: 'option',
    })
  }

  const totalTtc = round2(lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0))

  // Acompte : seul l'acompte est réellement encaissé. Le solde fera
  // une seconde vente le jour où il rentre.
  const hasDeposit =
    typeof q.depositPercent === 'number' &&
    q.depositPercent >= 1 &&
    q.depositPercent <= 99
  const collected = hasDeposit
    ? round2(totalTtc * (q.depositPercent! / 100))
    : totalTtc

  const designation = lines
    .filter((l) => l.kind === 'product')
    .map((l) => (l.quantity > 1 ? `${l.quantity}× ${l.name}` : l.name))
    .join(' + ')

  return {
    _type: 'sale',
    date: opts.date || new Date().toISOString().slice(0, 10),
    customerName: q.customer?.company || q.customer?.name || 'Client',
    designation: designation || `Devis ${q.numero || ''}`.trim(),
    amountCollected: collected,
    shippingFee: shippingTtc,
    paymentMethod: opts.paymentMethod || 'stripe',
    saleType: shippingTtc > 0 ? 'autre-livraison' : 'sur-place',
    channel: opts.channel || 'devis',
    lines,
    sourceQuote: { _type: 'reference', _ref: q._id, _weak: true },
    autoCreated: true,
    ...(hasDeposit && {
      notes: `Acompte de ${q.depositPercent} % encaissé. Solde restant : ${round2(
        totalTtc - collected,
      )} € TTC.`,
    }),
  }
}

/**
 * Crée la vente correspondant à un devis accepté et payé.
 * Recopie chaque ligne du devis, plus la livraison et les options.
 */
export async function registerSaleFromQuote(quoteId: string): Promise<void> {
  if (!isSanityWriteConfigured()) return
  const client = getWriteClient()!

  try {
    if (await alreadyRegistered('sourceQuote', quoteId)) return

    const q = await client.fetch<QuoteForSale | null>(
      `*[_type == "quote" && _id == $id][0]${QUOTE_FOR_SALE_PROJECTION}`,
      { id: quoteId },
    )
    if (!q) return

    await client.create(buildSaleFromQuote(q) as never)
  } catch (err) {
    console.error('[sale-register] devis → vente échoué', err)
  }
}

// ─── Depuis une commande payée sur le site ──────────────────

type OrderForSale = {
  _id: string
  numero?: string
  placedAt?: string
  customer?: { name?: string }
  shippingAddress?: { city?: string }
  fulfillmentMode?: 'pickup' | 'delivery'
  items?: Array<{ name?: string; quantity?: number; unitPriceCents?: number }>
  amountTotalCents?: number
}

/** Crée la vente correspondant à une commande payée sur la boutique. */
export async function registerSaleFromOrder(orderId: string): Promise<void> {
  if (!isSanityWriteConfigured()) return
  const client = getWriteClient()!

  try {
    if (await alreadyRegistered('sourceOrder', orderId)) return

    const o = await client.fetch<OrderForSale | null>(
      `*[_type == "order" && _id == $id][0]{
        _id, numero, placedAt, customer, shippingAddress, fulfillmentMode,
        items[]{ name, quantity, unitPriceCents }, amountTotalCents
      }`,
      { id: orderId },
    )
    if (!o) return

    // Les montants Stripe sont déjà en TTC, en centimes.
    const lines: SaleLine[] = (o.items || [])
      .filter((it) => it?.name)
      .map((it) => ({
        _key: nextKey(),
        _type: 'saleLine' as const,
        name: it.name as string,
        quantity: it.quantity ?? 1,
        unitPrice: round2((it.unitPriceCents ?? 0) / 100),
        kind: 'product' as const,
      }))

    const total = round2((o.amountTotalCents ?? 0) / 100)
    const linesTotal = round2(
      lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    )
    // L'écart entre le total payé et la somme des articles correspond
    // aux frais de port facturés par Stripe.
    const shipping = round2(Math.max(0, total - linesTotal))
    if (shipping > 0) {
      lines.push({
        _key: nextKey(),
        _type: 'saleLine',
        name: o.shippingAddress?.city
          ? `Livraison à ${o.shippingAddress.city}`
          : 'Livraison',
        quantity: 1,
        unitPrice: shipping,
        kind: 'shipping',
      })
    }

    const designation = lines
      .filter((l) => l.kind === 'product')
      .map((l) => (l.quantity > 1 ? `${l.quantity}× ${l.name}` : l.name))
      .join(' + ')

    await client.create({
      _type: 'sale',
      date: (o.placedAt || new Date().toISOString()).slice(0, 10),
      customerName: o.customer?.name || 'Client boutique',
      designation: designation || `Commande ${o.numero || ''}`.trim(),
      amountCollected: total,
      shippingFee: shipping,
      paymentMethod: 'stripe',
      saleType: o.fulfillmentMode === 'delivery' ? 'autre-livraison' : 'sur-place',
      channel: 'site',
      lines,
      sourceOrder: { _type: 'reference', _ref: orderId, _weak: true },
      autoCreated: true,
    } as never)
  } catch (err) {
    console.error('[sale-register] commande → vente échoué', err)
  }
}
