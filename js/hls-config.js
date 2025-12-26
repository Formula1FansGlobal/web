// Configuración HLS.js para streaming en vivo
// Cambia la URL cuando tengas tu servidor MediaMTX funcionando

const STREAM_CONFIG = {
    // CUANDO TENGAS MEDIAMTX: Reemplaza con tu IP pública:puerto
    // Ejemplo: 'http://201.123.45.67:8888/f1live/index.m3u8'
    liveStreamUrl: 'http://189.136.180.108:8888/f1live/index.m3u8',
    
    // Modo de desarrollo: usa video local si no hay stream disponible
    fallbackVideo: 'videos/Presentacion-Pilotos-F1-2025.mp4',
    useFallback: true, // Cambia a false cuando tengas el stream funcionando
    
    // Configuración de HLS
    hlsConfig: {
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3,
        maxFragLookUpTolerance: 0.25,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        liveDurationInfinity: false,
        debug: false // Cambia a true para depurar
    }
};

// Inicializar HLS cuando el DOM esté listo
let hlsInstance = null;

function initHLS() {
    const video = document.getElementById('live-video');
    if (!video) {
        console.error('HLS: Elemento video no encontrado');
        return;
    }

    // Prevención: si la página está en HTTPS y el stream usa HTTP, el navegador lo bloqueará (Mixed Content).
    // En ese caso, activar fallback automáticamente para evitar que la página "se rompa".
    const pageIsHttps = window.location.protocol === 'https:';
    const streamIsHttp = typeof STREAM_CONFIG.liveStreamUrl === 'string' && STREAM_CONFIG.liveStreamUrl.startsWith('http://');
    const mixedContentBlocked = pageIsHttps && streamIsHttp;

    // Si está en modo fallback, usar video local
    if (STREAM_CONFIG.useFallback || mixedContentBlocked) {
        if (mixedContentBlocked) {
            console.warn('HLS: Mixed Content detectado (HTTPS página vs HTTP stream). Activando fallback.');
        }
        console.log('HLS: Usando video local (fallback mode)');
        video.src = STREAM_CONFIG.fallbackVideo;
        video.load();
        return;
    }

    // Intentar usar HLS.js
    if (Hls.isSupported()) {
        console.log('HLS: Inicializando con HLS.js');
        hlsInstance = new Hls(STREAM_CONFIG.hlsConfig);
        
        hlsInstance.loadSource(STREAM_CONFIG.liveStreamUrl);
        hlsInstance.attachMedia(video);
        
        // Eventos HLS
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log('✅ HLS: Stream listo para reproducir');
            // Mostrar indicador de stream disponible
            const liveIndicator = document.getElementById('live-indicator');
            if (liveIndicator) {
                liveIndicator.classList.remove('hidden');
            }
        });
        
        hlsInstance.on(Hls.Events.ERROR, function(event, data) {
            console.error('❌ HLS Error:', data.type, data.details);
            
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.log('Error de red, intentando recuperar...');
                        hlsInstance.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.log('Error de media, intentando recuperar...');
                        hlsInstance.recoverMediaError();
                        break;
                    default:
                        console.error('Error fatal, no se puede recuperar');
                        // Intentar recargar después de 5 segundos
                        setTimeout(() => {
                            console.log('Intentando reconectar...');
                            hlsInstance.destroy();
                            initHLS();
                        }, 5000);
                        break;
                }
            }
        });
        
        hlsInstance.on(Hls.Events.FRAG_LOADED, function(event, data) {
            // Fragment cargado exitosamente
            if (STREAM_CONFIG.hlsConfig.debug) {
                console.log('Fragment loaded:', data.frag.sn);
            }
        });
        
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari nativo soporta HLS
        console.log('HLS: Usando soporte nativo (Safari)');
        video.src = STREAM_CONFIG.liveStreamUrl;
        video.addEventListener('loadedmetadata', function() {
            console.log('✅ HLS: Stream cargado (nativo)');
            const liveIndicator = document.getElementById('live-indicator');
            if (liveIndicator) {
                liveIndicator.classList.remove('hidden');
            }
        });
    } else {
        console.error('HLS: No soportado en este navegador');
        // Fallback a video local
        video.src = STREAM_CONFIG.fallbackVideo;
    }
}

// Limpiar HLS al salir
window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
        hlsInstance.destroy();
    }
});

// Función para cambiar URL del stream (útil para actualizar sin recargar)
function updateStreamUrl(newUrl) {
    if (hlsInstance) {
        hlsInstance.loadSource(newUrl);
    }
    console.log('Stream URL actualizada a:', newUrl);
}

// Función para obtener estadísticas del stream
function getStreamStats() {
    if (!hlsInstance) return null;
    
    return {
        currentLevel: hlsInstance.currentLevel,
        levels: hlsInstance.levels.map(l => ({
            width: l.width,
            height: l.height,
            bitrate: l.bitrate
        })),
        loadLevel: hlsInstance.loadLevel,
        bufferLength: hlsInstance.media ? hlsInstance.media.buffered.length : 0
    };
}

// Exportar funciones para uso global
window.HLSStream = {
    init: initHLS,
    updateUrl: updateStreamUrl,
    getStats: getStreamStats,
    getInstance: () => hlsInstance
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHLS);
} else {
    initHLS();
}
