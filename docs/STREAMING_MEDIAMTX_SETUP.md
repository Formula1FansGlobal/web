# Configuración MediaMTX - Servidor de Streaming

## 📋 Requisitos
- PC con Windows (i5 9400F, 16GB RAM, RTX 2060) ✅
- Internet 100 Mbps simétrico ✅
- OBS Studio
- MediaMTX

---

## 🚀 Paso 1: Descargar e Instalar MediaMTX

### Descargar MediaMTX
1. Ve a: https://github.com/bluenviron/mediamtx/releases
2. Descarga la versión Windows: `mediamtx_vX.X.X_windows_amd64.zip`
3. Extrae en `C:\MediaMTX\`

### Estructura de carpetas
```
C:\MediaMTX\
  ├── mediamtx.exe
  ├── mediamtx.yml (configuración)
  └── recordings\ (opcional, para grabar)
```

---

## ⚙️ Paso 2: Configurar MediaMTX

### Crear archivo de configuración `mediamtx.yml`

```yaml
# Configuración básica MediaMTX
logLevel: info
logDestinations: [stdout]
logFile: mediamtx.log

# Protocolo RTMP (para OBS)
rtmp: yes
rtmpAddress: :1935
rtmpEncryption: "no"

# HLS (para navegadores web)
hls: yes
hlsAddress: :8888
hlsEncryption: no
hlsServerKey: server.key
hlsServerCert: server.crt
hlsAlwaysRemux: no
hlsVariant: lowLatency
hlsSegmentCount: 7
hlsSegmentDuration: 1s
hlsPartDuration: 200ms
hlsSegmentMaxSize: 50M
hlsMuxerCloseAfter: 60s

# WebRTC (opcional, menor latencia)
webrtc: yes
webrtcAddress: :8889
webrtcICEServers2: []

# API de estadísticas
api: yes
apiAddress: :9997

# Paths (canales de streaming)
paths:
  f1live:
    source: publisher
    sourceOnDemand: no
    runOnReady: ""
    runOnNotReady: ""
    runOnDemand: ""
    runOnUnDemand: ""
    record: no
```

### Guardar el archivo en `C:\MediaMTX\mediamtx.yml`

---

## 🎥 Paso 3: Configurar OBS Studio

### Configuración de Streaming
1. Abre OBS Studio
2. Ve a **Configuración → Transmisión**
3. Configura:
   - **Servicio:** Personalizado
   - **Servidor:** `rtmp://localhost:1935/f1live`
   - **Clave de transmisión:** (déjalo vacío o pon cualquier texto)

### Configuración de Salida (Encoding con RTX 2060)
1. Ve a **Configuración → Salida**
2. **Modo:** Avanzado
3. **Pestaña Streaming:**
   - Encoder: **NVIDIA NVENC H.264**
   - Control de bitrate: CBR
   - Bitrate: **6000 Kbps** (para 1080p60) o **3500 Kbps** (para 720p60)
   - Keyframe interval: 2
   - Preset: Quality
   - Profile: high
   - Look-ahead: ✅ (activado)
   - Psycho Visual Tuning: ✅ (activado)

### Configuración de Video
1. Ve a **Configuración → Video**
2. **Resolución base:** 1920x1080 (o tu resolución nativa)
3. **Resolución de salida:** 1920x1080 o 1280x720
4. **FPS:** 60 o 30

---

## 🌐 Paso 4: Configurar Red y Firewall

### Abrir puertos en el Firewall de Windows
```powershell
# Ejecutar PowerShell como Administrador
New-NetFirewallRule -DisplayName "MediaMTX RTMP" -Direction Inbound -Protocol TCP -LocalPort 1935 -Action Allow
New-NetFirewallRule -DisplayName "MediaMTX HLS" -Direction Inbound -Protocol TCP -LocalPort 8888 -Action Allow
New-NetFirewallRule -DisplayName "MediaMTX API" -Direction Inbound -Protocol TCP -LocalPort 9997 -Action Allow
```

