/**
 * Type partagé utilisé par les composants Section pour leur prop `image`.
 * La vraie source de données est désormais Sanity (cf src/lib/sanity.ts).
 */
export type MediaImage = {
  url?: string
  alt?: string
  width?: number
  height?: number
}
