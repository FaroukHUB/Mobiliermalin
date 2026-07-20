import { NextResponse, type NextRequest } from 'next/server'
import { getNationalLandingByKey } from '@/lib/sanity'
import { projectId, dataset } from '../../../../../../sanity/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Endpoint debug : dump du résultat de getNationalLandingByKey pour
 * comprendre ce que Sanity retourne côté serveur en production.
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
  const landing = await getNationalLandingByKey(key)

  return NextResponse.json({
    env: {
      projectId: projectId || '(EMPTY)',
      dataset: dataset || '(EMPTY)',
      hasProjectId: !!projectId,
    },
    pageKey: key,
    landing: landing
      ? {
          _id: landing._id,
          pageKey: landing.pageKey,
          displayName: landing.displayName,
          heroEyebrow: landing.heroEyebrow,
          heroTitle: landing.heroTitle,
          hasBody: Array.isArray(landing.body) ? landing.body.length : 'not-array',
          hasTldr: !!landing.tldr,
          hasAuthor: landing.author,
          hasLastUpdated: landing.lastUpdated,
          keyStatsCount: landing.keyStats?.length ?? 0,
          audienceIntroCount: landing.audienceIntro?.length ?? 0,
          caseStudiesCount: landing.caseStudies?.length ?? 0,
          pricingRangesCount: landing.pricingRanges?.length ?? 0,
          deliveryTableCount: landing.deliveryTable?.length ?? 0,
          glossaryCount: landing.glossary?.length ?? 0,
          faqCount: landing.faq?.length ?? 0,
        }
      : null,
    landingRaw: landing,
  })
}
