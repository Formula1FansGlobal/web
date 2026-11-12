// tienda.js - Catálogo de afiliados.
// Los datos viven en js/productos-afiliados.js y js/productos-carrusel.js
// (los genera html/paginas/admin-productos.html). Este archivo solo los muestra.
// Todo el contenido se inserta con el DOM (textContent), nunca con innerHTML.

(function () {
    'use strict';

    const { h } = window.F1UI;

    const catalogo = (typeof productosAfiliados !== 'undefined' && Array.isArray(productosAfiliados)) ? productosAfiliados : [];
    const destacados = (typeof productosCarrusel !== 'undefined' && Array.isArray(productosCarrusel)) ? productosCarrusel : [];

    const ETIQUETAS = {
        'ropa': 'Ropa', 'gorras': 'Gorras', 'accesorios': 'Accesorios', 'posters': 'Pósters',
        'miniaturas': 'Miniaturas', 'coleccionables': 'Coleccionables', 'juguete': 'Juguetes',
        'herramientas': 'Herramientas', 'hogar': 'Hogar', 'mascotas': 'Mascotas',
        'accesorios para vehiculos': 'Accesorios para vehículos',
        'belleza y cuidado personal': 'Belleza y cuidado personal'
    };
    const etiqueta = (c) => ETIQUETAS[c] || (c ? c.charAt(0).toUpperCase() + c.slice(1) : 'Otros');

    const dinero = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

    function esHttps(u) {
        try { return new URL(u).protocol === 'https:'; } catch (e) { return false; }
    }

    // Solo productos con datos válidos y enlace/imagen https
    function valido(p) {
        return p && typeof p.title === 'string' && p.title && esHttps(p.link) && typeof p.price === 'number' && p.price >= 0;
    }

    function tarjeta(p, conBadge) {
        const media = h('div', { class: 'product-media' });
        if (esHttps(p.image)) {
            const img = h('img', { src: p.image, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' });
            img.addEventListener('error', () => img.replaceWith(h('span', { class: 'ph', 'aria-hidden': 'true', text: '🏎️' })));
            media.appendChild(img);
        } else {
            media.appendChild(h('span', { class: 'ph', 'aria-hidden': 'true', text: '🏎️' }));
        }
        if (conBadge && p.badge) media.appendChild(h('span', { class: 'product-badge', text: p.badge }));

        return h('article', { class: 'product-card' },
            media,
            h('div', { class: 'product-body' },
                h('span', { class: 'product-cat', text: etiqueta(p.category) }),
                h('h3', { class: 'product-title', text: p.title }),
                h('div', { class: 'product-price' }, dinero.format(p.price), h('small', { text: 'MXN' })),
                h('a', {
                    class: 'btn btn--primary product-cta',
                    href: p.link, target: '_blank', rel: 'sponsored nofollow noopener noreferrer',
                    'aria-label': 'Ver en Mercado Libre: ' + p.title
                }, 'Ver en Mercado Libre')
            )
        );
    }

    /* ----------------------------------------------------------- Destacados */
    function pintarDestacados() {
        const lista = destacados.filter(valido);
        if (!lista.length) return;
        const cont = document.getElementById('offers');
        cont.replaceChildren(...lista.map((p) => tarjeta(p, true)));
        document.getElementById('ofertas-sec').hidden = false;
        const paso = () => Math.max(240, cont.clientWidth * 0.8);
        document.getElementById('of-prev').addEventListener('click', () => cont.scrollBy({ left: -paso(), behavior: 'smooth' }));
        document.getElementById('of-next').addEventListener('click', () => cont.scrollBy({ left: paso(), behavior: 'smooth' }));
    }

    /* ------------------------------------------------------------- Catálogo */
    const productos = catalogo.filter(valido);
    const estado = { q: '', cat: 'todas', orden: 'rel', max: 0 };
    const grid = document.getElementById('grid');
    const cuenta = document.getElementById('count');
    const rango = document.getElementById('price');
    const rangoTxt = document.getElementById('price-text');

    function filtrar() {
        const q = estado.q.trim().toLowerCase();
        let lista = productos.filter((p) =>
            (estado.cat === 'todas' || p.category === estado.cat) &&
            p.price <= estado.max &&
            (!q || p.title.toLowerCase().includes(q))
        );
        if (estado.orden === 'asc') lista = [...lista].sort((a, b) => a.price - b.price);
        if (estado.orden === 'desc') lista = [...lista].sort((a, b) => b.price - a.price);
        return lista;
    }

    function pintar() {
        const lista = filtrar();
        cuenta.textContent = lista.length === 1 ? '1 producto' : `${lista.length} productos`;
        if (!lista.length) {
            const reset = h('button', { type: 'button', class: 'btn btn--ghost', style: 'margin-top:14px' }, 'Quitar filtros');
            reset.addEventListener('click', () => {
                estado.q = ''; estado.cat = 'todas'; estado.max = Number(rango.max);
                document.getElementById('q').value = ''; rango.value = rango.max;
                actualizarPrecioTxt(); pintarChips(); pintar();
            });
            grid.replaceChildren(h('div', { class: 'shop-empty' }, h('p', { text: 'No encontramos productos con esos filtros.' }), reset));
            return;
        }
        grid.replaceChildren(...lista.map((p) => tarjeta(p, false)));
    }

    function pintarChips() {
        const cont = document.getElementById('cats');
        const cats = Array.from(new Set(productos.map((p) => p.category))).sort((a, b) => etiqueta(a).localeCompare(etiqueta(b), 'es'));
        cont.replaceChildren(...['todas', ...cats].map((c) => {
            const b = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(c === estado.cat) }, c === 'todas' ? 'Todas' : etiqueta(c));
            b.addEventListener('click', () => { estado.cat = c; pintarChips(); pintar(); });
            return b;
        }));
    }

    function actualizarPrecioTxt() {
        rangoTxt.textContent = 'Hasta ' + dinero.format(estado.max);
    }

    function iniciar() {
        pintarDestacados();
        if (!productos.length) {
            cuenta.textContent = '';
            grid.replaceChildren(h('p', { class: 'shop-empty', text: 'Estamos preparando la selección de productos. Vuelve pronto.' }));
            return;
        }
        const tope = Math.ceil(Math.max(...productos.map((p) => p.price)) / 50) * 50;
        rango.max = String(tope);
        rango.value = String(tope);
        estado.max = tope;
        actualizarPrecioTxt();

        document.getElementById('q').addEventListener('input', (e) => { estado.q = e.target.value; pintar(); });
        document.getElementById('sort').addEventListener('change', (e) => { estado.orden = e.target.value; pintar(); });
        rango.addEventListener('input', () => { estado.max = Number(rango.value); actualizarPrecioTxt(); pintar(); });

        pintarChips();
        pintar();
    }

    iniciar();
})();
