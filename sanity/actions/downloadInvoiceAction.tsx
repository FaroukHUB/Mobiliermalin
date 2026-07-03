import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

/**
 * Action Studio "📄 Télécharger la facture" — ouvre le PDF généré
 * dynamiquement par /api/orders/[id]/facture dans un nouvel onglet.
 *
 * Disponible uniquement sur les documents de type "order".
 */
export const downloadInvoiceAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  if (props.type !== 'order') return null

  const doc = props.published || props.draft
  const amountTotalCents = (doc as { amountTotalCents?: number } | null)
    ?.amountTotalCents
  // On désactive si aucun montant (facture vide n'a pas de sens)
  const disabled = !amountTotalCents || amountTotalCents <= 0

  return {
    label: '📄 Télécharger la facture',
    disabled,
    onHandle: () => {
      if (!props.id) return
      // On ouvre le PDF dans un nouvel onglet.
      // L'ID Sanity garde le préfixe "drafts." pour un draft — on le retire.
      const cleanId = props.id.replace(/^drafts\./, '')
      window.open(`/api/orders/${cleanId}/facture`, '_blank', 'noopener')
      props.onComplete()
    },
  }
}
