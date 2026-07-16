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
  { label: 'Chaises de formation', href: '/categorie/chaises-formation' },
  { label: 'Tables de réunion', href: '/categorie/tables-de-reunion' },
  { label: 'Espaces détente', href: '/categorie/espaces-detente' },
  { label: 'Caissons de bureau', href: '/categorie/caissons' },
]

const SERVICES = [
  { label: 'Achat reconditionné', href: SHOP_URL },
  { label: 'Location longue durée', href: '/location-mobilier-bureau' },
  { label: 'Vidage de locaux', href: '/vidage-de-locaux' },
  { label: 'Attestation RSE', href: '/attestation-rse' },
  { label: 'Charte qualité', href: '/charte-qualite' },
  { label: 'Demander un devis', href: '/contact' },
]

const ZONES = [
  { label: 'Toutes les zones desservies', href: '/zones-desservies' },
  { label: 'Bureaux Marseille', href: '/bureau-occasion-marseille' },
  { label: 'Bureaux Aubagne', href: '/bureau-occasion-aubagne' },
  { label: 'Bureaux Aix-en-Provence', href: '/bureau-occasion-aix-en-provence' },
  { label: 'Bureaux Nice', href: '/bureau-occasion-nice' },
  { label: 'Fauteuils Marseille', href: '/fauteuil-occasion-marseille' },
  { label: 'Fauteuils Aubagne', href: '/fauteuil-occasion-aubagne' },
  { label: 'Fauteuils Nice', href: '/fauteuil-occasion-nice' },
]

// Guides d'achat — cocon éditorial (mis à jour Sprint 2/4)
const GUIDES = [
  { label: 'Tous les guides d\'achat', href: '/guides' },
  { label: 'Ergonomie & bien-être', href: '/guides/ergonomie' },
  { label: 'Achat B2B', href: '/guides/achat-b2b' },
  { label: 'Marques & modèles', href: '/guides/marques' },
  { label: 'RSE & réemploi', href: '/guides/rse-reemploi' },
  { label: 'Entretien & réparation', href: '/guides/entretien' },
]

const LEGAL = [
  { label: 'Renoncer au contrat', href: '/retractation' },
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
            <a
              href="https://www.pinterest.com/mobiliermalin/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="h-9 w-9 flex items-center justify-center border border-ivory/20 hover:border-gold hover:text-gold transition"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378 0 0-.602 2.293-.748 2.853-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
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
            Guides d&apos;achat
          </h3>
          <ul className="space-y-2.5 text-sm text-ivory/70">
            {GUIDES.map((g) => (
              <li key={g.href}>
                <Link href={g.href} className="hover:text-gold transition">
                  {g.label}
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
                Blog & actualités
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
