/**
 * Client Sanity avec token d'écriture, pour les routes API qui doivent
 * créer/modifier des documents (devis, etc.). À ne JAMAIS exposer côté
 * client — utilisable uniquement côté serveur Next.js.
 *
 * Le token doit être stocké dans la variable d'env SANITY_WRITE_TOKEN
 * (à créer sur sanity.io/manage → API → Tokens → Editor).
 */

import { createClient, type SanityClient } from 'next-sanity'
import { projectId, dataset, apiVersion } from '../../sanity/env'

let cached: SanityClient | null = null

export function getWriteClient(): SanityClient | null {
  const token = process.env.SANITY_WRITE_TOKEN
  if (!projectId || !token) return null
  if (cached) return cached
  cached = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
    perspective: 'published',
  })
  return cached
}

export function isSanityWriteConfigured(): boolean {
  return !!process.env.SANITY_WRITE_TOKEN && !!projectId
}
