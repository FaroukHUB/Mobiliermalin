import Link from 'next/link'
import { Reveal } from '@/components/animations/Reveal'
import { NewsletterForm } from '@/components/forms/NewsletterForm'

export function NewsletterSection() {
  return (
    <section className="bg-ink text-ivory">
      <div className="container py-20 md:py-28 max-w-3xl mx-auto text-center">
        <Reveal>
          <p className="eyebrow text-gold">Restons en contact</p>
          <h2 className="text-display mt-3 font-serif text-ivory leading-[1.1]">
            Les nouveautés du stock, les pièces signées, les conseils pratiques
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-7" />
          <p className="mt-7 text-ivory/70 leading-relaxed">
            Une fois par mois, ni plus ni moins. Les arrivages premium, les
            astuces pour aménager, l&apos;actualité du réemploi. Désinscription
            en 1 clic.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <NewsletterForm />
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-16 pt-10 border-t border-ivory/10 grid sm:grid-cols-3 gap-6 text-left">
            <Link
              href="/contact"
              className="group flex flex-col gap-2 hover:text-gold transition"
            >
              <span className="text-xs uppercase tracking-widest text-gold">Devis</span>
              <span className="font-serif text-lg">Parlons de votre projet</span>
              <span className="text-xs text-ivory/60 group-hover:text-ivory">
                Réponse sous 24 h →
              </span>
            </Link>
            <a
              href="tel:+33676617053"
              className="group flex flex-col gap-2 hover:text-gold transition"
            >
              <span className="text-xs uppercase tracking-widest text-gold">Téléphone</span>
              <span className="font-serif text-lg">06 76 61 70 53</span>
              <span className="text-xs text-ivory/60 group-hover:text-ivory">
                Lundi — Vendredi 9 h — 18 h →
              </span>
            </a>
            <a
              href="mailto:mobiliermalin@gmail.com"
              className="group flex flex-col gap-2 hover:text-gold transition"
            >
              <span className="text-xs uppercase tracking-widest text-gold">Email</span>
              <span className="font-serif text-lg">mobiliermalin@gmail.com</span>
              <span className="text-xs text-ivory/60 group-hover:text-ivory">
                Réponse rapide →
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
