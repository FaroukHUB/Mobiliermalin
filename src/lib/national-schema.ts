/**
 * Helpers pour générer les schemas JSON-LD des landing pages nationales V2.
 *
 * Émet :
 *  - Article (avec author, datePublished, dateModified) — obligatoire pour E-E-A-T
 *  - AggregateOffer / Product depuis pricingRanges
 *  - VideoObject depuis videoEmbed (si description + uploadDate)
 *  - DefinedTermSet depuis glossary
 *
 * FAQ, Breadcrumb et CollectionPage sont gérés séparément dans chaque page.tsx.
 */

import { LEGAL } from './legal'
import type {
  SanityGlossaryTerm,
  SanityPricingRow,
  SanityVideoEmbed,
} from './sanity'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export function buildArticleSchema(input: {
  pageUrl: string
  headline: string
  description: string
  author?: string
  publishedAt?: string
  lastUpdated?: string
  heroImageUrl?: string
}): Record<string, unknown> {
  const {
    pageUrl,
    headline,
    description,
    author = 'Équipe Mobilier Malin',
    publishedAt,
    lastUpdated,
    heroImageUrl,
  } = input
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline,
    description,
    url: pageUrl,
    ...(heroImageUrl && { image: heroImageUrl }),
    ...(publishedAt && { datePublished: publishedAt }),
    ...(lastUpdated && { dateModified: lastUpdated }),
    author: {
      '@type': author.toLowerCase().includes('équipe') ? 'Organization' : 'Person',
      name: author,
      ...(author.toLowerCase().includes('équipe') && { url: siteUrl }),
    },
    publisher: {
      '@type': 'Organization',
      name: LEGAL.nomCommercial,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  }
}

export function buildAggregateOfferSchema(input: {
  pageUrl: string
  name: string
  rows: SanityPricingRow[]
}): Record<string, unknown> | null {
  const { pageUrl, name, rows } = input
  if (!rows || rows.length === 0) return null
  const allPrices = rows.flatMap((r) => [r.priceFrom, r.priceTo])
  const lowPrice = Math.min(...allPrices)
  const highPrice = Math.max(...allPrices)
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateOffer',
    '@id': `${pageUrl}#aggregate-offer`,
    name,
    priceCurrency: 'EUR',
    lowPrice: lowPrice.toString(),
    highPrice: highPrice.toString(),
    offerCount: rows.length,
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: LEGAL.nomCommercial,
      url: siteUrl,
    },
  }
}

export function buildVideoObjectSchema(
  video: SanityVideoEmbed | undefined,
): Record<string, unknown> | null {
  if (!video?.url || !video.description || !video.uploadDate) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title || 'Vidéo Mobilier Malin',
    description: video.description,
    uploadDate: video.uploadDate,
    contentUrl: video.url,
    ...(video.thumbnailUrl && { thumbnailUrl: video.thumbnailUrl }),
  }
}

export function buildDefinedTermSetSchema(input: {
  pageUrl: string
  name: string
  terms: SanityGlossaryTerm[]
}): Record<string, unknown> | null {
  const { pageUrl, name, terms } = input
  if (!terms || terms.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${pageUrl}#glossary`,
    name,
    hasDefinedTerm: terms.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      description: t.definition,
    })),
  }
}

export function buildHowToSchema(input: {
  pageUrl: string
  name: string
  description: string
  steps: Array<{ name: string; text: string }>
}): Record<string, unknown> {
  const { pageUrl, name, description, steps } = input
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${pageUrl}#howto`,
    name,
    description,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  }
}

export function buildBreadcrumbSchema(input: {
  siteUrl: string
  items: Array<{ name: string; href: string }>
}): Record<string, unknown> {
  const { siteUrl: base, items } = input
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: base },
      ...items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: it.name,
        item: `${base}${it.href}`,
      })),
    ],
  }
}
