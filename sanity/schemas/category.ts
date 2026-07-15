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
    // ─── Google Merchant Center ───
    {
      name: 'googleProductCategoryId',
      title: 'Google Product Category — ID',
      type: 'number',
      description:
        'ID numérique de la taxonomie Google Merchant Center pour cette catégorie. Ex : 6360 = "Meubles > Meubles de bureau > Chaises de bureau". Voir la taxonomie officielle : https://www.google.com/basepages/producttype/taxonomy-with-ids.fr-FR.txt. Utilisé uniquement pour le feed Merchant (google_product_category). Les produits de cette catégorie hériteront de cet ID automatiquement.',
      validation: (R: Rule) => R.integer().positive(),
    },
    {
      name: 'googleProductCategoryPath',
      title: 'Google Product Category — Chemin (pour lisibilité admin)',
      type: 'string',
      description:
        'Chemin lisible de la catégorie Google (ex: "Meubles > Meubles de bureau > Chaises de bureau"). Facultatif — sert uniquement à te souvenir de ce que représente l\'ID ci-dessus.',
    },
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
}
