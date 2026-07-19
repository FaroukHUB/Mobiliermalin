#!/usr/bin/env tsx
/**
 * Seed Sanity content — upsert des documents catégorie / guide / cluster
 * depuis des fichiers JSON de contenu éditorial.
 *
 * Usage :
 *   pnpm tsx scripts/seed-sanity-content.ts --dry-run
 *   pnpm tsx scripts/seed-sanity-content.ts --apply --confirm=YES
 *   pnpm tsx scripts/seed-sanity-content.ts --apply --confirm=YES --only=categories
 *
 * Types supportés (par dossier sous data/seed/) :
 *   - guide-clusters/  → type Sanity `guideCluster`
 *   - categories/      → merge dans `category` existant (par slug)
 *   - guides/          → type Sanity `guideArticle`
 *
 * Format JSON : voir data/seed/README.md
 *
 * Chaque texte "portableText" est un array de {_type:'block', ...} valide
 * Sanity. Un helper mdToPortable convertit du markdown simple.
 */

import { createClient } from 'next-sanity'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

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
const onlyArg = args.find((a) => a.startsWith('--only='))?.split('=')[1]

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

const SEED_DIR = join(process.cwd(), 'data', 'seed')

// ─── Helpers ─────────────────────────────────────────────

/**
 * Convertit un markdown SIMPLE (paragraphes séparés par doubles newlines,
 * H2/H3, listes à puces) en Portable Text Sanity.
 * Non exhaustif — pour usage éditorial contrôlé uniquement.
 */
function mdToPortable(md: string): Array<Record<string, unknown>> {
  if (!md?.trim()) return []
  const blocks: Array<Record<string, unknown>> = []
  const paragraphs = md.trim().split(/\n\s*\n/)

  let keyN = 0
  const nextKey = () => `seed-${(++keyN).toString(36)}`

  /**
   * Parse un texte inline pour extraire les marks (gras, italique, liens).
   * Retourne { spans, markDefs } — Portable Text sépare les liens
   * (markDefs avec href) des spans (marks référencent _key du markDef).
   *
   * Formats reconnus :
   *   **gras** → mark 'strong'
   *   *italique* → mark 'em'
   *   [texte](url) → mark link avec markDef { href }
   *   URL brute (http/https) → auto-linkée avec URL comme texte
   */
  function parseInlineMarks(text: string): {
    spans: Array<Record<string, unknown>>
    markDefs: Array<Record<string, unknown>>
  } {
    const spans: Array<Record<string, unknown>> = []
    const markDefs: Array<Record<string, unknown>> = []

    // Étape 1 : split sur les patterns markdown les plus complexes d'abord
    // Pattern combiné : [texte](url) | **gras** | *italique* | URL brute
    const combined =
      /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s)]+)/g
    const parts = text.split(combined)

    for (const part of parts) {
      if (!part) continue

      // Lien markdown [texte](url)
      const mdLink = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (mdLink) {
        const linkKey = nextKey()
        markDefs.push({
          _key: linkKey,
          _type: 'link',
          href: mdLink[2],
        })
        spans.push({
          _type: 'span',
          _key: nextKey(),
          text: mdLink[1],
          marks: [linkKey],
        })
        continue
      }

      // URL brute (auto-link avec URL comme texte)
      if (/^https?:\/\//.test(part)) {
        const linkKey = nextKey()
        markDefs.push({
          _key: linkKey,
          _type: 'link',
          href: part,
        })
        spans.push({
          _type: 'span',
          _key: nextKey(),
          text: part,
          marks: [linkKey],
        })
        continue
      }

      // Gras **texte**
      if (part.startsWith('**') && part.endsWith('**')) {
        spans.push({
          _type: 'span',
          _key: nextKey(),
          text: part.slice(2, -2),
          marks: ['strong'],
        })
        continue
      }

      // Italique *texte*
      if (part.startsWith('*') && part.endsWith('*')) {
        spans.push({
          _type: 'span',
          _key: nextKey(),
          text: part.slice(1, -1),
          marks: ['em'],
        })
        continue
      }

      // Texte normal
      spans.push({
        _type: 'span',
        _key: nextKey(),
        text: part,
        marks: [],
      })
    }

    return { spans, markDefs }
  }

  for (const raw of paragraphs) {
    const p = raw.trim()
    if (!p) continue

    // Séparateur horizontal ---
    if (/^-{3,}$/.test(p)) {
      blocks.push({
        _type: 'divider',
        _key: nextKey(),
      })
      continue
    }
    // Image inline ![alt](url) — ligne seule
    const imgMatch = p.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\s*"([^"]+)")?$/)
    if (imgMatch) {
      blocks.push({
        _type: 'inlineImage',
        _key: nextKey(),
        url: imgMatch[2],
        alt: imgMatch[1],
        ...(imgMatch[3] && { caption: imgMatch[3] }),
      })
      continue
    }
    // Callout > [type] contenu
    const calloutMatch = p.match(/^>\s*\[(info|warning|success|tip)\]\s*([\s\S]+)$/)
    if (calloutMatch) {
      // Les items de content doivent utiliser `calloutSpan` (le type `span`
      // est réservé par Sanity pour les blocks Portable Text). Le renderer
      // page.tsx lit uniquement text + marks, indépendamment du _type.
      // Les liens dans un callout : dropped pour simplicité (rare cas).
      const { spans } = parseInlineMarks(
        calloutMatch[2].replace(/\n>\s*/g, ' '),
      )
      blocks.push({
        _type: 'callout',
        _key: nextKey(),
        variant: calloutMatch[1],
        content: spans.map((s) => ({ ...s, _type: 'calloutSpan' })),
      })
      continue
    }
    // Blockquote > texte
    if (p.split('\n').every((l) => l.trim().startsWith('>'))) {
      const quoteText = p
        .split('\n')
        .map((l) => l.trim().replace(/^>\s?/, ''))
        .join(' ')
      const { spans, markDefs } = parseInlineMarks(quoteText)
      blocks.push({
        _type: 'block',
        _key: nextKey(),
        style: 'blockquote',
        markDefs,
        children: spans,
      })
      continue
    }
    // Titre H2
    if (p.startsWith('## ')) {
      const { spans, markDefs } = parseInlineMarks(p.slice(3))
      blocks.push({
        _type: 'block',
        _key: nextKey(),
        style: 'h2',
        markDefs,
        children: spans,
      })
      continue
    }
    // Titre H3
    if (p.startsWith('### ')) {
      const { spans, markDefs } = parseInlineMarks(p.slice(4))
      blocks.push({
        _type: 'block',
        _key: nextKey(),
        style: 'h3',
        markDefs,
        children: spans,
      })
      continue
    }
    // Liste à puces (chaque ligne commence par "- ") — marks parsés dans chaque item
    if (p.split('\n').every((l) => l.trim().startsWith('- '))) {
      for (const line of p.split('\n')) {
        const itemText = line.trim().slice(2)
        const { spans, markDefs } = parseInlineMarks(itemText)
        blocks.push({
          _type: 'block',
          _key: nextKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          markDefs,
          children: spans,
        })
      }
      continue
    }
    // Paragraphe normal — utilise parseInlineMarks avec support liens
    const { spans, markDefs } = parseInlineMarks(p.replace(/\n/g, ' '))
    blocks.push({
      _type: 'block',
      _key: nextKey(),
      style: 'normal',
      markDefs,
      children: spans,
    })
  }

  return blocks
}

