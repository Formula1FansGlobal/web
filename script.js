// ========================
// SECCIÓN: Noticias Automáticas desde RSS
// ========================
const API_KEY = "56047088e795d75ce157b11ea41c5e21"; // Reemplaza con tu API Key de GNews
const URL = `https://gnews.io/api/v4/search?q=formula1&lang=es&token=${API_KEY}`;

async function cargarNoticias() {
    try {
        const response = await fetch(URL);
        const data = await response.json();

        let noticiasHTML = '';
        data.articles.forEach(noticia => {
            noticiasHTML += `
                <div class="noticia">
                    <img src="${noticia.image || 'https://via.placeholder.com/400'}">
                    <h3>${noticia.title}</h3>
                    <p>${noticia.description || 'Sin descripción disponible'}</p>
                    <a href="${noticia.url}" target="_blank">Leer más</a>
                </div>
            `;
        });

        document.getElementById("news").innerHTML = noticiasHTML;
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        document.getElementById("news").innerHTML = 'Hubo un error al cargar las noticias.';
    }
}
document.addEventListener("DOMContentLoaded", cargarNoticias);



// ========================
// SECCIÓN: Contador Regresivo para En Vivo
// ========================

const contadorElement = document.getElementById("contador");

function actualizarContador() {
    const fechaFutura = new Date("2025-03-20T14:00:00").getTime(); // Fecha del evento
    const ahora = new Date().getTime();
    const tiempoRestante = fechaFutura - ahora;

    if (tiempoRestante < 0) {
        contadorElement.innerHTML = "¡El evento ha comenzado!";
        return;
    }

    const dias = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
    const horas = Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);

    contadorElement.innerHTML = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
}

// Iniciar el contador solo si existe el elemento en la página
if (contadorElement) {
    setInterval(actualizarContador, 1000);
    actualizarContador(); // Llamar una vez para mostrar el tiempo inmediatamente
}
