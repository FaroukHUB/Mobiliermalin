/**
 * Vue tableau pour le registre des ventes et celui des dépenses.
 *
 * La liste par défaut du Studio n'affiche qu'une ligne de titre par
 * document : pour un registre comptable, il faut voir les colonnes
 * côte à côte, trier dessus et faire des totaux. C'est le pendant de
 * la vue galerie du mobilier, en paysage plutôt qu'en cartes : une
 * vente n'a pas d'image, elle a des chiffres.
 *
 * Ce que la vue apporte sur la liste :
 *   - toutes les colonnes du suivi, triables au clic sur l'en-tête
 *   - recherche instantanée sur le client, la désignation, le
 *     commentaire
 *   - filtres par année, par mois, par canal ou catégorie
 *   - une ligne de total qui suit les filtres actifs
 *   - export CSV de ce qui est affiché, pas de tout le registre
 *   - clic sur une ligne pour ouvrir le document
 *
 * Lecture seule : rien n'est modifié ici, la correction se fait dans
 * l'éditeur du document.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Select,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { apiVersion } from '../env'
import { EXPENSE_CATEGORIES } from '../schemas/expense'

// ─── Données ─────────────────────────────────────────────────

type Row = {
  _id: string
  date?: string
  // Ventes
  customerName?: string
  designation?: string
  amountCollected?: number
  shippingFee?: number
  saleType?: string
  channel?: string
  // Dépenses
  label?: string
  supplier?: string
  category?: string
  amountTtc?: number
  tvaRate?: number
  // Commun
  paymentMethod?: string
  notes?: string
}

const SALES_QUERY = `*[_type == "sale"] | order(date desc)[0...3000]{
  _id, date, customerName, designation, amountCollected, shippingFee,
  paymentMethod, saleType, channel, notes
}`

const EXPENSES_QUERY = `*[_type == "expense"] | order(date desc)[0...3000]{
  _id, date, label, supplier, category, amountTtc, tvaRate, paymentMethod, notes
}`

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const PAYMENT_LABELS: Record<string, string> = {
  cb: 'Carte bancaire',
  stripe: 'Stripe',
  especes: 'Espèces',
  virement: 'Virement',
  cheque: 'Chèque',
  prelevement: 'Prélèvement',
  leboncoin: 'Bon Coin',
  autre: 'Autre',
}

const CHANNEL_LABELS: Record<string, string> = {
  site: 'Site',
  devis: 'Devis',
  showroom: 'Showroom',
  leboncoin: 'Bon Coin',
  telephone: 'Téléphone',
  autre: 'Autre',
}

const SALE_TYPE_LABELS: Record<string, string> = {
  'sur-place': 'Sur place',
  'livraison-cocolis': 'Livraison Cocolis',
  'autre-livraison': 'Autre livraison',
}

const catLabel = (v?: string) =>
  EXPENSE_CATEGORIES.find((c) => c.value === v)?.title.replace(/^\S+\s/, '') || v || ''

// ─── Formatage ───────────────────────────────────────────────

const eur = (v: number) =>
  v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

const eur0 = (v: number) =>
  v.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €'

const frDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR') : ''

const yearOf = (iso?: string) => (iso ? Number(iso.slice(0, 4)) : 0)
const monthOf = (iso?: string) => (iso ? Number(iso.slice(5, 7)) - 1 : -1)

// ─── Export CSV ──────────────────────────────────────────────

const csvCell = (v: unknown) =>
  `"${(v === undefined || v === null ? '' : String(v)).replace(/"/g, '""')}"`

const num = (v: number) => v.toFixed(2).replace('.', ',')
const clean = (s?: string) => (s || '').replace(/\s+/g, ' ').trim()

function toCsv(kind: Kind, rows: Row[]): string {
  const header =
    kind === 'sale'
      ? [
          'Date', 'Client', 'Désignation(s)', 'Montant encaissé',
          'Frais de livraison', 'Restant après frais', 'Mode de paiement',
          'Type de vente', 'Canal', 'Commentaire',
        ]
      : [
          'Date', 'Fournisseur', 'Libellé', 'Catégorie', 'Mode de paiement',
          'Montant TTC', 'TVA récupérable', 'Commentaire',
        ]

  const lines = rows.map((r) => {
    if (kind === 'sale') {
      const a = r.amountCollected || 0
      const s = r.shippingFee || 0
      return [
        frDate(r.date), r.customerName || '', clean(r.designation),
        num(a), num(s), num(a - s),
        PAYMENT_LABELS[r.paymentMethod || ''] || r.paymentMethod || '',
        SALE_TYPE_LABELS[r.saleType || ''] || r.saleType || '',
        CHANNEL_LABELS[r.channel || ''] || r.channel || '',
        clean(r.notes),
      ].map(csvCell).join(';')
    }
    const ttc = r.amountTtc || 0
    const rate = r.tvaRate ?? 20
    return [
      frDate(r.date), r.supplier || '', r.label || '', catLabel(r.category),
      PAYMENT_LABELS[r.paymentMethod || ''] || r.paymentMethod || '',
      num(ttc), num(rate > 0 ? ttc - ttc / (1 + rate / 100) : 0),
      clean(r.notes),
    ].map(csvCell).join(';')
  })

  // BOM UTF-8 : Excel ouvre correctement les accents
  return '﻿' + [header.map(csvCell).join(';'), ...lines].join('\r\n')
}

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Colonnes ────────────────────────────────────────────────

type Kind = 'sale' | 'expense'
type Align = 'left' | 'right'

type Column = {
  key: string
  title: string
  align?: Align
  width?: number
  /** Valeur affichée. */
  render: (r: Row) => string
  /** Valeur de tri : nombre pour les montants, texte sinon. */
  sortBy: (r: Row) => string | number
  /** Colonne additionnée dans la ligne de total. */
  total?: (r: Row) => number
}

