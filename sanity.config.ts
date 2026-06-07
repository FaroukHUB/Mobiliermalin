/**
 * Configuration Sanity Studio.
 * Le Studio est monté sur /studio (voir src/app/studio/[[...tool]]/page.tsx).
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { sendQuoteAction } from './sanity/actions/sendQuoteAction'
import { projectId, dataset, apiVersion } from './sanity/env'

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
  schema: { types: schemaTypes },
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
            // Pages locales (catégorie × ville)
            S.listItem()
              .title('Pages locales (SEO)')
              .icon(() => '📍')
              .child(
                S.documentTypeList('localPage')
                  .title('Pages locales')
                  .defaultOrdering([{ field: 'pageKey', direction: 'asc' }]),
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
