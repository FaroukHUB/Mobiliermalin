import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'

const formatEuro = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)

const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))

export default async function Dashboard({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { req } = initPageResult
  const { payload, user } = req

  // Stats du jour (commandes payées aujourd'hui)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // On execute toutes les requetes en parallele pour accelerer
  const [
    productsTotal,
    productsPublished,
    ordersTotal,
    ordersToday,
    pendingOrders,
    lowStock,
    recentOrders,
    customersTotal,
  ] = await Promise.all([
    payload
      .count({ collection: 'products' })
      .then((r) => r.totalDocs)
      .catch(() => 0),
    payload
      .count({ collection: 'products', where: { status: { equals: 'published' } } })
      .then((r) => r.totalDocs)
      .catch(() => 0),
    payload
      .count({ collection: 'orders' })
      .then((r) => r.totalDocs)
      .catch(() => 0),
    payload
      .find({
        collection: 'orders',
        where: {
          and: [
            { createdAt: { greater_than_equal: today.toISOString() } },
            { createdAt: { less_than: tomorrow.toISOString() } },
          ],
        },
        limit: 100,
        depth: 0,
      })
      .catch(() => ({ docs: [] as unknown[] })),
    payload
      .count({ collection: 'orders', where: { status: { equals: 'pending' } } })
      .then((r) => r.totalDocs)
      .catch(() => 0),
    payload
      .find({
        collection: 'products',
        where: {
          and: [
            { stock: { less_than_equal: 2 } },
            { status: { equals: 'published' } },
          ],
        },
        limit: 5,
        depth: 0,
      })
      .catch(() => ({ docs: [] as unknown[] })),
    payload
      .find({
        collection: 'orders',
        sort: '-createdAt',
        limit: 5,
        depth: 0,
      })
      .catch(() => ({ docs: [] as unknown[] })),
    payload
      .count({ collection: 'customers' })
      .then((r) => r.totalDocs)
      .catch(() => 0),
  ])

  type OrderDoc = {
    id: string | number
    orderNumber?: string
    status?: string
    total?: number
    customerEmail?: string
    createdAt?: string
  }

  const ordersTodayDocs = (ordersToday.docs ?? []) as OrderDoc[]
  const recentOrdersDocs = (recentOrders.docs ?? []) as OrderDoc[]
  const lowStockDocs = (lowStock.docs ?? []) as Array<{
    id: string | number
    title?: string
    stock?: number
    price?: number
  }>

  const revenueToday = ordersTodayDocs
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total ?? 0), 0)

  const userName =
    (user as { name?: string; email?: string } | null)?.name ||
    (user as { name?: string; email?: string } | null)?.email?.split('@')[0] ||
    ''

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    paid: 'Payée',
    preparing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    refunded: 'Remboursée',
  }

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter className="mm-dashboard">
        {/* Welcome banner */}
        <section className="mm-dashboard__hero">
          <div>
            <p className="mm-dashboard__eyebrow">Mobilier Malin · Espace de gestion</p>
            <h1 className="mm-dashboard__greeting">
              Bonjour{userName ? `, ${userName}` : ''} <span aria-hidden>👋</span>
            </h1>
            <p className="mm-dashboard__subtitle">
              Voici un aperçu de votre boutique aujourd&apos;hui.
            </p>
          </div>
          <div className="mm-dashboard__hero-meta">
            <span className="mm-dashboard__date">{formatDate(new Date())}</span>
          </div>
        </section>

        {/* Stats row */}
        <section className="mm-stats-grid">
          <StatCard
            label="Commandes aujourd&apos;hui"
            value={String(ordersTodayDocs.length)}
            sub={
              ordersTodayDocs.length === 0
                ? 'Aucune commande pour le moment'
                : `${pendingOrders} en attente de paiement`
            }
          />
          <StatCard
            label="Chiffre d&apos;affaires du jour"
            value={formatEuro(revenueToday)}
            sub={revenueToday === 0 ? 'En attente de la première vente' : 'Net encaissé'}
          />
          <StatCard
            label="Stock faible"
            value={String(lowStockDocs.length)}
            sub={
              lowStockDocs.length === 0
                ? 'Tous les produits sont OK'
                : 'Produits ≤ 2 unités'
            }
            tone={lowStockDocs.length > 0 ? 'alert' : 'neutral'}
          />
          <StatCard
            label="Catalogue"
            value={String(productsPublished)}
            sub={`sur ${productsTotal} produit${productsTotal > 1 ? 's' : ''} au total`}
          />
        </section>

        {/* Quick actions */}
        <section className="mm-section">
          <h2 className="mm-section__title">Actions rapides</h2>
          <div className="mm-actions">
            <Link className="mm-action mm-action--primary" href="/admin/collections/products/create">
              <span className="mm-action__icon">＋</span>
              Nouveau produit
            </Link>
            <Link className="mm-action" href="/admin/collections/hero-slides/create">
              <span className="mm-action__icon">＋</span>
              Nouvelle slide
            </Link>
            <Link className="mm-action" href="/admin/collections/blog-posts/create">
              <span className="mm-action__icon">＋</span>
              Nouvel article
            </Link>
            <Link className="mm-action" href="/admin/collections/orders">
              <span className="mm-action__icon">→</span>
              Voir les commandes
            </Link>
            <Link className="mm-action" href="/admin/collections/media">
              <span className="mm-action__icon">⊕</span>
              Photothèque
            </Link>
          </div>
        </section>

        {/* Recent orders + Low stock — 2 columns */}
        <section className="mm-grid-2">
          <div className="mm-section">
            <div className="mm-section__head">
              <h2 className="mm-section__title">Dernières commandes</h2>
              <Link href="/admin/collections/orders" className="mm-link">
                Tout voir →
              </Link>
            </div>
            {recentOrdersDocs.length === 0 ? (
              <EmptyState
                title="Aucune commande pour le moment"
                cta="Voir le catalogue"
                href="/admin/collections/products"
              />
            ) : (
              <ul className="mm-list">
                {recentOrdersDocs.map((order) => (
                  <li key={String(order.id)} className="mm-list__row">
                    <div>
                      <p className="mm-list__title">
                        {order.orderNumber || `Commande #${order.id}`}
                      </p>
                      <p className="mm-list__sub">
                        {order.customerEmail || 'Client invité'} ·{' '}
                        {order.createdAt && formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="mm-list__meta">
                      <span className={`mm-badge mm-badge--${order.status || 'pending'}`}>
                        {statusLabels[order.status || 'pending'] || order.status}
                      </span>
                      <span className="mm-list__price">{formatEuro(order.total ?? 0)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mm-section">
            <div className="mm-section__head">
              <h2 className="mm-section__title">Produits à surveiller</h2>
              <Link href="/admin/collections/products" className="mm-link">
                Catalogue →
              </Link>
            </div>
            {lowStockDocs.length === 0 ? (
              <EmptyState
                title="Aucun produit en alerte de stock"
                cta="Ajouter un produit"
                href="/admin/collections/products/create"
              />
            ) : (
              <ul className="mm-list">
                {lowStockDocs.map((p) => (
                  <li key={String(p.id)} className="mm-list__row">
                    <div>
                      <p className="mm-list__title">{p.title || `Produit #${p.id}`}</p>
                      <p className="mm-list__sub">{formatEuro(p.price ?? 0)}</p>
                    </div>
                    <span className="mm-badge mm-badge--alert">
                      {p.stock === 0 ? 'En rupture' : `${p.stock} restant${(p.stock ?? 0) > 1 ? 's' : ''}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Footer stats */}
        <section className="mm-footer-stats">
          <span>{customersTotal} client{customersTotal > 1 ? 's' : ''}</span>
          <span aria-hidden>·</span>
          <span>{ordersTotal} commande{ordersTotal > 1 ? 's' : ''} au total</span>
        </section>
      </Gutter>
    </DefaultTemplate>
  )
}

function StatCard({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'neutral' | 'alert'
}) {
  return (
    <div className={`mm-stat mm-stat--${tone}`}>
      <p className="mm-stat__label">{label}</p>
      <p className="mm-stat__value">{value}</p>
      {sub && <p className="mm-stat__sub">{sub}</p>}
    </div>
  )
}

function EmptyState({
  title,
  cta,
  href,
}: {
  title: string
  cta: string
  href: string
}) {
  return (
    <div className="mm-empty">
      <p className="mm-empty__title">{title}</p>
      <Link href={href} className="mm-empty__cta">
        {cta}
      </Link>
    </div>
  )
}
