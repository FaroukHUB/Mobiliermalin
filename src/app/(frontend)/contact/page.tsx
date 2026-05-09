import type { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { ContactForm } from '@/components/forms/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — réponse sous 24 h',
  description:
    "Une question ? Un projet d'achat ou de vidage de locaux ? Contactez Mobilier Malin par téléphone, email ou via notre formulaire. Réponse garantie sous 24 h ouvrées.",
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-16 md:py-20 max-w-4xl">
          <p className="eyebrow">Parlons de votre projet</p>
          <h1 className="text-display mt-4 font-serif">
            Acheter, vider, ou les deux ?
          </h1>
          <div className="gold-divider mx-0 mt-6" />
          <p className="mt-6 text-lg text-ink-soft leading-relaxed">
            Décrivez-nous votre besoin en quelques mots. Réponse sous 24 h
            ouvrées par un humain, pas par un robot.
          </p>
        </div>
      </section>

      {/* Coordonnées + Formulaire */}
      <section className="container py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 lg:gap-16">
          {/* Colonne coordonnées */}
          <aside className="space-y-8">
            <div>
              <p className="eyebrow">Contact direct</p>
              <h2 className="font-serif text-2xl text-ink mt-2">Joignez-nous</h2>
            </div>

            <div className="space-y-6">
              <ContactItem
                icon={Phone}
                label="Téléphone"
                value="06 76 61 70 53"
                href="tel:+33676617053"
                hint="Du lundi au vendredi, 9 h — 18 h"
              />
              <ContactItem
                icon={Mail}
                label="Email"
                value="mobiliermalin@gmail.com"
                href="mailto:mobiliermalin@gmail.com"
                hint="Réponse sous 24 h ouvrées"
              />
              <ContactItem
                icon={MapPin}
                label="Entrepôt & showroom"
                value={
                  <>
                    18 chemin Noël Robion
                    <br />
                    13821 La Penne-sur-Huveaune
                  </>
                }
                hint="Sur rendez-vous uniquement"
              />
              <ContactItem
                icon={Clock}
                label="Horaires"
                value={
                  <>
                    Lundi — Vendredi : 9 h — 18 h
                    <br />
                    Samedi : sur rendez-vous
                  </>
                }
              />
            </div>

            <div className="bg-ivory-dark border border-line p-6">
              <p className="font-serif text-lg text-ink">Zones d&apos;intervention</p>
              <p className="text-sm text-ink-mute mt-2 leading-relaxed">
                Marseille, Aubagne, Aix-en-Provence et toute la région PACA.
                Livraison nationale possible sur devis.
              </p>
            </div>
          </aside>

          {/* Colonne formulaire */}
          <div>
            <div className="bg-ivory-light border border-line p-6 md:p-10">
              <h2 className="font-serif text-2xl text-ink mb-6">Formulaire de contact</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
  hint,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: React.ReactNode
  href?: string
  hint?: string
}) {
  const content = (
    <>
      <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 text-gold mt-0.5 shrink-0" strokeWidth={1.5} />
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-mute font-medium">
            {label}
          </p>
          <p className="font-medium text-ink mt-1.5 leading-relaxed">{value}</p>
          {hint && <p className="text-xs text-ink-mute mt-1">{hint}</p>}
        </div>
      </div>
    </>
  )

  if (href) {
    return (
      <a href={href} className="block hover:text-gold-dark transition">
        {content}
      </a>
    )
  }
  return <div>{content}</div>
}
