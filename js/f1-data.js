// f1-data.js - Datos de la temporada (Jolpica/Ergast) + utilidades de UI.
//
// - Solo lee datos públicos de https://api.jolpi.ca (sin claves).
// - Cachea en localStorage (10 min) y usa la copia vieja si la red falla.
// - Todo el contenido externo se inserta con textContent (nunca innerHTML).
//
// Expone: window.F1Data y window.F1UI

(function () {
    'use strict';

    const API = 'https://api.jolpi.ca/ergast/f1';
    const TTL_MS = 10 * 60 * 1000;
    const TIMEOUT_MS = 8000;

    /* ---------------------------------------------------------------- caché */
    function cacheGet(key) {
        try {
            const raw = localStorage.getItem('f1c:' + key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function cacheSet(key, data) {
        try {
            localStorage.setItem('f1c:' + key, JSON.stringify({ t: Date.now(), data }));
        } catch (e) { /* almacenamiento lleno o bloqueado: se ignora */ }
    }

    async function getJSON(path) {
        const cached = cacheGet(path);
        if (cached && Date.now() - cached.t < TTL_MS) return cached.data;

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
        try {
            const res = await fetch(API + path, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const json = await res.json();
            cacheSet(path, json);
            return json;
        } catch (err) {
            if (cached) return cached.data; // datos viejos mejor que nada
            throw err;
        } finally {
            clearTimeout(timer);
        }
    }

    /* ------------------------------------------------------ traducciones ES */
    const GP_ES = {
        'Australian': 'Australia', 'Chinese': 'China', 'Japanese': 'Japón', 'Bahrain': 'Bahréin',
        'Saudi Arabian': 'Arabia Saudita', 'Miami': 'Miami', 'Emilia Romagna': 'Emilia-Romaña',
        'Monaco': 'Mónaco', 'Spanish': 'España', 'Canadian': 'Canadá', 'Austrian': 'Austria',
        'British': 'Gran Bretaña', 'Belgian': 'Bélgica', 'Hungarian': 'Hungría', 'Dutch': 'Países Bajos',
        'Italian': 'Italia', 'Azerbaijan': 'Azerbaiyán', 'Singapore': 'Singapur',
        'United States': 'Estados Unidos', 'Mexico City': 'Ciudad de México', 'Mexican': 'México',
        'São Paulo': 'São Paulo', 'Sao Paulo': 'São Paulo', 'Brazilian': 'Brasil',
        'Las Vegas': 'Las Vegas', 'Qatar': 'Catar', 'Abu Dhabi': 'Abu Dabi',
        'Barcelona-Catalunya': 'Barcelona-Cataluña', 'Madrid': 'Madrid', 'Portuguese': 'Portugal',
        'French': 'Francia', 'German': 'Alemania', 'Turkish': 'Turquía', 'Russian': 'Rusia',
        'Styrian': 'Estiria', 'Eifel': 'Eifel', 'Tuscan': 'Toscana', 'Sakhir': 'Sakhir',
        '70th Anniversary': 'Aniversario 70', 'San Marino': 'San Marino', 'Pacific': 'Pacífico',
        'Luxembourg': 'Luxemburgo', 'Swiss': 'Suiza', 'Argentine': 'Argentina', 'South African': 'Sudáfrica',
        'Korean': 'Corea', 'Indian': 'India', 'Malaysian': 'Malasia', 'European': 'Europa',
        'Moroccan': 'Marruecos', 'Detroit': 'Detroit', 'Dallas': 'Dallas', 'Caesars Palace': 'Caesars Palace',
        'Japanese': 'Japón', 'Chinese': 'China', 'Indianapolis 500': 'Indianápolis 500', 'Pescara': 'Pescara'
    };

    const SESIONES = [
        ['FirstPractice', 'Práctica 1'],
        ['SecondPractice', 'Práctica 2'],
        ['ThirdPractice', 'Práctica 3'],
        ['SprintQualifying', 'Clasificación Sprint'],
        ['SprintShootout', 'Clasificación Sprint'],
        ['Sprint', 'Sprint'],
        ['Qualifying', 'Clasificación'],
        ['Race', 'Carrera']
    ];

    function nombreGP(raceName) {
        const base = String(raceName || '').replace(/\s*Grand Prix\s*$/i, '').trim();
        if (!base) return 'Gran Premio';
        return 'Gran Premio de ' + (GP_ES[base] || base);
    }

    function parseFecha(fecha, hora) {
        if (!fecha || !hora) return null;
        const d = new Date(`${fecha}T${hora}`);
        return isNaN(d) ? null : d;
    }

    /** Convierte una carrera de la API en { nombre, ronda, circuito, lugar, sesiones[] } */
    function normalizarCarrera(race) {
        if (!race) return null;
        const sesiones = SESIONES
            .map(([clave, nombre]) => {
                const info = clave === 'Race' ? { date: race.date, time: race.time } : race[clave];
                const fecha = info ? parseFecha(info.date, info.time) : null;
                return fecha ? { clave, nombre, fecha } : null;
            })
            .filter(Boolean)
            .sort((a, b) => a.fecha - b.fecha);

        const loc = (race.Circuit && race.Circuit.Location) || {};
        return {
            nombre: nombreGP(race.raceName),
            ronda: Number(race.round) || null,
            temporada: race.season || '',
            circuito: (race.Circuit && race.Circuit.circuitName) || '',
            lugar: [loc.locality, loc.country].filter(Boolean).join(', '),
            sesiones
        };
    }

    /* --------------------------------------------------------------- datos */
    async function getProximaCarrera() {
        const json = await getJSON('/current/next.json');
        const race = json && json.MRData && json.MRData.RaceTable && json.MRData.RaceTable.Races[0];
        return normalizarCarrera(race);
    }

    async function getClasificacion(tipo, anio) {
        const esPilotos = tipo !== 'constructores';
        const temporada = anio ? encodeURIComponent(anio) : 'current';
        const json = await getJSON(`/${temporada}/${esPilotos ? 'driverStandings' : 'constructorStandings'}.json`);
        const lista = json && json.MRData && json.MRData.StandingsTable && json.MRData.StandingsTable.StandingsLists[0];
        if (!lista) return { temporada: '', ronda: null, filas: [] };

        const crudas = (esPilotos ? lista.DriverStandings : lista.ConstructorStandings) || [];
        const filas = crudas.map((f) => esPilotos
            ? {
                pos: Number(f.position) || 0,
                nombre: `${f.Driver.givenName} ${f.Driver.familyName}`,
                equipo: (f.Constructors && f.Constructors[0] && f.Constructors[0].name) || '',
                puntos: Number(f.points) || 0,
                victorias: Number(f.wins) || 0
            }
            : {
                pos: Number(f.position) || 0,
                nombre: f.Constructor.name,
                equipo: '',
                puntos: Number(f.points) || 0,
                victorias: Number(f.wins) || 0
            });
        return { temporada: lista.season || '', ronda: Number(lista.round) || null, filas };
    }

    async function getUltimoResultado() {
        const json = await getJSON('/current/last/results.json');
        const race = json && json.MRData && json.MRData.RaceTable && json.MRData.RaceTable.Races[0];
        if (!race) return null;
        return {
            nombre: nombreGP(race.raceName),
            fecha: race.date,
            filas: (race.Results || []).map((r) => ({
                pos: Number(r.position) || 0,
                nombre: `${r.Driver.givenName} ${r.Driver.familyName}`,
                equipo: r.Constructor ? r.Constructor.name : '',
                tiempo: (r.Time && r.Time.time) || r.status || '',
                puntos: Number(r.points) || 0
            }))
        };
    }

    const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    function textoFecha(inicio, fin) {
        const a = new Date(inicio + 'T00:00:00Z');
        const b = new Date(fin + 'T00:00:00Z');
        if (isNaN(a) || isNaN(b)) return '';
        const da = a.getUTCDate(), db = b.getUTCDate();
        const ma = MESES[a.getUTCMonth()], mb = MESES[b.getUTCMonth()];
        if (inicio === fin) return `${db} ${mb}`;
        return ma === mb ? `${da} - ${db} ${mb}` : `${da} ${ma} - ${db} ${mb}`;
    }

    /** Calendario completo de una temporada: [{ nombre, fecha, ronda }] */
    async function getCalendario(anio) {
        const json = await getJSON(`/${encodeURIComponent(anio)}.json?limit=100`);
        const carreras = (json && json.MRData && json.MRData.RaceTable && json.MRData.RaceTable.Races) || [];
        return carreras.map((r) => {
            const inicio = (r.FirstPractice && r.FirstPractice.date) || r.date;
            const loc = (r.Circuit && r.Circuit.Location) || {};
            return {
                nombre: nombreGP(r.raceName),
                fecha: textoFecha(inicio, r.date),
                ronda: Number(r.round) || 0,
                lugar: [loc.locality, loc.country].filter(Boolean).join(', '),
                iso: r.date
            };
        });
    }

    /** Ganador de cada carrera de una temporada: { [ronda]: { nombre, equipo } } */
    async function getGanadores(anio) {
        const json = await getJSON(`/${encodeURIComponent(anio)}/results/1.json?limit=100`);
        const carreras = (json && json.MRData && json.MRData.RaceTable && json.MRData.RaceTable.Races) || [];
        const mapa = {};
        carreras.forEach((r) => {
            const g = r.Results && r.Results[0];
            if (g) mapa[Number(r.round)] = { nombre: `${g.Driver.givenName} ${g.Driver.familyName}`, equipo: g.Constructor ? g.Constructor.name : '' };
        });
        return mapa;
    }

    /** Resultado completo de una carrera (y clasificación si existe). */
    async function getCarrera(anio, ronda) {
        const base = `/${encodeURIComponent(anio)}/${encodeURIComponent(ronda)}`;
        const res = await getJSON(`${base}/results.json?limit=100`);
        const race = res && res.MRData && res.MRData.RaceTable && res.MRData.RaceTable.Races[0];
        if (!race) return null;
        const loc = (race.Circuit && race.Circuit.Location) || {};

        let clasificacion = [];
        try {
            const q = await getJSON(`${base}/qualifying.json?limit=100`);
            const qr = q && q.MRData && q.MRData.RaceTable && q.MRData.RaceTable.Races[0];
            clasificacion = ((qr && qr.QualifyingResults) || []).map((r) => ({
                pos: Number(r.position) || 0,
                nombre: `${r.Driver.givenName} ${r.Driver.familyName}`,
                equipo: r.Constructor ? r.Constructor.name : '',
                q1: r.Q1 || '', q2: r.Q2 || '', q3: r.Q3 || ''
            }));
        } catch (e) { /* sin datos de clasificación para esta carrera */ }

        return {
            nombre: nombreGP(race.raceName),
            temporada: race.season,
            ronda: Number(race.round) || null,
            fecha: race.date,
            circuito: (race.Circuit && race.Circuit.circuitName) || '',
            lugar: [loc.locality, loc.country].filter(Boolean).join(', '),
            resultados: (race.Results || []).map((r) => ({
                pos: Number(r.position) || 0,
                parrilla: Number(r.grid) || 0,
                nombre: `${r.Driver.givenName} ${r.Driver.familyName}`,
                equipo: r.Constructor ? r.Constructor.name : '',
                vueltas: Number(r.laps) || 0,
                tiempo: (r.Time && r.Time.time) || r.status || '',
                puntos: Number(r.points) || 0,
                vr: (r.FastestLap && r.FastestLap.Time && r.FastestLap.Time.time) || ''
            })),
            clasificacion
        };
    }

    /** Lee data/proxima-sesion.json (respaldo editable a mano). */
    async function getProximaManual(rutaBase) {
        try {
            const res = await fetch(rutaBase + 'data/proxima-sesion.json', { cache: 'no-cache' });
            if (!res.ok) return null;
            const j = await res.json();
            const fecha = j.fecha ? new Date(j.fecha) : null;
            if (!fecha || isNaN(fecha)) return null;
            return {
                nombre: j.evento || 'Próxima sesión',
                ronda: null,
                temporada: '',
                circuito: '',
                lugar: j.ubicacion || '',
                sesiones: [{ clave: 'manual', nombre: j.sesion || 'Sesión', fecha }]
            };
        } catch (e) {
            return null;
        }
    }

    /* ------------------------------------------------------------------ UI */
    const fmtFechaHora = new Intl.DateTimeFormat('es', {
        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    function formatearSesion(fecha) {
        const txt = fmtFechaHora.format(fecha);
        return txt.charAt(0).toUpperCase() + txt.slice(1);
    }

    function zonaHoraria() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        } catch (e) {
            return '';
        }
    }

    /** Crea un elemento de forma segura: h('div', {class:'x', text:'hola'}, hijo1, hijo2) */
    function h(tag, props, ...hijos) {
        const el = document.createElement(tag);
        Object.entries(props || {}).forEach(([k, v]) => {
            if (v == null || v === false) return;
            if (k === 'class') el.className = v;
            else if (k === 'text') el.textContent = v;
            else el.setAttribute(k, v === true ? '' : v);
        });
        hijos.flat().forEach((c) => {
            if (c == null || c === false) return;
            el.append(c.nodeType ? c : document.createTextNode(String(c)));
        });
        return el;
    }

    /** Siguiente sesión futura de una carrera normalizada (o null). */
    function siguienteSesion(carrera, ahora) {
        if (!carrera) return null;
        const now = ahora || new Date();
        return carrera.sesiones.find((s) => s.fecha > now) || null;
    }

    /**
     * Cuenta regresiva. Llama a onTick({d,h,m,s,total}) cada segundo.
     * Devuelve una función para detenerla. onDone se llama al llegar a 0.
     */
    function cuentaRegresiva(objetivo, onTick, onDone) {
        let id = null;
        function paso() {
            const total = objetivo - Date.now();
            if (total <= 0) {
                if (id) clearInterval(id);
                if (onDone) onDone();
                return;
            }
            const seg = Math.floor(total / 1000);
            onTick({
                d: Math.floor(seg / 86400),
                h: Math.floor((seg % 86400) / 3600),
                m: Math.floor((seg % 3600) / 60),
                s: seg % 60,
                total
            });
        }
        paso();
        id = setInterval(paso, 1000);
        return () => clearInterval(id);
    }

    /** Genera un archivo .ics con las sesiones de una carrera normalizada. */
    function generarICS(carrera) {
        const DUR = { FirstPractice: 60, SecondPractice: 60, ThirdPractice: 60, SprintQualifying: 45, SprintShootout: 45, Sprint: 45, Qualifying: 70, Race: 120, manual: 60 };
        const f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const esc = (t) => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
        const ahora = f(new Date());
        const lineas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Formula 1 Fans Global//Sesiones//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
        carrera.sesiones.forEach((s, i) => {
            const fin = new Date(s.fecha.getTime() + (DUR[s.clave] || 60) * 60000);
            lineas.push(
                'BEGIN:VEVENT',
                `UID:${carrera.temporada || 'f1'}-${carrera.ronda || 0}-${s.clave}-${i}@formula1fansglobal`,
                `DTSTAMP:${ahora}`,
                `DTSTART:${f(s.fecha)}`,
                `DTEND:${f(fin)}`,
                `SUMMARY:${esc(carrera.nombre + ' - ' + s.nombre)}`,
                `LOCATION:${esc([carrera.circuito, carrera.lugar].filter(Boolean).join(', '))}`,
                'DESCRIPTION:Horario sujeto a cambios. Confirma en formula1.com.',
                'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Recordatorio de sesion de F1', 'TRIGGER:-PT15M', 'END:VALARM',
                'END:VEVENT'
            );
        });
        lineas.push('END:VCALENDAR');
        return lineas.join('\r\n') + '\r\n';
    }

    window.F1Data = {
        generarICS,
        getProximaCarrera, getClasificacion, getUltimoResultado, getProximaManual, getCalendario, getGanadores, getCarrera,
        nombreGP, normalizarCarrera, siguienteSesion
    };
    /** Tarjeta de video de YouTube (carga el iframe solo al hacer clic). */
    const ID_YT = /^[A-Za-z0-9_-]{11}$/;
    function tarjetaVideo(v) {
        if (!v || !ID_YT.test(String(v.id || '')) || !v.titulo) return null;
        const marco = h('div', { class: 'video-frame' });
        const boton = h('button', { class: 'video-play', type: 'button', 'aria-label': 'Reproducir: ' + v.titulo },
            h('img', { src: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, alt: '', loading: 'lazy', width: '480', height: '360' }),
            h('span', { class: 'video-play-icon', 'aria-hidden': 'true', text: '▶' })
        );
        boton.addEventListener('click', () => {
            marco.replaceChildren(h('iframe', {
                src: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`,
                title: v.titulo,
                allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
                allowfullscreen: true,
                referrerpolicy: 'strict-origin-when-cross-origin'
            }));
        });
        marco.appendChild(boton);
        const f = v.fecha ? new Date(v.fecha) : null;
        const meta = [v.tipo === 'propio' ? 'Propio' : 'Oficial', v.categoria, f && !isNaN(f) ? f.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) : ''].filter(Boolean);
        return h('article', { class: 'video-card' }, marco,
            h('div', { class: 'video-info' },
                h('h3', { text: v.titulo }),
                v.descripcion ? h('p', { text: v.descripcion }) : null,
                h('div', { class: 'video-meta' }, meta.map((m, i) => h('span', { class: i === 0 ? 'badge' : '', text: m })))
            )
        );
    }

    window.F1UI = { tarjetaVideo, h, formatearSesion, zonaHoraria, cuentaRegresiva, dosDigitos: (n) => String(n).padStart(2, '0') };
})();
