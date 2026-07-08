/**
 * Vue galerie pour Sanity Studio.
 *
 * Remplace la liste plate par défaut par une grille de cartes avec
 * image, titre, badges. Utilisable pour produits, catégories, articles
 * de blog — n'importe quel type qui a une image et un nom.
 *
 * Fonctionnalités :
 *   - Recherche instantanée (filtre côté client sur le nom)
 *   - Tri (récent, alphabétique, prix pour les produits)
 *   - Filtre statut pour les produits (tous / publiés / brouillons /
 *     featured / exception)
 *   - Pagination côté client (60 par page)
 *   - Clic sur une carte → ouvre l'éditeur du document
 *
 * Techniques :
 *   - @sanity/image-url pour construire les URLs d'image avec hotspot
 *   - useClient() pour requêter Sanity côté client Studio
 *   - useRouter().navigateIntent('edit', ...) pour la navigation
 */

import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  Stack,
  Grid,
  Text,
  Heading,
  Flex,
  Box,
  Button,
  Badge,
  Spinner,
  TextInput,
  Select,
} from '@sanity/ui'
import { useClient, useProjectId, useDataset } from 'sanity'
import { useRouter } from 'sanity/router'
import imageUrlBuilder from '@sanity/image-url'
import { apiVersion } from '../env'

type Doc = {
  _id: string
  _type: string
  _updatedAt: string
  name?: string
  title?: string
  slug?: { current?: string }
  status?: string
  featured?: boolean
  exception?: boolean
  brand?: string
  condition?: string
  price?: number
  salePrice?: number
  stock?: number
  image?: unknown
  images?: unknown[]
  parent?: { _ref?: string } | null
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  excellent: 'Excellent',
  'very-good': 'Très bon',
  good: 'Bon',
  fair: 'Correct',
}

const PRODUCT_STATUS_TONE: Record<
  string,
  { tone: 'positive' | 'caution' | 'critical' | 'default'; label: string }
> = {
  published: { tone: 'positive', label: 'Publié' },
  draft: { tone: 'caution', label: 'Brouillon' },
  sold: { tone: 'critical', label: 'Vendu' },
  archived: { tone: 'default', label: 'Archivé' },
}

// ─── Requêtes GROQ ───────────────────────────────────────────
const PRODUCT_QUERY = `*[_type == "product"] | order(_updatedAt desc) {
  _id, _type, _updatedAt, name, slug, status, featured, exception,
  brand, condition, price, salePrice, stock,
  "images": images[]{asset, alt, hotspot}
}`

const CATEGORY_QUERY = `*[_type == "category"] | order(coalesce(order, 999) asc, name asc) {
  _id, _type, _updatedAt, name, slug,
  "image": image{asset, alt, hotspot},
  "parent": parent->{_id}
}`

const BLOG_QUERY = `*[_type == "blogPost"] | order(_updatedAt desc) {
  _id, _type, _updatedAt, title, slug, status, category, featured,
  "image": heroImage{asset, alt, hotspot}
}`

