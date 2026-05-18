import { NextResponse, type NextRequest } from 'next/server'
import { getAvailableSlots, isCalConfigured } from '@/lib/cal'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cal/availability?start=YYYY-MM-DD&end=YYYY-MM-DD
 *
 * Retourne :
 *   { configured: boolean, slots: ["2026-05-14T10:00:00+02:00", ...] }
 *
 * Si Cal n'est pas configuré (configured=false), le frontend doit
 * afficher tous les créneaux par défaut comme disponibles.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    return NextResponse.json({ error: 'Paramètres start/end (YYYY-MM-DD) requis' }, { status: 400 })
  }

  const configured = isCalConfigured()
  if (!configured) {
    return NextResponse.json({ configured: false, slots: [] })
  }

  const result = await getAvailableSlots(start, end)
  if (result === null) {
    return NextResponse.json({ configured: false, slots: [] })
  }
  if (!result.ok) {
    // On laisse passer en 200 pour ne pas casser le front, mais on remonte
    // le détail de l'erreur côté serveur (logs Vercel) ET dans la réponse
    // (debug temporaire — pour comprendre pourquoi Cal API échoue).
    return NextResponse.json({
      configured: true,
      slots: [],
      debug: {
        reason: result.reason,
        status: result.status,
        body: result.body,
      },
    })
  }

  return NextResponse.json({
    configured: true,
    slots: result.slots.map((s) => s.start),
  })
}
