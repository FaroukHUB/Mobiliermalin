import type { Rule } from 'sanity'

/**
 * Document Commande — créé automatiquement par le webhook Stripe à
 * chaque paiement confirmé. Djamel n'a jamais besoin de créer un doc
 * manuellement ; il consulte, met à jour le statut, télécharge la
 * facture Stripe.
 */

const STATUSES = [
  { title: '🟡 Paiement reçu — à préparer', value: 'paid' },
  { title: '📦 Prête (retrait ou livraison)', value: 'ready' },
  { title: '✅ Retirée / livrée', value: 'fulfilled' },
  { title: '❌ Annulée / remboursée', value: 'refunded' },
]

const FULFILLMENT_MODES = [
  { title: '🏬 Retrait au showroom', value: 'pickup' },
  { title: '🚚 Livraison', value: 'delivery' },
]

export const order = {
  name: 'order',
  title: 'Commandes',
  type: 'document',
  groups: [
    { name: 'main', title: 'Vue d\'ensemble', default: true },
    { name: 'items', title: 'Articles' },
    { name: 'stripe', title: 'Facture &  paiement' },
    { name: 'internal', title: 'Notes internes' },
  ],
  fields: [
    // ─── Identification ───
    {
      name: 'numero',
      title: 'Numéro de commande',
      description: 'Auto-généré (format CDE-YYYY-XXXX) — ne pas modifier.',
      type: 'string',
      group: 'main',
      readOnly: true,
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'status',
      title: 'Statut',
      type: 'string',
      group: 'main',
      options: { list: STATUSES, layout: 'radio' },
      initialValue: 'paid',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'placedAt',
      title: 'Date de commande',
      type: 'datetime',
      group: 'main',
      readOnly: true,
      description: 'Timestamp du paiement Stripe',
    },

    // ─── Client ───
    {
      name: 'customer',
      title: 'Client',
      type: 'object',
      group: 'main',
      fields: [
        { name: 'name', title: 'Nom complet', type: 'string' },
        { name: 'email', title: 'Email', type: 'string' },
        { name: 'phone', title: 'Téléphone', type: 'string' },
      ],
    },
    {
      name: 'shippingAddress',
      title: 'Adresse de livraison (si livraison)',
      type: 'object',
      group: 'main',
      hidden: ({ document }: { document?: { fulfillmentMode?: string } }) =>
        document?.fulfillmentMode !== 'delivery',
      fields: [
        { name: 'line1', title: 'Adresse', type: 'string' },
        { name: 'line2', title: 'Complément', type: 'string' },
        { name: 'postalCode', title: 'Code postal', type: 'string' },
        { name: 'city', title: 'Ville', type: 'string' },
        { name: 'country', title: 'Pays', type: 'string', initialValue: 'FR' },
      ],
    },

    // ─── Mode de retrait / livraison ───
    {
      name: 'fulfillmentMode',
      title: 'Mode de récupération',
      type: 'string',
      group: 'main',
      options: { list: FULFILLMENT_MODES, layout: 'radio' },
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'pickupSlot',
      title: 'Créneau de retrait',
      type: 'object',
      group: 'main',
      hidden: ({ document }: { document?: { fulfillmentMode?: string } }) =>
        document?.fulfillmentMode !== 'pickup',
      fields: [
        {
          name: 'label',
          title: 'Libellé',
          type: 'string',
          description: 'Ex: "mardi 3 septembre à 14 h 30". Vide = client n\'a pas encore choisi son créneau.',
        },
        { name: 'date', title: 'Date (YYYY-MM-DD)', type: 'string' },
        { name: 'time', title: 'Heure (HH:MM)', type: 'string' },
        { name: 'calBookingRef', title: 'Réf. booking Cal.com', type: 'string' },
      ],
    },

    // ─── Articles ───
    {
      name: 'items',
      title: 'Articles commandés',
      type: 'array',
      group: 'items',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Nom', type: 'string' },
            { name: 'slug', title: 'Slug produit', type: 'string' },
            { name: 'unitPriceCents', title: 'Prix unitaire (centimes)', type: 'number' },
            { name: 'quantity', title: 'Quantité', type: 'number' },
            {
              name: 'productRef',
              title: 'Réf. produit Sanity',
              type: 'reference',
              to: [{ type: 'product' }],
              weak: true,
            },
          ],
          preview: {
            select: { name: 'name', quantity: 'quantity', price: 'unitPriceCents' },
            prepare(sel: { name?: string; quantity?: number; price?: number }) {
              const total = ((sel.price || 0) * (sel.quantity || 0)) / 100
              return {
                title: sel.name || 'Article',
                subtitle: `${sel.quantity}× · ${total.toLocaleString('fr-FR')} €`,
              }
            },
          },
        },
      ],
    },
    {
      name: 'amountTotalCents',
      title: 'Montant total payé (centimes)',
      type: 'number',
      group: 'items',
      readOnly: true,
      description: 'Somme facturée par Stripe (en centimes)',
    },
    {
      name: 'currency',
      title: 'Devise',
      type: 'string',
      group: 'items',
      initialValue: 'EUR',
      readOnly: true,
    },

    // ─── Stripe / Facture ───
    {
      name: 'stripeSessionId',
      title: 'ID session Stripe',
      type: 'string',
      group: 'stripe',
      readOnly: true,
    },
    {
      name: 'stripePaymentIntentId',
      title: 'ID PaymentIntent Stripe',
      type: 'string',
      group: 'stripe',
      readOnly: true,
    },
    {
      name: 'stripeInvoiceId',
      title: 'ID facture Stripe',
      type: 'string',
      group: 'stripe',
      readOnly: true,
    },
    {
      name: 'stripeInvoiceUrl',
      title: 'Lien facture PDF (Stripe)',
      type: 'url',
      group: 'stripe',
      readOnly: true,
      description: 'PDF officiel généré et envoyé au client par Stripe. Cliquez pour ouvrir.',
    },
    {
      name: 'stripeReceiptUrl',
      title: 'Lien reçu de paiement (Stripe)',
      type: 'url',
      group: 'stripe',
      readOnly: true,
    },

    // ─── Notes internes ───
    {
      name: 'internalNotes',
      title: 'Notes internes',
      type: 'text',
      rows: 4,
      group: 'internal',
      description: 'Uniquement visibles par l\'équipe Mobilier Malin.',
    },
  ],
  orderings: [
    {
      title: 'Plus récentes d\'abord',
      name: 'placedAtDesc',
      by: [{ field: 'placedAt', direction: 'desc' }],
    },
    {
      title: 'Par statut puis date',
      name: 'statusThenDate',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'placedAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'numero',
      status: 'status',
      customer: 'customer.name',
      amountCents: 'amountTotalCents',
      mode: 'fulfillmentMode',
      pickupLabel: 'pickupSlot.label',
    },
    prepare(sel: {
      title?: string
      status?: string
      customer?: string
      amountCents?: number
      mode?: string
      pickupLabel?: string
    }) {
      const statusEmoji: Record<string, string> = {
        paid: '🟡',
        ready: '📦',
        fulfilled: '✅',
        refunded: '❌',
      }
      const modeLabel = sel.mode === 'pickup' ? 'Retrait' : 'Livraison'
      const amount = sel.amountCents
        ? `${(sel.amountCents / 100).toLocaleString('fr-FR')} €`
        : '?'
      return {
        title: `${sel.title || '?'} — ${sel.customer || 'Client'}`,
        subtitle: `${(sel.status && statusEmoji[sel.status]) || ''} ${amount} · ${modeLabel}${sel.pickupLabel ? ` · ${sel.pickupLabel}` : ''}`,
      }
    },
  },
}
