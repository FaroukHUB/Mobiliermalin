/**
 * Loader d'image Next.js custom.
 *
 * But : bypasser le proxy `/_next/image` de Vercel pour les images qui
 * sont déjà servies par un CDN qui fait le job (Sanity, Unsplash).
 * Économise le quota Vercel Image Optimization (1000 img/mois en plan
 * gratuit) et évite un bug connu sur les WEBP Sanity avec paramètres
 * `?rect=…&w=…&h=…&fit=crop`.
 *
 * Fonctionnement :
 * - URL Sanity CDN → renvoie l'URL Sanity avec la largeur demandée
 *   (Sanity ré-encode côté serveur : WEBP/AVIF, resize précis, cache CDN)
 * - URL Unsplash → renvoie l'URL Unsplash avec la largeur demandée
 * - Autre → renvoie tel quel (image locale, fallback)
 */

type LoaderProps = { src: string; width: number; quality?: number }

export default function imageLoader({
  src,
  width,
  quality,
}: LoaderProps): string {
  const q = quality ?? 75

  // ─── Sanity CDN ────────────────────────────────────────
  // Format attendu : https://cdn.sanity.io/images/{project}/{dataset}/{asset}.{ext}?rect=…&w=…&h=…&fit=…
  // On ajoute ou remplace `w` pour matcher la largeur demandée par le
  // <Image> (responsive srcset). `auto=format` laisse Sanity choisir
  // WEBP ou AVIF selon le navigateur.
  if (src.includes('cdn.sanity.io')) {
    try {
      const url = new URL(src)
      url.searchParams.set('w', String(width))
      url.searchParams.set('q', String(q))
      url.searchParams.set('auto', 'format')
      return url.toString()
    } catch {
      return src
    }
  }

  // ─── Unsplash ──────────────────────────────────────────
  // Format : https://images.unsplash.com/photo-xxx?w=…&q=…
  if (src.includes('images.unsplash.com')) {
    try {
      const url = new URL(src)
      url.searchParams.set('w', String(width))
      url.searchParams.set('q', String(q))
      url.searchParams.set('auto', 'format')
      return url.toString()
    } catch {
      return src
    }
  }

  // ─── Fallback ──────────────────────────────────────────
  // Image locale (/public) ou source non reconnue — on renvoie l'URL
  // telle quelle. Next.js accepte les URLs absolues comme relatives.
  return src
}
