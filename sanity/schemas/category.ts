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
      name: 'parent',
      title: 'Catégorie parente',
      type: 'reference',
      to: [{ type: 'category' }],
      description:
        'Laisser vide si c\'est une catégorie principale (ex: Assises). Sinon, choisir le parent (ex: pour "Fauteuils ergonomiques", sélectionner "Assises").',
      options: {
        filter: '!(_id in path("drafts.**"))',
      },
    },
    {
      name: 'image',
      title: 'Image de la catégorie',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'variants',
      title: 'Variantes disponibles',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description:
        'Liste de variantes affichées sous la description (ex: "Direction", "Opérateur", "Visiteur"). Tapez puis Entrée.',
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