const SALE_COLUMNS: Column[] = [
  {
    key: 'date', title: 'Date', width: 92,
    render: (r) => frDate(r.date),
    sortBy: (r) => r.date || '',
  },
  {
    key: 'customer', title: 'Client', width: 160,
    render: (r) => r.customerName || '',
    sortBy: (r) => (r.customerName || '').toLowerCase(),
  },
  {
    key: 'designation', title: 'Désignation',
    render: (r) => clean(r.designation),
    sortBy: (r) => (r.designation || '').toLowerCase(),
  },
  {
    key: 'amount', title: 'Encaissé', align: 'right', width: 104,
    render: (r) => eur(r.amountCollected || 0),
    sortBy: (r) => r.amountCollected || 0,
    total: (r) => r.amountCollected || 0,
  },
  {
    key: 'shipping', title: 'Livraison', align: 'right', width: 96,
    render: (r) => ((r.shippingFee || 0) > 0 ? eur(r.shippingFee || 0) : '—'),
    sortBy: (r) => r.shippingFee || 0,
    total: (r) => r.shippingFee || 0,
  },
  {
    key: 'net', title: 'Restant', align: 'right', width: 104,
    render: (r) => eur((r.amountCollected || 0) - (r.shippingFee || 0)),
    sortBy: (r) => (r.amountCollected || 0) - (r.shippingFee || 0),
    total: (r) => (r.amountCollected || 0) - (r.shippingFee || 0),
  },
  {
    key: 'payment', title: 'Paiement', width: 124,
    render: (r) => PAYMENT_LABELS[r.paymentMethod || ''] || r.paymentMethod || '',
    sortBy: (r) => r.paymentMethod || '',
  },
  {
    key: 'channel', title: 'Canal', width: 96,
    render: (r) => CHANNEL_LABELS[r.channel || ''] || r.channel || '',
    sortBy: (r) => r.channel || '',
  },
  {
    key: 'type', title: 'Type', width: 132,
    render: (r) => SALE_TYPE_LABELS[r.saleType || ''] || r.saleType || '',
    sortBy: (r) => r.saleType || '',
  },
]

