import { ShieldCheck, Truck, Recycle, Award } from 'lucide-react'

const ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Garantie 6 mois',
    sub: 'Sur tout le mobilier',
  },
  {
    icon: Truck,
    title: 'Livraison incluse',
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

export function ReassuranceBar() {
  return (
    <section className="border-y border-line bg-ivory-dark">
      <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {ITEMS.map(({ icon: Icon, title, sub }) => (
          <div
            key={title}
            className="flex items-start md:items-center gap-3 md:gap-4"
          >
            <Icon className="h-6 w-6 text-gold shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-serif text-base text-ink leading-tight">{title}</p>
              <p className="text-[0.7rem] uppercase tracking-widest text-ink-mute mt-0.5">
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
