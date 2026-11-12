// sesiones.js - Página de sesiones: horario en hora local, cuenta regresiva y últimos resultados.
// Depende de js/f1-data.js (F1Data / F1UI).

(function () {
    'use strict';

    const { h, formatearSesion, zonaHoraria, cuentaRegresiva, dosDigitos } = window.F1UI;
    const D = window.F1Data;

    // Duración aproximada (min) para marcar una sesión como "en curso (estimado)"
    const DURACION = { FirstPractice: 60, SecondPractice: 60, ThirdPractice: 60, SprintQualifying: 45, SprintShootout: 45, Sprint: 45, Qualifying: 70, Race: 120, manual: 60 };

    function estadoSesion(s, ahora, siguiente) {
        const fin = new Date(s.fecha.getTime() + (DURACION[s.clave] || 60) * 60000);
        if (ahora >= s.fecha && ahora < fin) return { clase: 'estado estado--live', texto: 'En curso (aprox.)', fila: 'is-next' };
        if (ahora >= fin) return { clase: 'estado estado--done', texto: 'Finalizada', fila: '' };
        if (s === siguiente) return { clase: 'estado estado--next', texto: 'Próxima', fila: 'is-next' };
        return { clase: 'estado', texto: 'Pendiente', fila: '' };
    }

    function tablaHorario(carrera, siguiente) {
        const ahora = new Date();
        const filas = carrera.sesiones.map((s) => {
            const e = estadoSesion(s, ahora, siguiente);
            return h('tr', { class: 'horario-row ' + e.fila },
                h('th', { scope: 'row', class: 'pos', style: 'width:auto', text: s.nombre }),
                h('td', null, h('time', { datetime: s.fecha.toISOString(), text: formatearSesion(s.fecha) })),
                h('td', { class: 'num' }, h('span', { class: e.clase, text: e.texto }))
            );
        });
        return h('div', { class: 'table-scroll' },
            h('table', { class: 'standings' },
                h('caption', { class: 'sr-only', text: 'Horario de sesiones en tu hora local' }),
                h('thead', null, h('tr', null,
                    h('th', { scope: 'col', text: 'Sesión' }),
                    h('th', { scope: 'col', text: 'Fecha y hora (local)' }),
                    h('th', { scope: 'col', class: 'num', text: 'Estado' })
                )),
                h('tbody', null, filas)
            )
        );
    }

    function iniciarCuenta(siguiente) {
        const box = document.getElementById('big-count');
        document.getElementById('big-label').textContent = `${siguiente.nombre} · ${formatearSesion(siguiente.fecha)}`;
        cuentaRegresiva(
            siguiente.fecha,
            ({ d, h: hh, m, s }) => {
                document.getElementById('b-d').textContent = dosDigitos(d);
                document.getElementById('b-h').textContent = dosDigitos(hh);
                document.getElementById('b-m').textContent = dosDigitos(m);
                document.getElementById('b-s').textContent = dosDigitos(s);
            },
            () => {
                box.classList.add('is-message');
                box.replaceChildren(h('p', { class: 'big-count-msg', text: `¡${siguiente.nombre} ya comenzó! Recarga la página para ver la siguiente sesión.` }));
            }
        );
    }

    function mensajeCuenta(texto) {
        const box = document.getElementById('big-count');
        box.classList.add('is-message');
        box.replaceChildren(h('p', { class: 'big-count-msg', text: texto }));
    }

    async function cargarHorario() {
        const titulo = document.getElementById('gp-title');
        const sub = document.getElementById('gp-sub');
        const panel = document.getElementById('horario');

        let carrera = null;
        try {
            carrera = await D.getProximaCarrera();
        } catch (e) {
            console.warn('sesiones: no se pudo leer la próxima carrera', e);
        }
        if (!carrera || !D.siguienteSesion(carrera)) {
            const manual = await D.getProximaManual('../../');
            if (manual && D.siguienteSesion(manual)) carrera = manual;
        }

        titulo.classList.remove('skeleton');
        if (!carrera || !carrera.sesiones.length) {
            titulo.textContent = 'Calendario por confirmar';
            sub.textContent = 'No pudimos obtener el calendario de sesiones en este momento.';
            mensajeCuenta('Consulta el calendario oficial en formula1.com.');
            panel.replaceChildren(h('p', { class: 'notice', text: 'Sin datos disponibles por ahora. Intenta de nuevo en unos minutos.' }));
            return;
        }

        titulo.textContent = carrera.nombre;
        sub.textContent = [carrera.ronda ? `Ronda ${carrera.ronda}` : '', carrera.circuito, carrera.lugar].filter(Boolean).join(' · ');
        const tz = zonaHoraria();
        document.getElementById('tz-note').textContent = tz ? `Todos los horarios están en tu zona horaria (${tz}).` : 'Todos los horarios están en tu zona horaria.';

        const siguiente = D.siguienteSesion(carrera);
        panel.replaceChildren(tablaHorario(carrera, siguiente));
        const futuras = carrera.sesiones.filter((s) => s.fecha > new Date());
        if (futuras.length) {
            const btn = h('button', { type: 'button', class: 'btn btn--ghost', style: 'margin-top:16px' }, '📅 Agregar sesiones a mi calendario (.ics)');
            btn.addEventListener('click', () => {
                const ics = D.generarICS({ ...carrera, sesiones: futuras });
                const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
                const a = h('a', { href: url, download: 'sesiones-f1.ics' });
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });
            panel.after(btn);
        }
        if (siguiente) iniciarCuenta(siguiente);
        else mensajeCuenta('El fin de semana de carrera ya terminó.');
    }

    async function cargarUltima() {
        try {
            const r = await D.getUltimoResultado();
            if (!r || !r.filas.length) return;
            document.getElementById('ultima-nombre').textContent = r.nombre;
            const cuerpo = r.filas.slice(0, 10).map((f) => h('tr', null,
                h('td', { class: 'pos', text: String(f.pos) }),
                h('td', { class: 'who' }, h('strong', { text: f.nombre }), h('small', { text: f.equipo })),
                h('td', { class: 'num', text: f.tiempo }),
                h('td', { class: 'num pts', text: String(f.puntos) })
            ));
            document.getElementById('ultima-tabla').replaceChildren(
                h('div', { class: 'table-scroll' }, h('table', { class: 'standings' },
                    h('caption', { class: 'sr-only', text: 'Resultado de la última carrera' }),
                    h('thead', null, h('tr', null,
                        h('th', { scope: 'col', class: 'pos', text: 'Pos' }),
                        h('th', { scope: 'col', text: 'Piloto' }),
                        h('th', { scope: 'col', class: 'num', text: 'Tiempo / estado' }),
                        h('th', { scope: 'col', class: 'num', text: 'Pts' })
                    )),
                    h('tbody', null, cuerpo)
                ))
            );
            document.getElementById('ultima').hidden = false;
        } catch (e) {
            console.warn('sesiones: resultados no disponibles', e);
        }
    }

    cargarHorario();
    cargarUltima();
})();
