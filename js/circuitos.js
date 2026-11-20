// circuitos.js - Circuitos por temporada y ficha con ganadores de todos los tiempos.
// URL: circuitos.html (?year=2026)  |  circuitos.html?id=monza

(function () {
    'use strict';

    const { h, aviso, tablaUI, stat, svg } = window.F1UI;
    const X = window.F1Extra;
    const params = new URLSearchParams(window.location.search);
    const id = X.idSeguro(params.get('id'));
    const contenido = document.getElementById('c-contenido');
    const selAnio = document.getElementById('c-anio');
    const toolbar = document.querySelector('.toolbar');
    let anio = X.anioSeguro(params.get('year')) || String(X.ANIO);

    /** Mapa mundial esquemático (proyección equirrectangular) con la ubicación del circuito. */
    function mapa(c) {
        if (!isFinite(c.lat) || !isFinite(c.lon)) return null;
        const W = 720, H = 360;
        const x = ((c.lon + 180) / 360) * W;
        const y = ((90 - c.lat) / 180) * H;
        const lineas = [];
        for (let lon = -180; lon <= 180; lon += 30) lineas.push(svg('line', { x1: (lon + 180) / 360 * W, y1: 0, x2: (lon + 180) / 360 * W, y2: H, class: 'graticule' }));
        for (let lat = -90; lat <= 90; lat += 30) lineas.push(svg('line', { x1: 0, y1: (90 - lat) / 180 * H, x2: W, y2: (90 - lat) / 180 * H, class: 'graticule' }));
        const etiquetaX = x > W - 170 ? x - 14 : x + 14;
        const ancla = x > W - 170 ? 'end' : 'start';
        return h('div', { class: 'card map-card' },
            svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Ubicación de ${c.nombre}: latitud ${c.lat.toFixed(2)}, longitud ${c.lon.toFixed(2)}` },
                ...lineas,
                svg('circle', { cx: x, cy: y, r: 16, class: 'pin-ring' }),
                svg('circle', { cx: x, cy: y, r: 6, class: 'pin' }),
                svg('text', { x: etiquetaX, y: y + 4, class: 'map-label', 'text-anchor': ancla }, `${c.localidad}, ${c.pais}`)
            ),
            h('p', { class: 'data-credit', text: `Coordenadas: ${c.lat.toFixed(3)}°, ${c.lon.toFixed(3)}°` })
        );
    }

    async function cargarLista() {
        contenido.replaceChildren(h('div', { class: 'skeleton', style: 'height: 260px' }));
        try {
            const lista = await X.getCircuitos(anio);
            if (!lista.length) { contenido.replaceChildren(aviso('No hay circuitos para esta temporada.')); return; }
            contenido.replaceChildren(h('div', { class: 'card-grid' }, lista.map((c) =>
                h('a', { class: 'entity', href: `circuitos.html?id=${encodeURIComponent(c.id)}` },
                    h('h3', { text: c.nombre }),
                    h('p', { text: [c.localidad, c.pais].filter(Boolean).join(', ') })
                ))));
        } catch (e) {
            contenido.replaceChildren(aviso('No pudimos cargar los circuitos ahora. Intenta de nuevo en unos minutos.'));
        }
    }

    async function cargarFicha() {
        if (toolbar) toolbar.hidden = true;
        let c;
        try { c = await X.getCircuito(id); } catch (e) { c = null; }
        if (!c) {
            contenido.replaceChildren(aviso('No encontramos ese circuito.'), h('p', null, h('a', { class: 'link-arrow', href: 'circuitos.html', text: 'Volver a los circuitos' })));
            return;
        }
        document.title = `${c.nombre} | Formula 1 Fans Global`;
        document.getElementById('page-h1').textContent = c.nombre;
        document.getElementById('page-sub').textContent = [c.localidad, c.pais].filter(Boolean).join(', ');

        // Pilotos con más victorias en este circuito
        const conteo = {};
        c.ganadores.forEach((g) => { if (g.piloto) { conteo[g.pilotoId] = conteo[g.pilotoId] || { id: g.pilotoId, nombre: g.piloto, n: 0 }; conteo[g.pilotoId].n++; } });
        const caja3d = h("div", { class: "c3d-wrap" });
        const top = Object.values(conteo).sort((a, b) => b.n - a.n)[0];

        contenido.replaceChildren(
            h('p', { class: 'crumbs' }, h('a', { href: 'circuitos.html', text: '← Todos los circuitos' })),
            h('div', { class: 'stats-row' },
                stat(c.carreras, 'Carreras disputadas'),
                stat(c.ganadores.length ? c.ganadores[c.ganadores.length - 1].anio : '—', 'Primera carrera'),
                stat(c.ganadores.length ? c.ganadores[0].anio : '—', 'Última carrera'),
                top ? stat(`${top.n}`, `Más victorias: ${top.nombre}`) : null
            ),
            caja3d,
            mapa(c),
            c.wiki ? h('p', null, h('a', { class: 'link-arrow', href: c.wiki, target: '_blank', rel: 'noopener noreferrer', text: 'Más información en Wikipedia' })) : null,
            h('h2', { text: 'Ganadores' }),
            c.ganadores.length
                ? tablaUI(`Ganadores en ${c.nombre}`,
                    [{ texto: 'Año', clase: 'pos' }, { texto: 'Gran Premio' }, { texto: 'Ganador' }],
                    c.ganadores.map((g) => h('tr', null,
                        h('td', { class: 'pos', text: String(g.anio) }),
                        h('td', null, h('a', { href: `carrera.html?year=${g.anio}&round=${g.ronda}`, text: g.gp, style: 'color: inherit' })),
                        h('td', { class: 'who' }, h('strong', { text: g.piloto }), h('small', { text: g.equipo }))
                    )))
                : aviso('Aún no hay ganadores registrados en este circuito.')
        );

        // Trazado en 3D (si hay datos para este circuito); si no, se quita el hueco
        if (window.F1Circuito3D) {
            window.F1Circuito3D.montar(caja3d, c).then((ok) => { if (!ok) caja3d.remove(); }).catch(() => caja3d.remove());
        } else { caja3d.remove(); }
    }

    if (id) {
        cargarFicha();
    } else {
        const o = [];
        for (let y = X.ANIO; y >= 1950; y--) o.push(h('option', { value: String(y), selected: String(y) === anio ? true : null, text: String(y) }));
        selAnio.replaceChildren(...o);
        selAnio.addEventListener('change', () => { anio = selAnio.value; cargarLista(); });
        cargarLista();
    }
})();
