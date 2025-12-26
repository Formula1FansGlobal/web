// Elementos del modal (con comprobaciones)
const liveButton = document.getElementById('live-button');
const playModal = document.getElementById('play-modal');
const playLiveBtn = document.getElementById('play-live-btn');
const playFromStartBtn = document.getElementById('play-from-start-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const video = document.getElementById('live-video');
const preImage = document.getElementById('pre-image');
const postImage = document.getElementById('post-image');
const enVivoCard = document.querySelector('.live-container') || document.querySelector('.en-vivo-card');
const enVivoMain = document.getElementById('en-vivo-main');
const streamContainer = document.querySelector('.stream-container');
const liveIndicator = document.getElementById('live-indicator');

// Si faltan elementos críticos, no continuar
if (!liveButton || !video || !preImage || !postImage || !streamContainer) {
    console.warn('Stream: elementos requeridos no encontrados, se omiten listeners.');
} else {

// Abrir modal al hacer clic en EN VIVO
    liveButton.addEventListener('click', function() {
        if (playModal) playModal.classList.remove('hidden');
    });

// Cerrar modal
    if (closeModalBtn && playModal) {
        closeModalBtn.addEventListener('click', function() {
            playModal.classList.add('hidden');
        });
    }

// Cerrar modal al hacer clic fuera (en el fondo)
    if (playModal) {
        playModal.addEventListener('click', function(e) {
            if (e.target === playModal) {
                playModal.classList.add('hidden');
            }
        });
    }

// Opción: Ver en Vivo (desde el tiempo actual)
    if (playLiveBtn) {
        playLiveBtn.addEventListener('click', function() {
            video.style.display = 'block';
            preImage.style.display = 'none';
            postImage.style.display = 'none';
            liveButton.style.display = 'none';
            video.play();
            if (playModal) playModal.classList.add('hidden');
            
            // Agregar clase playing-stream para expandir video
            if (enVivoCard) enVivoCard.classList.add('playing-stream');
            if (enVivoMain) enVivoMain.classList.add('playing-stream');
            if (streamContainer) streamContainer.classList.add('stream-active');
            
            // Ocultar indicador cuando el video está activo
            if (liveIndicator) liveIndicator.classList.add('hidden');
            
            // Mostrar chat en vivo
            const liveChat = document.getElementById('live-chat');
            if (liveChat) liveChat.classList.remove('hidden');
        });
    }

// Opción: Desde el Comienzo (reiniciar desde 0)
    if (playFromStartBtn) {
        playFromStartBtn.addEventListener('click', function() {
            video.style.display = 'block';
            preImage.style.display = 'none';
            postImage.style.display = 'none';
            liveButton.style.display = 'none';
            video.currentTime = 0;
            video.play();
            if (playModal) playModal.classList.add('hidden');
            
            // Agregar clase playing-stream para expandir video
            if (enVivoCard) enVivoCard.classList.add('playing-stream');
            if (enVivoMain) enVivoMain.classList.add('playing-stream');
            if (streamContainer) streamContainer.classList.add('stream-active');
            
            // Ocultar indicador cuando el video está activo
            if (liveIndicator) liveIndicator.classList.add('hidden');
            
            // Mostrar chat en vivo
            const liveChat = document.getElementById('live-chat');
            if (liveChat) liveChat.classList.remove('hidden');
        });
    }

// Cuando el video termina, mostrar imagen post
    video.addEventListener('ended', function() {
        video.style.display = 'none';
        postImage.style.display = 'block';
        liveButton.style.display = 'flex';
        
        // Mostrar indicador cuando el video termina
        if (liveIndicator) liveIndicator.classList.remove('hidden');
    });

// Mostrar indicador al cargar la página (simular que hay transmisión disponible)
    document.addEventListener('DOMContentLoaded', function() {
        // Descomenta la siguiente línea para mostrar el indicador por defecto
        // if (liveIndicator) liveIndicator.classList.remove('hidden');
    });
}
