import type { GlobalConfig } from 'payload'

/**
 * Reglages globaux du site : images des sections strategiques
 * que le client peut remplacer depuis l'admin sans toucher au code.
 *
 * Si un champ est vide, le site retombe sur l'image placeholder
 * definie dans le code (Unsplash).
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Réglages du site',
  admin: {
    group: 'Administration',
    description:
      'Images des sections clés du site (page d’accueil, pages services). Glissez-déposez vos visuels ici, le site se met à jour automatiquement.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Page d’accueil',
          fields: [
            {
              name: 'manifesteImage',
              label: 'Image — Section Manifeste',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Grande image du bloc « Notre manifeste ». Format conseillé : portrait 1200×1500 px.',
              },
            },
            {
              name: 'lldSectionImage',
              label: 'Image — Section Location LLD',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Image accompagnant le bloc « Location longue durée ». Format conseillé : portrait 1000×1250 px.',
              },
            },
            {
              name: 'showroomImage',
              label: 'Image — Section Showroom Aubagne',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Photo du showroom ou de l’atelier. Format conseillé : paysage 1200×900 px.',
              },
            },
          ],
        },
        {
          label: 'Pages internes',
          fields: [
            {
              name: 'lldHeroImage',
              label: 'Hero — page Location LLD',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Image principale en haut de la page /location-mobilier-bureau. Paysage 1200×900 px.',
              },
            },
            {
              name: 'rseHeroImage',
              label: 'Hero — page Attestation RSE',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Image principale en haut de la page /attestation-rse. Paysage 1200×900 px (optionnel, pas affichée par défaut).',
              },
            },
          ],
        },
      ],
    },
  ],
}
