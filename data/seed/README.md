# 📚 Seed Sanity Content

Contenu éditorial exceptionnel prêt à être injecté dans Sanity via le script
`scripts/seed-sanity-content.ts`.

## Structure

```
data/seed/
├── guide-clusters/    → nouveaux documents guideCluster (silos éditoriaux)
├── categories/        → patch des documents category existants (par slug)
└── guides/            → nouveaux documents guideArticle
```

Chaque fichier `.json` = **1 document**. Le champ `_type` doit toujours
être renseigné (`category-seed`, `guideCluster-seed`, `guideArticle-seed`).

## Ordre d'import

Le script traite d'abord les clusters, puis les catégories, puis les
articles — pour que les références (article → cluster, catégorie →
cluster) soient résolvables au moment de la création.

## Usage

```bash
# Dry-run (aucune écriture Sanity, juste affichage du plan)
pnpm tsx scripts/seed-sanity-content.ts --dry-run

# Import réel (nécessite SANITY_WRITE_TOKEN)
export SANITY_WRITE_TOKEN=sk...
pnpm tsx scripts/seed-sanity-content.ts --apply --confirm=YES

# Filtrer sur un type
pnpm tsx scripts/seed-sanity-content.ts --apply --confirm=YES --only=guides
```

## Formats

### Category seed (patch des champs pilier)

```json
{
  "_type": "category-seed",
  "slug": "fauteuils-ergonomiques",           // requis (match par slug)
  "pillarIntroMd": "## Titre\n\nParagraphe...",  // markdown simple
  "keyAdvantages": [{ "title": "...", "description": "...", "icon": "ShieldCheck" }],
  "buyingGuideMd": "## Comment choisir...",
  "comparisonRows": [{ "criterion": "...", "entryLevel": "...", "midRange": "...", "premium": "..." }],
  "commonMistakes": [{ "mistake": "...", "solution": "..." }],
  "faq": [{ "question": "...", "answer": "..." }],
  "relatedGuideClusterSlugs": ["ergonomie", "marques"]
}
```

Seuls les champs présents sont patchés. Les autres champs de la catégorie
(name, slug, image, googleProductCategoryId…) restent intacts.

### GuideCluster seed

```json
{
  "_type": "guideCluster-seed",
  "slug": "ergonomie",
  "name": "Ergonomie & bien-être",
  "tagline": "Une phrase courte...",
  "description": "Paragraphe intro éditoriale...",
  "order": 1,
  "relatedProductCategorySlugs": ["fauteuil", "bureau"],
  "seo": { "metaTitle": "...", "metaDescription": "..." }
}
```

Upsert par slug : crée si nouveau, met à jour sinon.

### GuideArticle seed

```json
{
  "_type": "guideArticle-seed",
  "slug": "mal-de-dos-bureau-causes-solutions",
  "clusterSlug": "ergonomie",                   // ref vers guideCluster
  "title": "H1 de l'article",
  "status": "published",
  "publishedAt": "2026-07-15T09:00:00.000Z",
  "author": "Équipe Mobilier Malin",
  "readingTimeMinutes": 11,
  "excerpt": "Résumé chapô...",
  "bodyMd": "Corps markdown complet...",
  "primaryProductCategorySlug": "fauteuils-ergonomiques",
  "featuredProductSlugs": ["steelcase-leap-v2-0142"],
  "relatedArticleSlugs": [],
  "faq": [{ "question": "...", "answer": "..." }],
  "seo": {
    "metaTitle": "...",
    "metaDescription": "...",
    "primaryKeyword": "mal de dos au bureau"
  }
}
```

Upsert par slug.

## Markdown supporté par `bodyMd` / `pillarIntroMd` / `buyingGuideMd`

Le converter `mdToPortable()` reconnaît :

- `## H2` → block style `h2`
- `### H3` → block style `h3`
- `- item` (chaque ligne d'un paragraphe) → liste à puces
- `**gras**` → span avec mark `strong`
- `*italique*` → span avec mark `em`
- Paragraphes séparés par ligne vide

Pour des besoins avancés (liens internes, images inline, blocs cités),
éditer directement dans Sanity Studio après import.

## Éditer un contenu existant

1. Modifier le `.json` dans ce dossier
2. Relancer le script (upsert par slug)
3. Le document Sanity est mis à jour, l'historique versions Sanity garde
   la trace

## Ajouter un nouveau contenu

1. Copier un fichier existant comme modèle
2. Renommer le slug
3. Éditer le contenu (respecter le format)
4. `pnpm tsx scripts/seed-sanity-content.ts --dry-run` pour vérifier
5. `--apply --confirm=YES` pour importer

## Backup avant apply

Avant tout `--apply` sur du contenu existant, faire un export Sanity :

```bash
sanity dataset export production ./backups/pre-seed-$(date +%Y%m%d).tar.gz
```

## Non fait par ce script

- Upload d'images (les images Sanity restent à téléverser via Studio)
- Suppression de documents (ce script ne fait qu'upsert, jamais delete)
- Ordonnancement des `featuredProductSlugs` (l'ordre du JSON est respecté)
