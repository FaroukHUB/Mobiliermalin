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
        "OBLIGATOIRE : appelle cette fonction dès qu'un utilisateur mentionne un type de mobilier (bureau, fauteuil, chaise, armoire, table, etc.) OU une marque OU un budget. Ne réponds JAMAIS sur les produits/prix/stocks sans l'avoir appelée. Elle interroge le catalogue Sanity en temps réel. IMPORTANT : privilégie categorySlug plutôt que query quand le type de mobilier est clair — ex: si l'utilisateur dit 'bureau', utilise categorySlug='bureaux-individuels' PAS query='bureau'.",
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Termes de recherche libre. À utiliser SEULEMENT si l\'utilisateur mentionne un nom de modèle spécifique (ex: "Leap V2", "Aeron"), une couleur, une caractéristique ("assis-debout", "à roulettes"). NE PAS mettre le type de mobilier ici (utiliser categorySlug à la place).',
          },
          categorySlug: {
            type: 'string',
            description:
              'Filtre par catégorie. À privilégier dès que possible. Mappings français → slug : "bureau" ou "bureaux" → "bureaux-individuels" | "fauteuil" ou "siège" → "fauteuils-ergonomiques" | "chaise réunion/accueil/visiteur" → "chaises-accueil-reunion" | "chaise formation" → "chaises-formation" | "table réunion" → "tables-de-reunion" | "armoire" ou "rangement" → "armoires-rangements" | "caisson" → "caissons" | "canapé, pouf, tabouret, mange-debout" → "espaces-detente"',
            enum: [
              'bureaux-individuels',
              'fauteuils-ergonomiques',
              'chaises-accueil-reunion',
              'chaises-formation',
              'tables-de-reunion',
              'armoires-rangements',
              'caissons',
              'espaces-detente',
            ],
          },
          brand: {
            type: 'string',
            description:
              "Filtre par marque. Utiliser SEULEMENT si l'utilisateur a explicitement cité la marque. Ex: Steelcase, Herman Miller, Haworth, Vitra, USM Haller, Majencia, ICF, Zuco, Actiu, Urban Mesh, Habitat",
          },
          maxPrice: {
            type: 'number',
            description:
              "Prix maximum en euros TTC. Si l'utilisateur dit 'budget 200€' ou 'moins de 200€', mettre 200. Ne pas définir si aucun budget mentionné.",
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

type SanityProductResult = {
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
}

// Mots-clés implicites déduits d'un slug de catégorie — utilisés comme
// fallback text-search quand aucun produit n'a la catégorie assignée
// dans Sanity (cas fréquent après import automatique).
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'bureaux-individuels': ['bureau'],
  'fauteuils-ergonomiques': ['fauteuil', 'siege', 'siège'],
  'chaises-accueil-reunion': ['chaise'],
  'chaises-formation': ['chaise', 'formation'],
  'tables-de-reunion': ['table'],
  'armoires-rangements': ['armoire', 'rangement'],
  caissons: ['caisson'],
  'espaces-detente': ['tabouret', 'canapé', 'pouf', 'mange-debout'],
}

async function searchProducts(args: ToolCallArgs) {
  const rawQuery = String(args.query || '').trim()
  const categorySlug = args.categorySlug ? String(args.categorySlug) : null
  const brand = args.brand ? String(args.brand).trim() : null
  const maxPrice = typeof args.maxPrice === 'number' ? args.maxPrice : null

  console.log('[chat/search_products] args reçus:', {
    rawQuery,
    categorySlug,
    brand,
    maxPrice,
  })

  // Prépare les mots-clés de recherche : combine query utilisateur +
  // mots-clés implicites de la catégorie (ex: bureaux-individuels → "bureau")
  const words = rawQuery.split(/\s+/).filter((w) => w.length >= 2)
  if (categorySlug && CATEGORY_KEYWORDS[categorySlug]) {
    for (const kw of CATEGORY_KEYWORDS[categorySlug]) {
      if (!words.map((w) => w.toLowerCase()).includes(kw.toLowerCase())) {
        words.push(kw)
      }
    }
  }
  const queryWords = words.map((w) => w + '*')

  // ─── Stratégie multi-passes ────────────────────────────────────
  // 1er essai : filtres stricts (catégorie + prix + marque + mots)
  // 2e essai : sans catégorie (Djamel peut avoir importé sans la
  //   référence catégorie assignée)
  // 3e essai : uniquement les mots-clés et prix (broader search)

  async function runQuery(
    useCat: boolean,
    useBrand: boolean,
    useWords: boolean,
  ): Promise<SanityProductResult[]> {
    const params: Record<string, string | number | string[]> = {}
    if (useCat && categorySlug) params.categorySlug = categorySlug
    if (useBrand && brand) params.brand = brand + '*'
    if (useWords && queryWords.length > 0) params.queryWords = queryWords
    if (maxPrice !== null) params.maxPrice = maxPrice

    const groqQuery = `*[_type == "product" && status == "published"
         ${useBrand && brand ? '&& brand match $brand' : ''}
         ${useCat && categorySlug ? '&& category->slug.current == $categorySlug' : ''}
         ${maxPrice ? '&& (coalesce(salePrice, price) <= $maxPrice)' : ''}
         ${useWords && queryWords.length > 0 ? '&& (name match $queryWords || shortDescription match $queryWords || brand match $queryWords || category->name match $queryWords)' : ''}
       ] | order(_updatedAt desc) [0...8] {
        _id, name, slug, price, salePrice, stock, brand, condition, shortDescription,
        category->{ name, slug }
      }`

    try {
      const r = await sanityClient.fetch<SanityProductResult[]>(groqQuery, params)
      console.log(
        `[chat/search_products] pass useCat=${useCat} useBrand=${useBrand} useWords=${useWords} → ${r.length} résultats`,
      )
      return r
    } catch (err) {
      console.error('[chat/search_products] Sanity error:', err)
      return []
    }
  }

  // Pass 1 : tout strict
  let results = await runQuery(!!categorySlug, !!brand, queryWords.length > 0)

  // Pass 2 : sans catégorie (cas produits importés sans référence catégorie)
  if (results.length === 0 && categorySlug) {
    results = await runQuery(false, !!brand, queryWords.length > 0)
  }

  // Pass 3 : sans marque non plus, juste mots + prix
  if (results.length === 0 && brand) {
    results = await runQuery(false, false, queryWords.length > 0)
  }

  console.log('[chat/search_products] ' + results.length + ' résultats finaux')

  if (results.length === 0) {
    return {
      count: 0,
      message:
        'Aucun produit ne correspond exactement à cette recherche dans le stock actuellement listé en ligne. IMPORTANT — Notre stock évolue chaque semaine et beaucoup de pièces ne sont pas encore listées sur le site. Tu dois : (1) proposer à l\'utilisateur de reformuler ou d\'élargir sa recherche (retirer le filtre marque, augmenter le prix max, essayer une catégorie proche) ; (2) l\'encourager fortement à nous contacter directement — au 06 76 61 70 53, sur WhatsApp (bouton vert en bas à droite du site) ou par email mobiliermalin@gmail.com — parce que notre équipe connaît le stock atelier qui n\'est pas encore en ligne ; (3) l\'inviter à consulter la boutique complète sur /boutique. Ne jamais répondre juste "je n\'ai rien" sec — toujours proposer une alternative constructive.',
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
