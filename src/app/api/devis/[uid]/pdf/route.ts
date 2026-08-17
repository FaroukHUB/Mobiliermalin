/**
 * GET /api/devis/[uid]/pdf
 * GET /api/devis/[uid]/pdf?type=facture
 *
 * Génère et renvoie le PDF du devis (ou de la facture) à la demande,
 * sans envoyer d'email. Même rendu exactement que la pièce jointe des
 * envois (composant QuotePdf partagé).
 *
 * Utilisé depuis :
 *  - Sanity Studio (boutons "Télécharger le devis / la facture")
 *  - La page client /devis/[uid] (bouton "Télécharger le PDF")
 *
 * Sécurité : accessible par ID Sanity non-devinable, comme la page
 * d'acceptation /devis/[uid] et la facture de commande. Ne lit que la
 * version PUBLIÉE du document.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuotePdf, type QuotePdfInput } from '@/components/pdf/QuotePdf'
import { sanityClient } from '@/lib/sanity'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // react-pdf a besoin de Node

type QuoteDoc = {
  _id: string
  numero?: string
  validUntil?: string
  _createdAt: string
  customer?: { name?: string; email?: string; phone?: string; company?: string }
  shippingAddress?: {
    street?: string
    postalCode?: string
    city?: string
    floor?: string
    elevator?: 'yes' | 'no' | 'unknown'
  }
  product?: { name?: string; unitPrice?: number; quantity?: number }
  lineItems?: Array<{ name?: string; unitPrice?: number; quantity?: number }>
  shippingFee?: number
  options?: { label: string; price: number }[]
  tvaRate?: number
  tvaExemptionText?: string
  depositPercent?: number
  pdfNotes?: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const { uid } = await params
  if (!uid || typeof uid !== 'string') {
    return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
  }
  const isInvoice = req.nextUrl.searchParams.get('type') === 'facture'

  let quote: QuoteDoc | null = null
  try {
    quote = await sanityClient.fetch<QuoteDoc | null>(
      `*[_type == "quote" && _id == $id][0] {
        _id, numero, validUntil, _createdAt,
        customer, shippingAddress, product,
        lineItems[]{ name, unitPrice, quantity },
        shippingFee, options, tvaRate, tvaExemptionText, depositPercent, pdfNotes
      }`,
      { id: uid },
    )
  } catch (err) {
    console.error('[devis/pdf] Sanity fetch error', err)
    return NextResponse.json(
      { error: 'Erreur de récupération du devis' },
      { status: 502 },
    )
  }

  if (!quote) {
    return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
  }

  // Unifie les lignes : lineItems prioritaire sur product legacy
  const rawLines =
    Array.isArray(quote.lineItems) && quote.lineItems.length > 0
      ? quote.lineItems
      : quote.product
        ? [quote.product]
        : []
  const items = rawLines
    .filter((l) => l?.name && typeof l?.unitPrice === 'number')
    .map((l) => ({
      name: l.name as string,
      unitPrice: l.unitPrice as number,
      quantity: l.quantity ?? 1,
    }))

  const missing: string[] = []
  if (!quote.numero) missing.push('numéro (publie le document pour le générer)')
  if (!quote.customer?.name) missing.push('nom du client')
  if (items.length === 0) missing.push('au moins une ligne produit avec libellé + prix')
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: `Champs manquants : ${missing.join(' · ')}. Vérifie aussi que le document est bien PUBLIÉ (l'API ne voit pas les brouillons).`,
      },
      { status: 422 },
    )
  }

  const emittedAt = new Date(quote._createdAt)
  const validUntil = quote.validUntil
    ? new Date(quote.validUntil)
    : new Date(emittedAt.getTime() + 30 * 24 * 60 * 60 * 1000)

  const displayNumero = isInvoice
    ? quote.numero!.startsWith('FAC')
      ? quote.numero!
      : quote.numero!.replace(/^DEV/, 'FAC')
    : quote.numero!

  const pdfInput: QuotePdfInput = {
    numero: displayNumero,
    docKind: isInvoice ? 'facture' : 'devis',
    emittedAt,
    validUntil,
    customer: {
      name: quote.customer!.name!,
      email: quote.customer!.email || '',
      phone: quote.customer!.phone,
      company: quote.customer!.company,
    },
    shippingAddress: quote.shippingAddress,
    items,
    shippingFee: quote.shippingFee || 0,
    options: quote.options || [],
    tvaRate: quote.tvaRate ?? 20,
    tvaExemptionText: quote.tvaExemptionText,
    depositPercent: quote.depositPercent,
    pdfNotes: quote.pdfNotes,
  }

  try {
    const buffer = await renderToBuffer(QuotePdf(pdfInput))
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${displayNumero}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[devis/pdf] PDF render error', err)
    return NextResponse.json(
      { error: `Erreur de génération du PDF : ${err instanceof Error ? err.message : 'inconnue'}` },
      { status: 500 },
    )
  }
}
