import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { LEGAL } from '@/lib/legal'

// ───────── Types ─────────

export type QuoteOption = {
  label: string
  price: number
}

export type QuotePdfInput = {
  numero: string
  /**
   * 'devis' (défaut) : titre DEVIS, validité affichée, modalités
   * d'acceptation en ligne. 'facture' : titre FACTURE, pas de bloc
   * validité, modalités de règlement + mentions légales facture.
   */
  docKind?: 'devis' | 'facture'
  emittedAt: Date
  validUntil: Date
  customer: {
    name: string
    email: string
    phone?: string
    company?: string
  }
  // Optionnelle : une vente au showroom ou un retrait n'a pas
  // d'adresse de livraison. Le bloc adresse ne s'affiche que si présente.
  shippingAddress?: {
    street?: string
    postalCode?: string
    city?: string
    floor?: string
    elevator?: 'yes' | 'no' | 'unknown'
  }
  /**
   * Ligne produit unique (devis legacy issus du formulaire client).
   * Ignorée si `items` est fourni.
   */
  product?: {
    name: string
    unitPrice: number
    quantity: number
  }
  /**
   * Lignes multiples (devis créés manuellement) : produit du catalogue
   * OU libellé saisi à la main. Prioritaire sur `product`.
   */
  items?: Array<{
    name: string
    unitPrice: number
    quantity: number
  }>
  shippingFee: number
  options: QuoteOption[]
  tvaRate: number
  /**
   * Mention légale affichée à la place de la ligne TVA quand tvaRate
   * vaut 0 (ex : régime de la marge art. 297 A, franchise 293 B…).
   */
  tvaExemptionText?: string
  pdfNotes?: string
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
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.ink,
    backgroundColor: '#fff',
  },
  // Header
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
  // Sections
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flexDirection: 'column' },
  // Quote header
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quoteTitle: {
    fontSize: 22,
    fontFamily: 'Times-Roman',
    color: COLORS.ink,
  },
  quoteNumero: {
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
  // Parties
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
  // Table
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
  colDesc: { flex: 5 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },
  cellHeader: { color: COLORS.ivory },
  // Totals
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
  // Notes
  notesBox: {
    marginTop: 24,
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
  // Footer
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
  // CGV page
  cgvTitle: {
    fontSize: 18,
    fontFamily: 'Times-Roman',
    color: COLORS.ink,
    marginBottom: 16,
  },
  cgvSection: {
    marginBottom: 12,
  },
  cgvSectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.goldDark,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cgvText: {
    fontSize: 8.5,
    color: COLORS.inkSoft,
    lineHeight: 1.4,
    textAlign: 'justify',
  },
})

// ───────── Helpers ─────────

