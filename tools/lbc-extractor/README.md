# 📋 Extension Chrome — Copier annonce Leboncoin

Extension Chrome maison pour extraire une annonce Leboncoin en un clic et
la coller dans le chat Claude au format prêt à parser (titre, prix, ville,
catégorie, description, URLs de photos).

## Installation (2 minutes)

1. **Télécharge le dossier `tools/lbc-extractor/`** sur ton ordinateur.
   - Depuis GitHub : clone le repo ou télécharge le zip et extrais-le
   - Depuis Vercel : ouvre GitHub, va dans `tools/lbc-extractor/`,
     télécharge chaque fichier (`manifest.json`, `background.js`,
     `icon.svg`) dans un même dossier sur ton bureau
2. Ouvre **Chrome** (ou Edge, Brave, tout navigateur basé Chromium)
3. Va sur **`chrome://extensions`** dans la barre d'URL
4. En haut à droite → active **"Mode développeur"** (petit interrupteur)
5. Trois boutons apparaissent en haut à gauche → clique
   **"Charger l'extension non empaquetée"**
6. Dans la fenêtre qui s'ouvre → sélectionne le dossier
   `lbc-extractor/` (celui qui contient `manifest.json`)
7. L'extension apparaît dans la liste avec l'icône **MM LBC 📋**

L'icône est probablement cachée dans le menu **puzzle 🧩** de la barre
Chrome. Clique dessus → épingle 📌 l'extension pour qu'elle reste
visible en permanence.

## Utilisation

1. Va sur `leboncoin.fr` → ouvre une annonce
2. Attends que la description soit chargée (2-3 secondes)
3. **Clique l'icône MM LBC 📋** dans la barre d'outils
4. Une bannière noire apparaît en haut à droite de la page :
   > ✅ Annonce copiée
   > Titre : Fauteuil Steelcase Leap V2…
   > Prix : 350 €
   > Photos : 5 • Description : 234 car.
5. Va dans le chat Claude → **Ctrl+V** → paste

## Format de sortie

```
--- ANNONCE LEBONCOIN ---
URL : https://www.leboncoin.fr/ad/mobilier/2847293845
Titre : Fauteuil Steelcase Leap V2 turquoise
Prix : 350 €
Ville : Aubagne 13400
Catégorie : Maison > Ameublement > Chaises et fauteuils

Description :
[texte brut de l'annonce écrit par Djamel]

Photos (5) :
https://img.leboncoin.fr/api/v1/adview/…
https://img.leboncoin.fr/api/v1/adview/…
…
--- FIN ---
```

## Bugs / mises à jour

Leboncoin peut changer sa structure HTML. Si l'extraction devient
partielle (titre vide, description manquante) :

1. Ouvre les DevTools sur l'annonce (F12) → onglet **Elements**
2. Regarde les `data-qa-id` autour du titre, du prix, de la description
3. Envoie-moi ces attributs et j'ajuste `background.js` en 2 min

## Sécurité

Cette extension :

- ✅ Ne s'active QUE sur `leboncoin.fr` (permission `host_permissions`)
- ✅ Ne fait AUCUNE requête réseau — tout est en local dans ton navigateur
- ✅ N'utilise pas de tracking, d'analytics ou de télémétrie
- ✅ Code source complet visible dans `background.js` (< 200 lignes)
- ✅ Ne stocke rien de persistant (pas de `chrome.storage`)

C'est un simple lecteur du DOM + un `navigator.clipboard.writeText`.
Zéro backdoor.
