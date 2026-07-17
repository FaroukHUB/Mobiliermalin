import { useState } from 'react'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

/**
 * Action custom Sanity Studio : "Envoyer le devis au client".
 *
 * Disponible uniquement sur les documents de type "quote".
 * Au clic :
 *   1. Demande la clé d'action (DEVIS_ACTION_SECRET) si pas en localStorage
 *   2. Appelle POST /api/devis/[id]/envoyer avec la clé en header
 *   3. Affiche succès / erreur
 *   4. Le statut du devis passe automatiquement à "sent"
 */
export const sendQuoteAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const [running, setRunning] = useState(false)
  const [dialog, setDialog] = useState<
    | { type: 'success'; message: string }
    | { type: 'error'; message: string }
    | null
  >(null)

  // Cette action n'est valide que sur les documents "quote"
  if (props.type !== 'quote') return null

  // Lecture du statut courant pour décider si l'action doit être active/disabled
  const doc = props.draft || props.published
  const status = (doc as { status?: string } | null)?.status
  const isFinalStatus = status === 'accepted' || status === 'refused'

  return {
    label: running ? 'Envoi en cours…' : '📤 Envoyer au client',
    tone: 'primary',
    disabled: running || isFinalStatus,
    onHandle: async () => {
      if (!props.id) {
        setDialog({ type: 'error', message: 'ID du devis manquant.' })
        return
      }

      // Confirmer l'action si statut déjà "sent"
      if (status === 'sent') {
        const confirmResend = window.confirm(
          'Ce devis a déjà été envoyé au client. Le renvoyer (et regénérer le PDF) ?',
        )
        if (!confirmResend) return
      }

      // Demander la clé d'action si pas en cache
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
          body: JSON.stringify({}),
        })

        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean
          numero?: string
          acceptUrl?: string
          totalTtc?: number
          sentTo?: string
          adminBcc?: string | null
          brevoStatus?: number
          error?: string
        }

        if (!res.ok || data.ok === false) {
          // Si 401, on vide la clé pour que le prochain essai redemande
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
            `✅ Devis ${data.numero || ''} envoyé.`,
            data.sentTo ? `Client : ${data.sentTo}` : '',
            data.adminBcc ? `Copie admin (BCC) : ${data.adminBcc}` : '',
            total ? `Montant TTC : ${total}` : '',
            'Le statut est passé à "envoyé".',
          ].filter(Boolean)
          setDialog({
            type: 'success',
            message: lines.join('\n'),
          })
          // Force Sanity à refetch le document après quelques ms
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
