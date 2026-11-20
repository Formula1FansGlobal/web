// estadisticas.js - Campeones, títulos por piloto/equipo y evolución de puntos de una temporada.

(function () {
    'use strict';

    const { h, aviso, tablaUI, svg } = window.F1UI;
    const X = window.F1Extra;
    const raiz = document.getElementById('s-contenido');

    const COLORES = ['#e10600', '#f5a524', '#2fbf8f', '#4c9be8', '#b57bee', '#e8739c'];

    /** Cuenta títulos por id y devuelve [{id, nombre, n, anios[]}] ordenado. */
    function ranking(lista) {
        const m = {};
        lista.forEach((c) => {
            m[c.id] = m[c.id] || { id: c.id, nombre: c.nombre, n: 0, anios: [] };
            m[c.id].n++;
            m[c.id].anios.push(c.anio);
        });
        return Object.values(m).sort((a, b) => b.n - a.n || a.nombre.localeCompare(b.nombre));
    }

    function barras(titulo, filas, destino) {
        const max = Math.max(1, ...filas.map((f) => f.n));
        return h('div', { class: 'card' },
            h('h3', { text: titulo }),
            h('ul', { class: 'bars', style: 'list-style:none;margin:0;padding:0;display:grid;gap:10px' }, filas.map((f) =>
                h('li', null,
                    h('div', { style: 'display:flex;justify-content:space-between;gap:12px;font-size:0.92rem' },
                        destino ? h('a', { href: destino(f), text: f.nombre, style: 'color:inherit;font-weight:600' }) : h('strong', { text: f.nombre }),
                        h('span', { text: String(f.n), style: 'font-weight:800;font-variant-numeric:tabular-nums' })
                    ),
                    h('div', { style: 'height:8px;border-radius:4px;background:var(--bg-elev);margin-top:4px', 'aria-hidden': 'true' },
                        h('div', { style: `height:8px;border-radius:4px;background:var(--brand);width:${(f.n / max) * 100}%` }))
                ))));
    }

    function porDecada(camp) {
        const decadas = {};
        camp.pilotos.forEach((c) => {
            const d = Math.floor(c.anio / 10) * 10;
            (decadas[d] = decadas[d] || []).push(c);
        });
        const filas = Object.keys(decadas).map(Number).sort((a, b) => b - a).map((d) =>
            h('tr', null,
                h('td', { class: 'pos', text: `${d}s` }),
                h('td', null, decadas[d].sort((a, b) => a.anio - b.anio).map((c, i) =>
                    h('span', { style: 'display:inline-block;margin:2px 14px 2px 0' },
                        h('small', { text: `${c.anio} ` }),
                        h('a', { href: `pilotos.html?id=${encodeURIComponent(c.id)}`, text: c.nombre, style: 'color:inherit;font-weight:600' })
                    )))
            ));
        return tablaUI('Campeones del mundo de pilotos por década', [{ texto: 'Década', clase: 'pos' }, { texto: 'Campeones' }], filas);
    }

    /* ---------------------------------------------------------- gráfica */
    function grafica(datos) {
        const top = datos.series.slice(0, 6);
        const n = datos.rondas.length;
        if (!n || !top.length) return aviso('Aún no hay carreras en esta temporada.');
        const W = 880, H = 380, ml = 46, mr = 120, mt = 14, mb = 56;
        const maxP = Math.max(10, ...top.map((s) => s.puntos[n - 1]));
        const techo = Math.ceil(maxP / 50) * 50;
        const px = (i) => ml + (n === 1 ? 0 : (i / (n - 1)) * (W - ml - mr));
        const py = (v) => mt + (1 - v / techo) * (H - mt - mb);

        const rejilla = [];
        for (let v = 0; v <= techo; v += techo / 5) {
            rejilla.push(svg('line', { x1: ml, x2: W - mr, y1: py(v), y2: py(v) }));
            rejilla.push(svg('text', { x: ml - 8, y: py(v) + 4, 'text-anchor': 'end' }, String(Math.round(v))));
        }
        const ejeX = datos.rondas.map((nombre, i) => svg('text', {
            x: px(i), y: H - mb + 16, 'text-anchor': 'end', transform: `rotate(-45 ${px(i)} ${H - mb + 16})`
        }, nombre));

        const lineas = top.map((s, k) => svg('polyline', {
            points: s.puntos.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' '),
            fill: 'none', stroke: COLORES[k], 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'
        }));
        // Etiquetas al final de cada línea, separadas si se pisan
        let ultimoY = -99;
        const etiquetas = top.map((s, k) => ({ s, k, y: py(s.puntos[n - 1]) })).sort((a, b) => a.y - b.y).map((e) => {
            const y = Math.max(e.y, ultimoY + 14);
            ultimoY = y;
            return svg('text', { x: W - mr + 8, y: y + 4, fill: COLORES[e.k], style: 'font-size:12px;font-weight:700;font-family:var(--font)' },
                `${e.s.nombre.split(' ').slice(-1)[0]} ${e.s.puntos[n - 1]}`);
        });

        const detalle = tablaUI('Puntos acumulados por ronda',
            [{ texto: 'Piloto' }].concat(datos.rondas.map((r, i) => ({ texto: String(i + 1), clase: 'num' }))),
            top.map((s) => h('tr', null, h('td', { text: s.nombre }), s.puntos.map((v) => h('td', { class: 'num', text: String(v) })))));

        return h('div', null,
            h('div', { class: 'card chart-wrap' },
                svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `Puntos acumulados de los ${top.length} primeros pilotos de ${datos.anio}. Líder: ${top[0].nombre} con ${top[0].puntos[n - 1]} puntos.` },
                    svg('g', { class: 'chart-grid chart-axis' }, ...rejilla),
                    svg('g', { class: 'chart-axis' }, ...ejeX),
                    ...lineas, ...etiquetas)),
            h('ul', { class: 'chart-legend' }, top.map((s, k) => h('li', null, h('i', { style: `background:${COLORES[k]}` }), s.nombre))),
            h('details', { style: 'margin-top:12px' }, h('summary', { text: 'Ver los datos en una tabla' }), detalle)
        );
    }

    async function pintarTemporada(anio, caja) {
        caja.replaceChildren(h('div', { class: 'skeleton', style: 'height: 320px' }));
        try {
            caja.replaceChildren(grafica(await X.puntosPorRonda(anio)));
        } catch (e) {
            caja.replaceChildren(aviso('No pudimos cargar esa temporada ahora. Intenta de nuevo en unos minutos.'));
        }
    }

    /* ----------------------------------------------------------- inicio */
    (async function () {
        let camp;
        try { camp = await X.campeones(); } catch (e) { raiz.replaceChildren(aviso('No pudimos cargar las estadísticas ahora. Intenta de nuevo en unos minutos.')); return; }

        const rp = ranking(camp.pilotos).slice(0, 10);
        const rc = ranking(camp.constructores).slice(0, 10);

        const sel = h('select', { class: 'input', id: 's-anio', 'aria-label': 'Temporada' });
        for (let y = X.ANIO; y >= 1950; y--) sel.append(h('option', { value: String(y), text: String(y) }));
        const cajaGraf = h('div', { 'aria-live': 'polite' });
        sel.addEventListener('change', () => pintarTemporada(sel.value, cajaGraf));

        raiz.replaceChildren(
            h('h2', { text: 'Más títulos' }),
            h('div', { class: 'card-grid', style: 'grid-template-columns:repeat(auto-fit,minmax(300px,1fr))' },
                barras('Pilotos', rp, (f) => `pilotos.html?id=${encodeURIComponent(f.id)}`),
                rc.length ? barras('Constructores (desde 1958)', rc, (f) => `equipos.html?id=${encodeURIComponent(f.id)}`) : null
            ),
            h('h2', { style: 'margin-top:36px', text: 'Campeones por década' }),
            porDecada(camp),
            h('h2', { style: 'margin-top:36px', text: 'Cómo se decidió cada temporada' }),
            h('div', { class: 'toolbar' }, h('label', { for: 's-anio', text: 'Temporada' }), sel),
            cajaGraf
        );
        pintarTemporada(String(X.ANIO), cajaGraf);
    })();
})();
