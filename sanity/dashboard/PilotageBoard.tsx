/**
 * Pilotage — le tableau de bord financier de Mobilier Malin.
 *
 * Remplace le classeur Tableau_Gestion_Mobilier_Malin.xlsx : mêmes
 * indicateurs, mêmes colonnes à l'export, mais alimenté tout seul.
 * Chaque devis accepté et payé et chaque paiement en ligne écrit sa
 * ligne dans le registre des ventes (src/lib/sale-register.ts), il ne
 * reste qu'à saisir les dépenses et à déclarer les charges fixes une
 * fois pour toutes.
 *
 * Ce que le composant calcule, mois par mois et sur l'année :
 *   - encaissements, dépenses variables, frais fixes, résultat, marge
 *   - répartition par canal (ce que rapporte réellement le site)
 *   - répartition des dépenses par catégorie
 *   - TVA collectée et TVA récupérable, pour préparer la déclaration
 *
 * Les frais fixes ne se ressaisissent jamais : une charge est comptée
 * dans chaque mois compris entre sa date de début et sa date de fin.
 *
 * Lecture seule. Pour corriger une ligne, on clique dessus : le Studio
 * ouvre le document.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Select,
  Spinner,
  Stack,
  Text,
} from '@sanity/ui'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'
import { apiVersion } from '../env'
import { EXPENSE_CATEGORIES } from '../schemas/expense'

// ─── Types ───────────────────────────────────────────────────

type Sale = {
  _id: string
  date?: string
  customerName?: string
  designation?: string
  amountCollected?: number
  shippingFee?: number
  paymentMethod?: string
  saleType?: string
  channel?: string
  notes?: string
}

type Expense = {
  _id: string
  date?: string
  label?: string
  category?: string
  amountTtc?: number
  tvaRate?: number
  supplier?: string
  paymentMethod?: string
  notes?: string
}

type FixedCharge = {
  _id: string
  label?: string
  category?: string
  amountTtc?: number
  tvaRate?: number
  startDate?: string
  endDate?: string
}

// ─── Requêtes ────────────────────────────────────────────────
// order() ne prend que des noms de champs : tout le reste se calcule
// côté composant.

const SALES_QUERY = `*[_type == "sale"] | order(date desc)[0...3000]{
  _id, date, customerName, designation, amountCollected, shippingFee,
  paymentMethod, saleType, channel, notes
}`

const EXPENSES_QUERY = `*[_type == "expense"] | order(date desc)[0...3000]{
  _id, date, label, category, amountTtc, tvaRate, supplier, paymentMethod, notes
}`

const CHARGES_QUERY = `*[_type == "fixedCharge"]{
  _id, label, category, amountTtc, tvaRate, startDate, endDate
}`

// ─── Libellés ────────────────────────────────────────────────

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const CHANNEL_LABELS: Record<string, string> = {
  site: '🌐 Site (paiement en ligne)',
  devis: '📋 Devis accepté',
  showroom: '🏬 Showroom',
  leboncoin: '🟠 Bon Coin',
  telephone: '📞 Téléphone',
  autre: '• Autre',
}

const PAYMENT_LABELS: Record<string, string> = {
  cb: '💳 Carte bancaire (TPE)',
  stripe: '🔒 Stripe',
  especes: '💵 Espèces',
  virement: '🏦 Virement',
  cheque: '🖊️ Chèque',
  leboncoin: '🟠 Bon Coin',
  autre: '• Autre',
}

const SALE_TYPE_LABELS: Record<string, string> = {
  'sur-place': 'Sur place',
  'livraison-cocolis': 'Livraison Cocolis',
  'autre-livraison': 'Autre livraison',
}

// ─── Formatage ───────────────────────────────────────────────

const eur = (v: number) =>
  v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

const eur2 = (v: number) =>
  v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

const pct = (v: number) =>
  (v * 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' %'

const monthOf = (iso?: string) => (iso ? Number(iso.slice(5, 7)) - 1 : -1)
const yearOf = (iso?: string) => (iso ? Number(iso.slice(0, 4)) : 0)

// ─── Charges fixes : mois couverts ───────────────────────────

/**
 * Une charge fixe court-elle sur ce mois ? On compare au premier jour
 * du mois pour la date de fin et au dernier jour pour la date de début,
 * de sorte qu'un mois entamé compte pour un mois plein.
 */
