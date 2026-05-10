import { getPayloadClient } from './payload'

export type MediaImage = {
  url?: string
  alt?: string
  width?: number
  height?: number
}

export type SiteSettings = {
  logoOnLight?: MediaImage
  logoOnDark?: MediaImage
  manifesteImage?: MediaImage
  lldSectionImage?: MediaImage
  showroomImage?: MediaImage
  lldHeroImage?: MediaImage
  rseHeroImage?: MediaImage
}

/**
 * Recupere les reglages du site (logos + images des sections strategiques)
 * depuis la collection singleton Payload `site-settings`. Retourne un objet
 * vide si la DB n'est pas joignable ou si aucune fiche n'a encore ete creee.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'site-settings',
      limit: 1,
      depth: 2,
    })
    if (result.docs.length === 0) return {}
    return result.docs[0] as unknown as SiteSettings
  } catch (err) {
    console.warn('[site-settings] fallback (DB unreachable):', err)
    return {}
  }
}

/**
 * Helper qui retourne l'URL d'une image Payload si disponible, sinon
 * une URL de fallback (Unsplash placeholder).
 */
export function imageUrl(
  image: MediaImage | undefined | null,
  fallback: string,
): string {
  return image?.url || fallback
}

/**
 * Idem pour le texte alternatif.
 */
export function imageAlt(
  image: MediaImage | undefined | null,
  fallback: string,
): string {
  return image?.alt || fallback
}
