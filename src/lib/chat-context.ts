/**
 * Contexte du chatbot IA Mobilier Malin.
 *
 * Contient :
 *   - Le prompt système riche qui décrit l'entreprise, les produits,
 *     les zones de livraison, les valeurs, les règles de réponse
 *   - Le schéma des outils que le LLM peut appeler (function calling)
 *   - Les implémentations des outils (search_products, list_categories,
 *     get_category_info)
 *
 * Modèle utilisé : Grok 4 Fast (xAI) — API compatible OpenAI.
 * Endpoint : https://api.x.ai/v1/chat/completions
 */

import { LEGAL } from './legal'
import { sanityClient } from './sanity'

// ─── PROMPT SYSTÈME ────────────────────────────────────────────

export const SYSTEM_PROMPT = `Tu es **Malin**, l'assistant IA de Mobilier Malin.

# QUI TU ES
Tu représentes Mobilier Malin, spécialiste français du mobilier de bureau
professionnel reconditionné, basé en région PACA. Tu es chaleureux, direct,
concis, en français impeccable. Tu ne t'excuses jamais, tu résous.

# L'ENTREPRISE
- **Nom commercial** : Mobilier Malin
- **Raison sociale** : SARL 2 M (SIREN ${LEGAL.siren})
- **Gérant** : ${LEGAL.gerant}, entrepreneur marseillais qui a fondé l'entreprise en 2021
- **Atelier & showroom** : 18 chemin Noël Robion, ${LEGAL.showroom.codePostal} La Penne-sur-Huveaune
  (à 5 min d'Aubagne, 20 min de Marseille, 45 min d'Aix-en-Provence)
- **Horaires showroom** : lundi au samedi, 10h-18h, uniquement sur rendez-vous
- **Fermé** : dimanche
- **Téléphone** : ${LEGAL.telephone}
- **Email** : ${LEGAL.email}
- **Site** : https://mobiliermalin.com

# CE QU'ON FAIT
Nous récupérons du mobilier de bureau professionnel (fauteuils, bureaux,
armoires, tables de réunion) sur les sites d'entreprises qui renouvellent
leur parc ou libèrent leurs locaux. Chaque pièce passe par notre atelier :
démontage, contrôle qualité 7 points, remplacement des pièces d'usure,
nettoyage professionnel. Puis on revend à 40-70 % du prix neuf.

# MARQUES DISTRIBUÉES
Steelcase (Leap V2, Think, Gesture), Herman Miller (Aeron, Sayl, Embody),
Haworth (Zody, Comforto), Vitra (ID Trim, ID Air), USM Haller, Majencia,
ICF, Zuco, Actiu, Urban Mesh, Habitat.

# CATÉGORIES DE PRODUITS
- Bureaux individuels (droits, angle, bench, assis-debout)
- Fauteuils ergonomiques
- Chaises d'accueil & réunion
- Chaises de formation (avec tablette écritoire)
- Tables de réunion
- Armoires & rangements
- Caissons de bureau
- Espaces détente (canapés, poufs, tabourets, mange-debout)

# SERVICES SUR MESURE
- **Vidage de locaux** professionnels (visite gratuite sous 48h)
- **Rachat de mobilier** d'entreprise
- **Location Longue Durée** (LLD 36 mois, services inclus)
- **Attestation RSE** chiffrée pour rapports bilan carbone / CSRD

# ZONES DE LIVRAISON
Marseille (tous arrondissements), Aubagne, Aix-en-Provence, La Ciotat,
Toulon, Avignon, Orange, Nice, et toute la région PACA sur devis.
Livraison sur toute la France pour les commandes volume (> 5 unités).
Retrait gratuit au showroom.

# GARANTIES
- Garantie légale de conformité (12 mois pour l'occasion, article L217-3
  du Code de la consommation)
- Garantie des vices cachés (2 ans, article 1641 Code civil)
- 14 jours de rétractation pour les particuliers (loi Hamon)

# RÈGLES DE COMPORTEMENT
1. Toujours répondre en FRANÇAIS
2. Rester **CONCIS** — 3-4 phrases par réponse en général. Détaille
   uniquement quand la question l'exige.
3. Si on te demande un produit précis, UTILISE l'outil search_products
   pour vérifier en direct — ne jamais inventer un prix ou un stock.
4. Si un utilisateur veut acheter, guide-le vers /produit/[slug] ou
   /boutique.
5. Si la question est complexe (vidage volumique, devis livraison
   grande distance, choix technique pointu), oriente vers le contact
   téléphonique ${LEGAL.telephone} ou email ${LEGAL.email}. WhatsApp
   aussi disponible (bouton vert en bas à droite du site).
6. Pour les questions administratives, factures, remboursements → email
   uniquement (traçabilité).
7. Ne parle jamais des concurrents en mal.
8. Ne fais jamais de promesses sur des délais ou remises que tu ne peux
   pas garantir.
9. Si on te demande "es-tu une IA ?" → réponds honnêtement oui, tu es
   un assistant IA (basé sur Gemini de Google) mais tu représentes
   Mobilier Malin et tu es là pour aider.
10. Utilise les **markdown links** au format [texte](/url) pour renvoyer
    vers les pages du site.

# LIENS UTILES DU SITE
- /boutique — catalogue complet
- /categorie/fauteuils-ergonomiques — tous les fauteuils
- /categorie/bureaux-individuels — tous les bureaux
- /categorie/armoires-rangements — armoires et rangements
- /categorie/tables-de-reunion — tables de réunion
- /categorie/chaises-formation — chaises de formation
- /categorie/espaces-detente — espaces détente
- /rachat-mobilier-bureau — rachat parc entreprise
- /vidage-de-locaux — vidage locaux pro
- /location-mobilier-bureau — location LLD 36 mois
- /attestation-rse — attestation RSE
- /charte-qualite — notre méthode reconditionnement
- /contact — formulaire contact
- /blog — guides et conseils

Commence par te présenter brièvement puis pose la question à l'utilisateur.`

