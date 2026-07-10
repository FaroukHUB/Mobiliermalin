/**
 * GET /api/admin/products-search?q=steelcase
 *
 * Recherche des produits dans le catalogue Sanity pour l'autocomplete
 * du formulaire de création de devis manuel (/admin/nouveau-devis).
 *
 * Retourne les 10 produits les plus pertinents avec leurs infos
 * essentielles (nom, prix, slug, marque, condition, stock).
 *
 * Protégé par header x-admin-secret === ADMIN_IMPORT_SECRET.
 */

import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const providedSecret = req.headers.get('x-admin-secret')
  if (providedSecret !== process.env.ADMIN_IMPORT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()

  const words = q.split(/\s+/).filter((w) => w.length >= 2).map((w) => w + '*')

  try {
    const params: Record<string, string[]> = {}
    if (words.length > 0) params.words = words

    const results = await sanityClient.fetch<
      Array<{
        _id: string
        name: string
        slug: { current: string }
        price: number
        salePrice?: number
        stock: number
        brand?: string
        condition?: string
      }>
    >(
      `*[_type == "product" && status == "published"
         ${words.length > 0 ? '&& (name match $words || brand match $words || shortDescription match $words)' : ''}
       ] | order(_updatedAt desc) [0...10] {
        _id, name, slug, price, salePrice, stock, brand, condition
      }`,
      params,
    )

    return NextResponse.json({
      ok: true,
      products: results.map((p) => ({
        id: p._id,
        name: p.name,
        slug: p.slug.current,
        priceEur: p.salePrice ?? p.price,
        stock: p.stock,
        brand: p.brand,
        condition: p.condition,
      })),
    })
  } catch (err) {
    console.error('[products-search] error:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'inconnue' },
      { status: 500 },
    )
  }
}
