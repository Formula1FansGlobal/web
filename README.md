# Formula 1 Fans Global (sitio estático)

Este repo contiene el sitio estático de F1 Fans Global (HTML/CSS/JS). Está listo para publicarse en GitHub Pages.

## Estructura
- `index.html`, `en-vivo.html`, `noticias.html`, `temporadas.html`, etc.
- `css/`, `js/`, `img/`, `videos/`
- `docs/` (material adicional)

## Ejecutar localmente (Windows)
```powershell
Push-Location .\web
python -m http.server 8080
# Abrir http://localhost:8080
Pop-Location
```

## Publicar en GitHub Pages
1. Verifica que el repositorio tenga la rama `main` y el remoto `origin` apuntando a GitHub.
2. Haz `git add -A`, `git commit -m "deploy"`, y `git push origin main`.
3. En GitHub → Settings → Pages:
   - Source: "Deploy from a branch"
   - Branch: `main` y carpeta `/root` (no `docs/`)
4. Guarda los cambios. La URL pública aparecerá en la sección de Pages.

## Notas de rendimiento
- Scripts locales con `defer` para evitar bloqueo de render.
- Imágenes con `loading="lazy"` (donde aplica) para reducir bytes iniciales.
- Videos con `playsinline` y `preload="metadata"`.
- Preconexión a Google Fonts (`preconnect`).

## Advertencias
- Si faltan imágenes referenciadas (por ejemplo `img/f1moderno.jpg`), actualiza las rutas o restaura los archivos para evitar errores 404 en producción.
- No expongas claves de API en el front; usa variables de entorno/servidor si es necesario.

## Tienda: configuración y uso

### Fuente de productos (Mercado Libre)
- Archivo: `js/tienda.js` → objeto `ML_CONFIG`.
- Define `SELLER_ID` (numérico) y el `SITE` correspondiente (por ejemplo `MLM` para México).
- Activa/desactiva la fuente de ML con el switch "Mercado Libre" en la UI.

```js
const ML_CONFIG = {
   ENABLED_BY_DEFAULT: false,
   SITE: 'MLM',   // Cambia al sitio de tu país
   SELLER_ID: 123456789
};
```

### Carrito y checkout
- Persistencia en `localStorage` (`f1_cart`).
- Botón de carrito en la barra de controles (muestra contador).
- Modal de carrito con cantidad por ítem, quitar y total.
- Checkout por WhatsApp: define opcionalmente tu número en `SHOP_CONFIG.WHATSAPP_PHONE`.

```js
const SHOP_CONFIG = {
   WHATSAPP_PHONE: '5215512345678' // o null para abrir sin número
};
```

### Skeletons de carga
- Al cargar productos desde ML, se muestran skeletons mientras responde la API.

### Probar localmente
- Inicia un servidor estático y abre `tienda.html`.
```powershell
Push-Location .\web
python -m http.server 8080
Pop-Location
```
