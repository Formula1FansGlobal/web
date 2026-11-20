// comparador.js - Compara dos pilotos: cifras de carrera y temporada actual.
// URL: comparador.html?a=norris&b=verstappen

(function () {
    'use strict';

    const { h, aviso } = window.F1UI;
    const X = window.F1Extra;
    const params = new URLSearchParams(window.location.search);
    const selA = document.getElementById('v-a');
    const selB = document.getElementById('v-b');
    const salida = document.getElementById('v-contenido');
    let pilotos = [];
    let ticket = 0;

    const FILAS = [
        ['titulos', 'Títulos'], ['victorias', 'Victorias'], ['podios', 'Podios'], ['poles', 'Poles'], ['carreras', 'Carreras']
    ];

    function llenar(sel, id) {
        sel.replaceChildren(
            h('option', { value: '', text: 'Elige un piloto…' }),
            ...pilotos.map((p) => h('option', { value: p.id, selected: p.id === id ? true : null, text: p.nombre }))
        );
    }

    function actualizarUrl() {
        const u = new URL(window.location.href);
        selA.value ? u.searchParams.set('a', selA.value) : u.searchParams.delete('a');
        selB.value ? u.searchParams.set('b', selB.value) : u.searchParams.delete('b');
        history.replaceState(null, '', u);
    }

    async function comparar() {
        actualizarUrl();
        const a = selA.value;
        const b = selB.value;
        if (!a || !b) { salida.replaceChildren(aviso('Elige dos pilotos para compararlos.')); return; }
        if (a === b) { salida.replaceChildren(aviso('Elige dos pilotos distintos.')); return; }
        const mio = ++ticket;
        salida.replaceChildren(h('div', { class: 'skeleton', style: 'height: 240px' }));
        try {
            const [pa, pb] = await Promise.all([X.getPiloto(a), X.getPiloto(b)]);
            const sa = await X.statsPiloto(a);
            const sb = await X.statsPiloto(b);
            if (mio !== ticket) return; // el usuario cambió la selección mientras cargaba

            const enlace = (p) => h('a', { href: `pilotos.html?id=${encodeURIComponent(p.id)}`, text: p.nombre, style: 'color: inherit' });
            const filas = FILAS.map(([k, etiqueta]) => {
                const ganaA = sa[k] > sb[k];
                const ganaB = sb[k] > sa[k];
                return h('tr', null,
                    h('td', { class: ganaA ? 'win' : '', text: String(sa[k]) }),
                    h('th', { scope: 'row', text: etiqueta }),
                    h('td', { class: ganaB ? 'win' : '', text: String(sb[k]) })
                );
            });
            const ratio = (s) => (s.carreras ? Math.round((s.victorias / s.carreras) * 1000) / 10 : 0);
            filas.push(h('tr', null,
                h('td', { class: ratio(sa) > ratio(sb) ? 'win' : '', text: `${ratio(sa)} %` }),
                h('th', { scope: 'row', text: '% de victorias' }),
                h('td', { class: ratio(sb) > ratio(sa) ? 'win' : '', text: `${ratio(sb)} %` })
            ));

            salida.replaceChildren(h('div', { class: 'card table-card' }, h('div', { class: 'table-scroll' }, h('table', { class: 'compare' },
                h('caption', { class: 'sr-only', text: `Comparación entre ${pa.nombre} y ${pb.nombre}` }),
                h('thead', null, h('tr', null, h('th', { scope: 'col' }, enlace(pa)), h('th', { scope: 'col', class: 'sr-only', text: 'Dato' }), h('th', { scope: 'col' }, enlace(pb)))),
                h('tbody', null, filas)
            ))));
        } catch (e) {
            if (mio === ticket) salida.replaceChildren(aviso('No pudimos cargar la comparación ahora. Intenta de nuevo en unos minutos.'));
        }
    }

    (async function iniciar() {
        try {
            // Pilotos de este año y del anterior (para incluir a quien aún no tiene datos)
            const act = await X.getPilotos(X.ANIO);
            const ant = act.length >= 10 ? [] : await X.getPilotos(X.ANIO - 1);
            const visto = new Set();
            pilotos = act.concat(ant).filter((p) => !visto.has(p.id) && visto.add(p.id));
            // Pilotos del pasado que llegan por enlace (?a= / ?b=)
            for (const k of ['a', 'b']) {
                const pid = X.idSeguro(params.get(k));
                if (pid && !pilotos.some((p) => p.id === pid)) {
                    try { const p = await X.getPiloto(pid); if (p) pilotos.push(p); } catch (e) { /* se ignora */ }
                }
            }
            pilotos.sort((x, y) => x.nombre.localeCompare(y.nombre));
            llenar(selA, X.idSeguro(params.get('a')));
            llenar(selB, X.idSeguro(params.get('b')));
            selA.addEventListener('change', comparar);
            selB.addEventListener('change', comparar);
            if (selA.value && selB.value) comparar();
        } catch (e) {
            salida.replaceChildren(aviso('No pudimos cargar la lista de pilotos ahora.'));
        }
    })();
})();
