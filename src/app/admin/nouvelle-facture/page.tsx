/**
 * /admin/nouvelle-facture
 *
 * Formulaire simplifié pour créer une facture "à la volée" quand le
 * client est déjà d'accord (pas besoin d'un devis formel). Ex : Djamel
 * au téléphone avec un client qui dit "envoie-moi un lien pour 200 €".
 *
 * Différences avec /admin/nouveau-devis :
 *   - UI compacte, 1 champ montant par défaut (pas de multi-lignes)
 *   - Option "avancé" pour ajouter plusieurs lignes détaillées
 *   - Numérotation FAC-YYYY-XXXX
 *   - Email intitulé "Votre facture"
 *   - Pas de champ "durée de validité" (paiement immédiat attendu)
 */

'use client'

import { useEffect, useRef, useState } from 'react'

type LineItem = {
  id: string
  name: string
  unitPrice: number
  quantity: number
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

export default function NouvelleFacturePage() {
  const [secret, setSecret] = useState('')

  // Client
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')

  // Adresse (obligatoire pour facture légale)
  const [street, setStreet] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')

  // Mode simple ou avancé
  const [advanced, setAdvanced] = useState(false)

  // Mode simple : 1 description + 1 montant TTC
  const [description, setDescription] = useState('')
  const [amountTTC, setAmountTTC] = useState(0)

  // Mode avancé : plusieurs lignes
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: rid(), name: '', unitPrice: 0, quantity: 1 },
  ])

  const [tvaRate, setTvaRate] = useState(20)
  const [pdfNotes, setPdfNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (result?.ok) {
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100,
      )
    }
  }, [result])

  // Totaux
  const fmt = (n: number) =>
    n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const linesTotalHt = advanced
    ? lineItems.reduce(
        (s, li) => s + (li.unitPrice || 0) * (li.quantity || 0),
        0,
      )
    : (amountTTC || 0) / (1 + tvaRate / 100)

  const tvaAmount = linesTotalHt * (tvaRate / 100)
  const totalTtc = linesTotalHt + tvaAmount

  const addLine = () =>
    setLineItems([...lineItems, { id: rid(), name: '', unitPrice: 0, quantity: 1 }])
  const removeLine = (id: string) =>
    setLineItems(lineItems.filter((li) => li.id !== id))
  const updateLine = (id: string, patch: Partial<LineItem>) =>
    setLineItems(lineItems.map((li) => (li.id === id ? { ...li, ...patch } : li)))

  const canSubmit =
    secret.trim() &&
    name.trim() &&
    email.trim() &&
    street.trim() &&
    postalCode.trim() &&
    city.trim() &&
    (advanced
      ? lineItems.every(
          (li) => li.name.trim() && li.unitPrice >= 0 && li.quantity >= 1,
        )
      : description.trim() && amountTTC > 0)

  const submit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setResult(null)

    // Construit le payload conforme à /api/admin/quotes/create
    const payloadLineItems = advanced
      ? lineItems.map((li) => ({
          name: li.name,
          unitPrice: li.unitPrice,
          quantity: li.quantity,
        }))
      : [
          {
            name: description,
            // Convertit TTC → HT pour cohérence stockage/calculs
            unitPrice: (amountTTC || 0) / (1 + tvaRate / 100),
            quantity: 1,
          },
        ]

    try {
      const res = await fetch('/api/admin/quotes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify({
          documentType: 'invoice',
          customer: { name, email, phone, company },
          shippingAddress: { street, postalCode, city, elevator: 'unknown' },
          lineItems: payloadLineItems,
          shippingFee: 0,
          options: [],
          tvaRate,
          pdfNotes,
          internalNotes,
        }),
      })
      const data: Result = await res.json()
      setResult(data)
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : 'Erreur réseau',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setCompany('')
    setStreet('')
    setPostalCode('')
    setCity('')
    setDescription('')
    setAmountTTC(0)
    setLineItems([{ id: rid(), name: '', unitPrice: 0, quantity: 1 }])
    setPdfNotes('')
    setInternalNotes('')
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      style={{
        maxWidth: 720,
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
          🧾 Nouvelle facture
        </h1>
        <p style={{ color: '#666', margin: 0, lineHeight: 1.5 }}>
          Client déjà d&apos;accord — envoi rapide d&apos;une facture avec lien
          de paiement en carte bancaire. La facture PDF officielle est
          générée automatiquement par Stripe après paiement.
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
          <Field label="Société" flex={2}>
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

      <Section title="2. Adresse de facturation">
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
      </Section>

      <Section
        title={`3. Contenu de la facture ${advanced ? '(mode détaillé)' : '(mode rapide)'}`}
      >
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setAdvanced(!advanced)}
            style={{
              padding: '8px 14px',
              background: advanced ? '#1a1a1a' : 'transparent',
              color: advanced ? 'white' : '#1a1a1a',
              border: '1px solid #d5d3ce',
              borderRadius: 4,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {advanced ? '↩ Revenir en mode rapide' : '⚙️ Mode détaillé (plusieurs lignes)'}
          </button>
        </div>

        {!advanced ? (
          <>
            <Field label="Description">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={inputStyle}
                placeholder="Ex : 4 fauteuils Steelcase + livraison Marseille"
              />
            </Field>
            <Field label="Montant total TTC (€)">
              <input
                type="number"
                min={0}
                step={0.01}
                value={amountTTC || ''}
                onChange={(e) => setAmountTTC(parseFloat(e.target.value) || 0)}
                style={{ ...inputStyle, fontSize: 20, fontWeight: 600 }}
                placeholder="0"
              />
            </Field>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lineItems.map((li) => (
                <div
                  key={li.id}
                  style={{
                    border: '1px solid #e5e2d8',
                    borderRadius: 6,
                    padding: 12,
                    background: '#fafaf7',
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <Field label="Désignation" flex={3}>
                      <input
                        value={li.name}
                        onChange={(e) =>
                          updateLine(li.id, { name: e.target.value })
                        }
                        style={inputStyle}
                        placeholder="Ex : Fauteuil Steelcase Leap V2"
                      />
                    </Field>
                    <Field label="Prix HT (€)" flex={1}>
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
                    <Field label="Qté" flex={0.5}>
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
                        padding: '8px 12px',
                        background: 'transparent',
                        border: '1px solid #d5d3ce',
                        borderRadius: 4,
                        cursor:
                          lineItems.length === 1 ? 'not-allowed' : 'pointer',
                        color: '#c33',
                        marginBottom: 4,
                        opacity: lineItems.length === 1 ? 0.4 : 1,
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addLine}
              style={{
                marginTop: 12,
                padding: '8px 14px',
                background: 'transparent',
                border: '1px solid #d5d3ce',
                borderRadius: 4,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              + Ajouter une ligne
            </button>
          </>
        )}

        <div style={{ marginTop: 20 }}>
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
          </Row>
        </div>

        <Field label="Notes sur la facture client (facultatif)">
          <textarea
            value={pdfNotes}
            onChange={(e) => setPdfNotes(e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Ex : Merci pour votre confiance, livraison prévue semaine 12."
          />
        </Field>
        <Field label="Notes internes (non visibles client)">
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Ex : Client Jean — vente téléphone du 04/07"
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
          <strong style={{ textAlign: 'right' }}>{fmt(linesTotalHt)} €</strong>
          <span>TVA ({tvaRate} %)</span>
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
        {submitting
          ? '⏳ Création en cours…'
          : '💳 Créer la facture et envoyer le lien de paiement'}
      </button>

      {result && (
        <div
          ref={resultRef}
          style={{
            marginTop: 24,
            padding: 32,
            borderRadius: 8,
            background: result.ok
              ? 'linear-gradient(135deg, #2b915d 0%, #1f6b45 100%)'
              : '#fbeaea',
            border: `2px solid ${result.ok ? '#1f6b45' : '#b23d3d'}`,
            color: result.ok ? 'white' : '#1a1a1a',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {result.ok ? (
            <>
              <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 8 }}>
                🧾
              </div>
              <h2
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 26,
                  margin: '0 0 8px',
                  textAlign: 'center',
                }}
              >
                Facture envoyée au client !
              </h2>
              <p
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  opacity: 0.92,
                  margin: '0 0 24px',
                }}
              >
                Numéro <strong>{result.numero}</strong> — Total{' '}
                <strong>{fmt(result.totalTtc)} € TTC</strong>
              </p>
              <div
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  borderRadius: 6,
                  padding: 20,
                  marginBottom: 20,
                  fontSize: 14,
                  lineHeight: 2,
                }}
              >
                <div>
                  📧 Email :{' '}
                  {result.emailSent ? (
                    <strong>✅ envoyé à {email}</strong>
                  ) : (
                    <strong style={{ color: '#ffb0b0' }}>
                      ⚠️ échec ({result.emailError})
                    </strong>
                  )}
                </div>
                <div>
                  🔗 Lien de paiement :{' '}
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ffe0a0', textDecoration: 'underline' }}
                  >
                    Ouvrir
                  </a>
                </div>
              </div>
              <button
                onClick={resetForm}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: 15,
                  fontWeight: 600,
                  background: 'white',
                  color: '#1f6b45',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                🧾 Créer une nouvelle facture
              </button>
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

// ─── Utilitaires UI ──────────────────────────────

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
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
