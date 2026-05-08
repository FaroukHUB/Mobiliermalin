import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

type Category = {
  label: string
  description: string
  href: string
  fromPrice: string
  image: string
  imageAlt: string
}

// Placeholders Unsplash en attendant que le client uploade ses vraies photos
// dans l'admin Payload. Les vraies photos remplaceront automatiquement.
const CATEGORIES: Category[] = [
  {
    label: 'Bureaux individuels',
    description: 'Bureaux droits et en L, mélaminé ou bois.',
    href: '/categorie/bureaux-individuels',
    fromPrice: 'À partir de 72 €',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=80',
    imageAlt: 'Bureau individuel en bois clair dans un espace de travail moderne',
  },
  {
    label: 'Fauteuils ergonomiques',
    description: 'Steelcase, Haworth, Herman Miller reconditionnés.',
    href: '/categorie/fauteuils-ergonomiques',
    fromPrice: 'À partir de 24 €',
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=900&q=80',
    imageAlt: 'Fauteuil ergonomique de bureau noir',
  },
  {
    label: 'Armoires & rangements',
    description: 'Armoires hautes, basses, métal ou bois.',
    href: '/categorie/armoires-rangements',
    fromPrice: 'À partir de 96 €',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=900&q=80',
    imageAlt: 'Armoire de bureau métallique',
  },
  {
    label: 'Chaises d\'accueil & réunion',
    description: 'Empilables ou avec roulettes.',
    href: '/categorie/chaises-accueil-reunion',
    fromPrice: 'À partir de 36 €',
    image: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=900&q=80',
    imageAlt: 'Chaises de réunion design alignées',
  },
  {
    label: 'Tables de réunion',
    description: 'Rondes, ovales, rectangulaires.',
    href: '/categorie/tables-de-reunion',
    fromPrice: 'À partir de 108 €',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
    imageAlt: 'Salle de réunion avec table en bois',
  },
  {
    label: 'Espaces détente',
    description: 'Lounge, canapés, poufs design.',
    href: '/categorie/espaces-detente',
    fromPrice: 'À partir de 60 €',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80',
    imageAlt: 'Espace détente avec fauteuils lounge',
  },
  {
    label: 'Caissons de bureau',
    description: 'Mobiles ou fixes, avec serrure.',
    href: '/categorie/caissons',
    fromPrice: 'À partir de 36 €',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=80',
    imageAlt: 'Caisson de bureau à tiroirs',
  },
]

export function CategoriesGrid() {
  return (
    <section className="container py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="eyebrow">Catalogue</p>
        <h2 className="text-display mt-3 font-serif">
          Trouvez ce qu&apos;il vous faut
        </h2>
        <div className="gold-divider mt-6" />
        <p className="mt-6 text-ink-mute">
          Sept univers, des centaines de références. Toutes nos pièces sont
          inspectées, nettoyées et reconditionnées avant livraison.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.href}
            href={c.href}
            className={`group relative bg-ivory-light border border-line overflow-hidden hover:shadow-soft transition-all duration-300 ${
              i === 0 ? 'sm:col-span-2 lg:row-span-2' : ''
            }`}
          >
            <div className={`relative w-full overflow-hidden bg-ivory-dark ${i === 0 ? 'aspect-[16/10] lg:aspect-[4/5]' : 'aspect-[4/3]'}`}>
              <Image
                src={c.image}
                alt={c.imageAlt}
                fill
                sizes={i === 0 ? '(min-width: 1024px) 33vw, (min-width: 640px) 100vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition" />
              <div className="absolute top-4 left-4">
                <span className="inline-block bg-ivory/90 backdrop-blur text-[0.65rem] uppercase tracking-widest text-gold-dark font-medium px-3 py-1.5">
                  {c.fromPrice}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-7 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl md:text-2xl text-ink group-hover:text-gold-dark transition leading-tight">
                  {c.label}
                </h3>
                <p className="text-sm text-ink-mute mt-2 leading-relaxed">
                  {c.description}
                </p>
              </div>
              <ArrowUpRight
                className="h-5 w-5 text-ink-mute group-hover:text-gold-dark group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0 mt-1"
                strokeWidth={1.5}
              />
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/boutique" className="btn-outline">
          Voir tout le catalogue
        </Link>
      </div>
    </section>
  )
}
