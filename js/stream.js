// Elementos del modal
const liveButton = document.getElementById('live-button');
const playModal = document.getElementById('play-modal');
const playLiveBtn = document.getElementById('play-live-btn');
const playFromStartBtn = document.getElementById('play-from-start-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const video = document.getElementById('live-video');
const preImage = document.getElementById('pre-image');
const postImage = document.getElementById('post-image');
const enVivoCard = document.querySelector('.en-vivo-card');
const enVivoMain = document.getElementById('en-vivo-main');
const streamContainer = document.querySelector('.stream-container');
const liveIndicator = document.getElementById('live-indicator');

// Abrir modal al hacer clic en EN VIVO
liveButton.addEventListener('click', function() {
    playModal.classList.remove('hidden');
});

// Cerrar modal
closeModalBtn.addEventListener('click', function() {
    playModal.classList.add('hidden');
});

// Cerrar modal al hacer clic fuera (en el fondo)
playModal.addEventListener('click', function(e) {
    if (e.target === playModal) {
        playModal.classList.add('hidden');
    }
});

// Opción: Ver en Vivo (desde el tiempo actual)
playLiveBtn.addEventListener('click', function() {
    video.style.display = 'block';
    preImage.style.display = 'none';
    postImage.style.display = 'none';
    video.play();
    playModal.classList.add('hidden');
    
    // Agregar clase playing-stream para expandir video
    enVivoCard.classList.add('playing-stream');
    enVivoMain.classList.add('playing-stream');
    streamContainer.classList.add('stream-active');
    
    // Ocultar indicador cuando el video está activo
    liveIndicator.classList.add('hidden');
});

// Opción: Desde el Comienzo (reiniciar desde 0)
playFromStartBtn.addEventListener('click', function() {
    video.style.display = 'block';
    preImage.style.display = 'none';
    postImage.style.display = 'none';
    video.currentTime = 0;
    video.play();
    playModal.classList.add('hidden');
    
    // Agregar clase playing-stream para expandir video
    enVivoCard.classList.add('playing-stream');
    enVivoMain.classList.add('playing-stream');
    streamContainer.classList.add('stream-active');
    
    // Ocultar indicador cuando el video está activo
    liveIndicator.classList.add('hidden');
});

// Cuando el video termina, mostrar imagen post
video.addEventListener('ended', function() {
    video.style.display = 'none';
    postImage.style.display = 'block';
    
    // Mostrar indicador cuando el video termina
    liveIndicator.classList.remove('hidden');
});

// Mostrar indicador al cargar la página (simular que hay transmisión disponible)
document.addEventListener('DOMContentLoaded', function() {
    // Descomenta la siguiente línea para mostrar el indicador por defecto
    // liveIndicator.classList.remove('hidden');
});
