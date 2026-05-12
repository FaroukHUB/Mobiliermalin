/**
 * Configuration Sanity Studio.
 * Le Studio est monté sur /studio (voir src/app/studio/[[...tool]]/page.tsx).
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { projectId, dataset, apiVersion } from './sanity/env'

const SINGLETON_TYPES = new Set(['siteSettings'])
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'mobilier-malin',
  title: 'Mobilier Malin — Espace de gestion',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  document: {
    // Sur les singletons : retire les actions "Duplicate" et "Delete"
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType)
        ? input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : input,
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
            S.divider(),
            // Collections normales
            S.listItem()
              .title('Mobilier (produits)')
              .icon(() => '🪑')
              .child(
                S.documentTypeList('product')
                  .title('Mobilier (produits)')
                  .defaultOrdering([
                    { field: 'status', direction: 'asc' },
                    { field: '_createdAt', direction: 'desc' },
                  ]),
              ),
            S.listItem()
              .title('Catégories')
              .icon(() => '📁')
              .child(S.documentTypeList('category').title('Catégories')),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
