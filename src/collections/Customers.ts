import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: {
    singular: 'Client',
    plural: 'Clients',
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'companyName', 'createdAt'],
    group: 'E-commerce',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', label: 'Prénom', admin: { width: '50%' } },
        { name: 'lastName', type: 'text', label: 'Nom', admin: { width: '50%' } },
      ],
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Téléphone',
    },
    {
      name: 'accountType',
      type: 'select',
      label: 'Type de compte',
      defaultValue: 'individual',
      options: [
        { label: 'Particulier', value: 'individual' },
        { label: 'Professionnel', value: 'business' },
      ],
    },
    {
      name: 'companyName',
      type: 'text',
      label: 'Raison sociale',
      admin: {
        condition: (data) => data?.accountType === 'business',
      },
    },
    {
      name: 'vatNumber',
      type: 'text',
      label: 'N° TVA intracommunautaire',
      admin: {
        condition: (data) => data?.accountType === 'business',
      },
    },
    {
      name: 'addresses',
      type: 'array',
      label: 'Adresses',
      fields: [
        { name: 'label', type: 'text', label: 'Libellé (ex: Bureau)' },
        { name: 'street', type: 'text', label: 'Adresse', required: true },
        { name: 'street2', type: 'text', label: 'Complément' },
        {
          type: 'row',
          fields: [
            { name: 'postalCode', type: 'text', label: 'Code postal', admin: { width: '30%' } },
            { name: 'city', type: 'text', label: 'Ville', admin: { width: '50%' } },
            { name: 'country', type: 'text', label: 'Pays', defaultValue: 'France', admin: { width: '20%' } },
          ],
        },
        { name: 'isDefault', type: 'checkbox', label: 'Adresse par défaut' },
      ],
    },
  ],
}
