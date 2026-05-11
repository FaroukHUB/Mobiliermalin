# Import des pages dans WordPress

Ce dossier contient le fichier d'import à uploader dans WordPress pour créer toutes les pages d'un coup.

## Comment importer

1. **Télécharger le fichier `mobiliermalin-pages.xml`** depuis ce dossier (sur GitHub : bouton "Raw" puis Cmd+S, ou clic-droit "Enregistrer sous")

2. Sur ton WordPress (`https://mobiliermalin.personnaly.fr/wp-admin`) :
   - **Outils → Importer**
   - Cherche **WordPress** dans la liste, clique **"Installer maintenant"** (s'il n'est pas déjà installé)
   - Clique **"Lancer l'importateur"**
   - **Choisir le fichier** → sélectionne `mobiliermalin-pages.xml` que tu as téléchargé
   - Clique **"Téléverser le fichier et importer"**

3. Sur l'écran suivant :
   - **Assigner les articles à un utilisateur existant** → sélectionne ton compte admin
   - **Téléverser et importer les pièces jointes** → coche la case (même si pas d'images attachées)
   - Clique **"Soumettre"**

4. Attends la confirmation **"Tout est terminé. Have fun!"**

5. **Définir Accueil comme page d'accueil** :
   - **Réglages → Lecture**
   - **Page d'accueil affiche** : Une page statique
   - **Page d'accueil** : Accueil
   - **Enregistrer**

## Vérification

Va sur `https://mobiliermalin.personnaly.fr/` → tu dois voir la home complète avec ses 13 sections.

## Images à remplacer

Les images sont des placeholders Unsplash qui fonctionnent immédiatement. Pour mettre tes vraies photos :

1. **WP admin → Médias → Ajouter** → uploade ta photo
2. Clique sur ta photo → copie l'URL du fichier
3. Édite la page (Pages → Accueil → Modifier)
4. Passe en mode **Éditeur de code** (icône ⋮ en haut à droite)
5. Cherche-remplace l'ancienne URL Unsplash par ton URL WP

Liste des images du fichier (chercher dans le code) :
- `IMAGE_HERO` : photo plein écran de la home (1920×900) → URL `images.unsplash.com/photo-1497366216548...`
- `IMAGE_MANIFESTE` : photo section éditoriale "Manifeste" (1200×1500 portrait) → `images.unsplash.com/photo-1497366811353...`
- `IMAGE_LLD` : photo section Location (1000×1250 portrait) → `images.unsplash.com/photo-1542435503-956c469947f6...`
- `IMAGE_SHOWROOM` : photo showroom Aubagne (1200×900 paysage) → `images.unsplash.com/photo-1521737604893-d14cc237f11d...`
- 7 photos catégories : URL `images.unsplash.com/photo-XXX` (chacune en 600×600)

## Si une page bug

L'import est **idempotent** : tu peux le relancer plusieurs fois sans casser. Si tu vois des doublons, supprime simplement les pages en trop.
