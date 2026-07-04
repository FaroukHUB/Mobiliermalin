/**
 * Configuration Sanity Studio.
 * Le Studio est monté sur /studio (voir src/app/studio/[[...tool]]/page.tsx).
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { sendQuoteAction } from './sanity/actions/sendQuoteAction'
import { downloadInvoiceAction } from './sanity/actions/downloadInvoiceAction'
import { Dashboard } from './sanity/dashboard/Dashboard'
import { projectId, dataset, apiVersion } from './sanity/env'
import {
  LOCAL_PAGES,
  LOCAL_PAGE_SECTIONS,
  localPageDocumentId,
} from './sanity/localPagesRegistry'

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
      ...prev.filter((t) => t.schemaType !== 'localPage'),
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
        return [...input, sendQuoteAction]
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
              .title('Mobilier (produits)')
              .icon(() => '🪑')
              .child(
                S.list()
                  .title('Mobilier')
                  .items([
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
                      .title('Tous les produits')
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
              .child(S.documentTypeList('category').title('Catégories')),
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
            // Devis de livraison (workflow B2B)
            S.listItem()
              .title('Devis livraison')
              .icon(() => '📋')
              .child(
                S.list()
                  .title('Devis livraison')
                  .items([
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
