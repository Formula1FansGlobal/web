// pilotos.js - Parrilla de pilotos y ficha individual.
// URL: pilotos.html            -> parrilla de la temporada (?year=2026)
//      pilotos.html?id=norris  -> ficha del piloto

(function () {
    'use strict';

    const { h, aviso, tablaUI, stat, fechaLarga, edad } = window.F1UI;
    const X = window.F1Extra;
    const params = new URLSearchParams(window.location.search);
    const id = X.idSeguro(params.get('id'));
    const contenido = document.getElementById('p-contenido');
    const selAnio = document.getElementById('p-anio');
    const buscar = document.getElementById('p-buscar');
    const toolbar = document.querySelector('.toolbar');

    function llenarAnios(sel, actual) {
        const opciones = [];
        for (let y = X.ANIO; y >= 1950; y--) opciones.push(h('option', { value: String(y), selected: String(y) === String(actual) ? true : null, text: String(y) }));
        sel.replaceChildren(...opciones);
    }

    /* ------------------------------------------------------------ parrilla */
    let anio = X.anioSeguro(params.get('year')) || String(X.ANIO);
    let pilotos = [];

    function pintarLista() {
        const q = buscar.value.trim().toLowerCase();
        const fav = window.F1Fav.get().piloto;
        const lista = pilotos.filter((p) => !q || p.nombre.toLowerCase().includes(q) || p.equipo.toLowerCase().includes(q));
        if (!lista.length) { contenido.replaceChildren(aviso('No hay pilotos que coincidan.')); return; }
        contenido.replaceChildren(h('div', { class: 'card-grid' }, lista.map((p) =>
            h('a', { class: 'entity', href: `pilotos.html?id=${encodeURIComponent(p.id)}` },
                fav && fav.id === p.id ? h('span', { class: 'fav-mark', 'aria-label': 'Tu piloto favorito', text: '★' }) : null,
                h('div', { class: 'entity-top' },
                    window.F1Mascota ? window.F1Mascota.avatar({ numero: p.numero, codigo: p.codigo, equipoId: p.equipoId }) : null,
                    h('span', { class: 'num-big', text: p.numero || p.codigo || '—' })),
                h('h3', { text: p.nombre }),
                h('p', { text: p.equipo || p.nacionalidad }),
                p.pos ? h('div', { class: 'meta' }, h('span', { class: 'badge', text: `P${p.pos}` }), h('span', { class: 'badge', text: `${p.puntos} pts` })) : null
            )
        )));
    }

    async function cargarLista() {
        contenido.replaceChildren(h('div', { class: 'skeleton', style: 'height: 260px' }));
        try {
            pilotos = await X.getPilotos(anio);
            if (!pilotos.length) { contenido.replaceChildren(aviso('No hay datos de pilotos para esta temporada.')); return; }
            pintarLista();
        } catch (e) {
            contenido.replaceChildren(aviso('No pudimos cargar los pilotos ahora. Intenta de nuevo en unos minutos.'));
        }
    }

    /* --------------------------------------------------------------- ficha */
    async function cargarFicha() {
        if (toolbar) toolbar.hidden = true;
        let p;
        try { p = await X.getPiloto(id); } catch (e) { p = null; }
        if (!p) {
            contenido.replaceChildren(aviso('No encontramos a ese piloto.'), h('p', null, h('a', { class: 'link-arrow', href: 'pilotos.html', text: 'Volver a la parrilla' })));
            return;
        }

        document.title = `${p.nombre} | Formula 1 Fans Global`;
        document.getElementById('page-h1').textContent = p.nombre;
        document.getElementById('page-sub').textContent = [p.numero ? `#${p.numero}` : '', p.codigo, p.nacionalidad].filter(Boolean).join(' · ');

        const statsBox = h('div', { class: 'stats-row' }, h('div', { class: 'skeleton', style: 'height: 80px; grid-column: 1 / -1' }));
        const temporadaBox = h('div', null, h('div', { class: 'skeleton', style: 'height: 160px' }));

        // Equipo y número actuales (si corre esta temporada) para vestir al personaje
        let actual = null;
        try { actual = (await X.getPilotos(X.ANIO)).find((x) => x.id === p.id) || null; } catch (e) { actual = null; }
        const escenario = h('div', { class: 'mx-stage' });
        if (window.F1Mascota) {
            const m = window.F1Mascota.montar(escenario, { nombre: p.nombre, numero: p.numero, codigo: p.codigo, equipoId: actual ? actual.equipoId : '', nacionalidad: p.nacionalidad });
            escenario.style.setProperty('--glow', m.style.getPropertyValue('--c2'));
        }

        contenido.replaceChildren(
            h('p', { class: 'crumbs' }, h('a', { href: 'pilotos.html', text: '← Todos los pilotos' })),
            h('div', { class: 'profile-grid' }, escenario, h('div', null,
            h('div', { class: 'profile-head' },
                h('ul', { class: 'info-list' },
                    p.nacimiento ? h('li', null, h('strong', { text: 'Nacimiento' }), `${fechaLarga(p.nacimiento)} (${edad(p.nacimiento)} años)`) : null,
                    p.nacionalidad ? h('li', null, h('strong', { text: 'Nacionalidad' }), p.nacionalidad) : null,
                    p.numero ? h('li', null, h('strong', { text: 'Número' }), p.numero) : null
                ),
                h('div', { class: 'profile-actions' },
                    window.F1Fav.boton('piloto', p.id, p.nombre),
                    h('a', { class: 'btn btn--ghost', href: `comparador.html?a=${encodeURIComponent(p.id)}`, text: 'Comparar con otro piloto' }),
                    p.wiki ? h('a', { class: 'btn btn--ghost', href: p.wiki, target: '_blank', rel: 'noopener noreferrer', text: 'Wikipedia' }) : null
                )
            ))),
            statsBox,
            h('h2', { text: 'Resultados por temporada' }),
            temporadaBox
        );

        X.statsPiloto(p.id).then((s) => {
            statsBox.replaceChildren(
                stat(s.titulos, 'Títulos'), stat(s.victorias, 'Victorias'), stat(s.podios, 'Podios'),
                stat(s.poles, 'Poles'), stat(s.carreras, 'Carreras')
            );
        }).catch(() => statsBox.replaceChildren(aviso('No pudimos cargar sus estadísticas ahora.')));

        const sel = h('select', { class: 'input', id: 'f-anio', 'aria-label': 'Temporada' });
        const tablaBox = h('div', { 'aria-live': 'polite' });
        async function pintarTemporada(y) {
            tablaBox.replaceChildren(h('div', { class: 'skeleton', style: 'height: 160px' }));
            try {
                const filas = await X.resultadosPiloto(p.id, y);
                if (!filas.length) { tablaBox.replaceChildren(aviso(`${p.nombre} no tiene carreras registradas en ${y}.`)); return; }
                tablaBox.replaceChildren(tablaUI(`Resultados de ${p.nombre} en ${y}`,
                    [{ texto: 'Ronda', clase: 'pos' }, { texto: 'Gran Premio' }, { texto: 'Parrilla', clase: 'num' }, { texto: 'Llegada', clase: 'num' }, { texto: 'Pts', clase: 'num' }],
                    filas.map((r) => h('tr', null,
                        h('td', { class: 'pos', text: String(r.ronda) }),
                        h('td', { class: 'who' }, h('strong', { text: r.gp }), h('small', { text: r.estado })),
                        h('td', { class: 'num', text: r.parrilla ? String(r.parrilla) : 'Pit' }),
                        h('td', { class: 'num', text: r.pos ? String(r.pos) : '—' }),
                        h('td', { class: 'num pts', text: String(r.puntos) })
                    ))));
            } catch (e) {
                tablaBox.replaceChildren(aviso('No pudimos cargar esa temporada ahora.'));
            }
        }
        llenarAnios(sel, X.ANIO);
        sel.addEventListener('change', () => pintarTemporada(sel.value));
        temporadaBox.replaceChildren(h('div', { class: 'toolbar' }, h('label', { for: 'f-anio', text: 'Temporada' }), sel), tablaBox);

        // Si este año aún no tiene carreras de este piloto, muestra el anterior
        const inicial = String(X.ANIO);
        X.resultadosPiloto(p.id, inicial).then((f) => {
            if (f.length) { pintarTemporada(inicial); return; }
            sel.value = String(X.ANIO - 1);
            pintarTemporada(String(X.ANIO - 1));
        }).catch(() => pintarTemporada(inicial));
    }

    if (id) {
        cargarFicha();
    } else {
        llenarAnios(selAnio, anio);
        selAnio.addEventListener('change', () => { anio = selAnio.value; cargarLista(); });
        buscar.addEventListener('input', pintarLista);
        cargarLista();
    }
})();