const EXPENSE_COLUMNS: Column[] = [
  {
    key: 'date', title: 'Date', width: 92,
    render: (r) => frDate(r.date),
    sortBy: (r) => r.date || '',
  },
  {
    key: 'label', title: 'Libellé',
    render: (r) => r.label || '',
    sortBy: (r) => (r.label || '').toLowerCase(),
  },
  {
    key: 'supplier', title: 'Fournisseur', width: 150,
    render: (r) => r.supplier || '',
    sortBy: (r) => (r.supplier || '').toLowerCase(),
  },
  {
    key: 'category', title: 'Catégorie', width: 176,
    render: (r) => catLabel(r.category),
    sortBy: (r) => catLabel(r.category).toLowerCase(),
  },
  {
    key: 'amount', title: 'Montant TTC', align: 'right', width: 116,
    render: (r) => eur(r.amountTtc || 0),
    sortBy: (r) => r.amountTtc || 0,
    total: (r) => r.amountTtc || 0,
  },
  {
    key: 'tva', title: 'TVA récup.', align: 'right', width: 104,
    render: (r) => {
      const ttc = r.amountTtc || 0
      const rate = r.tvaRate ?? 20
      return rate > 0 ? eur(ttc - ttc / (1 + rate / 100)) : '—'
    },
    sortBy: (r) => {
      const ttc = r.amountTtc || 0
      const rate = r.tvaRate ?? 20
      return rate > 0 ? ttc - ttc / (1 + rate / 100) : 0
    },
    total: (r) => {
      const ttc = r.amountTtc || 0
      const rate = r.tvaRate ?? 20
      return rate > 0 ? ttc - ttc / (1 + rate / 100) : 0
    },
  },
  {
    key: 'payment', title: 'Paiement', width: 124,
    render: (r) => PAYMENT_LABELS[r.paymentMethod || ''] || r.paymentMethod || '',
    sortBy: (r) => r.paymentMethod || '',
  },
]

const PAGE_SIZE = 100

// ─── Composant ───────────────────────────────────────────────

