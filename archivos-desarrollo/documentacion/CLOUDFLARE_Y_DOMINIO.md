# Cloudflare, dominio y seguridad: guía paso a paso

> Estado: el repo ya está **preparado** (`_headers`, `_redirects`, `build.sh`, `set-domain.sh`).
> Los pasos de abajo se hacen en tu cuenta de Cloudflare: nadie más (ni yo) puede hacerlos por ti,
> porque requieren tu login y, si compras dominio, tu pago.

---

## 1. Dominio: qué opciones reales hay

**Dato honesto:** un dominio propio, con buen nombre y que dure muchos años, **no existe gratis**.
Los "dominios gratis" tipo `.tk`, `.ml`, `.ga` (Freenom) desaparecieron o se recuperan sin aviso: pierdes el sitio.
Desconfía de cualquier oferta de ".com gratis".

| Opción | Costo | ¿Es tuyo a largo plazo? | Comentario |
|---|---|---|---|
| **`tu-nombre.pages.dev`** (Cloudflare Pages) | Gratis | Mientras exista tu proyecto | HTTPS y CDN incluidos. Ideal para **empezar hoy**. |
| **`tu-nombre.eu.org`** | Gratis | Sí, mientras lo renueves/uses | Se solicita en <https://nic.eu.org> (aprobación manual, puede tardar semanas). Es un subdominio, no un dominio completo. |
| **`.com` en Cloudflare Registrar** ⭐ | ≈ US$10–11 al año (precio al costo, confirma en pantalla) | **Sí** (puedes registrarlo hasta 10 años) | Sin sobreprecio, privacidad WHOIS gratis, renovación automática, DNS y SSL en el mismo lugar. **Mi recomendación.** |
| `.xyz`, `.site`, etc. | ~US$1–3 el primer año | Sí, pero la renovación sube mucho | Cuidado con el precio de renovación. |

**Recomendación:** publica ya en `*.pages.dev` (gratis) y, cuando quieras la marca, registra un `.com` en Cloudflare (~US$10/año = menos de US$1 al mes).

### Cómo elegir el nombre (importante)

- **No uses "f1" ni "formula1" en el dominio.** Son marcas registradas; un dominio así puede perderse por una disputa (UDRP) o un aviso legal.
  Usa un nombre propio, corto y fácil de decir.
- Ideas (disponibilidad **no verificada**, compruébalo en Cloudflare → Registro de dominios):
  `paddockfans`, `boxboxlatam`, `pitwallfans`, `vueltarapida`, `parrillamx`, `rebufo`, `pitlanelatam`, `curvafans`.
- Prefiere `.com`: es el más confiable y el más fácil de recordar.
- Registra también el nombre de tus redes (TikTok/YouTube) igual o parecido.

> Los términos y la política de privacidad usan `contacto@formula1fansglobal.com`. Si no eres dueño de ese dominio, cámbialo
> con el script del paso 6 cuando tengas el tuyo.

---

## 2. Crear la cuenta y publicar el sitio en Cloudflare Pages (gratis)

Cloudflare Pages permite **cabeceras de seguridad** (cosa que GitHub Pages no permite). Por eso conviene migrar.

1. Crea una cuenta en <https://dash.cloudflare.com/sign-up> y **activa la verificación en dos pasos** (Mi perfil → Autenticación).
2. **Workers y Pages → Crear → Pages → Conectar con Git** → elige `Formula1FansGlobal/web`.
3. Configuración de compilación:
   - **Rama de producción:** la que uses como principal (hoy los cambios están en `claude/nice-maxwell-4nrfm7`; fusiónala a `main` primero).
   - **Comando de compilación:** `bash archivos-desarrollo/scripts/build.sh`
   - **Directorio de salida:** `dist`
4. Guarda y despliega. Te dará una URL `https://TU-PROYECTO.pages.dev`. Ya está en línea con HTTPS.

> El script `build.sh` publica solo lo necesario: deja fuera tus notas internas, los videos pesados (Pages rechaza archivos de más de 25 MB)
> y el panel `admin-productos.html` (no tiene autenticación real y no debe estar público).

---

## 3. Conectar tu dominio (cuando lo tengas)

**Si lo compras en Cloudflare:** Registro de dominios → Registrar dominios → busca, compra y activa **renovación automática**.
Se añade solo a tu cuenta con su DNS.

**Si ya lo tienes en otro registrador:** Cloudflare → *Agregar un sitio* → pon tu dominio → plan **Free** → copia los 2 *nameservers*
que te da y pégalos en tu registrador. Espera a que diga "Activo".

