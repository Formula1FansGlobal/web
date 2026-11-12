// videos.js - Galería de videos de YouTube (youtube-nocookie) con carga bajo demanda.
//
// Lee data/videos.json. Solo se aceptan IDs de YouTube válidos (11 caracteres).
// El iframe NO se crea hasta que la persona hace clic (privacidad y rendimiento).

(function () {
    'use strict';

    const { h } = window.F1UI;
    const grid = document.getElementById('video-grid');
    const chips = document.getElementById('chips'); // puede no existir (video_gp.html)
    if (!grid) return;

    // Modo "un Gran Premio": video_gp.html?year=2026&gp=gran_premio_de_las_vegas
    const params = new URLSearchParams(window.location.search);
    const claveGP = params.get('year') && params.get('gp') ? `${params.get('year')}_${params.get('gp')}` : null;
    const enPaginaGP = !!document.getElementById('gp-title') && !!document.getElementById('gp-season');

    function tituloDesdeClave(gp) {
        const palabras = String(gp || '').replace(/_/g, ' ').split(' ').filter(Boolean);
        return palabras.map((w, i) => (i > 0 && ['de', 'del'].includes(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    const ID_VALIDO = /^[A-Za-z0-9_-]{11}$/;
    let todos = [];
    let filtro = 'Todos';

    function fechaLegible(valor) {
        const f = new Date(valor);
        return isNaN(f) ? '' : f.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function tarjeta(v) {
        const marco = h('div', { class: 'video-frame' });
        const boton = h('button', { class: 'video-play', type: 'button', 'aria-label': 'Reproducir: ' + v.titulo },
            h('img', { src: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, alt: '', loading: 'lazy', width: '480', height: '360' }),
            h('span', { class: 'video-play-icon', 'aria-hidden': 'true', text: '▶' })
        );
        boton.addEventListener('click', () => {
            const iframe = h('iframe', {
                src: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`,
                title: v.titulo,
                allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
                allowfullscreen: true,
                referrerpolicy: 'strict-origin-when-cross-origin'
            });
            marco.replaceChildren(iframe);
        });
        marco.appendChild(boton);

        const meta = [
            v.tipo === 'propio' ? 'Propio' : 'Oficial',
            v.categoria,
            fechaLegible(v.fecha)
        ].filter(Boolean);

        return h('article', { class: 'video-card' },
            marco,
            h('div', { class: 'video-info' },
                h('h3', { text: v.titulo }),
                v.descripcion ? h('p', { text: v.descripcion }) : null,
                h('div', { class: 'video-meta' }, meta.map((m, i) => h('span', { class: i === 0 ? 'badge' : '', text: m })))
            )
        );
    }

    function vacio() {
        return h('div', { class: 'video-empty card' },
            h('h3', { text: enPaginaGP ? 'Aún no hay video de este Gran Premio' : 'Muy pronto, más videos' }),
            h('p', { text: 'Estamos preparando análisis y resúmenes de cada Gran Premio. Mientras tanto, síguenos en YouTube.' }),
            h('a', { class: 'btn btn--primary', href: 'https://www.youtube.com/@F1FansC11MX', target: '_blank', rel: 'noopener noreferrer', text: 'Ir a nuestro canal' })
        );
    }

    function pintar() {
        const lista = filtro === 'Todos' ? todos : todos.filter((v) => v.categoria === filtro);
        grid.replaceChildren(...(lista.length ? lista.map(tarjeta) : [vacio()]));
    }

    function pintarChips() {
        if (!chips) return;
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
                .filter((v) => v && ID_VALIDO.test(String(v.id || '')) && v.titulo)
                .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
        } catch (e) {
            console.warn('videos: no se pudo leer videos.json', e);
            todos = [];
        }
        if (enPaginaGP) {
            const year = (params.get('year') || '').replace(/[^0-9]/g, '').slice(0, 4);
            document.getElementById('gp-title').textContent = claveGP ? tituloDesdeClave(params.get('gp')) : 'Video del Gran Premio';
            document.getElementById('gp-season').textContent = year ? `Temporada ${year}` : 'Gran Premio';
            todos = claveGP ? todos.filter((v) => v.gp === claveGP) : [];
        }
        pintarChips();
        pintar();
    }

    cargar();
})();
