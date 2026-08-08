import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/lib/categories-data'
import { BLOG_ARTICLES } from '@/lib/blog-articles'
import { getAllBlogPosts } from '@/lib/sanity-blog'
import {
  getAllCategories,
  getAllProductSlugs,
  sanityClient,
} from '@/lib/sanity'
import {
  getAllGuideClusters,
  getAllGuideArticleSlugs,
} from '@/lib/sanity-guides'

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
    { url: `${siteUrl}/meuble-occasion-marseille`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${siteUrl}/meuble-occasion-aubagne`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${siteUrl}/mobilier-bureau-professionnel`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/rachat-mobilier-bureau`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl}/bureau-occasion-marseille`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/bureau-occasion-aubagne`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/bureau-occasion-aix-en-provence`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/bureau-occasion-nice`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/bureau-occasion-toulon`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/bureau-occasion-la-ciotat`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/bureau-occasion-avignon`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/bureau-occasion-orange`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl}/fauteuil-occasion-marseille`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/fauteuil-occasion-aubagne`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/fauteuil-occasion-aix-en-provence`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/fauteuil-occasion-nice`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/fauteuil-occasion-toulon`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${siteUrl}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    // Cocon sémantique — Sprint 2
    { url: `${siteUrl}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/zones-desservies`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    // Landing pages nationales — Phase 1
    { url: `${siteUrl}/fauteuil-ergonomique`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/bureau-professionnel-occasion`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/marques/steelcase`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    // Landing pages nationales — Phase 2 (V2)
    { url: `${siteUrl}/mobilier-de-bureau-occasion`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/bureau-occasion`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/chaise-bureau-occasion`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/bureau-assis-debout-occasion`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/table-reunion-occasion`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/mobilier-bureau-entreprise`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/mobilier-bureau-eco-responsable`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/cabine-acoustique-bureau`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    // Landing pages nationales — Phase 3 (marques + modèle star)
    { url: `${siteUrl}/marques/herman-miller`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/marques/vitra`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/marques/haworth`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/steelcase-leap-v2-occasion`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/retractation`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/politique-confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
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

  // 5) Articles de blog — Sanity + hardcodés (dédup par URL en aval)
  const blogRoutesStatic: MetadataRoute.Sitemap = BLOG_ARTICLES.map((a) => ({
    url: `${siteUrl}/blog/${a.slug}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))
  let blogRoutesSanity: MetadataRoute.Sitemap = []
  try {
    const posts = await getAllBlogPosts()
    blogRoutesSanity = posts.map((p) => ({
      url: `${siteUrl}/blog/${p.slug.current}`,
      lastModified: new Date(p._updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // Sanity indispo au build → on retombe sur le hardcodé seul
  }
  const blogRoutes = [...blogRoutesSanity, ...blogRoutesStatic]

  // 6) Cocon sémantique — clusters + articles guides (Sprint 2)
  let guideRoutes: MetadataRoute.Sitemap = []
  try {
    const [clusters, articleSlugs] = await Promise.all([
      getAllGuideClusters(),
      getAllGuideArticleSlugs(),
    ])
    const clusterUrls = clusters
      .filter((c) => !c.seo?.noIndex)
      .map<MetadataRoute.Sitemap[number]>((c) => ({
        url: `${siteUrl}/guides/${c.slug.current}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
      }))
    const articleUrls = articleSlugs
      .filter((a) => a.clusterSlug && a.articleSlug)
      .map<MetadataRoute.Sitemap[number]>((a) => ({
        url: `${siteUrl}/guides/${a.clusterSlug}/${a.articleSlug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.65,
      }))
    guideRoutes = [...clusterUrls, ...articleUrls]
  } catch {
    // Sanity indispo — le sitemap reste valide sans les guides.
  }

  // Déduplique par URL (au cas où une catégorie hardcodée existerait aussi en Sanity)
  const seen = new Set<string>()
  const all = [
    ...staticRoutes,
    ...hardcodedCategoryRoutes,
    ...sanityCategoryRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...guideRoutes,
  ].filter((entry) => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return true
  })

  return all
}
