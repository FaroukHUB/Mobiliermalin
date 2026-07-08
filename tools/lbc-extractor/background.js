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
    let desc = descCandidates[0]?.innerText?.trim() || ''

    // ─── NETTOYAGE DESCRIPTION ────────────────────────────────────
    // Isole le VRAI corps de description : coupe avant "Description"
    // (le heading) et après "Voir moins" / "Localisation" / autres
    // pollutions de la page vendeur.
    const descStartMarkers = ['\nDescription\n', 'Description\n']
    for (const m of descStartMarkers) {
      const idx = desc.indexOf(m)
      if (idx !== -1) {
        desc = desc.substring(idx + m.length)
        break
      }
    }
    const descEndMarkers = [
      'Voir moins',
      '\nLocalisation\n',
      '\nVendu par',
      'Signaler l',
      'Les annonces de ce pro',
      'BoosterGérer',
      '\nInfos vendeur',
    ]
    for (const m of descEndMarkers) {
      const idx = desc.indexOf(m)
      if (idx !== -1) desc = desc.substring(0, idx)
    }
    desc = desc.trim()

    // ─── INFORMATIONS CLÉS (structurées Leboncoin) ────────────────
    // Leboncoin affiche des infos clés type "État: Très bon état",
    // "Marque: Habitat", "Couleur: Gris". On les extrait pour les
    // pré-remplir dans Sanity.
    const infoKeys = [
      'État',
      'Marque',
      'Matière',
      'Couleur',
      'Quantité',
      'Produit',
      'Pièce',
      'Type',
      'Modèle',
      'Dimensions',
      'Style',
    ]
    const infos = {}
    // Parcourt les DL / DT-DD ou couples label/valeur adjacents
    const bodyLines = document.body.innerText.split('\n').map((l) => l.trim())
    for (let i = 0; i < bodyLines.length - 1; i++) {
      if (infoKeys.includes(bodyLines[i]) && bodyLines[i + 1] && bodyLines[i + 1].length < 100) {
        // Ignore les valeurs génériques inutiles
        const val = bodyLines[i + 1]
        if (val && val !== 'Non renseignée' && val !== '-') {
          infos[bodyLines[i]] = val
        }
      }
    }

    // ─── CATÉGORIE (chaises AVANT bureau — plus spécifiques d'abord) ─
    const CAT_RULES = [
      // Marques et modèles emblématiques de fauteuils ergonomiques (les plus spécifiques)
      { patterns: ['aeron', 'leap v2', 'leap', 'gesture', 'think', 'zody', 'embody', 'sayl', 'vitra id', 'hag capisco', 'håg capisco', 'ergohuman'], slug: 'fauteuils-ergonomiques', label: 'Fauteuil ergonomique (modèle iconique)' },
      // Fauteuils ergonomiques
      { patterns: ['fauteuil ergonomique', 'siège ergonomique', 'siege ergonomique', 'fauteuil de bureau ergonomique'], slug: 'fauteuils-ergonomiques', label: 'Fauteuil ergonomique' },
      // Chaises (spécifiques d'abord)
      { patterns: ['chaise de formation', 'chaise formation', 'chaise tablette', 'écritoire', 'chaise conférence'], slug: 'chaises-formation', label: 'Chaise de formation' },
      { patterns: ['chaise accueil', 'chaise d\'accueil', 'chaise réunion', 'chaise de réunion', 'chaise reunion', 'chaise visiteur'], slug: 'chaises-accueil-reunion', label: 'Chaise d\'accueil / réunion' },
      // Chaise bureau : plutôt fauteuil-like → chaises accueil (car "chaise" prime sur "bureau")
      { patterns: ['chaise bureau', 'chaise de bureau'], slug: 'chaises-accueil-reunion', label: 'Chaise de bureau (accueil / poste secondaire)' },
      // Fauteuils génériques
      { patterns: ['fauteuil de bureau', 'fauteuil bureau', 'fauteuil pivotant'], slug: 'fauteuils-ergonomiques', label: 'Fauteuil de bureau' },
      { patterns: ['fauteuil'], slug: 'fauteuils-ergonomiques', label: 'Fauteuil' },
      // Chaise générique (si aucune des règles ci-dessus n'a matché)
      { patterns: ['chaise'], slug: 'chaises-accueil-reunion', label: 'Chaise' },
      // Bureaux (types spécifiques d'abord)
      { patterns: ['bureau assis-debout', 'assis debout', 'assis-debout'], slug: 'bureaux-individuels', label: 'Bureau assis-debout' },
      { patterns: ['bureau angle', 'bureau d\'angle'], slug: 'bureaux-individuels', label: 'Bureau d\'angle' },
      { patterns: ['bench', 'benching'], slug: 'bureaux-individuels', label: 'Bench collaboratif' },
      { patterns: ['bureau'], slug: 'bureaux-individuels', label: 'Bureau individuel' },
      // Autres catégories
      { patterns: ['table réunion', 'table de réunion', 'table conférence'], slug: 'tables-de-reunion', label: 'Table de réunion' },
      { patterns: ['armoire', 'rangement métallique', 'meuble rangement'], slug: 'armoires-rangements', label: 'Armoire / rangement' },
      { patterns: ['caisson', 'tiroir'], slug: 'caissons', label: 'Caisson' },
      { patterns: ['tabouret', 'canapé', 'canape', 'lounge', 'pouf', 'espace détente', 'espace detente'], slug: 'espaces-detente', label: 'Espace détente' },
    ]

    const titleLower = title.toLowerCase()
    let categorySlug = ''
    let categoryLabel = '(non détectée — à choisir dans Sanity)'
    for (const rule of CAT_RULES) {
      if (rule.patterns.some((p) => titleLower.includes(p))) {
        categorySlug = rule.slug
        categoryLabel = rule.label
        break
      }
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
    const rawImgs = [...imageUrls]
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
      .filter((s) => !/\/(favicon|logo|thumb-mini)/i.test(s))

    // ─── DÉDOUBLONNAGE par hash d'image ───────────────────────────
    // Leboncoin sert la même image en 4-5 tailles (ad-thumb, ad-large,
    // classified-1200x800-webp, classified-1200x800-jpg,
    // classified-800x533-webp...). On extrait le hash d'image de
    // l'URL et on garde uniquement la meilleure qualité par image.
    //
    // URL type : /images/cd/94/35/cd94355e58b900d4f492446d1553f51baef3e982.jpg?rule=classified-1200x800-webp
    // Hash : cd94355e58b900d4f492446d1553f51baef3e982

    const qualityRank = (url) => {
      // Plus élevé = meilleure qualité
      if (url.includes('classified-1200x800-webp')) return 100
      if (url.includes('classified-1200x800-jpg')) return 90
      if (url.includes('classified-800x533-webp')) return 80
      if (url.includes('classified-800x533-jpg')) return 70
      if (url.includes('ad-large')) return 60
      if (url.includes('ad-image')) return 50
      if (url.includes('ad-thumb')) return 30
      if (url.includes('bo-thumb')) return 20
      return 40
    }

    const bestByHash = new Map()
    for (const url of rawImgs) {
      const hashMatch = url.match(
        /\/images\/[a-f0-9]{2}\/[a-f0-9]{2}\/[a-f0-9]{2}\/([a-f0-9-]{20,})/i,
      )
      if (!hashMatch) continue
      const hash = hashMatch[1]
      const rank = qualityRank(url)
      const current = bestByHash.get(hash)
      if (!current || rank > current.rank) {
        bestByHash.set(hash, { url, rank })
      }
    }

    const imgs = [...bestByHash.values()].map((v) => v.url).slice(0, 15)

    // ─── SORTIE FORMATÉE ──────────────────────────────────────────
    // ─── SORTIE FORMATÉE ──────────────────────────────────────────
    const infosLines = Object.entries(infos)
      .map(([k, v]) => `  • ${k} : ${v}`)
      .join('\n')

    const output = `--- ANNONCE LEBONCOIN ---
URL : ${window.location.href}
Titre : ${title}
Prix : ${priceMain}${priceCompare ? ' (barré : ' + priceCompare + ')' : ''}${discount ? ' — ' + discount : ''}
Catégorie déduite : ${categoryLabel}${categorySlug ? ' → /categorie/' + categorySlug : ''}

Infos clés Leboncoin :
${infosLines || '  (aucune information structurée détectée)'}

Description :
${desc}

Photos (${imgs.length} uniques) :
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
        ? `<strong style="color:#c8a25b">✅ Annonce copiée (v1.3)</strong><br>` +
          `<span style="opacity:0.85; font-weight: 400;">` +
          `Titre : ${title.slice(0, 60)}${title.length > 60 ? '…' : ''}<br>` +
          `Prix : ${priceMain}<br>` +
          `Catégorie : ${categoryLabel.slice(0, 40)}<br>` +
          `Infos : ${Object.keys(infos).length} champs • Photos : ${imgs.length} uniques<br>` +
          `Desc : ${desc.length} car.<br>` +
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
