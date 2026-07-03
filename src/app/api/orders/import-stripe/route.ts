/**
 * GET /api/orders/import-stripe?limit=100&secret=xxx
 *
 * Route d'admin protégée qui scanne les 100 dernières sessions Stripe
 * payées et crée un document `order` Sanity pour chacune qui n'a pas
 * encore le sien. Utile pour :
 *  - Rattraper les commandes reçues avant l'activation du webhook
 *  - Récupérer les commandes du bug "pickup_label manquant" (silencieux)
 *
 * Protection : query param `secret` doit matcher ADMIN_IMPORT_SECRET.
 * → À définir dans Vercel Env Vars. Sans ça, la route renvoie 401.
 *
 * Usage type :
 *   curl "https://mobiliermalin.com/api/orders/import-stripe?secret=xxx"
 *   → { "ok": true, "scanned": 42, "created": 3, "existing": 39 }
 */

import { NextResponse, type NextRequest } from 'next/server'
import { upsertOrderFromStripeSession } from '@/lib/order'
import { isSanityWriteConfigured } from '@/lib/sanity-write'

export const dynamic = 'force-dynamic'

const STRIPE_API = 'https://api.stripe.com/v1'

type StripeSession = {
  id?: string
  payment_status?: string
  metadata?: Record<string, string>
  amount_total?: number
  customer_email?: string
  created?: number
}

export async function GET(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const adminSecret = process.env.ADMIN_IMPORT_SECRET
  if (!stripeKey) {
    return NextResponse.json(
      { ok: false, error: 'STRIPE_SECRET_KEY absent' },
      { status: 503 },
    )
  }
  if (!adminSecret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'ADMIN_IMPORT_SECRET absent — définissez-le dans Vercel Env Vars pour activer cette route.',
      },
      { status: 503 },
    )
  }
  const url = new URL(req.url)
  const providedSecret = url.searchParams.get('secret')
  if (providedSecret !== adminSecret) {
    return NextResponse.json({ ok: false, error: 'Non autorisé' }, { status: 401 })
  }

  const limit = Math.min(100, Number(url.searchParams.get('limit')) || 100)

  // ─── Pré-checks pour aider le debug ───
  if (!isSanityWriteConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'SANITY_WRITE_TOKEN manquant dans Vercel Env Vars — sans lui, on ne peut pas créer de documents Sanity.',
        hint: 'Vercel Dashboard → Settings → Environment Variables → ajouter SANITY_WRITE_TOKEN (récupérer sur sanity.io/manage → API → Tokens → Editor)',
      },
      { status: 503 },
    )
  }

  // 1) Récupère les N dernières sessions Stripe
  const listRes = await fetch(
    `${STRIPE_API}/checkout/sessions?limit=${limit}`,
    { headers: { Authorization: `Bearer ${stripeKey}` } },
  )
  if (!listRes.ok) {
    const t = await listRes.text()
    return NextResponse.json(
      { ok: false, error: `Erreur Stripe API : ${t}` },
      { status: 502 },
    )
  }
  const list = (await listRes.json()) as { data: StripeSession[] }

  // 2) Filtre uniquement les paid
  const allStatuses: Record<string, number> = {}
  for (const s of list.data) {
    const st = s.payment_status || 'unknown'
    allStatuses[st] = (allStatuses[st] || 0) + 1
  }
  const paidSessions = list.data.filter((s) => s.payment_status === 'paid')

  // 3) Pour chaque paid, upsert dans Sanity (idempotent)
  const details: Array<{
    sessionId: string
    email?: string
    amount?: number
    date?: string
    result: 'created' | 'existing' | 'error'
    orderId?: string
    error?: string
  }> = []
  const results = {
    totalReturned: list.data.length,
    scanned: paidSessions.length,
    created: 0,
    existing: 0,
    errors: 0,
  }
  for (const session of paidSessions) {
    if (!session.id) continue
    // Récupère la session complète (pour avoir customer_details, line_items via expand)
    const fullRes = await fetch(
      `${STRIPE_API}/checkout/sessions/${session.id}`,
      { headers: { Authorization: `Bearer ${stripeKey}` } },
    )
    if (!fullRes.ok) {
      results.errors++
      details.push({
        sessionId: session.id,
        email: session.customer_email,
        amount: session.amount_total,
        date: session.created ? new Date(session.created * 1000).toISOString() : undefined,
        result: 'error',
        error: `Stripe API ${fullRes.status} sur session détaillée`,
      })
      continue
    }
    const fullSession = await fullRes.json()
    const result = await upsertOrderFromStripeSession(fullSession, stripeKey)
    if (!result.ok) {
      results.errors++
      details.push({
        sessionId: session.id,
        email: session.customer_email,
        amount: session.amount_total,
        date: session.created ? new Date(session.created * 1000).toISOString() : undefined,
        result: 'error',
        error: result.error,
      })
      continue
    }
    if (result.created) {
      results.created++
      details.push({
        sessionId: session.id,
        email: session.customer_email,
        amount: session.amount_total,
        date: session.created ? new Date(session.created * 1000).toISOString() : undefined,
        result: 'created',
        orderId: result.id,
      })
    } else {
      results.existing++
      details.push({
        sessionId: session.id,
        email: session.customer_email,
        amount: session.amount_total,
        date: session.created ? new Date(session.created * 1000).toISOString() : undefined,
        result: 'existing',
        orderId: result.id,
      })
    }
  }

  return NextResponse.json({
    ok: true,
    stripeStatusesBreakdown: allStatuses,
    ...results,
    details,
  })
}
