# Proxy de noticias (Cloudflare Worker)

Guarda la API key de NewsData.io en el servidor para que no quede expuesta en el
código público del sitio.

## Pasos

1. **Rota la clave anterior (obligatorio).** La clave vieja estuvo publicada en el
   repositorio (`js/noticias.js` y `js/script.js`) y sigue en el historial de git.
   Entra a <https://newsdata.io/> → *API Key* → genera una nueva y revoca la vieja.
2. Instala Wrangler y entra a tu cuenta de Cloudflare:
   ```bash
   cd workers/noticias-proxy
   npx wrangler login
   ```
3. Guarda la clave nueva como secreto (te la pedirá por la terminal, no se escribe en ningún archivo):
   ```bash
   npx wrangler secret put NEWSDATA_API_KEY
   ```
4. Publica el Worker:
   ```bash
   npx wrangler deploy
   ```
5. Conecta el sitio con el Worker en `js/config.js`:
   - Con ruta en tu dominio (`routes` en `wrangler.toml`): `newsEndpoint: '/api/noticias'`
   - Con workers.dev: `newsEndpoint: 'https://f1-noticias.TU-USUARIO.workers.dev'` y agrega esa URL a
     `connect-src` en el CSP de `html/paginas/noticias.html`.

## Qué hace

- Solo acepta `GET`.
- Cachea 15 minutos (menos consumo de cuota de NewsData.io).
- Devuelve únicamente `title`, `description`, `link`, `image_url`, `source_name`, `pubDate`.
- Descarta enlaces e imágenes que no sean `https`.

## Revisa los términos de NewsData.io

Los planes gratuitos suelen limitar el uso comercial. Como el sitio tiene tienda con
afiliados, confirma que tu plan lo permite. Si no, pasa a un plan de pago o cambia de
proveedor.
