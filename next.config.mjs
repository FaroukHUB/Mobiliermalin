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
