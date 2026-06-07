import type { Rule } from 'sanity'

export const siteSettings = {
  name: 'siteSettings',
  title: 'Réglages du site',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identité', default: true },
    { name: 'sections', title: 'Images des sections' },
    { name: 'pagesHero', title: 'Hero des pages internes' },
    { name: 'navigation', title: 'Navigation (menu)' },
  ],
  fields: [
    // ─────────── Identité ───────────
    {
      name: 'siteName',
      title: 'Nom du site (interne)',
      type: 'string',
      group: 'identity',
      initialValue: 'Mobilier Malin',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'logoOnLight',
      title: 'Logo pour fonds clairs (header)',
      description:
        'Version sombre du logo (lettres noires ou or). Affichée dans le header sur fond ivoire. PNG ou SVG transparent recommandé, hauteur 80-120 px.',
      type: 'image',
      group: 'identity',
      options: { hotspot: false },
    },
    {
      name: 'logoOnDark',
      title: 'Logo pour fonds sombres (footer)',
      description:
        'Version claire ou or du logo. Affichée dans le footer sur fond noir. PNG ou SVG transparent recommandé.',
      type: 'image',
      group: 'identity',
      options: { hotspot: false },
    },
    {
      name: 'favicon',
      title: 'Favicon (onglet navigateur)',
      type: 'image',
      group: 'identity',
      description: 'Petite icône carrée 32×32 ou 512×512 px.',
    },

    // ─────────── Images des sections (page d'accueil) ───────────
    {
      name: 'manifesteImage',
      title: 'Image — Section Manifeste',
      description:
        "Grande image de la section 'Notre manifeste' sur la home. Portrait 1200×1500 px conseillé.",
      type: 'image',
      group: 'sections',
      options: { hotspot: true },
    },
    {
      name: 'lldSectionImage',
      title: 'Image — Section Location LLD',
      description:
        'Image accompagnant le bloc location longue durée sur la home. Portrait 1000×1250 px.',
      type: 'image',
      group: 'sections',
      options: { hotspot: true },
    },
    {
      name: 'showroomImage',
      title: 'Image — Section Showroom Aubagne',
      description: "Photo du showroom ou de l'atelier. Paysage 1200×900 px.",
      type: 'image',
      group: 'sections',
      options: { hotspot: true },
    },

    // ─────────── Hero des pages internes ───────────
    {
      name: 'lldHeroImage',
      title: 'Hero — page Location LLD',
      description:
        'Image principale en haut de /location-mobilier-bureau. Paysage 1200×900 px.',
      type: 'image',
      group: 'pagesHero',
      options: { hotspot: true },
    },
    {
      name: 'rseHeroImage',
      title: 'Hero — page Attestation RSE',
      description: 'Optionnel, pas affichée par défaut. Paysage 1200×900 px.',
      type: 'image',
      group: 'pagesHero',
      options: { hotspot: true },
    },

    // ─────────── Navigation (menu) ───────────
    {
      name: 'menuShowcaseProduct',
      title: 'Produit vedette du menu',
      description:
        'Produit affiché dans la 4e colonne du mega-menu Catalogue (vitrine "Coup de cœur"). Indépendant du toggle "Produit en avant" (qui pilote la section Coups de cœur sur la home). Si vide, le dernier produit publié est utilisé en fallback.',
      type: 'reference',
      group: 'navigation',
      to: [{ type: 'product' }],
      options: {
        filter: 'status == "published"',
      },
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
