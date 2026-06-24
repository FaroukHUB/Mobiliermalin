import { NextResponse, type NextRequest } from 'next/server'
import { sendEmail, isBrevoConfigured } from '@/lib/brevo'
import { LEGAL } from '@/lib/legal'

/**
 * Endpoint de traitement des demandes de rétractation.
 *
 * Conformité ordonnance n°2026-2 (19 juin 2026) :
 * - La fonction de rétractation doit être aussi accessible que la commande.
 * - Le consommateur dispose de 14 jours à compter de la réception du bien.
 * - L'exercice du droit est gratuit.
 *
 * Ce endpoint reçoit le formulaire, envoie un email horodaté à
 * mobiliermalin@gmail.com et un accusé de réception au consommateur
 * (preuve datée du recueil de la déclaration de rétractation).
 */

type RetractationPayload = {
  name?: string
  email?: string
  phone?: string
  address?: string
  orderNumber?: string
  orderDate?: string
  receptionDate?: string
  products?: string
  reason?: string
  confirm?: string | boolean
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

function nl2br(s: string): string {
  return escapeHtml(s).replace(/\n/g, '<br />')
}

export async function POST(req: NextRequest) {
  let data: RetractationPayload
  try {
    data = (await req.json()) as RetractationPayload
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const {
    name,
    email,
    phone,
    address,
    orderNumber,
    orderDate,
    receptionDate,
    products,
    reason,
    confirm,
  } = data

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }
  if (!orderNumber && !orderDate) {
    return NextResponse.json(
      { error: 'Numéro de commande ou date d\'achat requis' },
      { status: 400 },
    )
  }
  if (!products || products.trim().length < 3) {
    return NextResponse.json(
      { error: 'Produits à retourner requis' },
      { status: 400 },
    )
  }
  if (!confirm) {
    return NextResponse.json(
      { error: 'Vous devez confirmer votre volonté de rétractation' },
      { status: 400 },
    )
  }

  const submittedAt = new Date()
  const submittedDisplay = submittedAt.toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  })

  // ─── Email à l'admin (Djamel) ───
  const adminSubject = `[Rétractation] ${name} — commande ${orderNumber || orderDate}`

  const adminHtml = `
<!doctype html>
<html lang="fr">
<head><meta charset="utf-8" /></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#FAF9F6;padding:24px;color:#1A1A1A;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E3DE;padding:32px;">
    <p style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#C0392B;margin:0 0 8px;font-weight:600;">Demande de rétractation</p>
    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#1A1A1A;margin:0 0 8px;">${escapeHtml(name)}</h1>
    <p style="font-size:13px;color:#6B6B6B;margin:0 0 24px;">Reçue le ${escapeHtml(submittedDisplay)}</p>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#6B6B6B;width:160px;">Email</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#B8964D;">${escapeHtml(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#6B6B6B;">Téléphone</td><td style="padding:8px 0;"><a href="tel:${escapeHtml(phone)}" style="color:#B8964D;">${escapeHtml(phone)}</a></td></tr>` : ''}
      ${address ? `<tr><td style="padding:8px 0;color:#6B6B6B;vertical-align:top;">Adresse</td><td style="padding:8px 0;color:#1A1A1A;">${nl2br(address)}</td></tr>` : ''}
      ${orderNumber ? `<tr><td style="padding:8px 0;color:#6B6B6B;">N° commande</td><td style="padding:8px 0;color:#1A1A1A;font-weight:500;">${escapeHtml(orderNumber)}</td></tr>` : ''}
      ${orderDate ? `<tr><td style="padding:8px 0;color:#6B6B6B;">Date commande</td><td style="padding:8px 0;color:#1A1A1A;">${escapeHtml(orderDate)}</td></tr>` : ''}
      ${receptionDate ? `<tr><td style="padding:8px 0;color:#6B6B6B;">Date réception</td><td style="padding:8px 0;color:#1A1A1A;">${escapeHtml(receptionDate)}</td></tr>` : ''}
    </table>

    <hr style="border:none;border-top:1px solid #E5E3DE;margin:24px 0;" />
    <p style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#6B6B6B;margin:0 0 8px;">Produits à retourner</p>
    <p style="font-size:14px;color:#1A1A1A;line-height:1.7;margin:0;">${nl2br(products)}</p>

    ${
      reason
        ? `<hr style="border:none;border-top:1px solid #E5E3DE;margin:24px 0;" /><p style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#6B6B6B;margin:0 0 8px;">Motif (facultatif)</p><p style="font-size:14px;color:#1A1A1A;line-height:1.7;margin:0;">${nl2br(reason)}</p>`
        : ''
    }

    <div style="margin-top:32px;padding:16px;background:#FAF7F2;border-left:3px solid #B89A5B;font-size:13px;color:#3D3D3D;line-height:1.6;">
      <strong>Procédure légale :</strong> accusez réception sous 24 h. Le client doit
      renvoyer le produit sous 14 jours. Vous disposez de 14 jours après réception
      du retour (ou preuve d'envoi) pour rembourser l'intégralité des sommes versées,
      y compris les frais de livraison standard.
    </div>
  </div>
</body>
</html>
`.trim()

  // ─── Accusé de réception au client (preuve horodatée) ───
  const customerSubject = 'Votre demande de rétractation a bien été reçue'

  const customerHtml = `
<!doctype html>
<html lang="fr">
<head><meta charset="utf-8" /></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#FAF9F6;padding:24px;color:#1A1A1A;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E5E3DE;padding:32px;">
    <p style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#B8964D;margin:0 0 8px;">Accusé de réception</p>
    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#1A1A1A;margin:0 0 16px;">Votre demande de rétractation est bien enregistrée</h1>

    <p style="font-size:15px;color:#3D3D3D;line-height:1.7;">Bonjour ${escapeHtml(name)},</p>

    <p style="font-size:15px;color:#3D3D3D;line-height:1.7;">
      Nous avons bien reçu votre demande de rétractation enregistrée le
      <strong>${escapeHtml(submittedDisplay)}</strong>.
    </p>

    <div style="margin:24px 0;padding:16px;background:#FAF7F2;border-left:3px solid #B89A5B;font-size:14px;color:#3D3D3D;line-height:1.7;">
      <p style="margin:0 0 8px;"><strong>Récapitulatif</strong></p>
      ${orderNumber ? `<p style="margin:4px 0;">Commande n° ${escapeHtml(orderNumber)}</p>` : ''}
      ${orderDate ? `<p style="margin:4px 0;">Achat du ${escapeHtml(orderDate)}</p>` : ''}
      ${receptionDate ? `<p style="margin:4px 0;">Reçu le ${escapeHtml(receptionDate)}</p>` : ''}
      <p style="margin:8px 0 0;"><strong>Produits :</strong><br />${nl2br(products)}</p>
    </div>

    <p style="font-size:15px;color:#3D3D3D;line-height:1.7;"><strong>Prochaines étapes :</strong></p>
    <ol style="font-size:14px;color:#3D3D3D;line-height:1.8;padding-left:20px;">
      <li>Nous vous recontactons sous 24 h ouvrées pour organiser le retour.</li>
      <li>Vous disposez de 14 jours à compter de la réception du bien pour nous le renvoyer.</li>
      <li>Une fois le produit reçu (ou la preuve d'envoi fournie), nous vous remboursons l'intégralité des sommes versées sous 14 jours.</li>
    </ol>

    <p style="font-size:14px;color:#6B6B6B;line-height:1.7;margin-top:24px;">
      Si vous avez la moindre question, répondez simplement à cet email ou
      appelez-nous au <a href="tel:${escapeHtml(LEGAL.telephoneTel)}" style="color:#B8964D;">${escapeHtml(LEGAL.telephone)}</a>.
    </p>

    <p style="font-size:14px;color:#3D3D3D;line-height:1.7;margin-top:24px;">
      L'équipe Mobilier Malin
    </p>

    <hr style="border:none;border-top:1px solid #E5E3DE;margin:24px 0;" />
    <p style="font-size:11px;color:#9A9A9A;line-height:1.6;margin:0;">
      Cet email constitue la preuve horodatée de votre demande de rétractation,
      conformément à l'article L221-21 du Code de la consommation et à
      l'ordonnance n°2026-2 du 19 juin 2026.
    </p>
  </div>
</body>
</html>
`.trim()

  if (isBrevoConfigured()) {
    // Email admin (priorité — si ça plante, on signale)
    const adminResult = await sendEmail({
      to: { email: LEGAL.email, name: 'Mobilier Malin' },
      subject: adminSubject,
      htmlContent: adminHtml,
      replyTo: { email, name },
      tags: ['retractation', 'compliance'],
    })

    if (!adminResult.ok) {
      console.error('[retractation] Brevo admin error:', adminResult.error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi. Merci de nous contacter directement.' },
        { status: 502 },
      )
    }

    // Accusé client (best-effort — on logge si ça échoue mais on retourne ok)
    const customerResult = await sendEmail({
      to: { email, name },
      subject: customerSubject,
      htmlContent: customerHtml,
      tags: ['retractation', 'customer-receipt'],
    })

    if (!customerResult.ok) {
      console.warn('[retractation] customer receipt failed:', customerResult.error)
    }
  } else {
    console.warn('[retractation] Brevo non configuré — demande non envoyée')
    console.log('[retractation] Nouvelle demande:', JSON.stringify(data, null, 2))
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
