let indices = {};

function mover(direccion, carouselId) {
    if (!indices[carouselId]) indices[carouselId] = 0;
    
    const carrusel = document.querySelector(`#${carouselId} .carousel`);
    const imagenes = document.querySelectorAll(`#${carouselId} .carousel a`);
    if (!carrusel || imagenes.length === 0) return;

    const imagenesPorSlide = calcularImagenesPorSlide();
    const totalSlides = Math.ceil(imagenes.length / imagenesPorSlide);

    indices[carouselId] += direccion;
    if (indices[carouselId] < 0) indices[carouselId] = totalSlides - 1;
    else if (indices[carouselId] >= totalSlides) indices[carouselId] = 0;

    carrusel.style.transform = `translateX(${-indices[carouselId] * 100}%)`;
}

function calcularImagenesPorSlide() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    return 4;
}

// Debounce helper
function debounce(fn, delay = 150) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

// Recalcular layout al redimensionar
function actualizarLayoutCarousels() {
    document.querySelectorAll('[id^="carousel-"] .carousel').forEach((carrusel) => {
        const contenedor = carrusel.closest('[id^="carousel-"]');
        if (!contenedor) return;
        const carouselId = contenedor.id;
        const imagenes = contenedor.querySelectorAll('.carousel a');
        if (imagenes.length === 0) return;

        const imagenesPorSlide = calcularImagenesPorSlide();
        const totalSlides = Math.ceil(imagenes.length / imagenesPorSlide);
        if (indices[carouselId] >= totalSlides) indices[carouselId] = totalSlides - 1;
        carrusel.style.transform = `translateX(${- (indices[carouselId] || 0) * 100}%)`;
    });
}

window.addEventListener('resize', debounce(actualizarLayoutCarousels, 200));