// ─── Format prix ───────────────────────────────────────────────
function formatPrice(cents?: number): string {
  if (typeof cents !== 'number') return ''
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(cents)
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (days < 1) return "aujourd'hui"
  if (days < 7) return `il y a ${days} j`
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ─── Carte individuelle ───────────────────────────────────────
function DocCard({
  doc,
  imageUrl,
  onClick,
  type,
}: {
  doc: Doc
  imageUrl: string | null
  onClick: () => void
  type: 'product' | 'category' | 'blogPost'
}) {
  const name = doc.name || doc.title || '(sans nom)'
  const hasSale = !!doc.salePrice && !!doc.price && doc.salePrice < doc.price
  const displayPrice = hasSale ? doc.salePrice : doc.price
  const status = doc.status ? PRODUCT_STATUS_TONE[doc.status] : null
  const conditionLabel = doc.condition ? CONDITION_LABELS[doc.condition] : null

  return (
    <Card
      radius={2}
      shadow={1}
      tone="default"
      style={{
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow =
          '0 4px 12px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = ''
      }}
    >
      {/* Image */}
      <Box
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: type === 'product' ? '3 / 4' : '4 / 3',
          background: '#f3f2ee',
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            loading="lazy"
          />
        ) : (
          <Flex align="center" justify="center" height="fill">
            <Text size={4} muted>
              {type === 'product' ? '🪑' : type === 'category' ? '📁' : '📰'}
            </Text>
          </Flex>
        )}

        {/* Badges superposés en haut à gauche */}
        <Box
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
          }}
        >
          {doc.featured && <Badge tone="primary">⭐ Coup de cœur</Badge>}
          {doc.exception && <Badge tone="critical">💎 Exception</Badge>}
        </Box>

        {/* Badge statut en haut à droite */}
        {status && (
          <Box style={{ position: 'absolute', top: 8, right: 8 }}>
            <Badge tone={status.tone}>{status.label}</Badge>
          </Box>
        )}

        {/* Prix soldé — bandeau bas gauche */}
        {hasSale && (
          <Box
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              background: '#b23d3d',
              color: 'white',
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            SOLDES
          </Box>
        )}
      </Box>

      {/* Infos */}
      <Box padding={3}>
        <Stack space={2}>
          {(doc.brand || conditionLabel) && (
            <Text
              size={0}
              muted
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: 10,
              }}
            >
              {[doc.brand, conditionLabel].filter(Boolean).join(' · ')}
            </Text>
          )}
          <Text
            size={1}
            weight="medium"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              minHeight: '2.6em',
            }}
          >
            {name}
          </Text>
          <Flex align="center" justify="space-between" gap={2}>
            {typeof displayPrice === 'number' ? (
              <Flex align="baseline" gap={2}>
                <Text
                  size={1}
                  weight="semibold"
                  style={{ color: hasSale ? '#b23d3d' : undefined }}
                >
                  {formatPrice(displayPrice)}
                </Text>
                {hasSale && (
                  <Text
                    size={0}
                    muted
                    style={{ textDecoration: 'line-through' }}
                  >
                    {formatPrice(doc.price)}
                  </Text>
                )}
              </Flex>
            ) : (
              <Text size={0} muted>
                {formatRelativeDate(doc._updatedAt)}
              </Text>
            )}
            {typeof doc.stock === 'number' && (
              <Text size={0} muted>
                {doc.stock > 0 ? `${doc.stock} en stock` : 'Épuisé'}
              </Text>
            )}
          </Flex>
        </Stack>
      </Box>
    </Card>
  )
}

