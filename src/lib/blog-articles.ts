/**
 * Articles piliers du blog Mobilier Malin.
 * Objectif SEO : couvrir les requêtes informationnelles fortes
 * (comparatif marques, différence occasion/reconditionné, RSE)
 * et alimenter le maillage vers la boutique + les pages piliers.
 *
 * Structure normalisée pour rendu par /blog/[slug]/page.tsx.
 * Ajouter un article : dupliquer une entrée, changer slug + contenu.
 */

export type BlogSection = {
  heading: string
  id: string
  paragraphs: string[]
  bullets?: string[]
  callout?: { title: string; body: string; href: string; hrefLabel: string }
}

export type BlogArticle = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  category: 'Guides d\'achat' | 'Marques & modèles' | 'Écologie & RSE' | 'Aménagement'
  publishedAt: string // ISO
  updatedAt: string
  readMinutes: number
  excerpt: string
  heroImage: string
  heroImageAlt: string
  intro: string[]
  sections: BlogSection[]
  conclusion: string[]
  relatedSlugs: string[] // autres articles à recommander
  tags: string[]
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'comparatif-fauteuils-ergonomiques-steelcase-herman-miller-vitra',
    title:
      'Comparatif fauteuils ergonomiques : Steelcase, Herman Miller, Haworth, Vitra',
    metaTitle:
      'Steelcase vs Herman Miller vs Haworth vs Vitra : quel fauteuil ergonomique choisir ?',
    metaDescription:
      'Comparatif détaillé des 4 grandes marques de fauteuils ergonomiques professionnels. Points forts, morphologies adaptées, durée de vie, prix reconditionné.',
    category: 'Marques & modèles',
    publishedAt: '2026-06-25',
    updatedAt: '2026-06-25',
    readMinutes: 9,
    excerpt:
      'Leap, Aeron, Zody, ID Trim : les quatre modèles qui dominent les bureaux professionnels. Voici comment choisir en fonction de votre morphologie, de votre usage et de votre budget.',
    heroImage:
      'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=1600&q=80',
    heroImageAlt:
      'Fauteuils de bureau ergonomiques de marques Steelcase et Herman Miller alignés dans un showroom',
    intro: [
      'Sur le marché du mobilier de bureau professionnel, quatre marques concentrent l\'essentiel des ventes en Europe : Steelcase (leader mondial, historique), Herman Miller (icônes design américaines), Haworth (le "challenger" premium) et Vitra (design suisse-allemand haut de gamme). Choisir entre elles n\'est pas un problème de prestige — c\'est une question de morphologie, de posture de travail et de durée d\'usage quotidien.',
      'Nous croisons chaque semaine des dizaines de ces fauteuils dans notre atelier. Ce comparatif détaille ce que dix ans d\'usage réel en entreprise révèlent sur chaque marque, ce qu\'on remarque en démontant les mécanismes, et pour quel profil chaque modèle est le plus pertinent — que vous achetiez neuf ou reconditionné.',
    ],
    sections: [
      {
        id: 'steelcase-leap',
        heading: 'Steelcase Leap V2 — le consensus le plus solide',
        paragraphs: [
          'Le Leap V2 est probablement le fauteuil ergonomique le plus vendu au monde depuis 2006. Son mécanisme LiveBack, qui suit la courbure lombaire quand on s\'incline, reste une référence : la structure du dossier se déforme localement plutôt que globalement, ce qui maintient le contact avec le bas du dos même en position semi-inclinée.',
          'En atelier, la longévité est impressionnante : après 10 à 12 ans d\'usage bureau (2000 h/an), les Leap V2 conservent 90 % de leurs réglages fonctionnels. Les pièces d\'usure (vérin, mécanisme d\'inclinaison, accoudoirs 4D) sont standardisées et remplaçables — un point majeur pour la valeur reconditionnée.',
        ],
        bullets: [
          'Pour qui : usage 8h/jour, morphologies variées (le fauteuil s\'adapte largement), postures de travail intense (dev, comptabilité, design).',
          'Points forts : dossier LiveBack, accoudoirs 4D fluides, glissière d\'assise très longue (bon pour grandes tailles).',
          'Points faibles : le tissu d\'origine vieillit visuellement, moins "iconique" visuellement qu\'un Aeron.',
          'Budget reconditionné : à partir de ~450 € (versus 1 200 € neuf).',
        ],
      },
      {
        id: 'herman-miller-aeron',
        heading: 'Herman Miller Aeron — l\'icône design mais exigeante',
        paragraphs: [
          'L\'Aeron (créé en 1994, redesigné en 2016) est le plus connu et le plus reconnaissable des fauteuils ergonomiques. Sa maille Pellicle offre une aération unique et un maintien "flottant" qui plaît beaucoup — mais il faut choisir la bonne taille (A, B ou C) sous peine d\'inconfort. Contrairement au Leap qui pardonne, l\'Aeron sanctionne les erreurs de dimensionnement.',
          'La construction est très solide, les mécanismes durables. Le principal point faible du reconditionné : les coussins lombaires PostureFit et les accoudoirs vieillissent, et certaines pièces sont onéreuses à remplacer. Un Aeron reconditionné bien contrôlé reste néanmoins un excellent achat.',
        ],
        bullets: [
          'Pour qui : ceux qui privilégient l\'aération (climats chauds, forte chaleur corporelle), amateurs de design.',
          'Points forts : maille Pellicle respirante, esthétique iconique, structure quasi indestructible.',
          'Points faibles : nécessite le bon size (A, B, C), coussins PostureFit à contrôler.',
          'Budget reconditionné : à partir de ~550 € (versus 1 400 € neuf).',
        ],
      },
      {
        id: 'haworth-zody',
        heading: 'Haworth Zody — le meilleur rapport confort/prix',
        paragraphs: [
          'Le Zody, développé avec l\'Université de Michigan, est moins connu mais souvent préféré par les kinésithérapeutes et ergothérapeutes. Le double soutien lombaire indépendant (droite/gauche réglables séparément) est unique sur le marché — utile pour les scolioses, tensions musculaires, différences de longueur de jambes.',
          'La finition est légèrement moins premium qu\'un Steelcase, mais la mécanique est très fiable et se prête bien au reconditionnement. C\'est aussi souvent le meilleur ratio confort/prix dans le reconditionné.',
        ],
        bullets: [
          'Pour qui : personnes avec besoins ergonomiques spécifiques, bureaux longue durée.',
          'Points forts : double soutien lombaire réglable, très bon confort général.',
          'Points faibles : moins courant en occasion, esthétique plus sobre.',
          'Budget reconditionné : à partir de ~380 € (versus 900 € neuf).',
        ],
      },
      {
        id: 'vitra-id',
        heading: 'Vitra ID Trim / ID Air — le design haut de gamme',
        paragraphs: [
          'Vitra positionne ses fauteuils ID en concurrence directe avec Steelcase et Herman Miller mais avec un ADN plus européen et design. La série ID Trim (dossier rembourré) et ID Air (dossier maille) équipe une part importante des sièges sociaux prestigieux et cabinets d\'architectes.',
          'Le mécanisme FlowMotion est très fluide, moins "cliquant" qu\'un Steelcase. Le tissu et les mousses vieillissent bien. Attention en reconditionné : vérifier attentivement le mécanisme d\'inclinaison, qui peut se dérégler plus souvent que sur un Leap.',
        ],
        bullets: [
          'Pour qui : environnements design, direction, cabinets, showrooms.',
          'Points forts : esthétique remarquable, mécanisme FlowMotion très doux.',
          'Points faibles : mécanisme d\'inclinaison à contrôler en occasion, prix neuf élevé.',
          'Budget reconditionné : à partir de ~600 € (versus 1 500 € neuf).',
        ],
        callout: {
          title: 'Notre conseil',
          body: 'Ne choisissez pas un fauteuil sans l\'essayer 10-15 minutes. Notre showroom à La Penne-sur-Huveaune permet de tester les 4 marques sur rendez-vous — sans engagement.',
          href: '/contact',
          hrefLabel: 'Prendre rendez-vous',
        },
      },
      {
        id: 'quel-choisir',
        heading: 'Alors, lequel choisir ?',
        paragraphs: [
          'Le meilleur fauteuil est celui qui convient à votre morphologie et à votre usage réel — pas celui qui a la meilleure réputation. Si nous devions synthétiser dix ans d\'observation :',
        ],
        bullets: [
          'Vous voulez un choix "safe" qui convient à 90 % des morphologies : Steelcase Leap V2.',
          'Vous avez besoin d\'aération / vous êtes grande taille : Herman Miller Aeron (taille B ou C).',
          'Vous avez des besoins ergonomiques spécifiques (dos, scoliose) : Haworth Zody.',
          'Vous voulez un fauteuil qui incarne le "beau bureau" : Vitra ID Trim.',
          'Vous cherchez le meilleur rapport qualité/prix : Steelcase Leap ou Haworth Zody reconditionné.',
        ],
      },
    ],
    conclusion: [
      'Un fauteuil ergonomique professionnel reconditionné coûte 40 à 60 % de moins qu\'un neuf équivalent, dure encore 8 à 10 ans, et évite entre 60 et 120 kg de CO₂ par rapport à un achat neuf. Pour un investissement identique à un modèle "gaming" premier prix, vous obtenez un vrai fauteuil pensé pour 40 000 heures d\'usage.',
      'Notre stock évolue chaque semaine. Passez au showroom ou consultez la catégorie fauteuils ergonomiques pour voir ce qui est actuellement disponible.',
    ],
    relatedSlugs: [
      'occasion-vs-reconditionne-mobilier-bureau',
      'impact-ecologique-mobilier-bureau-reconditionne',
    ],
    tags: ['Fauteuils', 'Steelcase', 'Herman Miller', 'Haworth', 'Vitra'],
  },

  {
    slug: 'occasion-vs-reconditionne-mobilier-bureau',
    title:
      'Occasion, seconde main, reconditionné : quelle est la vraie différence ?',
    metaTitle:
      'Mobilier de bureau : occasion, seconde main, reconditionné, quelles différences ?',
    metaDescription:
      'Occasion, seconde main, upcycling, reconditionné : ces termes ne veulent pas dire la même chose. Voici les étapes concrètes qui distinguent chaque catégorie et l\'impact sur qualité et prix.',
    category: 'Guides d\'achat',
    publishedAt: '2026-06-18',
    updatedAt: '2026-06-18',
    readMinutes: 7,
    excerpt:
      'On voit passer les termes "occasion", "seconde main", "reconditionné" comme s\'ils étaient synonymes. Ils ne le sont pas. Voici la différence concrète, avec ce que ça implique pour le prix et la qualité.',
    heroImage:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80',
    heroImageAlt:
      'Atelier de reconditionnement de mobilier de bureau — démontage de fauteuils Steelcase',
    intro: [
      'Sur les plateformes en ligne, un fauteuil Steelcase à 200 € et un fauteuil Steelcase à 450 € portent souvent la même étiquette : "occasion". Pourtant, le premier arrive tel quel, avec ses défauts, ses odeurs, ses mécanismes fatigués. Le second sort d\'un atelier où il a été démonté, contrôlé, nettoyé, réparé. La différence de prix reflète des heures de travail, pas une marge arbitraire.',
      'Comprendre cette différence permet d\'éviter les mauvaises surprises, de comparer honnêtement les offres, et de savoir ce qu\'on paie exactement. Voici les 4 catégories qu\'on rencontre sur le marché du mobilier professionnel.',
    ],
    sections: [
      {
        id: 'occasion-brute',
        heading: '1. Occasion brute (ou "seconde main")',
        paragraphs: [
          'C\'est la catégorie qu\'on trouve sur Leboncoin, Vinted Pro, ou les marketplaces généralistes. Le mobilier est vendu tel qu\'il a été récupéré : ni nettoyé en profondeur, ni contrôlé, ni réparé. L\'acheteur assume l\'état réel du produit.',
          'Le prix est très bas (typiquement 20 à 40 % du prix neuf), mais c\'est aussi le plus risqué : mécanismes qui grincent, revêtement taché, odeurs persistantes, hauteur bloquée, garantie inexistante. Pour un particulier bricoleur, pourquoi pas. Pour équiper une entreprise, on déconseille formellement.',
        ],
        bullets: [
          'Prix : 20-40 % du neuf.',
          'Garantie : aucune ou 15 jours max.',
          'Contrôle : aucun.',
          'Public : particuliers ok pour bricoler.',
        ],
      },
      {
        id: 'seconde-vie',
        heading: '2. Seconde vie / seconde main "nettoyée"',
        paragraphs: [
          'Un cran au-dessus : le vendeur nettoie le mobilier (dépoussiérage, désinfection surface, éventuellement shampooing tissu), remplace parfois une pièce visiblement cassée, mais ne démonte pas et ne contrôle pas la mécanique interne.',
          'C\'est la formule la plus courante chez les revendeurs de mobilier d\'entreprise "économique". Le produit est présentable et fonctionne, mais rien ne garantit que le vérin, les articulations ou les mécanismes internes tiendront 2 ou 5 ans de plus.',
        ],
        bullets: [
          'Prix : 30-50 % du neuf.',
          'Garantie : 1 à 3 mois généralement.',
          'Contrôle : externe uniquement.',
          'Public : structures avec petit budget, usage léger.',
        ],
      },
      {
        id: 'reconditionne',
        heading: '3. Reconditionné — la vraie catégorie',
        paragraphs: [
          'Le reconditionnement, au sens propre, implique un démontage partiel ou complet, un contrôle mécanique de chaque composant, le remplacement systématique des pièces d\'usure (vérin, glissières, roulettes, joints), un nettoyage professionnel (parfois désinfection ozone), et une remise en état esthétique (retouches, tension du tissu, etc.).',
          'Un fauteuil reconditionné retrouve entre 85 % et 95 % de ses caractéristiques d\'origine. Il repart pour 8 à 12 ans d\'usage professionnel. C\'est aussi la catégorie qui bénéficie d\'une vraie garantie (6 mois pièces et main-d\'œuvre chez Mobilier Malin), parce que le revendeur connaît chaque pièce du produit.',
        ],
        bullets: [
          'Prix : 40-70 % du neuf.',
          'Garantie : 6 mois pièces et main-d\'œuvre.',
          'Contrôle : 7 points, mécanique interne + externe.',
          'Public : PME, cabinets, professionnels exigeants.',
        ],
        callout: {
          title: 'Ce que fait notre atelier',
          body: 'Voir en détail les 7 points de contrôle appliqués à chaque produit avant sa mise en vente.',
          href: '/charte-qualite',
          hrefLabel: 'Consulter la charte qualité',
        },
      },
      {
        id: 'upcycling',
        heading: '4. Upcycling — l\'esthétique avant le fonctionnel',
        paragraphs: [
          'L\'upcycling (ou "surcyclage") va plus loin : le mobilier est reconditionné puis relooké — nouveau revêtement personnalisé, plateau retapé, couleur repeinte. C\'est un choix esthétique fort, souvent pratiqué pour du mobilier de direction, showrooms, hôtels design.',
          'Le prix est en général comparable au reconditionné + le surcoût du relooking (100 à 400 € par pièce). Le produit est unique. Chez Mobilier Malin, nous proposons cette prestation sur demande — indiquez-nous le mobilier et le rendu souhaité, nous chiffrons.',
        ],
      },
      {
        id: 'comment-verifier',
        heading: 'Comment vérifier ce qu\'on vous vend vraiment ?',
        paragraphs: [
          'Quelques questions à poser au vendeur avant d\'acheter — les réponses vous diront immédiatement dans quelle catégorie vous êtes :',
        ],
        bullets: [
          'Le mobilier a-t-il été démonté et contrôlé ? Si oui, sur quels points précis ?',
          'Les pièces d\'usure (vérin, roulettes) sont-elles remplacées systématiquement ?',
          'Quelle est la durée de garantie et couvre-t-elle la mécanique ?',
          'Existe-t-il une charte qualité écrite et publique ?',
          'Le vendeur dispose-t-il d\'un atelier et pas seulement d\'un entrepôt ?',
        ],
      },
    ],
    conclusion: [
      'Le mot "occasion" cache donc des réalités très différentes. Un mobilier reconditionné coûte plus cher qu\'une occasion brute — mais le rapport confort / durabilité / risque est incomparable, surtout en usage professionnel intensif.',
      'Pour tout achat en volume ou pour équiper un poste sur lequel vous allez passer 8 heures par jour, privilégiez la catégorie 3 (reconditionné) : le surcoût est vite amorti par la durée de vie et l\'absence de mauvaises surprises.',
    ],
    relatedSlugs: [
      'comparatif-fauteuils-ergonomiques-steelcase-herman-miller-vitra',
      'impact-ecologique-mobilier-bureau-reconditionne',
    ],
    tags: ['Reconditionné', 'Guide', 'Occasion'],
  },

  {
    slug: 'impact-ecologique-mobilier-bureau-reconditionne',
    title:
      'Mobilier de bureau reconditionné : quel impact écologique réel ?',
    metaTitle:
      'Bilan carbone du mobilier de bureau reconditionné : les chiffres réels',
    metaDescription:
      'Combien de CO₂ évite-t-on avec un fauteuil ou un bureau reconditionné ? Analyse chiffrée et utilisation dans un bilan RSE d\'entreprise.',
    category: 'Écologie & RSE',
    publishedAt: '2026-06-10',
    updatedAt: '2026-06-10',
    readMinutes: 6,
    excerpt:
      'Un fauteuil reconditionné évite en moyenne 62 kg de CO₂. Un bureau, 140 kg. Voici comment ces chiffres sont calculés, et comment les valoriser dans votre rapport RSE.',
    heroImage:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
    heroImageAlt:
      'Bureau reconditionné dans un open-space professionnel — mobilier durable',
    intro: [
      'Depuis 2023, la CSRD (directive européenne sur le reporting extra-financier) oblige un nombre croissant d\'entreprises à publier des indicateurs environnementaux vérifiables. Le mobilier de bureau apparaît sous le scope 3 (émissions indirectes) et représente en moyenne 2 à 4 % du bilan carbone d\'une entreprise tertiaire.',
      'Le mobilier reconditionné y prend une place croissante — encore faut-il pouvoir chiffrer précisément l\'impact évité. Voici les données consolidées à partir des ACV (analyses de cycle de vie) publiques (ADEME, Steelcase, Vitra) et de notre propre suivi atelier.',
    ],
    sections: [
      {
        id: 'chiffres-cles',
        heading: 'Les chiffres par pièce',
        paragraphs: [
          'L\'empreinte carbone d\'un mobilier de bureau vient à 70-85 % de sa fabrication : extraction des matières premières, transformation (acier, aluminium, mousse polyuréthane, plastiques), transport, assemblage. Reconditionner évite tout ce cycle.',
          'Voici les valeurs médianes que nous constatons dans nos attestations RSE :',
        ],
        bullets: [
          'Fauteuil ergonomique professionnel : 62 kg CO₂ éq. évités (vs neuf équivalent).',
          'Bureau individuel (piètement + plateau) : 140 kg CO₂ éq. évités.',
          'Armoire métallique haute : 220 kg CO₂ éq. évités.',
          'Table de réunion 6 places : 380 kg CO₂ éq. évités.',
          'Caisson mobile 3 tiroirs : 45 kg CO₂ éq. évités.',
        ],
      },
      {
        id: 'equipement-pme',
        heading: 'À l\'échelle d\'une PME',
        paragraphs: [
          'Prenons un exemple concret : une entreprise de 20 collaborateurs qui équipe ses postes en reconditionné plutôt qu\'en neuf. Chaque poste comprend en moyenne un bureau, un fauteuil, un caisson et une part de mobilier commun (armoires, salles de réunion).',
          'Impact évité par poste : environ 320 kg de CO₂ éq. Pour 20 postes, cela représente 6,4 tonnes de CO₂ évitées, soit environ l\'équivalent de 42 000 km parcourus en voiture thermique — le tout sur un investissement mobilier une fois pour toutes.',
        ],
        callout: {
          title: 'Attestation RSE incluse',
          body: 'Pour chaque commande professionnelle, nous remettons une attestation chiffrée (poids valorisé, CO₂ évité, référence Sanity du lot) directement utilisable dans un bilan carbone.',
          href: '/attestation-rse',
          hrefLabel: 'Voir un exemple d\'attestation',
        },
      },
      {
        id: 'au-dela-du-co2',
        heading: 'Au-delà du CO₂',
        paragraphs: [
          'L\'impact évité ne se réduit pas au carbone. Le reconditionnement évite également :',
        ],
        bullets: [
          'Extraction de matières premières critiques (aluminium, acier, terres rares dans les mécanismes).',
          'Consommation d\'eau : la production d\'un fauteuil neuf mobilise 300 à 500 L d\'eau.',
          'Déchets non valorisés : environ 130 000 t de mobilier d\'entreprise partent en incinération chaque année en France.',
          'Emploi local : chaque poste d\'atelier de reconditionnement soutient 15 à 20 emplois indirects par an (collecte, logistique, tapisserie).',
        ],
      },
      {
        id: 'comment-valoriser',
        heading: 'Comment le valoriser dans un rapport RSE',
        paragraphs: [
          'Nos attestations sont calibrées pour être directement intégrables dans les référentiels suivants :',
        ],
        bullets: [
          'Bilan Carbone® v8 (méthode ABC) : ligne "Achats de biens durables — mobilier".',
          'Reporting CSRD ESRS E1 : émissions Scope 3, catégorie "Purchased Goods and Services".',
          'GRI 305 : "Emissions from indirect operations".',
          'Appels d\'offres publics : la mention "économie circulaire" ou "réemploi" est valorisée depuis la loi AGEC (article 58) — nous fournissons la traçabilité.',
        ],
      },
    ],
    conclusion: [
      'Le mobilier reconditionné est aujourd\'hui l\'un des postes RSE les plus faciles à activer : peu de contrainte opérationnelle, gain économique immédiat (30 à 60 % vs neuf), impact chiffrable et documenté. Ce n\'est plus un choix "éthique" au détriment du budget — c\'est un choix qui les concilie.',
      'Nous accompagnons régulièrement les entreprises marseillaises et de la région PACA pour équiper leurs locaux et documenter l\'impact — sur simple demande.',
    ],
    relatedSlugs: [
      'occasion-vs-reconditionne-mobilier-bureau',
      'comparatif-fauteuils-ergonomiques-steelcase-herman-miller-vitra',
    ],
    tags: ['RSE', 'Écologie', 'Bilan carbone'],
  },
]

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return BLOG_ARTICLES.map((a) => a.slug)
}
