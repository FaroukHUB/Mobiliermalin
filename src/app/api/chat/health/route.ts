/**
 * GET /api/chat/health
 *
 * Vérifie que la clé GEMINI_API_KEY est présente côté serveur.
 * Utilisé pour valider la config Vercel après ajout de la variable
 * d'environnement.
 */

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY
  return NextResponse.json({
    ok: hasKey,
    hasKey,
    provider: 'google-gemini',
    model: 'gemini-2.5-flash',
    error: hasKey
      ? null
      : 'GEMINI_API_KEY absent — récupérer sur aistudio.google.com/apikey puis ajouter dans Vercel Env Vars, puis redéployer.',
  })
}
