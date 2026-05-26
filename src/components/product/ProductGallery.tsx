'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ZoomIn, X } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import 'yet-another-react-lightbox/plugins/counter.css'

export type GalleryImage = {
  src: string // URL haute résolution pour la lightbox
  thumbSrc: string // URL miniature
  mainSrc: string // URL pour l'affichage principal sur la page
  alt: string
}

interface ProductGalleryProps {
  productName: string
  images: GalleryImage[]
  discount?: number
}

export function ProductGallery({ productName, images, discount = 0 }: ProductGalleryProps) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const mainImage = images[0]
  const galleryImages = images.slice(1)

  if (!mainImage) {
    return (
      <div className="relative aspect-square bg-ivory-dark overflow-hidden flex items-center justify-center text-ink-mute/40 text-xs uppercase tracking-widest">
        Photo à venir
      </div>
    )
  }

  function openAt(i: number) {
    setIndex(i)
    setOpen(true)
  }

  return (
    <div>
      {/* Image principale */}
      <button
        type="button"
        onClick={() => openAt(0)}
        className="group relative aspect-square w-full bg-ivory-dark overflow-hidden block cursor-zoom-in"
        aria-label="Agrandir l'image"
      >
        <Image
          src={mainImage.mainSrc}
          alt={mainImage.alt || productName}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          priority
        />

        {/* Badge promo */}
        {discount > 0 && (
          <div className="absolute top-4 left-4 bg-ink text-ivory text-xs uppercase tracking-widest px-3 py-1.5">
            −{discount} %
          </div>
        )}

        {/* Badge "Cliquer pour zoomer" */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-ivory/95 backdrop-blur px-3 py-1.5 text-xs uppercase tracking-widest text-ink shadow-sm transition-transform duration-300 group-hover:scale-105">
          <ZoomIn className="h-3.5 w-3.5 text-gold-dark" strokeWidth={1.75} />
          Cliquer pour zoomer
        </div>
      </button>

      {/* Miniatures (autres photos) */}
      {galleryImages.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {galleryImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openAt(i + 1)}
              className="relative aspect-square bg-ivory-dark overflow-hidden border border-line hover:border-gold transition-colors cursor-zoom-in"
              aria-label={`Voir la photo ${i + 2}`}
            >
              <Image
                src={img.thumbSrc}
                alt={img.alt || `${productName} - vue ${i + 2}`}
                fill
                sizes="200px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox plein écran avec zoom & pan */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map((img) => ({
          src: img.src,
          alt: img.alt,
        }))}
        plugins={[Zoom, Thumbnails, Counter]}
        zoom={{
          maxZoomPixelRatio: 4,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
        thumbnails={{
          position: 'bottom',
          width: 80,
          height: 80,
          gap: 8,
          borderRadius: 0,
          padding: 0,
          imageFit: 'cover',
        }}
        counter={{ container: { style: { top: 0, left: 0 } } }}
        controller={{ closeOnBackdropClick: true }}
        carousel={{ finite: images.length <= 1 }}
        animation={{ swipe: 300 }}
        render={{
          iconClose: () => <X className="h-6 w-6" strokeWidth={1.5} />,
        }}
        styles={{
          container: { backgroundColor: 'rgba(26, 26, 26, 0.96)' },
          thumbnail: { backgroundColor: '#1A1A1A' },
        }}
      />
    </div>
  )
}
