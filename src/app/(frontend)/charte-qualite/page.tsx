import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import {
  getQualityGuide,
  urlFor,
  type SanityQualityCondition,
} from '@/lib/sanity'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Charte qualité — Notre méthode de reconditionnement',
  description:
    'Découvrez les 5 niveaux d\'état que nous attribuons à notre mobilier de bureau reconditionné, notre processus en 7 étapes, et le détail de notre garantie 6 mois.',
  alternates: { canonical: '/charte-qualite' },
}

// Defaults pour fallback si le doc Sanity n'existe pas encore (avant publication)
const DEFAULT_HERO = {
  eyebrow: 'Notre exigence',
  title: '5 niveaux d\'état, 1 standard de qualité',
  subtitle:
    'Chaque pièce qui sort de notre atelier de La Penne-sur-Huveaune a été inspectée, nettoyée, testée. Voici comment nous classons leur état — en toute transparence.',
}

const DEFAULT_INTRO =
  'Acheter du mobilier d\'occasion en ligne, c\'est faire confiance à une grille de notation qu\'on ne voit pas. Chez Mobilier Malin, on a tranché : 5 niveaux d\'état, des critères objectifs, et la même garantie pour tous. Pas de jargon, pas de fausses promesses. Vous savez exactement ce que vous recevrez avant de cliquer sur "Acheter".'

const CONDITION_FALLBACK_COLORS: Record<string, string> = {
  new: 'border-gold bg-gold/5',
  excellent: 'border-gold/70 bg-gold/[0.03]',
  'very-good': 'border-line bg-ivory-light',
  good: 'border-line bg-ivory-light',
  fair: 'border-line bg-ivory-light',
}

