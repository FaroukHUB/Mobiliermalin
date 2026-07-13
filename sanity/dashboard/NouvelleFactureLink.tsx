/**
 * Raccourci Sanity Studio vers /admin/nouvelle-facture — formulaire
 * simplifié pour créer une facture à envoyer directement au client
 * (paiement immédiat, pas d'étape "accepter").
 */

import { Card, Stack, Text, Heading, Flex, Box, Button } from '@sanity/ui'

const ADMIN_URL = '/admin/nouvelle-facture'

export function NouvelleFactureLink() {
  return (
    <Box padding={4} style={{ maxWidth: 720, margin: '0 auto' }}>
      <Stack space={4}>
        <Box>
          <Heading size={3}>🧾 Nouvelle facture</Heading>
          <Text size={1} muted style={{ marginTop: 8 }}>
            Formulaire simplifié pour créer une facture quand le client est
            déjà d&apos;accord (pas de devis préalable nécessaire). Le client
            reçoit un email avec un bouton &quot;Payer maintenant&quot; qui le
            redirige vers Stripe. Facture PDF officielle envoyée
            automatiquement après paiement.
          </Text>
        </Box>

        <Card padding={4} radius={2} shadow={1} tone="primary">
          <Stack space={4}>
            <Box>
              <Text size={2} weight="medium">
                💳 Créer une facture avec lien de paiement
              </Text>
              <Text size={1} muted style={{ marginTop: 6 }}>
                Client + description + montant TTC → email envoyé, prêt à
                encaisser. Ouvre dans un nouvel onglet.
              </Text>
            </Box>
            <Flex>
              <Button
                as="a"
                href={ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                text="🚀 Ouvrir le formulaire"
                tone="primary"
                mode="default"
                padding={4}
                fontSize={2}
              />
            </Flex>
          </Stack>
        </Card>

        <Card padding={4} radius={2} tone="transparent" border>
          <Stack space={3}>
            <Text size={1} weight="medium">
              💡 Quand utiliser une facture (plutôt qu&apos;un devis)
            </Text>
            <Stack space={2}>
              <Text size={1} muted>
                • Client au téléphone qui te dit &quot;envoie-moi le lien pour
                200 €&quot; — pas de devis formel à valider
              </Text>
              <Text size={1} muted>
                • Post-service : le mobilier a déjà été livré, tu factures
              </Text>
              <Text size={1} muted>
                • Client fidèle qui commande régulièrement, pas besoin de
                paperasse préalable
              </Text>
              <Text size={1} muted>
                • Vente rapide en showroom sans terminal CB physique
              </Text>
            </Stack>
          </Stack>
        </Card>

        <Card padding={3} tone="transparent">
          <Text size={0} muted>
            💾 Bookmark : <code>{ADMIN_URL}</code>
          </Text>
        </Card>
      </Stack>
    </Box>
  )
}
