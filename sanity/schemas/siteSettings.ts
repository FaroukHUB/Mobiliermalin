import type { Rule } from 'sanity'

export const siteSettings = {
  name: 'siteSettings',
  title: 'Réglages du site',
  type: 'document',
  // Singleton : un seul document de ce type peut exister.
  // Le bouton "+" sera masqué dans la sidebar (cf sanity.config.ts).
  fields: [
    {
      name: 'siteName',
      title: 'Nom du site (interne)',
      type: 'string',
      initialValue: 'Mobilier Malin',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'logoOnLight',
      title: 'Logo pour fonds clairs (header)',
      description:
        'Version sombre du logo (lettres noires ou or). Affichée dans le header sur fond ivoire. PNG ou SVG avec fond transparent recommandé.',
      type: 'image',
      options: { hotspot: false },
    },
    {
      name: 'logoOnDark',
      title: 'Logo pour fonds sombres (footer)',
      description:
        'Version claire du logo (lettres blanches ou or). Affichée dans le footer sur fond noir. PNG ou SVG avec fond transparent recommandé.',
      type: 'image',
      options: { hotspot: false },
    },
    {
      name: 'favicon',
      title: 'Favicon (onglet navigateur)',
      description:
        'Petite icône carrée affichée dans l\'onglet du navigateur. PNG ou ICO, 32×32 ou 512×512 px.',
      type: 'image',
    },
  ],
  preview: {
    select: { title: 'siteName' },
    prepare: ({ title }: { title?: string }) => ({
      title: title || 'Réglages du site',
      subtitle: 'Singleton — un seul exemplaire',
    }),
  },
}
