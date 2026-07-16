import type { Rule } from 'sanity'

/**
 * Guide Article — article SEO evergreen du cocon sémantique.
 *
 * Chaque article appartient à un cluster obligatoire (silo).
 * URL : /guides/[cluster.slug]/[article.slug]
 *
 * Structuré pour supporter 300-500 articles avec :
 *   - métadonnées SEO complètes
 *   - maillage interne obligatoire (catégorie + produits + articles frères)
 *   - FAQ inline (FAQPage schema)
 *   - table des matières générée
 *   - auteur (E-E-A-T)
 */
export const guideArticle = {
  name: 'guideArticle',
  title: '📄 Article guide (SEO)',
  type: 'document',
  groups: [
    { name: 'main', title: 'Essentiel', default: true },
    { name: 'content', title: 'Contenu' },
    { name: 'seo', title: 'SEO & métadonnées' },
    { name: 'linking', title: 'Maillage interne' },
    { name: 'faq', title: 'FAQ inline' },
  ],
  fields: [
    // ─── Essentiel ───
    {
      name: 'title',
      title: 'Titre H1',
      type: 'string',
      group: 'main',
      validation: (R: Rule) => R.required().max(120),
      description: 'Titre principal affiché en H1 sur l\'article. 50-70 caractères idéal SEO.',
    },
    {
      name: 'slug',
      title: 'URL (slug)',
      type: 'slug',
      group: 'main',
      options: { source: 'title', maxLength: 80 },
      validation: (R: Rule) => R.required(),
      description: 'Ex : "reglage-lombaire-fauteuil". URL finale : /guides/[cluster]/[slug].',
    },
    {
      name: 'cluster',
      title: 'Cluster (silo)',
      type: 'reference',
      to: [{ type: 'guideCluster' }],
      group: 'main',
      validation: (R: Rule) => R.required(),
      description: 'Silo éditorial du cocon. Détermine l\'URL et le fil d\'Ariane.',
    },
    {
      name: 'status',
      title: 'Statut',
      type: 'string',
      group: 'main',
      options: {
        list: [
          { title: 'Brouillon', value: 'draft' },
          { title: 'Publié', value: 'published' },
          { title: 'Archivé', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      group: 'main',
      description: 'Date affichée sur l\'article + envoyée en Article.datePublished dans le JSON-LD.',
    },
    {
      name: 'author',
      title: 'Auteur',
      type: 'string',
      group: 'main',
      description: 'Auteur de l\'article. Renforce le signal E-E-A-T. Ex : "Équipe Mobilier Malin", "Djamel Djennad".',
    },
    {
      name: 'excerpt',
      title: 'Résumé (chapô)',
      type: 'text',
      rows: 3,
      group: 'main',
      description: 'Résumé affiché en tête d\'article + en meta description par défaut. 150-200 caractères.',
      validation: (R: Rule) => R.max(300),
    },

    // ─── Contenu ───
    {
      name: 'heroImage',
      title: 'Image principale (hero)',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Texte alternatif (SEO)' },
      ],
    },
    {
      name: 'body',
      title: 'Corps de l\'article',
      type: 'array',
      group: 'content',
      of: [
        { type: 'block' },
        {
          type: 'image',
          title: '🖼 Image (upload depuis ton Mac)',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Texte alternatif (SEO + accessibilité)',
              description: 'Décris ce que montre l\'image en 5-15 mots. Ex : "Fauteuil Steelcase Leap V2 noir dans un bureau".',
            },
            { name: 'caption', type: 'string', title: 'Légende (facultative)' },
          ],
        },
        {
          type: 'object',
          name: 'inlineImage',
          title: '🌐 Image par URL externe (Unsplash, etc.)',
          description:
            'Utilisé par les articles seedés en masse. Pour remplacer par ta propre photo, préfère le type "Image (upload)" juste au-dessus.',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'URL de l\'image',
              validation: (R: Rule) => R.required(),
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Texte alternatif',
              validation: (R: Rule) => R.required(),
            },
            { name: 'caption', type: 'string', title: 'Légende (facultative)' },
          ],
          preview: {
            select: { title: 'alt', subtitle: 'url', media: 'url' },
            prepare(s: { title?: string; subtitle?: string }) {
              return {
                title: s.title || '(sans alt)',
                subtitle: '🌐 ' + (s.subtitle || ''),
              }
            },
          },
        },
        {
          type: 'object',
          name: 'callout',
          title: '💡 Encart mis en avant',
          description:
            'Bloc coloré avec icône pour attirer l\'œil sur un point important.',
          fields: [
            {
              name: 'variant',
              type: 'string',
              title: 'Style de l\'encart',
              options: {
                list: [
                  { title: '🔵 Info (bleu)', value: 'info' },
                  { title: '🟠 Attention (ambre)', value: 'warning' },
                  { title: '🟢 À retenir (vert)', value: 'success' },
                  { title: '🟡 Astuce (or)', value: 'tip' },
                ],
                layout: 'radio',
              },
              initialValue: 'info',
              validation: (R: Rule) => R.required(),
            },
            {
              name: 'content',
              type: 'array',
              title: 'Contenu de l\'encart',
              of: [
                {
                  type: 'object',
                  name: 'span',
                  fields: [
                    { name: 'text', type: 'text', rows: 3 },
                    {
                      name: 'marks',
                      type: 'array',
                      of: [{ type: 'string' }],
                      options: {
                        list: [
                          { title: 'Gras', value: 'strong' },
                          { title: 'Italique', value: 'em' },
                        ],
                      },
                    },
                  ],
                  preview: { select: { title: 'text' } },
                },
              ],
              description:
                'Une ou plusieurs portions de texte. Utilise le bouton + pour ajouter du contenu formaté.',
            },
          ],
          preview: {
            select: { variant: 'variant', content: 'content' },
            prepare(s: { variant?: string; content?: Array<{ text?: string }> }) {
              const label: Record<string, string> = {
                info: '🔵 Info',
                warning: '🟠 Attention',
                success: '🟢 À retenir',
                tip: '🟡 Astuce',
              }
              const firstText = s.content?.[0]?.text?.slice(0, 60) || '(vide)'
              return { title: `${label[s.variant || 'info']} — ${firstText}` }
            },
          },
        },
        {
          type: 'object',
          name: 'divider',
          title: '➖ Séparateur horizontal',
          description: 'Trait or centré, à insérer entre deux grandes sections.',
          fields: [
            {
              name: 'note',
              type: 'string',
              title: '(rien à remplir)',
              hidden: true,
            },
          ],
          preview: { prepare: () => ({ title: '— Séparateur —' }) },
        },
        {
          type: 'object',
          name: 'productEmbed',
          title: '🛒 Encart produit (poussée conversion)',
          fields: [
            { name: 'product', type: 'reference', to: [{ type: 'product' }] },
            { name: 'accroche', type: 'string', title: 'Accroche personnalisée' },
          ],
          preview: {
            select: { title: 'product.name', subtitle: 'accroche' },
          },
        },
      ],
      description: 'Contenu riche. Utilise les H2/H3 pour structurer. Insère des encarts produit pour lier au catalogue.',
    },
    {
      name: 'readingTimeMinutes',
      title: 'Temps de lecture (minutes)',
      type: 'number',
      group: 'content',
      description: 'Affiché sous le titre. Auto-calculable en V2 (env. 200 mots/min).',
      validation: (R: Rule) => R.integer().min(1).max(60),
    },

    // ─── Maillage interne (obligatoire pour cocon) ───
    {
      name: 'primaryProductCategory',
      title: '⭐ Catégorie produit principale à pousser',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'linking',
      description:
        'Catégorie du catalogue vers laquelle l\'article envoie du trafic. Affichée en CTA principal. Ex: un article "Comment choisir un fauteuil ergonomique" pousse vers /categorie/fauteuil-ergonomique.',
    },
    {
      name: 'featuredProducts',
      title: 'Produits mis en avant',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      group: 'linking',
      validation: (R: Rule) => R.max(6),
      description: '2 à 6 produits associés — affichés en fin d\'article. Maillage éditorial → transactionnel.',
    },
    {
      name: 'relatedArticles',
      title: 'Articles frères (même cluster)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'guideArticle' }] }],
      group: 'linking',
      validation: (R: Rule) => R.max(4),
      description: '2 à 4 articles du même silo, pour renforcer le cocon sémantique.',
    },

    // ─── FAQ inline ───
    {
      name: 'faq',
      title: 'FAQ de l\'article',
      type: 'array',
      group: 'faq',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'question', type: 'string', title: 'Question', validation: (R: Rule) => R.required() },
            { name: 'answer', type: 'text', title: 'Réponse', rows: 4, validation: (R: Rule) => R.required() },
          ],
          preview: { select: { title: 'question', subtitle: 'answer' } },
        },
      ],
      description:
        '3 à 6 questions/réponses spécifiques à l\'article. Émise en FAQPage schema UNIQUEMENT si visible sur la page.',
    },

    // ─── SEO ───
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          title: 'Titre meta',
          type: 'string',
          description: '🤖 Auto si vide : reprend le H1',
          validation: (R: Rule) => R.max(70),
        },
        {
          name: 'metaDescription',
          title: 'Description meta',
          type: 'text',
          rows: 2,
          description: '🤖 Auto si vide : reprend l\'excerpt',
          validation: (R: Rule) => R.max(180),
        },
        {
          name: 'ogImage',
          title: 'Image de partage social',
          type: 'image',
          description: 'Facultatif — la heroImage est utilisée par défaut.',
        },
        {
          name: 'canonicalUrl',
          title: 'URL canonique (avancé)',
          type: 'url',
          description: 'Optionnel — utile si l\'article est aussi publié ailleurs.',
        },
        {
          name: 'noIndex',
          title: 'Retirer de Google (noindex)',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'primaryKeyword',
          title: 'Mot-clé principal ciblé',
          type: 'string',
          description: 'Un seul, pour analyse éditoriale interne. Ex : "réglage lombaire fauteuil ergonomique"',
        },
      ],
    },
  ],
  orderings: [
    {
      title: 'Date publication (récents)',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Cluster puis titre',
      name: 'clusterTitle',
      by: [
        { field: 'cluster.name', direction: 'asc' },
        { field: 'title', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      cluster: 'cluster.name',
      status: 'status',
      media: 'heroImage',
    },
    prepare(s: { title?: string; cluster?: string; status?: string; media?: unknown }) {
      const badge =
        s.status === 'published' ? '✓' : s.status === 'archived' ? '✕' : '✎'
      return {
        title: s.title,
        subtitle: `${badge} ${s.cluster || 'Sans cluster'}`,
        media: s.media,
      }
    },
  },
}
