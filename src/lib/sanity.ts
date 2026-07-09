/**
 * Client Sanity + requêtes GROQ pour les produits & catégories.
 *
 * Doc setup : voir /sanity-setup/README.md
 */

import { createClient, type SanityClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { projectId, dataset, apiVersion, useCdn } from '../../sanity/env'

// Si projectId est absent (avant configuration Vercel), on crée un client
// "stub" qui ne peut pas vraiment fetch. Toutes les fonctions ci-dessous
// retournent leur fallback grâce à safeFetch.
export const sanityClient: SanityClient = createClient({
  projectId: projectId || 'placeholder',
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
  asset: {
    _ref: string
    _type?: string
    // Populated only when the query explicitly dereferences the asset,
    // e.g. `image { ..., asset->{ metadata { dimensions } } }`.
    metadata?: {
      dimensions?: {
        width: number
        height: number
        aspectRatio: number
      }
    }
  }
  alt?: string
  hotspot?: { x: number; y: number; height: number; width: number }
}

export type SanityCategory = {
  _id: string
  name: string
  slug: { current: string }
  description?: string
  image?: SanityImage
  variants?: string[]
  order?: number
  parent?: { _id: string; name: string; slug: { current: string } } | null
  children?: SanityCategory[]
}

export type SanityProduct = {
  _id: string
  name: string
  slug: { current: string }
  status: 'draft' | 'published' | 'sold' | 'archived'
  shortDescription?: string
  description?: unknown[] // PortableText
  price: number
  salePrice?: number
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
  featuredOrder?: number
  exception?: boolean
  exceptionOrder?: number
  seo?: { metaTitle?: string; metaDescription?: string }
  _createdAt: string
  _updatedAt: string
}

// ───────────────────────── Queries GROQ ─────────────────────────

const PRODUCT_FIELDS = `
  _id, name, slug, status, shortDescription, description,
  price, salePrice, comparePrice, stock,
  images[]{_key, asset, alt, hotspot},
  category->{_id, name, slug, description, image, variants, order},
  brand, condition,
  widthCm, depthCm, heightCm,
  material, color, sku, featured, featuredOrder, exception, exceptionOrder,
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
 * Produits liés (cross-sell) — 4 pièces de la même catégorie,
 * en excluant le produit courant. Utilisé sur la fiche produit
 * pour renforcer le maillage interne et la profondeur de session.
 * Fallback : les 4 derniers publiés si la catégorie est vide.
 */
export async function getRelatedProducts(
  currentSlug: string,
  categorySlug: string | undefined,
  limit: number = 4,
): Promise<SanityProduct[]> {
  if (!categorySlug) {
    return safeFetch<SanityProduct[]>(
      `*[_type == "product" && status == "published" && slug.current != $slug]
         | order(_createdAt desc) [0...$limit] { ${PRODUCT_FIELDS} }`,
      { slug: currentSlug, limit },
      [],
    )
  }
  // On tire 8 produits candidats de la catégorie puis on shuffle côté JS
  // (Sanity n'a pas de vrai random() ; l'ordre par date est trop stable).
  const pool = await safeFetch<SanityProduct[]>(
    `*[_type == "product" && status == "published"
        && category->slug.current == $cat
        && slug.current != $slug]
       | order(_createdAt desc) [0...8] { ${PRODUCT_FIELDS} }`,
    { cat: categorySlug, slug: currentSlug },
    [],
  )
  if (pool.length <= limit) return pool
  // Sélection déterministe (basée sur le hash du slug) pour rester
  // stable entre les rendus SSR/ISR.
  const seed = [...currentSlug].reduce((a, c) => a + c.charCodeAt(0), 0)
  const rotated = [...pool.slice(seed % pool.length), ...pool.slice(0, seed % pool.length)]
  return rotated.slice(0, limit)
}

/**
 * Produits "Featured" pour la home (curation Djamel via toggle featured).
 */
export async function getFeaturedProducts(limit: number = 6): Promise<SanityProduct[]> {
  return safeFetch<SanityProduct[]>(
    // Tri : d'abord par featuredOrder (1, 2, 3...) si défini, sinon par date.
    // coalesce(featuredOrder, 9999) → les produits sans ordre tombent à la fin.
    `*[_type == "product" && status == "published" && featured == true]
       | order(coalesce(featuredOrder, 9999) asc, _createdAt desc) [0...$limit] {
         ${PRODUCT_FIELDS}
       }`,
    { limit },
    [],
  )
}

/**
 * Pièces d'exception (section premium sur la home).
 * Curation Djamel via toggle "Pièce d'exception" sur le produit.
 * Indépendant du toggle "Mettre en avant" — un produit peut être les deux.
 */
export async function getExceptionProducts(limit: number = 3): Promise<SanityProduct[]> {
  return safeFetch<SanityProduct[]>(
    `*[_type == "product" && status == "published" && exception == true]
       | order(coalesce(exceptionOrder, 9999) asc, _createdAt desc) [0...$limit] {
         ${PRODUCT_FIELDS}
       }`,
    { limit },
    [],
  )
}

/**
 * Derniers arrivages (pour les pages locales).
 * Renvoie les N produits publiés les plus récents, indépendamment du
 * toggle "featured" — angle éditorial "voici ce qui est arrivé chez
 * nous cette semaine". Évite tout conflit avec la sélection home.
 */
export async function getLatestProducts(limit: number = 4): Promise<SanityProduct[]> {
  return safeFetch<SanityProduct[]>(
    `*[_type == "product" && status == "published"] | order(_createdAt desc) [0...$limit] { ${PRODUCT_FIELDS} }`,
    { limit },
    [],
  )
}

/**
 * Derniers produits d'une catégorie (et ses sous-catégories).
 * Utilisé pour les pages locales catégorie × ville. Exemple :
 *   /bureau-occasion-marseille → getLatestProductsByCategoryDeep('bureau', 4)
 *   → renvoie les 4 derniers bureaux (catégorie "bureau" ou enfants)
 */
export async function getLatestProductsByCategoryDeep(
  categorySlug: string,
  limit: number = 4,
): Promise<SanityProduct[]> {
  return safeFetch<SanityProduct[]>(
    `*[_type == "product" && status == "published" &&
      (category->slug.current == $slug || category->parent->slug.current == $slug)
    ] | order(_createdAt desc) [0...$limit] { ${PRODUCT_FIELDS} }`,
    { slug: categorySlug, limit },
    [],
  )
}

/**
 * Toutes les catégories regroupées en hiérarchie parent → enfants.
 * Utilisé pour le mega-menu du header.
 */
export type CategoryGroup = {
  parent: SanityCategory
  children: SanityCategory[]
}

export async function getCategoryHierarchy(): Promise<CategoryGroup[]> {
  const all = await getAllCategories()
  if (all.length === 0) return []
  const parents = all.filter((c) => !c.parent)
  const childrenByParentId = new Map<string, SanityCategory[]>()
  for (const c of all) {
    if (c.parent?._id) {
      const list = childrenByParentId.get(c.parent._id) || []
      list.push(c)
      childrenByParentId.set(c.parent._id, list)
    }
  }
  return parents.map((p) => ({
    parent: p,
    children: (childrenByParentId.get(p._id) || []).sort(
      (a, b) => (a.order ?? 999) - (b.order ?? 999),
    ),
  }))
}

/**
 * Catégorie + ses enfants directs (utile pour afficher les sous-catégories
 * sur une page locale parente, ex: bureau → bureau-droit, bench, assis-debout).
 */
export async function getCategoryChildren(parentSlug: string): Promise<SanityCategory[]> {
  return safeFetch<SanityCategory[]>(
    `*[_type == "category" && parent->slug.current == $slug] | order(order asc, name asc) {
      _id, name, slug, description, image, order
    }`,
    { slug: parentSlug },
    [],
  )
}

// ───────────────────────── Pages locales (SEO) ─────────────────────────

export type SanityLocalPage = {
  pageKey: string
  displayName?: string
  heroImage?: SanityImage
}

/**
 * Récupère le contenu Sanity d'une page locale par son pageKey.
 * Si le document n'existe pas (Djamel n'a rien créé) → renvoie un objet
 * vide, le composant React utilise alors ses fallbacks hardcodés.
 */
export async function getLocalPage(pageKey: string): Promise<SanityLocalPage> {
  const result = await safeFetch<SanityLocalPage | null>(
    `*[_type == "localPage" && pageKey == $pageKey][0] {
      pageKey, displayName, heroImage
    }`,
    { pageKey },
    null,
  )
  return result || { pageKey }
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
 * Toutes les catégories (avec leur parent éventuel).
 */
export async function getAllCategories(): Promise<SanityCategory[]> {
  return safeFetch<SanityCategory[]>(
    `*[_type == "category"] | order(order asc, name asc) {
      _id, name, slug, description, image, variants, order,
      parent->{_id, name, slug}
    }`,
    {},
    [],
  )
}

/**
 * Uniquement les catégories de premier niveau (sans parent) — pour la home.
 */
export async function getTopLevelCategories(): Promise<SanityCategory[]> {
  return safeFetch<SanityCategory[]>(
    `*[_type == "category" && !defined(parent)] | order(order asc, name asc) {
      _id, name, slug, description, image, variants, order
    }`,
    {},
    [],
  )
}

/**
 * Une catégorie par son slug + son parent + ses enfants éventuels.
 */
export async function getCategoryBySlugSanity(slug: string): Promise<SanityCategory | null> {
  return safeFetch<SanityCategory | null>(
    `*[_type == "category" && slug.current == $slug][0] {
      _id, name, slug, description, image, variants, order,
      parent->{_id, name, slug},
      "children": *[_type == "category" && parent._ref == ^._id] | order(order asc, name asc) {
        _id, name, slug, description, image, variants, order
      }
    }`,
    { slug },
    null,
  )
}

/**
 * Produits d'une catégorie ET de ses sous-catégories (agrégation).
 */
export async function getProductsByCategoryDeep(categorySlug: string): Promise<SanityProduct[]> {
  return safeFetch<SanityProduct[]>(
    `*[_type == "product" && status == "published" &&
      (category->slug.current == $slug || category->parent->slug.current == $slug)
    ] | order(_createdAt desc) { ${PRODUCT_FIELDS} }`,
    { slug: categorySlug },
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
 * Garantit de renvoyer un objet (jamais null) même si le document n'existe pas.
 */
export async function getSiteSettings(): Promise<SanitySiteSettings> {
  const result = await safeFetch<SanitySiteSettings | null>(
    `*[_type == "siteSettings"][0] {
      siteName, logoOnLight, logoOnDark, favicon,
      manifesteImage, lldSectionImage, showroomImage,
      lldHeroImage, rseHeroImage
    }`,
    {},
    null,
  )
  return result || {}
}

/**
 * Produit vedette pour le mega-menu (4e colonne du Catalogue).
 *
 * Priorité :
 *   1. Le produit explicitement sélectionné par Djamel dans
 *      Réglages → Navigation → Produit vedette du menu
 *   2. Fallback : dernier produit publié (le mega-menu reste vivant
 *      même si Djamel n'a rien configuré)
 *
 * Indépendant du toggle "Produit en avant" qui alimente la section
 * "Coups de cœur" de la home — pas de conflit entre les 2 zones.
 */
export async function getMenuShowcaseProduct(): Promise<SanityProduct | null> {
  const explicit = await safeFetch<SanityProduct | null>(
    `*[_type == "siteSettings"][0].menuShowcaseProduct->{ ${PRODUCT_FIELDS} }`,
    {},
    null,
  )
  if (explicit && explicit._id) return explicit

  const latest = await safeFetch<SanityProduct[]>(
    `*[_type == "product" && status == "published"] | order(_createdAt desc) [0...1] { ${PRODUCT_FIELDS} }`,
    {},
    [],
  )
  return latest[0] || null
}

// ───────────────────────── Charte qualité ─────────────────────────

export type SanityQualityCondition = {
  _key?: string
  code: 'new' | 'excellent' | 'very-good' | 'good' | 'fair'
  label: string
  pitch: string
  image?: SanityImage
  apparence?: string
  fonctionnel?: string
  garantie?: string
  pourQui?: string
}

export type SanityQualityStep = {
  _key?: string
  title: string
  description?: string
}

export type SanityQualityFaq = {
  _key?: string
  q: string
  a: string
}

export type SanityQualityGuide = {
  heroEyebrow?: string
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: SanityImage
  introText?: string
  conditions?: SanityQualityCondition[]
  processSteps?: SanityQualityStep[]
  warrantyTitle?: string
  warrantyIntro?: string
  warrantyCovered?: string[]
  warrantyNotCovered?: string[]
  faq?: SanityQualityFaq[]
}

export async function getQualityGuide(): Promise<SanityQualityGuide> {
  const result = await safeFetch<SanityQualityGuide | null>(
    `*[_type == "qualityGuide"][0] {
      heroEyebrow, heroTitle, heroSubtitle, heroImage,
      introText,
      conditions[]{ _key, code, label, pitch, image, apparence, fonctionnel, garantie, pourQui },
      processSteps[]{ _key, title, description },
      warrantyTitle, warrantyIntro, warrantyCovered, warrantyNotCovered,
      faq[]{ _key, q, a }
    }`,
    {},
    null,
  )
  return result || {}
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
  fullBanner?: boolean
  order?: number
  status: 'published' | 'draft'
}

/**
 * Slides du hero d'accueil (uniquement publiées, triées).
 */
export async function getHeroSlides(): Promise<SanityHeroSlide[]> {
  // On récupère les dimensions natives des assets pour connaître le
  // ratio réel de l'image — nécessaire au mode "bannière complète"
  // qui adapte le container au ratio de l'image (aucune coupure).
  return safeFetch<SanityHeroSlide[]>(
    `*[_type == "heroSlide" && status == "published"] | order(order asc) {
      _id, title, subtitle,
      image {
        ...,
        asset->{ _id, _type, metadata { dimensions { width, height, aspectRatio } } }
      },
      imageMobile {
        ...,
        asset->{ _id, _type, metadata { dimensions { width, height, aspectRatio } } }
      },
      ctaPrimaryLabel, ctaPrimaryHref, ctaSecondaryLabel, ctaSecondaryHref,
      textPosition, textColor, overlayOpacity, fullBanner, order, status
    }`,
    {},
    [],
  )
}
