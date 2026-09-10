/**
 * Calcul des totaux d'un devis ou d'une facture, en un seul endroit.
 *
 * Avant ce module, chaque écran recalculait le total de son côté : le
 * PDF, la page client, le montant Stripe, le registre des ventes, le
 * tableau de bord. Une remise ajoutée à l'un et oubliée à l'autre, et
 * le client paie autre chose que ce qu'il a lu. Tous passent ici.
 *
 * Règles :
 *  - les prix stockés sont HT ; la TVA s'applique en fin de calcul
 *  - la remise porte sur les PRODUITS uniquement, jamais sur la
 *    livraison ni sur les prestations : on fait un geste sur le
 *    mobilier, pas sur le transport
 *  - en pourcentage (0 à 100) ou en euros HT ; en euros, elle est
 *    plafonnée au montant des produits, un total ne peut pas devenir
 *    négatif
 *  - l'acompte se calcule sur le total net TTC
 */

export type QuoteDiscount = {
  type?: 'percent' | 'amount'
  value?: number
  label?: string
}

export type QuoteTotalsInput = {
  lines: Array<{ unitPrice?: number; quantity?: number }>
  shippingFee?: number
  options?: Array<{ price?: number }>
  tvaRate?: number
  discount?: QuoteDiscount | null
  depositPercent?: number | null
}

export type QuoteTotals = {
  /** Produits avant remise, HT. */
  productsHt: number
  /** Montant de la remise, HT, positif (0 si aucune). */
  discountHt: number
  /** Produits après remise, HT. */
  productsNetHt: number
  shippingHt: number
  optionsHt: number
  /** Base imposable : produits nets + livraison + options. */
  subtotalHt: number
  tvaAmount: number
  totalTtc: number
  /** Acompte TTC si un pourcentage est défini, sinon null. */
  depositTtc: number | null
  /** Solde TTC après acompte, ou le total si pas d'acompte. */
  balanceTtc: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Une remise compte si elle a un type et une valeur strictement positive. */
export function hasDiscount(d?: QuoteDiscount | null): d is Required<Pick<QuoteDiscount, 'type' | 'value'>> & QuoteDiscount {
  return !!d && (d.type === 'percent' || d.type === 'amount') && typeof d.value === 'number' && d.value > 0
}

/** Montant HT de la remise pour un total produits donné. */
export function computeDiscountHt(productsHt: number, d?: QuoteDiscount | null): number {
  if (!hasDiscount(d) || productsHt <= 0) return 0
  if (d.type === 'percent') {
    const pct = Math.min(100, d.value)
    return round2(productsHt * (pct / 100))
  }
  return round2(Math.min(productsHt, d.value))
}

/**
 * Libellé de la ligne de remise sur les documents.
 * Ex : « Remise fidélité (10 %) », « Geste commercial », « Remise ».
 */
export function discountLineLabel(d?: QuoteDiscount | null): string {
  if (!hasDiscount(d)) return ''
  const base = d.label?.trim() || 'Remise'
  if (d.type === 'percent') {
    const pct = Math.min(100, d.value)
    const pctStr = pct.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
    return `${base} (${pctStr} %)`
  }
  return base
}

export function computeQuoteTotals(input: QuoteTotalsInput): QuoteTotals {
  const productsHt = input.lines.reduce(
    (s, l) => s + (l?.unitPrice ?? 0) * (l?.quantity ?? 1),
    0,
  )
  const discountHt = computeDiscountHt(productsHt, input.discount)
  const productsNetHt = productsHt - discountHt
  const shippingHt = input.shippingFee ?? 0
  const optionsHt = (input.options || []).reduce((s, o) => s + (o?.price ?? 0), 0)
  const subtotalHt = productsNetHt + shippingHt + optionsHt
  const tvaRate = input.tvaRate ?? 20
  const tvaAmount = subtotalHt * (tvaRate / 100)
  const totalTtc = subtotalHt + tvaAmount

  const pct = input.depositPercent
  const hasDeposit = typeof pct === 'number' && pct >= 1 && pct <= 99
  const depositTtc = hasDeposit ? round2(totalTtc * (pct / 100)) : null
  const balanceTtc = depositTtc === null ? totalTtc : round2(totalTtc - depositTtc)

  return {
    productsHt,
    discountHt,
    productsNetHt,
    shippingHt,
    optionsHt,
    subtotalHt,
    tvaAmount,
    totalTtc,
    depositTtc,
    balanceTtc,
  }
}
