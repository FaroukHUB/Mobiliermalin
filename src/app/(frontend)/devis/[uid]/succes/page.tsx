import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Mail, Phone, Truck } from 'lucide-react'
import { sanityClient } from '@/lib/sanity'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Devis accepté',
  robots: { index: false, follow: false },
}

type QuoteSnippet = {
  numero: string
  customer: { name: string; email: string }
  product: { name: string }
}

export default async function QuoteSuccessPage({
  params,
}: {
  params: Promise<{ uid: string }>
}) {
  const { uid } = await params

  const quote = await sanityClient.fetch<QuoteSnippet | null>(
    `*[_type == "quote" && _id == $id][0] {
      numero, customer, product
    }`,
    { id: uid },
  )

  return (
    <section className="container py-20 md:py-28 max-w-2xl text-center">
      <CheckCircle2 className="h-16 w-16 text-gold mx-auto" strokeWidth={1.25} />
      <h1 className="font-serif text-display mt-8">Devis accepté et payé</h1>
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

      <p className="mt-8 text-ink-soft leading-relaxed">
        Notre équipe organise maintenant la livraison de votre commande. Vous
        serez recontacté sous <strong className="text-ink">24 à 48 h ouvrées</strong> pour
        convenir d&apos;un créneau de livraison.
      </p>

      <div className="mt-10 bg-ivory border border-line p-6 text-left">
        <p className="text-xs uppercase tracking-widest text-ink-mute mb-3">Une question ?</p>
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
