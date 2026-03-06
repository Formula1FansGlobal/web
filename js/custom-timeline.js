// custom-timeline.js - carrusel horizontal con zoom y detalle

document.addEventListener('DOMContentLoaded', () => {
    const events = [
        { year: '1950', title: 'El gran debut', text: 'El Campeonato Mundial se inauguró en Silverstone con victoria de Giuseppe Farina (Alfa Romeo).' },
        { year: '1961', title: 'Nacimiento de John Barnard', text: 'El diseñador que décadas después traería el chasis de fibra de carbono a la F1.' },
        { year: '1970', title: 'Revolución aerodinámica', text: 'Lotus estrena el "efecto suelo" con el 78, cambiando para siempre la aerodinámica.' },
        { year: '1988', title: 'El año McLaren', text: 'El MP4/4 de Senna y Prost ganó 15 de 16 carreras, con motor Honda turbo.' },
        { year: '1994', title: 'San Marino', text: 'Las muertes de Senna y Ratzenberger obligan a rediseñar la seguridad.' },
        { year: '2005', title: 'Sexto doble título de Ferrari', text: 'Schumacher y Barrichello sellan la época dorada con el F2005.' },
        { year: '2014', title: 'Era híbrida', text: 'Mercedes inicia hegemonía con unidades de potencia V6 turbo híbridas.' },
        { year: '2021', title: 'Hamilton vs Verstappen', text: 'La temporada se decide en Abu Dhabi tras polémica del safety car.' },
        { year: '2025', title: 'F1 sostenible', text: 'Reglamentos de efecto suelo y combustibles sintéticos 100% renovables.' }
    ];

    const carousel = document.querySelector('.carousel');
    const detail = document.querySelector('.carousel-detail');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    let currentIndex = 0;

    function renderCarousel() {
        events.forEach((ev, idx) => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.dataset.idx = idx;
            item.innerHTML = `<span class="year">${ev.year}</span>`;
            item.addEventListener('click', () => goToIndex(idx));
            carousel.appendChild(item);
        });
        updateSelection();
    }

    function updateSelection() {
        const items = carousel.querySelectorAll('.carousel-item');
        items.forEach((el, idx) => {
            el.classList.toggle('active', idx === currentIndex);
        });
        showDetail(currentIndex);
        scrollIntoView(currentIndex);
    }

    function showDetail(idx) {
        const ev = events[idx];
        detail.innerHTML = `
            <h3>${ev.year} – ${ev.title}</h3>
            <p>${ev.text}</p>
        `;
    }

    function scrollIntoView(idx) {
        const item = carousel.querySelector(`.carousel-item[data-idx="${idx}"]`);
        if (item) {
            item.scrollIntoView({behavior: 'smooth', inline: 'center'});
        }
    }

    function goToIndex(idx) {
        if (idx < 0) idx = events.length - 1;
        if (idx >= events.length) idx = 0;
        currentIndex = idx;
        updateSelection();
    }

    prevBtn.addEventListener('click', () => goToIndex(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToIndex(currentIndex + 1));

    renderCarousel();
});