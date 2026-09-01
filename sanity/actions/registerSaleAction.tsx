import { useEffect, useState } from 'react'
import { useClient } from 'sanity'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { apiVersion } from '../env'
import {
  buildSaleFromQuote,
  QUOTE_FOR_SALE_PROJECTION,
  type QuoteForSale,
} from '../../src/lib/sale-register'

/**
 * Action Studio « 💰 Enregistrer dans les ventes » sur un devis.
 *
 * Un devis payé par lien Stripe s'inscrit tout seul dans le registre :
 * le webhook s'en charge. Mais un devis réglé autrement — carte sur le
 * TPE du showroom, espèces, virement, chèque — ne déclenche aucun
 * webhook, donc aucune vente. C'est le cas de la majorité des
 * encaissements, et cette action comble le trou.
 *
 * Elle réutilise exactement le même constructeur que le webhook
 * (buildSaleFromQuote) : mêmes lignes, même conversion HT vers TTC,
 * même gestion de l'acompte. Seuls le moyen de paiement et la date
 * changent, puisqu'ils ne viennent pas de Stripe.
 *
 * L'action disparaît dès qu'une vente existe déjà pour ce devis : pas
 * de double comptage possible.
 */

const PAYMENT_CHOICES: Array<{ value: string; label: string }> = [
  { value: 'cb', label: 'Carte bancaire (TPE)' },
  { value: 'especes', label: 'Espèces' },
  { value: 'virement', label: 'Virement' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'autre', label: 'Autre' },
]

export const registerSaleAction: DocumentActionComponent = (
  props: DocumentActionProps,
) => {
  const client = useClient({ apiVersion })
  const [running, setRunning] = useState(false)
  const [existing, setExisting] = useState<string | null | undefined>(undefined)
  const [dialog, setDialog] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null)

  const isQuote = props.type === 'quote'
  const id = props.id

  // Une vente est-elle déjà enregistrée pour ce devis ?
  useEffect(() => {
    if (!isQuote || !id) return
    let cancelled = false
    client
      .fetch<string | null>(`*[_type == "sale" && sourceQuote._ref == $id][0]._id`, {
        id,
      })
      .then((found) => {
        if (!cancelled) setExisting(found)
      })
      .catch(() => {
        if (!cancelled) setExisting(null)
      })
    return () => {
      cancelled = true
    }
  }, [client, id, isQuote])

  if (!isQuote) return null

  const doc = (props.published || props.draft) as
    | { status?: string; numero?: string }
    | null
  const status = doc?.status

  return {
    label: running ? 'Enregistrement…' : '💰 Enregistrer dans les ventes',
    disabled: running || !!existing || existing === undefined || !props.published,
    title: existing
      ? 'Ce devis est déjà dans le registre des ventes'
      : !props.published
        ? 'Publie le devis avant de l\'enregistrer'
        : 'Pour un devis réglé hors ligne : TPE, espèces, virement, chèque',
    onHandle: async () => {
      if (!id) return

      if (status !== 'accepted') {
        const go = window.confirm(
          `Ce devis n'est pas au statut « accepté ».\n\n` +
            `L'enregistrer quand même dans les ventes du mois ?`,
        )
        if (!go) return
      }

      const method = window.prompt(
        'Comment le client a-t-il payé ?\n\n' +
          PAYMENT_CHOICES.map((c, i) => `${i + 1}. ${c.label}`).join('\n') +
          '\n\nTape le numéro :',
        '1',
      )
      if (method === null) return
      const choice = PAYMENT_CHOICES[parseInt(method, 10) - 1]
      if (!choice) {
        setDialog({ type: 'error', message: 'Choix invalide, rien n\'a été enregistré.' })
        return
      }

      const today = new Date().toISOString().slice(0, 10)
      const date = window.prompt(
        'Date de l\'encaissement (AAAA-MM-JJ) :\n\n' +
          'Laisse la date du jour si le règlement vient de rentrer.',
        today,
      )
      if (date === null) return
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        setDialog({ type: 'error', message: 'Date invalide. Format attendu : 2026-09-01.' })
        return
      }

      setRunning(true)
      try {
        // On relit le devis publié : c'est lui qui fait foi, pas le
        // brouillon éventuellement ouvert dans l'éditeur.
        const q = await client.fetch<QuoteForSale | null>(
          `*[_type == "quote" && _id == $id][0]${QUOTE_FOR_SALE_PROJECTION}`,
          { id },
        )
        if (!q) {
          setDialog({ type: 'error', message: 'Devis introuvable.' })
          return
        }

        // Dernière vérification juste avant d'écrire : deux onglets
        // ouverts ne doivent pas créer deux ventes.
        const already = await client.fetch<string | null>(
          `*[_type == "sale" && sourceQuote._ref == $id][0]._id`,
          { id },
        )
        if (already) {
          setExisting(already)
          setDialog({
            type: 'error',
            message: 'Ce devis est déjà enregistré dans les ventes.',
          })
          return
        }

        const sale = buildSaleFromQuote(q, {
          paymentMethod: choice.value,
          date,
          channel: 'devis',
        })
        const created = await client.create({
          ...sale,
          autoCreated: false,
        } as never)

        setExisting((created as { _id: string })._id)
        setDialog({
          type: 'success',
          message:
            `Vente enregistrée : ${(sale.amountCollected as number).toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} € encaissés le ${new Date(date).toLocaleDateString('fr-FR')}. ` +
            'Elle apparaît dans Gestion → Ventes et dans le Pilotage du mois.',
        })
      } catch (err) {
        setDialog({
          type: 'error',
          message:
            err instanceof Error ? err.message : 'Enregistrement impossible.',
        })
      } finally {
        setRunning(false)
      }
    },
    dialog: dialog
      ? {
          type: 'dialog',
          onClose: () => {
            setDialog(null)
            props.onComplete?.()
          },
          header: dialog.type === 'success' ? 'Vente enregistrée' : 'Impossible',
          content: dialog.message,
        }
      : undefined,
  }
}
