import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

const STATIC_ROUTES = [
  { path: '', priority: 1.0, changeFrequency: 'daily' as const },
  { path: '/boutique', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/categories', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/vendre', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/debarras', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/a-propos', priority: 0.6, changeFrequency: 'monthly' as const },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' as const },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  try {
    const payload = await getPayloadClient()

    const products = await payload.find({
      collection: 'products',
      where: { status: { equals: 'published' } },
      limit: 5000,
      depth: 0,
    })
    products.docs.forEach((p) => {
      const doc = p as { slug?: string; updatedAt?: string }
      if (doc.slug) {
        entries.push({
          url: `${siteUrl}/produit/${doc.slug}`,
          lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    })

    const categories = await payload.find({
      collection: 'categories',
      limit: 500,
      depth: 0,
    })
    categories.docs.forEach((c) => {
      const doc = c as { slug?: string; updatedAt?: string }
      if (doc.slug) {
        entries.push({
          url: `${siteUrl}/categorie/${doc.slug}`,
          lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    })

    const posts = await payload.find({
      collection: 'blog-posts',
      limit: 1000,
      depth: 0,
    })
    posts.docs.forEach((p) => {
      const doc = p as { slug?: string; updatedAt?: string }
      if (doc.slug) {
        entries.push({
          url: `${siteUrl}/blog/${doc.slug}`,
          lastModified: doc.updatedAt ? new Date(doc.updatedAt) : now,
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    })
  } catch (err) {
    console.warn('[sitemap] DB not reachable, returning static routes only:', err)
  }

  return entries
}
