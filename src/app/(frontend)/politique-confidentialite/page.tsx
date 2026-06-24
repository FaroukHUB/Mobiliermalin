import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de protection des données personnelles du site mobiliermalin.com — finalités, base légale, durée de conservation, droits RGPD.',
  alternates: { canonical: '/politique-confidentialite' },
}

export default function ConfidentialitePage() {
  return (
    <article className="container py-16 md:py-20 max-w-3xl">
      <p className="eyebrow">Protection des données</p>
      <h1 className="text-display mt-4 font-serif">Politique de confidentialité</h1>
      <div className="gold-divider mx-0 mt-6" />
      <p className="mt-6 text-sm text-ink-mute">
        Dernière mise à jour : juin 2026.
      </p>

      <div className="mt-10 space-y-10 text-ink-soft leading-relaxed">
        <Section title="1. Responsable du traitement">
          <p>
            Le responsable du traitement des données personnelles collectées
            sur le site mobiliermalin.com est la{' '}
            <strong className="text-ink">{LEGAL.formeJuridique} {LEGAL.raisonSociale}</strong>,
            représentée par son gérant <strong className="text-ink">{LEGAL.gerant}</strong>.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>Siège : {LEGAL.siegeSocial.ligne1}, {LEGAL.siegeSocial.codePostal} {LEGAL.siegeSocial.ville}</li>
            <li>
              Contact :{' '}
              <a href={`mailto:${LEGAL.email}`} className="text-gold-dark hover:underline">
                {LEGAL.email}
              </a>
            </li>
          </ul>
          <p className="mt-4">
            Compte tenu de la taille de la structure, aucun Délégué à la
            Protection des Données (DPO) n&apos;a été désigné. Toute demande
            relative aux données personnelles peut être adressée à
            l&apos;email ci-dessus.
          </p>
        </Section>

        <Section title="2. Données collectées">
          <p>
            Mobilier Malin collecte uniquement les données strictement
            nécessaires à la fourniture de ses services :
          </p>
          <ul className="mt-4 space-y-3 text-[15px]">
            <li>
              <strong className="text-ink">Formulaire de contact &amp; devis</strong>{' '}
              — nom, email, téléphone, société (facultatif), description du
              besoin.
            </li>
            <li>
              <strong className="text-ink">Commande en ligne</strong> — nom,
              email, téléphone, adresse de livraison ou de retrait, créneau
              choisi.
            </li>
            <li>
              <strong className="text-ink">Paiement</strong> — aucune donnée
              bancaire n&apos;est collectée par Mobilier Malin&nbsp;: la
              saisie s&apos;effectue directement sur les serveurs de Stripe
              Payments Europe Ltd. (Dublin, Irlande), prestataire certifié
              PCI-DSS.
            </li>
            <li>
              <strong className="text-ink">Demande de rétractation</strong> —
              nom, email, téléphone, adresse, numéro de commande, produits
              concernés.
            </li>
          </ul>
          <p className="mt-4">
            <strong className="text-ink">Mesure d&apos;audience</strong> — sous
            réserve de votre consentement explicite via la bannière cookies,
            le site utilise Google Analytics 4 pour mesurer la fréquentation
            (pages vues, durée de visite, source de trafic). Les adresses IP
            sont anonymisées et aucune donnée identifiante n&apos;est partagée.
            Aucun pixel publicitaire ni outil de reciblage n&apos;est utilisé.
          </p>
        </Section>

        <Section title="3. Finalités du traitement">
          <p>Les données collectées sont utilisées exclusivement pour :</p>
          <ul className="mt-4 space-y-2 list-disc pl-5 text-[15px]">
            <li>répondre aux demandes de contact et établir les devis ;</li>
            <li>exécuter les commandes (préparation, retrait, livraison) ;</li>
            <li>envoyer les emails transactionnels (confirmation, suivi, accusé de rétractation) ;</li>
            <li>traiter les demandes de rétractation et les remboursements ;</li>
            <li>répondre aux obligations comptables et légales (facturation, conservation des pièces).</li>
          </ul>
        </Section>

        <Section title="4. Base légale">
          <p>Les traitements reposent sur les bases légales suivantes :</p>
          <ul className="mt-4 space-y-2 list-disc pl-5 text-[15px]">
            <li><strong className="text-ink">Exécution du contrat</strong> — pour les commandes et les devis acceptés.</li>
            <li><strong className="text-ink">Mesures précontractuelles</strong> — pour les demandes de contact et devis.</li>
            <li><strong className="text-ink">Obligation légale</strong> — pour la conservation des factures et pièces comptables (10 ans).</li>
            <li><strong className="text-ink">Intérêt légitime</strong> — pour le suivi de la relation client (réponses aux questions, etc.).</li>
          </ul>
        </Section>

        <Section title="5. Destinataires des données">
          <p>Les données sont accessibles à :</p>
          <ul className="mt-4 space-y-2 list-disc pl-5 text-[15px]">
            <li>l&apos;équipe de Mobilier Malin (gérant et collaborateurs) ;</li>
            <li>les prestataires techniques strictement nécessaires :
              <ul className="mt-2 space-y-1.5 list-[circle] pl-5 text-sm">
                <li><strong className="text-ink">Automattic Inc.</strong> (États-Unis) — hébergement du site via la plateforme WordPress.com ;</li>
                <li><strong className="text-ink">Stripe Payments Europe Ltd.</strong> (Irlande) — traitement des paiements ;</li>
                <li><strong className="text-ink">Brevo SAS</strong> (France) — envoi des emails transactionnels ;</li>
                <li><strong className="text-ink">Google LLC</strong> (États-Unis) — mesure d&apos;audience (Google Analytics 4), uniquement après consentement.</li>
              </ul>
            </li>
          </ul>
          <p className="mt-4">
            Les données ne sont jamais cédées, vendues ou louées à des tiers à
            des fins commerciales ou publicitaires.
          </p>
          <p className="mt-4">
            Les transferts vers les États-Unis (Automattic, Google) sont
            encadrés par les Clauses Contractuelles Types de la Commission
            européenne et le cadre de protection des données UE-États-Unis
            (Data Privacy Framework), auquel ces deux sociétés sont
            certifiées.
          </p>
        </Section>

        <Section title="6. Durée de conservation">
          <ul className="mt-2 space-y-3 text-[15px]">
            <li><strong className="text-ink">Données de prospects</strong> (formulaire de contact sans commande) : 3 ans à compter du dernier échange.</li>
            <li><strong className="text-ink">Données de clients</strong> (commandes) : 5 ans à compter de la fin de la relation commerciale.</li>
            <li><strong className="text-ink">Pièces comptables</strong> (factures, devis acceptés) : 10 ans conformément au Code de commerce.</li>
            <li><strong className="text-ink">Demandes de rétractation</strong> : 3 ans à compter de la demande, pour preuve de bonne exécution.</li>
          </ul>
        </Section>

        <Section title="7. Vos droits">
          <p>Conformément au RGPD et à la loi Informatique &amp; Libertés, vous disposez :</p>
          <ul className="mt-4 space-y-2 list-disc pl-5 text-[15px]">
            <li>d&apos;un <strong className="text-ink">droit d&apos;accès</strong> à vos données ;</li>
            <li>d&apos;un <strong className="text-ink">droit de rectification</strong> en cas d&apos;inexactitude ;</li>
            <li>d&apos;un <strong className="text-ink">droit à l&apos;effacement</strong> (« droit à l&apos;oubli »), sous réserve des obligations légales de conservation ;</li>
            <li>d&apos;un <strong className="text-ink">droit à la limitation</strong> du traitement ;</li>
            <li>d&apos;un <strong className="text-ink">droit à la portabilité</strong> de vos données ;</li>
            <li>d&apos;un <strong className="text-ink">droit d&apos;opposition</strong> au traitement.</li>
          </ul>
          <p className="mt-4">
            Pour exercer l&apos;un de ces droits, contactez-nous à{' '}
            <a href={`mailto:${LEGAL.email}`} className="text-gold-dark hover:underline">
              {LEGAL.email}
            </a>{' '}
            en précisant votre demande et en joignant si nécessaire un
            justificatif d&apos;identité. Réponse sous un mois.
          </p>
          <p className="mt-4">
            Vous disposez également du droit d&apos;introduire une réclamation
            auprès de la CNIL ({' '}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark hover:underline"
            >
              cnil.fr
            </a>
            ).
          </p>
        </Section>

        <Section title="8. Sécurité">
          <p>
            Mobilier Malin met en œuvre les mesures techniques et
            organisationnelles appropriées pour protéger vos données contre
            toute perte, altération ou accès non autorisé&nbsp;: chiffrement
            HTTPS sur l&apos;intégralité du site, paiements opérés sur des
            serveurs certifiés PCI-DSS, accès aux outils de gestion limité
            aux personnes autorisées et protégé par mots de passe forts.
          </p>
        </Section>

        <Section title="9. Cookies">
          <p>
            Le détail des cookies utilisés est précisé dans notre{' '}
            <Link href="/cookies" className="text-gold-dark hover:underline">
              politique de gestion des cookies
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
