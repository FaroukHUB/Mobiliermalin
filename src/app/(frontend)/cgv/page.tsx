import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description:
    'Conditions générales de vente du site mobiliermalin.com — modalités de commande, paiement, livraison, droit de rétractation, garanties et médiation de la consommation.',
  alternates: { canonical: '/cgv' },
}

export default function CGVPage() {
  return (
    <article className="container py-16 md:py-20 max-w-3xl">
      <p className="eyebrow">Conditions générales de vente</p>
      <h1 className="text-display mt-4 font-serif">CGV</h1>
      <div className="gold-divider mx-0 mt-6" />
      <p className="mt-6 text-sm text-ink-mute">
        En vigueur depuis juin 2026.
      </p>

      <div className="mt-10 space-y-10 text-ink-soft leading-relaxed">
        <Section title="Article 1 — Objet">
          <p>
            Les présentes conditions générales de vente (ci-après « CGV »)
            régissent les relations contractuelles entre la {LEGAL.formeJuridique}{' '}
            {LEGAL.raisonSociale} (ci-après « Mobilier Malin », le « Vendeur »)
            et toute personne physique ou morale (ci-après le « Client »)
            effectuant un achat de mobilier reconditionné via le site
            mobiliermalin.com ou via un devis transmis par Mobilier Malin.
          </p>
          <p className="mt-4">
            Toute commande implique l&apos;acceptation pleine et entière des
            présentes CGV, prévalant sur tout autre document du Client, sauf
            accord écrit préalable.
          </p>
        </Section>

        <Section title="Article 2 — Vendeur">
          <ul className="space-y-1.5 text-sm">
            <li><strong className="text-ink">{LEGAL.formeJuridique} {LEGAL.raisonSociale}</strong> — exploitant la marque « {LEGAL.nomCommercial} »</li>
            <li>Capital social : {LEGAL.capitalSocial}</li>
            <li>Siège social : {LEGAL.siegeSocial.ligne1}, {LEGAL.siegeSocial.ligne2}, {LEGAL.siegeSocial.codePostal} {LEGAL.siegeSocial.ville}</li>
            <li>RCS {LEGAL.rcs} — SIREN {LEGAL.siren}</li>
            <li>TVA intracommunautaire : {LEGAL.tvaIntracom}</li>
            <li>
              Contact :{' '}
              <a href={`tel:${LEGAL.telephoneTel}`} className="text-gold-dark hover:underline">{LEGAL.telephone}</a>
              {' / '}
              <a href={`mailto:${LEGAL.email}`} className="text-gold-dark hover:underline">{LEGAL.email}</a>
            </li>
          </ul>
        </Section>

        <Section title="Article 3 — Produits">
          <p>
            Les produits proposés sont du mobilier de bureau professionnel
            reconditionné dans l&apos;atelier du Vendeur situé à La
            Penne-sur-Huveaune. Chaque fiche produit précise la marque, la
            référence, l&apos;état (excellent, très bon, bon, satisfaisant)
            et les éventuelles particularités.
          </p>
          <p className="mt-4">
            Les photographies sont aussi fidèles que possible mais ne sauraient
            engager le Vendeur sur des aspects mineurs (nuances de teinte,
            patines d&apos;usage cohérentes avec l&apos;état déclaré). En cas
            de doute, le Client est invité à venir essayer le produit au
            showroom ou à contacter le Vendeur avant achat.
          </p>
          <p className="mt-4">
            Le stock évolue en permanence&nbsp;; les produits sont vendus dans
            la limite des quantités disponibles. En cas d&apos;indisponibilité
            postérieure à la commande, le Client en est informé et remboursé
            intégralement dans les meilleurs délais.
          </p>
        </Section>

        <Section title="Article 4 — Prix">
          <p>
            Les prix affichés sur le site sont indiqués en euros, toutes taxes
            comprises (TVA française au taux en vigueur, soit{' '}
            {LEGAL.tauxTvaDefaut} % à la date des présentes), hors frais de
            livraison.
          </p>
          <p className="mt-4">
            Les frais de livraison éventuels sont calculés et communiqués
            avant validation de la commande, selon le volume, l&apos;adresse
            de livraison, les contraintes d&apos;accès (étage, ascenseur) et
            les éventuels services additionnels demandés (montage, mise en
            place, débarras de l&apos;ancien mobilier).
          </p>
          <p className="mt-4">
            Mobilier Malin se réserve le droit de modifier ses prix à tout
            moment&nbsp;; les commandes déjà validées restent traitées au prix
            en vigueur lors de la validation.
          </p>
        </Section>

        <Section title="Article 5 — Commande">
          <p>Le Client peut commander selon trois modalités :</p>
          <ol className="mt-4 space-y-3 list-decimal pl-5 text-[15px]">
            <li>
              <strong className="text-ink">Achat en ligne avec retrait au showroom</strong>{' '}
              — sélection du produit, choix d&apos;un créneau de retrait,
              paiement en ligne via Stripe.
            </li>
            <li>
              <strong className="text-ink">Devis de livraison</strong> —
              demande effectuée depuis la fiche produit ou via le formulaire
              de contact, devis détaillé transmis sous 24 h ouvrées,
              acceptation et paiement en ligne depuis l&apos;email reçu.
            </li>
            <li>
              <strong className="text-ink">Vente directe au showroom</strong>{' '}
              — visite, choix, règlement sur place (espèces, carte, virement).
            </li>
          </ol>
          <p className="mt-4">
            La commande n&apos;est considérée comme conclue qu&apos;à
            l&apos;encaissement effectif du paiement. Un email de
            confirmation est envoyé au Client à ce moment.
          </p>
        </Section>

        <Section title="Article 6 — Paiement">
          <p>
            Les paiements en ligne sont opérés via <strong className="text-ink">Stripe
            Payments Europe Ltd.</strong>, prestataire certifié PCI-DSS. Les
            données bancaires sont saisies directement sur les serveurs de
            Stripe et ne sont jamais stockées par Mobilier Malin.
          </p>
          <p className="mt-4">
            Sont acceptés&nbsp;: cartes Visa, Mastercard, American Express,
            ainsi que les moyens de paiement locaux supportés par Stripe au
            moment de la commande. Les paiements en plusieurs fois peuvent
            être proposés selon les conditions de Stripe.
          </p>
          <p className="mt-4">
            Pour les commandes dépassant un certain montant ou volume, un
            paiement par virement bancaire peut être convenu ; les coordonnées
            sont alors transmises par email.
          </p>
        </Section>

        <Section title="Article 7 — Livraison & retrait">
          <p>
            Le retrait au showroom est gratuit, sur rendez-vous, du lundi au
            samedi de 10 h à 18 h, à l&apos;adresse {LEGAL.showroom.ligne1},{' '}
            {LEGAL.showroom.codePostal} {LEGAL.showroom.ville}.
          </p>
          <p className="mt-4">
            La livraison est assurée par Mobilier Malin ou un prestataire
            partenaire, dans un délai indicatif de 5 à 7 jours ouvrés sur
            Marseille et le bassin aixois, et selon les créneaux de tournées
            programmées pour Nice et la Côte d&apos;Azur. Les délais sont
            confirmés au moment du devis.
          </p>
          <p className="mt-4">
            Le risque pèse sur le Vendeur jusqu&apos;à la remise effective des
            produits au Client. En cas de dommage constaté à la livraison, le
            Client doit l&apos;indiquer sur le bon de livraison et en informer
            Mobilier Malin sous 48 h afin de permettre une résolution rapide.
          </p>
        </Section>

        <Section title="Article 8 — Droit de rétractation (14 jours)">
          <p>
            Conformément aux articles L221-18 et suivants du Code de la
            consommation, le Client consommateur dispose d&apos;un délai de{' '}
            <strong className="text-ink">14 jours</strong> à compter de la
            réception des produits pour exercer son droit de rétractation,
            sans avoir à justifier de motif ni à payer de pénalités.
          </p>
          <p className="mt-4">
            Conformément à l&apos;ordonnance n°2026-2 du 19 juin 2026, une
            fonctionnalité dédiée et gratuite est mise à disposition pour
            notifier la rétractation aussi simplement que la commande a été
            passée&nbsp;:&nbsp;
            <Link href="/retractation" className="text-gold-dark hover:underline font-medium">
              Renoncer au contrat ici
            </Link>.
          </p>
          <p className="mt-4">
            Après notification, le Client dispose de 14 jours pour renvoyer
            les produits dans leur état d&apos;origine. Mobilier Malin
            rembourse l&apos;intégralité des sommes versées (produit + frais
            de livraison standard) sous 14 jours à compter de la réception du
            retour ou de la preuve d&apos;envoi.
          </p>
          <p className="mt-4 text-sm bg-ivory-light border-l-4 border-gold p-4">
            Le droit de rétractation ne s&apos;applique pas aux contrats
            conclus entre professionnels (relations B2B), ni aux biens
            confectionnés ou personnalisés à la demande du Client (cf. art.
            L221-28 du Code de la consommation).
          </p>
        </Section>

        <Section title="Article 9 — Garanties légales">
          <p>
            Les produits vendus bénéficient&nbsp;:
          </p>
          <ul className="mt-4 space-y-3 text-[15px]">
            <li>
              <strong className="text-ink">Garantie légale de conformité</strong>{' '}
              (art. L217-3 et suivants du Code de la consommation) — 12 mois
              à compter de la délivrance pour les biens d&apos;occasion, sauf
              accord exprès pour un délai inférieur conforme à la loi.
            </li>
            <li>
              <strong className="text-ink">Garantie des vices cachés</strong>{' '}
              (art. 1641 et suivants du Code civil) — 2 ans à compter de la
              découverte du vice.
            </li>
            <li>
              <strong className="text-ink">Garantie commerciale Mobilier Malin</strong>{' '}
              — 6 mois supplémentaires sur les mécanismes (vérins, bras,
              accoudoirs, plateaux) au-delà des garanties légales ci-dessus.
            </li>
          </ul>
          <p className="mt-4">
            Pour exercer une garantie, le Client contacte Mobilier Malin par
            email en décrivant le défaut constaté, accompagné si possible de
            photographies. Une solution (réparation, échange, remboursement)
            est proposée sous 5 jours ouvrés.
          </p>
        </Section>

        <Section title="Article 10 — Médiation de la consommation">
          <p>
            Conformément aux articles L611-1 et suivants du Code de la
            consommation, en cas de litige n&apos;ayant pas trouvé de
            résolution amiable, le Client consommateur peut recourir
            gratuitement au médiateur de la consommation suivant&nbsp;:
          </p>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li><strong className="text-ink">CM2C — Centre de la Médiation de la Consommation de Conciliateurs de Justice</strong></li>
            <li>14 rue Saint Jean — 75017 Paris</li>
            <li>
              Site :{' '}
              <a
                href="https://cm2c.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-dark hover:underline"
              >
                cm2c.net
              </a>
            </li>
            <li>Email : cm2c@cm2c.net</li>
          </ul>
          <p className="mt-4">
            Le Client peut également recourir à la plateforme européenne de
            règlement en ligne des litiges (RLL) accessible à l&apos;adresse{' '}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark hover:underline"
            >
              ec.europa.eu/consumers/odr
            </a>.
          </p>
        </Section>

        <Section title="Article 11 — Réserve de propriété">
          <p>
            Les produits livrés restent la propriété de Mobilier Malin
            jusqu&apos;au paiement intégral du prix. Le transfert des risques
            s&apos;opère néanmoins dès la livraison.
          </p>
        </Section>

        <Section title="Article 12 — Données personnelles">
          <p>
            Les données collectées dans le cadre des commandes sont traitées
            conformément à notre{' '}
            <Link href="/politique-confidentialite" className="text-gold-dark hover:underline">
              politique de confidentialité
            </Link>.
          </p>
        </Section>

        <Section title="Article 13 — Droit applicable">
          <p>
            Les présentes CGV sont régies par le droit français. Tout litige
            relatif à leur exécution ou à leur interprétation relève de la
            compétence des tribunaux français.
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
