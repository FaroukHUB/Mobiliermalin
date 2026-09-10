import { useEffect, useMemo, useState } from 'react'
import { useClient } from 'sanity'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'
import {
  Box,
  Button,
  Card,
  Flex,
  Select,
  Stack,
  Text,
  TextArea,
  TextInput,
  useToast,
} from '@sanity/ui'
import { apiVersion } from '../env'
import {
  buildDeclineMessage,
  DECLINE_REASONS,
  type DeclineReason,
} from '../../src/lib/decline-templates'

/**
 * Action Studio « 🚫 Décliner et prévenir le client » sur un devis.
 *
 * Pour les demandes auxquelles on ne donne pas suite : modèle
 * indisponible, trop loin pour livrer, ou à orienter vers le confrère.
 * Le message se compose à partir d'un modèle, se relit, se corrige,
 * puis part par mail. Le devis passe en « Sans suite » avec le motif et
 * le texte envoyé, et son lien de paiement cesse de fonctionner.
 *
 * Les coordonnées du confrère viennent de Réglages du site → Confrère.
 */

type QuoteDoc = {
  numero?: string
  status?: string
  customer?: { name?: string; email?: string }
  shippingAddress?: { city?: string }
  lineItems?: Array<{ name?: string }>
  product?: { name?: string }
}

type Partner = { partnerName?: string; partnerPhone?: string; partnerCity?: string }

