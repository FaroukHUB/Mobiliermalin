/**
 * GET /api/devis/[uid]/bon-livraison
 *
 * Génère et renvoie le bon de livraison PDF à partir d'un document
 * `quote` Sanity (devis OU facture — mêmes lignes produits).
 * Accessible par ID Sanity — non-devinable, même logique que la
 * facture de commande (/api/orders/[id]/facture).
 *
 * Personnalisation via les champs Sanity du groupe "Bon de livraison" :
 *   blDate       → date de livraison (défaut : aujourd'hui)
 *   blShowPrices → afficher les prix HT / totaux (défaut : non)
 *   blCarrier    → nom du livreur / transporteur
 *   blNotes      → encadré "Précisions" sur le PDF
 *
 * Ne lit que la version PUBLIÉE du document (comme l'envoi devis).
 */

import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { sanityClient } from '@/lib/sanity'
import {
  DeliveryNotePdf,
  type DeliveryNotePdfInput,
} from '@/components/pdf/DeliveryNotePdf'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // react-pdf a besoin de Node

type SanityQuote = {
  _id: string
  numero?: string
  customer?: { name?: string; email?: string; phone?: string; company?: string }
  shippingAddress?: {
    street?: string
    postalCode?: string
    city?: string
    floor?: string
    elevator?: 'yes' | 'no' | 'unknown'
    instructions?: string
  }
  product?: { name?: string; unitPrice?: number; quantity?: number }
  lineItems?: Array<{ name?: string; unitPrice?: number; quantity?: number }>
  shippingFee?: number
  options?: Array<{ label?: string; price?: number }>
  tvaRate?: number
  blDate?: string
  blShowPrices?: boolean
  blCarrier?: string
  blNotes?: string
  blPaymentStatus?: 'paid' | 'due' | 'partial' | 'invoice'
  blPaymentMethod?: string
  blAmountDue?: number
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cb: 'Carte bancaire',
  especes: 'Espèces',
  virement: 'Virement',
  cheque: 'Chèque',
  'en-ligne': 'Paiement en ligne (Stripe)',
  autre: 'Autre',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const { uid } = await params
  if (!uid || typeof uid !== 'string') {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
  }

  let quote: SanityQuote | null = null
  try {
    quote = await sanityClient.fetch<SanityQuote | null>(
      '*[_type == "quote" && _id == $id][0]',
      { id: uid },
    )
  } catch (err) {
    console.error('[bon-livraison] Sanity fetch error', err)
    return NextResponse.json(
      { error: 'Erreur de récupération du devis' },
      { status: 502 },
    )
  }

  if (!quote) {
    return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
  }

  // Lignes : lineItems (nouveau format) prioritaire sur product legacy
  const rawItems =
    quote.lineItems && quote.lineItems.length > 0
      ? quote.lineItems
      : quote.product?.name
        ? [quote.product]
        : []
  const items = rawItems
    .filter((l) => l?.name)
    .map((l) => ({
      name: l.name as string,
      unitPrice: typeof l.unitPrice === 'number' ? l.unitPrice : 0,
      quantity: typeof l.quantity === 'number' && l.quantity > 0 ? l.quantity : 1,
    }))

  if (items.length === 0) {
    return NextResponse.json(
      { error: 'Aucune ligne produit sur ce devis : ajoute au moins un produit (et publie) avant de générer le bon de livraison.' },
      { status: 400 },
    )
  }
  if (!quote.customer?.name) {
    return NextResponse.json(
      { error: 'Nom du client manquant sur le devis publié.' },
      { status: 400 },
    )
  }

  // Numéro BL dérivé du numéro de devis/facture : DEV-2026-0012 → BL-2026-0012
  const numero = (quote.numero || 'BL').replace(/^(DEV|FAC)-/, 'BL-')

  const input: DeliveryNotePdfInput = {
    numero,
    deliveryDate: quote.blDate ? new Date(quote.blDate) : new Date(),
    customer: {
      name: quote.customer.name,
      email: quote.customer.email,
      phone: quote.customer.phone,
      company: quote.customer.company,
    },
    shippingAddress: quote.shippingAddress,
    items,
    options: (quote.options || [])
      .filter((o) => o?.label)
      .map((o) => ({ label: o.label as string, price: o.price ?? 0 })),
    shippingFee: quote.shippingFee ?? 0,
    tvaRate: quote.tvaRate ?? 20,
    showPrices: quote.blShowPrices === true,
    carrier: quote.blCarrier,
    notes: quote.blNotes,
    paymentStatus: quote.blPaymentStatus,
    paymentMethod: quote.blPaymentMethod
      ? PAYMENT_METHOD_LABELS[quote.blPaymentMethod] || quote.blPaymentMethod
      : undefined,
    amountDue:
      typeof quote.blAmountDue === 'number' ? quote.blAmountDue : undefined,
  }

  try {
    const buffer = await renderToBuffer(DeliveryNotePdf(input))
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="bon-livraison-${numero}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[bon-livraison] PDF render error', err)
    return NextResponse.json(
      { error: `Erreur de génération du PDF : ${err instanceof Error ? err.message : 'inconnue'}` },
      { status: 500 },
    )
  }
}
