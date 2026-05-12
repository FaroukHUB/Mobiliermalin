import type { Rule } from 'sanity'

export const heroSlide = {
  name: 'heroSlide',
  title: 'Slide d\'accueil',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titre principal',
      type: 'string',
      validation: (R: Rule) => R.required().max(120),
    },
    {
      name: 'subtitle',
      title: 'Sous-titre',
      type: 'text',
      rows: 2,
    },
    {
      name: 'image',
      title: 'Image (desktop)',
      type: 'image',
      options: { hotspot: true },
      validation: (R: Rule) => R.required(),
      description: 'Image plein écran derrière le texte. Format paysage 1920×900 px conseillé.',
    },
    {
      name: 'imageMobile',
      title: 'Image (mobile) — optionnel',
      type: 'image',
      options: { hotspot: true },
      description: "Si remplie, utilisée sur mobile à la place de l'image desktop. Format portrait 800×1000 px.",
    },
    {
      name: 'ctaPrimaryLabel',
      title: 'Bouton principal — texte',
      type: 'string',
    },
    {
      name: 'ctaPrimaryHref',
      title: 'Bouton principal — lien',
      type: 'string',
      description: 'Ex: /boutique ou /location-mobilier-bureau',
    },
    {
      name: 'ctaSecondaryLabel',
      title: 'Bouton secondaire — texte',
      type: 'string',
    },
    {
      name: 'ctaSecondaryHref',
      title: 'Bouton secondaire — lien',
      type: 'string',
    },
    {
      name: 'textPosition',
      title: 'Position du texte',
      type: 'string',
      options: {
        list: [
          { title: 'Gauche', value: 'left' },
          { title: 'Centre', value: 'center' },
          { title: 'Droite', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    },
    {
      name: 'textColor',
      title: 'Couleur du texte',
      type: 'string',
      options: {
        list: [
          { title: 'Clair (sur image sombre)', value: 'light' },
          { title: 'Sombre (sur image claire)', value: 'dark' },
        ],
        layout: 'radio',
      },
      initialValue: 'light',
    },
    {
      name: 'overlayOpacity',
      title: 'Voile sombre (0–80)',
      type: 'number',
      validation: (R: Rule) => R.min(0).max(80),
      initialValue: 35,
      description: 'Améliore la lisibilité du texte sur les images chargées.',
    },
    {
      name: 'order',
      title: 'Ordre d\'affichage',
      type: 'number',
      initialValue: 0,
      description: 'Plus petit = affiché en premier dans le carrousel.',
    },
    {
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: 'Publié (visible)', value: 'published' },
          { title: 'Brouillon (caché)', value: 'draft' },
        ],
        layout: 'radio',
      },
      initialValue: 'published',
      validation: (R: Rule) => R.required(),
    },
  ],
  orderings: [
    {
      title: 'Ordre',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'status', media: 'image' },
    prepare: (s: { title?: string; subtitle?: string; media?: unknown }) => ({
      title: s.title || 'Sans titre',
      subtitle: s.subtitle === 'published' ? '✓ Publiée' : '✎ Brouillon',
      media: s.media,
    }),
  },
}