function chargeAppliesTo(c: FixedCharge, year: number, month: number): boolean {
  if (!c.startDate) return false
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  if (new Date(c.startDate) > lastDay) return false
  if (c.endDate && new Date(c.endDate) < firstDay) return false
  return true
}

// ─── Export CSV ──────────────────────────────────────────────

function csvCell(v: unknown): string {
  const s = v === undefined || v === null ? '' : String(v)
  return `"${s.replace(/"/g, '""')}"`
}

const num = (v: number) => v.toFixed(2).replace('.', ',')

/** Reprend colonne pour colonne le suivi de ventes tenu jusqu'ici. */
function salesCsv(sales: Sale[]): string {
  const header = [
    'Date',
    'Client',
    'Désignation(s)',
    'Montant encaissé',
    'Frais de livraison',
    'Restant après frais',
    'Mode de paiement',
    'Type de vente',
    'Canal',
    'Commentaire',
  ]
  const rows = sales.map((s) => {
    const amount = s.amountCollected || 0
    const ship = s.shippingFee || 0
    return [
      s.date ? new Date(s.date).toLocaleDateString('fr-FR') : '',
      s.customerName || '',
      (s.designation || '').replace(/\s+/g, ' ').trim(),
      num(amount),
      num(ship),
      num(amount - ship),
      PAYMENT_LABELS[s.paymentMethod || '']?.replace(/^\S+\s/, '') || s.paymentMethod || '',
      SALE_TYPE_LABELS[s.saleType || ''] || s.saleType || '',
      CHANNEL_LABELS[s.channel || '']?.replace(/^\S+\s/, '') || s.channel || '',
      (s.notes || '').replace(/\s+/g, ' ').trim(),
    ]
      .map(csvCell)
      .join(';')
  })
  return '﻿' + [header.map(csvCell).join(';'), ...rows].join('\r\n')
}

function expensesCsv(expenses: Expense[]): string {
  const header = [
    'Date',
    'Fournisseur',
    'Libellé',
    'Catégorie',
    'Mode de paiement',
    'Montant TTC',
    'TVA récupérable',
    'Commentaire',
  ]
  const rows = expenses.map((e) => {
    const ttc = e.amountTtc || 0
    const rate = e.tvaRate ?? 20
    const tva = rate > 0 ? ttc - ttc / (1 + rate / 100) : 0
    return [
      e.date ? new Date(e.date).toLocaleDateString('fr-FR') : '',
      e.supplier || '',
      e.label || '',
      EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.title.replace(/^\S+\s/, '') ||
        e.category ||
        '',
      e.paymentMethod || '',
      num(ttc),
      num(tva),
      (e.notes || '').replace(/\s+/g, ' ').trim(),
    ]
      .map(csvCell)
      .join(';')
  })
  return '﻿' + [header.map(csvCell).join(';'), ...rows].join('\r\n')
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

// ─── Petits blocs d'affichage ────────────────────────────────

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'gold' | 'green' | 'red' | 'neutral'
}) {
  const border =
    tone === 'green'
      ? '#45996b'
      : tone === 'red'
        ? '#b8362d'
        : tone === 'neutral'
          ? '#c9c7c2'
          : '#c8a25b'
  return (
    <Card padding={4} radius={2} shadow={1} style={{ borderTop: `3px solid ${border}` }}>
      <Stack space={3}>
        <Text size={1} muted>
          {label}
        </Text>
        <Heading size={3}>{value}</Heading>
        {hint ? (
          <Text size={0} muted>
            {hint}
          </Text>
        ) : null}
      </Stack>
    </Card>
  )
}