### Configurar Port Forwarding en tu Router
1. Accede a tu router (generalmente http://192.168.1.1 o http://192.168.0.1)
2. Busca la sección "Port Forwarding" o "Reenvío de puertos"
3. Configura:
   - **Puerto externo:** 8888 → **Puerto interno:** 8888 → **IP de tu PC**
   - **Protocolo:** TCP

### Obtener tu IP Pública
- Ve a https://www.whatismyip.com/
- Anota tu IP pública (ej: 201.123.45.67)

### (Opcional) Configurar DNS Dinámico
Si tu IP pública cambia, usa servicios como:
- **No-IP** (gratis): https://www.noip.com/
- **DuckDNS** (gratis): https://www.duckdns.org/

---

## ▶️ Paso 5: Iniciar MediaMTX

### Ejecutar servidor
```powershell
cd C:\MediaMTX
.\mediamtx.exe
```

Verás algo como:
```
2025/12/26 10:00:00 INF MediaMTX v1.x.x
2025/12/26 10:00:00 INF [RTMP] listener opened on :1935
2025/12/26 10:00:00 INF [HLS] listener opened on :8888
2025/12/26 10:00:00 INF [API] listener opened on :9997
```

### Crear servicio de Windows (para inicio automático)
```powershell
# Como Administrador
sc.exe create MediaMTX binPath= "C:\MediaMTX\mediamtx.exe" start= auto
sc.exe start MediaMTX
```

---

## 🔗 Paso 6: Actualizar tu Web

### Modificar en-vivo.html para usar HLS

Actualiza el video para consumir tu stream:

```html
<video id="live-video" class="stream-video" controls playsinline>
    <!-- Reemplazar con tu stream HLS -->
    <source src="http://TU_IP_PUBLICA:8888/f1live/index.m3u8" type="application/x-mpegURL">
</video>
```

### Usar HLS.js para mejor compatibilidad

Agrega antes del cierre de `</body>`:

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
const video = document.getElementById('live-video');
const streamUrl = 'http://TU_IP_PUBLICA:8888/f1live/index.m3u8';

if (video) {
    if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log('Stream listo');
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari nativo
        video.src = streamUrl;
    }
}
</script>
```

---

## 🧪 Paso 7: Probar el Streaming

### Test local
1. Inicia MediaMTX
2. Abre OBS y haz clic en **Iniciar transmisión**
3. Abre en el navegador: `http://localhost:8888/f1live/`
4. Deberías ver tu stream

### Test remoto
1. Desde otro dispositivo/red, abre: `http://TU_IP_PUBLICA:8888/f1live/`
2. O integra en tu web: `http://TU_IP_PUBLICA:8888/f1live/index.m3u8`

---

## 📊 Estimación de Viewers

Con tu configuración (100 Mbps simétrico):

| Calidad | Bitrate | Usuarios simultáneos |
|---------|---------|---------------------|
| 1080p60 | 6000 kbps | ~13 viewers |
| 720p60  | 3500 kbps | ~22 viewers |
| 720p30  | 2500 kbps | ~31 viewers |

**Recomendación:** 720p60 @ 3500 Kbps para balance entre calidad y alcance.

---

## 🛠️ Solución de Problemas

### Stream no se ve en el navegador
- Verifica que MediaMTX esté corriendo
- Checa que OBS esté transmitiendo
- Confirma que el firewall permite el puerto 8888

### Lag o buffering
- Reduce el bitrate en OBS
- Ajusta `hlsSegmentDuration` a 2s en mediamtx.yml
- Verifica que tu upload no esté saturado

### No puedo acceder desde fuera de mi red
- Confirma port forwarding en el router
- Verifica tu IP pública
- Comprueba que tu ISP no bloquee puertos

---

## 🔒 Seguridad (Opcional pero Recomendado)

### Proteger con contraseña
Edita `mediamtx.yml`:

```yaml
paths:
  f1live:
    source: publisher
    publishUser: tu_usuario
    publishPass: tu_password
    readUser: viewer
    readPass: viewer_password
```

### Usar HTTPS/SSL
1. Obtén certificado SSL (Let's Encrypt con Certbot)
2. Configura en mediamtx.yml:
```yaml
hlsEncryption: yes
hlsServerKey: /path/to/privkey.pem
hlsServerCert: /path/to/fullchain.pem
```

---

## 📌 Comandos Útiles

```powershell
# Ver estado del servidor
curl http://localhost:9997/v3/paths/list

# Detener MediaMTX
taskkill /IM mediamtx.exe /F

# Ver logs en tiempo real
Get-Content C:\MediaMTX\mediamtx.log -Wait
```

---

## 🎯 Checklist Final

- [ ] MediaMTX instalado y corriendo
- [ ] OBS configurado con NVENC
- [ ] Puertos abiertos en firewall
- [ ] Port forwarding configurado en router
- [ ] Web actualizada con URL del stream
- [ ] Test local exitoso
- [ ] Test remoto exitoso

---

¿Necesitas ayuda con algún paso específico?
