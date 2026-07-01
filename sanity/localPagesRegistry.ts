/**
 * Registre centralisé des pages locales (catégorie × ville).
 * Utilisé par :
 *  - le schéma `localPage` (dropdown des pageKeys autorisés)
 *  - la structure Studio (arborescence "Pages locales (SEO)")
 *  - les templates de création (pré-remplissage du pageKey + displayName)
 *
 * Ajouter une entrée ici = elle apparaît automatiquement partout.
 */

export type LocalPageSection =
  | 'hubs'
  | 'marseille'
  | 'aubagne'
  | 'aix-en-provence'
  | 'nice'
  | 'toulon'
  | 'bouches-du-rhone-autres'
  | 'vaucluse'

export type LocalPageEntry = {
  key: string // pageKey ex: "bureau-toulon"
  title: string // Libellé affiché ex: "Bureau × Toulon"
  displayName: string // Nom court pour Studio ex: "Bureau Toulon"
  route: string // URL publique correspondante
  section: LocalPageSection
  icon: string // emoji utilisé dans la sidebar Studio
}

export const LOCAL_PAGES: LocalPageEntry[] = [
  // ─── Hubs "Meuble" (catégorie large) ───
  {
    key: 'meuble-marseille',
    title: 'Meuble × Marseille (hub)',
    displayName: 'Meuble Marseille',
    route: '/meuble-occasion-marseille',
    section: 'hubs',
    icon: '🏢',
  },
  {
    key: 'meuble-aubagne',
    title: 'Meuble × Aubagne (hub)',
    displayName: 'Meuble Aubagne',
    route: '/meuble-occasion-aubagne',
    section: 'hubs',
    icon: '🏢',
  },

  // ─── Marseille ───
  {
    key: 'bureau-marseille',
    title: 'Bureau × Marseille',
    displayName: 'Bureau Marseille',
    route: '/bureau-occasion-marseille',
    section: 'marseille',
    icon: '💼',
  },
  {
    key: 'fauteuil-marseille',
    title: 'Fauteuil × Marseille',
    displayName: 'Fauteuil Marseille',
    route: '/fauteuil-occasion-marseille',
    section: 'marseille',
    icon: '🪑',
  },
  {
    key: 'table-marseille',
    title: 'Table × Marseille',
    displayName: 'Table Marseille',
    route: '/table-occasion-marseille',
    section: 'marseille',
    icon: '🍽️',
  },
  {
    key: 'armoire-marseille',
    title: 'Armoire × Marseille',
    displayName: 'Armoire Marseille',
    route: '/armoire-occasion-marseille',
    section: 'marseille',
    icon: '🗄️',
  },

  // ─── Aubagne ───
  {
    key: 'bureau-aubagne',
    title: 'Bureau × Aubagne',
    displayName: 'Bureau Aubagne',
    route: '/bureau-occasion-aubagne',
    section: 'aubagne',
    icon: '💼',
  },
  {
    key: 'fauteuil-aubagne',
    title: 'Fauteuil × Aubagne',
    displayName: 'Fauteuil Aubagne',
    route: '/fauteuil-occasion-aubagne',
    section: 'aubagne',
    icon: '🪑',
  },

  // ─── Aix-en-Provence ───
  {
    key: 'bureau-aix-en-provence',
    title: 'Bureau × Aix-en-Provence',
    displayName: 'Bureau Aix',
    route: '/bureau-occasion-aix-en-provence',
    section: 'aix-en-provence',
    icon: '💼',
  },
  {
    key: 'fauteuil-aix-en-provence',
    title: 'Fauteuil × Aix-en-Provence',
    displayName: 'Fauteuil Aix',
    route: '/fauteuil-occasion-aix-en-provence',
    section: 'aix-en-provence',
    icon: '🪑',
  },

  // ─── Nice / Côte d'Azur ───
  {
    key: 'bureau-nice',
    title: 'Bureau × Nice',
    displayName: 'Bureau Nice',
    route: '/bureau-occasion-nice',
    section: 'nice',
    icon: '💼',
  },
  {
    key: 'fauteuil-nice',
    title: 'Fauteuil × Nice',
    displayName: 'Fauteuil Nice',
    route: '/fauteuil-occasion-nice',
    section: 'nice',
    icon: '🪑',
  },

  // ─── Toulon / Var ───
  {
    key: 'bureau-toulon',
    title: 'Bureau × Toulon',
    displayName: 'Bureau Toulon',
    route: '/bureau-occasion-toulon',
    section: 'toulon',
    icon: '💼',
  },
  {
    key: 'fauteuil-toulon',
    title: 'Fauteuil × Toulon',
    displayName: 'Fauteuil Toulon',
    route: '/fauteuil-occasion-toulon',
    section: 'toulon',
    icon: '🪑',
  },

  // ─── Bouches-du-Rhône (autres villes) ───
  {
    key: 'bureau-la-ciotat',
    title: 'Bureau × La Ciotat',
    displayName: 'Bureau La Ciotat',
    route: '/bureau-occasion-la-ciotat',
    section: 'bouches-du-rhone-autres',
    icon: '💼',
  },

  // ─── Vaucluse ───
  {
    key: 'bureau-avignon',
    title: 'Bureau × Avignon',
    displayName: 'Bureau Avignon',
    route: '/bureau-occasion-avignon',
    section: 'vaucluse',
    icon: '💼',
  },
  {
    key: 'bureau-orange',
    title: 'Bureau × Orange',
    displayName: 'Bureau Orange',
    route: '/bureau-occasion-orange',
    section: 'vaucluse',
    icon: '💼',
  },
]

export const LOCAL_PAGE_SECTIONS: { key: LocalPageSection; label: string }[] = [
  { key: 'hubs', label: 'Hubs "Meuble" (catégorie large)' },
  { key: 'marseille', label: 'Marseille' },
  { key: 'aubagne', label: 'Aubagne' },
  { key: 'aix-en-provence', label: 'Aix-en-Provence' },
  { key: 'nice', label: 'Nice / Côte d\'Azur' },
  { key: 'toulon', label: 'Toulon / Var' },
  { key: 'bouches-du-rhone-autres', label: 'Bouches-du-Rhône (autres villes)' },
  { key: 'vaucluse', label: 'Vaucluse' },
]

/**
 * ID Sanity stable pour chaque page. On préfixe par le _type pour éviter
 * toute collision et respecter la convention Sanity (draft.localPage.xxx).
 */
export function localPageDocumentId(pageKey: string): string {
  return `localPage.${pageKey}`
}
