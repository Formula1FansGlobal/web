// resumen-carrera.js - Resumen automático de un Gran Premio, redactado con reglas a partir de datos reales.
//
// No usa IA generativa ni copia textos de otros medios: cada frase sale de un dato de la API Jolpica
// (resultados, clasificación, paradas en boxes y campeonato). Si un dato falta, esa frase se omite.
//
// window.F1Resumen.construir(datos, extras) -> { parrafos: string[], claves: [{etiqueta, valor, detalle}], descripcion }
//   datos:  resultado de F1Data.getCarrera()
//   extras: { paradas: [...], pilotosTras: [...], pilotosAntes: [...], equiposTras: [...] }  (todos opcionales)

(function () {
    'use strict';

    const EN = (() => { try { return localStorage.getItem('f1fg:lang') === 'en'; } catch (e) { return false; } })();

    const MOTIVOS = {
        'Retired': 'abandonó', 'Accident': 'accidente', 'Collision': 'colisión', 'Engine': 'motor', 'Gearbox': 'caja de cambios',
        'Transmission': 'transmisión', 'Brakes': 'frenos', 'Hydraulics': 'hidráulica', 'Suspension': 'suspensión',
        'Overheating': 'sobrecalentamiento', 'Mechanical': 'fallo mecánico', 'Power Unit': 'unidad de potencia',
        'Electrical': 'fallo eléctrico', 'Puncture': 'pinchazo', 'Spun off': 'trompo', 'Withdrew': 'se retiró',
        'Disqualified': 'descalificado', 'Did not start': 'no tomó la salida', 'Damage': 'daños', 'Fuel system': 'sistema de combustible',
        'Water leak': 'fuga de agua', 'Oil leak': 'fuga de aceite', 'Wheel': 'rueda', 'Power loss': 'pérdida de potencia'
    };

    const terminada = (r) => /^(\+|\d)/.test(String(r.tiempo || '')) || /^\+\d+ Laps?$/.test(String(r.status || '')) || r.status === 'Finished';

    function aSegundos(txt) { // "1:23.456" o "22.4" -> segundos
        const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(String(txt || '').trim());
        return m ? (m[1] ? Number(m[1]) * 60 : 0) + Number(m[2]) : NaN;
    }
    const nombreCorto = (n) => String(n || '').trim();
    const apellido = (n) => { const p = nombreCorto(n).split(/\s+/); return p.length > 1 ? p.slice(1).join(' ') : p[0]; };
    const ordinal = (n) => `${n}.ª`;
    const lista = (arr) => (arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1]);

    function construir(d, extras) {
        const x = extras || {};
        const res = (d && d.resultados) || [];
        const parrafos = [];
        const claves = [];
        if (!res.length) return { parrafos, claves, descripcion: '' };

        const ganador = res[0];
        const segundo = res[1];
        const tercero = res[2];
        const clasif = d.clasificacion || [];
        const pole = clasif[0];

        /* ---------- 1) La carrera ---------- */
        let p1 = `${ganador.nombre} (${ganador.equipo}) ganó el ${d.nombre} ${d.temporada}`;
        if (d.circuito) p1 += ` en ${d.circuito}`;
        p1 += ganador.parrilla === 1 ? ', saliendo desde la pole' : ganador.parrilla > 1 ? `, tras salir desde la ${ordinal(ganador.parrilla)} posición` : ', tras salir desde el pit lane';
        p1 += '.';
        if (segundo && /^\+\d/.test(segundo.tiempo)) p1 += ` Superó a ${segundo.nombre} por ${segundo.tiempo.replace('+', '')} segundos.`;
        else if (segundo && /^\+\d+ Laps?$/.test(String(segundo.status))) p1 += ` El segundo clasificado terminó a ${segundo.status.replace('+', '')}.`;
        if (segundo && tercero) p1 += ` El podio lo completaron ${segundo.nombre} (${segundo.equipo}) y ${tercero.nombre} (${tercero.equipo}).`;
        parrafos.push(p1);
        claves.push({ etiqueta: 'Ganador', valor: ganador.nombre, detalle: ganador.equipo });

        /* ---------- 2) Clasificación ---------- */
        if (pole) {
            const mejor = pole.q3 || pole.q2 || pole.q1;
            let p2 = `La pole fue para ${pole.nombre} (${pole.equipo})${mejor ? ` con ${mejor}` : ''}.`;
            if (pole.nombre === ganador.nombre) p2 += ' Convirtió la pole en victoria.';
            else p2 += ` ${ganador.nombre} le arrebató la victoria desde la ${ganador.parrilla ? ordinal(ganador.parrilla) : 'última'} posición de la parrilla.`;
            parrafos.push(p2);
            claves.push({ etiqueta: 'Pole', valor: pole.nombre, detalle: mejor || pole.equipo });
        }

        /* ---------- 3) Remontadas y vuelta rápida ---------- */
        const frases3 = [];
        const remontadas = res.filter((r) => terminada(r) && r.parrilla > 0 && r.parrilla - r.pos >= 3).sort((a, b) => (b.parrilla - b.pos) - (a.parrilla - a.pos));
        if (remontadas[0]) {
            const r = remontadas[0];
            frases3.push(`La mayor remontada fue la de ${r.nombre}, que ganó ${r.parrilla - r.pos} posiciones (de la ${ordinal(r.parrilla)} a la ${ordinal(r.pos)})`);
            claves.push({ etiqueta: 'Mayor remontada', valor: r.nombre, detalle: `+${r.parrilla - r.pos} posiciones` });
        }
        const conVR = res.filter((r) => r.vr && isFinite(aSegundos(r.vr))).sort((a, b) => aSegundos(a.vr) - aSegundos(b.vr));
        if (conVR[0]) {
            frases3.push(`la vuelta rápida fue de ${conVR[0].nombre} con ${conVR[0].vr}`);
            claves.push({ etiqueta: 'Vuelta rápida', valor: conVR[0].nombre, detalle: conVR[0].vr });
        }
        if (frases3.length) parrafos.push(frases3.join(', y ').replace(/^./, (c) => c.toUpperCase()) + '.');

        /* ---------- 4) Abandonos ---------- */
        const fuera = res.filter((r) => !terminada(r));
        if (fuera.length) {
            const det = fuera.slice(0, 4).map((r) => `${apellido(r.nombre)} (${MOTIVOS[r.status] || String(r.status || 'abandono').toLowerCase()})`);
            let p4 = `${fuera.length === 1 ? 'Hubo 1 abandono' : `Hubo ${fuera.length} abandonos`}: ${fuera.length > 4 ? det.join(", ") + " y otros" : lista(det)}`;
            parrafos.push(p4 + '.');
            claves.push({ etiqueta: 'Abandonos', valor: String(fuera.length), detalle: fuera.slice(0, 2).map((r) => apellido(r.nombre)).join(', ') });
        }

        /* ---------- 5) Paradas en boxes ---------- */
        const paradas = Array.isArray(x.paradas) ? x.paradas : [];
        if (paradas.length) {
            const porId = {};
            res.forEach((r) => { porId[r.id] = r; });
            const validas = paradas.filter((s) => porId[s.driverId] && isFinite(aSegundos(s.duration)) && aSegundos(s.duration) < 60);
            let p5 = `Se hicieron ${paradas.length} paradas en boxes`;
            if (validas.length) {
                const rapida = validas.slice().sort((a, b) => aSegundos(a.duration) - aSegundos(b.duration))[0];
                const quien = porId[rapida.driverId];
                p5 += `; la más rápida fue la de ${quien.nombre} (${quien.equipo}) con ${aSegundos(rapida.duration).toFixed(3)} s, en la vuelta ${rapida.lap}`;
                claves.push({ etiqueta: 'Parada más rápida', valor: quien.equipo, detalle: `${aSegundos(rapida.duration).toFixed(3)} s` });
            }
            parrafos.push(p5 + '.');
        }

        /* ---------- 6) Campeonato ---------- */
        const tras = Array.isArray(x.pilotosTras) ? x.pilotosTras : [];
        if (tras.length >= 2) {
            const l = tras[0], s = tras[1];
            const ptsL = Number(l.points), ptsS = Number(s.points);
            const nom = (t) => `${t.Driver.givenName} ${t.Driver.familyName}`;
            let p6 = `En el campeonato de pilotos, ${nom(l)} ${Number(d.ronda) > 1 && x.pilotosAntes && x.pilotosAntes[0] && x.pilotosAntes[0].Driver.driverId !== l.Driver.driverId ? 'toma el liderato' : 'lidera'} con ${ptsL} puntos`;
            if (isFinite(ptsL - ptsS)) p6 += `, ${ptsL - ptsS} más que ${nom(s)}`;
            p6 += '.';
            const eq = Array.isArray(x.equiposTras) ? x.equiposTras : [];
            if (eq[0]) p6 += ` Entre los constructores manda ${eq[0].Constructor.name} con ${eq[0].points} puntos.`;
            parrafos.push(p6);
            claves.push({ etiqueta: 'Líder del campeonato', valor: nom(l), detalle: `${ptsL} pts` });
        }

        const descripcion = `${ganador.nombre} ganó el ${d.nombre} ${d.temporada}${pole && pole.nombre !== ganador.nombre ? `; pole de ${pole.nombre}` : ''}. Resumen, resultados y clasificación.`;
        return { parrafos, claves, descripcion };
    }

    window.F1Resumen = { construir };
})();
