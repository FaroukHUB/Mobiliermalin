/**
 * Constantes centralisées pour la sérialisation Schema.org / Google Merchant.
 *
 * Source unique de vérité pour :
 *   - mapping état Sanity → schema.org enum
 *   - mapping état Sanity → Merchant condition
 *   - mapping stock+availabilityStatus → schema.org availability
 *   - mapping stock+availabilityStatus → Merchant availability
 *   - table marques → URL officielle (brand.sameAs)
 *
 * Toute nouvelle valeur qui touche à la fois le JSON-LD ET le feed doit
 * passer par un helper ici pour éviter les divergences.
 */

import type { SanityProduct } from './sanity'

// ─── État produit ───────────────────────────────────────────
// Mapping condition Sanity → schema.org URL
export const CONDITION_TO_SCHEMA_ORG: Record<string, string> = {
  new: 'https://schema.org/NewCondition',
  excellent: 'https://schema.org/RefurbishedCondition',
  'very-good': 'https://schema.org/RefurbishedCondition',
  good: 'https://schema.org/RefurbishedCondition',
  fair: 'https://schema.org/UsedCondition',
}

// Mapping condition Sanity → Google Merchant Center (feed condition attribute)
// Valeurs Google : 'new', 'refurbished', 'used'
export const CONDITION_TO_GMC: Record<string, 'new' | 'refurbished' | 'used'> = {
  new: 'new',
  excellent: 'refurbished',
  'very-good': 'refurbished',
  good: 'refurbished',
  fair: 'used',
}

// ─── Disponibilité ──────────────────────────────────────────
/**
 * Détermine l'availability schema.org à partir de stock + availabilityStatus.
 * Si `availabilityStatus` est renseigné, il fait autorité. Sinon, calcul par
 * le stock (>0 = InStock, sinon OutOfStock).
 */
export function resolveSchemaOrgAvailability(product: SanityProduct): string {
  // Pièce vendue : la fiche reste en ligne, mais Google doit savoir
  // qu'elle n'est plus achetable en l'état (évite un extrait enrichi
  // trompeur et un signal négatif).
  if (product.status === 'sold') return 'https://schema.org/SoldOut'
  const status = product.availabilityStatus
  switch (status) {
    case 'inStock':
      return 'https://schema.org/InStock'
    case 'temporarilyOutOfStock':
      return 'https://schema.org/OutOfStock'
    case 'backorder':
      return 'https://schema.org/BackOrder'
    case 'preorder':
      return 'https://schema.org/PreOrder'
    case 'soldOut':
      return 'https://schema.org/SoldOut'
    case 'onQuote':
      return 'https://schema.org/LimitedAvailability'
    default:
      // Fallback stock-based si availabilityStatus non renseigné (produits legacy)
      if (product.stock > 5) return 'https://schema.org/InStock'
      if (product.stock > 0) return 'https://schema.org/LimitedAvailability'
      return 'https://schema.org/OutOfStock'
  }
}

/**
 * Détermine l'availability Merchant Center (feed).
 * Valeurs Google : 'in_stock', 'out_of_stock', 'preorder', 'backorder'.
 */
export function resolveMerchantAvailability(
  product: SanityProduct,
): 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder' {
  const status = product.availabilityStatus
  if (status === 'preorder') return 'preorder'
  if (status === 'backorder') return 'backorder'
  if (status === 'soldOut' || status === 'temporarilyOutOfStock') {
    return 'out_of_stock'
  }
  if (product.stock > 0) return 'in_stock'
  return 'out_of_stock'
}

// ─── Marques : URL officielle pour brand.sameAs ─────────────
// Utilisé UNIQUEMENT pour désambiguïser l'entité marque, jamais pour dériver
// une autre propriété (comme countryOfOrigin) — voir consigne 2 du 15/07.
// ⚠ À valider avec Farouk avant intégration effective — Urban Mesh reste TBD.
export const BRAND_OFFICIAL_URL: Record<string, string> = {
  Steelcase: 'https://www.steelcase.com/eu-fr/',
  'Herman Miller': 'https://www.hermanmiller.com/fr_fr/',
  Haworth: 'https://www.haworth.com/fr/fr.html',
  Vitra: 'https://www.vitra.com/fr-fr/home',
  Majencia: 'https://www.majencia.com',
  HÅG: 'https://www.flokk.com/fr/marques/hag',
  Knoll: 'https://www.knoll.com',
  'USM Haller': 'https://www.usm.com/fr-fr/',
  ICF: 'https://www.icfoffice.it/en',
  Zuco: 'https://www.zuco.ch/en',
  Actiu: 'https://www.actiu.com/fr/',
}

/**
 * Résolution catégorie principale du produit.
 * Ordre : primaryCategory → categories[0] → category (legacy) → null.
 * Utilisée pour breadcrumb, URL canonique, google_product_category, etc.
 */
export function resolveCanonicalCategory(product: SanityProduct) {
  return (
    product.primaryCategory ||
    product.categories?.[0] ||
    product.category ||
    null
  )
}

/**
 * Résolution de la Google Product Category ID.
 * Ordre : product.override → primaryCategory.gpcId → categories[].first_defined → null.
 */
export function resolveGoogleProductCategoryId(
  product: SanityProduct,
): number | null {
  if (product.googleProductCategoryOverride) {
    return product.googleProductCategoryOverride
  }
  const primary = resolveCanonicalCategory(product)
  if (primary?.googleProductCategoryId) return primary.googleProductCategoryId
  const found = (product.categories || []).find(
    (c) => c.googleProductCategoryId,
  )
  return found?.googleProductCategoryId ?? null
}
