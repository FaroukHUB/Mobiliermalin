import type { Metadata } from 'next'
import { PanierClient } from './PanierClient'

export const metadata: Metadata = {
  title: 'Votre panier — Mobilier Malin',
  description:
    'Récapitulatif des articles sélectionnés. Payez en ligne pour un retrait au showroom, ou demandez un devis groupé pour une livraison.',
  robots: { index: false, follow: false },
}

export default function PanierPage() {
  return <PanierClient />
}
