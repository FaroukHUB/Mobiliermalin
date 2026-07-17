import type { Rule } from 'sanity'
import { NATIONAL_PAGES } from '../nationalPagesRegistry'

/**
 * Landing page nationale éditable Sanity — reprend exactement le même
 * éditeur portable text que `guideArticle` (image upload, image URL,
 * callout 4 variantes, séparateur, tableau structuré, HTML brut).
 *
 * Un document par pageKey (voir NATIONAL_PAGES). La page React
 * correspondante (ex: /fauteuil-ergonomique) fetche ce document et
 * affiche le contenu Sanity si présent, sinon fallback sur le contenu
 * hardcodé initial (safe : aucune régression si l'admin n'a rien saisi).
 */
export const nationalLandingPage = {
  name: 'nationalLandingPage',
  title: '🌐 Landing page nationale',
  type: 'document',
  groups: [
    { name: 'main', title: 'Essentiel', default: true },
    { name: 'hero', title: 'Hero' },
    { name: 'body', title: 'Corps éditorial' },
    { name: 'faq', title: 'FAQ' },
    { name: 'seo', title: 'SEO & réseaux sociaux' },
  ],
  fields: [
    {
      name: 'pageKey',
      title: 'Identifiant de la page',
      type: 'string',
      group: 'main',
      description:
        'Identifiant technique — pré-rempli à la création. Ne pas modifier.',
      readOnly: true,
      validation: (R: Rule) => R.required(),
      options: {
        list: NATIONAL_PAGES.map((p) => ({ value: p.key, title: p.title })),
      },
    },
    {
      name: 'displayName',
      title: 'Nom affiché dans Studio',
      type: 'string',
      group: 'main',
      description: 'Libellé court pour reconnaître la page. Pré-rempli automatiquement.',
      validation: (R: Rule) => R.required(),
    },

    // ─── Hero (H1 + intro courte) ───
    {
      name: 'heroEyebrow',
      title: 'Sur-titre (petit texte au-dessus du H1)',
      type: 'string',
      group: 'hero',
      description: 'Ex : "Sélection nationale", "Marque professionnelle". Court, en majuscules dans le rendu.',
    },
    {
      name: 'heroTitle',
      title: 'Titre H1',
      type: 'string',
      group: 'hero',
      description: 'Le titre principal visible sur la page et utilisé par Google (H1 unique).',
    },
    {
      name: 'heroIntro',
      title: 'Introduction sous le H1',
      type: 'text',
      rows: 4,
      group: 'hero',
      description: '2 à 4 phrases pour poser le sujet. Pas de mise en forme, du texte simple.',
    },
    {
      name: 'heroImage',
      title: 'Image du hero (optionnelle)',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Texte alternatif', type: 'string' },
      ],
    },

    // ─── Corps éditorial ─── (même éditeur que guideArticle)
    {
      name: 'body',
      title: 'Corps de la page',
      type: 'array',
      group: 'body',
      description:
        'Contenu éditorial principal (entre le hero et la FAQ). Utilise les boutons + pour insérer texte, image, callout, tableau, séparateur.',
      of: [
        { type: 'block' },
        {
          type: 'image',
          title: '🖼 Image (upload depuis ton Mac)',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Texte alternatif (SEO + accessibilité)' },
            { name: 'caption', type: 'string', title: 'Légende (facultative)' },
          ],
        },
        {
          type: 'object',
          name: 'inlineImage',
          title: '🌐 Image par URL externe',
          fields: [
            { name: 'url', type: 'url', title: "URL de l'image", validation: (R: Rule) => R.required() },
            { name: 'alt', type: 'string', title: 'Texte alternatif', validation: (R: Rule) => R.required() },
            { name: 'caption', type: 'string', title: 'Légende (facultative)' },
          ],
          preview: {
            select: { title: 'alt', subtitle: 'url' },
            prepare(s: { title?: string; subtitle?: string }) {
              return { title: s.title || '(sans alt)', subtitle: '🌐 ' + (s.subtitle || '') }
            },
          },
        },
        {
          type: 'object',
          name: 'callout',
          title: '💡 Encart mis en avant',
          fields: [
            {
              name: 'variant',
              type: 'string',
              title: "Style de l'encart",
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
              title: "Contenu de l'encart",
              of: [
                {
                  type: 'object',
                  name: 'calloutSpan',
                  title: 'Portion de texte',
                  fields: [
                    { name: 'text', type: 'text', rows: 3, title: 'Texte' },
                    {
                      name: 'marks',
                      type: 'array',
                      title: 'Formatage',
                      of: [{ type: 'string' }],
                      options: {
                        list: [
                          { title: 'Gras', value: 'strong' },
                          { title: 'Italique', value: 'em' },
                        ],
                      },
                    },
                  ],
                  preview: {
                    select: { title: 'text' },
                    prepare(s: { title?: string }) {
                      return { title: s.title?.slice(0, 80) || '(vide)' }
                    },
                  },
                },
              ],
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
              const first = s.content?.[0]?.text?.slice(0, 60) || '(vide)'
              return { title: `${label[s.variant || 'info']} — ${first}` }
            },
          },
        },
        {
          type: 'object',
          name: 'divider',
          title: '➖ Séparateur horizontal',
          fields: [
            { name: 'note', type: 'string', title: '(rien à remplir)', hidden: true },
          ],
          preview: { prepare: () => ({ title: '— Séparateur —' }) },
        },
        {
          type: 'object',
          name: 'dataTable',
          title: '📊 Tableau structuré',
          fields: [
            { name: 'caption', type: 'string', title: 'Titre du tableau (facultatif)' },
            {
              name: 'headers',
              type: 'array',
              title: 'En-têtes de colonnes',
              of: [{ type: 'string' }],
              validation: (R: Rule) => R.required().min(1),
            },
            {
              name: 'rows',
              type: 'array',
              title: 'Lignes',
              of: [
                {
                  type: 'object',
                  name: 'tableRow',
                  fields: [
                    { name: 'cells', type: 'array', of: [{ type: 'string' }], title: 'Cellules' },
                  ],
                  preview: {
                    select: { cells: 'cells' },
                    prepare(s: { cells?: string[] }) {
                      return {
                        title: (s.cells || []).join(' · ').slice(0, 80) || '(vide)',
                      }
                    },
                  },
                },
              ],
              validation: (R: Rule) => R.required().min(1),
            },
          ],
          preview: {
            select: { caption: 'caption', rows: 'rows' },
            prepare(s: { caption?: string; rows?: unknown[] }) {
              return { title: `📊 ${s.caption || 'Tableau'} (${s.rows?.length || 0} lignes)` }
            },
          },
        },
        {
          type: 'object',
          name: 'videoEmbed',
          title: '🎬 Vidéo (YouTube / Vimeo)',
          description:
            "Insère une vidéo directement dans le corps de la page. L'iframe est responsive. Pour émettre un VideoObject JSON-LD complet, renseigne aussi description et date de publication.",
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'URL de la vidéo (YouTube ou Vimeo)',
              validation: (R: Rule) => R.required(),
              description: 'Ex : https://www.youtube.com/watch?v=abc123 ou https://vimeo.com/123456',
            },
            {
              name: 'title',
              type: 'string',
              title: 'Titre de la vidéo (facultatif)',
              description: 'Affiché en légende sous le player.',
            },
            {
              name: 'description',
              type: 'text',
              rows: 2,
              title: 'Description (requise pour le VideoObject SEO)',
              description: 'Sans cette description, la vidéo est affichée mais pas balisée en VideoObject.',
            },
            {
              name: 'uploadDate',
              type: 'date',
              title: 'Date de publication de la vidéo (requise pour VideoObject SEO)',
            },
          ],
          preview: {
            select: { title: 'title', url: 'url' },
            prepare(s: { title?: string; url?: string }) {
              return { title: '🎬 ' + (s.title || s.url || 'Vidéo') }
            },
          },
        },
        {
          type: 'object',
          name: 'htmlEmbed',
          title: '⚠️ HTML brut (avancé)',
          fields: [
            { name: 'html', type: 'text', rows: 10, title: 'Code HTML', validation: (R: Rule) => R.required() },
          ],
          preview: {
            select: { html: 'html' },
            prepare(s: { html?: string }) {
              return {
                title: '⚠️ HTML — ' + (s.html?.replace(/<[^>]+>/g, '').slice(0, 60) || 'vide'),
              }
            },
          },
        },
      ],
    },

    // ─── FAQ ─── (même format que guideArticle)
    {
      name: 'faq',
      title: 'FAQ affichée sur la page',
      type: 'array',
      group: 'faq',
      description: '3 à 8 questions/réponses. Émises en FAQPage JSON-LD uniquement si visibles dans l\'UI.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'question', type: 'string', title: 'Question', validation: (R: Rule) => R.required() },
            { name: 'answer', type: 'text', rows: 4, title: 'Réponse', validation: (R: Rule) => R.required() },
          ],
          preview: { select: { title: 'question', subtitle: 'answer' } },
        },
      ],
    },

    // ─── SEO ─── (même format que guideArticle)
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          title: 'Titre meta (50-60 caractères)',
          type: 'string',
          description: '🤖 Auto si vide : reprend le titre H1. Ne remplir que pour forcer une formulation Google précise.',
          validation: (R: Rule) => R.max(70),
        },
        {
          name: 'metaDescription',
          title: 'Description meta (150-160 caractères)',
          type: 'text',
          rows: 2,
          validation: (R: Rule) => R.max(180),
        },
        {
          name: 'ogImage',
          title: 'Image de partage social',
          type: 'image',
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
  preview: {
    select: { title: 'displayName', subtitle: 'pageKey', media: 'heroImage' },
  },
  orderings: [
    {
      title: 'Par identifiant',
      name: 'pageKeyAsc',
      by: [{ field: 'pageKey', direction: 'asc' }],
    },
  ],
}
