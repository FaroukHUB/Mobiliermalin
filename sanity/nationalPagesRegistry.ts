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
    key: 'fauteuil-ergonomique',
    title: 'Fauteuil ergonomique',
    displayName: 'Fauteuil ergonomique',
    route: '/fauteuil-ergonomique',
    section: 'produit-vertical',
    icon: '🪑',
  },
  {
    key: 'bureau-professionnel-occasion',
    title: "Bureau professionnel d'occasion",
    displayName: 'Bureau pro occasion',
    route: '/bureau-professionnel-occasion',
    section: 'produit-vertical',
    icon: '💼',
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