// ─── SCHÉMA DES OUTILS (compatible OpenAI / xAI) ───────────────

export const TOOLS_SCHEMA = [
  {
    type: 'function' as const,
    function: {
      name: 'search_products',
      description:
        "Cherche des produits dans le catalogue Sanity de Mobilier Malin. À utiliser dès qu'un utilisateur mentionne un besoin de mobilier (fauteuil, bureau, armoire, etc.) ou une marque ou un budget. Retourne les 5 meilleurs résultats.",
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Termes de recherche libre (nom du produit, marque, caractéristique). Ex: "fauteuil ergonomique Steelcase", "bureau assis-debout", "armoire métallique grise"',
          },
          categorySlug: {
            type: 'string',
            description:
              'Filtre par catégorie. Slugs disponibles : bureaux-individuels, fauteuils-ergonomiques, chaises-accueil-reunion, chaises-formation, tables-de-reunion, armoires-rangements, caissons, espaces-detente',
          },
          brand: {
            type: 'string',
            description:
              "Filtre par marque. Ex: Steelcase, Herman Miller, Haworth, Vitra, USM Haller, Majencia, ICF, Zuco, Actiu, Urban Mesh, Habitat",
          },
          maxPrice: {
            type: 'number',
            description: 'Prix maximum en euros TTC',
          },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_categories',
      description:
        'Liste toutes les catégories de produits actives sur le site avec leur nombre de produits publiés. À utiliser quand un utilisateur demande "quels types de mobilier proposez-vous ?" ou similaire.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_showroom_info',
      description:
        "Retourne les infos pratiques du showroom : adresse, horaires, téléphone, comment prendre rendez-vous. À utiliser quand l'utilisateur veut visiter, ou demande où on est, ou veut prendre rendez-vous.",
      parameters: { type: 'object', properties: {} },
    },
  },
]

// ─── IMPLÉMENTATION DES OUTILS ─────────────────────────────────

type ToolCallArgs = Record<string, unknown>

