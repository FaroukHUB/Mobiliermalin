import type { Rule } from 'sanity'

/**
 * Schema "Dépense" (expense) — sorties d'argent ponctuelles.
 *
 * Achats de marchandise, transport, carburant, outillage, pièces
 * détachées, publicité… Les charges qui reviennent tous les mois
 * (loyer, assurance, abonnements) se déclarent une seule fois dans
 * le type "Charge fixe" : inutile de les ressaisir chaque mois.
 *
 * Le justificatif se photographie au moment de l'achat : c'est ce qui
 * évite la boîte à chaussures en fin d'exercice.
 */

export const EXPENSE_CATEGORIES = [
  { value: 'marchandise', title: '📦 Achat de marchandise' },
  { value: 'transport', title: '🚚 Transport et livraison' },
  { value: 'carburant', title: '⛽ Carburant et péages' },
  { value: 'atelier', title: '🔧 Atelier, outillage, consommables' },
  { value: 'pieces', title: '⚙️ Pièces détachées' },
  { value: 'vehicule', title: '🚐 Véhicule (entretien, réparation)' },
  { value: 'publicite', title: '📣 Publicité et communication' },
  { value: 'web', title: '💻 Web, logiciels, abonnements' },
  { value: 'frais-bancaires', title: '🏦 Frais bancaires et commissions' },
  { value: 'assurance', title: '🛡 Assurances' },
  { value: 'loyer', title: '🏢 Loyer et charges de local' },
  { value: 'salaires', title: '👥 Salaires et cotisations' },
  { value: 'impots', title: '🧾 Impôts et taxes' },
  { value: 'autre', title: 'Autre' },
]

const PAYMENT_METHODS = [
  { value: 'cb', title: '💳 Carte bancaire' },
  { value: 'virement', title: '🏦 Virement' },
  { value: 'prelevement', title: '🔁 Prélèvement' },
  { value: 'especes', title: '💵 Espèces' },
  { value: 'cheque', title: '🖊️ Chèque' },
  { value: 'autre', title: 'Autre' },
]

export const expense = {
  name: 'expense',
  title: 'Dépense',
  type: 'document',
  fields: [
    {
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (R: Rule) => R.required(),
      options: { dateFormat: 'DD/MM/YYYY' },
    },
    {
      name: 'label',
      title: 'Libellé',
      type: 'string',
      validation: (R: Rule) => R.required(),
      description: 'Ex : Lot 12 fauteuils Klöber, Plein gasoil camion, Roulettes',
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
      title: 'Montant payé (€ TTC)',
      type: 'number',
      validation: (R: Rule) => R.required().min(0),
      description: 'Le montant réellement sorti du compte.',
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
      description:
        'Sert à calculer la TVA récupérable. Mets 0 pour un achat à un particulier ou sous régime de la marge.',
    },
    {
      name: 'supplier',
      title: 'Fournisseur',
      type: 'string',
      description: 'Facultatif, mais utile pour retrouver une dépense plus tard.',
    },
    {
      name: 'paymentMethod',
      title: 'Mode de paiement',
      type: 'string',
      options: { list: PAYMENT_METHODS, layout: 'dropdown' },
      initialValue: 'cb',
    },
    {
      name: 'receipt',
      title: 'Justificatif',
      type: 'image',
      options: { hotspot: false },
      description:
        'Photo de la facture ou du ticket. Prends-la au moment de l\'achat : c\'est ce qui évite de tout chercher en fin d\'année.',
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
      date: 'date',
      label: 'label',
      category: 'category',
      amount: 'amountTtc',
      media: 'receipt',
    },
    prepare({
      date,
      label,
      category,
      amount,
      media,
    }: {
      date?: string
      label?: string
      category?: string
      amount?: number
      media?: unknown
    }) {
      const cat = EXPENSE_CATEGORIES.find((c) => c.value === category)
      const d = date
        ? new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
          })
        : '—'
      const amt =
        typeof amount === 'number'
          ? amount.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) + ' €'
          : ''
      return {
        title: `${d} · ${label || '(sans libellé)'} — ${amt}`,
        subtitle: cat?.title,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Plus récentes d\'abord',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Montant décroissant',
      name: 'amountDesc',
      by: [{ field: 'amountTtc', direction: 'desc' }],
    },
  ],
}
