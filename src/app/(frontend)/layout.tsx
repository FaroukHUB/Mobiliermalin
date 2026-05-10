import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { OrganizationSchema } from '@/components/seo/OrganizationSchema'
import { getSiteSettings } from '@/lib/site-settings'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Mobilier Malin — Mobilier de bureau d\'exception, à −60 %',
    template: '%s | Mobilier Malin',
  },
  description:
    'Mobilier de bureau reconditionné premium : Steelcase, Herman Miller, Haworth, Vitra. Garanti 6 mois, livraison Marseille, Aubagne, Aix-en-Provence et toute la France. Vidage de locaux professionnel.',
  keywords: [
    'mobilier bureau reconditionné',
    'mobilier bureau occasion',
    'fauteuil ergonomique reconditionné',
    'bureau professionnel reconditionné',
    'Steelcase occasion',
    'Herman Miller reconditionné',
    'mobilier bureau Marseille',
    'mobilier bureau Aubagne',
    'mobilier bureau Aix-en-Provence',
    'vidage locaux professionnels',
    'économie circulaire mobilier',
  ],
  authors: [{ name: 'Mobilier Malin' }],
  creator: 'Mobilier Malin',
  publisher: 'SARL 2 M',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'Mobilier Malin',
    title: 'Mobilier Malin — Mobilier de bureau d\'exception, à −60 %',
    description:
      'Steelcase, Herman Miller, Haworth, Vitra reconditionnés. Garantis 6 mois. Livraison France.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mobilier Malin — Mobilier de bureau reconditionné premium',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobilier Malin',
    description:
      'Mobilier de bureau d\'exception, reconditionné avec exigence. À −60 % du prix neuf.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
  },
  category: 'business',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF9F6',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()
  const logoOnLight = settings.logoOnLight?.url
    ? { url: settings.logoOnLight.url, alt: settings.logoOnLight.alt }
    : undefined
  const logoOnDark = settings.logoOnDark?.url
    ? { url: settings.logoOnDark.url, alt: settings.logoOnDark.alt }
    : undefined

  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:text-ivory focus:px-4 focus:py-2"
        >
          Aller au contenu
        </a>
        <Header logo={logoOnLight} />
        <main id="main">{children}</main>
        <Footer logo={logoOnDark} />
        <OrganizationSchema />
      </body>
    </html>
  )
}
