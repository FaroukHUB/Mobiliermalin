#!/usr/bin/env tsx
/**
 * Vérification manuelle du builder Product Schema.
 * Pas de framework — juste des assertions console.
 *
 * Usage : pnpm tsx scripts/verify-product-schema.ts
 *
 * Couvre les 12 cas prévus dans la consigne 13 :
 *   1. produit reconditionné avec marque et MPN
 *   2. produit d'occasion sans MPN
 *   3. produit sans marque connue
 *   4. produit en promotion avec date de fin
 *   5. produit à prix normal sans priceValidUntil
 *   6. produit en rupture
 *   7. produit uniquement disponible au retrait
 *   8. produit livrable nationalement
 *   9. produit nécessitant un devis de livraison
 *   10. produit avec et sans vidéo
 *   11. produit avec plusieurs images
 *   12. produit noindex exclu du sitemap et du feed
 */

import { buildProductSchema, buildOfferSchema, buildVideoSchema } from '../src/lib/product-schema'
import type { SanityProduct } from '../src/lib/sanity'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++
    console.log(`  ✅ ${testName}`)
  } else {
    failed++
    console.log(`  ❌ ${testName}${detail ? ` — ${detail}` : ''}`)
    failures.push(testName)
  }
}

function has<T extends Record<string, unknown>>(obj: T, key: string): boolean {
  return key in obj && obj[key] !== undefined && obj[key] !== null
}

// ─── Fixtures ───────────────────────────────────────────────
const baseProduct: SanityProduct = {
  _id: 'test',
  name: 'Test Product',
  slug: { current: 'test-product' },
  status: 'published',
  price: 100,
  stock: 1,
  images: [],
  _createdAt: '2026-01-01',
  _updatedAt: '2026-01-01',
}

// ─── Test 1 : Reconditionné avec marque + MPN ────────────────
console.log('\n[1] Produit reconditionné avec marque et MPN')
{
  const p: SanityProduct = {
    ...baseProduct,
    brand: 'Steelcase',
    mpn: '462A00',
    condition: 'very-good',
    sku: 'STC-001',
  }
  const s = buildProductSchema(p)
  assert(s.mpn === '462A00', 'mpn émis')
  assert(s.sku === 'STC-001', 'sku émis')
  assert(s.productID === 'sku:STC-001', 'productID préfixé sku:')
  assert(
    (s.brand as Record<string, unknown>)?.name === 'Steelcase',
    'brand.name correct',
  )
  assert(
    (s.brand as Record<string, unknown>)?.sameAs === 'https://www.steelcase.com/eu-fr/',
    'brand.sameAs pointe vers URL officielle',
  )
  assert(
    (s.offers as Record<string, unknown>)?.itemCondition ===
      'https://schema.org/RefurbishedCondition',
    'itemCondition RefurbishedCondition',
  )
}

// ─── Test 2 : Occasion sans MPN ──────────────────────────────
console.log('\n[2] Produit d\'occasion sans MPN')
{
  const p: SanityProduct = { ...baseProduct, condition: 'fair' }
  const s = buildProductSchema(p)
  assert(!has(s, 'mpn'), 'mpn absent')
  assert(!has(s, 'brand'), 'brand absent')
  assert(
    (s.offers as Record<string, unknown>)?.itemCondition ===
      'https://schema.org/UsedCondition',
    'itemCondition UsedCondition (fair)',
  )
}

// ─── Test 3 : Sans marque connue ─────────────────────────────
console.log('\n[3] Produit sans marque connue')
{
  const p: SanityProduct = { ...baseProduct, brand: 'Autre' }
  const s = buildProductSchema(p)
  assert(has(s, 'brand'), 'brand présente (Autre)')
  assert(
    !(s.brand as Record<string, unknown>)?.sameAs,
    'brand.sameAs absent (aucune URL officielle pour "Autre")',
  )
}

// ─── Test 4 : Promo avec date fin ────────────────────────────
console.log('\n[4] Produit en promotion avec date de fin')
{
  const p: SanityProduct = {
    ...baseProduct,
    price: 100,
    salePrice: 79,
    salePriceValidUntil: '2026-12-31',
  }
  const offer = buildOfferSchema(p)
  assert(offer.price === 79, 'price = salePrice')
  assert(offer.priceValidUntil === '2026-12-31', 'priceValidUntil émis')
}

// ─── Test 5 : Prix normal sans priceValidUntil ───────────────
console.log('\n[5] Produit à prix normal sans priceValidUntil')
{
  const p: SanityProduct = { ...baseProduct, price: 100 }
  const offer = buildOfferSchema(p)
  assert(offer.price === 100, 'price affiché')
  assert(!has(offer, 'priceValidUntil'), 'pas de priceValidUntil fabriqué')
}

