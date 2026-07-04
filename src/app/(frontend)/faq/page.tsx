import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Phone, Mail } from 'lucide-react'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Questions fréquentes',
  description:
    'Réponses aux questions les plus posées sur Mobilier Malin : reconditionnement, livraison, garantie, paiement, rétractation, vidage de locaux.',
  alternates: { canonical: '/faq' },
}

const FAQS = [
  {
    category: 'Le mobilier',
    items: [
      {
        q: 'Que veut dire "mobilier reconditionné" exactement ?',
        a: "Chaque pièce que nous remettons à la vente passe par notre atelier de La Penne-sur-Huveaune. Inspection complète, démontage si nécessaire, nettoyage en profondeur, remplacement des composants défaillants (vérins, roulettes, mécanismes), remontage et contrôle final. C'est différent d'un simple revente d'occasion : le produit est remis en condition d'usage professionnel.",
      },
      {
        q: "D'où viennent vos meubles ?",
        a: 'Principalement de réaménagements d\'entreprises régionales (sièges sociaux, agences, cabinets) qui changent leur mobilier tous les sept à dix ans. Nous récupérons souvent des plateaux entiers de Steelcase, Vitra, Haworth ou Herman Miller — des marques pensées pour durer vingt ans en environnement pro.',
      },
      {
        q: "Comment connaître l'état exact d'un produit avant de l'acheter ?",
        a: "Chaque fiche produit indique un état (excellent, très bon, bon, satisfaisant) avec plusieurs photographies. Pour les fauteuils ou pièces premium, nous recommandons une visite au showroom pour essayer en personne. Vous pouvez aussi nous appeler ou nous envoyer un message — nous répondons sous 24 h ouvrées avec des précisions et des photos supplémentaires si nécessaire.",
      },
    ],
  },
  {
    category: 'Commande & paiement',
    items: [
      {
        q: 'Quels moyens de paiement acceptez-vous ?',
        a: "Carte bancaire (Visa, Mastercard, American Express) via Stripe — paiement sécurisé certifié PCI-DSS. Pour les commandes professionnelles importantes, le virement bancaire est possible (coordonnées transmises sur demande). En showroom, l'espèce et la carte sont acceptées.",
      },
      {
        q: 'Puis-je payer en plusieurs fois ?',
        a: "Selon les conditions de Stripe au moment de la commande, le paiement en 3 ou 4 fois peut être proposé. Pour les commandes professionnelles avec devis personnalisé, nous étudions au cas par cas un échelonnement adapté.",
      },
      {
        q: 'Recevrai-je une facture ?',
        a: "Oui. Une facture conforme (avec TVA) est émise pour chaque commande, transmise par email après paiement. Pour les entreprises, indiquez votre numéro de TVA intracommunautaire dans la commande ou par email.",
      },
    ],
  },
  {
    category: 'Livraison & retrait',
    items: [
      {
        q: 'Où êtes-vous situés ?',
        a: `${LEGAL.showroom.ligne1}, ${LEGAL.showroom.codePostal} ${LEGAL.showroom.ville}. À cinq minutes d'Aubagne, quinze minutes de Marseille-Joliette, trente-cinq minutes d'Aix-en-Provence. Ouvert du lundi au samedi de 10 h à 18 h sur rendez-vous.`,
      },
      {
        q: 'Livrez-vous sur Nice et la Côte d\'Azur ?',
        a: "Oui. Compte tenu de la demande croissante depuis Nice, nous organisons une à deux journées de livraison dédiées à la Côte d'Azur, ce qui permet de mutualiser les déplacements et de réduire le coût de livraison pour chaque client. Devis sous 24 h ouvrées avec la prochaine date de tournée disponible.",
      },
      {
        q: 'Le retrait au showroom est-il gratuit ?',
        a: "Oui, totalement. Vous prenez rendez-vous, vous venez chercher votre commande au créneau choisi, et nous vous aidons à charger dans votre véhicule. Café offert.",
      },
      {
        q: 'Combien coûte la livraison à domicile ?',
        a: "Le coût dépend du volume, de l'adresse exacte, de l'étage et des contraintes d'accès (ascenseur, parking). Tout est détaillé dans le devis transmis sous 24 h ouvrées. Aucun frais caché.",
      },
    ],
  },
  {
    category: 'Garanties & service après-vente',
    items: [
      {
        q: 'Comment est préparé votre mobilier reconditionné ?',
        a: "Chaque pièce est démontée, contrôlée et préparée dans notre propre atelier au 18 chemin Noël Robion, à La Penne-sur-Huveaune. Contrôle qualité en 7 points avant chaque mise en vente. Notre équipe technique reste joignable directement après achat, sans passer par un SAV externalisé. Les garanties légales (conformité 12 mois sur les biens d'occasion, vices cachés 2 ans) s'appliquent de plein droit.",
      },
      {
        q: 'Que se passe-t-il si un produit arrive endommagé ?',
        a: "Mentionnez-le sur le bon de livraison au moment de la réception et signalez-nous l'incident sous 48 h par email avec des photos. Selon la nature du dommage, nous proposons un remplacement, une réparation ou un remboursement.",
      },
      {
        q: 'Puis-je renvoyer un produit si finalement il ne me convient pas ?',
        a: 'Oui. Vous bénéficiez du droit légal de rétractation de 14 jours à compter de la réception, sans avoir à justifier de motif. La démarche est gratuite et entièrement guidée depuis notre page dédiée.',
        link: { href: '/retractation', label: 'Exercer mon droit de rétractation' },
      },
    ],
  },
  {
    category: 'Services associés',
    items: [
      {
        q: 'Vous proposez de vider mes locaux, comment ça marche ?',
        a: 'Nous nous déplaçons pour évaluer le volume, identifier ce qui peut être repris (réutilisé dans nos circuits) et ce qui doit partir au recyclage. Un devis est établi en conséquence — il peut être positif (paiement de notre part si la valeur de reprise est forte) ou nul.',
        link: { href: '/vidage-de-locaux', label: 'En savoir plus sur le vidage de locaux' },
      },
      {
        q: 'Est-ce que vous louez du mobilier sur la durée ?',
        a: 'Oui, nous proposons de la location longue durée (LLD) pour les entreprises qui préfèrent lisser leur investissement mobilier sur plusieurs années.',
        link: { href: '/location-mobilier-bureau', label: 'Découvrir la location longue durée' },
      },
      {
        q: "Pouvez-vous équiper plusieurs postes d'un coup ?",
        a: "C'est même notre spécialité. Pour les commandes de plus de dix postes, nous pouvons nous déplacer dans vos locaux pour mesurer l'espace, conseiller sur l'agencement et bâtir un devis adapté à votre réalité — pas une grille générique.",
      },
    ],
  },
]

