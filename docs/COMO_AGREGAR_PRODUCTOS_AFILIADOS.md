# Cómo agregar productos de afiliados de Mercado Libre

## Programa de Afiliados ML

Tu tienda está configurada para el **Programa de Afiliados de Mercado Libre**. Esto significa que:
- Promocionas productos de otros vendedores
- Ganas comisión por cada venta
- Los enlaces deben tener tu código de afiliado

## Pasos para agregar un producto

### 1. Encuentra el producto en Mercado Libre
Busca el producto que quieres promocionar en mercadolibre.com.mx

### 2. Genera tu enlace de afiliado
Usa tu herramienta de afiliados de ML para generar el enlace con tu código. El enlace debe verse algo así:
```
https://mercadolibre.com.mx/PRODUCTO?tag=tu_codigo_afiliado
```
O también puede ser:
```
https://click.mercadolibre.com.mx/tracking?url=PRODUCTO&id=tu_codigo
```

### 3. Copia la información del producto
Del producto en ML necesitas:
- **Título** (ejemplo: "Gorra Red Bull Racing F1 2025")
- **Precio** (ejemplo: 599)
- **Imagen** (clic derecho en la imagen → copiar dirección de imagen)
- **Link de afiliado** (el que generaste en el paso 2)

### 4. Abre el archivo de productos

**Ubicación:** `js/productos-afiliados.js`

Este archivo contiene 10 productos de ejemplo. Solo necesitas reemplazar la información.

### 5. Edita el producto

Busca el producto que quieres cambiar (PRODUCTO 1, PRODUCTO 2, etc.) y reemplaza TODA la información:

**ANTES:**
```javascript
// ──────────────────────────────────────────────────────────────────────
// PRODUCTO 1
// ──────────────────────────────────────────────────────────────────────
{
  id: 'p1',
  title: 'Gorra F1 Red Bull Racing 2025',
  price: 599,
  category: 'gorras',
  image: 'img/Formula-1-Fans-Global2.jpg',
  link: 'https://mercadolibre.com.mx/',
  badge: 'Novedad'
},
```

**DESPUÉS (con tu producto):**
```javascript
// ──────────────────────────────────────────────────────────────────────
// PRODUCTO 1
// ──────────────────────────────────────────────────────────────────────
{
  id: 'p1',
  title: 'Casco Replica Max Verstappen 2025',
  price: 2499,
  category: 'coleccionables',
  image: 'https://http2.mlstatic.com/D_NQ_NP_789456-MLM54321098-072025-O.webp',
  link: 'https://click.mercadolibre.com.mx/tracking?url=MLM-123456789&id=mi_codigo',
  badge: 'Exclusivo'
},
```

### 6. Guarda y prueba

1. **Guarda el archivo** `productos-afiliados.js`
2. **Recarga tu página web** (F5 o Ctrl + R)
3. El producto debe aparecer actualizado en tu catálogo

## Campos del producto

| Campo | Descripción | Ejemplo | Requerido |
|-------|-------------|---------|-----------|
| `id` | Identificador único (NO CAMBIAR) | `'p1'`, `'p2'`, etc. | ✅ Sí |
| `title` | Nombre del producto | `'Gorra Red Bull Racing 2025'` | ✅ Sí |
| `price` | Precio en pesos mexicanos | `599` | ✅ Sí |
| `category` | Categoría del producto | `'gorras'` | ✅ Sí |
| `image` | URL de la imagen | `'https://http2.mlstatic.com/...'` | ✅ Sí |
| `link` | Tu enlace de afiliado | `'https://click.mercadolibre.com.mx/...'` | ✅ Sí |
| `badge` | Etiqueta especial | `'Novedad'` o `'Exclusivo'` | ❌ No (opcional) |

## Categorías disponibles

- `'gorras'` - Gorras y sombreros
- `'ropa'` - Playeras, sudaderas, chaquetas
- `'accesorios'` - Termos, tazas, llaveros
- `'posters'` - Pósters y decoración
- `'miniaturas'` - Modelos y réplicas
- `'coleccionables'` - Stickers, pins, cascos, etc.

## Tips importantes

