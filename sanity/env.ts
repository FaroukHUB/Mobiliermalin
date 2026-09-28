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

// useCdn : le CDN de Sanity sert les mêmes données depuis un cache
// mondial, et surtout il est décompté d'un quota à part, bien plus
// large (1 000 000 de requêtes par mois sur Growth, contre 250 000 pour
// l'API directe). Le site l'a eu désactivé un temps, à cause d'un type
// de document nouvellement créé que le CDN servait encore vide : un
// problème de propagation passager, qui ne justifie pas d'y renoncer.
// Résultat de cette désactivation : 250 400 requêtes API consommées et
// le quota dépassé, pendant que le compteur CDN affichait 1 requête.
//
// Pour le couper de nouveau sans toucher au code, mettre la variable
// d'environnement NEXT_PUBLIC_SANITY_USE_CDN à "false" sur Vercel.
export const useCdn = process.env.NEXT_PUBLIC_SANITY_USE_CDN !== 'false'

if (!projectId && typeof window === 'undefined') {
  console.warn(
    '[sanity] NEXT_PUBLIC_SANITY_PROJECT_ID manquant. Le site tourne en mode dégradé (pages produits vides). Voir /sanity-setup/README.md.',
  )
}
