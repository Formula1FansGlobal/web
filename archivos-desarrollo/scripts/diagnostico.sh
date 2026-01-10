#!/bin/bash
# Script de diagnóstico para Mejora 3

echo "🔍 DIAGNÓSTICO - Mejora 3: Interfaz & UX"
echo "========================================="
echo ""

# Verificar archivos creados
echo "✓ Verificando archivos creados..."
files=(
    "js/theme-toggle.js"
    "js/notifications.js"
    "js/breadcrumbs.js"
    "js/footer.js"
    "css/footer.css"
    "css/breadcrumbs.css"
    "css/notifications.css"
    "footer.html"
    "MEJORA_3_RESUMEN.md"
    "TESTING_MEJORA_3.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file existe"
    else
        echo "  ✗ FALTA: $file"
    fi
done

echo ""
echo "✓ Verificando actualizaciones a HTML..."

html_files=(
    "index.html"
    "en-vivo.html"
    "noticias.html"
    "temporadas.html"
    "calendario_temporada.html"
    "video_gp.html"
    "tienda.html"
)

for file in "${html_files[@]}"; do
    if grep -q "theme-toggle.js" "$file" && \
       grep -q "breadcrumbs.js" "$file" && \
       grep -q "footer.js" "$file" && \
       grep -q "notifications.css" "$file"; then
        echo "  ✓ $file actualizado correctamente"
    else
        echo "  ✗ $file NO está completamente actualizado"
    fi
done

echo ""
echo "✓ Verificando menu.html..."
if grep -q "Calendario\|Temporadas" menu.html; then
    echo "  ✓ menu.html tiene navegación completa"
else
    echo "  ✗ menu.html necesita actualización"
fi

echo ""
echo "✓ Verificando CSS..."
if grep -q "data-theme" css/menu.css; then
    echo "  ✓ menu.css tiene soporte para temas"
else
    echo "  ✗ menu.css falta soporte para temas"
fi

echo ""
echo "========================================="
echo "✓ DIAGNÓSTICO COMPLETADO"
echo ""
echo "Próximos pasos:"
echo "1. Abre http://localhost:8080 en navegador"
echo "2. Verifica que aparezca el botón ☀️ en menú"
echo "3. Prueba cambiar tema (dark/light)"
echo "4. Scroll al footer y prueba newsletter"
echo "5. Verifica breadcrumbs en cada página"
echo "6. Prueba notificaciones (éxito, error, info)"
echo ""
