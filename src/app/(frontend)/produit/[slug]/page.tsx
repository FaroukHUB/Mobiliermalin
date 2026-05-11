import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Phone, Mail, Truck, ShieldCheck, FileBadge2 } from 'lucide-react'
import { getProductBySlug, getAllProductSlugs } from '@/lib/airtable'
import { getCategoryBySlug } from '@/lib/categories-data'
import { formatPrice } from '@/lib/utils'
import { BuyButton } from '@/components/product/BuyButton'

export const revalidate = 60

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

type Params = { slug: string }

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

  return {
    title: `${product.name} — ${formatPrice(product.price)}`,
    description:
      product.shortDescription ||
      `${product.name} reconditionné, garanti 6 mois. Livraison Marseille, PACA, France.`,
    alternates: { canonical: `/produit/${slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
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

  const category = product.category ? getCategoryBySlug(product.category) : null
  const mainImage = product.images[0]
  const galleryImages = product.images.slice(1)

  // JSON-LD Product schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images.map((i) => i.url),
    sku: product.sku,
    brand: product.brand
      ? { '@type': 'Brand', name: product.brand }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/produit/${slug}`,
      priceCurrency: 'EUR',
      price: product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition:
        product.condition === 'Neuf'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/RefurbishedCondition',
      seller: {
        '@type': 'Organization',
        name: 'Mobilier Malin',
      },
    },
  }

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
      ...(category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: category.name,
              item: `${siteUrl}/categorie/${category.slug}`,
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
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0

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
              {category && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <li>
                    <Link
                      href={`/categorie/${category.slug}`}
                      className="hover:text-gold-dark"
                    >
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

      {/* Produit */}
      <section className="container py-10 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Galerie */}
          <div>
            <div className="relative aspect-square bg-ivory-dark overflow-hidden">
              {mainImage ? (
                <Image
                  src={mainImage.url}
                  alt={mainImage.alt || product.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-ink-mute/40 text-xs uppercase tracking-widest">
                  Photo à venir
                </div>
              )}

              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-ink text-ivory text-xs uppercase tracking-widest px-3 py-1.5">
                  −{discount} %
                </div>
              )}
            </div>

            {galleryImages.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {galleryImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square bg-ivory-dark overflow-hidden border border-line"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `${product.name} - vue ${i + 2}`}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div>
            {(product.brand || product.condition) && (
              <p className="eyebrow">
                {[product.brand, product.condition].filter(Boolean).join(' · ')}
              </p>
            )}
            <h1 className="text-display mt-3 font-serif leading-[1.05]">
              {product.name}
            </h1>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-serif text-4xl md:text-5xl text-ink">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice &&
                product.comparePrice > product.price && (
                  <span className="text-lg text-ink-mute line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
            </div>
            <p className="mt-1 text-xs text-ink-mute uppercase tracking-widest">
              {isInStock ? `${product.stock} en stock` : 'Sur commande'}
            </p>

            {product.shortDescription && (
              <p className="mt-6 text-ink-soft leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {isInStock ? (
                <BuyButton
                  productId={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                />
              ) : (
                <Link href="/contact" className="btn-gold">
                  Demander la disponibilité
                </Link>
              )}
              <Link href="/contact" className="btn-outline">
                Poser une question
              </Link>
            </div>

            {/* Reassurance */}
            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex items-start gap-3 text-ink-soft">
                <ShieldCheck className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                <span>Garantie <strong className="text-ink">6 mois</strong>, contrôle qualité 7 points</span>
              </li>
              <li className="flex items-start gap-3 text-ink-soft">
                <Truck className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                <span>Livraison France entière, montage inclus dès 3 postes</span>
              </li>
              <li className="flex items-start gap-3 text-ink-soft">
                <FileBadge2 className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={1.5} />
                <span>Attestation de valorisation RSE incluse</span>
              </li>
            </ul>

            {/* Dimensions */}
            {(product.widthCm || product.depthCm || product.heightCm) && (
              <div className="mt-8 pt-6 border-t border-line">
                <p className="eyebrow mb-3">Dimensions</p>
                <div className="grid grid-cols-3 gap-4">
                  {product.widthCm && (
                    <div>
                      <p className="text-xs text-ink-mute uppercase tracking-widest">Largeur</p>
                      <p className="font-serif text-lg mt-1 text-ink">{product.widthCm} cm</p>
                    </div>
                  )}
                  {product.depthCm && (
                    <div>
                      <p className="text-xs text-ink-mute uppercase tracking-widest">Profondeur</p>
                      <p className="font-serif text-lg mt-1 text-ink">{product.depthCm} cm</p>
                    </div>
                  )}
                  {product.heightCm && (
                    <div>
                      <p className="text-xs text-ink-mute uppercase tracking-widest">Hauteur</p>
                      <p className="font-serif text-lg mt-1 text-ink">{product.heightCm} cm</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Material + Color */}
            {(product.material || product.color) && (
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                {product.material && (
                  <div>
                    <p className="text-xs text-ink-mute uppercase tracking-widest">Matière</p>
                    <p className="text-ink mt-1">{product.material}</p>
                  </div>
                )}
                {product.color && (
                  <div>
                    <p className="text-xs text-ink-mute uppercase tracking-widest">Couleur</p>
                    <p className="text-ink mt-1">{product.color}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center gap-6 text-sm text-ink-mute">
              <a href="tel:+33676617053" className="inline-flex items-center gap-2 hover:text-gold-dark">
                <Phone className="h-4 w-4" /> 06 76 61 70 53
              </a>
              <a href="mailto:mobiliermalin@gmail.com" className="inline-flex items-center gap-2 hover:text-gold-dark">
                <Mail className="h-4 w-4" /> mobiliermalin@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Description longue */}
      {product.description && (
        <section className="bg-ivory-dark border-y border-line">
          <div className="container py-12 md:py-16 max-w-3xl">
            <p className="eyebrow">Description détaillée</p>
            <div className="mt-4 text-ink-soft leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        </section>
      )}

      {/* Lien retour catégorie */}
      {category && (
        <section className="container py-10 text-center">
          <Link
            href={`/categorie/${category.slug}`}
            className="text-sm text-ink-mute hover:text-gold-dark"
          >
            ← Voir d&apos;autres {category.name.toLowerCase()}
          </Link>
        </section>
      )}
    </>
  )
}
