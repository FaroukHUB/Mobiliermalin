import Link from 'next/link'
import { Store, Truck, ArrowRight, Clock, FileText, CalendarCheck } from 'lucide-react'
import { PickupBookingButton } from './PickupBookingButton'

interface DeliveryChoiceProps {
  productId: string
  slug: string
  name: string
  price: number
}

export function DeliveryChoice({ productId, slug, name, price }: DeliveryChoiceProps) {
  const devisHref = `/demander-devis?produit=${encodeURIComponent(slug)}&nom=${encodeURIComponent(name)}&prix=${price}`

  return (
    <div className="mt-8">
      <p className="text-xs uppercase tracking-widest text-ink-mute mb-4">
        Comment souhaitez-vous le récupérer ?
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {/* Retrait showroom */}
        <div className="group relative bg-ivory-light border border-line hover:border-gold transition-colors duration-300 p-5 flex flex-col">
          <div className="flex items-start justify-between">
            <Store className="h-6 w-6 text-gold" strokeWidth={1.5} />
            <span className="text-[0.65rem] uppercase tracking-widest text-gold-dark font-medium border border-gold/40 bg-gold/10 px-2 py-0.5">
              Gratuit
            </span>
          </div>
          <h3 className="font-serif text-lg text-ink mt-3 leading-tight">
            Retrait au showroom
          </h3>
          <p className="text-xs text-ink-mute mt-1.5">
            La Penne-sur-Huveaune (13821) — sur rendez-vous
          </p>
          <ul className="mt-4 space-y-2 text-xs text-ink-soft flex-1">
            <li className="flex items-start gap-2">
              <CalendarCheck className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
              <span>Vous choisissez votre créneau, lundi — samedi 10 h — 18 h</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
              <span>Aucun frais de transport</span>
            </li>
          </ul>
          <div className="mt-5">
            <PickupBookingButton
              productId={productId}
              slug={slug}
              name={name}
              price={price}
            />
          </div>
        </div>

        {/* Livraison sur devis */}
        <div className="group relative bg-ivory-light border border-line hover:border-gold transition-colors duration-300 p-5 flex flex-col">
          <div className="flex items-start justify-between">
            <Truck className="h-6 w-6 text-gold" strokeWidth={1.5} />
            <span className="text-[0.65rem] uppercase tracking-widest text-ink-mute font-medium border border-line bg-ivory px-2 py-0.5">
              Sur devis
            </span>
          </div>
          <h3 className="font-serif text-lg text-ink mt-3 leading-tight">
            Livraison à domicile
          </h3>
          <p className="text-xs text-ink-mute mt-1.5">
            Devis personnalisé
          </p>
          <ul className="mt-4 space-y-2 text-xs text-ink-soft flex-1">
            <li className="flex items-start gap-2">
              <FileText className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
              <span>Devis transmis sous 24 h ouvrées</span>
            </li>
            <li className="flex items-start gap-2">
              <Truck className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
              <span>Tarif adapté à votre adresse et au volume</span>
            </li>
          </ul>
          <div className="mt-5">
            <Link
              href={devisHref}
              className="btn-outline inline-flex items-center gap-2 w-full justify-center"
            >
              Demander un devis
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
