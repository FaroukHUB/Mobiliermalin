/**
 * GET /catalogue.pdf
 *
 * Catalogue PDF professionnel de tous les produits publiés, généré à
 * la demande depuis Sanity : toujours à jour, sans maintenance.
 *
 * Structure éditoriale (voir CataloguePdf.tsx) :
 *   couverture photo → édito → table des matières (avec numéros de
 *   pages calculés) → une ouverture pleine page + fiches par
 *   catégorie → page contact.
 *
 * Mise en cache CDN 1 h (la génération charge toutes les photos).
 */

import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { sanityClient, urlFor } from '@/lib/sanity'
import {
  CataloguePdf,
  type CataloguePdfInput,
  type CatalogueProduct,
  type CatalogueSection,
} from '@/components/pdf/CataloguePdf'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // react-pdf a besoin de Node
export const maxDuration = 60 // beaucoup d'images à charger

/** Produits par page produits : 2 colonnes × 4 lignes. NE PAS changer
 *  sans revoir le calcul des numéros de pages de la table des matières. */
const PRODUCTS_PER_PAGE = 8

const CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  excellent: 'Excellent état',
  'very-good': 'Très bon état',
  good: 'Bon état',
  fair: 'État correct',
}

type CatalogueDoc = {
  _id: string
  name: string
  brand?: string
  condition?: string
  price: number
  salePrice?: number
  material?: string
  color?: string
  widthCm?: number
  depthCm?: number
  heightCm?: number
  firstImage?: { asset?: unknown }
  categoryName?: string
  categoryOrder?: number
  categoryDescription?: string
  categoryImage?: { asset?: unknown }
}

type HeroDoc = { image?: { asset?: unknown } }

function jpg(
  source: unknown,
  width: number,
  height: number,
): string | undefined {
  try {
    return urlFor(source as Parameters<typeof urlFor>[0])
      .width(width)
      .height(height)
      .fit('crop')
      .format('jpg')
      .quality(72)
      .url()
  } catch {
    return undefined
  }
}

export async function GET() {
  let products: CatalogueDoc[] = []
  let hero: HeroDoc | null = null
  try {
    ;[products, hero] = await Promise.all([
      sanityClient.fetch<CatalogueDoc[]>(
        `*[_type == "product" && status == "published" && defined(slug.current) && defined(price)] {
          _id, name, brand, condition, price, salePrice, material, color,
          widthCm, depthCm, heightCm,
          "firstImage": images[0],
          "categoryName": coalesce(primaryCategory->name, categories[0]->name, category->name, "Autres pièces"),
          "categoryOrder": coalesce(primaryCategory->order, categories[0]->order, category->order, 999),
          "categoryDescription": coalesce(primaryCategory->description, categories[0]->description, category->description),
          "categoryImage": coalesce(primaryCategory->image, categories[0]->image, category->image)
        } | order(categoryOrder asc, categoryName asc, _createdAt desc)`,
      ),
      sanityClient.fetch<HeroDoc | null>(
        `*[_type == "heroSlide" && defined(image.asset)] | order(order asc)[0]{ image }`,
      ),
    ])
  } catch (err) {
    console.error('[catalogue] Sanity fetch error', err)
    return NextResponse.json(
      { error: 'Erreur de récupération des produits' },
      { status: 502 },
    )
  }

  if (products.length === 0) {
    return NextResponse.json(
      { error: 'Aucun produit publié à cataloguer' },
      { status: 404 },
    )
  }

  // ── Regroupe par catégorie (ordre de tri Sanity conservé) ──
  type Group = {
    products: CatalogueProduct[]
    description?: string
    openerSource?: unknown
    thumbSource?: unknown
  }
  const groups = new Map<string, Group>()
  for (const p of products) {
    const cat = p.categoryName || 'Autres pièces'
    const dims = [
      p.widthCm ? `L ${p.widthCm}` : null,
      p.depthCm ? `P ${p.depthCm}` : null,
      p.heightCm ? `H ${p.heightCm}` : null,
    ].filter(Boolean)
    const item: CatalogueProduct = {
      name: p.name,
      brand: p.brand,
      conditionLabel: p.condition ? CONDITION_LABELS[p.condition] : undefined,
      price: p.price,
      salePrice: p.salePrice,
      imageUrl: p.firstImage?.asset ? jpg(p.firstImage, 340, 425) : undefined,
      dimensions: dims.length > 0 ? `${dims.join(' × ')} cm` : undefined,
      material: p.material,
      color: p.color,
    }
    const g = groups.get(cat) || { products: [] }
    g.products.push(item)
    // Visuels de section : image de la catégorie en priorité, sinon la
    // première photo produit rencontrée.
    if (!g.openerSource) {
      g.openerSource = p.categoryImage?.asset ? p.categoryImage : p.firstImage?.asset ? p.firstImage : undefined
    }
    if (!g.thumbSource) {
      g.thumbSource = p.firstImage?.asset ? p.firstImage : p.categoryImage?.asset ? p.categoryImage : undefined
    }
    if (!g.description && p.categoryDescription) g.description = p.categoryDescription
    groups.set(cat, g)
  }

  // ── Découpage en pages de 8 + numéros de pages pour la TOC ──
  // p.1 couverture, p.2 édito, p.3 table des matières → sections dès p.4.
  let cursor = 4
  const sections: CatalogueSection[] = []
  for (const [category, g] of groups.entries()) {
    const pages: CatalogueProduct[][] = []
    for (let i = 0; i < g.products.length; i += PRODUCTS_PER_PAGE) {
      pages.push(g.products.slice(i, i + PRODUCTS_PER_PAGE))
    }
    const pageStart = cursor // page d'ouverture
    const pageEnd = cursor + pages.length
    cursor = pageEnd + 1
    sections.push({
      category,
      description: g.description,
      openerImageUrl: g.openerSource ? jpg(g.openerSource, 900, 1273) : undefined,
      thumbUrl: g.thumbSource ? jpg(g.thumbSource, 160, 160) : undefined,
      pages,
      pageStart,
      pageEnd,
    })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'
  const input: CataloguePdfInput = {
    sections,
    totalCount: products.length,
    editionDate: new Date(),
    siteUrl,
    coverImageUrl: hero?.image?.asset ? jpg(hero.image, 900, 1273) : undefined,
  }

  try {
    const buffer = await renderToBuffer(CataloguePdf(input))
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="catalogue-mobilier-malin.pdf"',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error('[catalogue] PDF render error', err)
    return NextResponse.json(
      { error: `Erreur de génération du catalogue : ${err instanceof Error ? err.message : 'inconnue'}` },
      { status: 500 },
    )
  }
}
