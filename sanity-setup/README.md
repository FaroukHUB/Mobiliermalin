# Configuration Sanity — Mobilier Malin

Sanity Studio est intégré directement au site sur **`/studio`**. Ton client édite ses produits sur **`https://mobiliermalin.com/studio`**, dans une interface dédiée et soignée.

## Étape 1 — Créer un compte Sanity (5 min)

1. Va sur https://www.sanity.io
2. Clique **"Get started"** → connecte-toi avec Google ou GitHub (gratuit)
3. À la création tu auras :
   - Un **organization**
   - L'invitation à créer un **project**

## Étape 2 — Créer le projet

1. Clique **"Create new project"**
2. **Project name** : `Mobilier Malin`
3. **Use the default dataset configuration** : ✅ (laisse `production`)
4. **Project template** : choisis **"Clean project with no predefined schemas"**
5. Crée le projet

À la fin, tu vois ton **Project ID** affiché en haut (ex: `abc12def`). **Garde-le sous la main**.

## Étape 3 — Autoriser les domaines du Studio

Le Studio est hébergé sur ton site Vercel, il faut autoriser ce domaine côté Sanity :

1. Sur https://www.sanity.io/manage → ton projet → **API → CORS Origins**
2. Clique **"+ Add CORS origin"**
3. **Origin** : `https://mobiliermalin.vercel.app` (ou ton domaine final)
4. **Allow credentials** : ✅
5. Save
6. Répète pour `http://localhost:3000` (utile en dev local)
7. Quand tu auras le vrai domaine, ajoute aussi `https://mobiliermalin.com`

## Étape 4 — Configurer Vercel

Sur Vercel → ton projet → **Settings → Environment Variables** → ajoute :

```
NEXT_PUBLIC_SANITY_PROJECT_ID=abc12def
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-09-01
```

Remplace `abc12def` par ton vrai Project ID.

**Redéploie**.

## Étape 5 — Première connexion au Studio

1. Va sur `https://mobiliermalin.vercel.app/studio`
2. Tu vois un bouton **"Sign in"** → connecte-toi avec le même compte que Sanity (Google/GitHub)
3. ⚠️ Si tu vois un message **"CORS error"** : retourne à l'Étape 3 et vérifie que ton domaine est autorisé.
4. Tu arrives sur le Studio Mobilier Malin avec 2 sections dans la sidebar :
   - 🪑 **Mobilier (produits)**
   - 📁 **Catégories**

## Étape 6 — Configurer les Réglages du site (logos + images de section)

Dans la sidebar du Studio, tu vois **⚙️ Réglages du site** en haut.

C'est un **singleton** : un seul document qui regroupe tout ce qui est "global" sur le site.

3 onglets dans le formulaire :

### Onglet "Identité"
- **Logo pour fonds clairs (header)** — version sombre (lettres noires/or) sur fond transparent → affichée en haut du site
- **Logo pour fonds sombres (footer)** — version claire/or sur fond transparent → affichée en bas du site
- **Favicon** — petite icône 32×32 ou 512×512 qui s'affiche dans l'onglet du navigateur

### Onglet "Images des sections"
- **Image — Section Manifeste** : grande image de la section "Notre manifeste" sur la home (portrait 1200×1500)
- **Image — Section Location LLD** : illustration de la section LLD (portrait 1000×1250)
- **Image — Section Showroom Aubagne** : photo réelle du showroom ou de l'atelier (paysage 1200×900)

### Onglet "Hero des pages internes"
- **Hero — page Location LLD** : visuel en haut de `/location-mobilier-bureau`
- **Hero — page Attestation RSE** : optionnel

→ Si un champ reste vide, le site affiche un **placeholder Unsplash** automatique.

→ Quand le client uploade une image, **n'oublie pas de cliquer "Publish"** en bas à droite.

## Étape 7 — Gérer le hero slider d'accueil

Sidebar → **🎞️ Hero — Slider d'accueil**.

C'est un **document type multiple** : tu peux créer autant de slides que tu veux, elles défilent dans le carrousel d'accueil.

Pour chaque slide :
- **Titre** (H1 sur la 1ère, H2 sur les suivantes)
- **Sous-titre** (optionnel)
- **Image desktop** (1920×900)
- **Image mobile** (optionnel, format portrait)
- **2 boutons CTA** avec leur lien interne (`/boutique`, `/contact`, etc.)
- **Position du texte** (gauche / centre / droite)
- **Couleur du texte** (clair / sombre) selon l'image de fond
- **Voile sombre** (0-80 %) pour la lisibilité
- **Ordre** d'affichage (plus petit = premier)
- **Statut** : Publiée / Brouillon

→ Au moins **1 slide publiée** pour que le carrousel apparaisse. Si aucune slide en base, le site affiche les 2 slides de démo Unsplash.

## Étape 8 — Créer tes 7 catégories

Avant d'ajouter des produits, crée tes catégories. Sidebar → **Catégories** → bouton **"+"** en haut à droite.

Crée ces 7 catégories (slug auto-généré depuis le nom) :

| Nom | Slug attendu |
|---|---|
| Bureaux individuels | `bureaux-individuels` |
| Fauteuils ergonomiques | `fauteuils-ergonomiques` |
| Armoires & rangements | `armoires-rangements` |
| Chaises d'accueil & réunion | `chaises-accueil-reunion` |
| Tables de réunion | `tables-de-reunion` |
| Espaces détente | `espaces-detente` |
| Caissons de bureau | `caissons` |

Pour chacune : Sauvegarder (bouton "Publish" en bas à droite).

## Étape 9 — Créer ton premier produit

Sidebar → **Mobilier (produits)** → bouton **"+"** → **Create**.

5 onglets en haut du formulaire :
- **Essentiel** : nom, slug, statut, descriptions
- **Photos** : drag-drop des images
- **Prix & stock** : prix, prix barré, stock
- **Caractéristiques** : catégorie, marque, état, dimensions, matière, couleur
- **SEO** : titre meta, description meta

Remplis ce que tu veux, mets le **Statut** sur **"Publié"** et clique **"Publish"** en bas à droite.

→ Le produit apparaît automatiquement sur ton site dans la minute (cache ISR 60s).

## Workflow quotidien de Djamel

1. `https://mobiliermalin.com/studio`
2. **Mobilier (produits)** → **"+ Create"**
3. Remplit, sauvegarde
4. Le produit est en ligne

C'est tout. Pas de WordPress, pas de bug. Studio Sanity = outil pro pour gérer du contenu, utilisé par Loom, Figma, Nike.

---

## Notes utiles

### Modifier un produit
Sidebar → **Mobilier** → clique sur le produit → modifie → **Publish**.

### Mettre un produit "Vendu"
Onglet **Essentiel** → change le statut "Publié" → "Vendu" → Publish. Il disparaît du site.

### Mettre en avant un produit sur la home
Onglet **Caractéristiques** → coche **"Mettre en avant"** → Publish.

### Ajouter une marque qui n'est pas dans la liste
Le champ "Marque" propose une liste fermée. Pour ajouter une nouvelle marque, modifie `/sanity/schemas/product.ts` côté code (ou demande à ton développeur).

### Voir l'historique des modifications
Sanity sauvegarde l'historique. Onglet **🕐** en haut à droite du formulaire produit → tu vois toutes les versions précédentes.
