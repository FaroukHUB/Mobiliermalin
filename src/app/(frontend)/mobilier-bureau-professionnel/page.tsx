import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Award,
  Recycle,
  Building2,
  FileBadge2,
  Quote,
  PackageCheck,
  Sparkles,
  Truck,
} from 'lucide-react'
import { Reveal } from '@/components/animations/Reveal'
import {
  getLatestProducts,
  getCategoryHierarchy,
  urlFor,
  type SanityProduct,
} from '@/lib/sanity'
import { ProductCard, type ProductCardData } from '@/components/product/ProductCard'
import { LEGAL } from '@/lib/legal'

const FALLBACK_HERO_URL =
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=2000&q=85'
const FALLBACK_HERO_ALT =
  'Mobilier de bureau professionnel d\'occasion — Steelcase, Vitra, Haworth'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mobiliermalin.com'

export const metadata: Metadata = {
  title: 'Mobilier de bureau professionnel d\'occasion — Steelcase, Vitra, Haworth',
  description:
    'Mobilier de bureau professionnel d\'occasion reconditionné : bureaux, fauteuils ergonomiques, armoires, cloisons des plus grandes marques (Steelcase, Vitra, Haworth, Herman Miller, Majencia). Contrôle qualité 7 points dans notre atelier local, livraison France, attestation RSE.',
  keywords: [
    'mobilier de bureau professionnel',
    'mobilier professionnel',
    'mobilier bureau professionnel',
    'mobilier de bureau professionnel occasion',
    'mobilier de bureau professionnel pas cher',
    'meuble de bureau professionnel',
    'meubles de bureau professionnel',
    'meubles bureau professionnel',
    'bureau professionnel occasion',
    'bureau d\'occasion professionnel',
    'bureau professionnel pas cher',
    'mobilier professionnel d occasion',
    'mobilier professionnel occasion',
    'mobilier bureau professionnel occasion',
    'destockage mobilier de bureau professionnel',
    'destockage bureau professionnel',
  ],
  alternates: { canonical: `${siteUrl}/mobilier-bureau-professionnel` },
  openGraph: {
    title: 'Mobilier de bureau professionnel d\'occasion — Mobilier Malin',
    description:
      'Mobilier de bureau professionnel reconditionné des plus grandes marques dans notre atelier local. Livraison France, attestation RSE.',
    url: `${siteUrl}/mobilier-bureau-professionnel`,
    type: 'website',
  },
}

const BRANDS = [
  { name: 'Steelcase', pitch: 'Leap, Think, Series 1, Gesture' },
  { name: 'Herman Miller', pitch: 'Aeron, Embody, Mirra 2' },
  { name: 'Vitra', pitch: 'ID Chair, AC 5, Aluminium Group' },
  { name: 'Haworth', pitch: 'Fern, Zody, Comforto' },
  { name: 'Majencia', pitch: 'Bureaux droits, bench, caissons' },
  { name: 'USM Haller', pitch: 'Rangements modulaires iconiques' },
  { name: 'HÅG', pitch: 'Capisco, Futu, sièges scandinaves' },
  { name: 'Knoll', pitch: 'Generation, Life, design exécutif' },
] as const

const ENTERPRISE_USECASES = [
  {
    icon: Building2,
    title: 'Aménagement complet',
    desc: 'Plateaux open-space, postes individuels, salles de réunion — fournis et livrés clé en main avec plan d\'implantation.',
  },
  {
    icon: PackageCheck,
    title: 'Renouvellement progressif',
    desc: 'Vous remplacez vos postes au fil des départs. Nous gardons votre gamme en mémoire pour rester cohérent dans le temps.',
  },
  {
    icon: FileBadge2,
    title: 'Démarche RSE documentée',
    desc: 'Attestation de valorisation pour chaque commande : tonnes de CO₂ évitées, mobilier remis en circulation.',
  },
  {
    icon: Sparkles,
    title: 'Pièces d\'exception',
    desc: 'Pour vos espaces dirigeants ou clients : USM Haller, Vitra Aluminium Group, Knoll Generation — pièces sélectionnées.',
  },
] as const