export default async function QualityGuidePage() {
  const guide = await getQualityGuide()

  const heroEyebrow = guide.heroEyebrow || DEFAULT_HERO.eyebrow
  const heroTitle = guide.heroTitle || DEFAULT_HERO.title
  const heroSubtitle = guide.heroSubtitle || DEFAULT_HERO.subtitle
  const heroImageUrl = guide.heroImage
    ? urlFor(guide.heroImage).width(1600).url()
    : undefined
  const intro = guide.introText || DEFAULT_INTRO
  const conditions = guide.conditions || []
  const processSteps = guide.processSteps || []
  const warrantyTitle = guide.warrantyTitle || 'La garantie 6 mois — ce qu\'elle couvre'
  const warrantyIntro = guide.warrantyIntro || ''
  const warrantyCovered = guide.warrantyCovered || []
  const warrantyNotCovered = guide.warrantyNotCovered || []
  const faq = guide.faq || []

  // JSON-LD FAQ pour le SEO et la GEO
  const faqSchema =
    faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        }
      : null

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* HERO */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-12 md:py-20">
          <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16 items-center">
            <div>
              <p className="eyebrow">{heroEyebrow}</p>
              <h1 className="text-display-xl mt-4 font-serif leading-[1.05]">
                {heroTitle}
              </h1>
              <div className="gold-divider mx-0 mt-8" />
              <p className="mt-8 text-lg text-ink-soft leading-relaxed max-w-2xl">
                {heroSubtitle}
              </p>
            </div>
            <Reveal delay={150}>
              <div className="relative aspect-[4/5] bg-ivory-light overflow-hidden hidden lg:block">
                {heroImageUrl ? (
                  <Image
                    src={heroImageUrl}
                    alt="Notre exigence qualité"
                    fill
                    sizes="400px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-ink-mute/40 text-xs uppercase tracking-widest">
                    Photo à venir
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="container py-16 md:py-20 max-w-3xl">
        <Reveal>
          <p className="text-lg text-ink-soft leading-relaxed whitespace-pre-line">
            {intro}
          </p>
        </Reveal>
      </section>

      {/* LES 5 ÉTATS */}
      <section className="bg-ivory-light border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="eyebrow">Les 5 niveaux</p>
              <h2 className="text-display mt-3 font-serif">
                De « Neuf » à « État correct »
              </h2>
              <div className="gold-divider mt-6" />
            </div>
          </Reveal>

          <div className="space-y-12 md:space-y-20 max-w-5xl mx-auto">
            {conditions.length > 0 ? (
              conditions.map((c, i) => (
                <ConditionBlock key={c._key || c.code} condition={c} index={i} />
              ))
            ) : (
              <Reveal>
                <div className="bg-ivory border border-line p-10 text-center">
                  <p className="text-ink-mute">
                    La charte qualité n&apos;a pas encore été publiée. Rendez-vous bientôt.
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* PROCESSUS */}
      {processSteps.length > 0 && (
        <section className="container py-16 md:py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="eyebrow">Atelier de La Penne-sur-Huveaune</p>
              <h2 className="text-display mt-3 font-serif">
                Notre processus en {processSteps.length} étapes
              </h2>
              <div className="gold-divider mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line max-w-5xl mx-auto">
            {processSteps.map((step, i) => (
              <Reveal key={step._key || i} delay={i * 60}>
                <div className="bg-ivory-light p-7 md:p-9 h-full">
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-3xl text-gold-dark">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-lg text-ink leading-tight">
                      {step.title}
                    </h3>
                  </div>
                  {step.description && (
                    <p className="text-sm text-ink-soft mt-4 leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* GARANTIE */}
      {(warrantyCovered.length > 0 || warrantyNotCovered.length > 0) && (
        <section className="bg-ink text-ivory">
          <div className="container py-16 md:py-24">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto mb-14">
                <ShieldCheck className="h-10 w-10 text-gold mx-auto" strokeWidth={1.25} />
                <p className="eyebrow text-gold mt-4">Garantie</p>
                <h2 className="text-display mt-3 font-serif text-ivory">
                  {warrantyTitle}
                </h2>
                {warrantyIntro && (
                  <p className="mt-6 text-ivory/70 leading-relaxed">
                    {warrantyIntro}
                  </p>
                )}
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              {warrantyCovered.length > 0 && (
                <Reveal>
                  <div className="border border-gold/30 bg-gold/5 p-6 md:p-8">
                    <p className="eyebrow text-gold mb-4">Ce qui est couvert</p>
                    <ul className="space-y-3">
                      {warrantyCovered.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-ivory/90 leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}

              {warrantyNotCovered.length > 0 && (
                <Reveal delay={100}>
                  <div className="border border-ivory/15 bg-ivory/[0.03] p-6 md:p-8">
                    <p className="eyebrow text-ivory/60 mb-4">Ce qui n&apos;est pas couvert</p>
                    <ul className="space-y-3">
                      {warrantyNotCovered.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-ivory/70 leading-relaxed">
                          <XCircle className="h-4 w-4 text-ivory/50 mt-0.5 shrink-0" strokeWidth={1.5} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="container py-16 md:py-24 max-w-3xl">
          <Reveal>
            <div className="text-center mb-12">
              <p className="eyebrow">Questions fréquentes</p>
              <h2 className="text-display mt-3 font-serif">À propos de notre charte</h2>
              <div className="gold-divider mt-6" />
            </div>
          </Reveal>

          <div className="space-y-3">
            {faq.map((item, i) => (
              <Reveal key={item._key || i} delay={i * 50}>
                <details className="group bg-ivory-light border border-line">
                  <summary className="cursor-pointer p-5 md:p-6 flex items-center justify-between gap-4 list-none">
                    <span className="font-serif text-base md:text-lg text-ink leading-snug">
                      {item.q}
                    </span>
                    <span className="text-gold text-2xl transition-transform group-open:rotate-45 leading-none shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                    {item.a}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-ivory-dark border-t border-line">
        <div className="container py-16 md:py-20 text-center max-w-3xl mx-auto">
          <Sparkles className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
          <p className="eyebrow mt-4">Maintenant que vous savez</p>
          <h2 className="font-serif text-h1 mt-3">Découvrez nos pièces</h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ink-soft leading-relaxed">
            Notre catalogue se renouvelle chaque semaine. Chaque pièce est étiquetée
            avec son niveau d&apos;état, ses dimensions, sa marque et son prix.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/boutique" className="btn-primary inline-flex items-center gap-2">
              Voir le catalogue
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link href="/contact" className="btn-outline">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function ConditionBlock({
  condition,
  index,
}: {
  condition: SanityQualityCondition
  index: number
}) {
  const isReverse = index % 2 === 1
  const imageUrl = condition.image
    ? urlFor(condition.image).width(1000).height(1000).fit('crop').url()
    : undefined
  const borderColor = CONDITION_FALLBACK_COLORS[condition.code] || 'border-line bg-ivory'

  return (
    <Reveal>
      <div className={`grid md:grid-cols-2 gap-6 md:gap-10 items-start ${isReverse ? 'md:[&>div:first-child]:order-2' : ''}`}>
        {/* Photo */}
        <div className={`relative aspect-square overflow-hidden border ${borderColor}`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Exemple — ${condition.label}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-mute/40">
              <Sparkles className="h-8 w-8" strokeWidth={1.25} />
              <p className="text-xs uppercase tracking-widest">Photo à venir</p>
              <p className="text-xs text-ink-mute/30">{condition.label}</p>
            </div>
          )}
        </div>

        {/* Texte */}
        <div className="md:py-4">
          <p className="text-xs uppercase tracking-widest text-gold-dark font-medium">
            Niveau {index + 1}
          </p>
          <h3 className="font-serif text-2xl md:text-3xl text-ink mt-2 leading-tight">
            {condition.label}
          </h3>
          <p className="mt-4 text-ink-soft leading-relaxed">{condition.pitch}</p>

          <dl className="mt-6 space-y-3 text-sm border-t border-line pt-5">
            {condition.apparence && (
              <div className="flex gap-4">
                <dt className="w-28 text-xs uppercase tracking-widest text-ink-mute shrink-0 pt-0.5">
                  Apparence
                </dt>
                <dd className="text-ink-soft leading-relaxed">{condition.apparence}</dd>
              </div>
            )}
            {condition.fonctionnel && (
              <div className="flex gap-4">
                <dt className="w-28 text-xs uppercase tracking-widest text-ink-mute shrink-0 pt-0.5">
                  Fonctionnel
                </dt>
                <dd className="text-ink-soft leading-relaxed">{condition.fonctionnel}</dd>
              </div>
            )}
            {condition.garantie && (
              <div className="flex gap-4">
                <dt className="w-28 text-xs uppercase tracking-widest text-ink-mute shrink-0 pt-0.5">
                  Garantie
                </dt>
                <dd className="text-ink-soft leading-relaxed">{condition.garantie}</dd>
              </div>
            )}
            {condition.pourQui && (
              <div className="flex gap-4">
                <dt className="w-28 text-xs uppercase tracking-widest text-ink-mute shrink-0 pt-0.5">
                  Pour qui
                </dt>
                <dd className="text-ink-soft leading-relaxed">{condition.pourQui}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </Reveal>
  )
}
