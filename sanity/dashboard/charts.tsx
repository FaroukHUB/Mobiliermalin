/**
 * Primitives de graphique pour le Studio — SVG écrit à la main.
 *
 * Aucune librairie ajoutée : le bundle du Studio pèse déjà 1,5 Mo, et
 * ces trois formes suffisent. Tout est en SVG inline, avec une couche
 * de survol en HTML par-dessus pour les infobulles.
 *
 * Palette : slots catégoriels bleu / orange / aqua, plus un gris de
 * mise en retrait pour le poste « Autre ». Trois teintes seulement, et
 * la queue repliée dans « Autre » : au-delà, deux parts deviennent
 * indiscernables pour un daltonien (vérifié, pas estimé). Paire
 * divergente bleu / rouge pour les résultats, positifs au-dessus de
 * zéro, négatifs en dessous.
 *
 * Le texte ne porte jamais la couleur d'une série : les valeurs et les
 * libellés restent en encre, c'est la pastille à côté qui identifie.
 */

import { useState } from 'react'
import { Box, Card, Flex, Stack, Text } from '@sanity/ui'

// ─── Palette ─────────────────────────────────────────────────
// Les deux modes sont choisis, pas déduits l'un de l'autre.

export type Palette = {
  series: [string, string, string]
  other: string
  positive: string
  negative: string
  grid: string
  axis: string
  muted: string
  surface: string
}

export const LIGHT_PALETTE: Palette = {
  series: ['#2a78d6', '#eb6834', '#1baf7a'],
  other: '#9a9891',
  positive: '#2a78d6',
  negative: '#e34948',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  muted: '#898781',
  surface: '#ffffff',
}

export const DARK_PALETTE: Palette = {
  series: ['#3987e5', '#d95926', '#199e70'],
  other: '#6e6d68',
  positive: '#3987e5',
  negative: '#e66767',
  grid: '#2c2c2a',
  axis: '#383835',
  muted: '#898781',
  surface: '#1a1a19',
}

const eur0 = (v: number) =>
  v.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €'

const eurShort = (v: number) => {
  const a = Math.abs(v)
  if (a >= 1000) return `${(v / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k€`
  return `${Math.round(v)} €`
}

/**
 * Échelle « ronde » juste au-dessus du maximum. Les paliers sont fins
 * exprès : arrondir 5 290 € à 10 000 € laisserait la moitié du
 * graphique vide et écraserait toutes les colonnes.
 */
const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

/**
 * On choisit d'abord un pas rond, le maximum en découle. L'inverse
 * donnait des graduations à 3,8 k€ et 11,3 k€, illisibles.
 */
function niceScale(v: number, intervals = 4): { max: number; ticks: number[] } {
  if (v <= 0) return { max: 1, ticks: [0, 1] }
  const rough = v / intervals
  const exp = Math.pow(10, Math.floor(Math.log10(rough)))
  const step = (NICE_STEPS.find((s) => rough / exp <= s) ?? 10) * exp
  const max = Math.ceil(v / step) * step
  const ticks: number[] = []
  for (let t = 0; t <= max + step / 1000; t += step) ticks.push(t)
  return { max, ticks }
}

/** Rectangle à sommet arrondi, ancré sur la ligne de base. */
function barPath(x: number, y: number, w: number, h: number, r = 4): string {
  const rr = Math.min(r, w / 2, Math.max(0, h))
  const bottom = y + h
  return [
    `M${x},${bottom}`,
    `L${x},${y + rr}`,
    `Q${x},${y} ${x + rr},${y}`,
    `L${x + w - rr},${y}`,
    `Q${x + w},${y} ${x + w},${y + rr}`,
    `L${x + w},${bottom}`,
    'Z',
  ].join(' ')
}

