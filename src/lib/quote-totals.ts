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
 *  - en pourcentage (0 à 100) ou en euros TTC, parce qu'on raisonne
 *    en TTC au comptoir ; le montant est converti en HT avec le taux
 *    de TVA du devis, et plafonné au montant des produits : un total
 *    ne peut pas devenir négatif
 *  - l'acompte se calcule sur le total net TTC
 *
 * Arrondi (voir `roundingHt`) : nos prix sont pensés en TTC mais stockés
 * en HT, et la conversion laisse des centimes parasites, 749,99 au lieu
 * de 750. Le total TTC est donc ramené à l'euro le plus proche, et
 * l'écart, un ou deux centimes en pratique, est absorbé sur la dernière
 * ligne de produit pour que le document tombe juste : les lignes
 * s'additionnent au sous-total, sous-total plus TVA font le total, et le
 * client paie exactement ce qu'il a lu. Aucune ligne « Arrondi ».
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
  /** Produits avant remise, HT, arrondi compris. */
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
  /**
   * Total HT de chaque ligne produit, dans l'ordre reçu, arrondi de fin
   * inclus sur la dernière. C'est ce montant qu'il faut afficher, pas
   * `unitPrice * quantity`, sinon le tableau ne tombe plus juste.
   */
  lineTotalsHt: number[]
  /** Prix unitaire HT correspondant, à afficher tel quel. */
  lineUnitPricesHt: number[]
  /** Prix HT de chaque prestation, dans l'ordre reçu. */
  optionTotalsHt: number[]
  /** Écart absorbé sur la dernière ligne produit (peut être négatif). */
  roundingHt: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

/** Une remise compte si elle a un type et une valeur strictement positive. */
export function hasDiscount(d?: QuoteDiscount | null): d is Required<Pick<QuoteDiscount, 'type' | 'value'>> & QuoteDiscount {
  return !!d && (d.type === 'percent' || d.type === 'amount') && typeof d.value === 'number' && d.value > 0
}

/**
 * Montant HT de la remise pour un total produits donné.
 * Une remise en euros est saisie TTC : on la ramène en HT avec le taux
 * de TVA du devis avant de la retrancher des produits.
 */
export function computeDiscountHt(
  productsHt: number,
  d?: QuoteDiscount | null,
  tvaRate: number = 20,
): number {
  if (!hasDiscount(d) || productsHt <= 0) return 0
  if (d.type === 'percent') {
    const pct = Math.min(100, d.value)
    return round2(productsHt * (pct / 100))
  }
  const amountHt = d.value / (1 + tvaRate / 100)
  return round2(Math.min(productsHt, amountHt))
}

/**
 * Libellé de la ligne de remise sur les documents.
 * Ex : « Remise fidélité (10 %) », « Geste commercial (50,00 € TTC) ».
 * Le tableau des documents est en HT : rappeler le montant TTC dans le
 * libellé évite au client de chercher pourquoi la ligne ne dit pas 50.
 */
export function discountLineLabel(d?: QuoteDiscount | null): string {
  if (!hasDiscount(d)) return ''
  const base = d.label?.trim() || 'Remise'
  if (d.type === 'percent') {
    const pct = Math.min(100, d.value)
    const pctStr = pct.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
    return `${base} (${pctStr} %)`
  }
  const ttcStr = d.value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${base} (${ttcStr} € TTC)`
}

export function computeQuoteTotals(input: QuoteTotalsInput): QuoteTotals {
  const tvaRate = input.tvaRate ?? 20
  const tvaFactor = 1 + tvaRate / 100

  // 1) Tout ce qui s'affiche est d'abord arrondi au centime : le
  //    sous-total doit être la somme exacte des lignes lues par le
  //    client, pas celle de valeurs à quatre décimales.
  const quantities = input.lines.map((l) => l?.quantity ?? 1)
  const lineTotalsHt = input.lines.map((l) =>
    round2((l?.unitPrice ?? 0) * (l?.quantity ?? 1)),
  )
  const optionTotalsHt = (input.options || []).map((o) => round2(o?.price ?? 0))
  const shippingHt = round2(input.shippingFee ?? 0)
  const optionsHt = round2(optionTotalsHt.reduce((s, v) => s + v, 0))

  const productsBeforeRounding = round2(lineTotalsHt.reduce((s, v) => s + v, 0))
  const discountHt = computeDiscountHt(productsBeforeRounding, input.discount, tvaRate)
  const baseHt = round2(
    productsBeforeRounding - discountHt + shippingHt + optionsHt,
  )

  // 2) Total TTC à l'euro le plus proche. En dessous d'un euro on ne
  //    touche à rien : arrondir 0,60 € à 1 € ne serait plus un arrondi,
  //    ce serait un autre prix.
  const rawTotalTtc = baseHt * tvaFactor
  const totalTtc = rawTotalTtc >= 1 ? Math.round(rawTotalTtc) : round2(rawTotalTtc)
  const subtotalHt = round2(totalTtc / tvaFactor)
  // La TVA se déduit du total pour que les trois lignes s'accordent au
  // centime ; l'écart avec le calcul direct reste sous le demi-centime.
  const tvaAmount = round2(totalTtc - subtotalHt)

  // 3) L'écart part sur la dernière ligne de produit. Faute de produit
  //    (devis de prestation seule), il part sur la dernière prestation,
  //    sinon sur la livraison.
  const roundingHt = round2(subtotalHt - baseHt)
  let productsHt = productsBeforeRounding
  let shippingAdjusted = shippingHt
  const optionsAdjusted = [...optionTotalsHt]
  if (roundingHt !== 0) {
    if (lineTotalsHt.length > 0) {
      const last = lineTotalsHt.length - 1
      lineTotalsHt[last] = round2(lineTotalsHt[last] + roundingHt)
      productsHt = round2(productsHt + roundingHt)
    } else if (optionsAdjusted.length > 0) {
      const last = optionsAdjusted.length - 1
      optionsAdjusted[last] = round2(optionsAdjusted[last] + roundingHt)
    } else {
      shippingAdjusted = round2(shippingAdjusted + roundingHt)
    }
  }
  const optionsHtAdjusted = round2(optionsAdjusted.reduce((s, v) => s + v, 0))
  const lineUnitPricesHt = lineTotalsHt.map((total, i) =>
    round2(total / (quantities[i] || 1)),
  )

  // 4) Acompte arrondi lui aussi à l'euro, le solde prend la différence.
  const pct = input.depositPercent
  const hasDeposit = typeof pct === 'number' && pct >= 1 && pct <= 99
  const rawDeposit = hasDeposit ? totalTtc * (pct! / 100) : 0
  const depositTtc = !hasDeposit
    ? null
    : rawDeposit >= 1
      ? Math.min(totalTtc, Math.round(rawDeposit))
      : round2(rawDeposit)
  const balanceTtc = depositTtc === null ? totalTtc : round2(totalTtc - depositTtc)

  return {
    productsHt,
    discountHt,
    productsNetHt: round2(productsHt - discountHt),
    shippingHt: shippingAdjusted,
    optionsHt: optionsHtAdjusted,
    subtotalHt,
    tvaAmount,
    totalTtc,
    depositTtc,
    balanceTtc,
    lineTotalsHt,
    lineUnitPricesHt,
    optionTotalsHt: optionsAdjusted,
    roundingHt,
  }
}
