// home.js - Lógica de la portada: próxima sesión, clasificación y noticias.
// Depende de js/f1-data.js (F1Data / F1UI) y js/config.js (SITE_CONFIG).

(function () {
    'use strict';

    const { h, formatearSesion, zonaHoraria, cuentaRegresiva, dosDigitos } = window.F1UI;
    const D = window.F1Data;

    /* ------------------------------------------------ Próxima sesión (hero) */
    function pintarSesiones(carrera, siguiente) {
        const lista = document.getElementById('next-schedule');
        const ahora = new Date();
        lista.replaceChildren(
            ...carrera.sesiones.map((s) => h('li', {
                class: s === siguiente ? 'is-next' : (s.fecha < ahora ? 'is-past' : '')
            },
                h('span', { text: s.nombre }),
                h('time', { datetime: s.fecha.toISOString(), text: formatearSesion(s.fecha) })
            ))
        );
        const tz = zonaHoraria();
        document.getElementById('next-tz').textContent = tz ? `Horarios en tu zona: ${tz}` : '';
    }

    function pintarCuenta(carrera, siguiente) {
        const box = document.getElementById('next-count');
        const sub = document.getElementById('next-sub');
        sub.textContent = `${siguiente.nombre} · ${formatearSesion(siguiente.fecha)}`;
        cuentaRegresiva(
            siguiente.fecha,
            ({ d, h: hh, m, s }) => {
                document.getElementById('c-d').textContent = dosDigitos(d);
                document.getElementById('c-h').textContent = dosDigitos(hh);
                document.getElementById('c-m').textContent = dosDigitos(m);
                document.getElementById('c-s').textContent = dosDigitos(s);
            },
            () => {
                box.classList.add('is-done');
                box.replaceChildren(h('div', { text: '¡Ya comenzó ' + siguiente.nombre + '!' }));
            }
        );
    }

    function sinDatos(mensaje) {
        const title = document.getElementById('next-title');
        title.classList.remove('skeleton');
        title.textContent = 'Calendario por confirmar';
        document.getElementById('next-sub').textContent = mensaje;
        document.getElementById('next-count').hidden = true;
    }

    async function cargarProxima() {
        const title = document.getElementById('next-title');
        let carrera = null;
        try {
            carrera = await D.getProximaCarrera();
        } catch (e) {
            console.warn('home: no se pudo leer la próxima carrera', e);
        }
        if (!carrera || !D.siguienteSesion(carrera)) {
            const manual = await D.getProximaManual('');
            if (manual && D.siguienteSesion(manual)) carrera = manual;
        }
        const siguiente = carrera && D.siguienteSesion(carrera);
        if (!siguiente) {
            sinDatos('No hay una sesión próxima disponible. Consulta el calendario oficial.');
            return;
        }

        title.classList.remove('skeleton');
        title.textContent = carrera.nombre;
        pintarCuenta(carrera, siguiente);
        pintarSesiones(carrera, siguiente);
    }

    /* ------------------------------------------------------- Clasificación */
    function tablaClasificacion(datos, esPilotos) {
        const cabeza = h('tr', null,
            h('th', { scope: 'col', class: 'pos', text: 'Pos' }),
            h('th', { scope: 'col', text: esPilotos ? 'Piloto' : 'Equipo' }),
            h('th', { scope: 'col', class: 'num', text: 'Victorias' }),
            h('th', { scope: 'col', class: 'num', text: 'Puntos' })
        );
        const cuerpo = datos.filas.slice(0, 10).map((f) => h('tr', null,
            h('td', { class: 'pos', text: String(f.pos) }),
            h('td', { class: 'who' },
                h('strong', { text: f.nombre }),
                f.equipo ? h('small', { text: f.equipo }) : null
            ),
            h('td', { class: 'num', text: String(f.victorias) }),
            h('td', { class: 'num pts', text: String(f.puntos) })
        ));
        return h('div', { class: 'table-scroll' },
            h('table', { class: 'standings' },
                h('caption', { class: 'sr-only', text: esPilotos ? 'Clasificación de pilotos' : 'Clasificación de constructores' }),
                h('thead', null, cabeza),
                h('tbody', null, cuerpo)
            )
        );
    }

    async function cargarClasificacion(tipo) {
        const panel = document.getElementById('clasif-panel');
        const esPilotos = tipo === 'pilotos';
        panel.setAttribute('aria-labelledby', esPilotos ? 'tab-pilotos' : 'tab-constructores');
        panel.replaceChildren(h('div', { class: 'skeleton', style: 'height: 260px' }));
        try {
            const datos = await D.getClasificacion(tipo);
            if (!datos.filas.length) {
                panel.replaceChildren(h('p', { class: 'notice', text: 'Aún no hay clasificación disponible para esta temporada.' }));
                return;
            }
            if (datos.temporada) document.getElementById('clasif-temporada').textContent = datos.temporada;
            document.getElementById('clasif-ronda').textContent = datos.ronda ? `Tras la ronda ${datos.ronda}` : '';
            panel.replaceChildren(tablaClasificacion(datos, esPilotos));
        } catch (e) {
            console.warn('home: clasificación no disponible', e);
            panel.replaceChildren(h('p', { class: 'notice', text: 'No pudimos cargar la clasificación en este momento. Intenta de nuevo en unos minutos.' }));
        }
    }

    function iniciarTabs() {
        const tabs = Array.from(document.querySelectorAll('.tabs .tab'));
        function activar(tab) {
            tabs.forEach((t) => {
                const on = t === tab;
                t.classList.toggle('is-active', on);
                t.setAttribute('aria-selected', String(on));
                t.tabIndex = on ? 0 : -1;
            });
            cargarClasificacion(tab.dataset.tipo);
        }
        tabs.forEach((t, i) => {
            t.addEventListener('click', () => activar(t));
            t.addEventListener('keydown', (e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
                next.focus();
                activar(next);
            });
        });
        cargarClasificacion('pilotos');
    }

    /* ------------------------------------------------------------- Noticias */
    function esHttps(u) {
        try { return new URL(u).protocol === 'https:'; } catch (e) { return false; }
    }

    async function cargarNoticias() {
        const endpoint = (window.SITE_CONFIG && window.SITE_CONFIG.newsEndpoint) || '';
        if (!endpoint) return; // sin proxy configurado la sección permanece oculta
        try {
            const res = await fetch(endpoint, { headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const datos = await res.json();
            const items = (Array.isArray(datos.results) ? datos.results : [])
                .filter((n) => n.title && esHttps(n.link))
                .slice(0, 3);
            if (!items.length) return;

            const grid = document.getElementById('news-grid');
            grid.replaceChildren(...items.map((n) => {
                const desc = String(n.description || '').replace(/\s+/g, ' ').trim();
                return h('a', { class: 'news-item', href: n.link, target: '_blank', rel: 'noopener noreferrer nofollow' },
                    h('h3', { text: n.title }),
                    desc ? h('p', { text: desc.length > 140 ? desc.slice(0, 139).trimEnd() + '…' : desc }) : null,
                    h('span', { class: 'news-meta', text: n.source_name ? 'Fuente: ' + n.source_name : 'Leer en la fuente original' })
                );
            }));
            document.getElementById('noticias-home').hidden = false;
        } catch (e) {
            console.warn('home: noticias no disponibles', e);
        }
    }

    /* --------------------------------------------------------------- Podio */
    async function cargarPodio() {
        try {
            const r = await D.getUltimoResultado();
            if (!r || r.filas.length < 3) return;
            document.getElementById('podio-nombre').textContent = r.nombre;
            document.getElementById('podio').replaceChildren(...r.filas.slice(0, 3).map((f) =>
                h('li', { class: 'podium-item podium-' + f.pos },
                    h('span', { class: 'podium-pos', text: String(f.pos) }),
                    h('strong', { text: f.nombre }),
                    h('span', { text: f.equipo }),
                    h('small', { text: f.tiempo })
                )
            ));
            document.getElementById('podio-sec').hidden = false;
        } catch (e) {
            console.warn('home: podio no disponible', e);
        }
    }

    cargarProxima();
    cargarPodio();
    iniciarTabs();
    cargarNoticias();
})();
