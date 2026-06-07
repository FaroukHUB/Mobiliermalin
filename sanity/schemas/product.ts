import type { Rule } from 'sanity'

const CONDITIONS = [
  { title: 'Neuf', value: 'new' },
  { title: 'Excellent état', value: 'excellent' },
  { title: 'Très bon état', value: 'very-good' },
  { title: 'Bon état', value: 'good' },
  { title: 'État correct', value: 'fair' },
]

const STATUSES = [
  { title: 'Brouillon', value: 'draft' },
  { title: 'Publié (visible sur le site)', value: 'published' },
  { title: 'Vendu', value: 'sold' },
  { title: 'Archivé', value: 'archived' },
]

const BRANDS = [
  'Steelcase',
  'Herman Miller',
  'Haworth',
  'Vitra',
  'Majencia',
  'HÅG',
  'Knoll',
  'USM Haller',
  'Autre',
].map((b) => ({ title: b, value: b }))

export const product = {
  name: 'product',
  title: 'Mobilier (produits)',
  type: 'document',
  groups: [
    { name: 'main', title: 'Essentiel', default: true },
    { name: 'photos', title: 'Photos' },
    { name: 'pricing', title: 'Prix & stock' },
    { name: 'specs', title: 'Caractéristiques' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ─────── Essentiel ───────
    {
      name: 'name',
      title: 'Nom du produit',
      type: 'string',
      group: 'main',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'slug',
      title: 'Adresse web (slug)',
      type: 'slug',
      group: 'main',
      options: { source: 'name', maxLength: 96 },
      validation: (R: Rule) => R.required(),
      description: 'Partie de l\'URL : /produit/[slug]. Auto-générée depuis le nom.',
    },
    {
      name: 'status',
      title: 'Statut',
      type: 'string',
      group: 'main',
      options: { list: STATUSES, layout: 'radio' },
      initialValue: 'draft',
      validation: (R: Rule) => R.required(),
      description: 'Seuls les produits "Publié" apparaissent sur le site.',
    },
    {
      name: 'shortDescription',
      title: 'Description courte',
      type: 'text',
      rows: 3,
      group: 'main',
      description: '1-2 phrases résumé, affichées sur la fiche produit et les cartes catalogue.',
    },
    {
      name: 'description',
      title: 'Description complète',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'main',
    },

    // ─────── Photos ───────
    {
      name: 'images',
      title: 'Photos du produit',
      type: 'array',
      group: 'photos',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Texte alternatif (SEO + accessibilité)',
            },
          ],
        },
      ],
      validation: (R: Rule) => R.min(1).error('Au moins 1 photo obligatoire'),
      description:
        'Glissez-déposez vos photos. La première est la photo principale. Idéal : 5 photos minimum, fond uni clair.',
    },

    // ─────── Prix & stock ───────
    {
      name: 'price',
      title: 'Prix de vente (€ TTC)',
      type: 'number',
      group: 'pricing',
      validation: (R: Rule) => R.required().positive(),
    },
    {
      name: 'comparePrice',
      title: 'Prix barré / prix neuf (€ TTC)',
      type: 'number',
      group: 'pricing',
      description: 'Optionnel — affiche un prix barré pour montrer l\'économie.',
    },
    {
      name: 'stock',
      title: 'Quantité en stock',
      type: 'number',
      group: 'pricing',
      initialValue: 1,
      validation: (R: Rule) => R.required().min(0).integer(),
    },

    // ─────── Caractéristiques ───────
    {
      name: 'category',
      title: 'Catégorie',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'specs',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'brand',
      title: 'Marque d\'origine',
      type: 'string',
      group: 'specs',
      options: { list: BRANDS },
    },
    {
      name: 'condition',
      title: 'État',
      type: 'string',
      group: 'specs',
      options: { list: CONDITIONS, layout: 'radio' },
      initialValue: 'excellent',
    },
    {
      name: 'widthCm',
      title: 'Largeur (cm)',
      type: 'number',
      group: 'specs',
    },
    {
      name: 'depthCm',
      title: 'Profondeur (cm)',
      type: 'number',
      group: 'specs',
    },
    {
      name: 'heightCm',
      title: 'Hauteur (cm)',
      type: 'number',
      group: 'specs',
    },
    {
      name: 'material',
      title: 'Matière',
      type: 'string',
      group: 'specs',
      description: 'Ex: Mélaminé, Bois massif, Métal, Tissu, Cuir simili',
    },
    {
      name: 'color',
      title: 'Couleur',
      type: 'string',
      group: 'specs',
    },
    {
      name: 'sku',
      title: 'Référence interne (SKU)',
      type: 'string',
      group: 'specs',
      description: 'Optionnel — pour ta gestion de stock.',
    },
    {
      name: 'featured',
      title: 'Mettre en avant sur la home',
      type: 'boolean',
      group: 'specs',
      initialValue: false,
    },
    {
      name: 'featuredOrder',
      title: 'Ordre dans Coups de cœur',
      description:
        'Position du produit dans la section "Coups de cœur" de la home. 1 = premier, 2 = deuxième, etc. Laisser vide pour que le produit s\'affiche selon la date de publication (plus récent en premier). N\'a d\'effet QUE si "Mettre en avant sur la home" est activé.',
      type: 'number',
      group: 'specs',
      hidden: ({ document }: { document?: { featured?: boolean } }) =>
        !document?.featured,
      validation: (R: Rule) => R.min(1).integer(),
    },

    // ─────── SEO ───────
    {
      name: 'seo',
      title: 'Réglages SEO',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          title: 'Titre meta (50-60 caractères)',
          type: 'string',
        },
        {
          name: 'metaDescription',
          title: 'Description meta (150-160 caractères)',
          type: 'text',
          rows: 2,
        },
      ],
    },
  ],
  orderings: [
    {
      title: 'Statut puis date (récents)',
      name: 'statusDate',
      by: [
        { field: 'status', direction: 'asc' },
        { field: '_createdAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'images.0',
      subtitle: 'status',
      price: 'price',
    },
    prepare(s: { title?: string; media?: unknown; subtitle?: string; price?: number }) {
      const status = s.subtitle === 'published' ? '✓ Publié' : s.subtitle === 'sold' ? '✕ Vendu' : '✎ Brouillon'
      return {
        title: s.title,
        subtitle: `${status} · ${s.price ? `${s.price} €` : 'sans prix'}`,
        media: s.media,
      }
    },
  },
}
