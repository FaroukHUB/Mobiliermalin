'use client'

import { useEffect, useState } from 'react'

/**
 * Saisie de prix à double champ HT / TTC synchronisés.
 *
 * On tape dans l'un, l'autre se calcule automatiquement au taux de TVA
 * courant. La valeur stockée reste toujours le HT (format des devis et
 * factures) ; le TTC n'est qu'une aide à la saisie.
 *
 * À 0 % de TVA les deux montants sont identiques : un seul champ est
 * affiché pour éviter la confusion.
 */

interface PriceHtTtcInputProps {
  /** Valeur HT (source de vérité). */
  valueHt: number
  onChangeHt: (ht: number) => void
  tvaRate: number
  labelHt?: string
  labelTtc?: string
  inputStyle: React.CSSProperties
  labelStyle: React.CSSProperties
  placeholder?: string
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function PriceHtTtcInput({
  valueHt,
  onChangeHt,
  tvaRate,
  labelHt = 'Prix HT (€)',
  labelTtc = 'Prix TTC (€)',
  inputStyle,
  labelStyle,
  placeholder,
}: PriceHtTtcInputProps) {
  const factor = 1 + tvaRate / 100

  // Champs texte locaux : évite qu'un arrondi réécrive ce que l'admin
  // est en train de taper (ex : "12," pendant la frappe).
  const [htText, setHtText] = useState(valueHt ? String(valueHt) : '')
  const [ttcText, setTtcText] = useState(
    valueHt ? String(round2(valueHt * factor)) : '',
  )
  const [editing, setEditing] = useState<'ht' | 'ttc' | null>(null)

  // Resynchronise si la valeur change ailleurs (produit choisi dans le
  // catalogue, changement de taux de TVA, réinitialisation du formulaire).
  useEffect(() => {
    if (editing) return
    setHtText(valueHt ? String(round2(valueHt)) : '')
    setTtcText(valueHt ? String(round2(valueHt * factor)) : '')
  }, [valueHt, factor, editing])

  const handleHt = (raw: string) => {
    setHtText(raw)
    const ht = parseFloat(raw.replace(',', '.'))
    if (!Number.isFinite(ht)) {
      setTtcText('')
      onChangeHt(0)
      return
    }
    setTtcText(String(round2(ht * factor)))
    onChangeHt(ht)
  }

  const handleTtc = (raw: string) => {
    setTtcText(raw)
    const ttc = parseFloat(raw.replace(',', '.'))
    if (!Number.isFinite(ttc)) {
      setHtText('')
      onChangeHt(0)
      return
    }
    const ht = round2(ttc / factor)
    setHtText(String(ht))
    onChangeHt(ht)
  }

  // Sans TVA, HT = TTC : un seul champ suffit.
  if (tvaRate === 0) {
    return (
      <div style={{ flex: 1 }}>
        <label style={labelStyle}>Prix (€)</label>
        <input
          type="text"
          inputMode="decimal"
          value={htText}
          onFocus={() => setEditing('ht')}
          onBlur={() => setEditing(null)}
          onChange={(e) => handleHt(e.target.value)}
          style={inputStyle}
          placeholder={placeholder}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10, flex: 1 }}>
      <div style={{ flex: 1 }}>
        <label style={labelStyle}>{labelHt}</label>
        <input
          type="text"
          inputMode="decimal"
          value={htText}
          onFocus={() => setEditing('ht')}
          onBlur={() => setEditing(null)}
          onChange={(e) => handleHt(e.target.value)}
          style={inputStyle}
          placeholder={placeholder}
        />
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ ...labelStyle, color: '#8a7340' }}>{labelTtc}</label>
        <input
          type="text"
          inputMode="decimal"
          value={ttcText}
          onFocus={() => setEditing('ttc')}
          onBlur={() => setEditing(null)}
          onChange={(e) => handleTtc(e.target.value)}
          style={{ ...inputStyle, borderColor: '#e0d5b8', background: '#fdfaf3' }}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