const CONDITION_KEYS: Record<string, string> = {
  new: 'new',
  excellent: 'excellent',
  'very-good': 'very-good',
  good: 'good',
  fair: 'fair',
}

function sanityToCard(p: SanityProduct): ProductCardData {
  const firstImage = p.images?.[0]
  const imageUrl = firstImage
    ? urlFor(firstImage).width(900).height(1200).fit('crop').url()
    : undefined
  return {
    id: p._id,
    slug: p.slug.current,
    title: p.name,
    shortDescription: p.shortDescription,
    price: p.price,
    salePrice: p.salePrice,
    comparePrice: p.comparePrice,
    condition: p.condition ? CONDITION_KEYS[p.condition] : undefined,
    brandName: p.brand,
    imageUrl,
    imageAlt: firstImage?.alt || p.name,
    status: 'published',
  }
}

export default async function MobilierBureauProfessionnelPage() {
  const [latestProducts, categoryGroups] = await Promise.all([
    getLatestProducts(8),
    getCategoryHierarchy(),
  ])

  const productCards = latestProducts.map(sanityToCard)
  const topLevelCategories = categoryGroups.map((g) => g.parent).slice(0, 6)

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Mobilier de bureau professionnel',
        item: `${siteUrl}/mobilier-bureau-professionnel`,
      },
    ],
  }

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Mobilier de bureau professionnel d\'occasion',
    description:
      'Mobilier de bureau professionnel d\'occasion reconditionné des plus grandes marques : Steelcase, Herman Miller, Vitra, Haworth, Majencia, USM Haller. Bureaux, fauteuils, armoires, cloisons — préparés dans notre atelier local.',
    url: `${siteUrl}/mobilier-bureau-professionnel`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Mobilier Malin',
      url: siteUrl,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* ═══ HERO ═══ */}
      <section className="relative bg-ink text-ivory overflow-hidden min-h-[520px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={FALLBACK_HERO_URL}
            alt={FALLBACK_HERO_ALT}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/75 to-ink/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        </div>

        <div className="container relative py-16 md:py-24 w-full">
          <nav aria-label="Fil d'Ariane" className="text-xs text-ivory/60">
            <ol className="flex items-center gap-2 flex-wrap">
              <li><Link href="/" className="hover:text-gold">Accueil</Link></li>
              <ChevronRight className="h-3 w-3" />
              <li className="text-gold">Mobilier de bureau professionnel</li>
            </ol>
          </nav>

          <div className="mt-10 max-w-3xl">
            <p className="eyebrow text-gold">B2B · Entreprises &amp; indépendants</p>
            <h1 className="text-display-xl mt-4 font-serif leading-[1.05] text-ivory">
              Mobilier de bureau professionnel d&apos;occasion
            </h1>
            <div className="h-px w-16 bg-gold mt-8" />
            <p className="mt-8 text-lg text-ivory/85 leading-relaxed">
              Bureaux, fauteuils ergonomiques, armoires, cloisons —
              équipez votre entreprise en mobilier professionnel
              reconditionné des plus grandes marques. Steelcase, Herman
              Miller, Vitra, Haworth, Majencia, USM Haller : prix divisés
              par trois par rapport au neuf, contrôle qualité 7 points
              dans notre atelier local, attestation RSE incluse.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/boutique" className="btn-gold inline-flex items-center gap-2">
                Voir le catalogue
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link href="/contact" className="btn-outline-light">
                Demander un devis
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-ivory/70">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold" /> Atelier local
              </span>
              <span className="inline-flex items-center gap-2">
                <Truck className="h-4 w-4 text-gold" /> Livraison France
              </span>
              <span className="inline-flex items-center gap-2">
                <FileBadge2 className="h-4 w-4 text-gold" /> Attestation RSE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ POURQUOI LE MOBILIER PRO D'OCCASION ═══ */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <Reveal>
          <p className="eyebrow">L&apos;équation</p>
          <h2 className="text-display mt-3 font-serif">
            Pourquoi le mobilier de bureau professionnel se prête
            particulièrement bien à l&apos;occasion
          </h2>
          <div className="gold-divider mx-0 mt-6" />
        </Reveal>

        <div className="mt-10 space-y-6 text-lg text-ink-soft leading-relaxed">
          <Reveal>
            <p>
              Un fauteuil ergonomique Steelcase ou Herman Miller est conçu
              pour quinze ans d&apos;utilisation professionnelle intensive.
              Un bureau Steelcase ou Vitra encaisse vingt ans sans broncher.
              Une armoire métallique pro peut tenir trente ans. Sur ces
              durées, l&apos;essentiel des meubles que nous récupérons en
              entreprise n&apos;a fait que cinq à huit ans — il leur reste
              donc 70 à 80 % de leur vie utile devant eux.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p>
              Le neuf est facturé sur la première vie. L&apos;occasion
              reconditionnée vous donne accès à un meuble qui a déjà
              consommé sa première période mais qui a encore largement de
              quoi vous accompagner — pour un tiers du prix. À condition
              que le reconditionnement soit fait sérieusement : inspection
              technique, remplacement des pièces d&apos;usure, nettoyage
              professionnel, test. C&apos;est le travail que nous menons
              dans notre atelier de La Penne-sur-Huveaune.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <p>
              Pour une entreprise, ce choix n&apos;est pas qu&apos;une
              question budgétaire. C&apos;est aussi un engagement
              documenté : chaque commande s&apos;accompagne d&apos;une
              attestation de valorisation indiquant le poids de mobilier
              réutilisé et les émissions de CO₂ évitées par rapport à un
              équivalent neuf — utile pour vos rapports RSE, vos critères
              d&apos;appel d&apos;offres ou votre bilan carbone.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ MARQUES ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-24">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="eyebrow">Marques que nous reconditionnons</p>
              <h2 className="text-display mt-3 font-serif">
                Les références du mobilier de bureau professionnel
              </h2>
              <div className="gold-divider mx-0 mt-6" />
              <p className="mt-6 text-ink-soft leading-relaxed">
                Nous nous concentrons sur les marques qui ont prouvé leur
                durabilité. Chacune a sa logique de conception et ses
                pièces emblématiques — nous connaissons les références
                courantes, leurs mécanismes, leurs pièces détachées.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {BRANDS.map((brand, i) => (
              <Reveal key={brand.name} delay={i * 40}>
                <div className="bg-ivory border border-line p-5 h-full">
                  <p className="font-serif text-lg text-ink">{brand.name}</p>
                  <p className="mt-2 text-sm text-ink-mute leading-relaxed">
                    {brand.pitch}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CAS D'USAGE B2B ═══ */}
      <section className="container py-16 md:py-24">
        <Reveal>
          <div className="max-w-2xl mb-12">
            <p className="eyebrow">Comment on travaille avec les entreprises</p>
            <h2 className="text-display mt-3 font-serif">
              Quatre cas d&apos;usage typiques
            </h2>
            <div className="gold-divider mx-0 mt-6" />
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {ENTERPRISE_USECASES.map((u, i) => {
            const Icon = u.icon
            return (
              <Reveal key={u.title} delay={i * 80}>
                <article className="bg-ivory-light border border-line p-6 h-full">
                  <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
                  <h3 className="font-serif text-xl text-ink mt-5 leading-tight">
                    {u.title}
                  </h3>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                    {u.desc}
                  </p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ═══ CATÉGORIES ═══ */}
      {topLevelCategories.length > 0 && (
        <section className="bg-ivory-dark border-y border-line">
          <div className="container py-16 md:py-24">
            <Reveal>
              <div className="max-w-2xl mb-10">
                <p className="eyebrow">Notre catalogue</p>
                <h2 className="text-display mt-3 font-serif">
                  Toutes les familles de mobilier professionnel
                </h2>
                <div className="gold-divider mx-0 mt-6" />
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {topLevelCategories.map((cat, i) => {
                const imageUrl = cat.image
                  ? urlFor(cat.image).width(600).height(400).fit('crop').url()
                  : null
                return (
                  <Reveal key={cat._id} delay={i * 60}>
                    <Link
                      href={`/categorie/${cat.slug.current}`}
                      className="group block bg-ivory border border-line hover:border-gold transition-colors duration-300"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden bg-ivory-dark">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={cat.image?.alt || cat.name}
                            fill
                            sizes="(min-width: 768px) 33vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-ink-mute/30 text-xs uppercase tracking-widest">
                            {cat.name}
                          </div>
                        )}
                      </div>
                      <div className="p-5 md:p-6">
                        <h3 className="font-serif text-xl text-ink leading-tight">{cat.name}</h3>
                        {cat.description && (
                          <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                        <p className="mt-4 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                          Voir la sélection <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ DERNIERS MEUBLES ═══ */}
      {productCards.length > 0 && (
        <section className="container py-16 md:py-24">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="eyebrow">Arrivés à l&apos;atelier</p>
                <h2 className="text-display mt-3 font-serif leading-[1.05]">
                  Notre stock professionnel actuel
                </h2>
                <div className="gold-divider mx-0 mt-6" />
              </div>
              <Link href="/boutique" className="text-sm text-gold-dark hover:text-gold underline underline-offset-4 self-end">
                Voir tout le catalogue →
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {productCards.map((card, i) => (
              <Reveal key={card.id} delay={i * 60}>
                <ProductCard product={card} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══ TÉMOIGNAGE B2B ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-20 max-w-4xl">
          <Reveal>
            <Quote className="h-8 w-8 text-gold" strokeWidth={1.5} />
            <p className="mt-5 text-xl md:text-2xl font-serif text-ivory leading-relaxed">
              « Nous avons équipé 18 postes en mobilier de bureau
              professionnel d&apos;occasion : bureaux Steelcase, fauteuils
              Leap, armoires métalliques. Budget divisé par trois par
              rapport à un devis neuf équivalent, qualité visiblement
              irréprochable, et l&apos;attestation RSE nous a permis de
              valoriser le choix en interne et auprès de nos clients. »
            </p>
            <footer className="mt-6 pt-6 border-t border-ivory/20">
              <p className="font-serif text-base text-ivory">Cabinet de conseil — Marseille 6e</p>
              <p className="text-xs text-ivory/60 mt-1 uppercase tracking-widest">
                Équipement complet · 18 postes
              </p>
            </footer>
          </Reveal>
        </div>
      </section>

      {/* ═══ TROIS RAISONS DE PASSER PAR NOUS ═══ */}
      <section className="container py-16 md:py-24 max-w-5xl">
        <Reveal>
          <div className="max-w-2xl mb-12">
            <p className="eyebrow">Nos garanties</p>
            <h2 className="text-display mt-3 font-serif">
              Trois engagements concrets
            </h2>
            <div className="gold-divider mx-0 mt-6" />
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          <Reveal>
            <article className="bg-ivory-light border-l-4 border-gold p-7 h-full">
              <Award className="h-7 w-7 text-gold" strokeWidth={1.5} />
              <h3 className="font-serif text-xl text-ink mt-5">
                Marques pro uniquement
              </h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Pas de mobilier IKEA, Conforama ou no-name dans notre
                catalogue. Uniquement des références qui ont leur place
                dans un environnement de travail intensif.
              </p>
            </article>
          </Reveal>

          <Reveal delay={80}>
            <article className="bg-ivory-light border-l-4 border-gold p-7 h-full">
              <ShieldCheck className="h-7 w-7 text-gold" strokeWidth={1.5} />
              <h3 className="font-serif text-xl text-ink mt-5">
                Notre atelier local
              </h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Chaque pièce est démontée, contrôlée et préparée dans
                notre atelier à La Penne-sur-Huveaune. Notre équipe
                technique reste joignable directement après achat, sans
                passer par un SAV externalisé.
              </p>
            </article>
          </Reveal>

          <Reveal delay={160}>
            <article className="bg-ivory-light border-l-4 border-gold p-7 h-full">
              <Recycle className="h-7 w-7 text-gold" strokeWidth={1.5} />
              <h3 className="font-serif text-xl text-ink mt-5">
                Attestation RSE
              </h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Un document officiel chiffré pour vos rapports RSE,
                bilans carbone et appels d&apos;offres incluant des
                critères d&apos;économie circulaire.
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ═══ LIENS SERVICES ═══ */}
      <section className="bg-ivory-dark border-y border-line">
        <div className="container py-16 md:py-20 max-w-5xl">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="eyebrow">Services entreprises</p>
              <h2 className="text-display mt-3 font-serif">
                Au-delà de la vente
              </h2>
              <div className="gold-divider mx-0 mt-6" />
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            <Reveal>
              <Link
                href="/location-mobilier-bureau"
                className="block group bg-ivory border border-line hover:border-gold transition-colors p-6"
              >
                <p className="eyebrow">Location LLD</p>
                <p className="font-serif text-lg text-ink mt-2 group-hover:text-gold-dark transition">
                  Location longue durée
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  Mensualité fixe, flexibilité, gestion comptable simplifiée.
                </p>
                <p className="mt-3 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Voir <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                </p>
              </Link>
            </Reveal>

            <Reveal delay={60}>
              <Link
                href="/rachat-mobilier-bureau"
                className="block group bg-ivory border border-line hover:border-gold transition-colors p-6"
              >
                <p className="eyebrow">Rachat</p>
                <p className="font-serif text-lg text-ink mt-2 group-hover:text-gold-dark transition">
                  Nous rachetons votre mobilier
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  Évaluation gratuite, paiement cash, enlèvement organisé.
                </p>
                <p className="mt-3 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Voir <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                </p>
              </Link>
            </Reveal>

            <Reveal delay={120}>
              <Link
                href="/vidage-de-locaux"
                className="block group bg-ivory border border-line hover:border-gold transition-colors p-6"
              >
                <p className="eyebrow">Vidage</p>
                <p className="font-serif text-lg text-ink mt-2 group-hover:text-gold-dark transition">
                  Vidage complet de locaux
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  Pour les déménagements, fermetures, rénovations.
                </p>
                <p className="mt-3 text-xs uppercase tracking-widest text-gold-dark inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Voir <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                </p>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="bg-ink text-ivory">
        <div className="container py-16 md:py-20 max-w-3xl mx-auto text-center">
          <Building2 className="h-8 w-8 text-gold mx-auto" strokeWidth={1.5} />
          <p className="eyebrow text-gold mt-4">Pour les entreprises &amp; indépendants</p>
          <h2 className="font-serif text-h1 mt-3 text-ivory">
            Équipez votre bureau professionnel à prix juste
          </h2>
          <div className="h-px w-12 bg-gold mx-auto mt-6" />
          <p className="mt-6 text-ivory/80 leading-relaxed">
            Un poste, un plateau, un siège social complet — nous vous
            préparons un devis détaillé sous 24 h ouvrées, avec
            l&apos;attestation RSE incluse. Visite du showroom possible
            à La Penne-sur-Huveaune sur rendez-vous.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
              Demander un devis
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <Link href="/boutique" className="btn-outline-light">
              Voir le catalogue
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-ivory/60">
            <a href={`tel:${LEGAL.telephoneTel}`} className="inline-flex items-center gap-2 hover:text-gold">
              <Phone className="h-4 w-4" /> {LEGAL.telephone}
            </a>
            <a href={`mailto:${LEGAL.email}`} className="inline-flex items-center gap-2 hover:text-gold">
              <Mail className="h-4 w-4" /> {LEGAL.email}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
