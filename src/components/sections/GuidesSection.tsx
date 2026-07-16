import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen } from 'lucide-react'
import { getAllGuideClusters } from '@/lib/sanity-guides'
import { urlFor } from '@/lib/sanity'
import { Reveal } from '@/components/animations/Reveal'

/**
 * GuidesSection — vitrine du cocon éditorial sur la home.
 *
 * Affiche jusqu'à 3 clusters de guides (les mieux ordonnés). Rendered
 * uniquement s'il y a des clusters publiés — sinon le bloc ne s'affiche
 * pas (aucune surface vide).
 */
export async function GuidesSection() {
  const clusters = (await getAllGuideClusters())
    .filter((c) => !c.seo?.noIndex)
    .slice(0, 3)

  if (clusters.length === 0) return null

  return (
    <section className="container py-16 md:py-24">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="eyebrow flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4" strokeWidth={1.5} />
            Ressources & guides
          </p>
          <h2 className="font-serif text-h1 mt-3 leading-tight">
            Nos guides d'achat
          </h2>
          <div className="gold-divider mx-auto mt-6" />
          <p className="mt-6 text-ink-soft leading-relaxed">
            Ergonomie, achat B2B, marques, entretien, réglementation… tout ce
            qu'il faut savoir avant d'équiper vos bureaux en reconditionné.
          </p>
        </div>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusters.map((c, i) => {
          const imgUrl = c.image
            ? urlFor(c.image).width(800).height(600).fit('crop').url()
            : null
          return (
            <Reveal key={c._id} delay={i * 80}>
              <Link
                href={`/guides/${c.slug.current}`}
                className="group flex flex-col h-full bg-ivory border border-line hover:border-gold transition-colors overflow-hidden"
              >
                {imgUrl && (
                  <div className="relative aspect-[4/3] bg-ivory-dark overflow-hidden">
                    <Image
                      src={imgUrl}
                      alt={c.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl text-ink group-hover:text-gold-dark transition-colors">
                    {c.name}
                  </h3>
                  {c.tagline && (
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-3">
                      {c.tagline}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-dark font-medium">
                    Découvrir le cluster
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>

      <div className="text-center mt-12">
        <Link
          href="/guides"
          className="btn-outline inline-flex items-center gap-2"
        >
          Explorer tous les guides
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  )
}
