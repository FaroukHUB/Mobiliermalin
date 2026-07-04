import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { OrganizationSchema } from '@/components/seo/OrganizationSchema'
import { CookieConsent } from '@/components/analytics/CookieConsent'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { CartProvider } from '@/lib/cart-context'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { getSiteSettings, getCategoryHierarchy, getMenuShowcaseProduct, urlFor } from '@/lib/sanity'
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  // Favicon dynamique depuis Sanity (settings.favicon) avec fallback statique
  const faviconUrl = settings.favicon
    ? urlFor(settings.favicon).width(64).height(64).format('png').url()
    : '/favicon.ico'
  const appleIconUrl = settings.favicon
    ? urlFor(settings.favicon).width(180).height(180).format('png').url()
    : '/apple-touch-icon.png'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: 'Mobilier de bureau d\'occasion reconditionné — Mobilier Malin',
      template: '%s | Mobilier Malin',
    },
    description:
      'Mobilier de bureau d\'occasion reconditionné : Steelcase, Herman Miller, Haworth, Vitra. Atelier & showroom à La Penne-sur-Huveaune, contrôle qualité 7 points, livraison Marseille & PACA.',
    keywords: [
      'mobilier de bureau d\'occasion',
      'mobilier bureau reconditionné',
      'mobilier bureau occasion Marseille',
      'mobilier bureau Aubagne',
      'meuble occasion Marseille',
      'fauteuil bureau occasion',
      'bureau occasion',
      'fauteuil ergonomique reconditionné',
      'Steelcase occasion',
      'Herman Miller reconditionné',
      'Haworth occasion',
      'Vitra reconditionné',
      'mobilier professionnel Marseille',
      'mobilier bureau Aix-en-Provence',
      'vidage locaux professionnels',
      'rachat mobilier entreprise',
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
      title: 'Mobilier de bureau d\'occasion reconditionné — Mobilier Malin',
      description:
        'Steelcase, Herman Miller, Haworth, Vitra reconditionnés. Atelier & showroom à La Penne-sur-Huveaune, contrôle qualité 7 points, livraison Marseille & PACA.',
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
      icon: faviconUrl,
      apple: appleIconUrl,
      shortcut: faviconUrl,
    },
    alternates: {
      canonical: '/',
    },
    category: 'business',
    // Vérifications de propriété de domaine (Google Search Console gérée
    // via DNS, Pinterest via balise meta, etc.).
    verification: {
      other: {
        'p:domain_verify': '5870a7e3aa42ad058aa00e27b4077d24',
      },
    },
  }
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
  const [settings, categoryHierarchy, menuProduct] = await Promise.all([
    getSiteSettings(),
    getCategoryHierarchy(),
    getMenuShowcaseProduct(),
  ])
  const logoLight = settings.logoOnLight
    ? { url: urlFor(settings.logoOnLight).height(160).url(), alt: settings.siteName || 'Mobilier Malin' }
    : undefined
  const logoDark = settings.logoOnDark
    ? { url: urlFor(settings.logoOnDark).height(200).url(), alt: settings.siteName || 'Mobilier Malin' }
    : undefined

  // Sérialise les catégories pour les passer au Header (client component)
  const menuCategories = categoryHierarchy.map(({ parent, children }) => ({
    id: parent._id,
    name: parent.name,
    slug: parent.slug.current,
    children: children.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug.current,
    })),
  }))

  // Produit à afficher dans la 4e colonne du mega-menu.
  // Priorité au produit sélectionné par Djamel dans Réglages →
  // Navigation → Produit vedette du menu. Si vide, fallback automatique
  // sur le dernier produit publié (lib/sanity.ts:getMenuShowcaseProduct).
  // → Aucun conflit avec le toggle "Produit en avant" qui pilote la
  // section "Coups de cœur" de la home.
  const menuShowcase = menuProduct
    ? {
        slug: menuProduct.slug.current,
        name: menuProduct.name,
        brand: menuProduct.brand,
        condition: menuProduct.condition,
        price: menuProduct.price,
        salePrice: menuProduct.salePrice,
        imageUrl: menuProduct.images?.[0]
          ? urlFor(menuProduct.images[0]).width(600).height(750).fit('crop').url()
          : null,
        imageAlt: menuProduct.images?.[0]?.alt || menuProduct.name,
      }
    : null

  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <GoogleAnalytics />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:text-ivory focus:px-4 focus:py-2"
        >
          Aller au contenu
        </a>
        <CartProvider>
          <Header logo={logoLight} categories={menuCategories} showcase={menuShowcase} />
          <main id="main">{children}</main>
          <Footer logo={logoDark} />
        </CartProvider>
        <WhatsAppButton />
        <OrganizationSchema />
        <CookieConsent />
      </body>
    </html>
  )
}
