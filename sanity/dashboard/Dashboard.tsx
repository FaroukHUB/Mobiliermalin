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
  // Demandes reçues sur le site (comptage par période)
  quotes7d: number
  quotes30d: number
  quotesTotal: number
  contacts7d: number
  contacts30d: number
  contactsTotal: number
  contactsUnhandled: number
}

/** Commande Stripe : montant déjà TTC, en centimes. */
type RevenueOrder = {
  _id: string
  placedAt?: string
  _createdAt: string
  amountTotalCents?: number
  status?: string
}

/** Devis : montants stockés HT, TVA à appliquer pour obtenir le TTC. */
type RevenueQuote = {
  _id: string
  status?: string
  acceptedAt?: string
  sentAt?: string
  _createdAt: string
  lineItems?: Array<{ unitPrice?: number; quantity?: number }>
  product?: { unitPrice?: number; quantity?: number }
  shippingFee?: number
  options?: Array<{ price?: number }>
  tvaRate?: number
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
  "heroSlides":        count(*[_type == "heroSlide"]),
  "quotes7d":          count(*[_type == "quote" && dateTime(_createdAt) > dateTime(now()) - 604800]),
  "quotes30d":         count(*[_type == "quote" && dateTime(_createdAt) > dateTime(now()) - 2592000]),
  "quotesTotal":       count(*[_type == "quote"]),
  "contacts7d":        count(*[_type == "contactMessage" && dateTime(coalesce(receivedAt, _createdAt)) > dateTime(now()) - 604800]),
  "contacts30d":       count(*[_type == "contactMessage" && dateTime(coalesce(receivedAt, _createdAt)) > dateTime(now()) - 2592000]),
  "contactsTotal":     count(*[_type == "contactMessage"]),
  "contactsUnhandled": count(*[_type == "contactMessage" && handled != true])
}`

const RECENT_CONTACTS_QUERY = `*[_type == "contactMessage"] | order(receivedAt desc)[0...5] {
  _id, _type, _updatedAt, name,
  "status": select(handled == true => "handledContact", "pendingContact")
}`

// ─── Chiffre d'affaires ──────────────────────────────────────
// Deux sources : les commandes Stripe (montant TTC en centimes) et les
// devis acceptés + payés (montants HT, TVA à appliquer). Les totaux
// sont calculés en JS pour rester lisibles et éviter les limites
// arithmétiques de GROQ.
const REVENUE_ORDERS_QUERY = `*[_type == "order" && status != "refunded"] {
  _id, placedAt, _createdAt, amountTotalCents, status
}`

const REVENUE_QUOTES_QUERY = `*[_type == "quote"] {
  _id, status, acceptedAt, sentAt, _createdAt,
  lineItems[]{ unitPrice, quantity },
  product{ unitPrice, quantity },
  shippingFee, options[]{ price }, tvaRate
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

// ─── Calculs financiers ────────────────────────────────────────

/** Total TTC d'un devis : lignes + livraison + options, TVA appliquée. */
function quoteTotalTtc(q: RevenueQuote): number {
  const lines =
    Array.isArray(q.lineItems) && q.lineItems.length > 0
      ? q.lineItems.reduce(
          (s, li) => s + (li?.unitPrice ?? 0) * (li?.quantity ?? 1),
          0,
        )
      : (q.product?.unitPrice ?? 0) * (q.product?.quantity ?? 1)
  const options = (q.options || []).reduce((s, o) => s + (o?.price ?? 0), 0)
  const ht = lines + (q.shippingFee ?? 0) + options
  return ht * (1 + (q.tvaRate ?? 20) / 100)
}

/** Date qui fait foi pour rattacher un encaissement à une période. */
function orderDate(o: RevenueOrder): Date {
  return new Date(o.placedAt || o._createdAt)
}
function quoteDate(q: RevenueQuote): Date {
  return new Date(q.acceptedAt || q._createdAt)
}

type Revenue = {
  ordersTtc: number
  quotesTtc: number
  total: number
  count: number
}

function emptyRevenue(): Revenue {
  return { ordersTtc: 0, quotesTtc: 0, total: 0, count: 0 }
}

/** Agrège le CA encaissé sur une période (since = null → depuis toujours). */
function computeRevenue(
  orders: RevenueOrder[],
  quotes: RevenueQuote[],
  since: Date | null,
): Revenue {
  const r = emptyRevenue()
  for (const o of orders) {
    if (since && orderDate(o) < since) continue
    r.ordersTtc += (o.amountTotalCents ?? 0) / 100
    r.count++
  }
  for (const q of quotes) {
    if (q.status !== 'accepted') continue
    if (since && quoteDate(q) < since) continue
    r.quotesTtc += quoteTotalTtc(q)
    r.count++
  }
  r.total = r.ordersTtc + r.quotesTtc
  return r
}

function eur(v: number): string {
  return (
    v.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + ' €'
  )
}

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
  pendingContact: { tone: 'caution', label: 'À répondre' },
  handledContact: { tone: 'positive', label: 'Traité' },
}

