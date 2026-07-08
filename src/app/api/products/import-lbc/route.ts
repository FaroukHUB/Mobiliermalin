/**
 * POST /api/products/import-lbc
 *
 * Reçoit un payload JSON décrivant un produit (généré par Claude à
 * partir d'une extraction Leboncoin) et crée le document Sanity
 * correspondant en brouillon (status: 'draft').
 *
 * Djamel/Farouk n'a plus qu'à ouvrir le brouillon, uploader les
 * photos et publier.
 *
 * Sécurité :
 *   - Header x-admin-secret === process.env.ADMIN_IMPORT_SECRET
 *   - Token Sanity écriture (SANITY_WRITE_TOKEN) requis
 *
 * Payload attendu :
 * {
 *   "name": "Table mange-debout plateau verre",
 *   "slug": "table-mange-debout-plateau-verre",  // optionnel, généré sinon
 *   "brand": "Sans marque",
 *   "condition": "excellent" | "very-good" | "good" | "fair" | "new",
 *   "categorySlug": "espaces-detente",
 *   "price": 96,
 *   "salePrice": 50,       // optionnel
 *   "comparePrice": 250,   // optionnel — prix neuf de référence
 *   "stock": 1,
 *   "sku": "TMD-VERRE-001",
 *   "material": "Verre trempé, acier chromé",
 *   "color": "Transparent / chromé",
 *   "widthCm": 60,     // optionnels
 *   "depthCm": 60,
 *   "heightCm": 110,
 *   "shortDescription": "Table mange-debout au plateau...",
 *   "descriptionBlocks": [ // Portable Text
 *     { style: 'normal', text: 'Paragraphe...' },
 *     { style: 'h2', text: 'Titre H2' },
 *     { style: 'bullet', text: 'Puce 1' },
 *   ],
 *   "seoMetaTitle": "Table mange-debout occasion Marseille — Mobilier Malin",
 *   "seoMetaDescription": "Table mange-debout reconditionnée...",
 *   "sourceUrl": "https://www.leboncoin.fr/ad/...",  // trace
 *   "leboncoinImageUrls": [ "https://img.leboncoin.fr/..." ]  // trace, non uploadées
 * }
 */

import { NextResponse } from 'next/server'
import { getWriteClient, isSanityWriteConfigured } from '@/lib/sanity-write'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PortableTextBlock = {
  _type?: string
  _key?: string
  style?: string
  listItem?: string
  level?: number
  children?: Array<{ _type?: string; _key?: string; text: string; marks?: string[] }>
  markDefs?: unknown[]
}

type ImportPayload = {
  name?: string
  slug?: string
  brand?: string
  condition?: string
  categorySlug?: string
  price?: number
  salePrice?: number
  comparePrice?: number
  stock?: number
  sku?: string
  material?: string
  color?: string
  widthCm?: number
  depthCm?: number
  heightCm?: number
  shortDescription?: string
  descriptionBlocks?: Array<{
    style?: string
    text: string
  }>
  seoMetaTitle?: string
  seoMetaDescription?: string
  sourceUrl?: string
  leboncoinImageUrls?: string[]
}

const ALLOWED_CONDITIONS = ['new', 'excellent', 'very-good', 'good', 'fair']

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 96)
}

/**
 * Transforme une liste simple de blocs {style, text} en Portable Text
 * Sanity avec les _key requis. Gère normal / h2 / h3 / h4 / bullet.
 */
function buildPortableText(
  blocks?: Array<{ style?: string; text: string }>,
): PortableTextBlock[] {
  if (!blocks || blocks.length === 0) return []
  return blocks
    .filter((b) => b.text?.trim())
    .map((b, i) => {
      const style = b.style || 'normal'
      const isListItem = style === 'bullet' || style === 'number'
      return {
        _type: 'block',
        _key: `blk-${i}-${Math.random().toString(36).slice(2, 8)}`,
        style: isListItem ? 'normal' : style,
        listItem: isListItem ? (style === 'number' ? 'number' : 'bullet') : undefined,
        level: isListItem ? 1 : undefined,
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: `sp-${i}-${Math.random().toString(36).slice(2, 8)}`,
            text: b.text.trim(),
            marks: [],
          },
        ],
      }
    })
}

