/**
 * Tableau de bord Sanity Studio — Mobilier Malin.
 *
 * S'affiche à droite quand l'admin arrive sur le Studio, à la place
 * du panneau vide par défaut. Combine :
 *   - KPI temps réel (compte de produits, commandes, articles, devis…)
 *   - Actions rapides pour créer un nouveau contenu
 *   - Activité récente (5 dernières commandes, 3 derniers produits…)
 *   - Liens externes utiles (site prod, Search Console, GBP, Vercel)
 *   - Rappels SEO rotatifs
 *
 * Techniques :
 *   - Composants @sanity/ui pour l'apparence native Studio
 *   - useClient() : accès direct à l'API Sanity côté client Studio
 *   - useRouter().navigateIntent(…) : ouvre l'éditeur d'un doc au clic
 *
 * Note : ce composant s'exécute dans l'iframe du Studio, pas sur le
 * site public. Aucun impact SEO ni performance côté visiteur.
 */

import { useEffect, useState } from 'react'
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
} from '@sanity/ui'
import { useClient, useProjectId, useDataset } from 'sanity'
import { useRouter } from 'sanity/router'
import { apiVersion } from '../env'

type Counts = {
  productsPublished: number
  productsDraft: number
  productsFeatured: number
  ordersToPrepare: number
  ordersReady: number
  ordersFulfilled: number
  blogPublished: number
  blogDrafts: number
  quotesPending: number
  categories: number
  heroSlides: number
}

type RecentDoc = {
  _id: string
  _type: string
  _updatedAt: string
  title?: string
  numero?: string
  name?: string
  status?: string
}

// ─── Requêtes GROQ ───────────────────────────────────────────
const COUNTS_QUERY = `{
  "productsPublished": count(*[_type == "product" && status == "published"]),
  "productsDraft":     count(*[_type == "product" && status == "draft"]),
  "productsFeatured":  count(*[_type == "product" && featured == true]),
  "ordersToPrepare":   count(*[_type == "order" && status == "paid"]),
  "ordersReady":       count(*[_type == "order" && status == "ready"]),
  "ordersFulfilled":   count(*[_type == "order" && status == "fulfilled"]),
  "blogPublished":     count(*[_type == "blogPost" && status == "published"]),
  "blogDrafts":        count(*[_type == "blogPost" && status == "draft"]),
  "quotesPending":     count(*[_type == "quote" && status == "pending"]),
  "categories":        count(*[_type == "category"]),
  "heroSlides":        count(*[_type == "heroSlide"])
}`

const RECENT_ORDERS_QUERY = `*[_type == "order"] | order(placedAt desc)[0...5] {
  _id, _type, _updatedAt, numero, status,
  "name": customer.name
}`

const RECENT_PRODUCTS_QUERY = `*[_type == "product"] | order(_updatedAt desc)[0...4] {
  _id, _type, _updatedAt, name, status
}`

const RECENT_BLOG_QUERY = `*[_type == "blogPost"] | order(_updatedAt desc)[0...3] {
  _id, _type, _updatedAt, title, status
}`

// ─── Astuces SEO rotatives ─────────────────────────────────────
const SEO_TIPS: { title: string; body: string }[] = [
  {
    title: 'Description produit riche',
    body: 'Une fiche produit avec 300+ mots dans la description longue est 4 fois plus susceptible d\'être indexée par Google qu\'une fiche minimaliste.',
  },
  {
    title: 'Alt-text des images',
    body: 'Toujours remplir le champ "texte alternatif" des images — c\'est ce que Google lit pour comprendre ce qu\'il y a dessus. Ex : "Fauteuil Steelcase Leap V2 turquoise dans notre atelier".',
  },
  {
    title: 'Publier régulièrement',
    body: 'Un site avec 1 article de blog / 2 semaines est 3× plus crawlé qu\'un site statique. La régularité compte plus que la longueur.',
  },
  {
    title: 'Mise en avant sur la home',
    body: 'Sur un article de blog, cocher "Mettre en avant sur la home" le fait apparaître dans la section "Nos conseils" en page d\'accueil.',
  },
  {
    title: 'Date de publication future',
    body: 'Vous pouvez rédiger un article à l\'avance et le programmer : entrez une date de publication future, l\'article restera invisible jusqu\'à cette date.',
  },
  {
    title: 'Meta description',
    body: 'La meta description n\'influence pas le classement Google, mais elle influence énormément le taux de clic. Écrivez-la comme une accroche publicitaire.',
  },
  {
    title: 'Slug (URL)',
    body: 'Un slug court et lisible ("comparatif-fauteuils") ranke mieux qu\'un slug long. Modifiez-le à la main pour retirer les mots inutiles.',
  },
]

