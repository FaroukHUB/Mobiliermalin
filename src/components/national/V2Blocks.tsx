/**
 * Composants V2 pour les landing pages nationales.
 *
 * Tous ces blocs lisent leur contenu depuis un document Sanity
 * `nationalLandingPage`. Ils sont rendus conditionnellement : si le
 * champ correspondant est vide, le bloc ne s'affiche pas (safe migration).
 *
 * Design : cohérent avec la palette ivoire/or/encre du site (globals.css).
 * Aucun état, aucun effet, tout est SSR-compatible.
 */

import Link from 'next/link'
import Image from 'next/image'
import {
  Recycle,
  ShieldCheck,
  Truck,
  Award,
  Users,
  Building,
  Leaf,
  Clock,
  Star,
  Package,
  ArrowRight,
  Quote,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react'
import type {
  SanityAudiencePersona,
  SanityCaseStudy,
  SanityDeliveryRow,
  SanityGlossaryTerm,
  SanityKeyStat,
  SanityPricingRow,
} from '@/lib/sanity'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { slugifyHeading } from '@/lib/slugify'

// ─── Icon resolver ────────────────────────────────────

const ICON_MAP = {
  Recycle,
  ShieldCheck,
  Truck,
  Award,
  Users,
  Building,
  Leaf,
  Clock,
  Star,
  Package,
} as const

function StatIcon({ name }: { name?: string }) {
  const Icon = (name && (ICON_MAP as Record<string, typeof ShieldCheck>)[name]) || ShieldCheck
  return <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} aria-hidden="true" />
}

// ─── AuthorMeta ────────────────────────────────────────

export function AuthorMeta({
  author,
  publishedAt,
  lastUpdated,
  readingTimeMinutes,
}: {
  author?: string
  publishedAt?: string
  lastUpdated?: string
  readingTimeMinutes?: number
}) {
  if (!author && !lastUpdated && !readingTimeMinutes) return null
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-mute">
      {author && (
        <span className="inline-flex items-center gap-2">
          <User className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
          <span>
            Par <span className="text-ink font-medium">{author}</span>
          </span>
        </span>
      )}
      {lastUpdated && (
        <span className="inline-flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
          <span>
            Mis à jour le{' '}
            <time dateTime={lastUpdated} className="text-ink font-medium">
              {formatDate(lastUpdated)}
            </time>
          </span>
        </span>
      )}
      {readingTimeMinutes && (
        <span className="inline-flex items-center gap-2">
          <Clock className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
          <span>Lecture {readingTimeMinutes} min</span>
        </span>
      )}
      {publishedAt && !lastUpdated && (
        <span className="inline-flex items-center gap-2 text-xs">
          <span>
            Publié le{' '}
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          </span>
        </span>
      )}
    </div>
  )
}

// ─── TldrBlock ─────────────────────────────────────────

export function TldrBlock({ tldr }: { tldr?: string }) {
  if (!tldr?.trim()) return null
  return (
    <aside
      className="my-8 border-l-4 border-gold bg-ivory-dark/60 p-6 md:p-8"
      aria-label="Résumé"
    >
      <p className="eyebrow text-gold mb-3">En bref</p>
      <p className="text-lg text-ink leading-relaxed">{tldr}</p>
    </aside>
  )
}

// ─── AudienceIntro ─────────────────────────────────────

