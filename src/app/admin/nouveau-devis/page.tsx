/**
 * /admin/nouveau-devis
 *
 * Formulaire admin pour créer un devis manuellement et l'envoyer
 * directement au client par email (avec lien de paiement Stripe).
 *
 * Fonctionnalités :
 *   - Coordonnées client
 *   - Adresse de livraison
 *   - Autocomplete produit depuis le catalogue Sanity
 *   - Ligne libre pour produits hors catalogue
 *   - Frais de livraison
 *   - Options supplémentaires
 *   - Récap dynamique HT + TVA + TTC
 *   - Envoi email client automatique
 *
 * Protégé par ADMIN_IMPORT_SECRET (même secret que /admin/import-lbc).
 */

'use client'

import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  slug: string
  priceEur: number
  stock: number
  brand?: string
  condition?: string
}

type LineItem = {
  id: string
  name: string
  unitPrice: number
  quantity: number
  slug?: string
  refId?: string
}

type Option = {
  id: string
  label: string
  price: number
}

type Result =
  | {
      ok: true
      uid: string
      numero: string
      url: string
      emailSent: boolean
      emailError?: string
      totalTtc: number
    }
  | { ok: false; error: string }

const rid = () => Math.random().toString(36).slice(2, 10)

export default function NouveauDevisPage() {
  const [secret, setSecret] = useState('')

  // Client
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')

  // Adresse
  const [street, setStreet] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [floor, setFloor] = useState('')
  const [elevator, setElevator] = useState<'yes' | 'no' | 'unknown'>('unknown')
  const [instructions, setInstructions] = useState('')

  // Lignes
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: rid(), name: '', unitPrice: 0, quantity: 1 },
  ])

  // Options + frais
  const [options, setOptions] = useState<Option[]>([])
  // ⚠️ shippingFeeTTC : ce que voit / saisit l'admin (ce qu'on annonce
  // au client). Converti en HT côté calculs pour que la TVA reste
  // cohérente avec le reste (lignes produits en HT + options en HT).
  const [shippingFeeTTC, setShippingFeeTTC] = useState(0)
  const [tvaRate, setTvaRate] = useState(20)
  const [validUntilDays, setValidUntilDays] = useState(30)
  const [pdfNotes, setPdfNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  // Autocomplete produits (par ligne)
  const [searchIndex, setSearchIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  // Recherche debounced
  useEffect(() => {
    if (searchIndex === null || !searchQuery.trim() || !secret) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `/api/admin/products-search?q=${encodeURIComponent(searchQuery)}`,
          { headers: { 'x-admin-secret': secret } },
        )
        const data = await res.json()
        setSearchResults(data.products || [])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [searchIndex, searchQuery, secret])

  // Totaux — la livraison saisie en TTC est convertie en HT en interne
  // pour additionner tout en HT, puis TVA appliquée sur l'ensemble.
  const shippingFeeHt = (shippingFeeTTC || 0) / (1 + tvaRate / 100)
  const subtotalHt =
    lineItems.reduce((s, li) => s + (li.unitPrice || 0) * (li.quantity || 0), 0) +
    options.reduce((s, o) => s + (o.price || 0), 0) +
    shippingFeeHt
  const tvaAmount = subtotalHt * (tvaRate / 100)
  const totalTtc = subtotalHt + tvaAmount

  const fmt = (n: number) =>
    n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  // Actions ligne
  const addLine = () =>
    setLineItems([...lineItems, { id: rid(), name: '', unitPrice: 0, quantity: 1 }])
  const removeLine = (id: string) =>
    setLineItems(lineItems.filter((li) => li.id !== id))
  const updateLine = (id: string, patch: Partial<LineItem>) =>
    setLineItems(lineItems.map((li) => (li.id === id ? { ...li, ...patch } : li)))
  const selectProduct = (index: number, product: Product) => {
    const target = lineItems[index]
    updateLine(target.id, {
      name: product.name,
      unitPrice: product.priceEur,
      slug: product.slug,
      refId: product.id,
    })
    setSearchIndex(null)
    setSearchQuery('')
  }

  // Actions options
  const addOption = () =>
    setOptions([...options, { id: rid(), label: '', price: 0 }])
  const removeOption = (id: string) =>
    setOptions(options.filter((o) => o.id !== id))
  const updateOption = (id: string, patch: Partial<Option>) =>
    setOptions(options.map((o) => (o.id === id ? { ...o, ...patch } : o)))

  // Submit
  const canSubmit =
    secret.trim() &&
    name.trim() &&
    email.trim() &&
    street.trim() &&
    postalCode.trim() &&
    city.trim() &&
    lineItems.length > 0 &&
    lineItems.every((li) => li.name.trim() && li.unitPrice >= 0 && li.quantity >= 1)

  const submit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/quotes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify({
          customer: { name, email, phone, company },
          shippingAddress: {
            street,
            postalCode,
            city,
            floor,
            elevator,
            instructions,
          },
          lineItems: lineItems.map((li) => ({
            name: li.name,
            unitPrice: li.unitPrice,
            quantity: li.quantity,
            slug: li.slug,
            refId: li.refId,
          })),
          shippingFee: shippingFeeHt,
          options: options.map((o) => ({ label: o.label, price: o.price })),
          tvaRate,
          validUntilDays,
          pdfNotes,
          internalNotes,
        }),
      })
      const data: Result = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : 'Erreur réseau' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 960,
        margin: '40px auto',
        padding: '0 24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 32,
            margin: '0 0 8px',
          }}
        >
          📄 Nouveau devis
        </h1>
        <p style={{ color: '#666', margin: 0, lineHeight: 1.5 }}>
          Créer un devis depuis zéro (client au téléphone, prise de commande
          rapide). Le mail avec lien de paiement part directement après validation.
        </p>
      </div>

      <Field label="Secret admin">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="ADMIN_IMPORT_SECRET"
          style={inputStyle}
        />
      </Field>

      <Section title="1. Client">
        <Row>
          <Field label="Nom complet *" flex={2}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Jean Dupont"
            />
          </Field>
          <Field label="Société (facultatif)" flex={2}>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={inputStyle}
              placeholder="Dupont & Associés"
            />
          </Field>
        </Row>
        <Row>
          <Field label="Email *" flex={2}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="jean@exemple.fr"
            />
          </Field>
          <Field label="Téléphone" flex={1}>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              placeholder="06 12 34 56 78"
            />
          </Field>
        </Row>
      </Section>

      <Section title="2. Adresse de livraison">
        <Field label="Rue *">
          <input
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            style={inputStyle}
            placeholder="12 rue de la République"
          />
        </Field>
        <Row>
          <Field label="Code postal *" flex={1}>
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              style={inputStyle}
              placeholder="13001"
            />
          </Field>
          <Field label="Ville *" flex={2}>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={inputStyle}
              placeholder="Marseille"
            />
          </Field>
        </Row>
        <Row>
          <Field label="Étage" flex={1}>
            <input
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              style={inputStyle}
              placeholder="3e"
            />
          </Field>
          <Field label="Ascenseur" flex={1}>
            <select
              value={elevator}
              onChange={(e) =>
                setElevator(e.target.value as 'yes' | 'no' | 'unknown')
              }
              style={inputStyle}
            >
              <option value="unknown">Non renseigné</option>
              <option value="yes">Oui</option>
              <option value="no">Non</option>
            </select>
          </Field>
        </Row>
        <Field label="Instructions (facultatif)">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Interphone, code d'accès, jours préférés…"
          />
        </Field>
      </Section>

      <Section title="3. Produits">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lineItems.map((li, i) => (
            <div
              key={li.id}
              style={{
                border: '1px solid #e5e2d8',
                borderRadius: 6,
                padding: 12,
                background: li.refId ? '#faf6ec' : '#fafaf7',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 3, position: 'relative' }}>
                  <label style={labelStyle}>
                    Produit {li.refId && '(catalogue)'}
                  </label>
                  <input
                    value={li.name}
                    onChange={(e) => {
                      updateLine(li.id, {
                        name: e.target.value,
                        refId: undefined,
                        slug: undefined,
                      })
                      setSearchIndex(i)
                      setSearchQuery(e.target.value)
                    }}
                    onFocus={() => {
                      setSearchIndex(i)
                      setSearchQuery(li.name)
                    }}
                    style={inputStyle}
                    placeholder="Tape pour rechercher dans le catalogue…"
                  />
                  {searchIndex === i && searchResults.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: '1px solid #e5e2d8',
                        borderRadius: 4,
                        marginTop: 2,
                        maxHeight: 260,
                        overflowY: 'auto',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    >
                      {searchResults.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => selectProduct(i, p)}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f2efe6',
                            fontSize: 13,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = '#fbf6e8')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'white')
                          }
                        >
                          <div style={{ fontWeight: 500 }}>{p.name}</div>
                          <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                            {p.brand || 'Sans marque'} · {p.priceEur} € · Stock {p.stock}
                          </div>
                        </div>
                      ))}
                      {searching && (
                        <div style={{ padding: '10px 12px', color: '#888', fontSize: 12 }}>
                          Recherche…
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Field label="Prix unitaire HT (€)" flex={1}>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={li.unitPrice || ''}
                    onChange={(e) =>
                      updateLine(li.id, {
                        unitPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    style={inputStyle}
                  />
                </Field>
                <Field label="Quantité" flex={0.5}>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={li.quantity || ''}
                    onChange={(e) =>
                      updateLine(li.id, {
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    style={inputStyle}
                  />
                </Field>
                <button
                  onClick={() => removeLine(li.id)}
                  disabled={lineItems.length === 1}
                  style={{
                    ...btnGhost,
                    color: '#c33',
                    marginBottom: 4,
                    opacity: lineItems.length === 1 ? 0.4 : 1,
                    cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer',
                  }}
                  title="Supprimer cette ligne"
                >
                  🗑
                </button>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 6, textAlign: 'right' }}>
                Sous-total ligne : <strong>{fmt(li.unitPrice * li.quantity)} € HT</strong>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addLine} style={{ ...btnGhost, marginTop: 12 }}>
          + Ajouter une ligne
        </button>
      </Section>

      <Section title="4. Livraison & options">
        <Field label="Frais de livraison TTC (€)">
          <input
            type="number"
            min={0}
            step={0.01}
            value={shippingFeeTTC || ''}
            onChange={(e) => setShippingFeeTTC(parseFloat(e.target.value) || 0)}
            style={inputStyle}
            placeholder="0 pour un retrait gratuit — TTC (le prix annoncé au client)"
          />
        </Field>
        {options.map((o) => (
          <Row key={o.id}>
            <Field label="Libellé de l'option" flex={2}>
              <input
                value={o.label}
                onChange={(e) => updateOption(o.id, { label: e.target.value })}
                style={inputStyle}
                placeholder="Ex : Montage sur place, Reprise ancien mobilier…"
              />
            </Field>
            <Field label="Prix HT (€)" flex={1}>
              <input
                type="number"
                min={0}
                step={0.01}
                value={o.price || ''}
                onChange={(e) =>
                  updateOption(o.id, { price: parseFloat(e.target.value) || 0 })
                }
                style={inputStyle}
              />
            </Field>
            <button
              onClick={() => removeOption(o.id)}
              style={{ ...btnGhost, color: '#c33', marginBottom: 4 }}
            >
              🗑
            </button>
          </Row>
        ))}
        <button onClick={addOption} style={{ ...btnGhost, marginTop: 8 }}>
          + Ajouter une option
        </button>
      </Section>

      <Section title="5. Paramètres">
        <Row>
          <Field label="Taux de TVA (%)" flex={1}>
            <select
              value={tvaRate}
              onChange={(e) => setTvaRate(parseFloat(e.target.value))}
              style={inputStyle}
            >
              <option value={20}>20 % (standard)</option>
              <option value={10}>10 % (réduit)</option>
              <option value={5.5}>5,5 % (super réduit)</option>
              <option value={0}>0 % (exonéré)</option>
            </select>
          </Field>
          <Field label="Validité (jours)" flex={1}>
            <input
              type="number"
              min={1}
              value={validUntilDays || ''}
              onChange={(e) => setValidUntilDays(parseInt(e.target.value) || 30)}
              style={inputStyle}
            />
          </Field>
        </Row>
        <Field label="Notes visibles sur le devis client (facultatif)">
          <textarea
            value={pdfNotes}
            onChange={(e) => setPdfNotes(e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Ex : Livraison prévue semaine 12, montage inclus…"
          />
        </Field>
        <Field label="Notes internes (non visibles client)">
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Rappel : appelle Jean vendredi pour confirmer…"
          />
        </Field>
      </Section>

      {/* Récap */}
      <div
        style={{
          padding: 24,
          background: '#1a1a1a',
          color: 'white',
          borderRadius: 6,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            color: '#c8a25b',
            fontSize: 11,
            letterSpacing: 2,
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}
        >
          Récapitulatif
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '6px 24px',
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          <span>Sous-total HT</span>
          <strong style={{ textAlign: 'right' }}>{fmt(subtotalHt)} €</strong>
          <span>TVA ({tvaRate}%)</span>
          <strong style={{ textAlign: 'right' }}>{fmt(tvaAmount)} €</strong>
          <span
            style={{
              gridColumn: '1 / -1',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: 10,
              marginTop: 4,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 24,
              fontSize: 20,
              color: '#c8a25b',
            }}
          >
            <span style={{ fontFamily: 'Georgia, serif' }}>Total TTC</span>
            <strong style={{ textAlign: 'right' }}>{fmt(totalTtc)} €</strong>
          </span>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!canSubmit || submitting}
        style={{
          width: '100%',
          padding: '16px 24px',
          fontSize: 16,
          fontWeight: 600,
          background: !canSubmit || submitting ? '#999' : '#c8a25b',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
          letterSpacing: 0.5,
        }}
      >
        {submitting ? '⏳ Création en cours…' : '📧 Créer le devis et envoyer au client'}
      </button>

      {result && (
        <div
          style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 6,
            background: result.ok ? '#eaf8ef' : '#fbeaea',
            border: `1px solid ${result.ok ? '#2b915d' : '#b23d3d'}`,
          }}
        >
          {result.ok ? (
            <>
              <h3 style={{ margin: '0 0 12px', color: '#2b915d' }}>
                ✅ Devis créé : {result.numero}
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>
                  Email au client :{' '}
                  {result.emailSent ? (
                    <strong>✅ envoyé à {email}</strong>
                  ) : (
                    <strong style={{ color: '#c33' }}>
                      ⚠️ échec ({result.emailError || 'inconnu'})
                    </strong>
                  )}
                </li>
                <li>
                  Total facturé : <strong>{fmt(result.totalTtc)} € TTC</strong>
                </li>
                <li>
                  Lien de consultation client :{' '}
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#c58720' }}
                  >
                    {result.url}
                  </a>
                </li>
                <li>
                  <a
                    href={`/studio/desk/quote;${result.uid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#c58720' }}
                  >
                    → Ouvrir dans le Studio
                  </a>
                </li>
              </ul>
            </>
          ) : (
            <>
              <h3 style={{ margin: '0 0 8px', color: '#b23d3d' }}>❌ Erreur</h3>
              <p style={{ margin: 0 }}>{result.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Composants utilitaires ───────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 18,
          margin: '0 0 16px',
          color: '#1a1a1a',
          borderBottom: '1px solid #e5e2d8',
          paddingBottom: 8,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({
  label,
  children,
  flex = 1,
}: {
  label: string
  children: React.ReactNode
  flex?: number
}) {
  return (
    <div style={{ flex, marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d5d3ce',
  borderRadius: 4,
  fontSize: 14,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  color: '#666',
  marginBottom: 4,
}

const btnGhost: React.CSSProperties = {
  padding: '8px 14px',
  background: 'transparent',
  border: '1px solid #d5d3ce',
  borderRadius: 4,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
