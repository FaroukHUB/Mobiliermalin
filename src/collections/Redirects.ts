import type { CollectionConfig } from 'payload'

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: {
    singular: 'Redirection',
    plural: 'Redirections (SEO)',
  },
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'type'],
    group: 'SEO & Référencement',
    description:
      "Indispensable lorsqu'on modifie une URL : conserve le référencement Google.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      label: 'Ancienne URL (à rediriger)',
      required: true,
      unique: true,
      admin: { description: 'Ex: /ancienne-page' },
    },
    {
      name: 'to',
      type: 'text',
      label: 'Nouvelle URL (destination)',
      required: true,
      admin: { description: 'Ex: /nouvelle-page' },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      defaultValue: '301',
      options: [
        { label: '301 — Permanente (recommandée)', value: '301' },
        { label: '302 — Temporaire', value: '302' },
      ],
    },
  ],
}