// ─── Résolution références slug → _id ─────────────────

const refCache = new Map<string, string>()

async function resolveRefBySlug(
  type: string,
  slug: string,
): Promise<string | null> {
  const key = `${type}:${slug}`
  if (refCache.has(key)) return refCache.get(key)!
  const id = await client.fetch<string | null>(
    `*[_type == $type && slug.current == $slug][0]._id`,
    { type, slug },
  )
  if (id) refCache.set(key, id)
  return id
}

// ─── Types de seed ────────────────────────────────────

type CategorySeed = {
  _type: 'category-seed'
  slug: string                    // slug existant (obligatoire, match par slug)
  pillarIntroMd?: string          // markdown → Portable Text
  keyAdvantages?: Array<{ title: string; description?: string; icon?: string }>
  buyingGuideMd?: string          // markdown → Portable Text
  comparisonRows?: Array<{
    criterion: string
    entryLevel?: string
    midRange?: string
    premium?: string
  }>
  commonMistakes?: Array<{ mistake: string; solution?: string }>
  faq?: Array<{ question: string; answer: string }>
  relatedGuideClusterSlugs?: string[]  // refs par slug guideCluster
}

type GuideClusterSeed = {
  _type: 'guideCluster-seed'
  slug: string
  name: string
  tagline?: string
  description?: string
  order?: number
  relatedProductCategorySlugs?: string[]
  seo?: { metaTitle?: string; metaDescription?: string }
}

type GuideArticleSeed = {
  _type: 'guideArticle-seed'
  slug: string
  clusterSlug: string             // ref par slug
  title: string
  status?: 'published' | 'draft'
  publishedAt?: string
  author?: string
  excerpt?: string
  bodyMd?: string                 // markdown → Portable Text
  readingTimeMinutes?: number
  primaryProductCategorySlug?: string
  featuredProductSlugs?: string[]
  relatedArticleSlugs?: string[]
  faq?: Array<{ question: string; answer: string }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    primaryKeyword?: string
  }
}

