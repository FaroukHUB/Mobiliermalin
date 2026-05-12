/**
 * Configuration Sanity Studio.
 * Le Studio est monté sur /studio (voir src/app/studio/[[...tool]]/page.tsx).
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'
import { projectId, dataset, apiVersion } from './sanity/env'

export default defineConfig({
  name: 'mobilier-malin',
  title: 'Mobilier Malin — Espace de gestion',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Mobilier Malin')
          .items([
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
