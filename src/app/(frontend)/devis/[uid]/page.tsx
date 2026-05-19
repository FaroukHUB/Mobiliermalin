import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, FileText, Clock, AlertCircle } from 'lucide-react'
import { sanityClient } from '@/lib/sanity'
import { LEGAL } from '@/lib/legal'
import { AcceptQuoteButton } from '@/components/quote/AcceptQuoteButton'

export const metadata: Metadata = {
  title: 'Accepter votre devis',
  robots: { index: false, follow: false },
}

type QuoteDoc = {
  _id: string
  numero: string
  status: string
  validUntil?: string
  _createdAt: string
  customer: { name: string; email: string; phone?: string; company?: string }
  shippingAddress: {
    street: string
    postalCode: string
    city: string
    floor?: string
    elevator?: 'yes' | 'no' | 'unknown'
  }
  product: { name: string; unitPrice: number; quantity: number }
  shippingFee?: number
  options?: { label: string; price: number }[]
  tvaRate?: number
  pdfNotes?: string
}

function eur(v: number): string {
  return v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function dateFr(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function QuoteAcceptPage({
  params,
}: {
  params: Promise<{ uid: string }>
}) {
  const { uid } = await params

  const quote = await sanityClient.fetch<QuoteDoc | null>(
    `*[_type == "quote" && _id == $id][0] {
      _id, numero, status, validUntil, _createdAt,
      customer, shippingAddress, product,
      shippingFee, options, tvaRate, pdfNotes
    }`,
    { id: uid },
  )

  if (!quote) notFound()

  const tvaRate = quote.tvaRate ?? 20
  const shippingFee = quote.shippingFee ?? 0
  const options = quote.options ?? []
  const productTotal = quote.product.unitPrice * quote.product.quantity
  const optionsTotal = options.reduce((sum, o) => sum + o.price, 0)
  const subtotalHt = productTotal + shippingFee + optionsTotal
  const tvaAmount = subtotalHt * (tvaRate / 100)
  const totalTtc = subtotalHt + tvaAmount

  const validUntil = quote.validUntil ? new Date(quote.validUntil) : null
  const isExpired = validUntil ? validUntil.getTime() < Date.now() : false
  const isAccepted = quote.status === 'accepted'
  const isRefused = quote.status === 'refused'

  return (
    <section className="container py-12 md:py-16 max-w-3xl">
      <p className="eyebrow text-center">Devis personnalisé</p>
      <h1 className="text-display mt-3 font-serif text-center leading-[1.05]">
        Devis {quote.numero}
      </h1>
      <div className="gold-divider mx-auto mt-6" />
      <p className="mt-6 text-center text-ink-soft leading-relaxed">
        Bonjour {quote.customer.name.split(' ')[0]}, voici le récapitulatif de
        votre devis. Cliquez sur « Accepter et payer » en bas pour valider.
      </p>

      {/* Statut */}
      {isAccepted && (
        <div className="mt-8 bg-green-50 border border-green-200 p-5 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-green-700 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-green-900 font-medium">Devis déjà accepté et payé</p>
            <p className="text-sm text-green-800 mt-1">
              Votre commande est en cours de préparation. Vous recevrez un email dès que la
              livraison sera planifiée.
            </p>
          </div>
        </div>
      )}

      {isRefused && (
        <div className="mt-8 bg-red-50 border border-red-200 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-red-900 font-medium">Ce devis a été refusé</p>
            <p className="text-sm text-red-800 mt-1">
              Pour reprendre contact, écrivez-nous à {LEGAL.email}.
            </p>
          </div>
        </div>
      )}

      {isExpired && !isAccepted && !isRefused && (
        <div className="mt-8 bg-amber-50 border border-amber-200 p-5 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-amber-900 font-medium">Devis expiré</p>
            <p className="text-sm text-amber-800 mt-1">
              Ce devis n&apos;est plus valable depuis le {dateFr(validUntil!)}. Contactez-nous
              pour en obtenir un nouveau.
            </p>
          </div>
        </div>
      )}

      {/* Récap */}
      <div className="mt-10 bg-ivory-light border border-line">
        <div className="bg-ink text-ivory px-6 py-4 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-gold">Récapitulatif</span>
          {validUntil && !isExpired && (
            <span className="text-xs text-ivory/70">Valable jusqu&apos;au {dateFr(validUntil)}</span>
          )}
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-mute mb-2">Client</p>
            <p className="text-ink font-medium">{quote.customer.name}</p>
            {quote.customer.company && (
              <p className="text-ink-soft text-xs mt-0.5">{quote.customer.company}</p>
            )}
            <p className="text-ink-soft text-xs mt-0.5">{quote.customer.email}</p>
            <p className="text-ink-soft text-xs mt-0.5">{quote.customer.phone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-mute mb-2">Livraison</p>
            <p className="text-ink">{quote.shippingAddress.street}</p>
            <p className="text-ink">
              {quote.shippingAddress.postalCode} {quote.shippingAddress.city}
            </p>
            {(quote.shippingAddress.floor || quote.shippingAddress.elevator !== 'unknown') && (
              <p className="text-ink-mute text-xs mt-1">
                {quote.shippingAddress.floor ? `Étage ${quote.shippingAddress.floor} — ` : ''}
                Ascenseur :{' '}
                {quote.shippingAddress.elevator === 'yes'
                  ? 'oui'
                  : quote.shippingAddress.elevator === 'no'
                    ? 'non'
                    : 'à confirmer'}
              </p>
            )}
          </div>
        </div>

        <table className="w-full text-sm border-t border-line">
          <thead className="bg-ivory-dark">
            <tr className="text-xs uppercase tracking-widest text-ink-mute">
              <th className="text-left px-6 py-3 font-medium">Désignation</th>
              <th className="text-center px-3 py-3 font-medium">Qté</th>
              <th className="text-right px-3 py-3 font-medium">P.U. HT</th>
              <th className="text-right px-6 py-3 font-medium">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <td className="px-6 py-3 text-ink">{quote.product.name}</td>
              <td className="px-3 py-3 text-center text-ink">{quote.product.quantity}</td>
              <td className="px-3 py-3 text-right text-ink">{eur(quote.product.unitPrice)}</td>
              <td className="px-6 py-3 text-right text-ink font-medium">{eur(productTotal)}</td>
            </tr>
            {shippingFee > 0 && (
              <tr>
                <td className="px-6 py-3 text-ink">
                  Livraison à {quote.shippingAddress.city}
                </td>
                <td className="px-3 py-3 text-center text-ink">1</td>
                <td className="px-3 py-3 text-right text-ink">{eur(shippingFee)}</td>
                <td className="px-6 py-3 text-right text-ink font-medium">{eur(shippingFee)}</td>
              </tr>
            )}
            {options.map((opt, i) => (
              <tr key={i}>
                <td className="px-6 py-3 text-ink">{opt.label}</td>
                <td className="px-3 py-3 text-center text-ink">1</td>
                <td className="px-3 py-3 text-right text-ink">{eur(opt.price)}</td>
                <td className="px-6 py-3 text-right text-ink font-medium">{eur(opt.price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-line text-sm">
            <tr>
              <td colSpan={3} className="px-6 py-2 text-right text-ink-mute">Sous-total HT</td>
              <td className="px-6 py-2 text-right text-ink">{eur(subtotalHt)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="px-6 py-2 text-right text-ink-mute">
                TVA ({tvaRate} %)
              </td>
              <td className="px-6 py-2 text-right text-ink">{eur(tvaAmount)}</td>
            </tr>
            <tr className="bg-ink text-ivory">
              <td colSpan={3} className="px-6 py-3 text-right text-xs uppercase tracking-widest text-gold">
                Total TTC à payer
              </td>
              <td className="px-6 py-3 text-right text-lg font-serif">{eur(totalTtc)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {quote.pdfNotes && (
        <div className="mt-6 bg-ivory-light border-l-4 border-gold p-4">
          <p className="text-xs uppercase tracking-widest text-ink-mute mb-2">Précisions</p>
          <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
            {quote.pdfNotes}
          </p>
        </div>
      )}

      {/* CTA accepter / payer */}
      {!isAccepted && !isRefused && !isExpired && (
        <div className="mt-10">
          <AcceptQuoteButton
            quoteUid={quote._id}
            numero={quote.numero}
            totalTtc={totalTtc}
            customerEmail={quote.customer.email}
          />
          <p className="mt-4 text-center text-xs text-ink-mute leading-relaxed">
            Paiement sécurisé via Stripe. En cliquant, vous acceptez les CGV jointes
            au devis PDF. Aucune signature manuscrite requise (loi PACTE).
          </p>
        </div>
      )}

      {/* Footer infos */}
      <div className="mt-12 text-center text-xs text-ink-mute leading-relaxed">
        <p className="flex items-center justify-center gap-1.5">
          <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
          Une question ? <Link href="/contact" className="text-gold-dark underline">Contactez-nous</Link>
        </p>
        <p className="mt-3">
          {LEGAL.nomCommercial} — {LEGAL.raisonSociale} {LEGAL.formeJuridique} ·
          SIREN {LEGAL.siren} · TVA {LEGAL.tvaIntracom}
        </p>
      </div>
    </section>
  )
}
