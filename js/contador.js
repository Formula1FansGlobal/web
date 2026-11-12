// contador.js - Cuenta regresiva de la próxima sesión.
// Los datos salen de data/proxima-sesion.json (se editan sin tocar código).

(function () {
    'use strict';

    const RUTA_DATOS = '../../data/proxima-sesion.json';

    const el = {
        contador: document.getElementById('contador'),
        dias: document.getElementById('dias'),
        horas: document.getElementById('horas'),
        minutos: document.getElementById('minutos'),
        segundos: document.getElementById('segundos'),
        titulo: document.getElementById('event-title'),
        subtitulo: document.getElementById('event-subtitle'),
        ronda: document.getElementById('ronda-info'),
        ubicacion: document.getElementById('info-ubicacion'),
        sesion: document.getElementById('info-sesion')
    };

    // Si la página no tiene contador, no hacer nada
    if (!el.contador || !el.dias || !el.horas || !el.minutos || !el.segundos) return;

    const bloquesOriginales = el.contador.innerHTML;
    let fechaObjetivo = null;
    let temporizador = null;

    function dosDigitos(n) {
        return String(n).padStart(2, '0');
    }

    function mostrarMensaje(texto) {
        const h2 = document.createElement('h2');
        h2.textContent = texto;
        el.contador.replaceChildren(h2);
    }

    function actualizar() {
        const diferencia = fechaObjetivo - new Date();

        if (diferencia <= 0) {
            clearInterval(temporizador);
            mostrarMensaje('¡La sesión ya comenzó!');
            return;
        }

        const seg = Math.floor(diferencia / 1000);
        document.getElementById('dias').textContent = dosDigitos(Math.floor(seg / 86400));
        document.getElementById('horas').textContent = dosDigitos(Math.floor((seg % 86400) / 3600));
        document.getElementById('minutos').textContent = dosDigitos(Math.floor((seg % 3600) / 60));
        document.getElementById('segundos').textContent = dosDigitos(seg % 60);
    }

    function aplicarTexto(nodo, valor) {
        if (nodo && typeof valor === 'string' && valor.trim()) nodo.textContent = valor;
    }

    async function iniciar() {
        let datos = {};
        try {
            const respuesta = await fetch(RUTA_DATOS, { cache: 'no-cache' });
            if (respuesta.ok) datos = await respuesta.json();
        } catch (e) {
            console.warn('contador: no se pudo leer proxima-sesion.json', e);
        }

        aplicarTexto(el.titulo, datos.evento);
        aplicarTexto(el.subtitulo, datos.subtitulo);
        aplicarTexto(el.ronda, datos.ronda);
        aplicarTexto(el.ubicacion, datos.ubicacion);
        aplicarTexto(el.sesion, datos.sesion);

        const fecha = datos.fecha ? new Date(datos.fecha) : null;
        if (!fecha || isNaN(fecha)) {
            mostrarMensaje('Fecha por confirmar');
            return;
        }

        el.contador.innerHTML = bloquesOriginales; // restaurar bloques (contenido propio, no externo)
        fechaObjetivo = fecha;
        actualizar();
        temporizador = setInterval(actualizar, 1000);
    }

    iniciar();
})();