// JSON-LD pour permettre à Google d'afficher les questions en rich snippets
function buildFaqJsonLd() {
  const allItems = FAQS.flatMap((c) => c.items)
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }}
      />

      <section className="bg-ivory-dark border-b border-line">
        <div className="container py-16 md:py-20 max-w-4xl">
          <p className="eyebrow">Questions fréquentes</p>
          <h1 className="text-display mt-4 font-serif">
            Tout ce qu&apos;on nous demande le plus souvent
          </h1>
          <div className="gold-divider mx-0 mt-6" />
          <p className="mt-6 text-lg text-ink-soft leading-relaxed">
            Vous trouverez ici les réponses regroupées par thème. Si votre
            question n&apos;y figure pas, contactez-nous directement —
            réponse sous 24 h ouvrées.
          </p>
        </div>
      </section>

      <article className="container py-16 md:py-20 max-w-3xl space-y-16">
        {FAQS.map((cat) => (
          <section key={cat.category}>
            <p className="eyebrow text-gold-dark">{cat.category}</p>
            <div className="gold-divider mx-0 mt-3" />
            <dl className="mt-8 space-y-8">
              {cat.items.map((item) => (
                <div key={item.q}>
                  <dt className="font-serif text-lg md:text-xl text-ink leading-snug">
                    {item.q}
                  </dt>
                  <dd className="mt-3 text-ink-soft leading-relaxed">
                    {item.a}
                    {item.link && (
                      <div className="mt-3">
                        <Link
                          href={item.link.href}
                          className="text-sm text-gold-dark hover:text-gold inline-flex items-center gap-1.5"
                        >
                          {item.link.label}
                          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Link>
                      </div>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </article>

      <section className="bg-ivory-dark border-t border-line">
        <div className="container py-12 md:py-16 max-w-3xl text-center">
          <p className="eyebrow text-gold-dark">Une autre question ?</p>
          <h2 className="font-serif text-2xl md:text-3xl text-ink mt-3">
            Contactez-nous, nous répondons sous 24 h ouvrées
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              Formulaire de contact
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <a href={`tel:${LEGAL.telephoneTel}`} className="btn-outline inline-flex items-center gap-2">
              <Phone className="h-4 w-4" /> {LEGAL.telephone}
            </a>
          </div>
          <p className="mt-6 text-sm text-ink-mute">
            <a href={`mailto:${LEGAL.email}`} className="hover:text-gold-dark inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> {LEGAL.email}
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
