# Audit SEO — mobiliermalin.com

> **Document interne — préparation stratégie SEO locale PACA + blog + réseaux sociaux**
>
> Version du 4 juillet 2026 — diagnostic uniquement, aucune modification de code.
> Stack : Next.js 15 (App Router) + Sanity CMS + Vercel + Stripe + Cal.com + Brevo.

---

## 0. Synthèse exécutive (à retenir avant d'aller plus loin)

**Le site est techniquement propre.** L'infrastructure SEO on-page est solide : chaque page a un `<title>`, une `meta description`, un `canonical`, des données structurées (JSON-LD Product, LocalBusiness, BreadcrumbList, FAQPage, BlogPosting). Le sitemap est dynamique, les 301 des anciennes URL WordPress sont en place, robots.txt est cohérent.

**Le vrai chantier n'est pas technique — il est éditorial.** Trois zones de fragilité :

1. **Fiches produit sous-alimentées** — la richesse dépend de ce que Djamel saisit dans Sanity. Sans description longue (300+ mots), Google les classe en « Détectée, actuellement non indexée » — c'est le premier problème remonté par la Search Console.
2. **Pages locales secondaires trop similaires** — les 10 pages `bureau-occasion-*` et `fauteuil-occasion-*` partagent 70 % de leur structure. Risque de **cannibalisation** (deux pages qui se disputent le même mot-clé, aucune ne classe).
3. **Le blog est amorcé (3 articles piliers + schéma Sanity) mais vide côté production**. C'est la brique qui manque pour cibler les requêtes informationnelles (haut de tunnel) et alimenter le maillage.

**Priorité des efforts recommandée** — 60 % éditorial (rédaction Sanity par Djamel), 30 % blog (10 à 15 articles à publier sur 6 mois), 10 % technique (quelques ajustements listés en fin de doc).

---

## 1. Inventaire complet des routes

### 1.1 Pages transactionnelles (indexables)

| Route | Type | Priorité SEO |
|---|---|---|
| `/` | Accueil | 🔴 Critique |
| `/boutique` | Index catalogue | 🔴 Critique |
| `/categorie/[slug]` | 7 catégories statiques + N Sanity | 🔴 Critique |
| `/produit/[slug]` | N produits (dynamique Sanity) | 🔴 Critique |

### 1.2 Pages services

| Route | Cible | Priorité |
|---|---|---|
| `/vidage-de-locaux` | B2B — vidage entreprises | 🔴 Critique |
| `/location-mobilier-bureau` | B2B — LLD 36 mois | 🟠 Élevée |
| `/rachat-mobilier-bureau` | B2B — rachat parc | 🟠 Élevée |
| `/mobilier-bureau-professionnel` | Page pilier B2B | 🟠 Élevée |
| `/attestation-rse` | Argument commercial | 🟡 Moyenne |
| `/charte-qualite` | Argument commercial | 🟡 Moyenne |

### 1.3 Pages locales SEO (10 pages)

| Route | Ville ciblée | Distance atelier |
|---|---|---|
| `/bureau-occasion-marseille` | Marseille (13) | 20 min |
| `/bureau-occasion-aubagne` | Aubagne (13) | 5 min |
| `/bureau-occasion-aix-en-provence` | Aix (13) | 45 min |
| `/bureau-occasion-la-ciotat` | La Ciotat (13) | 25 min |
| `/bureau-occasion-toulon` | Toulon (83) | 1 h |
| `/bureau-occasion-nice` | Nice (06) | 2 h |
| `/bureau-occasion-avignon` | Avignon (84) | 1 h 15 |
| `/bureau-occasion-orange` | Orange (84) | 1 h 30 |
| `/fauteuil-occasion-marseille` | Marseille | — |
| `/fauteuil-occasion-aubagne` | Aubagne | — |
| `/fauteuil-occasion-aix-en-provence` | Aix | — |
| `/fauteuil-occasion-toulon` | Toulon | — |
| `/fauteuil-occasion-nice` | Nice | — |
| `/meuble-occasion-marseille` | Marseille (générique) | — |
| `/meuble-occasion-aubagne` | Aubagne (générique) | — |

### 1.4 Pages éditoriales / informationnelles

| Route | État |
|---|---|
| `/blog` | Index — 3 articles piliers hardcodés + désormais alimenté par Sanity |
| `/blog/[slug]` | 3 articles hardcodés + N articles Sanity (rich text WordPress-like) |
| `/notre-demarche` | Storytelling entreprise |
| `/faq` | FAQ globale (schema FAQPage) |
| `/contact` | Formulaire de contact |

