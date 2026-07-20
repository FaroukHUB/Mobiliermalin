/**
 * Template partagé pour les landing pages nationales V2.
 *
 * Reçoit une SanityNationalLanding + un contexte de page (breadcrumb,
 * ctas, produits associés, liens related). Rend la structure complète :
 * hero, meta, tldr, sommaire, audience, stats, corps portable text,
 * cas clients, prix, livraison, vidéo, glossaire, produits, related.
 *
 * La FAQ + les JSON-LD sont émis par la page.tsx appelante (pour laisser
 * la flexibilité par sujet).
 */

import type { PortableTextBlock } from 'next-sanity'
import { EditorialPortableText } from '@/components/portable-text/EditorialPortableText'
import { NationalHero } from './NationalHero'
import { NationalDeliveryBanner } from './NationalDeliveryBanner'
import {
  AuthorMeta,
  TldrBlock,
  AudienceIntro,
  StatsRow,
  CaseStudyCards,
  PricingTable,
  DeliveryTable,
  GlossarySection,
  VideoBlock,
  RelatedProductsGrid,
  RelatedContent,
  TableOfContents,
  type RelatedLink,
  type TocItem,
} from './V2Blocks'
import type { SanityNationalLanding, urlFor as urlForType } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'
import type { ProductCardData } from '@/components/product/ProductCard'
import type { NationalHeroCTA } from './NationalHero'

export type NationalPageV2Props = {
  landing: SanityNationalLanding | null
  fallback: {
    heroEyebrow: string
    heroTitle: string
    heroIntro: string
  }
  breadcrumb: Array<{ name: string; href?: string }>
  ctas?: NationalHeroCTA[]
  products?: ProductCardData[]
  productsCtaHref?: string
  productsTitle?: string
  relatedLinks?: RelatedLink[]
  toc?: TocItem[]
}

/**
 * Ce composant assume qu'il est le seul contenu de la page (rend une
 * balise <article>). Les JSON-LD, la FAQ et les meta doivent être
 * gérés dans la page.tsx appelante.
 */
export function NationalPageV2({
  landing,
  fallback,
  breadcrumb,
  ctas,
  products,
  productsCtaHref,
  productsTitle,
  relatedLinks,
  toc,
}: NationalPageV2Props) {
  const eyebrow = landing?.heroEyebrow || fallback.heroEyebrow
  const title = landing?.heroTitle || fallback.heroTitle
  const intro = landing?.heroIntro || fallback.heroIntro
  const heroImageUrl = landing?.heroImage
    ? (urlFor as unknown as typeof urlForType)(landing.heroImage)
        .width(2400)
        .height(1200)
        .fit('crop')
        .url()
    : null

  return (
    <article>
      <NationalHero
        breadcrumb={breadcrumb}
        eyebrow={eyebrow}
        title={title}
        intro={intro}
        imageUrl={heroImageUrl}
        imageAlt={landing?.heroImage?.alt || title}
        ctas={ctas}
      />

      {/* ─── Meta (auteur, date, temps de lecture) ─── */}
      {(landing?.author ||
        landing?.lastUpdated ||
        landing?.readingTimeMinutes) && (
        <section className="container max-w-4xl pt-8 md:pt-12">
          <AuthorMeta
            author={landing?.author}
            publishedAt={landing?.publishedAt}
            lastUpdated={landing?.lastUpdated}
            readingTimeMinutes={landing?.readingTimeMinutes}
          />
        </section>
      )}

      {/* ─── TL;DR ─── */}
      {landing?.tldr && (
        <section className="container max-w-4xl">
          <TldrBlock tldr={landing.tldr} />
        </section>
      )}

      {/* ─── Produits associés (haut de page : on vend d'abord) ─── */}
      {products && products.length > 0 && (
        <section className="container max-w-6xl">
          <RelatedProductsGrid
            products={products}
            title={productsTitle || 'Notre sélection actuelle'}
            ctaHref={productsCtaHref}
          />
        </section>
      )}

      {/* ─── Sommaire ─── */}
      {toc && toc.length > 0 && (
        <section className="container max-w-4xl">
          <TableOfContents items={toc} />
        </section>
      )}

      {/* ─── Chiffres clés ─── */}
      {landing?.keyStats && landing.keyStats.length > 0 && (
        <div className="container max-w-6xl">
          <StatsRow stats={landing.keyStats} />
        </div>
      )}

      {/* ─── Audience ─── */}
      {landing?.audienceIntro && landing.audienceIntro.length > 0 && (
        <section className="container max-w-4xl">
          <AudienceIntro personas={landing.audienceIntro} />
        </section>
      )}

      {/* ─── Corps éditorial (Portable Text) ─── */}
      {landing?.body && Array.isArray(landing.body) && landing.body.length > 0 && (
        <section className="container py-10 md:py-14 max-w-3xl">
          <EditorialPortableText value={landing.body as PortableTextBlock[]} />
        </section>
      )}

      {/* ─── Cas clients ─── */}
      {landing?.caseStudies && landing.caseStudies.length > 0 && (
        <section className="container max-w-6xl">
          <CaseStudyCards cases={landing.caseStudies} />
        </section>
      )}

      {/* ─── Prix constatés ─── */}
      {landing?.pricingRanges && landing.pricingRanges.length > 0 && (
        <section className="container max-w-5xl">
          <PricingTable rows={landing.pricingRanges} />
        </section>
      )}

      {/* ─── Livraison ─── */}
      {landing?.deliveryTable && landing.deliveryTable.length > 0 && (
        <section className="container max-w-5xl">
          <DeliveryTable rows={landing.deliveryTable} />
        </section>
      )}

      {/* ─── Vidéo atelier ─── */}
      {landing?.videoEmbed?.url && (
        <section className="container max-w-4xl">
          <VideoBlock video={landing.videoEmbed} />
        </section>
      )}

      {/* ─── Bandeau livraison national ─── */}
      <NationalDeliveryBanner />

      {/* ─── Glossaire ─── */}
      {landing?.glossary && landing.glossary.length > 0 && (
        <section className="container max-w-4xl">
          <GlossarySection terms={landing.glossary} />
        </section>
      )}

      {/* ─── Contenu associé (liens sortants) ─── */}
      {relatedLinks && relatedLinks.length > 0 && (
        <RelatedContent links={relatedLinks} />
      )}
    </article>
  )
}
