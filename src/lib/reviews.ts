/**
 * Source unique des reviews Google réelles.
 *
 * Ces 3 avis sont vérifiables sur la fiche Google Business Profile de
 * Mobilier Malin. Ils sont utilisés :
 *   - dans le composant partagé CityReviews (affichage visuel)
 *   - dans l'OrganizationSchema (JSON-LD Organization + LocalBusiness)
 *
 * Ils ne doivent JAMAIS être injectés en JSON-LD aggregateRating au
 * niveau d'une page ville distante — Google détecterait la duplication
 * et pourrait pénaliser le domaine. Le rating agrégé reste uniquement
 * au niveau de l'entité Organization (source unique).
 */

export type GoogleReview = {
  author: string
  date: string       // YYYY-MM
  text: string
  context: string
}

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    author: 'Hafid Soual',
    date: '2025-12',
    text: "J'ai équipé mes bureaux avec l'aide de Mobilier Malin ce qui m'a permis de réaliser de belles économies pour un matériel de qualité.",
    context: 'Équipement complet',
  },
  {
    author: 'Sirine M.',
    date: '2025-12',
    text: "Nous avons acheté du matériel professionnel juste incroyable. Les prix sont très attractifs et le vendeur est vraiment au top — petit message également pour les livreurs qui ont été au top.",
    context: 'Achat + livraison',
  },
  {
    author: 'Nono',
    date: '2026-02',
    text: "J'ai acheté un caisson avec dossiers suspendus, en bon état, en métal blanc comme je voulais. 30 € pas cher du tout.",
    context: 'Achat unitaire',
  },
]

// URL officielle de la fiche Google Business Profile pour laisser un avis
export const GOOGLE_REVIEW_URL =
  'https://g.page/r/CUtST0PM2AI0EBM/review'
