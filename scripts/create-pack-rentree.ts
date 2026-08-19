#!/usr/bin/env tsx
/**
 * Crée l'offre "Pack spécial rentrée" dans Sanity :
 *
 *   1. Une catégorie "Pack spécial rentrée" (slug pack-special-rentree)
 *   2. Trois produits à 129 € TTC, un par modèle de bureau, rattachés
 *      à cette catégorie
 *
 * Les produits sont créés en BROUILLON (status draft) : ils
 * n'apparaissent pas sur le site tant que tu n'as pas ajouté les
 * photos et renommé les modèles dans Studio, puis basculé le statut
 * sur "Publié".
 *
 * Contenu : uniquement ce qui figure sur l'affiche (bureau 160×80,
 * bureau + fauteuil + caisson, reconditionné, contrôlé, livraison et
 * montage possibles). Les noms des trois modèles sont des libellés
 * neutres à remplacer par les vrais modèles dans Studio.
 *
 * Idempotent : relancer le script ne crée pas de doublons (upsert par
 * _id fixe). Les modifications faites dans Studio sur ces documents
 * seraient en revanche écrasées par une relance — à lancer une fois.
 *
 * Usage :
 *   npx dotenv -e .env.local -- npx tsx scripts/create-pack-rentree.ts
 *   npx dotenv -e .env.local -- npx tsx scripts/create-pack-rentree.ts --apply --confirm=YES
 */

import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId) {
  console.error('❌ NEXT_PUBLIC_SANITY_PROJECT_ID manquant.')
  process.exit(1)
}

const args = process.argv.slice(2)
const isDryRun = !args.includes('--apply')
const confirm = args.find((a) => a.startsWith('--confirm='))?.split('=')[1]

if (!isDryRun && !token) {
  console.error('❌ SANITY_WRITE_TOKEN manquant pour --apply.')
  process.exit(1)
}
if (!isDryRun && confirm !== 'YES') {
  console.error('❌ --apply requiert --confirm=YES.')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const CATEGORY_ID = 'category.pack-special-rentree'
const PRICE_TTC = 129
const STOCK_PER_MODEL = 5 // à ajuster dans Studio selon le stock réel

const CATEGORY = {
  _id: CATEGORY_ID,
  _type: 'category',
  name: 'Pack spécial rentrée',
  slug: { _type: 'slug', current: 'pack-special-rentree' },
  description:
    'Bureau, fauteuil et caisson réunis dans un pack complet à prix unique. Mobilier professionnel reconditionné dans notre atelier, contrôlé et prêt à l\'emploi',
  order: 1,
}

/**
 * Les trois modèles de bureau. Renomme chaque produit dans Studio avec
 * le vrai nom du modèle, et ajoute ses photos avant de le publier.
 */
const MODELS = [
  { key: 'modele-1', label: 'Modèle 1' },
  { key: 'modele-2', label: 'Modèle 2' },
  { key: 'modele-3', label: 'Modèle 3' },
]

function buildProduct(model: { key: string; label: string }) {
  return {
    _id: `product.pack-rentree-${model.key}`,
    _type: 'product',
    name: `Pack spécial rentrée — bureau ${model.label} + fauteuil + caisson`,
    slug: {
      _type: 'slug',
      current: `pack-special-rentree-bureau-${model.key}`,
    },
    // Brouillon : invisible sur le site tant que photos et nom du
    // modèle ne sont pas renseignés.
    status: 'draft',
    shortDescription:
      'Poste de travail complet : bureau 160 × 80 cm, fauteuil et caisson. Mobilier professionnel reconditionné en atelier.',
    description: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'intro0',
            text:
              'Un poste de travail complet pour la rentrée : un bureau de 160 × 80 cm, un fauteuil et un caisson, réunis à prix unique. Le mobilier professionnel reconditionné dans notre atelier de La Penne-sur-Huveaune, contrôlé pièce par pièce et prêt à l\'emploi.',
            marks: [],
          },
        ],
      },
      {
        _type: 'block',
        _key: 'compo',
        style: 'h3',
        markDefs: [],
        children: [
          { _type: 'span', _key: 'compo0', text: 'Ce que comprend le pack', marks: [] },
        ],
      },
      {
        _type: 'block',
        _key: 'l1',
        style: 'normal',
        listItem: 'bullet',
        markDefs: [],
        children: [
          { _type: 'span', _key: 'l10', text: 'Un bureau 160 × 80 cm', marks: [] },
        ],
      },
      {
        _type: 'block',
        _key: 'l2',
        style: 'normal',
        listItem: 'bullet',
        markDefs: [],
        children: [{ _type: 'span', _key: 'l20', text: 'Un fauteuil de bureau', marks: [] }],
      },
      {
        _type: 'block',
        _key: 'l3',
        style: 'normal',
        listItem: 'bullet',
        markDefs: [],
        children: [{ _type: 'span', _key: 'l30', text: 'Un caisson de rangement', marks: [] }],
      },
      {
        _type: 'block',
        _key: 'pour',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 'pour0',
            text:
              'Adapté aux étudiants, aux télétravailleurs et aux professionnels. Livraison et montage possibles, dans la limite des stocks disponibles.',
            marks: [],
          },
        ],
      },
    ],
    price: PRICE_TTC,
    stock: STOCK_PER_MODEL,
    availabilityStatus: 'inStock',
    condition: 'very-good',
    widthCm: 160,
    depthCm: 80,
    categories: [
      { _type: 'reference', _key: 'catpack', _ref: CATEGORY_ID },
    ],
    primaryCategory: { _type: 'reference', _ref: CATEGORY_ID },
  }
}

async function main() {
  console.log(
    `${isDryRun ? '🔍 DRY-RUN' : '🚀 APPLY'} — Création de l'offre Pack spécial rentrée\n`,
  )

  console.log(`Catégorie : ${CATEGORY.name} (/categorie/${CATEGORY.slug.current})`)
  if (!isDryRun) {
    await client.createOrReplace(CATEGORY)
  }

  console.log(`\n${MODELS.length} produits à ${PRICE_TTC} € TTC, stock ${STOCK_PER_MODEL} chacun :`)
  for (const model of MODELS) {
    const doc = buildProduct(model)
    console.log(`  → ${doc.name}`)
    console.log(`     /produit/${doc.slug.current} — statut brouillon`)
    if (!isDryRun) {
      await client.createOrReplace(doc as never)
    }
  }

  if (isDryRun) {
    console.log(
      '\n✅ Dry-run terminé (aucune écriture).\n' +
        'Pour appliquer : npx dotenv -e .env.local -- npx tsx scripts/create-pack-rentree.ts --apply --confirm=YES',
    )
    return
  }

  console.log(`
✅ Créés dans Sanity.

À faire dans Studio avant la mise en ligne :
  1. Catégories → Pack spécial rentrée → ajoute une image de catégorie
  2. Mobilier → chaque "Pack spécial rentrée — bureau Modèle X" :
     - renomme "Modèle X" par le vrai nom du modèle
     - ajoute les photos du pack (bureau, fauteuil, caisson)
     - ajuste le stock réel
     - passe le statut sur "Publié" puis clique Publish
  3. Réglages du site → Popup promo → lien du bouton :
     /categorie/pack-special-rentree
`)
}

main().catch((err) => {
  console.error('❌ Erreur fatale :', err)
  process.exit(1)
})
