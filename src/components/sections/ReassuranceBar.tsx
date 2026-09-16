import { Wrench, Truck, Recycle, Award } from 'lucide-react'

const ITEMS = [
  {
    icon: Wrench,
    title: 'Atelier local',
    sub: 'La Penne-sur-Huveaune',
  },
  {
    icon: Truck,
    title: 'Livraison',
    sub: 'Marseille, PACA, France',
  },
  {
    icon: Recycle,
    title: 'Économie circulaire',
    sub: '−60% vs neuf',
  },
  {
    icon: Award,
    title: 'Marques premium',
    sub: 'Steelcase, Haworth, Vitra',
  },
]

function Item({
  icon: Icon,
  title,
  sub,
  className = '',
}: {
  icon: typeof Wrench
  title: string
  sub: string
  className?: string
}) {
  return (
    <div className={`flex items-start md:items-center gap-3 md:gap-4 ${className}`}>
      <Icon className="h-6 w-6 text-gold shrink-0" strokeWidth={1.5} />
      <div>
        <p className="font-serif text-base text-ink leading-tight">{title}</p>
        <p className="text-[0.7rem] uppercase tracking-widest text-ink-mute mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

/**
 * Barre de rassurance sous le hero.
 *
 * Sur mobile, les quatre repères défilent en continu, chacun sur ses
 * deux lignes : même mécanique que le bandeau du haut (séquence
 * doublée, translation de moitié, boucle sans saut), pause au toucher,
 * défilement manuel si l'utilisateur a désactivé les animations.
 * À partir de la tablette, la grille reste telle qu'elle était.
 */
export function ReassuranceBar() {
  return (
    <section className="border-y border-line bg-ivory-dark">
      {/* Mobile : piste défilante */}
      <div className="ticker-bar md:hidden overflow-hidden py-6">
        <div
          className="ticker-track flex w-max"
          style={{ animationDuration: '22s' }}
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0"
              aria-hidden={copy === 1 ? true : undefined}
            >
              {ITEMS.map((item) => (
                <Item
                  key={`${copy}-${item.title}`}
                  {...item}
                  className="shrink-0 whitespace-nowrap pl-6 pr-10"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tablette et PC : grille, inchangée */}
      <div className="container hidden md:grid py-8 md:grid-cols-4 gap-6">
        {ITEMS.map((item) => (
          <Item key={item.title} {...item} />
        ))}
      </div>
    </section>
  )
}
