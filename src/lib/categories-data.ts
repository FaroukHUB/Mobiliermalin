/**
 * Donnees statiques par categorie : description longue, prix de depart,
 * variantes, FAQ, traits editoriaux. Source de verite quand le client n'a
 * pas encore enrichi la collection Payload `categories`.
 *
 * Quand une categorie existe en base, ses champs (description, image, SEO)
 * surchargent ces valeurs par defaut.
 */

export type CategoryStaticData = {
  slug: string
  name: string
  shortTagline: string
  longDescription: string
  fromPriceLabel: string
  priceRange: { min: number; max: number | null }
  variants: string[]
  highlights: { title: string; body: string }[]
  faq: { q: string; a: string }[]
  fallbackImage: string
  fallbackImageAlt: string
}

export const CATEGORIES: CategoryStaticData[] = [
  {
    slug: 'bureaux-individuels',
    name: 'Bureaux individuels',
    shortTagline: 'Bureaux droits et en L reconditionnés, mélaminé ou bois',
    longDescription:
      "Postes de travail individuels en bon état, redonnés à neuf : plateaux mélaminé chêne, blanc, gris ou bois massif. Dimensions standard (120, 140, 160 cm) et configurations en L. Compatibles avec les caissons mobiles et les armoires de notre catalogue.",
    fromPriceLabel: 'À partir de 72 €',
    priceRange: { min: 72, max: 96 },
    variants: ['Bureau droit', 'Bureau en L', 'Mélaminé', 'Bois massif', 'Blanc', 'Gris', 'Bois clair'],
    highlights: [
      {
        title: 'Marques premium',
        body: 'Steelcase, Clen, Majencia, Haworth — selon arrivages.',
      },
      {
        title: 'Dimensions standard',
        body: '120 × 60, 140 × 80, 160 × 80 cm. Hauteur 72 cm. Compatibles caissons.',
      },
      {
        title: 'Plateaux solides',
        body: 'Mélaminé qualité contract ou bois véritable. Antichoc, anti-rayures.',
      },
    ],
    faq: [
      {
        q: 'Quelle dimension de bureau choisir ?',
        a: '120 cm pour un usage léger (laptop + dossier), 140 cm pour un poste classique avec écran 24", 160 cm pour un double écran ou un poste premium. Profondeur 60 cm minimum, 80 cm recommandée.',
      },
      {
        q: 'Le bureau est-il livré monté ?',
        a: 'Oui. Pour les commandes professionnelles (3 postes et +), le montage sur site est inclus. Pour les commandes uniques, le bureau est livré préassemblé ou avec une notice claire.',
      },
      {
        q: 'Puis-je composer un poste complet ?',
        a: 'Bien sûr — bureau + fauteuil ergonomique + caisson + armoire. Demandez-nous un devis personnalisé, nous proposons souvent des packs avec une remise sur l\'ensemble.',
      },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1400&q=80',
    fallbackImageAlt: 'Bureau individuel en bois clair',
  },
  {
    slug: 'fauteuils-ergonomiques',
    name: 'Fauteuils ergonomiques',
    shortTagline: 'Fauteuils Steelcase, Haworth, Herman Miller reconditionnés',
    longDescription:
      "Sièges ergonomiques de marques premium, inspectés et restaurés en atelier : nettoyage profond, remplacement des pièces d'usure (vérins, accoudoirs, tissus si nécessaire), test complet des réglages (hauteur, lombaire, accoudoirs, synchrone). Garantie 6 mois.",
    fromPriceLabel: 'À partir de 24 €',
    priceRange: { min: 24, max: 144 },
    variants: ['Steelcase', 'HÅG', 'Herman Miller', 'Haworth', 'Majencia', 'Avec accoudoirs', 'Synchrone', 'Filet/résille', 'Tissu'],
    highlights: [
      {
        title: 'Marques iconiques',
        body: 'Steelcase Think, Leap, Gesture · Herman Miller Aeron, Sayl · HÅG Capisco · Vitra ID Chair.',
      },
      {
        title: 'Réglages complets',
        body: 'Hauteur, profondeur d\'assise, soutien lombaire, accoudoirs 4D, mécanisme synchrone testés un par un.',
      },
      {
        title: 'Hygiène & nettoyage',
        body: 'Désinfection profonde, traitement anti-acariens, vapeur sur les tissus. Comme neuf.',
      },
    ],
    faq: [
      {
        q: 'Comment choisir un fauteuil ergonomique reconditionné ?',
        a: 'Privilégiez les marques premium (Steelcase, HÅG, Herman Miller) qui durent largement vingt ans. Le test : asseyez-vous, ajustez la hauteur, vérifiez le soutien lombaire, basculez en synchrone. Sur place à Aubagne, vous essayez avant d\'acheter.',
      },
      {
        q: 'Y a-t-il une garantie ?',
        a: 'Oui, 6 mois pièces et main-d\'œuvre sur tous les défauts qui ne seraient pas dus à un usage anormal. Si une pièce casse pendant cette période, on remplace ou on rembourse.',
      },
      {
        q: 'Puis-je acheter en gros pour mes équipes ?',
        a: 'Absolument. Nous travaillons régulièrement avec des entreprises qui équipent 20, 50 ou 200 postes. Tarifs dégressifs et délais garantis. Demandez un devis.',
      },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=1400&q=80',
    fallbackImageAlt: 'Fauteuil ergonomique de bureau noir',
  },
  {
    slug: 'armoires-rangements',
    name: 'Armoires & rangements',
    shortTagline: 'Armoires hautes, basses, métal ou bois',
    longDescription:
      'Armoires de rangement professionnelles, restaurées dans nos ateliers. Portes battantes ou coulissantes, à serrure, en métal robuste ou mélaminé. Hauteurs disponibles : monobloc 105 cm, hautes 180 cm. Plusieurs coloris (gris, blanc, gris-marron, métal naturel).',
    fromPriceLabel: 'À partir de 96 €',
    priceRange: { min: 96, max: 156 },
    variants: ['Armoire haute', 'Armoire basse', 'Monobloc', 'Métal', 'Mélaminé', 'Portes battantes', 'Portes coulissantes', 'Serrure'],
    highlights: [
      {
        title: 'Robustesse pro',
        body: 'Acier qualité contract, charnières et serrures testées, portes alignées et silencieuses.',
      },
      {
        title: 'Capacité réelle',
        body: 'Étagères réglables, charge admissible 30 à 50 kg/étagère selon modèle.',
      },
      {
        title: 'Coloris harmonisés',
        body: 'Gris, blanc, gris-marron, métal brut. Pour s\'intégrer aux palettes de bureau modernes.',
      },
    ],
    faq: [
      {
        q: 'Quelle différence entre armoire haute et armoire basse ?',
        a: 'L\'armoire haute (180 cm, 4-5 niveaux) est idéale pour archiver classeurs et dossiers en volume. L\'armoire basse (105 cm) sert souvent de poste de classement à hauteur de bureau ou de plan d\'appoint.',
      },
      {
        q: 'Les serrures fonctionnent-elles ?',
        a: 'Oui, toutes nos armoires reconditionnées sont vérifiées : serrure opérationnelle, deux clés fournies. Si une serrure manque ou ne ferme plus, nous la remplaçons en atelier avant la mise en vente.',
      },
      {
        q: 'Livrez-vous les armoires hautes ?',
        a: 'Oui, partout en France. Pour les armoires hautes (180 cm), notre équipe passe par les ascenseurs ou monte par l\'escalier. Précisez l\'étage et la présence d\'ascenseur dans votre demande de devis.',
      },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1400&q=80',
    fallbackImageAlt: 'Armoire de bureau métallique grise',
  },
  {
    slug: 'chaises-accueil-reunion',
    name: 'Chaises d\'accueil & réunion',
    shortTagline: 'Chaises empilables ou avec roulettes, plusieurs coloris',
    longDescription:
      'Chaises pour salles de réunion, espaces d\'accueil, cantines, open-spaces. Modèles empilables pour optimiser le rangement, ou chaises avec roulettes pour le confort durant les réunions longues. Plusieurs coloris (bleu, gris, noir, orange, vert, blanc) — souvent plusieurs unités identiques en stock.',
    fromPriceLabel: 'À partir de 36 €',
    priceRange: { min: 36, max: 150 },
    variants: ['Empilable', 'Avec roulettes', 'Multicolore', 'Pour réunion', 'Pour accueil', 'Sans accoudoirs', 'Avec accoudoirs'],
    highlights: [
      {
        title: 'Lots disponibles',
        body: 'Stocks souvent par lots de 4, 6, 8 unités identiques — parfait pour équiper salle entière.',
      },
      {
        title: 'Empilables et compactes',
        body: 'Jusqu\'à 8 chaises empilées sur 1 mètre de hauteur. Idéal pour cantines et salles polyvalentes.',
      },
      {
        title: 'Coloris coordonnés',
        body: 'Composez votre palette : monochrome, bicolore, ou multicolore pour un effet créatif.',
      },
    ],
    faq: [
      {
        q: 'Y a-t-il des lots de plusieurs chaises identiques ?',
        a: 'Oui, c\'est même fréquent. Quand nous reprenons un parc d\'entreprise, nous récupérons souvent 6 à 50 chaises identiques. Demandez-nous quels lots sont disponibles, certains ne sont pas listés en ligne.',
      },
      {
        q: 'Puis-je commander 30 chaises pour une salle de cantine ?',
        a: 'Oui — c\'est notre quotidien. Empilables, dans la couleur de votre choix selon disponibilité, livrées et installées. Nous travaillons avec des collectivités, des écoles et des restaurants d\'entreprise.',
      },
      {
        q: 'Les roulettes peuvent-elles être remplacées par des patins ?',
        a: 'Oui, la plupart des modèles permettent un changement roulettes / patins. Préciser au devis si vous voulez du tout-fixe ou du tout-mobile.',
      },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=1400&q=80',
    fallbackImageAlt: 'Chaises de réunion design alignées',
  },
  {
    slug: 'tables-de-reunion',
    name: 'Tables de réunion',
    shortTagline: 'Tables rondes, ovales, carrées, rectangulaires',
    longDescription:
      'Tables de réunion reconditionnées dans toutes les configurations : rondes pour les petits comités, rectangulaires pour les boards, ovales pour combiner conversation et hiérarchie, carrées pour les cantines et salles polyvalentes. Plateaux bois ou verre, piétements métal ou bois.',
    fromPriceLabel: 'À partir de 108 €',
    priceRange: { min: 108, max: 600 },
    variants: ['Ronde', 'Carrée', 'Rectangulaire', 'Ovale', 'Plateau bois', 'Plateau verre', 'Piétement métal', 'Piétement bois'],
    highlights: [
      {
        title: 'Toutes formes',
        body: 'De la table ronde 110 cm pour 4 personnes à la table de boardroom 320 cm pour 12.',
      },
      {
        title: 'Plateaux qualité',
        body: 'Verre trempé, bois véritable, mélaminé épais — résistants à l\'usage quotidien et aux taches.',
      },
      {
        title: 'Stabilité testée',
        body: 'Piétements vissés et serrés en atelier. Aucune table ne quitte notre showroom sans test de stabilité.',
      },
    ],
    faq: [
      {
        q: 'Combien de personnes une table peut-elle accueillir ?',
        a: 'Indicatif : 110 cm rond = 4 places, 140 cm carré = 4-6 places, 180 cm rectangulaire = 6 places, 240 cm = 8 places, 320 cm ovale = 10-12 places. Comptez 60 cm de large par personne.',
      },
      {
        q: 'Comment livrez-vous les grandes tables ?',
        a: 'Démontées au besoin (plateau séparé du piétement) puis remontées sur site par notre équipe. Pour les très grandes tables (>240 cm), prévoir un accès suffisant : porte d\'1 m minimum, ascenseur grand format ou monte-charge.',
      },
      {
        q: 'Avez-vous des tables avec passe-câbles ?',
        a: 'Oui, plusieurs modèles disposent de trappes de sortie de câbles intégrées (idéal pour les salles équipées d\'écran de visio). À préciser dans votre demande.',
      },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80',
    fallbackImageAlt: 'Salle de réunion avec table en bois',
  },
  {
    slug: 'espaces-detente',
    name: 'Espaces détente',
    shortTagline: 'Lounge, canapés, poufs design',
    longDescription:
      'Mobilier d\'assise pour les espaces informels : zones d\'attente, coins café, salles de pause, espaces collaboratifs. Fauteuils lounge design, canapés modulaires, poufs colorés et chaises d\'accueil contemporaines pour créer des espaces conviviaux et créatifs.',
    fromPriceLabel: 'À partir de 60 €',
    priceRange: { min: 60, max: 600 },
    variants: ['Fauteuil lounge', 'Canapé', 'Pouf', 'Chaise d\'accueil', 'Design', 'Coloris vifs', 'Tissu', 'Cuir simili'],
    highlights: [
      {
        title: 'Pièces design',
        body: 'Fauteuils Vitra, Hay, Knoll, Steelcase Coalesse — souvent issus de showrooms ou sièges sociaux premium.',
      },
      {
        title: 'Coloris vivants',
        body: 'Au-delà du gris habituel : turquoise, orange, vert sapin, jaune moutarde, bordeaux. Pour réveiller vos espaces.',
      },
      {
        title: 'Confort longue durée',
        body: 'Mousses redensifiées si besoin, structures vérifiées, tissus nettoyés et défroissés.',
      },
    ],
    faq: [
      {
        q: 'À quoi sert un espace détente en entreprise ?',
        a: 'Salle de pause, attente clients, brainstorming informel, déjeuner collaboratif, sieste réparatrice. Les bureaux modernes consacrent 10 à 15 % de leur surface à ces zones — la productivité et le bien-être y gagnent fortement.',
      },
      {
        q: 'Les couleurs sont-elles personnalisables ?',
        a: 'Notre stock est ce qu\'il est — nous ne reteignons pas. Mais avec 200 pièces présentes en showroom, vous trouverez très souvent une combinaison qui correspond à votre charte.',
      },
      {
        q: 'Avez-vous des poufs pour les zones enfants / créatives ?',
        a: 'Oui, des poufs en simili cuir colorés et des chauffeuses modulaires régulièrement disponibles. Idéal pour pédagogie, espaces co-working ou kids corners.',
      },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1400&q=80',
    fallbackImageAlt: 'Espace détente avec fauteuils lounge colorés',
  },
  {
    slug: 'caissons',
    name: 'Caissons de bureau',
    shortTagline: 'Caissons mobiles ou fixes, avec serrure',
    longDescription:
      "Caissons de rangement à placer sous le bureau ou en complément. Modèles mobiles (sur roulettes) ou fixes, en métal ou mélaminé. 2 ou 3 tiroirs, dossiers suspendus possibles, serrure pour la confidentialité. Coloris variés (gris, blanc, bois, vert, bleu).",
    fromPriceLabel: 'À partir de 36 €',
    priceRange: { min: 36, max: 96 },
    variants: ['Mobile', 'Fixe', '2 tiroirs', '3 tiroirs', 'Avec serrure', 'Métal', 'Mélaminé', 'Dossiers suspendus'],
    highlights: [
      {
        title: 'Compatible tous bureaux',
        body: 'Largeur 42-48 cm, profondeur 58-60 cm — passe sous tous les plateaux standard 60 cm.',
      },
      {
        title: 'Tiroirs testés',
        body: 'Glissières silencieuses, butées de fin de course, serrure centralisée fonctionnelle, deux clés fournies.',
      },
      {
        title: 'Aussi en plus grand',
        body: 'Caissons 3 tiroirs avec tiroir bas pour dossiers suspendus disponibles.',
      },
    ],
    faq: [
      {
        q: 'Le caisson rentre-t-il sous mon bureau ?',
        a: 'La plupart des bureaux pro ont 70-72 cm de hauteur libre. Nos caissons mobiles font 55-60 cm de hauteur, ils passent largement. Pour les caissons fixes (qui s\'attachent au plateau), précisez la marque de votre bureau.',
      },
      {
        q: 'Peut-on commander un caisson seul ?',
        a: 'Bien sûr. Le caisson est un produit unitaire, vendu à partir de 36 € TTC. Livraison comprise dans le tarif global selon zone.',
      },
      {
        q: 'Les serrures sont-elles unifiées si j\'en commande plusieurs ?',
        a: 'Pas par défaut — chaque caisson a sa propre clé. Si vous voulez une serrure passe-partout pour tous vos caissons (utile en grand bureau), nous pouvons le réaliser sur demande, supplément modique.',
      },
    ],
    fallbackImage:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&q=80',
    fallbackImageAlt: 'Caisson de bureau à tiroirs',
  },
]

export function getCategoryBySlug(slug: string): CategoryStaticData | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function getCategoryRelated(slug: string, count = 3): CategoryStaticData[] {
  return CATEGORIES.filter((c) => c.slug !== slug).slice(0, count)
}