function LedgerTable({
  kind,
  query,
  title,
  emptyLabel,
}: {
  kind: Kind
  query: string
  title: string
  emptyLabel: string
}) {
  const client = useClient({ apiVersion })
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('all')
  const [month, setMonth] = useState('all')
  const [group, setGroup] = useState('all')
  const [sortKey, setSortKey] = useState('date')
  const [desc, setDesc] = useState(true)
  const [page, setPage] = useState(0)

  const columns = kind === 'sale' ? SALE_COLUMNS : EXPENSE_COLUMNS

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    client
      .fetch<Row[]>(query)
      .then((r) => {
        if (!cancelled) setRows(r || [])
      })
      .catch((err) => console.warn('[ledger] fetch error', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [client, query])

  const years = useMemo(() => {
    const set = new Set<number>()
    for (const r of rows) if (r.date) set.add(yearOf(r.date))
    return [...set].sort((a, b) => b - a)
  }, [rows])

  // Le troisième filtre change de nature : canal pour les ventes,
  // catégorie pour les dépenses.
  const groups = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) {
      const v = kind === 'sale' ? r.channel : r.category
      if (v) set.add(v)
    }
    return [...set].sort()
  }, [rows, kind])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    let list = rows

    if (year !== 'all') list = list.filter((r) => String(yearOf(r.date)) === year)
    if (month !== 'all') list = list.filter((r) => String(monthOf(r.date)) === month)
    if (group !== 'all')
      list = list.filter((r) => (kind === 'sale' ? r.channel : r.category) === group)
    if (term)
      list = list.filter((r) =>
        [r.customerName, r.designation, r.label, r.supplier, r.notes]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(term)),
      )

    const col = columns.find((c) => c.key === sortKey) || columns[0]
    const sorted = [...list].sort((a, b) => {
      const va = col.sortBy(a)
      const vb = col.sortBy(b)
      if (typeof va === 'number' && typeof vb === 'number') return va - vb
      return String(va).localeCompare(String(vb), 'fr')
    })
    return desc ? sorted.reverse() : sorted
  }, [rows, search, year, month, group, sortKey, desc, columns, kind])

  // Les filtres changent le nombre de lignes : revenir en page 1,
  // sinon on se retrouve sur une page vide.
  useEffect(() => {
    setPage(0)
  }, [search, year, month, group, sortKey, desc])

  const pageRows = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const pages = Math.ceil(visible.length / PAGE_SIZE)

  const totalOf = (col: Column) =>
    col.total ? visible.reduce((t, r) => t + (col.total as (r: Row) => number)(r), 0) : null

  const sortOn = (key: string) => {
    if (sortKey === key) {
      setDesc((d) => !d)
      return
    }
    setSortKey(key)
    setDesc(true)
  }

  const th = (align: Align = 'left'): React.CSSProperties => ({
    textAlign: align,
    padding: '8px 10px',
    borderBottom: '1px solid var(--card-border-color, #e5e3de)',
    fontSize: 12,
    fontWeight: 500,
    opacity: 0.7,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
  })

  const td = (align: Align = 'left'): React.CSSProperties => ({
    textAlign: align,
    padding: '9px 10px',
    borderBottom: '1px solid var(--card-border-color, #e5e3de)',
    fontSize: 13,
    whiteSpace: 'nowrap',
    fontVariantNumeric: align === 'right' ? 'tabular-nums' : undefined,
  })

  return (
    <Box padding={4} style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Stack space={4}>
        <Flex align="flex-start" justify="space-between" gap={3} wrap="wrap">
          <Box style={{ flex: 1, minWidth: 240 }}>
            <Heading size={4}>{title}</Heading>
            <Text size={1} muted style={{ marginTop: 8 }}>
              Clique sur un en-tête pour trier, sur une ligne pour ouvrir le
              document. Les totaux suivent les filtres.
            </Text>
          </Box>
          <Flex gap={2} wrap="wrap">
            <Button
              mode="ghost"
              fontSize={1}
              padding={3}
              text="⬇️ Exporter en CSV"
              disabled={visible.length === 0}
              onClick={() =>
                download(
                  toCsv(kind, visible),
                  `${kind === 'sale' ? 'ventes' : 'depenses'}-mobilier-malin-${new Date()
                    .toISOString()
                    .slice(0, 10)}.csv`,
                )
              }
            />
            <Button
              mode="default"
              tone="primary"
              fontSize={1}
              padding={3}
              text={kind === 'sale' ? '+ Nouvelle vente' : '+ Nouvelle dépense'}
              onClick={() => router.navigateIntent('create', { type: kind })}
            />
          </Flex>
        </Flex>

        {loading ? (
          <Flex align="center" justify="center" padding={5}>
            <Spinner muted />
          </Flex>
        ) : (
          <>
            {/* Filtres, sur une seule ligne au-dessus du tableau */}
            <Flex gap={2} wrap="wrap" align="center">
              <Box style={{ flex: 1, minWidth: 200 }}>
                <TextInput
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  placeholder={
                    kind === 'sale'
                      ? 'Client, désignation, commentaire…'
                      : 'Libellé, fournisseur, commentaire…'
                  }
                  fontSize={1}
                  padding={3}
                  clearButton={search.length > 0}
                  onClear={() => setSearch('')}
                />
              </Box>
              <Select
                fontSize={1}
                padding={3}
                value={year}
                onChange={(e) => setYear(e.currentTarget.value)}
                style={{ maxWidth: 130 }}
              >
                <option value="all">Toutes les années</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </Select>
              <Select
                fontSize={1}
                padding={3}
                value={month}
                onChange={(e) => setMonth(e.currentTarget.value)}
                style={{ maxWidth: 140 }}
              >
                <option value="all">Tous les mois</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={String(i)}>
                    {m}
                  </option>
                ))}
              </Select>
              <Select
                fontSize={1}
                padding={3}
                value={group}
                onChange={(e) => setGroup(e.currentTarget.value)}
                style={{ maxWidth: 190 }}
              >
                <option value="all">
                  {kind === 'sale' ? 'Tous les canaux' : 'Toutes les catégories'}
                </option>
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {kind === 'sale' ? CHANNEL_LABELS[g] || g : catLabel(g)}
                  </option>
                ))}
              </Select>
            </Flex>

            <Text size={1} muted>
              {visible.length} ligne{visible.length > 1 ? 's' : ''} sur{' '}
              {rows.length}
              {kind === 'sale' && visible.length > 0
                ? ` · ${eur0(visible.reduce((t, r) => t + (r.amountCollected || 0), 0))} encaissés`
                : ''}
              {kind === 'expense' && visible.length > 0
                ? ` · ${eur0(visible.reduce((t, r) => t + (r.amountTtc || 0), 0))} dépensés`
                : ''}
            </Text>

            {visible.length === 0 ? (
              <Card padding={5} radius={2} tone="transparent">
                <Text size={1} muted align="center">
                  {rows.length === 0 ? emptyLabel : 'Aucune ligne ne correspond aux filtres.'}
                </Text>
              </Card>
            ) : (
              <Card radius={2} shadow={1} style={{ overflowX: 'auto' }}>
                <table
                  style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}
                >
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th
                          key={c.key}
                          style={{ ...th(c.align), width: c.width }}
                          onClick={() => sortOn(c.key)}
                          title="Trier sur cette colonne"
                        >
                          {c.title}
                          {sortKey === c.key ? (desc ? ' ↓' : ' ↑') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr
                        key={r._id}
                        onClick={() => router.navigateIntent('edit', { id: r._id, type: kind })}
                        style={{ cursor: 'pointer' }}
                      >
                        {columns.map((c) => (
                          <td
                            key={c.key}
                            style={{
                              ...td(c.align),
                              // Seule la désignation peut s'allonger :
                              // on la coupe plutôt que d'étirer la ligne.
                              ...(c.width
                                ? {}
                                : {
                                    maxWidth: 460,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }),
                            }}
                            title={c.render(r)}
                          >
                            {c.render(r)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      {columns.map((c, i) => {
                        const t = totalOf(c)
                        return (
                          <td
                            key={c.key}
                            style={{ ...td(c.align), fontWeight: 700, borderBottom: 'none' }}
                          >
                            {i === 0 ? `Total (${visible.length})` : t !== null ? eur(t) : ''}
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </Card>
            )}

            {pages > 1 ? (
              <Flex align="center" justify="center" gap={3}>
                <Button
                  mode="ghost"
                  fontSize={1}
                  padding={3}
                  text="← Précédent"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                />
                <Text size={1} muted>
                  Page {page + 1} sur {pages}
                </Text>
                <Button
                  mode="ghost"
                  fontSize={1}
                  padding={3}
                  text="Suivant →"
                  disabled={page >= pages - 1}
                  onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                />
              </Flex>
            ) : null}
          </>
        )}
      </Stack>
    </Box>
  )
}

// ─── Composants exportés ──────────────────────────────────────

export function SalesTableView() {
  return (
    <LedgerTable
      kind="sale"
      query={SALES_QUERY}
      title="📋 Toutes les ventes"
      emptyLabel="Aucune vente enregistrée pour l'instant."
    />
  )
}

export function ExpensesTableView() {
  return (
    <LedgerTable
      kind="expense"
      query={EXPENSES_QUERY}
      title="📋 Toutes les dépenses"
      emptyLabel="Aucune dépense saisie pour l'instant."
    />
  )
}