type NationalLandingSeed = {
  _type: 'nationalLandingPage-seed'
  pageKey: string           // ex: "fauteuil-ergonomique"
  displayName: string
  heroEyebrow?: string
  heroTitle?: string
  heroIntro?: string
  bodyMd?: string           // markdown → Portable Text
  faq?: Array<{ question: string; answer: string }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}

type AnySeed = CategorySeed | GuideClusterSeed | GuideArticleSeed | NationalLandingSeed

// ─── Processors ──────────────────────────────────────

async function processCategory(seed: CategorySeed) {
  const catId = await resolveRefBySlug('category', seed.slug)
  if (!catId) {
    console.warn(`  ⚠  Catégorie slug "${seed.slug}" introuvable — SKIP`)
    return
  }
  const patch: Record<string, unknown> = {}
  if (seed.pillarIntroMd) patch.pillarIntro = mdToPortable(seed.pillarIntroMd)
  if (seed.keyAdvantages) {
    patch.keyAdvantages = seed.keyAdvantages.map((a, i) => ({
      _key: `adv-${i}`,
      _type: 'object',
      ...a,
    }))
  }
  if (seed.buyingGuideMd) patch.buyingGuide = mdToPortable(seed.buyingGuideMd)
  if (seed.comparisonRows) {
    patch.comparisonRows = seed.comparisonRows.map((r, i) => ({
      _key: `cmp-${i}`,
      _type: 'object',
      ...r,
    }))
  }
  if (seed.commonMistakes) {
    patch.commonMistakes = seed.commonMistakes.map((m, i) => ({
      _key: `err-${i}`,
      _type: 'object',
      ...m,
    }))
  }
  if (seed.faq) {
    patch.faq = seed.faq.map((qa, i) => ({
      _key: `faq-${i}`,
      _type: 'object',
      ...qa,
    }))
  }
  if (seed.relatedGuideClusterSlugs) {
    const refs: Array<Record<string, string>> = []
    for (const s of seed.relatedGuideClusterSlugs) {
      const id = await resolveRefBySlug('guideCluster', s)
      if (id) refs.push({ _key: `gc-${s}`, _type: 'reference', _ref: id })
    }
    patch.relatedGuideClusters = refs
  }

  console.log(`  → Patch category ${seed.slug} (${Object.keys(patch).length} fields)`)
  if (!isDryRun) {
    await client.patch(catId).set(patch).commit()
  }
}

