import type { Rule } from 'sanity'

/**
 * Charte qualité — singleton.
 *
 * Page publique : /charte-qualite
 * Explique les 5 états de mobilier, le processus de reconditionnement,
 * la garantie, la FAQ.
 *
 * Tous les champs sont éditables depuis le Studio (Djamel peut reformuler).
 * Les valeurs initiales sont pré-remplies pour démarrer immédiatement.
 */
export const qualityGuide = {
  name: 'qualityGuide',
  title: 'Charte qualité',
  type: 'document',
  groups: [
    { name: 'hero', title: '✨ Hero', default: true },
    { name: 'intro', title: '📝 Introduction' },
    { name: 'states', title: '📊 Les 5 états' },
    { name: 'process', title: '🛠 Processus' },
    { name: 'warranty', title: '🛡 Garantie' },
    { name: 'faq', title: '❓ FAQ' },
  ],
  fields: [
    // ───────── HERO ─────────
    {
      name: 'heroEyebrow',
      title: 'Eyebrow (surtitre)',
      type: 'string',
      group: 'hero',
      initialValue: 'Notre exigence',
    },
    {
      name: 'heroTitle',
      title: 'Titre principal',
      type: 'string',
      group: 'hero',
      initialValue: '5 niveaux d\'état, 1 standard de qualité',
      validation: (R: Rule) => R.required(),
    },
    {
      name: 'heroSubtitle',
      title: 'Sous-titre',
      type: 'text',
      rows: 3,
      group: 'hero',
      initialValue:
        'Chaque pièce qui sort de notre atelier de La Penne-sur-Huveaune a été inspectée, nettoyée, testée. Voici comment nous classons leur état — en toute transparence.',
    },
    {
      name: 'heroImage',
      title: 'Image hero (optionnelle)',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
      description: 'Idéalement : Djamel ou l\'équipe inspectant un fauteuil dans l\'atelier.',
    },

    // ───────── INTRO ─────────
    {
      name: 'introText',
      title: 'Texte d\'introduction',
      type: 'text',
      rows: 6,
      group: 'intro',
      initialValue:
        'Acheter du mobilier d\'occasion en ligne, c\'est faire confiance à une grille de notation qu\'on ne voit pas. Chez Mobilier Malin, on a tranché : 5 niveaux d\'état, des critères objectifs, et la même garantie pour tous. Pas de jargon, pas de fausses promesses. Vous savez exactement ce que vous recevrez avant de cliquer sur "Acheter".',
    },

    // ───────── LES 5 ÉTATS ─────────
    {
      name: 'conditions',
      title: 'Les 5 états (du meilleur au plus rustique)',
      type: 'array',
      group: 'states',
      description:
        'L\'ordre et les codes internes doivent rester identiques (utilisés sur les fiches produit). Les textes et images sont libres.',
      of: [
        {
          type: 'object',
          name: 'condition',
          fields: [
            {
              name: 'code',
              title: 'Code interne (NE PAS MODIFIER)',
              type: 'string',
              readOnly: true,
              options: {
                list: [
                  { value: 'new', title: 'new' },
                  { value: 'excellent', title: 'excellent' },
                  { value: 'very-good', title: 'very-good' },
                  { value: 'good', title: 'good' },
                  { value: 'fair', title: 'fair' },
                ],
              },
            },
            { name: 'label', title: 'Nom affiché', type: 'string', validation: (R: Rule) => R.required() },
            {
              name: 'pitch',
              title: 'Pitch court (1-2 phrases)',
              type: 'text',
              rows: 2,
              validation: (R: Rule) => R.required(),
            },
            {
              name: 'image',
              title: 'Photo exemple',
              type: 'image',
              options: { hotspot: true },
              description: 'À remplacer par une vraie photo prise au showroom dès que possible.',
            },
            { name: 'apparence', title: 'Apparence', type: 'text', rows: 2 },
            { name: 'fonctionnel', title: 'Fonctionnel', type: 'text', rows: 2 },
            { name: 'garantie', title: 'Garantie', type: 'string' },
            { name: 'pourQui', title: 'Pour qui', type: 'text', rows: 2 },
          ],
          preview: {
            select: { title: 'label', subtitle: 'pitch', media: 'image' },
          },
        },
      ],
      initialValue: [
        {
          _key: 'cond-new',
          code: 'new',
          label: 'Neuf',
          pitch:
            'Mobilier jamais utilisé, fin de série ou stock dormant constructeur. Dans son emballage d\'origine.',
          apparence: 'Aucune marque, état sortie d\'usine.',
          fonctionnel: '100 %, tous réglages testés.',
          garantie: '6 mois Mobilier Malin',
          pourQui: 'Direction, espaces de représentation, exigence maximale.',
        },
        {
          _key: 'cond-excellent',
          code: 'excellent',
          label: 'Excellent état',
          pitch:
            'Pièce avec usage très léger. Indiscernable d\'un produit neuf à 1 mètre de distance.',
          apparence: 'Aucune rayure ni marque visible. Tissu / cuir comme neuf.',
          fonctionnel: '100 %, mécanismes parfaitement vérifiés.',
          garantie: '6 mois Mobilier Malin',
          pourQui: 'Directions, postes premium, espaces clients.',
        },
        {
          _key: 'cond-very-good',
          code: 'very-good',
          label: 'Très bon état',
          pitch:
            'Traces d\'usage très discrètes. Le rapport qualité-prix de référence.',
          apparence:
            '1 ou 2 micro-marques visibles à moins de 30 cm. Tissu propre, structure parfaite.',
          fonctionnel:
            '100 %, pièces d\'usure remplacées si nécessaire (vérins, accoudoirs).',
          garantie: '6 mois Mobilier Malin',
          pourQui: 'Open-spaces, postes de travail standards, équipement à grande échelle.',
        },
        {
          _key: 'cond-good',
          code: 'good',
          label: 'Bon état',
          pitch:
            'Marques d\'usage visibles mais sans aucun impact sur la fonctionnalité ni le confort.',
          apparence:
            'Quelques rayures sur les plateaux, légère patine du tissu. Aucune déchirure.',
          fonctionnel: '100 %, tous mécanismes testés.',
          garantie: '6 mois Mobilier Malin',
          pourQui: 'Locations courtes, équipements de pôles non stratégiques, budget serré.',
        },
        {
          _key: 'cond-fair',
          code: 'fair',
          label: 'État correct',
          pitch:
            'Usure marquée mais mobilier 100 % fonctionnel. La meilleure entrée en matière pour démarrer une activité avec un investissement minimal.',
          apparence:
            'Rayures et marques visibles. Décoloration possible du tissu. Aucune réparation structurelle nécessaire.',
          fonctionnel: '100 %, vérifié comme tous nos produits.',
          garantie: '6 mois Mobilier Malin',
          pourQui: 'Start-ups, associations, premiers équipements.',
        },
      ],
    },

    // ───────── PROCESSUS ─────────
    {
      name: 'processSteps',
      title: 'Notre processus de reconditionnement (7 étapes)',
      type: 'array',
      group: 'process',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Titre étape', type: 'string', validation: (R: Rule) => R.required() },
            { name: 'description', title: 'Description', type: 'text', rows: 3 },
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
      initialValue: [
        {
          _key: 'step-1',
          title: 'Inspection à l\'arrivée',
          description:
            'Chaque pièce reçue est examinée visuellement et mécaniquement. Photos, mesures, identification de la marque et du modèle.',
        },
        {
          _key: 'step-2',
          title: 'Démontage et tri',
          description:
            'Démontage partiel pour accéder aux mécanismes. Tri des pièces réutilisables et identification des éventuelles pièces à remplacer.',
        },
        {
          _key: 'step-3',
          title: 'Nettoyage profond',
          description:
            'Aspiration, dépoussiérage, nettoyage à la vapeur pour les tissus, dégraissage et lustrage des structures métalliques et plastiques.',
        },
        {
          _key: 'step-4',
          title: 'Test fonctionnel complet',
          description:
            'Tous les mécanismes sont testés : vérins, basculement synchrone, accoudoirs, dossier lombaire, roulettes, serrures. Aucun défaut accepté.',
        },
        {
          _key: 'step-5',
          title: 'Remplacement des pièces d\'usure',
          description:
            'Vérins fatigués, accoudoirs cassés, roulettes usées : tout est remplacé par des pièces d\'origine ou compatibles haut de gamme.',
        },
        {
          _key: 'step-6',
          title: 'Contrôle qualité final',
          description:
            'Une dernière inspection valide l\'état attribué (Neuf, Excellent, Très bon, Bon, Correct). Photos finales pour la fiche produit.',
        },
        {
          _key: 'step-7',
          title: 'Étiquetage et mise en stock',
          description:
            'Référence unique, fiche complète (marque, modèle, état, dimensions), prêt à être livré ou retiré au showroom.',
        },
      ],
    },

    // ───────── GARANTIE ─────────
    {
      name: 'warrantyTitle',
      title: 'Titre section garantie',
      type: 'string',
      group: 'warranty',
      initialValue: 'La garantie 6 mois — ce qu\'elle couvre',
    },
    {
      name: 'warrantyIntro',
      title: 'Intro garantie',
      type: 'text',
      rows: 3,
      group: 'warranty',
      initialValue:
        'Chaque pièce vendue par Mobilier Malin est couverte par une garantie commerciale de 6 mois, à partir de la date de livraison ou de retrait. Voici, en toute clarté, ce que cela inclut — et ce que cela n\'inclut pas.',
    },
    {
      name: 'warrantyCovered',
      title: 'Ce qui est couvert',
      type: 'array',
      group: 'warranty',
      of: [{ type: 'string' }],
      initialValue: [
        'Défaut de fonctionnement non lié à un usage anormal',
        'Remplacement gratuit des pièces défectueuses',
        'Main d\'œuvre incluse pour les réparations',
        'Échange ou remboursement si la pièce ne peut pas être réparée',
        'Conseils techniques de notre équipe à tout moment',
      ],
    },
    {
      name: 'warrantyNotCovered',
      title: 'Ce qui n\'est pas couvert',
      type: 'array',
      group: 'warranty',
      of: [{ type: 'string' }],
      initialValue: [
        'Usure normale postérieure à la livraison',
        'Dommages liés à un usage anormal, abusif ou non conforme à la destination du produit',
        'Modifications apportées par le client',
        'Aspect esthétique conforme à l\'état annoncé au moment de la vente',
        'Frais de transport pour retour en atelier (pris en charge à partir de 3 pièces)',
      ],
    },

    // ───────── FAQ ─────────
    {
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      group: 'faq',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'q', title: 'Question', type: 'string', validation: (R: Rule) => R.required() },
            { name: 'a', title: 'Réponse', type: 'text', rows: 4, validation: (R: Rule) => R.required() },
          ],
          preview: { select: { title: 'q', subtitle: 'a' } },
        },
      ],
      initialValue: [
        {
          _key: 'faq-1',
          q: 'Que se passe-t-il si je reçois un produit dans un état différent de celui annoncé ?',
          a: 'Vous nous contactez sous 7 jours après réception, photos à l\'appui. Si l\'écart est avéré, nous reprenons la pièce à nos frais et vous remboursons intégralement, ou nous l\'échangeons contre une pièce du niveau annoncé.',
        },
        {
          _key: 'faq-2',
          q: 'Puis-je essayer un produit avant de l\'acheter ?',
          a: 'Oui. Le showroom de La Penne-sur-Huveaune est ouvert du lundi au samedi de 10 h à 18 h sur rendez-vous. Vous pouvez vous asseoir, ajuster, ressentir avant de décider.',
        },
        {
          _key: 'faq-3',
          q: 'La garantie 6 mois couvre-t-elle l\'entretien courant ?',
          a: 'Non. L\'entretien courant (lubrification des mécanismes, nettoyage des tissus, resserrage des vis) reste à la charge du propriétaire. La garantie couvre les défauts de fonctionnement, pas l\'entretien.',
        },
        {
          _key: 'faq-4',
          q: 'Mes équipes vont équiper 50 postes. Quel niveau d\'état recommandez-vous ?',
          a: 'Pour un équipement à grande échelle, "Très bon état" offre le meilleur rapport qualité-prix sans sacrifice de confort. "Excellent état" est recommandé pour les postes directionnels ou face client. Notre équipe peut vous aider à composer un parc cohérent — contactez-nous.',
        },
        {
          _key: 'faq-5',
          q: 'Que faites-vous des pièces irréparables ?',
          a: 'Les pièces qui ne peuvent pas être reconditionnées sont démantelées : les composants métalliques rejoignent les filières de recyclage, les mousses et tissus partent en valorisation matière. Aucune pièce ne finit en décharge brute.',
        },
        {
          _key: 'faq-6',
          q: 'Le prix change-t-il en fonction de l\'état ?',
          a: 'Oui, mécaniquement. Une pièce "Excellent état" est plus chère qu\'une "État correct" sur la même référence — c\'est le principe du reconditionné. Le prix exact dépend aussi de la marque, du modèle, des accessoires inclus.',
        },
      ],
    },
  ],
  preview: {
    select: { title: 'heroTitle' },
    prepare({ title }: { title?: string }) {
      return { title: 'Charte qualité', subtitle: title || '' }
    },
  },
}
