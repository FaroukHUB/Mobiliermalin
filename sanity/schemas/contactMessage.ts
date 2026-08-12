import type { Rule } from 'sanity'

/**
 * Schema "Message contact" — chaque soumission du formulaire /contact
 * est enregistrée ici (en plus de l'email envoyé à l'admin), pour
 * pouvoir comptabiliser et retrouver les demandes reçues sur le site.
 *
 * Créé automatiquement par POST /api/contact. Les champs sont en
 * lecture seule sauf "Traité" et "Notes internes" (suivi admin).
 */
export const contactMessage = {
  name: 'contactMessage',
  title: 'Message contact',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nom',
      type: 'string',
      readOnly: true,
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'phone',
      title: 'Téléphone',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'company',
      title: 'Société',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'projectType',
      title: 'Type de projet',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { value: 'achat', title: 'Achat de mobilier reconditionné' },
          { value: 'devis-livraison', title: 'Devis livraison pour un produit' },
          { value: 'vidage', title: 'Vidage de locaux / reprise' },
          { value: 'mixte', title: 'Achat ET vidage' },
          { value: 'lld', title: 'Location longue durée (LLD)' },
          { value: 'devis', title: 'Demande de devis détaillé' },
          { value: 'autre', title: 'Autre demande' },
        ],
      },
    },
    {
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 6,
      readOnly: true,
    },
    {
      name: 'receivedAt',
      title: 'Reçu le',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'handled',
      title: 'Traité',
      type: 'boolean',
      initialValue: false,
      description: 'Coche quand tu as répondu au client.',
    },
    {
      name: 'internalNotes',
      title: 'Notes internes',
      type: 'text',
      rows: 3,
      description: 'Suivi de la demande (réponse envoyée, relance à faire…).',
    },
    {
      name: 'brevoMessageId',
      title: 'ID message Brevo',
      type: 'string',
      readOnly: true,
      hidden: true,
      description: 'Rempli par le script d\'import des anciens messages (dédoublonnage).',
    },
  ],
  preview: {
    select: {
      name: 'name',
      projectType: 'projectType',
      receivedAt: 'receivedAt',
      handled: 'handled',
    },
    prepare({
      name,
      projectType,
      receivedAt,
      handled,
    }: {
      name?: string
      projectType?: string
      receivedAt?: string
      handled?: boolean
    }) {
      const labels: Record<string, string> = {
        achat: 'Achat',
        'devis-livraison': 'Devis livraison',
        vidage: 'Vidage de locaux',
        mixte: 'Achat + vidage',
        lld: 'LLD',
        devis: 'Devis détaillé',
        autre: 'Autre',
      }
      const date = receivedAt
        ? new Date(receivedAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : ''
      return {
        title: `${handled ? '✅' : '🟡'} ${name || '(sans nom)'}`,
        subtitle: `${labels[projectType || ''] || projectType || '?'} · ${date}`,
      }
    },
  },
  orderings: [
    {
      title: 'Plus récents d\'abord',
      name: 'receivedDesc',
      by: [{ field: 'receivedAt', direction: 'desc' }],
    },
  ],
}
