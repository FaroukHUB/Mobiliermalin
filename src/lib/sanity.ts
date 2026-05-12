/**
 * Client Sanity + requêtes GROQ pour les produits & catégories.
 *
 * Doc setup : voir /sanity-setup/README.md
 */

import { createClient, type SanityClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { projectId, dataset, apiVersion, useCdn } from '../../sanity/env'

export const sanityClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'published',
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ───────────────────────── Types ─────────────────────────

export type SanityImage = {
  _key?: string
  asset: { _ref: string; _type?: string }
  alt?: string
  hotspot?: { x: number; y: number; height: number; width: number }
}

export type SanityCategory = {
  _id: string
  name: string
  slug: { current: string }
  description?: string
  image?: SanityImage
  order?: number
}

export type SanityProduct = {
  _id: string
  name: string
  slug: { current: string }
  status: 'draft' | 'published' | 'sold' | 'archived'
  shortDescription?: string
  description?: unknown[] // PortableText
  price: number
  comparePrice?: number
  stock: number
  images: SanityImage[]
  category?: SanityCategory
  brand?: string
  condition?: 'new' | 'excellent' | 'very-good' | 'good' | 'fair'
  widthCm?: number
  depthCm?: number
  heightCm?: number
  material?: string
  color?: string
  sku?: string
  featured?: boolean
  seo?: { metaTitle?: string; metaDescription?: string }
  _createdAt: string
  _updatedAt: string
}

// ───────────────────────── Queries GROQ ─────────────────────────

const PRODUCT_FIELDS = `
  _id, name, slug, status, shortDescription, description,
  price, comparePrice, stock,
  images[]{_key, asset, alt, hotspot},
  category->{_id, name, slug, description, image, order},
  brand, condition,
  widthCm, depthCm, heightCm,
  material, color, sku, featured,
  seo,
  _createdAt, _updatedAt
`

/**
 * Helper : safe-fetch qui retourne un fallback si Sanity n'est pas configuré.
 */
async function safeFetch<T>(query: string, params: Record<string, unknown> = {}, fallback: T): Promise<T> {
  if (!projectId) return fallback
  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate: 60, tags: ['sanity-products'] },
    })
  } catch (err) {
    console.warn('[sanity] fetch error, returning fallback:', err)
    return fallback
  }
}

/**
 * Tous les produits publiés.
 */
export async function getAllProducts(): Promise<SanityProduct[]> {
  return safeFetch<SanityProduct[]>(
    `*[_type == "product" && status == "published"] | order(_createdAt desc) { ${PRODUCT_FIELDS} }`,
    {},
    [],
  )
}

/**
 * Produits d'une catégorie par slug.
 */
export async function getProductsByCategory(categorySlug: string): Promise<SanityProduct[]> {
  return safeFetch<SanityProduct[]>(
    `*[_type == "product" && status == "published" && category->slug.current == $slug] | order(_createdAt desc) { ${PRODUCT_FIELDS} }`,
    { slug: categorySlug },
    [],
  )
}

/**
 * Produit par slug.
 */
export async function getProductBySlug(slug: string): Promise<SanityProduct | null> {
  return safeFetch<SanityProduct | null>(
    `*[_type == "product" && status == "published" && slug.current == $slug][0] { ${PRODUCT_FIELDS} }`,
    { slug },
    null,
  )
}

/**
 * Produits "Featured" pour la home.
 */
export async function getFeaturedProducts(limit: number = 6): Promise<SanityProduct[]> {
  return safeFetch<SanityProduct[]>(
    `*[_type == "product" && status == "published" && featured == true] | order(_createdAt desc) [0...$limit] { ${PRODUCT_FIELDS} }`,
    { limit },
    [],
  )
}

/**
 * Tous les slugs (pour generateStaticParams).
 */
export async function getAllProductSlugs(): Promise<string[]> {
  return safeFetch<{ slug: { current: string } }[]>(
    `*[_type == "product" && status == "published"]{ slug }`,
    {},
    [],
  ).then((docs) => docs.map((d) => d.slug.current).filter(Boolean))
}

/**
 * Toutes les catégories.
 */
export async function getAllCategories(): Promise<SanityCategory[]> {
  return safeFetch<SanityCategory[]>(
    `*[_type == "category"] | order(order asc, name asc) { _id, name, slug, description, image, order }`,
    {},
    [],
  )
}

// ───────────────────────── Site Settings (singleton) ─────────────────────────

export type SanitySiteSettings = {
  siteName?: string
  logoOnLight?: SanityImage
  logoOnDark?: SanityImage
  favicon?: SanityImage
  manifesteImage?: SanityImage
  lldSectionImage?: SanityImage
  showroomImage?: SanityImage
  lldHeroImage?: SanityImage
  rseHeroImage?: SanityImage
}

/**
 * Réglages du site (logos, images de section, etc.) — singleton.
 */
export async function getSiteSettings(): Promise<SanitySiteSettings> {
  return safeFetch<SanitySiteSettings>(
    `*[_type == "siteSettings"][0] {
      siteName, logoOnLight, logoOnDark, favicon,
      manifesteImage, lldSectionImage, showroomImage,
      lldHeroImage, rseHeroImage
    }`,
    {},
    {},
  )
}

// ───────────────────────── Hero Slider ─────────────────────────

export type SanityHeroSlide = {
  _id: string
  title: string
  subtitle?: string
  image: SanityImage
  imageMobile?: SanityImage
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  textPosition?: 'left' | 'center' | 'right'
  textColor?: 'light' | 'dark'
  overlayOpacity?: number
  order?: number
  status: 'published' | 'draft'
}

/**
 * Slides du hero d'accueil (uniquement publiées, triées).
 */
export async function getHeroSlides(): Promise<SanityHeroSlide[]> {
  return safeFetch<SanityHeroSlide[]>(
    `*[_type == "heroSlide" && status == "published"] | order(order asc) {
      _id, title, subtitle,
      image, imageMobile,
      ctaPrimaryLabel, ctaPrimaryHref, ctaSecondaryLabel, ctaSecondaryHref,
      textPosition, textColor, overlayOpacity, order, status
    }`,
    {},
    [],
  )
}
