/**
 * /admin/import-lbc
 *
 * Petite UI pour importer un produit dans Sanity depuis un JSON
 * (généré par Claude à partir d'une extraction Leboncoin).
 *
 * Robustesse : la page est marquée noindex (elle ne doit pas apparaître
 * dans Google) et l'endpoint sous-jacent est protégé par ADMIN_IMPORT_SECRET.
 */

'use client'

import { useEffect, useState } from 'react'

const EXAMPLE_JSON = `{
  "name": "Table mange-debout plateau verre",
  "brand": "Sans marque",
  "condition": "excellent",
  "categorySlug": "espaces-detente",
  "price": 96,
  "salePrice": 50,
  "stock": 1,
  "sku": "TMD-VERRE-001",
  "material": "Verre trempé, acier chromé",
  "color": "Transparent / chromé",
  "shortDescription": "Table mange-debout au plateau en verre et piètement chromé.",
  "descriptionBlocks": [
    { "style": "normal", "text": "Ce mange-debout combine un plateau verre trempé..." },
    { "style": "h2", "text": "Idéal pour" },
    { "style": "bullet", "text": "Espaces de pause d'entreprise" },
    { "style": "bullet", "text": "Coworking et open-space" }
  ],
  "seoMetaTitle": "Table mange-debout occasion Marseille — 50 €",
  "seoMetaDescription": "Table mange-debout reconditionnée, plateau verre & piètement chromé...",
  "sourceUrl": "https://www.leboncoin.fr/ad/ameublement/3210607487"
}`

type ResultOk = {
  ok: true
  id: string
  slug: string
  name: string
  categoryResolved: boolean
  categoryFallback?: string
  studioUrl: string
  publicUrl: string
  next: string
}

type ResultErr = {
  ok: false
  error: string
  existingId?: string
}

type Result = ResultOk | ResultErr

