/**
 * Product Schema.org JSON-LD builder — architecture modulaire.
 *
 * Helpers exposés :
 *   - buildProductSchema(product) → Product complet
 *   - buildOfferSchema(product)   → sous-objet Offer
 *   - buildVideoSchema(product)   → VideoObject ou null si incomplet
 *   - buildBrandSchema(product)   → Brand avec sameAs (ou undefined)
 *
 * Règle absolue : jamais de valeur fabriquée. Chaque champ optionnel n'est
 * émis que si Sanity contient une donnée réelle correspondante. Voir
 * lib/schema-mappings.ts pour les correspondances centralisées.
 */

import type { SanityProduct } from './sanity'
import { urlFor } from './sanity'
import {
  BRAND_OFFICIAL_URL,
  CONDITION_TO_SCHEMA_ORG,
  resolveSchemaOrgAvailability,
} from './schema-mappings'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

const ARMREST_LABELS: Record<string, string> = {
  none: 'Sans accoudoirs',
  fixed: 'Fixes',
  '1D': '1D (hauteur)',
  '2D': '2D (hauteur + largeur)',
  '3D': '3D (hauteur + largeur + profondeur)',
  '4D': '4D (hauteur + largeur + profondeur + pivot)',
}

// ─── Video ──────────────────────────────────────────────────
/**
 * Construit un VideoObject uniquement si toutes les données requises
 * sont présentes : URL + description + uploadDate.
 * Retourne null sinon — jamais de fabrication.
 */
export function buildVideoSchema(
  product: SanityProduct,
): Record<string, unknown> | null {
  const { videoUrl, videoDescription, videoUploadDate, videoThumbnail } = product
  if (!videoUrl || !videoDescription || !videoUploadDate) return null

  // YouTube : miniature auto depuis l'ID (i.ytimg.com est stable)
  const ytMatch = videoUrl.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )
  if (ytMatch) {
    const id = ytMatch[1]
    return {
      '@type': 'VideoObject',
      name: `Présentation vidéo — ${product.name}`,
      description: videoDescription,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      contentUrl: videoUrl,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      uploadDate: videoUploadDate.slice(0, 10),
    }
  }

  // Vimeo ou autre : nécessite un thumbnail explicite (pas d'auto-génération fiable)
  if (!videoThumbnail) return null
  const thumbnailUrl = urlFor(videoThumbnail).width(1280).height(720).fit('crop').url()

  const vimMatch = videoUrl.match(/vimeo\.com\/(\d+)/)
  if (vimMatch) {
    return {
      '@type': 'VideoObject',
      name: `Présentation vidéo — ${product.name}`,
      description: videoDescription,
      thumbnailUrl,
      contentUrl: videoUrl,
      embedUrl: `https://player.vimeo.com/video/${vimMatch[1]}`,
      uploadDate: videoUploadDate.slice(0, 10),
    }
  }

  return {
    '@type': 'VideoObject',
    name: `Présentation vidéo — ${product.name}`,
    description: videoDescription,
    thumbnailUrl,
    contentUrl: videoUrl,
    uploadDate: videoUploadDate.slice(0, 10),
  }
}

// ─── Brand ──────────────────────────────────────────────────
export function buildBrandSchema(
  product: SanityProduct,
): Record<string, unknown> | undefined {
  if (!product.brand) return undefined
  const sameAs = BRAND_OFFICIAL_URL[product.brand]
  return {
    '@type': 'Brand',
    name: product.brand,
    ...(sameAs && { sameAs }),
  }
}

// ─── Offer ──────────────────────────────────────────────────
export function buildOfferSchema(product: SanityProduct): Record<string, unknown> {
  const url = `${SITE_URL}/produit/${product.slug.current}`
  const effectivePrice =
    product.salePrice && product.salePrice < product.price
      ? product.salePrice
      : product.price

  const itemCondition = product.condition
    ? CONDITION_TO_SCHEMA_ORG[product.condition] ||
      'https://schema.org/RefurbishedCondition'
    : 'https://schema.org/RefurbishedCondition'

  const availability = resolveSchemaOrgAvailability(product)

  // priceValidUntil : émis UNIQUEMENT si une vraie date de fin de promo existe.
  const priceValidUntil = product.salePriceValidUntil
    ? product.salePriceValidUntil.slice(0, 10)
    : undefined

  // availabilityStarts : pour backorder avec date de retour connue
  const availabilityStarts =
    product.availabilityStatus === 'backorder' && product.restockExpectedDate
      ? product.restockExpectedDate.slice(0, 10)
      : undefined

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    '@id': `${url}#offer`,
    url,
    priceCurrency: 'EUR',
    price: effectivePrice,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: effectivePrice,
      priceCurrency: 'EUR',
      valueAddedTaxIncluded: true,
    },
    ...(priceValidUntil && { priceValidUntil }),
    itemCondition,
    availability,
    ...(availabilityStarts && { availabilityStarts }),
    seller: { '@id': `${SITE_URL}/#organization` },
    businessFunction: 'https://schema.org/Sell',
    // hasMerchantReturnPolicy et shippingDetails : à réactiver dans une itération
    // suivante quand Sanity commercePolicy sera défini. Ne rien émettre tant que
    // les données commerciales ne sont pas confirmées.
  }

  if (product.stock > 0) {
    offer.inventoryLevel = {
      '@type': 'QuantitativeValue',
      value: product.stock,
    }
  }

  return offer
}