// ─── Sous-composants ───────────────────────────────────────────

/** Carte de chiffre d'affaires avec la répartition site / devis. */
function RevenueCard({
  label,
  value,
  ordersTtc,
  quotesTtc,
  count,
  highlight = false,
}: {
  label: string
  value: number
  ordersTtc: number
  quotesTtc: number
  count: number
  highlight?: boolean
}) {
  return (
    <Card
      padding={4}
      radius={2}
      shadow={1}
      style={{ borderTop: `3px solid ${highlight ? '#2b915d' : '#c8a25b'}` }}
    >
      <Stack space={3}>
        <Text size={1} weight="medium" muted>
          {label}
        </Text>
        <Heading size={4} style={{ lineHeight: 1 }}>
          {eur(value)}
        </Heading>
        <Text size={0} muted>
          {count} vente{count > 1 ? 's' : ''}
          {value > 0 && (
            <>
              {' · '}
              {eur(ordersTtc)} site · {eur(quotesTtc)} devis
            </>
          )}
        </Text>
      </Stack>
    </Card>
  )
}

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
  const [recentContacts, setRecentContacts] = useState<RecentDoc[]>([])
  const [revOrders, setRevOrders] = useState<RevenueOrder[]>([])
  const [revQuotes, setRevQuotes] = useState<RevenueQuote[]>([])
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
      client.fetch<RecentDoc[]>(RECENT_CONTACTS_QUERY),
      client.fetch<RevenueOrder[]>(REVENUE_ORDERS_QUERY),
      client.fetch<RevenueQuote[]>(REVENUE_QUOTES_QUERY),
    ])
      .then(([c, orders, products, blog, contacts, revO, revQ]) => {
        if (cancelled) return
        setCounts(c)
        setRecentOrders(orders)
        setRecentProducts(products)
        setRecentBlog(blog)
        setRecentContacts(contacts)
        setRevOrders(revO)
        setRevQuotes(revQ)
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

  // ── Chiffre d'affaires encaissé ──
  const now = new Date()
  const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const rev30 = computeRevenue(revOrders, revQuotes, since30)
  const revYear = computeRevenue(revOrders, revQuotes, startOfYear)
  const revAll = computeRevenue(revOrders, revQuotes, null)
  const avgBasket = revAll.count > 0 ? revAll.total / revAll.count : 0

  // Pipeline : devis envoyés en attente de réponse du client
  const pendingQuotes = revQuotes.filter(
    (q) => q.status === 'sent' || q.status === 'pending' || q.status === 'draft',
  )
  const pipelineTtc = pendingQuotes.reduce((s, q) => s + quoteTotalTtc(q), 0)

  // Taux d'acceptation : accepté / (accepté + refusé + expiré)
  const accepted = revQuotes.filter((q) => q.status === 'accepted').length
  const closed = revQuotes.filter((q) =>
    ['accepted', 'refused', 'expired'].includes(q.status || ''),
  ).length
  const acceptRate = closed > 0 ? Math.round((accepted / closed) * 100) : null

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
            {/* ─── CHIFFRE D'AFFAIRES ─── */}
            <Box>
              <Heading size={2} style={{ marginBottom: 4 }}>
                Chiffre d&apos;affaires encaissé
              </Heading>
              <Text size={1} muted style={{ marginBottom: 12, display: 'block' }}>
                Commandes payées sur le site + devis acceptés et réglés. Montants TTC,
                remboursements exclus.
              </Text>
              <Grid columns={[1, 2, 4]} gap={3}>
                <RevenueCard
                  label="30 derniers jours"
                  value={rev30.total}
                  ordersTtc={rev30.ordersTtc}
                  quotesTtc={rev30.quotesTtc}
                  count={rev30.count}
                  highlight
                />
                <RevenueCard
                  label={`Année ${now.getFullYear()}`}
                  value={revYear.total}
                  ordersTtc={revYear.ordersTtc}
                  quotesTtc={revYear.quotesTtc}
                  count={revYear.count}
                />
                <RevenueCard
                  label="Depuis le lancement"
                  value={revAll.total}
                  ordersTtc={revAll.ordersTtc}
                  quotesTtc={revAll.quotesTtc}
                  count={revAll.count}
                />
                <Card padding={4} radius={2} shadow={1} style={{ borderTop: '3px solid #6b6b6b' }}>
                  <Stack space={3}>
                    <Text size={1} weight="medium" muted>
                      💶 Panier moyen
                    </Text>
                    <Heading size={3} style={{ lineHeight: 1 }}>
                      {eur(avgBasket)}
                    </Heading>
                    <Text size={0} muted>
                      Sur {revAll.count} vente{revAll.count > 1 ? 's' : ''}
                    </Text>
                  </Stack>
                </Card>
              </Grid>

              <Grid columns={[1, 2, 2]} gap={3} style={{ marginTop: 12 }}>
                <Card
                  padding={4}
                  radius={2}
                  shadow={1}
                  style={{ borderTop: '3px solid #c58720', cursor: 'pointer' }}
                  onClick={() =>
                    router.navigateUrl({ path: '/studio/structure/devisLivraison' })
                  }
                >
                  <Stack space={3}>
                    <Text size={1} weight="medium" muted>
                      📋 En attente de réponse client
                    </Text>
                    <Heading size={3} style={{ lineHeight: 1 }}>
                      {eur(pipelineTtc)}
                    </Heading>
                    <Text size={0} muted>
                      {pendingQuotes.length} devis non conclu
                      {pendingQuotes.length > 1 ? 's' : ''} — chiffre potentiel, pas encore encaissé
                    </Text>
                  </Stack>
                </Card>
                <Card padding={4} radius={2} shadow={1} style={{ borderTop: '3px solid #2b915d' }}>
                  <Stack space={3}>
                    <Text size={1} weight="medium" muted>
                      ✅ Taux d&apos;acceptation des devis
                    </Text>
                    <Heading size={3} style={{ lineHeight: 1 }}>
                      {acceptRate !== null ? `${acceptRate} %` : '—'}
                    </Heading>
                    <Text size={0} muted>
                      {acceptRate !== null
                        ? `${accepted} accepté${accepted > 1 ? 's' : ''} sur ${closed} devis clos`
                        : 'Aucun devis clos pour l\'instant'}
                    </Text>
                  </Stack>
                </Card>
              </Grid>
            </Box>

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
                      path: '/studio/structure/mobilier',
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

            {/* ─── DEMANDES REÇUES (comptage) ─── */}
            <Box>
              <Heading size={2} style={{ marginBottom: 4 }}>
                Demandes reçues sur le site
              </Heading>
              <Text size={1} muted style={{ marginBottom: 12, display: 'block' }}>
                Formulaire de devis + formulaire de contact, comptés par période.
              </Text>
              <Grid columns={[2, 2, 4]} gap={3}>
                <KpiCard
                  icon="📋"
                  label="Devis — 7 derniers jours"
                  value={counts?.quotes7d ?? 0}
                  sub={`${counts?.quotes30d ?? 0} sur 30 jours · ${counts?.quotesTotal ?? 0} au total`}
                  tone={counts && counts.quotes7d > 0 ? 'positive' : 'default'}
                  onClick={() =>
                    router.navigateUrl({ path: '/studio/structure/devisLivraison' })
                  }
                />
                <KpiCard
                  icon="📋"
                  label="Devis à traiter"
                  value={counts?.quotesPending ?? 0}
                  sub="Demandes sans réponse"
                  tone={counts && counts.quotesPending > 0 ? 'caution' : 'positive'}
                  onClick={() =>
                    router.navigateUrl({ path: '/studio/structure/devisLivraison' })
                  }
                />
                <KpiCard
                  icon="✉️"
                  label="Contacts — 7 derniers jours"
                  value={counts?.contacts7d ?? 0}
                  sub={`${counts?.contacts30d ?? 0} sur 30 jours · ${counts?.contactsTotal ?? 0} au total`}
                  tone={counts && counts.contacts7d > 0 ? 'positive' : 'default'}
                  onClick={() =>
                    router.navigateUrl({ path: '/studio/structure/contactMessages' })
                  }
                />
                <KpiCard
                  icon="✉️"
                  label="Contacts à répondre"
                  value={counts?.contactsUnhandled ?? 0}
                  sub='Coche "Traité" après réponse'
                  tone={counts && counts.contactsUnhandled > 0 ? 'caution' : 'positive'}
                  onClick={() =>
                    router.navigateUrl({ path: '/studio/structure/contactMessages' })
                  }
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
            <Grid columns={[1, 2, 4]} gap={4}>
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

              {/* Derniers messages contact */}
              <Card padding={4} radius={2} shadow={1} tone="default">
                <Stack space={3}>
                  <Flex align="center" justify="space-between">
                    <Heading size={1}>Derniers messages contact</Heading>
                    <Text size={0} muted>
                      {counts?.contactsUnhandled ?? 0} à répondre
                    </Text>
                  </Flex>
                  {recentContacts.length === 0 ? (
                    <Text size={1} muted>
                      Aucun message pour l&apos;instant.
                    </Text>
                  ) : (
                    <Stack space={0}>
                      {recentContacts.map((doc) => (
                        <RecentItem
                          key={doc._id}
                          doc={doc}
                          labelKey="name"
                          onClick={() => openDoc(doc._id, 'contactMessage')}
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
                  icon="📕"
                  label="Catalogue PDF"
                  href="https://mobiliermalin.com/catalogue.pdf"
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
