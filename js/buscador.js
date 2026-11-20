// buscador.js - Buscador del sitio (Ctrl+K o "/").
//
// Busca entre las páginas del sitio y, cuando hay datos, entre pilotos, equipos y Grandes Premios
// de la temporada. El índice dinámico se guarda en localStorage (solo en este navegador).

(function () {
    'use strict';

    const IDX = 'f1fg:idx';
    const TTL = 12 * 60 * 60 * 1000;
    const base = location.pathname.replace(/\\/g, '/').includes('/html/') ? '../../' : './';
    const P = (ruta) => base + ruta;

    const PAGINAS = [
        ['Inicio', 'index.html', 'portada próxima sesión clasificación historia'],
        ['Sesiones y horarios', 'html/paginas/en-vivo.html', 'en vivo práctica clasificación carrera horario hora'],
        ['Noticias', 'html/paginas/noticias.html', 'novedades actualidad'],
        ['Videos', 'html/paginas/videos.html', 'resúmenes youtube'],
        ['Calendario de la temporada', 'html/paginas/calendario_temporada.html', 'carreras grandes premios fechas'],
        ['Archivo de temporadas', 'html/paginas/temporadas.html', 'historia años década 1950'],
        ['Pilotos', 'html/paginas/pilotos.html', 'parrilla drivers'],
        ['Equipos', 'html/paginas/equipos.html', 'constructores escuderías teams'],
        ['Circuitos', 'html/paginas/circuitos.html', 'pistas autódromos'],
        ['Comparador de pilotos', 'html/paginas/comparador.html', 'comparar versus'],
        ['Estadísticas', 'html/paginas/estadisticas.html', 'campeones títulos récords puntos'],
        ['Quiniela', 'html/paginas/quiniela.html', 'juego pronóstico podio pole'],
        ['Tienda (próximamente)', 'html/paginas/tienda.html', 'productos comprar'],
        ['Privacidad', 'html/paginas/privacidad.html', 'datos cookies'],
        ['Términos de servicio', 'html/paginas/terminos.html', 'legal condiciones']
    ];

    const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    function leerIdx() {
        try {
            const v = JSON.parse(localStorage.getItem(IDX) || 'null');
            return v && Array.isArray(v.items) ? v : null;
        } catch (e) { return null; }
    }
    function guardarIdx(items) {
        try { localStorage.setItem(IDX, JSON.stringify({ t: Date.now(), items })); } catch (e) { /* lleno o bloqueado */ }
    }

    /** Actualiza el índice dinámico si esta página tiene los módulos de datos. */
    async function refrescar() {
        const actual = leerIdx();
        if (actual && Date.now() - actual.t < TTL) return;
        if (!window.F1Extra || !window.F1Data) return;
        try {
            const X = window.F1Extra;
            const [pilotos, equipos, cal] = await Promise.all([
                X.getPilotos(X.ANIO), X.getEquipos(X.ANIO), window.F1Data.getCalendario(X.ANIO).catch(() => [])
            ]);
            guardarIdx([].concat(
                pilotos.map((p) => ['Piloto', p.nombre, `html/paginas/pilotos.html?id=${encodeURIComponent(p.id)}`, p.equipo]),
                equipos.map((e) => ['Equipo', e.nombre, `html/paginas/equipos.html?id=${encodeURIComponent(e.id)}`, e.nacionalidad]),
                cal.map((c) => ['Gran Premio', c.nombre, `html/paginas/carrera.html?year=${X.ANIO}&round=${c.ronda}`, c.lugar])
            ));
        } catch (e) { /* sin red: se usa lo guardado */ }
    }

    function todos() {
        const dinamicos = (leerIdx() || { items: [] }).items.filter((i) => Array.isArray(i) && /^html\/paginas\/[a-z_]+\.html(\?[\w=&%-]*)?$/.test(i[2]));
        return PAGINAS.map(([t, r, k]) => ({ tipo: 'Página', titulo: t, ruta: r, extra: '', clave: norm(t + ' ' + k) }))
            .concat(dinamicos.map(([tipo, titulo, ruta, extra]) => ({ tipo, titulo, ruta, extra: extra || '', clave: norm(titulo + ' ' + (extra || '')) })));
    }

    /* ----------------------------------------------------------- interfaz */
    let overlay, entrada, lista, origen, resultados = [], sel = 0;

    function el(tag, props, ...hijos) {
        const e = document.createElement(tag);
        Object.entries(props || {}).forEach(([k, v]) => { if (v != null && v !== false) k === 'text' ? (e.textContent = v) : e.setAttribute(k, v === true ? '' : v); });
        hijos.flat().forEach((c) => { if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c))); });
        return e;
    }

    function pintar() {
        const q = norm(entrada.value).trim();
        const fichas = todos();
        resultados = (q ? fichas.filter((f) => q.split(/\s+/).every((t) => f.clave.includes(t))) : fichas.filter((f) => f.tipo === 'Página')).slice(0, 12);
        sel = 0;
        lista.replaceChildren(...(resultados.length
            ? resultados.map((r, i) => el('li', null, el('a', { href: P(r.ruta), class: i === 0 ? 'is-sel' : null },
                el('span', { text: r.titulo }), el('small', { text: r.extra ? `${r.tipo} · ${r.extra}` : r.tipo }))))
            : [el('li', { class: 'data-credit', text: 'Sin resultados. Prueba con otro nombre.' })]));
    }

    function mover(d) {
        const enlaces = lista.querySelectorAll('a');
        if (!enlaces.length) return;
        enlaces[sel].classList.remove('is-sel');
        sel = (sel + d + enlaces.length) % enlaces.length;
        enlaces[sel].classList.add('is-sel');
        enlaces[sel].scrollIntoView({ block: 'nearest' });
    }

    function cerrar() {
        if (!overlay) return;
        overlay.hidden = true;
        document.removeEventListener('keydown', teclasDialogo);
        if (origen && origen.focus) origen.focus();
    }
    function teclasDialogo(e) {
        if (e.key === 'Escape') cerrar();
        else if (e.key === 'ArrowDown') { e.preventDefault(); mover(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); mover(-1); }
        else if (e.key === 'Enter' && resultados[sel]) { e.preventDefault(); location.href = P(resultados[sel].ruta); }
    }

    function abrir(desde) {
        origen = desde || document.activeElement;
        if (!overlay) {
            entrada = el('input', { type: 'search', id: 'busq-q', placeholder: 'Buscar pilotos, equipos, carreras, páginas…', autocomplete: 'off', 'aria-label': 'Buscar en el sitio' });
            lista = el('ul', { class: 'search-results' });
            const cuerpo = el('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Buscador' }, entrada, lista,
                el('p', { class: 'data-credit', text: 'Usa ↑ ↓ y Enter. Esc para cerrar.' }));
            overlay = el('div', { class: 'overlay', hidden: true }, cuerpo);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });
            entrada.addEventListener('input', pintar);
            document.body.append(overlay);
        }
        overlay.hidden = false;
        document.addEventListener('keydown', teclasDialogo);
        entrada.value = '';
        pintar();
        entrada.focus();
        refrescar().then(pintar);
    }

    document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-open="buscar"]');
        if (b) abrir(b);
    });
    document.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) || '';
        const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(tag) || (e.target && e.target.isContentEditable);
        if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !escribiendo && !e.ctrlKey && !e.metaKey)) {
            e.preventDefault();
            if (!overlay || overlay.hidden) abrir();
        }
    });

    setTimeout(refrescar, 4000); // sin competir con las peticiones propias de la página
})();
