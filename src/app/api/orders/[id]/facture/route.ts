/**
 * GET /api/orders/[id]/facture
 *
 * Génère et renvoie la facture PDF officielle Mobilier Malin à partir
 * d'un document `order` Sanity. Accessible par ID Sanity — l'ID est
 * non-devinable (~24 caractères alphanumériques aléatoires).
 *
 * Utilisé depuis :
 *  - Sanity Studio (bouton "📄 Télécharger la facture")
 *  - Email au client (lien de téléchargement direct)
 */

import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { sanityClient, getSiteSettings, urlFor } from '@/lib/sanity'
import { OrderInvoicePdf, type OrderInvoicePdfInput } from '@/components/pdf/OrderInvoicePdf'
import { LEGAL } from '@/lib/legal'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // react-pdf a besoin de Node

type SanityOrder = {
  _id: string
  numero?: string
  placedAt?: string
  customer?: { name?: string; email?: string; phone?: string }
  shippingAddress?: {
    line1?: string
    line2?: string
    postalCode?: string
    city?: string
    country?: string
  }
  fulfillmentMode?: 'pickup' | 'delivery'
  pickupSlot?: { label?: string }
  items?: Array<{
    name?: string
    quantity?: number
    unitPriceCents?: number
  }>
  amountTotalCents?: number
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
  }

  // Fetch order — via le client Sanity public (perspective published)
  let order: SanityOrder | null = null
  try {
    order = await sanityClient.fetch<SanityOrder | null>(
      '*[_type == "order" && _id == $id][0]{ ..., items[]{ name, quantity, unitPriceCents } }',
      { id },
    )
  } catch (err) {
    console.error('[facture] Sanity fetch error', err)
    return NextResponse.json(
      { error: 'Erreur de récupération de la commande' },
      { status: 502 },
    )
  }

  if (!order) {
    return NextResponse.json(
      { error: 'Commande introuvable' },
      { status: 404 },
    )
  }

  if (!order.amountTotalCents || order.amountTotalCents <= 0) {
    return NextResponse.json(
      { error: 'Montant de la commande invalide' },
      { status: 400 },
    )
  }

  // Numéro de facture : dérivé du numéro de commande CDE-YYYY-NNNN → FA-YYYY-NNNN
  const factureNumero = order.numero
    ? order.numero.replace(/^CDE-/, 'FA-')
    : `FA-${new Date().getFullYear()}-????`

  const emittedAt = order.placedAt ? new Date(order.placedAt) : new Date()
  const paidAt = emittedAt

  const items = (order.items || [])
    .filter(
      (
        it,
      ): it is { name: string; quantity: number; unitPriceCents: number } =>
        typeof it.name === 'string' &&
        typeof it.quantity === 'number' &&
        typeof it.unitPriceCents === 'number' &&
        it.quantity > 0,
    )
    .map((it) => ({
      name: it.name,
      quantity: it.quantity,
      unitPriceCents: it.unitPriceCents,
    }))

  // Si le tableau items est vide (par ex. commande importée sans line_items),
  // on met une ligne unique avec le total.
  const finalItems =
    items.length > 0
      ? items
      : [
          {
            name: order.fulfillmentMode === 'delivery'
              ? 'Commande mobilier — livraison'
              : 'Commande mobilier — retrait showroom',
            quantity: 1,
            unitPriceCents: order.amountTotalCents,
          },
        ]

  // Logo du bandeau d'en-tête : version "fond sombre" des Réglages
  // du site. Absent → le bandeau reste en texte seul.
  let logoUrl: string | undefined
  try {
    const settings = await getSiteSettings()
    if (settings.logoOnDark?.asset) {
      logoUrl = urlFor(settings.logoOnDark).height(160).format('png').url()
    }
  } catch (err) {
    console.warn('[facture] logo introuvable, document généré sans logo:', err)
  }

  const pdfInput: OrderInvoicePdfInput = {
    logoUrl,
    numero: factureNumero,
    emittedAt,
    paidAt,
    customer: {
      name: order.customer?.name || 'Client',
      email: order.customer?.email,
      phone: order.customer?.phone,
    },
    shippingAddress: order.shippingAddress,
    fulfillmentMode: order.fulfillmentMode === 'delivery' ? 'delivery' : 'pickup',
    pickupLabel: order.pickupSlot?.label,
    items: finalItems,
    amountTotalCents: order.amountTotalCents,
    tvaRate: LEGAL.tauxTvaDefaut,
    paymentMethod: 'Carte bancaire (Stripe)',
  }

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(OrderInvoicePdf(pdfInput))
  } catch (err) {
    console.error('[facture] PDF render error', err)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 },
    )
  }

  const filename = `${factureNumero}-mobilier-malin.pdf`
  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
