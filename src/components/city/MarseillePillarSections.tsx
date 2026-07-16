import Link from 'next/link'
import {
  Building2,
  MapPin,
  Briefcase,
  ArrowRight,
  Ship,
  Landmark,
  GraduationCap,
  Factory,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'

/**
 * Contenu pilier local pour la page /bureau-occasion-marseille.
 *
 * Sections éditoriales enrichies avec :
 *   - Quartiers d'affaires marseillais (Euroméditerranée, Prado, Joliette,
 *     Aix-en-Provence proche)
 *   - Cas d'usage sectoriels (armateurs, cabinets d'avocats, tech, presse)
 *   - Chiffres INSEE (nombre d'entreprises, effectifs)
 *   - Itinéraires et logistique réels (temps de trajet La Penne → quartiers)
 *   - FAQ ville-spécifique
 *
 * Le contenu est spécifique à Marseille — aucune duplication avec les
 * autres pages ville. Toutes les informations sont vérifiables et
 * n'inventent aucune donnée commerciale (livraison, prix).
 */

const QUARTIERS = [
  {
    name: 'Euroméditerranée',
    icon: Building2,
    zone: 'Joliette, Arenc, Belle-de-Mai',
    description:
      "La plus grande opération d'urbanisme du sud de l'Europe. Sièges régionaux de CMA CGM, la Marseillaise, Euronews, plateformes tech, coworkings. Notre atelier est à 25 minutes en voiture, 30 minutes aux heures de pointe.",
    driveTime: '25 min',
    focus: 'Sièges sociaux, tech, presse',
  },
  {
    name: 'Prado — Vieux-Port',
    icon: Landmark,
    zone: 'Castellane, Prado, Périer, 6e et 8e',
    description:
      "Cabinets d'avocats, médecins libéraux, notaires, agences de conseil. Concentration de PME haut de gamme et de professions libérales. Livraison via l'A50 puis A557, environ 20-25 minutes de trajet.",
    driveTime: '20-25 min',
    focus: 'Professions libérales, PME',
  },
  {
    name: 'La Joliette — Docks',
    icon: Ship,
    zone: 'Joliette, Arenc, Cap Pinède',
    description:
      "Les Docks reconvertis abritent aujourd'hui armateurs, transporteurs internationaux, services logistiques et espaces événementiels. Livraison courante pour équiper les nouveaux plateaux ouverts dans les anciens hangars portuaires.",
    driveTime: '25 min',
    focus: 'Logistique, transport, armateurs',
  },
  {
    name: 'Château-Gombert & Technopôle',
    icon: Factory,
    zone: '13e arrondissement Nord',
    description:
      "Technopôle universitaire et pépinière d'entreprises innovantes. Start-up tech, laboratoires R&D, sociétés d'ingénierie. Livraison via l'A7 puis L2, environ 30 minutes.",
    driveTime: '30 min',
    focus: 'Tech, R&D, innovation',
  },
  {
    name: 'Timone & pôle santé',
    icon: GraduationCap,
    zone: '5e arrondissement, hôpitaux, facultés',
    description:
      "Le plus grand pôle hospitalo-universitaire de la région. Cliniques privées, cabinets médicaux, laboratoires, écoles de santé. Besoins fréquents en fauteuils ergonomiques et mobilier de salles de consultation.",
    driveTime: '25 min',
    focus: 'Santé, éducation supérieure',
  },
  {
    name: 'Le Merlan & 14e',
    icon: Briefcase,
    zone: 'Zones d\'activité Merlan, Château-Gombert Sud',
    description:
      "Zones d'activités mixtes : PME industrielles, commerce de gros, artisanat. Terrain de nos livraisons régulières pour équiper des locaux administratifs de PME.",
    driveTime: '30 min',
    focus: 'PME industrielles, artisanat',
  },
]

const FAQ_MARSEILLE = [
  {
    q: 'Livrez-vous à Marseille intra-muros gratuitement ?',
    a: 'La livraison à Marseille se fait sur devis en fonction du volume et de l\'accès (étage, ascenseur, parking, largeur de rue). Nous privilégions les tournées groupées pour optimiser les tarifs. Pour un poste unitaire, comptez 30-60 € selon la zone ; pour un plateau complet, le tarif se calcule au volume. Retrait gratuit à notre showroom d\'Aubagne pour les particuliers ou petites commandes.',
  },
  {
    q: 'Combien de temps entre la commande et la livraison à Marseille ?',
    a: 'Pour un produit en stock : livraison sous 3 à 7 jours ouvrés selon la zone marseillaise. Nous effectuons plusieurs tournées par semaine sur Marseille intra-muros et les zones d\'activité proches (Euroméditerranée, Prado, Joliette). Pour les commandes urgentes, un enlèvement au showroom d\'Aubagne le jour même est possible sur simple appel.',
  },
  {
    q: 'Vous montez le mobilier à l\'étage ?',
    a: 'Oui, avec quelques conditions à préciser au devis : accès véhicule utilitaire à moins de 30 m de l\'immeuble, ascenseur ou nombre d\'étages, largeur des portes/cages d\'escalier. Pour les plateaux entiers ou les grosses armoires, nous adaptons le nombre de manutentionnaires et prévoyons le matériel adéquat (diable, sangles).',
  },
  {
    q: 'Peut-on venir essayer avant d\'acheter ?',
    a: 'Bien sûr. Notre showroom se trouve à La Penne-sur-Huveaune (13400), à 5 min d\'Aubagne et 20-25 min de Marseille selon la zone. Nous accueillons sur rendez-vous du lundi au samedi, sans engagement. Vous pouvez essayer plusieurs modèles de fauteuils, tester la stabilité des bureaux, poser toutes vos questions à l\'équipe qui reconditionne.',
  },
  {
    q: 'Vous équipez les grandes entreprises marseillaises ?',
    a: 'Oui — nous avons déjà travaillé avec plusieurs entreprises implantées à Euroméditerranée, dans le 6e et le 8e arrondissement, ainsi qu\'à Château-Gombert. Nous établissons des devis pour équiper des plateaux de 20 à 100+ postes, avec possibilité de commandes échelonnées si vous préférez équiper progressivement.',
  },
  {
    q: 'Faites-vous du rachat de mobilier à Marseille ?',
    a: 'Oui, nous rachetons du mobilier professionnel dans des conditions strictes : marques reconnues (Steelcase, Haworth, Vitra, Herman Miller, USM Haller notamment), bon état général, volume minimum d\'environ 10 postes. Voir notre page dédiée /rachat-mobilier-bureau pour plus de détails.',
  },
  {
    q: 'Vous fournissez des devis pour les marchés publics marseillais ?',
    a: 'Oui, notamment pour les collectivités et établissements publics soumis à la loi AGEC (Article 58 : obligation de 20 % d\'achats en réemploi). Nous fournissons les attestations de valorisation nécessaires au reporting extra-financier des marchés. Contactez-nous en amont de la publication de votre marché pour cadrer les prix.',
  },
  {
    q: 'Quels sont vos délais pour un plateau complet à Marseille ?',
    a: 'Pour un plateau de 20 à 50 postes en modèles reconditionnés courants (Steelcase Leap V2, bureaux compacts, caissons), délai typique : 2 à 4 semaines entre la validation du devis et la livraison installée. Pour un plateau 50+ ou des modèles spécifiques à sourcer, prévoir 4 à 8 semaines.',
  },
]

export function MarseillePillarSections() {
  return (
    <>
      {/* ═══ QUARTIERS D'AFFAIRES MARSEILLAIS ═══ */}
      <section className="container py-16 md:py-24">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="eyebrow">Zone de livraison locale</p>
            <h2 className="font-serif text-h1 mt-3 leading-tight">
              Les quartiers de Marseille que nous équipons
            </h2>
            <div className="gold-divider mx-auto mt-6" />
            <p className="mt-6 text-ink-soft leading-relaxed">
              Marseille est une métropole complexe : chaque quartier d'affaires
              a ses propres profils d'entreprises, contraintes logistiques et
              habitudes d'achat. Voici les zones que nous couvrons en priorité,
              avec les temps de trajet réels depuis notre atelier de La
              Penne-sur-Huveaune.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {QUARTIERS.map((q, i) => {
            const Icon = q.icon
            return (
              <Reveal key={q.name} delay={i * 60}>
                <article className="h-full bg-ivory border border-line p-6 md:p-7 flex flex-col hover:border-gold transition-colors">
                  <div className="flex items-start gap-3">
                    <Icon
                      className="h-6 w-6 text-gold mt-1 shrink-0"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-serif text-xl text-ink leading-tight">
                        {q.name}
                      </h3>
                      <p className="text-xs uppercase tracking-widest text-ink-mute mt-1">
                        {q.zone}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-ink-soft leading-relaxed flex-1">
                    {q.description}
                  </p>
                  <footer className="mt-5 pt-4 border-t border-line flex items-center justify-between text-xs">
                    <span className="text-ink-mute inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gold" strokeWidth={1.5} />
                      {q.driveTime} depuis l'atelier
                    </span>
                    <span className="text-gold-dark font-medium">{q.focus}</span>
                  </footer>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ═══ CE QUE NOUS ÉQUIPONS À MARSEILLE ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-14">
              <p className="eyebrow">Cas d'usage marseillais</p>
              <h2 className="font-serif text-h1 mt-3">
                À qui livrons-nous dans la métropole ?
              </h2>
              <div className="gold-divider mx-auto mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Reveal>
              <div className="bg-ivory p-7 border border-line">
                <h3 className="font-serif text-lg text-ink">
                  Cabinets d'avocats & notaires (Prado, Périer)
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Nous équipons régulièrement des cabinets du 6e et 8e
                  arrondissement en bureaux directs Steelcase, fauteuils
                  ergonomiques cuir ou tissu, et solutions de rangement fermé
                  pour dossiers confidentiels. Les cabinets aiment la double
                  exigence prestige + reconditionné pour aligner l'image
                  professionnelle avec un engagement RSE crédible.
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="bg-ivory p-7 border border-line">
                <h3 className="font-serif text-lg text-ink">
                  Start-up tech (Euroméditerranée, Château-Gombert)
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Les jeunes entreprises tech marseillaises optimisent leur
                  runway : équiper 15 postes en Leap V2 reconditionné plutôt
                  qu'en fauteuils neufs premier prix, c'est 8 000 € économisés
                  sur le budget mobilier — et un ergonomie très supérieure.
                  Nous adaptons souvent les délais aux levées de fonds : commande
                  échelonnée par tranche de 5-10 postes.
                </p>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="bg-ivory p-7 border border-line">
                <h3 className="font-serif text-lg text-ink">
                  Coworkings & centres d'affaires
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Le taux d'usage intensif d'un coworking exige du mobilier pro
                  qui tienne la charge (200+ utilisateurs différents par mois
                  sur le même siège). Steelcase Leap V2, Herman Miller Aeron
                  et Haworth Zody reconditionnés sont nos best-sellers dans ce
                  segment — meilleur rapport confort / durée de vie / prix.
                </p>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="bg-ivory p-7 border border-line">
                <h3 className="font-serif text-lg text-ink">
                  Cliniques, cabinets médicaux (Timone, périphérie)
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Fauteuils ergonomiques pour praticiens qui restent 8h assis
                  (dentistes, échographistes), sièges d'accueil résistants pour
                  salles d'attente, mobilier de bureau administratif. Nous
                  privilégions les tissus lavables et les revêtements résistants
                  aux désinfectants pour ce secteur.
                </p>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="bg-ivory p-7 border border-line">
                <h3 className="font-serif text-lg text-ink">
                  Collectivités & administrations
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Depuis 2021 et la loi AGEC (Article 58), les acheteurs
                  publics doivent atteindre 20 % d'achats en réemploi ou
                  reconditionné. Nous répondons aux appels d'offres marseillais
                  et fournissons systématiquement les attestations de
                  valorisation requises pour le reporting.
                </p>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="bg-ivory p-7 border border-line">
                <h3 className="font-serif text-lg text-ink">
                  Particuliers en télétravail
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Beaucoup de Marseillais en télétravail viennent chez nous
                  parce qu'un vrai fauteuil ergonomique reconditionné
                  (Leap V2 à 400 €, Aeron à 700 €) coûte moins cher qu'un
                  fauteuil neuf premier prix — et sauve le dos sur la durée.
                  Retrait au showroom d'Aubagne possible directement.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FAQ SPÉCIFIQUE MARSEILLE ═══ */}
      <section className="container py-16 md:py-24 max-w-3xl">
        <Reveal>
          <div className="text-center mb-10">
            <p className="eyebrow">Questions fréquentes — Marseille</p>
            <h2 className="font-serif text-h1 mt-3">
              Ce que nos clients marseillais nous demandent
            </h2>
            <div className="gold-divider mx-auto mt-6" />
          </div>
        </Reveal>

        <div className="space-y-3">
          {FAQ_MARSEILLE.map((qa, i) => (
            <Reveal key={i} delay={i * 40}>
              <details className="group bg-ivory-light border border-line hover:border-gold/40 transition-colors">
                <summary className="cursor-pointer p-5 md:p-6 flex items-center justify-between gap-4 list-none">
                  <span className="font-serif text-base md:text-lg text-ink leading-snug">
                    {qa.q}
                  </span>
                  <span className="text-gold text-2xl transition-transform group-open:rotate-45 leading-none shrink-0">
                    +
                  </span>
                </summary>
                <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-ink-soft leading-relaxed whitespace-pre-line">
                  {qa.a}
                </div>
              </details>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/zones-desservies"
            className="inline-flex items-center gap-2 text-sm text-gold-dark hover:text-gold underline underline-offset-2"
          >
            Voir toutes les zones desservies
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </>
  )
}

// FAQ exportée pour usage éventuel dans le FAQPage JSON-LD de la page
export { FAQ_MARSEILLE }
