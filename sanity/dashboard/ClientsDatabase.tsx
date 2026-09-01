/**
 * Base de données clients — vue consolidée dans Sanity Studio.
 *
 * Agrège en une seule fiche par client (clé = email en minuscules) les
 * trois sources de contact du site :
 *   - `order`          commandes payées sur la boutique
 *   - `quote`          devis et factures
 *   - `contactMessage` formulaire de contact
 *
 * Fournit la recherche, le tri, le détail par client et l'export CSV
 * (ouvrable dans Excel, Numbers ou Google Sheets).
 *
 * Lecture seule : cette vue ne modifie jamais les documents.
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
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { apiVersion } from '../env'

// ─── Sources ─────────────────────────────────────────────────

type SrcOrder = {
  _id: string
  numero?: string
  placedAt?: string
  _createdAt: string
  amountTotalCents?: number
  status?: string
  customer?: { name?: string; email?: string; phone?: string }
  shippingAddress?: {
    line1?: string
    line2?: string
    postalCode?: string
    city?: string
    country?: string
  }
}

type SrcQuote = {
  _id: string
  numero?: string
  status?: string
  documentType?: string
  acceptedAt?: string
  sentAt?: string
  _createdAt: string
  customer?: { name?: string; email?: string; phone?: string; company?: string }
  shippingAddress?: { street?: string; postalCode?: string; city?: string }
  billingAddress?: { street?: string; postalCode?: string; city?: string }
  lineItems?: Array<{ unitPrice?: number; quantity?: number }>
  product?: { unitPrice?: number; quantity?: number }
  shippingFee?: number
  options?: Array<{ price?: number }>
  tvaRate?: number
}

type SrcContact = {
  _id: string
  name?: string
  email?: string
  phone?: string
  company?: string
  projectType?: string
  receivedAt?: string
  _createdAt: string
  handled?: boolean
}

const ORDERS_QUERY = `*[_type == "order"]{
  _id, numero, placedAt, _createdAt, amountTotalCents, status,
  customer, shippingAddress
}`

const QUOTES_QUERY = `*[_type == "quote"]{
  _id, numero, status, documentType, acceptedAt, sentAt, _createdAt,
  customer, shippingAddress, billingAddress,
  lineItems[]{ unitPrice, quantity }, product{ unitPrice, quantity },
  shippingFee, options[]{ price }, tvaRate
}`

const CONTACTS_QUERY = `*[_type == "contactMessage"]{
  _id, name, email, phone, company, projectType, receivedAt, _createdAt, handled
}`

// ─── Modèle client consolidé ─────────────────────────────────

type ClientDoc = {
  id: string
  type: 'order' | 'quote' | 'contact'
  label: string
  date: Date
  amount?: number
  status?: string
}

type Client = {
  email: string
  name: string
  phone?: string
  company?: string
  address?: string
  postalCode?: string
  city?: string
  ordersCount: number
  quotesCount: number
  quotesAccepted: number
  contactsCount: number
  revenue: number
  firstSeen: Date
  lastSeen: Date
  docs: ClientDoc[]
}

const PROJECT_LABELS: Record<string, string> = {
  achat: 'Achat',
  'devis-livraison': 'Devis livraison',
  vidage: 'Vidage de locaux',
  mixte: 'Achat + vidage',
  lld: 'LLD',
  devis: 'Devis détaillé',
  autre: 'Autre',
}

function quoteTotalTtc(q: SrcQuote): number {
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

/** Fusionne les trois sources en une fiche par email. */
function buildClients(
  orders: SrcOrder[],
  quotes: SrcQuote[],
  contacts: SrcContact[],
): Client[] {
  const map = new Map<string, Client>()

  const touch = (
    email?: string,
    name?: string,
    phone?: string,
    company?: string,
  ): Client | null => {
    const key = (email || '').trim().toLowerCase()
    if (!key) return null
    let c = map.get(key)
    if (!c) {
      c = {
        email: key,
        name: name?.trim() || '(sans nom)',
        ordersCount: 0,
        quotesCount: 0,
        quotesAccepted: 0,
        contactsCount: 0,
        revenue: 0,
        firstSeen: new Date(8640000000000000),
        lastSeen: new Date(0),
        docs: [],
      }
      map.set(key, c)
    }
    // Les informations les plus complètes gagnent
    if (name?.trim() && (c.name === '(sans nom)' || name.trim().length > c.name.length)) {
      c.name = name.trim()
    }
    if (phone?.trim() && !c.phone) c.phone = phone.trim()
    if (company?.trim() && !c.company) c.company = company.trim()
    return c
  }

  const stamp = (c: Client, d: Date) => {
    if (d < c.firstSeen) c.firstSeen = d
    if (d > c.lastSeen) c.lastSeen = d
  }

  for (const o of orders) {
    const c = touch(o.customer?.email, o.customer?.name, o.customer?.phone)
    if (!c) continue
    const d = new Date(o.placedAt || o._createdAt)
    const amount = (o.amountTotalCents ?? 0) / 100
    c.ordersCount++
    if (o.status !== 'refunded') c.revenue += amount
    if (!c.address && o.shippingAddress?.line1) {
      c.address = [o.shippingAddress.line1, o.shippingAddress.line2]
        .filter(Boolean)
        .join(' ')
      c.postalCode = o.shippingAddress.postalCode
      c.city = o.shippingAddress.city
    }
    stamp(c, d)
    c.docs.push({
      id: o._id,
      type: 'order',
      label: `Commande ${o.numero || ''}`.trim(),
      date: d,
      amount,
      status: o.status,
    })
  }

  for (const q of quotes) {
    const c = touch(
      q.customer?.email,
      q.customer?.name,
      q.customer?.phone,
      q.customer?.company,
    )
    if (!c) continue
    const d = new Date(q.acceptedAt || q.sentAt || q._createdAt)
    const amount = quoteTotalTtc(q)
    c.quotesCount++
    if (q.status === 'accepted') {
      c.quotesAccepted++
      c.revenue += amount
    }
    const addr = q.billingAddress?.street ? q.billingAddress : q.shippingAddress
    if (!c.address && addr?.street) {
      c.address = addr.street
      c.postalCode = addr.postalCode
      c.city = addr.city
    }
    stamp(c, d)
    c.docs.push({
      id: q._id,
      type: 'quote',
      label: `${q.documentType === 'invoice' ? 'Facture' : 'Devis'} ${q.numero || ''}`.trim(),
      date: d,
      amount,
      status: q.status,
    })
  }

  for (const m of contacts) {
    const c = touch(m.email, m.name, m.phone, m.company)
    if (!c) continue
    const d = new Date(m.receivedAt || m._createdAt)
    c.contactsCount++
    stamp(c, d)
    c.docs.push({
      id: m._id,
      type: 'contact',
      label: `Message — ${PROJECT_LABELS[m.projectType || ''] || m.projectType || 'contact'}`,
      date: d,
      status: m.handled ? 'traité' : 'à répondre',
    })
  }

  const list = [...map.values()]
  for (const c of list) {
    c.docs.sort((a, b) => b.date.getTime() - a.date.getTime())
  }
  return list
}

