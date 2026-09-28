import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Rafraîchissement du site à la demande, appelé par un webhook Sanity.
 *
 * Sans cette route, la seule façon de voir une modification en ligne
 * était d'attendre l'expiration du cache, donc d'interroger Sanity en
 * boucle : c'est ce qui a fait sauter le quota de requêtes. Les pages
 * se rafraîchissent maintenant toutes les 15 minutes, et ce webhook
 * les rafraîchit immédiatement dès qu'un document change dans Studio.
 *
 * Configuration côté Sanity (Manage → API → Webhooks) :
 *  - URL : https://mobiliermalin.com/api/revalidate
 *  - Dataset : production, Trigger on : create, update, delete
 *  - HTTP method : POST
 *  - Headers : x-revalidate-secret = la valeur de SANITY_REVALIDATE_SECRET
 *
 * Le secret se définit dans les variables d'environnement Vercel. Sans
 * lui, la route refuse tout : elle purge le cache du site entier, elle
 * ne doit pas être appelable par n'importe qui.
 */

// Les trois familles de requêtes du site portent ces étiquettes (voir
// safeFetch dans src/lib/sanity.ts, sanity-blog.ts et sanity-guides.ts).
const TAGS = ['sanity-products', 'sanity-blog', 'sanity-guides']

export async function POST(req: NextRequest) {
  const expected = process.env.SANITY_REVALIDATE_SECRET
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'SANITY_REVALIDATE_SECRET non configuré' },
      { status: 503 },
    )
  }

  // Le secret voyage en en-tête, ou en paramètre d'URL pour les outils
  // qui ne savent pas envoyer d'en-tête personnalisé.
  const provided =
    req.headers.get('x-revalidate-secret') ||
    req.nextUrl.searchParams.get('secret')

  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: 'Secret invalide' }, { status: 401 })
  }

  for (const tag of TAGS) revalidateTag(tag)

  return NextResponse.json({
    ok: true,
    revalidated: TAGS,
    at: new Date().toISOString(),
  })
}