### 🔗 Enlace de afiliado
- **SIEMPRE** usa tu enlace de afiliado (con tu código)
- Verifica que el enlace funcione antes de agregarlo
- Si no tienes código de afiliado, regístrate en: https://afiliados.mercadolibre.com.mx/

### 🖼️ Imágenes
**Opción 1 - URL de Mercado Libre (recomendado):**
```javascript
image: 'https://http2.mlstatic.com/D_NQ_NP_789456-MLM54321098-072025-O.webp'
```
- Clic derecho en la imagen del producto → Copiar dirección de imagen
- Pega la URL completa

**Opción 2 - Imagen local:**
```javascript
image: 'img/productos/mi-imagen.jpg'
```
- Descarga la imagen
- Súbela a la carpeta `img/productos/`
- Usa la ruta relativa

### ⭐ Badge (Etiqueta especial)
Los productos con `badge` aparecen **primero en el carrusel**:
- `badge: 'Novedad'` - Para productos nuevos
- `badge: 'Exclusivo'` - Para productos especiales
- Sin badge - Quita toda la línea del badge:
```javascript
{
  id: 'p3',
  title: 'Termo Stanley F1',
  price: 899,
  category: 'accesorios',
  image: 'https://...',
  link: 'https://...'
  // Sin badge aquí
}
```

### 💰 Precios
- Usa números enteros (sin comas ni puntos): `599` no `599.00`
- Precio en pesos mexicanos
- Actualiza regularmente para que coincida con ML

## Ejemplo completo

```javascript
const productosAfiliados = [
  
  // Producto con badge (aparecerá primero en carrusel)
  {
    id: 'p1',
    title: 'Casco Replica Max Verstappen Red Bull 2025',
    price: 2499,
    category: 'coleccionables',
    image: 'https://http2.mlstatic.com/D_NQ_NP_789456-MLM54321098-072025-O.webp',
    link: 'https://click.mercadolibre.com.mx/tracking?url=MLM-123456789&id=mi_codigo',
    badge: 'Exclusivo'
  },

  // Producto sin badge
  {
    id: 'p2',
    title: 'Playera Ferrari Scuderia Official Team 2025',
    price: 799,
    category: 'ropa',
    image: 'https://http2.mlstatic.com/D_NQ_NP_456789-MLM98765432-082025-O.webp',
    link: 'https://mercadolibre.com.mx/MLM-987654321?tag=mi_codigo_afiliado'
  },

  // ... más productos ...
];
```

## Agregar más de 10 productos

Si necesitas más de 10 productos, simplemente agrega más al final:

```javascript
  {
    id: 'p10',
    title: 'Pack 50 Stickers F1 2025',
    price: 149,
    category: 'coleccionables',
    image: 'img/Calendario/2024/T2024.avif',
    link: 'https://mercadolibre.com.mx/'
  },

  // Agrega una coma arriba ↑ y añade tu producto:
  {
    id: 'p11',  // ← Incrementa el número
    title: 'Tu nuevo producto',
    price: 999,
    category: 'ropa',
    image: 'https://...',
    link: 'https://tu-enlace-afiliado'
  }

];
```

⚠️ **IMPORTANTE:** No olvides la coma `,` entre productos (excepto el último).

## Solución de problemas

### El producto no aparece
1. Verifica que guardaste el archivo `productos-afiliados.js`
2. Recarga la página con Ctrl + Shift + R (recarga forzada)
3. Abre la consola del navegador (F12) y busca errores

### La imagen no se muestra
1. Verifica que la URL de la imagen sea correcta
2. Prueba abrir la URL de la imagen directamente en el navegador
3. Si es imagen local, verifica que el archivo exista en `img/productos/`

### El enlace no funciona
1. Verifica que tu código de afiliado esté en el enlace
2. Prueba el enlace directamente en el navegador
3. Contacta con soporte de Afiliados ML si persiste

## Recursos útiles

- **Portal de Afiliados ML:** https://afiliados.mercadolibre.com.mx/
- **Soporte técnico:** Revisa el README.md principal del proyecto
- **Archivo de productos:** `js/productos-afiliados.js`

---

💡 **Consejo:** Actualiza tus productos regularmente para mantener precios y disponibilidad al día.
