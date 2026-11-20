// home-favoritos.js - Tarjetas "Tu piloto y tu equipo" de la portada.
// Usa solo el piloto/equipo guardados en este navegador (js/favoritos.js) y datos públicos de la API.

(function () {
    'use strict';

    const { h } = window.F1UI;
    const X = window.F1Extra;
    const F = window.F1Fav;
    const caja = document.getElementById('fav-card');
    if (!caja || !X || !F) return;

    const RUTA = 'html/paginas/';

    function vacio(tipo) {
        const piloto = tipo === 'piloto';
        return h('div', { class: 'entity' },
            h('span', { class: 'num-big', text: '☆' }),
            h('h3', { text: piloto ? 'Tu piloto' : 'Tu equipo' }),
            h('p', { text: 'Elige un piloto y un equipo favoritos y los verás aquí, con su posición en el campeonato.' }),
            h('div', { class: 'meta' }, h('a', { class: 'link-arrow', href: RUTA + (piloto ? 'pilotos.html' : 'equipos.html'), text: piloto ? 'Elegir mi piloto' : 'Elegir mi equipo' }))
        );
    }

    function tarjeta(tipo, fav, dato) {
        const piloto = tipo === 'piloto';
        const quitar = h('button', { type: 'button', class: 'btn btn--ghost', text: 'Quitar', style: 'padding:6px 14px;font-size:0.8rem' });
        const t = h('a', { class: 'entity', href: `${RUTA}${piloto ? 'pilotos' : 'equipos'}.html?id=${encodeURIComponent(fav.id)}` },
            h('span', { class: 'fav-mark', 'aria-hidden': 'true', text: '★' }),
            h('span', { class: 'num-big', text: dato && dato.pos ? `P${dato.pos}` : '—' }),
            h('h3', { text: fav.nombre }),
            h('p', { text: dato && dato.pos ? `${dato.puntos} pts · ${dato.victorias} victorias` : 'Aún no tiene puntos esta temporada' })
        );
        const envoltura = h('div', { style: 'display:grid;gap:8px' }, t, quitar);
        quitar.addEventListener('click', () => { F.alternar(tipo, fav.id, fav.nombre); pintar(); });
        return envoltura;
    }

    async function pintar() {
        const fav = F.get();
        const hijos = [];
        let pilotos = [];
        let equipos = [];
        try {
            if (fav.piloto) pilotos = await X.getPilotos(X.ANIO);
            if (fav.equipo) equipos = await X.getEquipos(X.ANIO);
        } catch (e) { /* se muestra sin posición */ }
        hijos.push(fav.piloto ? tarjeta('piloto', fav.piloto, pilotos.find((p) => p.id === fav.piloto.id)) : vacio('piloto'));
        hijos.push(fav.equipo ? tarjeta('equipo', fav.equipo, equipos.find((e) => e.id === fav.equipo.id)) : vacio('equipo'));
        caja.replaceChildren(...hijos);
    }

    pintar();
})();