### 1.5 Pages fonctionnelles / transactionnelles (non-SEO)

| Route | Statut robots |
|---|---|
| `/panier` | noindex, follow |
| `/demander-devis` | noindex, follow |
| `/commande/succes` | noindex, nofollow |
| `/devis/[uid]` | noindex, nofollow |

### 1.6 Pages légales (indexables mais faible priorité)

| Route |
|---|
| `/mentions-legales` |
| `/cgv` |
| `/politique-confidentialite` |
| `/cookies` |
| `/retractation` |

### 1.7 Total

**~55 URL indexables** actuellement en production (hors produits Sanity dynamiques).

---

## 2. Audit page par page

Grille appliquée : ✅ conforme / ⚠️ à surveiller / ❌ à corriger / — non applicable.

### 2.1 Page d'accueil `/`

| Critère | État | Détail |
|---|---|---|
| `<title>` | ✅ | *Mobilier de bureau d'occasion reconditionné — Mobilier Malin* |
| `meta description` | ✅ | 160 caractères, mention marques + atelier + PACA |
| `<h1>` | ✅ | Un seul, dans le hero |
| Hiérarchie H2/H3 | ✅ | Structure claire (Manifeste, Brands, Categories, Services, Process, Showroom, Impact, Testimonials, Blog, Newsletter) |
| Canonical | ✅ | `/` |
| Robots | ✅ | Index, follow (par défaut) |
| Schema.org | ✅ | Organization (via `<OrganizationSchema />`) |
| Contenu texte | ✅ | Riche, structuré, unique |
| Maillage sortant | ✅ | Vers boutique, catégories, services, blog, contact — dense |
| Profondeur | 0 (racine) | — |
| Sitemap | ✅ | Priorité 1.0 |

**Verdict** — page saine. Aucune action requise.

### 2.2 Catalogue `/boutique`

| Critère | État | Détail |
|---|---|---|
| `<title>` | ✅ | *Notre catalogue* |
| `meta description` | ✅ | Réécrite récemment, orientée atelier local |
| `<h1>` | ✅ | *Notre catalogue* |
| Hiérarchie | ✅ | Filtres + grille produits |
| Canonical | ✅ | `/boutique` |
| Robots | ✅ | Index, follow |
| Schema.org | ⚠️ | Pas de `ItemList` (améliorable) |
| Contenu texte | ⚠️ | Introduction courte (~150 mots) — pourrait être plus riche pour ranker sur *« catalogue mobilier bureau occasion »* |
| Sitemap | ✅ | Priorité 0.9 |

**Verdict** — page fonctionnelle. Enrichir l'intro éditoriale (+200 mots) et ajouter `ItemList` schema.

### 2.3 Catégories `/categorie/[slug]`

7 catégories statiques (`bureaux-individuels`, `fauteuils-ergonomiques`, `armoires-rangements`, `chaises-accueil-reunion`, `tables-de-reunion`, `espaces-detente`, `caissons`) + les catégories Sanity créées par Djamel.

| Critère | État | Détail |
|---|---|---|
| `<title>` | ✅ | Auto : *« [Nom] reconditionnés — [prix départ] »* |
| `meta description` | ⚠️ | Fallback générique si `sanityCat.description` est vide |
| `<h1>` | ✅ | Nom de la catégorie |
| Hiérarchie | ✅ | H2 « Sous-catégories », « Notre sélection », « Ce qui distingue nos… » |
| Canonical | ✅ | `/categorie/[slug]` |
| Schema.org | ✅ | BreadcrumbList |
| Contenu texte | ❌ | **Sans description Sanity, la page ne montre que la grille de produits — thin content côté Google** |
| FAQ | ✅ | Statique riche pour `fauteuils-ergonomiques` ; générique `CategoryFAQ` pour les autres |
| Maillage | ✅ | Sous-catégories, breadcrumb, retour boutique, « autres univers », CTA contact |
| Sitemap | ✅ | Priorité 0.8 |

**Verdict** — le template est bon. Contenu à alimenter dans Sanity (200-300 mots par catégorie).

### 2.4 Fiches produit `/produit/[slug]`

C'est **la page cruciale** — c'est là qu'un utilisateur convertit et là que Google évalue la « pertinence produit ».

