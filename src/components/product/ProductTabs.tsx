'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PortableText, type PortableTextBlock, type PortableTextComponents } from 'next-sanity'
import {
  FileText,
  Ruler,
  Truck,
  ShieldCheck,
  FileBadge2,
  Phone,
  Mail,
  Check,
} from 'lucide-react'

const CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  excellent: 'Excellent état',
  'very-good': 'Très bon état',
  good: 'Bon état',
  fair: 'État correct',
}

export type ProductTabsProps = {
  description?: PortableTextBlock[]
  specs: {
    widthCm?: number
    depthCm?: number
    heightCm?: number
    material?: string
    color?: string
    brand?: string
    condition?: string
    sku?: string
  }
  legal: {
    telephoneTel: string
    telephone: string
    email: string
  }
}

type TabKey = 'description' | 'specs' | 'livraison'

// ─────────────────────────────────────────────────────────────
// Pré-traitement de la description Sanity.
// Le client (admin) écrit souvent en paragraphes plats avec des
// emojis ✔️ / ✓ / → en début de ligne, sans utiliser les listes
// natives de Sanity. On détecte ces patterns et on transforme :
//   – "✔️ Item"          → item d'une liste stylée
//   – Ligne courte finissant par ":" → sous-titre (H3)
//   – "TITRE TOUT EN MAJ" → sous-titre (H3)
// Résultat : rendu propre même sans re-formatage côté Studio.
// ─────────────────────────────────────────────────────────────

const BULLET_PREFIXES = /^(?:✔️|✔|✓|✅|▪|•|–|—|-|→|➜|➤|★|▶)\s*/

type ParsedNode =
  | { kind: 'para'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'list'; items: string[] }

function blockPlainText(block: PortableTextBlock): string {
  const children = (block.children ?? []) as Array<{ text?: string }>
  return children.map((c) => c.text ?? '').join('').trim()
}

function parseDescription(blocks: PortableTextBlock[]): ParsedNode[] {
  const nodes: ParsedNode[] = []
  let listBuffer: string[] = []
  const flushList = () => {
    if (listBuffer.length > 0) {
      nodes.push({ kind: 'list', items: listBuffer })
      listBuffer = []
    }
  }
  for (const block of blocks) {
    // On respecte les styles natifs Sanity (h1..h4, blockquote, listItem)
    if (block._type !== 'block') {
      flushList()
      continue
    }
    const style = (block as { style?: string }).style
    const listItem = (block as { listItem?: string }).listItem
    const text = blockPlainText(block)
    if (!text) continue

    // Liste native Sanity → on l'ajoute au buffer
    if (listItem) {
      listBuffer.push(text)
      continue
    }

    // Détection : ligne bullet (✔ item)
    if (BULLET_PREFIXES.test(text)) {
      listBuffer.push(text.replace(BULLET_PREFIXES, '').trim())
      continue
    }

    flushList()

    // H2/H3 natif Sanity
    if (style === 'h2' || style === 'h3' || style === 'h4') {
      nodes.push({ kind: 'h3', text })
      continue
    }

    // Ligne courte finissant par ":" → mini-titre
    const isMiniTitle =
      text.length < 60 && /[:：]$/.test(text) && !/\.\s/.test(text)
    // Ligne courte tout en majuscule → mini-titre
    const isCaps = text.length < 60 && text === text.toUpperCase() && /[A-ZÀ-Ÿ]/.test(text)

    if (isMiniTitle || isCaps) {
      nodes.push({ kind: 'h3', text: text.replace(/[:：]$/, '').trim() })
      continue
    }

    nodes.push({ kind: 'para', text })
  }
  flushList()
  return nodes
}

