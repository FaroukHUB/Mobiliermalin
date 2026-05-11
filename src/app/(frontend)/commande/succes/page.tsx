import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Commande confirmée',
  description: 'Votre paiement a été reçu. Merci pour votre commande.',
  robots: { index: false, follow: false },
}

export default function OrderSuccessPage() {
  return (
    <section className="container py-20 md:py-28 max-w-2xl text-center">
      <CheckCircle2 className="h-16 w-16 text-gold mx-auto" strokeWidth={1.25} />
      <h1 className="font-serif text-display mt-8">Commande confirmée</h1>
      <div className="gold-divider mt-6" />
      <p className="mt-6 text-ink-soft leading-relaxed">
        Merci pour votre confiance. Votre paiement a bien été reçu.
      </p>
      <p className="mt-4 text-ink-mute leading-relaxed">
        Vous allez recevoir un email de confirmation sous peu. Notre équipe vous
        recontacte sous <strong className="text-ink">24 h ouvrées</strong> pour
        organiser la livraison ou l&apos;enlèvement à notre showroom d&apos;Aubagne.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link href="/boutique" className="btn-primary">
          Voir d&apos;autres produits
        </Link>
        <Link href="/contact" className="btn-outline">
          Nous contacter
        </Link>
      </div>
    </section>
  )
}
