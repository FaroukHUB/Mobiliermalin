import { defineCliConfig } from 'sanity/cli'

/**
 * Configuration du CLI Sanity (npx sanity ...).
 *
 * Requis pour les commandes admin comme :
 *   npx sanity dataset export production ./backup.tar.gz
 *   npx sanity dataset import ./backup.tar.gz production
 *   npx sanity documents query "*[_type=='product']"
 *
 * Note : les fetches côté application (site public, Studio, scripts de
 * seed) utilisent leur propre client Sanity configuré via les variables
 * d'environnement — voir src/lib/sanity.ts.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'srangulm',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  },
})
