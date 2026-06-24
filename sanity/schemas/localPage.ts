import type { Rule } from 'sanity'

/**
 * Document "Page locale" — contenu éditable spécifique à une page
 * combinant une catégorie et une ville (ex: bureau × Marseille).
 *
 * Chaque page React (/bureau-occasion-marseille, /fauteuil-occasion-marseille,
 * etc.) fetch son document par pageKey. Si Djamel n'a rien uploadé,
 * un fallback hardcodé prend le relais (Unsplash, texte par défaut).
 *
 * Sera enrichi au fil du temps :
 * - heroSubtitleOverride (texte personnalisé)
 * - introParagraphs (paragraphes éditoriaux remplaçables)
 * - testimonialOverrides (avis clients par page)
 */
export const localPage = {
  name: 'localPage',
  title: 'Page locale',
  type: 'document',
  fields: [
    {
      name: 'pageKey',
      title: 'Identifiant de la page',
      type: 'string',
      description:
        'Identifiant technique de la page (ex: "bureau-marseille"). Ne pas modifier sur une page existante.',
      validation: (R: Rule) => R.required(),
      options: {
        list: [
          { value: 'bureau-marseille', title: 'Bureau × Marseille' },
          { value: 'fauteuil-marseille', title: 'Fauteuil × Marseille' },
          { value: 'table-marseille', title: 'Table × Marseille' },
          { value: 'armoire-marseille', title: 'Armoire × Marseille' },
          { value: 'bureau-aubagne', title: 'Bureau × Aubagne' },
          { value: 'fauteuil-aubagne', title: 'Fauteuil × Aubagne' },
          { value: 'bureau-aix-en-provence', title: 'Bureau × Aix-en-Provence' },
          { value: 'fauteuil-aix-en-provence', title: 'Fauteuil × Aix-en-Provence' },
          { value: 'bureau-nice', title: 'Bureau × Nice' },
          { value: 'fauteuil-nice', title: 'Fauteuil × Nice' },
        ],
      },
    },
    {
      name: 'displayName',
      title: 'Nom affiché dans Studio',
      type: 'string',
      description: 'Libellé court pour reconnaître la page dans la liste (ex: "Bureau Marseille")',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'heroImage',
      title: 'Image du hero',
      type: 'image',
      options: { hotspot: true },
      description:
        'Photo principale en haut de la page locale. Idéalement : un open space, un showroom installé chez un client, ou une photo de mobilier livré sur place. Format paysage 2000×1200 minimum recommandé.',
      fields: [
        { name: 'alt', title: 'Texte alternatif (SEO + accessibilité)', type: 'string' },
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
