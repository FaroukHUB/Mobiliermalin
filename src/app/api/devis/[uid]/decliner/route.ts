import { NextResponse, type NextRequest } from 'next/server'
import { getWriteClient, isSanityWriteConfigured } from '@/lib/sanity-write'
import { sanityClient } from '@/lib/sanity'
import { sendEmail } from '@/lib/brevo'
import { LEGAL } from '@/lib/legal'
import {
  buildDeclineSubject,
  DECLINE_REASONS,
  type DeclineReason,
} from '@/lib/decline-templates'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/devis/[uid]/decliner
 *
 * Décline une demande de devis : envoie au client le message composé
 * dans Studio, puis passe le devis au statut « declined » en gardant
 * le motif et le texte envoyé. Un devis décliné ne peut plus être
 * accepté ni payé depuis son lien.
 *
 * Sécurité : même clé partagée DEVIS_ACTION_SECRET que l'envoi de devis.
 *
 * Body : { reason: DeclineReason, message: string }
 *   message = texte brut, tel que relu dans Studio. Les lignes
 *   commençant par « • » deviennent une liste dans le mail.
 */

type QuoteDoc = {
  _id: string
  numero?: string
  status?: string
  customer?: { name?: string; email?: string }
}

const REASON_VALUES = new Set<string>(DECLINE_REASONS.map((r) => r.value))

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Texte brut → HTML du mail. Paragraphes séparés par une ligne vide,
 * puces « • » regroupées en liste.
 */
function messageToHtml(message: string): string {
  const blocks = message.replace(/\r\n/g, '\n').trim().split(/\n{2,}/)
  return blocks
    .map((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
      const bullets = lines.filter((l) => l.startsWith('•'))
      if (bullets.length > 0 && bullets.length === lines.length) {
        return (
          '<ul style="margin:0 0 16px;padding-left:20px;">' +
          bullets
            .map((l) => `<li style="margin:0 0 6px;">${escapeHtml(l.replace(/^•\s*/, ''))}</li>`)
            .join('') +
          '</ul>'
        )
      }
      return `<p style="margin:0 0 16px;">${lines.map(escapeHtml).join('<br>')}</p>`
    })
    .join('')
}

function renderDeclineHtml(input: { numero?: string; message: string }): string {
  const { numero, message } = input
  return `<!DOCTYPE html>
<html lang="fr"><body style="margin:0;padding:0;background:#F0EBE3;font-family:Georgia,serif;color:#1a1a1a;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:32px 16px;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:#FAF7F2;border:1px solid #e5e1d9;">
<tr><td style="background:#1a1a1a;color:#FAF7F2;padding:32px;text-align:center;">
<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#B89A5B;font-family:'Helvetica Neue',Arial,sans-serif;">Mobilier Malin</div>
<h1 style="margin:8px 0 0;font-size:24px;font-weight:normal;">Votre demande</h1>
${numero ? `<div style="margin-top:8px;font-size:14px;opacity:0.8;">${escapeHtml(numero)}</div>` : ''}
</td></tr>
<tr><td style="padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#3D3D3D;">
${messageToHtml(message)}
<hr style="border:none;border-top:1px solid #e5e1d9;margin:24px 0;">
<p style="margin:0 0 8px;font-size:13px;color:#6B6B6B;">Pour nous joindre</p>
<p style="margin:0;font-size:14px;">📞 <a href="tel:${LEGAL.telephoneTel}" style="color:#1a1a1a;">${LEGAL.telephone}</a> · ✉️ <a href="mailto:${LEGAL.email}" style="color:#1a1a1a;">${LEGAL.email}</a></p>
</td></tr>
</table></td></tr></table></body></html>`
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const secret = process.env.DEVIS_ACTION_SECRET
  if (secret) {
    const provided = req.headers.get('x-devis-secret')
    if (provided !== secret) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
  }

  const { uid } = await params
  const body = (await req.json().catch(() => ({}))) as {
    reason?: string
    message?: string
  }

  const reason = body.reason || ''
  const message = (body.message || '').trim()
  if (!REASON_VALUES.has(reason)) {
    return NextResponse.json({ error: 'Motif invalide.' }, { status: 400 })
  }
  if (message.length < 20) {
    return NextResponse.json({ error: 'Le message est vide ou trop court.' }, { status: 400 })
  }

  const quote = await sanityClient.fetch<QuoteDoc | null>(
    `*[_type == "quote" && _id == $id][0]{ _id, numero, status, customer{ name, email } }`,
    { id: uid },
  )
  if (!quote) {
    return NextResponse.json({ error: 'Devis introuvable.' }, { status: 404 })
  }
  if (quote.status === 'accepted') {
    return NextResponse.json(
      { error: 'Ce devis est accepté et payé : il ne peut pas être décliné.' },
      { status: 409 },
    )
  }
  const email = quote.customer?.email
  if (!email) {
    return NextResponse.json({ error: 'Ce devis n\'a pas d\'adresse e-mail client.' }, { status: 400 })
  }

  // 1) Le mail au client
  const sent = await sendEmail({
    to: { email, name: quote.customer?.name || undefined },
    subject: buildDeclineSubject(quote.numero),
    htmlContent: renderDeclineHtml({ numero: quote.numero, message }),
    tags: ['quote-declined'],
  })
  if (!sent.ok) {
    return NextResponse.json(
      { error: `Envoi impossible : ${sent.error || 'erreur Brevo'}` },
      { status: 502 },
    )
  }

  // 2) Le statut, avec la trace de ce qui a été dit
  if (isSanityWriteConfigured()) {
    try {
      await getWriteClient()!
        .patch(quote._id)
        .set({
          status: 'declined',
          declinedAt: new Date().toISOString(),
          declineReason: reason as DeclineReason,
          declineMessage: message,
        })
        .commit()
    } catch (err) {
      console.error('[devis/decliner] statut non mis à jour', err)
      return NextResponse.json(
        {
          ok: true,
          emailSent: true,
          warning: 'Mail envoyé, mais le statut n\'a pas pu être mis à jour. Passe-le à « Sans suite » à la main.',
        },
        { status: 200 },
      )
    }
  }

  return NextResponse.json({ ok: true, emailSent: true })
}
