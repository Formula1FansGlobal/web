// f1-extra.js - Datos de pilotos, equipos, circuitos y estadísticas (Jolpica/Ergast).
//
// - Solo lectura de datos públicos; sin claves. Usa el caché y la cola de F1Data.getJSON.
// - Los datos históricos se cachean 6 horas (casi no cambian).
// - Todo el contenido externo se inserta con textContent (F1UI.h), nunca con innerHTML.
//
// Expone: window.F1Extra y amplía window.F1UI (tabla, aviso, svg, utilidades de URL).
// Requiere js/f1-data.js cargado antes.

(function () {
    'use strict';

    const D = window.F1Data;
    const { h } = window.F1UI;
    const HIST = 6 * 60 * 60 * 1000;
    const ANIO = new Date().getFullYear();

    const tabla = (j) => (j && j.MRData && j.MRData.RaceTable && j.MRData.RaceTable.Races) || [];
    const total = (j) => Number(j && j.MRData && j.MRData.total) || 0;
    const nombreDe = (d) => `${d.givenName} ${d.familyName}`;
    const idSeguro = (v) => (/^[a-z0-9_]{1,40}$/i.test(String(v || '')) ? String(v) : '');
    const anioSeguro = (v) => (/^(19[5-9]\d|20\d\d)$/.test(String(v || '')) ? String(v) : '');

    /** Descarga todas las páginas de una consulta (la API entrega máximo 100 filas por página). */
    async function todas(ruta, leer) {
        const sep = ruta.includes('?') ? '&' : '?';
        const primera = await D.getJSON(`${ruta}${sep}limit=100&offset=0`, HIST);
        let filas = leer(primera);
        const n = total(primera);
        for (let off = 100; off < n && off < 1500; off += 100) {
            filas = filas.concat(leer(await D.getJSON(`${ruta}${sep}limit=100&offset=${off}`, HIST)));
        }
        return filas;
    }

    /* ----------------------------------------------------------- pilotos */
    function normalizarPiloto(d) {
        return {
            id: d.driverId,
            numero: d.permanentNumber || '',
            codigo: d.code || '',
            nombre: nombreDe(d),
            nacionalidad: d.nationality || '',
            nacimiento: d.dateOfBirth || '',
            wiki: /^https:\/\//.test(d.url || '') ? d.url : ''
        };
    }

    /** Parrilla de una temporada con su posición en el campeonato (si ya hay clasificación). */
    async function getPilotos(anio) {
        const a = anioSeguro(anio) || String(ANIO);
        const lista = await D.getJSON(`/${a}/drivers.json?limit=100`, HIST);
        const pilotos = ((lista.MRData.DriverTable || {}).Drivers || []).map(normalizarPiloto);
        let mapa = {};
        try {
            const s = await D.getJSON(`/${a}/driverStandings.json`);
            const sl = s.MRData.StandingsTable.StandingsLists[0];
            ((sl && sl.DriverStandings) || []).forEach((f) => {
                mapa[f.Driver.driverId] = {
                    pos: Number(f.position) || 0,
                    puntos: Number(f.points) || 0,
                    victorias: Number(f.wins) || 0,
                    equipo: f.Constructors && f.Constructors[0] ? f.Constructors[0].name : '',
                    equipoId: f.Constructors && f.Constructors[0] ? f.Constructors[0].constructorId : ''
                };
            });
        } catch (e) { mapa = {}; }
        pilotos.forEach((p) => Object.assign(p, mapa[p.id] || { pos: 0, puntos: 0, victorias: 0, equipo: '', equipoId: '' }));
        return pilotos.sort((x, y) => (x.pos || 999) - (y.pos || 999) || x.nombre.localeCompare(y.nombre));
    }

    async function getPiloto(id) {
        const pid = idSeguro(id);
        if (!pid) return null;
        const j = await D.getJSON(`/drivers/${pid}.json`, HIST);
        const d = j.MRData.DriverTable.Drivers[0];
        return d ? normalizarPiloto(d) : null;
    }

    /** Estadísticas de carrera de un piloto (4-5 consultas). */
    async function statsPiloto(id) {
        const pid = idSeguro(id);
        const t = async (ruta) => total(await D.getJSON(ruta, HIST));
        const victorias = await t(`/drivers/${pid}/results/1.json?limit=1`);
        const segundos = await t(`/drivers/${pid}/results/2.json?limit=1`);
        const terceros = await t(`/drivers/${pid}/results/3.json?limit=1`);
        const poles = await t(`/drivers/${pid}/qualifying/1.json?limit=1`);
        const carreras = await t(`/drivers/${pid}/results.json?limit=1`);
        let titulos = "—";
        try { titulos = (await campeones()).pilotos.filter((c) => c.id === pid).length; } catch (e) { /* se muestra sin títulos */ }
        return { carreras, victorias, podios: victorias + segundos + terceros, poles, titulos };
    }

    /** Resultados de un piloto en una temporada, ronda por ronda. */
    async function resultadosPiloto(id, anio) {
        const j = await D.getJSON(`/${anioSeguro(anio)}/drivers/${idSeguro(id)}/results.json?limit=100`, HIST);
        return tabla(j).map((r) => {
            const x = (r.Results && r.Results[0]) || {};
            return {
                ronda: Number(r.round) || 0,
                gp: D.nombreGP(r.raceName),
                pos: Number(x.position) || 0,
                parrilla: Number(x.grid) || 0,
                puntos: Number(x.points) || 0,
                estado: x.status || ''
            };
        });
    }

    /* ----------------------------------------------------------- equipos */
    async function getEquipos(anio) {
        const a = anioSeguro(anio) || String(ANIO);
        const lista = await D.getJSON(`/${a}/constructors.json?limit=100`, HIST);
        const equipos = ((lista.MRData.ConstructorTable || {}).Constructors || []).map((c) => ({
            id: c.constructorId, nombre: c.name, nacionalidad: c.nationality || '', pos: 0, puntos: 0, victorias: 0,
            wiki: /^https:\/\//.test(c.url || '') ? c.url : ''
        }));
        try {
            const s = await D.getJSON(`/${a}/constructorStandings.json`);
            const sl = s.MRData.StandingsTable.StandingsLists[0];
            ((sl && sl.ConstructorStandings) || []).forEach((f) => {
                const e = equipos.find((x) => x.id === f.Constructor.constructorId);
                if (e) { e.pos = Number(f.position) || 0; e.puntos = Number(f.points) || 0; e.victorias = Number(f.wins) || 0; }
            });
        } catch (e) { /* sin clasificación todavía */ }
        return equipos.sort((x, y) => (x.pos || 999) - (y.pos || 999) || x.nombre.localeCompare(y.nombre));
    }

    async function getEquipo(id) {
        const eid = idSeguro(id);
        if (!eid) return null;
        const j = await D.getJSON(`/constructors/${eid}.json`, HIST);
        const c = j.MRData.ConstructorTable.Constructors[0];
        return c ? { id: c.constructorId, nombre: c.name, nacionalidad: c.nationality || '', wiki: /^https:\/\//.test(c.url || '') ? c.url : '' } : null;
    }

    async function statsEquipo(id) {
        const eid = idSeguro(id);
        const victorias = total(await D.getJSON(`/constructors/${eid}/results/1.json?limit=1`, HIST));
        const poles = total(await D.getJSON(`/constructors/${eid}/qualifying/1.json?limit=1`, HIST));
        let titulos = "—";
        try { titulos = (await campeones()).constructores.filter((c) => c.id === eid).length; } catch (e) { /* se muestra sin títulos */ }
        return { victorias, poles, titulos };
    }

    async function pilotosDeEquipo(id, anio) {
        const j = await D.getJSON(`/${anioSeguro(anio)}/constructors/${idSeguro(id)}/drivers.json`, HIST);
        return ((j.MRData.DriverTable || {}).Drivers || []).map(normalizarPiloto);
    }

    /* ---------------------------------------------------------- campeones */
    // La API exige indicar la temporada para pedir campeones, así que las temporadas ya cerradas viven
    // en data/campeones.json (generado desde la propia API) y solo las más recientes se piden en vivo.
    const BASE = location.pathname.replace(/\\/g, '/').includes('/html/') ? '../../' : './';
    let cacheCamp = null;

    async function campeonDe(anio) {
        const [p, c] = await Promise.all([
            D.getJSON(`/${anio}/driverStandings/1.json`, HIST).catch(() => null),
            anio >= 1958 ? D.getJSON(`/${anio}/constructorStandings/1.json`, HIST).catch(() => null) : null
        ]);
        const lp = p && p.MRData.StandingsTable.StandingsLists[0];
        const lc = c && c.MRData.StandingsTable.StandingsLists[0];
        const fp = lp && lp.DriverStandings && lp.DriverStandings[0];
        const fc = lc && lc.ConstructorStandings && lc.ConstructorStandings[0];
        return {
            piloto: fp ? { anio, id: fp.Driver.driverId, nombre: nombreDe(fp.Driver), equipo: fp.Constructors && fp.Constructors[0] ? fp.Constructors[0].name : '', puntos: Number(fp.points) || 0 } : null,
            constructor: fc ? { anio, id: fc.Constructor.constructorId, nombre: fc.Constructor.name, puntos: Number(fc.points) || 0 } : null
        };
    }

    /** Campeones de pilotos y constructores. La temporada en curso solo cuenta si ya terminó. */
    function campeones() {
        if (cacheCamp) return cacheCamp;
        cacheCamp = (async () => {
            const res = await fetch(BASE + 'data/campeones.json');
            if (!res.ok) throw new Error('campeones.json no disponible');
            const base = await res.json();
            const pilotos = Array.isArray(base.pilotos) ? base.pilotos.slice() : [];
            const constructores = Array.isArray(base.constructores) ? base.constructores.slice() : [];

            let terminada = false;
            try {
                const cal = await D.getCalendario(ANIO);
                terminada = cal.length > 0 && cal[cal.length - 1].iso < new Date().toISOString().slice(0, 10);
            } catch (e) { terminada = false; }

            // Temporadas posteriores a las del archivo (y la actual, si ya acabó)
            const desde = (Number(base.ultimaTemporada) || 1949) + 1;
            const hasta = terminada ? ANIO : ANIO - 1;
            for (let y = desde; y <= hasta; y++) {
                const r = await campeonDe(y);
                if (r.piloto) pilotos.push(r.piloto);
                if (r.constructor) constructores.push(r.constructor);
            }
            return { pilotos, constructores };
        })().catch((e) => { cacheCamp = null; throw e; });
        return cacheCamp;
    }

    /* --------------------------------------------------------- circuitos */
    async function getCircuitos(anio) {
        const a = anioSeguro(anio) || String(ANIO);
        const j = await D.getJSON(`/${a}/circuits.json?limit=100`, HIST);
        return ((j.MRData.CircuitTable || {}).Circuits || []).map(normalizarCircuito);
    }

    function normalizarCircuito(c) {
        const l = c.Location || {};
        return {
            id: c.circuitId,
            nombre: c.circuitName,
            localidad: l.locality || '',
            pais: l.country || '',
            lat: Number(l.lat),
            lon: Number(l.long),
            wiki: /^https:\/\//.test(c.url || '') ? c.url : ''
        };
    }

    async function getCircuito(id) {
        const cid = idSeguro(id);
        if (!cid) return null;
        const j = await D.getJSON(`/circuits/${cid}.json`, HIST);
        const c = j.MRData.CircuitTable.Circuits[0];
        if (!c) return null;
        const ganadores = await todas(`/circuits/${cid}/results/1.json`, tabla);
        return {
            ...normalizarCircuito(c),
            carreras: ganadores.length,
            ganadores: ganadores
                .map((r) => ({
                    anio: Number(r.season), ronda: Number(r.round), gp: D.nombreGP(r.raceName),
                    piloto: r.Results[0] ? nombreDe(r.Results[0].Driver) : '', pilotoId: r.Results[0] ? r.Results[0].Driver.driverId : '',
                    equipo: r.Results[0] && r.Results[0].Constructor ? r.Results[0].Constructor.name : ''
                }))
                .sort((a, b) => b.anio - a.anio)
        };
    }

    /* ----------------------------------------------- puntos en la temporada */
    /** Puntos acumulados ronda por ronda: { rondas:[nombre], series:[{id,nombre,puntos:[...]}] } */
    async function puntosPorRonda(anio) {
        const a = anioSeguro(anio) || String(ANIO);
        const carreras = await todas(`/${a}/results.json`, tabla);
        let sprints = [];
        try { sprints = await todas(`/${a}/sprint.json`, tabla); } catch (e) { sprints = []; }

        const rondas = {};
        carreras.forEach((r) => { rondas[Number(r.round)] = D.nombreGP(r.raceName).replace('Gran Premio de ', ''); });
        const orden = Object.keys(rondas).map(Number).sort((x, y) => x - y);

        const ganado = {}; // id -> { ronda -> puntos }
        const nombres = {};
        const sumar = (lista, campo) => lista.forEach((r) => (r[campo] || []).forEach((x) => {
            const id = x.Driver.driverId;
            nombres[id] = nombreDe(x.Driver);
            ganado[id] = ganado[id] || {};
            ganado[id][Number(r.round)] = (ganado[id][Number(r.round)] || 0) + (Number(x.points) || 0);
        }));
        sumar(carreras, 'Results');
        sumar(sprints, 'SprintResults');

        const series = Object.keys(ganado).map((id) => {
            let acc = 0;
            return { id, nombre: nombres[id], puntos: orden.map((n) => (acc += ganado[id][n] || 0)) };
        }).sort((x, y) => y.puntos[y.puntos.length - 1] - x.puntos[x.puntos.length - 1]);

        return { anio: a, rondas: orden.map((n) => rondas[n]), series };
    }

    /* -------------------------------------------------------- utilidades UI */
    function aviso(texto) { return h('p', { class: 'notice', text: texto }); }

    function tablaUI(caption, columnas, filas) {
        return h('div', { class: 'card table-card' }, h('div', { class: 'table-scroll' }, h('table', { class: 'standings' },
            h('caption', { class: 'sr-only', text: caption }),
            h('thead', null, h('tr', null, columnas.map((c) => h('th', { scope: 'col', class: c.clase || '', text: c.texto })))),
            h('tbody', null, filas)
        )));
    }

    const SVG_NS = 'http://www.w3.org/2000/svg';
    function svg(tag, attrs, ...hijos) {
        const el = document.createElementNS(SVG_NS, tag);
        Object.entries(attrs || {}).forEach(([k, v]) => { if (v != null) el.setAttribute(k, String(v)); });
        hijos.flat().forEach((c) => { if (c != null) el.append(c.nodeType ? c : document.createTextNode(String(c))); });
        return el;
    }

    function fechaLarga(iso) {
        const f = iso ? new Date(iso + 'T00:00:00Z') : null;
        return f && !isNaN(f) ? f.toLocaleDateString(D.idioma, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
    }

    function edad(iso) {
        const f = iso ? new Date(iso + 'T00:00:00Z') : null;
        if (!f || isNaN(f)) return '';
        const n = new Date();
        let e = n.getUTCFullYear() - f.getUTCFullYear();
        if (n.getUTCMonth() < f.getUTCMonth() || (n.getUTCMonth() === f.getUTCMonth() && n.getUTCDate() < f.getUTCDate())) e--;
        return String(e);
    }

    /** Tarjeta de cifra: <div class="stat"><strong>12</strong><span>Victorias</span></div> */
    function stat(valor, etiqueta) {
        return h('div', { class: 'stat' }, h('strong', { text: String(valor) }), h('span', { text: etiqueta }));
    }

    window.F1Extra = {
        ANIO, idSeguro, anioSeguro,
        getPilotos, getPiloto, statsPiloto, resultadosPiloto,
        getEquipos, getEquipo, statsEquipo, pilotosDeEquipo,
        campeones, getCircuitos, getCircuito, puntosPorRonda
    };
    Object.assign(window.F1UI, { aviso, tablaUI, svg, fechaLarga, edad, stat });
})();
