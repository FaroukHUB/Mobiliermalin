import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: {
    singular: 'Marque',
    plural: 'Marques',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: 'Catalogue',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nom de la marque',
      required: true,
    },
    slugField('name'),
    {
      name: 'logo',
      type: 'upload',
      label: 'Logo',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Présentation de la marque',
    },
  ],
}
