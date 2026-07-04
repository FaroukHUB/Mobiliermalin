/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Loader custom → bypass du proxy `/_next/image` de Vercel pour les
    // images Sanity et Unsplash. Voir src/lib/image-loader.ts.
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  // Force la version canonique du domaine (non-www, https) pour éviter
  // toute duplication de contenu côté Google.
  async redirects() {
    return [
      // www.mobiliermalin.com/* → mobiliermalin.com/*
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.mobiliermalin.com' }],
        destination: 'https://mobiliermalin.com/:path*',
        permanent: true,
      },
      // Ancienne URL Marseille (raccourcie pour meilleur CTR / SEO)
      {
        source: '/mobilier-bureau-occasion-marseille',
        destination: '/bureau-occasion-marseille',
        permanent: true,
      },
      // ─────────────────────────────────────────────────────────────
      // 301 depuis les URL de l'ancien site WordPress toujours vues
      // par Google dans la Search Console. Objectif : rendre chaque
      // 404 utile (transmission du jus SEO vers la page équivalente).
      // ─────────────────────────────────────────────────────────────
      { source: '/accueil', destination: '/', permanent: true },
      { source: '/accueil/', destination: '/', permanent: true },
      {
        source: '/politique-de-confidentialite',
        destination: '/politique-confidentialite',
        permanent: true,
      },
      {
        source: '/politique-de-confidentialite/',
        destination: '/politique-confidentialite',
        permanent: true,
      },
      {
        source: '/mobilier-bureau-reconditionne-aix-en-provence',
        destination: '/bureau-occasion-aix-en-provence',
        permanent: true,
      },
      {
        source: '/mobilier-bureau-reconditionne-aix-en-provence/',
        destination: '/bureau-occasion-aix-en-provence',
        permanent: true,
      },
      // Autres slugs "reconditionné" possiblement crawlés par Google
      {
        source: '/mobilier-bureau-reconditionne-marseille',
        destination: '/bureau-occasion-marseille',
        permanent: true,
      },
      {
        source: '/mobilier-bureau-reconditionne-aubagne',
        destination: '/bureau-occasion-aubagne',
        permanent: true,
      },
      {
        source: '/mobilier-bureau-reconditionne-toulon',
        destination: '/bureau-occasion-toulon',
        permanent: true,
      },
      {
        source: '/mobilier-bureau-reconditionne-nice',
        destination: '/bureau-occasion-nice',
        permanent: true,
      },
      // Toute URL héritée WordPress (thème + wp-content / wp-includes)
      // → renvoyée sur l'accueil pour purger l'ancien index.
      {
        source: '/wp-content/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-includes/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/wp-json/:path*',
        destination: '/',
        permanent: true,
      },
      // Anciennes catégories / archives WP
      { source: '/category/:path*', destination: '/boutique', permanent: true },
      { source: '/product-category/:path*', destination: '/boutique', permanent: true },
      { source: '/product/:slug', destination: '/produit/:slug', permanent: true },
      { source: '/shop', destination: '/boutique', permanent: true },
      { source: '/shop/', destination: '/boutique', permanent: true },
    ]
  },
  // Sécurité + signal SEO : HSTS force https sur tous les liens
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
