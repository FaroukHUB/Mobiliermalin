const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

/**
 * Schema.org JSON-LD : Organization + LocalBusiness + WebSite.
 *
 * Crucial pour le SEO local (Google Maps, Knowledge Graph, rich snippets
 * avec note Google). Injecté depuis (frontend)/layout.tsx.
 *
 * Les URLs `logoUrl` et `imageUrl` viennent de Sanity (settings.logoOnLight
 * + settings.ogImage). Fallbacks vers /logo.png et /og-image.jpg pour
 * conserver la validité du schema tant que ces fichiers ne sont pas
 * uploadés dans Sanity — mais tout admin peut les remplacer via Studio
 * sans redéploiement.
 */

type Props = {
  logoUrl?: string
  imageUrl?: string
}

export function OrganizationSchema({ logoUrl, imageUrl }: Props = {}) {
  const logo = logoUrl || `${siteUrl}/logo.png`
  const image = imageUrl || logoUrl || `${siteUrl}/og-image.jpg`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Mobilier Malin',
        legalName: 'SARL 2 M',
        url: siteUrl,
        logo,
        description:
          "Mobilier de bureau d'exception reconditionné. Steelcase, Herman Miller, Haworth, Vitra à -60% du prix neuf. Atelier & showroom à La Penne-sur-Huveaune, livraison France.",
        foundingDate: '2021',
        sameAs: [
          'https://www.facebook.com/mobiliermalin',
          'https://www.instagram.com/mobiliermalin',
          'https://www.linkedin.com/company/mobilier-malin',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+33-6-76-61-70-53',
          contactType: 'customer service',
          email: 'mobiliermalin@gmail.com',
          areaServed: 'FR',
          availableLanguage: ['French'],
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${siteUrl}/#localbusiness`,
        name: 'Mobilier Malin',
        image,
        url: siteUrl,
        telephone: '+33-6-76-61-70-53',
        email: 'mobiliermalin@gmail.com',
        priceRange: '€€',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '18 chemin Noël Robion',
          addressLocality: 'La Penne-sur-Huveaune',
          postalCode: '13821',
          addressRegion: 'Provence-Alpes-Côte d\'Azur',
          addressCountry: 'FR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 43.286,
          longitude: 5.541,
        },
        areaServed: [
          { '@type': 'City', name: 'Marseille' },
          { '@type': 'City', name: 'Aubagne' },
          { '@type': 'City', name: 'Aix-en-Provence' },
          { '@type': 'City', name: 'La Penne-sur-Huveaune' },
          { '@type': 'AdministrativeArea', name: 'Provence-Alpes-Côte d\'Azur' },
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5.0',
          reviewCount: '9',
        },
      },
      // Politique de retour globale (référencée par @id dans les Offers Product).
      // Cohérent avec l'art. L221-18 du Code de la consommation : 14 jours
      // minimum pour B2C vente à distance. Google Merchant Center 2024+ exige
      // cette info pour la France.
      // ⚠ TODO vérif : `returnPolicyCategory` et `returnFees` valeurs enum à
      // confirmer sur developers.google.com/search/docs/appearance/structured-data/merchant-return-policy
      {
        '@type': 'MerchantReturnPolicy',
        '@id': `${siteUrl}/#return-policy`,
        applicableCountry: 'FR',
        returnPolicyCountry: 'FR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnShippingFees',
        returnShippingFeesAmount: {
          '@type': 'MonetaryAmount',
          value: 49,
          currency: 'EUR',
        },
      },
      // Frais de livraison France référencés globalement.
      // ⚠ TODO vérif : format `shippingDestination` avec plusieurs régions
      // (DROM à traiter séparément avec addressCountry différent).
      {
        '@type': 'OfferShippingDetails',
        '@id': `${siteUrl}/#shipping-fr`,
        name: 'Livraison France métropolitaine',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 49,
          currency: 'EUR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'FR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Mobilier Malin',
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'fr-FR',
        // NOTE : SearchAction laissé tant que la route /boutique?q= n'est pas
        // gérée côté serveur. À retirer OU implémenter le handler ?q pour
        // activer réellement la SiteLinks Search Box.
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/boutique?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
