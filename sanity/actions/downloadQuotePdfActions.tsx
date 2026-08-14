import { useState } from 'react'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

/**
 * Actions Studio de téléchargement direct du PDF devis / facture,
 * sans envoi d'email. Ouvre /api/devis/[uid]/pdf(?type=facture) dans
 * un nouvel onglet. Même rendu exactement que la pièce jointe des
 * envois (composant QuotePdf partagé).
 *
 * Garde-fou commun : la route ne lit que la version PUBLIÉE, on bloque
 * donc si le document a des modifications en brouillon.
 */

function makeDownloadAction(kind: 'devis' | 'facture'): DocumentActionComponent {
  const label =
    kind === 'facture'
      ? '⬇️ Télécharger la facture (PDF)'
      : '⬇️ Télécharger le devis (PDF)'

  const Action: DocumentActionComponent = (props: DocumentActionProps) => {
    const [dialog, setDialog] = useState<string | null>(null)

    if (props.type !== 'quote') return null

    return {
      label,
      onHandle: () => {
        if (!props.id) return

        if (props.draft) {
          setDialog(
            'Ce document a des modifications NON PUBLIÉES : le PDF ne les inclurait pas. Clique d\'abord sur "Publish" (en bas à droite), puis relance le téléchargement.',
          )
          return
        }

        const cleanId = props.id.replace(/^drafts\./, '')
        const url =
          kind === 'facture'
            ? `/api/devis/${cleanId}/pdf?type=facture`
            : `/api/devis/${cleanId}/pdf`
        window.open(url, '_blank', 'noopener')
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
  return Action
}

export const downloadQuotePdfAction = makeDownloadAction('devis')
export const downloadInvoicePdfAction = makeDownloadAction('facture')
