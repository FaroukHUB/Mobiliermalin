import type { Rule } from 'sanity'

/**
 * Schema "Vente" (sale) — registre de toutes les ventes, quel que soit
 * le canal : boutique en ligne, devis accepté, showroom, Bon Coin,
 * téléphone.
 *
 * Trois origines possibles :
 *  1. Automatique — un paiement Stripe sur le site ou un devis accepté
 *     crée la vente avec son détail complet (lignes, livraison,
 *     options), et garde le lien vers le document d'origine.
 *  2. Saisie rapide — page /admin/vente pour le showroom.
 *  3. Manuelle — création directe dans Studio pour les cas à part.
 *
 * Reprend les colonnes du suivi Excel : date, client, désignation,
 * montant encaissé, frais de livraison, mode de paiement, type de
 * vente, commentaire. Le « restant après frais » se calcule.
 */

const PAYMENT_METHODS = [
  { value: 'cb', title: '💳 Carte bancaire (TPE)' },
  { value: 'stripe', title: '🔒 Stripe (paiement en ligne)' },
  { value: 'especes', title: '💵 Espèces' },
  { value: 'virement', title: '🏦 Virement' },
  { value: 'cheque', title: '🖊️ Chèque' },
  { value: 'leboncoin', title: '🟠 Paiement Bon Coin' },
  { value: 'autre', title: 'Autre' },
]

const SALE_TYPES = [
  { value: 'sur-place', title: '🏬 Sur place (retrait showroom)' },
  { value: 'livraison-cocolis', title: '📦 Livraison Cocolis' },
  { value: 'autre-livraison', title: '🚚 Autre livraison' },
]

const CHANNELS = [
  { value: 'site', title: '🌐 Site (paiement en ligne)' },
  { value: 'devis', title: '📋 Devis accepté' },
  { value: 'showroom', title: '🏬 Showroom' },
  { value: 'leboncoin', title: '🟠 Bon Coin' },
  { value: 'telephone', title: '📞 Téléphone' },
  { value: 'autre', title: 'Autre' },
]

