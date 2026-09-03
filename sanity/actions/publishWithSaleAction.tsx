import { useClient } from 'sanity'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'
import { useToast } from '@sanity/ui'
import { apiVersion } from '../env'
import { buildSaleFromQuote, type QuoteForSale } from '../../src/lib/sale-register'

/**
 * Enrichit l'action « Publier » d'un devis ou d'une facture.
 *
 * Le statut s'appelle « Accepté + payé » : quand on le coche et qu'on
 * publie, la vente doit s'inscrire dans Gestion sans autre geste. Le
 * paiement par lien Stripe le faisait déjà par le webhook ; ce wrapper
 * fait la même chose pour tout ce qui se règle hors ligne, au TPE, en
 * espèces, par virement ou par chèque.
 *
 * Même constructeur que le webhook (buildSaleFromQuote) : mêmes lignes,
 * même passage en TTC, même gestion de l'acompte. Le moyen de paiement
 * vient du champ « Comment le client a payé » du devis, la date de
 * l'acceptation si elle est connue, sinon du jour.
 *
 * Idempotent : si une vente existe déjà pour ce devis, rien n'est créé.
 * Republier un devis accepté pour corriger une adresse ne fait donc pas
 * de doublon, et un devis déjà passé par Stripe n'est pas compté deux
 * fois.
 *
 * Motif documenté par Sanity : on appelle l'action d'origine, on garde
 * tout ce qu'elle renvoie, on n'enveloppe que onHandle.
 */

type QuoteDraft = QuoteForSale & {
  status?: string
  paymentMethod?: string
  acceptedAt?: string
}

export function withSaleOnAccept(
  original: DocumentActionComponent,
): DocumentActionComponent {
  const Wrapped: DocumentActionComponent = (props: DocumentActionProps) => {
    const result = original(props)
    const client = useClient({ apiVersion })
    const toast = useToast()

    if (!result || props.type !== 'quote') return result

    return {
      ...result,
      onHandle: async () => {
        // 1) Publier, comme avant. Le bouton est désactivé tant que le
        //    document ne passe pas la validation : on arrive ici avec un
        //    brouillon publiable.
        result.onHandle?.()

        const draft = props.draft as QuoteDraft | null
        if (!draft || draft.status !== 'accepted' || !props.id) return

        try {
          // 2) Déjà dans le registre ? Alors rien à faire.
          const existing = await client.fetch<string | null>(
            `*[_type == "sale" && sourceQuote._ref == $id][0]._id`,
            { id: props.id },
          )
          if (existing) return

          // 3) Le brouillon porte l'id « drafts.xxx » : la vente doit
          //    pointer vers le document publié.
          const sale = buildSaleFromQuote(
            { ...draft, _id: props.id },
            {
              paymentMethod: draft.paymentMethod || 'autre',
              date: draft.acceptedAt
                ? draft.acceptedAt.slice(0, 10)
                : new Date().toISOString().slice(0, 10),
              channel: 'devis',
            },
          )
          await client.create(sale as never)

          const amount = (sale.amountCollected as number).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          toast.push({
            status: 'success',
            title: 'Vente enregistrée dans Gestion',
            description: `${amount} € · ${draft.numero || ''}`.trim(),
            duration: 6000,
          })
        } catch (err) {
          toast.push({
            status: 'warning',
            title: 'Publié, mais la vente n\'a pas pu être enregistrée',
            description:
              'Utilise « Enregistrer dans les ventes » sur le devis, ou saisis-la dans Gestion → Ventes.',
            duration: 8000,
          })
          console.warn('[publishWithSale]', err)
        }
      },
    }
  }

  // L'identifiant « publish » doit rester : c'est lui que le Studio
  // reconnaît pour le raccourci clavier et la place du bouton.
  Wrapped.action = original.action
  return Wrapped
}
