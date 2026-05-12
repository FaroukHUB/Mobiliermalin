/**
 * Variables d'environnement Sanity.
 * Configurables via .env (local) ou Vercel (production).
 */

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'NEXT_PUBLIC_SANITY_PROJECT_ID manquant — voir /sanity-setup/README.md',
)

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-09-01'

export const useCdn = true

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    // En dev / build sans projectId configuré, on tolère pour ne pas bloquer.
    // Le Studio renverra alors une erreur claire à la 1ère connexion.
    if (process.env.NODE_ENV !== 'production') return '' as T
    throw new Error(errorMessage)
  }
  return v
}
