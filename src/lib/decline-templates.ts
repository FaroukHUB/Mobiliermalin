/**
 * Messages prédéfinis pour décliner une demande de devis.
 *
 * Trois motifs, trois textes. Chacun est un point de départ : dans
 * Studio, le message se relit et se modifie avant l'envoi. Ce fichier
 * est partagé entre le Studio (qui compose) et la route API (qui
 * envoie), pour que les deux parlent du même texte.
 *
 * Règles du site : vouvoiement, aucune promesse qui ne figure pas déjà
 * sur le site. Le retrait sur rendez-vous à La Penne-sur-Huveaune est
 * ce que la page devis affiche déjà.
 */

export type DeclineReason = 'no-model' | 'too-far' | 'partner' | 'other'

export const DECLINE_REASONS: Array<{ value: DeclineReason; title: string; hint: string }> = [
  {
    value: 'no-model',
    title: 'Modèle indisponible, proposer autre chose',
    hint: 'Nous n\'avons pas ce modèle, mais voici ce que nous pouvons proposer.',
  },
  {
    value: 'too-far',
    title: 'Trop loin pour livrer',
    hint: 'Hors de la zone desservie. Le retrait sur place reste possible.',
  },
  {
    value: 'partner',
    title: 'Orienter vers le confrère',
    hint: 'Donner les coordonnées du confrère, pour les demandes hors région.',
  },
  {
    value: 'other',
    title: 'Autre, message libre',
    hint: 'Vous écrivez le message vous-même.',
  },
]

export type DeclineContext = {
  /** Prénom ou nom du client, tel qu'il apparaît sur le devis. */
  customerName: string
  /** Ville de livraison du devis, si connue. */
  city?: string
  /** Modèle demandé (motif « modèle indisponible »). */
  requestedModel?: string
  /** Modèles proposés à la place, un par ligne. */
  proposedModels?: string[]
  /** Confrère (motif « orienter »). */
  partnerName?: string
  partnerPhone?: string
  partnerCity?: string
}

const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] || name

const SIGNATURE = 'Bien cordialement,\nL\'équipe Mobilier Malin'

/** Compose le texte brut du message pour un motif donné. */
export function buildDeclineMessage(reason: DeclineReason, ctx: DeclineContext): string {
  const hello = `Bonjour ${firstNameOf(ctx.customerName)},`

  if (reason === 'no-model') {
    const model = ctx.requestedModel?.trim() || 'ce modèle'
    const proposed = (ctx.proposedModels || []).map((m) => m.trim()).filter(Boolean)
    const lines = [
      hello,
      '',
      `Merci pour votre demande concernant ${model}. Nous n'avons malheureusement pas ce modèle en stock actuellement.`,
    ]
    if (proposed.length > 0) {
      lines.push('', 'En revanche, nous pouvons vous proposer :')
      for (const m of proposed) lines.push(`• ${m}`)
      lines.push(
        '',
        'Si l\'un d\'eux vous intéresse, répondez simplement à ce message ou appelez-nous : nous vous préparons un devis.',
      )
    } else {
      lines.push(
        '',
        'N\'hésitez pas à nous dire ce que vous recherchez : notre stock évolue chaque semaine et nous pouvons vous prévenir dès qu\'un modèle équivalent rentre.',
      )
    }
    lines.push('', SIGNATURE)
    return lines.join('\n')
  }

  if (reason === 'too-far') {
    const where = ctx.city ? ` (${ctx.city})` : ''
    return [
      hello,
      '',
      `Merci pour votre demande. Votre adresse de livraison${where} se situe malheureusement en dehors de la zone que nous desservons, et nous ne pouvons pas y donner suite.`,
      '',
      'Le retrait sur place reste possible à notre atelier de La Penne-sur-Huveaune, sur rendez-vous, si cela vous convient.',
      '',
      SIGNATURE,
    ].join('\n')
  }

  if (reason === 'partner') {
    const name = ctx.partnerName?.trim()
    const city = ctx.partnerCity?.trim()
    const phone = ctx.partnerPhone?.trim()
    const who = name ? `notre confrère ${name}` : 'notre confrère'
    const based = city ? `, basé à ${city},` : ','
    const reach = phone ? ` au ${phone}` : ''
    return [
      hello,
      '',
      'Merci pour votre demande. Nous ne desservons malheureusement pas votre secteur.',
      '',
      `Nous vous invitons à contacter ${who}${based} qui pourra vous renseigner${reach}.`,
      '',
      SIGNATURE,
    ].join('\n')
  }

  return [hello, '', '', SIGNATURE].join('\n')
}

/** Objet du mail, sans tiret long. */
export function buildDeclineSubject(numero?: string): string {
  return numero ? `Mobilier Malin : votre demande ${numero}` : 'Mobilier Malin : votre demande'
}
