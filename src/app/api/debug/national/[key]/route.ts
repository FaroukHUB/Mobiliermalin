import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from 'next-sanity'
import { getNationalLandingByKey } from '@/lib/sanity'
import { projectId, dataset, apiVersion } from '../../../../../../sanity/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Debug enrichi : utilise SANITY_WRITE_TOKEN (si disponible côté serveur)
 * pour voir aussi les drafts. Compare avec le fetch public.
 *
 * À supprimer une fois le bug identifié.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params
  const docId = `nationalLanding.${key}`
  const draftDocId = `drafts.${docId}`

  const token = process.env.SANITY_WRITE_TOKEN

  // Client public (sans token, sans perspective) — voit uniquement publiés
  const publicClient = createClient({
    projectId: projectId || 'placeholder',
    dataset,
    apiVersion,
    useCdn: false,
  })

  // Client authentifié — voit publiés + drafts (si token dispo)
  const authClient = token
    ? createClient({
        projectId: projectId || 'placeholder',
        dataset,
        apiVersion,
        useCdn: false,
        token,
      })
    : null

  const [helperResult, publicAll, publicById, publicByKey, authAll, authById, authDraftById, authByKey] =
    await Promise.all([
      getNationalLandingByKey(key).then((v) => (v ? { _id: v._id, pageKey: v.pageKey } : null)).catch((e) => ({ error: String(e) })),
      publicClient.fetch<Array<{ _id: string; pageKey?: string }>>(`*[_type == "nationalLandingPage"]{_id, pageKey}`).catch((e) => ({ error: String(e) })),
      publicClient.fetch(`*[_id == $id][0]{_id, pageKey}`, { id: docId }).catch((e) => ({ error: String(e) })),
      publicClient.fetch(`*[_type == "nationalLandingPage" && pageKey == $key][0]{_id, pageKey}`, { key }).catch((e) => ({ error: String(e) })),
      authClient?.fetch<Array<{ _id: string; pageKey?: string }>>(`*[_type == "nationalLandingPage"]{_id, pageKey}`).catch((e) => ({ error: String(e) })) ?? null,
      authClient?.fetch(`*[_id == $id][0]{_id, pageKey}`, { id: docId }).catch((e) => ({ error: String(e) })) ?? null,
      authClient?.fetch(`*[_id == $id][0]{_id, pageKey}`, { id: draftDocId }).catch((e) => ({ error: String(e) })) ?? null,
      authClient?.fetch(`*[_type == "nationalLandingPage" && pageKey == $key][0]{_id, pageKey}`, { key }).catch((e) => ({ error: String(e) })) ?? null,
    ])

  return NextResponse.json(
    {
      env: { projectId, dataset, apiVersion, hasWriteToken: !!token },
      pageKey: key,
      publishedDocId: docId,
      draftDocId,
      // Résultats via le helper de la prod (perspective:'published')
      helperResult,
      // Vue "publique" (comme un lecteur non-authentifié)
      publicAll,
      publicById,
      publicByKey,
      // Vue "authentifiée" (voit drafts + published)
      authAll,
      authById,
      authDraftById,
      authByKey,
    },
    { headers: { 'cache-control': 'no-store' } },
  )
}
