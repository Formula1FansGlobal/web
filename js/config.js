// config.js - Configuración pública del sitio.
//
// IMPORTANTE: este archivo es público. NUNCA pongas aquí claves de API,
// tokens ni contraseñas. Las claves viven en el servidor (ver
// workers/noticias-proxy/README.md).

window.SITE_CONFIG = Object.freeze({
    // URL del proxy de noticias (Cloudflare Worker).
    //   - Misma web con ruta de Worker:  '/api/noticias'
    //   - Subdominio workers.dev:         'https://f1-noticias.TU-USUARIO.workers.dev'
    // Si está vacío, la página de noticias muestra un aviso en lugar de fallar.
    // Si usas un dominio distinto al del sitio, agrégalo también a connect-src
    // del CSP en html/paginas/noticias.html.
    newsEndpoint: ''
});
