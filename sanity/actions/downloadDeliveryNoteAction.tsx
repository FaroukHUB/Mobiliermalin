import { useState } from 'react'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

/**
 * Action Studio "🚚 Télécharger le bon de livraison" — ouvre le PDF
 * généré par /api/devis/[uid]/bon-livraison dans un nouvel onglet.
 *
 * Disponible sur les documents "quote" (devis ET factures : mêmes
 * lignes produits). Personnalisation via l'onglet "🚚 Bon de livraison"
 * du document (date, prix affichés ou non, livreur, notes).
 */
export const downloadDeliveryNoteAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  const [dialog, setDialog] = useState<string | null>(null)

  if (props.type !== 'quote') return null

  return {
    label: '🚚 Télécharger le bon de livraison',
    onHandle: () => {
      if (!props.id) return

      // Garde-fou : l'API ne lit que la version PUBLIÉE du document.
      // Un brouillon non publié produirait un bon qui ignore les
      // derniers changements (lignes, adresse, options du bon...).
      if (props.draft) {
        setDialog(
          'Ce devis a des modifications NON PUBLIÉES : le bon de livraison ne les inclurait pas. Clique d\'abord sur "Publish" (en bas à droite), puis relance le téléchargement.',
        )
        return
      }

      const cleanId = props.id.replace(/^drafts\./, '')
      window.open(`/api/devis/${cleanId}/bon-livraison`, '_blank', 'noopener')
      props.onComplete()
    },
    dialog:
      dialog !== null && {
        type: 'confirm' as const,
        tone: 'critical' as const,
        message: dialog,
        onCancel: () => setDialog(null),
        onConfirm: () => setDialog(null),
      },
  }
}
