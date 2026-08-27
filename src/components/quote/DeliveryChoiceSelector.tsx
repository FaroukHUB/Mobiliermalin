'use client'

import { useState } from 'react'
import { Check, Truck } from 'lucide-react'
import { AcceptQuoteButton } from './AcceptQuoteButton'

/**
 * Sélecteur de formule de livraison sur la page devis du client.
 *
 * Affiché uniquement quand l'admin a défini plusieurs formules dans
 * Sanity (champ deliveryChoices). Le client choisit, le total se
 * recalcule en direct, et l'index choisi part avec l'acceptation :
 * c'est ce prix-là qui est débité et enregistré sur le devis.
 */

export type DeliveryChoice = {
  label: string
  description?: string
  price: number // HT
}

interface DeliveryChoiceSelectorProps {
  quoteUid: string
  numero: string
  customerEmail: string
  documentType?: 'quote' | 'invoice'
  depositPercent?: number
  tvaRate: number
  /** Total HT des lignes produits + options, SANS livraison. */
  baseHt: number
  choices: DeliveryChoice[]
  /** Index préselectionné si le client a déjà choisi une fois. */
  initialIndex?: number
  /** Le devis est-il encore payable (non accepté, non refusé, non expiré) ? */
  payable: boolean
}

function eur(v: number): string {
  return (
    v.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €'
  )
}

export function DeliveryChoiceSelector({
  quoteUid,
  numero,
  customerEmail,
  documentType,
  depositPercent,
  tvaRate,
  baseHt,
  choices,
  initialIndex,
  payable,
}: DeliveryChoiceSelectorProps) {
  const [index, setIndex] = useState<number>(
    typeof initialIndex === 'number' && choices[initialIndex] ? initialIndex : 0,
  )
  const selected = choices[index]
  const subtotalHt = baseHt + (selected?.price ?? 0)
  const tvaAmount = subtotalHt * (tvaRate / 100)
  const totalTtc = subtotalHt + tvaAmount
  const noTva = tvaRate === 0

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-gold" strokeWidth={1.5} />
        <h2 className="font-serif text-xl text-ink">
          Choisissez votre formule de livraison
        </h2>
      </div>
      <p className="mt-2 text-sm text-ink-mute leading-relaxed">
        Le tarif dépend de la prestation souhaitée. Votre choix est enregistré
        avec le devis et transmis à notre équipe de livraison.
      </p>

      <div className="mt-5 space-y-3">
        {choices.map((choice, i) => {
          const active = i === index
          return (
            <label
              key={`${choice.label}-${i}`}
              className={`flex items-start gap-3 border p-4 cursor-pointer transition-colors ${
                active
                  ? 'border-gold bg-ivory-light'
                  : 'border-line bg-ivory hover:border-gold/50'
              }`}
            >
              <input
                type="radio"
                name="delivery-choice"
                checked={active}
                onChange={() => setIndex(i)}
                className="sr-only"
              />
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  active ? 'border-gold bg-gold text-ivory' : 'border-line bg-ivory'
                }`}
                aria-hidden="true"
              >
                {active && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="font-medium text-ink">{choice.label}</span>
                  <span className="text-ink font-medium whitespace-nowrap">
                    {choice.price > 0 ? eur(choice.price) : 'Offert'}
                    {choice.price > 0 && !noTva && (
                      <span className="text-xs text-ink-mute"> HT</span>
                    )}
                  </span>
                </span>
                {choice.description && (
                  <span className="mt-1 block text-sm text-ink-soft leading-relaxed">
                    {choice.description}
                  </span>
                )}
              </span>
            </label>
          )
        })}
      </div>

      {/* Totaux recalculés selon la formule choisie */}
      <div className="mt-6 border border-line">
        {!noTva && (
          <>
            <div className="flex justify-between px-5 py-2.5 text-sm border-b border-line">
              <span className="text-ink-mute">Sous-total HT</span>
              <span className="text-ink">{eur(subtotalHt)}</span>
            </div>
            <div className="flex justify-between px-5 py-2.5 text-sm border-b border-line">
              <span className="text-ink-mute">TVA ({tvaRate} %)</span>
              <span className="text-ink">{eur(tvaAmount)}</span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between bg-ink text-ivory px-5 py-3.5">
          <span className="text-xs uppercase tracking-widest text-gold">
            {noTva ? 'Total à payer' : 'Total TTC à payer'}
          </span>
          <span className="font-serif text-lg">{eur(totalTtc)}</span>
        </div>
      </div>

      {payable && (
        <div className="mt-8">
          <AcceptQuoteButton
            quoteUid={quoteUid}
            numero={numero}
            totalTtc={totalTtc}
            customerEmail={customerEmail}
            documentType={documentType}
            depositPercent={depositPercent}
            deliveryChoiceIndex={index}
          />
          <p className="mt-4 text-center text-xs text-ink-mute leading-relaxed">
            Formule retenue : <strong>{selected?.label}</strong>. Paiement
            sécurisé via Stripe. En cliquant, vous acceptez les CGV jointes au
            devis PDF. Aucune signature manuscrite requise (loi PACTE).
          </p>
        </div>
      )}
    </div>
  )
}
