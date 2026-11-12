#!/usr/bin/env bash
# set-domain.sh - Cambia el dominio del sitio en sitemap, robots, security.txt y textos legales.
#
# Uso:  bash archivos-desarrollo/scripts/set-domain.sh midominio.com
#
# Reemplaza:
#   https://formula1fansglobal.github.io/web/   ->  https://midominio.com/   (también sirve con tu-nombre.pages.dev)
set -euo pipefail

if [ $# -ne 1 ] || ! [[ "$1" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$ ]]; then
  echo "Uso: $0 midominio.com   (solo minúsculas, sin https:// ni barras)" >&2
  exit 1
fi
DOM="$1"
cd "$(dirname "$0")/../.."

FILES=$(grep -rlE "formula1fansglobal\.github\.io/web" \
  --include=*.html --include=*.xml --include=*.txt --include=*.md --exclude-dir=.git --exclude-dir=node_modules . || true)

for f in $FILES; do
  sed -i \
    -e "s#https://formula1fansglobal\.github\.io/web/#https://${DOM}/#g" \
    "$f"
  echo "actualizado: $f"
done
echo "Listo. Revisa con: git diff --stat"
