import type { Rule } from 'sanity'

/**
 * Guide Cluster — silo éditorial du cocon sémantique.
 *
 * Chaque cluster regroupe une famille d'articles autour d'une intention
 * de recherche large (ex: "ergonomie", "achat B2B", "RSE réemploi").
 *
 * URL : /guides/[cluster-slug]
 * Enfants : guideArticle[] via ref inverse (chaque article pointe vers
 * un cluster obligatoire).
 */
export const guideCluster = {
  name: 'guideCluster',
  title: '📚 Cluster de guides (silo SEO)',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nom du cluster',
      type: 'string',
      description: 'Ex : "Ergonomie", "Achat B2B", "Marques & modèles"',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'slug',
      title: 'URL (slug)',
      type: 'slug',
      options: { source: 'name', maxLength: 40 },
      validation: (R: Rule) => R.required(),
      description:
        'Partie de l\'URL : /guides/[slug]. Court, en minuscules, sans accent.',
    },
    {
      name: 'tagline',
      title: 'Accroche courte',
      type: 'string',
      description:
        'Une phrase courte affichée sous le titre du hub. Ex : "Tout savoir pour bien s\'asseoir 8h/jour"',
      validation: (R: Rule) => R.max(120),
    },
    {
      name: 'description',
      title: 'Description longue du silo',
      type: 'text',
      rows: 5,
      description:
        'Introduction éditoriale (150-300 mots). Décrit ce que le cluster couvre, à qui il s\'adresse, ce qu\'on va y apprendre. Utilisée en H1+intro sur /guides/[slug].',
    },
    {
      name: 'image',
      title: 'Image du cluster',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'order',
      title: 'Ordre d\'affichage',
      type: 'number',
      description: 'Position dans la liste sur /guides. Plus petit = affiché en premier.',
      initialValue: 0,
    },
    {
      name: 'relatedProductCategories',
      title: 'Catégories produits liées',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      description:
        'Catégories du catalogue à mettre en avant sur le hub cluster + dans les articles enfants. Pousse le trafic éditorial vers les fiches produit.',
    },
    // ─── SEO ───
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        {
          name: 'metaTitle',
          title: 'Titre meta',
          type: 'string',
          description: '🤖 Auto si vide : "[Nom du cluster] — Guides Mobilier Malin"',
          validation: (R: Rule) => R.max(70).warning('Trop long pour SERP.'),
        },
        {
          name: 'metaDescription',
          title: 'Description meta',
          type: 'text',
          rows: 2,
          validation: (R: Rule) => R.max(180),
        },
        {
          name: 'noIndex',
          title: 'Retirer de Google (noindex)',
          type: 'boolean',
          initialValue: false,
        },
      ],
    },
  ],
  orderings: [
    { title: 'Ordre puis nom', name: 'orderName', by: [{ field: 'order', direction: 'asc' }, { field: 'name', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'tagline', media: 'image' },
  },
}
