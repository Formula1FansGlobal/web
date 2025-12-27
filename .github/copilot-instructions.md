# Instrucciones para Copilot - Formula 1 Fans Global

## Descripción General del Proyecto

Formula 1 Fans Global es un **sitio web estático HTML/CSS/JavaScript** (sin backend) enfocado en entregar noticias de F1, transmisiones en vivo, calendarios de eventos y participación de aficionados. El sitio está habilitado para PWA y se implementa a través de GitHub Pages.

**Características Clave:**
- Frontend puro (sin dependencias de framework)
- Diseño centrado en contenido en español
- Manifiesto PWA para experiencia offline/instalable
- Inyección dinámica de menú y estructura modular de páginas
- Soporte para transmisión en vivo + chat en tiempo real
- Calendario de carreras interactivo
- Tienda de mercancía con filtros (estructura preparada)

---

## Arquitectura & Patrones Principales

### 1. **Sistema de Menú Dinámico**

**Dynamic Menu System** (Sistema de Menú Dinámico)

El menú de navegación se obtiene e inyecta dinámicamente en cada página a través de `js/menu.js`.

**Patrón:** 
- `menu.html` contiene el componente nav reutilizable (reusable nav component)
- Todas las páginas tienen un placeholder `<div id="nav-container"></div>`
- El script usa `fetch('menu.html')` → `insertAdjacentHTML` con detección de enlace activo mediante `window.location.pathname`
- El enlace activo obtiene `aria-current="page"` + clase `is-active`

**Archivos:** [menu.html](menu.html), [js/menu.js](js/menu.js), [css/menu.css](css/menu.css)

Al agregar nuevas páginas:
1. Agregar ruta a `menu.html` (Add route)
2. Incluir `<div id="nav-container"></div>` al inicio del body (at top of body)
3. Cargar `js/menu.js` con atributo `defer` (Load with defer attribute)
4. Establecer título apropiado en etiqueta `<title>` para coincidencia de enlace activo (for active link matching)

---

### 2. **Componentes de Stream en Vivo**

**Stream & Live Components** (Componentes de Stream y Transmisión en Vivo)

La transmisión en vivo de carreras F1 usa una **arquitectura basada en modal** con flujos de control duales:

**Archivos Principales:** [js/stream.js](js/stream.js), [js/en-vivo.js](en-vivo.js), [css/en-vivo.css](css/en-vivo.css)

**Decisiones Clave de Arquitectura:**
- **Selección defensiva de elementos (Defensive element selection):** `stream.js` verifica si los elementos del DOM existen antes de adjuntar listeners (previene crashes en páginas sin stream)
- **Clases de estado (State classes):** El estado de reproducción de video usa clases CSS (`playing-stream`, `stream-active`, `hidden`) en lugar de estilos inline
- **Patrón modal (Modal pattern):** Modal de opciones de reproducción (`play-modal`) con dos botones:
  - `play-live-btn`: Comienza desde la posición actual (Start from current position)
  - `play-from-start-btn`: Rebobina hacia el inicio (Rewind to beginning)
- **Gestión de visibilidad de elementos (Element visibility management):** Estados pre-carrera (`preImage`), vivo (`liveVideo`), post-carrera (`postImage`) controlados mediante propiedad display

**Clases Críticas:**
- `.playing-stream` — Se añade al contenedor cuando el video está activo (Added when active)
- `.stream-active` — Se añade al contenedor del stream (Added to stream container)
- `.hidden` — Se añade a elementos a ocultar (Added to elements to hide)

Al modificar la lógica del stream:
- Actualizar estado mediante alternancia de clases, no estilos inline (Update via class toggling, not inline styles)
- Verificar siempre la existencia de elementos antes de adjuntar listeners (Always check element existence)
- Mantener el flujo de listeners ended/pause para funcionalidad de repetición (Maintain listener flow for replay)

---

### 3. **Chat en Vivo (basado en localStorage)**

**Live Chat (localStorage-based)** (Chat en Vivo basado en localStorage)

El chat es **solo del lado del cliente** usando `localStorage` para persistencia.

**Archivo:** [js/chat.js](js/chat.js)

**Justificación del Diseño (Design Rationale):**
- Sin dependencia de backend (No backend dependency)
- Limitado a 50 mensajes por usuario/dispositivo (Limited to 50 messages per user/device)
- Contador de usuarios en línea simulado (Simulated online counter - random updates every 30s)
- Nombre de usuario almacenado en `localStorage['chatUsername']`
- Todos los mensajes almacenados en `localStorage['chatMessages']` (JSON array)

**Limitación:** Los mensajes solo son visibles para el usuario individual (no se comparten entre dispositivos/usuarios). Para chat multi-usuario en tiempo real, se necesita backend Firebase o WebSocket. (Messages only visible to individual user - not shared across devices. For real-time multi-user chat, Firebase or WebSocket backend needed.)

---

### 4. **Feed de Noticias desde API Externa**

**News Feed from External API** (Feed de Noticias desde API Externa)

Noticias dinámicas de F1 cargadas desde la API **NewsData.io**.

**Archivo:** [js/script.js](js/script.js)

**Patrón Clave (Key Pattern):**
```javascript
const API_KEY = "pub_67944619781bfef5f895bb18760aa3cf7bf21";
const URL = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=formula1&language=es`;
```

**Importante (Important):**
- ⚠️ **API key expuesta en frontend** (bajo riesgo de seguridad — free tier, rate-limited) - **API key exposed in frontend** (low security risk—free tier, rate-limited)
- Noticias renderizadas en elemento `#news` como grid HTML (News rendered into `#news` element as HTML grid)
- Imagen placeholder de respaldo si el elemento de noticia carece de imagen (Fallback placeholder image if news item lacks image)
- El manejo de errores muestra mensaje en contenedor `#news` (Error handling displays message in `#news` container)

