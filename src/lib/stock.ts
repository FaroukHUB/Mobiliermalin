/**
 * Décrémentation du stock produit.
 *
 * Utilisé après un paiement en ligne (webhook Stripe) pour retirer du
 * stock Sanity les quantités effectivement vendues. Les ventes au
 * showroom passent, elles, par l'action Studio "Vente au magasin".
 *
 * Règles :
 *  - le stock ne descend jamais sous 0
 *  - un produit introuvable (slug absent du catalogue) est ignoré, sans
 *    faire échouer les autres lignes
 *  - la fonction ne lève jamais : un échec de stock ne doit pas casser
 *    le traitement d'une commande déjà payée
 */

import { getWriteClient, isSanityWriteConfigured } from './sanity-write'

export type StockEntry = {
  /** Slug du produit Sanity (metadata Stripe des line items). */
  slug?: string
  quantity?: number
}

export type StockResult = {
  updated: Array<{ slug: string; from: number; to: number }>
  skipped: Array<{ slug: string; reason: string }>
}

export async function decrementStockForItems(
  items: StockEntry[],
): Promise<StockResult> {
  const result: StockResult = { updated: [], skipped: [] }
  if (!isSanityWriteConfigured()) {
    result.skipped.push({ slug: '*', reason: 'SANITY_WRITE_TOKEN absent' })
    return result
  }
  const client = getWriteClient()!

  // Agrège les quantités par slug : un même produit peut apparaître
  // sur plusieurs lignes d'une même commande.
  const bySlug = new Map<string, number>()
  for (const it of items) {
    const slug = it.slug?.trim()
    const qty = typeof it.quantity === 'number' && it.quantity > 0 ? it.quantity : 1
    if (!slug) continue
    bySlug.set(slug, (bySlug.get(slug) || 0) + qty)
  }

  for (const [slug, qty] of bySlug.entries()) {
    try {
      const product = await client.fetch<{ _id: string; stock?: number } | null>(
        `*[_type == "product" && slug.current == $slug][0]{ _id, stock }`,
        { slug },
      )
      if (!product?._id) {
        result.skipped.push({ slug, reason: 'produit introuvable' })
        continue
      }
      const from = typeof product.stock === 'number' ? product.stock : 0
      const to = Math.max(0, from - qty)
      if (to === from) {
        result.skipped.push({ slug, reason: 'stock déjà à 0' })
        continue
      }
      await client.patch(product._id).set({ stock: to }).commit()
      result.updated.push({ slug, from, to })
    } catch (err) {
      result.skipped.push({
        slug,
        reason: err instanceof Error ? err.message : 'erreur inconnue',
      })
    }
  }

  return result
}
