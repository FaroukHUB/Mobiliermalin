/**
 * Requêtes Sanity pour le blog.
 * Séparé de lib/sanity.ts pour éviter d'alourdir ce fichier
 * déjà chargé (produits, catégories, etc.).
 */

import { sanityClient } from './sanity'
import type { PortableTextBlock } from 'next-sanity'

export type SanityBlogPost = {
  _id: string
  _createdAt: string
  _updatedAt: string
  title: string
  slug: { current: string }
  excerpt?: string
  body?: PortableTextBlock[]
  heroImage?: {
    _key?: string
    asset: { _ref: string; _type: string }
    alt?: string
    hotspot?: { x: number; y: number; height: number; width: number }
  }
  category?: string
  tags?: string[]
  author?: string
  publishedAt: string
  status: 'draft' | 'published' | 'archived'
  featured?: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    noIndex?: boolean
  }
  relatedPosts?: SanityBlogPost[]
}

const BLOG_FIELDS = `
  _id, _createdAt, _updatedAt,
  title, slug, excerpt, body,
  heroImage{_key, asset, alt, hotspot},
  category, tags, author,
  publishedAt, status, featured,
  seo
`

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

async function safeFetch<T>(
  query: string,
  params: Record<string, unknown>,
  fallback: T,
): Promise<T> {
  if (!projectId) return fallback
  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate: 60, tags: ['sanity-blog'] },
    })
  } catch (err) {
    console.warn('[sanity-blog] fetch error:', err)
    return fallback
  }
}

/**
 * Tous les articles publiés (date de publication passée).
 * Utilisé pour /blog (index) et le sitemap.
 */
export async function getAllBlogPosts(): Promise<SanityBlogPost[]> {
  return safeFetch<SanityBlogPost[]>(
    `*[_type == "blogPost" && status == "published" && publishedAt <= now()]
       | order(publishedAt desc) { ${BLOG_FIELDS} }`,
    {},
    [],
  )
}

/**
 * Article par slug + articles liés (préférence auteur ou fallback derniers).
 */
export async function getBlogPostBySlug(
  slug: string,
): Promise<SanityBlogPost | null> {
  return safeFetch<SanityBlogPost | null>(
    `*[_type == "blogPost" && slug.current == $slug && status == "published" && publishedAt <= now()][0] {
       ${BLOG_FIELDS},
       "relatedPosts": relatedPosts[]->{ ${BLOG_FIELDS} }
     }`,
    { slug },
    null,
  )
}

/**
 * Articles à afficher sur la home.
 * Priorité 1 : featured == true
 * Priorité 2 : les N plus récents
 */
export async function getFeaturedBlogPosts(
  limit: number = 3,
): Promise<SanityBlogPost[]> {
  return safeFetch<SanityBlogPost[]>(
    `*[_type == "blogPost" && status == "published" && publishedAt <= now()]
       | order(featured desc, publishedAt desc) [0...$limit] { ${BLOG_FIELDS} }`,
    { limit },
    [],
  )
}

/**
 * Fallback articles proches (même catégorie ou plus récents) si l'article
 * courant n'a pas de relatedPosts explicites configurés en Sanity.
 */
export async function getRelatedBlogPosts(
  currentSlug: string,
  currentCategory: string | undefined,
  limit: number = 2,
): Promise<SanityBlogPost[]> {
  if (currentCategory) {
    const sameCategory = await safeFetch<SanityBlogPost[]>(
      `*[_type == "blogPost" && status == "published" && publishedAt <= now()
          && slug.current != $slug && category == $cat]
         | order(publishedAt desc) [0...$limit] { ${BLOG_FIELDS} }`,
      { slug: currentSlug, cat: currentCategory, limit },
      [],
    )
    if (sameCategory.length >= limit) return sameCategory
  }
  return safeFetch<SanityBlogPost[]>(
    `*[_type == "blogPost" && status == "published" && publishedAt <= now()
        && slug.current != $slug]
       | order(publishedAt desc) [0...$limit] { ${BLOG_FIELDS} }`,
    { slug: currentSlug, limit },
    [],
  )
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const posts = await safeFetch<{ slug: { current: string } }[]>(
    `*[_type == "blogPost" && status == "published"] { slug }`,
    {},
    [],
  )
  return posts.map((p) => p.slug.current).filter(Boolean)
}

const CATEGORY_LABELS: Record<string, string> = {
  guides: "Guides d'achat",
  brands: 'Marques & modèles',
  rse: 'Écologie & RSE',
  layout: 'Aménagement bureau',
  tips: 'Conseils pratiques',
  news: 'Actualité Mobilier Malin',
}

export function categoryLabel(key?: string): string {
  if (!key) return 'Article'
  return CATEGORY_LABELS[key] || key
}

/**
 * Estime le temps de lecture (mots / 220 mots par minute).
 */
export function estimateReadMinutes(body?: PortableTextBlock[]): number {
  if (!body || body.length === 0) return 3
  let wordCount = 0
  for (const block of body) {
    if (block._type === 'block') {
      const children = (block as { children?: Array<{ text?: string }> }).children ?? []
      for (const child of children) {
        if (typeof child.text === 'string') {
          wordCount += child.text.split(/\s+/).filter(Boolean).length
        }
      }
    }
  }
  return Math.max(2, Math.ceil(wordCount / 220))
}
