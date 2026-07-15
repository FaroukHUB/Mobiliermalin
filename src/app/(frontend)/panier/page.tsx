import type { Metadata } from 'next'
import { PanierClient } from './PanierClient'

export const metadata: Metadata = {
  // Le template layout ajoute déjà « | Mobilier Malin » — pas de duplication ici.
  title: 'Votre panier',
  description:
    'Récapitulatif des articles sélectionnés. Payez en ligne pour un retrait au showroom, ou demandez un devis groupé pour une livraison.',
  robots: { index: false, follow: true },
}

export default function PanierPage() {
  return <PanierClient />
}
