/**
 * Client API Brevo (ex-Sendinblue) pour les emails transactionnels.
 * Tolérant de l'absence de clé API : si BREVO_API_KEY n'est pas configuré,
 * les fonctions retournent un succès neutre sans planter.
 */

const BREVO_API = 'https://api.brevo.com/v3/smtp/email'

type BrevoConfig = {
  apiKey: string
  senderEmail: string
  senderName: string
}

function getBrevoConfig(): BrevoConfig | null {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  if (!apiKey || !senderEmail) return null
  return {
    apiKey,
    senderEmail,
    senderName: process.env.BREVO_SENDER_NAME || 'Mobilier Malin',
  }
}

export function isBrevoConfigured(): boolean {
  return getBrevoConfig() !== null
}

export type SendEmailInput = {
  to: { email: string; name?: string }
  subject: string
  htmlContent: string
  replyTo?: { email: string; name?: string }
  tags?: string[]
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const config = getBrevoConfig()
  if (!config) return { ok: true } // pas configuré → on ne plante pas

  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: config.senderName, email: config.senderEmail },
        to: [input.to],
        subject: input.subject,
        htmlContent: input.htmlContent,
        replyTo: input.replyTo,
        tags: input.tags,
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.warn('[brevo] send failed', res.status, errText.slice(0, 300))
      return { ok: false, error: `Brevo API ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    console.warn('[brevo] send error', err)
    return { ok: false, error: 'Erreur réseau Brevo' }
  }
}

// ───────────────────────── Templates ─────────────────────────

const SHOWROOM_ADDRESS_LINE_1 = '18 chemin Noël Robion'
const SHOWROOM_ADDRESS_LINE_2 = '13821 La Penne-sur-Huveaune'
const SHOWROOM_PHONE_DISPLAY = '06 76 61 70 53'
const SHOWROOM_PHONE_TEL = '+33676617053'
const SHOWROOM_EMAIL = 'mobiliermalin@gmail.com'
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent(`${SHOWROOM_ADDRESS_LINE_1}, ${SHOWROOM_ADDRESS_LINE_2}`)

// Palette ivoire/or/encre alignée avec le site
const COLORS = {
  ivory: '#FAF7F2',
  ivoryDark: '#F0EBE3',
  ink: '#1A1A1A',
  inkSoft: '#3D3D3D',
  inkMute: '#6B6B6B',
  gold: '#B89A5B',
  goldDark: '#8A7340',
  line: '#E5E1D9',
}

function formatPrice(cents?: number): string {
  if (typeof cents !== 'number') return ''
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

export type PickupConfirmationInput = {
  customerName: string
  customerEmail: string
  productName: string
  amountCents?: number
  pickupLabel: string // ex: "jeudi 21 mai à 14:30"
}

export function renderPickupConfirmationHtml(input: PickupConfirmationInput): string {
  const { customerName, productName, amountCents, pickupLabel } = input
  const price = formatPrice(amountCents)
  const firstName = customerName.split(' ')[0] || customerName

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Confirmation de votre retrait</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.ivoryDark};font-family:Georgia,'Times New Roman',serif;color:${COLORS.ink};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.ivoryDark};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:${COLORS.ivory};border:1px solid ${COLORS.line};">

        <!-- Header noir -->
        <tr><td style="background:${COLORS.ink};color:${COLORS.ivory};padding:32px 32px 28px;text-align:center;">
          <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${COLORS.gold};margin-bottom:8px;font-family:'Helvetica Neue',Arial,sans-serif;">Mobilier Malin</div>
          <h1 style="margin:0;font-size:26px;line-height:1.2;font-weight:normal;letter-spacing:-0.5px;">Votre retrait est confirmé</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${COLORS.inkSoft};font-family:'Helvetica Neue',Arial,sans-serif;">
            Bonjour ${escapeHtml(firstName)},
          </p>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${COLORS.inkSoft};font-family:'Helvetica Neue',Arial,sans-serif;">
            Merci pour votre confiance. Votre paiement${price ? ` de <strong style="color:${COLORS.ink}">${price}</strong>` : ''} a bien été reçu et votre créneau de retrait est réservé.
          </p>

          <!-- Carte créneau -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLORS.ivoryDark};border-left:3px solid ${COLORS.gold};margin:0 0 24px;">
            <tr><td style="padding:20px 24px;">
              <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.inkMute};margin-bottom:6px;font-family:'Helvetica Neue',Arial,sans-serif;">Votre créneau</div>
              <div style="font-size:20px;color:${COLORS.ink};text-transform:capitalize;line-height:1.3;">${escapeHtml(pickupLabel)}</div>
              <div style="font-size:13px;color:${COLORS.inkMute};margin-top:8px;font-family:'Helvetica Neue',Arial,sans-serif;">Produit : ${escapeHtml(productName)}</div>
            </td></tr>
          </table>

          <!-- Adresse -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
            <tr><td>
              <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.inkMute};margin-bottom:6px;font-family:'Helvetica Neue',Arial,sans-serif;">Adresse du showroom</div>
              <div style="font-size:17px;color:${COLORS.ink};line-height:1.4;">
                ${SHOWROOM_ADDRESS_LINE_1}<br />
                ${SHOWROOM_ADDRESS_LINE_2}
              </div>
              <a href="${MAPS_URL}" style="display:inline-block;margin-top:10px;font-size:13px;color:${COLORS.goldDark};text-decoration:underline;font-family:'Helvetica Neue',Arial,sans-serif;">Voir sur Google Maps →</a>
            </td></tr>
          </table>

          <hr style="border:none;border-top:1px solid ${COLORS.line};margin:24px 0;" />

          <!-- Checklist -->
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.inkMute};margin-bottom:12px;font-family:'Helvetica Neue',Arial,sans-serif;">Le jour J</div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:${COLORS.inkSoft};line-height:1.6;">
            <tr><td style="padding:4px 0;">• Présentez-vous à l'adresse ci-dessus à l'heure réservée.</td></tr>
            <tr><td style="padding:4px 0;">• Munissez-vous d'une <strong style="color:${COLORS.ink}">pièce d'identité</strong> et de votre <strong style="color:${COLORS.ink}">numéro de commande</strong>.</td></tr>
            <tr><td style="padding:4px 0;">• Prévoyez un véhicule adapté au gabarit du mobilier.</td></tr>
            <tr><td style="padding:4px 0;">• Pour modifier ou annuler le créneau, appelez-nous au moins <strong style="color:${COLORS.ink}">24 h à l'avance</strong>.</td></tr>
          </table>

          <hr style="border:none;border-top:1px solid ${COLORS.line};margin:24px 0;" />

          <!-- Contact -->
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.inkMute};margin-bottom:12px;font-family:'Helvetica Neue',Arial,sans-serif;">Une question ?</div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:${COLORS.inkSoft};">
            <tr>
              <td style="padding:4px 0;">📞 <a href="tel:${SHOWROOM_PHONE_TEL}" style="color:${COLORS.ink};text-decoration:none;">${SHOWROOM_PHONE_DISPLAY}</a></td>
            </tr>
            <tr>
              <td style="padding:4px 0;">✉️ <a href="mailto:${SHOWROOM_EMAIL}" style="color:${COLORS.ink};text-decoration:none;">${SHOWROOM_EMAIL}</a></td>
            </tr>
            <tr>
              <td style="padding:4px 0;">🕐 Lundi — Samedi, 10 h — 18 h</td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:${COLORS.ivoryDark};padding:20px 32px;text-align:center;font-size:11px;color:${COLORS.inkMute};font-family:'Helvetica Neue',Arial,sans-serif;letter-spacing:0.5px;">
          Mobilier Malin · Mobilier de bureau reconditionné · ${SHOWROOM_ADDRESS_LINE_2}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export type PickupCancellationInput = {
  customerName: string
  pickupLabel: string
  reason?: string
}

export function renderPickupCancellationHtml(input: PickupCancellationInput): string {
  const { customerName, pickupLabel, reason } = input
  const firstName = customerName.split(' ')[0] || customerName

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${COLORS.ivoryDark};font-family:Georgia,serif;color:${COLORS.ink};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:${COLORS.ivory};border:1px solid ${COLORS.line};">
        <tr><td style="background:${COLORS.ink};color:${COLORS.ivory};padding:32px;text-align:center;">
          <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${COLORS.gold};margin-bottom:8px;font-family:'Helvetica Neue',Arial,sans-serif;">Mobilier Malin</div>
          <h1 style="margin:0;font-size:24px;font-weight:normal;">Créneau de retrait annulé</h1>
        </td></tr>
        <tr><td style="padding:32px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.inkSoft};">
          <p style="margin:0 0 16px;">Bonjour ${escapeHtml(firstName)},</p>
          <p style="margin:0 0 16px;">Votre créneau de retrait du <strong style="color:${COLORS.ink};text-transform:capitalize;">${escapeHtml(pickupLabel)}</strong> a été annulé${reason ? ` : ${escapeHtml(reason)}` : ''}.</p>
          <p style="margin:0 0 24px;">Le créneau est de nouveau disponible à la réservation. Si c'est une erreur ou si vous souhaitez reprendre rendez-vous, contactez-nous au <a href="tel:${SHOWROOM_PHONE_TEL}" style="color:${COLORS.goldDark};">${SHOWROOM_PHONE_DISPLAY}</a> ou répondez simplement à cet email.</p>
          <p style="margin:0;color:${COLORS.inkMute};font-size:13px;">L'équipe Mobilier Malin</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
