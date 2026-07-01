/**
 * Flux produit XML pour Google Merchant Center / Google Shopping.
 *
 * URL publique : https://mobiliermalin.com/google-feed.xml
 *
 * À coller dans Google Merchant Center → Produits → Flux → Ajouter → URL
 * planifiée (récupération quotidienne recommandée).
 *
 * Format : RSS 2.0 avec namespace Google (g:) — celui documenté par
 * Google Merchant : https://support.google.com/merchants/answer/160589
 *
 * Cache Vercel edge : 1 heure (s-maxage=3600), stale-while-revalidate
 * jusqu'à 24 h → le flux reste servi rapidement même quand Sanity change.
 */

import { NextResponse } from 'next/server'
import {
  getAllProducts,
  urlFor,
  type SanityProduct,
} from '@/lib/sanity'

// Revalidation ISR (bonus pour les rebuilds statiques ; le cache HTTP
// ci-dessous fait le vrai boulot pour la mise en cache CDN)
export const revalidate = 3600

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

const STORE_NAME = 'Mobilier Malin'
const STORE_DESCRIPTION =
  'Mobilier de bureau professionnel reconditionné à Marseille. Steelcase, Vitra, Haworth, Herman Miller — garantie 6 mois, livraison PACA.'

// ─── Utilitaires ───────────────────────────────────────────────────

/** Échappement XML — évite les crashs Google si un titre contient <, >, & etc. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Mapping des états Sanity → conditions Google (new / refurbished / used) */
function mapCondition(
  sanityCondition?: string,
): 'new' | 'refurbished' | 'used' {
  if (!sanityCondition || sanityCondition === 'new') return 'new'
  // Tout le mobilier passé par notre atelier (excellent, très bon, bon,
  // état correct) est reconditionné → "refurbished" est le mapping Google
  // le plus précis pour Mobilier Malin.
  return 'refurbished'
}

/** Détermine la catégorie Google Shopping selon la catégorie Sanity */
function mapGoogleCategory(
  categorySlug?: string,
  categoryName?: string,
): string {
  const s = (categorySlug || '').toLowerCase()
  const n = (categoryName || '').toLowerCase()

  if (s.includes('bureau') || n.includes('bureau'))
    return 'Business & Industrial > Office > Office Furniture > Desks'
  if (
    s.includes('fauteuil') ||
    s.includes('siege') ||
    s.includes('siège') ||
    s.includes('chaise') ||
    n.includes('fauteuil') ||
    n.includes('siège') ||
    n.includes('chaise')
  )
    return 'Business & Industrial > Office > Office Furniture > Office Chairs'
  if (
    s.includes('armoire') ||
    s.includes('rangement') ||
    s.includes('caisson') ||
    n.includes('armoire') ||
    n.includes('rangement') ||
    n.includes('caisson')
  )
    return 'Business & Industrial > Office > Office Furniture > Filing Cabinets'
  if (
    s.includes('table') ||
    s.includes('reunion') ||
    n.includes('table') ||
    n.includes('réunion')
  )
    return 'Business & Industrial > Office > Office Furniture > Conference Tables'
  if (
    s.includes('cloison') ||
    s.includes('acoustique') ||
    s.includes('phonique') ||
    n.includes('cloison') ||
    n.includes('acoustique')
  )
    return 'Business & Industrial > Office > Office Furniture > Office Partitions'
  if (
    s.includes('lampe') ||
    s.includes('luminaire') ||
    n.includes('lampe')
  )
    return 'Home & Garden > Lighting > Lamps'
  // Fallback générique bureau
  return 'Business & Industrial > Office > Office Furniture'
}

