// ========================
// SECCIÓN: Noticias Automáticas desde RSS
// ========================

async function cargarNoticiasDesdeRSS() {
    try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.motorsport.com/rss/news');
        const data = await response.json();
        
        // Convertir XML a un objeto JS usando DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'application/xml');
        
        // Extraer las noticias del XML
        const items = xmlDoc.getElementsByTagName('item');
        let noticiasHTML = '';
        
        for (let i = 0; i < items.length; i++) {
            const title = items[i].getElementsByTagName('title')[0].textContent;
            const link = items[i].getElementsByTagName('link')[0].textContent;
            const description = items[i].getElementsByTagName('description')[0].textContent;
            
            noticiasHTML += `
                <div class="noticia">
                    <h3><a href="${link}" target="_blank">${title}</a></h3>
                    <p>${description}</p>
                </div>
            `;
        }
        
        document.getElementById("news").innerHTML = noticiasHTML;
    } catch (error) {
        console.error('Error al cargar las noticias desde el RSS:', error);
        document.getElementById("news").innerHTML = 'Hubo un error al cargar las noticias.';
    }
}

// Cargar noticias cuando la página haya cargado completamente
document.addEventListener("DOMContentLoaded", cargarNoticiasDesdeRSS);

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
