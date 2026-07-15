/**
 * Product Schema.org JSON-LD builder — best-in-class 2026.
 *
 * Génère un balisage Product ultra-complet pour maximiser :
 *   - Rich Results (prix, dispo, garantie, retours, livraison, vidéo)
 *   - Google Shopping / Merchant Center (feed cohérent)
 *   - Google Images (dimensions + ratios)
 *   - AI Overviews (facts comparables via additionalProperty[])
 *   - Assistants IA (ChatGPT, Claude, Perplexity — entités liées via sameAs)
 *
 * ⚠ TODO vérif docs Google : ce module est basé sur la spec schema.org 2026
 * (cutoff janvier) ; certains enum peuvent avoir évolué. À valider via
 * https://search.google.com/test/rich-results en prod avant migration
 * massive.
 */

import type { SanityProduct } from './sanity'
import { urlFor } from './sanity'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

// Mapping condition Sanity → schema.org URL
const CONDITION_URL: Record<string, string> = {
  new: 'https://schema.org/NewCondition',
  excellent: 'https://schema.org/RefurbishedCondition',
  'very-good': 'https://schema.org/RefurbishedCondition',
  good: 'https://schema.org/RefurbishedCondition',
  fair: 'https://schema.org/UsedCondition',
}

// Mapping marques → URL officielle (aide LLMs à disambiguer)
const BRAND_URL: Record<string, string> = {
  Steelcase: 'https://www.steelcase.com',
  'Herman Miller': 'https://www.hermanmiller.com',
  Haworth: 'https://www.haworth.com',
  Vitra: 'https://www.vitra.com',
  Majencia: 'https://www.majencia.com',
  HÅG: 'https://www.hag.com',
  Knoll: 'https://www.knoll.com',
  'USM Haller': 'https://www.usm.com',
}

const ARMREST_LABELS: Record<string, string> = {
  none: 'Sans accoudoirs',
  fixed: 'Fixes',
  '1D': '1D (hauteur)',
  '2D': '2D (hauteur + largeur)',
  '3D': '3D (hauteur + largeur + profondeur)',
  '4D': '4D (3D + pivot latéral)',
}

/**
 * Convertit une URL YouTube ou Vimeo en VideoObject partiel.
 * Extrait l'ID pour construire thumbnail YouTube automatique.
 */
function buildVideoObject(url: string, name: string, description?: string) {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) {
    const id = ytMatch[1]
    return {
      '@type': 'VideoObject',
      name: `Présentation vidéo — ${name}`,
      description: description || `Vidéo de présentation du produit ${name}.`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      contentUrl: url,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      uploadDate: new Date().toISOString().slice(0, 10),
    }
  }
  // Vimeo
  const vimMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimMatch) {
    return {
      '@type': 'VideoObject',
      name: `Présentation vidéo — ${name}`,
      description: description || `Vidéo de présentation du produit ${name}.`,
      contentUrl: url,
      embedUrl: `https://player.vimeo.com/video/${vimMatch[1]}`,
      uploadDate: new Date().toISOString().slice(0, 10),
    }
  }
  // Fallback : URL brute
  return {
    '@type': 'VideoObject',
    name: `Présentation vidéo — ${name}`,
    description: description || `Vidéo de présentation du produit ${name}.`,
    contentUrl: url,
    uploadDate: new Date().toISOString().slice(0, 10),
  }
}

/**
 * Construit le JSON-LD Product complet à partir d'un SanityProduct.
 * Retourne un objet JSON-LD prêt à être stringifié.
 */
