# 🎯 Plan combiné — E-E-A-T + Backlinks + Conversions

> Livrable stratégique final (Sprints 7 + 8 + 9). Chaque section = action concrète priorisée avec responsable, effort et ROI attendu.

---

# 🏛️ SPRINT 7 — E-E-A-T (Experience, Expertise, Authoritativeness, Trust)

Depuis 2022, E-E-A-T est un signal majeur pour Google, particulièrement dans les niches YMYL (Your Money Your Life) — le mobilier professionnel B2B en fait partie (impact santé au travail, achats significatifs). L'objectif : rendre Mobilier Malin **manifestement légitime** aux yeux des moteurs et des IA.

## 7.1 — Pages Auteur (E-E-A-T niveau contenu)

**Objectif** : chaque article guide a un auteur identifiable avec expertise vérifiable.

### Action code
- Nouveau schema Sanity `author` :
  ```
  author {
    name (string)
    slug
    role (string : "Fondateur", "Responsable atelier", "Ergonome consultant")
    bio (portableText)
    photo (image)
    expertise[] (tags : "Ergonomie", "Reconditionnement Steelcase", ...)
    linkedIn (url)
    sameAs[] (autres profils vérifiables)
    yearsExperience (number)
    articlesWritten (auto, calculé)
  }
  ```
- `guideArticle.author` devient une `reference → author` (plus une string libre)
- Nouvelle route `/auteurs/[slug]` qui rend une bio + liste des articles
- Injection dans JSON-LD Article :
  ```
  "author": {
    "@type": "Person",
    "name": "...",
    "url": "https://mobiliermalin.com/auteurs/...",
    "sameAs": ["https://www.linkedin.com/in/..."]
  }
  ```

### Auteurs à créer (minimum viable)
1. **Équipe Mobilier Malin** — pour les articles génériques
2. **Djamel Djennad — Fondateur & Gérant** — expérience 12 ans réemploi mobilier pro, articles direction/stratégie
3. **Responsable atelier** — expertise technique reconditionnement (nom à définir)
4. **Ergonome consultant externe** (idéalement) — expertise santé/postures (partenariat à créer)

**ROI SEO estimé** : +15-30% ranking sur articles ergonomie/santé (YMYL).

## 7.2 — Études de cas / réalisations B2B

**Objectif** : preuves sociales structurées pour B2B + backlinks naturels (les clients partagent leur cas).

### Action code
- Nouveau schema Sanity `caseStudy` :
  ```
  caseStudy {
    clientName (string, ex: "Cabinet Cassidy Avocats")
    clientLogo (image, optionnel)
    sector (enum : "Juridique", "Tech", "Santé", "Public", "Éducation", ...)
    citySlug (ref → localPage, optionnel — pour maillage local)
    projectSummary (text, 2-3 phrases)
    challenge (text)
    solution (portableText)
    results (array : { metric, value, unit })
    testimonialQuote (text)
    testimonialAuthor (string, role + nom si autorisé)
    photos[] (images avant/après)
    productsSupplied[] (refs → product)
    publishedDate (date)
  }
  ```
- Nouvelle route `/realisations` (hub liste) + `/realisations/[slug]` (détail)
- Ajout à la home : bloc "Ils nous ont fait confiance" avec 3-6 études phares

### Objectif volume
- **10 études** en 6 mois
- **30 études** à 12 mois
- Idéal : 1 étude/mois avec vraies photos avant/après

**ROI SEO** : +CTR SERP sur "mobilier bureau + [ville]" via mentions clients locaux. Backlinks naturels quand clients partagent.

## 7.3 — Page "Notre équipe" enrichie

**Objectif** : visages + rôles vérifiables. Google + IA regardent qui est derrière le site.

