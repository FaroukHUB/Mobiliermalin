/**
 * URL de la boutique principale.
 * Désormais interne au Next.js (Sanity + Stripe).
 */
export const SHOP_URL = '/boutique'

/**
 * URL d'une page catégorie interne (page Next.js qui liste les produits Sanity).
 */
export function shopCategoryUrl(slug: string): string {
  return `/categorie/${slug}`
}
