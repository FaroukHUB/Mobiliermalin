'use client'

import { useState } from 'react'
import { PortableText, type PortableTextBlock } from 'next-sanity'
import {
  FileText,
  Ruler,
  Truck,
  ShieldCheck,
  FileBadge2,
  Phone,
  Mail,
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

export function ProductTabs({ description, specs, legal }: ProductTabsProps) {
  const hasDescription = description && description.length > 0
  const hasSpecs =
    specs.widthCm ||
    specs.depthCm ||
    specs.heightCm ||
    specs.material ||
    specs.color ||
    specs.brand ||
    specs.condition ||
    specs.sku

  // Onglet par défaut : description si elle existe, sinon caractéristiques, sinon livraison
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
    <section className="bg-ivory-dark border-y border-line">
      <div className="container py-12 md:py-16 max-w-4xl">
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
                  isActive
                    ? 'text-ink'
                    : 'text-ink-mute hover:text-ink-soft'
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
          {/* DESCRIPTION */}
          {hasDescription && (
            <div
              role="tabpanel"
              id="panel-description"
              aria-labelledby="tab-description"
              hidden={active !== 'description'}
              className="text-ink-soft leading-relaxed prose prose-stone max-w-none"
            >
              <PortableText value={description as PortableTextBlock[]} />
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
                    <dt className="text-xs uppercase tracking-widest text-ink-mute">Marque d&apos;origine</dt>
                    <dd className="font-serif text-lg text-ink">{specs.brand}</dd>
                  </div>
                )}
                {specs.condition && CONDITION_LABELS[specs.condition] && (
                  <div className="flex flex-col gap-1 pb-4 border-b border-line/60">
                    <dt className="text-xs uppercase tracking-widest text-ink-mute">État</dt>
                    <dd className="font-serif text-lg text-ink">{CONDITION_LABELS[specs.condition]}</dd>
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
                  <li>· Livraison sur devis : Marseille, Aubagne, Aix, La Ciotat, Toulon, Avignon</li>
                  <li>· Aide au déchargement et placement inclus dans la livraison</li>
                  <li>· Délai habituel : 5 à 10 jours ouvrés selon la zone</li>
                </ul>
              </div>

              <div className="bg-ivory border-l-4 border-gold p-6">
                <ShieldCheck className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h3 className="font-serif text-lg text-ink mt-4">Garantie 6 mois</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                  <li>· Contrôle qualité 7 points avant mise en vente</li>
                  <li>· Mécanismes, vérin, accoudoirs, plateau : couverts</li>
                  <li>· Intervention sur site ou remplacement pièce détachée</li>
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
                d&apos;économie circulaire.
              </p>
            </div>

            <div className="pt-6 border-t border-line flex flex-wrap items-center gap-6 text-sm text-ink-mute">
              <span className="font-medium text-ink uppercase tracking-widest text-xs">Une question ?</span>
              <a href={`tel:${legal.telephoneTel}`} className="inline-flex items-center gap-2 hover:text-gold-dark">
                <Phone className="h-4 w-4" /> {legal.telephone}
              </a>
              <a href={`mailto:${legal.email}`} className="inline-flex items-center gap-2 hover:text-gold-dark">
                <Mail className="h-4 w-4" /> {legal.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
