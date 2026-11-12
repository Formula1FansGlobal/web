// sw.js - Service worker de Formula 1 Fans Global.
//
// Estrategia:
//  - Páginas (HTML): red primero, caché como respaldo (para ver siempre lo más nuevo y funcionar sin conexión).
//  - CSS, JS y datos: red primero con caché como respaldo (sin mezclar versiones tras un despliegue).
//  - Imágenes: caché primero.
//  - Otros orígenes (APIs, YouTube, Mercado Libre): NO se interceptan.
//
// IMPORTANTE: al cambiar archivos del sitio, sube CACHE_VERSION para que los visitantes reciban lo nuevo.

const CACHE_VERSION = 'f1fg-v1';
const SHELL = [
    './',
    'index.html',
    '404.html',
    'manifest.webmanifest',
    'css/tokens.css', 'css/base.css', 'css/components.css', 'css/menu.css', 'css/footer.css', 'css/notifications.css',
    'css/home.css', 'css/sesiones.css', 'css/temporada.css', 'css/tienda.css', 'css/videos.css', 'css/noticias.css', 'css/legal.css',
    'js/config.js', 'js/menu.js', 'js/theme-toggle.js', 'js/notifications.js', 'js/footer.js', 'js/f1-data.js',
    'js/home.js', 'js/custom-timeline.js', 'js/sesiones.js', 'js/temporada.js', 'js/temporadas.js', 'js/carrera.js',
    'js/videos.js', 'js/noticias.js', 'js/tienda.js', 'js/productos-afiliados.js', 'js/productos-carrusel.js',
    'html/layout/menu.html', 'html/layout/footer.html',
    'html/paginas/noticias.html', 'html/paginas/en-vivo.html', 'html/paginas/videos.html',
    'html/paginas/calendario_temporada.html', 'html/paginas/temporadas.html', 'html/paginas/carrera.html',
    'html/paginas/tienda.html', 'html/paginas/terminos.html', 'html/paginas/privacidad.html',
    'img/favicon.ico', 'img/Formula-1-Fans-Global2.jpg', 'img/Formula-1-Fans-Global3.jpg',
    'data/proxima-sesion.json', 'data/videos.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => Promise.all(SHELL.map((ruta) =>
                // Un archivo que falle no debe impedir instalar el resto
                cache.add(new Request(new URL(ruta, self.registration.scope), { cache: 'reload' })).catch(() => null)
            )))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((claves) => Promise.all(claves.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return; // solo el propio sitio

    const esHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

    if (esHTML) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copia = res.clone();
                    caches.open(CACHE_VERSION).then((c) => c.put(req, copia));
                    return res;
                })
                .catch(() => caches.match(req, { ignoreSearch: true })
                    .then((r) => r || caches.match(new URL('index.html', self.registration.scope))))
        );
        return;
    }

    const esImagen = req.destination === 'image' || /\.(?:png|jpe?g|webp|avif|gif|svg|ico)$/i.test(url.pathname);

    if (esImagen) {
        // Imágenes: caché primero (casi nunca cambian)
        event.respondWith(
            caches.match(req).then((enCache) => enCache || fetch(req).then((res) => {
                if (res && res.ok) {
                    const copia = res.clone();
                    caches.open(CACHE_VERSION).then((c) => c.put(req, copia));
                }
                return res;
            }))
        );
        return;
    }

    // CSS, JS y datos: red primero (evita mezclar versiones tras un despliegue) y caché sin conexión
    event.respondWith(
        fetch(req)
            .then((res) => {
                if (res && res.ok) {
                    const copia = res.clone();
                    caches.open(CACHE_VERSION).then((c) => c.put(req, copia));
                }
                return res;
            })
            .catch(() => caches.match(req))
    );
});
