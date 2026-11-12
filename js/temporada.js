// temporada.js - Calendario, ganadores y clasificación final de una temporada.
// URL: calendario_temporada.html?year=2026  (opcional #pilotos o #constructores)

(function () {
    'use strict';

    const { h } = window.F1UI;
    const D = window.F1Data;

    const ACTUAL = new Date().getFullYear();
    const MIN = 1950;
    const params = new URLSearchParams(window.location.search);
    const qy = params.get('year') || '';
    let anio = /^(19[5-9]\d|20\d\d)$/.test(qy) && Number(qy) >= MIN && Number(qy) <= ACTUAL + 1 ? Number(qy) : ACTUAL;
    let tab = ['calendario', 'pilotos', 'constructores'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'calendario';

    const panel = document.getElementById('t-panel');
    const tabs = Array.from(document.querySelectorAll('.tabs .tab'));
    const select = document.getElementById('t-select');

    /* ----------------------------------------------------------- utilidades */
    function aviso(texto) {
        return h('p', { class: 'notice', text: texto });
    }
    function cargando() {
        return h('div', { class: 'skeleton', style: 'height: 240px' });
    }
    function urlTemporada() {
        return `calendario_temporada.html?year=${anio}#${tab}`;
    }

    /* ------------------------------------------------------------ Calendario */
    async function pintarCalendario(token) {
        let carreras;
        try {
            carreras = await D.getCalendario(anio);
        } catch (e) {
            console.warn('temporada: calendario no disponible', e);
            if (token === pedido) panel.replaceChildren(aviso('No pudimos cargar el calendario en este momento. Intenta de nuevo en unos minutos o consulta formula1.com.'));
            return;
        }
        if (token !== pedido) return;
        if (!carreras.length) {
            panel.replaceChildren(aviso('Aún no hay calendario publicado para esta temporada.'));
            return;
        }

        let ganadores = {};
        try { ganadores = await D.getGanadores(anio); } catch (e) { /* sin ganadores todavía */ }
        if (token !== pedido) return;

        const hoy = new Date().toISOString().slice(0, 10);
        const proxima = carreras.find((c) => c.iso >= hoy);

        panel.replaceChildren(h('div', { class: 'race-grid' }, carreras.map((c) => {
            const g = ganadores[c.ronda];
            const futura = c.iso >= hoy;
            return h('a', {
                class: 'race-card' + (c === proxima ? ' is-next' : ''),
                href: `carrera.html?year=${anio}&round=${c.ronda}`
            },
                h('div', { class: 'race-top' },
                    h('span', { class: 'race-round', text: `Ronda ${c.ronda}` }),
                    c === proxima ? h('span', { class: 'badge', text: 'Próxima' }) : h('span', { class: 'race-date', text: c.fecha })
                ),
                h('h3', { text: c.nombre }),
                h('p', { class: 'race-place', text: c.lugar + (c === proxima ? ` · ${c.fecha}` : '') }),
                g
                    ? h('div', { class: 'race-winner' }, 'Ganador', h('strong', { text: g.nombre }), g.equipo ? h('span', { text: g.equipo }) : null)
                    : h('div', { class: 'race-winner is-future', text: futura ? 'Por disputarse' : 'Resultado no disponible' })
            );
        })));
    }

    /* ---------------------------------------------------------- Clasificación */
    async function pintarClasificacion(tipo, token) {
        const esPilotos = tipo === 'pilotos';
        if (!esPilotos && anio < 1958) {
            panel.replaceChildren(aviso('El campeonato de constructores comenzó en 1958.'));
            return;
        }
        let datos;
        try {
            datos = await D.getClasificacion(tipo, anio);
        } catch (e) {
            console.warn('temporada: clasificación no disponible', e);
            if (token === pedido) panel.replaceChildren(aviso('No pudimos cargar la clasificación en este momento.'));
            return;
        }
        if (token !== pedido) return;
        if (!datos.filas.length) {
            panel.replaceChildren(aviso('Aún no hay clasificación para esta temporada.'));
            return;
        }

        const terminada = anio < ACTUAL;
        const cuerpo = datos.filas.map((f, i) => h('tr', { class: terminada && i === 0 ? 'champ' : '' },
            h('td', { class: 'pos', text: String(f.pos) }),
            h('td', { class: 'who' }, h('strong', { text: f.nombre + (terminada && i === 0 ? ' 🏆' : '') }), f.equipo ? h('small', { text: f.equipo }) : null),
            h('td', { class: 'num', text: String(f.victorias) }),
            h('td', { class: 'num pts', text: String(f.puntos) })
        ));
        panel.replaceChildren(
            datos.ronda ? h('p', { class: 'small', style: 'margin:0 0 10px;color:var(--text-faint)', text: terminada ? 'Clasificación final' : `Tras la ronda ${datos.ronda}` }) : null,
            h('div', { class: 'card table-card' }, h('div', { class: 'table-scroll' }, h('table', { class: 'standings' },
                h('caption', { class: 'sr-only', text: esPilotos ? 'Clasificación de pilotos' : 'Clasificación de constructores' }),
                h('thead', null, h('tr', null,
                    h('th', { scope: 'col', class: 'pos', text: 'Pos' }),
                    h('th', { scope: 'col', text: esPilotos ? 'Piloto' : 'Equipo' }),
                    h('th', { scope: 'col', class: 'num', text: 'Victorias' }),
                    h('th', { scope: 'col', class: 'num', text: 'Puntos' })
                )),
                h('tbody', null, cuerpo)
            )))
        );
    }

    /* -------------------------------------------------------------- Control */
    let pedido = 0;

    function pintar() {
        const token = ++pedido;
        document.getElementById('t-title').textContent = `Temporada ${anio}`;
        document.title = `Temporada ${anio} de F1 | Formula 1 Fans Global`;
        select.value = String(anio);
        document.getElementById('t-prev').disabled = anio <= MIN;
        document.getElementById('t-next').disabled = anio >= ACTUAL + 1;
        tabs.forEach((t) => {
            const on = t.dataset.tab === tab;
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', String(on));
            t.tabIndex = on ? 0 : -1;
        });
        panel.setAttribute('aria-labelledby', 'tab-' + tab);
        panel.replaceChildren(cargando());
        history.replaceState(null, '', urlTemporada());

        if (tab === 'calendario') pintarCalendario(token);
        else pintarClasificacion(tab, token);
    }

    function irA(nuevo) {
        if (nuevo < MIN || nuevo > ACTUAL + 1) return;
        anio = nuevo;
        pintar();
    }

    // Selector de años
    for (let y = ACTUAL + 1; y >= MIN; y--) select.appendChild(h('option', { value: String(y), text: String(y) }));
    select.addEventListener('change', () => irA(Number(select.value)));
    document.getElementById('t-prev').addEventListener('click', () => irA(anio - 1));
    document.getElementById('t-next').addEventListener('click', () => irA(anio + 1));

    tabs.forEach((t, i) => {
        t.addEventListener('click', () => { tab = t.dataset.tab; pintar(); });
        t.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const sig = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
            sig.focus();
            tab = sig.dataset.tab;
            pintar();
        });
    });

    pintar();
})();
