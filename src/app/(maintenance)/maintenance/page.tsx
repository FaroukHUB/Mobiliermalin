import Link from 'next/link'

export default function MaintenancePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden bg-ivory">
      {/* Décor or discret */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(201,169,97,0.12) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(201,169,97,0.08) 0%, transparent 40%)',
        }}
      />

      <div className="relative max-w-2xl">
        <p className="eyebrow">Bientôt</p>

        <h1 className="font-serif font-semibold text-display-xl mt-8">
          Mobilier <span className="text-gold">Malin</span>
        </h1>

        <div className="gold-divider mt-10 mb-10" />

        <p className="text-lg text-ink-soft leading-relaxed">
          Notre nouveau site arrive très prochainement.
        </p>
        <p className="text-base text-ink-mute leading-relaxed mt-3">
          Le mobilier de bureau reconditionné premium, sélectionné avec exigence.
          <br />
          Économique, écologique, professionnel.
        </p>

        {/* Trois piliers */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[
            { num: '−70%', label: 'vs neuf' },
            { num: '12 mois', label: 'garantie' },
            { num: 'France', label: 'livraison' },
          ].map((item) => (
            <div key={item.label}>
              <p className="font-serif text-2xl text-gold font-semibold">
                {item.num}
              </p>
              <p className="text-[0.7rem] uppercase tracking-widest text-ink-mute mt-2">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <p className="mt-16 text-xs uppercase tracking-widest text-ink-mute">
          Une question ?{' '}
          <Link
            href="mailto:contact@mobiliermalin.com"
            className="text-ink underline underline-offset-4 hover:text-gold-dark"
          >
            contact@mobiliermalin.com
          </Link>
        </p>
      </div>

      <p className="absolute bottom-6 text-[0.7rem] uppercase tracking-widest text-ink-mute/70">
        © {new Date().getFullYear()} Mobilier Malin
      </p>
    </main>
  )
}
