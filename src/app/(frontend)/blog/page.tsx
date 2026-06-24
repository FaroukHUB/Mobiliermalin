import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail, Newspaper } from 'lucide-react'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Blog & conseils — bientôt en ligne',
  description:
    'Le blog Mobilier Malin arrive prochainement : conseils d\'aménagement, retours d\'expérience, guides d\'achat sur le mobilier de bureau reconditionné.',
  alternates: { canonical: '/blog' },
}

export default function BlogPage() {
  return (
    <>
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-16 md:py-20 max-w-3xl">
          <p className="eyebrow">Blog &amp; conseils</p>
          <h1 className="text-display mt-4 font-serif">
            Notre blog arrive bientôt
          </h1>
          <div className="gold-divider mx-0 mt-6" />
          <p className="mt-6 text-lg text-ink-soft leading-relaxed">
            Nous préparons une section éditoriale dédiée aux conseils
            d&apos;aménagement, aux retours d&apos;expérience sur les marques
            de mobilier professionnel et aux guides pratiques pour bien
            choisir son équipement reconditionné.
          </p>
        </div>
      </section>

      <section className="container py-16 md:py-20 max-w-3xl">
        <div className="bg-ivory-light border border-line p-8 md:p-12">
          <Newspaper className="h-10 w-10 text-gold" strokeWidth={1.5} />
          <h2 className="font-serif text-2xl md:text-3xl text-ink mt-6">
            Au programme dans les prochaines semaines
          </h2>
          <div className="gold-divider mx-0 mt-6" />
          <ul className="mt-8 space-y-4 text-ink-soft leading-relaxed">
            <li className="flex gap-3">
              <span className="text-gold mt-1.5 shrink-0">•</span>
              <span>
                <strong className="text-ink">Comparatif des grandes marques de fauteuils ergonomiques.</strong>{' '}
                Steelcase Leap, Herman Miller Aeron, Vitra ID, Haworth
                Zody — points forts, morphologies adaptées, durée de vie réelle.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold mt-1.5 shrink-0">•</span>
              <span>
                <strong className="text-ink">Aménager un open-space sans se ruiner.</strong>{' '}
                Retours d&apos;expérience de PME marseillaises que nous avons
                équipées récemment, avec budgets et choix concrets.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold mt-1.5 shrink-0">•</span>
              <span>
                <strong className="text-ink">Comprendre ce qui distingue l&apos;occasion du reconditionné.</strong>{' '}
                Un dossier complet sur les étapes que nous appliquons en
                atelier — et pourquoi ce n&apos;est pas comparable à la
                brocante en ligne.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold mt-1.5 shrink-0">•</span>
              <span>
                <strong className="text-ink">L&apos;impact écologique du mobilier reconditionné.</strong>{' '}
                Quelques chiffres clairs sur l&apos;empreinte évitée, et
                comment ça s&apos;inscrit dans une démarche RSE crédible.
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-10 bg-ink text-ivory p-8 md:p-10 text-center">
          <Mail className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
          <p className="eyebrow text-gold mt-4">En attendant</p>
          <h2 className="font-serif text-xl md:text-2xl text-ivory mt-3">
            Une question, un projet d&apos;aménagement ?
          </h2>
          <p className="mt-4 text-ivory/80 leading-relaxed">
            Notre équipe est joignable directement — réponse sous 24 h
            ouvrées avec des conseils concrets, sans engagement.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Nous contacter
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link href="/notre-demarche" className="btn-outline-light">
              Découvrir notre démarche
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-ink-mute">
          Vous pouvez nous joindre directement à{' '}
          <a href={`mailto:${LEGAL.email}`} className="text-gold-dark hover:underline">
            {LEGAL.email}
          </a>.
        </p>
      </section>
    </>
  )
}
