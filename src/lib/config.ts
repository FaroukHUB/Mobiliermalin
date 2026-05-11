/**
 * URL de la boutique externe (WordPress + WooCommerce).
 * Configurable via NEXT_PUBLIC_SHOP_URL en production.
 *
 * Tant que la boutique n'est pas en ligne, on pointe vers la page contact
 * pour ne pas casser les liens.
 */
export const SHOP_URL =
  process.env.NEXT_PUBLIC_SHOP_URL || 'https://shop.mobiliermalin.com'

/**
 * URL d'une catégorie spécifique sur la boutique (par slug).
 * Si la boutique n'a pas la même structure d'URL, à adapter ici.
 */
export function shopCategoryUrl(slug: string): string {
  return `${SHOP_URL}/categorie-produit/${slug}`
}
