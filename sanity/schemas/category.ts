import type { Rule } from 'sanity'

export const category = {
  name: 'category',
  title: 'Catégorie',
  type: 'document',
  groups: [
    { name: 'main', title: 'Essentiel', default: true },
    { name: 'pillar', title: '📚 Contenu pilier (SEO)' },
    { name: 'merchant', title: 'Google Merchant' },
  ],
  fields: [
    {
      name: 'name',
      title: 'Nom de la catégorie',
      type: 'string',
      group: 'main',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'slug',
      title: 'URL (slug)',
      type: 'slug',
      group: 'main',
      options: { source: 'name', maxLength: 64 },
      validation: (R: Rule) => R.required(),
      description:
        'Partie de l\'URL : /categorie/[slug]. Auto-rempli depuis le nom.',
    },
    {
      name: 'description',
      title: 'Description courte',
      type: 'text',
      group: 'main',
      rows: 3,
      description:
        'Résumé court affiché sur les cartes catégorie du site + en meta description SEO. 1-2 phrases.',
    },
    {
      name: 'parent',
      title: 'Catégorie parente',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'main',
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
      group: 'main',
      options: { hotspot: true },
    },
    {
      name: 'variants',
      title: 'Variantes disponibles',
      type: 'array',
      group: 'main',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description:
        'Liste de variantes affichées sous la description (ex: "Direction", "Opérateur", "Visiteur"). Tapez puis Entrée.',
    },
    {
      name: 'order',
      title: 'Ordre d\'affichage',
      type: 'number',
      group: 'main',
      description: 'Plus petit = affiché en premier.',
      initialValue: 0,
    },

    // ─── Contenu pilier (SEO) ───
    {
      name: 'heroImage',
      title: 'Image hero (page pilier)',
      type: 'image',
      group: 'pillar',
      options: { hotspot: true },
      description:
        'Grande image en tête de la page /categorie/[slug]. Format paysage 2400×1200 idéal. Si vide, l\'image ci-dessus est utilisée.',
    },
    {
      name: 'pillarIntro',
      title: 'Introduction pilier (contenu SEO riche)',
      type: 'array',
      group: 'pillar',
      of: [{ type: 'block' }],
      description:
        '200-500 mots présentant la catégorie : à qui elle s\'adresse, ce qu\'on y trouve, pourquoi c\'est intéressant en reconditionné. Google et les IA extraient les 100-150 premiers mots comme résumé.',
    },
    {
      name: 'keyAdvantages',
      title: 'Points clés (3-5 avantages)',
      type: 'array',
      group: 'pillar',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Titre court', type: 'string' },
            { name: 'description', title: 'Description (1-2 phrases)', type: 'text', rows: 2 },
            {
              name: 'icon',
              title: 'Icône (nom Lucide)',
              type: 'string',
              description: 'Ex : ShieldCheck, Truck, Star, Sparkles. Optionnel.',
            },
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
      validation: (R: Rule) => R.max(6),
      description:
        '3 à 5 arguments forts affichés en icônes+texte. Ex pour "Fauteuils ergonomiques" : "Confort 8h+/j", "Réglages multiples", "Garantie mécanismes"…',
    },
    {
      name: 'buyingGuide',
      title: 'Guide d\'achat',
      type: 'array',
      group: 'pillar',
      of: [{ type: 'block' }],
      description:
        'Comment choisir dans cette catégorie ? Critères, taille, usage, budget… 300-800 mots. Utilise H3 et listes pour structurer. Émis dans la page + intéressant pour AI Overviews.',
    },
    {
      name: 'comparisonRows',
      title: 'Tableau comparatif',
      type: 'array',
      group: 'pillar',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'criterion', title: 'Critère', type: 'string' },
            { name: 'entryLevel', title: 'Entrée de gamme', type: 'string' },
            { name: 'midRange', title: 'Milieu de gamme', type: 'string' },
            { name: 'premium', title: 'Haut de gamme', type: 'string' },
          ],
          preview: { select: { title: 'criterion' } },
        },
      ],
      description:
        'Tableau 4 colonnes (critère + 3 gammes) pour aider à comparer. Ex ligne : "Prix" / "50-150€" / "150-350€" / "350€+". 5-10 lignes.',
    },
    {
      name: 'commonMistakes',
      title: 'Erreurs fréquentes à éviter',
      type: 'array',
      group: 'pillar',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'mistake', title: 'L\'erreur', type: 'string' },
            { name: 'solution', title: 'La bonne pratique', type: 'text', rows: 2 },
          ],
          preview: { select: { title: 'mistake', subtitle: 'solution' } },
        },
      ],
      validation: (R: Rule) => R.max(6),
      description:
        '3-5 erreurs classiques + leur solution. Excellent contenu pour E-E-A-T + AI Overviews.',
    },
    {
      name: 'faq',
      title: 'FAQ spécifique catégorie',
      type: 'array',
      group: 'pillar',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'question', title: 'Question', type: 'string', validation: (R: Rule) => R.required() },
            { name: 'answer', title: 'Réponse', type: 'text', rows: 3, validation: (R: Rule) => R.required() },
          ],
          preview: { select: { title: 'question', subtitle: 'answer' } },
        },
      ],
      description:
        '5-10 questions/réponses SPÉCIFIQUES à cette catégorie. Émises en FAQPage schema UNIQUEMENT si visibles dans l\'UI. Ne pas réutiliser les FAQ produit.',
    },
    {
      name: 'relatedGuideClusters',
      title: 'Clusters de guides liés',
      type: 'array',
      group: 'pillar',
      of: [{ type: 'reference', to: [{ type: 'guideCluster' }] }],
      validation: (R: Rule) => R.max(3),
      description:
        'Jusqu\'à 3 clusters éditoriaux à mettre en avant sur cette catégorie (ex: pour "Fauteuils ergonomiques" → cluster "Ergonomie" et "Marques & modèles"). Renforce le cocon.',
    },

    // ─── Google Merchant Center ───
    {
      name: 'googleProductCategoryId',
      title: 'Google Product Category — ID',
      type: 'number',
      group: 'merchant',
      description:
        'ID numérique de la taxonomie Google Merchant Center pour cette catégorie. Ex : 6360 = "Meubles > Meubles de bureau > Chaises de bureau". Voir la taxonomie officielle : https://www.google.com/basepages/producttype/taxonomy-with-ids.fr-FR.txt. Utilisé uniquement pour le feed Merchant (google_product_category). Les produits de cette catégorie hériteront de cet ID automatiquement.',
      validation: (R: Rule) => R.integer().positive(),
    },
    {
      name: 'googleProductCategoryPath',
      title: 'Google Product Category — Chemin (pour lisibilité admin)',
      type: 'string',
      group: 'merchant',
      description:
        'Chemin lisible de la catégorie Google (ex: "Meubles > Meubles de bureau > Chaises de bureau"). Facultatif — sert uniquement à te souvenir de ce que représente l\'ID ci-dessus.',
    },
  ],
  preview: {
    select: { title: 'name', media: 'image' },
  },
}
