import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { LEGAL } from '@/lib/legal'

/**
 * Catalogue produits PDF — structure éditoriale professionnelle :
 *
 *   p.1  Couverture photo pleine page (slide hero du site) + titre
 *   p.2  Édito (positionnement reconditionné, promesses)
 *   p.3  Table des matières (vignette + pages + description par catégorie)
 *   …    Par catégorie : page d'ouverture photo pleine page, puis
 *        fiches produits 2 colonnes (photo, specs, prix TTC)
 *   fin  Page contact
 *
 * Les produits sont découpés en pages de 8 EXACTEMENT (2 × 4) côté
 * route : c'est ce qui permet de calculer les numéros de pages de la
 * table des matières de façon déterministe.
 *
 * Charte : noir encre, ivoire, doré, titres Times (identique devis).
 */

export type CatalogueProduct = {
  name: string
  brand?: string
  conditionLabel?: string
  price: number
  salePrice?: number
  imageUrl?: string
  dimensions?: string
  material?: string
  color?: string
}

export type CatalogueSection = {
  category: string
  description?: string
  /** Photo pleine page d'ouverture de section (catégorie ou 1er produit) */
  openerImageUrl?: string
  /** Vignette carrée pour la table des matières */
  thumbUrl?: string
  /** Produits découpés en pages de 8 (2 colonnes × 4 lignes) */
  pages: CatalogueProduct[][]
  /** Numéros de pages calculés (pour la table des matières) */
  pageStart: number
  pageEnd: number
}

