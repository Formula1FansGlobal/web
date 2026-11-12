# Política de contenido y derechos de autor

Reglas para publicar cualquier cosa en este sitio (y para quien desarrolle con o sin IA).
No sustituye la asesoría de un abogado.

## Regla principal

**No retransmitir, grabar, alojar ni enlazar a copias piratas de la señal de la F1**
(prácticas, clasificaciones, sprints, carreras, ruedas de prensa, onboards, etc.).
Eso incluye hacerlo gratis, "solo para amigos" o con suscripción de pago.

## Permitido

| Qué | Cómo |
|---|---|
| Ver sesiones | Enlazar a servicios y canales oficiales (F1 TV, canal oficial de F1 en YouTube, emisora local). |
| Videos de F1 | Solo **incrustar** (iframe) desde el canal oficial de su titular. Nunca descargar y re-subir. |
| Videos propios | Análisis, comentarios, gráficos y voz propios. Sin fragmentos de la señal oficial. |
| Datos | APIs con licencia que permitan tu uso (calendario, clasificación, tiempos). Citar la fuente. |
| Noticias | Titular + resumen corto + enlace a la fuente original (como hace `js/noticias.js`). |
| Imágenes | Propias, con licencia, o de bancos libres (Wikimedia Commons, Unsplash, Pexels) guardando la atribución. |

## No permitido

- Subir videos de sesiones/carreras a `videos/` o a cualquier hosting propio.
- Reproducir señales con HLS/RTMP/ngrok tomadas de una cuenta de F1 TV u otra emisora.
- Cobrar acceso a contenido de terceros (ver `costo de cobro por carrera transmision.txt`: ese plan **no debe ejecutarse**).
- Usar logotipos o fotografías oficiales de F1, equipos o pilotos sin licencia.
- Poner el nombre "Formula 1" / "F1" como si fuera una marca propia o dar a entender afiliación.
- Guardar claves de API, tokens o IPs personales en el repositorio.

## Antes de agregar una imagen o video, pregúntate

1. ¿Lo hice yo? → OK.
2. ¿Tengo licencia escrita o es de un banco libre con atribución? → OK, guarda la fuente.
3. ¿Es de F1, un equipo, un fotógrafo o un medio? → No lo subas; enlaza o incrusta.

## Si recibes un aviso de derechos

1. Retira el contenido señalado de inmediato (basta con quitar el archivo y la referencia).
2. Responde al remitente confirmando el retiro.
3. No lo vuelvas a publicar. Si crees que fue un error, consulta a un abogado antes de contestar.

El procedimiento público está en `html/paginas/terminos.html` (sección 3.4).

## Pendientes de confirmar por el dueño del sitio

- `videos/Presentacion-Pilotos-F1-2025.mp4`, `Intro F1TvPro.mp4`, `Outro F1TvPro.mp4`: ¿son 100 % de producción propia? Si incluyen imágenes de la señal o música sin licencia, sustitúyelos.
- Imágenes en `img/` (parrilla, pilotos, circuitos, línea del tiempo): documentar origen y licencia de cada una.
- Plan de NewsData.io: ¿permite uso comercial (tienda con afiliados)?
- Dominio y correo reales en los términos (hoy conviven `contacto@formula1fansglobal.com` y el alias de soporte de Gmail).
