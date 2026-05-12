import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react'
import { SHOP_URL } from '@/lib/config'

interface FooterProps {
  logo?: { url: string; alt?: string }
}

const CATEGORIES = [
  { label: 'Bureaux individuels', href: '/categorie/bureaux-individuels' },
  { label: 'Fauteuils ergonomiques', href: '/categorie/fauteuils-ergonomiques' },
  { label: 'Armoires & rangements', href: '/categorie/armoires-rangements' },
  { label: 'Chaises d\'accueil & réunion', href: '/categorie/chaises-accueil-reunion' },
  { label: 'Tables de réunion', href: '/categorie/tables-de-reunion' },
  { label: 'Espaces détente', href: '/categorie/espaces-detente' },
  { label: 'Caissons de bureau', href: '/categorie/caissons' },
]

const SERVICES = [
  { label: 'Achat reconditionné', href: SHOP_URL },
  { label: 'Location longue durée', href: '/location-mobilier-bureau' },
  { label: 'Vidage de locaux', href: '/vidage-de-locaux' },
  { label: 'Attestation RSE', href: '/attestation-rse' },
  { label: 'Demander un devis', href: '/contact' },
]

const ZONES = [
  { label: 'Marseille', href: '/mobilier-bureau-marseille' },
  { label: 'Aubagne', href: '/mobilier-bureau-aubagne' },
  { label: 'Aix-en-Provence', href: '/mobilier-bureau-aix-en-provence' },
]

const LEGAL = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'CGV', href: '/cgv' },
  { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
  { label: 'Cookies', href: '/cookies' },
]

export function Footer({ logo }: FooterProps = {}) {
  return (
    <footer className="bg-ink text-ivory mt-24">
      <div className="container py-16 grid gap-12 md:grid-cols-12">
        {/* Identité */}
        <div className="md:col-span-4">
          {logo ? (
            <Image
              src={logo.url}
              alt={logo.alt || 'Mobilier Malin'}
              width={280}
              height={84}
              className="h-16 md:h-20 w-auto object-contain"
            />
          ) : (
            <p className="font-serif text-2xl">
              Mobilier <span className="text-gold">Malin</span>
            </p>
          )}
          <p className="mt-4 text-sm text-ivory/70 max-w-sm leading-relaxed">
            Mobilier de bureau d&apos;exception, reconditionné avec exigence.
            <br />
            Économique, écologique, sans compromis sur la qualité.
          </p>

          <div className="mt-8 space-y-3 text-sm text-ivory/70">
            <p className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
              <span>
                18 chemin Noël Robion
                <br />
                13821 La Penne-sur-Huveaune
              </span>
            </p>
            <p className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gold shrink-0" />
              <a href="tel:+33676617053" className="hover:text-gold">
                06 76 61 70 53
              </a>
            </p>
            <p className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gold shrink-0" />
              <a href="mailto:mobiliermalin@gmail.com" className="hover:text-gold">
                mobiliermalin@gmail.com
              </a>
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <a
              href="https://facebook.com/mobiliermalin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="h-9 w-9 flex items-center justify-center border border-ivory/20 hover:border-gold hover:text-gold transition"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com/mobiliermalin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="h-9 w-9 flex items-center justify-center border border-ivory/20 hover:border-gold hover:text-gold transition"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com/company/mobilier-malin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="h-9 w-9 flex items-center justify-center border border-ivory/20 hover:border-gold hover:text-gold transition"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Catalogue */}
        <div className="md:col-span-3">
          <h3 className="text-xs font-medium text-ivory uppercase tracking-widest mb-5">
            Catalogue
          </h3>
          <ul className="space-y-2.5 text-sm text-ivory/70">
            {CATEGORIES.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="hover:text-gold transition">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className="md:col-span-2">
          <h3 className="text-xs font-medium text-ivory uppercase tracking-widest mb-5">
            Services
          </h3>
          <ul className="space-y-2.5 text-sm text-ivory/70">
            {SERVICES.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="hover:text-gold transition">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Zones + Infos */}
        <div className="md:col-span-3">
          <h3 className="text-xs font-medium text-ivory uppercase tracking-widest mb-5">
            Zones d&apos;intervention
          </h3>
          <ul className="space-y-2.5 text-sm text-ivory/70">
            {ZONES.map((z) => (
              <li key={z.href}>
                <Link href={z.href} className="hover:text-gold transition">
                  {z.label}
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="text-xs font-medium text-ivory uppercase tracking-widest mb-5 mt-8">
            Informations
          </h3>
          <ul className="space-y-2.5 text-sm text-ivory/70">
            <li>
              <Link href="/notre-demarche" className="hover:text-gold transition">
                Notre démarche
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-gold transition">
                Blog & conseils
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-gold transition">
                Questions fréquentes
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/50">
          <p>
            © {new Date().getFullYear()} Mobilier Malin — SARL 2 M. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
