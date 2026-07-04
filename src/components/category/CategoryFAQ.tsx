import Link from 'next/link'

/**
 * FAQ catégorie — questions génériques présentes sur chaque page catégorie.
 * → Enrichit le contenu (contre "thin content") côté Google
 * → Émet un schema.org/FAQPage
 * → Renforce le maillage sortant vers les pages piliers
 *
 * Les questions/réponses sont adaptées au nom de la catégorie (mobilier
 * de bureau, fauteuil, bureau, rangement, etc.).
 */

type CategoryFAQProps = {
  categoryName: string
  fromPriceLabel?: string
  productCount: number
}

type QA = { q: string; a: string; aHtml?: React.ReactNode }

function buildFAQ({ categoryName, fromPriceLabel, productCount }: CategoryFAQProps): QA[] {
  const lower = categoryName.toLowerCase()
  const qa: QA[] = []

  qa.push({
    q: `Pourquoi acheter un ${singular(lower)} reconditionné plutôt que neuf ?`,
    a: `Le mobilier de bureau professionnel (Steelcase, Herman Miller, Haworth, Vitra…) est conçu pour 10 à 15 ans d'usage intensif. Un ${singular(lower)} reconditionné offre la qualité mécanique et le confort du haut de gamme à 40 à 70 % du prix neuf, avec une empreinte carbone divisée par 4 à 6. C'est le meilleur rapport qualité / durabilité / prix du marché, et un choix concret pour votre bilan RSE.`,
    aHtml: (
      <>
        Le mobilier de bureau professionnel (Steelcase, Herman Miller, Haworth,
        Vitra…) est conçu pour <strong className="text-ink">10 à 15 ans</strong>{' '}
        d&apos;usage intensif. Un {singular(lower)} reconditionné offre la
        qualité mécanique et le confort du haut de gamme à{' '}
        <strong className="text-ink">40 à 70 % du prix neuf</strong>, avec une{' '}
        empreinte carbone divisée par 4 à 6. C&apos;est le meilleur rapport
        qualité / durabilité / prix du marché, et un choix concret pour votre{' '}
        <Link
          href="/attestation-rse"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          bilan RSE
        </Link>
        .
      </>
    ),
  })

  qa.push({
    q: `Où contrôlez-vous les ${lower} avant la vente ?`,
    a: `Tout se passe dans notre propre atelier à La Penne-sur-Huveaune (à 5 minutes d'Aubagne, 20 minutes de Marseille). Chaque pièce passe par un contrôle qualité en 7 points : structure, mécanismes, vérins, revêtement, nettoyage, sécurité et finition esthétique. Les pièces sont ensuite classées selon notre grille 5 niveaux (neuf, excellent, très bon, bon, correct). Notre équipe technique intervient physiquement sur chaque produit et reste joignable directement après achat.`,
    aHtml: (
      <>
        Tout se passe dans{' '}
        <strong className="text-ink">notre propre atelier</strong> à La
        Penne-sur-Huveaune (5 min d&apos;Aubagne, 20 min de Marseille). Chaque
        pièce passe par un{' '}
        <strong className="text-ink">contrôle qualité en 7 points</strong> :
        structure, mécanismes, vérins, revêtement, nettoyage, sécurité et
        finition esthétique. Les pièces sont ensuite classées selon notre
        grille 5 niveaux (neuf, excellent, très bon, bon, correct). Le détail
        est publié dans notre{' '}
        <Link
          href="/charte-qualite"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          charte qualité
        </Link>
        . Notre équipe reste joignable directement après achat, sans
        passer par un SAV externalisé.
      </>
    ),
  })

  qa.push({
    q: `Livrez-vous les ${lower} à Marseille et dans la région PACA ?`,
    a: `Oui, nous livrons depuis notre atelier de La Penne-sur-Huveaune vers toute la région : Marseille, Aubagne, Aix-en-Provence, La Ciotat, Toulon, Avignon, Orange, Nice. Le retrait au showroom reste gratuit du lundi au samedi. Pour la livraison, le devis inclut la manutention et la mise en place — indiquez-nous simplement l'étage et la présence d'ascenseur.`,
    aHtml: (
      <>
        Oui, nous livrons depuis notre atelier de La Penne-sur-Huveaune vers
        toute la région :{' '}
        <Link
          href="/bureau-occasion-marseille"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          Marseille
        </Link>
        ,{' '}
        <Link
          href="/bureau-occasion-aubagne"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          Aubagne
        </Link>
        ,{' '}
        <Link
          href="/bureau-occasion-aix-en-provence"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          Aix-en-Provence
        </Link>
        ,{' '}
        <Link
          href="/bureau-occasion-la-ciotat"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          La Ciotat
        </Link>
        ,{' '}
        <Link
          href="/bureau-occasion-toulon"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          Toulon
        </Link>
        ,{' '}
        <Link
          href="/bureau-occasion-avignon"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          Avignon
        </Link>
        , Orange, Nice. Retrait{' '}
        <strong className="text-ink">gratuit</strong> au showroom du lundi au
        samedi. La livraison inclut manutention et mise en place.
      </>
    ),
  })

  qa.push({
    q: `Combien de ${lower} avez-vous en stock ?`,
    a:
      productCount > 0
        ? `Actuellement ${productCount} ${productCount > 1 ? 'pièces disponibles' : 'pièce disponible'} sur cette catégorie, mais notre stock évolue chaque semaine — nous recevons régulièrement de nouveaux lots issus de vidages de locaux professionnels dans la région. Si vous cherchez un modèle précis ou un volume important, contactez-nous : nous pouvons rechercher dans notre réseau.`
        : `Notre stock évolue chaque semaine. Cette catégorie est momentanément vide, mais des lots issus de vidages de locaux arrivent régulièrement. Contactez-nous en indiquant vos besoins — nous vous préviendrons dès l'arrivée d'une pièce correspondante, souvent sous 2 à 4 semaines.`,
    aHtml: null,
  })

  qa.push({
    q: `Puis-je équiper toute mon entreprise (open-space, plusieurs postes) ?`,
    a: `Oui, une grande partie de notre activité consiste à équiper des PME, cabinets et startups qui ouvrent ou déménagent. Nous pouvons composer des lots homogènes (mêmes fauteuils, mêmes bureaux, mêmes cloisonnements) et proposer des remises volume à partir de 5 postes. Un rendez-vous conseil au showroom permet de tester le confort avant validation.`,
    aHtml: (
      <>
        Oui, une grande partie de notre activité consiste à équiper des PME,
        cabinets et startups qui ouvrent ou déménagent. Nous composons des{' '}
        <strong className="text-ink">lots homogènes</strong> (mêmes fauteuils,
        mêmes bureaux, mêmes cloisonnements) avec{' '}
        <strong className="text-ink">remises volume dès 5 postes</strong>. Un{' '}
        <Link
          href="/contact"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          rendez-vous conseil
        </Link>{' '}
        au showroom permet de tester le confort avant validation. Voir aussi{' '}
        <Link
          href="/mobilier-bureau-professionnel"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          notre offre professionnels
        </Link>
        .
      </>
    ),
  })

  qa.push({
    q: `Faites-vous la reprise de mon ancien mobilier ?`,
    a: `Oui. Si vous renouvelez votre équipement ou libérez des locaux, nous proposons rachat, échange en avoir ou vidage avec attestation RSE selon l'état, la marque et le volume. Une visite gratuite sur site est proposée pour établir un chiffrage précis dans la région PACA.`,
    aHtml: (
      <>
        Oui. Si vous renouvelez votre équipement ou libérez des locaux, nous
        proposons{' '}
        <Link
          href="/rachat-mobilier-bureau"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          rachat
        </Link>
        , échange en avoir ou{' '}
        <Link
          href="/vidage-de-locaux"
          className="text-gold-dark underline underline-offset-2 hover:text-gold"
        >
          vidage avec attestation RSE
        </Link>{' '}
        selon l&apos;état, la marque et le volume. Visite gratuite sur site
        pour un chiffrage précis dans toute la région PACA.
      </>
    ),
  })

  if (fromPriceLabel) {
    qa.push({
      q: `Quel budget prévoir pour un ${singular(lower)} reconditionné ?`,
      a: `${fromPriceLabel} pour cette catégorie chez Mobilier Malin. Les tarifs varient selon la marque, l'état (neuf / excellent / très bon), les options (accoudoirs, appuie-tête, mécanismes synchrones…) et parfois la couleur du revêtement. Tous nos prix sont affichés TTC, facture professionnelle avec TVA remise à chaque commande.`,
      aHtml: null,
    })
  }

  return qa
}

function singular(name: string): string {
  // "bureaux individuels" → "bureau individuel", "fauteuils ergonomiques" → "fauteuil ergonomique"
  return name
    .replace(/\baux\b/g, 'au')
    .replace(/aux\s/g, 'au ')
    .replace(/eaux\s/g, 'eau ')
    .replace(/s\b/g, '')
    .replace(/\bles\b/g, 'le')
    .replace(/\bdes\b/g, 'de')
    .trim()
}

export function CategoryFAQ(props: CategoryFAQProps) {
  const items = buildFAQ(props)

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
    <section
      className="container py-14 md:py-20 max-w-3xl"
      aria-labelledby="category-faq-heading"
    >
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center mb-10">
        <p className="eyebrow">Questions fréquentes</p>
        <h2 id="category-faq-heading" className="text-h1 font-serif mt-2">
          Vos questions sur les {props.categoryName.toLowerCase()}
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
