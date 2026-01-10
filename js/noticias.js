const API_KEY = "pub_67944619781bfef5f895bb18760aa3cf7bf21"; // Sugerencia: mover a backend o variable de entorno
const URL = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=formula1&language=es`;

async function cargarNoticias() {
    try {
        const response = await fetch(URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const contenedor = document.getElementById("news");
        if (!contenedor) return;

        const resultados = Array.isArray(data.results) ? data.results : [];
        if (resultados.length === 0) {
            contenedor.textContent = 'No hay noticias disponibles por ahora.';
            return;
        }

        const noticiasHTML = resultados.map(noticia => {
            const imgSrc = noticia.image_url || 'https://via.placeholder.com/400';
            const title = noticia.title || 'Sin título';
            const desc = noticia.description || 'Sin descripción disponible';
            const link = noticia.link || '#';
            return `
                <div class="noticia">
                    <img 
                        src="${imgSrc}" 
                        alt="${title}" 
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/400?text=F1+News'"
                    >
                    <h3>${title}</h3>
                    <p>${desc}</p>
                    <a href="${link}" target="_blank" rel="noopener noreferrer">Leer más</a>
                </div>
            `;
        }).join('');

        contenedor.innerHTML = noticiasHTML;
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        const contenedor = document.getElementById("news");
        if (contenedor) contenedor.textContent = 'Hubo un error al cargar las noticias.';
    }
}

document.addEventListener("DOMContentLoaded", cargarNoticias);
