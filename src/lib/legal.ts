/**
 * Informations légales de Mobilier Malin / SARL 2 M.
 * Source : Kbis du 31/05/2022.
 * En cas de mise à jour (changement d'adresse siège, etc.), modifier ici puis push.
 */

export const LEGAL = {
  // Identité
  raisonSociale: '2 M',
  nomCommercial: 'Mobilier Malin',
  formeJuridique: 'SARL',

  // Immatriculation
  siren: '894 410 729',
  rcs: 'Marseille',
  numeroGestion: '2021B00820',
  dateImmatriculation: '23/02/2021',
  tvaIntracom: 'FR39894410729', // calculé depuis SIREN : (12 + 3 × (siren mod 97)) mod 97

  // Capital
  capitalSocial: '1 000 €',

  // Adresses
  siegeSocial: {
    ligne1: 'Les Locaux Bleus',
    ligne2: '553 Rue Saint-Pierre',
    codePostal: '13012',
    ville: 'Marseille',
  },
  showroom: {
    ligne1: '18 chemin Noël Robion',
    codePostal: '13400',
    ville: 'La Penne-sur-Huveaune',
  },

  // Direction
  gerant: 'Djamel Djennad',

  // Activité
  activite: 'Achat, vente et débarras de mobilier neuf et occasion',

  // Contact
  telephone: '06 76 61 70 53',
  telephoneTel: '+33676617053',
  email: 'mobiliermalin@gmail.com',
  siteWeb: 'mobiliermalin.com',

  // Fiscalité (taux par défaut, à vérifier selon le type de produit)
  tauxTvaDefaut: 20, // 20 % standard mobilier
}
