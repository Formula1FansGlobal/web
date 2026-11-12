#!/usr/bin/env bash
# build.sh - Empaqueta SOLO lo que debe ser público en dist/ (para Cloudflare Pages).
#
# Excluye: notas y documentación interna (archivos-desarrollo), workers, .github, videos/ pesados
# (Cloudflare Pages limita cada archivo a 25 MB) y cualquier archivo de desarrollo.
#
# Uso local:   bash archivos-desarrollo/scripts/build.sh
# Cloudflare:  Build command = bash archivos-desarrollo/scripts/build.sh   |   Output directory = dist
set -euo pipefail

cd "$(dirname "$0")/../.."
rm -rf dist
mkdir -p dist

# Archivos de la raíz
for f in index.html 404.html sw.js manifest.webmanifest sitemap.xml robots.txt _headers _redirects; do
  [ -f "$f" ] && cp "$f" dist/
done

# Carpetas públicas
for d in css js html img data .well-known; do
  [ -d "$d" ] && cp -R "$d" dist/
done

# El panel admin es una herramienta LOCAL (sin autenticación real): no se publica
rm -f dist/html/paginas/admin-productos.html

# Seguridad: nada de archivos internos ni de sistema dentro de dist
find dist \( -name '.DS_Store' -o -name '*.md' -o -name '*.sh' -o -name '*.map' \) -type f -delete

# Aviso si algún archivo supera el límite de Cloudflare Pages (25 MiB)
BIG=$(find dist -type f -size +25M || true)
if [ -n "$BIG" ]; then
  echo "ERROR: archivos de más de 25 MiB (Cloudflare Pages no los acepta):" >&2
  echo "$BIG" >&2
  exit 1
fi

echo "dist/ listo: $(find dist -type f | wc -l) archivos, $(du -sh dist | cut -f1)"
