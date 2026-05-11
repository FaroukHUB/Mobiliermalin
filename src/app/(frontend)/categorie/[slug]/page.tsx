import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, ArrowRight, Check } from 'lucide-react'
import {
  CATEGORIES,
  getCategoryBySlug,
  getCategoryRelated,
} from '@/lib/categories-data'
import { Reveal } from '@/components/animations/Reveal'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { getProductsByCategory, type AirtableProduct } from '@/lib/airtable'

export const revalidate = 60

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

type Params = { slug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const cat = getCategoryBySlug(slug)
  if (!cat) return { title: 'Catégorie introuvable' }

  return {
    title: `${cat.name} reconditionnés — ${cat.fromPriceLabel}`,
    description: `${cat.shortTagline}. ${cat.longDescription.slice(0, 110)}…`,
    alternates: { canonical: `/categorie/${slug}` },
  }
}

function airtableToCard(p: AirtableProduct): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    title: p.name,
    shortDescription: p.shortDescription,
    price: p.price,
    comparePrice: p.comparePrice,
    condition: p.condition,
    brandName: p.brand,
    imageUrl: p.images[0]?.url,
    imageAlt: p.images[0]?.alt || p.name,
    status: 'published',
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const staticData = getCategoryBySlug(slug)
  if (!staticData) notFound()

  const [products, related] = await Promise.all([
    getProductsByCategory(slug),
    Promise.resolve(getCategoryRelated(slug, 3)),
  ])

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Boutique',
        item: `${siteUrl}/boutique`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: staticData.name,
        item: `${siteUrl}/categorie/${slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-12 md:py-16">
          <nav aria-label="Fil d'Ariane" className="text-xs text-ink-mute">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link href="/" className="hover:text-gold-dark">
                  Accueil
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li>
                <Link href="/boutique" className="hover:text-gold-dark">
                  Boutique
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li className="text-ink">{staticData.name}</li>
            </ol>
          </nav>

          <div className="mt-8 grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16 items-center">
            <div>
              <p className="eyebrow">{staticData.fromPriceLabel}</p>
              <h1 className="text-display mt-3 font-serif leading-[1.05]">
                {staticData.name}
              </h1>
              <div className="gold-divider mx-0 mt-7" />
              <p className="mt-7 text-lg text-ink-soft leading-relaxed">
                {staticData.shortTagline}.
              </p>
              <p className="mt-4 text-ink-mute leading-relaxed">
                {staticData.longDescription}
              </p>

              {staticData.variants.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs uppercase tracking-widest text-ink-mute mb-3">
                    Variantes disponibles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {staticData.variants.map((v) => (
                      <span
                        key={v}
                        className="text-xs uppercase tracking-widest text-ink-mute border border-line bg-ivory-light px-3 py-1.5"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Reveal delay={150}>
              <div className="relative aspect-[4/5] bg-ivory-light overflow-hidden hidden lg:block">
                <Image
                  src={staticData.fallbackImage}
                  alt={staticData.fallbackImageAlt}
                  fill
                  sizes="400px"
                  className="object-cover"
                  priority
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Produits */}
      <section className="container py-16 md:py-20">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="eyebrow">Notre sélection</p>
              <h2 className="font-serif text-h1 mt-2">
                {products.length > 0
                  ? `${products.length} ${products.length > 1 ? 'pièces disponibles' : 'pièce disponible'}`
                  : 'Pièces disponibles sur demande'}
              </h2>
            </div>
            <Link href="/contact" className="btn-outline">
              Demander un devis personnalisé
            </Link>
          </div>
        </Reveal>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={i * 50}>
                <ProductCard product={airtableToCard(p)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="bg-ivory-light border border-line p-10 md:p-16 text-center">
              <p className="font-serif text-2xl text-ink">
                Notre stock évolue chaque semaine
              </p>
              <p className="text-ink-mute mt-3 max-w-xl mx-auto leading-relaxed">
                Les pièces de cette catégorie ne sont pas encore listées en
                ligne, mais elles sont disponibles à notre showroom d&apos;Aubagne.
                Décrivez-nous votre besoin, nous revenons sous 24 h avec ce que
                nous avons en stock — souvent plus large qu&apos;affiché ici.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/contact" className="btn-primary">
                  Demander la disponibilité
                </Link>
                <a href="tel:+33676617053" className="btn-outline">
                  06 76 61 70 53
                </a>
              </div>
            </div>
          </Reveal>
        )}
      </section>

      {/* Highlights */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-20">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="eyebrow">Notre exigence</p>
              <h2 className="text-h1 mt-2 font-serif">
                Ce qui distingue nos {staticData.name.toLowerCase()}
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
            {staticData.highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 80}>
                <div className="bg-ivory-light p-7 md:p-9 h-full">
                  <Check className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  <h3 className="font-serif text-xl text-ink mt-5 leading-tight">
                    {h.title}
                  </h3>
                  <p className="text-sm text-ink-soft mt-3 leading-relaxed">
                    {h.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16 md:py-20 max-w-3xl">
        <Reveal>
          <div className="text-center mb-10">
            <p className="eyebrow">Questions fréquentes</p>
            <h2 className="text-h1 mt-2 font-serif">À propos de cette catégorie</h2>
          </div>
        </Reveal>
        <div className="space-y-3">
          {staticData.faq.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <details className="group bg-ivory-light border border-line">
                <summary className="cursor-pointer p-5 md:p-6 flex items-center justify-between gap-4 list-none">
                  <span className="font-serif text-base md:text-lg text-ink leading-snug">
                    {item.q}
                  </span>
                  <span className="text-gold text-2xl transition-transform group-open:rotate-45 leading-none shrink-0">
                    +
                  </span>
                </summary>
                <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-ink-soft leading-relaxed">
                  {item.a}
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-ivory-dark border-t border-line">
          <div className="container py-16 md:py-20">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="eyebrow">Découvrez aussi</p>
                <h2 className="text-h1 mt-2 font-serif">D&apos;autres univers</h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((c, i) => (
                <Reveal key={c.slug} delay={i * 80}>
                  <Link
                    href={`/categorie/${c.slug}`}
                    className="group block bg-ivory-light border border-line hover:border-gold transition"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-ivory-dark">
                      <Image
                        src={c.fallbackImage}
                        alt={c.fallbackImageAlt}
                        fill
                        sizes="(min-width: 640px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[0.65rem] uppercase tracking-widest text-gold-dark">
                        {c.fromPriceLabel}
                      </p>
                      <h3 className="font-serif text-lg text-ink mt-1.5 group-hover:text-gold-dark transition">
                        {c.name}
                      </h3>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-20 text-center max-w-3xl mx-auto">
          <p className="eyebrow text-gold">Besoin d&apos;un conseil ?</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Visite gratuite, devis sous 24 h
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/70 leading-relaxed">
            Notre équipe vous aide à choisir le bon produit, à composer un poste
            de travail complet, ou à équiper plusieurs salariés à la fois.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Demander un devis
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <a href="tel:+33676617053" className="btn-outline-light">
              06 76 61 70 53
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
