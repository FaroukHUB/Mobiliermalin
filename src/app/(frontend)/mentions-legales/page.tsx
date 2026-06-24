import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Informations légales obligatoires du site mobiliermalin.com (SARL 2 M) : identité de l\'éditeur, hébergeur, propriété intellectuelle, données personnelles.',
  alternates: { canonical: '/mentions-legales' },
}

export default function MentionsLegalesPage() {
  return (
    <article className="container py-16 md:py-20 max-w-3xl">
      <p className="eyebrow">Informations légales</p>
      <h1 className="text-display mt-4 font-serif">Mentions légales</h1>
      <div className="gold-divider mx-0 mt-6" />
      <p className="mt-6 text-sm text-ink-mute">
        Dernière mise à jour : juin 2026.
      </p>

      <div className="mt-10 space-y-10 text-ink-soft leading-relaxed">
        <Section title="1. Éditeur du site">
          <p>
            Le site <strong className="text-ink">mobiliermalin.com</strong> est édité par&nbsp;:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><strong className="text-ink">{LEGAL.formeJuridique} {LEGAL.raisonSociale}</strong> — exploitant la marque « {LEGAL.nomCommercial} »</li>
            <li>Capital social : {LEGAL.capitalSocial}</li>
            <li>Siège social : {LEGAL.siegeSocial.ligne1}, {LEGAL.siegeSocial.ligne2}, {LEGAL.siegeSocial.codePostal} {LEGAL.siegeSocial.ville}</li>
            <li>RCS {LEGAL.rcs} — SIREN {LEGAL.siren} (n° de gestion {LEGAL.numeroGestion})</li>
            <li>TVA intracommunautaire : {LEGAL.tvaIntracom}</li>
            <li>Date d&apos;immatriculation : {LEGAL.dateImmatriculation}</li>
            <li>Activité : {LEGAL.activite}</li>
          </ul>
        </Section>

        <Section title="2. Représentant légal & directeur de la publication">
          <p>
            <strong className="text-ink">{LEGAL.gerant}</strong>, gérant de la {LEGAL.formeJuridique} {LEGAL.raisonSociale}.
          </p>
        </Section>

        <Section title="3. Contact">
          <ul className="space-y-1.5 text-sm">
            <li>
              Téléphone&nbsp;:&nbsp;
              <a href={`tel:${LEGAL.telephoneTel}`} className="text-gold-dark hover:underline">
                {LEGAL.telephone}
              </a>
            </li>
            <li>
              Email&nbsp;:&nbsp;
              <a href={`mailto:${LEGAL.email}`} className="text-gold-dark hover:underline">
                {LEGAL.email}
              </a>
            </li>
            <li>
              Adresse postale (showroom &amp; entrepôt)&nbsp;:&nbsp;
              {LEGAL.showroom.ligne1}, {LEGAL.showroom.codePostal} {LEGAL.showroom.ville}
            </li>
          </ul>
        </Section>

        <Section title="4. Hébergeur">
          <p>
            Le site est hébergé par&nbsp;:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><strong className="text-ink">Vercel Inc.</strong></li>
            <li>340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
            <li>
              Site web&nbsp;:&nbsp;
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-dark hover:underline"
              >
                vercel.com
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm">
            Le contenu géré (catalogue produits, pages éditoriales) est stocké
            sur <strong className="text-ink">Sanity.io</strong> (Sanity, Inc.,
            San Francisco, CA, États-Unis). Les paiements sont opérés par
            <strong className="text-ink"> Stripe Payments Europe Ltd.</strong>{' '}
            (Dublin, Irlande). Les emails transactionnels sont envoyés via{' '}
            <strong className="text-ink">Brevo SAS</strong> (Paris, France).
          </p>
        </Section>

        <Section title="5. Propriété intellectuelle">
          <p>
            L&apos;ensemble du site — textes, photographies, illustrations,
            logos, identité graphique, code source — est la propriété
            exclusive de la {LEGAL.formeJuridique} {LEGAL.raisonSociale} ou de
            ses partenaires, et est protégé par les lois françaises et
            internationales relatives à la propriété intellectuelle.
          </p>
          <p className="mt-4">
            Toute reproduction, représentation, modification ou exploitation
            de tout ou partie du site, par quelque procédé que ce soit, sans
            autorisation écrite préalable, est interdite et constitue une
            contrefaçon sanctionnée par les articles L335-2 et suivants du
            Code de la propriété intellectuelle.
          </p>
          <p className="mt-4">
            Les marques citées (Steelcase, Herman Miller, Vitra, Haworth, etc.)
            sont la propriété de leurs détenteurs respectifs et sont utilisées
            à titre informatif pour désigner les produits reconditionnés
            proposés à la vente.
          </p>
        </Section>

        <Section title="6. Données personnelles">
          <p>
            Le traitement des données à caractère personnel collectées via le
            site est détaillé dans notre{' '}
            <Link href="/politique-confidentialite" className="text-gold-dark hover:underline">
              politique de confidentialité
            </Link>.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            L&apos;utilisation des cookies sur ce site est encadrée par notre{' '}
            <Link href="/cookies" className="text-gold-dark hover:underline">
              politique de gestion des cookies
            </Link>.
          </p>
        </Section>

        <Section title="8. Droit applicable & juridiction">
          <p>
            Les présentes mentions légales sont régies par le droit français.
            En cas de litige et à défaut de résolution amiable, les tribunaux
            français seront seuls compétents.
          </p>
        </Section>

        <Section title="9. Crédits">
          <p>
            Conception, développement et identité graphique&nbsp;: équipe
            Mobilier Malin. Certaines photographies d&apos;illustration
            proviennent de banques d&apos;images libres de droit (Unsplash).
          </p>
        </Section>
      </div>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl md:text-2xl text-ink">{title}</h2>
      <div className="mt-4 space-y-3 text-[15px]">{children}</div>
    </section>
  )
}
