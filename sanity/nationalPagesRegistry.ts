/**
 * Registre centralisé des pages nationales éditables Sanity.
 * Utilisé par :
 *  - le schéma `nationalLandingPage` (dropdown des pageKeys autorisés)
 *  - la structure Studio (arborescence "Pages nationales")
 *  - les templates de création (pré-remplissage du pageKey)
 *  - les fetches côté page React (via getNationalLandingByKey)
 *
 * Ajouter une entrée ici = elle apparaît automatiquement dans Studio.
 */

export type NationalPageSection =
  | 'produit-vertical'
  | 'marques'

export type NationalPageEntry = {
  key: string          // pageKey ex: "fauteuil-ergonomique"
  title: string        // Libellé Studio ex: "Fauteuil ergonomique"
  displayName: string  // Version courte pour la liste
  route: string        // URL publique correspondante
  section: NationalPageSection
  icon: string         // emoji sidebar Studio
}

export const NATIONAL_PAGES: NationalPageEntry[] = [
  {
    key: 'mobilier-de-bureau-occasion',
    title: 'Mobilier de bureau occasion (HUB)',
    displayName: 'Mobilier de bureau occasion',
    route: '/mobilier-de-bureau-occasion',
    section: 'produit-vertical',
    icon: '🏢',
  },
  {
    key: 'bureau-occasion',
    title: "Bureau d'occasion (grand public)",
    displayName: 'Bureau occasion',
    route: '/bureau-occasion',
    section: 'produit-vertical',
    icon: '🖥',
  },
  {
    key: 'bureau-professionnel-occasion',
    title: "Bureau professionnel d'occasion (BtoB)",
    displayName: 'Bureau pro occasion',
    route: '/bureau-professionnel-occasion',
    section: 'produit-vertical',
    icon: '💼',
  },
  {
    key: 'chaise-bureau-occasion',
    title: "Chaise de bureau d'occasion",
    displayName: 'Chaise bureau occasion',
    route: '/chaise-bureau-occasion',
    section: 'produit-vertical',
    icon: '💺',
  },
  {
    key: 'fauteuil-ergonomique',
    title: 'Fauteuil ergonomique',
    displayName: 'Fauteuil ergonomique',
    route: '/fauteuil-ergonomique',
    section: 'produit-vertical',
    icon: '🪑',
  },
  {
    key: 'bureau-assis-debout-occasion',
    title: "Bureau assis-debout d'occasion",
    displayName: 'Bureau assis-debout occasion',
    route: '/bureau-assis-debout-occasion',
    section: 'produit-vertical',
    icon: '📐',
  },
  {
    key: 'table-reunion-occasion',
    title: "Table de réunion d'occasion",
    displayName: 'Table de réunion occasion',
    route: '/table-reunion-occasion',
    section: 'produit-vertical',
    icon: '🪟',
  },
  {
    key: 'mobilier-bureau-entreprise',
    title: 'Mobilier de bureau pour entreprise (BtoB)',
    displayName: 'Mobilier bureau entreprise',
    route: '/mobilier-bureau-entreprise',
    section: 'produit-vertical',
    icon: '🏛',
  },
  {
    key: 'cabine-acoustique-bureau',
    title: 'Cabine acoustique de bureau',
    displayName: 'Cabine acoustique bureau',
    route: '/cabine-acoustique-bureau',
    section: 'produit-vertical',
    icon: '🔇',
  },
  {
    key: 'mobilier-bureau-eco-responsable',
    title: 'Mobilier de bureau éco-responsable (RSE)',
    displayName: 'Mobilier bureau éco-responsable',
    route: '/mobilier-bureau-eco-responsable',
    section: 'produit-vertical',
    icon: '🌿',
  },
  {
    key: 'marques-steelcase',
    title: 'Marques — Steelcase',
    displayName: 'Steelcase',
    route: '/marques/steelcase',
    section: 'marques',
    icon: '🏷️',
  },
]

export const NATIONAL_PAGE_SECTIONS: Array<{ key: NationalPageSection; label: string }> = [
  { key: 'produit-vertical', label: 'Landing produit (vertical)' },
  { key: 'marques', label: 'Landing marque' },
]

export function nationalPageDocumentId(key: string): string {
  return `nationalLanding.${key}`
}
