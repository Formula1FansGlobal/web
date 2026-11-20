// favoritos.js - Piloto y equipo favoritos, guardados solo en este navegador (localStorage).
// Expone window.F1Fav. No envía nada a ningún servidor.

(function () {
    'use strict';

    const CLAVE = 'f1fg:fav';
    const ID = /^[a-z0-9_]{1,40}$/i;

    function leer() {
        try {
            const v = JSON.parse(localStorage.getItem(CLAVE) || '{}');
            const limpio = {};
            ['piloto', 'equipo'].forEach((t) => {
                const x = v && v[t];
                if (x && ID.test(String(x.id || '')) && typeof x.nombre === 'string') limpio[t] = { id: x.id, nombre: x.nombre.slice(0, 60) };
            });
            return limpio;
        } catch (e) {
            return {};
        }
    }

    function guardar(v) {
        try { localStorage.setItem(CLAVE, JSON.stringify(v)); } catch (e) { /* almacenamiento bloqueado */ }
    }

    const F1Fav = {
        get: leer,
        es(tipo, id) { const x = leer()[tipo]; return !!x && x.id === id; },
        /** Marca o desmarca. Devuelve true si queda como favorito. */
        alternar(tipo, id, nombre) {
            if (tipo !== 'piloto' && tipo !== 'equipo') return false;
            if (!ID.test(String(id || ''))) return false;
            const v = leer();
            if (v[tipo] && v[tipo].id === id) { delete v[tipo]; guardar(v); return false; }
            v[tipo] = { id, nombre: String(nombre || id) };
            guardar(v);
            return true;
        },
        /** Botón de favorito accesible (aria-pressed). */
        boton(tipo, id, nombre, etiquetas) {
            const t = etiquetas || { off: '☆ Hacer mi favorito', on: '★ Es mi favorito' };
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn btn--ghost';
            const pintar = () => {
                const on = F1Fav.es(tipo, id);
                b.setAttribute('aria-pressed', String(on));
                b.textContent = on ? t.on : t.off;
            };
            b.addEventListener('click', () => { F1Fav.alternar(tipo, id, nombre); pintar(); });
            pintar();
            return b;
        }
    };

    window.F1Fav = F1Fav;
})();
