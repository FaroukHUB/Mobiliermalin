/**
 * Fetches Sanity pour le cocon sémantique (guideCluster + guideArticle).
 *
 * URLs :
 *   /guides                          → tous les clusters publiés
 *   /guides/[cluster]                → hub cluster + articles enfants
 *   /guides/[cluster]/[article]      → article détaillé
 */

import { sanityClient, urlFor, type SanityImage } from './sanity'

export type SanityGuideCluster = {
  _id: string
  name: string
  slug: { current: string }
  tagline?: string
  description?: string
  image?: SanityImage
  order?: number
  relatedProductCategories?: Array<{
    _id: string
    name: string
    slug: { current: string }
  }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    noIndex?: boolean
  }
}

export type SanityGuideArticle = {
  _id: string
  title: string
  slug: { current: string }
  cluster: {
    _id: string
    name: string
    slug: { current: string }
  }
  status: 'draft' | 'published' | 'archived'
  publishedAt?: string
  author?: string
  excerpt?: string
  heroImage?: SanityImage & { alt?: string }
  body?: unknown[]
  readingTimeMinutes?: number
  primaryProductCategory?: {
    _id: string
    name: string
    slug: { current: string }
  }
  featuredProducts?: Array<{
    _id: string
    name: string
    slug: { current: string }
    price: number
    salePrice?: number
    images?: SanityImage[]
    brand?: string
  }>
  relatedArticles?: Array<{
    _id: string
    title: string
    slug: { current: string }
    cluster: { slug: { current: string } }
    excerpt?: string
  }>
  faq?: Array<{ question: string; answer: string }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: SanityImage
    canonicalUrl?: string
    noIndex?: boolean
    primaryKeyword?: string
  }
  _createdAt: string
  _updatedAt: string
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

async function safeFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  fallback: T,
): Promise<T> {
  if (!projectId) return fallback
  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate: 60, tags: ['sanity-guides'] },
    })
  } catch (err) {
    console.warn('[sanity-guides] fetch error, returning fallback:', err)
    return fallback
  }
}

// ─── Clusters ──────────────────────────────────────────────
const CLUSTER_FIELDS = `
  _id, name, slug, tagline, description, image, order,
  relatedProductCategories[]->{ _id, name, slug },
  seo
`

export async function getAllGuideClusters(): Promise<SanityGuideCluster[]> {
  return safeFetch<SanityGuideCluster[]>(
    `*[_type == "guideCluster"] | order(order asc, name asc) { ${CLUSTER_FIELDS} }`,
    {},
    [],
  )
}

export async function getGuideClusterBySlug(
  slug: string,
): Promise<SanityGuideCluster | null> {
  return safeFetch<SanityGuideCluster | null>(
    `*[_type == "guideCluster" && slug.current == $slug][0] { ${CLUSTER_FIELDS} }`,
    { slug },
    null,
  )
}

// ─── Articles ──────────────────────────────────────────────
const ARTICLE_FIELDS = `
  _id, title, slug,
  cluster->{ _id, name, slug },
  status, publishedAt, author, excerpt,
  heroImage { ..., alt },
  body,
  readingTimeMinutes,
  primaryProductCategory->{ _id, name, slug },
  featuredProducts[]->{
    _id, name, slug, price, salePrice,
    images[]{ _key, asset, alt, hotspot },
    brand
  },
  relatedArticles[]->{
    _id, title, slug,
    cluster->{ slug },
    excerpt
  },
  faq,
  seo,
  _createdAt, _updatedAt
`

export async function getAllGuideArticleSlugs(): Promise<
  Array<{ clusterSlug: string; articleSlug: string }>
> {
  return safeFetch<Array<{ clusterSlug: string; articleSlug: string }>>(
    `*[_type == "guideArticle" && status == "published" && defined(cluster) && defined(slug)] {
      "articleSlug": slug.current,
      "clusterSlug": cluster->slug.current
    }`,
    {},
    [],
  )
}

export async function getGuideArticlesByClusterSlug(
  clusterSlug: string,
): Promise<SanityGuideArticle[]> {
  return safeFetch<SanityGuideArticle[]>(
    `*[_type == "guideArticle" && status == "published" && cluster->slug.current == $clusterSlug]
      | order(publishedAt desc) { ${ARTICLE_FIELDS} }`,
    { clusterSlug },
    [],
  )
}

export async function getGuideArticleBySlug(
  clusterSlug: string,
  articleSlug: string,
): Promise<SanityGuideArticle | null> {
  return safeFetch<SanityGuideArticle | null>(
    `*[_type == "guideArticle" && slug.current == $articleSlug
       && cluster->slug.current == $clusterSlug][0] { ${ARTICLE_FIELDS} }`,
    { clusterSlug, articleSlug },
    null,
  )
}

// Helper : URL absolue d'un article guide
export function guideArticleUrl(article: {
  slug: { current: string }
  cluster: { slug: { current: string } }
}): string {
  return `/guides/${article.cluster.slug.current}/${article.slug.current}`
}

// Helper : image OG d'un article (ogImage prioritaire, sinon heroImage)
export function guideArticleOgImageUrl(
  article: SanityGuideArticle,
): string | undefined {
  const img = article.seo?.ogImage || article.heroImage
  if (!img) return undefined
  return urlFor(img).width(1200).height(630).fit('crop').url()
}
