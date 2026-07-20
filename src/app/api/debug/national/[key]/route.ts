import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from 'next-sanity'
import { getNationalLandingByKey } from '@/lib/sanity'
import { projectId, dataset, apiVersion } from '../../../../../../sanity/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Endpoint debug enrichi : teste plusieurs perspectives pour voir si
 * le doc existe en draft ou en publié, et par pageKey ou par _id.
 *
 * Usage : /api/debug/national/mobilier-de-bureau-occasion
 *
 * À supprimer une fois le bug identifié.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params
  const docId = `nationalLanding.${key}`

  // Client "raw" sans perspective : voit drafts + published
  const rawClient = createClient({
    projectId: projectId || 'placeholder',
    dataset,
    apiVersion,
    useCdn: false,
  })

  // Client "published" (celui de la prod)
  const pubClient = createClient({
    projectId: projectId || 'placeholder',
    dataset,
    apiVersion,
    useCdn: false,
    perspective: 'published',
  })

  const [landingViaHelper, allDocs, byIdRaw, byIdPub, byKeyRaw, byKeyPub] =
    await Promise.all([
      getNationalLandingByKey(key).catch((e) => ({ error: String(e) })),
      rawClient
        .fetch<Array<{ _id: string; pageKey?: string }>>(
          `*[_type == "nationalLandingPage"]{_id, pageKey}`,
        )
        .catch((e) => ({ error: String(e) })),
      rawClient
        .fetch(`*[_id == $id][0]{_id, pageKey, heroTitle}`, { id: docId })
        .catch((e) => ({ error: String(e) })),
      pubClient
        .fetch(`*[_id == $id][0]{_id, pageKey, heroTitle}`, { id: docId })
        .catch((e) => ({ error: String(e) })),
      rawClient
        .fetch(
          `*[_type == "nationalLandingPage" && pageKey == $key][0]{_id, pageKey, heroTitle}`,
          { key },
        )
        .catch((e) => ({ error: String(e) })),
      pubClient
        .fetch(
          `*[_type == "nationalLandingPage" && pageKey == $key][0]{_id, pageKey, heroTitle}`,
          { key },
        )
        .catch((e) => ({ error: String(e) })),
    ])

  return NextResponse.json(
    {
      env: {
        projectId: projectId || '(EMPTY)',
        dataset,
        apiVersion,
      },
      pageKey: key,
      docId,
      landingViaHelper,
      // Comparatifs pour localiser le bug
      allNationalDocsRaw: allDocs,
      byIdRaw,
      byIdPub,
      byKeyRaw,
      byKeyPub,
    },
    { headers: { 'cache-control': 'no-store' } },
  )
}
