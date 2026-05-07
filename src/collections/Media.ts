import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Photo / Média',
    plural: 'Photothèque',
  },
  admin: {
    group: 'Contenus',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300, position: 'centre' },
      { name: 'card', width: 640, height: 480, position: 'centre' },
      { name: 'tablet', width: 1024 },
      { name: 'desktop', width: 1600 },
      { name: 'hero', width: 2000, height: 1000, position: 'centre' },
      { name: 'heroMobile', width: 800, height: 1000, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texte alternatif (SEO + accessibilité)',
      required: true,
      admin: {
        description:
          "Décrit l'image en quelques mots. Important pour Google et les lecteurs d'écran.",
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Légende (optionnelle)',
    },
  ],
}