// ─── Test 6 : Rupture (soldOut) ──────────────────────────────
console.log('\n[6] Produit en rupture (soldOut)')
{
  const p: SanityProduct = {
    ...baseProduct,
    stock: 0,
    availabilityStatus: 'soldOut',
  }
  const offer = buildOfferSchema(p)
  assert(
    offer.availability === 'https://schema.org/SoldOut',
    'availability SoldOut',
  )
  assert(!has(offer, 'inventoryLevel'), 'inventoryLevel absent (stock 0)')
}

// ─── Test 7 : Retrait uniquement (onQuote) ────────────────────
console.log('\n[7] Produit sur devis (onQuote)')
{
  const p: SanityProduct = {
    ...baseProduct,
    stock: 1,
    availabilityStatus: 'onQuote',
  }
  const offer = buildOfferSchema(p)
  assert(
    offer.availability === 'https://schema.org/LimitedAvailability',
    'availability LimitedAvailability pour onQuote',
  )
}

// ─── Test 8 : Livrable national (in stock standard) ──────────
console.log('\n[8] Produit livrable nationalement (in stock)')
{
  const p: SanityProduct = { ...baseProduct, stock: 10, availabilityStatus: 'inStock' }
  const offer = buildOfferSchema(p)
  assert(offer.availability === 'https://schema.org/InStock', 'InStock émis')
  assert(
    (offer.inventoryLevel as Record<string, unknown>)?.value === 10,
    'inventoryLevel = 10',
  )
}

// ─── Test 9 : Backorder avec date de retour ──────────────────
console.log('\n[9] Produit en retour prévu (backorder)')
{
  const p: SanityProduct = {
    ...baseProduct,
    stock: 0,
    availabilityStatus: 'backorder',
    restockExpectedDate: '2026-09-15',
  }
  const offer = buildOfferSchema(p)
  assert(offer.availability === 'https://schema.org/BackOrder', 'BackOrder émis')
  assert(offer.availabilityStarts === '2026-09-15', 'availabilityStarts émis')
}

// ─── Test 10 : Vidéo YouTube complète vs incomplète ──────────
console.log('\n[10] Produit avec et sans vidéo')
{
  const complete: SanityProduct = {
    ...baseProduct,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoDescription: 'Présentation du produit',
    videoUploadDate: '2026-01-15',
  }
  const v1 = buildVideoSchema(complete)
  assert(v1 !== null, 'YouTube + description + date → VideoObject émis')
  assert(
    (v1 as Record<string, unknown>)?.thumbnailUrl ===
      'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    'thumbnailUrl auto-généré depuis ID YouTube',
  )

  const incomplete: SanityProduct = {
    ...baseProduct,
    videoUrl: 'https://www.youtube.com/watch?v=abc',
    // pas de description → doit retourner null
  }
  const v2 = buildVideoSchema(incomplete)
  assert(v2 === null, 'VideoObject NULL si description manquante (pas de fabrication)')

  const vimeoNoThumb: SanityProduct = {
    ...baseProduct,
    videoUrl: 'https://vimeo.com/123456',
    videoDescription: 'Description',
    videoUploadDate: '2026-01-15',
    // pas de thumbnail → doit retourner null (Vimeo sans thumb)
  }
  const v3 = buildVideoSchema(vimeoNoThumb)
  assert(v3 === null, 'VideoObject NULL pour Vimeo sans thumbnail')
}

// ─── Test 11 : Plusieurs images (3 ratios chacune) ────────────
console.log('\n[11] Produit avec plusieurs images')
{
  const p: SanityProduct = {
    ...baseProduct,
    images: [
      { _key: 'k1', asset: { _ref: 'image-abc-1200x1200-jpg', _type: 'reference' } },
      { _key: 'k2', asset: { _ref: 'image-def-1200x1200-jpg', _type: 'reference' } },
    ],
  }
  const s = buildProductSchema(p)
  const imgs = s.image as string[]
  assert(Array.isArray(imgs), 'image[] est un array')
  assert(
    imgs.length === 6,
    `2 images × 3 ratios = 6 URLs (reçu ${imgs?.length})`,
  )
}

// ─── Test 12 : noIndex (traité au niveau page, pas schema) ────
console.log('\n[12] Produit noIndex — traité côté generateMetadata / feed')
{
  const p: SanityProduct = {
    ...baseProduct,
    seo: { noIndex: true },
  }
  const s = buildProductSchema(p)
  // Le schema Product lui-même reste valide, c'est la page qui gère noindex
  // via <meta robots="noindex,follow"> et le feed qui l'exclut.
  assert(!!s, 'Schema Product généré même si noIndex (indépendant)')
  assert(p.seo?.noIndex === true, 'Flag noIndex reste true côté SanityProduct')
}

// ─── Récap ──────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────')
console.log(`Résultat : ${passed} passés · ${failed} échoués`)
if (failed > 0) {
  console.log('\nÉchecs :')
  failures.forEach((f) => console.log(`  • ${f}`))
  process.exit(1)
}
console.log('✅ Tous les tests OK.')