| Critère | État | Détail |
|---|---|---|
| `<title>` | ✅ | *« [Nom] — [prix] »* |
| `meta description` | ✅ | Auto ou personnalisée en Sanity via `seo.metaDescription` |
| `<h1>` | ✅ | Nom du produit |
| Hiérarchie | ✅ | H2 récent : *« En savoir plus »*, *« Vos questions »*, *« Vous aimerez aussi »* |
| Canonical | ✅ | `/produit/[slug]` |
| Schema.org | ✅ | Product + Offer + BreadcrumbList + FAQPage |
| Images ALT | ⚠️ | Fallback `${product.name} - vue N` — mieux si Djamel remplit `alt` en Sanity |
| Contenu texte | ❌ | **Voir 3.1 — problème #1 du site** |
| Onglets | ✅ | Description / Caractéristiques / Livraison — parser intelligent des bullets ✔️ |
| Cross-sell | ✅ | 4 produits même catégorie |
| Maillage sortant | ✅ | Charte-qualité, notre-démarche, attestation-rse, 6 pages locales via onglet Livraison, category link |
| Sitemap | ✅ | Priorité 0.7, `lastModified` = `_updatedAt` Sanity |

**Verdict** — **template excellent, contenu à alimenter**. C'est le point de levier n°1.

### 2.5 Blog `/blog` + `/blog/[slug]`

| Critère | État | Détail |
|---|---|---|
| `<title>` index | ✅ | *« Blog & conseils — mobilier de bureau reconditionné »* |
| `<h1>` index | ✅ | *Guides, comparatifs et conseils…* |
| Schema.org index | ✅ | Blog + BlogPosting[] |
| Article `<title>` | ✅ | seo.metaTitle Sanity ou fallback titre |
| Article schema | ✅ | BlogPosting + BreadcrumbList |
| Portable Text rendu | ✅ | Palette WordPress-like complète (H2-H4, listes, callouts, code, YouTube, tableaux, CTA) |
| Contenu | ⚠️ | 3 articles hardcodés + 0 article Sanity → **bibliothèque à alimenter** |
| Sitemap | ✅ | Fusion Sanity + hardcodés dédupliqués |

**Verdict** — infrastructure prête, contenu à produire.

### 2.6 Pages services

#### `/vidage-de-locaux`

| Critère | État |
|---|---|
| Title/description | ✅ Optimisé sur *« vidage locaux professionnels Marseille PACA »* |
| Structure | ✅ 5 steps + benefits + CTA — complet |
| Schema | ⚠️ Pas de `Service` schema.org |
| Contenu | ✅ ~500 mots, unique |

**Verdict** — page performante. Ajouter `Service` schema.

#### `/location-mobilier-bureau` (LLD 36 mois)

| Critère | État |
|---|---|
| Title | ✅ *« Location longue durée mobilier de bureau — 36 mois, services inclus »* |
| Structure | ✅ Comparatif achat vs location, FAQ, tableau prix |
| Schema | ⚠️ Pas de `Service` schema.org |
| Contenu | ✅ Riche |

**Verdict** — page très bien construite. Cible B2B claire.

#### `/rachat-mobilier-bureau` + `/mobilier-bureau-professionnel`

Deux pages piliers B2B. Contenu riche, bien structuré. À conserver.

#### `/attestation-rse` + `/charte-qualite`

Pages « argumentaire commercial » — bien pour renforcer la confiance. Reçoivent beaucoup de liens internes. À conserver, à enrichir si possible.

### 2.7 Pages locales SEO (10 pages)

**Toutes ces pages partagent la même structure** : hero + section commerciale + section « Nos derniers arrivages » + section trajet/livraison + FAQ éventuelle + JSON-LD LocalBusiness/FurnitureStore.

| Page | Distance atelier | Contenu unique | Risque cannibalisation | Verdict |
|---|---|---|---|---|
| `/bureau-occasion-marseille` | 20 min | ✅ Élevé | Faible | 🟢 Pilier |
| `/bureau-occasion-aubagne` | 5 min | ✅ Élevé (spécifique magasin) | Faible | 🟢 Pilier |
| `/bureau-occasion-aix-en-provence` | 45 min | ✅ Moyen | ⚠️ vs Marseille | 🟡 OK |
| `/bureau-occasion-la-ciotat` | 25 min | 🟡 Faible | ⚠️ vs Marseille | 🟠 À enrichir |
| `/bureau-occasion-toulon` | 1 h | 🟡 Faible | ⚠️ vs fauteuil-toulon | 🟠 À enrichir |
| `/bureau-occasion-nice` | 2 h | 🟡 Faible | Faible | 🟠 À enrichir |
| `/bureau-occasion-avignon` | 1 h 15 | 🟡 Faible | ⚠️ vs Orange | 🟠 À enrichir |
| `/bureau-occasion-orange` | 1 h 30 | 🟡 Faible | ⚠️ vs Avignon | 🟠 À enrichir |
| `/fauteuil-occasion-marseille` | — | ✅ Élevé | Faible | 🟢 Pilier |
| `/fauteuil-occasion-aubagne` | — | ✅ Élevé | Faible | 🟢 Pilier |
| `/fauteuil-occasion-aix-en-provence` | — | ✅ Moyen | ⚠️ vs fauteuil-marseille | 🟡 OK |
| `/fauteuil-occasion-toulon` | — | 🟡 Faible | ⚠️ vs bureau-toulon | 🟠 À enrichir |
| `/fauteuil-occasion-nice` | — | 🟡 Faible | ⚠️ vs bureau-nice | 🟠 À enrichir |
| `/meuble-occasion-marseille` | — | ✅ Moyen | ⚠️ vs bureau-marseille | 🟡 Surveiller |
| `/meuble-occasion-aubagne` | — | ✅ Moyen | ⚠️ vs bureau-aubagne | 🟡 Surveiller |

