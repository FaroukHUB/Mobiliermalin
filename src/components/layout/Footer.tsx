import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-ink text-ivory mt-24">
      <div className="container py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-serif text-2xl">
            Mobilier <span className="text-gold">Malin</span>
          </p>
          <p className="mt-4 text-sm text-ivory/70 max-w-xs">
            Mobilier de bureau d'occasion sélectionné avec exigence. Économique, écologique, professionnel.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ivory uppercase tracking-widest mb-4">Boutique</h3>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link href="/boutique" className="hover:text-gold">Tout le catalogue</Link></li>
            <li><Link href="/categorie/bureaux" className="hover:text-gold">Bureaux</Link></li>
            <li><Link href="/categorie/fauteuils" className="hover:text-gold">Fauteuils</Link></li>
            <li><Link href="/categorie/rangements" className="hover:text-gold">Rangements</Link></li>
            <li><Link href="/categorie/salles-de-reunion" className="hover:text-gold">Salles de réunion</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ivory uppercase tracking-widest mb-4">Services</h3>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link href="/vendre" className="hover:text-gold">Vendre votre mobilier</Link></li>
            <li><Link href="/debarras" className="hover:text-gold">Débarras de bureaux</Link></li>
            <li><Link href="/livraison" className="hover:text-gold">Livraison & installation</Link></li>
            <li><Link href="/devis" className="hover:text-gold">Demande de devis</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ivory uppercase tracking-widest mb-4">Informations</h3>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link href="/a-propos" className="hover:text-gold">Notre démarche</Link></li>
            <li><Link href="/blog" className="hover:text-gold">Blog</Link></li>
            <li><Link href="/faq" className="hover:text-gold">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link href="/cgv" className="hover:text-gold">CGV</Link></li>
            <li><Link href="/mentions-legales" className="hover:text-gold">Mentions légales</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/50">
          <p>© {new Date().getFullYear()} Mobilier Malin. Tous droits réservés.</p>
          <p>Mobilier de bureau d'occasion · Économie circulaire</p>
        </div>
      </div>
    </footer>
  )
}
