import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Article',
    plural: 'Articles de blog',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'author'],
    group: 'Contenus',
  },
  access: {
    read: () => true,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', label: 'Titre', required: true },
    slugField('title'),
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Extrait (résumé)',
      maxLength: 300,
    },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Image de couverture' },
    { name: 'content', type: 'richText', label: 'Contenu de l\'article' },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Auteur',
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Date de publication',
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Mots-clés',
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', label: 'Titre meta' },
        { name: 'description', type: 'textarea', label: 'Description meta' },
      ],
    },
  ],
}