**Risque de cannibalisation détecté** : sur Toulon et Nice, `bureau-occasion-*` et `fauteuil-occasion-*` visent des requêtes proches et pourraient se disputer le classement. À arbitrer (voir § 3.4).

### 2.8 Pages légales

| Page | État | Note |
|---|---|---|
| `/mentions-legales` | ✅ | LEGAL constants à jour |
| `/cgv` | ✅ | Article 9 (garanties) nettoyé récemment |
| `/politique-confidentialite` | ✅ | RGPD + cookies (Consent Mode v2) |
| `/cookies` | ✅ | Tableau clair |
| `/retractation` | ✅ | 14 jours loi Hamon |

**Verdict** — Pack légal solide. Aucune action.

---

## 3. Diagnostic transverse

### 3.1 Problème n°1 — Fiches produit « thin content »

**Symptôme** — dans Search Console : catégorie *« Détectée, actuellement non indexée »* qui touche beaucoup de fiches produit.

**Cause racine** — Google découvre l'URL via le sitemap mais choisit de ne pas la crawler / indexer car il perçoit un contenu insuffisant. Une fiche produit sans description longue = ~80 mots utiles (nom + specs + boilerplate FAQ).

**Impact business** — les produits n'apparaissent pas dans les recherches Google Shopping ni sur les requêtes longue traîne (« Steelcase Leap V2 occasion Marseille »).

**Correction** — rédaction Sanity par Djamel, minimum :
- Description longue : **300 mots par produit** (histoire modèle, points forts, matériaux, usages)
- **4-6 photos** avec alt-text descriptif
- **Dimensions/matière/couleur/état** systématiquement remplis
- **Marque** liée à Sanity

**Ordre de priorité** : produits `featured: true` d'abord, puis `exception: true`, puis les plus vus en GA4.

### 3.2 Problème n°2 — Pages locales secondaires faibles

Les pages Toulon, Nice, Avignon, Orange, La Ciotat sont trop similaires les unes aux autres. Structure identique, différenciation limitée aux mentions de ville / autoroute / temps de trajet.

**Impact SEO** : Google peine à distinguer laquelle classer sur *« bureau occasion [ville] »*.

