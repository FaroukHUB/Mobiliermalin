import type { Metadata } from 'next'

/**
 * Layout pour les routes /admin/* : impose noindex pour que les
 * pages d'administration n'apparaissent jamais dans Google.
 * L'accès reste public mais chaque endpoint sous-jacent est
 * protégé par un secret.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
