# Mobilier Malin

Site e-commerce de mobilier de bureau d'occasion sélectionné — moderne, performant, SEO-first.

## Stack technique

- **Framework** : Next.js 15 (App Router) + React 19 + TypeScript
- **CMS** : Payload CMS 3 (intégré à Next.js, admin auto-généré en français)
- **Base de données** : PostgreSQL (Supabase en production, gratuit pour démarrer)
- **Style** : Tailwind CSS 3 + design system maison (charte ivoire / noir / or)
- **Carrousel** : Embla Carousel
- **Images** : `next/image` + redimensionnement Sharp
- **Paiement** (à venir) : Stripe Checkout
- **Email** (à venir) : Resend
- **Déploiement** : Vercel ou Cloudflare Pages

## Démarrage local

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
```

Puis éditer `.env` avec :
- `PAYLOAD_SECRET` : longue chaîne aléatoire (au moins 64 caractères)
- `DATABASE_URI` : connexion PostgreSQL (Supabase ou local)

#### Démarrer une base PostgreSQL en 1 minute

**Option A — Supabase (recommandé, gratuit)**
1. Créer un projet sur https://supabase.com
2. Settings → Database → Connection string (URI mode)
3. Coller dans `DATABASE_URI`

**Option B — Docker local**
```bash
docker run -d --name mm-pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mobiliermalin postgres:16
```
Puis dans `.env` :
```
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/mobiliermalin
```

### 3. Lancer le serveur de dev

```bash
pnpm dev
```

- Site public : http://localhost:3000
- Admin Payload : http://localhost:3000/admin (créer le compte au 1er accès)

## Structure du projet

```
src/
├── app/
│   ├── (frontend)/           # Site public (SEO)
│   │   ├── layout.tsx        # Header + Footer global
│   │   ├── page.tsx          # Accueil
│   │   └── globals.css       # Styles + tokens design
│   ├── (payload)/            # Back-office Payload
│   │   ├── admin/...         # Interface admin
│   │   └── api/[...slug]     # API REST/GraphQL Payload
│   ├── robots.ts             # SEO
│   └── sitemap.ts            # SEO dynamique
├── collections/              # Schéma des données (Payload)
│   ├── Users.ts              # Comptes admin
│   ├── Customers.ts          # Comptes clients
│   ├── Media.ts              # Photothèque
│   ├── Categories.ts
│   ├── Brands.ts
│   ├── Products.ts           # Le mobilier
│   ├── HeroSlides.ts         # Slider d'accueil modifiable
│   ├── Pages.ts              # Pages éditoriales
│   ├── BlogPosts.ts          # Articles SEO
│   ├── Orders.ts             # Commandes
│   └── Redirects.ts          # Redirections SEO 301/302
├── components/
│   ├── HeroSlider.tsx        # Carrousel d'accueil
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── fields/
│   └── slug.ts               # Champ slug réutilisable
├── lib/
│   ├── payload.ts            # Client Payload côté serveur
│   └── utils.ts              # Helpers (cn, formatPrice)
└── payload.config.ts         # Configuration Payload centrale
```

## Charte graphique

| Token | Code | Usage |
|---|---|---|
| `ivory` | `#FAF9F6` | Fond principal |
| `ivory-light` | `#FFFFFF` | Sections alternées |
| `ivory-dark` | `#F4F1EA` | Bandeaux d'accent |
| `ink` | `#1A1A1A` | Texte, header, footer |
| `gold` | `#C9A961` | Accents, prix, CTA |
| `gold-dark` | `#B8964D` | Hover, accents forts |
| `line` | `#E5E3DE` | Bordures discrètes |

Typo : **Playfair Display** (titres serif) + **Inter** (corps sans-serif).

## SEO — ce qui est déjà en place

- `metadataBase` + Open Graph + Twitter Cards
- `robots.txt` dynamique
- `sitemap.xml` dynamique (produits, catégories, articles)
- ISR (régénération toutes les 60s) sur l'accueil
- `next/image` pour optimisation auto (AVIF/WebP)
- Structure HTML sémantique (h1 unique, balises ARIA, breadcrumbs à venir)
- Champs SEO dédiés sur chaque collection (titre meta, description meta, OG image)
- Collection Redirects pour conserver le jus SEO lors des changements d'URL

## Mode "Coming Soon" / Maintenance

Tu peux mettre le site public en mode "bientôt en ligne" tout en travaillant dessus en coulisse.

### Activation

Sur Vercel (ou en local dans `.env`) :

```
MAINTENANCE_MODE=true
MAINTENANCE_BYPASS_TOKEN=ton-token-secret-aleatoire
```

### Comportement
- **Public** : tout `/`, `/boutique`, `/categorie/...` → affiche `/maintenance` (503)
- **Toi** : visite `https://ton-site.com/?bypass=ton-token-secret-aleatoire` une seule fois
  → un cookie est posé pour **30 jours** → tu vois le vrai site librement
- **Admin Payload** : `/admin` reste **toujours accessible** (jamais bloqué)
- **API** : `/api/*` reste toujours accessible
- **SEO** : la page maintenance est `noindex, nofollow` → pas d'impact référencement

### Reverrouiller / déconnecter le preview
Visite `https://ton-site.com/?lock=1` → cookie supprimé, tu retombes en maintenance.

### Désactiver le mode maintenance pour le grand public
Mets `MAINTENANCE_MODE=false` (ou supprime la variable) sur Vercel et redéploie.

## Roadmap

### V1 (en cours)
- [x] Setup Next.js + Payload + Tailwind
- [x] Charte graphique + design system
- [x] Hero slider modifiable depuis l'admin
- [x] Layout global (header + footer)
- [x] Collections : produits, catégories, marques, pages, blog, commandes
- [x] SEO de base (sitemap, robots, metadata, ISR)
- [ ] Pages catalogue + filtres
- [ ] Fiche produit complète + JSON-LD `Product`
- [ ] Panier + Checkout Stripe
- [ ] Compte client B2C/B2B
- [ ] Devis B2B
- [ ] Emails transactionnels (Resend)
- [ ] Pages "Vendre votre mobilier" / "Débarras"
- [ ] Blog (5 articles piliers)

### V2
- Configurateur d'espace de travail
- Calculateur d'impact CO₂
- Recherche Meilisearch
- Avis clients (Trustpilot)
- Lots & open-spaces

### V3
- Multi-entrepôts
- Module location
- Marketplace partenaires

## Branche de travail

`claude/setup-mobilier-malin-EJlaC`

## Licence

Propriété de Mobilier Malin. Tous droits réservés.
