import type { Field } from 'payload'

const slugify = (value: string): string =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const slugField = (sourceField: string = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Adresse web (slug)',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description:
      "Partie de l'URL après le domaine. Auto-rempli depuis le nom. Modifier avec prudence (impacte le SEO).",
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) {
          return slugify(value)
        }
        const source = (data as Record<string, unknown> | undefined)?.[sourceField]
        if (typeof source === 'string' && source.length > 0) {
          return slugify(source)
        }
        return value
      },
    ],
  },
})
