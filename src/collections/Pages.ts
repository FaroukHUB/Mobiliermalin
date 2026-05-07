import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Contenus',
  },
  access: {
    read: () => true,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', label: 'Titre de la page', required: true },
    slugField('title'),
    { name: 'content', type: 'richText', label: 'Contenu' },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', label: 'Titre meta' },
        { name: 'description', type: 'textarea', label: 'Description meta' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Image Open Graph' },
      ],
    },
  ],
}
