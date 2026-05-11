import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/lib/categories-data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

const STATIC_ROUTES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/notre-demarche', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/vidage-de-locaux', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/location-mobilier-bureau', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/attestation-rse', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  // 7 pages catégories
  CATEGORIES.forEach((c) => {
    entries.push({
      url: `${siteUrl}/categorie/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  return entries
}
