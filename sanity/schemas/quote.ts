import type { Rule } from 'sanity'

/**
 * Schema "Devis" (quote) — demande de devis de livraison émise par un client.
 *
 * Workflow :
 *  1. Client soumet le formulaire → document créé avec status=pending
 *  2. l'admin ouvre Studio, ajoute frais livraison + options, click "Envoyer"
 *  3. Status passe à "sent" + PDF + email client
 *  4. Client accepte + paye → status=accepted + stripeSessionId
 */
export const quote = {
  name: 'quote',
  title: 'Devis',
  type: 'document',
  groups: [
    { name: 'identity', title: '🧾 Numéro & statut', default: true },
    { name: 'client', title: '👤 Client' },
    { name: 'product', title: '📦 Produit & livraison' },
    { name: 'fees', title: '💶 Frais & options' },
    { name: 'notes', title: '📝 Notes' },
    { name: 'tracking', title: '🔗 Suivi' },
  ],
  fields: [
    // ───── Identité & statut ─────
    {
      name: 'numero',
      title: 'Numéro de devis',
      type: 'string',
      group: 'identity',
      readOnly: true,
      description: 'Auto-généré au format DEV-YYYY-XXXX',
    },
    {
      name: 'status',
      title: 'Statut',
      type: 'string',
      group: 'identity',
      options: {
        list: [
          { value: 'pending', title: '🟡 À traiter — demande reçue' },
          { value: 'draft', title: '✏️ En préparation' },
          { value: 'sent', title: '📤 Envoyé au client' },
          { value: 'accepted', title: '✅ Accepté + payé' },
          { value: 'refused', title: '❌ Refusé par le client' },
          { value: 'expired', title: '⏰ Expiré (validité dépassée)' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'validUntil',
      title: 'Valide jusqu\'au',
      type: 'date',
      group: 'identity',
      description: '30 jours par défaut',
    },

    // ───── Client ─────
    {
      name: 'customer',
      title: 'Coordonnées client',
      type: 'object',
      group: 'client',
      fields: [
        { name: 'name', title: 'Nom complet', type: 'string', validation: (R: Rule) => R.required() },
        { name: 'email', title: 'Email', type: 'string', validation: (R: Rule) => R.required().email() },
        { name: 'phone', title: 'Téléphone', type: 'string' },
        { name: 'company', title: 'Société (optionnel)', type: 'string' },
      ],
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'shippingAddress',
      title: 'Adresse de livraison',
      type: 'object',
      group: 'client',
      fields: [
        { name: 'street', title: 'Rue', type: 'string', validation: (R: Rule) => R.required() },
        { name: 'postalCode', title: 'Code postal', type: 'string', validation: (R: Rule) => R.required() },
        { name: 'city', title: 'Ville', type: 'string', validation: (R: Rule) => R.required() },
        { name: 'floor', title: 'Étage', type: 'string' },
        {
          name: 'elevator',
          title: 'Ascenseur disponible',
          type: 'string',
          options: {
            list: [
              { value: 'yes', title: 'Oui' },
              { value: 'no', title: 'Non' },
              { value: 'unknown', title: 'Ne sait pas' },
            ],
            layout: 'radio',
          },
          initialValue: 'unknown',
        },
        { name: 'instructions', title: 'Instructions complémentaires', type: 'text', rows: 2 },
      ],
      validation: (R: Rule) => R.required(),
    },

    // ───── Produit ─────
    {
      name: 'product',
      title: 'Produit demandé',
      type: 'object',
      group: 'product',
      fields: [
        {
          name: 'ref',
          title: 'Produit (catalogue)',
          type: 'reference',
          to: [{ type: 'product' }],
          weak: true,
          description:
            'Lien vers le produit Sanity (auto-rempli depuis la demande). Référence faible : le produit peut être supprimé sans casser ce devis.',
        },
        { name: 'name', title: 'Nom du produit', type: 'string', validation: (R: Rule) => R.required() },
        { name: 'slug', title: 'Slug', type: 'string' },
        { name: 'unitPrice', title: 'Prix unitaire HT (€)', type: 'number', validation: (R: Rule) => R.required().min(0) },
        { name: 'quantity', title: 'Quantité', type: 'number', initialValue: 1, validation: (R: Rule) => R.required().min(1) },
      ],
      validation: (R: Rule) => R.required(),
    },

    // ───── Frais livraison & options ─────
    {
      name: 'shippingFee',
      title: 'Frais de livraison HT (€)',
      type: 'number',
      group: 'fees',
      description: 'À renseigner selon l\'adresse de livraison du client.',
      initialValue: 0,
      validation: (R: Rule) => R.min(0),
    },
    {
      name: 'options',
      title: 'Options supplémentaires',
      type: 'array',
      group: 'fees',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Libellé', type: 'string', validation: (R: Rule) => R.required() },
            { name: 'price', title: 'Prix HT (€)', type: 'number', validation: (R: Rule) => R.required().min(0) },
          ],
          preview: {
            select: { title: 'label', subtitle: 'price' },
            prepare({ title, subtitle }: { title?: string; subtitle?: number }) {
              return { title: title || '(option)', subtitle: `${subtitle ?? 0} € HT` }
            },
          },
        },
      ],
      description: 'Ex: Montage sur site, Évacuation ancien mobilier, Étage sans ascenseur…',
    },
    {
      name: 'tvaRate',
      title: 'Taux de TVA (%)',
      type: 'number',
      group: 'fees',
      initialValue: 20,
      options: {
        list: [
          { value: 20, title: '20 % (standard)' },
          { value: 10, title: '10 % (réduit)' },
          { value: 5.5, title: '5,5 % (super réduit)' },
          { value: 0, title: '0 % (exonéré)' },
        ],
        layout: 'dropdown',
      },
    },

    // ───── Notes ─────
    {
      name: 'customerNotes',
      title: 'Notes du client',
      type: 'text',
      group: 'notes',
      rows: 3,
      readOnly: true,
      description: 'Saisies par le client dans le formulaire',
    },
    {
      name: 'internalNotes',
      title: 'Notes internes (non visibles client)',
      type: 'text',
      group: 'notes',
      rows: 3,
    },
    {
      name: 'pdfNotes',
      title: 'Notes affichées sur le PDF',
      type: 'text',
      group: 'notes',
      rows: 3,
      description: 'Ex: délai de livraison estimé, conditions spéciales…',
    },

    // ───── Suivi ─────
    {
      name: 'sentAt',
      title: 'Envoyé au client le',
      type: 'datetime',
      group: 'tracking',
      readOnly: true,
    },
    {
      name: 'acceptedAt',
      title: 'Accepté le',
      type: 'datetime',
      group: 'tracking',
      readOnly: true,
    },
    {
      name: 'stripeSessionId',
      title: 'ID session Stripe',
      type: 'string',
      group: 'tracking',
      readOnly: true,
    },
    {
      name: 'paymentIntentId',
      title: 'ID payment intent Stripe',
      type: 'string',
      group: 'tracking',
      readOnly: true,
    },
  ],
  preview: {
    select: {
      numero: 'numero',
      name: 'customer.name',
      product: 'product.name',
      status: 'status',
    },
    prepare({
      numero,
      name,
      product,
      status,
    }: {
      numero?: string
      name?: string
      product?: string
      status?: string
    }) {
      const statusEmoji: Record<string, string> = {
        pending: '🟡',
        draft: '✏️',
        sent: '📤',
        accepted: '✅',
        refused: '❌',
        expired: '⏰',
      }
      return {
        title: numero || '(en cours de création)',
        subtitle: `${(status && statusEmoji[status]) || ''} ${name || '?'} — ${product || '?'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Plus récents d\'abord',
      name: 'createdDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
    {
      title: 'À traiter en premier',
      name: 'statusAsc',
      by: [
        { field: 'status', direction: 'asc' },
        { field: '_createdAt', direction: 'desc' },
      ],
    },
  ],
}
