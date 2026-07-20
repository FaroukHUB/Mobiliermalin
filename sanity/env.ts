/**
 * Variables d'environnement Sanity.
 * Configurables via .env (local) ou Vercel (production).
 *
 * IMPORTANT : on ne plante PAS le build si projectId est absent.
 * Le site tourne avec des pages vides + console.warn, c'est plus
 * confortable pour le déploiement initial.
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-09-01'

// useCdn désactivé : le CDN Sanity (apicdn.sanity.io) a servi des
// résultats vides périmés pour le type nationalLandingPage (cache non
// invalidé après création des docs), alors que l'API directe
// (api.sanity.io) renvoie les bons résultats. Next.js met déjà en
// cache les réponses via ISR (safeFetch → next.revalidate), donc le
// CDN Sanity était une double couche de cache sans bénéfice ici.
export const useCdn = false

if (!projectId && typeof window === 'undefined') {
  console.warn(
    '[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID manquant. Le site tourne en mode dégradé (pages produits vides). Voir /sanity-setup/README.md.',
  )
}
