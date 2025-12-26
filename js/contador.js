const fechaObjetivo = new Date('2026-02-11T07:00:00'); // Cambia esta fecha y hora a la deseada

function actualizarContador() {
    const contadorEl = document.getElementById('contador');
    const diasEl = document.getElementById('dias');
    const horasEl = document.getElementById('horas');
    const minutosEl = document.getElementById('minutos');
    const segundosEl = document.getElementById('segundos');

    // Si no existe el contador, no hacer nada
    if (!contadorEl || !diasEl || !horasEl || !minutosEl || !segundosEl) return;

    const ahora = new Date();
    const diferencia = fechaObjetivo - ahora;

    if (diferencia > 0) {
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        diasEl.textContent = dias.toString().padStart(2, '0');
        horasEl.textContent = horas.toString().padStart(2, '0');
        minutosEl.textContent = minutos.toString().padStart(2, '0');
        segundosEl.textContent = segundos.toString().padStart(2, '0');
    } else {
        contadorEl.innerHTML = '<h2>¡La carrera ha comenzado!</h2>';
    }
}

// Ejecutar de inmediato y luego cada segundo
actualizarContador();
setInterval(actualizarContador, 1000);
