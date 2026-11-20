// circuito3d.js - Visor 3D del trazado de un circuito (WebGL con Three.js). El visitante lo gira, acerca y aleja.
//
// Datos:
//  - data/circuitos-trazados.geojson: trazado real (proyecto f1-circuits, licencia MIT). Se empareja con el
//    circuito de la API por cercanía (latitud/longitud).
//  - data/circuitos-elevacion.json: 100 alturas por circuito (Copernicus DEM vía Open-Meteo, CC BY 4.0,
//    resolución ≈ 90 m), tomadas a lo largo de la vuelta. Se suavizan y el relieve se exagera para que se vea.
// Todo lo demás (asfalto, césped, árboles, muros) es procedural: no se descargan imágenes.
// Sin WebGL se muestra el contorno en 2D (SVG). El perfil de altura funciona con o sin WebGL.
//
// Expone window.F1Circuito3D.montar(contenedor, circuito) -> Promise<boolean> (false si no hay trazado).

(function () {
    'use strict';

    const BASE = location.pathname.replace(/\\/g, '/').includes('/html/') ? '../../' : './';
    const EN = (() => { try { return localStorage.getItem('f1fg:lang') === 'en'; } catch (e) { return false; } })();
    const T = (es, en) => (EN ? en : es);
    const quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tactil = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const NS = 'http://www.w3.org/2000/svg';

    let promesaDatos = null;
    let promesaElev = null;
    let promesaThree = null;

    function cargarDatos() {
        if (!promesaDatos) {
            promesaDatos = fetch(BASE + 'data/circuitos-trazados.geojson')
                .then((r) => { if (!r.ok) throw new Error('sin trazados'); return r.json(); })
                .catch((e) => { promesaDatos = null; throw e; });
        }
        return promesaDatos;
    }

    // Las alturas son opcionales: si faltan, el circuito se muestra plano.
    function cargarElevacion() {
        if (!promesaElev) {
            promesaElev = fetch(BASE + 'data/circuitos-elevacion.json')
                .then((r) => (r.ok ? r.json() : {}))
                .catch(() => ({}));
        }
        return promesaElev;
    }

    function cargarThree() {
        if (window.THREE) return Promise.resolve(window.THREE);
        if (!promesaThree) {
            promesaThree = new Promise((ok, no) => {
                const s = document.createElement('script');
                s.src = BASE + 'js/vendor/three.min.js';
                s.onload = () => (window.THREE ? ok(window.THREE) : no(new Error('Three.js no disponible')));
                s.onerror = () => no(new Error('No se pudo cargar Three.js'));
                document.head.appendChild(s);
            });
        }
        return promesaThree;
    }

    function hayWebGL() {
        try {
            const c = document.createElement('canvas');
            return !!(c.getContext('webgl2') || c.getContext('webgl'));
        } catch (e) { return false; }
    }

    /* ------------------------------------------------ emparejar con la API */
    function distKm(lat1, lon1, lat2, lon2) {
        const r = Math.PI / 180;
        const a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
        return 12742 * Math.asin(Math.sqrt(a));
    }

    function buscar(datos, lat, lon) {
        let mejor = null;
        let dMejor = 6; // km: tolerancia entre la ubicación de la API y el centro del trazado
        (datos.features || []).forEach((f) => {
            const co = f.geometry && f.geometry.coordinates;
            if (!co || co.length < 10) return;
            let sx = 0, sy = 0;
            co.forEach((p) => { sx += p[0]; sy += p[1]; });
            const d = distKm(lat, lon, sy / co.length, sx / co.length);
            if (d < dMejor) { dMejor = d; mejor = f; }
        });
        return mejor;
    }

    /* ------------------------------------------------ geometría del trazado */
    function proyectar(coords) {
        let lat0 = 0, lon0 = 0;
        coords.forEach((p) => { lon0 += p[0]; lat0 += p[1]; });
        lon0 /= coords.length; lat0 /= coords.length;
        const kx = Math.cos((lat0 * Math.PI) / 180) * 111320;
        const ky = 110574;
        const pts = coords.map((p) => ({ x: (p[0] - lon0) * kx, z: -(p[1] - lat0) * ky }));
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        pts.forEach((p) => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); });
        const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
        const escala = 40 / Math.max(maxX - minX, maxZ - minZ, 1); // unidades de escena por metro
        return { pts: pts.map((p) => ({ x: (p.x - cx) * escala, z: (p.z - cz) * escala })), escala };
    }

    function contornoSVG(pts) {
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', '-24 -24 48 48');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', T('Contorno del circuito', 'Circuit outline'));
        const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.z.toFixed(2)}`).join(' ');
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', d + ' Z');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '0.7');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
        return svg;
    }

    /* ------------------------------------------------------ alturas (datos) */
    /** Suaviza una serie circular (media móvil) para quitar el ruido del modelo digital de terreno. */
    function suavizar(a, ventana, pasadas) {
        let v = a.slice();
        const n = v.length, m = Math.floor(ventana / 2);
        for (let p = 0; p < pasadas; p++) {
            const w = new Array(n);
            for (let i = 0; i < n; i++) {
                let s = 0;
                for (let k = -m; k <= m; k++) s += v[(i + k + n * 4) % n];
                w[i] = s / (2 * m + 1);
            }
            v = w;
        }
        return v;
    }
    function muestra(a, u) { // interpolación lineal circular, u en [0,1)
        const n = a.length, x = (((u % 1) + 1) % 1) * n, i = Math.floor(x), t = x - i;
        return a[i % n] * (1 - t) + a[(i + 1) % n] * t;
    }

    /** Perfil de altura (SVG). Devuelve { el, mover(u), alAjustar(fn) }. */
    function perfil(alts, largoM) {
        const W = 600, H = 124, L = 46, R = 12, TT = 12, B = 22;
        const min = Math.min(...alts);
        const max = Math.max(...alts);
        const rango = Math.max(max - min, 4);
        const X = (u) => L + u * (W - L - R);
        const Y = (v) => TT + (1 - (v - min) / rango) * (H - TT - B);
        const n = alts.length;
        let linea = '';
        for (let k = 0; k <= n; k++) linea += `${k ? 'L' : 'M'}${X(k / n).toFixed(1)} ${Y(alts[k % n]).toFixed(1)} `;
        const mk = (tag, at, txt) => {
            const e = document.createElementNS(NS, tag);
            Object.keys(at).forEach((k) => e.setAttribute(k, at[k]));
            if (txt != null) e.textContent = txt;
            return e;
        };
        const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', class: 'c3d-prof-svg',
            'aria-label': T(`Perfil de altura de la vuelta: entre ${Math.round(min)} y ${Math.round(max)} metros sobre el nivel del mar.`,
                `Lap elevation profile: between ${Math.round(min)} and ${Math.round(max)} metres above sea level.`) });
        svg.append(
            mk('line', { x1: L, y1: Y(min), x2: W - R, y2: Y(min), class: 'p-grid' }),
            mk('line', { x1: L, y1: Y(max), x2: W - R, y2: Y(max), class: 'p-grid' }),
            mk('path', { d: `${linea}L${X(1)} ${H - B} L${X(0)} ${H - B} Z`, class: 'p-area' }),
            mk('path', { d: linea, class: 'p-line' }),
            mk('text', { x: L - 6, y: Y(max) + 4, class: 'p-txt', 'text-anchor': 'end' }, `${Math.round(max)} m`),
            mk('text', { x: L - 6, y: Y(min) + 4, class: 'p-txt', 'text-anchor': 'end' }, `${Math.round(min)} m`),
            mk('text', { x: L, y: H - 5, class: 'p-txt' }, T('Meta', 'Start')),
            mk('text', { x: W - R, y: H - 5, class: 'p-txt', 'text-anchor': 'end' }, largoM ? `${(largoM / 1000).toFixed(2)} km` : T('Meta', 'Finish'))
        );
        const guia = mk('line', { x1: X(0), y1: TT - 4, x2: X(0), y2: H - B, class: 'p-guide' });
        const punto = mk('circle', { cx: X(0), cy: Y(alts[0]), r: 5, class: 'p-dot' });
        const etiqueta = mk('text', { x: X(0), y: TT - 1, class: 'p-now', 'text-anchor': 'start' }, '');
        svg.append(guia, punto, etiqueta);

        const caja = document.createElement('div');
        caja.className = 'c3d-prof';
        const tit = document.createElement('p');
        tit.className = 'c3d-prof-t';
        tit.textContent = T('Perfil de altura de la vuelta (metros sobre el nivel del mar)', 'Lap elevation profile (metres above sea level)');
        caja.append(tit, svg);

        function mover(u) {
            const uu = ((u % 1) + 1) % 1;
            const v = muestra(alts, uu);
            const x = X(uu);
            guia.setAttribute('x1', x); guia.setAttribute('x2', x);
            punto.setAttribute('cx', x); punto.setAttribute('cy', Y(v));
            etiqueta.textContent = `${Math.round(v)} m`;
            etiqueta.setAttribute('x', uu > 0.85 ? x - 6 : x + 6);
            etiqueta.setAttribute('text-anchor', uu > 0.85 ? 'end' : 'start');
        }
        // Arrastrar sobre la gráfica coloca el coche en ese punto de la vuelta
        function alMover(fn) {
            const desde = (e) => {
                const r = svg.getBoundingClientRect();
                const u = ((e.clientX - r.left) / r.width * W - L) / (W - L - R);
                fn(Math.max(0, Math.min(0.9999, u)));
            };
            svg.style.touchAction = 'pan-y';
            svg.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.buttons) desde(e); });
            svg.addEventListener('pointerdown', desde);
            svg.classList.add('is-scrub');
        }
        mover(0);
        return { el: caja, mover, alMover, min, max };
    }

    /* ----------------------------------------------------- texturas (canvas) */
    function lienzo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
    function ruido(g, w, h, n, aMin, aMax, claro) {
        for (let i = 0; i < n; i++) {
            const a = aMin + Math.random() * (aMax - aMin);
            g.fillStyle = claro ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
            g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 1.6, 1 + Math.random() * 1.6);
        }
    }

    function texAsfalto() {
        const w = 128, h = 256, c = lienzo(w, h), g = c.getContext('2d');
        g.fillStyle = '#34353d'; g.fillRect(0, 0, w, h);
        // zona de goma en la trazada (más oscura y brillante) y huellas de neumáticos
        const gr = g.createLinearGradient(0, 0, w, 0);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.28, 'rgba(0,0,0,0.18)');
        gr.addColorStop(0.5, 'rgba(0,0,0,0.05)'); gr.addColorStop(0.72, 'rgba(0,0,0,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(0,0,0,0.16)';
        g.fillRect(w * 0.3, 0, 7, h); g.fillRect(w * 0.62, 0, 7, h);
        ruido(g, w, h, 5200, 0.04, 0.2, false);
        ruido(g, w, h, 3200, 0.03, 0.12, true);
        // líneas blancas de borde
        g.fillStyle = 'rgba(235,235,240,0.82)';
        g.fillRect(w * 0.025, 0, 3, h); g.fillRect(w * 0.975 - 3, 0, 3, h);
        const t = new THREE_.CanvasTexture(c);
        t.wrapS = THREE_.ClampToEdgeWrapping; t.wrapT = THREE_.RepeatWrapping;
        return t;
    }
    function texHierba(tipo) {
        const w = 256, c = lienzo(w, w), g = c.getContext('2d');
        const base = tipo === 'arido' ? '#b09868' : tipo === 'urbano' ? '#4a4c54' : '#4a6532';
        g.fillStyle = base; g.fillRect(0, 0, w, w);
        ruido(g, w, w, 14000, 0.05, 0.25, false);
        ruido(g, w, w, 9000, 0.05, 0.18, true);
        if (tipo === 'verde') { // briznas de hierba más claras y oscuras
            for (let i = 0; i < 2600; i++) {
                g.fillStyle = Math.random() < 0.5 ? 'rgba(120,150,70,0.35)' : 'rgba(30,50,20,0.35)';
                g.fillRect(Math.random() * w, Math.random() * w, 1, 2 + Math.random() * 3);
            }
        }
        const t = new THREE_.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE_.RepeatWrapping;
        return t;
    }
    function texHormigon() {
        const w = 128, h = 64, c = lienzo(w, h), g = c.getContext('2d');
        g.fillStyle = '#9a9ca3'; g.fillRect(0, 0, w, h);
        ruido(g, w, h, 1400, 0.05, 0.2, false);
        ruido(g, w, h, 900, 0.05, 0.16, true);
        g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, 2, h); // junta entre bloques
        g.fillStyle = 'rgba(225,6,0,0.9)'; g.fillRect(0, h - 10, w, 5); // franja roja
        g.fillStyle = 'rgba(245,245,247,0.9)'; g.fillRect(0, h - 5, w, 5);
        const t = new THREE_.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE_.RepeatWrapping;
        return t;
    }
    function cielo() {
        const c = lienzo(4, 256), g = c.getContext('2d');
        const gr = g.createLinearGradient(0, 0, 0, 256);
        gr.addColorStop(0, '#5f8fc9'); gr.addColorStop(0.55, '#a9c6e2'); gr.addColorStop(0.78, '#dfe8ee'); gr.addColorStop(1, '#e9ece8');
        g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
        return new THREE_.CanvasTexture(c);
    }
    let THREE_ = null; // se asigna al cargar Three.js

    /* ---------------------------------------------------------- aleatorio fijo */
    function semilla(txt) { let h = 2166136261; for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

    const ARIDOS = ['bh-', 'qa-', 'ae-'];
    const URBANOS = ['mc-', 'sg-', 'az-', 'sa-', 'us-2022', 'us-2023', 'es-2026'];

    /* -------------------------------------------------------------- montar */
    async function montar(contenedor, circuito) {
        let datos;
        try { datos = await cargarDatos(); } catch (e) { return false; }
        const f = buscar(datos, circuito.lat, circuito.lon);
        if (!f) return false;

        const prop = f.properties || {};
        const elevAll = await cargarElevacion();
        const crudas = Array.isArray(elevAll[prop.id]) && elevAll[prop.id].length >= 20 ? elevAll[prop.id] : null;
        const alts = crudas ? suavizar(crudas, 5, 2) : null; // metros, ya sin ruido
        const { pts, escala } = proyectar(f.geometry.coordinates);

        const marco = document.createElement('div');
        marco.className = 'c3d';
        const info = document.createElement('p');
        info.className = 'data-credit c3d-info';

        const altMin = alts ? Math.min(...alts) : 0;
        const altMax = alts ? Math.max(...alts) : 0;
        const desnivel = altMax - altMin;
        // Exageración vertical: el relieve real es muy pequeño frente a la longitud de la pista
        const K = alts ? Math.max(2, Math.min(8, 5.5 / Math.max(desnivel * escala, 0.05))) : 1;

        const partes = [];
        if (prop.length) partes.push(T(`Longitud ≈ ${(prop.length / 1000).toFixed(3)} km`, `Length ≈ ${(prop.length / 1000).toFixed(3)} km`));
        if (alts) partes.push(T(`Desnivel ≈ ${Math.round(desnivel)} m (de ${Math.round(altMin)} a ${Math.round(altMax)} m)`, `Elevation change ≈ ${Math.round(desnivel)} m (${Math.round(altMin)} to ${Math.round(altMax)} m)`));
        else if (prop.altitude != null) partes.push(T(`Altitud ${prop.altitude} m`, `Altitude ${prop.altitude} m`));
        if (prop.opened) partes.push(T(`Inaugurado en ${prop.opened}`, `Opened ${prop.opened}`));
        info.textContent = partes.join(' · ') + ' · ' + T(
            `Trazado: proyecto f1-circuits (MIT).${alts ? ' Alturas: Copernicus DEM vía Open-Meteo (CC BY 4.0), ≈90 m de resolución, suavizadas.' : ' Sin datos de altura: se muestra plano.'} ${alts ? `Relieve exagerado ×${K.toFixed(1)}; ` : ''}ancho de pista ampliado. Es una recreación aproximada.`,
            `Layout: f1-circuits project (MIT).${alts ? ' Elevation: Copernicus DEM via Open-Meteo (CC BY 4.0), ≈90 m resolution, smoothed.' : ' No elevation data: shown flat.'} ${alts ? `Relief exaggerated ×${K.toFixed(1)}; ` : ''}track width enlarged. This is an approximate recreation.`);

        const prof = alts ? perfil(alts, prop.length) : null;

        if (!hayWebGL()) {
            const caja = document.createElement('div');
            caja.className = 'c3d-fallback';
            caja.append(contornoSVG(pts));
            marco.append(caja);
            if (prof) marco.append(prof.el);
            marco.append(info);
            contenedor.append(marco);
            return true;
        }

        let THREE;
        try { THREE = await cargarThree(); } catch (e) { return false; }
        THREE_ = THREE;

        /* ---- renderer, escena y cámara ---- */
        let renderer;
        try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' }); } catch (e) { return false; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        const canvas = renderer.domElement;
        canvas.className = 'c3d-canvas';
        canvas.tabIndex = 0;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', T(
            `Trazado en 3D de ${circuito.nombre}. Arrastra para girar, usa la rueda o pellizca para acercar. Con teclado: flechas para girar, más y menos para el zoom.`,
            `3D layout of ${circuito.nombre}. Drag to rotate, use the wheel or pinch to zoom. With a keyboard: arrow keys to rotate, plus and minus to zoom.`));
        const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);
        const conAniso = (t) => { t.anisotropy = aniso; return t; };

        const id = String(prop.id || circuito.id || '');
        const tipo = ARIDOS.some((p) => id.startsWith(p)) ? 'arido' : URBANOS.some((p) => id.startsWith(p)) ? 'urbano' : 'verde';
        const rnd = mulberry(semilla(id));

        const scene = new THREE.Scene();
        scene.background = cielo();
        scene.fog = new THREE.Fog(tipo === 'arido' ? 0xe6e1d3 : 0xdbe4ea, 95, 250);
        const camera = new THREE.PerspectiveCamera(40, 16 / 10, 0.5, 600);

        scene.add(new THREE.HemisphereLight(0xdbe8ff, tipo === 'arido' ? 0x8a7650 : 0x4b5a3a, 0.85));
        const sol = new THREE.DirectionalLight(0xfff0dc, 0.95);
        sol.position.set(42, 70, 28);
        sol.castShadow = true;
        const mapa = tactil ? 1024 : 2048;
        sol.shadow.mapSize.set(mapa, mapa);
        Object.assign(sol.shadow.camera, { left: -78, right: 78, top: 78, bottom: -78, near: 10, far: 220 });
        sol.shadow.bias = -0.0004;
        sol.shadow.normalBias = 0.06;
        scene.add(sol);

        /* ---- curva suave, alturas y tiras de pista ---- */
        const sinUltimo = pts.slice();
        const a = sinUltimo[0], b = sinUltimo[sinUltimo.length - 1];
        if (Math.hypot(a.x - b.x, a.z - b.z) < 0.6) sinUltimo.pop();
        const curva = new THREE.CatmullRomCurve3(sinUltimo.map((p) => new THREE.Vector3(p.x, 0, p.z)), true, 'centripetal');
        const N = Math.min(1600, Math.max(500, sinUltimo.length * 4));
        const largoEsc = curva.getLength();

        // altura de la pista en cada muestra (unidades de escena), suavizada otra vez para evitar escalones
        const Y0 = 0.15;
        let hu = new Array(N).fill(0);
        if (alts) {
            hu = hu.map((_, i) => (muestra(alts, i / N) - altMin) * escala * K);
            hu = suavizar(hu, 9, 2);
        }
        const yPista = (i) => Y0 + hu[(i + N) % N];

        const mu = [];
        for (let i = 0; i < N; i++) {
            const u = i / N;
            const p = curva.getPointAt(u);
            const t = curva.getTangentAt(u);
            mu.push({ p, t, n: new THREE.Vector3(-t.z, 0, t.x).normalize(), d: u * largoEsc });
        }

        const ANCHO = 0.95, KERB = 0.2, RUN = 0.55;
        const c3 = (hex) => new THREE.Color(hex);

        // Tira entre dos desplazamientos laterales (desde > hasta). yFn(i) da la altura; uv: [lateral, a lo largo]
        function tira(desde, hasta, yFn, colorFn, repV) {
            const pos = [], col = [], uv = [], idx = [];
            mu.forEach((m, i) => {
                const pa = m.p.clone().addScaledVector(m.n, desde);
                const pb = m.p.clone().addScaledVector(m.n, hasta);
                const y = yFn(i);
                pos.push(pa.x, y, pa.z, pb.x, y, pb.z);
                if (colorFn) { const c = colorFn(i); col.push(c.r, c.g, c.b, c.r, c.g, c.b); }
                const v = m.d / repV;
                uv.push(0, v, 1, v);
            });
            for (let i = 0; i < N; i++) {
                const j = (i + 1) % N;
                idx.push(2 * i, 2 * j, 2 * i + 1, 2 * i + 1, 2 * j, 2 * j + 1);
            }
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
            if (colorFn) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
            g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
            g.setIndex(idx);
            g.computeVertexNormals();
            return g;
        }
        // Pared vertical a un lado de la pista, de y0(i) a y1(i)
        function muro(offset, y0, y1, repV, repU) {
            const pos = [], uv = [], idx = [];
            mu.forEach((m, i) => {
                const p = m.p.clone().addScaledVector(m.n, offset);
                pos.push(p.x, y0(i), p.z, p.x, y1(i), p.z);
                const v = m.d / repV;
                uv.push(v, 0, v, repU);
            });
            for (let i = 0; i < N; i++) { const j = (i + 1) % N; idx.push(2 * i, 2 * j, 2 * i + 1, 2 * i + 1, 2 * j, 2 * j + 1); }
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
            g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
            g.setIndex(idx);
            g.computeVertexNormals();
            return g;
        }

        const texA = conAniso(texAsfalto());
        const matPista = new THREE.MeshStandardMaterial({ map: texA, bumpMap: texA, bumpScale: 0.35, roughness: 0.92, metalness: 0.02, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
        const pista = new THREE.Mesh(tira(ANCHO / 2, -ANCHO / 2, yPista, null, 2.2), matPista);
        pista.receiveShadow = true;

        const rojo = c3('#b3231f'), blanco = c3('#d6d6da');
        const mk = (i) => (Math.floor(i / 6) % 2 ? rojo : blanco);
        const matBorde = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
        const yBorde = (i) => yPista(i) + 0.012;
        const bordeI = new THREE.Mesh(tira(ANCHO / 2 + KERB, ANCHO / 2, yBorde, mk, 1), matBorde);
        const bordeD = new THREE.Mesh(tira(-ANCHO / 2, -ANCHO / 2 - KERB, yBorde, mk, 1), matBorde);

        // Escapatoria asfaltada, más clara
        const matRun = new THREE.MeshStandardMaterial({ color: c3(tipo === 'arido' ? '#8f8678' : '#6a6c74'), roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
        const runI = new THREE.Mesh(tira(ANCHO / 2 + KERB + RUN, ANCHO / 2 + KERB, (i) => yPista(i) - 0.004, null, 3), matRun);
        const runD = new THREE.Mesh(tira(-ANCHO / 2 - KERB, -ANCHO / 2 - KERB - RUN, (i) => yPista(i) - 0.004, null, 3), matRun);
        [runI, runD].forEach((m) => { m.receiveShadow = true; });

        // Muros de hormigón con franja y "falda" que baja hasta el terreno
        const texH = conAniso(texHormigon());
        const matMuro = new THREE.MeshStandardMaterial({ map: texH, roughness: 0.9, side: THREE.DoubleSide });
        const offMuro = ANCHO / 2 + KERB + RUN + 0.04;
        const muroI = new THREE.Mesh(muro(offMuro, (i) => yPista(i), (i) => yPista(i) + 0.2, 1.4, 1), matMuro);
        const muroD = new THREE.Mesh(muro(-offMuro, (i) => yPista(i), (i) => yPista(i) + 0.2, 1.4, 1), matMuro);
        const matFalda = new THREE.MeshStandardMaterial({ color: c3(tipo === 'arido' ? '#7a6b4f' : tipo === 'urbano' ? '#3c3e45' : '#4a5a35'), roughness: 1, side: THREE.DoubleSide });
        const faldaI = new THREE.Mesh(muro(offMuro, (i) => yPista(i) - 1.1, (i) => yPista(i) - 0.01, 3, 1), matFalda);
        const faldaD = new THREE.Mesh(muro(-offMuro, (i) => yPista(i) - 1.1, (i) => yPista(i) - 0.01, 3, 1), matFalda);
        [muroI, muroD].forEach((m) => { m.castShadow = true; m.receiveShadow = true; });

        const grupo = new THREE.Group();
        grupo.add(pista, bordeI, bordeD, runI, runD, muroI, muroD, faldaI, faldaD);
        scene.add(grupo);

        /* ---- terreno: sube y baja siguiendo la pista y se aplana lejos de ella ---- */
        const NS_ = 100;
        const sx = new Float32Array(NS_), sz = new Float32Array(NS_), sy = new Float32Array(NS_);
        for (let k = 0; k < NS_; k++) {
            const p = curva.getPointAt(k / NS_);
            sx[k] = p.x; sz[k] = p.z; sy[k] = yPista(Math.round((k / NS_) * N));
        }
        const SUELO_MIN = Y0 - 0.55, PEND = 0.1, MARGEN = 0.2;
        function alturaSuelo(x, z) {
            let dmin = Infinity;
            const d = new Float32Array(NS_);
            for (let k = 0; k < NS_; k++) { const dx = x - sx[k], dz = z - sz[k]; d[k] = Math.sqrt(dx * dx + dz * dz); if (d[k] < dmin) dmin = d[k]; }
            let sw = 0, sv = 0;
            for (let k = 0; k < NS_; k++) {
                const dd = d[k] - dmin;
                if (dd > 7) continue;
                const w = Math.exp(-(dd * dd) / (2 * 1.8 * 1.8));
                sw += w; sv += w * (sy[k] - MARGEN - PEND * d[k]);
            }
            // Ondulación suave del paisaje lejos de la pista (colinas), sin tocar la zona cercana al asfalto
            const lejos = Math.max(0, Math.min(1, (dmin - 3) / 14));
            const colinas = (Math.sin(x * 0.11 + 1.3) * Math.cos(z * 0.09) + 0.6 * Math.sin(x * 0.047 - z * 0.061 + 2) + 0.3 * Math.sin(z * 0.19 + x * 0.13)) * 1.7 * lejos;
            return Math.max(SUELO_MIN, sv / sw) + (tipo === 'urbano' ? colinas * 0.25 : colinas);
        }
        const TAM = 230, SEG = tactil ? 80 : 110;
        const gT = new THREE.PlaneGeometry(TAM, TAM, SEG, SEG);
        gT.rotateX(-Math.PI / 2);
        const pT = gT.attributes.position;
        const colT = new Float32Array(pT.count * 3);
        const cBase = tipo === 'arido' ? [1, 0.97, 0.9] : tipo === 'urbano' ? [0.95, 0.95, 1] : [0.92, 1, 0.9];
        for (let i = 0; i < pT.count; i++) {
            const h = alturaSuelo(pT.getX(i), pT.getZ(i));
            pT.setY(i, h);
            const t = Math.max(0, Math.min(1, (h - SUELO_MIN) / 6)); // más alto = algo más claro/seco
            // manchas de color de baja frecuencia: rompen el patrón repetido de la textura
            const x = pT.getX(i), z = pT.getZ(i);
            const man = 0.5 + 0.5 * Math.sin(x * 0.21 + Math.cos(z * 0.17) * 2) * Math.cos(z * 0.13 - x * 0.05);
            const s = 0.74 + 0.22 * t + 0.2 * man;
            colT[i * 3] = cBase[0] * s * (1 + 0.1 * man * (tipo === 'verde' ? 1 : 0)); colT[i * 3 + 1] = cBase[1] * s; colT[i * 3 + 2] = cBase[2] * s * (1 - 0.12 * man * (tipo === 'verde' ? 1 : 0));
        }
        gT.setAttribute('color', new THREE.BufferAttribute(colT, 3));
        gT.computeVertexNormals();
        const texG = conAniso(texHierba(tipo));
        texG.repeat.set(tipo === 'urbano' ? 30 : 72, tipo === 'urbano' ? 30 : 72);
        const terreno = new THREE.Mesh(gT, new THREE.MeshStandardMaterial({ map: texG, vertexColors: true, roughness: 1, metalness: 0 }));
        terreno.receiveShadow = true;
        scene.add(terreno);

        /* ---- árboles (solo donde hay vegetación) ---- */
        if (tipo === 'verde') {
            const cant = tactil ? 380 : 700;
            const matF = new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true });
            const conif = new THREE.InstancedMesh(new THREE.ConeBufferGeometry(0.42, 1.7, 6), matF, cant);
            const copa = new THREE.InstancedMesh(new THREE.IcosahedronBufferGeometry(0.62, 0), matF, cant);
            const tronco = new THREE.InstancedMesh(new THREE.CylinderBufferGeometry(0.06, 0.09, 0.6, 5), new THREE.MeshStandardMaterial({ color: c3('#3f2f20'), roughness: 1 }), cant);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), esc = new THREE.Vector3(), col = new THREE.Color();
            const eje = new THREE.Vector3(0, 1, 0);
            let nC = 0, nR = 0, nT = 0, intentos = 0;
            while (nT < cant && intentos < cant * 16) {
                intentos++;
                const x = (rnd() - 0.5) * 160, z = (rnd() - 0.5) * 160;
                // bosques por manchas: más árboles donde el "mapa de densidad" es alto
                const dens = 0.5 + 0.5 * Math.sin(x * 0.083 + 0.7) * Math.cos(z * 0.071 - 1.1);
                if (rnd() > dens * dens + 0.04) continue;
                let cerca = Infinity;
                for (let k = 0; k < NS_; k++) { const dd = Math.hypot(x - sx[k], z - sz[k]); if (dd < cerca) cerca = dd; if (cerca < 3.6) break; }
                if (cerca < 3.6) continue;
                const yb = alturaSuelo(x, z);
                const s = 0.55 + rnd() * 0.75;
                q.setFromAxisAngle(eje, rnd() * 6.28);
                const esConif = rnd() < 0.55;
                if (esConif) {
                    esc.set(s, s * (0.9 + rnd() * 0.5), s);
                    pos.set(x, yb + 0.5 * s + 0.85 * esc.y, z);
                    m4.compose(pos, q, esc);
                    conif.setMatrixAt(nC, m4);
                    col.setHSL(0.3 + rnd() * 0.04, 0.3 + rnd() * 0.15, 0.13 + rnd() * 0.07);
                    conif.setColorAt(nC++, col);
                } else {
                    esc.set(s * (0.9 + rnd() * 0.3), s * (0.8 + rnd() * 0.3), s * (0.9 + rnd() * 0.3));
                    pos.set(x, yb + 0.55 * s + 0.55 * esc.y, z);
                    m4.compose(pos, q, esc);
                    copa.setMatrixAt(nR, m4);
                    col.setHSL(0.22 + rnd() * 0.08, 0.3 + rnd() * 0.2, 0.2 + rnd() * 0.08);
                    copa.setColorAt(nR++, col);
                }
                pos.set(x, yb + 0.3 * s, z);
                esc.set(s, s, s);
                m4.compose(pos, q, esc);
                tronco.setMatrixAt(nT++, m4);
            }
            conif.count = nC; copa.count = nR; tronco.count = nT;
            [conif, copa, tronco].forEach((o) => { o.castShadow = true; scene.add(o); });
        }

        // Salida / meta: línea a cuadros y pórtico
        const cv = lienzo(128, 32);
        const g2 = cv.getContext('2d');
        for (let x = 0; x < 16; x++) for (let y = 0; y < 4; y++) { g2.fillStyle = (x + y) % 2 ? '#15151a' : '#f2f2f4'; g2.fillRect(x * 8, y * 8, 8, 8); }
        const lineaMeta = new THREE.Mesh(new THREE.PlaneGeometry(ANCHO, 0.55), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 }));
        const m0 = mu[0];
        lineaMeta.rotation.order = 'YXZ';
        lineaMeta.rotation.set(-Math.PI / 2, Math.atan2(-m0.n.z, m0.n.x), 0);
        lineaMeta.position.set(m0.p.x, yPista(0) + 0.02, m0.p.z);
        scene.add(lineaMeta);
        const porticoMat = new THREE.MeshStandardMaterial({ color: c3('#b9bcc4'), roughness: 0.45, metalness: 0.5 });
        const portico = new THREE.Group();
        [-1, 1].forEach((l) => {
            const pil = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.5, 0.14), porticoMat);
            pil.position.set(0, 0.75, l * (ANCHO / 2 + KERB + RUN + 0.1));
            pil.castShadow = true;
            portico.add(pil);
        });
        const viga = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 2 * (ANCHO / 2 + KERB + RUN + 0.1) + 0.2), new THREE.MeshStandardMaterial({ color: c3('#1c1d24'), roughness: 0.5, metalness: 0.3 }));
        viga.position.set(0, 1.5, 0);
        viga.castShadow = true;
        portico.add(viga);
        portico.position.set(m0.p.x, yPista(0), m0.p.z);
        portico.rotation.y = Math.atan2(m0.n.x, m0.n.z); // el eje Z del pórtico sigue la normal de la pista
        scene.add(portico);

        /* ---- coche (monoplaza sencillo, sin marcas) ---- */
        const coche = new THREE.Group();
        const mat = (hex, r, m) => new THREE.MeshStandardMaterial({ color: c3(hex), roughness: r, metalness: m || 0 });
        const pintura = mat('#b8120f', 0.35, 0.35), negro = mat('#15151a', 0.6, 0.2), goma = mat('#0d0d0f', 0.95);
        const parte = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; coche.add(o); return o; };
        parte(new THREE.BoxGeometry(0.62, 0.1, 0.17), pintura, -0.02, 0.13, 0);          // fuselaje
        parte(new THREE.BoxGeometry(0.4, 0.05, 0.1), pintura, 0.42, 0.1, 0);             // morro
        parte(new THREE.BoxGeometry(0.3, 0.09, 0.07), pintura, -0.05, 0.12, 0.125);       // pontón izq.
        parte(new THREE.BoxGeometry(0.3, 0.09, 0.07), pintura, -0.05, 0.12, -0.125);       // pontón der.
        parte(new THREE.BoxGeometry(0.07, 0.015, 0.38), negro, 0.6, 0.045, 0);             // alerón delantero
        parte(new THREE.BoxGeometry(0.1, 0.03, 0.32), negro, -0.4, 0.27, 0);               // alerón trasero
        parte(new THREE.BoxGeometry(0.03, 0.14, 0.03), negro, -0.38, 0.2, 0);              // soporte
        parte(new THREE.SphereGeometry(0.055, 10, 8), mat('#e9e9ec', 0.4), 0.0, 0.215, 0); // casco
        parte(new THREE.BoxGeometry(0.1, 0.012, 0.012), negro, 0.01, 0.275, 0);            // halo
        const rueda = new THREE.CylinderBufferGeometry(0.075, 0.075, 0.075, 14);
        [[0.36, 0.17], [0.36, -0.17], [-0.34, 0.18], [-0.34, -0.18]].forEach(([x, z]) => {
            const w = parte(rueda, goma, x, 0.075, z);
            w.rotation.x = Math.PI / 2;
        });
        coche.rotation.order = 'YZX';
        scene.add(coche);

        function colocarCoche(u) {
            const uu = ((u % 1) + 1) % 1;
            const p = curva.getPointAt(uu);
            const t = curva.getTangentAt(uu);
            const i = uu * N, i0 = Math.floor(i) % N, i1 = (i0 + 1) % N, fr = i - Math.floor(i);
            const y = yPista(i0) * (1 - fr) + yPista(i1) * fr;
            const yAdelante = yPista((Math.floor(i) + 6) % N);
            const horiz = largoEsc / N * 6;
            coche.position.set(p.x, y + 0.01, p.z);
            coche.rotation.y = Math.atan2(-t.z, t.x);
            coche.rotation.z = Math.atan2(yAdelante - yPista(i0), horiz);
            if (prof) prof.mover(uu);
        }

        /* ---- cámara orbital ---- */
        const centroY = (() => { let s = 0; for (let i = 0; i < N; i++) s += hu[i]; return Y0 + s / N * 0.8; })();
        const orb = { az: 0.6, el: 0.62, R: 56, vAz: 0, vEl: 0, auto: !quieto, arrastrando: false };
        const R0 = { az: 0.6, el: 0.62, R: 56 };
        const MINR = 16, MAXR = 130;
        function poner() {
            camera.position.set(
                orb.R * Math.cos(orb.el) * Math.sin(orb.az),
                centroY + orb.R * Math.sin(orb.el),
                orb.R * Math.cos(orb.el) * Math.cos(orb.az)
            );
            camera.lookAt(0, centroY, 0);
        }
        const lim = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

        let vuelta = !quieto;
        let u = 0;
        const reloj = new THREE.Clock();
        let visible = true;
        let raf = 0;

        function pintar() {
            const dt = Math.min(reloj.getDelta(), 0.05);
            if (vuelta) { u = (u + dt / 18) % 1; colocarCoche(u); }
            if (orb.auto && !orb.arrastrando) orb.az += dt * 0.12;
            if (!orb.arrastrando) {
                orb.az += orb.vAz; orb.el = lim(orb.el + orb.vEl, 0.1, 1.5);
                orb.vAz *= 0.92; orb.vEl *= 0.92;
            }
            poner();
            renderer.render(scene, camera);
        }
        function bucle() {
            raf = 0;
            if (visible && !document.hidden) pintar();
            if (!quieto && visible && !document.hidden) raf = requestAnimationFrame(bucle);
        }
        function arrancar() { if (!raf) raf = requestAnimationFrame(bucle); }
        function una() { if (quieto) pintar(); else arrancar(); }

        /* ---- interacción ---- */
        const punteros = new Map();
        let distPinza = 0;
        canvas.style.touchAction = 'none';
        canvas.addEventListener('pointerdown', (e) => {
            canvas.setPointerCapture(e.pointerId);
            punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
            orb.arrastrando = true; orb.auto = false; orb.vAz = orb.vEl = 0;
            actualizarBotones();
            if (punteros.size === 2) { const [p, q] = [...punteros.values()]; distPinza = Math.hypot(p.x - q.x, p.y - q.y); }
        });
        canvas.addEventListener('pointermove', (e) => {
            const prev = punteros.get(e.pointerId);
            if (!prev) return;
            if (punteros.size === 1) {
                const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
                orb.az -= dx * 0.008; orb.el = lim(orb.el + dy * 0.006, 0.1, 1.5);
                orb.vAz = -dx * 0.0016; orb.vEl = dy * 0.0012;
            } else if (punteros.size === 2) {
                punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
                const [p, q] = [...punteros.values()];
                const d = Math.hypot(p.x - q.x, p.y - q.y);
                if (distPinza) orb.R = lim(orb.R * (distPinza / d), MINR, MAXR);
                distPinza = d;
            }
            punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
            una();
        });
        const soltar = (e) => { punteros.delete(e.pointerId); if (!punteros.size) { orb.arrastrando = false; distPinza = 0; } una(); };
        canvas.addEventListener('pointerup', soltar);
        canvas.addEventListener('pointercancel', soltar);
        canvas.addEventListener('wheel', (e) => { e.preventDefault(); orb.R = lim(orb.R * (1 + Math.sign(e.deltaY) * 0.08), MINR, MAXR); orb.auto = false; actualizarBotones(); una(); }, { passive: false });
        canvas.addEventListener('keydown', (e) => {
            const k = e.key;
            let usado = true;
            if (k === 'ArrowLeft') orb.az -= 0.12;
            else if (k === 'ArrowRight') orb.az += 0.12;
            else if (k === 'ArrowUp') orb.el = lim(orb.el + 0.08, 0.1, 1.5);
            else if (k === 'ArrowDown') orb.el = lim(orb.el - 0.08, 0.1, 1.5);
            else if (k === '+' || k === '=') orb.R = lim(orb.R * 0.9, MINR, MAXR);
            else if (k === '-') orb.R = lim(orb.R * 1.1, MINR, MAXR);
            else if (k === '0') { Object.assign(orb, R0, { vAz: 0, vEl: 0 }); }
            else usado = false;
            if (usado) { e.preventDefault(); orb.auto = false; actualizarBotones(); una(); }
        });

        /* ---- barra de botones ---- */
        const barra = document.createElement('div');
        barra.className = 'c3d-bar';
        function boton(texto, fn, presionable) {
            const bt = document.createElement('button');
            bt.type = 'button';
            bt.className = 'btn btn--ghost';
            bt.textContent = texto;
            if (presionable) bt.setAttribute('aria-pressed', 'false');
            bt.addEventListener('click', fn);
            barra.append(bt);
            return bt;
        }
        const bGirar = boton(T('Girar solo', 'Auto-rotate'), () => { orb.auto = !orb.auto; actualizarBotones(); una(); }, true);
        const bVuelta = boton(T('Coche en pista', 'Car on track'), () => { vuelta = !vuelta; actualizarBotones(); if (vuelta) una(); }, true);
        boton(T('Vista aérea', 'Top view'), () => { orb.el = 1.5; orb.auto = false; actualizarBotones(); una(); });
        boton(T('Vista baja', 'Low view'), () => { orb.el = 0.16; orb.R = 40; orb.auto = false; actualizarBotones(); una(); });
        boton(T('Restablecer', 'Reset'), () => { Object.assign(orb, R0, { vAz: 0, vEl: 0 }); una(); });
        function actualizarBotones() {
            bGirar.setAttribute('aria-pressed', String(!!orb.auto));
            bVuelta.setAttribute('aria-pressed', String(!!vuelta));
        }
        actualizarBotones();

        const ayuda = document.createElement('p');
        ayuda.className = 'data-credit';
        ayuda.textContent = T('Arrastra para girar · rueda o pellizco para zoom · teclado: flechas, + y −.' + (prof ? ' Toca la gráfica de abajo para mover el coche por la vuelta.' : ''),
            'Drag to rotate · wheel or pinch to zoom · keyboard: arrows, + and −.' + (prof ? ' Touch the chart below to move the car along the lap.' : ''));

        marco.append(canvas, barra, ayuda);
        if (prof) {
            marco.append(prof.el);
            prof.alMover((uu) => { vuelta = false; u = uu; colocarCoche(u); actualizarBotones(); una(); });
        }
        marco.append(info);
        contenedor.append(marco);

        function ajustar() {
            const w = Math.max(280, Math.round(canvas.parentElement.getBoundingClientRect().width || 640));
            const hpx = Math.round(Math.min(w * 0.62, 560));
            renderer.setSize(w, hpx, false);
            camera.aspect = w / hpx;
            camera.updateProjectionMatrix();
        }
        ajustar();
        if ('ResizeObserver' in window) new ResizeObserver(() => { ajustar(); una(); }).observe(marco);
        colocarCoche(0);
        poner();
        pintar();
        if (!quieto) {
            arrancar();
            if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) arrancar(); }, { threshold: 0.05 }).observe(canvas);
            document.addEventListener('visibilitychange', () => { if (!document.hidden) arrancar(); });
        }
        return true;
    }

    /** Nombre del trazado que corresponde a este circuito (o null). Útil para saber si hay 3D. */
    async function trazadoDe(circuito) {
        try {
            const f = buscar(await cargarDatos(), circuito.lat, circuito.lon);
            return f ? (f.properties || {}).Name || '' : null;
        } catch (e) { return null; }
    }

    window.F1Circuito3D = { montar, trazadoDe };
})();
