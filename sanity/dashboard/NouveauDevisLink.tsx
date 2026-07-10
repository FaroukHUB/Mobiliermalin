/**
 * Composant Sanity Studio qui affiche un raccourci vers la page
 * externe /admin/nouveau-devis (formulaire de création manuelle de
 * devis avec autocomplete produit + envoi email au client).
 *
 * Rendu dans la structure Sanity via S.component(NouveauDevisLink).
 * Ouvre la page dans un nouvel onglet.
 */

import { Card, Stack, Text, Heading, Flex, Box, Button } from '@sanity/ui'

const ADMIN_URL = '/admin/nouveau-devis'

export function NouveauDevisLink() {
  return (
    <Box padding={4} style={{ maxWidth: 720, margin: '0 auto' }}>
      <Stack space={4}>
        <Box>
          <Heading size={3}>📄 Créer un nouveau devis</Heading>
          <Text size={1} muted style={{ marginTop: 8 }}>
            Le formulaire de création de devis est une page dédiée (hors
            Studio) optimisée pour la vitesse de saisie et l&apos;usage sur
            mobile. Elle inclut l&apos;autocomplete produit depuis le catalogue,
            plusieurs lignes par devis, et l&apos;envoi automatique de l&apos;email
            au client avec lien de paiement.
          </Text>
        </Box>

        <Card padding={4} radius={2} shadow={1} tone="primary">
          <Stack space={4}>
            <Box>
              <Text size={2} weight="medium">
                ✨ Formulaire de création de devis
              </Text>
              <Text size={1} muted style={{ marginTop: 6 }}>
                Client, adresse, produits, options, envoi — tout en une passe.
                Ouvre dans un nouvel onglet.
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
              💡 Comment ça marche
            </Text>
            <Stack space={2}>
              <Text size={1} muted>
                1. Le formulaire te demande le secret admin (une seule fois par
                session navigateur).
              </Text>
              <Text size={1} muted>
                2. Tu remplis client + adresse + produits (autocomplete depuis
                le catalogue, ou ligne libre).
              </Text>
              <Text size={1} muted>
                3. Un clic sur &quot;Créer et envoyer&quot; → l&apos;email part
                au client avec lien de paiement.
              </Text>
              <Text size={1} muted>
                4. Le devis apparaît ensuite dans Sanity avec statut{' '}
                <strong>&quot;📤 Envoyé au client&quot;</strong>. Tu peux
                l&apos;ouvrir depuis la liste ci-contre.
              </Text>
            </Stack>
          </Stack>
        </Card>

        <Card padding={3} tone="transparent">
          <Text size={0} muted>
            💾 Astuce : bookmark cette adresse dans ton navigateur pour la
            retrouver rapidement — <code>{ADMIN_URL}</code>
          </Text>
        </Card>
      </Stack>
    </Box>
  )
}