export async function executeToolCall(name: string, args: ToolCallArgs) {
  switch (name) {
    case 'search_products':
      return await searchProducts(args)
    case 'list_categories':
      return await listCategories()
    case 'get_showroom_info':
      return getShowroomInfo()
    default:
      return { error: `Outil inconnu : ${name}` }
  }
}

async function searchProducts(args: ToolCallArgs) {
  const query = String(args.query || '').toLowerCase().trim()
  const categorySlug = args.categorySlug ? String(args.categorySlug) : null
  const brand = args.brand ? String(args.brand).toLowerCase() : null
  const maxPrice = typeof args.maxPrice === 'number' ? args.maxPrice : null

  // Construit les params ET la query dynamiquement
  const params: Record<string, string | number> = {}
  if (query) params.query = `*${query}*`
  if (brand) params.brand = `*${brand}*`
  if (categorySlug) params.categorySlug = categorySlug
  if (maxPrice !== null) params.maxPrice = maxPrice

  const results = await sanityClient
    .fetch<
      Array<{
        _id: string
        name: string
        slug: { current: string }
        price: number
        salePrice?: number
        stock: number
        brand?: string
        condition?: string
        shortDescription?: string
        category?: { name?: string; slug?: { current: string } }
      }>
    >(
      `*[_type == "product" && status == "published"
         ${brand ? '&& lower(brand) match $brand' : ''}
         ${categorySlug ? '&& category->slug.current == $categorySlug' : ''}
         ${maxPrice ? '&& (coalesce(salePrice, price) <= $maxPrice)' : ''}
         ${query ? '&& (lower(name) match $query || lower(shortDescription) match $query || lower(brand) match $query)' : ''}
       ] | order(_updatedAt desc) [0...5] {
        _id, name, slug, price, salePrice, stock, brand, condition, shortDescription,
        category->{ name, slug }
      }`,
      params,
    )
    .catch(() => [] as never[])

  if (results.length === 0) {
    return {
      count: 0,
      message:
        "Aucun produit ne correspond à cette recherche dans le stock actuellement en ligne. Le stock évolue chaque semaine — l'utilisateur peut nous contacter pour connaître les arrivages à venir.",
    }
  }

  return {
    count: results.length,
    products: results.map((p) => ({
      name: p.name,
      brand: p.brand,
      condition: p.condition,
      priceEur: p.salePrice ?? p.price,
      originalPriceEur: p.salePrice ? p.price : null,
      stock: p.stock,
      category: p.category?.name,
      url: `/produit/${p.slug.current}`,
      shortDescription: p.shortDescription,
    })),
  }
}

async function listCategories() {
  const cats = await sanityClient
    .fetch<
      Array<{
        name: string
        slug: { current: string }
        productCount: number
      }>
    >(
      `*[_type == "category" && !defined(parent)] | order(order asc, name asc) {
        name,
        slug,
        "productCount": count(*[_type == "product" && status == "published" && references(^._id)])
      }`,
    )
    .catch(() => [] as never[])

  return {
    categories: cats.map((c) => ({
      name: c.name,
      url: `/categorie/${c.slug.current}`,
      productCount: c.productCount,
    })),
  }
}

function getShowroomInfo() {
  return {
    name: LEGAL.nomCommercial,
    address: `${LEGAL.showroom.ligne1}, ${LEGAL.showroom.codePostal} ${LEGAL.showroom.ville}`,
    phone: LEGAL.telephone,
    phoneTel: LEGAL.telephoneTel,
    email: LEGAL.email,
    schedule: {
      lundiSamedi: '10h à 18h (sur rendez-vous uniquement)',
      dimanche: 'fermé',
    },
    proximity: '5 min d\'Aubagne, 20 min de Marseille, 45 min d\'Aix-en-Provence',
    contactUrl: '/contact',
    mapsQuery: encodeURIComponent(
      `${LEGAL.showroom.ligne1}, ${LEGAL.showroom.codePostal} ${LEGAL.showroom.ville}`,
    ),
  }
}
