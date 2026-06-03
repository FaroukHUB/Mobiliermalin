import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/lib/categories-data'
import {
  getAllCategories,
  getAllProductSlugs,
  sanityClient,
} from '@/lib/sanity'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

/**
 * Sitemap dynamique — généré à chaque revalidation.
 * Lit Sanity pour les produits + catégories afin que chaque nouvel ajout
 * dans Studio apparaisse automatiquement dans le sitemap soumis à Google.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // 1) Routes statiques cœur
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/boutique`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/notre-demarche`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/vidage-de-locaux`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl}/location-mobilier-bureau`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl}/attestation-rse`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/charte-qualite`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/mobilier-bureau-occasion-marseille`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ]

  // 2) Catégories hardcodées (les 7 "univers" historiques)
  const hardcodedCategoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${siteUrl}/categorie/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 3) Catégories Sanity (créées par le client : Assise, Bureau, Rangement, etc.)
  let sanityCategoryRoutes: MetadataRoute.Sitemap = []
  try {
    const sanityCategories = await getAllCategories()
    sanityCategoryRoutes = sanityCategories.map((c) => ({
      url: `${siteUrl}/categorie/${c.slug.current}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: c.parent ? 0.7 : 0.85,
    }))
  } catch {
    // Sanity peut être indisponible au build → on continue avec ce qu'on a
  }

  // 4) Pages produits Sanity (le cœur du SEO long-tail)
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const slugs = await getAllProductSlugs()
    // Récupère aussi les _updatedAt pour avoir des lastModified justes
    const productUpdates = await sanityClient
      .fetch<{ slug: { current: string }; _updatedAt: string }[]>(
        `*[_type == "product" && status == "published"] { slug, _updatedAt }`,
      )
      .catch(() => [] as { slug: { current: string }; _updatedAt: string }[])

    const updatesMap = new Map(
      productUpdates.map((p) => [p.slug?.current, p._updatedAt]),
    )

    productRoutes = slugs.map((slug) => ({
      url: `${siteUrl}/produit/${slug}`,
      lastModified: updatesMap.get(slug)
        ? new Date(updatesMap.get(slug) as string)
        : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // idem
  }

  // Déduplique par URL (au cas où une catégorie hardcodée existerait aussi en Sanity)
  const seen = new Set<string>()
  const all = [
    ...staticRoutes,
    ...hardcodedCategoryRoutes,
    ...sanityCategoryRoutes,
    ...productRoutes,
  ].filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })

  return all
}
