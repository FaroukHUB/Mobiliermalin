import Link from 'next/link'

/**
 * FAQ produit — questions génériques présentes sur chaque fiche.
 * → Enrichit le contenu (contre "thin content") côté Google
 * → Émet un schema.org/FAQPage pour un rich-snippet potentiel
 * → Ajoute du maillage sortant vers les pages piliers (charte-qualité,
 *   attestation-rse, vidage-de-locaux, contact)
 *
 * Les questions/réponses sont volontairement adaptées au contexte
 * "mobilier de bureau reconditionné" et parlent au visiteur, pas à
 * Google. Elles varient légèrement selon la marque et la condition
 * pour éviter le "duplicate content" strict entre fiches.
 */

type ProductFAQProps = {
  productName: string
  brand?: string
  conditionLabel?: string | null
  categoryName?: string
  stock: number
}

type QA = { q: string; a: string; aHtml?: React.ReactNode }

function buildFAQ({ productName, brand, conditionLabel, categoryName, stock }: ProductFAQProps): QA[] {
  const qa: QA[] = []

  // 1. État
  qa.push({
    q: conditionLabel
      ? `Que signifie « ${conditionLabel.toLowerCase()} » pour ce ${categoryName?.toLowerCase() || 'produit'} ?`
      : `Dans quel état est ce ${categoryName?.toLowerCase() || 'produit'} ?`,
    a: `Chaque pièce est notée selon notre grille interne 5 niveaux (neuf, excellent, très bon, bon, correct). Un contrôle qualité en 7 points est réalisé avant la mise en vente : structure, mécanismes, revêtement, propreté, sécurité, esthétique et fonctionnalité. Le détail est consultable sur notre page charte qualité.`,
    aHtml: (
      <>
        Chaque pièce est notée selon notre grille interne 5 niveaux (neuf,
        excellent, très bon, bon, correct). Un{' '}
        <strong className="text-ink">contrôle qualité en 7 points</strong> est
        réalisé avant la mise en vente : structure, mécanismes, revêtement,
        propreté, sécurité, esthétique et fonctionnalité. Le détail est
        consultable sur notre{' '}
        <Link href="/charte-qualite" className="text-gold-dark underline underline-offset-2 hover:text-gold">
          charte qualité
        </Link>
        .
      </>
    ),
  })

  // 2. Atelier local (ex-garantie)
  qa.push({
    q: `Où et comment est préparé ${productName} avant la vente ?`,
    a: `Chaque pièce est démontée, contrôlée et préparée dans notre propre atelier au 18 chemin Noël Robion, 13821 La Penne-sur-Huveaune. Notre équipe technique intervient sur chaque produit avant sa mise en vente — rien n'est expédié sans contrôle physique. Vous pouvez d'ailleurs passer voir l'atelier et le showroom sur rendez-vous — nos clients particuliers comme professionnels sont libres d'essayer avant d'acheter, et de contacter directement l'équipe qui a préparé leur pièce.`,
    aHtml: (
      <>
        Chaque pièce est démontée, contrôlée et préparée dans{' '}
        <strong className="text-ink">notre propre atelier</strong> au 18 chemin
        Noël Robion, 13821 La Penne-sur-Huveaune. Notre équipe technique
        intervient sur chaque produit avant sa mise en vente — rien
        n&apos;est expédié sans contrôle physique. Vous pouvez
        d&apos;ailleurs passer voir
        l&apos;atelier et le showroom{' '}
        <Link
          href="/contact"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          sur rendez-vous
        </Link>{' '}
        — nos clients sont libres d&apos;essayer avant d&apos;acheter, et de
        contacter directement l&apos;équipe qui a préparé leur pièce. Les{' '}
        <Link
          href="/retractation"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          garanties légales
        </Link>{' '}
        (conformité, vices cachés) s&apos;appliquent en plus.
      </>
    ),
  })

  // 3. Retrait / livraison
  qa.push({
    q: `Comment récupérer ${productName} ?`,
    a: `Deux options : 1) Retrait gratuit à notre showroom du 18 chemin Noël Robion, 13821 La Penne-sur-Huveaune, du lundi au samedi entre 10h et 18h (créneau à réserver après paiement) ; 2) Livraison sur devis à Marseille, Aubagne, Aix-en-Provence, La Ciotat, Toulon et dans toute la région PACA — l'aide au déchargement et à la mise en place est incluse.`,
    aHtml: (
      <>
        Deux options : <strong className="text-ink">retrait gratuit</strong> à
        notre showroom du 18 chemin Noël Robion, 13821 La Penne-sur-Huveaune,
        du lundi au samedi entre 10h et 18h (créneau réservé après paiement) ;
        ou <strong className="text-ink">livraison sur devis</strong> à{' '}
        <Link href="/bureau-occasion-marseille" className="text-gold-dark underline underline-offset-2 hover:text-gold">
          Marseille
        </Link>
        ,{' '}
        <Link href="/bureau-occasion-aubagne" className="text-gold-dark underline underline-offset-2 hover:text-gold">
          Aubagne
        </Link>
        ,{' '}
        <Link href="/bureau-occasion-aix-en-provence" className="text-gold-dark underline underline-offset-2 hover:text-gold">
          Aix
        </Link>
        , La Ciotat, Toulon et dans toute la région PACA — aide au déchargement
        et mise en place incluses.
      </>
    ),
  })

  // 4. Stock / quantités disponibles
  qa.push({
    q: `Combien d'exemplaires sont disponibles ?`,
    a:
      stock > 1
        ? `Nous avons actuellement ${stock} exemplaires en stock. Pour équiper plusieurs postes de travail simultanément, contactez-nous : selon la quantité et le modèle, une remise volume peut s'appliquer, et nous pouvons également chercher des unités supplémentaires dans notre réseau.`
        : stock === 1
          ? `Il ne reste qu'une seule pièce disponible sur cette référence. Si vous avez besoin de plusieurs exemplaires du même modèle, contactez-nous : notre stock évolue chaque semaine et nous pouvons rechercher des unités identiques dans notre réseau d'entreprises partenaires.`
          : `Cette référence est actuellement en rupture. Nous recevons de nouveaux lots régulièrement — écrivez-nous avec vos besoins, nous vous préviendrons dès l'arrivée d'un équivalent, souvent sous 2 à 4 semaines.`,
    aHtml: null,
  })

  // 5. Facturation TVA (spécifique B2B)
  qa.push({
    q: `Puis-je recevoir une facture avec TVA pour ma comptabilité ?`,
    a: `Oui, tous nos prix sont affichés TTC et une facture conforme (avec numéro TVA intracommunautaire FR39894410729) est émise automatiquement à chaque commande. Elle est envoyée par email dès la validation du paiement et intègre toutes les mentions légales requises : SIREN, adresse siège, taux de TVA appliqué. Utilisable pour votre comptabilité, votre bilan carbone et vos rapports RSE.`,
    aHtml: null,
  })

  // 6. Reprise / rachat (accroche RSE + maillage)
  qa.push({
    q: `Puis-je faire reprendre mon ancien mobilier lors de la commande ?`,
    a: `Oui. Si vous équipez de nouveaux postes tout en vidant d'anciens locaux ou en remplaçant du mobilier existant, nous proposons une prestation de rachat ou de vidage. Selon l'état, la marque et le volume, cela peut prendre la forme d'un rachat cash, d'un échange en avoir, ou d'un simple débarras avec attestation RSE.`,
    aHtml: (
      <>
        Oui. Si vous équipez de nouveaux postes tout en vidant d&apos;anciens
        locaux ou en remplaçant du mobilier existant, nous proposons une
        prestation de{' '}
        <Link href="/rachat-mobilier-bureau" className="text-gold-dark underline underline-offset-2 hover:text-gold">
          rachat
        </Link>{' '}
        ou de{' '}
        <Link href="/vidage-de-locaux" className="text-gold-dark underline underline-offset-2 hover:text-gold">
          vidage de locaux
        </Link>
        . Selon l&apos;état, la marque et le volume, cela peut prendre la forme
        d&apos;un rachat cash, d&apos;un échange en avoir, ou d&apos;un simple
        débarras avec attestation RSE.
      </>
    ),
  })

  // 7. Marque (si connue) → renforce l'expertise
  if (brand) {
    qa.push({
      q: `Pourquoi choisir un ${categoryName?.toLowerCase() || 'produit'} ${brand} d'occasion plutôt qu'un neuf premier prix ?`,
      a: `Les modèles ${brand} sont conçus pour un usage professionnel intensif (10 à 15 ans de vie en entreprise). Un ${brand} reconditionné offre une qualité mécanique et un confort largement supérieurs à un équivalent neuf d'entrée de gamme au même prix, avec une empreinte carbone divisée par 4 à 6. C'est le meilleur rapport qualité/durabilité/prix du marché.`,
      aHtml: null,
    })
  }

  return qa
}

