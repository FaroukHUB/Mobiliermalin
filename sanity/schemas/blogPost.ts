/**
 * Blog Post — schéma "WordPress-like" complet pour Sanity.
 *
 * Palette d'édition riche :
 *   • Titres H1 → H4, paragraphes, blockquote
 *   • Gras, italique, souligné, code inline
 *   • Liens externes/internes
 *   • Listes à puces et numérotées
 *   • Images avec alt, légende, alignement
 *   • Galerie d'images (row)
 *   • Callouts (info, warning, success, gold)
 *   • Blocs de code (avec choix du langage)
 *   • Vidéos YouTube / Vimeo (embed)
 *   • Séparateurs / dividers gold
 *   • Tableaux simples (2 à 4 colonnes)
 *   • Ancres CTA (bouton lien)
 *
 * Métadonnées WordPress-like : slug auto, image à la une, extrait,
 * catégorie, tags, auteur, statut brouillon/publié, date de
 * publication programmable, SEO (title/description/canonical/og).
 */

export const blogPost = {
  name: 'blogPost',
  title: 'Article de blog',
  type: 'document',
  groups: [
    { name: 'content', title: '📝 Contenu', default: true },
    { name: 'media', title: '🖼️ Image à la une' },
    { name: 'meta', title: '🏷️ Catégories & tags' },
    { name: 'seo', title: '🔎 SEO' },
    { name: 'publish', title: '📅 Publication' },
  ],
  fields: [
    // ─── CONTENU PRINCIPAL ──────────────────────────────────────────
    {
      name: 'title',
      title: 'Titre de l\'article',
      type: 'string',
      description: 'Le grand titre affiché en haut de l\'article (H1).',
      validation: (Rule: {required: () => {max: (n: number) => unknown}}) =>
        (Rule.required() as {max: (n: number) => unknown}).max(120),
      group: 'content',
    },
    {
      name: 'slug',
      title: 'URL de l\'article (slug)',
      type: 'slug',
      description:
        'Généré automatiquement à partir du titre. Vous pouvez le modifier — pas d\'accents, tirets à la place des espaces. Ex: "comparatif-fauteuils-ergonomiques"',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) =>
          input
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
            .slice(0, 96),
      },
      validation: (Rule: {required: () => unknown}) => Rule.required(),
      group: 'content',
    },
    {
      name: 'excerpt',
      title: 'Extrait / chapô',
      type: 'text',
      rows: 3,
      description:
        'Le résumé affiché dans les listes d\'articles (accueil, index blog, "à lire aussi"). 150 à 250 caractères. Sera aussi utilisé comme meta description SEO si vous n\'en renseignez pas.',
      validation: (Rule: {max: (n: number) => unknown}) => Rule.max(300),
      group: 'content',
    },
    {
      name: 'body',
      title: 'Corps de l\'article',
      type: 'array',
      description:
        'La palette d\'édition WordPress-like : cliquez sur "Insérer" (icône +) pour ajouter titres, images, listes, citations, callouts, blocs de code, vidéos YouTube, etc.',
      group: 'content',
      of: [
        // ─── BLOC TEXTE ENRICHI ─────────────────────────────────────
        {
          type: 'block',
          title: 'Texte',
          styles: [
            { title: 'Paragraphe', value: 'normal' },
            { title: 'Titre H2', value: 'h2' },
            { title: 'Titre H3', value: 'h3' },
            { title: 'Titre H4', value: 'h4' },
            { title: 'Citation', value: 'blockquote' },
          ],
          lists: [
            { title: 'Liste à puces', value: 'bullet' },
            { title: 'Liste numérotée', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Gras', value: 'strong' },
              { title: 'Italique', value: 'em' },
              { title: 'Souligné', value: 'underline' },
              { title: 'Barré', value: 'strike-through' },
              { title: 'Code inline', value: 'code' },
              { title: 'Surligné (fond doré)', value: 'highlight' },
            ],
            annotations: [
              {
                name: 'link',
                title: 'Lien',
                type: 'object',
                fields: [
                  {
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    description:
                      'URL complète (https://…) ou chemin interne (/boutique, /contact…)',
                    validation: (Rule: {
                      uri: (opts: {allowRelative: boolean; scheme: string[]}) => unknown
                    }) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                  {
                    name: 'openInNewTab',
                    title: 'Ouvrir dans un nouvel onglet',
                    type: 'boolean',
                    initialValue: false,
                  },
                ],
              },
              {
                name: 'internalLink',
                title: 'Lien interne (page du site)',
                type: 'object',
                description:
                  'Alternative : pointer directement vers une autre page du site',
                fields: [
                  {
                    name: 'reference',
                    title: 'Vers…',
                    type: 'reference',
                    to: [
                      { type: 'product' },
                      { type: 'category' },
                      { type: 'blogPost' },
                      { type: 'localPage' },
                    ],
                  },
                ],
              },
            ],
          },
        },

        // ─── IMAGE ──────────────────────────────────────────────────
        {
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Texte alternatif (obligatoire)',
              type: 'string',
              description:
                'Décrit l\'image pour les moteurs de recherche et l\'accessibilité. Ex: "Fauteuil Steelcase Leap V2 dans notre atelier"',
              validation: (Rule: {required: () => unknown}) => Rule.required(),
            },
            {
              name: 'caption',
              title: 'Légende (facultatif)',
              type: 'string',
              description: 'Petit texte affiché sous l\'image.',
            },
            {
              name: 'size',
              title: 'Taille d\'affichage',
              type: 'string',
              options: {
                list: [
                  { title: 'Largeur du texte (défaut)', value: 'normal' },
                  { title: 'Pleine largeur', value: 'wide' },
                  { title: 'Petite (à gauche)', value: 'small-left' },
                  { title: 'Petite (à droite)', value: 'small-right' },
                ],
                layout: 'radio',
              },
              initialValue: 'normal',
            },
          ],
        },

        // ─── GALERIE ────────────────────────────────────────────────
        {
          type: 'object',
          name: 'gallery',
          title: '🖼️ Galerie (2 à 4 images côte à côte)',
          fields: [
            {
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    {
                      name: 'alt',
                      title: 'Texte alternatif',
                      type: 'string',
                      validation: (Rule: {required: () => unknown}) => Rule.required(),
                    },
                  ],
                },
              ],
              validation: (Rule: {min: (n: number) => {max: (n: number) => unknown}}) =>
                (Rule.min(2) as {max: (n: number) => unknown}).max(6),
            },
          ],
          preview: {
            select: { images: 'images' },
            prepare({ images }: { images?: unknown[] }) {
              return {
                title: `Galerie (${images?.length ?? 0} images)`,
              }
            },
          },
        },

        // ─── CALLOUT / ENCART ───────────────────────────────────────
        {
          type: 'object',
          name: 'callout',
          title: '💡 Encart / Callout',
          fields: [
            {
              name: 'variant',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: '💡 Info (gold)', value: 'info' },
                  { title: '✅ Succès (vert)', value: 'success' },
                  { title: '⚠️ Attention (orange)', value: 'warning' },
                  { title: '⭐ Mise en avant premium (noir & or)', value: 'gold' },
                  { title: '📌 Note simple (gris clair)', value: 'note' },
                ],
                layout: 'radio',
              },
              initialValue: 'info',
              validation: (Rule: {required: () => unknown}) => Rule.required(),
            },
            {
              name: 'title',
              title: 'Titre de l\'encart',
              type: 'string',
            },
            {
              name: 'body',
              title: 'Contenu',
              type: 'array',
              of: [{ type: 'block', styles: [{ title: 'Paragraphe', value: 'normal' }] }],
              validation: (Rule: {required: () => unknown}) => Rule.required(),
            },
            {
              name: 'ctaLabel',
              title: 'Libellé du bouton (facultatif)',
              type: 'string',
            },
            {
              name: 'ctaHref',
              title: 'Lien du bouton',
              type: 'string',
              description:
                'Chemin interne (ex: /boutique) ou URL complète (https://…)',
            },
          ],
          preview: {
            select: { title: 'title', variant: 'variant' },
            prepare({ title, variant }: { title?: string; variant?: string }) {
              return {
                title: title || 'Encart',
                subtitle: `Callout — ${variant}`,
              }
            },
          },
        },

        // ─── BLOC DE CODE ───────────────────────────────────────────
        {
          type: 'object',
          name: 'codeBlock',
          title: '💻 Bloc de code',
          fields: [
            {
              name: 'language',
              title: 'Langage',
              type: 'string',
              options: {
                list: [
                  { title: 'Aucun / texte', value: 'text' },
                  { title: 'HTML', value: 'html' },
                  { title: 'CSS', value: 'css' },
                  { title: 'JavaScript', value: 'javascript' },
                  { title: 'TypeScript', value: 'typescript' },
                  { title: 'JSON', value: 'json' },
                  { title: 'Bash / Shell', value: 'bash' },
                  { title: 'Python', value: 'python' },
                ],
                layout: 'dropdown',
              },
              initialValue: 'text',
            },
            {
              name: 'filename',
              title: 'Nom de fichier (facultatif)',
              type: 'string',
              description: 'Ex: package.json',
            },
            {
              name: 'code',
              title: 'Code',
              type: 'text',
              rows: 8,
            },
          ],
          preview: {
            select: { language: 'language', filename: 'filename', code: 'code' },
            prepare({
              language,
              filename,
              code,
            }: {
              language?: string
              filename?: string
              code?: string
            }) {
              return {
                title: filename || `Code (${language})`,
                subtitle: code?.split('\n')[0]?.slice(0, 60),
              }
            },
          },
        },

        // ─── VIDÉO YOUTUBE / VIMEO ──────────────────────────────────
        {
          type: 'object',
          name: 'videoEmbed',
          title: '🎬 Vidéo (YouTube / Vimeo)',
          fields: [
            {
              name: 'url',
              title: 'URL de la vidéo',
              type: 'url',
              description:
                'Collez l\'URL YouTube ou Vimeo. Ex: https://www.youtube.com/watch?v=xxx',
              validation: (Rule: {required: () => unknown}) => Rule.required(),
            },
            {
              name: 'caption',
              title: 'Légende (facultatif)',
              type: 'string',
            },
          ],
          preview: {
            select: { url: 'url', caption: 'caption' },
            prepare({ url, caption }: { url?: string; caption?: string }) {
              return {
                title: caption || 'Vidéo intégrée',
                subtitle: url,
              }
            },
          },
        },

        // ─── TABLEAU ────────────────────────────────────────────────
        {
          type: 'object',
          name: 'table',
          title: '📊 Tableau',
          fields: [
            {
              name: 'caption',
              title: 'Titre du tableau (facultatif)',
              type: 'string',
            },
            {
              name: 'rows',
              title: 'Lignes',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'tableRow',
                  fields: [
                    {
                      name: 'cells',
                      title: 'Cellules',
                      type: 'array',
                      of: [{ type: 'string' }],
                    },
                    {
                      name: 'isHeader',
                      title: 'Ligne d\'en-tête',
                      type: 'boolean',
                      initialValue: false,
                    },
                  ],
                  preview: {
                    select: { cells: 'cells', isHeader: 'isHeader' },
                    prepare({
                      cells,
                      isHeader,
                    }: {
                      cells?: string[]
                      isHeader?: boolean
                    }) {
                      return {
                        title: cells?.join(' | ') || '(vide)',
                        subtitle: isHeader ? 'En-tête' : undefined,
                      }
                    },
                  },
                },
              ],
              validation: (Rule: {min: (n: number) => unknown}) => Rule.min(1),
            },
          ],
          preview: {
            select: { caption: 'caption', rows: 'rows' },
            prepare({ caption, rows }: { caption?: string; rows?: unknown[] }) {
              return {
                title: caption || 'Tableau',
                subtitle: `${rows?.length ?? 0} lignes`,
              }
            },
          },
        },

        // ─── CTA / BOUTON ───────────────────────────────────────────
        {
          type: 'object',
          name: 'ctaButton',
          title: '🔘 Bouton d\'appel à l\'action (CTA)',
          fields: [
            {
              name: 'label',
              title: 'Libellé du bouton',
              type: 'string',
              validation: (Rule: {required: () => unknown}) => Rule.required(),
            },
            {
              name: 'href',
              title: 'Lien',
              type: 'string',
              description: 'Chemin interne (/boutique) ou URL complète.',
              validation: (Rule: {required: () => unknown}) => Rule.required(),
            },
            {
              name: 'variant',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Bouton doré (principal)', value: 'gold' },
                  { title: 'Bouton contour (secondaire)', value: 'outline' },
                  { title: 'Lien texte simple', value: 'link' },
                ],
                layout: 'radio',
              },
              initialValue: 'gold',
            },
            {
              name: 'align',
              title: 'Alignement',
              type: 'string',
              options: {
                list: [
                  { title: 'Gauche', value: 'left' },
                  { title: 'Centré', value: 'center' },
                  { title: 'Droite', value: 'right' },
                ],
                layout: 'radio',
              },
              initialValue: 'left',
            },
          ],
          preview: {
            select: { label: 'label', href: 'href' },
            prepare({ label, href }: { label?: string; href?: string }) {
              return { title: label || 'Bouton', subtitle: href }
            },
          },
        },

        // ─── SÉPARATEUR ─────────────────────────────────────────────
        {
          type: 'object',
          name: 'divider',
          title: '➖ Séparateur',
          fields: [
            {
              name: 'variant',
              title: 'Style',
              type: 'string',
              options: {
                list: [
                  { title: 'Trait fin gold', value: 'gold' },
                  { title: 'Ligne pleine', value: 'line' },
                  { title: 'Espace vide', value: 'space' },
                ],
                layout: 'radio',
              },
              initialValue: 'gold',
            },
          ],
          preview: {
            prepare() {
              return { title: '— Séparateur —' }
            },
          },
        },
      ],
      validation: (Rule: {required: () => unknown}) => Rule.required(),
    },

    // ─── IMAGE À LA UNE ─────────────────────────────────────────────
    {
      name: 'heroImage',
      title: 'Image à la une',
      type: 'image',
      description:
        'Grande image affichée en haut de l\'article, dans les listes et sur les partages sociaux. Format 16:9 recommandé, min 1600×900 px.',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Texte alternatif',
          type: 'string',
          validation: (Rule: {required: () => unknown}) => Rule.required(),
        },
      ],
      group: 'media',
    },

    // ─── CATÉGORIE & TAGS ───────────────────────────────────────────
    {
      name: 'category',
      title: 'Catégorie principale',
      type: 'string',
      description:
        'Utilisée dans le fil d\'Ariane et les listes. Choisissez la plus pertinente.',
      options: {
        list: [
          { title: '📚 Guides d\'achat', value: 'guides' },
          { title: '🏷️ Marques & modèles', value: 'brands' },
          { title: '♻️ Écologie & RSE', value: 'rse' },
          { title: '🏢 Aménagement bureau', value: 'layout' },
          { title: '💡 Conseils pratiques', value: 'tips' },
          { title: '📰 Actualité Mobilier Malin', value: 'news' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule: {required: () => unknown}) => Rule.required(),
      group: 'meta',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description:
        'Mots-clés (5 max recommandé) pour thématiser l\'article. Ex: "Steelcase", "Fauteuil", "Ergonomie".',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      group: 'meta',
    },
    {
      name: 'author',
      title: 'Auteur',
      type: 'string',
      description: 'Nom affiché sous le titre.',
      initialValue: 'Équipe Mobilier Malin',
      group: 'meta',
    },
    {
      name: 'relatedPosts',
      title: 'Articles liés (facultatif)',
      type: 'array',
      description:
        'Autres articles à recommander en bas de page. 2 à 3 max. Si vide, les plus récents sont proposés automatiquement.',
      of: [{ type: 'reference', to: [{ type: 'blogPost' }] }],
      validation: (Rule: {max: (n: number) => unknown}) => Rule.max(3),
      group: 'meta',
    },

    // ─── SEO ────────────────────────────────────────────────────────
    {
      name: 'seo',
      title: 'Métadonnées SEO',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          title: 'Titre SEO (balise <title>)',
          type: 'string',
          description:
            'Affiché dans l\'onglet du navigateur et dans les résultats Google. 50 à 60 caractères. Si vide, on utilise le titre de l\'article.',
          validation: (Rule: {max: (n: number) => unknown}) => Rule.max(70),
        },
        {
          name: 'metaDescription',
          title: 'Description SEO (meta description)',
          type: 'text',
          rows: 3,
          description:
            'Le texte affiché sous le titre dans les résultats Google. 150 à 160 caractères. Si vide, on utilise l\'extrait.',
          validation: (Rule: {max: (n: number) => unknown}) => Rule.max(200),
        },
        {
          name: 'noIndex',
          title: 'Ne pas indexer cet article dans Google',
          type: 'boolean',
          description:
            'Cocher pour cacher aux moteurs de recherche (ex: brouillon publié en preview).',
          initialValue: false,
        },
      ],
    },

    // ─── PUBLICATION ────────────────────────────────────────────────
    {
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
      description:
        'Date affichée dans l\'article et utilisée pour trier. Peut être future (l\'article n\'apparaîtra que ce jour-là si le statut est "publié").',
      initialValue: () => new Date().toISOString(),
      validation: (Rule: {required: () => unknown}) => Rule.required(),
      group: 'publish',
    },
    {
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: '📝 Brouillon (non visible)', value: 'draft' },
          { title: '✅ Publié', value: 'published' },
          { title: '🗄️ Archivé (retiré du site)', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule: {required: () => unknown}) => Rule.required(),
      group: 'publish',
    },
    {
      name: 'featured',
      title: 'Mettre en avant sur la home',
      type: 'boolean',
      description:
        'Si activé, cet article apparaît dans la section blog de la page d\'accueil (les 3 plus récents sont sinon utilisés par défaut).',
      initialValue: false,
      group: 'publish',
    },
  ],

  // ─── APERÇU DANS LE STUDIO ────────────────────────────────────────
  preview: {
    select: {
      title: 'title',
      status: 'status',
      category: 'category',
      publishedAt: 'publishedAt',
      media: 'heroImage',
    },
    prepare({
      title,
      status,
      category,
      publishedAt,
      media,
    }: {
      title?: string
      status?: string
      category?: string
      publishedAt?: string
      media?: unknown
    }) {
      const statusIcon =
        status === 'published' ? '✅' : status === 'archived' ? '🗄️' : '📝'
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : ''
      return {
        title: `${statusIcon} ${title || '(sans titre)'}`,
        subtitle: [category, date].filter(Boolean).join(' · '),
        media,
      }
    },
  },

  orderings: [
    {
      title: 'Plus récents en premier',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Plus anciens en premier',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
    {
      title: 'Par titre',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
}