// ─── additionalProperty[] ergonomie ─────────────────────────
function buildErgonomicsProperties(
  product: SanityProduct,
): Array<Record<string, unknown>> {
  const props: Array<Record<string, unknown>> = []

  if (product.maxUserWeightKg) {
    props.push({
      '@type': 'PropertyValue',
      name: 'Charge maximale utilisateur',
      value: `${product.maxUserWeightKg} kg`,
      unitCode: 'KGM',
    })
  }
  if (product.seatHeightMinCm && product.seatHeightMaxCm) {
    props.push({
      '@type': 'PropertyValue',
      name: "Hauteur d'assise réglable",
      value: `${product.seatHeightMinCm}–${product.seatHeightMaxCm} cm`,
      minValue: product.seatHeightMinCm,
      maxValue: product.seatHeightMaxCm,
      unitCode: 'CMT',
    })
  }
  if (product.armrestType) {
    props.push({
      '@type': 'PropertyValue',
      name: "Type d'accoudoirs",
      value: ARMREST_LABELS[product.armrestType] || product.armrestType,
    })
  }
  if (product.hasLumbarAdjustment !== undefined) {
    props.push({
      '@type': 'PropertyValue',
      name: 'Soutien lombaire réglable',
      value: product.hasLumbarAdjustment ? 'Oui' : 'Non',
    })
  }
  if (product.hasHeadrest !== undefined) {
    props.push({
      '@type': 'PropertyValue',
      name: 'Appuie-tête',
      value: product.hasHeadrest ? 'Oui' : 'Non',
    })
  }
  if (product.desktopMotorized !== undefined) {
    props.push({
      '@type': 'PropertyValue',
      name: 'Réglage électrique de la hauteur',
      value: product.desktopMotorized ? 'Oui' : 'Non',
    })
  }

  return props
}

// ─── Product (top-level) ────────────────────────────────────
export function buildProductSchema(
  product: SanityProduct,
): Record<string, unknown> {
  const url = `${SITE_URL}/produit/${product.slug.current}`

  // Images multi-ratios pour Google Images (1:1, 4:3, 16:9)
  const images = (product.images || []).flatMap((img) => {
    const base = urlFor(img)
    return [
      base.width(1200).height(1200).fit('crop').url(),
      base.width(1200).height(900).fit('crop').url(),
      base.width(1200).height(675).fit('crop').url(),
    ]
  })

  const brand = buildBrandSchema(product)
  const additionalProperty = buildErgonomicsProperties(product)
  const video = buildVideoSchema(product)

  // sameAs : liens externes vers l'entité produit (fabricant/doc/wiki)
  const sameAs: string[] = []
  if (product.seo?.productReferenceUrl) sameAs.push(product.seo.productReferenceUrl)

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    ...(product.shortDescription && { description: product.shortDescription }),
    ...(images.length > 0 && { image: images }),
    ...(product.sku && {
      sku: product.sku,
      productID: `sku:${product.sku}`,
    }),
    ...(product.mpn && { mpn: product.mpn }),
    ...(brand && {
      brand,
      manufacturer: { '@type': 'Organization', name: product.brand },
    }),
    ...(product.color && { color: product.color }),
    ...(product.material && { material: product.material }),
    ...(product.widthCm && {
      width: {
        '@type': 'QuantitativeValue',
        value: product.widthCm,
        unitCode: 'CMT',
      },
    }),
    ...(product.depthCm && {
      depth: {
        '@type': 'QuantitativeValue',
        value: product.depthCm,
        unitCode: 'CMT',
      },
    }),
    ...(product.heightCm && {
      height: {
        '@type': 'QuantitativeValue',
        value: product.heightCm,
        unitCode: 'CMT',
      },
    }),
    ...(product.weightKg && {
      weight: {
        '@type': 'QuantitativeValue',
        value: product.weightKg,
        unitCode: 'KGM',
      },
    }),
    ...(additionalProperty.length > 0 && { additionalProperty }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(video && { video }),
    offers: buildOfferSchema(product),
  }

  return schema
}
