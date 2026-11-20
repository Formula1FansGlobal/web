// mascota.js - Personaje 3D animado para cada piloto (ilustración original, NO es un retrato).
//
// - Casco, visor y cuerpo con los colores del equipo y el número del piloto. No usa fotos ni rasgos reales.
// - La cabeza y los ojos siguen el puntero del mouse (efecto 3D con CSS, sin librerías).
// - Al hacer clic (o Enter) saluda con la mano y aparece un globo con "hola" en el idioma de su país.
// - Respeta "reducir movimiento" del sistema: sin seguimiento ni animaciones, el clic igual muestra el saludo.
//
// Expone window.F1Mascota { montar(contenedor, datos), avatar(datos), saludo(nacionalidad) }.
// Estilos: css/explorar.css (clases mx-*).

(function () {
    'use strict';

    const EN = (() => { try { return localStorage.getItem('f1fg:lang') === 'en'; } catch (e) { return false; } })();

    /* ------------------------------------------------------------ saludos */
    // [texto, código de idioma, nombre en español, nombre en inglés]
    const ES = ['¡Hola!', 'es', 'español', 'Spanish'];
    const EN_ = ['Hello!', 'en', 'inglés', 'English'];
    const FR = ['Bonjour !', 'fr', 'francés', 'French'];
    const DE = ['Hallo!', 'de', 'alemán', 'German'];
    const SAL = {
        Dutch: ['Hallo!', 'nl', 'neerlandés', 'Dutch'],
        Belgian: ['Hallo!', 'nl', 'neerlandés', 'Dutch'],
        British: EN_, American: ['Hi!', 'en', 'inglés', 'English'], Canadian: EN_, Irish: EN_, 'New Zealander': ['Kia ora!', 'mi', 'maorí', 'Māori'],
        'South African': EN_, Rhodesian: EN_,
        Australian: ["G'day!", 'en', 'inglés', 'English'],
        Monegasque: FR, French: FR,
        Spanish: ES, Mexican: ES, Argentine: ES, Colombian: ES, Venezuelan: ES, Uruguayan: ES, Chilean: ES,
        Thai: ['สวัสดี!', 'th', 'tailandés', 'Thai'],
        Finnish: ['Moi!', 'fi', 'finés', 'Finnish'],
        German: DE, Liechtensteiner: DE, Austrian: ['Servus!', 'de', 'alemán', 'German'], Swiss: ['Grüezi!', 'de', 'alemán', 'German'],
        Italian: ['Ciao!', 'it', 'italiano', 'Italian'],
        Japanese: ['こんにちは！', 'ja', 'japonés', 'Japanese'],
        Chinese: ['你好！', 'zh', 'chino', 'Chinese'],
        Danish: ['Hej!', 'da', 'danés', 'Danish'], Swedish: ['Hej!', 'sv', 'sueco', 'Swedish'],
        Brazilian: ['Olá!', 'pt', 'portugués', 'Portuguese'], Portuguese: ['Olá!', 'pt', 'portugués', 'Portuguese'],
        Polish: ['Cześć!', 'pl', 'polaco', 'Polish'], Russian: ['Привет!', 'ru', 'ruso', 'Russian'],
        Hungarian: ['Szia!', 'hu', 'húngaro', 'Hungarian'], Estonian: ['Tere!', 'et', 'estonio', 'Estonian'],
        Indonesian: ['Halo!', 'id', 'indonesio', 'Indonesian'], Indian: ['नमस्ते!', 'hi', 'hindi', 'Hindi'],
        Malaysian: ['Hai!', 'ms', 'malayo', 'Malay'], Czech: ['Ahoj!', 'cs', 'checo', 'Czech']
    };

    function saludo(nacionalidad) {
        const s = SAL[String(nacionalidad || '').trim()] || EN_;
        return { texto: s[0], lang: s[1], idioma: EN ? s[3] : s[2] };
    }

    /* ------------------------------------------------------------- colores */
    // Paleta del uniforme por equipo: [traje, acento, ribete, tinta del número].
    // Solo colores: no se usan logotipos, patrocinadores ni marcas.
    const EQUIPOS = {
        mercedes: ['#17171a', '#00d2be', '#c9ced6', '#c9ced6'],
        ferrari: ['#d40000', '#ffffff', '#ffe600', '#ffe600'],
        red_bull: ['#14216e', '#e10600', '#ffd100', '#ffd100'],
        mclaren: ['#ff8000', '#0a0a0a', '#47c7fc', '#0a0a0a'],
        aston_martin: ['#00594f', '#cedc00', '#ffffff', '#cedc00'],
        alpine: ['#0a5bd6', '#ff87bc', '#ffffff', '#ffffff'],
        williams: ['#0a3fd0', '#ffffff', '#00a0dd', '#ffffff'],
        rb: ['#e8ecf5', '#1e3fa8', '#ff0f3f', '#1e3fa8'],
        haas: ['#eeeef1', '#d6001c', '#111111', '#d6001c'],
        sauber: ['#0f0f12', '#52e252', '#ffffff', '#52e252'],
        audi: ['#c4c7cf', '#d4143c', '#111111', '#111111'],
        cadillac: ['#0e0e14', '#b8bcc6', '#d4af37', '#d4af37']
    };

    function colores(equipoId) {
        const id = String(equipoId || '');
        if (EQUIPOS[id]) return EQUIPOS[id];
        if (!id) return ['#d40500', '#ffc83d', '#ffffff', '#ffffff'];
        let hash = 0;
        for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 360;
        return [`hsl(${hash}, 62%, 36%)`, `hsl(${(hash + 40) % 360}, 80%, 62%)`, '#ffffff', '#ffffff'];
    }

    /* --------------------------------------------------------------- DOM */
    function el(tag, clase, hijos) {
        const e = document.createElement(tag);
        if (clase) e.className = clase;
        (hijos || []).forEach((h) => e.append(h));
        return e;
    }

    /** Construye el personaje. datos: { numero, codigo, equipoId } */
    function construir(datos, mini) {
        const [suit, acento, ribete, tinta] = colores(datos.equipoId);
        const raiz = el('div', 'mx' + (mini ? ' mx--mini' : ''));
        raiz.style.setProperty('--c1', suit);
        raiz.style.setProperty('--c2', acento);
        raiz.style.setProperty('--c3', ribete);
        raiz.style.setProperty('--ink', tinta);

        /* Cuerpo: mono de carreras con cuello, paneles laterales, franja, cinturón y guantes */
        const num = el('span', 'mx-num');
        num.textContent = String(datos.numero || '').slice(0, 3);
        const codigo = el('span', 'mx-code');
        codigo.textContent = String(datos.codigo || '').slice(0, 3);

        const manga = (lado) => el('div', 'mx-arm mx-arm-' + lado, [el('i', 'mx-sleeve-band'), el('i', 'mx-cuff'), el('i', 'mx-hand')]);
        const cuerpo = el('div', 'mx-body', [
            el('i', 'mx-panel mx-panel-l'), el('i', 'mx-panel mx-panel-r'), el('i', 'mx-chest-band'),
            el('i', 'mx-collar'), num, codigo, el('i', 'mx-belt'),
            manga('l'), manga('r')
        ]);

        /* Cabeza: casco abierto con rostro neutro (igual para todos) y visor levantado */
        const ojo = (lado) => el('i', 'mx-eye mx-eye-' + lado, [el('i', 'mx-pupil')]);
        const cara = el('div', 'mx-face', [
            el('i', 'mx-brow mx-brow-l'), el('i', 'mx-brow mx-brow-r'),
            ojo('l'), ojo('r'),
            el('i', 'mx-nose'), el('i', 'mx-cheek mx-cheek-l'), el('i', 'mx-cheek mx-cheek-r'),
            el('i', 'mx-mouth')
        ]);
        const cabeza = el('div', 'mx-head', [
            el('div', 'mx-shell'), cara,
            el('div', 'mx-rim', [el('i', 'mx-stripe')]),
            el('div', 'mx-visor-up'), el('i', 'mx-strap mx-strap-l'), el('i', 'mx-strap mx-strap-r')
        ]);

        const escena = el('div', 'mx-scene', [cuerpo, cabeza]);
        escena.setAttribute('aria-hidden', 'true');
        raiz.append(escena);
        return { raiz, escena, cabeza };
    }

    /** Versión pequeña y estática para tarjetas. */
    function avatar(datos) {
        const { raiz } = construir(datos || {}, true);
        raiz.setAttribute('aria-hidden', 'true');
        return raiz;
    }

    /** Personaje interactivo dentro de `contenedor`. datos: { nombre, numero, codigo, equipoId, nacionalidad } */
    function montar(contenedor, datos) {
        const d = datos || {};
        const { raiz, escena, cabeza } = construir(d, false);
        const quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'mx-btn';
        boton.setAttribute('aria-label', EN ? `Wave at ${d.nombre || 'the driver'}` : `Saludar a ${d.nombre || 'el piloto'}`);
        boton.append(escena);

        const globo = el('div', 'mx-bubble');
        globo.hidden = true;
        globo.setAttribute('role', 'status');
        const textoGlobo = el('strong');
        const idiomaGlobo = el('small');
        globo.append(textoGlobo, idiomaGlobo);

        const nota = el('p', 'mx-note');
        nota.textContent = EN
            ? 'Illustrated character, not a photo of the driver. Click it to say hi.'
            : 'Personaje ilustrado, no es una foto del piloto. Haz clic para saludar.';

        raiz.append(boton, globo, nota);
        contenedor.append(raiz);

        // Versión 3D real (WebGL). Si no hay WebGL o falla, se queda la versión CSS de arriba.
        let rig = null;
        if (window.F1Mascota3D) {
            window.F1Mascota3D.activar({ boton, escena, raiz, datos: d, paleta: colores(d.equipoId), quieto })
                .then((r) => { rig = r; })
                .catch(() => { rig = null; });
        }

        /* Seguimiento del puntero (cabeza + ojos) */
        let pendiente = false;
        let px = 0, py = 0;
        function actualizar() {
            pendiente = false;
            const r = cabeza.getBoundingClientRect();
            const dx = px - (r.left + r.width / 2);
            const dy = py - (r.top + r.height / 2);
            const lim = (v, m) => Math.max(-m, Math.min(m, v));
            raiz.style.setProperty('--ry', lim(dx / 9, 30).toFixed(1));
            raiz.style.setProperty('--rx', lim(-dy / 9, 22).toFixed(1));
            raiz.style.setProperty('--ex', lim(dx / 45, 5).toFixed(1));
            raiz.style.setProperty('--ey', lim(dy / 45, 4).toFixed(1));
        }
        if (!quieto) {
            document.addEventListener('pointermove', (e) => {
                px = e.clientX; py = e.clientY;
                if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); }
            }, { passive: true });
        }

        /* Saludo */
        let t1 = 0, t2 = 0;
        boton.addEventListener('click', () => {
            const s = saludo(d.nacionalidad);
            textoGlobo.textContent = s.texto;
            textoGlobo.setAttribute('lang', s.lang);
            idiomaGlobo.textContent = s.idioma;
            globo.hidden = false;
            globo.classList.remove('is-in');
            void globo.offsetWidth; // reinicia la animación
            globo.classList.add('is-in');
            if (!quieto) {
                raiz.classList.remove('is-waving');
                void raiz.offsetWidth;
                raiz.classList.add('is-waving');
            }
            raiz.classList.add('is-talking');
            if (rig) { rig.saludar(); rig.hablar(true); }
            clearTimeout(t1); clearTimeout(t2);
            t1 = setTimeout(() => raiz.classList.remove('is-waving'), 1800);
            t2 = setTimeout(() => { globo.hidden = true; raiz.classList.remove('is-talking'); if (rig) rig.hablar(false); }, 4200);
        });
        return raiz;
    }

    window.F1Mascota = { montar, avatar, saludo };
})();
