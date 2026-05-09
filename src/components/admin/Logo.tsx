/**
 * Logo affiche dans la barre de navigation admin (en haut a gauche).
 * Pour utiliser un PNG : depose ton fichier dans /public/admin-logo.png et
 * decommente la version "Image" ci-dessous.
 */
export default function Logo() {
  return (
    <div className="mm-admin-logo">
      <span className="mm-admin-logo__mark">M</span>
      <div className="mm-admin-logo__wordmark">
        <span className="mm-admin-logo__brand">Mobilier</span>
        <span className="mm-admin-logo__accent">Malin</span>
      </div>
    </div>
  )
}

// Version PNG :
// import Image from 'next/image'
// export default function Logo() {
//   return <Image src="/admin-logo.png" alt="Mobilier Malin" width={180} height={40} priority />
// }