// ─── Export CSV ──────────────────────────────────────────────

function csvCell(v: unknown): string {
  const s = v === undefined || v === null ? '' : String(v)
  return `"${s.replace(/"/g, '""')}"`
}

function toCsv(clients: Client[]): string {
  const header = [
    'Nom',
    'Email',
    'Téléphone',
    'Société',
    'Type',
    'Adresse',
    'Code postal',
    'Ville',
    'Commandes',
    'Devis',
    'Devis acceptés',
    'Messages',
    'CA total TTC (€)',
    'Premier contact',
    'Dernière activité',
  ]
  const rows = clients.map((c) =>
    [
      c.name,
      c.email,
      c.phone || '',
      c.company || '',
      c.company ? 'Professionnel' : 'Particulier',
      c.address || '',
      c.postalCode || '',
      c.city || '',
      c.ordersCount,
      c.quotesCount,
      c.quotesAccepted,
      c.contactsCount,
      c.revenue.toFixed(2).replace('.', ','),
      c.firstSeen.toLocaleDateString('fr-FR'),
      c.lastSeen.toLocaleDateString('fr-FR'),
    ]
      .map(csvCell)
      .join(';'),
  )
  // BOM UTF-8 : Excel ouvre correctement les accents
  return '﻿' + [header.map(csvCell).join(';'), ...rows].join('\r\n')
}