// ─── Composant générique ───────────────────────────────────────
function MediaGridBase({
  type,
  query,
  title,
  emptyLabel,
  itemsPerPage = 60,
}: {
  type: 'product' | 'category' | 'blogPost'
  query: string
  title: string
  emptyLabel: string
  itemsPerPage?: number
}) {
  const client = useClient({ apiVersion })
  const router = useRouter()
  const projectId = useProjectId()
  const dataset = useDataset()

  const builder = useMemo(
    () => imageUrlBuilder({ projectId, dataset }),
    [projectId, dataset],
  )

  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sort, setSort] = useState<
    'recent' | 'name' | 'priceAsc' | 'priceDesc'
  >('recent')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    client
      .fetch<Doc[]>(query)
      .then((res) => {
        if (!cancelled) setDocs(res || [])
      })
      .catch((err) => console.warn('[media-grid] fetch error', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [client, query])

  // Filtrage + tri côté client
  const filtered = useMemo(() => {
    let list = docs
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((d) =>
        (d.name || d.title || '').toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all' && type === 'product') {
      if (statusFilter === 'featured') list = list.filter((d) => d.featured)
      else if (statusFilter === 'exception')
        list = list.filter((d) => d.exception)
      else list = list.filter((d) => d.status === statusFilter)
    }
    if (statusFilter !== 'all' && type === 'blogPost') {
      list = list.filter((d) => d.status === statusFilter)
    }
    switch (sort) {
      case 'name':
        list = [...list].sort((a, b) =>
          (a.name || a.title || '').localeCompare(b.name || b.title || ''),
        )
        break
      case 'priceAsc':
        list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'priceDesc':
        list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      default:
        break
    }
    return list
  }, [docs, search, statusFilter, sort, type])

  const visible = filtered.slice(0, page * itemsPerPage)
  const hasMore = filtered.length > visible.length

  const openDoc = (id: string) => router.navigateIntent('edit', { id, type })
  const createDoc = () => router.navigateIntent('create', { type })

  const buildImageUrl = (doc: Doc): string | null => {
    const src =
      type === 'product' ? doc.images?.[0] : doc.image
    if (!src) return null
    try {
      return builder
        .image(src as never)
        .width(400)
        .height(type === 'product' ? 533 : 300)
        .fit('crop')
        .url()
    } catch {
      return null
    }
  }

  return (
    <Box padding={4}>
      <Stack space={4}>
        {/* Header */}
        <Flex align="center" justify="space-between" gap={3} wrap="wrap">
          <Box>
            <Heading size={3}>{title}</Heading>
            <Text size={1} muted style={{ marginTop: 4 }}>
              {loading
                ? 'Chargement…'
                : `${filtered.length} ${filtered.length > 1 ? 'éléments' : 'élément'}${
                    search || statusFilter !== 'all'
                      ? ` (filtrés sur ${docs.length})`
                      : ''
                  }`}
            </Text>
          </Box>
          <Button
            text="+ Créer"
            tone="primary"
            onClick={createDoc}
            padding={3}
          />
        </Flex>

        {/* Filtres */}
        <Card padding={3} radius={2} tone="transparent" border>
          <Flex align="center" gap={3} wrap="wrap">
            <Box flex={1} style={{ minWidth: 200 }}>
              <TextInput
                placeholder="Rechercher par nom…"
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value)
                  setPage(1)
                }}
                clearButton={!!search}
                onClear={() => setSearch('')}
              />
            </Box>

            {type === 'product' && (
              <Box style={{ minWidth: 180 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.currentTarget.value)
                    setPage(1)
                  }}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="published">✅ Publiés</option>
                  <option value="draft">📝 Brouillons</option>
                  <option value="sold">🔴 Vendus</option>
                  <option value="featured">⭐ Coups de cœur</option>
                  <option value="exception">💎 Exception</option>
                </Select>
              </Box>
            )}

            {type === 'blogPost' && (
              <Box style={{ minWidth: 180 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.currentTarget.value)
                    setPage(1)
                  }}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="published">✅ Publiés</option>
                  <option value="draft">📝 Brouillons</option>
                  <option value="archived">🗄️ Archivés</option>
                </Select>
              </Box>
            )}

            <Box style={{ minWidth: 180 }}>
              <Select
                value={sort}
                onChange={(e) =>
                  setSort(e.currentTarget.value as typeof sort)
                }
              >
                <option value="recent">🕒 Récemment édités</option>
                <option value="name">🔤 Alphabétique</option>
                {type === 'product' && (
                  <>
                    <option value="priceAsc">💰 Prix croissant</option>
                    <option value="priceDesc">💰 Prix décroissant</option>
                  </>
                )}
              </Select>
            </Box>
          </Flex>
        </Card>

        {/* Grille */}
        {loading ? (
          <Flex align="center" justify="center" padding={5}>
            <Spinner muted />
          </Flex>
        ) : filtered.length === 0 ? (
          <Card padding={5} radius={2} tone="transparent" border>
            <Stack space={3}>
              <Text align="center" muted>
                {docs.length === 0
                  ? emptyLabel
                  : 'Aucun résultat pour ces filtres.'}
              </Text>
              {docs.length === 0 && (
                <Flex justify="center">
                  <Button
                    text="Créer le premier"
                    tone="primary"
                    onClick={createDoc}
                  />
                </Flex>
              )}
            </Stack>
          </Card>
        ) : (
          <>
            <Grid columns={[2, 3, 4, 5, 6]} gap={3}>
              {visible.map((doc) => (
                <DocCard
                  key={doc._id}
                  doc={doc}
                  imageUrl={buildImageUrl(doc)}
                  onClick={() => openDoc(doc._id)}
                  type={type}
                />
              ))}
            </Grid>

            {hasMore && (
              <Flex justify="center" padding={3}>
                <Button
                  text={`Voir ${Math.min(
                    itemsPerPage,
                    filtered.length - visible.length,
                  )} de plus`}
                  mode="ghost"
                  onClick={() => setPage((p) => p + 1)}
                />
              </Flex>
            )}
          </>
        )}
      </Stack>
    </Box>
  )
}

// ─── Composants exportés ──────────────────────────────────────

export function ProductGridView() {
  return (
    <MediaGridBase
      type="product"
      query={PRODUCT_QUERY}
      title="🖼️ Galerie produits"
      emptyLabel="Aucun produit pour l'instant."
    />
  )
}

export function CategoryGridView() {
  return (
    <MediaGridBase
      type="category"
      query={CATEGORY_QUERY}
      title="🖼️ Galerie catégories"
      emptyLabel="Aucune catégorie pour l'instant."
    />
  )
}

export function BlogGridView() {
  return (
    <MediaGridBase
      type="blogPost"
      query={BLOG_QUERY}
      title="🖼️ Galerie articles de blog"
      emptyLabel="Aucun article pour l'instant."
    />
  )
}
