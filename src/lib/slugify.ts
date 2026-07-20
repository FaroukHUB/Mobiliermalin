/**
 * Slugify partagé utilisé pour générer les ancres H2/H3 dans le Portable
 * Text éditorial et les entrées de sommaire. La même fonction est
 * appelée côté serveur (pour l'id du <h2>) et pour la liste TOC — les
 * deux slugs doivent matcher pour que le sommaire fonctionne.
 *
 * Retire les accents (via NFD + retrait des combining marks U+0300 à
 * U+036F), remplace les caractères non alphanumériques par des tirets,
 * met en minuscules, tronque à 80 caractères.
 */
export function slugifyHeading(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[‘’']/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

/**
 * Extrait le texte plain d'un noeud React ou d'un tableau de children,
 * utile pour générer l'id d'un <h2> depuis les children Portable Text.
 */
export function extractText(node: unknown): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && 'props' in (node as Record<string, unknown>)) {
    const props = (node as { props?: { children?: unknown } }).props
    return extractText(props?.children)
  }
  return ''
}
