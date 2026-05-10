import type { CollectionConfig } from 'payload'

/**
 * Reglages du site — implementation "singleton" via une collection.
 *
 * Pourquoi pas un Global ? Payload v3.84 a un bug connu qui fait que les
 * globaux fraichement ajoutes renvoient 404 sur leur route admin meme
 * lorsqu'ils sont correctement configures. La collection "singleton" est
 * plus fiable et offre la meme UX au client.
 *
 * On limite la collection a 1 seul document via un beforeChange hook qui
 * bloque la creation d'un 2e enregistrement.
 */
export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: {
    singular: 'Réglages du site',
    plural: 'Réglages du site',
  },
  admin: {
    useAsTitle: 'siteName',
    group: 'Administration',
    description:
      "Logos et images des sections cles du site. Une seule fiche : modifiez les valeurs ici et le site se met a jour automatiquement.",
    // On souhaite que l'utilisateur n'ait qu'a editer la seule entree.
    // Defaultcolumns minimal pour la vue liste.
    defaultColumns: ['siteName', 'updatedAt'],
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    delete: () => false, // empêche la suppression
  },
  hooks: {
    beforeValidate: [
      async ({ req, operation }) => {
        // Bloque la creation si une fiche existe deja
        if (operation === 'create') {
          const existing = await req.payload.count({ collection: 'site-settings' })
          if (existing.totalDocs >= 1) {
            throw new Error(
              'Une fiche de Réglages du site existe déjà. Modifiez la fiche existante au lieu d\'en créer une nouvelle.',
            )
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      label: 'Nom du site (interne)',
      defaultValue: 'Mobilier Malin',
      admin: {
        description: 'Champ technique. Laissez "Mobilier Malin" par défaut.',
      },
    },
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
          admin: { description: 'Grande image du bloc Manifeste. Portrait 1200x1500 px conseille.' },
        },
        {
          name: 'lldSectionImage',
          label: 'Section Location LLD',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Image du bloc Location longue duree. Portrait 1000x1250 px.' },
        },
        {
          name: 'showroomImage',
          label: 'Section Showroom Aubagne',
          type: 'upload',
          relationTo: 'media',
          admin: { description: "Photo du showroom ou de l'atelier. Paysage 1200x900 px." },
        },
      ],
    },
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
          admin: {
            description:
              'Image principale en haut de /location-mobilier-bureau. Paysage 1200x900 px.',
          },
        },
        {
          name: 'rseHeroImage',
          label: 'Hero page Attestation RSE',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Optionnel, pas affichee par defaut. Paysage 1200x900 px.',
          },
        },
      ],
    },
  ],
}