function downloadCsv(clients: Client[]) {
  const blob = new Blob([toCsv(clients)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `clients-mobilier-malin-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Composant ───────────────────────────────────────────────

const eur = (v: number) =>
  v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) +
  ' €'

type SortKey = 'revenue' | 'recent' | 'name'

export function ClientsDatabase() {
  const client = useClient({ apiVersion })
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<SrcOrder[]>([])
  const [quotes, setQuotes] = useState<SrcQuote[]>([])
  const [contacts, setContacts] = useState<SrcContact[]>([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [filter, setFilter] = useState<'all' | 'buyers' | 'pro'>('all')
  const [openEmail, setOpenEmail] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      client.fetch<SrcOrder[]>(ORDERS_QUERY),
      client.fetch<SrcQuote[]>(QUOTES_QUERY),
      client.fetch<SrcContact[]>(CONTACTS_QUERY),
    ])
      .then(([o, q, m]) => {
        if (cancelled) return
        setOrders(o)
        setQuotes(q)
        setContacts(m)
      })
      .catch((err) => console.warn('[clients] fetch error', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [client])

  const allClients = useMemo(
    () => buildClients(orders, quotes, contacts),
    [orders, quotes, contacts],
  )

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    let list = allClients
    if (filter === 'buyers') list = list.filter((c) => c.revenue > 0)
    if (filter === 'pro') list = list.filter((c) => !!c.company)
    if (term) {
      list = list.filter((c) =>
        [c.name, c.email, c.company, c.phone, c.city]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(term)),
      )
    }
    const sorted = [...list]
    if (sortKey === 'revenue') sorted.sort((a, b) => b.revenue - a.revenue)
    if (sortKey === 'recent')
      sorted.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
    if (sortKey === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    return sorted
  }, [allClients, search, sortKey, filter])

  const totalRevenue = allClients.reduce((s, c) => s + c.revenue, 0)
  const buyers = allClients.filter((c) => c.revenue > 0).length
  const pros = allClients.filter((c) => !!c.company).length

  const openDoc = (id: string, type: ClientDoc['type']) => {
    const schemaType =
      type === 'order' ? 'order' : type === 'quote' ? 'quote' : 'contactMessage'
    router.navigateIntent('edit', { id, type: schemaType })
  }

  return (
    <Box padding={4} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Stack space={5}>
        <Box>
          <Heading size={4}>Base clients</Heading>
          <Text size={1} muted style={{ marginTop: 8 }}>
            Vue consolidée des commandes, devis et messages de contact, regroupés
            par adresse email. Lecture seule : rien n&apos;est modifié ici.
          </Text>
        </Box>

        {loading ? (
          <Flex align="center" justify="center" padding={5}>
            <Spinner muted />
          </Flex>
        ) : (
          <>
            {/* Synthèse */}
            <Grid columns={[2, 2, 4]} gap={3}>
              <Card padding={4} radius={2} shadow={1} style={{ borderTop: '3px solid #c8a25b' }}>
                <Stack space={3}>
                  <Text size={1} weight="medium" muted>
                    👥 Clients identifiés
                  </Text>
                  <Heading size={4} style={{ lineHeight: 1 }}>
                    {allClients.length}
                  </Heading>
                </Stack>
              </Card>
              <Card padding={4} radius={2} shadow={1} style={{ borderTop: '3px solid #2b915d' }}>
                <Stack space={3}>
                  <Text size={1} weight="medium" muted>
                    🛒 Ont déjà acheté
                  </Text>
                  <Heading size={4} style={{ lineHeight: 1 }}>
                    {buyers}
                  </Heading>
                </Stack>
              </Card>
              <Card padding={4} radius={2} shadow={1} style={{ borderTop: '3px solid #6b6b6b' }}>
                <Stack space={3}>
                  <Text size={1} weight="medium" muted>
                    🏢 Professionnels
                  </Text>
                  <Heading size={4} style={{ lineHeight: 1 }}>
                    {pros}
                  </Heading>
                </Stack>
              </Card>
              <Card padding={4} radius={2} shadow={1} style={{ borderTop: '3px solid #c58720' }}>
                <Stack space={3}>
                  <Text size={1} weight="medium" muted>
                    💶 CA cumulé
                  </Text>
                  <Heading size={4} style={{ lineHeight: 1 }}>
                    {eur(totalRevenue)}
                  </Heading>
                </Stack>
              </Card>
            </Grid>

            {/* Barre d'outils */}
            <Card padding={3} radius={2} shadow={1}>
              <Grid columns={[1, 1, 4]} gap={3}>
                <Box style={{ gridColumn: 'span 2' }}>
                  <TextInput
                    placeholder="Rechercher un nom, email, société, ville…"
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                  />
                </Box>
                <Select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.currentTarget.value as 'all' | 'buyers' | 'pro')
                  }
                >
                  <option value="all">Tous les contacts</option>
                  <option value="buyers">Clients ayant acheté</option>
                  <option value="pro">Professionnels seulement</option>
                </Select>
                <Select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.currentTarget.value as SortKey)}
                >
                  <option value="revenue">Trier par CA</option>
                  <option value="recent">Trier par activité récente</option>
                  <option value="name">Trier par nom</option>
                </Select>
              </Grid>
              <Flex justify="space-between" align="center" style={{ marginTop: 12 }}>
                <Text size={1} muted>
                  {visible.length} client{visible.length > 1 ? 's' : ''} affiché
                  {visible.length > 1 ? 's' : ''}
                </Text>
                <Button
                  text="⬇️ Exporter en CSV"
                  tone="primary"
                  mode="ghost"
                  disabled={visible.length === 0}
                  onClick={() => downloadCsv(visible)}
                />
              </Flex>
            </Card>

            {/* Liste */}
            {visible.length === 0 ? (
              <Card padding={5} radius={2} shadow={1}>
                <Text size={1} muted align="center">
                  Aucun client ne correspond à cette recherche.
                </Text>
              </Card>
            ) : (
              <Card padding={0} radius={2} shadow={1}>
                <Stack space={0}>
                  {visible.map((c) => {
                    const open = openEmail === c.email
                    return (
                      <Box key={c.email}>
                        <Card
                          padding={3}
                          tone="transparent"
                          style={{
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0ec',
                          }}
                          onClick={() => setOpenEmail(open ? null : c.email)}
                        >
                          <Flex align="center" justify="space-between" gap={3}>
                            <Box flex={1} style={{ minWidth: 0 }}>
                              <Flex align="center" gap={2}>
                                <Text size={1} weight="semibold" textOverflow="ellipsis">
                                  {c.name}
                                </Text>
                                {c.company && <Badge tone="primary">{c.company}</Badge>}
                              </Flex>
                              <Text size={0} muted style={{ marginTop: 3 }}>
                                {c.email}
                                {c.phone ? ` · ${c.phone}` : ''}
                                {c.city ? ` · ${c.city}` : ''}
                              </Text>
                            </Box>
                            <Box style={{ minWidth: 150 }}>
                              <Text size={0} muted align="right">
                                {c.ordersCount > 0 && `${c.ordersCount} cde `}
                                {c.quotesCount > 0 && `${c.quotesCount} devis `}
                                {c.contactsCount > 0 && `${c.contactsCount} msg`}
                              </Text>
                            </Box>
                            <Box style={{ minWidth: 80 }}>
                              <Text size={1} weight="semibold" align="right">
                                {c.revenue > 0 ? eur(c.revenue) : '—'}
                              </Text>
                            </Box>
                          </Flex>
                        </Card>

                        {open && (
                          <Card padding={4} tone="transparent" style={{ background: '#faf9f6' }}>
                            <Stack space={3}>
                              <Grid columns={[1, 2, 4]} gap={3}>
                                <Box>
                                  <Text size={0} muted>
                                    Premier contact
                                  </Text>
                                  <Text size={1} style={{ marginTop: 2 }}>
                                    {c.firstSeen.toLocaleDateString('fr-FR')}
                                  </Text>
                                </Box>
                                <Box>
                                  <Text size={0} muted>
                                    Dernière activité
                                  </Text>
                                  <Text size={1} style={{ marginTop: 2 }}>
                                    {c.lastSeen.toLocaleDateString('fr-FR')}
                                  </Text>
                                </Box>
                                <Box>
                                  <Text size={0} muted>
                                    Devis acceptés
                                  </Text>
                                  <Text size={1} style={{ marginTop: 2 }}>
                                    {c.quotesAccepted} / {c.quotesCount}
                                  </Text>
                                </Box>
                                <Box>
                                  <Text size={0} muted>
                                    Adresse
                                  </Text>
                                  <Text size={1} style={{ marginTop: 2 }}>
                                    {c.address
                                      ? `${c.address}, ${c.postalCode || ''} ${c.city || ''}`
                                      : 'non renseignée'}
                                  </Text>
                                </Box>
                              </Grid>

                              <Text size={0} muted style={{ marginTop: 4 }}>
                                HISTORIQUE ({c.docs.length})
                              </Text>
                              <Stack space={0}>
                                {c.docs.map((d) => (
                                  <Card
                                    key={`${d.type}-${d.id}`}
                                    padding={2}
                                    tone="transparent"
                                    style={{
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #eee',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openDoc(d.id, d.type)
                                    }}
                                  >
                                    <Flex align="center" justify="space-between" gap={2}>
                                      <Box style={{ minWidth: 84 }}>
                                        <Text size={0} muted>
                                          {d.date.toLocaleDateString('fr-FR')}
                                        </Text>
                                      </Box>
                                      <Box style={{ minWidth: 66 }}>
                                        <Badge
                                          tone={
                                            d.type === 'order'
                                              ? 'primary'
                                              : d.type === 'quote'
                                                ? 'positive'
                                                : 'default'
                                          }
                                        >
                                          {d.type === 'order'
                                            ? 'Commande'
                                            : d.type === 'quote'
                                              ? 'Devis'
                                              : 'Message'}
                                        </Badge>
                                      </Box>
                                      <Box flex={1} style={{ minWidth: 0 }}>
                                        <Text size={0}>
                                          {d.label}
                                          {d.status ? ` · ${d.status}` : ''}
                                        </Text>
                                      </Box>
                                      <Text size={0} weight="medium">
                                        {typeof d.amount === 'number' && d.amount > 0
                                          ? eur(d.amount)
                                          : ''}
                                      </Text>
                                    </Flex>
                                  </Card>
                                ))}
                              </Stack>
                            </Stack>
                          </Card>
                        )}
                      </Box>
                    )
                  })}
                </Stack>
              </Card>
            )}

            <Card padding={3} tone="transparent">
              <Text size={0} muted align="center">
                L&apos;export CSV reprend exactement les clients affichés (filtres et
                recherche compris). Séparateur point-virgule, encodage UTF-8 :
                s&apos;ouvre directement dans Excel, Numbers ou Google Sheets.
              </Text>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  )
}
