/**
 * Bloc affiche au-dessus du formulaire de login (page /admin/login).
 * Style "magasin de luxe" : fond ivoire, gros logo, message d'accueil.
 */
export default function BeforeLogin() {
  return (
    <div className="mm-login-brand">
      <div className="mm-login-brand__mark">M</div>
      <h1 className="mm-login-brand__title">
        Mobilier <span>Malin</span>
      </h1>
      <div className="mm-login-brand__divider" aria-hidden />
      <p className="mm-login-brand__eyebrow">Espace de gestion</p>
      <p className="mm-login-brand__welcome">
        Bienvenue. Connectez-vous pour gerer votre catalogue.
      </p>
    </div>
  )
}