/** Barre de répartition, largeur proportionnelle au plus gros poste. */
function BreakdownRow({
  label,
  amount,
  max,
  count,
  color,
}: {
  label: string
  amount: number
  max: number
  count?: number
  color: string
}) {
  const width = max > 0 ? Math.max(2, (amount / max) * 100) : 0
  return (
    <Stack space={2}>
      <Flex justify="space-between" align="center">
        <Text size={1}>{label}</Text>
        <Text size={1} weight="semibold">
          {eur(amount)}
          {typeof count === 'number' ? (
            <span style={{ opacity: 0.5, fontWeight: 400 }}> · {count}</span>
          ) : null}
        </Text>
      </Flex>
      <Box
        style={{
          height: 6,
          borderRadius: 3,
          background: 'var(--card-border-color, #e5e3de)',
          overflow: 'hidden',
        }}
      >
        <Box style={{ height: '100%', width: `${width}%`, background: color }} />
      </Box>
    </Stack>
  )
}

// ─── Composant ───────────────────────────────────────────────

export function PilotageBoard() {
  const client = useClient({ apiVersion })
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [charges, setCharges] = useState<FixedCharge[]>([])
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [openMonth, setOpenMonth] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      client.fetch<Sale[]>(SALES_QUERY),
      client.fetch<Expense[]>(EXPENSES_QUERY),
      client.fetch<FixedCharge[]>(CHARGES_QUERY),
    ])
      .then(([s, e, c]) => {
        if (cancelled) return
        setSales(s || [])
        setExpenses(e || [])
        setCharges(c || [])
      })
      .catch((err) => console.warn('[pilotage] fetch error', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [client])

  // Années présentes dans les données, l'année en cours toujours listée
  const years = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()])
    for (const s of sales) if (s.date) set.add(yearOf(s.date))
    for (const e of expenses) if (e.date) set.add(yearOf(e.date))
    return [...set].sort((a, b) => b - a)
  }, [sales, expenses])

  const yearSales = useMemo(
    () => sales.filter((s) => yearOf(s.date) === year),
    [sales, year],
  )
  const yearExpenses = useMemo(
    () => expenses.filter((e) => yearOf(e.date) === year),
    [expenses, year],
  )

  /** Une ligne par mois : encaissements, dépenses, frais fixes, résultat. */
  const months = useMemo(() => {
    return MONTHS.map((name, m) => {
      const ms = yearSales.filter((s) => monthOf(s.date) === m)
      const me = yearExpenses.filter((e) => monthOf(e.date) === m)
      const income = ms.reduce((t, s) => t + (s.amountCollected || 0), 0)
      const variable = me.reduce((t, e) => t + (e.amountTtc || 0), 0)
      const fixed = charges
        .filter((c) => chargeAppliesTo(c, year, m))
        .reduce((t, c) => t + (c.amountTtc || 0), 0)
      return {
        m,
        name,
        income,
        variable,
        fixed,
        result: income - variable - fixed,
        salesCount: ms.length,
        sales: ms,
        expenses: me,
      }
    })
  }, [yearSales, yearExpenses, charges, year])

  const totals = useMemo(() => {
    const income = months.reduce((t, x) => t + x.income, 0)
    const variable = months.reduce((t, x) => t + x.variable, 0)
    const fixed = months.reduce((t, x) => t + x.fixed, 0)
    const activeMonths = months.filter((x) => x.income > 0).length
    return {
      income,
      variable,
      fixed,
      result: income - variable - fixed,
      salesCount: months.reduce((t, x) => t + x.salesCount, 0),
      activeMonths,
      average: activeMonths > 0 ? income / activeMonths : 0,
    }
  }, [months])

  // TVA de l'année : collectée sur les ventes (montants TTC),
  // récupérable sur les dépenses au taux saisi sur chaque ligne.
  const tva = useMemo(() => {
    const collected = yearSales.reduce(
      (t, s) => t + ((s.amountCollected || 0) - (s.amountCollected || 0) / 1.2),
      0,
    )
    const deductible = yearExpenses.reduce((t, e) => {
      const rate = e.tvaRate ?? 20
      const ttc = e.amountTtc || 0
      return t + (rate > 0 ? ttc - ttc / (1 + rate / 100) : 0)
    }, 0)
    const onCharges = charges
      .filter((c) => MONTHS.some((_, m) => chargeAppliesTo(c, year, m)))
      .reduce((t, c) => {
        const rate = c.tvaRate ?? 20
        const monthsCovered = MONTHS.filter((_, m) => chargeAppliesTo(c, year, m)).length
        const ttc = (c.amountTtc || 0) * monthsCovered
        return t + (rate > 0 ? ttc - ttc / (1 + rate / 100) : 0)
      }, 0)
    return { collected, deductible: deductible + onCharges }
  }, [yearSales, yearExpenses, charges, year])

  const byChannel = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>()
    for (const s of yearSales) {
      const k = s.channel || 'autre'
      const prev = map.get(k) || { amount: 0, count: 0 }
      map.set(k, { amount: prev.amount + (s.amountCollected || 0), count: prev.count + 1 })
    }
    return [...map.entries()].sort((a, b) => b[1].amount - a[1].amount)
  }, [yearSales])

  const byPayment = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>()
    for (const s of yearSales) {
      const k = s.paymentMethod || 'autre'
      const prev = map.get(k) || { amount: 0, count: 0 }
      map.set(k, { amount: prev.amount + (s.amountCollected || 0), count: prev.count + 1 })
    }
    return [...map.entries()].sort((a, b) => b[1].amount - a[1].amount)
  }, [yearSales])

  const byExpenseCategory = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>()
    for (const e of yearExpenses) {
      const k = e.category || 'autre'
      const prev = map.get(k) || { amount: 0, count: 0 }
      map.set(k, { amount: prev.amount + (e.amountTtc || 0), count: prev.count + 1 })
    }
    for (const c of charges) {
      const monthsCovered = MONTHS.filter((_, m) => chargeAppliesTo(c, year, m)).length
      if (monthsCovered === 0) continue
      const k = c.category || 'autre'
      const prev = map.get(k) || { amount: 0, count: 0 }
      map.set(k, {
        amount: prev.amount + (c.amountTtc || 0) * monthsCovered,
        count: prev.count + 1,
      })
    }
    return [...map.entries()].sort((a, b) => b[1].amount - a[1].amount)
  }, [yearExpenses, charges, year])

  const monthlyFixed = charges
    .filter((c) => chargeAppliesTo(c, new Date().getFullYear(), new Date().getMonth()))
    .reduce((t, c) => t + (c.amountTtc || 0), 0)

  const open = (id: string, type: string) => router.navigateIntent('edit', { id, type })

  const detail = openMonth !== null ? months[openMonth] : null
  const maxChannel = Math.max(1, ...byChannel.map(([, v]) => v.amount))
  const maxPayment = Math.max(1, ...byPayment.map(([, v]) => v.amount))
  const maxCategory = Math.max(1, ...byExpenseCategory.map(([, v]) => v.amount))

  return (
    <Box padding={4} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Stack space={5}>
        <Flex align="flex-start" justify="space-between" gap={3} wrap="wrap">
          <Box style={{ flex: 1, minWidth: 260 }}>
            <Heading size={4}>Pilotage</Heading>
            <Text size={1} muted style={{ marginTop: 8 }}>
              Encaissements, dépenses et résultat. Les ventes payées sur le site et
              les devis acceptés s&apos;inscrivent tout seuls : il ne reste que les
              dépenses à saisir.
            </Text>
          </Box>
          <Box style={{ minWidth: 140 }}>
            <Select
              value={String(year)}
              onChange={(e) => {
                setYear(Number(e.currentTarget.value))
                setOpenMonth(null)
              }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  Année {y}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>

        {loading ? (
          <Flex align="center" justify="center" padding={5}>
            <Spinner muted />
          </Flex>
        ) : (
          <>
            {/* Synthèse de l'année */}
            <Grid columns={[2, 2, 4]} gap={3}>
              <Kpi
                label="Encaissements"
                value={eur(totals.income)}
                hint={`${totals.salesCount} vente${totals.salesCount > 1 ? 's' : ''} enregistrée${totals.salesCount > 1 ? 's' : ''}`}
                tone="gold"
              />
              <Kpi
                label="Dépenses variables"
                value={eur(totals.variable)}
                hint={`${yearExpenses.length} ligne${yearExpenses.length > 1 ? 's' : ''} saisie${yearExpenses.length > 1 ? 's' : ''}`}
                tone="neutral"
              />
              <Kpi
                label="Charges fixes"
                value={eur(totals.fixed)}
                hint={`${eur(monthlyFixed)} par mois en ce moment`}
                tone="neutral"
              />
              <Kpi
                label="Résultat"
                value={eur(totals.result)}
                hint={
                  totals.income > 0
                    ? `Marge nette ${pct(totals.result / totals.income)}`
                    : 'Aucun encaissement sur la période'
                }
                tone={totals.result >= 0 ? 'green' : 'red'}
              />
            </Grid>

            <Grid columns={[1, 1, 3]} gap={3}>
              <Kpi
                label="Encaissements moyens par mois"
                value={eur(totals.average)}
                hint={`Sur ${totals.activeMonths} mois d'activité`}
                tone="neutral"
              />
              <Kpi
                label="Panier moyen"
                value={totals.salesCount > 0 ? eur2(totals.income / totals.salesCount) : '—'}
                hint="Encaissement moyen par vente"
                tone="neutral"
              />
              <Kpi
                label="TVA à reverser (estimation)"
                value={eur(tva.collected - tva.deductible)}
                hint={`${eur(tva.collected)} collectée − ${eur(tva.deductible)} récupérable`}
                tone="neutral"
              />
            </Grid>

            {/* Mois par mois */}
            <Card padding={4} radius={2} shadow={1}>
              <Stack space={4}>
                <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                  <Heading size={2}>Mois par mois</Heading>
                  <Flex gap={2} wrap="wrap">
                    <Button
                      mode="ghost"
                      tone="primary"
                      fontSize={1}
                      padding={3}
                      text="⬇️ Ventes en CSV"
                      disabled={yearSales.length === 0}
                      onClick={() =>
                        download(salesCsv(yearSales), `ventes-mobilier-malin-${year}.csv`)
                      }
                    />
                    <Button
                      mode="ghost"
                      fontSize={1}
                      padding={3}
                      text="⬇️ Dépenses en CSV"
                      disabled={yearExpenses.length === 0}
                      onClick={() =>
                        download(
                          expensesCsv(yearExpenses),
                          `depenses-mobilier-malin-${year}.csv`,
                        )
                      }
                    />
                  </Flex>
                </Flex>

                <Box style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                    <thead>
                      <tr>
                        {['Mois', 'Encaissements', 'Dépenses', 'Charges fixes', 'Résultat', 'Marge'].map(
                          (h, i) => (
                            <th
                              key={h}
                              style={{
                                textAlign: i === 0 ? 'left' : 'right',
                                padding: '8px 10px',
                                borderBottom: '1px solid var(--card-border-color, #e5e3de)',
                                fontSize: 12,
                                opacity: 0.6,
                                fontWeight: 500,
                              }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {months.map((row) => {
                        const empty = row.income === 0 && row.variable === 0 && row.fixed === 0
                        const isOpen = openMonth === row.m
                        return (
                          <tr
                            key={row.m}
                            onClick={() => !empty && setOpenMonth(isOpen ? null : row.m)}
                            style={{
                              cursor: empty ? 'default' : 'pointer',
                              opacity: empty ? 0.4 : 1,
                              background: isOpen ? 'rgba(200,162,91,0.12)' : undefined,
                            }}
                          >
                            <td style={cell('left')}>
                              {row.name}
                              {row.salesCount > 0 ? (
                                <span style={{ opacity: 0.5, fontSize: 12 }}>
                                  {' '}
                                  · {row.salesCount} vente{row.salesCount > 1 ? 's' : ''}
                                </span>
                              ) : null}
                            </td>
                            <td style={cell()}>{row.income ? eur(row.income) : '—'}</td>
                            <td style={cell()}>{row.variable ? eur(row.variable) : '—'}</td>
                            <td style={cell()}>{row.fixed ? eur(row.fixed) : '—'}</td>
                            <td
                              style={{
                                ...cell(),
                                fontWeight: 600,
                                color: empty
                                  ? undefined
                                  : row.result >= 0
                                    ? '#2c7050'
                                    : '#b8362d',
                              }}
                            >
                              {empty ? '—' : eur(row.result)}
                            </td>
                            <td style={cell()}>
                              {row.income > 0 ? pct(row.result / row.income) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                      <tr>
                        <td style={{ ...cell('left'), fontWeight: 700 }}>Total {year}</td>
                        <td style={{ ...cell(), fontWeight: 700 }}>{eur(totals.income)}</td>
                        <td style={{ ...cell(), fontWeight: 700 }}>{eur(totals.variable)}</td>
                        <td style={{ ...cell(), fontWeight: 700 }}>{eur(totals.fixed)}</td>
                        <td
                          style={{
                            ...cell(),
                            fontWeight: 700,
                            color: totals.result >= 0 ? '#2c7050' : '#b8362d',
                          }}
                        >
                          {eur(totals.result)}
                        </td>
                        <td style={{ ...cell(), fontWeight: 700 }}>
                          {totals.income > 0 ? pct(totals.result / totals.income) : '—'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Box>

                <Text size={0} muted>
                  Clique sur un mois pour voir le détail des ventes et des dépenses.
                </Text>
              </Stack>
            </Card>

            {/* Détail du mois ouvert */}
            {detail ? (
              <Card padding={4} radius={2} shadow={1} tone="transparent">
                <Stack space={4}>
                  <Flex justify="space-between" align="center" gap={3} wrap="wrap">
                    <Heading size={2}>
                      {detail.name} {year}
                    </Heading>
                    <Flex gap={2}>
                      <Button
                        mode="ghost"
                        fontSize={1}
                        padding={3}
                        text="⬇️ CSV du mois"
                        disabled={detail.sales.length === 0}
                        onClick={() =>
                          download(
                            salesCsv(detail.sales),
                            `ventes-${year}-${String(detail.m + 1).padStart(2, '0')}.csv`,
                          )
                        }
                      />
                      <Button
                        mode="bleed"
                        fontSize={1}
                        padding={3}
                        text="Fermer"
                        onClick={() => setOpenMonth(null)}
                      />
                    </Flex>
                  </Flex>

                  {detail.sales.length > 0 ? (
                    <Stack space={2}>
                      <Text size={1} weight="semibold">
                        Ventes ({detail.sales.length}) — {eur(detail.income)}
                      </Text>
                      {detail.sales.map((s) => (
                        <Card
                          key={s._id}
                          padding={3}
                          radius={2}
                          tone="default"
                          shadow={1}
                          style={{ cursor: 'pointer' }}
                          onClick={() => open(s._id, 'sale')}
                        >
                          <Flex justify="space-between" gap={3} align="flex-start">
                            <Box style={{ minWidth: 0 }}>
                              <Text size={1} weight="medium">
                                {s.customerName || 'Client'}
                              </Text>
                              <Text
                                size={0}
                                muted
                                style={{ marginTop: 4 }}
                                textOverflow="ellipsis"
                              >
                                {s.date ? new Date(s.date).toLocaleDateString('fr-FR') : ''}
                                {s.designation ? ` · ${s.designation}` : ''}
                              </Text>
                            </Box>
                            <Box style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <Text size={1} weight="semibold">
                                {eur2(s.amountCollected || 0)}
                              </Text>
                              <Text size={0} muted style={{ marginTop: 4 }}>
                                {CHANNEL_LABELS[s.channel || 'autre'] || s.channel}
                              </Text>
                            </Box>
                          </Flex>
                        </Card>
                      ))}
                    </Stack>
                  ) : null}

                  {detail.expenses.length > 0 ? (
                    <Stack space={2}>
                      <Text size={1} weight="semibold">
                        Dépenses ({detail.expenses.length}) — {eur(detail.variable)}
                      </Text>
                      {detail.expenses.map((e) => (
                        <Card
                          key={e._id}
                          padding={3}
                          radius={2}
                          tone="default"
                          shadow={1}
                          style={{ cursor: 'pointer' }}
                          onClick={() => open(e._id, 'expense')}
                        >
                          <Flex justify="space-between" gap={3} align="flex-start">
                            <Box style={{ minWidth: 0 }}>
                              <Text size={1} weight="medium">
                                {e.label || 'Dépense'}
                              </Text>
                              <Text size={0} muted style={{ marginTop: 4 }}>
                                {e.date ? new Date(e.date).toLocaleDateString('fr-FR') : ''}
                                {e.supplier ? ` · ${e.supplier}` : ''}
                              </Text>
                            </Box>
                            <Text size={1} weight="semibold" style={{ whiteSpace: 'nowrap' }}>
                              −{eur2(e.amountTtc || 0)}
                            </Text>
                          </Flex>
                        </Card>
                      ))}
                    </Stack>
                  ) : null}

                  {detail.fixed > 0 ? (
                    <Text size={0} muted>
                      Charges fixes du mois : {eur(detail.fixed)}, comptées
                      automatiquement depuis la liste des charges déclarées.
                    </Text>
                  ) : null}
                </Stack>
              </Card>
            ) : null}

            {/* Répartitions */}
            <Grid columns={[1, 1, 2]} gap={3}>
              <Card padding={4} radius={2} shadow={1}>
                <Stack space={4}>
                  <Box>
                    <Heading size={2}>D&apos;où viennent les ventes</Heading>
                    <Text size={0} muted style={{ marginTop: 6 }}>
                      Ce que rapporte chaque canal sur {year}.
                    </Text>
                  </Box>
                  {byChannel.length === 0 ? (
                    <Text size={1} muted>
                      Aucune vente enregistrée sur cette année.
                    </Text>
                  ) : (
                    <Stack space={3}>
                      {byChannel.map(([k, v]) => (
                        <BreakdownRow
                          key={k}
                          label={CHANNEL_LABELS[k] || k}
                          amount={v.amount}
                          count={v.count}
                          max={maxChannel}
                          color="#c8a25b"
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>

              <Card padding={4} radius={2} shadow={1}>
                <Stack space={4}>
                  <Box>
                    <Heading size={2}>Comment les clients paient</Heading>
                    <Text size={0} muted style={{ marginTop: 6 }}>
                      Répartition des encaissements par moyen de paiement.
                    </Text>
                  </Box>
                  {byPayment.length === 0 ? (
                    <Text size={1} muted>
                      Aucune vente enregistrée sur cette année.
                    </Text>
                  ) : (
                    <Stack space={3}>
                      {byPayment.map(([k, v]) => (
                        <BreakdownRow
                          key={k}
                          label={PAYMENT_LABELS[k] || k}
                          amount={v.amount}
                          count={v.count}
                          max={maxPayment}
                          color="#45996b"
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Grid>

            <Card padding={4} radius={2} shadow={1}>
              <Stack space={4}>
                <Box>
                  <Heading size={2}>Où part l&apos;argent</Heading>
                  <Text size={0} muted style={{ marginTop: 6 }}>
                    Dépenses saisies et charges fixes cumulées sur {year}, par
                    catégorie.
                  </Text>
                </Box>
                {byExpenseCategory.length === 0 ? (
                  <Text size={1} muted>
                    Aucune dépense saisie et aucune charge fixe déclarée. Les
                    dépenses se saisissent dans Gestion → Dépenses, les charges qui
                    reviennent tous les mois dans Gestion → Charges fixes.
                  </Text>
                ) : (
                  <Stack space={3}>
                    {byExpenseCategory.map(([k, v]) => (
                      <BreakdownRow
                        key={k}
                        label={
                          EXPENSE_CATEGORIES.find((c) => c.value === k)?.title || k
                        }
                        amount={v.amount}
                        max={maxCategory}
                        color="#8a8a8a"
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>

            <Card padding={4} radius={2} shadow={1} tone="primary">
              <Stack space={3}>
                <Text size={1} weight="semibold">
                  Comment ce tableau se remplit
                </Text>
                <Text size={1}>
                  Un devis accepté et payé en ligne, ou une commande réglée sur la
                  boutique, crée sa ligne de vente avec tout le détail : produits,
                  livraison, prestations. Les ventes du showroom passent par le même
                  chemin dès qu&apos;un devis avec lien de paiement est envoyé.
                </Text>
                <Text size={1}>
                  Restent à saisir à la main : les achats de marchandise et les
                  autres dépenses, dans Gestion → Dépenses. Les charges qui tombent
                  tous les mois se déclarent une seule fois dans Gestion → Charges
                  fixes, elles sont ensuite comptées automatiquement.
                </Text>
              </Stack>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  )
}

function cell(align: 'left' | 'right' = 'right'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '10px',
    borderBottom: '1px solid var(--card-border-color, #e5e3de)',
    fontSize: 13,
    whiteSpace: 'nowrap',
  }
}

export default PilotageBoard