export default function ImportLbcPage() {
  const [secret, setSecret] = useState('')
  const [json, setJson] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoLoadInfo, setAutoLoadInfo] = useState<string>('')

  // Auto-load JSON from URL param ?src=...
  // Ex: /admin/import-lbc?src=/imports/table-mange-debout-verre-chrome.json
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const src = params.get('src')
    if (!src) return
    // Sécurité : autorise uniquement les chemins internes /imports/*
    if (!src.startsWith('/imports/') || !src.endsWith('.json')) {
      setAutoLoadInfo(`⚠️ Source refusée : ${src} (autorisé : /imports/*.json)`)
      return
    }
    setAutoLoadInfo(`⏳ Chargement de ${src}…`)
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      })
      .then((text) => {
        // Prettify pour lecture facile
        try {
          const obj = JSON.parse(text)
          setJson(JSON.stringify(obj, null, 2))
          setAutoLoadInfo(`✅ Chargé depuis ${src} — vérifie le contenu puis clique Importer`)
        } catch {
          setJson(text)
          setAutoLoadInfo(`⚠️ Chargé mais JSON invalide — corrige à la main`)
        }
      })
      .catch((err) => {
        setAutoLoadInfo(`❌ Impossible de charger ${src} : ${err.message}`)
      })
  }, [])

  const submit = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/products/import-lbc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: json,
      })
      const data: Result = await res.json()
      setResult(data)
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : 'Erreur réseau',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '40px auto',
        padding: 32,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 32,
          margin: '0 0 8px',
        }}
      >
        📥 Import produit — Leboncoin → Sanity
      </h1>
      <p style={{ color: '#666', margin: '0 0 32px', lineHeight: 1.6 }}>
        Colle le JSON de produit (généré par Claude à partir d&apos;une
        extraction Leboncoin) et clique <strong>Importer</strong>. Le produit
        sera créé en <strong>brouillon</strong> dans Sanity — tu n&apos;auras
        plus qu&apos;à ouvrir la fiche pour y ajouter les photos et publier.
      </p>

      {autoLoadInfo && (
        <div
          style={{
            padding: 12,
            marginBottom: 20,
            background: autoLoadInfo.startsWith('✅')
              ? '#eaf8ef'
              : autoLoadInfo.startsWith('⏳')
                ? '#fef7e6'
                : '#fbeaea',
            border: `1px solid ${
              autoLoadInfo.startsWith('✅')
                ? '#2b915d'
                : autoLoadInfo.startsWith('⏳')
                  ? '#c58720'
                  : '#b23d3d'
            }`,
            borderRadius: 4,
            fontSize: 13,
            fontFamily: 'monospace',
          }}
        >
          {autoLoadInfo}
        </div>
      )}

      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#333',
        }}
      >
        Secret admin
      </label>
      <input
        type="password"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="ADMIN_IMPORT_SECRET (voir Vercel Env Vars)"
        style={{
          width: '100%',
          padding: 12,
          border: '1px solid #d5d3ce',
          borderRadius: 4,
          marginBottom: 20,
          fontSize: 14,
          fontFamily: 'monospace',
        }}
      />

      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#333',
        }}
      >
        JSON du produit
      </label>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        placeholder={EXAMPLE_JSON}
        rows={22}
        style={{
          width: '100%',
          padding: 16,
          border: '1px solid #d5d3ce',
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: 13,
          lineHeight: 1.5,
          resize: 'vertical',
        }}
      />

      <button
        onClick={submit}
        disabled={loading || !secret.trim() || !json.trim()}
        style={{
          marginTop: 16,
          padding: '14px 28px',
          background: loading || !secret.trim() || !json.trim() ? '#999' : '#c8a25b',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 15,
          fontWeight: 600,
          cursor:
            loading || !secret.trim() || !json.trim() ? 'not-allowed' : 'pointer',
          letterSpacing: '0.02em',
        }}
      >
        {loading ? '⏳ Import en cours…' : '📥 Importer dans Sanity'}
      </button>

      {result && (
        <div
          style={{
            marginTop: 32,
            padding: 20,
            background: result.ok ? '#eaf8ef' : '#fbeaea',
            border: `1px solid ${result.ok ? '#2b915d' : '#b23d3d'}`,
            borderRadius: 4,
            color: '#111',
          }}
        >
          {result.ok ? (
            <>
              <h3 style={{ margin: '0 0 12px', color: '#2b915d' }}>
                ✅ Produit créé — {result.name}
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>
                  ID Sanity : <code>{result.id}</code>
                </li>
                <li>
                  Slug : <code>{result.slug}</code>
                </li>
                <li>
                  Catégorie :{' '}
                  {result.categoryResolved
                    ? '✅ résolue'
                    : `⚠️ non trouvée (${result.categoryFallback || 'aucune fournie'})`}
                </li>
                <li>
                  <a
                    href={result.studioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#c58720' }}
                  >
                    → Ouvrir dans le Studio (uploader les photos)
                  </a>
                </li>
                <li>
                  URL publique (visible une fois publié) :{' '}
                  <a
                    href={result.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#c58720' }}
                  >
                    <code>{result.publicUrl}</code>
                  </a>
                </li>
              </ul>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 13,
                  color: '#666',
                  fontStyle: 'italic',
                }}
              >
                💡 {result.next}
              </p>
            </>
          ) : (
            <>
              <h3 style={{ margin: '0 0 8px', color: '#b23d3d' }}>❌ Erreur</h3>
              <p style={{ margin: 0 }}>{result.error}</p>
              {result.existingId && (
                <p style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                  Document existant : <code>{result.existingId}</code>
                </p>
              )}
            </>
          )}
        </div>
      )}

      <details style={{ marginTop: 40, color: '#666' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}>
          📖 Exemple de JSON
        </summary>
        <pre
          style={{
            padding: 16,
            background: '#f5f4f0',
            borderRadius: 4,
            fontSize: 12,
            overflow: 'auto',
          }}
        >
          {EXAMPLE_JSON}
        </pre>
      </details>
    </div>
  )
}
