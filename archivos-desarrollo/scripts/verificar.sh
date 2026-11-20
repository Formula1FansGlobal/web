#!/usr/bin/env bash
# verificar.sh - Revisiones automáticas del sitio (se ejecuta también en GitHub Actions).
#
# Uso:  bash archivos-desarrollo/scripts/verificar.sh
#
# Revisa: JSON válidos, enlaces y recursos locales, enlaces a YouTube, secretos, inyección de HTML (innerHTML),
# target="_blank" sin noopener, CSP en cada página, archivos del service worker y peso de los archivos publicados.
# Termina con código 1 si algo falla (así el workflow marca el error).
set -u
cd "$(dirname "$0")/../.." || exit 1

ERRORES=0
fallo() { echo "  ✗ $1"; ERRORES=$((ERRORES + 1)); }
ok() { echo "  ✓ $1"; }
titulo() { echo; echo "== $1"; }

# Archivos del sitio publicado (sin documentación ni herramientas locales)
HTMLS=$(find . -name '*.html' -not -path './.git/*' -not -path './archivos-desarrollo/*' -not -path './node_modules/*' | sort)
JSS=$(find js -name "*.js" -not -path "js/vendor/*" | sort)

titulo "1. JSON válidos"
validar_json() {
  if command -v jq >/dev/null 2>&1 && jq -n 1 >/dev/null 2>&1; then jq empty "$1" >/dev/null 2>&1
  elif python3 -c "import json" >/dev/null 2>&1; then python3 -c "import json,sys; json.load(open(sys.argv[1], encoding='utf-8'))" "$1" >/dev/null 2>&1
  elif node -e "1" >/dev/null 2>&1; then node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$1" >/dev/null 2>&1
  elif command -v powershell.exe >/dev/null 2>&1; then powershell.exe -NoProfile -Command "try { Get-Content -Raw -Encoding UTF8 -LiteralPath '$1' | ConvertFrom-Json | Out-Null; exit 0 } catch { exit 1 }" >/dev/null 2>&1
  else return 2; fi
}
for f in data/*.json manifest.webmanifest; do
  validar_json "$f"; r=$?
  if [ $r -eq 0 ]; then ok "$f"; elif [ $r -eq 2 ]; then echo "  - $f (sin jq/python/node para validar)"; else fallo "$f no es JSON válido"; fi
done

titulo "2. Enlaces y recursos locales (href, src, data-path)"
for f in $HTMLS; do
  dir=$(dirname "$f")
  grep -oE '(href|src|data-path)="[^"]+"' "$f" | sed -E 's/^[a-z-]+="//; s/"$//' | while read -r ref; do
    case "$ref" in
      http*|mailto:*|tel:*|\#*|data:*|javascript:*|"") continue ;;
    esac
    ruta="${ref%%[?#]*}"
    [ -z "$ruta" ] && continue
    # data-path y los fragmentos de menu/footer se resuelven desde la raíz
    if [ -e "$dir/$ruta" ] || [ -e "$ruta" ]; then continue; fi
    echo "$f -> $ref"
  done
done > /tmp/f1_enlaces.txt
if [ -s /tmp/f1_enlaces.txt ]; then while read -r l; do fallo "enlace roto: $l"; done < /tmp/f1_enlaces.txt; else ok "todos los enlaces locales existen"; fi

titulo "3. Enlaces a YouTube (solo canales permitidos)"
PERMITIDOS='youtube\.com/@(F1FansC11MX|Formula1)([^A-Za-z0-9_]|$)'
MALOS=$(grep -rnoE 'youtube\.com/(@|channel/|c/|user/)[A-Za-z0-9_-]+' $HTMLS $JSS 2>/dev/null | grep -vE "$PERMITIDOS" || true)
if [ -n "$MALOS" ]; then echo "$MALOS" | while read -r l; do fallo "canal de YouTube no permitido: $l"; done; ERRORES=$((ERRORES + 1)); else ok "solo @F1FansC11MX y @Formula1"; fi

titulo "4. Secretos en el código"
PATRONES='pub_[a-z0-9]{24,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{32,}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----|[?&]api_?key=[A-Za-z0-9]{16,}|xox[baprs]-[A-Za-z0-9-]{10,}'
SEC=$(grep -rnIE "$PATRONES" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=vendor --exclude=verificar.sh --exclude=copilot-instructions.md 2>/dev/null | cut -c1-120 || true)
if [ -n "$SEC" ]; then echo "$SEC" | while read -r l; do fallo "posible secreto: $l"; done; ERRORES=$((ERRORES + 1)); else ok "sin claves ni tokens"; fi

titulo "5. Inserción segura de HTML"
# innerHTML solo se permite en estos archivos (leen HTML propio del sitio, nunca datos externos)
PERMITIDO_INNER='js/menu.js|js/theme-toggle.js|js/chat.js|js/footer.js'
INN=$(grep -nE '\.innerHTML\s*=|insertAdjacentHTML|document\.write\(' $JSS | grep -vE "^($PERMITIDO_INNER):" | grep -v '^\S*:[0-9]*:\s*//' | grep -vE '^\S+:[0-9]+:\s*(//|\*)' || true)
INN=$(echo "$INN" | grep -vE '//.*(innerHTML|insertAdjacentHTML)' || true)
if [ -n "$INN" ]; then echo "$INN" | while read -r l; do fallo "innerHTML/insertAdjacentHTML: $l"; done; ERRORES=$((ERRORES + 1)); else ok "ningún script inserta HTML dinámico fuera de la lista permitida"; fi

titulo "6. target=\"_blank\" con rel=\"noopener\""
for f in $HTMLS $JSS; do
  grep -noE '<a [^>]*target="_blank"[^>]*>' "$f" | grep -v 'noopener' | while read -r l; do echo "$f:$l"; done
done > /tmp/f1_blank.txt
if [ -s /tmp/f1_blank.txt ]; then while read -r l; do fallo "sin noopener: $l"; done < /tmp/f1_blank.txt; else ok "todos los enlaces externos llevan noopener"; fi

titulo "7. Cada página tiene CSP, idioma, título y h1"
for f in $HTMLS; do
  case "$f" in ./html/layout/*) continue ;; esac
  grep -q 'Content-Security-Policy' "$f" || fallo "$f sin Content-Security-Policy"
  grep -q '<html[^>]*lang=' "$f" || fallo "$f sin atributo lang"
  grep -q '<title>' "$f" || fallo "$f sin <title>"
  grep -qE '<h1[ >]' "$f" || fallo "$f sin <h1>"
done
ok "revisión de páginas terminada"

titulo "8. Service worker: los archivos del SHELL existen"
SW=$(sed -n '/const SHELL = \[/,/^\];/p' sw.js | grep -oE "'[^']+'" | tr -d "'")
for r in $SW; do
  [ "$r" = "./" ] && continue
  [ -e "$r" ] || fallo "sw.js lista un archivo que no existe: $r"
done
ok "revisión del SHELL terminada"

titulo "9. Peso de los archivos publicados (límite de Cloudflare: 25 MiB)"
GRANDES=$(find css js html img data -type f -size +25M 2>/dev/null || true)
if [ -n "$GRANDES" ]; then echo "$GRANDES" | while read -r l; do fallo "archivo mayor a 25 MiB: $l"; done; ERRORES=$((ERRORES + 1)); else ok "ningún archivo publicado supera 25 MiB"; fi

echo
if [ $ERRORES -eq 0 ]; then echo "TODO BIEN: sin errores."; exit 0; else echo "HAY ERRORES: revisa los ✗ de arriba."; exit 1; fi
