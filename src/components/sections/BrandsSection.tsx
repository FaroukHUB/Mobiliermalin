import { Reveal } from '@/components/animations/Reveal'

const BRANDS = [
  { name: 'Steelcase', style: 'font-sans font-bold uppercase tracking-tight text-2xl' },
  { name: 'Herman Miller', style: 'font-serif italic text-2xl' },
  { name: 'Haworth', style: 'font-sans font-light uppercase tracking-[0.25em] text-xl' },
  { name: 'Vitra', style: 'font-sans font-black uppercase tracking-tight text-2xl' },
  { name: 'USM Haller', style: 'font-mono uppercase text-xl tracking-wider' },
  { name: 'Majencia', style: 'font-serif text-2xl' },
  // Nouvelles signatures — griffes italiennes, suisses, espagnoles
  { name: 'ICF', style: 'font-serif font-medium tracking-[0.3em] text-2xl' },
  { name: 'Zuco', style: 'font-mono uppercase text-xl tracking-widest' },
  { name: 'Actiu', style: 'font-sans font-black uppercase text-2xl tracking-tight' },
  { name: 'Urban Mesh', style: 'font-sans font-light uppercase tracking-[0.2em] text-xl' },
]

export function BrandsSection() {
  return (
    <section className="bg-ivory-dark border-y border-line">
      <div className="container py-14 md:py-20">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="eyebrow">Marques distribuées</p>
            <h2 className="font-serif text-h2 mt-3 text-ink">
              Les signatures du mobilier de bureau premium
            </h2>
            <p className="mt-4 text-sm text-ink-mute leading-relaxed">
              Reconditionné dans notre atelier de La Penne-sur-Huveaune,
              vendu jusqu&apos;à −60 % du prix neuf.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-px bg-line border border-line">
            {BRANDS.map((b) => (
              <div
                key={b.name}
                className="bg-ivory-light min-h-[110px] flex items-center justify-center px-4 py-6 text-ink hover:text-gold-dark transition-colors duration-300"
              >
                <span className={b.style}>{b.name}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={300}>
          <p className="mt-8 text-center text-xs uppercase tracking-widest text-ink-mute">
            …et d&apos;autres signatures à découvrir au showroom de
            La Penne-sur-Huveaune.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
