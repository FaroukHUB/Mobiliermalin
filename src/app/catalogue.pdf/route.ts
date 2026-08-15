/**
 * GET /catalogue.pdf
 *
 * Catalogue PDF de tous les produits publiés, généré à la demande
 * depuis Sanity : toujours à jour, sans maintenance. Regroupé par
 * catégorie, avec photo, marque, état, dimensions et prix TTC.
 *
 * Mise en cache CDN 1 h (le stock ne bouge pas à la minute) —
 * un nouveau déploiement ou l'expiration du cache régénère.
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
  shortDescription?: string
  widthCm?: number
  depthCm?: number
  heightCm?: number
  firstImage?: { asset?: unknown; alt?: string; hotspot?: unknown; _key?: string }
  categoryName?: string
  categoryOrder?: number
}

export async function GET() {
  let products: CatalogueDoc[] = []
  try {
    products = await sanityClient.fetch<CatalogueDoc[]>(
      `*[_type == "product" && status == "published" && defined(slug.current) && defined(price)] {
        _id, name, brand, condition, price, salePrice, shortDescription,
        widthCm, depthCm, heightCm,
        "firstImage": images[0],
        "categoryName": coalesce(primaryCategory->name, categories[0]->name, category->name, "Autres pièces"),
        "categoryOrder": coalesce(primaryCategory->order, categories[0]->order, category->order, 999)
      } | order(categoryOrder asc, categoryName asc, _createdAt desc)`,
    )
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

  // Regroupe par catégorie en conservant l'ordre de tri Sanity
  const sectionsMap = new Map<string, CatalogueProduct[]>()
  for (const p of products) {
    const cat = p.categoryName || 'Autres pièces'
    // Image : format jpg FORCÉ — react-pdf ne décode pas le webp que
    // le CDN Sanity servirait par défaut avec format auto.
    let imageUrl: string | undefined
    if (p.firstImage?.asset) {
      try {
        imageUrl = urlFor(p.firstImage)
          .width(440)
          .height(440)
          .fit('crop')
          .format('jpg')
          .quality(72)
          .url()
      } catch {
        imageUrl = undefined
      }
    }
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
      imageUrl,
      dimensions: dims.length > 0 ? `${dims.join(' × ')} cm` : undefined,
    }
    const list = sectionsMap.get(cat) || []
    list.push(item)
    sectionsMap.set(cat, list)
  }

  const sections: CatalogueSection[] = [...sectionsMap.entries()].map(
    ([category, prods]) => ({ category, products: prods }),
  )

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'
  const input: CataloguePdfInput = {
    sections,
    totalCount: products.length,
    editionDate: new Date(),
    siteUrl,
  }

  try {
    const buffer = await renderToBuffer(CataloguePdf(input))
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="catalogue-mobilier-malin.pdf"',
        // Cache CDN 1 h : la génération charge toutes les photos, on
        // évite de la refaire à chaque téléchargement.
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