export function buildProductSchema(product: SanityProduct): Record<string, unknown> {
  const url = `${SITE_URL}/produit/${product.slug.current}`
  const effectivePrice =
    product.salePrice && product.salePrice < product.price
      ? product.salePrice
      : product.price

  // Images multi-ratios pour Google Images (3 ratios recommandés)
  const images = (product.images || []).flatMap((img) => {
    const base = urlFor(img)
    return [
      base.width(1200).height(1200).fit('crop').url(), // 1:1
      base.width(1200).height(900).fit('crop').url(), // 4:3
      base.width(1200).height(675).fit('crop').url(), // 16:9
    ]
  })

  // additionalProperty[] : facts ergonomiques structurés (pour AI Overviews)
  const additionalProperty: Array<Record<string, unknown>> = []
  if (product.maxUserWeightKg) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Charge maximale utilisateur',
      value: `${product.maxUserWeightKg} kg`,
      unitCode: 'KGM',
    })
  }
  if (product.seatHeightMinCm && product.seatHeightMaxCm) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: "Hauteur d'assise réglable",
      value: `${product.seatHeightMinCm}–${product.seatHeightMaxCm} cm`,
      minValue: product.seatHeightMinCm,
      maxValue: product.seatHeightMaxCm,
      unitCode: 'CMT',
    })
  }
  if (product.armrestType) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: "Type d'accoudoirs",
      value: ARMREST_LABELS[product.armrestType] || product.armrestType,
    })
  }
  if (product.hasLumbarAdjustment !== undefined) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Soutien lombaire réglable',
      value: product.hasLumbarAdjustment ? 'Oui' : 'Non',
    })
  }
  if (product.hasHeadrest !== undefined) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Appuie-tête',
      value: product.hasHeadrest ? 'Oui' : 'Non',
    })
  }
  if (product.desktopMotorized !== undefined) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Réglage électrique hauteur',
      value: product.desktopMotorized ? 'Oui' : 'Non',
    })
  }
  if (product.originalReleaseYear) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: "Année du modèle d'origine",
      value: product.originalReleaseYear,
    })
  }

  // hasCertification[]
  const hasCertification = (product.certifications || []).map((c) => ({
    '@type': 'Certification',
    name: c.name,
    ...(c.issuedBy && { issuedBy: { '@type': 'Organization', name: c.issuedBy } }),
    ...(c.url && { url: c.url }),
  }))

  // sameAs : lie l'entité produit à ses sources faisant autorité
  const sameAs: string[] = []
  if (product.seo?.productReferenceUrl) sameAs.push(product.seo.productReferenceUrl)

  // Brand avec sameAs vers site officiel (ancre LLM)
  const brand = product.brand
    ? {
        '@type': 'Brand',
        name: product.brand,
        ...(BRAND_URL[product.brand] && { sameAs: BRAND_URL[product.brand] }),
      }
    : undefined

  // priceValidUntil : today + 30j (cohérent avec la loi Omnibus si prix promo)
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10)

  // availability enum
  const availability =
    product.stock > 5
      ? 'https://schema.org/InStock'
      : product.stock > 0
        ? 'https://schema.org/LimitedAvailability'
        : 'https://schema.org/OutOfStock'

  // itemCondition : mappe état Sanity → schema.org URL enum
  const itemCondition = product.condition
    ? CONDITION_URL[product.condition] || 'https://schema.org/RefurbishedCondition'
    : 'https://schema.org/RefurbishedCondition'

  // ─── Offer ────────────────────────────────────────────────
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
    priceValidUntil,
    itemCondition,
    availability,
    seller: { '@id': `${SITE_URL}/#organization` },
    businessFunction: 'https://schema.org/Sell',
    eligibleCustomerType: [
      'https://schema.org/Business',
      'https://schema.org/Consumer',
    ],
    // Réf. politique retour définie une seule fois dans OrganizationSchema
    hasMerchantReturnPolicy: { '@id': `${SITE_URL}/#return-policy` },
    // Réf. livraison définie une seule fois dans OrganizationSchema
    shippingDetails: { '@id': `${SITE_URL}/#shipping-fr` },
  }
  if (product.stock > 0) {
    offer.inventoryLevel = {
      '@type': 'QuantitativeValue',
      value: product.stock,
    }
  }
  if (product.warrantyMonths && product.warrantyMonths > 0) {
    offer.warranty = {
      '@type': 'WarrantyPromise',
      durationOfWarranty: {
        '@type': 'QuantitativeValue',
        value: product.warrantyMonths,
        unitCode: 'MON',
      },
      warrantyScope: 'https://schema.org/PartsAndLabor',
    }
  }

  // ─── Product ──────────────────────────────────────────────
  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    ...(product.shortDescription && { description: product.shortDescription }),
    ...(images.length > 0 && { image: images }),
    ...(product.sku && { sku: product.sku, productID: `sku:${product.sku}` }),
    ...(product.mpn && { mpn: product.mpn }),
    ...(brand && { brand, manufacturer: { '@type': 'Organization', name: product.brand } }),
    ...(product.color && { color: product.color }),
    ...(product.material && { material: product.material }),
    ...(product.countryOfOrigin && { countryOfOrigin: product.countryOfOrigin }),
    ...(product.widthCm && {
      width: { '@type': 'QuantitativeValue', value: product.widthCm, unitCode: 'CMT' },
    }),
    ...(product.depthCm && {
      depth: { '@type': 'QuantitativeValue', value: product.depthCm, unitCode: 'CMT' },
    }),
    ...(product.heightCm && {
      height: { '@type': 'QuantitativeValue', value: product.heightCm, unitCode: 'CMT' },
    }),
    ...(product.weightKg && {
      weight: { '@type': 'QuantitativeValue', value: product.weightKg, unitCode: 'KGM' },
    }),
    ...(additionalProperty.length > 0 && { additionalProperty }),
    ...(hasCertification.length > 0 && { hasCertification }),
    ...(sameAs.length > 0 && { sameAs }),
    // Audience B2B/B2C clarifiée pour Merchant Center et AI Overviews
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Entreprises, professions libérales, associations, particuliers',
    },
    offers: offer,
  }

  // Vidéo (Rich Results carrousel vidéo)
  if (product.videoUrl) {
    productSchema.video = buildVideoObject(
      product.videoUrl,
      product.name,
      product.videoDescription,
    )
  }

  return productSchema
}
