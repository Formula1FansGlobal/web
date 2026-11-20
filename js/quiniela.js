// quiniela.js - Pronósticos de podio y pole, guardados solo en este navegador.
// Puntos: acierto exacto de cada puesto del podio = 3, piloto en el podio pero en otro puesto = 1, pole = 2.

(function () {
    'use strict';

    const { h, aviso, tablaUI } = window.F1UI;
    const D = window.F1Data;
    const X = window.F1Extra;
    const raiz = document.getElementById('q-contenido');
    const CLAVE = 'f1fg:quiniela';
    const CAMPOS = [['pole', 'Pole position'], ['p1', '1.º lugar'], ['p2', '2.º lugar'], ['p3', '3.º lugar']];

    /* ------------------------------------------------------- almacenamiento */
    function leer() {
        try {
            const v = JSON.parse(localStorage.getItem(CLAVE) || '{}');
            const limpio = {};
            Object.keys(v).forEach((k) => {
                if (!/^\d{4}-\d{1,2}$/.test(k)) return;
                const e = v[k];
                if (!e || typeof e !== 'object') return;
                const fila = { nombre: String(e.nombre || '').slice(0, 60), fecha: String(e.fecha || '').slice(0, 30) };
                let ok = true;
                CAMPOS.forEach(([c]) => {
                    if (typeof e[c] === 'string' && e[c].length <= 60) fila[c] = e[c]; else ok = false;
                });
                if (ok) limpio[k] = fila;
            });
            return limpio;
        } catch (e) {
            return {};
        }
    }
    function guardar(v) {
        try { localStorage.setItem(CLAVE, JSON.stringify(v)); return true; } catch (e) { return false; }
    }

    /* ---------------------------------------------------------- puntuación */
    function puntuar(p, real) {
        const podio = real.resultados.filter((r) => r.pos >= 1 && r.pos <= 3).sort((a, b) => a.pos - b.pos).map((r) => r.nombre);
        const poleReal = (real.clasificacion.find((r) => r.pos === 1) || {}).nombre
            || (real.resultados.find((r) => r.parrilla === 1) || {}).nombre || '';
        let pts = 0;
        const detalle = {};
        ['p1', 'p2', 'p3'].forEach((c, i) => {
            if (p[c] === podio[i]) { pts += 3; detalle[c] = 'exacto'; }
            else if (podio.includes(p[c])) { pts += 1; detalle[c] = 'podio'; }
            else detalle[c] = 'fallo';
        });
        if (poleReal && p.pole === poleReal) { pts += 2; detalle.pole = 'exacto'; } else detalle.pole = 'fallo';
        return { pts, podio, poleReal, detalle };
    }

    /* -------------------------------------------------------------- interfaz */
    function selector(id, etiqueta, pilotos, valor, desactivado) {
        const s = h('select', { class: 'input', id, disabled: desactivado ? true : null },
            h('option', { value: '', text: 'Elige…' }),
            ...pilotos.map((p) => h('option', { value: p.nombre, selected: p.nombre === valor ? true : null, text: p.nombre })));
        return h('div', null, h('label', { for: id, text: etiqueta }), s);
    }

    function formulario(carrera, pilotos, llave, previa, cerrada) {
        const form = h('form', { novalidate: true },
            h('div', { class: 'picks' }, CAMPOS.map(([c, et]) => selector('q-' + c, et, pilotos, previa ? previa[c] : '', cerrada))),
            cerrada
                ? aviso('La carrera ya empezó: los pronósticos están cerrados.')
                : h('button', { type: 'submit', class: 'btn btn--primary', text: previa ? 'Actualizar pronóstico' : 'Guardar pronóstico' }),
            h('p', { class: 'data-credit', id: 'q-msg', role: 'status' })
        );
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const v = {};
            let falta = false;
            CAMPOS.forEach(([c]) => { v[c] = form.querySelector('#q-' + c).value; if (!v[c]) falta = true; });
            const msg = form.querySelector('#q-msg');
            if (falta) { msg.textContent = 'Completa los cuatro puestos.'; return; }
            if (new Set([v.p1, v.p2, v.p3]).size < 3) { msg.textContent = 'El podio no puede repetir pilotos.'; return; }
            const todo = leer();
            todo[llave] = Object.assign(v, { nombre: carrera.nombre, fecha: new Date().toISOString() });
            msg.textContent = guardar(todo) ? 'Pronóstico guardado en este navegador.' : 'No se pudo guardar (el navegador bloquea el almacenamiento).';
        });
        return form;
    }

    async function historial(cajaHist, actualLlave) {
        const todo = leer();
        const llaves = Object.keys(todo).filter((k) => k !== actualLlave).sort().reverse();
        if (!llaves.length) { cajaHist.replaceChildren(aviso('Cuando termine una carrera en la que hayas pronosticado, verás aquí tus puntos.')); return; }
        let total = 0;
        const filas = [];
        for (const k of llaves) {
            const [anio, ronda] = k.split('-');
            const p = todo[k];
            let real = null;
            try { real = await D.getCarrera(anio, ronda); } catch (e) { real = null; }
            if (!real || !real.resultados.length) {
                filas.push(h('tr', null, h('td', { text: p.nombre || k }), h('td', { class: 'num', text: '—' }), h('td', { class: 'small', text: 'Esperando resultado' })));
                continue;
            }
            const r = puntuar(p, real);
            total += r.pts;
            const marca = (c) => h('span', { class: r.detalle[c] === 'fallo' ? 'miss' : 'hit', text: p[c] });
            filas.push(h('tr', null,
                h('td', { class: 'who' }, h('strong', { text: real.nombre }), h('small', { text: `${anio}` })),
                h('td', { class: 'num pts', text: String(r.pts) }),
                h('td', { class: 'small' },
                    'Podio real: ', r.podio.join(', '), h('br'),
                    'Tu pronóstico: ', marca('p1'), ', ', marca('p2'), ', ', marca('p3'), ' · Pole: ', marca('pole'),
                    r.poleReal ? ` (real: ${r.poleReal})` : '')
            ));
        }
        cajaHist.replaceChildren(
            h('p', null, h('span', { class: 'score-big', text: String(total) }), ' puntos en total'),
            tablaUI('Historial de tu quiniela', [{ texto: 'Carrera' }, { texto: 'Pts', clase: 'num' }, { texto: 'Detalle' }], filas)
        );
    }

    (async function () {
        let carrera = null;
        let pilotos = [];
        try {
            [carrera, pilotos] = await Promise.all([D.getProximaCarrera(), X.getPilotos(X.ANIO)]);
        } catch (e) { console.warn("quiniela: sin datos", e); }

        const cajaHist = h('div', { 'aria-live': 'polite' }, h('div', { class: 'skeleton', style: 'height: 120px' }));
        const bloques = [];
        let llave = '';

        if (carrera && pilotos.length) {
            llave = `${carrera.temporada}-${carrera.ronda}`;
            const sesionCarrera = carrera.sesiones.find((s) => s.clave === 'Race');
            const cerrada = !!sesionCarrera && sesionCarrera.fecha <= new Date();
            const previa = leer()[llave];
            bloques.push(
                h('div', { class: 'card' },
                    h('p', { class: 'eyebrow', text: 'Próxima carrera' }),
                    h('h2', { text: carrera.nombre }),
                    sesionCarrera ? h('p', { text: `Carrera: ${window.F1UI.formatearSesion(sesionCarrera.fecha)} (${window.F1UI.zonaHoraria()})` }) : null,
                    formulario(carrera, pilotos, llave, previa, cerrada)
                )
            );
        } else {
            bloques.push(aviso('No pudimos cargar la próxima carrera ahora. Intenta de nuevo en unos minutos.'));
        }

        bloques.push(
            h('h2', { style: 'margin-top:32px', text: 'Tus puntos' }),
            h('p', { class: 'data-credit', text: 'Reglas: 3 puntos por cada puesto del podio exacto, 1 si el piloto sube al podio en otro puesto y 2 por la pole.' }),
            cajaHist
        );
        raiz.replaceChildren(...bloques);
        historial(cajaHist, '');
    })();
})();
