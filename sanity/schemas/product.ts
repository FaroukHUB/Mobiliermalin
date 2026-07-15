import type { Rule } from 'sanity'

const CONDITIONS = [
  { title: 'Neuf', value: 'new' },
  { title: 'Excellent état', value: 'excellent' },
  { title: 'Très bon état', value: 'very-good' },
  { title: 'Bon état', value: 'good' },
  { title: 'État correct', value: 'fair' },
]

const STATUSES = [
  { title: 'Brouillon', value: 'draft' },
  { title: 'Publié (visible sur le site)', value: 'published' },
  { title: 'Vendu', value: 'sold' },
  { title: 'Archivé', value: 'archived' },
]

const BRANDS = [
  'Steelcase',
  'Herman Miller',
  'Haworth',
  'Vitra',
  'Majencia',
  'HÅG',
  'Knoll',
  'USM Haller',
  'Autre',
].map((b) => ({ title: b, value: b }))

export const product = {
  name: 'product',
  title: 'Mobilier (produits)',
  type: 'document',
  groups: [
    { name: 'main', title: 'Essentiel', default: true },
    { name: 'photos', title: 'Photos & vidéo' },
    { name: 'pricing', title: 'Prix & stock' },
    { name: 'specs', title: 'Caractéristiques' },
    { name: 'ergonomics', title: 'Ergonomie & confort' },
    { name: 'certifications', title: 'Certifications' },
    { name: 'seo', title: 'SEO & réseaux sociaux' },
  ],
  fields: [
    // ─────── Essentiel ───────
    {
      name: 'name',
      title: 'Nom du produit',
      type: 'string',
      group: 'main',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'slug',
      title: 'Adresse web (slug)',
      type: 'slug',
      group: 'main',
      options: { source: 'name', maxLength: 96 },
      validation: (R: Rule) => R.required(),
      description: 'Partie de l\'URL : /produit/[slug]. Auto-générée depuis le nom.',
    },
    {
      name: 'status',
      title: 'Statut',
      type: 'string',
      group: 'main',
      options: { list: STATUSES, layout: 'radio' },
      initialValue: 'draft',
      validation: (R: Rule) => R.required(),
      description: 'Seuls les produits "Publié" apparaissent sur le site.',
    },
    {
      name: 'shortDescription',
      title: 'Description courte',
      type: 'text',
      rows: 3,
      group: 'main',
      description: '1-2 phrases résumé, affichées sur la fiche produit et les cartes catalogue.',
    },
    {
      name: 'description',
      title: 'Description complète',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'main',
    },

    // ─────── Photos & vidéo ───────
    {
      name: 'images',
      title: 'Photos du produit',
      type: 'array',
      group: 'photos',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Texte alternatif (SEO + accessibilité)',
            },
          ],
        },
      ],
      validation: (R: Rule) => R.min(1).error('Au moins 1 photo obligatoire'),
      description:
        'Glissez-déposez vos photos. La première est la photo principale. Idéal : 5 photos minimum, fond uni clair.',
    },
    {
      name: 'videoUrl',
      title: 'URL vidéo (YouTube ou Vimeo)',
      type: 'url',
      group: 'photos',
      description:
        'URL publique d\'une vidéo de présentation du produit (YouTube ou Vimeo). Active un carrousel vidéo dans les résultats Google Rich Results (+CTR notable). Ex : https://www.youtube.com/watch?v=abc123',
    },
    {
      name: 'videoDescription',
      title: 'Description courte de la vidéo',
      type: 'text',
      rows: 2,
      group: 'photos',
      hidden: ({ document }: { document?: { videoUrl?: string } }) => !document?.videoUrl,
      description: '2-3 phrases décrivant ce qu\'on voit dans la vidéo. Envoyé à Google (VideoObject.description).',
    },

    // ─────── Prix & stock ───────
    {
      name: 'price',
      title: 'Prix de vente (€ TTC)',
      type: 'number',
      group: 'pricing',
      validation: (R: Rule) => R.required().positive(),
      description: 'Prix habituel de vente du produit reconditionné. C\'est le prix utilisé tant qu\'il n\'y a pas de promo.',
    },
    {
      name: 'salePrice',
      title: 'Prix soldé (€ TTC)',
      type: 'number',
      group: 'pricing',
      description: 'Optionnel — prix promo. S\'il est rempli, c\'est ce prix qui est facturé au client (affiché en rouge), et le Prix de vente apparaît barré à côté.',
      validation: (R: Rule) =>
        R.positive().custom((value, ctx) => {
          if (value === undefined || value === null) return true
          const price = (ctx.document as { price?: number } | undefined)?.price
          if (price && (value as number) >= price) {
            return 'Le prix soldé doit être inférieur au prix de vente.'
          }
          return true
        }),
    },
    {
      name: 'comparePrice',
      title: 'Prix neuf (€ TTC)',
      type: 'number',
      group: 'pricing',
      description: 'Optionnel — prix d\'origine du produit neuf en magasin. Affiché barré en plus, pour montrer la valeur initiale.',
    },
    {
      name: 'stock',
      title: 'Quantité en stock',
      type: 'number',
      group: 'pricing',
      initialValue: 1,
      validation: (R: Rule) => R.required().min(0).integer(),
    },

    // ─────── Caractéristiques ───────
    {
      name: 'category',
      title: 'Catégorie',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'specs',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'brand',
      title: 'Marque d\'origine',
      type: 'string',
      group: 'specs',
      options: { list: BRANDS },
    },
    {
      name: 'condition',
      title: 'État',
      type: 'string',
      group: 'specs',
      options: { list: CONDITIONS, layout: 'radio' },
      initialValue: 'excellent',
    },
    {
      name: 'widthCm',
      title: 'Largeur (cm)',
      type: 'number',
      group: 'specs',
    },
    {
      name: 'depthCm',
      title: 'Profondeur (cm)',
      type: 'number',
      group: 'specs',
    },
    {
      name: 'heightCm',
      title: 'Hauteur (cm)',
      type: 'number',
      group: 'specs',
    },
    {
      name: 'material',
      title: 'Matière',
      type: 'string',
      group: 'specs',
      description: 'Ex: Mélaminé, Bois massif, Métal, Tissu, Cuir simili',
    },
    {
      name: 'color',
      title: 'Couleur',
      type: 'string',
      group: 'specs',
    },
    {
      name: 'weightKg',
      title: 'Poids (kg)',
      type: 'number',
      group: 'specs',
      description: 'Utile pour calculer les frais de livraison palette + affiché dans Google Shopping.',
      validation: (R: Rule) => R.positive(),
    },
    {
      name: 'sku',
      title: 'Référence interne (SKU)',
      type: 'string',
      group: 'specs',
      description: 'Optionnel — pour ta gestion de stock.',
    },
    {
      name: 'mpn',
      title: 'Référence fabricant d\'origine (MPN)',
      type: 'string',
      group: 'specs',
      description:
        'Référence officielle du modèle chez le fabricant. Ex : "462A00" pour un Steelcase Leap V2. Permet à Google Shopping et aux assistants IA (ChatGPT, Perplexity) de relier ta fiche au produit d\'origine. Trouvable sur la plaque signalétique sous le meuble.',
    },
    {
      name: 'primaryCategory',
      title: '⭐ Catégorie principale (pour breadcrumb & URL canonique)',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'specs',
      description:
        'La catégorie principale qui définit le fil d\'Ariane et l\'URL du produit. Si un produit appartient à plusieurs catégories (ex: fauteuil ET ergonomique ET Steelcase), tu peux les mettre dans le champ "Catégorie" plus haut, MAIS il faut choisir ici LA catégorie principale pour éviter que Google indexe deux fois la même fiche. Laisser vide = utilise la catégorie du champ ci-dessus.',
    },
    {
      name: 'originalReleaseYear',
      title: 'Année de sortie du modèle original',
      type: 'number',
      group: 'specs',
      description:
        'Année où le fabricant a lancé ce modèle pour la première fois. Ex : Steelcase Leap V2 = 2006. Aide Google et les IA à comprendre l\'ancienneté du modèle (utile pour valoriser les pièces "vintage design" ou icônes design).',
      validation: (R: Rule) => R.integer().min(1900).max(new Date().getFullYear()),
    },
    {
      name: 'warrantyMonths',
      title: 'Garantie (en mois)',
      type: 'number',
      group: 'specs',
      initialValue: 12,
      description:
        'Nombre de mois de garantie sur ce produit reconditionné. Défaut 12 mois. Google affiche cette info en snippet marchand. Attention : la garantie légale de conformité 24 mois (particuliers) s\'applique de toute façon.',
      validation: (R: Rule) => R.integer().min(0).max(60),
    },
    {
      name: 'countryOfOrigin',
      title: 'Pays d\'origine du fabricant',
      type: 'string',
      group: 'specs',
      description:
        'Pays où la marque est basée (pas où le produit est vendu). Ex : Steelcase = US, Vitra = CH, Herman Miller = US, Haworth = US, Majencia = FR. Format ISO 2 lettres.',
      options: {
        list: [
          { title: 'États-Unis (US)', value: 'US' },
          { title: 'Suisse (CH)', value: 'CH' },
          { title: 'Allemagne (DE)', value: 'DE' },
          { title: 'France (FR)', value: 'FR' },
          { title: 'Italie (IT)', value: 'IT' },
          { title: 'Espagne (ES)', value: 'ES' },
          { title: 'Royaume-Uni (GB)', value: 'GB' },
          { title: 'Norvège (NO)', value: 'NO' },
          { title: 'Suède (SE)', value: 'SE' },
          { title: 'Danemark (DK)', value: 'DK' },
          { title: 'Pays-Bas (NL)', value: 'NL' },
        ],
      },
    },

    // ─────── Ergonomie & confort (utilisé dans additionalProperty[]) ───────
    {
      name: 'maxUserWeightKg',
      title: 'Charge maximale utilisateur (kg)',
      type: 'number',
      group: 'ergonomics',
      description: 'Poids max supporté par le produit (surtout fauteuils). Info attendue par Google + IA.',
      validation: (R: Rule) => R.positive().integer(),
    },
    {
      name: 'seatHeightMinCm',
      title: 'Hauteur d\'assise MIN (cm)',
      type: 'number',
      group: 'ergonomics',
      description: 'Hauteur d\'assise minimale (fauteuil / tabouret réglable).',
      validation: (R: Rule) => R.positive(),
    },
    {
      name: 'seatHeightMaxCm',
      title: 'Hauteur d\'assise MAX (cm)',
      type: 'number',
      group: 'ergonomics',
      description: 'Hauteur d\'assise maximale.',
      validation: (R: Rule) => R.positive(),
    },
    {
      name: 'armrestType',
      title: 'Type d\'accoudoirs',
      type: 'string',
      group: 'ergonomics',
      options: {
        list: [
          { title: 'Sans accoudoirs', value: 'none' },
          { title: 'Fixes', value: 'fixed' },
          { title: '1D (hauteur)', value: '1D' },
          { title: '2D (hauteur + largeur)', value: '2D' },
          { title: '3D (hauteur + largeur + profondeur)', value: '3D' },
          { title: '4D (3D + pivot latéral)', value: '4D' },
        ],
      },
    },
    {
      name: 'hasLumbarAdjustment',
      title: 'Soutien lombaire réglable',
      type: 'boolean',
      group: 'ergonomics',
      initialValue: false,
    },
    {
      name: 'hasHeadrest',
      title: 'Appuie-tête',
      type: 'boolean',
      group: 'ergonomics',
      initialValue: false,
    },
    {
      name: 'desktopMotorized',
      title: 'Réglage électrique de la hauteur (bureau assis-debout)',
      type: 'boolean',
      group: 'ergonomics',
      initialValue: false,
    },

    // ─────── Certifications (hasCertification[] dans JSON-LD) ───────
    {
      name: 'certifications',
      title: 'Labels & certifications',
      type: 'array',
      group: 'certifications',
      description:
        'Labels et certifications du produit ou du fabricant : NF Environnement, PEFC, FSC, Ecovadis, Ange Bleu, etc. Affiché sur la fiche + envoyé dans le schéma Google (hasCertification).',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Nom du label', type: 'string' },
            { name: 'issuedBy', title: 'Organisme émetteur', type: 'string' },
            { name: 'url', title: 'Lien vers la page officielle du label', type: 'url' },
          ],
          preview: {
            select: { title: 'name', subtitle: 'issuedBy' },
          },
        },
      ],
    },

    {
      name: 'featured',
      title: 'Mettre en avant sur la home',
      type: 'boolean',
      group: 'specs',
      initialValue: false,
    },
    {
      name: 'featuredOrder',
      title: 'Ordre dans Coups de cœur',
      description:
        'Position du produit dans la section "Coups de cœur" de la home. 1 = premier, 2 = deuxième, etc. Laisser vide pour que le produit s\'affiche selon la date de publication (plus récent en premier). N\'a d\'effet QUE si "Mettre en avant sur la home" est activé.',
      type: 'number',
      group: 'specs',
      hidden: ({ document }: { document?: { featured?: boolean } }) =>
        !document?.featured,
      validation: (R: Rule) => R.min(1).integer(),
    },
    {
      name: 'exception',
      title: 'Pièce d\'exception',
      description:
        'À cocher pour les pièces premium, rares ou signature. Apparaît dans la section "Nos pièces d\'exception" sur la home (fond noir, traitement luxe). Indépendant du toggle "Mettre en avant sur la home" — un produit peut être les deux.',
      type: 'boolean',
      group: 'specs',
      initialValue: false,
    },
    {
      name: 'exceptionOrder',
      title: 'Ordre dans Pièces d\'exception',
      description:
        'Position dans la section "Pièces d\'exception". 1 = premier, etc. Laisser vide = tri par date. N\'a d\'effet que si "Pièce d\'exception" est activé.',
      type: 'number',
      group: 'specs',
      hidden: ({ document }: { document?: { exception?: boolean } }) =>
        !document?.exception,
      validation: (R: Rule) => R.min(1).integer(),
    },

    // ─────── SEO ───────
    {
      name: 'seo',
      title: 'Réglages SEO',
      type: 'object',
      group: 'seo',
      description:
        '⚡ Vous pouvez tout laisser vide : le site remplira automatiquement à partir du nom du produit, du prix et de la description courte. Ne remplissez ces champs que si vous voulez forcer une formulation précise pour Google.',
      fields: [
        {
          name: 'metaTitle',
          title: 'Titre meta (50-60 caractères)',
          type: 'string',
          description:
            '🤖 Auto si vide : "[Nom du produit] — [Prix] €". Exemple : "Bureau électrique Steelcase Series 5 — 750 €". Ne remplir que pour personnaliser.',
          validation: (R: Rule) =>
            R.max(70).warning('Titre trop long : Google le tronquera au-delà de ~60 caractères.'),
        },
        {
          name: 'metaDescription',
          title: 'Description meta (150-160 caractères)',
          type: 'text',
          rows: 2,
          description:
            '🤖 Auto si vide : reprend la "Description courte" du produit, sinon fallback générique. Ne remplir que pour optimiser le clic depuis Google.',
          validation: (R: Rule) =>
            R.max(180).warning('Description trop longue : Google la tronquera au-delà de ~160 caractères.'),
        },
        {
          name: 'ogImage',
          title: 'Image de partage réseaux sociaux (Open Graph)',
          type: 'image',
          options: { hotspot: true },
          description:
            'Optionnel. Image affichée quand le produit est partagé (WhatsApp, Facebook, LinkedIn). Format 1200×630. Si vide, la 1re photo est utilisée. Remplir si tu veux un visuel avec texte lisible en petit format.',
        },
        {
          name: 'canonicalUrl',
          title: 'URL canonique (avancé)',
          type: 'url',
          description:
            'Optionnel. Si ce produit est une variante d\'un autre produit hub (ex : même modèle en 3 couleurs), pointe vers l\'URL du produit principal. Google concentrera alors le PageRank sur ce hub. Laisser vide dans 99% des cas.',
        },
        {
          name: 'noIndex',
          title: 'Retirer de Google (noindex)',
          type: 'boolean',
          initialValue: false,
          description:
            'Coché = Google ne l\'indexera pas mais le produit reste visible sur ton site. Utile pour un produit en attente de photos, ou un stock épuisé qu\'on veut garder listé en interne sans polluer les résultats Google.',
        },
        {
          name: 'productReferenceUrl',
          title: 'Lien vers la page officielle du modèle (Wikipedia, site fabricant)',
          type: 'url',
          description:
            '⚡ Astuce SEO/IA : URL Wikipedia ou page fabricant du modèle d\'origine. Ex : https://en.wikipedia.org/wiki/Aeron_chair pour un Herman Miller Aeron. Envoyé en `sameAs` du schéma produit → aide ChatGPT, Claude, Perplexity à te citer correctement en source (car ils reconnaissent l\'entité).',
        },
      ],
    },
  ],
  orderings: [
    {
      title: 'Statut puis date (récents)',
      name: 'statusDate',
      by: [
        { field: 'status', direction: 'asc' },
        { field: '_createdAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'images.0',
      subtitle: 'status',
      price: 'price',
    },
    prepare(s: { title?: string; media?: unknown; subtitle?: string; price?: number }) {
      const status = s.subtitle === 'published' ? '✓ Publié' : s.subtitle === 'sold' ? '✕ Vendu' : '✎ Brouillon'
      return {
        title: s.title,
        subtitle: `${status} · ${s.price ? `${s.price} €` : 'sans prix'}`,
        media: s.media,
      }
    },
  },
}
