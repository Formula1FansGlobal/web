// carrera.js - Detalle de un Gran Premio: resultados, clasificación y videos.
// URL: carrera.html?year=2026&round=22

(function () {
    'use strict';

    const { h, tarjetaVideo } = window.F1UI;
    const D = window.F1Data;

    const params = new URLSearchParams(window.location.search);
    const anio = /^(19[5-9]\d|20\d\d)$/.test(params.get('year') || '') ? params.get('year') : '';
    const ronda = /^\d{1,2}$/.test(params.get('round') || '') ? params.get('round') : '';

    const panel = document.getElementById('r-panel');
    const tabs = Array.from(document.querySelectorAll('.tabs .tab'));
    let datos = null;
    let tab = 'carrera';

    function aviso(t) { return h('p', { class: 'notice', text: t }); }

    function tabla(caption, columnas, filas) {
        return h('div', { class: 'card table-card' }, h('div', { class: 'table-scroll' }, h('table', { class: 'standings' },
            h('caption', { class: 'sr-only', text: caption }),
            h('thead', null, h('tr', null, columnas.map((c) => h('th', { scope: 'col', class: c.clase || '', text: c.texto })))),
            h('tbody', null, filas)
        )));
    }

    function vistaCarrera() {
        if (!datos.resultados.length) return aviso('Aún no hay resultados para esta carrera.');
        return tabla('Resultado de la carrera',
            [{ texto: 'Pos', clase: 'pos' }, { texto: 'Piloto' }, { texto: 'Parrilla', clase: 'num' }, { texto: 'Vueltas', clase: 'num' }, { texto: 'Tiempo / estado', clase: 'num' }, { texto: 'Pts', clase: 'num' }],
            datos.resultados.map((r) => h('tr', null,
                h('td', { class: 'pos', text: String(r.pos) }),
                h('td', { class: 'who' }, h('strong', { text: r.nombre }), h('small', { text: r.equipo })),
                h('td', { class: 'num', text: r.parrilla ? String(r.parrilla) : 'Pit' }),
                h('td', { class: 'num', text: String(r.vueltas) }),
                h('td', { class: 'num', text: r.tiempo }),
                h('td', { class: 'num pts', text: String(r.puntos) })
            )));
    }

    function vistaClasif() {
        if (!datos.clasificacion.length) return aviso('No hay datos de clasificación para esta carrera (la API los tiene desde 1994 aproximadamente).');
        return tabla('Resultado de la clasificación',
            [{ texto: 'Pos', clase: 'pos' }, { texto: 'Piloto' }, { texto: 'Q1', clase: 'num' }, { texto: 'Q2', clase: 'num' }, { texto: 'Q3', clase: 'num' }],
            datos.clasificacion.map((r) => h('tr', null,
                h('td', { class: 'pos', text: String(r.pos) }),
                h('td', { class: 'who' }, h('strong', { text: r.nombre }), h('small', { text: r.equipo })),
                h('td', { class: 'num', text: r.q1 || '—' }),
                h('td', { class: 'num', text: r.q2 || '—' }),
                h('td', { class: 'num', text: r.q3 || '—' })
            )));
    }

    async function vistaVideos() {
        let lista = [];
        try {
            const res = await fetch('../../data/videos.json', { cache: 'no-cache' });
            if (res.ok) {
                const j = await res.json();
                lista = (Array.isArray(j.videos) ? j.videos : []).filter((v) => v && v.carrera === `${anio}-${ronda}`);
            }
        } catch (e) { /* sin videos */ }
        const tarjetas = lista.map(tarjetaVideo).filter(Boolean);
        if (!tarjetas.length) {
            return h('div', { class: 'card video-empty' },
                h('h3', { text: 'Aún no hay videos de este Gran Premio' }),
                h('p', { text: 'Para ver la carrera completa usa los canales oficiales. Aquí publicaremos nuestros análisis y resúmenes.' }),
                h('a', { class: 'btn btn--primary', href: 'https://f1tv.formula1.com/', target: '_blank', rel: 'noopener noreferrer', text: 'F1 TV (oficial)' })
            );
        }
        return h('div', { class: 'video-grid' }, tarjetas);
    }

    async function pintar() {
        tabs.forEach((t) => {
            const on = t.dataset.tab === tab;
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', String(on));
            t.tabIndex = on ? 0 : -1;
        });
        panel.setAttribute('aria-labelledby', 'rtab-' + tab);
        if (!datos) return;
        if (tab === 'carrera') panel.replaceChildren(vistaCarrera());
        else if (tab === 'clasif') panel.replaceChildren(vistaClasif());
        else panel.replaceChildren(await vistaVideos());
    }

    tabs.forEach((t, i) => {
        t.addEventListener('click', () => { tab = t.dataset.tab; pintar(); });
        t.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const sig = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
            sig.focus(); tab = sig.dataset.tab; pintar();
        });
    });

    async function iniciar() {
        const titulo = document.getElementById('r-title');
        document.getElementById('r-back').href = `calendario_temporada.html?year=${anio || ''}`;
        if (!anio || !ronda) {
            titulo.classList.remove('skeleton');
            titulo.textContent = 'Gran Premio no encontrado';
            panel.replaceChildren(aviso('Elige una carrera desde el calendario de una temporada.'));
            return;
        }
        try {
            datos = await D.getCarrera(anio, ronda);
        } catch (e) {
            console.warn('carrera: no disponible', e);
        }
        titulo.classList.remove('skeleton');
        if (!datos) {
            titulo.textContent = 'Gran Premio no disponible';
            panel.replaceChildren(aviso('No pudimos cargar esta carrera. Puede que aún no se haya disputado o que la consulta falló. Intenta de nuevo más tarde.'));
            return;
        }

        titulo.textContent = datos.nombre;
        document.title = `${datos.nombre} ${datos.temporada} | Formula 1 Fans Global`;
        document.getElementById('r-eyebrow').textContent = `Temporada ${datos.temporada} · Ronda ${datos.ronda}`;
        const fecha = datos.fecha ? new Date(datos.fecha + 'T00:00:00Z').toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
        document.getElementById('r-meta').replaceChildren(
            ...[fecha, datos.circuito, datos.lugar].filter(Boolean).map((t) => h('span', { class: 'badge', text: t }))
        );

        const rondaN = Number(ronda);
        const nav = document.querySelector('.race-nav');
        if (rondaN > 1) nav.prepend(h('a', { class: 'link-arrow', href: `carrera.html?year=${anio}&round=${rondaN - 1}`, text: 'Carrera anterior' }));
        nav.append(h('a', { class: 'link-arrow', href: `carrera.html?year=${anio}&round=${rondaN + 1}`, text: 'Siguiente carrera' }));

        pintar();
    }

    iniciar();
})();
