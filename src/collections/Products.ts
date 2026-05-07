import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Produit',
    plural: 'Mobilier (produits)',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'stock', 'condition', 'category', 'status'],
    group: 'Catalogue',
    listSearchableFields: ['title', 'sku', 'brand'],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
    maxPerDoc: 20,
  },
  fields: [
    // ─────────────────── Identité ───────────────────
    {
      name: 'title',
      type: 'text',
      label: 'Nom du produit',
      required: true,
    },
    slugField('title'),
    {
      name: 'sku',
      type: 'text',
      label: 'Référence interne (SKU)',
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Identifiant unique pour la gestion de stock.',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      defaultValue: 'draft',
      required: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'En vente', value: 'published' },
        { label: 'Vendu', value: 'sold' },
        { label: 'Archivé', value: 'archived' },
      ],
    },
    {
      name: 'condition',
      type: 'select',
      label: 'État du mobilier',
      defaultValue: 'excellent',
      required: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'Neuf', value: 'new' },
        { label: 'Excellent état', value: 'excellent' },
        { label: 'Très bon état', value: 'very-good' },
        { label: 'Bon état', value: 'good' },
        { label: 'Correct (traces d\'usage)', value: 'fair' },
      ],
    },

    // ─────────────────── Tabs principaux ───────────────────
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Description',
          fields: [
            {
              name: 'shortDescription',
              type: 'textarea',
              label: 'Description courte (résumé fiche)',
              maxLength: 250,
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Description complète',
            },
            {
              name: 'highlights',
              type: 'array',
              label: 'Points forts (3 à 5 max)',
              maxRows: 5,
              fields: [
                { name: 'text', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Photos',
          fields: [
            {
              name: 'images',
              type: 'array',
              label: 'Photos du produit',
              minRows: 1,
              required: true,
              admin: {
                description: '5 photos minimum recommandé. Première = photo principale.',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Prix & Stock',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  label: 'Prix de vente (€)',
                  required: true,
                  min: 0,
                  admin: { width: '33%' },
                },
                {
                  name: 'comparePrice',
                  type: 'number',
                  label: 'Prix barré / neuf (€)',
                  min: 0,
                  admin: {
                    width: '33%',
                    description: 'Affiche un prix barré pour montrer l\'économie.',
                  },
                },
                {
                  name: 'stock',
                  type: 'number',
                  label: 'Stock disponible',
                  required: true,
                  defaultValue: 1,
                  min: 0,
                  admin: { width: '33%' },
                },
              ],
            },
            {
              name: 'taxIncluded',
              type: 'checkbox',
              label: 'Prix TTC',
              defaultValue: true,
            },
          ],
        },
        {
          label: 'Caractéristiques',
          fields: [
            {
              name: 'category',
              type: 'relationship',
              label: 'Catégorie',
              relationTo: 'categories',
              required: true,
            },
            {
              name: 'brand',
              type: 'relationship',
              label: 'Marque d\'origine',
              relationTo: 'brands',
            },
            {
              name: 'color',
              type: 'text',
              label: 'Couleur principale',
            },
            {
              name: 'material',
              type: 'text',
              label: 'Matériau',
            },
            {
              type: 'row',
              fields: [
                { name: 'widthCm', type: 'number', label: 'Largeur (cm)', admin: { width: '25%' } },
                { name: 'depthCm', type: 'number', label: 'Profondeur (cm)', admin: { width: '25%' } },
                { name: 'heightCm', type: 'number', label: 'Hauteur (cm)', admin: { width: '25%' } },
                { name: 'weightKg', type: 'number', label: 'Poids (kg)', admin: { width: '25%' } },
              ],
            },
            {
              name: 'yearOfManufacture',
              type: 'number',
              label: 'Année de fabrication (approx.)',
            },
            {
              name: 'origin',
              type: 'text',
              label: 'Provient de (entreprise / contexte)',
              admin: {
                description: 'Ex: "Cabinet d\'avocats parisien — renouvellement de parc 2024"',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: false,
              fields: [
                { name: 'title', type: 'text', label: 'Titre meta (50-60 car.)' },
                { name: 'description', type: 'textarea', label: 'Description meta (150-160 car.)' },
                {
                  name: 'ogImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Image Open Graph (réseaux sociaux)',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
