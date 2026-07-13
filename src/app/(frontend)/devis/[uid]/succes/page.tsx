import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Mail, Phone, Truck, Star } from 'lucide-react'
import { sanityClient } from '@/lib/sanity'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Paiement confirmé',
  robots: { index: false, follow: false },
}

// Lien officiel de review Google (même que dans OrderInvoicePdf)
const GOOGLE_REVIEW_URL = 'https://g.page/r/CUtST0PM2AI0EBM/review'
const QR_IMAGE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(GOOGLE_REVIEW_URL)}`

type QuoteSnippet = {
  numero: string
  documentType?: 'quote' | 'invoice'
  customer: { name: string; email: string }
}

export default async function QuoteSuccessPage({
  params,
}: {
  params: Promise<{ uid: string }>
}) {
  const { uid } = await params

  const quote = await sanityClient.fetch<QuoteSnippet | null>(
    `*[_type == "quote" && _id == $id][0] {
      numero, documentType, customer
    }`,
    { id: uid },
  )

  const isInvoice = quote?.documentType === 'invoice'
  const title = isInvoice ? 'Facture réglée' : 'Devis accepté et payé'

  return (
    <section className="container py-16 md:py-24 max-w-3xl text-center">
      <CheckCircle2 className="h-16 w-16 text-gold mx-auto" strokeWidth={1.25} />
      <h1 className="font-serif text-display mt-8">{title}</h1>
      <div className="gold-divider mx-auto mt-6" />

      <p className="mt-8 text-ink-soft leading-relaxed">
        {quote
          ? `Merci ${quote.customer.name.split(' ')[0]}, votre paiement a bien été reçu.`
          : 'Merci, votre paiement a bien été reçu.'}
      </p>

      {quote && (
        <div className="mt-8 bg-ivory-light border border-line p-6 inline-block">
          <p className="text-xs uppercase tracking-widest text-ink-mute">Référence</p>
          <p className="font-serif text-xl text-ink mt-1">{quote.numero}</p>
        </div>
      )}

      <p className="mt-8 text-ink-soft leading-relaxed max-w-xl mx-auto">
        Votre facture officielle PDF vous a été envoyée par email (délai
        2-5 minutes). Notre équipe organise maintenant la livraison ou le
        retrait de votre commande.
      </p>

      {/* ─── QR Code Google Review ─────────────────────── */}
      <div className="mt-14 bg-ink text-ivory p-8 md:p-12 border-l-4 border-gold text-left">
        <div className="flex items-center gap-2 text-gold mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-5 w-5 fill-current" strokeWidth={0} />
          ))}
        </div>
        <p className="eyebrow text-gold">Merci pour votre confiance</p>
        <h2 className="font-serif text-2xl md:text-3xl mt-2 text-ivory">
          Partagez votre expérience sur Google
        </h2>
        <div className="mt-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="shrink-0 bg-white p-3 rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={QR_IMAGE_URL}
              alt="QR code pour laisser un avis Google sur Mobilier Malin"
              width={200}
              height={200}
              className="block"
            />
          </div>
          <div className="flex-1">
            <p className="text-ivory/85 leading-relaxed">
              Votre retour aide notre équipe artisanale à progresser et
              guide les futurs clients dans leur choix.
            </p>
            <p className="mt-4 text-ivory/70 text-sm leading-relaxed">
              Scannez le QR code avec votre téléphone, ou cliquez
              directement sur le bouton ci-dessous.
            </p>
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-ink px-6 py-3 font-medium transition-colors"
            >
              <Star className="h-4 w-4 fill-current" strokeWidth={0} />
              Laisser un avis Google
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-ivory border border-line p-6 text-left">
        <p className="text-xs uppercase tracking-widest text-ink-mute mb-3">
          Une question ?
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href={`tel:${LEGAL.telephoneTel}`}
            className="flex items-center gap-3 border border-line bg-ivory-light px-4 py-3 hover:border-gold transition"
          >
            <Phone className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-ink-mute">Téléphone</p>
              <p className="text-ink font-medium">{LEGAL.telephone}</p>
            </div>
          </a>
          <a
            href={`mailto:${LEGAL.email}`}
            className="flex items-center gap-3 border border-line bg-ivory-light px-4 py-3 hover:border-gold transition"
          >
            <Mail className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-ink-mute">Email</p>
              <p className="text-ink font-medium break-all">{LEGAL.email}</p>
            </div>
          </a>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link href="/boutique" className="btn-primary">
          Voir d&apos;autres produits
        </Link>
        <Link href="/" className="btn-outline">
          <Truck className="h-4 w-4 inline-block mr-1.5" strokeWidth={1.5} />
          Retour à l&apos;accueil
        </Link>
      </div>
    </section>
  )
}
