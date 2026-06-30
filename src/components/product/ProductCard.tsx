import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export type ProductCardData = {
  id: string | number
  slug?: string
  title: string
  shortDescription?: string
  price: number
  salePrice?: number
  comparePrice?: number
  condition?: string
  brandName?: string
  imageUrl?: string
  imageAlt?: string
  status?: string
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'Neuf',
  excellent: 'Excellent état',
  'very-good': 'Très bon état',
  good: 'Bon état',
  fair: 'État correct',
}

const STATUS_LABELS: Record<string, string> = {
  published: 'Disponible',
  sold: 'Vendu',
  draft: 'Brouillon',
  archived: 'Archivé',
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const href = product.slug ? `/produit/${product.slug}` : '#'
  const conditionLabel = product.condition ? CONDITION_LABELS[product.condition] : null
  const statusLabel = product.status ? STATUS_LABELS[product.status] : 'Disponible'
  const isAvailable = product.status === 'published' || !product.status

  const hasSale = !!product.salePrice && product.salePrice < product.price
  const displayPrice = hasSale ? product.salePrice! : product.price
  const discountReference = product.comparePrice && product.comparePrice > displayPrice
    ? product.comparePrice
    : (hasSale ? product.price : undefined)
  const discountPercent = discountReference
    ? Math.round((1 - displayPrice / discountReference) * 100)
    : 0

  return (
    <Link
      href={href}
      className="group block bg-ivory-light border border-line hover:border-gold hover:shadow-soft transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-ivory-dark">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt || product.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-mute/40 text-xs uppercase tracking-widest">
            Photo à venir
          </div>
        )}

        {/* Badge statut — discret, sans fond opaque */}
        <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-widest text-ink font-medium">
          <span className="bg-ivory/90 backdrop-blur-sm px-2 py-1 inline-flex items-center gap-1.5">
            <span
              className={`h-1.5 w-1.5 rounded-full ${isAvailable ? 'bg-gold' : 'bg-ink-mute'}`}
            />
            {statusLabel}
          </span>
        </div>

        {discountPercent > 0 && (
          <div className="absolute top-3.5 right-3.5 bg-promo text-ivory text-[0.65rem] uppercase tracking-widest px-2.5 py-1 font-medium">
            −{discountPercent} %
          </div>
        )}

        <div className="absolute bottom-3.5 right-3.5 h-11 w-11 bg-ivory translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-soft">
          <ArrowUpRight className="h-4 w-4 text-ink" strokeWidth={1.5} />
        </div>
      </div>

      <div className="p-6 md:p-7">
        {(product.brandName || conditionLabel) && (
          <p className="text-[0.65rem] uppercase tracking-widest text-gold-dark font-medium">
            {[product.brandName, conditionLabel].filter(Boolean).join(' · ')}
          </p>
        )}
        <h3 className="font-serif text-xl md:text-[1.35rem] text-ink mt-2 leading-snug line-clamp-2">
          {product.title}
        </h3>
        {product.shortDescription && (
          <p className="text-sm text-ink-mute mt-2 leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        )}
        <div className="mt-5 pt-5 border-t border-line/60 flex items-baseline gap-2.5 flex-wrap">
          <span
            className={`font-serif text-2xl md:text-[1.6rem] ${hasSale ? 'text-promo' : 'text-ink'}`}
          >
            {formatPrice(displayPrice)}
          </span>
          {hasSale && (
            <span className="text-sm text-ink-mute line-through">
              {formatPrice(product.price)}
            </span>
          )}
          {product.comparePrice && product.comparePrice > displayPrice && (
            <span className="text-xs text-ink-mute/70 line-through">
              {formatPrice(product.comparePrice)} neuf
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
