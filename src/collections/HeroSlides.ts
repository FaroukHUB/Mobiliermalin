import type { CollectionConfig } from 'payload'

export const HeroSlides: CollectionConfig = {
  slug: 'hero-slides',
  labels: {
    singular: 'Slide d\'accueil',
    plural: 'Hero — Slider d\'accueil',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'status', 'startsAt', 'endsAt'],
    group: 'Contenus',
    description:
      'Gérez les slides du carrousel d\'accueil. Glisser-déposer pour réordonner.',
  },
  defaultSort: 'order',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre principal (H1 sur la 1ère slide)',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: 'Accroche / sous-titre',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Image desktop (1920×900 recommandé)',
          admin: { width: '50%' },
        },
        {
          name: 'imageMobile',
          type: 'upload',
          relationTo: 'media',
          label: 'Image mobile (optionnelle, format vertical)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Boutons d\'action',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'ctaPrimaryLabel',
              type: 'text',
              label: 'Bouton principal — texte',
              admin: { width: '50%' },
            },
            {
              name: 'ctaPrimaryHref',
              type: 'text',
              label: 'Bouton principal — lien',
              admin: { width: '50%', description: 'Ex: /boutique ou /categorie/bureaux' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'ctaSecondaryLabel',
              type: 'text',
              label: 'Bouton secondaire — texte',
              admin: { width: '50%' },
            },
            {
              name: 'ctaSecondaryHref',
              type: 'text',
              label: 'Bouton secondaire — lien',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Mise en page & lisibilité',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'textPosition',
              type: 'select',
              label: 'Position du texte',
              defaultValue: 'left',
              admin: { width: '33%' },
              options: [
                { label: 'Gauche', value: 'left' },
                { label: 'Centre', value: 'center' },
                { label: 'Droite', value: 'right' },
              ],
            },
            {
              name: 'textColor',
              type: 'select',
              label: 'Couleur du texte',
              defaultValue: 'light',
              admin: { width: '33%' },
              options: [
                { label: 'Clair (sur photo sombre)', value: 'light' },
                { label: 'Sombre (sur photo claire)', value: 'dark' },
              ],
            },
            {
              name: 'overlayOpacity',
              type: 'number',
              label: 'Voile sombre (0-80)',
              defaultValue: 30,
              min: 0,
              max: 80,
              admin: { width: '34%', description: 'Améliore la lisibilité du texte.' },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Planification',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'startsAt',
              type: 'date',
              label: 'Affiché à partir du',
              admin: { width: '50%' },
            },
            {
              name: 'endsAt',
              type: 'date',
              label: 'Jusqu\'au',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      label: 'Ordre d\'affichage',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Plus petit = affiché en premier.',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      defaultValue: 'published',
      required: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'Publié', value: 'published' },
        { label: 'Brouillon', value: 'draft' },
      ],
    },
  ],
}
