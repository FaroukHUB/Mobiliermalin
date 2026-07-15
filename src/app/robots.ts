import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

/**
 * robots.txt — autorise tout sauf les routes privées/transactionnelles
 * et indique le sitemap dynamique.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // NB : /demander-devis et /panier ne sont PAS disallow ici.
        // Elles portent déjà `<meta name="robots" content="noindex,follow">`.
        // Bloquer via robots.txt empêcherait Googlebot de lire la meta
        // et laisserait ces URL en "indexée bien que bloquée".
        disallow: [
          '/api/',
          '/studio/',
          '/admin/',
          '/devis/',
          '/commande/',
          '/maintenance',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
