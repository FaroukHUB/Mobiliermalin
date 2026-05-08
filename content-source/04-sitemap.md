# Sitemap complet — ancien site mobiliermalin.com

Vue d'ensemble de toutes les pages publiques de l'ancien site (extraite de la capture sitemap).

## Pages catégories produits (7)

1. Armoires & Rangements
2. Bureaux Individuels
3. Caissons de bureau
4. Chaises d'accueil & de réunion
5. Espaces détente
6. Fauteuils Ergonomiques
7. Tables de réunion

## Pages SEO local (3) ⭐ IMPORTANT

Ces pages ne nous ont pas encore été envoyées mais elles existent — **à demander au client si on doit les reproduire**.

1. Mobilier de bureau reconditionné à **Aix-en-Provence**
2. Mobilier de bureau reconditionné à **Aubagne**
3. Mobilier de bureau reconditionné à **Marseille**

→ **Stratégie** : on doit absolument garder ce schéma de SEO local et **l'enrichir** (Cassis, La Ciotat, Toulon, Salon-de-Provence, Vitrolles, Martigues, Avignon, Nice, etc.).

## Pages institutionnelles & légales (4)

1. Notre Histoire (= Notre démarche dans le nouveau site)
2. Conditions Générales de Vente (CGV) — **non encore envoyée**
3. Politique de confidentialité — **non encore envoyée**
4. Mobilier Malin – Mobilier de bureau reconditionné (= page d'accueil)
5. Accueil

## Pages reçues vs manquantes

### ✅ Reçues
- [x] Accueil
- [x] Notre Histoire / Notre démarche
- [x] 7 pages catégories produits

### ❓ À éclaircir avec le client
- [ ] Mobilier de bureau reconditionné à Aix-en-Provence (page SEO local)
- [ ] Mobilier de bureau reconditionné à Aubagne (page SEO local)
- [ ] Mobilier de bureau reconditionné à Marseille (page SEO local)
- [ ] CGV
- [ ] Politique de confidentialité

## Architecture URL retenue pour le nouveau site

```
/                                      → Accueil
/notre-demarche                        → Notre démarche (ex Notre Histoire)
/contact                               → Contact + formulaire
/devis                                 → Demande de devis
/services                              → Vue d'ensemble services
/services/achat                        → Achat reconditionné
/services/vidage-locaux                → Vidage / Débarras

/boutique                              → Catalogue global (nouveau)
/categorie/bureaux-individuels         → Page catégorie
/categorie/fauteuils-ergonomiques
/categorie/armoires-rangements
/categorie/chaises-accueil-reunion
/categorie/tables-de-reunion
/categorie/espaces-detente
/categorie/caissons
/produit/[slug]                        → Fiche produit unitaire (NOUVEAU)

/mobilier-bureau-reconditionne-marseille      → Page SEO locale
/mobilier-bureau-reconditionne-aix-en-provence
/mobilier-bureau-reconditionne-aubagne
+ futures villes en V2

/blog                                  → Index blog
/blog/[slug]                           → Article

/cgv                                   → CGV
/mentions-legales                      → Mentions légales
/politique-confidentialite             → RGPD
/cookies                               → Politique cookies
```

## Redirections 301 à mettre en place (depuis l'ancien site)

Pour ne pas perdre de SEO, on devra créer ces redirections dans la collection Payload `Redirects` :

| Ancienne URL | Nouvelle URL |
|---|---|
| `/notre-histoire` | `/notre-demarche` |
| `/bureaux-individuels` | `/categorie/bureaux-individuels` |
| `/fauteuils-ergonomiques` | `/categorie/fauteuils-ergonomiques` |
| `/armoires-rangements` | `/categorie/armoires-rangements` |
| `/chaises-d-accueil-de-reunion` | `/categorie/chaises-accueil-reunion` |
| `/tables-de-reunion` | `/categorie/tables-de-reunion` |
| `/espaces-detente` | `/categorie/espaces-detente` |
| `/caissons-de-bureau` | `/categorie/caissons` |
| `/conditions-generales-de-vente` | `/cgv` |
| `/politique-de-confidentialite` | `/politique-confidentialite` |

(URLs anciennes à confirmer en consultant le sitemap.xml WordPress quand on aura accès)
