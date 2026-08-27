import { useState } from 'react'
import { useClient } from 'sanity'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { apiVersion } from '../env'

/**
 * Action Studio "🏬 Vente au magasin" — retire des exemplaires du stock
 * d'un produit après une vente au showroom.
 *
 * Écrit directement via le client Sanity du Studio (les droits de
 * l'utilisateur connecté), sans passer par une route API : pas de clé
 * à saisir.
 *
 * Comportement :
 *   - demande la quantité vendue (1 par défaut)
 *   - retire la quantité du stock, jamais en dessous de 0
 *   - si le stock tombe à 0, propose de passer le produit en "Vendu"
 *   - écrit sur le document publié ET sur le brouillon éventuel, pour
 *     que le site (qui ne lit que la version publiée) soit à jour tout
 *     de suite, sans étape "Publish"
 */
export const sellInStoreAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  const client = useClient({ apiVersion })
  const [running, setRunning] = useState(false)
  const [dialog, setDialog] = useState<
    | { type: 'success'; message: string }
    | { type: 'error'; message: string }
    | null
  >(null)

  if (props.type !== 'product') return null

  const doc = props.published || props.draft
  const currentStock = (doc as { stock?: number } | null)?.stock ?? 0
  const name = (doc as { name?: string } | null)?.name || 'ce produit'

  return {
    label: running ? 'Mise à jour…' : '🏬 Vente au magasin',
    disabled: running || !props.published || currentStock <= 0,
    title:
      currentStock <= 0
        ? 'Stock déjà à 0'
        : !props.published
          ? 'Publie le produit avant d\'enregistrer une vente'
          : `Stock actuel : ${currentStock}`,
    onHandle: async () => {
      if (!props.id) return

      const answer = window.prompt(
        `Vente au magasin — ${name}\nStock actuel : ${currentStock}\n\nCombien d'exemplaires vendus ?`,
        '1',
      )
      if (answer === null) return

      const qty = parseInt(answer, 10)
      if (!Number.isFinite(qty) || qty <= 0) {
        setDialog({ type: 'error', message: 'Quantité invalide.' })
        return
      }
      if (qty > currentStock) {
        setDialog({
          type: 'error',
          message: `Impossible : ${qty} exemplaires vendus mais seulement ${currentStock} en stock. Corrige le stock à la main si nécessaire.`,
        })
        return
      }

      const newStock = currentStock - qty
      let markSold = false
      if (newStock === 0) {
        markSold = window.confirm(
          'Le stock tombe à 0.\n\nOK : le produit passe en "Vendu" et disparaît de la boutique.\nAnnuler : il reste publié (utile si tu attends du réapprovisionnement).',
        )
      }

      setRunning(true)
      setDialog(null)

      const patch: Record<string, unknown> = { stock: newStock }
      if (markSold) patch.status = 'sold'

      const publishedId = props.id.replace(/^drafts\./, '')
      try {
        // Version publiée : c'est elle que lit le site.
        await client.patch(publishedId).set(patch).commit()
        // Brouillon éventuel : évite qu'un ancien stock revienne au
        // prochain "Publish".
        if (props.draft) {
          await client
            .patch(`drafts.${publishedId}`)
            .set(patch)
            .commit()
            .catch(() => undefined)
        }
        setDialog({
          type: 'success',
          message: [
            `✅ ${qty} exemplaire${qty > 1 ? 's' : ''} retiré${qty > 1 ? 's' : ''} du stock.`,
            `Nouveau stock : ${newStock}`,
            markSold ? 'Le produit est passé en "Vendu".' : '',
            'Le site se met à jour d\'ici une minute.',
          ]
            .filter(Boolean)
            .join('\n'),
        })
        setTimeout(() => props.onComplete && props.onComplete(), 1800)
      } catch (err) {
        setDialog({
          type: 'error',
          message:
            err instanceof Error ? err.message : 'Erreur lors de la mise à jour du stock',
        })
      } finally {
        setRunning(false)
      }
    },
    dialog:
      dialog !== null && {
        type: 'confirm' as const,
        tone: dialog.type === 'success' ? 'positive' : 'critical',
        message: dialog.message,
        onCancel: () => setDialog(null),
        onConfirm: () => setDialog(null),
      },
  }
}
