import { NextResponse, type NextRequest } from 'next/server'

const BYPASS_COOKIE = 'mm-preview'
const BYPASS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 jours

// Chemins toujours autorisés (admin, API, assets, robots, sitemap, page maintenance elle-même)
const ALWAYS_ALLOW = [
  '/admin',
  '/api',
  '/maintenance',
  '/_next',
  '/favicon',
  '/robots.txt',
  '/sitemap.xml',
  '/media', // upload Payload
]

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  const bypassToken = process.env.MAINTENANCE_BYPASS_TOKEN

  // 1) Permettre la pose du cookie via ?bypass=TOKEN, peu importe le mode
  const incomingToken = searchParams.get('bypass')
  if (bypassToken && incomingToken && incomingToken === bypassToken) {
    const url = req.nextUrl.clone()
    url.searchParams.delete('bypass')
    const response = NextResponse.redirect(url)
    response.cookies.set(BYPASS_COOKIE, bypassToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: BYPASS_COOKIE_MAX_AGE,
      path: '/',
    })
    return response
  }

  // 2) Permettre la suppression via ?lock=1 (pour reverrouiller depuis ton navigateur)
  if (searchParams.get('lock') === '1') {
    const url = req.nextUrl.clone()
    url.pathname = '/maintenance'
    url.searchParams.delete('lock')
    const response = NextResponse.redirect(url)
    response.cookies.delete(BYPASS_COOKIE)
    return response
  }

  // 3) Si la maintenance n'est pas active, on laisse tout passer
  if (!maintenanceMode) {
    return NextResponse.next()
  }

  // 4) Toujours autoriser admin, API, assets, page maintenance elle-même
  if (ALWAYS_ALLOW.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // 5) Si le cookie de bypass est présent et valide, on laisse passer
  const cookie = req.cookies.get(BYPASS_COOKIE)?.value
  if (bypassToken && cookie === bypassToken) {
    return NextResponse.next()
  }

  // 6) Sinon : rewrite vers /maintenance (URL inchangée pour le visiteur)
  const url = req.nextUrl.clone()
  url.pathname = '/maintenance'
  return NextResponse.rewrite(url, { status: 503 })
}

export const config = {
  matcher: [
    // Tout sauf les fichiers Next internals et statiques
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)).*)',
  ],
}