async function processGuideCluster(seed: GuideClusterSeed) {
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "guideCluster" && slug.current == $slug][0] { _id }`,
    { slug: seed.slug },
  )
  const doc: Record<string, unknown> = {
    _type: 'guideCluster',
    name: seed.name,
    slug: { _type: 'slug', current: seed.slug },
    ...(seed.tagline && { tagline: seed.tagline }),
    ...(seed.description && { description: seed.description }),
    ...(seed.order !== undefined && { order: seed.order }),
    ...(seed.seo && { seo: seed.seo }),
  }
  if (seed.relatedProductCategorySlugs?.length) {
    const refs: Array<Record<string, string>> = []
    for (const s of seed.relatedProductCategorySlugs) {
      const id = await resolveRefBySlug('category', s)
      if (id) refs.push({ _key: `rc-${s}`, _type: 'reference', _ref: id })
    }
    doc.relatedProductCategories = refs
  }
  console.log(
    `  → ${existing ? 'Update' : 'Create'} guideCluster ${seed.slug}`,
  )
  if (!isDryRun) {
    if (existing) {
      await client.patch(existing._id).set(doc).commit()
    } else {
      await client.create(doc as { _type: string; [k: string]: unknown })
    }
  }
}

async function processGuideArticle(seed: GuideArticleSeed) {
  const clusterId = await resolveRefBySlug('guideCluster', seed.clusterSlug)
  if (!clusterId) {
    console.warn(
      `  ⚠  Cluster "${seed.clusterSlug}" introuvable — SKIP article ${seed.slug}`,
    )
    return
  }

  const existing = await client.fetch<{ _id: string } | null>(
    `*[_type == "guideArticle" && slug.current == $slug][0] { _id }`,
    { slug: seed.slug },
  )

  const doc: Record<string, unknown> = {
    _type: 'guideArticle',
    title: seed.title,
    slug: { _type: 'slug', current: seed.slug },
    cluster: { _type: 'reference', _ref: clusterId },
    status: seed.status || 'draft',
    ...(seed.publishedAt && { publishedAt: seed.publishedAt }),
    ...(seed.author && { author: seed.author }),
    ...(seed.excerpt && { excerpt: seed.excerpt }),
    ...(seed.bodyMd && { body: mdToPortable(seed.bodyMd) }),
    ...(seed.readingTimeMinutes && { readingTimeMinutes: seed.readingTimeMinutes }),
    ...(seed.seo && { seo: seed.seo }),
  }
  if (seed.primaryProductCategorySlug) {
    const id = await resolveRefBySlug('category', seed.primaryProductCategorySlug)
    if (id) doc.primaryProductCategory = { _type: 'reference', _ref: id }
  }
  if (seed.featuredProductSlugs?.length) {
    const refs: Array<Record<string, string>> = []
    for (const s of seed.featuredProductSlugs) {
      const id = await resolveRefBySlug('product', s)
      if (id) refs.push({ _key: `p-${s}`, _type: 'reference', _ref: id })
    }
    doc.featuredProducts = refs
  }
  if (seed.relatedArticleSlugs?.length) {
    const refs: Array<Record<string, string>> = []
    for (const s of seed.relatedArticleSlugs) {
      const id = await resolveRefBySlug('guideArticle', s)
      if (id) refs.push({ _key: `a-${s}`, _type: 'reference', _ref: id })
    }
    doc.relatedArticles = refs
  }
  if (seed.faq?.length) {
    doc.faq = seed.faq.map((qa, i) => ({
      _key: `faq-${i}`,
      _type: 'object',
      ...qa,
    }))
  }

  console.log(
    `  → ${existing ? 'Update' : 'Create'} guideArticle ${seed.slug}`,
  )
  if (!isDryRun) {
    if (existing) {
      await client.patch(existing._id).set(doc).commit()
    } else {
      await client.create(doc as { _type: string; [k: string]: unknown })
    }
  }
}

async function processNationalLanding(seed: NationalLandingSeed) {
  const docId = `nationalLanding.${seed.pageKey}`
  const existing = await client.fetch<{ _id: string } | null>(
    `*[_id == $id][0] { _id }`,
    { id: docId },
  )
  const doc: Record<string, unknown> = {
    _id: docId,
    _type: 'nationalLandingPage',
    pageKey: seed.pageKey,
    displayName: seed.displayName,
    ...(seed.heroEyebrow && { heroEyebrow: seed.heroEyebrow }),
    ...(seed.heroTitle && { heroTitle: seed.heroTitle }),
    ...(seed.heroIntro && { heroIntro: seed.heroIntro }),
    ...(seed.bodyMd && { body: mdToPortable(seed.bodyMd) }),
    ...(seed.seo && { seo: seed.seo }),
  }
  if (seed.faq?.length) {
    doc.faq = seed.faq.map((qa, i) => ({
      _key: `faq-${i}`,
      _type: 'object',
      ...qa,
    }))
  }
  console.log(
    `  → ${existing ? 'Update' : 'Create'} nationalLandingPage ${seed.pageKey}`,
  )
  if (!isDryRun) {
    if (existing) {
      await client.patch(docId).set(doc).commit()
    } else {
      await client.createOrReplace(doc as { _id: string; _type: string; [k: string]: unknown })
    }
  }
}

// ─── Runner ──────────────────────────────────────────

async function processDir(subdir: string, processor: (s: AnySeed) => Promise<void>) {
  const dir = join(SEED_DIR, subdir)
  if (!existsSync(dir)) {
    console.log(`  (skip ${subdir} — dossier absent)`)
    return
  }
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  if (files.length === 0) {
    console.log(`  (skip ${subdir} — aucun fichier JSON)`)
    return
  }
  console.log(`\n📂 ${subdir} (${files.length} fichiers)`)
  for (const f of files) {
    const path = join(dir, f)
    try {
      const content = JSON.parse(readFileSync(path, 'utf8')) as AnySeed
      await processor(content)
    } catch (err) {
      console.error(`  ❌ ${f} :`, err)
    }
  }
}

async function main() {
  console.log(
    `${isDryRun ? '🔍 DRY-RUN' : '🚀 APPLY'} — Seed Sanity content depuis data/seed/\n`,
  )
  if (!onlyArg || onlyArg === 'guide-clusters') {
    await processDir('guide-clusters', (s) => processGuideCluster(s as GuideClusterSeed))
  }
  if (!onlyArg || onlyArg === 'categories') {
    await processDir('categories', (s) => processCategory(s as CategorySeed))
  }
  if (!onlyArg || onlyArg === 'guides') {
    await processDir('guides', (s) => processGuideArticle(s as GuideArticleSeed))
  }
  if (!onlyArg || onlyArg === 'national') {
    await processDir('national', (s) => processNationalLanding(s as NationalLandingSeed))
  }
  console.log(
    `\n${isDryRun ? '✅ Dry-run terminé (aucune écriture).' : '✅ Seed appliqué avec succès.'}`,
  )
}

main().catch((err) => {
  console.error('❌ Erreur fatale :', err)
  process.exit(1)
})