function DeclineDialog({
  quoteId,
  doc,
  onDone,
}: {
  quoteId: string
  doc: QuoteDoc
  onDone: () => void
}) {
  const client = useClient({ apiVersion })
  const toast = useToast()

  const customerName = doc.customer?.name || 'Madame, Monsieur'
  const city = doc.shippingAddress?.city
  const firstModel = doc.lineItems?.[0]?.name || doc.product?.name || ''

  const [reason, setReason] = useState<DeclineReason>('too-far')
  const [requestedModel, setRequestedModel] = useState(firstModel)
  const [proposed, setProposed] = useState('')
  const [partner, setPartner] = useState<Partner>({})
  const [message, setMessage] = useState('')
  const [touched, setTouched] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Coordonnées du confrère, une seule fois
  useEffect(() => {
    let cancelled = false
    client
      .fetch<Partner | null>(
        `*[_type == "siteSettings"][0]{ partnerName, partnerPhone, partnerCity }`,
      )
      .then((p) => {
        if (!cancelled && p) setPartner(p)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [client])

  const generated = useMemo(
    () =>
      buildDeclineMessage(reason, {
        customerName,
        city,
        requestedModel,
        proposedModels: proposed.split('\n'),
        partnerName: partner.partnerName,
        partnerPhone: partner.partnerPhone,
        partnerCity: partner.partnerCity,
      }),
    [reason, customerName, city, requestedModel, proposed, partner],
  )

  // Tant que le texte n'a pas été modifié à la main, il suit le modèle.
  useEffect(() => {
    if (!touched) setMessage(generated)
  }, [generated, touched])

  const partnerMissing = reason === 'partner' && !partner.partnerPhone

  const send = async () => {
    setError(null)
    if (!doc.customer?.email) {
      setError('Ce devis n\'a pas d\'adresse e-mail client.')
      return
    }
    if (message.trim().length < 20) {
      setError('Le message est vide.')
      return
    }

    let secret = window.localStorage.getItem('mm_devis_secret') || ''
    if (!secret) {
      const entered = window.prompt(
        'Clé d\'action devis (configurée dans Vercel sous DEVIS_ACTION_SECRET) :',
      )
      if (!entered) return
      secret = entered.trim()
      if (secret) window.localStorage.setItem('mm_devis_secret', secret)
    }

    setSending(true)
    try {
      const res = await fetch(`/api/devis/${encodeURIComponent(quoteId)}/decliner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-devis-secret': secret },
        body: JSON.stringify({ reason, message }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        warning?: string
      }
      if (!res.ok) {
        if (res.status === 401) window.localStorage.removeItem('mm_devis_secret')
        setError(data.error || `Erreur ${res.status}`)
        return
      }
      toast.push({
        status: data.warning ? 'warning' : 'success',
        title: data.warning ? 'Mail envoyé, statut à vérifier' : 'Client prévenu',
        description:
          data.warning || `Message envoyé à ${doc.customer.email}. Le devis passe en « Sans suite ».`,
        duration: 6000,
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Stack space={4}>
      <Text size={1} muted>
        Destinataire : <strong>{doc.customer?.name || '?'}</strong>{' '}
        {doc.customer?.email ? `· ${doc.customer.email}` : '· aucune adresse e-mail'}
      </Text>

      <Stack space={2}>
        <Text size={1} weight="semibold">
          Motif
        </Text>
        <Select
          fontSize={1}
          padding={3}
          value={reason}
          onChange={(e) => {
            setReason(e.currentTarget.value as DeclineReason)
            setTouched(false)
          }}
        >
          {DECLINE_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.title}
            </option>
          ))}
        </Select>
        <Text size={0} muted>
          {DECLINE_REASONS.find((r) => r.value === reason)?.hint}
        </Text>
      </Stack>

      {reason === 'no-model' ? (
        <>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Modèle demandé
            </Text>
            <TextInput
              fontSize={1}
              padding={3}
              value={requestedModel}
              onChange={(e) => {
                setRequestedModel(e.currentTarget.value)
                setTouched(false)
              }}
              placeholder="Ex : fauteuil Steelcase Leap V2"
            />
          </Stack>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Modèles à proposer, un par ligne
            </Text>
            <TextArea
              fontSize={1}
              padding={3}
              rows={3}
              value={proposed}
              onChange={(e) => {
                setProposed(e.currentTarget.value)
                setTouched(false)
              }}
              placeholder={'Ex : Steelcase Please, 190 € TTC\nHaworth Comforto 62, 220 € TTC'}
            />
          </Stack>
        </>
      ) : null}

      {reason === 'partner' ? (
        <Card padding={3} radius={2} tone={partnerMissing ? 'caution' : 'transparent'}>
          <Stack space={2}>
            <Text size={1} weight="semibold">
              Confrère
            </Text>
            {partnerMissing ? (
              <Text size={1}>
                Aucun téléphone renseigné. Remplis Réglages du site → 🤝 Confrère,
                puis rouvre cette fenêtre.
              </Text>
            ) : (
              <Text size={1}>
                {[partner.partnerName, partner.partnerCity, partner.partnerPhone]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            )}
          </Stack>
        </Card>
      ) : null}

      <Stack space={2}>
        <Flex justify="space-between" align="center">
          <Text size={1} weight="semibold">
            Message envoyé au client
          </Text>
          {touched ? (
            <Button
              mode="bleed"
              fontSize={0}
              padding={2}
              text="Revenir au modèle"
              onClick={() => setTouched(false)}
            />
          ) : null}
        </Flex>
        <TextArea
          fontSize={1}
          padding={3}
          rows={12}
          value={message}
          onChange={(e) => {
            setMessage(e.currentTarget.value)
            setTouched(true)
          }}
        />
        <Text size={0} muted>
          Relis avant d&apos;envoyer : c&apos;est ce texte, tel quel, que le client
          reçoit. Une ligne vide sépare les paragraphes.
        </Text>
      </Stack>

      {error ? (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>{error}</Text>
        </Card>
      ) : null}

      <Flex justify="flex-end" gap={2}>
        <Button mode="ghost" text="Annuler" onClick={onDone} disabled={sending} />
        <Button
          tone="critical"
          text={sending ? 'Envoi…' : '🚫 Décliner et envoyer'}
          disabled={sending || partnerMissing || !doc.customer?.email}
          onClick={send}
        />
      </Flex>
    </Stack>
  )
}

export const declineQuoteAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const [open, setOpen] = useState(false)

  if (props.type !== 'quote') return null

  const doc = (props.published || props.draft) as QuoteDoc | null
  const status = doc?.status
  const locked = status === 'accepted' || status === 'declined'

  return {
    label: '🚫 Décliner et prévenir le client',
    tone: 'critical',
    disabled: locked || !props.id,
    title:
      status === 'accepted'
        ? 'Ce devis est accepté et payé'
        : status === 'declined'
          ? 'Cette demande a déjà été déclinée'
          : 'Envoie un message au client et passe la demande en « Sans suite »',
    onHandle: () => setOpen(true),
    dialog: open && doc && props.id
      ? {
          type: 'dialog',
          width: 'medium',
          header: `Décliner ${doc.numero || 'cette demande'}`,
          onClose: () => {
            setOpen(false)
            props.onComplete?.()
          },
          content: (
            <Box padding={1}>
              <DeclineDialog
                quoteId={props.id}
                doc={doc}
                onDone={() => {
                  setOpen(false)
                  props.onComplete?.()
                }}
              />
            </Box>
          ),
        }
      : undefined,
  }
}
