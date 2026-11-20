// preferencias.js - Ajustes del visitante: tamaño de letra, alto contraste, zona horaria e idioma.
//
// Todo se guarda solo en este navegador (localStorage, claves f1fg:*). No se envía a ningún servidor.
// Se abre con el botón [data-open="ajustes"] del menú.

(function () {
    'use strict';

    const P = 'f1fg:';
    const FUENTES = ['', 'lg', 'xl'];
    const raiz = document.documentElement;
    const base = location.pathname.replace(/\\/g, '/').includes('/html/') ? '../../' : './';

    function leer(k) { try { return localStorage.getItem(P + k) || ''; } catch (e) { return ''; } }
    function escribir(k, v) {
        try { v ? localStorage.setItem(P + k, v) : localStorage.removeItem(P + k); } catch (e) { /* bloqueado */ }
    }

    /* Estilos compartidos (overlay, alto contraste) para páginas que no cargan explorar.css */
    if (!document.querySelector('link[href$="css/explorar.css"]')) {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = base + 'css/explorar.css';
        document.head.appendChild(l);
    }

    /* Aplicar lo guardado */
    function aplicar() {
        const fs = FUENTES.includes(leer('fs')) ? leer('fs') : '';
        fs ? raiz.setAttribute('data-fs', fs) : raiz.removeAttribute('data-fs');
        leer('contrast') === 'high' ? raiz.setAttribute('data-contrast', 'high') : raiz.removeAttribute('data-contrast');
        if (leer('lang') === 'en') raiz.setAttribute('lang', 'en');
    }
    aplicar();

    /* ----------------------------------------------------------- diálogo */
    let overlay = null;
    let origen = null;

    function zonas() {
        try {
            if (typeof Intl.supportedValuesOf === 'function') return Intl.supportedValuesOf('timeZone');
        } catch (e) { /* sigue */ }
        return ['America/Mexico_City', 'America/Bogota', 'America/Lima', 'America/Santiago', 'America/Argentina/Buenos_Aires',
            'America/New_York', 'America/Los_Angeles', 'Europe/Madrid', 'Europe/London', 'UTC'];
    }

    function el(tag, props, ...hijos) {
        const e = document.createElement(tag);
        Object.entries(props || {}).forEach(([k, v]) => { if (v != null && v !== false) k === 'text' ? (e.textContent = v) : e.setAttribute(k, v === true ? '' : v); });
        hijos.flat().forEach((c) => { if (c != null) e.append(c.nodeType ? c : document.createTextNode(String(c))); });
        return e;
    }

    function segmento(opciones, actual, alElegir, etiquetaGrupo) {
        const caja = el('div', { class: 'seg', role: 'group', 'aria-label': etiquetaGrupo });
        opciones.forEach(([valor, texto, aria]) => {
            const b = el('button', { type: 'button', 'aria-pressed': String(valor === actual), 'aria-label': aria || null, text: texto });
            b.addEventListener('click', () => {
                alElegir(valor);
                caja.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
                b.setAttribute('aria-pressed', 'true');
            });
            caja.append(b);
        });
        return caja;
    }

    function cerrar() {
        if (!overlay) return;
        overlay.hidden = true;
        document.removeEventListener('keydown', teclas);
        if (origen && origen.focus) origen.focus();
    }
    function teclas(e) { if (e.key === 'Escape') cerrar(); }

    function construir() {
        const zona = el('select', { id: 'pref-tz', 'aria-label': 'Zona horaria' });
        zona.append(el('option', { value: '', text: 'Automática (la de tu dispositivo)' }));
        zonas().forEach((z) => zona.append(el('option', { value: z, text: z.replace(/_/g, ' ') })));
        zona.value = leer('tz');
        zona.addEventListener('change', () => { escribir('tz', zona.value); location.reload(); });

        const dlg = el('div', { class: 'dialog', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pref-titulo', tabindex: '-1' },
            el('h2', { id: 'pref-titulo', text: 'Ajustes' }),
            el('div', { class: 'row' }, el('span', { text: 'Tamaño de letra' }),
                segmento([['', 'A', 'Normal'], ['lg', 'A+', 'Grande'], ['xl', 'A++', 'Muy grande']], FUENTES.includes(leer('fs')) ? leer('fs') : '',
                    (v) => { escribir('fs', v); aplicar(); }, 'Tamaño de letra')),
            el('div', { class: 'row' }, el('span', { text: 'Alto contraste' }),
                segmento([['', 'No'], ['high', 'Sí']], leer('contrast') === 'high' ? 'high' : '',
                    (v) => { escribir('contrast', v); aplicar(); }, 'Alto contraste')),
            el('div', { class: 'row' }, el('label', { for: 'pref-tz', text: 'Zona horaria de los horarios' }), zona),
            el('div', { class: 'row' }, el('span', { text: 'Idioma / Language' }),
                segmento([['es', 'Español'], ['en', 'English']], leer('lang') === 'en' ? 'en' : 'es',
                    (v) => { escribir('lang', v === 'en' ? 'en' : ''); location.reload(); }, 'Idioma')),
            el('p', { class: 'data-credit', text: 'Tus ajustes se guardan solo en este navegador.' }),
            el('div', { class: 'close-row' }, (() => { const b = el('button', { type: 'button', class: 'btn btn--primary', text: 'Listo' }); b.addEventListener('click', cerrar); return b; })())
        );
        overlay = el('div', { class: 'overlay', hidden: true }, dlg);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); });
        document.body.append(overlay);
    }

    function abrir(desde) {
        origen = desde;
        if (!overlay) construir();
        overlay.hidden = false;
        document.addEventListener('keydown', teclas);
        overlay.querySelector('.dialog').focus();
    }

    document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-open="ajustes"]');
        if (b) abrir(b);
    });
    // El menu "Explorar" se cierra al hacer clic fuera o pulsar Escape
    document.addEventListener("click", (e) => {
        document.querySelectorAll("details.nav-more[open]").forEach((d) => { if (!d.contains(e.target)) d.removeAttribute("open"); });
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") document.querySelectorAll("details.nav-more[open]").forEach((d) => d.removeAttribute("open"));
    });
})();
