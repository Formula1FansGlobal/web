// equipos.js - Constructores de la temporada y ficha de cada equipo.
// URL: equipos.html (?year=2026)  |  equipos.html?id=ferrari

(function () {
    'use strict';

    const { h, aviso, tablaUI, stat } = window.F1UI;
    const X = window.F1Extra;
    const params = new URLSearchParams(window.location.search);
    const id = X.idSeguro(params.get('id'));
    const contenido = document.getElementById('e-contenido');
    const selAnio = document.getElementById('e-anio');
    const toolbar = document.querySelector('.toolbar');

    function llenarAnios(sel, actual) {
        const o = [];
        for (let y = X.ANIO; y >= 1958; y--) o.push(h('option', { value: String(y), selected: String(y) === String(actual) ? true : null, text: String(y) }));
        sel.replaceChildren(...o);
    }

    let anio = X.anioSeguro(params.get('year')) || String(X.ANIO);

    async function cargarLista() {
        contenido.replaceChildren(h('div', { class: 'skeleton', style: 'height: 260px' }));
        try {
            const equipos = await X.getEquipos(anio);
            if (!equipos.length) { contenido.replaceChildren(aviso('No hay datos de equipos para esta temporada.')); return; }
            const fav = window.F1Fav.get().equipo;
            contenido.replaceChildren(h('div', { class: 'card-grid' }, equipos.map((e) =>
                h('a', { class: 'entity', href: `equipos.html?id=${encodeURIComponent(e.id)}` },
                    fav && fav.id === e.id ? h('span', { class: 'fav-mark', 'aria-label': 'Tu equipo favorito', text: '★' }) : null,
                    h('span', { class: 'num-big', text: e.pos ? `P${e.pos}` : '—' }),
                    h('h3', { text: e.nombre }),
                    h('p', { text: e.nacionalidad }),
                    e.pos ? h('div', { class: 'meta' }, h('span', { class: 'badge', text: `${e.puntos} pts` }), h('span', { class: 'badge', text: `${e.victorias} victorias` })) : null
                )
            )));
        } catch (e) {
            contenido.replaceChildren(aviso('No pudimos cargar los equipos ahora. Intenta de nuevo en unos minutos.'));
        }
    }

    async function cargarFicha() {
        if (toolbar) toolbar.hidden = true;
        let e;
        try { e = await X.getEquipo(id); } catch (err) { e = null; }
        if (!e) {
            contenido.replaceChildren(aviso('No encontramos a ese equipo.'), h('p', null, h('a', { class: 'link-arrow', href: 'equipos.html', text: 'Volver a los equipos' })));
            return;
        }
        document.title = `${e.nombre} | Formula 1 Fans Global`;
        document.getElementById('page-h1').textContent = e.nombre;
        document.getElementById('page-sub').textContent = e.nacionalidad;

        const statsBox = h('div', { class: 'stats-row' }, h('div', { class: 'skeleton', style: 'height: 80px; grid-column: 1 / -1' }));
        const pilotosBox = h('div', null, h('div', { class: 'skeleton', style: 'height: 100px' }));

        contenido.replaceChildren(
            h('p', { class: 'crumbs' }, h('a', { href: 'equipos.html', text: '← Todos los equipos' })),
            h('div', { class: 'profile-actions' },
                window.F1Fav.boton('equipo', e.id, e.nombre),
                e.wiki ? h('a', { class: 'btn btn--ghost', href: e.wiki, target: '_blank', rel: 'noopener noreferrer', text: 'Wikipedia' }) : null
            ),
            statsBox,
            h('h2', { text: 'Pilotos' }),
            pilotosBox
        );

        X.statsEquipo(e.id).then((s) => {
            statsBox.replaceChildren(stat(s.titulos, 'Títulos de constructores'), stat(s.victorias, 'Victorias'), stat(s.poles, 'Poles'));
        }).catch(() => statsBox.replaceChildren(aviso('No pudimos cargar sus estadísticas ahora.')));

        // Pilotos del año en curso; si el equipo no corre este año, el último año con datos
        (async () => {
            for (const y of [X.ANIO, X.ANIO - 1]) {
                try {
                    const lista = await X.pilotosDeEquipo(e.id, y);
                    if (lista.length) {
                        pilotosBox.replaceChildren(
                            h('p', { class: 'data-credit', text: `Temporada ${y}` }),
                            h('div', { class: 'card-grid' }, lista.map((p) =>
                                h('a', { class: 'entity', href: `pilotos.html?id=${encodeURIComponent(p.id)}` },
                                    h('span', { class: 'num-big', text: p.numero || p.codigo || '—' }),
                                    h('h3', { text: p.nombre }),
                                    h('p', { text: p.nacionalidad })
                                ))));
                        return;
                    }
                } catch (err) { /* prueba el año anterior */ }
            }
            pilotosBox.replaceChildren(aviso('Este equipo no tiene pilotos recientes en los datos.'));
        })();
    }

    if (id) {
        cargarFicha();
    } else {
        llenarAnios(selAnio, anio);
        selAnio.addEventListener('change', () => { anio = selAnio.value; cargarLista(); });
        cargarLista();
    }
})();