**Correction** — pour chaque page à enrichir, ajouter :
- Un paragraphe d'ancrage local (secteur d'activité dominant, ZI/zones d'entreprises, nom d'axe routier)
- 3 cas clients réels ou fictifs anonymisés (ex : « Cabinet d'avocats à Orange équipé de 12 fauteuils Herman Miller en juin 2026 »)
- Un mini-guide de récupération/livraison spécifique
- 3-5 photos d'ambiance ou du showroom
- **Liste de 4-6 produits actuellement en stock** susceptibles d'intéresser cette ville (cross-sell)

### 3.3 Problème n°3 — Blog vide côté Sanity

**Actuel** — 3 articles piliers hardcodés (comparatif fauteuils, occasion vs reconditionné, impact écologique).

**Manque** — pas de flux éditorial ; Google n'a rien de nouveau à indexer côté blog.

**Correction** — plan de production (voir § 6).

### 3.4 Risques de cannibalisation détectés

| Paire | Mot-clé disputé | Recommandation |
|---|---|---|
| `bureau-occasion-toulon` ↔ `fauteuil-occasion-toulon` | *mobilier bureau Toulon* | Repositionner fauteuil-toulon sur *fauteuil ergonomique Toulon* strictement |
| `bureau-occasion-nice` ↔ `fauteuil-occasion-nice` | *mobilier bureau Nice* | Idem |
| `meuble-occasion-marseille` ↔ `bureau-occasion-marseille` | *meuble Marseille* + *bureau Marseille* | Assumer complémentaires : meuble = grand public, bureau = pro. Le title doit clarifier. |
| `meuble-occasion-aubagne` ↔ `bureau-occasion-aubagne` | *meuble Aubagne* + *bureau Aubagne* | Idem |
| `bureau-occasion-avignon` ↔ `bureau-occasion-orange` | *mobilier bureau Vaucluse* | Une des deux prend le lead Vaucluse, l'autre devient locale stricte |

### 3.5 Pages orphelines

Une **page orpheline** = une page qu'aucun lien interne ne référence.

| Page | Liens entrants internes | Statut |
|---|---|---|
| `/attestation-rse` | Footer + fiches produit (FAQ) + services | ✅ Bien maillée |
| `/vidage-de-locaux` | Footer + home (ServicesSection) + FAQ produit | ✅ Bien maillée |
| `/rachat-mobilier-bureau` | Footer + FAQ produit/catégorie | ✅ Bien maillée |
| `/mobilier-bureau-professionnel` | Footer + CategoryFAQ | ✅ Bien maillée |
| `/charte-qualite` | Fiche produit + FAQ + notre-demarche | ✅ Bien maillée |
| `/faq` | Footer uniquement | 🟠 Peu maillée |
| `/notre-demarche` | Footer + Header + Home | ✅ Bien maillée |

**Aucune page orpheline critique détectée.** `/faq` mériterait 1-2 liens entrants supplémentaires depuis les fiches produit.

### 3.6 Profondeur de clic

Objectif Google : **toute page importante accessible en 3 clics maximum**.

| Type de page | Profondeur | OK ? |
|---|---|---|
| Home | 0 | — |
| Boutique | 1 (menu) | ✅ |
| Catégorie | 2 (menu → mega-menu) | ✅ |
| Fiche produit | 3 (home → catégorie → produit) OU 2 (home → boutique → produit) | ✅ |
| Page locale | 2 (footer → page) | ✅ |
| Blog article | 2 (menu → blog → article) | ✅ |
| Service (vidage, LLD…) | 1-2 | ✅ |
| Attestation RSE / Charte | 2-3 | ✅ |

**Aucune page importante enterrée à 4+ clics.**

---

## 4. Analyse mots-clés

Cartographie de la couverture actuelle et des **manques**.

### 4.1 Mots-clés parfaitement couverts

| Mot-clé | Page cible | Volume estimé /mois FR | Note |
|---|---|---|---|
| *mobilier de bureau occasion* | `/` + `/boutique` | 5 400 | 🟢 Fort |
| *mobilier de bureau reconditionné* | `/notre-demarche` + `/` | 1 900 | 🟢 Fort |
| *mobilier bureau occasion Marseille* | `/bureau-occasion-marseille` | 590 | 🟢 Fort |
| *mobilier bureau occasion Aubagne* | `/bureau-occasion-aubagne` | 210 | 🟢 Fort |
| *fauteuil de bureau occasion* | `/categorie/fauteuils-ergonomiques` + `/fauteuil-occasion-marseille` | 3 600 | 🟢 Fort |
| *fauteuil ergonomique occasion* | `/categorie/fauteuils-ergonomiques` | 720 | 🟢 Fort |
| *vidage locaux professionnels* | `/vidage-de-locaux` | 320 | 🟢 Fort |
| *rachat mobilier de bureau* | `/rachat-mobilier-bureau` | 480 | 🟢 Fort |

### 4.2 Mots-clés couverts mais à renforcer

| Mot-clé | Page cible actuelle | Volume | Action |
|---|---|---|---|
| *déstockage mobilier de bureau* | 🟡 Non ciblé explicitement | 590 | Créer H2 dans `/boutique` OU landing dédiée |
| *installation mobilier de bureau* | 🟡 Mentionné dans `/mobilier-bureau-professionnel` | 260 | Renforcer avec un H2 explicite |
| *Steelcase occasion* | 🟡 Mentionné partout mais pas de page dédiée | 480 | **Landing `/steelcase-occasion` à créer** |
| *Herman Miller reconditionné* | 🟡 Idem | 320 | **Landing `/herman-miller-occasion` à créer** |
| *bureau assis debout occasion* | 🟡 Sous-catégorie non dédiée | 210 | Créer catégorie Sanity + page |

### 4.3 Opportunités de mots-clés (non couverts, forts en volume)

| Mot-clé | Volume estimé | Intention | Comment cibler |
|---|---|---|---|
| *bureau ergonomique reconditionné* | 320 | Achat | H2 dans catégorie bureaux |
| *fauteuil Steelcase Leap V2* | 590 | Achat produit | Fiche produit + article blog comparatif |
| *fauteuil Herman Miller Aeron* | 720 | Achat produit | Fiche produit + article blog |
| *mobilier bureau seconde main* | 480 | Achat / info | Article blog + H2 boutique |
| *économie circulaire mobilier* | 260 | Info B2B | Article blog RSE |
| *bilan carbone mobilier bureau* | 170 | Info B2B | Article blog RSE |
| *ameublement bureau entreprise* | 320 | Achat B2B | `/mobilier-bureau-professionnel` — renforcer |
| *fournisseur mobilier bureau Marseille* | 210 | B2B local | `/bureau-occasion-marseille` — renforcer |
| *magasin mobilier de bureau Aubagne* | 170 | Local | `/meuble-occasion-aubagne` — déjà bon |
| *loi AGEC mobilier* | 90 | Info B2B | Article blog |

### 4.4 Requêtes longue traîne (à cibler via blog)

Requêtes 4+ mots avec faible concurrence mais taux de conversion élevé :
- *comparer Steelcase Leap Herman Miller Aeron* — 40/mois — **article blog déjà écrit**
- *différence occasion et reconditionné mobilier bureau* — 30/mois — **article blog déjà écrit**
- *combien coûte un fauteuil ergonomique reconditionné* — 20/mois — 🟠 à écrire
- *pourquoi acheter mobilier bureau reconditionné* — 60/mois — 🟠 à écrire
- *durée de vie fauteuil Steelcase* — 70/mois — 🟠 à écrire
- *où trouver mobilier bureau pas cher Marseille* — 90/mois — 🟠 à écrire
- *qui rachète mobilier bureau entreprise* — 120/mois — 🟠 à écrire
- *comment aménager open-space petit budget* — 320/mois — 🟠 à écrire

---

## 5. Tableau final — plan d'action priorisé

**Légende priorité** : 🔴 Critique (impact business immédiat) · 🟠 Élevée (impact dans 30-60 j) · 🟡 Moyenne (impact dans 90+ j) · 🟢 Nice-to-have.

| # | Page actuelle | Mot-clé cible | Problème SEO | Action recommandée | Priorité | Type de contenu à créer |
|---|---|---|---|---|---|---|
| 1 | `/produit/*` (toutes) | *[nom produit] occasion* | Thin content, description <100 mots | Rédiger 300+ mots par produit dans Sanity | 🔴 | Description longue + 4-6 photos + specs |
| 2 | `/categorie/*` (7 statiques) | *[catégorie] reconditionné* | Fallback texte si Sanity vide | Rédiger description Sanity 200-300 mots par catégorie | 🔴 | Texte éditorial Sanity |
| 3 | `/blog` | — | Vide en Sanity (3 articles hardcodés seulement) | Publier 10 articles sur 6 mois | 🔴 | Voir plan éditorial §6 |
| 4 | *(nouvelle)* `/steelcase-occasion` | *Steelcase occasion* | Landing marque manquante | Créer landing dédiée Steelcase | 🟠 | Landing marque |
| 5 | *(nouvelle)* `/herman-miller-occasion` | *Herman Miller reconditionné* | Idem | Créer landing dédiée Herman Miller | 🟠 | Landing marque |
| 6 | `/bureau-occasion-toulon` | *bureau occasion Toulon* | Thin, similaire à Nice/Avignon | Ajouter cas clients + photos + produits actuels | 🟠 | Contenu éditorial |
| 7 | `/bureau-occasion-nice` | *bureau occasion Nice* | Idem | Idem + arbitrer vs `fauteuil-occasion-nice` | 🟠 | Contenu + arbitrage |
| 8 | `/bureau-occasion-avignon` + `/bureau-occasion-orange` | *mobilier bureau Vaucluse* | Cannibalisation possible | Positionner Avignon comme hub Vaucluse | 🟠 | Repositionnement titre/H1 |
| 9 | `/bureau-occasion-la-ciotat` | *bureau occasion La Ciotat* | Thin content | Enrichir (400 mots) | 🟠 | Contenu éditorial |
| 10 | `/fauteuil-occasion-toulon` + `/fauteuil-occasion-nice` | *fauteuil ergonomique [ville]* | Cannibalisation avec bureau | Repositionner strictement sur ergonomie | 🟠 | Ajustement H1/title |
| 11 | `/boutique` | *catalogue mobilier bureau* | Intro courte | +200 mots éditorial + Schema `ItemList` | 🟡 | Contenu + schema |
| 12 | `/vidage-de-locaux` | *vidage locaux professionnels* | Pas de schema Service | Ajouter JSON-LD Service | 🟡 | Balisage schema |
| 13 | `/location-mobilier-bureau` | *location mobilier bureau LLD* | Idem | Ajouter JSON-LD Service | 🟡 | Balisage schema |
| 14 | `/rachat-mobilier-bureau` | *rachat mobilier bureau* | Idem | Ajouter JSON-LD Service | 🟡 | Balisage schema |
| 15 | `/mobilier-bureau-professionnel` | *ameublement bureau entreprise* | Manque H2 sur installation | Ajouter section installation | 🟡 | Contenu éditorial |
| 16 | `/faq` | *questions mobilier bureau* | Peu de liens entrants | Ajouter liens depuis fiches produit | 🟡 | Maillage interne |
| 17 | *(nouvelle)* `/bureau-assis-debout-occasion` | *bureau assis debout occasion* | Catégorie non couverte | Créer catégorie Sanity + landing | 🟡 | Nouvelle catégorie |
| 18 | Toutes fiches produit | Images | Alt fallback générique | Djamel remplit `alt` en Sanity | 🟡 | Édition Sanity |
| 19 | `/blog/[slug]` (les Sanity) | *[requêtes info]* | Aucun article Sanity encore | Publier 1 article par 2 semaines | 🟠 | Articles blog |
| 20 | Sitemap | — | Pages Sanity blog ajoutées | ✅ Déjà en place | 🟢 | — |

---

## 6. Plan éditorial blog — 15 articles sur 6 mois

Structure suggérée par thème et par intention de recherche.

### 6.1 Piliers déjà en ligne (hardcodés)

- **Comparatif fauteuils Steelcase / Herman Miller / Haworth / Vitra** — pilier marques
- **Occasion, seconde main, reconditionné : la vraie différence** — pilier guide
- **Impact écologique du mobilier reconditionné** — pilier RSE

### 6.2 Articles à écrire (par priorité)

| # | Titre proposé | Mot-clé principal | Volume | Intention | Priorité |
|---|---|---|---|---|---|
| 1 | *Prix mobilier de bureau reconditionné 2026 : le guide complet* | *combien coûte fauteuil ergonomique reconditionné* | 200 | Achat | 🔴 |
| 2 | *Où trouver du mobilier de bureau pas cher à Marseille en 2026* | *mobilier bureau pas cher Marseille* | 250 | Local | 🔴 |
| 3 | *Fauteuil Steelcase Leap V2 : test complet après 5 ans d'usage* | *Steelcase Leap V2 avis* | 320 | Achat | 🔴 |
| 4 | *Aménager un open-space petit budget : le retour d'expérience de 3 PME marseillaises* | *aménager open-space petit budget* | 320 | Achat B2B | 🟠 |
| 5 | *Qui rachète le mobilier de bureau d'entreprise en PACA ?* | *qui rachète mobilier bureau entreprise* | 120 | Vente B2B | 🟠 |
| 6 | *Loi AGEC et mobilier de bureau : ce que votre entreprise doit savoir* | *loi AGEC mobilier* | 90 | Info B2B | 🟠 |
| 7 | *Comment intégrer le mobilier reconditionné à votre bilan carbone (CSRD)* | *bilan carbone mobilier bureau* | 170 | Info B2B | 🟠 |
| 8 | *Fauteuil Herman Miller Aeron taille A, B ou C : comment choisir sa taille* | *Herman Miller Aeron taille* | 220 | Achat | 🟠 |
| 9 | *Bureau assis-debout : neuf, occasion ou reconditionné ?* | *bureau assis debout occasion* | 210 | Achat | 🟠 |
| 10 | *5 signes qu'il est temps de remplacer votre fauteuil de bureau* | *quand changer fauteuil bureau* | 90 | Info | 🟡 |
| 11 | *Steelcase, Herman Miller, Haworth, Vitra : durées de vie réelles observées* | *durée de vie fauteuil Steelcase* | 70 | Info | 🟡 |
| 12 | *Équiper vos bureaux à Aix-en-Provence : les 3 bonnes questions à se poser* | *mobilier bureau Aix Provence* | 140 | Local | 🟡 |
| 13 | *Case study : nous équipons un cabinet d'avocats de 12 postes à Toulon* | *mobilier avocat cabinet Toulon* | 40 | Local B2B | 🟡 |
| 14 | *Vidage de locaux : ce qui devient de l'occasion, ce qui part au recyclage* | *vidage locaux valorisation* | 90 | Info B2B | 🟡 |
| 15 | *Notre atelier de La Penne-sur-Huveaune en visite guidée* | *atelier mobilier bureau Aubagne* | 60 | Branding + local | 🟢 |

**Fréquence recommandée** : 1 article toutes les 2 semaines sur 6 mois. Format 1500-2500 mots. Chaque article ajoute 4-6 liens sortants vers boutique / catégories / autres articles.

### 6.3 Format standard d'article blog

Chaque article devrait contenir :
- **Hook** (1 paragraphe) qui pose la question / le problème
- **TOC** (généré auto par le composant blog Sanity)
- **4-6 sections H2** avec H3 en sous-section
- **1-2 callouts** (info ou gold — pour CTA)
- **1-2 images** (au moins l'image à la une + 1 dans le corps)
- **1 tableau** ou **1 liste enrichie** (aide au ranking)
- **Conclusion** avec CTA vers boutique / contact / autre article
- **3 tags** minimum

---

## 7. Réseaux sociaux — recommandations

Le SEO ne dépend pas directement des réseaux (Google ne les utilise pas comme signal de ranking direct), mais ils amplifient :
- La **notoriété** (marque recherchée + fréquemment = signal indirect fort)
- Le **backlinking** (des articles de presse local peuvent naître de posts LinkedIn)
- Le **local SEO** (Instagram géolocalisé + Google Business)

### 7.1 Priorités par réseau

| Réseau | Priorité | Contenu type | Fréquence |
|---|---|---|---|
| **LinkedIn** | 🔴 | Cas clients B2B, insights RSE, coulisses atelier | 2 posts/semaine |
| **Instagram** | 🟠 | Avant/après reconditionnement, showroom, showcases | 3-4 posts/semaine + Reels |
| **Google Business Profile** | 🔴 | Photos showroom, posts hebdo, avis clients | 1 post/semaine + réponses avis |
| **Pinterest** | 🟡 | Épinglages produits (feed déjà branché), moodboards | Automatisable |
| **Facebook** | 🟢 | Republication IG + événements | Auto-cross-post depuis IG |
| **TikTok** | 🟢 | Optionnel — coulisses atelier, avant/après | 1 vidéo/semaine si ressources |

### 7.2 Google Business Profile — quick win prioritaire

C'est **le levier local le plus rapide**. À faire :
1. Vérifier que la fiche « Mobilier Malin » à La Penne-sur-Huveaune est complète (horaires, catégories, photos, services)
2. Publier **1 post par semaine** (nouveaux arrivages, articles blog, coulisses)
3. **Répondre à chaque avis** dans les 48 h
4. Ajouter 10-15 photos supplémentaires (showroom, atelier, équipe)
5. **QR code déjà en place sur les factures** — continuer à demander l'avis systématiquement

Attendu : gain de 3 à 5 avis / mois → passage progressif dans le pack local Google pour Marseille / Aubagne.

---

## 8. Quick wins — les 5 choses à faire dans les 15 jours

Actions à impact rapide, sans complexité :

1. **Djamel rédige 5 descriptions produit longues** (300+ mots) sur les 5 produits `featured`. Impact : ces 5 fiches sortent de la case « Détectée non indexée ».
2. **Djamel rédige les 7 descriptions des catégories statiques** (200-300 mots) dans Sanity. Impact : les pages catégorie deviennent classables.
3. **Publier le 1er article blog Sanity** — *Prix mobilier reconditionné 2026*. Impact : Google voit un nouveau contenu, refresh du crawl.
4. **Google Business Profile** : vérifier fiche + publier 2 posts + demander 3 avis clients récents. Impact : signal local.
5. **Search Console** : redéposer manuellement les URL 404 des anciennes URL WordPress. Impact : Google acte les 301, transfère le jus SEO.

---

## 9. Prochaine étape — proposition

Une fois ce diagnostic validé par toi et tes supérieurs, la mise en œuvre code peut suivre cet ordre :

1. Création des landings marque `/steelcase-occasion` et `/herman-miller-occasion` (2 h de dev)
2. Ajout `Service` schema.org sur les 3 pages services (30 min)
3. Ajout `ItemList` schema sur `/boutique` (30 min)
4. Repositionnement titles/H1 des paires cannibalisantes (Toulon, Nice, Avignon-Orange) (1 h)
5. Enrichissement code des pages locales secondaires (structure « produits actuels par ville ») (2 h)

Le contenu (descriptions produit, catégories, blog) reste **la responsabilité de Djamel** — c'est lui qui connaît chaque pièce, chaque marque, chaque client.

---

**Fin du diagnostic.** Aucune modification de code n'a été effectuée pour la production de ce document.
