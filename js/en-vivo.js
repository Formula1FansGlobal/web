// en-vivo.js - Control del stream en vivo

// Obtener elementos
const liveButton = document.getElementById('live-button');
const liveVideo = document.getElementById('live-video');
const preImage = document.getElementById('pre-image');
const postImage = document.getElementById('post-image');

// Por defecto, mostrar imagen y ocultar video
liveVideo.style.display = 'none';
postImage.style.display = 'none';

// Al clickear el botón EN VIVO
liveButton.addEventListener('click', function(e) {
  e.preventDefault();
  
  // Ocultar imagen y mostrar video
  preImage.style.display = 'none';
  postImage.style.display = 'none';
  liveVideo.style.display = 'block';
  
  // Ocultar el botón
  liveButton.style.display = 'none';
  
  // Reproducir automáticamente
  liveVideo.play();
});

// Cuando termina el video, mostrar imagen post y botón nuevamente
liveVideo.addEventListener('ended', function() {
  postImage.style.display = 'block';
  liveVideo.style.display = 'none';
  liveButton.style.display = 'flex';
  liveButton.textContent = '🔄 VER DE NUEVO';
});

// Botón pause/play para cambiar entre reproducción y pausa
liveVideo.addEventListener('pause', function() {
  if (liveVideo.currentTime < liveVideo.duration) {
    // Si pausó pero no terminó, ocultar botón
    liveButton.style.display = 'none';
  }
});

liveVideo.addEventListener('play', function() {
  // Cuando empieza a reproducir, ocultar botón
  liveButton.style.display = 'none';
});
