/**
 * Intégration Airtable — Mobilier Malin
 *
 * Lit les produits depuis une base Airtable via l'API REST.
 * Si AIRTABLE_API_KEY n'est pas configuré, retourne un tableau vide (fallback
 * gracieux pour le dev / le build).
 *
 * Doc setup : voir /airtable-setup/README.md
 */

export type AirtableProduct = {
  id: string
  name: string
  slug: string
  category?: string
  brand?: string
  price: number
  comparePrice?: number
  condition?: string
  shortDescription?: string
  description?: string
  images: { url: string; alt?: string; width?: number; height?: number }[]
  stock: number
  status: 'Published' | 'Draft' | 'Sold' | 'Archived'
  widthCm?: number
  depthCm?: number
  heightCm?: number
  material?: string
  color?: string
  sku?: string
  featured: boolean
  createdAt?: string
  updatedAt?: string
}

const AIRTABLE_API = 'https://api.airtable.com/v0'

function getConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  const table = process.env.AIRTABLE_PRODUCTS_TABLE || 'Products'
  if (!apiKey || !baseId) return null
  return { apiKey, baseId, table }
}

type AirtableAttachment = {
  id: string
  url: string
  filename?: string
  size?: number
  type?: string
  width?: number
  height?: number
  thumbnails?: {
    small?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
    full?: { url: string; width: number; height: number }
  }
}

type AirtableRecord = {
  id: string
  fields: Record<string, unknown>
  createdTime: string
}

function mapRecord(record: AirtableRecord): AirtableProduct | null {
  const f = record.fields

  const name = (f['Name'] as string) || ''
  const slug = (f['Slug'] as string) || ''
  const price = (f['Price'] as number) ?? 0

  if (!name || !slug) return null

  const images = ((f['Images'] as AirtableAttachment[] | undefined) || []).map(
    (a) => ({
      url: a.thumbnails?.large?.url || a.url,
      alt: name,
      width: a.width,
      height: a.height,
    }),
  )

  const status = (f['Status'] as AirtableProduct['status']) || 'Draft'

  return {
    id: record.id,
    name,
    slug,
    category: f['Category'] as string | undefined,
    brand: f['Brand'] as string | undefined,
    price,
    comparePrice: f['Compare Price'] as number | undefined,
    condition: f['Condition'] as string | undefined,
    shortDescription: f['Short Description'] as string | undefined,
    description: f['Description'] as string | undefined,
    images,
    stock: (f['Stock'] as number) ?? 0,
    status,
    widthCm: f['Width cm'] as number | undefined,
    depthCm: f['Depth cm'] as number | undefined,
    heightCm: f['Height cm'] as number | undefined,
    material: f['Material'] as string | undefined,
    color: f['Color'] as string | undefined,
    sku: f['SKU'] as string | undefined,
    featured: Boolean(f['Featured']),
    createdAt: f['Created'] as string | undefined,
    updatedAt: f['Updated'] as string | undefined,
  }
}

async function fetchAllRecords(filter?: string): Promise<AirtableRecord[]> {
  const cfg = getConfig()
  if (!cfg) return []

  const url = new URL(`${AIRTABLE_API}/${cfg.baseId}/${encodeURIComponent(cfg.table)}`)
  url.searchParams.set('pageSize', '100')
  if (filter) url.searchParams.set('filterByFormula', filter)

  const records: AirtableRecord[] = []
  let offset: string | undefined

  do {
    if (offset) url.searchParams.set('offset', offset)
    else url.searchParams.delete('offset')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${cfg.apiKey}` },
      // ISR-friendly cache (1 min)
      next: { revalidate: 60, tags: ['airtable-products'] },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[airtable] fetch error', res.status, text)
      return []
    }
    const data = (await res.json()) as { records: AirtableRecord[]; offset?: string }
    records.push(...data.records)
    offset = data.offset
  } while (offset)

  return records
}

/**
 * Récupère tous les produits publiés.
 */
export async function getAllProducts(): Promise<AirtableProduct[]> {
  const records = await fetchAllRecords("{Status} = 'Published'")
  return records
    .map(mapRecord)
    .filter((p): p is AirtableProduct => p !== null)
}

/**
 * Récupère les produits d'une catégorie (par slug Airtable, ex: "bureaux-individuels").
 */
export async function getProductsByCategory(
  categorySlug: string,
): Promise<AirtableProduct[]> {
  const safe = categorySlug.replace(/'/g, "\\'")
  const filter = `AND({Status} = 'Published', {Category} = '${safe}')`
  const records = await fetchAllRecords(filter)
  return records
    .map(mapRecord)
    .filter((p): p is AirtableProduct => p !== null)
}

/**
 * Récupère un produit par son slug.
 */
export async function getProductBySlug(
  slug: string,
): Promise<AirtableProduct | null> {
  const safe = slug.replace(/'/g, "\\'")
  const filter = `AND({Status} = 'Published', {Slug} = '${safe}')`
  const records = await fetchAllRecords(filter)
  const p = records.map(mapRecord).find((p): p is AirtableProduct => p !== null)
  return p || null
}

/**
 * Récupère les produits "Featured" pour la home.
 */
export async function getFeaturedProducts(
  limit: number = 6,
): Promise<AirtableProduct[]> {
  const filter = "AND({Status} = 'Published', {Featured} = TRUE())"
  const records = await fetchAllRecords(filter)
  return records
    .map(mapRecord)
    .filter((p): p is AirtableProduct => p !== null)
    .slice(0, limit)
}

/**
 * Liste des slugs de tous les produits publiés (pour generateStaticParams).
 */
export async function getAllProductSlugs(): Promise<string[]> {
  const records = await fetchAllRecords("{Status} = 'Published'")
  return records
    .map((r) => r.fields['Slug'] as string | undefined)
    .filter((s): s is string => Boolean(s))
}
