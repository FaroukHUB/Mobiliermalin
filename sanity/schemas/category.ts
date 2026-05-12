import type { Rule } from 'sanity'

export const category = {
  name: 'category',
  title: 'Catégorie',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nom de la catégorie',
      type: 'string',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'slug',
      title: 'URL (slug)',
      type: 'slug',
      options: { source: 'name', maxLength: 64 },
      validation: (R: Rule) => R.required(),
      description:
        'Partie de l\'URL : /categorie/[slug]. Auto-rempli depuis le nom.',
    },
    {
      name: 'description',
      title: 'Description courte',
      type: 'text',
      rows: 3,
    },
    {
      name: 'image',
      title: 'Image de la catégorie',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'order',
      title: 'Ordre d\'affichage',
      type: 'number',
      description: 'Plus petit = affiché en premier.',
      initialValue: 0,
    },
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
}
