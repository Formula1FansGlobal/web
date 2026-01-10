# 🧪 Guía de Testing - Mejora 3: Interfaz & UX

## Verificación Rápida

Después de implementar los cambios, sigue estos pasos para verificar que todo funciona:

---

## 1. Dark/Light Mode Toggle ☀️🌙

### ¿Dónde está?
**Ubicación:** Botón en la esquina superior derecha del menú de navegación

### ¿Cómo probarlo?

1. **Abre cualquier página del sitio**
   - index.html, noticias.html, en-vivo.html, etc.

2. **Observa el tema actual:**
   - Por defecto: Fondo oscuro (#1a1a1a), texto claro
   - Fondo claro: #f5f5f5, texto oscuro (#333)

3. **Haz click en el botón:**
   - Si estás en modo oscuro: verás ☀️
   - Si estás en modo claro: verás 🌙

4. **Verifica el cambio:**
   - Colores invierten inmediatamente
   - Menu, footer, breadcrumbs, notificaciones todos cambian
   - No hay recarga de página (es instantáneo)

5. **Persistencia:**
   - Recarga la página (F5)
   - El tema seleccionado se mantiene
   - Esto se guarda en `localStorage['f1_theme']`

### Valores esperados
```
localStorage['f1_theme'] = 'dark'  // o 'light'
<html data-theme="dark">           // o 'light'
```

### CSS que debería aplicarse
```css
/* Dark Mode (por defecto) */
nav.site-nav { background-color: #1a1a1a; }

/* Light Mode */
[data-theme="light"] nav.site-nav { background-color: #f5f5f5; }
```

---

## 2. Sistema de Notificaciones Toast 🔔

### ¿Dónde se muestran?
**Ubicación:** Esquina superior derecha de la pantalla, debajo del menú

### ¿Cómo probarlo?

#### Opción A: Suscripción a Newsletter
1. **Scroll al footer** (pie de página)
2. **Sección "Newsletter"** - Ingresa tu email
3. **Click "Suscribir"**
   - Email válido (ej: test@example.com) → **Notificación verde con ✓** "¡Gracias por suscribirse! 🎉"
   - Email inválido (ej: invalido) → **Notificación roja con ✕** "Por favor ingresa un email válido"

#### Opción B: Cambio de Tema
1. **Click en botón ☀️🌙 del menú**
2. **Notificación azul con ℹ:** "🌙 Modo oscuro activado" o "☀️ Modo claro activado"

### Características observables

| Característica | Comportamiento |
|---|---|
| **Duración** | Desaparece automáticamente después de 3 segundos |
| **Cierre manual** | Click en botón × de la notificación |
| **Animación** | Slide-in desde arriba a la derecha (0.3s) |
| **Tipos** | success (verde), error (rojo), info (azul), warning (naranja) |
| **Icono** | ✓, ✕, ℹ, ⚠ según tipo |
| **Responsive** | 100% ancho en mobile, max-width 400px en desktop |

### CSS aplicado
```css
.notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
}

.notification-success { border-left: 4px solid #4caf50; }  /* Verde */
.notification-error   { border-left: 4px solid #f44336; }  /* Rojo */
.notification-info    { border-left: 4px solid #2196f3; }  /* Azul */
.notification-warning { border-left: 4px solid #ff9800; }  /* Naranja */
```

---

## 3. Footer Component 🦶

### ¿Dónde está?
**Ubicación:** Al final de cada página (antes de cierre de body)

### Contenido visible

1. **Sobre Nosotros** - Descripción de F1 Fans Global
2. **Navegación** - Links a todas las páginas:
   - 🏠 Inicio
   - 📰 Noticias
   - 📺 En Vivo
   - 📅 Calendario
   - 📚 Temporadas

3. **Categorías** - Links adicionales:
   - 🎥 Videos de GPs
   - 🛍️ Tienda
   - 📧 Contacto
   - 🔒 Privacidad
   - ⚖️ Términos

4. **Newsletter** - Formulario de suscripción

5. **Síguenos** - Links a redes:
   - 𝕏 Twitter
   - 📷 Instagram
   - f Facebook
   - ▶️ YouTube

### Footer Bottom
- Copyright © 2025
- Links legales (Privacidad, Cookies, Términos, Contacto)
- Disclaimer sobre derechos de F1

### ¿Cómo probarlo?

1. **Visibilidad:**
   - Scroll al final de cualquier página
   - Footer debe ser visible en todas las páginas

2. **Newsletter:**
   - Email válido (test@example.com) → Suscripción exitosa
   - Email inválido (test) → Error
   - Datos guardados en `localStorage['f1_subscribers']`

3. **Links:**
   - Todos los links deben ser navegables
   - Href correctos a otras páginas

4. **Tema:**
   - Dark mode: Fondo #1a1a1a, texto #e0e0e0
   - Light mode: Fondo #f5f5f5, texto #333
   - Borde superior rojo #FF1E00

5. **Responsive:**
   - Desktop: 5-6 columnas
   - Tablet: 3 columnas
   - Mobile: 1 columna (stack vertical)

### localStorage
```javascript
// Después de suscribir
localStorage.getItem('f1_subscribers')
// ["test@example.com", "otro@email.com"]
```

---

## 4. Breadcrumb Navigation 🗺️

### ¿Dónde está?
**Ubicación:** Directamente debajo del menú de navegación, antes del contenido principal

### Rutas por página

| Página | Breadcrumb |
|---|---|
| index.html | 🏠 Inicio |
| noticias.html | 🏠 Inicio / 📰 Noticias |
| en-vivo.html | 🏠 Inicio / 📺 En Vivo |
| calendario_temporada.html | 🏠 Inicio / 📅 Calendario |
| temporadas.html | 🏠 Inicio / 📚 Temporadas |
| video_gp.html | 🏠 Inicio / 🎥 Videos |
| tienda.html | 🏠 Inicio / 🛍️ Tienda |

### Con Parámetros de Query

| URL | Breadcrumb |
|---|---|
| `calendario_temporada.html?year=2025` | 🏠 Inicio / 📅 Calendario / Temporada 2025 |
| `video_gp.html?gp=2024_gran_premio_australiano` | 🏠 Inicio / 🎥 Videos / Gran premio australiano |

### ¿Cómo probarlo?

1. **Navega a diferentes páginas**
   - El breadcrumb debe actualizar automáticamente

2. **Verifica los links**
   - Click en 🏠 Inicio → vuelve a index.html
   - Los links anteriores deben ser navegables

3. **Página actual**
   - El último elemento NO es un link (es plain text)
   - Tiene atributo `aria-current="page"`

4. **Parámetros de query**
   - En calendario_temporada.html?year=2025 → aparece "Temporada 2025"
   - En video_gp.html?gp=2024_gran_premio_australiano → aparece el nombre del GP

5. **Responsive**
   - Desktop: Muestra todas las rutas
   - Mobile: Solo muestra elemento actual y home
   - Ejemplo en mobile: "🏠 / 📰 Noticias"

### CSS Aplicado
```css
.breadcrumbs {
    background-color: #1a1a1a;
    border-bottom: 1px solid #404040;
    padding: 12px 20px;
}

.breadcrumb-item a:hover {
    color: #FF1E00;
    background-color: rgba(255, 30, 0, 0.1);
}

.breadcrumb-item.current {
    color: #FF1E00;
    font-weight: 600;
}

/* Mobile */
@media (max-width: 480px) {
    .breadcrumb-item:not(.current):not(.breadcrumb-separator) {
        display: none;  /* Oculta items intermedios */
    }
}
```

---

## Verificación Completa - Checklist

### ✓ Dark/Light Mode
- [ ] Botón ☀️🌙 visible en menú
- [ ] Click cambia tema instantáneamente
- [ ] Tema persiste después de recargar
- [ ] Todos los componentes cambian de color
- [ ] localStorage['f1_theme'] se actualiza

### ✓ Notificaciones
- [ ] Notificación al cambiar tema
- [ ] Notificación al suscribirse (éxito/error)
- [ ] Auto-cierre después de 3 segundos
- [ ] Botón × cierra manualmente
- [ ] Animación slide-in/out visible
- [ ] Color según tipo (success=verde, error=rojo, etc.)

### ✓ Footer
- [ ] Visible en todas las páginas
- [ ] 5 secciones principales
- [ ] Newsletter form funciona
- [ ] Email inválido muestra error
- [ ] Email válido muestra éxito
- [ ] Links navegables
- [ ] Redes sociales con emojis
- [ ] Copyright y disclaimer visible
- [ ] Responsivo en mobile

### ✓ Breadcrumbs
- [ ] Visible debajo del menú
- [ ] Actualiza según página actual
- [ ] Iconos emoji correctos
- [ ] Links navegables (excepto elemento actual)
- [ ] En mobile: solo muestra ruta actual
- [ ] Con ?year= en calendario: muestra año
- [ ] Con ?gp= en videos: muestra nombre GP

---

## Uso en Código

### Para desarrolladores - Cómo usar en tu código:

#### Notificaciones
```javascript
// Éxito
window.showNotification('Operación completada', 'success');

// Error
window.showNotification('Error al cargar', 'error');

// Info
window.showNotification('Información importante', 'info');

// Advertencia
window.showNotification('Revisa esto', 'warning');

// Con duración personalizada
window.showNotification('Mensaje rápido', 'info', 1500);
```

#### Tema
```javascript
// Obtener tema actual
const tema = localStorage.getItem('f1_theme') || 'dark';

// El HTML ya tiene data-theme attribute:
// <html data-theme="dark">

// CSS responde automáticamente
[data-theme="light"] .miClase { color: #333; }
```

#### Breadcrumbs (automático)
```javascript
// Los breadcrumbs se generan automáticamente
// basándose en window.location.pathname
// No necesitas hacer nada extra

// Pero si necesitas agregar una página:
// 1. Crear nueva página (ej: nueva.html)
// 2. Agregar a menu.html
// 3. BreadcrumbManager.pageMap tendrá que incluir:
const pageMap = {
    'nueva.html': { name: 'Nueva', icon: '🆕' }
};
```

---

## Reportar Problemas

Si algo no funciona como se espera:

1. **Abre consola (F12)**
   - Busca errores en "Console"

2. **Verifica localStorage**
   - `localStorage.getItem('f1_theme')`
   - `localStorage.getItem('f1_subscribers')`

3. **Limpia caché**
   - Ctrl+Shift+Delete (Windows)
   - Cmd+Shift+Delete (Mac)
   - O abre página en incógnito

4. **Verifica que cargó footer.html**
   - Network tab (F12)
   - Busca `footer.html`

5. **Verifica que los scripts cargaron**
   - `js/footer.js`
   - `js/theme-toggle.js`
   - `js/breadcrumbs.js`
   - `js/notifications.js`

---

## Ejemplos Visuales

### Dark Mode (por defecto)
```
┌─────────────────────────────────────┐
│ Logo  [Links del menú]  ☀️ Toggle   │ ← Menú #1a1a1a
├─────────────────────────────────────┤
│ 🏠 Inicio / 📰 Noticias             │ ← Breadcrumbs
├─────────────────────────────────────┤
│                                     │
│  Contenido de la página             │ ← Fondo #1a1a1a, texto #e0e0e0
│                                     │
│  [🔔 Notificación en top-right]     │ ← Toast notification
│                                     │
├─────────────────────────────────────┤
│ Footer con 5 secciones              │ ← #1a1a1a, borde rojo
└─────────────────────────────────────┘
```

### Light Mode (después de click en ☀️)
```
┌─────────────────────────────────────┐
│ Logo  [Links del menú]  🌙 Toggle   │ ← Menú #f5f5f5
├─────────────────────────────────────┤
│ 🏠 Inicio / 📰 Noticias             │ ← Breadcrumbs
├─────────────────────────────────────┤
│                                     │
│  Contenido de la página             │ ← Fondo #f5f5f5, texto #333
│                                     │
│  [🔔 Notificación en top-right]     │ ← Toast notification
│                                     │
├─────────────────────────────────────┤
│ Footer con 5 secciones              │ ← #f5f5f5, borde rojo
└─────────────────────────────────────┘
```

---

## ¡Listo! 🎉

Tu sitio F1 Fans Global ahora tiene:
- ✅ Tema oscuro/claro
- ✅ Sistema de notificaciones elegante
- ✅ Footer completo
- ✅ Navegación con breadcrumbs

**¡Disfruta de tu interfaz mejorada!**