Al actualizar noticias (When updating news):
- Mantener manejo de errores con mensajes amigables (Maintain error handling with user-friendly messages)
- Mantener fallback de imagen placeholder (Keep placeholder image fallback)
- No codificar puntos finales de API en otros archivos — centralizar en `script.js` (Don't hardcode API endpoints in other files—centralize in `script.js`)

---

### 5. **Contador Regresivo**

**Countdown Timer** (Contador Regresivo)

Cuenta regresiva de carreras mostrada en la página de inicio.

**Archivo:** [js/contador.js](js/contador.js) (referenciado pero la lógica está en [js/script.js](js/script.js))

**Patrón (Pattern):**
```javascript
const fechaObjetivo = new Date('2025-02-26T08:00:00');
// Actualiza cada 1000ms vía setInterval
// Updates every 1000ms via setInterval
```

Actualizar fecha objetivo en `script.js` antes de cada carrera (Update target date in `script.js` before each race). Los elementos del DOM `#dias`, `#horas`, `#minutos`, `#segundos` requieren formato con relleno de ceros (require zero-padded formatting).

---

## Detalles por Página

### **index.html - Página de Inicio**

**¿Qué hace?**
Página de inicio del sitio. Presenta el contenido principal con un video de presentación de pilotos F1 2025 y un hero section impactante.

**Estructura HTML:**
```html
<header class="hero">                              <!-- Sección principal hero -->
  <h1>Bienvenidos a Formula 1 Fans Global</h1>    <!-- Título principal -->
  <p>Tu fuente número uno...</p>                   <!-- Subtítulo descriptivo -->
  <video src="videos/Presentacion-Pilotos-F1-2025.mp4" 
         autoplay muted playsinline preload="metadata">
  </video>                                         <!-- Video de presentación -->
</header>
```

**Scripts Cargados:**
- `js/menu.js` — Inyección del menú de navegación

**Estilos:**
- `css/menu.css` — Estilos del menú
- `css/index.css` — Estilos específicos de la página

**Notas:**
- Hay código comentado para timeline (línea del tiempo) que se puede descomentar en el futuro
- **IMPORTANTE:** Esta página carga noticias y el contador, pero en la estructura actual solo muestra el video hero. Los elementos `#news`, `#contador` y otras secciones están comentados o no presentes.
- Para una versión completa, descomenta la sección de noticias y contador si lo necesitas

---

### **en-vivo.html - Transmisión en Vivo**

**¿Qué hace?**
Página de transmisión en vivo con un layout de dos columnas: información de la carrera en el lado izquierdo y stream de video + chat en el derecho.

**Estructura Detallada:**

**Columna Izquierda (Sidebar):**
```
├── Event Banner              (🏁 F1 LIVE, nombre evento, subtítulo)
├── Countdown Card            (Cuenta regresiva: días, horas, minutos, segundos)
└── Race Info                 (Ubicación, categoría, detalles de la carrera)
```

**Columna Derecha (Stream Principal):**
```
├── Stream Container          (Video/imágenes + botón de reproducción)
│   ├── pre-image            (Imagen pre-carrera, mostrada por defecto)
│   ├── live-video           (Video HTML5, oculto al inicio)
│   ├── post-image           (Imagen post-carrera, oculta al inicio)
│   └── play-button          (Botón "TRANSMISIÓN EN VIVO" centrado)
└── Chat Section             (Chat en vivo con historial y formulario)
    ├── Chat header          (Título + contador de usuarios en línea)
    ├── Chat messages        (Historial de mensajes)
    └── Chat form            (Input username + input mensaje + botón enviar)
```

**Modal de Opciones de Reproducción:**
```
play-modal (oculto inicialmente)
├── close-modal-btn          (Botón X para cerrar)
└── modal-options
    ├── play-live-btn        (🔴 Ver en Vivo - reproducir desde ahora)
    └── play-from-start-btn  (⏮️ Desde el Inicio - reproducir desde el comienzo)
```

**Scripts Cargados:**
```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>   <!-- Librería HLS -->
<script src="js/hls-config.js" defer></script>                        <!-- Configuración HLS -->
<script src="js/stream.js" defer></script>                            <!-- Control del stream -->
<script src="js/contador.js" defer></script>                          <!-- Contador regresivo -->
<script src="js/chat.js" defer></script>                              <!-- Chat en vivo -->
<script src="js/menu.js" defer></script>                              <!-- Menú de navegación -->
```

**Estilos:**
- `css/menu.css` — Menú
- `css/en-vivo.css` — Estilos de la página en vivo

**Funcionalidad JavaScript:**

1. **stream.js** — Control del reproductor de video
   - Verificación defensiva de elementos DOM antes de asignar event listeners
   - Modal para elegir opciones de reproducción
   - Clases CSS para gestionar estado: `.playing-stream`, `.stream-active`, `.hidden`
   - Manejo de eventos: `play`, `pause`, `ended`
   - Alternar visibilidad de imágenes pre/post según estado del video

2. **contador.js** — Cuenta regresiva
   - Actualiza `#dias`, `#horas`, `#minutos`, `#segundos` cada segundo
   - Cambia el texto cuando la carrera comienza (diferencia ≤ 0)
   - Usa `setInterval(actualizarContador, 1000)`

3. **chat.js** — Sistema de chat local
   - Clase `SimpleChat` que gestiona mensajes con `localStorage`
   - Almacena hasta 50 mensajes en `localStorage['chatMessages']`
   - Username en `localStorage['chatUsername']`
   - Simula usuarios en línea (actualización aleatoria cada 30 segundos)
   - **Limitación:** Chat local solo, no compartido entre dispositivos

**Flujo de Interacción:**
```
Usuario hace click en "TRANSMISIÓN EN VIVO"
    ↓
stream.js abre modal (play-modal)
    ↓
Usuario elige "Ver en Vivo" o "Desde el Inicio"
    ↓
Modal se cierra, video se muestra y reproduce
    ↓
Clase .playing-stream se añade al contenedor
    ↓
Chat aparece (sección con clase .hidden se remueve)
    ↓
Cuando termina el video: muestra post-image, botón vuelve a aparecer
```

**Elementos Clave del CSS:**
- `.playing-stream` — Expande el video al contenedor
- `.stream-active` — Activa el state del stream container
- `.hidden` — Oculta elementos (indicador EN VIVO, chat)
- `.live-badge-top` — Indicador "EN VIVO" flotante con animación pulse

---

### **noticias.html - Página de Noticias**

**¿Qué hace?**
Carga y muestra noticias dinámicas de F1 desde la API de NewsData.io. Las noticias se renderizan como un grid de tarjetas.

**Estructura HTML:**
```html
<header>
  <h1>Últimas Noticias de F1</h1>
</header>
<section id="news">
  <!-- Las noticias se inyectan aquí por JavaScript -->
  Cargando noticias...
</section>
```

**Scripts:**
- `js/noticias.js` — Carga noticias desde API
- `js/menu.js` — Menú de navegación

**Estilos:**
- `css/menu.css` — Menú
- `css/noticias.css` — Grid y tarjetas de noticias

**Funcionalidad (js/noticias.js):**

```javascript
const API_KEY = "pub_67944619781bfef5f895bb18760aa3cf7bf21";
const URL = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=formula1&language=es`;

// En DOMContentLoaded:
// 1. Fetch a la API
// 2. Mapea resultados a HTML (tarjetas)
// 3. Inyecta en #news con innerHTML
// 4. Si error: muestra mensaje en #news
```

**Estructura de Tarjeta de Noticia:**
```html
<div class="noticia">
  <img src="noticia.image_url" alt="título" loading="lazy">
  <h3>Título de la noticia</h3>
  <p>Descripción corta</p>
  <a href="noticia.link" target="_blank">Leer más</a>
</div>
```

**Manejo de Errores:**
- Si la imagen no carga: usa placeholder `https://via.placeholder.com/400`
- Si falla la API: muestra "Hubo un error al cargar las noticias."
- Si no hay resultados: "No hay noticias disponibles por ahora."

**⚠️ Notas Importantes:**
- API key expuesta en frontend (bajo riesgo: free tier, rate-limited)
- NewsData.io retorna máximo 10 noticias por defecto
- Idioma filtrado a español (`language=es`)

---

### **temporadas.html - Calendario de Temporadas**

**¿Qué hace?**
Página histórica que muestra un acordeón de décadas (1950s-2020s) con información sobre cada era de F1. Cada sección expandible contiene carreras de esa décad a.

**Estructura HTML:**

```html
<main class="seasons-page">
  <section class="seasons-hero">
    <!-- Título + descripción + botones de acción -->
    <!-- Cards de estadísticas: 76 temporadas, 1,100+ GPs, 34 campeones -->
  </section>

  <section class="seasons-accordion">
    <!-- Sección de navegación con botones (Ir a 2020s, 2000s, etc.) -->
    
    <div class="era-stack">
      <!-- Era 2020s -->
      <div class="era-section era-moderna">
        <button class="era-toggle" data-decade="2020s">
          <h2>⚡ Años 2020s</h2>
          <p>Energía híbrida, efecto suelo y regulación sostenible</p>
          <span class="toggle-icon">▼</span>
        </button>
        <div class="era-content" id="content-2020s">
          <!-- Grid de carreras de los 2020s -->
          <div class="calendario-grid" id="grid-2020s"></div>
        </div>
      </div>
      
      <!-- Más eras (2010s, 2000s, 1990s, 1980s, 1970s, 1960s, 1950s) -->
    </div>
  </section>
</main>
```

**Scripts:**
- JavaScript inline en la página para gestionar acordeón
- Cargas dinámicas de carreras por década (expandible)

**Funcionalidad:**
- Botones `.era-toggle` expanden/contraen secciones
- Grid de carreras cargado dinámicamente según era seleccionada
- Cada carrera muestra: nombre, fecha e imagen del circuito

**Estilos:**
- `css/menu.css` — Menú
- `css/calendario.css` — Acordeón, grid, tarjetas de carreras

---

### **calendario_temporada.html - Calendario de Temporada Específica**

**¿Qué hace?**
Muestra todas las carreras de una temporada específica (ej: 2024, 2025) en un grid. Se puede acceder con parámetro `?year=YYYY`.

**Estructura HTML:**
```html
<section id="calendario_temporada">
  <h2 id="titulo-temporada"></h2>  <!-- Se llena dinámicamente "Temporada 2025" -->
  <div class="calendario-grid" id="carreras-grid">
    <!-- Se inyectan las tarjetas de carreras aquí -->
  </div>
</section>
```

**Datos Internos (JavaScript inline):**
```javascript
const carrerasPorTemporada = {
  "2025": [
    { nombre: "Gran Premio de Bahrein", fecha: "28 Feb - 2 Mar", imagen: "img/f1moderno.jpg" },
    { nombre: "Gran Premio de Arabia Saudita", fecha: "9 - 11 Mar", imagen: "img/f1moderno.jpg" },
    // ... 23 más hasta Abu Dhabi
  ],
  "2024": [
    { nombre: "Gran Premio de Bahrein", fecha: "29 Feb - 2 Mar", imagen: "img/Calendario/2024/Bahrain-2024.jpg" },
    // ... 23 más
  ],
  // Más años...
}
```

**Funcionalidad:**
1. Lee parámetro `?year=XXXX` de la URL
2. Si no hay parámetro, muestra 2025 por defecto
3. Busca carreras en `carrerasPorTemporada[año]`
4. Crea grid HTML con tarjetas de carreras
5. Cada tarjeta es clickeable → navega a `video_gp.html?gp=nombre`

**Estilos:**
- `css/menu.css` — Menú
- `css/calendario.css` — Grid de carreras

---

### **video_gp.html - Videos de Gran Premios**

**¿Qué hace?**
Reproduce video de un Gran Premio específico. Se accede con parámetro `?gp=2024_gran_premio_de_australia` (ejemplo).

**Estructura HTML:**
```html
<div class="video-container">
  <div class="video-titulo" id="video-titulo"></div>
  <video id="video-gp" class="video-estilo" 
         controls playsinline preload="metadata" 
         poster="img/Calendario/2024/T2024.avif">
  </video>
</div>
```

**Datos Internos (JavaScript inline):**
```javascript
const videosPorGP = {
  "2024_gran_premio_de_bahrein": {
    src: "videos/Presentacion-Pilotos-F1-2025.mp4",
    titulo: "Gran Premio de Bahréin 2024"
  },
  "2024_gran_premio_de_australia": {
    src: "", // Vacío si no hay video aún
    titulo: "Gran Premio de Australia 2024"
  },
  // ... más GPs
}
```

**Funcionalidad:**
1. Lee parámetro `?gp=ID` de la URL
2. Busca en `videosPorGP[ID]`
3. Si `src` está vacío: muestra video vacío (no reproduce)
4. Si `src` tiene contenido: carga y permite reproducción
5. Muestra título en `#video-titulo`

**Estilos:**
- `css/menu.css` — Menú
- `css/video-gp.css` — Contenedor y responsive del video
- Inline styles para max-width, altura, sombras

**Notas:**
- Video es responsive: `max-width: 1280px` en desktop
- En mobile: `max-width: 100vw` y altura automática
- Poster (imagen de portada) es `T2024.avif`

---

### **tienda.html - Tienda de Mercancía**

**¿Qué hace?**
Tienda de mercancía de F1 con sistema de filtros, búsqueda y ordenamiento. Estructura preparada para integración con datos dinámicos o Mercado Libre.

**Estructura HTML:**

```html
<header class="shop-hero">
  <h1>Tienda F1 Fans Global</h1>
  <p>Ropa, gorras y accesorios inspirados en la Fórmula 1</p>
</header>

<section class="shop-controls">
  <!-- Controles principales: filtro, búsqueda, ordenamiento -->
  <div class="controls-left">
    <div class="filter-dropdown">
      <button class="filter-btn" aria-haspopup="true">Filtro ▼</button>
      <div class="filter-menu">
        <!-- Opciones: Todas, Ropa, Gorras, Accesorios, Coleccionables, Posters, Miniaturas -->
      </div>
    </div>
  </div>
  <div class="controls-right">
    <input class="search-input" placeholder="Buscar producto…">
    <select class="sort-select">
      <!-- Opciones: Relevancia, Precio ↑↓, Novedades -->
    </select>
    <label class="source-toggle">
      <input type="checkbox" id="ml-source-toggle">
      <span>Mercado Libre</span>
    </label>
  </div>
</section>

<section class="shop-subcontrols">
  <!-- Filtros secundarios: equipos, rango de precio -->
  <div class="chip-group" id="chip-equipos">
    <!-- Chips: Ferrari, Red Bull, Mercedes, McLaren -->
  </div>
  <div>
    <input type="range" id="price-range" min="0" max="5000" step="100">
    <span id="price-label">Hasta $5,000</span>
  </div>
</section>

<main class="shop-main">
  <section class="featured-banner">
    <!-- Promoción destacada -->
  </section>
  <!-- Grid de productos se inyectaría aquí -->
</main>
```

**Scripts:**
- `js/tienda.js` — Gestión de filtros, búsqueda, ordenamiento
- `js/menu.js` — Menú

**Estilos:**
- `css/menu.css` — Menú
- `css/tienda.css` — Grid, filtros, tarjetas de productos

**Controles Interactivos:**

| Control | ID | Tipo | Función |
|---------|-----|------|----------|
| Filtro de categoría | `filter-dropdown` | Dropdown | Filtra por: Ropa, Gorras, Accesorios, Coleccionables, Posters, Miniaturas |
| Búsqueda | `search-input` | Input text | Filtra productos por nombre/descripción |
| Ordenamiento | `sort-select` | Select | Ordena por: Relevancia, Precio ↑, Precio ↓, Novedades |
| Toggle Mercado Libre | `ml-source-toggle` | Checkbox | Alterna entre catálogo propio y Mercado Libre |
| Chips de equipos | `chip-equipos` | Buttons | Filtra por equipo: Ferrari, Red Bull, Mercedes, McLaren |
| Rango de precio | `price-range` | Range slider | Filtra por precio máximo (0-5000) |

**Funcionalidad Esperada (no completamente implementada):**
- Al hacer click en un chip de equipo, el producto debe marcarse como seleccionado
- El rango de precio debe actualizar `#price-label` en tiempo real
- Los filtros deben combinarse (ej: equipo + precio + búsqueda)
- Toggle de Mercado Libre cargaría productos de una API externa

**Notas:**
- Estructura y CSS están listos, pero la lógica completa de JavaScript está en `tienda.js`
- Preparada para integración con Mercado Libre API en el futuro

---

### **menu.html - Componente Reutilizable**

**¿Qué hace?**
Componente de navegación que se inyecta dinámicamente en todas las páginas via `js/menu.js`.

**Estructura HTML:**
```html
<nav class="site-nav">
  <div class="nav-brand">
    <!-- Logo o nombre de sitio -->
  </div>
  <div class="nav-links">
    <a href="index.html">Inicio</a>
    <a href="en-vivo.html">En Vivo</a>
    <a href="noticias.html">Noticias</a>
    <a href="temporadas.html">Temporadas</a>
    <a href="calendario_temporada.html">Calendario</a>
    <a href="video_gp.html">Videos</a>
    <a href="tienda.html">Tienda</a>
  </div>
</nav>
```

**Inyección (js/menu.js):**
```javascript
fetch('menu.html')
  .then(response => response.text())
  .then(html => {
    const container = document.getElementById('nav-container');
    if (container) {
      container.innerHTML = html;
    } else {
      document.body.insertAdjacentHTML('afterbegin', html);
    }
    
    // Marcar enlace activo según pathname
    const links = document.querySelectorAll('nav.site-nav .nav-links a');
    const current = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      if (a.getAttribute('href') === current) {
        a.setAttribute('aria-current', 'page');
        a.classList.add('is-active');
      }
    });
  });
```

**Detección de Enlace Activo:**
- Compara el `href` de cada link con el último segmento del `pathname`
- Si coincide: añade `aria-current="page"` + clase `is-active`
- Ejemplo: En `en-vivo.html`, el link `<a href="en-vivo.html">` se marca como activo

**Estilos:**
- `css/menu.css` — Estilos del menú, hover, active state

---

### **prueba.html - Página de Prueba/Desarrollo**

**¿Qué hace?**
Página de desarrollo/testing. Usada para prototipar nuevas características o hacer pruebas rápidas sin afectar otras páginas.

---

## Organización de Archivos

## Organización de Archivos

### Estructura General
```
web/
├── index.html                          # Página de inicio
├── en-vivo.html                        # Transmisión en vivo + chat
├── noticias.html                       # Feed de noticias de API
├── temporadas.html                     # Archivo histórico de eras F1
├── calendario_temporada.html           # Carreras de una temporada específica
├── video_gp.html                       # Reproductor de videos por GP
├── tienda.html                         # Tienda de mercancía
├── menu.html                           # Componente menú (reutilizable)
├── prueba.html                         # Página de desarrollo/testing
├── manifest.webmanifest                # Manifiesto PWA
├── README.md                           # Documentación del proyecto
│
├── css/
│   ├── menu.css                        # Estilos del menú (cargado en TODAS las páginas)
│   ├── index.css                       # Estilos específicos de index.html
│   ├── en-vivo.css                     # Estilos de en-vivo.html (stream, chat, modal)
│   ├── noticias.css                    # Estilos del grid de noticias
│   ├── calendario.css                  # Estilos del acordeón y grid de carreras
│   ├── tienda.css                      # Estilos de la tienda
│   ├── video-gp.css                    # Estilos del reproductor de video
│   └── style.css                       # Estilos base globales (opcional)
│
├── js/
│   ├── menu.js                         # Inyección del menú + detección de enlace activo
│   ├── script.js                       # Noticias + countdown (usado en index.html, aunque comentado)
│   ├── noticias.js                     # Carga noticias desde API NewsData.io
│   ├── stream.js                       # Control del video en vivo (modal, play, pause, etc.)
│   ├── en-vivo.js                      # Control alternativo del stream (puede haber duplicidad)
│   ├── chat.js                         # Clase SimpleChat para chat local con localStorage
│   ├── contador.js                     # Contador regresivo para carreras
│   ├── hls-config.js                   # Configuración de HLS (si se usa streaming HLS)
│   ├── tienda.js                       # Lógica de filtros, búsqueda, ordenamiento
│   ├── carousel_container.js           # Carrusel reutilizable (si se usa)
│   ├── timeline.js                     # Línea del tiempo (si se usa)
│   └── noticias.js                     # Carga dinámica de noticias
│
├── img/
│   ├── favicon.ico                     # Ícono de pestaña
│   ├── Formula-1-Fans-Global3.jpg      # Logo/icono PWA
│   ├── f1moderno.jpg                   # Imagen placeholder para carreras
│   ├── Pilotos-f1-2025.jpg             # Foto para poster de stream
│   ├── Calendario/
│   │   ├── 2024/
│   │   │   ├── Australia-2024.avif     # Imagen del circuito de Australia
│   │   │   ├── Bahrain-2024.jpg
│   │   │   └── T2024.avif              # Imagen de carátula 2024
│   │   └── 2025/
│   │       └── (imágenes por circuito)
│   ├── Circuitos-Live/
│   │   ├── Italy_carrera.avif          # Circuito Italia
│   │   └── Paises-Bajos.PNG            # Circuito Países Bajos
│   └── linea-de-tiempo/
│       └── (imágenes para timeline)
│
├── videos/
│   └── Presentacion-Pilotos-F1-2025.mp4  # Video de presentación de pilotos
│
├── docs/
│   ├── STREAMING_SETUP.md              # Documentación de setup de streaming
│   ├── STREAMING_MEDIAMTX_SETUP.md     # Configuración con MediaMTX
│   └── costo de cobro por carrera transmision.txt
│
├── .github/
│   └── copilot-instructions.md         # Este archivo (instrucciones para IA)
│
├── .git/                               # Repositorio Git
└── .gitignore                          # Archivos ignorados por Git
```

### Convención de Nombres

**Páginas HTML:**
- minúsculas con guion bajo para separar palabras: `calendario_temporada.html`
- Archivo principal: `index.html`

**Estilos CSS:**
- Archivo por página: `nombrePágina.css` (ej: `en-vivo.css` para `en-vivo.html`)
- Estilos reutilizables: `menu.css` (cargado en TODAS las páginas)
- Base global: `style.css` (opcional)

**Scripts JavaScript:**
- Nombrados por funcionalidad: `stream.js`, `chat.js`, `menu.js`
- Convención: camelCase o guion bajo
- Archivo por característica principal

**Imágenes:**
- Carpetas organizadas por uso: `/Calendario/`, `/Circuitos-Live/`, `/linea-de-tiempo/`
- Nombradas descriptivamente: `Australia-2024.avif`, `Bahrain-2024.jpg`
- Preferencia de formato: AVIF > JPEG (AVIF es más eficiente)
- Año incluido en nombre cuando corresponde: `T2024.avif`

---

## Patrones de Codificación & Convenciones

### 1. **Inyección Dinámica de Menú (Pattern Reutilizable)**

**Dynamic Menu Injection Pattern** (Patrón Reutilizable)

Todas las páginas usan el mismo menú inyectado dinámicamente:

**En HTML:**
```html
<div id="nav-container"></div>  <!-- Placeholder donde se inyecta el menú -->
<script src="js/menu.js" defer></script>
```

**En js/menu.js:**
```javascript
fetch('menu.html')
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.text();
    })
    .then(html => {
        const container = document.getElementById('nav-container');
        if (container) {
            container.innerHTML = html;
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }
        
        // Marcar enlace activo según URL actual
        const links = document.querySelectorAll('nav.site-nav .nav-links a');
        const current = window.location.pathname.split('/').pop() || 'index.html';
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (href && current === href) {
                a.setAttribute('aria-current', 'page');
                a.classList.add('is-active');
            }
        });
    })
    .catch(error => console.error('Error cargando el menú:', error));
```

**Ventajas (Advantages):**
- DRY (Don't Repeat Yourself): Un solo menú para todas las páginas
- Fácil mantenimiento: Actualizar menú en un solo lugar
- Detección automática de página activa

---

### 2. **Fetching de API Externas (Noticias)**

**Fetching External APIs Pattern** (Patrón para cargar datos dinámicos desde API)

Patrón para cargar datos dinámicos desde API:

**En js/noticias.js:**
```javascript
const API_KEY = "pub_67944619781bfef5f895bb18760aa3cf7bf21";
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
        
        const html = resultados.map(noticia => `
            <div class="noticia">
                <img src="${noticia.image_url || 'https://via.placeholder.com/400'}" alt="${noticia.title}" loading="lazy">
                <h3>${noticia.title}</h3>
                <p>${noticia.description || 'Sin descripción'}</p>
                <a href="${noticia.link}" target="_blank" rel="noopener noreferrer">Leer más</a>
            </div>
        `).join('');
        
        contenedor.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        const contenedor = document.getElementById("news");
        if (contenedor) contenedor.textContent = 'Hubo un error al cargar las noticias.';
    }
}

document.addEventListener("DOMContentLoaded", cargarNoticias);
```

**Patrones Clave (Key Patterns):**
- Error handling con try/catch
- Validación de respuesta con `response.ok` (Response validation)
- Fallback para imágenes faltantes: `||  'https://via.placeholder.com/400'` (Fallback for missing images)
- `loading="lazy"` para optimización (Image optimization)
- `rel="noopener noreferrer"` para links externos (Security for external links)

---

### 3. **Gestión de Estado con CSS Classes**

**State Management with CSS Classes** (Gestión de Estado con Clases CSS)

En lugar de manipular estilos inline, se usan clases CSS:

**En HTML/stream.js:**
```javascript
// ❌ EVITAR (inline styles)
liveVideo.style.display = 'block';

// ✅ PREFERIR (CSS classes)
streamContainer.classList.add('playing-stream');
streamContainer.classList.add('stream-active');
liveIndicator.classList.add('hidden');
```

**En CSS:**
```css
.hidden { display: none; }
.playing-stream { width: 100%; height: auto; }
.stream-active { border: 2px solid #FF1E00; }
```

**Ventajas (Advantages):**
- Separación clara entre lógica y presentación (Clear separation of concerns)
- Fácil cambiar estilos sin tocar JavaScript (Easy style changes)
- Mejor rendimiento (batching de cambios) (Better performance - batch changes)

---

### 4. **Verificación Defensiva de Elementos DOM**

**Defensive DOM Element Checking** (Verificación Defensiva de Elementos)

Antes de asignar event listeners, verificar existencia:

**En stream.js:**
```javascript
const liveButton = document.getElementById('live-button');
const video = document.getElementById('live-video');
const preImage = document.getElementById('pre-image');

// Verificar que elementos críticos existan
if (!liveButton || !video || !preImage) {
    console.warn('Stream: elementos requeridos no encontrados, se omiten listeners.');
} else {
    // Asignar listeners solo si existen
    liveButton.addEventListener('click', function() {
        // ... lógica
    });
}
```

**Por qué (Why):**
- Permite cargar el mismo script en múltiples páginas sin errores (Load same script on multiple pages)
- Graceful degradation si falta HTML (Graceful degradation if HTML is missing)

---

### 5. **Clase SimpleChat (localStorage)**

**SimpleChat Class Pattern** (Patrón de Clase SimpleChat)

Patrón para manejo de estado local:

**En chat.js:**
```javascript
class SimpleChat {
    constructor() {
        this.messages = [];
        this.maxMessages = 50;
        this.form = document.getElementById('chat-form');
        this.init();
    }
    
    init() {
        this.loadMessages();
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
    }
    
    loadMessages() {
        const saved = localStorage.getItem('chatMessages');
        if (saved) {
            try {
                this.messages = JSON.parse(saved);
                this.renderMessages();
            } catch (e) {
                console.error('Error cargando mensajes:', e);
            }
        }
    }
    
    saveMessages() {
        localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    }
    
    // ... más métodos
}
```

**Características:**
- Encapsulación en clase (Class encapsulation)
- Persistencia con localStorage (localStorage persistence)
- Límite de mensajes (máx 50) (Message limit - max 50)
- Try/catch para JSON parsing (Try/catch for JSON parsing)

---

### 6. **Contador Regresivo (Interval-based)**

**Countdown Timer Pattern** (Patrón de Contador Regresivo)

Actualizar UI cada segundo:

**En script.js:**
```javascript
const fechaObjetivo = new Date('2025-02-26T08:00:00');

function actualizarContador() {
    const ahora = new Date();
    const diferencia = fechaObjetivo - ahora;
    
    if (diferencia > 0) {
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
        
        // Padding a 2 dígitos
        document.getElementById('dias').textContent = dias.toString().padStart(2, '0');
        document.getElementById('horas').textContent = horas.toString().padStart(2, '0');
        document.getElementById('minutos').textContent = minutos.toString().padStart(2, '0');
        document.getElementById('segundos').textContent = segundos.toString().padStart(2, '0');
    } else {
        document.getElementById('contador').innerHTML = '<h2>¡La carrera ha comenzado!</h2>';
    }
}

setInterval(actualizarContador, 1000);
```

**Notas:**
- `padStart(2, '0')` para formato "00:00:00"
- Actualización cada 1000ms (1 segundo) (Update every 1000ms - 1 second)
- Condición final cuando diferencia ≤ 0 (Final condition when difference ≤ 0)

---

### 7. **Modal Pattern (Stream)**

**Modal Pattern** (Patrón de Modal para Stream)

Patrón para diálogos modales:

**HTML:**
```html
<div id="play-modal" class="modal-overlay hidden" role="dialog" aria-modal="true">
    <div class="modal-box">
        <button id="close-modal-btn" aria-label="Cerrar">✕</button>
        <div class="modal-options">
            <button id="play-live-btn" class="option-card">
                <span class="option-icon">🔴</span>
                <h3>Ver en Vivo</h3>
            </button>
            <button id="play-from-start-btn" class="option-card">
                <span class="option-icon">⏮️</span>
                <h3>Desde el Inicio</h3>
            </button>
        </div>
    </div>
</div>
```

**JavaScript (stream.js):**
```javascript
const liveButton = document.getElementById('live-button');
const playModal = document.getElementById('play-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

liveButton.addEventListener('click', () => {
    playModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    playModal.classList.add('hidden');
});

// Cerrar al clickear fuera del modal
playModal.addEventListener('click', (e) => {
    if (e.target === playModal) {
        playModal.classList.add('hidden');
    }
});
```

**CSS:**
```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-overlay.hidden {
    display: none;
}
```

---

## Convenciones de Performance & PWA

### Script Loading
- **Siempre usar `defer`** para no bloquear el rendering (to avoid render-blocking):
  ```html
  <script src="js/menu.js" defer></script>
  ```
- Excepciones: async scripts para Google Analytics/AdSense

### Image Optimization
- Usar `loading="lazy"` para imágenes below-the-fold (below-fold images)
- Preferir AVIF > JPEG (mejor compresión) (better compression)
- Incluir `alt` descriptivo siempre
- Ejemplo:
  ```html
  <img src="img/Calendario/2024/Australia-2024.avif" 
       alt="Circuito de Australia 2024" 
       loading="lazy">
  ```

### Video Handling
- **Siempre incluir:**
  - `autoplay` — Permitir reproducción automática (Allow autoplay)
  - `muted` — Necesario para autoplay en navegadores modernos (Required for autoplay in modern browsers)
  - `playsinline` — Reproducción en mobile sin fullscreen (Mobile playback without fullscreen)
  - `preload="metadata"` — Cargar solo metadatos, no video (Load metadata only, not video)
  - `poster` — Imagen de portada (Cover image)
  
```html
<video autoplay muted playsinline preload="metadata" 
       poster="img/poster.jpg">
    <source src="videos/video.mp4" type="video/mp4">
    Tu navegador no soporta el elemento de video.
</video>
```

### PWA Manifest
- **Archivo:** `manifest.webmanifest`
- **Colores:** Tema oscuro `#121212` (fondo), `#FF1E00` (F1 rojo)
- **Icons:**
  - 48x48 (favicon)
  - 192x192 (home screen)
  - 512x512 (splash screen)
- **Display:** "standalone" (parece app nativa) (appears as native app)
- **Start URL:** `/index.html`

---

## Flujo de Desarrollo Local & Despliegue

### Testing Local (Windows PowerShell)
```powershell
Push-Location .\web
python -m http.server 8080
# Abre http://localhost:8080
Pop-Location
```

### Despliegue en GitHub Pages
1. Asegurar que existe rama `main` y `origin` apunta a GitHub
2. Preparar cambios:
   ```bash
   git add -A
   git commit -m "Descripción del cambio"
   git push origin main
   ```
3. En GitHub → Settings → Pages:
   - Source: "Deploy from a branch"
   - Branch: `main`
   - Folder: `/root` (NO `/docs/`)
4. URL pública aparecerá en sección Pages

### Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| Imágenes faltantes (404) | Rutas incorrectas | Verificar ruta en `index.html`: `img/nombre.jpg` |
| Links rotos | Nombre de archivo incorrecto | En `menu.html`, asegurar `href` coincida exactamente con nombre HTML |
| Menú no inyectado | `menu.html` no encuentra | Verificar que `menu.html` esté en root, no en subcarpeta |
| Video no reproduce | Codec no soportado | Usar MP4 H.264, no formatos obscuros |
| Chat vacío | localStorage deshabilitado | En modo incógnito, localStorage no persiste |

---

## Convenciones de Lenguaje

- **UI/UX:** Siempre en español
- **Comentarios:** Español o inglés (coherencia en archivo)
- **Errores console:** `console.error('Descripción del error:', error)`
- **Fechas en código:** Formato `YYYY-MM-DD` (ISO)
- **Fechas en UI:** Formato `DD/MM/YYYY` o `DD MMM YYYY`

---

## Puntos Comunes de Modificación

### Agregar una Página Nueva
1. Crear `nueva-pagina.html` con estructura base:
   ```html
   <!DOCTYPE html>
   <html lang="es">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Mi Nueva Página</title>
       <link rel="stylesheet" href="css/menu.css">
       <link rel="stylesheet" href="css/nueva-pagina.css">
   </head>
   <body>
       <div id="nav-container"></div>
       <main>
           <!-- Contenido aquí -->
       </main>
       <script src="js/menu.js" defer></script>
   </body>
   </html>
   ```

2. Agregar ruta en `menu.html`:
   ```html
   <a href="nueva-pagina.html">Nueva Página</a>
   ```

3. Crear `css/nueva-pagina.css` con estilos específicos

### Actualizar Información de Carreras
- **Fecha countdown:** Editar `fechaObjetivo` en `js/script.js` o `js/contador.js`
- **Calendario:** Actualizar objeto `carrerasPorTemporada` en `calendario_temporada.html`
- **Stream URL:** Modificar `src` del `<video>` en `en-vivo.html`

### Extender Funcionalidad del Chat
- Modificar clase `SimpleChat` en `js/chat.js`
- Para multi-usuario real-time: necesita backend (Firebase, Node.js)
- Actualmente es single-user simulado con localStorage

### Integrar Mercado Libre
- En `tienda.html`, existe checkbox `#ml-source-toggle`
- En `js/tienda.js`, agregar fetch a API de Mercado Libre
- Filtros existentes: categoría, equipo, precio, búsqueda

---

## Restricciones Técnicas & Decisiones de Arquitectura

| Aspecto | Enfoque | Razón |
|--------|---------|-------|
| **Backend** | Sin backend (sitio estático) | GitHub Pages es gratis, sin mantenimiento, deployment simple (GitHub Pages is free, no maintenance, simple deployment) |
| **Framework** | JavaScript vanilla + CSS puro | Sin dependencias, carga rápida, control total (No dependencies, fast load times, full control) |
| **State Management** | localStorage + clases CSS | No requiere build step, funciona offline (No build step, works offline) |
| **Estilos** | CSS por página (scoped) | Evita conflictos, fácil mantenimiento (Avoid conflicts, easy to maintain) |
| **Streaming** | HTML5 `<video>` + HLS opcional | Soporte nativo de navegadores, sin plugins (Native browser support, no plugins) |
| **Chat** | localStorage (single-user) | Simple de implementar; upgrade a Firebase para real-time (Simple to implement; upgrade to Firebase for real-time) |
| **Idioma** | Español (UI), soporte EN posible | Audiencia principal: aficionados hispanohablantes (Primary audience: Spanish-speaking F1 fans) |
| **PWA** | Manifest + Service Worker ready | Instalable en mobile, funciona offline (Installable on mobile, works offline) |

---

## Referencias para Agentes IA

- **Lógica de Stream:** Comparar `stream.js` vs `en-vivo.js` para entender patrones alternativos (Compare to understand alternative patterns)
- **Contenido Dinámico:** Analizar patrón en `noticias.js` (fetch → parse JSON → render HTML)
- **Manejo de Errores:** Ver cómo `menu.js` y `chat.js` manejan fallos gracefully (See how they handle failures gracefully)
- **Mobile-First:** Verificar media queries en `en-vivo.css` y `calendario.css` (Check media queries)
- **Accesibilidad:** Notar uso de `aria-*` attributes en elementos interactivos (Note ARIA attributes usage)