export function ProductFAQ(props: ProductFAQProps) {
  const items = buildFAQ(props)

  // JSON-LD FAQPage — Google peut afficher un rich-snippet
  // (déroulés directement dans le SERP).
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((qa) => ({
      '@type': 'Question',
      name: qa.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.a,
      },
    })),
  }

  return (
    <section className="container py-14 md:py-20 max-w-3xl" aria-labelledby="product-faq-heading">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center mb-10">
        <p className="eyebrow">Vos questions</p>
        <h2 id="product-faq-heading" className="text-h1 font-serif mt-2">
          Ce qu&apos;il faut savoir avant de commander
        </h2>
        <div className="gold-divider mt-6" />
      </div>

      <div className="space-y-3">
        {items.map((qa, i) => (
          <details
            key={i}
            className="group bg-ivory-light border border-line hover:border-gold/40 transition-colors"
          >
            <summary className="cursor-pointer p-5 md:p-6 flex items-center justify-between gap-4 list-none">
              <span className="font-serif text-base md:text-lg text-ink leading-snug">
                {qa.q}
              </span>
              <span className="text-gold text-2xl transition-transform group-open:rotate-45 leading-none shrink-0">
                +
              </span>
            </summary>
            <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-ink-soft leading-relaxed">
              {qa.aHtml ?? qa.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
