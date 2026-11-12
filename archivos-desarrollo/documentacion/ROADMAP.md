# Rumbo del sitio: estado y siguientes pasos

Actualizado: 12 de noviembre de 2026.

## Visión

Centro de información **independiente** de la Fórmula 1 en español: datos reales y útiles, rápido,
accesible, 100 % legal (sin retransmitir ni alojar señal de F1).

## Hecho

| Fase | Resultado |
|---|---|
| 1. Legal y seguridad | Sin stream pirata, sin API key ni IP en el repo, XSS corregidos, términos y aviso de derechos. |
| 2. Sistema de diseño | `css/tokens.css` (variables + tema claro/oscuro), `base.css`, `components.css`. Menú responsive con hamburguesa. |
| 3. Home | Próxima sesión con cuenta regresiva en hora local, clasificación de pilotos/constructores, noticias, accesos, línea del tiempo accesible. Sin imágenes ni video de terceros. |
| 4. Sesiones (`en-vivo.html`) | Horario completo en hora local con estados, resultados de la última carrera, guía de sesiones y enlaces oficiales. |
| 5. Videos | Galería de YouTube (youtube-nocookie, carga al hacer clic) alimentada por `data/videos.json`. `video_gp.html` muestra los videos de cada GP. |
| 6. Calendario | Datos reales de cualquier temporada desde 1950 vía API; los datos locales quedan como respaldo con aviso. |
| 8. Tienda | Rediseño con aviso de afiliación, filtros por categorías reales, enlaces `sponsored`, DOM seguro. Los datos siguen en `js/productos-*.js` (panel admin compatible). |
| 9. Temporadas | `temporadas.html` (índice por década), `calendario_temporada.html` (calendario + ganadores + clasificación final de cualquier año) y `carrera.html` (resultados, clasificación y videos por GP). |
| 10. PWA | `sw.js` (funciona sin conexión), manifest con accesos directos, botón «Agregar sesiones a mi calendario (.ics)», podio de la última carrera en la home. |
| 7. Calidad | `sitemap.xml` y `robots.txt` correctos, `404.html`, `lang`/`h1`/`main` en las páginas, sin desbordes en móvil. |

## Dependencias externas

| Servicio | Uso | Si falla |
|---|---|---|
| Jolpica F1 API (`api.jolpi.ca`) | Calendario, clasificación, resultados | Caché local 10 min → respaldo `data/proxima-sesion.json` → mensaje amable |
| NewsData.io vía Worker (`workers/noticias-proxy`) | Noticias | Sección oculta en home; mensaje en `/noticias` |
| YouTube (nocookie) | Videos | Solo se carga al hacer clic |
| Google Fonts | Tipografía Poppins | Cae a la fuente del sistema |

## Para el dueño del sitio (acciones manuales)

1. Rotar la API key de NewsData.io y desplegar el Worker (`workers/noticias-proxy/README.md`), luego poner la URL en `js/config.js`.
2. Agregar videos en `data/videos.json` (`COMO_AGREGAR_VIDEOS.md`).
3. Confirmar el origen/licencia de imágenes en `img/` y de `videos/*.mp4` (`POLITICA_DE_CONTENIDO.md`).
4. Revisar la tienda: las imágenes de productos y los enlaces de afiliados (programa y licencias).
5. `html/paginas/admin-productos.html` es una página pública con protección solo en el navegador: no debe contener secretos ni accesos reales. Muévela fuera del repo público o protégela con Cloudflare Access.
6. Unificar el correo de contacto (términos usan `contacto@formula1fansglobal.com`; el footer usa el alias de soporte).
7. Verificar el dominio real en `sitemap.xml`/`robots.txt` (hoy `formula1fansglobal.github.io/web/`).

## Mantenimiento del service worker

Cada vez que cambies archivos que ya están en `SHELL` de `sw.js` (o agregues páginas nuevas), sube `CACHE_VERSION`
(`f1fg-v1` → `f1fg-v2`) y agrega las rutas nuevas a la lista para que funcionen sin conexión.

## Ideas siguientes (por prioridad)

1. **Tienda**: rediseño con el sistema de diseño y revisión de licencias de imágenes.
2. ~~Temporadas / historial~~ (hecho: `temporadas.html`, `calendario_temporada.html`, `carrera.html`)
3. **Pilotos y equipos**: fichas con datos públicos de la API (sin fotos con derechos).
4. ~~PWA~~ hecha. Falta: notificaciones push de inicio de sesión (requiere un servicio externo).
5. **Idiomas**: inglés como segunda lengua.
6. **Analítica propia de privacidad**: eventos mínimos sin cookies.
7. **Pruebas automáticas**: pasar los scripts de verificación a un workflow de GitHub Actions.
