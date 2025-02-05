const API_KEY = "pub_67944619781bfef5f895bb18760aa3cf7bf21"; // Reemplaza con tu clave de NewsData.io
const URL = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=formula1&language=es`;

async function cargarNoticias() {
    try {
        const response = await fetch(URL);
        const data = await response.json();

        let noticiasHTML = '';
        data.results.forEach(noticia => {
            noticiasHTML += `
                <div class="noticia">
                    <img src="${noticia.image_url || 'https://via.placeholder.com/400'}">
                    <h3>${noticia.title}</h3>
                    <p>${noticia.description || 'Sin descripción disponible'}</p>
                    <a href="${noticia.link}" target="_blank">Leer más</a>
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
