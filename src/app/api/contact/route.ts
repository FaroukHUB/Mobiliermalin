import { NextResponse, type NextRequest } from 'next/server'

type ContactPayload = {
  name?: string
  company?: string
  email?: string
  phone?: string
  projectType?: string
  message?: string
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  achat: 'Achat de mobilier reconditionné',
  vidage: 'Vidage de locaux / reprise',
  mixte: 'Achat ET vidage',
  devis: 'Demande de devis détaillé',
  autre: 'Autre demande',
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(req: NextRequest) {
  let data: ContactPayload
  try {
    data = (await req.json()) as ContactPayload
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const { name, company, email, phone, projectType, message } = data

  // Validation minimale
  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }
  if (!projectType) {
    return NextResponse.json({ error: 'Type de projet requis' }, { status: 400 })
  }
  if (!message || message.trim().length < 10) {
    return NextResponse.json(
      { error: 'Message trop court (10 caractères minimum)' },
      { status: 400 },
    )
  }

  const projectLabel = PROJECT_TYPE_LABELS[projectType] || projectType
  const TO = 'mobiliermalin@gmail.com'
  const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@mobiliermalin.com'
  const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Mobilier Malin'

  const subject = `[Site] ${projectLabel} — ${name}`

  const textBody = `
Nouvelle demande depuis le site Mobilier Malin

Nom        : ${name}
Société    : ${company || '—'}
Email      : ${email}
Téléphone  : ${phone || '—'}
Projet     : ${projectLabel}

Message :
${message}

---
Envoyé le ${new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
`.trim()

  const htmlBody = `
<!doctype html>
<html lang="fr">
<head><meta charset="utf-8" /></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#FAF9F6;padding:24px;color:#1A1A1A;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E3DE;padding:32px;">
    <p style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#B8964D;margin:0 0 8px;">Nouvelle demande</p>
    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#1A1A1A;margin:0 0 24px;">${escapeHtml(projectLabel)}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6B6B6B;width:120px;">Nom</td><td style="padding:8px 0;color:#1A1A1A;font-weight:500;">${escapeHtml(name)}</td></tr>
      ${company ? `<tr><td style="padding:8px 0;color:#6B6B6B;">Société</td><td style="padding:8px 0;color:#1A1A1A;">${escapeHtml(company)}</td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#6B6B6B;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#B8964D;">${escapeHtml(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#6B6B6B;">Téléphone</td><td style="padding:8px 0;"><a href="tel:${escapeHtml(phone)}" style="color:#B8964D;">${escapeHtml(phone)}</a></td></tr>` : ''}
    </table>
    <hr style="border:none;border-top:1px solid #E5E3DE;margin:24px 0;" />
    <p style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#6B6B6B;margin:0 0 12px;">Message</p>
    <p style="font-size:14px;color:#2A2A2A;line-height:1.7;white-space:pre-wrap;margin:0;">${escapeHtml(message)}</p>
  </div>
  <p style="text-align:center;font-size:11px;color:#9A9A9A;margin-top:16px;">Envoyé depuis mobiliermalin.com · ${new Date().toLocaleDateString('fr-FR')}</p>
</body>
</html>
`

  // Tentative d'envoi via Resend si configuré, sinon log console
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_ADDRESS}>`,
          to: [TO],
          reply_to: email,
          subject,
          text: textBody,
          html: htmlBody,
        }),
      })
      if (!res.ok) {
        const errBody = await res.text()
        console.error('[contact] Resend error:', res.status, errBody)
        return NextResponse.json(
          { error: 'Erreur lors de l\'envoi de l\'email' },
          { status: 502 },
        )
      }
    } catch (err) {
      console.error('[contact] Resend fetch failed:', err)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 502 },
      )
    }
  } else {
    // Pas de service email configuré : log la demande pour qu'elle reste visible
    // dans les logs Vercel. À configurer Resend dès que possible pour la prod.
    console.warn('[contact] RESEND_API_KEY non configurée — message non envoyé')
    console.log('[contact] Nouveau message reçu:\n' + textBody)
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
