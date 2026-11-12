// config.js - Configuración pública del sitio.
//
// IMPORTANTE: este archivo es público. NUNCA pongas aquí claves de API,
// tokens ni contraseñas. La clave de noticias vive como secreto en Cloudflare
// (variable NEWSDATA_API_KEY del proyecto de Pages). Ver
// archivos-desarrollo/documentacion/PUBLICAR_EN_CLOUDFLARE.md

window.SITE_CONFIG = Object.freeze({
    // Ruta de la Pages Function (functions/api/noticias.js). Misma URL del sitio, no requiere CSP extra.
    // Si despliegas el sitio sin Cloudflare Pages esta ruta no existe y la sección de noticias mostrará un aviso.
    newsEndpoint: '/api/noticias'
});
