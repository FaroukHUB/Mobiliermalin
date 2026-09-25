import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Box, Flex, Stack, Text, TextInput } from '@sanity/ui'
import { set, unset, useFormValue, type NumberInputProps } from 'sanity'

/**
 * Champ prix HT doublé d'une case TTC.
 *
 * Nos tarifs se pensent en TTC (« la livraison, c'est 129 € »), mais le
 * devis stocke du HT. Sans cette case, taper 129 dans un champ HT fait
 * payer 154,80 € au client sans que rien ne le signale.
 *
 * Seul le HT est enregistré. La case TTC est un convertisseur : on y
 * saisit le prix annoncé au client, le HT au-dessus se remplit tout
 * seul, et inversement le TTC se recalcule dès que le HT change. Les
 * deux ne peuvent donc jamais se contredire.
 *
 * Le taux vient du devis lui-même (champ `tvaRate`), 20 % par défaut,
 * ce qui couvre aussi les devis sans TVA : à 0 %, HT et TTC sont égaux.
 */

const round2 = (n: number) => Math.round(n * 100) / 100

function formatFr(n: number): string {
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Accepte « 129 », « 129,50 », « 129.50 », « 129,50 € ». */
function parseFr(raw: string): number | null {
  const cleaned = raw.replace(/[\s€]/g, '').replace(',', '.')
  if (cleaned === '') return null
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function HtTtcNumberInput(props: NumberInputProps) {
  const { value, onChange } = props
  const tvaRate = (useFormValue(['tvaRate']) as number | undefined) ?? 20
  const factor = 1 + tvaRate / 100

  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(false)

  // Tant qu'on ne tape pas dans la case TTC, elle suit le HT.
  useEffect(() => {
    if (editing) return
    setDraft(typeof value === 'number' ? formatFr(round2(value * factor)) : '')
  }, [value, factor, editing])

  const handleTtc = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.currentTarget.value
      setDraft(raw)
      const ttc = parseFr(raw)
      onChange(ttc === null ? unset() : set(round2(ttc / factor)))
    },
    [factor, onChange],
  )

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      <Flex align="center" gap={3}>
        <Box style={{ width: 150 }}>
          <TextInput
            value={draft}
            onChange={handleTtc}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            placeholder="0,00"
            inputMode="decimal"
            aria-label="Prix TTC"
          />
        </Box>
        <Text size={1} muted>
          € TTC (TVA {tvaRate} %). Saisissez ici le prix annoncé au client, le
          prix HT au-dessus se remplit tout seul.
        </Text>
      </Flex>
    </Stack>
  )
}
