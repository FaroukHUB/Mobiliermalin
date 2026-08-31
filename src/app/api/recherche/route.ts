/**
 * GET /api/recherche?q=reply+air
 *
 * Recherche publique du site : alimente les suggestions instantanées
 * de la barre de recherche de l'en-tête.
 *
 * Cherche dans le nom, la marque et la description courte des produits
 * publiés, et remonte aussi les catégories qui correspondent, pour
 * qu'une recherche large ("bureau") mène au rayon plutôt qu'à une
 * pièce isolée.
 *
 * Les pièces vendues sont exclues des suggestions : leur fiche reste
 * en ligne pour le référencement, mais on ne propose pas d'acheter ce
 * qui n'est plus disponible.
 */

import { NextResponse } from 'next/server'
import { sanityClient, urlFor, type SanityImage } from '@/lib/sanity'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  excellent: 'Excellent état',
  'very-good': 'Très bon état',
  good: 'Bon état',
  fair: 'État correct',
}

type ProductHit = {
  _id: string
  name: string
  slug: { current: string }
  price: number
  salePrice?: number
  stock: number
  brand?: string
  condition?: string
  firstImage?: SanityImage
}

type CategoryHit = {
  _id: string
  name: string
  slug: { current: string }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()

  // Deux caractères minimum : en dessous, tout le catalogue remonterait.
  if (q.length < 2) {
    return NextResponse.json({ ok: true, products: [], categories: [] })
  }

  const words = q
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .map((w) => `${w}*`)

  if (words.length === 0) {
    return NextResponse.json({ ok: true, products: [], categories: [] })
  }

  try {
    const [products, categories] = await Promise.all([
      sanityClient.fetch<ProductHit[]>(
        `*[_type == "product" && status == "published" && defined(slug.current)
           && (name match $words || brand match $words || shortDescription match $words)]
         | order(_createdAt desc) [0...12] {
          _id, name, slug, price, salePrice, stock, brand, condition,
          "firstImage": images[0]{ asset, alt }
        }`,
        { words },
      ),
      sanityClient.fetch<CategoryHit[]>(
        `*[_type == "category" && defined(slug.current) && name match $words]
         | order(order asc) [0...3] { _id, name, slug }`,
        { words },
      ),
    ])

    // Disponibles d'abord, puis les plus récents : GROQ n'accepte pas
    // d'expression booléenne dans order(), le tri se fait donc ici.
    const ranked = [...products]
      .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0))
      .slice(0, 6)

    return NextResponse.json({
      ok: true,
      products: ranked.map((p) => {
        const img = p.firstImage
        return {
          id: p._id,
          name: p.name,
          slug: p.slug.current,
          price: p.salePrice && p.salePrice < p.price ? p.salePrice : p.price,
          inStock: p.stock > 0,
          brand: p.brand,
          conditionLabel: p.condition ? CONDITION_LABELS[p.condition] : undefined,
          imageUrl: img?.asset
            ? urlFor(img).width(120).height(120).fit('crop').url()
            : undefined,
        }
      }),
      categories: categories.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug.current,
      })),
    })
  } catch (err) {
    console.error('[recherche] error:', err)
    return NextResponse.json(
      { ok: false, products: [], categories: [] },
      { status: 500 },
    )
  }
}
