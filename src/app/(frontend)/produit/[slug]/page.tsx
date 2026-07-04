import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { type PortableTextBlock } from 'next-sanity'
import { ChevronRight, Phone, Mail, Truck, ShieldCheck, FileBadge2 } from 'lucide-react'
import { getProductBySlug, getAllProductSlugs, getRelatedProducts, urlFor } from '@/lib/sanity'
import { formatPrice } from '@/lib/utils'
import { DeliveryChoice } from '@/components/product/DeliveryChoice'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductTabs } from '@/components/product/ProductTabs'
import { ProductFAQ } from '@/components/product/ProductFAQ'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { LEGAL } from '@/lib/legal'

export const revalidate = 60

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

type Params = { slug: string }

const CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  excellent: 'Excellent état',
  'very-good': 'Très bon état',
  good: 'Bon état',
  fair: 'État correct',
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Produit introuvable' }

  const firstImage = product.images?.[0]
  const effectivePrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price
  return {
    title:
      product.seo?.metaTitle || `${product.name} — ${formatPrice(effectivePrice)}`,
    description:
      product.seo?.metaDescription ||
      product.shortDescription ||
      `${product.name} reconditionné, préparé dans notre atelier local. Livraison Marseille, PACA, France.`,
    alternates: { canonical: `/produit/${slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: firstImage
        ? [{ url: urlFor(firstImage).width(1200).height(630).fit('crop').url() }]
        : undefined,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const category = product.category
  const conditionLabel = product.condition ? CONDITION_LABELS[product.condition] : null

  // Cross-sell : 4 pièces de la même catégorie (fallback : derniers publiés)
  const relatedProducts = await getRelatedProducts(
    product.slug.current,
    category?.slug?.current,
    4,
  )

  // Galerie avec 3 résolutions par image : main (1600), thumb (400), zoom (2400)
  const galleryItems = (product.images || []).map((img, i) => ({
    src: urlFor(img).width(2400).fit('max').url(),
    mainSrc: urlFor(img).width(1600).height(1600).fit('crop').url(),
    thumbSrc: urlFor(img).width(400).height(400).fit('crop').url(),
    alt: img.alt || `${product.name} - vue ${i + 1}`,
  }))

  // JSON-LD Product schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images?.map((i) => urlFor(i).width(1200).url()),
    sku: product.sku,
    brand: product.brand
      ? { '@type': 'Brand', name: product.brand }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/produit/${slug}`,
      priceCurrency: 'EUR',
      price: product.salePrice && product.salePrice < product.price ? product.salePrice : product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition:
        product.condition === 'new'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/RefurbishedCondition',
      seller: { '@type': 'Organization', name: 'Mobilier Malin' },
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Boutique', item: `${siteUrl}/boutique` },
      ...(category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: category.name,
              item: `${siteUrl}/categorie/${category.slug.current}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: category ? 4 : 3,
        name: product.name,
        item: `${siteUrl}/produit/${slug}`,
      },
    ],
  }

  const isInStock = product.stock > 0
  const hasSale = !!product.salePrice && product.salePrice < product.price
  const displayPrice = hasSale ? product.salePrice! : product.price
  const discountReference =
    product.comparePrice && product.comparePrice > displayPrice
      ? product.comparePrice
      : hasSale
        ? product.price
        : undefined
  const discount = discountReference
    ? Math.round((1 - displayPrice / discountReference) * 100)
    : 0
  const savings = hasSale ? product.price - product.salePrice! : 0

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productSchema, breadcrumbSchema]),
        }}
      />

      {/* Breadcrumb */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-4">
          <nav aria-label="Fil d'Ariane" className="text-xs text-ink-mute">
            <ol className="flex items-center gap-2 flex-wrap">
              <li>
                <Link href="/" className="hover:text-gold-dark">Accueil</Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li>
                <Link href="/boutique" className="hover:text-gold-dark">Boutique</Link>
              </li>
              {category && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <li>
                    <Link href={`/categorie/${category.slug.current}`} className="hover:text-gold-dark">
                      {category.name}
                    </Link>
                  </li>
                </>
              )}
              <ChevronRight className="h-3 w-3" />
              <li className="text-ink truncate max-w-[200px]">{product.name}</li>
            </ol>
          </nav>
        </div>
      </section>

      <section className="container py-10 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <ProductGallery
              productName={product.name}
              images={galleryItems}
              discount={discount}
            />
          </div>

          <div>
            {(product.brand || conditionLabel) && (
              <p className="eyebrow inline-flex items-center gap-2 flex-wrap">
                <span>{[product.brand, conditionLabel].filter(Boolean).join(' · ')}</span>
                {conditionLabel && (
                  <Link
                    href="/charte-qualite"
                    target="_blank"
                    rel="noopener"
                    className="text-[0.65rem] normal-case tracking-normal text-gold-dark hover:text-gold underline underline-offset-2"
                    title="Voir notre charte qualité"
                  >
                    Qu&apos;est-ce que ça veut dire ?
                  </Link>
                )}
              </p>
            )}
            <h1 className="text-display mt-3 font-serif leading-[1.05]">{product.name}</h1>

            <div className="mt-6">
              {hasSale ? (
                <div className="flex items-end gap-5 flex-wrap">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-widest text-promo font-medium mb-1">
                      Prix soldé
                    </p>
                    <span className="font-serif text-4xl md:text-5xl text-promo leading-none">
                      {formatPrice(displayPrice)}
                      <span className="ml-2 text-[0.4em] font-sans tracking-wider opacity-60 align-baseline uppercase">
                        TTC
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-widest text-ink-mute mb-1">
                      Prix de vente
                    </p>
                    <span className="text-lg text-ink-mute line-through leading-none block">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-widest text-ink-mute/70 mb-1">
                        Prix neuf
                      </p>
                      <span className="text-base text-ink-mute/70 line-through leading-none block">
                        {formatPrice(product.comparePrice)}
                      </span>
                    </div>
                  )}
                  <div className="bg-promo text-ivory text-[0.7rem] uppercase tracking-widest font-medium px-2.5 py-1">
                    Économie {formatPrice(savings)}
                  </div>
                </div>
              ) : product.comparePrice && product.comparePrice > product.price ? (
                <div className="flex items-end gap-5 flex-wrap">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-widest text-gold-dark font-medium mb-1">
                      Prix de vente
                    </p>
                    <span className="font-serif text-4xl md:text-5xl text-ink leading-none">
                      {formatPrice(product.price)}
                      <span className="ml-2 text-[0.4em] font-sans tracking-wider opacity-60 align-baseline uppercase">
                        TTC
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-widest text-ink-mute mb-1">
                      Prix neuf
                    </p>
                    <span className="text-lg text-ink-mute line-through leading-none block">
                      {formatPrice(product.comparePrice)}
                    </span>
                  </div>
                  <div className="bg-gold/10 text-gold-dark text-[0.7rem] uppercase tracking-widest font-medium px-2.5 py-1">
                    Économie {formatPrice(product.comparePrice - product.price)}
                  </div>
                </div>
              ) : (
                <span className="font-serif text-4xl md:text-5xl text-ink leading-none">
                  {formatPrice(product.price)}
                  <span className="ml-2 text-[0.4em] font-sans tracking-wider opacity-60 align-baseline uppercase">
                    TTC
                  </span>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-mute uppercase tracking-widest">
              {isInStock ? `${product.stock} en stock` : 'Sur commande'}
            </p>

            {product.shortDescription && (
              <p className="mt-6 text-ink-soft leading-relaxed">{product.shortDescription}</p>
            )}

            {isInStock ? (
              <>
                <div className="mt-8">
                  <AddToCartButton
                    product={{
                      id: product._id,
                      slug: product.slug.current,
                      name: product.name,
                      price: displayPrice,
                      imageUrl: galleryItems[0]?.thumbSrc,
                      imageAlt: product.name,
                      maxStock: product.stock,
                      brand: product.brand,
                      conditionLabel: conditionLabel || undefined,
                    }}
                  />
                </div>
                <DeliveryChoice
                  productId={product._id}
                  slug={product.slug.current}
                  name={product.name}
                  price={displayPrice}
                />
              </>
            ) : (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-gold">Demander la disponibilité</Link>
                <Link href="/contact" className="btn-outline">Poser une question</Link>
              </div>
            )}

            <div className="mt-4">
              <Link href="/contact" className="text-xs text-ink-mute hover:text-gold-dark underline underline-offset-2">
                Poser une question sur ce produit
              </Link>
            </div>

            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex items-start gap-3 text-ink-soft">
                <ShieldCheck className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                <span>Garantie <strong className="text-ink">6 mois</strong>, contrôle qualité 7 points</span>
              </li>
              <li className="flex items-start gap-3 text-ink-soft">
                <Truck className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                <span>Retrait gratuit au showroom ou livraison sur devis</span>
              </li>
              <li className="flex items-start gap-3 text-ink-soft">
                <FileBadge2 className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                <span>Attestation de valorisation RSE incluse</span>
              </li>
            </ul>

            <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center gap-6 text-sm text-ink-mute">
              <a href={`tel:${LEGAL.telephoneTel}`} className="inline-flex items-center gap-2 hover:text-gold-dark">
                <Phone className="h-4 w-4" /> {LEGAL.telephone}
              </a>
              <a href={`mailto:${LEGAL.email}`} className="inline-flex items-center gap-2 hover:text-gold-dark">
                <Mail className="h-4 w-4" /> {LEGAL.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      <ProductTabs
        description={
          Array.isArray(product.description)
            ? (product.description as PortableTextBlock[])
            : undefined
        }
        specs={{
          widthCm: product.widthCm,
          depthCm: product.depthCm,
          heightCm: product.heightCm,
          material: product.material,
          color: product.color,
          brand: product.brand,
          condition: product.condition,
          sku: product.sku,
        }}
        legal={{
          telephoneTel: LEGAL.telephoneTel,
          telephone: LEGAL.telephone,
          email: LEGAL.email,
        }}
      />

      <ProductFAQ
        productName={product.name}
        brand={product.brand}
        conditionLabel={conditionLabel}
        categoryName={category?.name}
        stock={product.stock}
      />

      <RelatedProducts
        products={relatedProducts}
        categoryName={category?.name}
        categorySlug={category?.slug?.current}
      />
    </>
  )
}
