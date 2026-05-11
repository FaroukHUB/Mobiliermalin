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
 * Stub statique : le front Next.js ne fetch plus rien en DB.
 * Pour personnaliser les images : remplacer les URLs dans les composants
 * (Hero, Manifeste, LLD, Showroom...) ou déposer un fichier dans /public/
 * et changer la URL pointée.
 *
 * La vraie boutique (avec admin) tourne sur WordPress + WooCommerce, séparé.
 */
export function getSiteSettings(): SiteSettings {
  return {}
}