// Composants PortableText de secours (si un jour l'admin utilise
// vraiment les styles natifs Sanity au lieu du texte plat).
const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-4 leading-relaxed text-ink-soft">{children}</p>
    ),
    h2: ({ children }) => (
      <h3 className="font-serif text-2xl text-ink mt-10 mb-3 leading-snug">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="font-serif text-xl text-ink mt-8 mb-2 leading-snug">
        {children}
      </h4>
    ),
    h4: ({ children }) => (
      <h4 className="font-serif text-lg text-ink mt-6 mb-2">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-4 border-gold pl-5 italic text-ink-soft">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mt-4 space-y-2">{children}</ul>,
    number: ({ children }) => (
      <ol className="mt-4 space-y-2 list-decimal list-inside">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="flex items-start gap-3 text-ink-soft leading-relaxed">
        <Check className="h-4 w-4 text-gold mt-1.5 shrink-0" strokeWidth={2} />
        <span>{children}</span>
      </li>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="text-ink font-medium">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        className="text-gold-dark underline underline-offset-2 hover:text-gold"
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
  },
}

export function ProductTabs({ description, specs, legal }: ProductTabsProps) {
  const parsed = useMemo<ParsedNode[] | null>(() => {
    if (!description || description.length === 0) return null
    return parseDescription(description)
  }, [description])

  const hasDescription = parsed !== null && parsed.length > 0
  const hasSpecs =
    specs.widthCm ||
    specs.depthCm ||
    specs.heightCm ||
    specs.material ||
    specs.color ||
    specs.brand ||
    specs.condition ||
    specs.sku

  const defaultTab: TabKey = hasDescription
    ? 'description'
    : hasSpecs
      ? 'specs'
      : 'livraison'

  const [active, setActive] = useState<TabKey>(defaultTab)

  const tabs: { key: TabKey; label: string; icon: typeof FileText; show: boolean }[] = [
    { key: 'description', label: 'Description', icon: FileText, show: !!hasDescription },
    { key: 'specs', label: 'Caractéristiques', icon: Ruler, show: !!hasSpecs },
    { key: 'livraison', label: 'Livraison & garantie', icon: Truck, show: true },
  ]

  const visibleTabs = tabs.filter((t) => t.show)
  if (visibleTabs.length === 0) return null

  return (
    <section className="bg-ivory-dark border-y border-line" aria-labelledby="product-details-heading">
      <div className="container py-12 md:py-16 max-w-4xl">
        <h2 id="product-details-heading" className="sr-only">
          En savoir plus sur ce produit
        </h2>

        {/* Barre d'onglets */}
        <div
          role="tablist"
          aria-label="Informations produit"
          className="flex border-b border-line overflow-x-auto"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = active === tab.key
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                id={`tab-${tab.key}`}
                onClick={() => setActive(tab.key)}
                className={`relative inline-flex items-center gap-2 px-4 md:px-6 py-4 text-sm font-medium uppercase tracking-widest whitespace-nowrap transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-mute hover:text-ink-soft'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.key === 'description' && 'Desc.'}
                  {tab.key === 'specs' && 'Détails'}
                  {tab.key === 'livraison' && 'Livraison'}
                </span>
                {isActive && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-gold" />
                )}
              </button>
            )
          })}
        </div>

        {/* Panneaux */}
        <div className="mt-8">
          {/* DESCRIPTION — rendu enrichi (auto-détection des sous-titres et bullets) */}
          {hasDescription && parsed && (
            <div
              role="tabpanel"
              id="panel-description"
              aria-labelledby="tab-description"
              hidden={active !== 'description'}
              className="max-w-none"
            >
              {parsed.map((node, i) => {
                if (node.kind === 'h3') {
                  return (
                    <h3
                      key={i}
                      className="font-serif text-xl md:text-2xl text-ink mt-10 mb-3 leading-snug first:mt-0"
                    >
                      {node.text}
                      <span className="block h-px w-10 bg-gold mt-3" aria-hidden />
                    </h3>
                  )
                }
                if (node.kind === 'list') {
                  return (
                    <ul key={i} className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
                      {node.items.map((item, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 text-ink-soft leading-relaxed"
                        >
                          <Check
                            className="h-4 w-4 text-gold mt-1.5 shrink-0"
                            strokeWidth={2}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )
                }
                return (
                  <p
                    key={i}
                    className="mt-4 leading-relaxed text-ink-soft first:mt-0"
                  >
                    {node.text}
                  </p>
                )
              })}

              {/* Fallback : rendu PortableText brut si jamais l'admin utilise
                  vraiment des styles Sanity — on l'affiche masqué pour
                  garder les marks/liens si présents un jour. */}
              <div className="hidden">
                <PortableText
                  value={description as PortableTextBlock[]}
                  components={portableTextComponents}
                />
              </div>

              {/* Maillage sortant : ancres contextuelles */}
              <div className="mt-10 pt-6 border-t border-line/60 flex flex-wrap gap-4 text-xs text-ink-mute">
                <Link
                  href="/charte-qualite"
                  className="inline-flex items-center gap-1.5 hover:text-gold-dark underline underline-offset-2"
                >
                  📐 Comprendre nos niveaux d&apos;état
                </Link>
                <Link
                  href="/notre-demarche"
                  className="inline-flex items-center gap-1.5 hover:text-gold-dark underline underline-offset-2"
                >
                  ♻️ Notre démarche reconditionnement
                </Link>
                <Link
                  href="/attestation-rse"
                  className="inline-flex items-center gap-1.5 hover:text-gold-dark underline underline-offset-2"
                >
                  📄 Attestation RSE incluse
                </Link>
              </div>
            </div>
          )}

          {/* CARACTÉRISTIQUES */}
          {hasSpecs && (
            <div
              role="tabpanel"
              id="panel-specs"
              aria-labelledby="tab-specs"
              hidden={active !== 'specs'}
            >
              <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-5">
                {specs.brand && (
                  <div className="flex flex-col gap-1 pb-4 border-b border-line/60">
                    <dt className="text-xs uppercase tracking-widest text-ink-mute">
                      Marque d&apos;origine
                    </dt>
                    <dd className="font-serif text-lg text-ink">{specs.brand}</dd>
                  </div>
                )}
                {specs.condition && CONDITION_LABELS[specs.condition] && (
                  <div className="flex flex-col gap-1 pb-4 border-b border-line/60">
                    <dt className="text-xs uppercase tracking-widest text-ink-mute">État</dt>
                    <dd className="font-serif text-lg text-ink">
                      <Link
                        href="/charte-qualite"
                        className="hover:text-gold-dark underline underline-offset-4 decoration-gold/40"
                      >
                        {CONDITION_LABELS[specs.condition]}
                      </Link>
                    </dd>
                  </div>
                )}
                {specs.widthCm && (
                  <div className="flex flex-col gap-1 pb-4 border-b border-line/60">
                    <dt className="text-xs uppercase tracking-widest text-ink-mute">Largeur</dt>
                    <dd className="font-serif text-lg text-ink">{specs.widthCm} cm</dd>
                  </div>
                )}
                {specs.depthCm && (
                  <div className="flex flex-col gap-1 pb-4 border-b border-line/60">
                    <dt className="text-xs uppercase tracking-widest text-ink-mute">Profondeur</dt>
                    <dd className="font-serif text-lg text-ink">{specs.depthCm} cm</dd>
                  </div>
                )}
                {specs.heightCm && (
                  <div className="flex flex-col gap-1 pb-4 border-b border-line/60">
                    <dt className="text-xs uppercase tracking-widest text-ink-mute">Hauteur</dt>
                    <dd className="font-serif text-lg text-ink">{specs.heightCm} cm</dd>
                  </div>
                )}
                {specs.material && (
                  <div className="flex flex-col gap-1 pb-4 border-b border-line/60">
                    <dt className="text-xs uppercase tracking-widest text-ink-mute">Matière</dt>
                    <dd className="text-ink">{specs.material}</dd>
                  </div>
                )}
                {specs.color && (
                  <div className="flex flex-col gap-1 pb-4 border-b border-line/60">
                    <dt className="text-xs uppercase tracking-widest text-ink-mute">Couleur</dt>
                    <dd className="text-ink">{specs.color}</dd>
                  </div>
                )}
                {specs.sku && (
                  <div className="flex flex-col gap-1 pb-4 border-b border-line/60">
                    <dt className="text-xs uppercase tracking-widest text-ink-mute">Référence</dt>
                    <dd className="text-ink font-mono text-sm">{specs.sku}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* LIVRAISON & GARANTIE */}
          <div
            role="tabpanel"
            id="panel-livraison"
            aria-labelledby="tab-livraison"
            hidden={active !== 'livraison'}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-ivory border-l-4 border-gold p-6">
                <Truck className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-lg text-ink mt-4">Livraison &amp; retrait</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                  <li>· Retrait gratuit au showroom de La Penne-sur-Huveaune (sur RDV)</li>
                  <li>
                    · Livraison sur devis :{' '}
                    <Link href="/bureau-occasion-marseille" className="hover:text-gold-dark underline underline-offset-2">
                      Marseille
                    </Link>
                    ,{' '}
                    <Link href="/bureau-occasion-aubagne" className="hover:text-gold-dark underline underline-offset-2">
                      Aubagne
                    </Link>
                    ,{' '}
                    <Link href="/bureau-occasion-aix-en-provence" className="hover:text-gold-dark underline underline-offset-2">
                      Aix
                    </Link>
                    ,{' '}
                    <Link href="/bureau-occasion-la-ciotat" className="hover:text-gold-dark underline underline-offset-2">
                      La Ciotat
                    </Link>
                    ,{' '}
                    <Link href="/bureau-occasion-toulon" className="hover:text-gold-dark underline underline-offset-2">
                      Toulon
                    </Link>
                    ,{' '}
                    <Link href="/bureau-occasion-avignon" className="hover:text-gold-dark underline underline-offset-2">
                      Avignon
                    </Link>
                  </li>
                  <li>· Aide au déchargement et placement inclus dans la livraison</li>
                  <li>· Délai habituel : 5 à 10 jours ouvrés selon la zone</li>
                </ul>
              </div>

              <div className="bg-ivory border-l-4 border-gold p-6">
                <ShieldCheck className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-lg text-ink mt-4">Notre atelier local</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                  <li>
                    · Atelier &amp; showroom à La Penne-sur-Huveaune —{' '}
                    <em>tout est préparé sur place par notre équipe</em>
                  </li>
                  <li>
                    · Contrôle qualité 7 points sur place avant mise en vente{' '}
                    <Link href="/charte-qualite" className="text-gold-dark underline underline-offset-2 hover:text-gold">
                      voir la charte
                    </Link>
                  </li>
                  <li>· Équipe locale joignable directement, pas de SAV externalisé</li>
                  <li>· 14 jours de rétractation pour les particuliers</li>
                </ul>
              </div>
            </div>

            <div className="bg-ivory border border-line p-6">
              <FileBadge2 className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <h3 className="font-serif text-lg text-ink mt-4">Attestation de valorisation RSE</h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                À chaque commande professionnelle, nous remettons une
                attestation chiffrée indiquant le poids de mobilier remis
                en circulation et les émissions de CO₂ évitées par rapport
                à un équivalent neuf. Utile pour vos rapports RSE, bilans
                carbone et appels d&apos;offres incluant des critères
                d&apos;économie circulaire.{' '}
                <Link
                  href="/attestation-rse"
                  className="text-gold-dark underline underline-offset-2 hover:text-gold"
                >
                  En savoir plus
                </Link>
                .
              </p>
            </div>

            <div className="pt-6 border-t border-line flex flex-wrap items-center gap-6 text-sm text-ink-mute">
              <span className="font-medium text-ink uppercase tracking-widest text-xs">
                Une question ?
              </span>
              <a
                href={`tel:${legal.telephoneTel}`}
                className="inline-flex items-center gap-2 hover:text-gold-dark"
              >
                <Phone className="h-4 w-4" /> {legal.telephone}
              </a>
              <a
                href={`mailto:${legal.email}`}
                className="inline-flex items-center gap-2 hover:text-gold-dark"
              >
                <Mail className="h-4 w-4" /> {legal.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
