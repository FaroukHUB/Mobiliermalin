import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LEGAL } from '@/lib/legal'

/**
 * Catalogue produits PDF — généré à la demande depuis le stock Sanity
 * (route /catalogue.pdf). Même charte que les autres documents :
 * noir encre, ivoire, doré, titres Times.
 *
 * Structure :
 *   - Page de couverture (fond noir, édition datée, nombre de pièces)
 *   - Une section par catégorie : grille de cartes produit 3 colonnes
 *     (photo, nom, marque · état, prix TTC, promo barrée)
 *   - Page de contact finale
 */

export type CatalogueProduct = {
  name: string
  brand?: string
  conditionLabel?: string
  price: number
  salePrice?: number
  shortDescription?: string
  imageUrl?: string
  dimensions?: string
}

export type CatalogueSection = {
  category: string
  products: CatalogueProduct[]
}

export type CataloguePdfInput = {
  sections: CatalogueSection[]
  totalCount: number
  editionDate: Date
  siteUrl: string
}

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

const styles = StyleSheet.create({
  // ── Couverture ──
  coverPage: {
    backgroundColor: COLORS.ink,
    padding: 48,
    color: COLORS.ivory,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  coverEyebrow: {
    fontSize: 10,
    color: COLORS.gold,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  coverTitle: {
    fontSize: 52,
    fontFamily: 'Times-Roman',
    color: COLORS.ivory,
    marginTop: 14,
  },
  coverSubtitle: {
    fontSize: 15,
    color: COLORS.ivory,
    opacity: 0.85,
    marginTop: 10,
    fontFamily: 'Times-Roman',
  },
  coverDivider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.gold,
    marginTop: 22,
  },
  coverMeta: {
    fontSize: 11,
    color: COLORS.ivory,
    opacity: 0.75,
    marginTop: 26,
    lineHeight: 1.6,
  },
  coverFooter: {
    borderTopWidth: 0.5,
    borderTopColor: '#3a3a3a',
    paddingTop: 18,
  },
  coverContact: {
    fontSize: 10,
    color: COLORS.ivory,
    opacity: 0.85,
    lineHeight: 1.7,
  },
  coverContactGold: {
    fontSize: 11,
    color: COLORS.gold,
    marginBottom: 4,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Pages produits ──
  page: {
    padding: 30,
    paddingBottom: 46,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.ink,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    marginBottom: 14,
    marginTop: 6,
  },
  sectionEyebrow: {
    fontSize: 8,
    color: COLORS.goldDark,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Times-Roman',
    color: COLORS.ink,
    marginTop: 4,
  },
  sectionDivider: {
    width: 42,
    height: 2,
    backgroundColor: COLORS.gold,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '31.5%',
    backgroundColor: COLORS.ivory,
    borderWidth: 0.5,
    borderColor: COLORS.line,
    marginBottom: 10,
  },
  cardImage: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
    backgroundColor: COLORS.ivoryDark,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.ivoryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 8,
  },
  cardMeta: {
    fontSize: 6.5,
    color: COLORS.goldDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  cardName: {
    fontSize: 9.5,
    fontFamily: 'Times-Roman',
    color: COLORS.ink,
    lineHeight: 1.25,
    marginBottom: 4,
  },
  cardDims: {
    fontSize: 7,
    color: COLORS.inkMute,
    marginBottom: 5,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
  },
  cardPriceOld: {
    fontSize: 8,
    color: COLORS.inkMute,
    textDecoration: 'line-through',
    marginBottom: 1.5,
  },
  cardTtc: {
    fontSize: 6.5,
    color: COLORS.inkMute,
    marginBottom: 2,
  },

  // ── Page contact ──
  contactPage: {
    backgroundColor: COLORS.ink,
    padding: 48,
    color: COLORS.ivory,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTitle: {
    fontSize: 30,
    fontFamily: 'Times-Roman',
    color: COLORS.ivory,
    textAlign: 'center',
  },
  contactBody: {
    fontSize: 11,
    color: COLORS.ivory,
    opacity: 0.85,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 1.8,
    maxWidth: 360,
  },
  contactGold: {
    fontSize: 13,
    color: COLORS.gold,
    textAlign: 'center',
    marginTop: 22,
    lineHeight: 1.8,
  },

  // ── Footer commun ──
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 30,
    right: 30,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
    fontSize: 6.5,
    color: COLORS.inkMute,
    textAlign: 'center',
  },
})

function eur(v: number): string {
  return (
    v
      .toLocaleString('fr-FR', {
        minimumFractionDigits: v % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })
      .replace(/[  ]/g, ' ') + ' €'
  )
}

function dateFr(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function CataloguePdf({
  sections,
  totalCount,
  editionDate,
  siteUrl,
}: CataloguePdfInput) {
  const siteLabel = siteUrl.replace(/^https?:\/\//, '')
  return (
    <Document
      title={`Catalogue Mobilier Malin — ${dateFr(editionDate)}`}
      author="Mobilier Malin (SARL 2 M)"
      creator="Mobilier Malin"
    >
      {/* ═══ Couverture ═══ */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          <Text style={styles.coverEyebrow}>Mobilier Malin</Text>
          <Text style={styles.coverTitle}>Catalogue</Text>
          <Text style={styles.coverSubtitle}>
            Mobilier de bureau reconditionné en atelier
          </Text>
          <View style={styles.coverDivider} />
          <Text style={styles.coverMeta}>
            Édition du {dateFr(editionDate)}{'\n'}
            {totalCount} pièce{totalCount > 1 ? 's' : ''} disponible{totalCount > 1 ? 's' : ''} — prix TTC{'\n'}
            Photos réelles : chaque pièce est celle que vous recevez.
          </Text>
        </View>
        <View style={styles.coverFooter}>
          <Text style={styles.coverContactGold}>Nous contacter</Text>
          <Text style={styles.coverContact}>
            {siteLabel} · {LEGAL.telephone} · {LEGAL.email}{'\n'}
            {LEGAL.showroom.ligne1}, {LEGAL.showroom.codePostal} {LEGAL.showroom.ville}{'\n'}
            Visite sur rendez-vous · Livraison dans toute la France
          </Text>
        </View>
      </Page>

      {/* ═══ Sections par catégorie ═══ */}
      {sections.map((section) => (
        <Page key={section.category} size="A4" style={styles.page}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>
              {section.products.length} pièce{section.products.length > 1 ? 's' : ''}
            </Text>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            <View style={styles.sectionDivider} />
          </View>

          <View style={styles.grid}>
            {section.products.map((p, i) => (
              <View key={i} style={styles.card} wrap={false}>
                {p.imageUrl ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image src={p.imageUrl} style={styles.cardImage} />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <Text style={{ fontSize: 8, color: COLORS.inkMute }}>
                      Photo sur demande
                    </Text>
                  </View>
                )}
                <View style={styles.cardBody}>
                  {(p.brand || p.conditionLabel) && (
                    <Text style={styles.cardMeta}>
                      {[p.brand, p.conditionLabel].filter(Boolean).join(' · ')}
                    </Text>
                  )}
                  <Text style={styles.cardName}>{p.name}</Text>
                  {p.dimensions && <Text style={styles.cardDims}>{p.dimensions}</Text>}
                  <View style={styles.cardPriceRow}>
                    <Text style={styles.cardPrice}>
                      {eur(
                        p.salePrice && p.salePrice < p.price ? p.salePrice : p.price,
                      )}
                    </Text>
                    {p.salePrice && p.salePrice < p.price ? (
                      <Text style={styles.cardPriceOld}>{eur(p.price)}</Text>
                    ) : null}
                    <Text style={styles.cardTtc}>TTC</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.footer} fixed>
            Catalogue Mobilier Malin — édition du {dateFr(editionDate)} · Prix TTC, dans la limite des stocks ·{' '}
            {siteLabel} · {LEGAL.telephone} · Page{' '}
            <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </Text>
        </Page>
      ))}

      {/* ═══ Page contact ═══ */}
      <Page size="A4" style={styles.contactPage}>
        <Text style={styles.coverEyebrow}>Mobilier Malin</Text>
        <Text style={[styles.contactTitle, { marginTop: 14 }]}>
          Une pièce vous intéresse ?
        </Text>
        <View style={[styles.coverDivider, { alignSelf: 'center' }]} />
        <Text style={styles.contactBody}>
          Le stock évolue chaque semaine : appelez-nous pour vérifier la
          disponibilité, demander des photos supplémentaires ou obtenir un
          devis avec livraison. Remises dégressives pour l&apos;équipement de
          plusieurs postes.
        </Text>
        <Text style={styles.contactGold}>
          {LEGAL.telephone}{'\n'}
          {LEGAL.email}{'\n'}
          {siteLabel}
        </Text>
        <Text style={[styles.contactBody, { marginTop: 22, fontSize: 9, opacity: 0.6 }]}>
          {LEGAL.nomCommercial} — {LEGAL.raisonSociale} {LEGAL.formeJuridique} ·{' '}
          {LEGAL.showroom.ligne1}, {LEGAL.showroom.codePostal} {LEGAL.showroom.ville} ·
          SIREN {LEGAL.siren}
        </Text>
      </Page>
    </Document>
  )
}
