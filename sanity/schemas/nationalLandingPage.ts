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
    { name: 'meta', title: 'Auteur & date' },
    { name: 'tldr', title: 'Résumé (TL;DR)' },
    { name: 'stats', title: 'Chiffres clés' },
    { name: 'body', title: 'Corps éditorial' },
    { name: 'cases', title: 'Cas clients' },
    { name: 'pricing', title: 'Prix constatés' },
    { name: 'delivery', title: 'Livraison' },
    { name: 'glossary', title: 'Glossaire' },
    { name: 'video', title: 'Vidéo' },
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

    // ─── Auteur & date de mise à jour ───
    {
      name: 'author',
      title: 'Auteur affiché',
      type: 'string',
      group: 'meta',
      description: 'Auteur affiché sous le H1 (E-E-A-T + Article JSON-LD).',
      options: {
        list: [
          { title: 'Farouk Etsaalbi', value: 'Farouk Etsaalbi' },
          { title: 'Djamel Djennad', value: 'Djamel Djennad' },
          { title: 'Équipe Mobilier Malin', value: 'Équipe Mobilier Malin' },
        ],
      },
      initialValue: 'Équipe Mobilier Malin',
    },
    {
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'date',
      group: 'meta',
      description: 'Injectée dans Article JSON-LD (datePublished).',
    },
    {
      name: 'lastUpdated',
      title: 'Date de dernière mise à jour',
      type: 'date',
      group: 'meta',
      description: 'Affichée sur la page + injectée dans Article JSON-LD (dateModified). Google valorise les contenus entretenus.',
    },
    {
      name: 'readingTimeMinutes',
      title: 'Temps de lecture (minutes)',
      type: 'number',
      group: 'meta',
      description: 'Affiché sous le H1. Estimation manuelle (200-250 mots/min).',
      validation: (R: Rule) => R.min(1).max(60),
    },

    // ─── TL;DR (résumé AI Overviews) ───
    {
      name: 'tldr',
      title: 'TL;DR — Résumé en 2 à 3 phrases',
      type: 'text',
      rows: 4,
      group: 'tldr',
      description:
        'Réponse directe à la requête, extraite par les AI Overviews Google. Doit tenir en 2-3 phrases percutantes, sans introduction.',
      validation: (R: Rule) => R.max(600),
    },
    {
      name: 'audienceIntro',
      title: 'À qui s\'adresse cette page ?',
      type: 'array',
      group: 'tldr',
      description: '2 à 4 personas ciblés — TPE, DAF, télétravailleur, office manager, etc.',
      of: [
        {
          type: 'object',
          name: 'audiencePersona',
          fields: [
            { name: 'label', type: 'string', title: 'Persona (ex: Office manager)', validation: (R: Rule) => R.required() },
            { name: 'description', type: 'text', rows: 2, title: 'Description courte' },
          ],
          preview: {
            select: { title: 'label', subtitle: 'description' },
          },
        },
      ],
    },

    // ─── Chiffres clés (StatsRow) ───
    {
      name: 'keyStats',
      title: 'Chiffres clés (4 max, affichés en bandeau)',
      type: 'array',
      group: 'stats',
      description: 'Chiffres propres à Mobilier Malin ou au marché (avec source si extérieur).',
      of: [
        {
          type: 'object',
          name: 'keyStat',
          fields: [
            { name: 'value', type: 'string', title: 'Valeur (ex: "500+", "10 ans", "1/3")', validation: (R: Rule) => R.required() },
            { name: 'label', type: 'string', title: 'Libellé (ex: "fauteuils reconditionnés/an")', validation: (R: Rule) => R.required() },
            {
              name: 'icon',
              type: 'string',
              title: 'Icône (nom Lucide)',
              options: {
                list: [
                  { title: 'Recycle', value: 'Recycle' },
                  { title: 'ShieldCheck', value: 'ShieldCheck' },
                  { title: 'Truck', value: 'Truck' },
                  { title: 'Award', value: 'Award' },
                  { title: 'Users', value: 'Users' },
                  { title: 'Building', value: 'Building' },
                  { title: 'Leaf', value: 'Leaf' },
                  { title: 'Clock', value: 'Clock' },
                  { title: 'Star', value: 'Star' },
                  { title: 'Package', value: 'Package' },
                ],
              },
              initialValue: 'ShieldCheck',
            },
            { name: 'source', type: 'string', title: 'Source (facultatif, ex: "ADEME 2023")' },
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
            prepare(s: { title?: string; subtitle?: string }) {
              return { title: `${s.title || '?'} — ${s.subtitle || ''}` }
            },
          },
        },
      ],
      validation: (R: Rule) => R.max(4),
    },

    // ─── Cas clients ───
    {
      name: 'caseStudies',
      title: 'Cas clients (2 à 3)',
      type: 'array',
      group: 'cases',
      description: 'Mini-cas réels ou représentatifs. Anonymiser si nécessaire.',
      of: [
        {
          type: 'object',
          name: 'caseStudy',
          fields: [
            { name: 'clientType', type: 'string', title: 'Client (ex: "Cabinet d\'avocats, Marseille")', validation: (R: Rule) => R.required() },
            { name: 'context', type: 'text', rows: 3, title: 'Contexte (le besoin)', validation: (R: Rule) => R.required() },
            { name: 'solution', type: 'text', rows: 3, title: 'Notre réponse', validation: (R: Rule) => R.required() },
            { name: 'result', type: 'text', rows: 2, title: 'Résultat chiffré si possible' },
            { name: 'quote', type: 'text', rows: 2, title: 'Citation courte (facultatif)' },
          ],
          preview: {
            select: { title: 'clientType', subtitle: 'context' },
          },
        },
      ],
      validation: (R: Rule) => R.max(4),
    },

    // ─── Prix constatés ───
    {
      name: 'pricingRanges',
      title: 'Prix constatés (fourchettes typiques)',
      type: 'array',
      group: 'pricing',
      description: 'Fourchettes de prix par type/modèle. Sourced Product/AggregateOffer JSON-LD.',
      of: [
        {
          type: 'object',
          name: 'pricingRow',
          fields: [
            { name: 'label', type: 'string', title: 'Type ou modèle (ex: "Steelcase Leap V2 reconditionné")', validation: (R: Rule) => R.required() },
            { name: 'priceFrom', type: 'number', title: 'Prix min (€)', validation: (R: Rule) => R.required().min(0) },
            { name: 'priceTo', type: 'number', title: 'Prix max (€)', validation: (R: Rule) => R.required().min(0) },
            { name: 'newPriceRef', type: 'string', title: 'Prix neuf de référence (ex: "1300-1700 €")' },
            { name: 'notes', type: 'text', rows: 2, title: 'Notes (options, tailles, état, etc.)' },
          ],
          preview: {
            select: { title: 'label', priceFrom: 'priceFrom', priceTo: 'priceTo' },
            prepare(s: { title?: string; priceFrom?: number; priceTo?: number }) {
              return { title: `${s.title || '?'} — ${s.priceFrom || 0} à ${s.priceTo || 0} €` }
            },
          },
        },
      ],
    },

    // ─── Livraison par région ───
    {
      name: 'deliveryTable',
      title: 'Livraison par région / zone',
      type: 'array',
      group: 'delivery',
      description: 'Zones, villes principales, délais. Signal de couverture + longue traîne locale.',
      of: [
        {
          type: 'object',
          name: 'deliveryRow',
          fields: [
            { name: 'region', type: 'string', title: 'Région / Zone', validation: (R: Rule) => R.required() },
            { name: 'cities', type: 'string', title: 'Villes principales (séparées par virgule)' },
            { name: 'delay', type: 'string', title: 'Délai typique (ex: "5-7 jours ouvrés")', validation: (R: Rule) => R.required() },
            { name: 'notes', type: 'string', title: 'Notes (ex: "livraison en volume sur devis")' },
          ],
          preview: {
            select: { title: 'region', subtitle: 'delay' },
          },
        },
      ],
    },

    // ─── Glossaire ───
    {
      name: 'glossary',
      title: 'Glossaire (10 à 15 termes)',
      type: 'array',
      group: 'glossary',
      description: 'Vocabulaire du domaine — capture longue traîne + AI Overviews (DefinedTerm).',
      of: [
        {
          type: 'object',
          name: 'glossaryTerm',
          fields: [
            { name: 'term', type: 'string', title: 'Terme', validation: (R: Rule) => R.required() },
            { name: 'definition', type: 'text', rows: 3, title: 'Définition (1-3 phrases)', validation: (R: Rule) => R.required() },
          ],
          preview: {
            select: { title: 'term', subtitle: 'definition' },
          },
        },
      ],
    },

    // ─── Vidéo hero ou section ───
    {
      name: 'videoEmbed',
      title: 'Vidéo YouTube / Vimeo (facultatif)',
      type: 'object',
      group: 'video',
      description: 'Vidéo atelier ou explicative. Émet un VideoObject JSON-LD si description+uploadDate remplis.',
      fields: [
        { name: 'url', type: 'url', title: 'URL YouTube ou Vimeo' },
        { name: 'title', type: 'string', title: 'Titre de la vidéo' },
        { name: 'description', type: 'text', rows: 2, title: 'Description (requis pour VideoObject)' },
        { name: 'uploadDate', type: 'date', title: 'Date de publication (requis pour VideoObject)' },
        { name: 'thumbnailUrl', type: 'url', title: 'URL miniature (facultatif, si custom)' },
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
