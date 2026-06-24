import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Cookies',
  description:
    'Politique de gestion des cookies utilisés sur mobiliermalin.com — cookies techniques essentiels uniquement, aucun tracking analytique ou publicitaire.',
  alternates: { canonical: '/cookies' },
}

export default function CookiesPage() {
  return (
    <article className="container py-16 md:py-20 max-w-3xl">
      <p className="eyebrow">Cookies &amp; traceurs</p>
      <h1 className="text-display mt-4 font-serif">Politique de gestion des cookies</h1>
      <div className="gold-divider mx-0 mt-6" />
      <p className="mt-6 text-sm text-ink-mute">
        Dernière mise à jour : juin 2026.
      </p>

      <div className="mt-10 space-y-10 text-ink-soft leading-relaxed">
        <Section title="1. Qu'est-ce qu'un cookie ?">
          <p>
            Un cookie est un petit fichier texte déposé sur votre terminal
            (ordinateur, smartphone, tablette) lors de la consultation
            d&apos;un site internet. Il permet au site de mémoriser certaines
            informations relatives à votre navigation.
          </p>
        </Section>

        <Section title="2. Notre approche">
          <p>
            <strong className="text-ink">Mobilier Malin ne dépose aucun cookie de
            tracking analytique ni de cookie publicitaire.</strong> Le site
            n&apos;utilise ni Google Analytics, ni pixel Meta/Facebook, ni
            outil de mesure d&apos;audience tiers, ni cookie de reciblage
            publicitaire.
          </p>
          <p className="mt-4">
            Seuls les <strong className="text-ink">cookies strictement
            nécessaires</strong> au fonctionnement du site et des services que
            vous demandez (commande, paiement) sont utilisés. Ces cookies sont
            exemptés de consentement préalable, conformément à la position de
            la CNIL.
          </p>
        </Section>

        <Section title="3. Cookies utilisés">
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-line bg-ivory-light">
                  <th className="text-left p-3 font-medium text-ink">Cookie</th>
                  <th className="text-left p-3 font-medium text-ink">Émetteur</th>
                  <th className="text-left p-3 font-medium text-ink">Finalité</th>
                  <th className="text-left p-3 font-medium text-ink">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="p-3 font-mono text-xs">__stripe_*</td>
                  <td className="p-3">Stripe</td>
                  <td className="p-3">
                    Prévention de la fraude lors du paiement, déposés
                    uniquement lors d&apos;une commande.
                  </td>
                  <td className="p-3">1 an max</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-xs">cart / session</td>
                  <td className="p-3">Mobilier Malin</td>
                  <td className="p-3">
                    Mémorisation des choix en cours de commande (créneau de
                    retrait, identifiants temporaires).
                  </td>
                  <td className="p-3">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Gestion des cookies">
          <p>
            Les cookies techniques ci-dessus étant indispensables au
            fonctionnement du site (notamment au paiement sécurisé), leur
            désactivation peut entraîner des dysfonctionnements.
          </p>
          <p className="mt-4">
            Vous pouvez à tout moment paramétrer ou supprimer les cookies
            stockés sur votre terminal depuis les préférences de votre
            navigateur&nbsp;:
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:underline">Google Chrome</a>
            </li>
            <li>
              <a href="https://support.mozilla.org/fr/kb/protection-renforcee-contre-pistage-firefox-ordinateur" target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:underline">Mozilla Firefox</a>
            </li>
            <li>
              <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:underline">Apple Safari</a>
            </li>
            <li>
              <a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-gold-dark hover:underline">Microsoft Edge</a>
            </li>
          </ul>
        </Section>

        <Section title="5. Évolution de cette politique">
          <p>
            Si nous étions amenés à mettre en place de nouveaux outils
            nécessitant le dépôt de cookies non essentiels (par exemple un
            outil d&apos;analytique d&apos;audience), une bannière de
            consentement conforme aux exigences de la CNIL serait alors
            déployée et cette politique mise à jour en conséquence.
          </p>
        </Section>

        <Section title="6. Contact">
          <p>
            Pour toute question relative aux cookies ou plus généralement à
            la protection de vos données, vous pouvez nous contacter à{' '}
            <a href={`mailto:${LEGAL.email}`} className="text-gold-dark hover:underline">
              {LEGAL.email}
            </a>{' '}
            ou consulter notre{' '}
            <Link href="/politique-confidentialite" className="text-gold-dark hover:underline">
              politique de confidentialité
            </Link>.
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
