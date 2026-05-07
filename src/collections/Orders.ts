import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Commande',
    plural: 'Commandes',
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'total', 'customerEmail', 'createdAt'],
    group: 'E-commerce',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      label: 'N° de commande',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      defaultValue: 'pending',
      required: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'En attente de paiement', value: 'pending' },
        { label: 'Payée', value: 'paid' },
        { label: 'En préparation', value: 'preparing' },
        { label: 'Expédiée', value: 'shipped' },
        { label: 'Livrée', value: 'delivered' },
        { label: 'Annulée', value: 'cancelled' },
        { label: 'Remboursée', value: 'refunded' },
      ],
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      label: 'Client (compte)',
    },
    {
      name: 'customerEmail',
      type: 'email',
      label: 'Email du client',
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Produits commandés',
      required: true,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        { name: 'productTitle', type: 'text', label: 'Nom (snapshot)' },
        { name: 'unitPrice', type: 'number', label: 'Prix unitaire' },
        { name: 'quantity', type: 'number', label: 'Quantité', defaultValue: 1, min: 1 },
        { name: 'lineTotal', type: 'number', label: 'Total ligne' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', label: 'Sous-total HT', admin: { width: '25%' } },
        { name: 'shipping', type: 'number', label: 'Livraison', admin: { width: '25%' } },
        { name: 'tax', type: 'number', label: 'TVA', admin: { width: '25%' } },
        { name: 'total', type: 'number', label: 'Total TTC', required: true, admin: { width: '25%' } },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'group',
      label: 'Adresse de livraison',
      fields: [
        { name: 'firstName', type: 'text' },
        { name: 'lastName', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'street', type: 'text' },
        { name: 'street2', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'country', type: 'text', defaultValue: 'France' },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Mode de paiement',
      options: [
        { label: 'Carte (Stripe)', value: 'stripe' },
        { label: 'Virement', value: 'wire' },
        { label: 'Sur place', value: 'onsite' },
      ],
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      label: 'Stripe PaymentIntent ID',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'trackingNumber',
      type: 'text',
      label: 'N° de suivi transporteur',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes internes',
    },
  ],
}
