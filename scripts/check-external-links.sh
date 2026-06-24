#!/usr/bin/env bash
# Vérifie le statut HTTP des liens externes référencés dans le site.
# Usage : bash scripts/check-external-links.sh
set -u

UA="Mozilla/5.0 (compatible; MobiliermaliLinkAudit/1.0)"

URLS=(
  # Réseaux sociaux
  "https://facebook.com/mobiliermalin"
  "https://instagram.com/mobiliermalin"
  "https://linkedin.com/company/mobilier-malin"
  "https://www.facebook.com/mobiliermalin"
  "https://www.instagram.com/mobiliermalin"
  "https://www.linkedin.com/company/mobilier-malin"
  # Légal / officiel
  "https://www.legifrance.gouv.fr"
  "https://www.economie.gouv.fr"
  "https://www.cnil.fr"
  "https://cm2c.net"
  "https://ec.europa.eu/consumers/odr"
  # Hébergeur
  "https://wordpress.com"
  # Guides cookies navigateurs
  "https://support.google.com/chrome/answer/95647"
  "https://support.mozilla.org/fr/kb/protection-renforcee-contre-pistage-firefox-ordinateur"
  "https://support.apple.com/fr-fr/guide/safari/sfri11471/mac"
  "https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
)

printf "\n%-4s  %s\n" "HTTP" "URL"
printf -- "----  ----------------------------------------------------------\n"

KO=0
for url in "${URLS[@]}"; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" -L --max-time 15 -A "$UA" "$url" 2>/dev/null || echo "ERR")
  case "$code" in
    2*|3*) icon="✅" ;;
    4*|5*) icon="❌"; KO=$((KO+1)) ;;
    *)     icon="⚠️ "; KO=$((KO+1)) ;;
  esac
  printf "%s %-4s  %s\n" "$icon" "$code" "$url"
done

echo
if [ "$KO" -eq 0 ]; then
  echo "✅ Tous les liens externes répondent correctement."
else
  echo "❌ $KO lien(s) en erreur — à corriger dans le code."
fi