/** Le même, retourné : arrondi en bas, ancré sur la ligne du haut. */
function barPathDown(x: number, top: number, w: number, h: number, r = 4): string {
  const rr = Math.min(r, w / 2, Math.max(0, h))
  const bottom = top + h
  return [
    `M${x},${top}`,
    `L${x},${bottom - rr}`,
    `Q${x},${bottom} ${x + rr},${bottom}`,
    `L${x + w - rr},${bottom}`,
    `Q${x + w},${bottom} ${x + w},${bottom - rr}`,
    `L${x + w},${top}`,
    'Z',
  ].join(' ')
}

// ─── Infobulle ───────────────────────────────────────────────

function Tooltip({
  x,
  children,
}: {
  x: number
  children: React.ReactNode
}) {
  // Ancrée en pourcentage pour suivre le redimensionnement du SVG.
  const flip = x > 60
  return (
    <Box
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: 0,
        transform: `translateX(${flip ? '-100%' : '0'}) translateX(${flip ? -8 : 8}px)`,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <Card padding={2} radius={2} shadow={3} style={{ whiteSpace: 'nowrap' }}>
        {children}
      </Card>
    </Box>
  )
}

// ─── Histogramme simple ──────────────────────────────────────

export type ColumnPoint = {
  /** Nom complet, affiché dans l'infobulle. */
  label: string
  /** Étiquette d'axe, si elle diffère du nom (jours : une sur cinq). */
  tick?: string
  value: number
  /** Mois sans donnée : dessiné en creux, exclu du maximum. */
  absent?: boolean
  absentNote?: string
}

/**
 * Une seule série, donc une seule teinte et pas de légende : le titre
 * dit ce qu'on regarde. Seule la plus haute colonne porte son chiffre,
 * les autres se lisent au survol.
 */
