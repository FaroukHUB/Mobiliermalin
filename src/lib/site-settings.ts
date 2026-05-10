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
 * Recupere les reglages du site (images des sections strategiques)
 * depuis le global Payload `site-settings`. Retourne un objet vide
 * si la DB n'est pas joignable ou si le global n'a jamais ete enregistre.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 2,
    })
    return settings as unknown as SiteSettings
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
