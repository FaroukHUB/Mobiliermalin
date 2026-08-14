import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { LEGAL } from '@/lib/legal'

/**
 * Bon de livraison PDF — même charte graphique que le devis/facture.
 *
 * Différences avec le devis :
 *  - Titre BON DE LIVRAISON, numéro BL-… (dérivé du numéro de devis)
 *  - Par défaut AUCUN prix : seulement désignation + quantité
 *    (showPrices: true réaffiche P.U. HT / totaux)
 *  - Zones de signature livreur / client ("reçu conforme")
 *  - Pas de page CGV
 */

export type DeliveryNotePdfInput = {
  numero: string
  deliveryDate: Date
  customer: {
    name: string
    email?: string
    phone?: string
    company?: string
  }
  shippingAddress?: {
    street?: string
    postalCode?: string
    city?: string
    floor?: string
    elevator?: 'yes' | 'no' | 'unknown'
    instructions?: string
  }
  items: Array<{
    name: string
    unitPrice: number
    quantity: number
  }>
  options: Array<{ label: string; price: number }>
  shippingFee: number
  tvaRate: number
  showPrices: boolean
  carrier?: string
  notes?: string
}

const COLORS = {
  ivory: '#FAF7F2',
  ink: '#1A1A1A',
  inkSoft: '#3D3D3D',
  inkMute: '#6B6B6B',
  gold: '#B89A5B',
  goldDark: '#8A7340',
  line: '#E5E1D9',
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.ink,
    backgroundColor: '#fff',
  },
  headerBar: {
    backgroundColor: COLORS.ink,
    color: COLORS.ivory,
    padding: 16,
    marginBottom: 24,
  },
  brandName: {
    fontSize: 18,
    color: COLORS.ivory,
    fontFamily: 'Times-Roman',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 8,
    color: COLORS.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  col: { flexDirection: 'column' },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  docTitle: {
    fontSize: 22,
    fontFamily: 'Times-Roman',
    color: COLORS.ink,
  },
  docNumero: {
    fontSize: 12,
    color: COLORS.goldDark,
    marginTop: 4,
  },
  metaLabel: {
    fontSize: 8,
    color: COLORS.inkMute,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 10,
    color: COLORS.ink,
    marginTop: 2,
  },
  partiesBox: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  partyCol: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.ivory,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
  },
  partyTitle: {
    fontSize: 8,
    color: COLORS.inkMute,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  partyName: {
    fontSize: 11,
    color: COLORS.ink,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  partyLine: {
    fontSize: 9,
    color: COLORS.inkSoft,
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.ink,
    color: COLORS.ivory,
    padding: 8,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.line,
    fontSize: 10,
  },
  colDesc: { flex: 6 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },
  colCheck: { flex: 2, textAlign: 'center' },
  cellHeader: { color: COLORS.ivory },
  checkBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: COLORS.inkMute,
    alignSelf: 'center',
  },
  totalsBox: {
    marginTop: 16,
    marginLeft: 'auto',
    width: '60%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 10,
  },
  totalLabel: { color: COLORS.inkSoft },
  totalValue: { color: COLORS.ink, fontFamily: 'Helvetica-Bold' },
  ttcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: COLORS.ink,
    color: COLORS.ivory,
    marginTop: 4,
  },
  ttcLabel: {
    color: COLORS.gold,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  ttcValue: {
    color: COLORS.ivory,
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  notesBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: COLORS.ivory,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
  },
  notesTitle: {
    fontSize: 8,
    color: COLORS.inkMute,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  notesContent: {
    fontSize: 10,
    color: COLORS.inkSoft,
    lineHeight: 1.5,
  },
  // Signatures
  signBox: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 28,
  },
  signCol: {
    flex: 1,
    padding: 12,
    borderWidth: 0.5,
    borderColor: COLORS.line,
    minHeight: 110,
  },
  signTitle: {
    fontSize: 8,
    color: COLORS.inkMute,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  signHint: {
    fontSize: 7.5,
    color: COLORS.inkMute,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
    fontSize: 7,
    color: COLORS.inkMute,
    textAlign: 'center',
    lineHeight: 1.4,
  },
})

