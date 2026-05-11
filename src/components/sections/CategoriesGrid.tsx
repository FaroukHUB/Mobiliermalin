import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'

type Category = {
  slug: string
  label: string
  description: string
  href: string
  fromPrice: string
  fallbackImage: string
  fallbackAlt: string
}

const CATEGORIES: Category[] = [
  {
    slug: 'bureaux-individuels',
    label: 'Bureaux individuels',
    description: 'Bureaux droits et en L, mélaminé ou bois',
    href: '/categorie/bureaux-individuels',
    fromPrice: 'À partir de 72 €',
    fallbackImage:
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=80',
    fallbackAlt: 'Bureau individuel en bois clair',
  },
  {
    slug: 'fauteuils-ergonomiques',
    label: 'Fauteuils ergonomiques',
    description: 'Steelcase, Haworth, Herman Miller',
    href: '/categorie/fauteuils-ergonomiques',
    fromPrice: 'À partir de 24 €',
    fallbackImage:
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=900&q=80',
    fallbackAlt: 'Fauteuil ergonomique de bureau',
  },
  {
    slug: 'armoires-rangements',
    label: 'Armoires & rangements',
    description: 'Hautes, basses, métal ou bois',
    href: '/categorie/armoires-rangements',
    fromPrice: 'À partir de 96 €',
    fallbackImage:
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=900&q=80',
    fallbackAlt: 'Armoire de bureau métallique',
  },
  {
    slug: 'chaises-accueil-reunion',
    label: 'Chaises d\'accueil & réunion',
    description: 'Empilables ou avec roulettes',
    href: '/categorie/chaises-accueil-reunion',
    fromPrice: 'À partir de 36 €',
    fallbackImage:
      'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=900&q=80',
    fallbackAlt: 'Chaises de réunion design',
  },
  {
    slug: 'tables-de-reunion',
    label: 'Tables de réunion',
    description: 'Rondes, ovales, rectangulaires',
    href: '/categorie/tables-de-reunion',
    fromPrice: 'À partir de 108 €',
    fallbackImage:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
    fallbackAlt: 'Salle de réunion avec table',
  },
  {
    slug: 'espaces-detente',
    label: 'Espaces détente',
    description: 'Lounge, canapés, poufs design',
    href: '/categorie/espaces-detente',
    fromPrice: 'À partir de 60 €',
    fallbackImage:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=80',
    fallbackAlt: 'Espace détente avec fauteuils lounge',
  },
  {
    slug: 'caissons',
    label: 'Caissons de bureau',
    description: 'Mobiles ou fixes, avec serrure',
    href: '/categorie/caissons',
    fromPrice: 'À partir de 36 €',
    fallbackImage:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=80',
    fallbackAlt: 'Caisson de bureau à tiroirs',
  },
]

export function CategoriesGrid() {
  return (
    <section className="container py-20 md:py-28">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow">Catalogue</p>
          <h2 className="text-display mt-3 font-serif">
            Sept univers, une exigence
          </h2>
          <div className="gold-divider mt-6" />
          <p className="mt-6 text-ink-mute">
            Chaque pièce est inspectée, nettoyée et reconditionnée avant
            livraison. Marques premium, état contrôlé, garantie 6 mois.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {CATEGORIES.map((c, i) => {
          return (
            <Reveal key={c.href} delay={i * 60}>
              <Link
                href={c.href}
                className="group block bg-ivory-light border border-line hover:border-gold transition-colors duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-ivory-dark">
                  <Image
                    src={c.fallbackImage}
                    alt={c.fallbackAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-ivory/95 backdrop-blur px-2.5 py-1 text-[0.65rem] uppercase tracking-widest text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    Disponible
                  </div>
                  <div className="absolute bottom-3 right-3 h-10 w-10 bg-ivory translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-ink" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-[0.7rem] uppercase tracking-widest text-gold-dark font-medium">
                    {c.fromPrice}
                  </p>
                  <h3 className="font-serif text-lg md:text-xl text-ink mt-1.5 leading-tight">
                    {c.label}
                  </h3>
                  <p className="text-xs text-ink-mute mt-1.5 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </Link>
            </Reveal>
          )
        })}

        <Reveal delay={420}>
          <Link
            href="/boutique"
            className="group flex flex-col bg-ink text-ivory border border-ink hover:bg-gold-dark hover:border-gold-dark transition-colors duration-300 h-full"
          >
            <div className="aspect-square flex items-center justify-center">
              <ArrowRight
                className="h-10 w-10 text-gold group-hover:text-ivory group-hover:translate-x-1 transition"
                strokeWidth={1.25}
              />
            </div>
            <div className="p-5 mt-auto">
              <p className="text-[0.7rem] uppercase tracking-widest text-gold font-medium group-hover:text-ivory">
                Catalogue complet
              </p>
              <h3 className="font-serif text-lg md:text-xl mt-1.5 leading-tight text-ivory">
                Voir tous nos produits
              </h3>
              <p className="text-xs text-ivory/70 mt-1.5 leading-relaxed">
                Recherche, filtres, panier B2B
              </p>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
