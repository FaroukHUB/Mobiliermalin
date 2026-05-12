/**
 * Root layout pour le Studio Sanity.
 * Pas de Header/Footer du site public ici — Sanity prend tout l'écran.
 */

export const metadata = {
  title: 'Mobilier Malin — Studio',
  robots: { index: false, follow: false },
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
