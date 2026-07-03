import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { LEGAL } from '@/lib/legal'

const GOOGLE_REVIEW_URL = 'https://g.page/r/CUtST0PM2AI0EBM/review'
const QR_IMAGE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(GOOGLE_REVIEW_URL)}`

// ───────── Types ─────────

export type OrderInvoiceItem = {
  name: string
  quantity: number
  unitPriceCents: number // TTC (Stripe stocke en centimes TTC)
}

export type OrderInvoicePdfInput = {
  numero: string // ex: FA-2026-0001
  emittedAt: Date
  customer: {
    name: string
    email?: string
    phone?: string
  }
  shippingAddress?: {
    line1?: string
    line2?: string
    postalCode?: string
    city?: string
    country?: string
  }
  fulfillmentMode: 'pickup' | 'delivery'
  pickupLabel?: string // "mardi 3 septembre à 14 h 30"
  items: OrderInvoiceItem[]
  amountTotalCents: number // TTC total facturé par Stripe
  tvaRate: number // ex: 20
  paymentMethod?: string // "Carte bancaire (Stripe)"
  paidAt: Date
}

// ───────── Styles ─────────

const COLORS = {
  ivory: '#FAF7F2',
  ink: '#1A1A1A',
  inkSoft: '#3D3D3D',
  inkMute: '#6B6B6B',
  gold: '#B89A5B',
  goldDark: '#8A7340',
  line: '#E5E1D9',
  success: '#2F6E4F',
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
    marginBottom: 24,
  },
  brandTagline: {
    fontSize: 8,
    letterSpacing: 2,
    color: COLORS.gold,
    textTransform: 'uppercase',
  },
  brandName: {
    fontSize: 14,
    marginTop: 2,
    color: COLORS.ink,
    fontFamily: 'Times-Roman',
  },
  factureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 20,
  },
  col: { flexDirection: 'column' },
  factureTitle: {
    fontSize: 28,
    color: COLORS.ink,
    fontFamily: 'Times-Roman',
    letterSpacing: 1,
  },
  factureNumero: {
    fontSize: 11,
    color: COLORS.inkMute,
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
    gap: 24,
    marginTop: 8,
    marginBottom: 20,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.line,
    paddingTop: 12,
    paddingBottom: 12,
  },
  partyCol: { flex: 1 },
  partyTitle: {
    fontSize: 8,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 11,
    color: COLORS.ink,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  partyLine: {
    fontSize: 9,
    color: COLORS.inkSoft,
    lineHeight: 1.5,
  },
  paidBadge: {
    marginTop: 4,
    padding: 6,
    backgroundColor: '#E8F3EC',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
    color: COLORS.success,
    fontSize: 9,
  },
  // Tableau
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.ivory,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
    marginTop: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.line,
  },
  tableRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 8,
    paddingRight: 8,
    borderBottomWidth: 0.25,
    borderBottomColor: COLORS.line,
  },
  cellHeader: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.inkMute,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  colDesc: { flex: 3 },
  colQty: { flex: 0.5, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  // Totaux
  totalsBox: {
    marginTop: 16,
    alignSelf: 'flex-end',
    width: 240,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 4,
  },
  totalLabel: { fontSize: 9, color: COLORS.inkMute },
  totalValue: { fontSize: 10, color: COLORS.ink },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.goldDark,
  },
  // Bloc paiement
  paymentBox: {
    marginTop: 24,
    padding: 12,
    backgroundColor: COLORS.ivory,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  paymentTitle: {
    fontSize: 8,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  paymentLine: {
    fontSize: 9,
    color: COLORS.inkSoft,
    lineHeight: 1.5,
  },
  // Encart avis Google
  reviewBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: COLORS.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  reviewQr: {
    width: 90,
    height: 90,
    backgroundColor: '#fff',
    padding: 4,
  },
  reviewText: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 8,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  reviewHeading: {
    fontSize: 12,
    fontFamily: 'Times-Roman',
    color: COLORS.ivory,
    marginBottom: 5,
  },
  reviewBody: {
    fontSize: 8.5,
    color: COLORS.ivory,
    opacity: 0.85,
    lineHeight: 1.5,
  },
  reviewLink: {
    fontSize: 7.5,
    color: COLORS.gold,
    marginTop: 4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
    fontSize: 7,
    color: COLORS.inkMute,
    textAlign: 'center',
    lineHeight: 1.4,
  },
})

// ───────── Helpers ─────────

function eur(cents: number): string {
  return (
    (cents / 100).toLocaleString('fr-FR', {
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

// ───────── Component ─────────

export function OrderInvoicePdf({
  numero,
  emittedAt,
  customer,
  shippingAddress,
  fulfillmentMode,
  pickupLabel,
  items,
  amountTotalCents,
  tvaRate,
  paymentMethod,
  paidAt,
}: OrderInvoicePdfInput) {
  // Stripe stocke en TTC → on décompose pour l'affichage HT/TVA
  const totalHt = Math.round(amountTotalCents / (1 + tvaRate / 100))
  const tvaAmount = amountTotalCents - totalHt

  const isDelivery = fulfillmentMode === 'delivery'

  return (
    <Document
      title={`Facture ${numero} — Mobilier Malin`}
      author={`${LEGAL.nomCommercial} (${LEGAL.raisonSociale})`}
      creator="Mobilier Malin"
    >
      <Page size="A4" style={styles.page}>
        {/* Marque */}
        <View style={styles.headerBar}>
          <Text style={styles.brandTagline}>
            Mobilier Malin · {LEGAL.raisonSociale}
          </Text>
          <Text style={styles.brandName}>
            Mobilier de bureau reconditionné
          </Text>
        </View>

        {/* En-tête facture */}
        <View style={styles.factureHeader}>
          <View style={styles.col}>
            <Text style={styles.factureTitle}>FACTURE</Text>
            <Text style={styles.factureNumero}>N° {numero}</Text>
          </View>
          <View style={[styles.col, { alignItems: 'flex-end' }]}>
            <Text style={styles.metaLabel}>Émise le</Text>
            <Text style={styles.metaValue}>{dateFr(emittedAt)}</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.metaLabel}>Payée le</Text>
              <Text style={styles.metaValue}>{dateFr(paidAt)}</Text>
            </View>
          </View>
        </View>

        {/* Émetteur & Destinataire */}
        <View style={styles.partiesBox}>
          <View style={styles.partyCol}>
            <Text style={styles.partyTitle}>Émetteur</Text>
            <Text style={styles.partyName}>{LEGAL.nomCommercial}</Text>
            <Text style={styles.partyLine}>
              {LEGAL.raisonSociale} ({LEGAL.formeJuridique})
            </Text>
            <Text style={styles.partyLine}>{LEGAL.showroom.ligne1}</Text>
            <Text style={styles.partyLine}>
              {LEGAL.showroom.codePostal} {LEGAL.showroom.ville}
            </Text>
            <Text style={[styles.partyLine, { marginTop: 6 }]}>
              {LEGAL.telephone}
            </Text>
            <Text style={styles.partyLine}>{LEGAL.email}</Text>
            <Text
              style={[
                styles.partyLine,
                { marginTop: 6, fontSize: 7.5 },
              ]}
            >
              SIREN {LEGAL.siren} · RCS {LEGAL.rcs}
            </Text>
            <Text style={[styles.partyLine, { fontSize: 7.5 }]}>
              TVA {LEGAL.tvaIntracom}
            </Text>
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyTitle}>Destinataire</Text>
            <Text style={styles.partyName}>{customer.name || '—'}</Text>
            {isDelivery && shippingAddress ? (
              <>
                {shippingAddress.line1 && (
                  <Text style={styles.partyLine}>{shippingAddress.line1}</Text>
                )}
                {shippingAddress.line2 && (
                  <Text style={styles.partyLine}>{shippingAddress.line2}</Text>
                )}
                {(shippingAddress.postalCode || shippingAddress.city) && (
                  <Text style={styles.partyLine}>
                    {shippingAddress.postalCode} {shippingAddress.city}
                  </Text>
                )}
                {shippingAddress.country && shippingAddress.country !== 'FR' && (
                  <Text style={styles.partyLine}>{shippingAddress.country}</Text>
                )}
              </>
            ) : (
              <Text
                style={[styles.partyLine, { marginTop: 4, fontStyle: 'italic' }]}
              >
                Retrait au showroom
              </Text>
            )}
            {customer.phone && (
              <Text style={[styles.partyLine, { marginTop: 6 }]}>
                {customer.phone}
              </Text>
            )}
            {customer.email && (
              <Text style={styles.partyLine}>{customer.email}</Text>
            )}
            {pickupLabel && (
              <View style={styles.paidBadge}>
                <Text>Créneau retrait : {pickupLabel}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tableau articles */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, styles.cellHeader]}>Désignation</Text>
          <Text style={[styles.colQty, styles.cellHeader]}>Qté</Text>
          <Text style={[styles.colPrice, styles.cellHeader]}>P.U. TTC</Text>
          <Text style={[styles.colTotal, styles.cellHeader]}>Total TTC</Text>
        </View>

        {items.map((it, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colDesc}>{it.name}</Text>
            <Text style={styles.colQty}>{it.quantity}</Text>
            <Text style={styles.colPrice}>{eur(it.unitPriceCents)}</Text>
            <Text style={styles.colTotal}>
              {eur(it.unitPriceCents * it.quantity)}
            </Text>
          </View>
        ))}

        {/* Totaux */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT</Text>
            <Text style={styles.totalValue}>{eur(totalHt)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({tvaRate} %)</Text>
            <Text style={styles.totalValue}>{eur(tvaAmount)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total TTC</Text>
            <Text style={styles.grandTotalValue}>{eur(amountTotalCents)}</Text>
          </View>
        </View>

        {/* Bloc paiement */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>Paiement reçu</Text>
          <Text style={styles.paymentLine}>
            Payée le {dateFr(paidAt)}
            {paymentMethod ? ` — ${paymentMethod}` : ''}
          </Text>
          <Text style={styles.paymentLine}>
            Cette facture vaut acquit et n&apos;implique aucune somme restant
            due.
          </Text>
        </View>

        {/* Encart avis Google — QR code + message */}
        <View style={styles.reviewBox}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={QR_IMAGE_URL} style={styles.reviewQr} />
          <View style={styles.reviewText}>
            <Text style={styles.reviewTitle}>Merci pour votre confiance</Text>
            <Text style={styles.reviewHeading}>
              Partagez votre expérience sur Google
            </Text>
            <Text style={styles.reviewBody}>
              Votre retour nous permet d&apos;améliorer notre service et
              guide les futurs clients dans leur choix. Scannez le QR code
              avec votre téléphone pour accéder directement à notre page.
            </Text>
            <Text style={styles.reviewLink}>{GOOGLE_REVIEW_URL}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          {LEGAL.nomCommercial} — {LEGAL.raisonSociale} ({LEGAL.formeJuridique})
          {'\n'}
          {LEGAL.showroom.ligne1}, {LEGAL.showroom.codePostal}{' '}
          {LEGAL.showroom.ville} · SIREN {LEGAL.siren} · TVA{' '}
          {LEGAL.tvaIntracom}
          {'\n'}
          Garantie 6 mois sur tous les produits. Retour sous 14 jours pour les
          particuliers (loi Hamon).
        </Text>
      </Page>
    </Document>
  )
}
