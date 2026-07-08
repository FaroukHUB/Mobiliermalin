/**
 * Mobilier Malin — Extension Chrome pour extraire les annonces Leboncoin.
 *
 * Quand l'utilisateur clique sur l'icône dans la barre d'outils :
 *   1. Vérifie qu'on est sur leboncoin.fr
 *   2. Injecte le script d'extraction dans la page
 *   3. Le script lit le DOM, met en forme, copie dans le presse-papier
 *   4. Affiche une petite bannière "toast" au coin de la page
 *
 * Structure : service worker (MV3) qui gère les clics + injection.
 * Toute la logique de scraping vit dans la fonction extractAd()
 * qui s'exécute dans le contexte de la page.
 */

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || !tab.url.includes('leboncoin.fr')) {
    console.warn('[LBC extractor] Not on Leboncoin, aborting.')
    return
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractAd,
    })
  } catch (err) {
    console.error('[LBC extractor] Script injection failed:', err)
  }
})

/**
 * Extrait l'annonce courante et la copie dans le presse-papier.
 * Cette fonction est SÉRIALISÉE puis exécutée dans le contexte de la
 * page Leboncoin — elle n'a donc accès à AUCUNE variable de fond,
 * tout doit être auto-contenu.
 */
function extractAd() {
  const q = (sel) => document.querySelector(sel)
  const qAll = (sel) => Array.from(document.querySelectorAll(sel))

  // Sélecteurs multiples pour survivre aux changements Leboncoin
  const title =
    q('[data-qa-id="adview_title"]')?.innerText ||
    q('h1')?.innerText ||
    ''

  const price =
    q('[data-qa-id="adview_price"]')?.innerText ||
    q('[data-testid="price"]')?.innerText ||
    ''

  const desc =
    q('[data-qa-id="adview_description_container"]')?.innerText ||
    q('[data-testid="description"]')?.innerText ||
    q('[data-qa-id="adview_description"]')?.innerText ||
    ''

  const loc =
    q('[data-qa-id="adview_location_informations"]')?.innerText ||
    q('[data-testid="location"]')?.innerText ||
    ''

  // Extraction images : filtre sur les URLs de photos Leboncoin
  const imgs = qAll('img')
    .map((i) => i.src)
    .filter(
      (s) =>
        s &&
        (s.includes('/pictures/') ||
          s.includes('/ac_') ||
          s.includes('/api/v1/adview')),
    )
    // Dédoublonne
    .filter((v, i, a) => a.indexOf(v) === i)
    // Filtre les toutes petites thumbnails
    .filter((s) => !s.includes('/thumb/') || s.includes('/photos/'))
    .slice(0, 15)

  // Catégorie (fil d'ariane)
  const breadcrumb = qAll('[data-qa-id="breadcrumb_link"]')
    .map((el) => el.innerText.trim())
    .filter(Boolean)
    .join(' > ')

  const output = `--- ANNONCE LEBONCOIN ---
URL : ${location.href}
Titre : ${title}
Prix : ${price}
Ville : ${loc.split('\n')[0] || ''}
Catégorie : ${breadcrumb || '(non détectée)'}

Description :
${desc}

Photos (${imgs.length}) :
${imgs.join('\n')}
--- FIN ---`

  // Copie clipboard avec fallback historique execCommand
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      return true
    } catch {
      const ta = document.createElement('textarea')
      ta.value = output
      ta.style.position = 'fixed'
      ta.style.top = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    }
  }

  doCopy().then((ok) => {
    // Bannière toast en haut à droite de la page
    const toast = document.createElement('div')
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      background: ${ok ? '#1a1a1a' : '#b23d3d'};
      color: white;
      padding: 16px 20px;
      border-radius: 4px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      border-left: 4px solid ${ok ? '#c8a25b' : '#ffa080'};
      max-width: 340px;
      line-height: 1.5;
      animation: lbcSlideIn 0.25s ease-out;
    `

    // Animation d'entrée
    const style = document.createElement('style')
    style.textContent = `
      @keyframes lbcSlideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `
    document.head.appendChild(style)

    toast.innerHTML = ok
      ? `<strong style="color:#c8a25b">✅ Annonce copiée</strong><br>` +
        `<span style="opacity:0.85; font-weight: 400;">Titre : ${title.slice(0, 50)}${title.length > 50 ? '…' : ''}<br>` +
        `Prix : ${price}<br>` +
        `Photos : ${imgs.length} • Description : ${desc.length} car.<br>` +
        `<em style="opacity:0.7">Colle (Ctrl+V) dans Claude</em></span>`
      : `<strong>❌ Erreur clipboard</strong><br>` +
        `<span style="opacity:0.85; font-weight: 400;">Ouvre la console (F12) pour le texte brut.</span>`

    document.body.appendChild(toast)
    if (!ok) console.log('[LBC extractor] Texte brut :\n\n' + output)

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out'
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(20px)'
      setTimeout(() => toast.remove(), 400)
    }, 4000)
  })
}
