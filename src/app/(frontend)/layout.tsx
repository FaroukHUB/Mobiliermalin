import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Mobilier Malin — Mobilier de bureau d\'occasion sélectionné',
    template: '%s — Mobilier Malin',
  },
  description:
    'Mobilier de bureau d\'occasion sélectionné avec exigence : économique, écologique et professionnel. Bureaux, fauteuils, rangements et plus.',
  keywords: [
    'mobilier bureau occasion',
    'bureau professionnel reconditionné',
    'fauteuil bureau occasion',
    'mobilier bureau seconde main',
    'économie circulaire mobilier',
  ],
  authors: [{ name: 'Mobilier Malin' }],
  creator: 'Mobilier Malin',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'Mobilier Malin',
    title: 'Mobilier Malin — Mobilier de bureau d\'occasion sélectionné',
    description:
      'Mobilier de bureau d\'occasion : économique, écologique, professionnel.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mobilier Malin',
    description:
      'Mobilier de bureau d\'occasion sélectionné avec exigence.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF9F6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