// ─── Formatage ─────────────────────────────────────────────────
function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diffMs = now - d.getTime()
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h} h`
  const days = Math.floor(h / 24)
  if (days < 7) return `il y a ${days} j`
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const STATUS_BADGES: Record<string, { tone: 'primary' | 'positive' | 'caution' | 'critical' | 'default'; label: string }> = {
  paid: { tone: 'caution', label: 'À préparer' },
  ready: { tone: 'primary', label: 'Prête' },
  fulfilled: { tone: 'positive', label: 'Terminée' },
  refunded: { tone: 'critical', label: 'Remboursée' },
  published: { tone: 'positive', label: 'Publié' },
  draft: { tone: 'caution', label: 'Brouillon' },
  archived: { tone: 'default', label: 'Archivé' },
}

// ─── Sous-composants ───────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  onClick,
  tone = 'default',
}: {
  icon: string
  label: string
  value: number
  sub?: string
  onClick?: () => void
  tone?: 'default' | 'positive' | 'caution' | 'critical'
}) {
  const toneClass =
    tone === 'positive'
      ? { borderTop: '3px solid #2b915d' }
      : tone === 'caution'
        ? { borderTop: '3px solid #c58720' }
        : tone === 'critical'
          ? { borderTop: '3px solid #b23d3d' }
          : { borderTop: '3px solid #c8a25b' }
  return (
    <Card
      padding={4}
      radius={2}
      shadow={1}
      tone="default"
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...toneClass,
      }}
      onClick={onClick}
    >
      <Stack space={3}>
        <Flex align="center" gap={2}>
          <Text size={2}>{icon}</Text>
          <Text size={1} weight="medium" muted>
            {label}
          </Text>
        </Flex>
        <Heading size={4} style={{ lineHeight: 1 }}>
          {value}
        </Heading>
        {sub && (
          <Text size={0} muted>
            {sub}
          </Text>
        )}
      </Stack>
    </Card>
  )
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <Button
      mode="ghost"
      padding={4}
      onClick={onClick}
      style={{
        width: '100%',
        justifyContent: 'flex-start',
        border: '1px solid #e6e6e3',
      }}
    >
      <Flex align="center" gap={3}>
        <Text size={3}>{icon}</Text>
        <Text size={1} weight="medium">
          {label}
        </Text>
      </Flex>
    </Button>
  )
}

function RecentItem({
  doc,
  onClick,
  labelKey,
}: {
  doc: RecentDoc
  onClick: () => void
  labelKey: 'numero' | 'name' | 'title'
}) {
  const label = doc[labelKey] || doc.title || doc.name || '(sans nom)'
  const badge = doc.status ? STATUS_BADGES[doc.status] : null
  return (
    <Card
      padding={3}
      radius={2}
      tone="transparent"
      style={{
        cursor: 'pointer',
        borderBottom: '1px solid #f0f0ec',
      }}
      onClick={onClick}
    >
      <Flex align="center" justify="space-between" gap={2}>
        <Box flex={1} style={{ minWidth: 0 }}>
          <Text
            size={1}
            weight="medium"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Text>
          <Text size={0} muted style={{ marginTop: 4 }}>
            {formatRelativeDate(doc._updatedAt)}
          </Text>
        </Box>
        {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
      </Flex>
    </Card>
  )
}

// ─── Composant principal ───────────────────────────────────────

export function Dashboard() {
  const client = useClient({ apiVersion })
  const router = useRouter()
  const projectId = useProjectId()
  const dataset = useDataset()

  const [counts, setCounts] = useState<Counts | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentDoc[]>([])
  const [recentProducts, setRecentProducts] = useState<RecentDoc[]>([])
  const [recentBlog, setRecentBlog] = useState<RecentDoc[]>([])
  const [tipIndex, setTipIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      client.fetch<Counts>(COUNTS_QUERY),
      client.fetch<RecentDoc[]>(RECENT_ORDERS_QUERY),
      client.fetch<RecentDoc[]>(RECENT_PRODUCTS_QUERY),
      client.fetch<RecentDoc[]>(RECENT_BLOG_QUERY),
    ])
      .then(([c, orders, products, blog]) => {
        if (cancelled) return
        setCounts(c)
        setRecentOrders(orders)
        setRecentProducts(products)
        setRecentBlog(blog)
      })
      .catch((err) => console.warn('[dashboard] fetch error', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [client])

  // Astuce SEO qui change à chaque montage du dashboard
  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * SEO_TIPS.length))
  }, [])

  // Helper : ouvre l'éditeur d'un document
  const openDoc = (id: string, type: string) => {
    router.navigateIntent('edit', { id, type })
  }

  // Helper : crée un nouveau document
  const createDoc = (type: string) => {
    router.navigateIntent('create', { type })
  }

  const tip = SEO_TIPS[tipIndex]

  return (
    <Box padding={4} style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* ─── HEADER ─── */}
      <Stack space={5}>
        <Box>
          <Heading size={4}>Tableau de bord</Heading>
          <Text size={1} muted style={{ marginTop: 8 }}>
            Bienvenue dans l&apos;espace de gestion Mobilier Malin. Voici un
            aperçu en temps réel de votre boutique.
          </Text>
        </Box>

        {loading && !counts ? (
          <Flex align="center" justify="center" padding={5}>
            <Spinner muted />
          </Flex>
        ) : (
          <>
            {/* ─── KPI GRID ─── */}
            <Box>
              <Heading size={2} style={{ marginBottom: 12 }}>
                Vue d&apos;ensemble
              </Heading>
              <Grid columns={[2, 2, 4]} gap={3}>
                <KpiCard
                  icon="🪑"
                  label="Produits publiés"
                  value={counts?.productsPublished ?? 0}
                  sub={
                    counts && counts.productsDraft > 0
                      ? `${counts.productsDraft} brouillon${counts.productsDraft > 1 ? 's' : ''}`
                      : 'Aucun brouillon'
                  }
                  tone="positive"
                  onClick={() =>
                    router.navigateUrl({
                      path: '/desk/mobilier',
                    })
                  }
                />
                <KpiCard
                  icon="🛒"
                  label="Commandes à préparer"
                  value={counts?.ordersToPrepare ?? 0}
                  sub={
                    counts
                      ? `${counts.ordersReady} prête${counts.ordersReady > 1 ? 's' : ''} · ${counts.ordersFulfilled} terminée${counts.ordersFulfilled > 1 ? 's' : ''}`
                      : undefined
                  }
                  tone={
                    counts && counts.ordersToPrepare > 0 ? 'caution' : 'positive'
                  }
                />
                <KpiCard
                  icon="📰"
                  label="Articles publiés"
                  value={counts?.blogPublished ?? 0}
                  sub={
                    counts && counts.blogDrafts > 0
                      ? `${counts.blogDrafts} brouillon${counts.blogDrafts > 1 ? 's' : ''}`
                      : 'Aucun brouillon'
                  }
                />
                <KpiCard
                  icon="📋"
                  label="Devis à traiter"
                  value={counts?.quotesPending ?? 0}
                  sub={
                    counts && counts.quotesPending > 0
                      ? 'Réponse client attendue'
                      : 'Aucun nouveau'
                  }
                  tone={
                    counts && counts.quotesPending > 0 ? 'caution' : 'default'
                  }
                />
                <KpiCard
                  icon="⭐"
                  label="Coups de cœur home"
                  value={counts?.productsFeatured ?? 0}
                  sub="Affichés sur la page d'accueil"
                />
                <KpiCard
                  icon="📁"
                  label="Catégories"
                  value={counts?.categories ?? 0}
                />
                <KpiCard
                  icon="🎞️"
                  label="Slides hero"
                  value={counts?.heroSlides ?? 0}
                  sub="Carrousel d'accueil"
                />
                <KpiCard
                  icon="📍"
                  label="Zones SEO couvertes"
                  value={10}
                  sub="Pages locales (Marseille, PACA…)"
                />
              </Grid>
            </Box>

            {/* ─── ACTIONS RAPIDES ─── */}
            <Box>
              <Heading size={2} style={{ marginBottom: 12 }}>
                Actions rapides
              </Heading>
              <Grid columns={[1, 2, 4]} gap={3}>
                <QuickAction
                  icon="📰"
                  label="Nouvel article blog"
                  onClick={() => createDoc('blogPost')}
                />
                <QuickAction
                  icon="🪑"
                  label="Nouveau produit"
                  onClick={() => createDoc('product')}
                />
                <QuickAction
                  icon="📁"
                  label="Nouvelle catégorie"
                  onClick={() => createDoc('category')}
                />
                <QuickAction
                  icon="🎞️"
                  label="Nouvelle slide hero"
                  onClick={() => createDoc('heroSlide')}
                />
              </Grid>
            </Box>

            {/* ─── ACTIVITÉ RÉCENTE ─── */}
            <Grid columns={[1, 1, 3]} gap={4}>
              {/* Dernières commandes */}
              <Card padding={4} radius={2} shadow={1} tone="default">
                <Stack space={3}>
                  <Flex align="center" justify="space-between">
                    <Heading size={1}>Dernières commandes</Heading>
                    <Text size={0} muted>
                      {counts?.ordersToPrepare ?? 0} à préparer
                    </Text>
                  </Flex>
                  {recentOrders.length === 0 ? (
                    <Text size={1} muted>
                      Aucune commande pour l&apos;instant.
                    </Text>
                  ) : (
                    <Stack space={0}>
                      {recentOrders.map((doc) => (
                        <RecentItem
                          key={doc._id}
                          doc={doc}
                          labelKey="numero"
                          onClick={() => openDoc(doc._id, 'order')}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>

              {/* Derniers produits édités */}
              <Card padding={4} radius={2} shadow={1} tone="default">
                <Stack space={3}>
                  <Heading size={1}>Derniers produits édités</Heading>
                  {recentProducts.length === 0 ? (
                    <Text size={1} muted>
                      Aucun produit pour l&apos;instant.
                    </Text>
                  ) : (
                    <Stack space={0}>
                      {recentProducts.map((doc) => (
                        <RecentItem
                          key={doc._id}
                          doc={doc}
                          labelKey="name"
                          onClick={() => openDoc(doc._id, 'product')}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>

              {/* Derniers articles blog */}
              <Card padding={4} radius={2} shadow={1} tone="default">
                <Stack space={3}>
                  <Heading size={1}>Derniers articles blog</Heading>
                  {recentBlog.length === 0 ? (
                    <Stack space={3}>
                      <Text size={1} muted>
                        Aucun article publié pour l&apos;instant.
                      </Text>
                      <Button
                        text="Créer le premier article"
                        tone="primary"
                        mode="ghost"
                        onClick={() => createDoc('blogPost')}
                      />
                    </Stack>
                  ) : (
                    <Stack space={0}>
                      {recentBlog.map((doc) => (
                        <RecentItem
                          key={doc._id}
                          doc={doc}
                          labelKey="title"
                          onClick={() => openDoc(doc._id, 'blogPost')}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Grid>

            {/* ─── ASTUCE SEO ─── */}
            <Card
              padding={4}
              radius={2}
              tone="primary"
              style={{
                background:
                  'linear-gradient(135deg, #fef7e6 0%, #faf3d6 100%)',
                border: '1px solid #f0d494',
              }}
            >
              <Flex gap={4} align="flex-start">
                <Text size={4}>💡</Text>
                <Stack space={2} flex={1}>
                  <Flex align="center" gap={2}>
                    <Text size={0} weight="semibold" muted>
                      Astuce SEO
                    </Text>
                    <Badge tone="caution">
                      {tipIndex + 1} / {SEO_TIPS.length}
                    </Badge>
                  </Flex>
                  <Heading size={1}>{tip.title}</Heading>
                  <Text size={1}>{tip.body}</Text>
                  <Box>
                    <Button
                      text="Autre astuce"
                      mode="ghost"
                      onClick={() =>
                        setTipIndex((i) => (i + 1) % SEO_TIPS.length)
                      }
                    />
                  </Box>
                </Stack>
              </Flex>
            </Card>

            {/* ─── LIENS EXTERNES ─── */}
            <Box>
              <Heading size={2} style={{ marginBottom: 12 }}>
                Outils externes
              </Heading>
              <Grid columns={[2, 3, 5]} gap={3}>
                <ExternalLink
                  icon="🌐"
                  label="Voir le site"
                  href="https://mobiliermalin.com"
                />
                <ExternalLink
                  icon="📊"
                  label="Search Console"
                  href="https://search.google.com/search-console"
                />
                <ExternalLink
                  icon="📈"
                  label="Google Analytics"
                  href="https://analytics.google.com/analytics/web/"
                />
                <ExternalLink
                  icon="🏢"
                  label="Google Business"
                  href="https://business.google.com/"
                />
                <ExternalLink
                  icon="🚀"
                  label="Vercel"
                  href="https://vercel.com/dashboard"
                />
              </Grid>
            </Box>

            {/* ─── PIED DE PAGE ─── */}
            <Card padding={3} tone="transparent">
              <Text size={0} muted align="center">
                Sanity Studio · Projet {projectId} · Dataset{' '}
                <strong>{dataset}</strong>
              </Text>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  )
}

function ExternalLink({
  icon,
  label,
  href,
}: {
  icon: string
  label: string
  href: string
}) {
  return (
    <Card
      as="a"
      // @sanity/ui Card 'as' polymorphism types don't always narrow
      // to anchor attrs — safe here, we know href/target/rel are valid.
      {...({ href, target: '_blank', rel: 'noopener noreferrer' } as Record<
        string,
        string
      >)}
      padding={3}
      radius={2}
      tone="default"
      style={{
        textDecoration: 'none',
        border: '1px solid #e6e6e3',
        display: 'block',
      }}
    >
      <Flex align="center" gap={2}>
        <Text size={2}>{icon}</Text>
        <Text size={1} weight="medium">
          {label}
        </Text>
      </Flex>
    </Card>
  )
}
