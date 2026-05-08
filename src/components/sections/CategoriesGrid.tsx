import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const CATEGORIES = [
  {
    label: 'Bureaux individuels',
    description: 'Bureaux droits et en L, mélaminé ou bois',
    href: '/categorie/bureaux-individuels',
    accent: 'À partir de 72 €',
  },
  {
    label: 'Fauteuils ergonomiques',
    description: 'Steelcase, Haworth, Herman Miller',
    href: '/categorie/fauteuils-ergonomiques',
    accent: 'À partir de 24 €',
  },
  {
    label: 'Armoires & rangements',
    description: 'Armoires hautes, basses, métal ou bois',
    href: '/categorie/armoires-rangements',
    accent: 'À partir de 96 €',
  },
  {
    label: 'Chaises d\'accueil & réunion',
    description: 'Empilables ou avec roulettes',
    href: '/categorie/chaises-accueil-reunion',
    accent: 'À partir de 36 €',
  },
  {
    label: 'Tables de réunion',
    description: 'Rondes, ovales, rectangulaires',
    href: '/categorie/tables-de-reunion',
    accent: 'À partir de 108 €',
  },
  {
    label: 'Espaces détente',
    description: 'Lounge, canapés, poufs design',
    href: '/categorie/espaces-detente',
    accent: 'À partir de 60 €',
  },
  {
    label: 'Caissons de bureau',
    description: 'Mobiles ou fixes, avec serrure',
    href: '/categorie/caissons',
    accent: 'À partir de 36 €',
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
            className={`group relative bg-ivory-light border border-line p-7 md:p-8 hover:border-gold hover:shadow-soft transition-all duration-300 flex flex-col justify-between min-h-[200px] ${
              i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div>
              <p className="text-[0.7rem] uppercase tracking-widest text-gold-dark font-medium">
                {c.accent}
              </p>
              <h3 className="font-serif text-2xl text-ink mt-2 group-hover:text-gold-dark transition">
                {c.label}
              </h3>
              <p className="text-sm text-ink-mute mt-2 leading-relaxed">
                {c.description}
              </p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="text-xs uppercase tracking-widest text-ink">
                Découvrir
              </span>
              <ArrowUpRight
                className="h-5 w-5 text-ink-mute group-hover:text-gold-dark group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
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
