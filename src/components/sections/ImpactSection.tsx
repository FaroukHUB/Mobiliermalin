import Link from 'next/link'
import { Reveal } from '@/components/animations/Reveal'
import { Counter } from '@/components/animations/Counter'

/**
 * Section "Notre engagement" — traitement vert seconde vie.
 *
 * Les textes et les quatre chiffres sont ceux d'origine, inchangés.
 * Ce qui change, c'est l'habillage : fond vert lumineux en dégradé,
 * texte blanc, et un emblème planète entourée d'un cycle de réemploi.
 *
 * Le voile posé côté texte garde le blanc au-dessus de 5:1 de
 * contraste malgré l'éclaircissement du vert.
 */

const LEAF = '#45996B'
const LEAF_BRIGHT = '#6FBE8C'
const LEAF_SHADE = '#2C7050'

function PlanetEmblem() {
  return (
    <svg
      viewBox="0 0 260 260"
      className="pointer-events-none absolute top-1/2 right-[-60px] z-0 w-[460px] max-w-[46vw] -translate-y-1/2 opacity-90 max-lg:right-[-110px] max-lg:w-[380px] max-lg:opacity-50 max-sm:right-[-140px] max-sm:w-[320px] max-sm:opacity-30"
      role="img"
      aria-label="Planète entourée d'un cycle de réemploi"
    >
      {/* Cycle : trois flèches qui tournent autour de la planète */}
      <g
        className="planet-cycle"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.62"
        strokeWidth="4"
        strokeLinecap="round"
      >
        <path d="M130 22 A108 108 0 0 1 223.5 76" />
        <path d="M223.5 184 A108 108 0 0 1 130 238" />
        <path d="M36.5 184 A108 108 0 0 1 36.5 76" />
        <g fill="#FFFFFF" fillOpacity="0.62" stroke="none">
          <path d="M223.5 76 l-13 -12 l19 -3 z" />
          <path d="M130 238 l-4 -18 l17 10 z" />
          <path d="M36.5 76 l17 -6 l-4 19 z" />
        </g>
      </g>

      <circle cx="130" cy="130" r="88" fill="#FFFFFF" fillOpacity="0.07" />
      <circle
        cx="130"
        cy="130"
        r="76"
        fill="#FFFFFF"
        fillOpacity="0.16"
        stroke="#FFFFFF"
        strokeOpacity="0.45"
        strokeWidth="2"
      />

      {/* Méridiens et parallèles */}
      <g fill="none" stroke="#FFFFFF" strokeOpacity="0.34" strokeWidth="1.6">
        <ellipse cx="130" cy="130" rx="30" ry="76" />
        <ellipse cx="130" cy="130" rx="58" ry="76" />
        <line x1="54" y1="130" x2="206" y2="130" />
        <path d="M64 92 H196" />
        <path d="M64 168 H196" />
      </g>

      {/* Continents suggérés */}
      <g fill="#FFFFFF" fillOpacity="0.42">
        <path d="M96 104 q16 -12 32 -4 q10 5 4 15 q-9 14 -26 11 q-14 -3 -10 -22 z" />
        <path d="M142 138 q22 -6 34 8 q7 9 -3 17 q-16 13 -32 2 q-11 -8 1 -27 z" />
        <path d="M92 152 q14 -3 18 8 q4 12 -8 17 q-13 5 -17 -7 q-3 -12 7 -18 z" />
      </g>

      {/* Feuille : la seconde vie */}
      <g transform="translate(130 34)">
        <path
          d="M0 22 C0 8 12 -4 30 -8 C28 12 16 24 0 22 Z"
          fill="#FFFFFF"
          fillOpacity="0.85"
        />
        <path
          d="M0 22 C6 14 16 6 28 -6"
          fill="none"
          stroke={LEAF}
          strokeOpacity="0.55"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

const STATS = [
  { value: 840, suffix: ' t', label: 'CO₂ évités en 2023' },
  { value: 12000, suffix: '', label: 'Pièces remises en circulation' },
  { value: 500, prefix: '+', suffix: '', label: 'Entreprises accompagnées' },
  { value: 60, prefix: '−', suffix: ' %', label: 'Économies vs neuf' },
]

export function ImpactSection() {
  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background: `radial-gradient(880px 620px at 82% 14%, ${LEAF_BRIGHT} 0%, transparent 62%), linear-gradient(132deg, #55A87A 0%, ${LEAF} 48%, ${LEAF_SHADE} 100%)`,
      }}
    >
      {/* Voile côté texte : garantit la lisibilité du blanc */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(103deg, rgba(18,58,40,0.34) 0%, rgba(18,58,40,0.12) 42%, transparent 66%)',
        }}
        aria-hidden="true"
      />
      <PlanetEmblem />

      <div className="container relative z-10 grid items-center gap-14 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="mb-4 inline-flex items-center gap-2 border border-white/35 bg-white/15 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            >
              <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
              <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
            </svg>
            Seconde vie
          </span>
          <p className="eyebrow text-white/90">Notre engagement</p>
          <h2 className="text-display mt-3 font-serif leading-[1.1] text-white">
            Chaque meuble sauvé est une victoire pour la planète
          </h2>
          <div className="mt-6 h-px w-12 bg-white/75" />
          <p className="mt-6 leading-relaxed text-white/95">
            Le meilleur déchet est celui qu&apos;on ne produit pas. Depuis
            2021, Mobilier Malin œuvre pour donner une seconde vie au mobilier
            de bureau d&apos;entreprises en transformation : déménagements,
            renouvellements de parc, fermetures.
          </p>
          <p className="mt-4 leading-relaxed text-white/95">
            Nous formalisons cet engagement avec des attestations de
            valorisation RSE pour nos partenaires et des dons réguliers à des
            associations locales.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/notre-demarche"
              className="btn inline-flex items-center bg-white"
              style={{ color: LEAF_SHADE }}
            >
              Notre démarche
            </Link>
            <Link
              href="/vidage-de-locaux"
              className="btn inline-flex items-center border border-white/55 text-white transition-colors hover:bg-white/10"
            >
              Vidage de locaux
            </Link>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="grid grid-cols-2 gap-px border border-white/30 bg-white/30">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex min-h-[170px] flex-col justify-center p-8 md:p-9"
                style={{ background: 'rgba(22,66,46,0.30)' }}
              >
                <p className="font-serif text-4xl leading-none text-white md:text-5xl">
                  <Counter end={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="mt-3 text-xs uppercase leading-relaxed tracking-widest text-white/80">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