export function AudienceIntro({ personas }: { personas?: SanityAudiencePersona[] }) {
  if (!personas || personas.length === 0) return null
  return (
    <section className="my-12">
      <h2 className="font-serif text-2xl md:text-3xl text-ink mb-2">
        À qui s&apos;adresse cette page ?
      </h2>
      <div className="h-px w-16 bg-gold mb-8" />
      <div
        className={`grid gap-4 ${
          personas.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
        }`}
      >
        {personas.map((p, i) => (
          <div
            key={i}
            className="border border-line bg-ivory p-5 md:p-6"
          >
            <div className="inline-flex items-center gap-2 text-gold mb-2">
              <Users className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              <span className="eyebrow text-gold text-xs">Profil</span>
            </div>
            <p className="font-serif text-lg text-ink">{p.label}</p>
            {p.description && (
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {p.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── StatsRow ──────────────────────────────────────────

export function StatsRow({ stats }: { stats?: SanityKeyStat[] }) {
  if (!stats || stats.length === 0) return null
  const cols =
    stats.length >= 4 ? 'md:grid-cols-4' : stats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
  return (
    <section aria-label="Chiffres clés" className="my-12 bg-ink text-ivory">
      <div className={`grid grid-cols-2 ${cols} divide-y divide-ivory/10 md:divide-y-0 md:divide-x md:divide-ivory/10`}>
        {stats.map((s, i) => (
          <div key={i} className="p-6 md:p-8 text-center">
            <div className="inline-flex items-center justify-center mb-3">
              <StatIcon name={s.icon} />
            </div>
            <div className="font-serif text-3xl md:text-4xl text-ivory">
              {s.value}
            </div>
            <div className="mt-2 text-sm text-ivory/70 leading-snug">
              {s.label}
            </div>
            {s.source && (
              <div className="mt-1 text-[10px] uppercase tracking-widest text-ivory/40">
                {s.source}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── CaseStudyCards ────────────────────────────────────

export function CaseStudyCards({ cases }: { cases?: SanityCaseStudy[] }) {
  if (!cases || cases.length === 0) return null
  return (
    <section className="my-14 md:my-20">
      <p className="eyebrow text-gold">Cas clients</p>
      <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">
        Ils ont choisi le reconditionné, voici comment
      </h2>
      <div className="h-px w-16 bg-gold mb-8" />
      <div
        className={`grid gap-5 ${
          cases.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
        }`}
      >
        {cases.map((c, i) => (
          <article
            key={i}
            className="border border-line bg-ivory p-6 flex flex-col"
          >
            <p className="eyebrow text-ink-mute text-xs">{c.clientType}</p>
            <div className="mt-4 space-y-3 text-sm text-ink-soft leading-relaxed">
              <div>
                <p className="font-semibold text-ink mb-1">Contexte</p>
                <p>{c.context}</p>
              </div>
              <div>
                <p className="font-semibold text-ink mb-1">Notre réponse</p>
                <p>{c.solution}</p>
              </div>
              {c.result && (
                <div>
                  <p className="font-semibold text-ink mb-1">Résultat</p>
                  <p>{c.result}</p>
                </div>
              )}
            </div>
            {c.quote && (
              <blockquote className="mt-5 pt-5 border-t border-line text-sm italic text-ink relative">
                <Quote className="h-4 w-4 text-gold mb-2" strokeWidth={1.5} aria-hidden="true" />
                {c.quote}
              </blockquote>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

// ─── PricingTable ──────────────────────────────────────

export function PricingTable({ rows }: { rows?: SanityPricingRow[] }) {
  if (!rows || rows.length === 0) return null
  const formatPrice = (n: number) => n.toLocaleString('fr-FR')
  return (
    <section className="my-14 md:my-20">
      <p className="eyebrow text-gold">Prix constatés</p>
      <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">
        Combien coûte le reconditionné ?
      </h2>
      <div className="h-px w-16 bg-gold mb-6" />
      <p className="text-ink-soft mb-6 max-w-3xl">
        Fourchettes indicatives observées dans notre atelier. Les prix
        varient selon l&apos;état esthétique, les options d&apos;origine
        et l&apos;année de fabrication.
      </p>
      <div className="overflow-x-auto border border-line">
        <table className="w-full text-sm">
          <thead className="bg-ink text-ivory">
            <tr>
              <th className="text-left px-4 py-3 font-serif whitespace-nowrap">Modèle / type</th>
              <th className="text-left px-4 py-3 font-serif whitespace-nowrap">Reconditionné</th>
              <th className="text-left px-4 py-3 font-serif whitespace-nowrap">Prix neuf indicatif</th>
              <th className="text-left px-4 py-3 font-serif">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-ivory' : 'bg-ivory-light'}>
                <td className="px-4 py-3 text-ink font-medium align-top">{r.label}</td>
                <td className="px-4 py-3 text-ink-soft align-top whitespace-nowrap">
                  {formatPrice(r.priceFrom)} à {formatPrice(r.priceTo)} €
                </td>
                <td className="px-4 py-3 text-ink-mute align-top whitespace-nowrap">
                  {r.newPriceRef || '—'}
                </td>
                <td className="px-4 py-3 text-ink-soft align-top">
                  {r.notes || ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── DeliveryTable ─────────────────────────────────────

export function DeliveryTable({ rows }: { rows?: SanityDeliveryRow[] }) {
  if (!rows || rows.length === 0) return null
  return (
    <section className="my-14 md:my-20">
      <p className="eyebrow text-gold">Livraison France</p>
      <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">
        Combien de temps pour être livré ?
      </h2>
      <div className="h-px w-16 bg-gold mb-6" />
      <p className="text-ink-soft mb-6 max-w-3xl">
        Nous livrons partout en France métropolitaine. Les délais
        ci-dessous sont indicatifs, à confirmer au devis selon le volume
        et l&apos;accessibilité de votre adresse.
      </p>
      <div className="overflow-x-auto border border-line">
        <table className="w-full text-sm">
          <thead className="bg-ink text-ivory">
            <tr>
              <th className="text-left px-4 py-3 font-serif whitespace-nowrap">Zone</th>
              <th className="text-left px-4 py-3 font-serif">Villes principales</th>
              <th className="text-left px-4 py-3 font-serif whitespace-nowrap">Délai typique</th>
              <th className="text-left px-4 py-3 font-serif">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-ivory' : 'bg-ivory-light'}>
                <td className="px-4 py-3 text-ink font-medium align-top">{r.region}</td>
                <td className="px-4 py-3 text-ink-soft align-top">{r.cities || ''}</td>
                <td className="px-4 py-3 text-ink-soft align-top whitespace-nowrap">{r.delay}</td>
                <td className="px-4 py-3 text-ink-mute align-top text-xs">{r.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── GlossarySection ───────────────────────────────────

export function GlossarySection({ terms }: { terms?: SanityGlossaryTerm[] }) {
  if (!terms || terms.length === 0) return null
  return (
    <section className="my-14 md:my-20">
      <p className="eyebrow text-gold">Glossaire</p>
      <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">
        Le vocabulaire à connaître
      </h2>
      <div className="h-px w-16 bg-gold mb-8" />
      <dl className="grid md:grid-cols-2 gap-x-8 gap-y-6">
        {terms.map((t, i) => (
          <div key={i} className="border-l-2 border-line pl-4">
            <dt className="font-serif text-lg text-ink">{t.term}</dt>
            <dd className="mt-1 text-sm text-ink-soft leading-relaxed">
              {t.definition}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

// ─── VideoBlock ────────────────────────────────────────

function ytId(url: string): string | null {
  // Supporte watch?v=, youtu.be/, shorts/, live/, embed/
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )
  return m ? m[1] : null
}
function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m ? m[1] : null
}

export function VideoBlock({
  video,
}: {
  video?: { url?: string; title?: string; description?: string }
}) {
  if (!video?.url) return null
  const yt = ytId(video.url)
  const vm = vimeoId(video.url)
  const embedUrl = yt
    ? `https://www.youtube.com/embed/${yt}`
    : vm
      ? `https://player.vimeo.com/video/${vm}`
      : null
  if (!embedUrl) return null
  return (
    <section className="my-14 md:my-20">
      <p className="eyebrow text-gold">Notre atelier en vidéo</p>
      <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-6">
        {video.title || "Découvrez notre atelier de reconditionnement"}
      </h2>
      <div className="relative aspect-video bg-ink overflow-hidden border border-line">
        <iframe
          src={embedUrl}
          title={video.title || 'Vidéo Mobilier Malin'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          loading="lazy"
        />
      </div>
      {video.description && (
        <p className="mt-3 text-sm text-ink-mute italic">{video.description}</p>
      )}
    </section>
  )
}

// ─── RelatedProductsGrid ───────────────────────────────

export function RelatedProductsGrid({
  products,
  title = 'Notre sélection actuelle',
  eyebrow = 'Produits associés',
  ctaHref,
  ctaLabel = 'Voir toute la sélection',
}: {
  products: ProductCardData[]
  title?: string
  eyebrow?: string
  ctaHref?: string
  ctaLabel?: string
}) {
  if (!products || products.length === 0) return null
  return (
    <section className="my-14 md:my-20">
      <p className="eyebrow text-gold">{eyebrow}</p>
      <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">
        {title}
      </h2>
      <div className="h-px w-16 bg-gold mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {products.slice(0, 8).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {ctaHref && (
        <div className="mt-8 flex justify-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 text-ink underline underline-offset-4 hover:text-gold-dark"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      )}
    </section>
  )
}

// ─── RelatedContent (guides + villes + autres nationales) ──

export type RelatedLink = {
  href: string
  label: string
  eyebrow?: string
}

export function RelatedContent({
  title = 'Continuer votre exploration',
  eyebrow = 'Pour aller plus loin',
  links,
}: {
  title?: string
  eyebrow?: string
  links: RelatedLink[]
}) {
  if (!links || links.length === 0) return null
  return (
    <section className="my-14 md:my-20 bg-ivory-dark border-y border-line">
      <div className="container py-12 md:py-16">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-8">
          {title}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((l, i) => (
            <Link
              key={i}
              href={l.href}
              className="group flex items-start gap-3 p-4 bg-ivory border border-line hover:border-gold transition-colors"
            >
              <BookOpen className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
              <div className="flex-1">
                {l.eyebrow && (
                  <p className="text-[10px] uppercase tracking-widest text-ink-mute mb-1">
                    {l.eyebrow}
                  </p>
                )}
                <p className="text-ink group-hover:text-gold-dark leading-snug">
                  {l.label}
                </p>
              </div>
              <ArrowRight
                className="h-4 w-4 text-gold shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform"
                strokeWidth={1.5}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── TableOfContents (sommaire cliquable) ─────────────

export type TocItem = { id?: string; label: string }

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items || items.length === 0) return null
  return (
    <nav
      aria-label="Sommaire de la page"
      className="my-8 md:my-10 p-5 md:p-6 bg-ivory-dark/60 border-l-4 border-gold"
    >
      <p className="eyebrow text-gold mb-3">Sommaire</p>
      <ol className="space-y-1.5">
        {items.map((it, i) => {
          // On ignore volontairement it.id : le href est TOUJOURS dérivé
          // du label via slugifyHeading, exactement comme les H2 rendus
          // par EditorialPortableText — garantie que l'ancre matche.
          const anchor = slugifyHeading(it.label)
          return (
            <li key={anchor || i} className="text-ink-soft hover:text-gold-dark">
              <a
                href={`#${anchor}`}
                className="inline-flex items-baseline gap-2"
              >
                <span className="text-xs text-ink-mute tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{it.label}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ─── ExpertTip (encart Astuce standardisé) ─────────

export function ExpertTip({
  title = 'Astuce Mobilier Malin',
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <aside className="my-8 p-5 md:p-6 border-l-4 border-gold bg-gold/10">
      <p className="eyebrow text-gold-dark mb-2">{title}</p>
      <div className="text-ink leading-relaxed">{children}</div>
    </aside>
  )
}

// ─── AtelierPhotos (2-3 photos réelles atelier) ────

export type AtelierPhoto = {
  url: string
  alt: string
  caption?: string
}

export function AtelierPhotos({ photos }: { photos?: AtelierPhoto[] }) {
  if (!photos || photos.length === 0) return null
  return (
    <section className="my-14 md:my-20">
      <p className="eyebrow text-gold">Notre atelier</p>
      <h2 className="font-serif text-2xl md:text-3xl text-ink mt-2 mb-2">
        La reconditionnement se passe ici
      </h2>
      <div className="h-px w-16 bg-gold mb-8" />
      <div
        className={`grid gap-4 ${
          photos.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
        }`}
      >
        {photos.map((p, i) => (
          <figure key={i} className="relative">
            <div className="relative aspect-[4/3] bg-ivory-dark overflow-hidden">
              <Image
                src={p.url}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
                unoptimized={p.url.startsWith('http') && !p.url.includes('cdn.sanity.io')}
              />
            </div>
            {p.caption && (
              <figcaption className="mt-2 text-xs text-ink-mute italic text-center">
                {p.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  )
}
