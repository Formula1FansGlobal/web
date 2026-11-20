// noticias.js - Noticias de F1 que se renuevan cada hora.
//
// Fuente 1: /api/noticias (Cloudflare Pages Function, clave secreta en el servidor).
// Fuente 2: data/noticias.json, que genera cada hora el workflow .github/workflows/noticias.yml.
// Todo el contenido externo se inserta con textContent / atributos del DOM, nunca con innerHTML.

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

    const INTERVALO_MS = 60 * 60 * 1000; // las noticias se renuevan cada hora
    const BASE = location.pathname.replace(/\\/g, '/').includes('/html/') ? '../../' : './';
    let conocidas = null; // enlaces ya mostrados, para marcar las nuevas
    let ultimaCarga = 0;

    /** Primero la API en vivo (Cloudflare); si no existe, el archivo que genera el workflow cada hora. */
    async function pedirDatos() {
        const endpoint = (window.SITE_CONFIG && window.SITE_CONFIG.newsEndpoint) || '';
        const fuentes = [endpoint, BASE + 'data/noticias.json'].filter(Boolean);
        for (const url of fuentes) {
            try {
                const r = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-cache' });
                if (!r.ok) continue;
                const d = await r.json();
                if (Array.isArray(d.results) && d.results.length) return d;
            } catch (e) { /* prueba la siguiente */ }
        }
        return null;
    }

    function hora(valor) {
        const f = new Date(valor);
        return isNaN(f) ? '' : f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }

    async function cargarNoticias() {
        const contenedor = document.getElementById('news');
        if (!contenedor) return;
        const primera = conocidas === null;

        const datos = await pedirDatos();
        ultimaCarga = Date.now();
        if (!datos) {
            // Si ya había noticias en pantalla, las dejamos; solo avisamos en la primera carga.
            if (primera) mostrarMensaje(contenedor, 'Las noticias estarán disponibles muy pronto.');
            return;
        }

        const tarjetas = [];
        datos.results.slice(0, MAX_NOTICIAS).forEach((n) => {
            const t = crearTarjeta(n);
            if (!t) return;
            if (!primera && conocidas && !conocidas.has(n.link)) {
                const etiqueta = document.createElement('span');
                etiqueta.className = 'noticia-nueva';
                etiqueta.textContent = 'Nueva';
                t.prepend(etiqueta);
            }
            tarjetas.push(t);
        });
        if (tarjetas.length === 0) {
            if (primera) mostrarMensaje(contenedor, 'No hay noticias disponibles por ahora.');
            return;
        }
        conocidas = new Set(datos.results.map((n) => n.link));

        const estado = document.createElement('p');
        estado.className = 'news-estado';
        const h = hora(datos.actualizado);
        estado.textContent = (h ? `Actualizado a las ${h} · ` : '') + 'Se renuevan cada hora.';
        contenedor.replaceChildren(estado, ...tarjetas);
    }

    document.addEventListener('DOMContentLoaded', () => {
        cargarNoticias();
        // Se renuevan solas si la página queda abierta, y al volver a la pestaña si pasó más de una hora.
        setInterval(() => { if (!document.hidden) cargarNoticias(); }, INTERVALO_MS);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && Date.now() - ultimaCarga >= INTERVALO_MS) cargarNoticias();
        });
    });
})();
