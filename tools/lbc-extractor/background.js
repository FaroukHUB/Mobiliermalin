/**
 * Mobilier Malin — Extension Chrome pour extraire les annonces Leboncoin.
 *
 * v1.1 — Améliorations :
 *   - Auto-clic sur "Voir plus" pour dérouler la description complète
 *   - Titre nettoyé (juste la 1ère ligne du <h1>, sans prix parasite)
 *   - Extraction du prix soldé + prix barré + pourcentage remise
 *   - Extraction ville via regex code postal (5 chiffres)
 *   - Extraction catégorie via patterns "Ameublement > ..."
 *   - Extraction photos via srcset, data-src, noscript (contourne le
 *     lazy-loading Leboncoin)
 *   - Scroll auto pour forcer le chargement des images
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

function extractAd() {
  // Utilitaires
  const q = (sel) => document.querySelector(sel)
  const qAll = (sel) => Array.from(document.querySelectorAll(sel))
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))

  // 1. Auto-clic sur "Voir plus" pour dérouler la description
  const voirPlus = qAll('button, a, span, div').find((el) => {
    const t = el.innerText?.trim().toLowerCase()
    return (
      t === 'voir plus' ||
      t === 'lire la suite' ||
      t === 'voir la description complète'
    )
  })
  if (voirPlus) {
    try {
      voirPlus.click()
    } catch {}
  }

  // 2. Scroll pour forcer le lazy-load des images
  const originalScroll = window.scrollY
  window.scrollTo(0, document.body.scrollHeight / 2)

  // Petit délai pour laisser le DOM se stabiliser
  wait(400).then(() => {
    window.scrollTo(0, originalScroll)
    doExtract()
  })

  function doExtract() {
    // ─── TITRE (juste la 1ère ligne, sans prix parasite) ──────────
    const rawTitle =
      q('[data-qa-id="adview_title"]')?.innerText ||
      q('h1')?.innerText ||
      ''
    const title = rawTitle
      .split('\n')[0]
      .replace(/\s*\d+\s*€.*$/, '')
      .trim()

    // ─── PRIX (soldé + comparaison + remise) ──────────────────────
    // On cherche tous les éléments contenant un pattern "XX €"
    const priceElements = qAll('*').filter((el) => {
      if (el.children.length > 0) return false // feuilles seulement
      const t = el.textContent?.trim() || ''
      return /^\d{1,5}\s*€\s*$/.test(t)
    })
    const prices = priceElements
      .map((el) => el.textContent.trim())
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3)

    const priceMain = prices[0] || ''
    const priceCompare = prices[1] || ''

    // Pourcentage de remise
    const discountMatch = document.body.innerText.match(/(-?\d{1,2})\s?%/)
    const discount = discountMatch ? discountMatch[0] : ''

    // ─── DESCRIPTION (plus long bloc de texte cohérent) ───────────
    const descCandidates = [
      ...qAll('[data-qa-id*="description"]'),
      ...qAll('[data-testid*="description"]'),
      ...qAll('article p, article div'),
      ...qAll('section p, section div'),
      ...qAll('main p, main div'),
    ]
      .filter((el) => {
        const t = el.innerText?.trim() || ''
        return t.length > 80 && t.length < 8000
      })
      .filter((el, i, a) => {
        // Retire les descendants d'autres candidats (garde le container)
        return !a.some((other) => other !== el && other.contains(el))
      })

    // Le plus long candidat
    descCandidates.sort(
      (a, b) => (b.innerText?.length || 0) - (a.innerText?.length || 0),
    )
    const desc = descCandidates[0]?.innerText?.trim() || ''

    // ─── VILLE (regex code postal FR) ─────────────────────────────
    const bodyText = document.body.innerText
    const cityMatch = bodyText.match(
      /([A-ZÀ-Ÿ][a-zà-ÿ\-']+(?:[\s-]+[A-ZÀ-Ÿa-zà-ÿ\-']+)*)\s+(\d{5})/,
    )
    const location = cityMatch ? `${cityMatch[1].trim()} ${cityMatch[2]}` : ''

    // ─── CATÉGORIE (fil d'ariane ou détection texte) ──────────────
    let breadcrumb = qAll(
      '[data-qa-id="breadcrumb_link"], nav[aria-label*="ariane" i] a, nav ol li a',
    )
      .map((el) => el.innerText.trim())
      .filter(Boolean)
      .join(' > ')

    // Fallback : regex sur URL du chemin
    if (!breadcrumb) {
      const urlPath = location.href
      const cats = urlPath.match(/\/ad\/([^/]+)\//)
      if (cats) breadcrumb = cats[1].replace(/-/g, ' ')
    }

    // ─── PHOTOS (contourne le lazy-load) ──────────────────────────
    const imageUrls = new Set()

    // Sources classiques
    qAll('img').forEach((img) => {
      const srcs = [
        img.src,
        img.getAttribute('data-src'),
        img.getAttribute('data-lazy-src'),
        img.getAttribute('data-original'),
      ]
      srcs.forEach((s) => s && imageUrls.add(s))

      // srcset : liste "url 1x, url 2x"
      const srcset = img.getAttribute('srcset')
      if (srcset) {
        srcset.split(',').forEach((entry) => {
          const url = entry.trim().split(/\s+/)[0]
          if (url) imageUrls.add(url)
        })
      }
    })

    // <source> dans <picture>
    qAll('source').forEach((source) => {
      const srcset = source.getAttribute('srcset')
      if (srcset) {
        srcset.split(',').forEach((entry) => {
          const url = entry.trim().split(/\s+/)[0]
          if (url) imageUrls.add(url)
        })
      }
    })

    // Meta OG images
    qAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(
      (m) => {
        const c = m.getAttribute('content')
        if (c) imageUrls.add(c)
      },
    )

    // Filtre les URLs qui ressemblent à des photos d'annonce Leboncoin
    const imgs = [...imageUrls]
      .filter(
        (s) =>
          s &&
          typeof s === 'string' &&
          (s.includes('img.leboncoin') ||
            s.includes('leboncoin.fr/ac_') ||
            s.includes('leboncoin-static.com') ||
            s.includes('/adview/') ||
            s.includes('/pictures/') ||
            s.includes('/ac_')),
      )
      // Retire les tout petits thumbnails
      .filter((s) => !/\/(favicon|logo|thumb-mini)/i.test(s))
      .slice(0, 20)

    // ─── SORTIE FORMATÉE ──────────────────────────────────────────
    const output = `--- ANNONCE LEBONCOIN ---
URL : ${location.href}
Titre : ${title}
Prix : ${priceMain}${priceCompare ? ' (barré : ' + priceCompare + ')' : ''}${discount ? ' — ' + discount : ''}
Ville : ${location}
Catégorie : ${breadcrumb || '(non détectée)'}

Description :
${desc}

Photos (${imgs.length}) :
${imgs.join('\n')}
--- FIN ---`

    // ─── COPIE CLIPBOARD ──────────────────────────────────────────
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
        max-width: 380px;
        line-height: 1.5;
      `

      toast.innerHTML = ok
        ? `<strong style="color:#c8a25b">✅ Annonce copiée (v1.1)</strong><br>` +
          `<span style="opacity:0.85; font-weight: 400;">` +
          `Titre : ${title.slice(0, 60)}${title.length > 60 ? '…' : ''}<br>` +
          `Prix : ${priceMain}<br>` +
          `Ville : ${location || '(vide)'}<br>` +
          `Cat : ${breadcrumb.slice(0, 40) || '(vide)'}<br>` +
          `Photos : ${imgs.length} • Desc : ${desc.length} car.<br>` +
          `<em style="opacity:0.7">Colle (Cmd+V) dans Claude</em></span>`
        : `<strong>❌ Erreur clipboard</strong><br>` +
          `<span style="opacity:0.85; font-weight: 400;">Ouvre la console (F12) → texte brut affiché.</span>`

      document.body.appendChild(toast)
      if (!ok) console.log('[LBC extractor] Texte brut :\n\n' + output)

      setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease-out'
        toast.style.opacity = '0'
        setTimeout(() => toast.remove(), 400)
      }, 5000)
    })
  }
}
