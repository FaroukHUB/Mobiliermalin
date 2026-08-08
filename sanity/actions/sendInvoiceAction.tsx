import { useState } from 'react'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

/**
 * Action custom Sanity Studio : "Envoyer la facture au client".
 *
 * Disponible sur les documents "quote". Contrairement à l'envoi de
 * devis, l'email envoyé ne contient AUCUN lien de paiement : juste la
 * facture PDF (intitulée FACTURE, numéro FAC-...) en pièce jointe.
 * Utilisé pour les ventes réglées par virement, au showroom, etc.
 *
 * Même mécanisme d'auth que sendQuoteAction (clé DEVIS_ACTION_SECRET
 * mise en cache localStorage sous mm_devis_secret).
 */
export const sendInvoiceAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const [running, setRunning] = useState(false)
  const [dialog, setDialog] = useState<
    | { type: 'success'; message: string }
    | { type: 'error'; message: string }
    | null
  >(null)

  if (props.type !== 'quote') return null

  const doc = props.draft || props.published
  const invoiceSentAt = (doc as { invoiceSentAt?: string } | null)?.invoiceSentAt

  return {
    label: running ? 'Envoi en cours…' : '🧾 Envoyer la facture (sans lien de paiement)',
    disabled: running,
    onHandle: async () => {
      if (!props.id) {
        setDialog({ type: 'error', message: 'ID du document manquant.' })
        return
      }

      // Garde-fou : l'API ne lit que la version PUBLIÉE du document.
      // Envoyer avec des modifications en brouillon produirait un PDF
      // qui ignore les derniers changements (frais de livraison,
      // lignes, prix...). On bloque et on demande de publier d'abord.
      if (props.draft) {
        setDialog({
          type: 'error',
          message:
            'Ce devis a des modifications NON PUBLIÉES : le document envoyé ne les inclurait pas. Clique d\'abord sur "Publish" (en bas à droite), puis relance l\'envoi.',
        })
        return
      }

      if (invoiceSentAt) {
        const confirmResend = window.confirm(
          `Une facture a déjà été envoyée le ${new Date(invoiceSentAt).toLocaleDateString('fr-FR')}. La renvoyer ?`,
        )
        if (!confirmResend) return
      }

      let secret = window.localStorage.getItem('mm_devis_secret') || ''
      if (!secret) {
        const entered = window.prompt(
          'Clé d\'action devis (configurée dans Vercel sous DEVIS_ACTION_SECRET) :',
        )
        if (!entered) return
        secret = entered.trim()
        if (secret) window.localStorage.setItem('mm_devis_secret', secret)
      }

      setRunning(true)
      setDialog(null)

      try {
        const res = await fetch(`/api/devis/${encodeURIComponent(props.id)}/envoyer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-devis-secret': secret,
          },
          body: JSON.stringify({ mode: 'facture' }),
        })

        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean
          numero?: string
          totalTtc?: number
          sentTo?: string
          adminBcc?: string | null
          error?: string
        }

        if (!res.ok || data.ok === false) {
          if (res.status === 401) {
            window.localStorage.removeItem('mm_devis_secret')
          }
          setDialog({
            type: 'error',
            message: data.error || `Erreur HTTP ${res.status}`,
          })
        } else {
          const total = data.totalTtc
            ? data.totalTtc.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) + ' €'
            : ''
          const lines = [
            `✅ Facture ${data.numero || ''} envoyée (sans lien de paiement).`,
            data.sentTo ? `Client : ${data.sentTo}` : '',
            data.adminBcc ? `Copie admin (BCC) : ${data.adminBcc}` : '',
            total ? `Montant TTC : ${total}` : '',
          ].filter(Boolean)
          setDialog({ type: 'success', message: lines.join('\n') })
          setTimeout(() => {
            props.onComplete && props.onComplete()
          }, 1500)
        }
      } catch (err) {
        setDialog({
          type: 'error',
          message: err instanceof Error ? err.message : 'Erreur réseau',
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