function eur(v: number): string {
  return (
    v.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €'
  )
}

function dateFr(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function DeliveryNotePdf({
  numero,
  deliveryDate,
  customer,
  shippingAddress,
  items,
  options,
  shippingFee,
  tvaRate,
  showPrices,
  carrier,
  notes,
}: DeliveryNotePdfInput) {
  const productTotal = items.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
  const optionsTotal = options.reduce((s, o) => s + o.price, 0)
  const subtotalHt = productTotal + shippingFee + optionsTotal
  const tvaAmount = subtotalHt * (tvaRate / 100)
  const totalTtc = subtotalHt + tvaAmount
  const totalPieces = items.reduce((s, l) => s + l.quantity, 0)

  const hasAddress = !!(shippingAddress?.street || shippingAddress?.city)
  const elevatorLabel =
    shippingAddress?.elevator === 'yes'
      ? 'Oui'
      : shippingAddress?.elevator === 'no'
        ? 'Non'
        : 'Non précisé'

  return (
    <Document
      title={`Bon de livraison ${numero} — Mobilier Malin`}
      author="Mobilier Malin (SARL 2 M)"
      creator="Mobilier Malin"
    >
      <Page size="A4" style={styles.page}>
        {/* Header marque */}
        <View style={styles.headerBar}>
          <Text style={styles.brandTagline}>Mobilier Malin · SARL 2 M</Text>
          <Text style={styles.brandName}>Mobilier de bureau reconditionné</Text>
        </View>

        {/* En-tête document */}
        <View style={styles.docHeader}>
          <View style={styles.col}>
            <Text style={styles.docTitle}>BON DE LIVRAISON</Text>
            <Text style={styles.docNumero}>N° {numero}</Text>
          </View>
          <View style={[styles.col, { alignItems: 'flex-end' }]}>
            <Text style={styles.metaLabel}>Date de livraison</Text>
            <Text style={styles.metaValue}>{dateFr(deliveryDate)}</Text>
            {carrier ? (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.metaLabel}>Livreur / transporteur</Text>
                <Text style={styles.metaValue}>{carrier}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Émetteur & destinataire */}
        <View style={styles.partiesBox}>
          <View style={styles.partyCol}>
            <Text style={styles.partyTitle}>Expéditeur</Text>
            <Text style={styles.partyName}>{LEGAL.nomCommercial}</Text>
            <Text style={styles.partyLine}>{LEGAL.raisonSociale} ({LEGAL.formeJuridique})</Text>
            <Text style={styles.partyLine}>
              Atelier : {LEGAL.showroom.ligne1}, {LEGAL.showroom.codePostal} {LEGAL.showroom.ville}
            </Text>
            <Text style={[styles.partyLine, { marginTop: 6 }]}>{LEGAL.telephone}</Text>
            <Text style={styles.partyLine}>{LEGAL.email}</Text>
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyTitle}>Livré à</Text>
            <Text style={styles.partyName}>{customer.name}</Text>
            {customer.company ? (
              <Text style={styles.partyLine}>{customer.company}</Text>
            ) : null}
            {hasAddress ? (
              <>
                {shippingAddress?.street ? (
                  <Text style={styles.partyLine}>{shippingAddress.street}</Text>
                ) : null}
                <Text style={styles.partyLine}>
                  {[shippingAddress?.postalCode, shippingAddress?.city].filter(Boolean).join(' ')}
                </Text>
                {shippingAddress?.floor || (shippingAddress?.elevator && shippingAddress.elevator !== 'unknown') ? (
                  <Text style={[styles.partyLine, { marginTop: 4, fontSize: 8 }]}>
                    {shippingAddress?.floor ? `Étage : ${shippingAddress.floor} — ` : ''}
                    Ascenseur : {elevatorLabel}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.partyLine}>Retrait au showroom / adresse non précisée</Text>
            )}
            {customer.phone ? (
              <Text style={[styles.partyLine, { marginTop: 6 }]}>{customer.phone}</Text>
            ) : null}
          </View>
        </View>

        {/* Tableau lignes */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, styles.cellHeader]}>Désignation</Text>
          <Text style={[styles.colQty, styles.cellHeader]}>Qté</Text>
          {showPrices ? (
            <>
              <Text style={[styles.colPrice, styles.cellHeader]}>P.U. HT</Text>
              <Text style={[styles.colTotal, styles.cellHeader]}>Total HT</Text>
            </>
          ) : (
            <Text style={[styles.colCheck, styles.cellHeader]}>Contrôle</Text>
          )}
        </View>

        {items.map((line, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colDesc}>{line.name}</Text>
            <Text style={styles.colQty}>{line.quantity}</Text>
            {showPrices ? (
              <>
                <Text style={styles.colPrice}>{eur(line.unitPrice)}</Text>
                <Text style={styles.colTotal}>{eur(line.unitPrice * line.quantity)}</Text>
              </>
            ) : (
              <View style={styles.colCheck}>
                <View style={styles.checkBox} />
              </View>
            )}
          </View>
        ))}

        {/* Prestations (montage, évacuation…) — sans case de contrôle */}
        {options.map((opt, i) => (
          <View key={`opt-${i}`} style={styles.tableRow}>
            <Text style={styles.colDesc}>{opt.label}</Text>
            <Text style={styles.colQty}>1</Text>
            {showPrices ? (
              <>
                <Text style={styles.colPrice}>{eur(opt.price)}</Text>
                <Text style={styles.colTotal}>{eur(opt.price)}</Text>
              </>
            ) : (
              <Text style={styles.colCheck} />
            )}
          </View>
        ))}

        {showPrices && shippingFee > 0 ? (
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>Livraison</Text>
            <Text style={styles.colQty}>1</Text>
            <Text style={styles.colPrice}>{eur(shippingFee)}</Text>
            <Text style={styles.colTotal}>{eur(shippingFee)}</Text>
          </View>
        ) : null}

        {/* Récap pièces */}
        <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
          <Text style={[styles.colDesc, { fontFamily: 'Helvetica-Bold' }]}>
            Total : {totalPieces} pièce{totalPieces > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Totaux — uniquement si les prix sont affichés */}
        {showPrices ? (
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total HT</Text>
              <Text style={styles.totalValue}>{eur(subtotalHt)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA ({tvaRate} %)</Text>
              <Text style={styles.totalValue}>{eur(tvaAmount)}</Text>
            </View>
            <View style={styles.ttcRow}>
              <Text style={styles.ttcLabel}>Total TTC</Text>
              <Text style={styles.ttcValue}>{eur(totalTtc)}</Text>
            </View>
          </View>
        ) : null}

        {/* Notes */}
        {notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Précisions</Text>
            <Text style={styles.notesContent}>{notes}</Text>
          </View>
        ) : null}
        {shippingAddress?.instructions ? (
          <View style={[styles.notesBox, { marginTop: 8 }]}>
            <Text style={styles.notesTitle}>Instructions d&apos;accès</Text>
            <Text style={styles.notesContent}>{shippingAddress.instructions}</Text>
          </View>
        ) : null}

        {/* Signatures */}
        <View style={styles.signBox}>
          <View style={styles.signCol}>
            <Text style={styles.signTitle}>Le livreur</Text>
            <Text style={styles.signHint}>Nom et signature</Text>
          </View>
          <View style={styles.signCol}>
            <Text style={styles.signTitle}>Le client — reçu conforme</Text>
            <Text style={styles.signHint}>
              Nom, date et signature.{'\n'}
              Réserves éventuelles à indiquer ci-dessous (article L.133-3 du
              Code de commerce : les réserves doivent être précises et motivées,
              confirmées au transporteur sous 3 jours).
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          {LEGAL.nomCommercial} — {LEGAL.raisonSociale} {LEGAL.formeJuridique} au capital de {LEGAL.capitalSocial} ·
          Siège : {LEGAL.siegeSocial.ligne2}, {LEGAL.siegeSocial.codePostal} {LEGAL.siegeSocial.ville} ·
          SIREN {LEGAL.siren} · RCS {LEGAL.rcs} · TVA {LEGAL.tvaIntracom}
        </Text>
      </Page>
    </Document>
  )
}