export type CataloguePdfInput = {
  sections: CatalogueSection[]
  totalCount: number
  editionDate: Date
  siteUrl: string
  coverImageUrl?: string
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
  // ═══ Couverture ═══
  coverPage: {
    backgroundColor: COLORS.ink,
    color: COLORS.ivory,
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 13, 10, 0.55)',
  },
  coverContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 64,
    alignItems: 'center',
  },
  coverBrand: {
    fontSize: 12,
    color: COLORS.gold,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  coverBrandRule: {
    width: 46,
    height: 1,
    backgroundColor: COLORS.gold,
    marginTop: 10,
    marginBottom: 18,
  },
  coverTitle: {
    fontSize: 58,
    fontFamily: 'Times-Roman',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  coverYear: {
    fontSize: 16,
    color: COLORS.ivory,
    letterSpacing: 8,
    marginTop: 10,
  },
  coverTag: {
    fontSize: 9,
    color: COLORS.ivory,
    opacity: 0.85,
    marginTop: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ═══ Édito ═══
  editoPage: {
    padding: 64,
    backgroundColor: '#FFFFFF',
    color: COLORS.ink,
    justifyContent: 'center',
  },
  editoBox: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    padding: 18,
    alignItems: 'center',
    marginBottom: 34,
  },
  editoBoxText: {
    fontSize: 15,
    fontFamily: 'Times-Roman',
    color: COLORS.ink,
    textAlign: 'center',
    lineHeight: 1.4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  editoParagraph: {
    fontSize: 11.5,
    color: COLORS.inkSoft,
    lineHeight: 1.85,
    textAlign: 'justify',
    marginBottom: 14,
  },
  editoHighlights: {
    marginTop: 22,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
    paddingTop: 22,
  },
  editoHighlight: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  editoHighlightDot: {
    fontSize: 11,
    color: COLORS.gold,
    marginRight: 8,
  },
  editoHighlightText: {
    fontSize: 10.5,
    color: COLORS.inkSoft,
    lineHeight: 1.5,
    flex: 1,
  },

  // ═══ Table des matières ═══
  tocPage: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    color: COLORS.ink,
  },
  tocRule: {
    height: 1.5,
    backgroundColor: COLORS.ink,
    marginBottom: 18,
  },
  tocTitle: {
    fontSize: 28,
    fontFamily: 'Times-Roman',
    marginBottom: 26,
  },
  tocGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tocItem: {
    width: '47%',
    flexDirection: 'row',
    marginBottom: 24,
  },
  tocThumb: {
    width: 52,
    height: 52,
    objectFit: 'cover',
    backgroundColor: COLORS.ivoryDark,
    marginRight: 12,
  },
  tocThumbPlaceholder: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.ivoryDark,
    marginRight: 12,
  },
  tocInfo: { flex: 1 },
  tocPageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    color: '#FFFFFF',
    fontSize: 7,
    letterSpacing: 1,
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  tocName: {
    fontSize: 13,
    fontFamily: 'Times-Bold',
    marginBottom: 4,
  },
  tocDesc: {
    fontSize: 7.5,
    color: COLORS.inkMute,
    lineHeight: 1.45,
  },

  // ═══ Ouverture de section ═══
  openerPage: {
    backgroundColor: COLORS.ink,
  },
  openerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  openerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 13, 10, 0.45)',
  },
  openerContent: {
    position: 'absolute',
    left: 48,
    top: 150,
    right: 48,
  },
  openerEyebrow: {
    fontSize: 26,
    fontFamily: 'Times-Roman',
    color: '#FFFFFF',
    opacity: 0.85,
  },
  openerTitle: {
    fontSize: 40,
    fontFamily: 'Times-Bold',
    color: '#FFFFFF',
    lineHeight: 1.05,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  openerRule: {
    width: 52,
    height: 2.5,
    backgroundColor: COLORS.gold,
    marginTop: 18,
  },
  openerCount: {
    position: 'absolute',
    left: 48,
    bottom: 40,
    fontSize: 9,
    color: '#FFFFFF',
    opacity: 0.85,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // ═══ Pages produits ═══
  page: {
    padding: 34,
    paddingBottom: 48,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: COLORS.ink,
    backgroundColor: '#FFFFFF',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink,
    paddingBottom: 6,
    marginBottom: 16,
  },
  pageHeaderCategory: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.inkSoft,
  },
  pageHeaderBrand: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    color: COLORS.ink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  entry: {
    width: '48%',
    flexDirection: 'row',
    marginBottom: 18,
    minHeight: 148,
  },
  entryImage: {
    width: 108,
    height: 135,
    objectFit: 'cover',
    backgroundColor: COLORS.ivory,
    borderWidth: 0.5,
    borderColor: COLORS.line,
  },
  entryImagePlaceholder: {
    width: 108,
    height: 135,
    backgroundColor: COLORS.ivoryDark,
    borderWidth: 0.5,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  entryName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.25,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  entryPrice: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.goldDark,
    marginBottom: 1,
  },
  entryPriceOld: {
    fontSize: 8,
    color: COLORS.inkMute,
    textDecoration: 'line-through',
  },
  entrySpecs: {
    marginTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
    paddingTop: 5,
  },
  entrySpecLine: {
    fontSize: 7.5,
    color: COLORS.inkSoft,
    lineHeight: 1.55,
  },
  entrySpecLabel: {
    color: COLORS.inkMute,
  },

  // ═══ Page contact ═══
  contactPage: {
    backgroundColor: COLORS.ink,
    padding: 48,
    color: COLORS.ivory,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactEyebrow: {
    fontSize: 10,
    color: COLORS.gold,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  contactTitle: {
    fontSize: 30,
    fontFamily: 'Times-Roman',
    color: COLORS.ivory,
    textAlign: 'center',
    marginTop: 14,
  },
  contactRule: {
    width: 52,
    height: 2,
    backgroundColor: COLORS.gold,
    marginTop: 20,
  },
  contactBody: {
    fontSize: 11,
    color: COLORS.ivory,
    opacity: 0.85,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 1.8,
    maxWidth: 360,
  },
  contactGold: {
    fontSize: 13,
    color: COLORS.gold,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 1.9,
  },

  // ═══ Footer commun ═══
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 34,
    right: 34,
    paddingTop: 7,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.line,
    fontSize: 6.5,
    color: COLORS.inkMute,
    flexDirection: 'row',
    justifyContent: 'space-between',
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

function PageFooter({ siteLabel }: { siteLabel: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>MOBILIER MALIN — {siteLabel} · {LEGAL.telephone}</Text>
      <Text render={({ pageNumber }) => `PAGE ${pageNumber}`} />
    </View>
  )
}

export function CataloguePdf({
  sections,
  totalCount,
  editionDate,
  siteUrl,
  coverImageUrl,
}: CataloguePdfInput) {
  const siteLabel = siteUrl.replace(/^https?:\/\//, '')
  const year = editionDate.getFullYear()

  return (
    <Document
      title={`Catalogue Mobilier Malin ${year}`}
      author="Mobilier Malin (SARL 2 M)"
      creator="Mobilier Malin"
    >
      {/* ═══ p.1 — Couverture ═══ */}
      <Page size="A4" style={styles.coverPage}>
        {coverImageUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={coverImageUrl} style={styles.coverImage} />
        ) : null}
        <View style={styles.coverOverlay} />
        <View style={styles.coverContent}>
          <Text style={styles.coverBrand}>Mobilier Malin</Text>
          <View style={styles.coverBrandRule} />
          <Text style={styles.coverTitle}>CATALOGUE</Text>
          <Text style={styles.coverYear}>{year}</Text>
          <Text style={styles.coverTag}>
            Mobilier de bureau reconditionné · {totalCount} pièces · Prix TTC
          </Text>
        </View>
      </Page>

      {/* ═══ p.2 — Édito ═══ */}
      <Page size="A4" style={styles.editoPage}>
        <View style={styles.editoBox}>
          <Text style={styles.editoBoxText}>
            Le mobilier de bureau reconditionné,{'\n'}sans compromis sur la qualité
          </Text>
        </View>
        <Text style={styles.editoParagraph}>
          Bienvenue dans le catalogue Mobilier Malin. Chaque pièce présentée
          dans ces pages est passée entre les mains de notre équipe, dans
          notre atelier de La Penne-sur-Huveaune : inspection, nettoyage
          approfondi, test de tous les réglages et remplacement des pièces
          d&apos;usure quand c&apos;est nécessaire.
        </Text>
        <Text style={styles.editoParagraph}>
          Équiper un bureau, un openspace ou une salle de réunion ne devrait
          pas obliger à choisir entre budget, qualité et impact
          environnemental. Le reconditionné permet les trois : des marques
          professionnelles conçues pour durer plus de dix ans, à une fraction
          du prix du neuf, et une seconde vie qui évite la production d&apos;un
          meuble supplémentaire.
        </Text>
        <View style={styles.editoHighlights}>
          <View style={styles.editoHighlight}>
            <Text style={styles.editoHighlightDot}>—</Text>
            <Text style={styles.editoHighlightText}>
              Photos réelles : la pièce photographiée est celle que vous recevez.
            </Text>
          </View>
          <View style={styles.editoHighlight}>
            <Text style={styles.editoHighlightDot}>—</Text>
            <Text style={styles.editoHighlightText}>
              Prix TTC affichés, dans la limite des stocks : le stock évolue
              chaque semaine, appelez-nous pour confirmer une disponibilité.
            </Text>
          </View>
          <View style={styles.editoHighlight}>
            <Text style={styles.editoHighlightDot}>—</Text>
            <Text style={styles.editoHighlightText}>
              Essai sur place à {LEGAL.showroom.ville} sur rendez-vous,
              livraison dans toute la France, remises dégressives pour
              l&apos;équipement de plusieurs postes.
            </Text>
          </View>
        </View>
      </Page>

      {/* ═══ p.3 — Table des matières ═══ */}
      <Page size="A4" style={styles.tocPage}>
        <View style={styles.tocRule} />
        <Text style={styles.tocTitle}>Table des matières</Text>
        <View style={styles.tocGrid}>
          {sections.map((s) => (
            <View key={s.category} style={styles.tocItem}>
              {s.thumbUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={s.thumbUrl} style={styles.tocThumb} />
              ) : (
                <View style={styles.tocThumbPlaceholder} />
              )}
              <View style={styles.tocInfo}>
                <Text style={styles.tocPageBadge}>
                  {s.pageStart === s.pageEnd
                    ? `Page ${s.pageStart}`
                    : `Pages ${s.pageStart}–${s.pageEnd}`}
                </Text>
                <Text style={styles.tocName}>{s.category}</Text>
                <Text style={styles.tocDesc}>
                  {s.description ||
                    `${s.pages.flat().length} pièce${s.pages.flat().length > 1 ? 's' : ''} reconditionnée${s.pages.flat().length > 1 ? 's' : ''} en stock.`}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <PageFooter siteLabel={siteLabel} />
      </Page>

      {/* ═══ Sections ═══ */}
      {sections.map((section) => {
        const count = section.pages.flat().length
        return [
          /* Ouverture pleine page */
          <Page key={`${section.category}-opener`} size="A4" style={styles.openerPage}>
            {section.openerImageUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={section.openerImageUrl} style={styles.openerImage} />
            ) : null}
            <View style={styles.openerOverlay} />
            <View style={styles.openerContent}>
              <Text style={styles.openerEyebrow}>Les</Text>
              <Text style={styles.openerTitle}>{section.category}</Text>
              <View style={styles.openerRule} />
            </View>
            <Text style={styles.openerCount}>
              {count} pièce{count > 1 ? 's' : ''} disponible{count > 1 ? 's' : ''}
            </Text>
          </Page>,

          /* Pages produits (8 par page, 2 colonnes) */
          ...section.pages.map((pageProducts, pi) => (
            <Page key={`${section.category}-${pi}`} size="A4" style={styles.page}>
              <View style={styles.pageHeader}>
                <Text style={styles.pageHeaderCategory}>{section.category}</Text>
                <Text style={styles.pageHeaderBrand}>Mobilier Malin</Text>
              </View>
              <View style={styles.grid}>
                {pageProducts.map((p, i) => {
                  const promo = p.salePrice && p.salePrice < p.price
                  return (
                    <View key={i} style={styles.entry} wrap={false}>
                      {p.imageUrl ? (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <Image src={p.imageUrl} style={styles.entryImage} />
                      ) : (
                        <View style={styles.entryImagePlaceholder}>
                          <Text style={{ fontSize: 7, color: COLORS.inkMute }}>
                            Photo sur{'\n'}demande
                          </Text>
                        </View>
                      )}
                      <View style={styles.entryInfo}>
                        <Text style={styles.entryName}>{p.name}</Text>
                        <Text style={styles.entryPrice}>
                          {eur(promo ? p.salePrice! : p.price)} TTC
                        </Text>
                        {promo ? (
                          <Text style={styles.entryPriceOld}>
                            au lieu de {eur(p.price)}
                          </Text>
                        ) : null}
                        <View style={styles.entrySpecs}>
                          {p.brand ? (
                            <Text style={styles.entrySpecLine}>
                              <Text style={styles.entrySpecLabel}>Marque : </Text>
                              {p.brand}
                            </Text>
                          ) : null}
                          {p.conditionLabel ? (
                            <Text style={styles.entrySpecLine}>
                              <Text style={styles.entrySpecLabel}>État : </Text>
                              {p.conditionLabel}
                            </Text>
                          ) : null}
                          {p.dimensions ? (
                            <Text style={styles.entrySpecLine}>
                              <Text style={styles.entrySpecLabel}>Dimensions : </Text>
                              {p.dimensions}
                            </Text>
                          ) : null}
                          {p.material ? (
                            <Text style={styles.entrySpecLine}>
                              <Text style={styles.entrySpecLabel}>Matière : </Text>
                              {p.material}
                            </Text>
                          ) : null}
                          {p.color ? (
                            <Text style={styles.entrySpecLine}>
                              <Text style={styles.entrySpecLabel}>Coloris : </Text>
                              {p.color}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  )
                })}
              </View>
              <PageFooter siteLabel={siteLabel} />
            </Page>
          )),
        ]
      })}

      {/* ═══ Page contact ═══ */}
      <Page size="A4" style={styles.contactPage}>
        <Text style={styles.contactEyebrow}>Mobilier Malin</Text>
        <Text style={styles.contactTitle}>Une pièce vous intéresse ?</Text>
        <View style={styles.contactRule} />
        <Text style={styles.contactBody}>
          Le stock évolue chaque semaine : appelez-nous pour vérifier une
          disponibilité, demander des photos supplémentaires ou obtenir un
          devis avec livraison. Remises dégressives pour l&apos;équipement de
          plusieurs postes.
        </Text>
        <Text style={styles.contactGold}>
          {LEGAL.telephone}{'\n'}
          {LEGAL.email}{'\n'}
          {siteLabel}
        </Text>
        <Text style={[styles.contactBody, { marginTop: 24, fontSize: 8.5, opacity: 0.6 }]}>
          Catalogue édité le {dateFr(editionDate)} · Prix TTC dans la limite des stocks{'\n'}
          {LEGAL.nomCommercial} — {LEGAL.raisonSociale} {LEGAL.formeJuridique} ·{' '}
          {LEGAL.showroom.ligne1}, {LEGAL.showroom.codePostal} {LEGAL.showroom.ville} ·
          SIREN {LEGAL.siren}
        </Text>
      </Page>
    </Document>
  )
}
