# Publicar el sitio gratis en Cloudflare Pages (`tu-nombre.pages.dev`)

Costo total: **$0**. No hace falta dominio propio. Tiempo: ~15 minutos.

> Estos pasos se hacen en TU cuenta de Cloudflare y de GitHub (requieren tu sesión). El repo ya está preparado:
> `_headers` (seguridad), `_redirects`, `functions/api/noticias.js` (noticias con clave secreta) y `archivos-desarrollo/scripts/build.sh`.

---

## 1. Elige el nombre (importante, no se puede cambiar después)

El nombre del proyecto será tu dirección: `https://NOMBRE.pages.dev`. Si quieres otro nombre después, hay que crear un proyecto nuevo.

- **No uses "f1" ni "formula1"** (marcas registradas; un nombre así puede darte problemas).
- Corto, fácil de decir y en minúsculas. Ideas (disponibilidad no verificada): `paddock-fans`, `pitwall-latam`, `box-box-fans`, `vuelta-rapida`, `parrilla-mx`.
- Si está ocupado, Cloudflare te lo dirá: agrega una palabra o un número.

## 2. Conectar GitHub y crear el proyecto

1. <https://dash.cloudflare.com> → **Workers y Pages** → **Crear** → pestaña **Pages** → **Conectar con Git**.
2. Autoriza a Cloudflare en GitHub y elige el repositorio `Formula1FansGlobal/web`.
   (Si es de una organización, un dueño debe aprobar la app de Cloudflare Pages.)
3. **Nombre del proyecto:** el que elegiste.
4. **Rama de producción:** `claude/nice-maxwell-4nrfm7` (la que tiene todos los cambios).
   *Más adelante puedes fusionarla a `main` desde GitHub con un pull request y cambiar la rama de producción en Pages → Configuración → Compilaciones.*
5. **Configuración de compilación:**
   - Framework preset: **Ninguno**
   - Comando de compilación: `bash archivos-desarrollo/scripts/build.sh`
   - Directorio de salida: `dist`
6. **Guardar e implementar**. En ~1 minuto tendrás `https://NOMBRE.pages.dev`.

> `build.sh` publica solo lo necesario. Deja fuera tus notas internas, los dos videos pesados (Pages rechaza archivos de más de 25 MB)
> y el panel `admin-productos.html`, que no tiene autenticación real.

## 3. Activar las noticias de forma segura

1. **Rota la API key de NewsData.io** (la anterior estuvo pública en el repositorio): newsdata.io → API Key → generar nueva y revocar la vieja.
2. En Cloudflare: tu proyecto → **Configuración** → **Variables y secretos** → **Agregar**:
   - Nombre: `NEWSDATA_API_KEY`
   - Valor: tu nueva clave → **Tipo: Secreto** (se guarda cifrada y nunca se ve en el código)
   - Entorno: **Producción** (y Vista previa si quieres)
3. **Implementaciones → Reintentar** la última para que tome la variable.
4. Abre `https://NOMBRE.pages.dev/html/paginas/noticias.html`: deben aparecer las noticias.

Revisa también que tu plan de NewsData permita uso comercial (el sitio tiene tienda con afiliados).

## 4. Qué protecciones tendrás (y cuáles no)

**Incluidas gratis y automáticas en `*.pages.dev`:**
- HTTPS con certificado automático, TLS moderno y HTTP/3.
- Protección DDoS de Cloudflare y red CDN global.
- Cabeceras de seguridad de `_headers`: HSTS, anti-iframe (`X-Frame-Options` y `frame-ancestors`), `nosniff`, política de referrer y de permisos.
- Clave de API como secreto; la función cachea 15 min, lo que protege tu cuota de abuso.

**Requieren un dominio propio en Cloudflare (no disponibles en `pages.dev`):**
WAF con reglas personalizadas, *Bot Fight Mode*, reglas de límite de velocidad, Email Routing y DNSSEC.
Si algún día registras un dominio, esas opciones se activan en minutos (Cloudflare lo vende al costo, ~US$10/año).

**Recomendado, también gratis:**
- Pages → **Configuración → Acceso a implementaciones de vista previa**: protégelas con Cloudflare Access para que solo tú veas las ramas de prueba.
- Analítica → **Web Analytics** (sin cookies): actívala en el proyecto.

## 5. Poner la nueva dirección en el código

En la raíz del repo, con tu nombre real:

```bash
bash archivos-desarrollo/scripts/set-domain.sh NOMBRE.pages.dev
git diff --stat
```

Actualiza `sitemap.xml`, `robots.txt`, `security.txt` y los textos legales. Luego sube `CACHE_VERSION` en `sw.js`
(`f1fg-v1` → `f1fg-v2`), haz commit y push: Pages se redespliega solo.

Después:
- Pon la nueva dirección en tu bio de TikTok y YouTube.
- Da de alta el sitio en **Google Search Console** y envía `https://NOMBRE.pages.dev/sitemap.xml`.
- En GitHub → Settings → Pages: **desactiva GitHub Pages** para no tener dos copias del sitio (duplicados dañan el posicionamiento).

## 6. Seguridad de GitHub (la llave de tu sitio)

- Activa **2FA** en tu cuenta de GitHub y de Cloudflare.
- Repo → Settings → **Code security** → activa **Secret scanning** y **Push protection** (habría evitado el filtrado de la clave anterior) y **Dependabot alerts**.
- Protege `main`: Settings → Branches → requerir pull request.
- Nunca pongas claves, tokens ni IPs en el repo.

## 7. Verificación

```bash
# Debe mostrar las cabeceras de seguridad
curl -sI https://NOMBRE.pages.dev | grep -iE "strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy"

# La función de noticias debe responder JSON
curl -s https://NOMBRE.pages.dev/api/noticias | head -c 300
```

- Cabeceras: <https://securityheaders.com> (meta: A o A+).
- TLS: <https://www.ssllabs.com/ssltest/>.
- Prueba que el sitio abra sin conexión y se pueda instalar (PWA).

---

## Más adelante: dominio propio

Un dominio propio y duradero siempre cuesta (≈ US$10/año por un `.com` en Cloudflare Registrar, a precio de costo).
No hay dominios gratuitos confiables a largo plazo (los `.tk`, `.ml`, etc. desaparecieron). Evita "f1" y "formula1" en el nombre.
Cuando decidas comprarlo: Registro de dominios → registrar → en tu proyecto de Pages → **Dominios personalizados**, y vuelve a correr `set-domain.sh`.
