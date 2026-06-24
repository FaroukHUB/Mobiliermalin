#!/usr/bin/env bash
# Crawle mobiliermalin.com et liste toutes les URLs internes en 404.
# Usage : bash scripts/crawl-404.sh [URL_DE_BASE]
# Exemple : bash scripts/crawl-404.sh https://mobiliermalin.com
set -u

BASE="${1:-https://mobiliermalin.com}"
OUT_DIR="$(mktemp -d -t mm-crawl-XXXXXX)"
LOG="$OUT_DIR/wget.log"

echo "🕷️  Crawl de $BASE en cours… (cela peut prendre 2-5 min)"
echo "    Log : $LOG"
echo

# wget --spider : ne télécharge pas le contenu, suit juste les liens.
# -r récursif, -l 0 profondeur illimitée, -nd pas de dossiers,
# --reject-regex pour ignorer images/CSS/JS, -e robots=off pour ignorer robots.txt
wget --spider -r -l 0 -nd -nv \
     -e robots=off \
     -U "MobiliermaliLinkAudit/1.0" \
     --reject-regex='\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff2?|ttf|eot|mp4|webm|pdf)(\?|$)' \
     --domains=$(echo "$BASE" | sed -E 's#https?://([^/]+).*#\1#') \
     "$BASE" 2> "$LOG"

echo
echo "═══════════════════════════════════════════════════"
echo "📊 RÉSULTATS"
echo "═══════════════════════════════════════════════════"

# Extraction des 404
echo
echo "🔴 URLs en 404 :"
grep -E "^(http|ERROR 404)" "$LOG" \
  | awk '/ERROR 404/{print prev} {prev=$0}' \
  | grep -oE "https?://[^ ]+" \
  | sort -u \
  | tee "$OUT_DIR/404.txt"
COUNT_404=$(wc -l < "$OUT_DIR/404.txt" | tr -d ' ')

# Autres erreurs (500, etc.)
echo
echo "🟠 Autres erreurs HTTP (5xx, 403, etc.) :"
grep -oE "ERROR [0-9]{3}" "$LOG" | grep -v "ERROR 404" | sort | uniq -c

# Total URLs visitées
TOTAL=$(grep -cE "^[0-9]{4}-" "$LOG" || echo 0)

echo
echo "═══════════════════════════════════════════════════"
echo "Total URLs visitées : $TOTAL"
echo "URLs en 404         : $COUNT_404"
echo "Log complet         : $LOG"
echo "Liste 404           : $OUT_DIR/404.txt"
echo "═══════════════════════════════════════════════════"

if [ "$COUNT_404" -eq 0 ]; then
  echo "✅ Aucune 404 détectée sur le site live."
else
  echo "❌ $COUNT_404 URL(s) en 404 — à corriger."
fi
