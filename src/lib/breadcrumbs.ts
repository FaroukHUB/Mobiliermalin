/**
 * Helpers Breadcrumbs par silo — cocon sémantique.
 *
 * Chaque fonction retourne un tableau d'items prêt à passer au composant
 * <Breadcrumbs items={…} />. La position "Accueil" est ajoutée par le
 * composant lui-même, pas ici.
 *
 * Règles :
 *   - Chaque silo a son chemin canonique unique
 *   - Le dernier item (page courante) n'a pas de href
 *   - Slug de catégorie inchangé pendant Sprint 2
 */

import type { BreadcrumbItem } from '@/components/seo/Breadcrumbs'

// ─── Silo Produits ──────────────────────────────────────────
/**
 * Product breadcrumb :
 *   Accueil > Boutique > [Catégorie principale] > [Produit]
 * Utilise primaryCategory en priorité (fallback categories[0] ou category legacy).
 */
export function productBreadcrumb(product: {
  name: string
  slug: { current: string }
  primaryCategory?: { name: string; slug: { current: string } } | null
  categories?: Array<{ name: string; slug: { current: string } }>
  category?: { name: string; slug: { current: string } } | null
}): BreadcrumbItem[] {
  const canonicalCat =
    product.primaryCategory ||
    product.categories?.[0] ||
    product.category ||
    null

  const items: BreadcrumbItem[] = [{ name: 'Boutique', href: '/boutique' }]
  if (canonicalCat) {
    items.push({
      name: canonicalCat.name,
      href: `/categorie/${canonicalCat.slug.current}`,
    })
  }
  items.push({ name: product.name }) // dernier, pas de href
  return items
}

// ─── Silo Catégories ────────────────────────────────────────
/**
 * Category breadcrumb :
 *   Accueil > Boutique > [Catégorie parente?] > [Catégorie]
 */
export function categoryBreadcrumb(category: {
  name: string
  slug: { current: string }
  parent?: { name: string; slug: { current: string } } | null
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ name: 'Boutique', href: '/boutique' }]
  if (category.parent) {
    items.push({
      name: category.parent.name,
      href: `/categorie/${category.parent.slug.current}`,
    })
  }
  items.push({ name: category.name })
  return items
}

// ─── Silo Éditorial / Guides ────────────────────────────────
/**
 * Guides cluster breadcrumb :
 *   Accueil > Guides > [Cluster]
 */
export function guideClusterBreadcrumb(cluster: {
  name: string
  slug: { current: string }
}): BreadcrumbItem[] {
  return [{ name: 'Guides', href: '/guides' }, { name: cluster.name }]
}

/**
 * Guide article breadcrumb :
 *   Accueil > Guides > [Cluster] > [Article]
 */
export function guideArticleBreadcrumb(article: {
  title: string
  cluster: { name: string; slug: { current: string } }
}): BreadcrumbItem[] {
  return [
    { name: 'Guides', href: '/guides' },
    {
      name: article.cluster.name,
      href: `/guides/${article.cluster.slug.current}`,
    },
    { name: article.title },
  ]
}

// ─── Silo Blog magazine (existant) ──────────────────────────
/**
 * Blog article breadcrumb :
 *   Accueil > Blog > [Article]
 */
export function blogArticleBreadcrumb(article: {
  title: string
}): BreadcrumbItem[] {
  return [{ name: 'Blog', href: '/blog' }, { name: article.title }]
}

// ─── Silo Local / Zones desservies ──────────────────────────
/**
 * City page breadcrumb :
 *   Accueil > Zones desservies > [Ville]
 */
export function cityBreadcrumb(city: {
  name: string
  slug: string // ex: "bureau-occasion-marseille"
}): BreadcrumbItem[] {
  return [
    { name: 'Zones desservies', href: '/zones-desservies' },
    { name: city.name },
  ]
}

// ─── Silo Services ──────────────────────────────────────────
/**
 * Service page breadcrumb :
 *   Accueil > Services > [Service]
 */
export function serviceBreadcrumb(service: {
  name: string
}): BreadcrumbItem[] {
  return [{ name: 'Services', href: '/#services' }, { name: service.name }]
}
