let indices = {};

function mover(direccion, carouselId) {
    if (!indices[carouselId]) indices[carouselId] = 0;
    
    const carrusel = document.querySelector(`#${carouselId} .carousel`);
    const imagenes = document.querySelectorAll(`#${carouselId} .carousel a`);
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

window.addEventListener('resize', () => {});