export const sale = {
  name: 'sale',
  title: 'Vente',
  type: 'document',
  groups: [
    { name: 'main', title: '🧾 Vente', default: true },
    { name: 'lines', title: '📦 Détail' },
    { name: 'link', title: '🔗 Origine' },
  ],
  fields: [
    {
      name: 'date',
      title: 'Date de la vente',
      type: 'date',
      group: 'main',
      validation: (R: Rule) => R.required(),
      options: { dateFormat: 'DD/MM/YYYY' },
    },
    {
      name: 'customerName',
      title: 'Client',
      type: 'string',
      group: 'main',
      validation: (R: Rule) => R.required(),
      description: 'Nom du client ou de la société.',
    },
    {
      name: 'designation',
      title: 'Désignation',
      type: 'text',
      rows: 2,
      group: 'main',
      description:
        'Résumé de ce qui a été vendu. Rempli automatiquement depuis le détail des lignes quand la vente vient d\'un devis ou du site.',
    },
    {
      name: 'amountCollected',
      title: 'Montant encaissé (€ TTC)',
      type: 'number',
      group: 'main',
      validation: (R: Rule) => R.required().min(0),
      description:
        'Ce qui est réellement rentré en caisse. Pour un acompte, saisis l\'acompte : le solde fera une seconde vente.',
    },
    {
      name: 'shippingFee',
      title: 'Frais de livraison facturés (€ TTC)',
      type: 'number',
      group: 'main',
      initialValue: 0,
      validation: (R: Rule) => R.min(0),
      description:
        'Part du montant encaissé qui correspond au transport. Sert à calculer le restant après frais.',
    },
    {
      name: 'paymentMethod',
      title: 'Mode de paiement',
      type: 'string',
      group: 'main',
      options: { list: PAYMENT_METHODS, layout: 'dropdown' },
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'saleType',
      title: 'Type de vente',
      type: 'string',
      group: 'main',
      options: { list: SALE_TYPES, layout: 'radio' },
      initialValue: 'sur-place',
    },
    {
      name: 'channel',
      title: 'Canal',
      type: 'string',
      group: 'main',
      options: { list: CHANNELS, layout: 'dropdown' },
      initialValue: 'showroom',
      description: 'D\'où vient la vente. Permet de mesurer ce que rapporte le site.',
    },
    {
      name: 'notes',
      title: 'Commentaire',
      type: 'text',
      rows: 2,
      group: 'main',
      description: 'Ex : livraison prévue mardi, lavage 60 € Lydie…',
    },

    // ───── Détail des lignes ─────
    {
      name: 'lines',
      title: 'Lignes vendues',
      type: 'array',
      group: 'lines',
      description:
        'Détail recopié du devis ou de la commande. Sur une vente saisie à la main, à remplir seulement si tu veux le détail.',
      of: [
        {
          type: 'object',
          name: 'saleLine',
          fields: [
            {
              name: 'name',
              title: 'Désignation',
              type: 'string',
              validation: (R: Rule) => R.required(),
            },
            {
              name: 'quantity',
              title: 'Quantité',
              type: 'number',
              initialValue: 1,
              validation: (R: Rule) => R.min(1),
            },
            {
              name: 'unitPrice',
              title: 'Prix unitaire (€ TTC)',
              type: 'number',
              validation: (R: Rule) => R.min(0),
            },
            {
              name: 'kind',
              title: 'Nature',
              type: 'string',
              options: {
                list: [
                  { value: 'product', title: 'Produit' },
                  { value: 'shipping', title: 'Livraison' },
                  { value: 'option', title: 'Prestation / option' },
                ],
                layout: 'dropdown',
              },
              initialValue: 'product',
            },
          ],
          preview: {
            select: { title: 'name', qty: 'quantity', unit: 'unitPrice', kind: 'kind' },
            prepare({
              title,
              qty,
              unit,
              kind,
            }: {
              title?: string
              qty?: number
              unit?: number
              kind?: string
            }) {
              const icon =
                kind === 'shipping' ? '🚚' : kind === 'option' ? '🛠' : '📦'
              const total =
                typeof unit === 'number' && typeof qty === 'number'
                  ? `${qty} × ${unit} € = ${Math.round(qty * unit * 100) / 100} € TTC`
                  : undefined
              return { title: `${icon} ${title || '(ligne)'}`, subtitle: total }
            },
          },
        },
      ],
    },

    // ───── Origine ─────
    {
      name: 'sourceQuote',
      title: 'Devis d\'origine',
      type: 'reference',
      to: [{ type: 'quote' }],
      weak: true,
      group: 'link',
      readOnly: true,
      description: 'Renseigné automatiquement quand la vente vient d\'un devis accepté.',
    },
    {
      name: 'sourceOrder',
      title: 'Commande d\'origine',
      type: 'reference',
      to: [{ type: 'order' }],
      weak: true,
      group: 'link',
      readOnly: true,
      description: 'Renseigné automatiquement quand la vente vient d\'un paiement sur le site.',
    },
    {
      name: 'autoCreated',
      title: 'Créée automatiquement',
      type: 'boolean',
      group: 'link',
      readOnly: true,
      initialValue: false,
      description:
        'Vraie si la vente a été enregistrée par le site (paiement en ligne ou devis accepté).',
    },
  ],
  preview: {
    select: {
      date: 'date',
      customerName: 'customerName',
      designation: 'designation',
      amount: 'amountCollected',
      channel: 'channel',
    },
    prepare({
      date,
      customerName,
      designation,
      amount,
      channel,
    }: {
      date?: string
      customerName?: string
      designation?: string
      amount?: number
      channel?: string
    }) {
      const icons: Record<string, string> = {
        site: '🌐',
        devis: '📋',
        showroom: '🏬',
        leboncoin: '🟠',
        telephone: '📞',
        autre: '•',
      }
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
        title: `${icons[channel || ''] || '•'} ${d} · ${customerName || '?'} — ${amt}`,
        subtitle: designation || undefined,
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
      by: [{ field: 'amountCollected', direction: 'desc' }],
    },
  ],
}