export async function POST(req: Request) {
  // ─── AUTH ────────────────────────────────────────────────────
  const providedSecret = req.headers.get('x-admin-secret')
  const expectedSecret = process.env.ADMIN_IMPORT_SECRET
  if (!expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'ADMIN_IMPORT_SECRET non configuré côté serveur (Vercel Env Vars).',
      },
      { status: 500 },
    )
  }
  if (providedSecret !== expectedSecret) {
    return NextResponse.json(
      { ok: false, error: 'Secret admin invalide.' },
      { status: 401 },
    )
  }

  if (!isSanityWriteConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'SANITY_WRITE_TOKEN absent dans Vercel Env Vars.',
      },
      { status: 500 },
    )
  }

  // ─── PARSING ─────────────────────────────────────────────────
  let payload: ImportPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'JSON invalide.' },
      { status: 400 },
    )
  }

  const { name, brand, categorySlug, price } = payload

  if (!name || typeof name !== 'string' || name.length < 3) {
    return NextResponse.json(
      { ok: false, error: 'Le champ "name" est obligatoire (min 3 caractères).' },
      { status: 400 },
    )
  }
  if (typeof price !== 'number' || price <= 0) {
    return NextResponse.json(
      { ok: false, error: 'Le champ "price" est obligatoire (nombre > 0).' },
      { status: 400 },
    )
  }
  const condition = payload.condition && ALLOWED_CONDITIONS.includes(payload.condition)
    ? payload.condition
    : 'excellent'

  const slug = payload.slug ? slugify(payload.slug) : slugify(name)

  // ─── RÉSOLUTION CATÉGORIE ────────────────────────────────────
  const client = getWriteClient()
  if (!client) {
    return NextResponse.json(
      { ok: false, error: 'Impossible de créer le client Sanity.' },
      { status: 500 },
    )
  }

  let categoryRef: string | null = null
  if (categorySlug) {
    try {
      const catDoc = await client.fetch<{ _id?: string } | null>(
        `*[_type == "category" && slug.current == $slug][0]{ _id }`,
        { slug: categorySlug },
      )
      if (catDoc?._id) categoryRef = catDoc._id
    } catch (err) {
      console.warn('[import-lbc] Fetch catégorie a échoué :', err)
    }
  }

  // ─── VÉRIF DOUBLON SLUG ──────────────────────────────────────
  const existing = await client.fetch<{ _id?: string } | null>(
    `*[_type == "product" && slug.current == $slug][0]{ _id }`,
    { slug },
  )
  if (existing?._id) {
    return NextResponse.json(
      {
        ok: false,
        error: `Un produit existe déjà avec ce slug : ${slug}. Modifie le "slug" dans le JSON ou supprime l'existant.`,
        existingId: existing._id,
      },
      { status: 409 },
    )
  }

  // ─── CONSTRUCTION DU DOCUMENT ────────────────────────────────
  const description = buildPortableText(payload.descriptionBlocks)

  const doc: { _type: string; [key: string]: unknown } = {
    _type: 'product',
    name: name.trim(),
    slug: { _type: 'slug', current: slug },
    status: 'draft',
    price,
    stock: typeof payload.stock === 'number' ? payload.stock : 1,
    condition,
    ...(brand && { brand: brand.trim() }),
    ...(typeof payload.salePrice === 'number' && { salePrice: payload.salePrice }),
    ...(typeof payload.comparePrice === 'number' && {
      comparePrice: payload.comparePrice,
    }),
    ...(payload.sku && { sku: payload.sku.trim() }),
    ...(payload.material && { material: payload.material.trim() }),
    ...(payload.color && { color: payload.color.trim() }),
    ...(typeof payload.widthCm === 'number' && { widthCm: payload.widthCm }),
    ...(typeof payload.depthCm === 'number' && { depthCm: payload.depthCm }),
    ...(typeof payload.heightCm === 'number' && { heightCm: payload.heightCm }),
    ...(payload.shortDescription && {
      shortDescription: payload.shortDescription.trim(),
    }),
    ...(description.length > 0 && { description }),
    ...(categoryRef && {
      category: { _type: 'reference', _ref: categoryRef },
    }),
    ...((payload.seoMetaTitle || payload.seoMetaDescription) && {
      seo: {
        ...(payload.seoMetaTitle && { metaTitle: payload.seoMetaTitle.trim() }),
        ...(payload.seoMetaDescription && {
          metaDescription: payload.seoMetaDescription.trim(),
        }),
      },
    }),
    ...(payload.sourceUrl && { _importSourceUrl: payload.sourceUrl }),
    ...(payload.leboncoinImageUrls && payload.leboncoinImageUrls.length > 0 && {
      _importImageUrls: payload.leboncoinImageUrls,
    }),
  }

  // ─── CRÉATION ────────────────────────────────────────────────
  try {
    const created = await client.create(doc)
    return NextResponse.json({
      ok: true,
      id: created._id,
      slug,
      name: name.trim(),
      categoryResolved: !!categoryRef,
      categoryFallback: !categoryRef ? categorySlug : undefined,
      studioUrl: `/studio/desk/product;${created._id}`,
      publicUrl: `/produit/${slug}`,
      next: 'Ouvre le document dans Sanity Studio, uploade les photos, puis publie (status: published).',
    })
  } catch (err) {
    console.error('[import-lbc] Erreur création Sanity :', err)
    return NextResponse.json(
      {
        ok: false,
        error: 'Erreur Sanity : ' + (err instanceof Error ? err.message : 'inconnue'),
      },
      { status: 500 },
    )
  }
}
