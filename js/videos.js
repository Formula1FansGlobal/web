// videos.js - Galería de videos de YouTube (youtube-nocookie) con carga bajo demanda.
//
// Lee data/videos.json. Solo se aceptan IDs de YouTube válidos (11 caracteres).
// El iframe NO se crea hasta que la persona hace clic (privacidad y rendimiento).
// La tarjeta se construye en F1UI.tarjetaVideo (js/f1-data.js).

(function () {
    'use strict';

    const { h, tarjetaVideo } = window.F1UI;
    const grid = document.getElementById('video-grid');
    const chips = document.getElementById('chips');
    if (!grid) return;

    let todos = [];
    let filtro = 'Todos';

    function vacio() {
        return h('div', { class: 'video-empty card' },
            h('h3', { text: 'Muy pronto, más videos' }),
            h('p', { text: 'Estamos preparando análisis y resúmenes de cada Gran Premio. Mientras tanto, síguenos en YouTube.' }),
            h('a', { class: 'btn btn--primary', href: 'https://www.youtube.com/@F1FansC11MX', target: '_blank', rel: 'noopener noreferrer', text: 'Ir a nuestro canal' })
        );
    }

    function pintar() {
        const lista = filtro === 'Todos' ? todos : todos.filter((v) => v.categoria === filtro);
        const tarjetas = lista.map(tarjetaVideo).filter(Boolean);
        grid.replaceChildren(...(tarjetas.length ? tarjetas : [vacio()]));
    }

    function pintarChips() {
        const cats = Array.from(new Set(todos.map((v) => v.categoria).filter(Boolean)));
        if (cats.length < 2) { chips.hidden = true; return; }
        chips.hidden = false;
        chips.replaceChildren(...['Todos', ...cats].map((c) => {
            const b = h('button', { class: 'chip', type: 'button', 'aria-pressed': String(c === filtro), text: c });
            b.addEventListener('click', () => {
                filtro = c;
                chips.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', String(x.textContent === c)));
                pintar();
            });
            return b;
        }));
    }

    async function cargar() {
        try {
            const res = await fetch('../../data/videos.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const datos = await res.json();
            todos = (Array.isArray(datos.videos) ? datos.videos : [])
                .filter((v) => v && v.titulo)
                .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
        } catch (e) {
            console.warn('videos: no se pudo leer videos.json', e);
            todos = [];
        }
        pintarChips();
        pintar();
    }

    cargar();
})();
