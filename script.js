// ========================
// SECCIÓN: Noticias Automáticas desde RSS
// ========================
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



// Fetch para el menú
  fetch('menu.html')
    .then(response => response.text())
    .then(data => {
        document.body.insertAdjacentHTML('afterbegin', data);
    });

  // Configuración del contador de cuenta regresiva
  const fechaObjetivo = new Date('2025-02-15T15:00:00'); // Cambia esta fecha y hora a la deseada

  function actualizarContador() {
    const ahora = new Date();
    const diferencia = fechaObjetivo - ahora;

    if (diferencia > 0) {
      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

      document.getElementById('dias').textContent = dias.toString().padStart(2, '0');
      document.getElementById('horas').textContent = horas.toString().padStart(2, '0');
      document.getElementById('minutos').textContent = minutos.toString().padStart(2, '0');
      document.getElementById('segundos').textContent = segundos.toString().padStart(2, '0');
    } else {
      document.getElementById('contador').innerHTML = '<h2>¡La carrera ha comenzado!</h2>';
    }
  }

  setInterval(actualizarContador, 1000);
