// mascota3d.js - Versión 3D real (WebGL con Three.js) del personaje del piloto.
//
// Figura original (no es un retrato): torso con mono de carreras, casco abierto con visor levantado,
// rostro neutro igual para todos y base de figurilla. Se ilumina y se sombrea en 3D.
// - La cabeza, los ojos y el cuerpo siguen el puntero.
// - saludar(): levanta el brazo y lo agita, da un saltito.  hablar(true/false): mueve la boca.
// - Si no hay WebGL o falla la carga de la librería, devuelve null y se queda la versión CSS.
//
// Three.js r128 (MIT) se sirve desde js/vendor/three.min.js y solo se descarga en la ficha del piloto.
// Expone window.F1Mascota3D.activar(opciones) -> Promise<rig|null>

(function () {
    'use strict';

    const BASE = location.pathname.replace(/\\/g, '/').includes('/html/') ? '../../' : './';
    let promesaThree = null;

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

    /* Decal del pecho (número, código, franja y paneles) dibujado en un canvas */
    function texturaPecho(THREE, p, numero, codigo) {
        const [, acento, ribete, tinta] = p;
        const c = document.createElement('canvas');
        c.width = c.height = 512;
        const g = c.getContext('2d');
        const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); g.fill(); };
        g.fillStyle = acento;
        rr(28, 50, 58, 330, 28);
        rr(426, 50, 58, 330, 28);
        g.fillStyle = ribete;
        g.fillRect(0, 306, 512, 70);
        g.fillStyle = acento;
        g.fillRect(0, 316, 512, 50);
        g.textAlign = 'center';
        g.fillStyle = tinta;
        g.font = '800 190px Poppins, system-ui, sans-serif';
        g.textBaseline = 'alphabetic';
        g.fillText(String(numero || '').slice(0, 3), 256, 250);
        g.font = '800 64px Poppins, system-ui, sans-serif';
        if ('letterSpacing' in g) g.letterSpacing = '10px';
        g.fillText(String(codigo || '').slice(0, 3), 256, 450);
        const t = new THREE.CanvasTexture(c);
        t.anisotropy = 4;
        return t;
    }

    async function activar(op) {
        if (!hayWebGL()) return null;
        let THREE;
        try { THREE = await cargarThree(); } catch (e) { return null; }

        const { boton, escena, raiz, datos, paleta, quieto } = op;
        const [suit, acento, ribete] = paleta;
        const col = (c) => new THREE.Color(c);
        const std = (c, rough, metal) => new THREE.MeshStandardMaterial({ color: col(c), roughness: rough == null ? 0.55 : rough, metalness: metal || 0 });

        /* ---------------------------------------------- renderer y cámara */
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
        } catch (e) { return null; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        const canvas = renderer.domElement;
        canvas.className = 'mx-canvas';
        canvas.setAttribute('aria-hidden', 'true');

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 0.8, 0.1, 100);
        camera.position.set(0, 1.7, 17);
        camera.lookAt(0, 1.4, 0);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2a3a, 0.75));
        const key = new THREE.DirectionalLight(0xffffff, 0.95);
        key.position.set(3, 6, 8);
        scene.add(key);
        const rim = new THREE.DirectionalLight(col(acento), 0.7);
        rim.position.set(-6, 3, -5);
        scene.add(rim);

        /* ------------------------------------------------------ personaje */
        const figura = new THREE.Group();
        scene.add(figura);

        // Base de figurilla
        const base = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.3, 0.35, 56), std('#16161c', 0.3, 0.5));
        base.position.y = -2.45;
        figura.add(base);
        const anillo = new THREE.Mesh(new THREE.TorusGeometry(3.12, 0.07, 10, 64), std(acento, 0.3, 0.2));
        anillo.rotation.x = Math.PI / 2;
        anillo.position.y = -2.27;
        figura.add(anillo);

        const cuerpoG = new THREE.Group();
        figura.add(cuerpoG);

        // Torso: rectángulo redondeado extruido con bisel
        const w = 2.7, h = 3.2, r = 0.95;
        const forma = new THREE.Shape();
        forma.moveTo(-w / 2 + r, -h / 2);
        forma.lineTo(w / 2 - r, -h / 2);
        forma.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        forma.lineTo(w / 2, h / 2 - r);
        forma.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        forma.lineTo(-w / 2 + r, h / 2);
        forma.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        forma.lineTo(-w / 2, -h / 2 + r);
        forma.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
        const geoTorso = new THREE.ExtrudeGeometry(forma, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.38, bevelSize: 0.38, bevelSegments: 8, curveSegments: 14 });
        geoTorso.center();
        const torso = new THREE.Mesh(geoTorso, std(suit, 0.6, 0.04));
        cuerpoG.add(torso);

        const decal = new THREE.Mesh(
            new THREE.PlaneGeometry(2.5, 2.5),
            new THREE.MeshBasicMaterial({ map: texturaPecho(THREE, paleta, datos.numero, datos.codigo), transparent: true })
        );
        decal.position.set(0, 0.1, 0.835);
        cuerpoG.add(decal);

        // Cuello y cuello de camisa
        const piel = std('#eab995', 0.7);
        const cuello = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.8, 24), piel);
        cuello.position.y = 2.1;
        cuerpoG.add(cuello);
        const collar = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.24, 14, 40), std(ribete, 0.5));
        collar.rotation.x = Math.PI / 2;
        collar.position.y = 1.9;
        cuerpoG.add(collar);

        // Brazos con pivote en el hombro
        function brazo(lado) {
            const piv = new THREE.Group();
            piv.position.set(lado * 1.95, 1.0, 0);
            const hombro = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 18), std(suit, 0.6, 0.04));
            const manga = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.44, 2.3, 24), std(suit, 0.6, 0.04));
            manga.position.y = -1.15;
            const banda = new THREE.Mesh(new THREE.CylinderGeometry(0.515, 0.5, 0.34, 24), std(acento, 0.45));
            banda.position.y = -0.75;
            const puno = new THREE.Mesh(new THREE.CylinderGeometry(0.455, 0.455, 0.22, 24), std(ribete, 0.5));
            puno.position.y = -2.2;
            const guante = new THREE.Mesh(new THREE.SphereGeometry(0.56, 24, 18), std('#17171c', 0.35, 0.35));
            guante.scale.set(1, 1.08, 0.95);
            guante.position.y = -2.7;
            const dedoPulgar = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), std('#17171c', 0.35, 0.35));
            dedoPulgar.position.set(-lado * 0.42, -2.55, 0.18);
            piv.add(hombro, manga, banda, puno, guante, dedoPulgar);
            piv.rotation.z = lado * 0.16;
            cuerpoG.add(piv);
            return piv;
        }
        const brazoIzq = brazo(-1);
        const brazoDer = brazo(1);

        /* Cabeza */
        const cabeza = new THREE.Group();
        cabeza.position.set(0, 3.45, 0);
        cabeza.scale.setScalar(1.3);
        cuerpoG.add(cabeza);

        const craneo = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 30), piel);
        craneo.scale.set(1, 1.08, 0.97);
        cabeza.add(craneo);
        const Z = (x, y) => 0.97 * Math.sqrt(Math.max(0.05, 1 - x * x - (y / 1.08) * (y / 1.08)));

        // Casco: cúpula superior + carcasa trasera con abertura frontal para la cara
        const matCasco = std(suit, 0.35, 0.18);
        matCasco.side = THREE.DoubleSide;
        const RC = 1.13;
        const cupula = new THREE.Mesh(new THREE.SphereGeometry(RC, 48, 28, 0, Math.PI * 2, 0, Math.PI * 0.35), matCasco);
        cupula.scale.set(1, 1.08, 1);
        const hueco = (Math.PI * 128) / 180;
        const carcasa = new THREE.Mesh(new THREE.SphereGeometry(RC, 48, 28, Math.PI / 2 + hueco / 2, Math.PI * 2 - hueco, Math.PI * 0.35, Math.PI * 0.5), matCasco);
        carcasa.scale.set(1, 1.08, 1);
        const franja = new THREE.Mesh(new THREE.TorusGeometry(RC + 0.02, 0.085, 10, 56, Math.PI), std(acento, 0.4, 0.1));
        franja.scale.set(1, 1.08, 1);
        franja.rotation.y = Math.PI / 2;
        const franja2 = new THREE.Mesh(new THREE.TorusGeometry(RC + 0.03, 0.04, 8, 56, Math.PI), std(ribete, 0.4, 0.1));
        franja2.scale.set(1, 1.08, 1);
        franja2.rotation.y = Math.PI / 2;
        franja2.position.x = 0.11;
        cabeza.add(cupula, carcasa, franja, franja2);

        // Visor levantado sobre la cabeza
        const matVisor = new THREE.MeshStandardMaterial({ color: col('#0d1424'), roughness: 0.12, metalness: 0.7, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
        const visor = new THREE.Mesh(new THREE.SphereGeometry(1.24, 36, 14, Math.PI / 2 - 0.95, 1.9, 0.12, Math.PI * 0.27), matVisor);
        visor.rotation.x = -0.62;
        visor.position.set(0, 0.28, -0.12);
        cabeza.add(visor);

        // Rostro
        const blanco = std('#ffffff', 0.3);
        const oscuro = std('#1c120b', 0.4);
        const ojos = [];
        const pupilas = [];
        [-1, 1].forEach((lado) => {
            const x = lado * 0.37, y = 0.13;
            const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), blanco);
            ojo.scale.set(1.05, 0.85, 0.5);
            ojo.position.set(x, y, Z(x, y) - 0.015);
            const pup = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 12), oscuro);
            pup.position.set(0, 0, 0.1);
            const brillo = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            brillo.position.set(0.03, 0.035, 0.1);
            pup.add(brillo);
            ojo.add(pup);
            cabeza.add(ojo);
            ojos.push(ojo);
            pupilas.push(pup);
            const ceja = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.075, 0.1), std('#3a281d', 0.8));
            ceja.position.set(x, 0.43, Z(x, 0.43) + 0.005);
            ceja.rotation.z = lado * 0.09;
            cabeza.add(ceja);
            const mejilla = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), new THREE.MeshStandardMaterial({ color: col('#e8847a'), roughness: 0.9, transparent: true, opacity: 0.4 }));
            mejilla.scale.set(1.2, 0.7, 0.25);
            mejilla.position.set(lado * 0.52, -0.22, Z(lado * 0.52, -0.22) - 0.01);
            cabeza.add(mejilla);
        });
        const nariz = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), std('#d39a74', 0.7));
        nariz.scale.set(0.9, 1.1, 0.9);
        nariz.position.set(0, -0.1, Z(0, -0.1) + 0.045);
        cabeza.add(nariz);

        const sonrisa = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.034, 8, 24, Math.PI), std('#8c3d3a', 0.6));
        sonrisa.rotation.z = Math.PI;
        sonrisa.position.set(0, -0.36, Z(0, -0.36) + 0.01);
        cabeza.add(sonrisa);
        const boca = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12), std('#4a171b', 0.5));
        boca.scale.set(1, 0.4, 0.3);
        boca.position.set(0, -0.4, Z(0, -0.4) - 0.01);
        boca.visible = false;
        cabeza.add(boca);

        /* ----------------------------------------------------- animación */
        const estado = { yaw: 0, pitch: 0, ty: 0, tp: 0, wave: -1, hablando: false, parpadeo: -1, proxParp: 2.5, px: 0, py: 0, hayPuntero: false };
        const reloj = new THREE.Clock();
        const lim = (v, m) => Math.max(-m, Math.min(m, v));
        const ease = (t) => t * t * (3 - 2 * t);

        function objetivo() {
            const rc = canvas.getBoundingClientRect();
            const cx = rc.left + rc.width / 2;
            const cy = rc.top + rc.height * 0.3;
            estado.ty = lim((estado.px - cx) / 380, 1) * 0.75;
            estado.tp = lim((estado.py - cy) / 380, 1) * 0.5;
        }
        function enPuntero(e) { estado.px = e.clientX; estado.py = e.clientY; estado.hayPuntero = true; }
        if (!quieto) document.addEventListener('pointermove', enPuntero, { passive: true });

        function cuadro() {
            const dt = Math.min(reloj.getDelta(), 0.05);
            const t = reloj.elapsedTime;
            if (!quieto) {
                if (estado.hayPuntero) objetivo();
                else { estado.ty = Math.sin(t * 0.6) * 0.25; estado.tp = Math.sin(t * 0.45) * 0.08; }
                estado.yaw += (estado.ty - estado.yaw) * Math.min(1, dt * 9);
                estado.pitch += (estado.tp - estado.pitch) * Math.min(1, dt * 9);
                cabeza.rotation.y = estado.yaw;
                cabeza.rotation.x = estado.pitch;
                cuerpoG.rotation.y = estado.yaw * 0.28;
                // Los ojos se adelantan un poco a la cabeza
                pupilas.forEach((p) => { p.position.x = lim(estado.ty - estado.yaw, 0.6) * 0.1; p.position.y = -lim(estado.tp - estado.pitch, 0.5) * 0.12; });
                // Respiración
                torso.scale.y = 1 + Math.sin(t * 2) * 0.01;
                cabeza.position.y = 3.45 + Math.sin(t * 2) * 0.03;
                brazoIzq.rotation.z = -0.16 - Math.sin(t * 2) * 0.012;
                // Parpadeo
                estado.proxParp -= dt;
                if (estado.proxParp <= 0 && estado.parpadeo < 0) { estado.parpadeo = 0; estado.proxParp = 2.5 + Math.random() * 3; }
                if (estado.parpadeo >= 0) {
                    estado.parpadeo += dt;
                    const k = Math.abs(Math.sin((estado.parpadeo / 0.16) * Math.PI));
                    ojos.forEach((o) => { o.scale.y = 0.85 * (1 - 0.92 * (estado.parpadeo < 0.16 ? k : 0)); });
                    if (estado.parpadeo >= 0.16) { estado.parpadeo = -1; ojos.forEach((o) => { o.scale.y = 0.85; }); }
                }
            }
            // Saludo
            let salto = 0;
            if (estado.wave >= 0) {
                estado.wave += dt;
                const s = estado.wave;
                let ang = 0.16;
                if (s < 0.35) ang = 0.16 + (2.55 - 0.16) * ease(s / 0.35);
                else if (s < 1.45) ang = 2.55 + Math.sin((s - 0.35) * 15) * 0.32;
                else if (s < 1.85) ang = 2.55 - (2.55 - 0.16) * ease((s - 1.45) / 0.4);
                else { estado.wave = -1; }
                brazoDer.rotation.z = ang;
                if (s < 1.0) salto = Math.abs(Math.sin((s / 0.5) * Math.PI)) * 0.3;
            } else {
                brazoDer.rotation.z = 0.16 + (quieto ? 0 : Math.sin(t * 2 + 1) * 0.012);
            }
            figura.position.y = salto;
            // Boca
            if (estado.hablando) {
                const a = 0.55 + Math.abs(Math.sin(t * 16)) * 0.9;
                boca.visible = true; sonrisa.visible = false;
                boca.scale.set(1, 0.25 + a * 0.45, 0.3);
            } else { boca.visible = false; sonrisa.visible = true; }
            renderer.render(scene, camera);
        }

        /* ---------------------------------------------- tamaño y ciclo */
        function ajustar() {
            const rc = boton.getBoundingClientRect();
            const wpx = Math.max(160, Math.round(rc.width || 280));
            const hpx = Math.round(wpx * 1.25);
            renderer.setSize(wpx, hpx, false);
            camera.aspect = wpx / hpx;
            camera.updateProjectionMatrix();
        }

        let visible = true;
        let id = 0;
        function bucle() {
            id = 0;
            if (visible && !document.hidden) { cuadro(); }
            if (!quieto && visible && !document.hidden) id = requestAnimationFrame(bucle);
        }
        function arrancar() { if (!id) id = requestAnimationFrame(bucle); }

        // Sustituye la versión CSS por el lienzo 3D
        escena.replaceWith(canvas);
        raiz.classList.add('mx--3d');
        ajustar();
        cuadro();
        if (!quieto) {
            arrancar();
            if ('IntersectionObserver' in window) {
                new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) arrancar(); }, { threshold: 0.05 }).observe(canvas);
            }
            document.addEventListener('visibilitychange', () => { if (!document.hidden) arrancar(); });
        }
        if ('ResizeObserver' in window) new ResizeObserver(() => { ajustar(); cuadro(); }).observe(boton);

        return {
            saludar() { estado.wave = 0; if (quieto) { brazoDer.rotation.z = 2.4; cuadro(); setTimeout(() => { brazoDer.rotation.z = 0.16; cuadro(); }, 1500); } else arrancar(); },
            hablar(si) { estado.hablando = !!si; if (quieto) cuadro(); }
        };
    }

    window.F1Mascota3D = { activar };
})();
