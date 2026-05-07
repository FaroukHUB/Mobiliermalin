import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Catégorie',
    plural: 'Catégories',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent', 'updatedAt'],
    group: 'Catalogue',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nom de la catégorie',
      required: true,
    },
    slugField('name'),
    {
      name: 'parent',
      type: 'relationship',
      label: 'Catégorie parente',
      relationTo: 'categories',
      admin: {
        description: 'Laisser vide pour une catégorie de premier niveau.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description courte',
      admin: {
        description: 'Affichée en haut de la page catégorie. Importante pour le SEO.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Image de la catégorie',
      relationTo: 'media',
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', label: 'Titre meta (50-60 car.)' },
        { name: 'description', type: 'textarea', label: 'Description meta (150-160 car.)' },
      ],
    },
  ],
}
