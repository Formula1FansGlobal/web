// custom-timeline.js - Línea del tiempo de la portada (accesible, por teclado).

(function () {
    'use strict';

    const EVENTOS = [
        { year: '1950', title: 'El gran debut', text: 'Se disputa en Silverstone la primera carrera del Campeonato Mundial. Giuseppe Farina (Alfa Romeo) gana la primera temporada.' },
        { year: '1958', title: 'Nace el campeonato de constructores', text: 'Se entrega por primera vez el título de constructores; lo gana Vanwall.' },
        { year: '1977', title: 'El efecto suelo llega a la F1', text: 'Lotus presenta el 78, el primer monoplaza que aprovecha el efecto suelo para generar carga aerodinámica.' },
        { year: '1988', title: 'El año de McLaren', text: 'El MP4/4 de Senna y Prost, con motor Honda turbo, gana 15 de las 16 carreras de la temporada.' },
        { year: '1994', title: 'Imola y la seguridad', text: 'Los accidentes mortales de Roland Ratzenberger y Ayrton Senna en San Marino impulsan una profunda revisión de la seguridad.' },
        { year: '2005', title: 'Alonso rompe la racha', text: 'Fernando Alonso (Renault) se convierte en el campeón más joven hasta ese momento y termina con el dominio de Schumacher y Ferrari.' },
        { year: '2014', title: 'Era híbrida', text: 'Llegan las unidades de potencia V6 turbo híbridas y comienza un largo periodo de dominio de Mercedes.' },
        { year: '2021', title: 'Hamilton vs. Verstappen', text: 'Una de las batallas más ajustadas de la historia se decide en la última vuelta del Gran Premio de Abu Dabi.' },
        { year: '2026', title: 'Nueva era técnica', text: 'Entra en vigor un reglamento nuevo con unidades de potencia más eléctricas, combustibles sostenibles y monoplazas más ligeros y compactos.' }
    ];

    const cont = document.getElementById('timeline-years');
    const detalle = document.getElementById('timeline-detail');
    if (!cont || !detalle) return;

    let actual = 0;
    const botones = EVENTOS.map((ev, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'timeline-year';
        b.id = 'tl-' + ev.year;
        b.setAttribute('role', 'tab');
        b.textContent = ev.year;
        b.addEventListener('click', () => ir(i));
        b.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { e.preventDefault(); ir(i + 1, true); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); ir(i - 1, true); }
            if (e.key === 'Home') { e.preventDefault(); ir(0, true); }
            if (e.key === 'End') { e.preventDefault(); ir(EVENTOS.length - 1, true); }
        });
        cont.appendChild(b);
        return b;
    });

    function ir(i, enfocar) {
        actual = (i + EVENTOS.length) % EVENTOS.length;
        botones.forEach((b, idx) => {
            const on = idx === actual;
            b.setAttribute('aria-selected', String(on));
            b.tabIndex = on ? 0 : -1;
        });
        const ev = EVENTOS[actual];
        const y = document.createElement('span');
        y.className = 'tl-year';
        y.textContent = ev.year;
        const t = document.createElement('h3');
        t.textContent = ev.title;
        const p = document.createElement('p');
        p.textContent = ev.text;
        detalle.replaceChildren(y, t, p);
        detalle.setAttribute('aria-labelledby', botones[actual].id);
        // Centra el año SOLO dentro de su fila (scrollIntoView movería también toda la página)
        const b = botones[actual];
        cont.scrollTo({ left: b.offsetLeft - (cont.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
        if (enfocar) botones[actual].focus();
    }

    ir(EVENTOS.length - 1);
})();