Luego, en el proyecto de Pages: **Dominios personalizados → Configurar** → añade `tudominio.com` y `www.tudominio.com`.
Cloudflare crea los registros DNS por ti (CNAME hacia `TU-PROYECTO.pages.dev`, con proxy naranja ☁️).

**Redirección www → raíz:** Reglas → Reglas de redirección → "Redirect from WWW to root" (plantilla) y *Redirigir `*.pages.dev` → tu dominio* si quieres evitar contenido duplicado.

---

## 4. Seguridad en Cloudflare (todo disponible en el plan Free)

En el panel de tu dominio:

**SSL/TLS**
- Modo de cifrado: **Completo (estricto)**.
- Edge Certificates: **Always Use HTTPS = Activado**, **Versión mínima de TLS = 1.2**, **Automatic HTTPS Rewrites = Activado**.
- **HSTS**: ya se envía desde `_headers` (`max-age` de 1 año). No actives *preload* hasta estar seguro de que todo funciona.
- **DNSSEC: Activar** (DNS → Configuración) y, si el registrador es otro, pega el registro DS que te muestra.

**Seguridad**
- Seguridad → WAF → **Reglas administradas: activadas** (Cloudflare Managed Ruleset).
- Seguridad → Bots → **Bot Fight Mode: Activado**.
- Seguridad → Configuración → **Nivel de seguridad: Medio**, **Browser Integrity Check: Activado**.
- WAF → **Reglas de límite de velocidad** (1 gratis): protege `/api/noticias`, por ejemplo 30 peticiones por 10 s por IP → Bloquear 10 s.
- Si sufres un ataque: Seguridad → *Estoy bajo ataque* (temporal).

**Correo con tu dominio (gratis)**
- Correo → **Email Routing** → crea `contacto@`, `soporte@` y `derechos@tudominio.com` que reenvíen a tu Gmail.
  Así dejas de exponer tu Gmail y los términos pueden usar `derechos@` para los avisos de retiro de contenido.
- DNS: activa SPF y DMARC que te propone Cloudflare para evitar suplantación.

**Analítica sin cookies:** Analítica y registros → Web Analytics → activa la del sitio (ya está citada en la política de privacidad).

---

## 5. Worker de noticias (clave de API segura)

Sigue `workers/noticias-proxy/README.md`. Con dominio propio en Cloudflare, descomenta `routes` en
`wrangler.toml` (`tudominio.com/api/noticias`) y pon `newsEndpoint: '/api/noticias'` en `js/config.js`.
**Rota antes la API key de NewsData** (la anterior estuvo pública en el repositorio).

---

## 6. Cambiar el dominio dentro del código

Cuando tengas el dominio, ejecuta (en la raíz del repo):

```bash
bash archivos-desarrollo/scripts/set-domain.sh tudominio.com
git diff --stat
```

Esto actualiza `sitemap.xml`, `robots.txt`, `security.txt` y los correos de los textos legales.
Después sube `CACHE_VERSION` en `sw.js` y haz commit.

Luego da de alta el sitio en **Google Search Console** y **Bing Webmaster Tools** y envía `https://tudominio.com/sitemap.xml`.

---

## 7. Seguridad de GitHub (el repo es la llave del sitio)

- Activa **2FA** en tu cuenta y en la organización.
- Repo → Settings → **Code security** → activa **Secret scanning** y **Push protection** (habría evitado el filtrado de la clave anterior), y **Dependabot alerts**.
- Settings → Branches → protege `main` (requerir pull request antes de fusionar).
- No guardes nunca claves, tokens ni IPs en el repo.

---

## 8. Verificación final

```bash
# Debe responder 200 y mostrar las cabeceras de seguridad
curl -sI https://tudominio.com | grep -iE "strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy"

# Debe redirigir a HTTPS
curl -sI http://tudominio.com | head -3
```

- Calificación de cabeceras: <https://securityheaders.com> (objetivo: A o A+).
- Calificación de TLS: <https://www.ssllabs.com/ssltest/> (objetivo: A o A+).
- Revisa que el sitio abra sin conexión y se pueda instalar (PWA).

---

## Resumen de costos

| Concepto | Costo |
|---|---|
| Cloudflare Pages, DNS, CDN, SSL, WAF básico, Bot Fight, Email Routing, Analytics | **Gratis** |
| Dominio `.com` (opcional, recomendado) | ≈ US$10–11 al año |
| Dominio `*.pages.dev` | Gratis |