function eur(v: number): string {
  return (
    v
      .toLocaleString('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      // Le séparateur de milliers fr-FR est une espace insécable étroite
      // (U+202F) que les polices PDF standard ne connaissent pas : elle
      // se dessine par-dessus le chiffre (effet "barré"). On la remplace
      // par une espace classique.
      .replace(/[  ]/g, ' ') + ' €'
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

export function QuotePdf({
  numero,
  docKind = 'devis',
  emittedAt,
  validUntil,
  customer,
  shippingAddress,
  product,
  items,
  shippingFee,
  options,
  tvaRate,
  tvaExemptionText,
  pdfNotes,
}: QuotePdfInput) {
  const isInvoice = docKind === 'facture'
  const docLabel = isInvoice ? 'Facture' : 'Devis'
  const noTva = tvaRate === 0
  // Unifie lignes multiples (items) et ligne unique legacy (product)
  const lines =
    items && items.length > 0 ? items : product ? [product] : []
  const productTotal = lines.reduce(
    (sum, l) => sum + l.unitPrice * l.quantity,
    0,
  )
  const optionsTotal = options.reduce((sum, o) => sum + o.price, 0)
  const subtotalHt = productTotal + shippingFee + optionsTotal
  const tvaAmount = subtotalHt * (tvaRate / 100)
  const totalTtc = subtotalHt + tvaAmount

  const hasAddress = !!(shippingAddress?.street || shippingAddress?.city)
  const elevatorLabel =
    shippingAddress?.elevator === 'yes'
      ? 'Oui'
      : shippingAddress?.elevator === 'no'
        ? 'Non'
        : 'Non précisé'

  return (
    <Document
      title={`${docLabel} ${numero} — Mobilier Malin`}
      author="Mobilier Malin (SARL 2 M)"
      creator="Mobilier Malin"
    >
      {/* ═══════════ PAGE 1 : Devis ═══════════ */}
      <Page size="A4" style={styles.page}>
        {/* Header marque */}
        <View style={styles.headerBar}>
          <Text style={styles.brandTagline}>Mobilier Malin · SARL 2 M</Text>
          <Text style={styles.brandName}>Mobilier de bureau reconditionné</Text>
        </View>

        {/* En-tête devis */}
        <View style={styles.quoteHeader}>
          <View style={styles.col}>
            <Text style={styles.quoteTitle}>{isInvoice ? 'FACTURE' : 'DEVIS'}</Text>
            <Text style={styles.quoteNumero}>N° {numero}</Text>
          </View>
          <View style={[styles.col, { alignItems: 'flex-end' }]}>
            <Text style={styles.metaLabel}>Émis{isInvoice ? 'e' : ''} le</Text>
            <Text style={styles.metaValue}>{dateFr(emittedAt)}</Text>
            {!isInvoice && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.metaLabel}>Valable jusqu'au</Text>
                <Text style={styles.metaValue}>{dateFr(validUntil)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Émetteur & destinataire */}
        <View style={styles.partiesBox}>
          <View style={styles.partyCol}>
            <Text style={styles.partyTitle}>Émetteur</Text>
            <Text style={styles.partyName}>{LEGAL.nomCommercial}</Text>
            <Text style={styles.partyLine}>{LEGAL.raisonSociale} ({LEGAL.formeJuridique})</Text>
            <Text style={styles.partyLine}>{LEGAL.showroom.ligne1}</Text>
            <Text style={styles.partyLine}>{LEGAL.showroom.codePostal} {LEGAL.showroom.ville}</Text>
            <Text style={[styles.partyLine, { marginTop: 6 }]}>{LEGAL.telephone}</Text>
            <Text style={styles.partyLine}>{LEGAL.email}</Text>
            <Text style={[styles.partyLine, { marginTop: 6, fontSize: 7.5 }]}>
              SIREN {LEGAL.siren} · RCS {LEGAL.rcs}
            </Text>
            <Text style={[styles.partyLine, { fontSize: 7.5 }]}>
              TVA {LEGAL.tvaIntracom}
            </Text>
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyTitle}>Destinataire</Text>
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
            ) : null}
            {customer.phone ? (
              <Text style={[styles.partyLine, { marginTop: 6 }]}>{customer.phone}</Text>
            ) : null}
            <Text style={styles.partyLine}>{customer.email}</Text>
          </View>
        </View>

        {/* Tableau lignes */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, styles.cellHeader]}>Désignation</Text>
          <Text style={[styles.colQty, styles.cellHeader]}>Qté</Text>
          <Text style={[styles.colPrice, styles.cellHeader]}>{noTva ? 'P.U.' : 'P.U. HT'}</Text>
          <Text style={[styles.colTotal, styles.cellHeader]}>{noTva ? 'Total' : 'Total HT'}</Text>
        </View>

        {/* Lignes produit (une par item) */}
        {lines.map((line, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colDesc}>{line.name}</Text>
            <Text style={styles.colQty}>{line.quantity}</Text>
            <Text style={styles.colPrice}>{eur(line.unitPrice)}</Text>
            <Text style={styles.colTotal}>{eur(line.unitPrice * line.quantity)}</Text>
          </View>
        ))}

        {/* Livraison */}
        {shippingFee > 0 && (
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>
              {shippingAddress?.city
                ? `Livraison à ${shippingAddress.city}${shippingAddress.postalCode ? ` (${shippingAddress.postalCode})` : ''}`
                : 'Livraison'}
            </Text>
            <Text style={styles.colQty}>1</Text>
            <Text style={styles.colPrice}>{eur(shippingFee)}</Text>
            <Text style={styles.colTotal}>{eur(shippingFee)}</Text>
          </View>
        )}

        {/* Options */}
        {options.map((opt, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colDesc}>{opt.label}</Text>
            <Text style={styles.colQty}>1</Text>
            <Text style={styles.colPrice}>{eur(opt.price)}</Text>
            <Text style={styles.colTotal}>{eur(opt.price)}</Text>
          </View>
        ))}

        {/* Totaux — sans ligne TVA si taux à 0 (hors TVA) */}
        <View style={styles.totalsBox}>
          {!noTva && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total HT</Text>
                <Text style={styles.totalValue}>{eur(subtotalHt)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TVA ({tvaRate} %)</Text>
                <Text style={styles.totalValue}>{eur(tvaAmount)}</Text>
              </View>
            </>
          )}
          <View style={styles.ttcRow}>
            <Text style={styles.ttcLabel}>{noTva ? 'Total' : 'Total TTC'}</Text>
            <Text style={styles.ttcValue}>{eur(totalTtc)}</Text>
          </View>
          {noTva && (
            <Text
              style={{
                fontSize: 8,
                color: COLORS.inkMute,
                marginTop: 6,
                textAlign: 'right',
              }}
            >
              {tvaExemptionText || 'TVA non applicable'}
            </Text>
          )}
        </View>

        {/* Notes */}
        {pdfNotes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Précisions</Text>
            <Text style={styles.notesContent}>{pdfNotes}</Text>
          </View>
        ) : null}

        {/* Modalités */}
        <View style={[styles.notesBox, { marginTop: 12 }]}>
          <Text style={styles.notesTitle}>Modalités</Text>
          {isInvoice ? (
            <Text style={styles.notesContent}>
              • Règlement selon les modalités convenues avec notre équipe.{'\n'}
              • Pas d'escompte pour paiement anticipé.{'\n'}
              • Professionnels — en cas de retard de paiement : pénalités de retard exigibles
              au taux légal et indemnité forfaitaire de recouvrement de 40 €
              (art. L441-10 et D441-5 du Code de commerce).
            </Text>
          ) : (
            <Text style={styles.notesContent}>
              • Devis valable {Math.ceil((validUntil.getTime() - emittedAt.getTime()) / (1000 * 60 * 60 * 24))} jours à compter de la date d'émission.{'\n'}
              • Paiement à l'acceptation par carte bancaire (Stripe) — règlement 100 % à la commande.{'\n'}
              • Livraison sous 7 à 15 jours ouvrés à compter de la réception du paiement.{'\n'}
              • Acceptation : cliquez sur le lien reçu par email accompagnant ce devis.
            </Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          {LEGAL.nomCommercial} — {LEGAL.raisonSociale} {LEGAL.formeJuridique} au capital de {LEGAL.capitalSocial} ·
          {LEGAL.showroom.ligne1}, {LEGAL.showroom.codePostal} {LEGAL.showroom.ville} ·
          SIREN {LEGAL.siren} · RCS {LEGAL.rcs} · TVA {LEGAL.tvaIntracom}{'\n'}
          Page <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </Text>
      </Page>

      {/* ═══════════ PAGE 2 : CGV ═══════════ */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.brandTagline}>{docLabel} {numero}</Text>
          <Text style={styles.brandName}>Conditions Générales de Vente</Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>Article 1 — Objet</Text>
          <Text style={styles.cgvText}>
            Les présentes Conditions Générales de Vente (« CGV ») régissent les ventes de mobilier
            de bureau reconditionné et neuf, ainsi que les prestations associées (livraison, montage,
            évacuation), conclues entre la société {LEGAL.raisonSociale} ({LEGAL.formeJuridique}), exploitant
            sous le nom commercial « {LEGAL.nomCommercial} », et ses clients professionnels ou particuliers
            (ci-après « le Client »).
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>Article 2 — Acceptation du devis</Text>
          <Text style={styles.cgvText}>
            Le devis est valable trente (30) jours à compter de sa date d'émission. Il devient ferme
            et définitif après acceptation expresse du Client par voie électronique (clic sur le lien
            d'acceptation reçu par email) et règlement intégral du prix par carte bancaire via la
            plateforme sécurisée Stripe. L'acceptation vaut accord sur l'ensemble du devis et des
            présentes CGV.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>Article 3 — Prix et paiement</Text>
          <Text style={styles.cgvText}>
            Les prix sont indiqués en euros, hors taxes (HT) et toutes taxes comprises (TTC). Le
            paiement est exigible à 100 % à l'acceptation du devis, par carte bancaire via Stripe.
            Aucune commande n'est traitée avant encaissement effectif. Les factures sont émises et
            transmises par voie électronique à l'adresse email indiquée par le Client.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>Article 4 — Livraison</Text>
          <Text style={styles.cgvText}>
            La livraison s'effectue à l'adresse indiquée sur le devis, dans un délai de 7 à 15 jours
            ouvrés à compter de la réception du paiement. Tout retard ne saurait ouvrir droit à
            indemnités. La présence d'une personne majeure au point de livraison est requise. En cas
            d'absence, une nouvelle livraison pourra être facturée. Le déchargement au-delà du seuil
            d'entrée et le montage sont des prestations distinctes, devisées séparément.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>Article 5 — État du mobilier reconditionné</Text>
          <Text style={styles.cgvText}>
            Le mobilier reconditionné a fait l'objet d'un contrôle qualité comprenant l'inspection
            visuelle, le nettoyage approfondi, le test de toutes les fonctionnalités mécaniques et,
            si nécessaire, le remplacement des pièces d'usure. L'état est précisé sur la fiche
            produit (Neuf / Excellent / Très bon / Bon / Correct). Le mobilier reconditionné peut
            présenter de légères marques d'usage cohérentes avec son état déclaré, sans incidence
            sur sa fonctionnalité.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>Article 6 — Garantie</Text>
          <Text style={styles.cgvText}>
            {LEGAL.nomCommercial} accorde une garantie commerciale de six (6) mois sur le mobilier
            reconditionné, couvrant tout vice de fonctionnement non imputable à un usage anormal,
            une mauvaise manipulation ou une modification par le Client. La garantie légale de
            conformité et la garantie des vices cachés (articles L.217-4 et suivants du Code de la
            consommation, articles 1641 et suivants du Code civil) s'appliquent en sus pour les
            Clients particuliers.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>Article 7 — Réserve de propriété</Text>
          <Text style={styles.cgvText}>
            Le transfert de propriété s'opère au paiement intégral du prix. Le transfert des risques
            (perte, vol, dégradation) s'effectue à la livraison au point indiqué sur le devis.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>Article 8 — Droit de rétractation (particuliers)</Text>
          <Text style={styles.cgvText}>
            Conformément à l'article L.221-18 du Code de la consommation, le Client particulier
            dispose d'un délai de quatorze (14) jours à compter de la réception du mobilier pour
            exercer son droit de rétractation, sans avoir à motiver sa décision. Les frais de retour
            restent à la charge du Client. Le mobilier doit être retourné dans son état d'origine.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>Article 9 — Données personnelles</Text>
          <Text style={styles.cgvText}>
            Les données collectées sont strictement nécessaires à la gestion de la commande, de la
            livraison et de la relation commerciale. Elles ne sont ni vendues ni transmises à des
            tiers à des fins commerciales. Conformément au RGPD, le Client dispose d'un droit
            d'accès, de rectification et de suppression de ses données en écrivant à {LEGAL.email}.
          </Text>
        </View>

        <View style={styles.cgvSection}>
          <Text style={styles.cgvSectionTitle}>Article 10 — Litiges et droit applicable</Text>
          <Text style={styles.cgvText}>
            Les présentes CGV sont soumises au droit français. En cas de litige, et après tentative
            de règlement amiable, les tribunaux du ressort de la Cour d'appel d'Aix-en-Provence
            seront seuls compétents. Pour les Clients consommateurs, conformément à l'article
            L.616-1 du Code de la consommation, un médiateur de la consommation peut être saisi.
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          {LEGAL.nomCommercial} — {LEGAL.raisonSociale} {LEGAL.formeJuridique} au capital de {LEGAL.capitalSocial} ·
          SIREN {LEGAL.siren} · RCS {LEGAL.rcs} · TVA {LEGAL.tvaIntracom}{'\n'}
          Page <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </Text>
      </Page>
    </Document>
  )
}
