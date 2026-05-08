const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

/**
 * Schema.org JSON-LD : Organization + LocalBusiness.
 * Crucial pour le SEO local (apparition dans Google Maps, Knowledge Graph,
 * rich snippets avec note Google, etc.)
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Mobilier Malin',
        legalName: 'SARL 2 M',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description:
          "Mobilier de bureau d'exception reconditionné. Steelcase, Herman Miller, Haworth, Vitra à -60% du prix neuf. Garanti 6 mois. Livraison France.",
        founder: {
          '@type': 'Person',
          name: 'Djamel Djennad',
        },
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
        image: `${siteUrl}/og-image.jpg`,
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
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Mobilier Malin',
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'fr-FR',
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
