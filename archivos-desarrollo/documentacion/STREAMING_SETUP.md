> ⚠️ **AVISO LEGAL (noviembre 2026):** este documento describe cómo retransmitir una señal de video desde un PC.
> **No lo uses para retransmitir sesiones o carreras de la Fórmula 1** (ni gratis ni de pago): infringe derechos de autor
> y puede provocar bajas del sitio, del hosting y acciones legales. Solo es válido para transmitir contenido **propio**
> (por ejemplo, tu propio programa de comentarios). Lee `POLITICA_DE_CONTENIDO.md`.

# 🎬 Guía de Streaming desde tu PC a GitHub Pages

## Problema: GitHub Pages NO soporta streaming directo

GitHub Pages es un hosting **estático** (solo HTML, CSS, JS). No puede recibir streams de video en vivo directamente.

## ✅ Soluciones disponibles:

### **OPCIÓN 1: Usar OBS + Servicio de Streaming Externo (RECOMENDADO)**

#### Servicios gratuitos:
- **YouTube Live** (YouTube cuenta personal)
- **Twitch** (más usado para gaming)
- **Facebook Live** (integración fácil)
- **StreamYard** (gratis con limitaciones)

#### Pasos:
1. **Instala OBS Studio** (gratuito): https://obsproject.com/
2. **Configura tu stream:**
   - Abre OBS Studio
   - Añade fuentes (cámara, pantalla, juegos, etc.)
   - Ve a Controles > Comenzar streaming
3. **Obtén la URL del stream:**
   - YouTube: Stream > Copiar URL de transmisión
   - Twitch: Panel de Control > Ir en directo
4. **Integra en tu página:**
   - Usa un iframe para mostrar el stream embebido

#### Ejemplo con YouTube:
```html
<iframe 
    width="100%" 
    height="600" 
    src="https://www.youtube.com/embed/live_stream?channel=TU_CANAL_ID" 
    frameborder="0" 
    allowfullscreen>
</iframe>
```

---

### **OPCIÓN 2: Usar Servidor Proxy (Alternativo)**

Si quieres un servidor propio:

1. **Instala FFmpeg** (gratuito):
   - Windows: https://ffmpeg.org/download.html
   - Añade a PATH de Windows

2. **Instala Node.js y Express:**
```bash
npm install express cors
```

3. **Crea servidor de streaming (servidor-streaming.js):**
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public'));

// Endpoint para recibir stream
app.post('/api/stream', (req, res) => {
    // Procesar stream aquí
    res.json({ status: 'streaming' });
});

app.listen(3000, () => console.log('Servidor en puerto 3000'));
```

4. **Transmite desde OBS al servidor**

---

### **OPCIÓN 3: Usar HLS/DASH (Más profesional)**

Para streaming adaptativo de calidad variable:

1. **Instala `nginx` + módulo `nginx-rtmp`**
2. **Configura transcoding con FFmpeg**
3. **Genera archivos .m3u8 (HLS)**
4. **Embebe en tu página:**
```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<video id="video" controls></video>
<script>
  const video = document.getElementById('video');
  const hls = new Hls();
  hls.loadSource('tu-url.m3u8');
  hls.attachMedia(video);
</script>
```

---

## 🎯 RECOMENDACIÓN FINAL:

**Para comenzar rápido:**
1. Usa **OBS Studio** (gratuito)
2. Transmite a **YouTube Live** (fácil configuración)
3. Embebe el iframe en tu página web

**Ventajas:**
- ✅ Gratis
- ✅ Fácil de configurar
- ✅ Funciona en cualquier navegador
- ✅ Buena calidad
- ✅ Estadísticas de visualización

---

## 📝 Pasos rápidos para YouTube Live:

### 1. Crear canal YouTube (si no tienes)
- Ve a youtube.com
- Crea cuenta o usa Gmail existente

### 2. Habilitar transmisiones en vivo
- YouTube > Configuración > Funciones
- Activa "Transmisiones en vivo"

### 3. Instalar OBS
```
https://obsproject.com/download → Descarga → Instala
```

### 4. Configurar OBS
1. Abre OBS Studio
2. **Escenas**: Crea una escena con tu fuente
3. **Fuentes**: Añade cámara, micrófono, pantalla
4. **Configuración**:
   - Stream > Servicio: "YouTube - RTMPS"
   - Usa tu cuenta Google
   - Copia clave RTMP desde YouTube Studio

### 5. Conectar a YouTube
1. Ve a YouTube Studio
2. Haz clic en "Crear" > "Ir en directo"
3. Copia la URL del directo
4. En OBS: Stream Settings > Pega URL

### 6. Integrar en tu web
```html
<!-- Reemplaza VIDEO_ID con tu ID de YouTube -->
<iframe 
    width="1280" 
    height="720" 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    frameborder="0" 
    allowfullscreen>
</iframe>
```

---

## 🔧 Para actualizar dinámicamente el video:

Crea un archivo `config.json`:
```json
{
  "streamActive": true,
  "streamType": "youtube",
  "streamId": "Tu_Video_ID",
  "streamUrl": "https://www.youtube.com/embed/VIDEO_ID"
}
```

Luego carga en JavaScript:
```javascript
fetch('config.json')
  .then(r => r.json())
  .then(data => {
    if (data.streamActive) {
      document.getElementById('stream-frame').src = data.streamUrl;
    }
  });
```

---

## 💡 ¿Qué necesitas?

- [x] OBS Studio (gratuito)
- [x] Cuenta YouTube (gratuito)
- [x] Cámara/Micrófono (tu PC)
- [x] Conexión internet buena

**¿Listo para empezar?** 🚀
