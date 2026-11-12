// temporadas.js - Índice de temporadas por década.

(function () {
    'use strict';

    const { h } = window.F1UI;
    const ACTUAL = new Date().getFullYear();

    const DECADAS = {
        1950: 'Nace el campeonato mundial. Fangio domina la década con cinco títulos y se establece el calendario europeo.',
        1960: 'Los motores pasan a la parte trasera, llegan los patrocinios y brillan Jim Clark, Graham Hill y Jackie Stewart.',
        1970: 'Alerones, efecto suelo y el duelo Hunt-Lauda de 1976. Renault estrena el motor turbo en 1977.',
        1980: 'La era turbo y el duelo McLaren con Prost y Senna. Piquet y Brabham también dejan huella.',
        1990: 'Senna, el debut de Schumacher en 1991, el dominio de Williams y el trágico fin de semana de Imola en 1994.',
        2000: 'Schumacher y Ferrari ganan cinco títulos seguidos. Alonso rompe la racha en 2005, llegan los V8 y Hamilton gana en 2008.',
        2010: 'Vettel y Red Bull abren la década; desde 2014, con los motores híbridos V6, Mercedes domina durante años.',
        2020: 'Nuevo reglamento de efecto suelo en 2022, la era Verstappen y la gran renovación técnica de 2026.'
    };

    const decadas = Object.keys(DECADAS).map(Number).sort((a, b) => b - a);
    const tabs = document.getElementById('decade-tabs');
    const intro = document.getElementById('decade-intro');
    const grid = document.getElementById('year-grid');
    let actual = Math.floor(ACTUAL / 10) * 10;

    function pintar() {
        tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.d) === actual)));
        intro.textContent = DECADAS[actual] || '';
        const anios = [];
        for (let y = actual; y < actual + 10; y++) {
            if (y >= 1950 && y <= ACTUAL) anios.push(y);
        }
        grid.replaceChildren(...anios.sort((a, b) => b - a).map((y) =>
            h('a', { class: 'year-btn' + (y === ACTUAL ? ' is-current' : ''), href: `calendario_temporada.html?year=${y}` }, String(y))
        ));
    }

    tabs.replaceChildren(...decadas.map((d) => {
        const b = h('button', { type: 'button', class: 'chip', 'data-d': String(d), 'aria-pressed': 'false' }, `${d}s`);
        b.addEventListener('click', () => { actual = d; pintar(); });
        return b;
    }));
    pintar();
})();
