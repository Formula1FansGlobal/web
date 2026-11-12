// historia.js - "Historia viva": línea del tiempo de la F1 en la portada.
//
// Contenido:
//   1) Eventos curados en data/historia.json (hitos, seguridad, técnica, campeonatos).
//   2) Campeones desde AUTO_DESDE agregados automáticamente desde la API (no son noticias: es historia que se escribe sola).
//   3) Tarjeta "Un día como hoy" (aniversarios del propio JSON) y tarjeta de la temporada en curso.
//
// Todo el texto se inserta con textContent (F1UI.h); nunca innerHTML.

(function () {
    'use strict';

    const { h } = window.F1UI;
    const D = window.F1Data;

    const AUTO_DESDE = 2025;   // a partir de este año los campeones se agregan solos
    const LOTE = 8;            // eventos visibles por tanda

    const CATEGORIAS = {
        todo:       { etiqueta: 'Todo',        intro: 'Desde el primer Gran Premio en Silverstone hasta la nueva era de 2026.' },
        hito:       { etiqueta: 'Hitos',       intro: 'Los momentos que cambiaron el rumbo del deporte.' },
        seguridad:  { etiqueta: 'Seguridad',   intro: 'La seguridad es la gran historia de la F1: casi cada norma de protección nació de una lección aprendida. Aquí están los momentos clave y lo que cambió después.' },
        tecnica:    { etiqueta: 'Técnica',     intro: 'Ideas, motores y diseños que reinventaron los monoplazas.' },
        campeonato: { etiqueta: 'Campeonatos', intro: 'Títulos decididos por detalles, récords y remontadas inolvidables.' }
    };
    const ETIQUETA_CAT = { hito: 'Hito', seguridad: 'Seguridad', tecnica: 'Técnica', campeonato: 'Campeonato' };
    const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const lista = document.getElementById('hist');
    const chips = document.getElementById('hist-chips');
    const intro = document.getElementById('hist-intro');
    const btnMas = document.getElementById('hist-more');
    const btnOrden = document.getElementById('hist-order');
    if (!lista || !chips || !btnMas || !btnOrden) return;

    let eventos = [];
    let filtro = 'todo';
    let reciente = false;  // false = del más antiguo al más reciente
    let visibles = LOTE;

    /* --------------------------------------------------------- utilidades */
    function fechaLarga(e) {
        if (!e.fecha || !/^\d{2}-\d{2}$/.test(e.fecha)) return '';
        const [m, d] = e.fecha.split('-').map(Number);
        return MESES[m - 1] ? `${d} de ${MESES[m - 1]} de ${e.anio}` : '';
    }

    function ordenados() {
        const arr = eventos.filter((e) => filtro === 'todo' || e.categoria === filtro);
        arr.sort((a, b) => (a.anio - b.anio) || String(a.fecha || '99-99').localeCompare(String(b.fecha || '99-99')));
        return reciente ? arr.reverse() : arr;
    }

    /* ------------------------------------------------------------ tarjetas */
    function tarjeta(e) {
        const fecha = fechaLarga(e);
        const insignias = [h('span', { class: 'hist-badge', text: ETIQUETA_CAT[e.categoria] || e.categoria })];
        if (e.auto) insignias.push(h('span', { class: 'hist-badge hist-badge--auto', title: 'Se agrega automáticamente desde los datos de la temporada', text: 'Automático' }));

        return h('li', { class: `hist-item cat-${e.categoria}`, id: `h-${e.id}` },
            h('article', { class: 'hist-card' },
                h('div', { class: 'hist-top' },
                    h('span', { class: 'hist-year', text: String(e.anio) }),
                    h('div', { class: 'hist-badges' }, insignias)
                ),
                fecha ? h('p', { class: 'hist-date', text: fecha }) : null,
                h('h3', { text: e.titulo }),
                h('p', { text: e.texto }),
                e.cambio ? h('div', { class: 'hist-cambio' }, h('strong', { text: 'Lo que cambió' }), h('span', { text: e.cambio })) : null
            )
        );
    }

    const observador = ('IntersectionObserver' in window)
        ? new IntersectionObserver((entradas) => {
            entradas.forEach((en) => {
                if (en.isIntersecting) { en.target.classList.add('is-in'); observador.unobserve(en.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
        : null;

    function pintar() {
        const todos = ordenados();
        const mostrar = todos.slice(0, visibles);
        intro.textContent = CATEGORIAS[filtro].intro;

        const nodos = mostrar.map(tarjeta);
        lista.replaceChildren(...nodos);
        nodos.forEach((n) => (observador ? observador.observe(n) : n.classList.add('is-in')));

        const restantes = todos.length - mostrar.length;
        btnMas.hidden = restantes <= 0;
        btnMas.textContent = `Ver más (${restantes} más)`;
    }

    function pintarChips() {
        chips.replaceChildren(...Object.entries(CATEGORIAS).map(([clave, c]) => {
            const n = clave === 'todo' ? eventos.length : eventos.filter((e) => e.categoria === clave).length;
            const b = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(clave === filtro) }, `${c.etiqueta} · ${n}`);
            b.addEventListener('click', () => { filtro = clave; visibles = LOTE; pintarChips(); pintar(); });
            return b;
        }));
    }

    btnMas.addEventListener('click', () => { visibles += LOTE; pintar(); });
    btnOrden.addEventListener('click', () => {
        reciente = !reciente;
        btnOrden.setAttribute('aria-pressed', String(reciente));
        btnOrden.textContent = reciente ? '↑ Del más reciente al más antiguo' : '↓ Del más antiguo al más reciente';
        visibles = LOTE;
        pintar();
    });

    /* ------------------------------------------------- Un día como hoy */
    function proximoAniversario(ahora) {
        let mejor = null;
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        eventos.forEach((e) => {
            if (!e.fecha || !/^\d{2}-\d{2}$/.test(e.fecha)) return;
            const [m, d] = e.fecha.split('-').map(Number);
            let cumple = new Date(hoy.getFullYear(), m - 1, d);
            if (cumple < hoy) cumple = new Date(hoy.getFullYear() + 1, m - 1, d);
            const dias = Math.round((cumple - hoy) / 86400000);
            const anios = cumple.getFullYear() - e.anio;
            if (anios > 0 && (!mejor || dias < mejor.dias)) mejor = { e, dias, anios };
        });
        return mejor;
    }

    function irAlEvento(id) {
        filtro = 'todo';
        // Mostrar suficientes eventos para que el elegido esté renderizado
        const todos = ordenados();
        const idx = todos.findIndex((x) => x.id === id);
        if (idx >= visibles) visibles = idx + 1;
        pintarChips();
        pintar();
        const el = document.getElementById('h-' + id);
        if (!el) return;
        el.classList.add('is-in', 'is-target');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.classList.remove('is-target'), 3500);
    }

    function pintarHoy() {
        const r = proximoAniversario(new Date());
        const caja = document.getElementById('ahora-hoy');
        if (!r) return false;
        const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
        const cuando = r.dias === 0
            ? `Hoy se cumplen ${plural(r.anios, 'año', 'años')}`
            : `En ${plural(r.dias, 'día', 'días')} se cumplen ${plural(r.anios, 'año', 'años')}`;
        const btn = h('button', { type: 'button', class: 'link-btn' }, 'Ver en la línea del tiempo →');
        btn.addEventListener('click', () => irAlEvento(r.e.id));
        caja.replaceChildren(
            h('p', { class: 'eyebrow', text: r.dias === 0 ? 'Un día como hoy' : 'Próximo aniversario' }),
            h('h3', { text: `${r.e.anio}: ${r.e.titulo}` }),
            h('p', { text: cuando }),
            btn
        );
        caja.hidden = false;
        return true;
    }

    /* ----------------------------------------------- Temporada en curso */
    async function pintarEnCurso() {
        const caja = document.getElementById('ahora-curso');
        try {
            const d = await D.getClasificacion('pilotos');
            if (!d.filas.length || !d.ronda) return false;
            const lider = d.filas[0];
            caja.replaceChildren(
                h('p', { class: 'eyebrow', text: `Temporada ${d.temporada} en curso` }),
                h('h3', { text: `${lider.nombre} lidera el campeonato` }),
                h('p', { text: `${lider.equipo ? lider.equipo + ' · ' : ''}${lider.puntos} puntos y ${lider.victorias} ${lider.victorias === 1 ? 'victoria' : 'victorias'} tras la ronda ${d.ronda}.` }),
                h('a', { class: 'link-btn', href: '#clasificacion', text: 'Ver la clasificación completa →' })
            );
            caja.hidden = false;
            return true;
        } catch (e) {
            return false;
        }
    }

    /* ------------------------------------ Campeones automáticos (API) */
    async function temporadaTerminada(anio) {
        const actual = new Date().getFullYear();
        if (anio < actual) return true;
        if (anio > actual) return false;
        try {
            const cal = await D.getCalendario(anio);
            if (!cal.length) return false;
            const ultima = cal[cal.length - 1].iso;
            return ultima < new Date().toISOString().slice(0, 10);
        } catch (e) {
            return false;
        }
    }

    async function campeonesAutomaticos() {
        const actual = new Date().getFullYear();
        const conManual = new Set(eventos.filter((e) => e.categoria === 'campeonato').map((e) => e.anio));
        const anios = [];
        for (let y = AUTO_DESDE; y <= actual; y++) if (!conManual.has(y)) anios.push(y);

        const nuevos = await Promise.all(anios.map(async (y) => {
            try {
                if (!(await temporadaTerminada(y))) return null;
                const [pil, con] = await Promise.allSettled([D.getClasificacion('pilotos', y), D.getClasificacion('constructores', y)]);
                const p = pil.status === 'fulfilled' && pil.value.filas[0];
                if (!p) return null;
                const c = con.status === 'fulfilled' && con.value.filas[0];
                const texto = `${p.nombre}${p.equipo ? ' (' + p.equipo + ')' : ''} cierra la temporada ${y} como campeón de pilotos, con ${p.puntos} puntos y ${p.victorias} ${p.victorias === 1 ? 'victoria' : 'victorias'}.`
                    + (c ? ` El título de constructores es para ${c.nombre}.` : '');
                return { id: `auto-${y}`, anio: y, categoria: 'campeonato', auto: true, titulo: `${p.nombre}, campeón del mundo ${y}`, texto };
            } catch (e) {
                return null;
            }
        }));
        return nuevos.filter(Boolean);
    }

    /* --------------------------------------------------------- Arranque */
    async function iniciar() {
        try {
            const res = await fetch('data/historia.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const j = await res.json();
            eventos = (Array.isArray(j.eventos) ? j.eventos : []).filter((e) => e && e.id && e.anio && e.titulo && e.texto && CATEGORIAS[e.categoria]);
        } catch (e) {
            console.warn('historia: no se pudo leer historia.json', e);
            lista.replaceChildren(h('li', null, h('p', { class: 'notice', text: 'No pudimos cargar la historia en este momento. Intenta de nuevo más tarde.' })));
            return;
        }

        pintarChips();
        pintar();

        const [hoy, curso, auto] = await Promise.all([Promise.resolve(pintarHoy()), pintarEnCurso(), campeonesAutomaticos()]);
        if (hoy || curso) document.getElementById('ahora').hidden = false;
        if (auto.length) {
            eventos = eventos.concat(auto);
            pintarChips();
            pintar();
        }
    }

    iniciar();
})();
