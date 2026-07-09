/**
 * GET /api/chat/health
 *
 * Vérifie que la clé XAI_API_KEY est présente côté serveur.
 * Utilisé pour valider la config Vercel après ajout de la variable
 * d'environnement.
 */

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const hasKey = !!process.env.XAI_API_KEY
  return NextResponse.json({
    ok: hasKey,
    hasKey,
    provider: 'xai',
    model: 'grok-4-fast',
    error: hasKey ? null : 'XAI_API_KEY absent — ajouter dans Vercel Env Vars puis redéployer.',
  })
}
