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
        'French': 'Francia', 'German': 'Alemania', 'Turkish': 'Turquía', 'Russian': 'Rusia'
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

    async function getClasificacion(tipo) {
        const esPilotos = tipo !== 'constructores';
        const json = await getJSON(esPilotos ? '/current/driverStandings.json' : '/current/constructorStandings.json');
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
            return { nombre: nombreGP(r.raceName), fecha: textoFecha(inicio, r.date), ronda: Number(r.round) || 0 };
        });
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

    window.F1Data = {
        getProximaCarrera, getClasificacion, getUltimoResultado, getProximaManual, getCalendario,
        nombreGP, normalizarCarrera, siguienteSesion
    };
    window.F1UI = { h, formatearSesion, zonaHoraria, cuentaRegresiva, dosDigitos: (n) => String(n).padStart(2, '0') };
})();
