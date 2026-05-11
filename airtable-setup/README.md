# Configuration Airtable — Mobilier Malin

Ce document décrit la structure de la base Airtable pour gérer le catalogue produits.

## Étape 1 — Créer un compte Airtable

1. Va sur https://airtable.com → **Sign up for free**
2. Confirme par email
3. Tu arrives sur ton **Workspace** par défaut

## Étape 2 — Créer la base

1. Clique sur **"Create a base"** → **"Start from scratch"**
2. Nom de la base : **`Mobilier Malin`**
3. Tu vois une table par défaut nommée "Table 1" → renomme-la en **`Products`**

## Étape 3 — Structurer la table "Products"

Configure les colonnes (champs) comme suit. Pour chaque colonne : clique sur l'en-tête, puis **"Customize field type"**.

| Nom de la colonne | Type Airtable | Notes |
|---|---|---|
| `Name` | Single line text | Nom du produit (déjà créé par défaut) |
| `Slug` | Single line text | URL-friendly (ex: `bureau-droit-160`) |
| `Category` | Single select | Options : `bureaux-individuels`, `fauteuils-ergonomiques`, `armoires-rangements`, `chaises-accueil-reunion`, `tables-de-reunion`, `espaces-detente`, `caissons` |
| `Brand` | Single select | Options : `Steelcase`, `Herman Miller`, `Haworth`, `Vitra`, `Majencia`, `HÅG`, `Autre` |
| `Price` | Number (Decimal) | Prix TTC en € (ex: 96) |
| `Compare Price` | Number (Decimal) | Prix barré (neuf) optionnel |
| `Condition` | Single select | Options : `Neuf`, `Excellent`, `Très bon état`, `Bon état`, `Correct` |
| `Short Description` | Long text | 1-2 phrases résumé |
| `Description` | Long text | Description complète |
| `Images` | Attachment | Plusieurs photos du produit |
| `Stock` | Number (Integer) | Quantité disponible |
| `Status` | Single select | Options : `Published`, `Draft`, `Sold`, `Archived` |
| `Width cm` | Number (Integer) | Largeur en cm |
| `Depth cm` | Number (Integer) | Profondeur en cm |
| `Height cm` | Number (Integer) | Hauteur en cm |
| `Material` | Single line text | Ex: "Mélaminé", "Bois", "Métal" |
| `Color` | Single line text | Ex: "Noir", "Blanc", "Bois clair" |
| `SKU` | Single line text | Référence interne, optionnel |
| `Featured` | Checkbox | Mettre en avant sur la home |
| `Created` | Created time | Auto |
| `Updated` | Last modified time | Auto |

## Étape 4 — Récupérer la clé API et l'ID de base

### Clé API (Personal Access Token)

1. Va sur https://airtable.com/create/tokens
2. Clique **"Create new token"**
3. **Name** : `Mobilier Malin Site`
4. **Scopes** (permissions) :
   - `data.records:read` ✅ (obligatoire — lire les produits)
   - `data.records:write` (optionnel — si on veut mettre à jour stock automatiquement plus tard)
   - `schema.bases:read` ✅
5. **Access** :
   - Add a base → sélectionne **Mobilier Malin**
6. **Create token** → copie le token (commence par `pat...`) ⚠️ **visible une seule fois**

### Base ID

1. Va sur https://airtable.com/api
2. Sélectionne la base **Mobilier Malin**
3. Tu vois en haut : `The ID of this base is appXXXXXXXXXXXXXX`
4. Copie cet ID (commence par `app`)

## Étape 5 — Brancher sur Vercel

Sur Vercel → ton projet → **Settings → Environment Variables** → ajoute :

```
AIRTABLE_API_KEY=pat_xxxxxxxxxxxxx
AIRTABLE_BASE_ID=app_xxxxxxxxxxxxx
AIRTABLE_PRODUCTS_TABLE=Products
```

Redéploie. Le site charge automatiquement les produits depuis Airtable.

## Étape 6 — Premier test

Dans Airtable, ajoute **1 produit test** :
- Name : `Bureau Droit 160 cm`
- Slug : `bureau-droit-160`
- Category : `bureaux-individuels`
- Price : `96`
- Condition : `Excellent`
- Short Description : `Bureau droit en mélaminé chêne, dimensions 160 × 80 × 72 cm.`
- Stock : `1`
- Status : `Published`
- Images : uploade 1 photo

Va sur `https://mobiliermalin.vercel.app/boutique` → ton produit doit apparaître.

---

## Workflow quotidien de Djamel

1. Ouvre Airtable (depuis le navigateur ou l'app mobile)
2. Va dans la base **Mobilier Malin**
3. Clique **"+ New record"** ou modifie une ligne existante
4. Remplit les colonnes
5. Sauvegarde (auto)
6. Le site se met à jour dans la minute

C'est tout. Aucun WordPress, aucun bouton bizarre, aucun bug. C'est de l'Excel boosté.