export function ColumnChart({
  data,
  palette,
  height = 200,
  valueFormat = eur0,
}: {
  data: ColumnPoint[]
  palette: Palette
  height?: number
  valueFormat?: (v: number) => string
}) {
  const [hover, setHover] = useState<number | null>(null)

  const W = 720
  const H = height
  const padL = 52
  const padR = 8
  const padT = 18
  const padB = 26
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const present = data.filter((d) => !d.absent)
  const scale = niceScale(Math.max(0, ...present.map((d) => d.value)))
  const max = scale.max
  const step = plotW / Math.max(1, data.length)
  const barW = Math.max(4, step - 6)
  const y = (v: number) => padT + plotH - (v / max) * plotH

  const maxIndex = data.reduce(
    (best, d, i) => (!d.absent && d.value > (data[best]?.value ?? -1) ? i : best),
    0,
  )
  const ticks = scale.ticks

  return (
    <Box style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
      >
        {/* Grille en retrait : elle situe, elle ne se regarde pas */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(t)}
              y2={y(t)}
              stroke={t === 0 ? palette.axis : palette.grid}
              strokeWidth={1}
            />
            <text
              x={padL - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize={11}
              fill={palette.muted}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {t === 0 ? '0' : eurShort(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = padL + i * step + (step - barW) / 2
          if (d.absent) {
            return (
              <rect
                key={i}
                x={x}
                y={padT + plotH - 10}
                width={barW}
                height={10}
                fill="none"
                stroke={palette.axis}
                strokeWidth={1}
                strokeDasharray="3 3"
                rx={2}
              />
            )
          }
          const h = Math.max(0, padT + plotH - y(d.value))
          return (
            <path
              key={i}
              d={barPath(x, y(d.value), barW, h)}
              fill={palette.series[0]}
              opacity={hover === null || hover === i ? 1 : 0.45}
            />
          )
        })}

        {/* Étiquette directe sur la plus haute seulement */}
        {data[maxIndex] && !data[maxIndex].absent && data[maxIndex].value > 0 ? (
          <text
            x={padL + maxIndex * step + step / 2}
            y={y(data[maxIndex].value) - 6}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="currentColor"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {eurShort(data[maxIndex].value)}
          </text>
        ) : null}

        {data.map((d, i) => (
          <text
            key={`x${i}`}
            x={padL + i * step + step / 2}
            y={H - 8}
            textAnchor="middle"
            fontSize={11}
            fill={palette.muted}
          >
            {d.tick ?? d.label}
          </text>
        ))}

        {/* Zones de survol : plus larges que les barres */}
        {data.map((d, i) => (
          <rect
            key={`h${i}`}
            x={padL + i * step}
            y={padT}
            width={step}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {hover !== null && data[hover] ? (
        <Tooltip x={((padL + hover * step + step / 2) / W) * 100}>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              {data[hover].label}
            </Text>
            <Text size={1}>
              {data[hover].absent
                ? data[hover].absentNote || 'Non renseigné'
                : valueFormat(data[hover].value)}
            </Text>
          </Stack>
        </Tooltip>
      ) : null}
    </Box>
  )
}

// ─── Histogramme divergent ───────────────────────────────────

/**
 * Résultat mensuel : au-dessus de zéro on gagne, en dessous on perd.
 * Deux teintes opposées et une ligne de zéro appuyée, c'est ce qui
 * rend le signe lisible d'un coup d'œil.
 */
export function DivergingColumnChart({
  data,
  palette,
  height = 180,
}: {
  data: ColumnPoint[]
  palette: Palette
  height?: number
}) {
  const [hover, setHover] = useState<number | null>(null)

  const W = 720
  const H = height
  const padL = 52
  const padR = 8
  const padT = 16
  const padB = 26
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const present = data.filter((d) => !d.absent)
  const scale = niceScale(Math.max(1, ...present.map((d) => Math.abs(d.value))), 2)
  const max = scale.max
  const step = plotW / Math.max(1, data.length)
  const barW = Math.max(4, step - 6)
  const zero = padT + plotH / 2
  const y = (v: number) => zero - (v / max) * (plotH / 2)
  // Graduations symétriques : le même pas de part et d'autre de zéro.
  const ticks = [...scale.ticks].reverse().concat(scale.ticks.slice(1).map((t) => -t))

  return (
    <Box style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(t)}
              y2={y(t)}
              stroke={t === 0 ? palette.axis : palette.grid}
              strokeWidth={t === 0 ? 1.5 : 1}
            />
            <text
              x={padL - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize={11}
              fill={palette.muted}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {t === 0 ? '0' : eurShort(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = padL + i * step + (step - barW) / 2
          if (d.absent) {
            // Même marque en pointillés que sur les encaissements :
            // un mois vide se voit, il ne se devine pas.
            return (
              <rect
                key={i}
                x={x}
                y={zero - 5}
                width={barW}
                height={10}
                fill="none"
                stroke={palette.axis}
                strokeWidth={1}
                strokeDasharray="3 3"
                rx={2}
              />
            )
          }
          const up = d.value >= 0
          const h = Math.max(1, Math.abs(y(d.value) - zero))
          // La barre part toujours de la ligne de zéro : l'arrondi est
          // sur l'extrémité libre, en haut pour un gain, en bas pour
          // une perte.
          const path = up
            ? barPath(x, y(d.value), barW, h)
            : barPathDown(x, zero, barW, h)
          return (
            <path
              key={i}
              d={path}
              fill={up ? palette.positive : palette.negative}
              opacity={hover === null || hover === i ? 1 : 0.45}
            />
          )
        })}

        {data.map((d, i) => (
          <text
            key={`x${i}`}
            x={padL + i * step + step / 2}
            y={H - 8}
            textAnchor="middle"
            fontSize={11}
            fill={palette.muted}
          >
            {d.tick ?? d.label}
          </text>
        ))}

        {data.map((d, i) => (
          <rect
            key={`h${i}`}
            x={padL + i * step}
            y={padT}
            width={step}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>

      {hover !== null && data[hover] ? (
        <Tooltip x={((padL + hover * step + step / 2) / W) * 100}>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              {data[hover].label}
            </Text>
            <Text size={1}>
              {data[hover].absent
                ? data[hover].absentNote || 'Non renseigné'
                : `${data[hover].value >= 0 ? 'Bénéfice' : 'Perte'} de ${eur0(Math.abs(data[hover].value))}`}
            </Text>
          </Stack>
        </Tooltip>
      ) : null}
    </Box>
  )
}

// ─── Camembert ───────────────────────────────────────────────

export type Slice = { label: string; value: number }

/**
 * Part-à-tout, à lire d'un coup d'œil. Trois postes nommés au plus, le
 * reste replié dans « Autre » : c'est la limite au-delà de laquelle
 * deux parts cessent d'être distinguables, y compris en vision
 * normale. Chaque part porte son montant et sa part dans la légende,
 * la couleur ne fait qu'identifier.
 */
export function DonutChart({
  slices,
  palette,
  total,
  centerLabel,
}: {
  slices: Slice[]
  palette: Palette
  total: number
  centerLabel: string
}) {
  const [hover, setHover] = useState<number | null>(null)

  const size = 168
  const stroke = 26
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const gap = 3

  const colors = slices.map((_, i) =>
    i < 3 ? palette.series[i] : palette.other,
  )

  let offset = 0
  const arcs = slices.map((s, i) => {
    const frac = total > 0 ? s.value / total : 0
    const len = Math.max(0, c * frac - gap)
    const arc = { i, len, offset, color: colors[i] }
    offset += c * frac
    return arc
  })

  return (
    <Flex gap={4} align="center" wrap="wrap">
      <Box style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={palette.grid}
              strokeWidth={stroke}
            />
            {arcs.map((a) => (
              <circle
                key={a.i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={a.color}
                strokeWidth={stroke}
                strokeDasharray={`${a.len} ${c - a.len}`}
                strokeDashoffset={-a.offset}
                opacity={hover === null || hover === a.i ? 1 : 0.4}
                onMouseEnter={() => setHover(a.i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'default' }}
              />
            ))}
          </g>
        </svg>
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          <Text size={0} muted>
            {centerLabel}
          </Text>
          <Box style={{ marginTop: 4 }}>
            <Text size={2} weight="semibold">
              {eurShort(total)}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Légende chiffrée : c'est aussi la vue tableau du camembert */}
      <Stack space={3} style={{ flex: 1, minWidth: 200 }}>
        {slices.map((s, i) => (
          <Flex
            key={s.label}
            align="center"
            gap={3}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ opacity: hover === null || hover === i ? 1 : 0.5 }}
          >
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: colors[i],
                flexShrink: 0,
              }}
            />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size={1} textOverflow="ellipsis">
                {s.label}
              </Text>
            </Box>
            <Text size={1} weight="semibold" style={{ whiteSpace: 'nowrap' }}>
              {eur0(s.value)}
            </Text>
            <Box style={{ width: 44, textAlign: 'right' }}>
              <Text size={1} muted style={{ whiteSpace: 'nowrap' }}>
                {total > 0 ? Math.round((s.value / total) * 100) : 0} %
              </Text>
            </Box>
          </Flex>
        ))}
      </Stack>
    </Flex>
  )
}

/**
 * Replie la queue d'une répartition : les trois premiers postes gardent
 * leur nom, tout le reste devient « Autre ». Au-delà de trois teintes,
 * deux parts deviennent indiscernables.
 */
export function foldTail(
  entries: Array<[string, number]>,
  otherLabel = 'Autre',
): Slice[] {
  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  const head = sorted.slice(0, 3).map(([label, value]) => ({ label, value }))
  const tail = sorted.slice(3)
  if (tail.length === 0) return head
  const rest = tail.reduce((t, [, v]) => t + v, 0)
  if (rest <= 0) return head
  return [
    ...head,
    { label: `${otherLabel} (${tail.length} poste${tail.length > 1 ? 's' : ''})`, value: rest },
  ]
}
