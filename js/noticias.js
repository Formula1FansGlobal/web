// noticias.js - Carga de noticias de F1 a través de un proxy propio.
//
// La clave de NewsData.io NO está en este archivo: vive como secreto en el
// Worker (workers/noticias-proxy). Todo el contenido externo se inserta con
// textContent / atributos del DOM, nunca con innerHTML, para evitar XSS.

(function () {
    'use strict';

    const MAX_DESCRIPCION = 220;
    const MAX_NOTICIAS = 12;

    function esHttps(valor) {
        try {
            return new URL(valor).protocol === 'https:';
        } catch (e) {
            return false;
        }
    }

    function recortar(texto, max) {
        const limpio = String(texto || '').replace(/\s+/g, ' ').trim();
        return limpio.length > max ? limpio.slice(0, max - 1).trimEnd() + '…' : limpio;
    }

    function formatearFecha(valor) {
        const fecha = new Date(valor);
        if (isNaN(fecha)) return '';
        return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function mostrarMensaje(contenedor, mensaje) {
        const p = document.createElement('p');
        p.className = 'news-mensaje';
        p.textContent = mensaje;
        contenedor.replaceChildren(p);
    }

    function crearTarjeta(noticia) {
        const enlace = esHttps(noticia.link) ? noticia.link : null;
        if (!noticia.title || !enlace) return null;

        const tarjeta = document.createElement('article');
        tarjeta.className = 'noticia';

        if (esHttps(noticia.image_url)) {
            const img = document.createElement('img');
            img.src = noticia.image_url;
            img.alt = '';
            img.loading = 'lazy';
            img.referrerPolicy = 'no-referrer';
            img.addEventListener('error', () => img.remove());
            tarjeta.appendChild(img);
        }

        const titulo = document.createElement('h3');
        titulo.textContent = noticia.title;
        tarjeta.appendChild(titulo);

        const meta = [noticia.source_name, formatearFecha(noticia.pubDate)].filter(Boolean).join(' · ');
        if (meta) {
            const fuente = document.createElement('p');
            fuente.className = 'noticia-fuente';
            fuente.textContent = 'Fuente: ' + meta;
            tarjeta.appendChild(fuente);
        }

        if (noticia.description) {
            const desc = document.createElement('p');
            desc.textContent = recortar(noticia.description, MAX_DESCRIPCION);
            tarjeta.appendChild(desc);
        }

        const leerMas = document.createElement('a');
        leerMas.href = enlace;
        leerMas.target = '_blank';
        leerMas.rel = 'noopener noreferrer nofollow';
        leerMas.textContent = 'Leer en la fuente original';
        tarjeta.appendChild(leerMas);

        return tarjeta;
    }

    async function cargarNoticias() {
        const contenedor = document.getElementById('news');
        if (!contenedor) return;

        const endpoint = (window.SITE_CONFIG && window.SITE_CONFIG.newsEndpoint) || '';
        if (!endpoint) {
            mostrarMensaje(contenedor, 'Las noticias estarán disponibles muy pronto.');
            return;
        }

        try {
            const respuesta = await fetch(endpoint, { headers: { Accept: 'application/json' } });
            if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
            const datos = await respuesta.json();

            const resultados = Array.isArray(datos.results) ? datos.results : [];
            const tarjetas = resultados
                .slice(0, MAX_NOTICIAS)
                .map(crearTarjeta)
                .filter(Boolean);

            if (tarjetas.length === 0) {
                mostrarMensaje(contenedor, 'No hay noticias disponibles por ahora.');
                return;
            }
            contenedor.replaceChildren(...tarjetas);
        } catch (error) {
            console.error('Error al cargar noticias:', error);
            mostrarMensaje(contenedor, 'Hubo un error al cargar las noticias. Intenta de nuevo más tarde.');
        }
    }

    document.addEventListener('DOMContentLoaded', cargarNoticias);
})();