### Action code
- Enrichir `/notre-demarche` OU créer `/notre-equipe` :
  - Photo + nom + rôle + bio courte de chaque membre (5-10 personnes selon effectif)
  - Chiffres clés (années d'expérience cumulée, formations pro, certifications)
  - Section atelier avec photos réelles
- Schema.org `Organization.employee[]` avec Person + name + jobTitle

**ROI E-E-A-T** : boost ranking + confiance visiteurs → conversion.

## 7.4 — Certifications & labels visibles

### Actions
- Créer bloc "Nos engagements & certifications" en footer OU sur `/notre-demarche` :
  - Loi AGEC (mention + lien vers /guides/rse-reemploi/loi-agec-mobilier-bureau)
  - Éco-organisme Valdelia (si adhérent, sinon marquer "non éligible car <25 tonnes/an")
  - Ecovadis (si applicable — grand potentiel B2B)
  - Ange Bleu / NF Environnement (produits certifiés)
  - Membre CCI / CPME / syndicat
- Chaque logo/label avec lien vers page officielle (renforce `sameAs`)

## 7.5 — Presse & citations

### Actions
- Créer page `/presse` :
  - Kit presse téléchargeable (logo HD, photos atelier, bio dirigeants, chiffres clés)
  - Contact presse dédié
  - Liste des mentions presse existantes avec logos + liens
- Objectif 12 mois : 5 mentions presse minimum

---

# 🔗 SPRINT 8 — Stratégie Backlinks

L'autorité de domaine (DA) actuelle est probablement 15-25 (site jeune). Objectif 12 mois : atteindre **DA 35-45** via 30-50 backlinks de qualité.

## Principe : qualité > quantité

Un backlink d'un site DA 60 vaut 100× un backlink d'un annuaire DA 20. Ne jamais acheter de backlinks. Ne jamais faire de PBN.

## 8.1 — Cibles priorité #1 : partenaires écosystème réemploi

Ces backlinks sont **naturels** et pertinents thématiquement — le meilleur ROI SEO.

### À contacter
1. **Valdelia** (éco-organisme mobilier pro) — demander référencement dans leur annuaire d'adhérents / partenaires reconditionneurs
2. **INEC** (Institut National Économie Circulaire) — membre + case study potentielle
3. **Fédération Française du Réemploi et de la Réparation** — adhésion + lien
4. **Ademe** (Agence Environnement) — appels à projet + mentions
5. **CCI Marseille-Provence** — annuaire membre B2B local
6. **Métropole Aix-Marseille-Provence** — annuaire acteurs économie circulaire
7. **Association Orée** — RSE entreprises
8. **CCI France** — dossier "Économie circulaire en région"

**Approche** : email personnalisé au dirigeant, présentation courte + proposition de contenu (interview, case study, tribune).

## 8.2 — Cibles priorité #2 : presse pro & médias sectoriels

Les articles longs des guides = matière première pour la presse.

### Cibles
- **Actiu Mag** (mobilier bureau pro)
- **Officeasy** / **Officiel du bureau** (média B2B mobilier)
- **Workspace Magazine**
- **Bureaux & Immobilier**
- **La Tribune Marseille** (local business)
- **Made in Marseille**
- **Marsactu**
- **Novethic** (RSE)
- **Youmatter** (économie circulaire)
- **Usine Nouvelle** (industrie & environnement)

### Approche
- Envoyer 1 dossier de presse par trimestre avec un angle (nouveau chantier, prise de position sur loi AGEC, chiffres RSE, expansion)
- Proposer 2-3 tribunes/an sur RSE + mobilier bureau signées par le fondateur
- Répondre systématiquement aux journalistes via **HARO** / **Sourcee.io** / **ResponseSource**

## 8.3 — Cibles priorité #3 : blogs et sites spécialisés

### Cibles
- Blogs déco/design d'intérieur (mais bureau seulement)
- Blogs télétravail / home office
- Blogs ergonomie / kiné / posture
- Sites d'offices managers (Officiel des offices managers)
- Communautés RH / DRH digital
- Podcasts B2B (proposer interview du dirigeant)

### Approche
- Guest posting (rédiger 1 article/mois pour un blog partenaire, avec lien)
- Interviews audio/vidéo (chaque podcast = 1 backlink + visibilité)
- Commentaires argumentés sur articles pertinents (pas spam, vraie valeur)

## 8.4 — Cibles priorité #4 : annuaires et bases de données

### Bons annuaires (à ne pas confondre avec spam)
- **PagesJaunes** (auto-inscription, gratuit) — indispensable pour SEO local
- **Google Business Profile** (déjà en place ? À optimiser)
- **Bing Places for Business**
- **Kompass** (annuaire B2B mondial)
- **Europages** (B2B européen)
- **Sortlist** (agences & prestataires)
- **Ecosia Business Directory** (RSE)
- **Annuaire de la CCI** (local)

À éviter absolument : annuaires génériques 90s "-annuaire.com" à faible autorité.

## 8.5 — Contenus "link magnets" à produire

Ces contenus attirent naturellement des backlinks par leur qualité :

1. **Étude annuelle sur le mobilier de bureau reconditionné en France** — chiffres, tendances, cartographie acteurs. Presse et blogs partageront.
2. **Calculateur d'empreinte carbone mobilier** (outil interactif) — utile RSE managers, largement partagé
3. **Cartographie interactive des acteurs du réemploi mobilier en France** — utile presse et institutionnels
4. **Guide "Loi AGEC pour les acheteurs publics"** — PDF téléchargeable
5. **Baromètre du bien-être au bureau** (sondage annuel) — utile presse RH

## 8.6 — Suivi & KPIs backlinks

Outils : **Ahrefs** ou **Semrush** ou **Majestic**
- Nombre de referring domains (RD) — objectif +30 en 12 mois
- Domain Rating (DR / DA) — objectif 35-45 à 12 mois
- Toxic links à désavouer via GSC (rare mais utile)
- Anchor text distribution (viser diversité, pas 100% "mobilier de bureau")

---

# 💰 SPRINT 9 — Optimisation Conversion (CRO)

Le SEO amène du trafic. Le CRO le transforme en chiffre d'affaires. Objectif : passer d'un taux de conversion visiteur → contact/commande de X% à 2X%.

## 9.1 — Audit conversion actuel (à faire)

Prérequis : installer un outil de heatmap **Hotjar** ou **Microsoft Clarity** (gratuit) pour voir où les visiteurs abandonnent.

### Métriques à suivre
- Taux de rebond par page (GSC + GA4)
- Taux de clic sur CTA principaux
- Taux de complétion formulaire contact
- Taux d'ajout au panier / démarrage devis
- Taux de conversion global visiteur → commande

## 9.2 — CTA repensés

### Principes
- **1 CTA principal par page**, visible sans scroll
- **CTA secondaire** (WhatsApp / téléphone) pour ceux qui hésitent
- **Verbes d'action clairs** (jamais "En savoir plus" seul → "Voir le catalogue fauteuils", "Demander un devis livraison")

### Actions concrètes
- Page produit : "Ajouter au panier" en position sticky sur mobile
- Page catégorie : bloc "Besoin d'aide pour choisir ?" en bas de page
- Home : hero CTA plus visible + secondaire vers /guides
- Article guide : bloc CTA milieu + fin d'article vers catégorie principale
- Pages ville : CTA "Prochaine tournée [ville]" avec calendrier dynamique

## 9.3 — WhatsApp + Téléphone omniprésents

**Le B2B mobilier professionnel = beaucoup d'appels et de messages**. Le contact humain rapide = ROI ×3-5.

### Actions
- Bouton WhatsApp flottant déjà présent → vérifier qu'il ouvre bien un message prérempli avec la page en cours
- Numéro de téléphone cliquable partout (header mobile, footer, fiches produit, CTA)
- Sur les pages devis/panier : bloc "Une question ? Appelez-nous, on répond en 15 min"
- Chatbot IA (déjà présent) → optimiser les prompts pour capturer plus de leads

## 9.4 — Formulaires optimisés

### Principes
- **1 champ = 1 friction**. Réduire au strict minimum.
- Progressive disclosure (demander les infos non essentielles en fin de tunnel)
- **Confiance visible** (nombre de clients servis, avis Google 5⭐, garanties légales)

### Actions concrètes
- Formulaire /contact : passer de 6-8 champs à 3-4 (nom, email, message)
- Formulaire /demander-devis : ajouter progression (étape 1/3, 2/3, 3/3)
- Ajouter preuves sociales à côté de chaque formulaire (avis récent, chiffre client)
- SMS de confirmation instantané (via Brevo) → réduit doute post-envoi

## 9.5 — Filtres boutique

Le catalogue va grandir. Sans filtres pertinents, l'utilisateur abandonne.

### Actions
- Ajouter filtres : marque, prix (fourchettes), état (conditions), couleur, dimensions
- Filtres URL (`?brand=steelcase&color=noir`) avec canonique intelligent (ou noindex sur combinaisons filtres)
- Tri : nouveautés / prix ↑↓ / promotions
- Compteur de résultats "3 fauteuils Steelcase < 500€"

## 9.6 — Confiance (trust signals)

### Actions à ajouter partout
- **Bandeau confiance sticky mobile** en bas : ★★★★★ Avis Google + garantie
- **Badges de paiement** visibles (CB, Stripe, Apple Pay)
- **Mention garantie légale** claire dans chaque fiche produit
- **Photos réelles de l'atelier** dans la home et /notre-demarche
- **Compteur clients servis** ("+500 entreprises équipées")
- **Notes agrégées** produits (quand aggregateRating disponible per-produit)
- **Certificat sécurité** SSL visible + politique retour lisible

## 9.7 — Navigation / trouvabilité

### Actions
- Mega-menu déjà en place → vérifier lisibilité mobile (dropdown accordéon)
- Search bar dans le header (ajouter si absent) — pointe vers `/boutique?q=`
- Breadcrumbs partout (fait dans Sprints 2-5) → aide le retour au silo
- Footer avec liens abondants (fait dans Sprint 4)

## 9.8 — Performance = conversion

**Chaque 100ms de LCP en plus = -1% de conversion mobile.**

Déjà fait dans Sprint 1 :
- Reveal CSS-only (-70ms main-thread)
- Fonts next/font display swap

À faire :
- Audit régulier Lighthouse mobile (viser LCP < 2.5s, INP < 200ms, CLS < 0.1)
- Optimisation images : vérifier Sanity images bien servies en avif/webp
- Preconnect vers cdn.sanity.io dans le layout
- Différer Google Analytics (déjà via GoogleAnalytics component)

## 9.9 — A/B testing (V2)

Une fois le trafic > 2000 sessions/mois, tester :
- Deux versions du CTA principal home
- Deux structures de fiche produit (galerie top vs galerie side)
- Deux couleurs de bouton "Ajouter au panier"
- Deux placements du chatbot

Outil : **Google Optimize (déprécié)** → **VWO** ou **Convert** ou **Optimizely**.

---

# 🎯 SYNTHÈSE — Roadmap 12 mois consolidée

| Mois | Focus principal | Livrables clés |
|---|---|---|
| **M1** | Publication cocon initial (12 articles) + création auteurs Sanity | Route /auteurs, 3 auteurs saisis, 12 articles publiés |
| **M2** | Continuer publication (15 art.) + 3 études de cas | Route /realisations, 3 études, 27 articles cumulés |
| **M3** | Publication (20 art.) + kit presse | Route /presse, 47 articles cumulés, 1er contact presse |
| **M4** | Publication (25 art.) + démarrage stratégie backlinks | Contact Valdelia, INEC, Ademe, CCI. 72 art. cumulés |
| **M5** | Publication (30 art.) + audit CRO + heatmap | Hotjar/Clarity installé, CTA refondus, 102 art. |
| **M6** | Publication (30 art.) + refonte filtres boutique | Filtres marque/prix/état, 132 art., 1ère étude "État réemploi" |
| **M7-9** | 90 art. + 1 tribune presse trimestre + partenariats | 5 backlinks presse acquis, DR 30 |
| **M10-12** | 90 art. + optimisation continue GSC | 312 art., DR 35-40, 10 études de cas |

---

# 📊 KPIs cibles 12 mois

| Métrique | Baseline (estim.) | Objectif M6 | Objectif M12 |
|---|---|---|---|
| Sessions organiques / mois | 300-800 | 2 000 | 6 000-10 000 |
| Pages indexées | ~50 | 200 | 400+ |
| Positions top 10 GSC | 5-15 | 60 | 200+ |
| Domain Rating (Ahrefs) | 15-20 | 25-30 | 35-45 |
| Referring domains | 5-15 | 25 | 50+ |
| Taux conversion visiteur → contact | 1-2% | 2.5% | 4% |
| Chiffre d'affaires SEO attribué | ? | ×3 | ×10 |

---

# 🚀 Prochaines actions immédiates (semaine 1)

1. **Farouk** : commencer à créer 1er cluster Sanity `ergonomie` + 1er article `mal-de-dos-au-bureau` (brief détaillé #1)
2. **Farouk** : uploader `favicon.ico` + `apple-touch-icon.png` + `og-image.jpg` + `logo.png` dans Sanity settings.ogImage (résout dernier point audit initial)
3. **Farouk** : valider table BRAND_OFFICIAL_URL dans `src/lib/schema-mappings.ts`
4. **Farouk** : remplir les champs pillar de 1-2 catégories (ex: fauteuils-ergonomiques) → voir l'effet immédiat en prod
5. **Farouk** : décider politique retour + livraison (répondre aux questions Doc 6 du design product schema V3)
6. **Claude / Farouk** : décider sur les 8 pages ville restantes — batch refactor pattern Nice OU acceptable en l'état pour l'instant
