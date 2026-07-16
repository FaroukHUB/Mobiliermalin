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
   * Parse un texte inline pour extraire les marks (gras, italique).
   * Retourne un tableau de spans Portable Text.
   * Utilisé aussi bien pour les paragraphes que pour les items de liste.
   */
  function parseInlineMarks(text: string): Array<Record<string, unknown>> {
    const spans: Array<Record<string, unknown>> = []
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    for (const part of parts) {
      if (!part) continue
      if (part.startsWith('**') && part.endsWith('**')) {
        spans.push({
          _type: 'span',
          _key: nextKey(),
          text: part.slice(2, -2),
          marks: ['strong'],
        })
      } else if (part.startsWith('*') && part.endsWith('*')) {
        spans.push({
          _type: 'span',
          _key: nextKey(),
          text: part.slice(1, -1),
          marks: ['em'],
        })
      } else {
        spans.push({
          _type: 'span',
          _key: nextKey(),
          text: part,
          marks: [],
        })
      }
    }
    return spans
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
      blocks.push({
        _type: 'callout',
        _key: nextKey(),
        variant: calloutMatch[1],
        content: parseInlineMarks(calloutMatch[2].replace(/\n>\s*/g, ' ')),
      })
      continue
    }
    // Blockquote > texte
    if (p.split('\n').every((l) => l.trim().startsWith('>'))) {
      const quoteText = p
        .split('\n')
        .map((l) => l.trim().replace(/^>\s?/, ''))
        .join(' ')
      blocks.push({
        _type: 'block',
        _key: nextKey(),
        style: 'blockquote',
        markDefs: [],
        children: parseInlineMarks(quoteText),
      })
      continue
    }
    // Titre H2
    if (p.startsWith('## ')) {
      blocks.push({
        _type: 'block',
        _key: nextKey(),
        style: 'h2',
        markDefs: [],
        children: parseInlineMarks(p.slice(3)),
      })
      continue
    }
    // Titre H3
    if (p.startsWith('### ')) {
      blocks.push({
        _type: 'block',
        _key: nextKey(),
        style: 'h3',
        markDefs: [],
        children: parseInlineMarks(p.slice(4)),
      })
      continue
    }
    // Liste à puces (chaque ligne commence par "- ") — marks parsés dans chaque item
    if (p.split('\n').every((l) => l.trim().startsWith('- '))) {
      for (const line of p.split('\n')) {
        const itemText = line.trim().slice(2)
        blocks.push({
          _type: 'block',
          _key: nextKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          markDefs: [],
          children: parseInlineMarks(itemText),
        })
      }
      continue
    }
    // Paragraphe normal (utilise parseInlineMarks partagé)
    const children: Array<Record<string, unknown>> = []
    const legacyParts = p.replace(/\n/g, ' ').split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    for (const part of legacyParts) {
      if (!part) continue
      if (part.startsWith('**') && part.endsWith('**')) {
        children.push({
          _type: 'span',
          _key: nextKey(),
          text: part.slice(2, -2),
          marks: ['strong'],
        })
      } else if (part.startsWith('*') && part.endsWith('*')) {
        children.push({
          _type: 'span',
          _key: nextKey(),
          text: part.slice(1, -1),
          marks: ['em'],
        })
      } else {
        children.push({
          _type: 'span',
          _key: nextKey(),
          text: part,
          marks: [],
        })
      }
    }
    blocks.push({
      _type: 'block',
      _key: nextKey(),
      style: 'normal',
      markDefs: [],
      children,
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

type AnySeed = CategorySeed | GuideClusterSeed | GuideArticleSeed

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
  console.log(
    `\n${isDryRun ? '✅ Dry-run terminé (aucune écriture).' : '✅ Seed appliqué avec succès.'}`,
  )
}

main().catch((err) => {
  console.error('❌ Erreur fatale :', err)
  process.exit(1)
})
