/**
 * Configuration Sanity Studio.
 * Le Studio est monté sur /studio (voir src/app/studio/[[...tool]]/page.tsx).
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { sendQuoteAction } from './sanity/actions/sendQuoteAction'
import { sendInvoiceAction } from './sanity/actions/sendInvoiceAction'
import { downloadInvoiceAction } from './sanity/actions/downloadInvoiceAction'
import { sellInStoreAction } from './sanity/actions/sellInStoreAction'
import { downloadDeliveryNoteAction } from './sanity/actions/downloadDeliveryNoteAction'
import { registerSaleAction } from './sanity/actions/registerSaleAction'
import { withSaleOnAccept } from './sanity/actions/publishWithSaleAction'
import {
  downloadQuotePdfAction,
  downloadInvoicePdfAction,
} from './sanity/actions/downloadQuotePdfActions'
import { Dashboard } from './sanity/dashboard/Dashboard'
import { ClientsDatabase } from './sanity/dashboard/ClientsDatabase'
import { PilotageBoard } from './sanity/dashboard/PilotageBoard'
import { SalesTableView, ExpensesTableView } from './sanity/dashboard/LedgerTable'
import {
  ProductGridView,
  CategoryGridView,
  BlogGridView,
} from './sanity/dashboard/MediaGrid'
import { NouveauDevisLink } from './sanity/dashboard/NouveauDevisLink'
import { NouvelleFactureLink } from './sanity/dashboard/NouvelleFactureLink'
import { projectId, dataset, apiVersion } from './sanity/env'
import {
  LOCAL_PAGES,
  LOCAL_PAGE_SECTIONS,
  localPageDocumentId,
} from './sanity/localPagesRegistry'
import {
  NATIONAL_PAGES,
  NATIONAL_PAGE_SECTIONS,
  nationalPageDocumentId,
} from './sanity/nationalPagesRegistry'

const SINGLETON_TYPES = new Set(['siteSettings', 'qualityGuide'])
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

// Vision tool (GROQ query playground) : utile en dev, retiré en production
// pour alléger le bundle du Studio.
const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  name: 'mobilier-malin',
  title: 'Mobilier Malin — Espace de gestion',
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Templates de création pour les pages locales — pré-remplissent
    // le pageKey et le displayName selon l'entrée cliquée dans la sidebar.
    templates: (prev) => [
      ...prev.filter(
        (t) => t.schemaType !== 'localPage' && t.schemaType !== 'nationalLandingPage',
      ),
      ...LOCAL_PAGES.map((page) => ({
        id: `localPage-${page.key}`,
        title: page.title,
        schemaType: 'localPage',
        parameters: [],
        value: {
          pageKey: page.key,
          displayName: page.displayName,
        },
      })),
      ...NATIONAL_PAGES.map((page) => ({
        id: `nationalLandingPage-${page.key}`,
        title: page.title,
        schemaType: 'nationalLandingPage',
        parameters: [],
        value: {
          pageKey: page.key,
          displayName: page.displayName,
        },
      })),
    ],
  },
  document: {
    actions: (input, context) => {
      // Sur les singletons : retire les actions "Duplicate" et "Delete"
      if (SINGLETON_TYPES.has(context.schemaType)) {
        return input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
      }
      // Sur les devis : ajoute l'action "Envoyer au client"
      if (context.schemaType === 'quote') {
        // « Publier » un devis au statut « Accepté + payé » inscrit la
        // vente dans Gestion : on enveloppe l'action d'origine.
        const withSale = input.map((a) =>
          a.action === 'publish' ? withSaleOnAccept(a) : a,
        )
        return [
          ...withSale,
          sendQuoteAction,
          sendInvoiceAction,
          downloadQuotePdfAction,
          downloadInvoicePdfAction,
          downloadDeliveryNoteAction,
          registerSaleAction,
        ]
      }
      // Sur les produits : ajoute l'action "Vente au magasin"
      if (context.schemaType === 'product') {
        return [...input, sellInStoreAction]
      }
      // Sur les commandes : ajoute l'action "Télécharger la facture"
      if (context.schemaType === 'order') {
        return [...input, downloadInvoiceAction]
      }
      return input
    },
    // Empêche la création de nouvelles instances de singleton
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (templateItem) => !SINGLETON_TYPES.has(templateItem.templateId),
        )
      }
      return prev
    },
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Mobilier Malin')
          .items([
            // Tableau de bord — s'affiche par défaut à l'arrivée dans le
            // Studio, remplace le panneau blanc vide.
            S.listItem()
              .id('dashboard')
              .title('Tableau de bord')
              .icon(() => '🏠')
              .child(
                S.component(Dashboard)
                  .id('dashboard')
                  .title('Tableau de bord — Mobilier Malin'),
              ),
            // Gestion — registre des ventes, dépenses et charges fixes
            S.listItem()
              .id('gestion')
              .title('Gestion')
              .icon(() => '📊')
              .child(
                S.list()
                  .title('Gestion — ventes et dépenses')
                  .items([
                    S.listItem()
                      .id('pilotage')
                      .title('📈 Pilotage')
                      .child(
                        S.component(PilotageBoard)
                          .id('pilotage')
                          .title('Pilotage — Mobilier Malin'),
                      ),
                    S.divider(),
                    // Vue tableau : toutes les colonnes du suivi côte à
                    // côte, triables, avec totaux et export.
                    S.listItem()
                      .id('salesTable')
                      .title('💰 Ventes')
                      .child(
                        S.component(SalesTableView)
                          .id('salesTable')
                          .title('Toutes les ventes'),
                      ),
                    S.listItem()
                      .id('expensesTable')
                      .title('🧾 Dépenses')
                      .child(
                        S.component(ExpensesTableView)
                          .id('expensesTable')
                          .title('Toutes les dépenses'),
                      ),
                    S.divider(),
                    // La liste classique reste accessible : c'est elle
                    // qui donne les brouillons et la recherche du Studio.
                    S.listItem()
                      .title('Ventes — liste classique')
                      .child(
                        S.documentTypeList('sale')
                          .title('Toutes les ventes')
                          .defaultOrdering([{ field: 'date', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('Dépenses — liste classique')
                      .child(
                        S.documentTypeList('expense')
                          .title('Toutes les dépenses')
                          .defaultOrdering([{ field: 'date', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('🔁 Charges fixes mensuelles')
                      .child(
                        S.documentTypeList('fixedCharge')
                          .title('Charges fixes')
                          .defaultOrdering([{ field: 'amountTtc', direction: 'desc' }]),
                      ),
                  ]),
              ),
            // Base clients — vue consolidée (commandes + devis + contacts)
            S.listItem()
              .id('clients')
              .title('Base clients')
              .icon(() => '👥')
              .child(
                S.component(ClientsDatabase)
                  .id('clients')
                  .title('Base clients — Mobilier Malin'),
              ),
            S.divider(),
            // Singleton : Réglages du site
            S.listItem()
              .title('Réglages du site')
              .icon(() => '⚙️')
              .child(
                S.editor()
                  .id('siteSettings')
                  .schemaType('siteSettings')
                  .documentId('siteSettings'),
              ),
            // Singleton : Charte qualité
            S.listItem()
              .title('Charte qualité')
              .icon(() => '📐')
              .child(
                S.editor()
                  .id('qualityGuide')
                  .schemaType('qualityGuide')
                  .documentId('qualityGuide'),
              ),
            // Pages nationales SEO — landings hors nom de ville
            // Ex: /fauteuil-ergonomique, /bureau-professionnel-occasion, /marques/steelcase
            S.listItem()
              .title('Pages nationales (SEO)')
              .icon(() => '🌐')
              .child(
                S.list()
                  .title('Pages nationales — par type')
                  .items(
                    NATIONAL_PAGE_SECTIONS.flatMap((section) => {
                      const pagesInSection = NATIONAL_PAGES.filter(
                        (p) => p.section === section.key,
                      )
                      if (pagesInSection.length === 0) return []
                      return [
                        S.listItem()
                          .id(`national-section-${section.key}`)
                          .title(section.label)
                          .icon(() => '📂')
                          .child(
                            S.list()
                              .title(section.label)
                              .items(
                                pagesInSection.map((page) =>
                                  S.listItem()
                                    .id(page.key)
                                    .title(page.title)
                                    .icon(() => page.icon)
                                    .child(
                                      S.editor()
                                        .id(page.key)
                                        .title(page.title)
                                        .schemaType('nationalLandingPage')
                                        .documentId(
                                          nationalPageDocumentId(page.key),
                                        )
                                        .initialValueTemplate(
                                          `nationalLandingPage-${page.key}`,
                                        ),
                                    ),
                                ),
                              ),
                          ),
                      ]
                    }),
                  ),
              ),
            // Pages locales (catégorie × ville) — arborescence structurée
            // Toutes les pages attendues apparaissent, même sans document.
            // Chaque clic ouvre l'éditeur (existante ou création pré-remplie).
            S.listItem()
              .title('Pages locales (SEO)')
              .icon(() => '📍')
              .child(
                S.list()
                  .title('Pages locales — par zone')
                  .items(
                    LOCAL_PAGE_SECTIONS.flatMap((section) => {
                      const pagesInSection = LOCAL_PAGES.filter(
                        (p) => p.section === section.key,
                      )
                      if (pagesInSection.length === 0) return []
                      return [
                        S.listItem()
                          .id(`section-${section.key}`)
                          .title(section.label)
                          .icon(() => '📂')
                          .child(
                            S.list()
                              .title(section.label)
                              .items(
                                pagesInSection.map((page) =>
                                  S.listItem()
                                    .id(page.key)
                                    .title(page.title)
                                    .icon(() => page.icon)
                                    .child(
                                      S.editor()
                                        .id(page.key)
                                        .title(page.title)
                                        .schemaType('localPage')
                                        .documentId(
                                          localPageDocumentId(page.key),
                                        )
                                        .initialValueTemplate(
                                          `localPage-${page.key}`,
                                        ),
                                    ),
                                ),
                              ),
                          ),
                      ]
                    }),
                  ),
              ),
            S.divider(),
            // Collections normales
            S.listItem()
              .title('Hero — Slider d\'accueil')
              .icon(() => '🎞️')
              .child(
                S.documentTypeList('heroSlide')
                  .title('Slides du carrousel')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }]),
              ),
            S.listItem()
              .id('mobilier')
              .title('Mobilier (produits)')
              .icon(() => '🪑')
              .child(
                S.list()
                  .title('Mobilier')
                  .items([
                    // Vue galerie visuelle (grille de cartes avec image)
                    S.listItem()
                      .id('productGrid')
                      .title('🖼️ Vue galerie (avec images)')
                      .child(
                        S.component(ProductGridView)
                          .id('productGrid')
                          .title('Galerie produits'),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('🌟 Mis en avant sur la home')
                      .child(
                        S.documentList()
                          .title('Coups de cœur (home)')
                          .filter('_type == "product" && featured == true')
                          .defaultOrdering([{ field: 'featuredOrder', direction: 'asc' }]),
                      ),
                    S.listItem()
                      .title('💎 Pièces d\'exception')
                      .child(
                        S.documentList()
                          .title('Pièces d\'exception (home)')
                          .filter('_type == "product" && exception == true')
                          .defaultOrdering([{ field: 'exceptionOrder', direction: 'asc' }]),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('Tous les produits (vue liste)')
                      .child(
                        S.documentTypeList('product')
                          .title('Tous les produits')
                          .defaultOrdering([
                            { field: 'status', direction: 'asc' },
                            { field: '_createdAt', direction: 'desc' },
                          ]),
                      ),
                  ]),
              ),
            S.listItem()
              .title('Catégories')
              .icon(() => '📁')
              .child(
                S.list()
                  .title('Catégories')
                  .items([
                    S.listItem()
                      .id('categoryGrid')
                      .title('🖼️ Vue galerie (avec images)')
                      .child(
                        S.component(CategoryGridView)
                          .id('categoryGrid')
                          .title('Galerie catégories'),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('Toutes les catégories (vue liste)')
                      .child(
                        S.documentTypeList('category').title('Toutes les catégories'),
                      ),
                  ]),
              ),
            S.divider(),
            // Blog — articles éditoriaux (guides, comparatifs, actu)
            S.listItem()
              .title('Blog')
              .icon(() => '📰')
              .child(
                S.list()
                  .title('Blog — articles')
                  .items([
                    S.listItem()
                      .id('blogGrid')
                      .title('🖼️ Vue galerie (avec images)')
                      .child(
                        S.component(BlogGridView)
                          .id('blogGrid')
                          .title('Galerie articles blog'),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('✅ Articles publiés')
                      .child(
                        S.documentList()
                          .title('Publiés')
                          .filter('_type == "blogPost" && status == "published"')
                          .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('📝 Brouillons')
                      .child(
                        S.documentList()
                          .title('Brouillons')
                          .filter('_type == "blogPost" && status == "draft"')
                          .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('⭐ Mis en avant sur la home')
                      .child(
                        S.documentList()
                          .title('Mis en avant')
                          .filter('_type == "blogPost" && featured == true')
                          .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('🗄️ Archivés')
                      .child(
                        S.documentList()
                          .title('Archivés')
                          .filter('_type == "blogPost" && status == "archived"'),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('Tous les articles')
                      .child(
                        S.documentTypeList('blogPost')
                          .title('Tous les articles')
                          .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
                      ),
                  ]),
              ),
            S.divider(),
            // Cocon éditorial SEO — clusters + articles guides (Sprint 2)
            S.listItem()
              .title('Guides SEO — Clusters')
              .icon(() => '📚')
              .child(
                S.documentTypeList('guideCluster')
                  .title('Clusters de guides (silos)')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }]),
              ),
            S.listItem()
              .title('Guides SEO — Articles')
              .icon(() => '📄')
              .child(
                S.list()
                  .title('Articles guides')
                  .items([
                    S.listItem()
                      .title('✅ Publiés')
                      .child(
                        S.documentList()
                          .title('Articles publiés')
                          .filter('_type == "guideArticle" && status == "published"')
                          .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('📝 Brouillons')
                      .child(
                        S.documentList()
                          .title('Brouillons')
                          .filter('_type == "guideArticle" && status == "draft"')
                          .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('🗄️ Archivés')
                      .child(
                        S.documentList()
                          .title('Archivés')
                          .filter('_type == "guideArticle" && status == "archived"'),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('Tous les articles guides')
                      .child(
                        S.documentTypeList('guideArticle')
                          .title('Tous les articles')
                          .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
                      ),
                  ]),
              ),
            S.divider(),
            // Commandes (paiements Stripe) — auto-créées par le webhook
            S.listItem()
              .title('Commandes')
              .icon(() => '🛒')
              .child(
                S.list()
                  .title('Commandes')
                  .items([
                    S.listItem()
                      .title('🟡 À préparer (paiement reçu)')
                      .child(
                        S.documentList()
                          .title('À préparer')
                          .filter('_type == "order" && status == "paid"')
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('📦 Prêtes (retrait / livraison)')
                      .child(
                        S.documentList()
                          .title('Prêtes')
                          .filter('_type == "order" && status == "ready"')
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('✅ Retirées / livrées')
                      .child(
                        S.documentList()
                          .title('Terminées')
                          .filter('_type == "order" && status == "fulfilled"')
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('❌ Annulées / remboursées')
                      .child(
                        S.documentList()
                          .title('Annulées')
                          .filter('_type == "order" && status == "refunded"')
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }]),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('Toutes les commandes')
                      .child(
                        S.documentTypeList('order')
                          .title('Toutes les commandes')
                          .defaultOrdering([{ field: 'placedAt', direction: 'desc' }]),
                      ),
                  ]),
              ),
            // Messages du formulaire de contact — archivés par /api/contact
            S.listItem()
              .id('contactMessages')
              .title('Messages contact')
              .icon(() => '✉️')
              .child(
                S.list()
                  .title('Messages contact')
                  .items([
                    S.listItem()
                      .title('🟡 À répondre')
                      .child(
                        S.documentList()
                          .title('À répondre')
                          .filter('_type == "contactMessage" && handled != true')
                          .defaultOrdering([{ field: 'receivedAt', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('✅ Traités')
                      .child(
                        S.documentList()
                          .title('Traités')
                          .filter('_type == "contactMessage" && handled == true')
                          .defaultOrdering([{ field: 'receivedAt', direction: 'desc' }]),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('Tous les messages')
                      .child(
                        S.documentTypeList('contactMessage')
                          .title('Tous les messages')
                          .defaultOrdering([{ field: 'receivedAt', direction: 'desc' }]),
                      ),
                  ]),
              ),
            // Devis de livraison (workflow B2B)
            S.listItem()
              .id('devisLivraison')
              .title('Devis livraison')
              .icon(() => '📋')
              .child(
                S.list()
                  .title('Devis livraison')
                  .items([
                    // Raccourci vers la page dédiée /admin/nouveau-devis
                    S.listItem()
                      .id('nouveauDevisLink')
                      .title('➕ Créer un nouveau devis')
                      .icon(() => '📄')
                      .child(
                        S.component(NouveauDevisLink)
                          .id('nouveauDevisLink')
                          .title('Créer un nouveau devis'),
                      ),
                    // Raccourci vers /admin/nouvelle-facture (paiement direct)
                    S.listItem()
                      .id('nouvelleFactureLink')
                      .title('🧾 Créer une nouvelle facture')
                      .icon(() => '💳')
                      .child(
                        S.component(NouvelleFactureLink)
                          .id('nouvelleFactureLink')
                          .title('Créer une nouvelle facture'),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('🟡 À traiter (nouveaux)')
                      .child(
                        S.documentList()
                          .title('À traiter')
                          .filter('_type == "quote" && status == "pending"')
                          .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
                      ),
                    S.listItem()
                      .title('✏️ En préparation')
                      .child(
                        S.documentList()
                          .title('En préparation')
                          .filter('_type == "quote" && status == "draft"'),
                      ),
                    S.listItem()
                      .title('📤 Envoyés (en attente client)')
                      .child(
                        S.documentList()
                          .title('Envoyés')
                          .filter('_type == "quote" && status == "sent"'),
                      ),
                    S.listItem()
                      .title('✅ Acceptés + payés')
                      .child(
                        S.documentList()
                          .title('Acceptés')
                          .filter('_type == "quote" && status == "accepted"'),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('Tous les devis')
                      .child(
                        S.documentTypeList('quote')
                          .title('Tous les devis')
                          .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
                      ),
                  ]),
              ),
          ]),
    }),
    ...(isDev ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
})
