import type { GlobalConfig } from 'payload'

/**
 * Reglages globaux du site : logos, images des sections strategiques.
 * Le client peut tout remplacer depuis l'admin sans toucher au code.
 *
 * Si un champ est vide, le site retombe sur le wordmark texte (logos)
 * ou sur les placeholders Unsplash (images de section).
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Réglages du site',
  admin: {
    group: 'Administration',
    description:
      'Logos et images des sections clés du site. Glissez-déposez vos visuels ici, le site se met à jour automatiquement.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // ─── Identité visuelle (logos) ───
    {
      type: 'collapsible',
      label: 'Identité visuelle (logos)',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'logoOnLight',
          label: 'Logo pour fonds clairs (header)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Version sombre du logo, affichee dans le header (fond ivoire). PNG ou SVG transparent, hauteur 80-120 px. Si vide : wordmark texte par defaut.',
          },
        },
        {
          name: 'logoOnDark',
          label: 'Logo pour fonds sombres (footer)',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Version claire ou or du logo, affichee dans le footer (fond noir). PNG ou SVG transparent, hauteur 80-120 px. Si vide : wordmark texte par defaut.',
          },
        },
      ],
    },

    // ─── Page d'accueil ───
    {
      type: 'collapsible',
      label: "Images de la page d'accueil",
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'manifesteImage',
          label: 'Section Manifeste',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Grande image du bloc Manifeste. Portrait 1200x1500 px conseille.',
          },
        },
        {
          name: 'lldSectionImage',
          label: 'Section Location LLD',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Image du bloc Location longue duree. Portrait 1000x1250 px.',
          },
        },
        {
          name: 'showroomImage',
          label: 'Section Showroom Aubagne',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: "Photo du showroom ou de l'atelier. Paysage 1200x900 px.",
          },
        },
      ],
    },

    // ─── Pages internes ───
    {
      type: 'collapsible',
      label: 'Images des pages internes',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'lldHeroImage',
          label: 'Hero page Location LLD',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Image principale en haut de /location-mobilier-bureau. Paysage 1200x900 px.' },
        },
        {
          name: 'rseHeroImage',
          label: 'Hero page Attestation RSE',
          type: 'upload',
          relationTo: 'media',
          admin: { description: "Optionnel, pas affichee par defaut. Paysage 1200x900 px." },
        },
      ],
    },
  ],
}