/** Convertit Portable Text en texte brut si shortDescription est vide */
function portableTextToPlain(blocks?: unknown[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''
  return blocks
    .filter(
      (b): b is { _type?: string; children?: { text?: string }[] } =>
        typeof b === 'object' && b !== null,
    )
    .filter((b) => b._type === 'block')
    .map((b) =>
      (b.children || []).map((c) => c.text || '').join(''),
    )
    .join('\n\n')
    .trim()
}

/** Construit une description propre à partir des champs Sanity disponibles */
function buildDescription(product: SanityProduct): string {
  const primary = product.shortDescription?.trim()
  if (primary) return primary

  const fromBlocks = portableTextToPlain(product.description as unknown[])
  if (fromBlocks) return fromBlocks

  // Fallback dernier recours — description synthétisée
  const parts: string[] = [product.name]
  if (product.brand) parts.push(`Marque ${product.brand}`)
  if (product.condition && product.condition !== 'new') {
    parts.push('reconditionné')
  }
  const dims = [
    product.widthCm ? `L ${product.widthCm} cm` : null,
    product.depthCm ? `P ${product.depthCm} cm` : null,
    product.heightCm ? `H ${product.heightCm} cm` : null,
  ]
    .filter(Boolean)
    .join(' × ')
  if (dims) parts.push(dims)
  parts.push('Garantie 6 mois. Livraison Marseille & PACA.')
  return parts.join(' — ')
}

/** Format prix Google Merchant : "350.00 EUR" (2 décimales toujours) */
function formatGooglePrice(value: number): string {
  return `${value.toFixed(2)} EUR`
}

// ─── Construction d'un item ────────────────────────────────────────

function buildItem(product: SanityProduct): string | null {
  // Filtrage : produit inutilisable dans un flux Google
  if (!product.slug?.current) return null
  if (!product.price || product.price <= 0) return null
  const firstImage = product.images?.[0]
  if (!firstImage) return null

  // Image 1200×1600 = format portrait, HD, respectant hotspot Sanity
  const imageUrl = urlFor(firstImage)
    .width(1200)
    .height(1600)
    .fit('crop')
    .url()

  const link = `${SITE_URL}/produit/${product.slug.current}`
  const availability =
    typeof product.stock === 'number' && product.stock > 0
      ? 'in_stock'
      : 'out_of_stock'

  const condition = mapCondition(product.condition)
  const description = buildDescription(product).slice(0, 5000)
  const title = product.name.slice(0, 150)
  const brand = product.brand || STORE_NAME
  const category = mapGoogleCategory(
    product.category?.slug?.current,
    product.category?.name,
  )
  const productType = product.category?.name || 'Mobilier de bureau'

  const hasSale =
    product.salePrice &&
    product.salePrice > 0 &&
    product.salePrice < product.price

  // Google veut : price = prix affiché principal, sale_price = promo éventuelle.
  // Cas 1 : sale actif → price = prix de vente courant, sale_price = prix soldé
  // Cas 2 : pas de sale → price seul
  const priceXml = hasSale
    ? `<g:price>${formatGooglePrice(product.price)}</g:price>
      <g:sale_price>${formatGooglePrice(product.salePrice as number)}</g:sale_price>`
    : `<g:price>${formatGooglePrice(product.price)}</g:price>`

  const mpnXml = product.sku
    ? `<g:mpn>${escapeXml(product.sku)}</g:mpn>`
    : ''

  // Sans GTIN ni MPN certifié fabricant → identifier_exists=no (obligatoire Google)
  const identifierExistsXml = product.sku
    ? '<g:identifier_exists>yes</g:identifier_exists>'
    : '<g:identifier_exists>no</g:identifier_exists>'

  return `    <item>
      <g:id>${escapeXml(product._id)}</g:id>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(link)}</link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:availability>${availability}</g:availability>
      ${priceXml}
      <g:condition>${condition}</g:condition>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>${escapeXml(category)}</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      ${mpnXml}
      ${identifierExistsXml}
      <g:shipping>
        <g:country>FR</g:country>
        <g:service>Retrait showroom</g:service>
        <g:price>0.00 EUR</g:price>
      </g:shipping>
    </item>`
}

// ─── Handler GET ───────────────────────────────────────────────────

export async function GET() {
  const products = await getAllProducts()

  const items = products
    .map(buildItem)
    .filter((item): item is string => item !== null)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(STORE_NAME)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(STORE_DESCRIPTION)}</description>
${items}
  </channel>
</rss>
`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cache CDN : servi frais 1h, stale-while-revalidate jusqu'à 24h.
      // Google Merchant relit le flux 1×/jour → largement suffisant.
      'Cache-Control':
        'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
