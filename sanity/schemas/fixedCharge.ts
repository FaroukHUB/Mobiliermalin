import type { Rule } from 'sanity'

/**
 * Schema "Charge fixe" (fixedCharge) — dépenses qui tombent tous les
 * mois : loyer, assurance, abonnements, mutuelle, crédit véhicule…
 *
 * Déclarée UNE SEULE FOIS. Le tableau de bord la compte
 * automatiquement dans chaque mois compris entre sa date de début et
 * sa date de fin (vide = toujours en cours). Aucune ressaisie
 * mensuelle, et une charge arrêtée cesse d'être comptée sans effacer
 * l'historique des mois précédents.
 */

import { EXPENSE_CATEGORIES } from './expense'

export const fixedCharge = {
  name: 'fixedCharge',
  title: 'Charge fixe',
  type: 'document',
  fields: [
    {
      name: 'label',
      title: 'Libellé',
      type: 'string',
      validation: (R: Rule) => R.required(),
      description: 'Ex : Loyer entrepôt, Assurance pro, Abonnement Vercel',
    },
    {
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: { list: EXPENSE_CATEGORIES, layout: 'dropdown' },
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'amountTtc',
      title: 'Montant mensuel (€ TTC)',
      type: 'number',
      validation: (R: Rule) => R.required().min(0),
      description:
        'Pour une charge annuelle ou trimestrielle, divise par 12 ou par 3 : le tableau de bord raisonne au mois.',
    },
    {
      name: 'tvaRate',
      title: 'Taux de TVA (%)',
      type: 'number',
      initialValue: 20,
      options: {
        list: [
          { value: 20, title: '20 %' },
          { value: 10, title: '10 %' },
          { value: 5.5, title: '5,5 %' },
          { value: 0, title: '0 % (pas de TVA récupérable)' },
        ],
        layout: 'dropdown',
      },
    },
    {
      name: 'supplier',
      title: 'Fournisseur / bénéficiaire',
      type: 'string',
    },
    {
      name: 'startDate',
      title: 'À compter du',
      type: 'date',
      validation: (R: Rule) => R.required(),
      options: { dateFormat: 'DD/MM/YYYY' },
      description: 'Premier mois où la charge doit être comptée.',
    },
    {
      name: 'endDate',
      title: 'Jusqu\'au (si terminée)',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      description:
        'Laisse vide tant que la charge court. En la renseignant, elle cesse d\'être comptée sans disparaître des mois passés.',
    },
    {
      name: 'notes',
      title: 'Commentaire',
      type: 'text',
      rows: 2,
    },
  ],
  preview: {
    select: {
      label: 'label',
      amount: 'amountTtc',
      category: 'category',
      endDate: 'endDate',
    },
    prepare({
      label,
      amount,
      category,
      endDate,
    }: {
      label?: string
      amount?: number
      category?: string
      endDate?: string
    }) {
      const cat = EXPENSE_CATEGORIES.find((c) => c.value === category)
      const amt =
        typeof amount === 'number'
          ? amount.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) + ' € / mois'
          : ''
      const ended = endDate && new Date(endDate) < new Date()
      return {
        title: `${ended ? '⏹' : '🔁'} ${label || '(sans libellé)'} — ${amt}`,
        subtitle: ended
          ? `Terminée le ${new Date(endDate).toLocaleDateString('fr-FR')}`
          : cat?.title,
      }
    },
  },
  orderings: [
    {
      title: 'Montant décroissant',
      name: 'amountDesc',
      by: [{ field: 'amountTtc', direction: 'desc' }],
    },
  ],
}
