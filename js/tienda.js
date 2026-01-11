// Configuración: coloca aquí tu seller_id de Mercado Libre (numérico)
// Mexico: sitio MLM. Cambia el SITE si vendes en otro país.
const ML_CONFIG = {
  ENABLED_BY_DEFAULT: false,
  SITE: 'MLM',
  SELLER_ID: null // Ejemplo: 123456789
};

// (Carrito deshabilitado) No se requiere configuración de checkout interno

// Configuración del carrusel
const CAROUSEL_CONFIG = {
  AUTO_SCROLL_INTERVAL: 5000, // ms entre desplazamientos automáticos
  FEATURED_COUNT: 8 // cantidad de productos destacados a mostrar
};

// ===== PRODUCTOS =====
// Los productos se cargan desde: js/productos-afiliados.js
// Para agregar o editar productos, abre ese archivo y sigue las instrucciones
const localProducts = productosAfiliados;

function formatCurrency(mx) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(mx);
}

async function fetchMercadoLibreProducts(site, sellerId, limit = 24) {
  const url = `https://api.mercadolibre.com/sites/${site}/search?seller_id=${sellerId}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ML API error ${res.status}`);
  const data = await res.json();
  return (data.results || []).map(r => ({
    id: r.id,
    title: r.title,
    price: r.price,
    category: (r.category_id || 'otros').toLowerCase(),
    image: (r.thumbnail || '').replace('http://', 'https://'),
    link: r.permalink || `https://mercadolibre.com.mx/`,
  }));
}

function renderSkeletons(count = 8) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  const items = Array.from({ length: count }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line" style="width: 70%"></div>
        <div class="skeleton-line" style="width: 40%"></div>
        <div class="skeleton-line" style="width: 60%"></div>
      </div>
    </div>
  `).join('');
  grid.innerHTML = items;
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='../../img/Calendario/2024/T2024.avif'">
      </div>
      <div class="product-body">
        <div class="product-title">${p.title}</div>
        <div class="product-price">${formatCurrency(p.price)}</div>
        <div class="product-actions">
          <a class="btn-primary btn-buy" href="${p.link}" target="_blank" rel="noopener">🛒 Comprar</a>
          <button class="btn-secondary" data-product-id="${p.id}">Ver detalles</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterByCategory(products, category) {
  if (category === 'all') return products;
  return products.filter(p => p.category === category);
}

function applySearch(products, query) {
  if (!query) return products;
  const q = query.toLowerCase();
  return products.filter(p => p.title.toLowerCase().includes(q));
}

function applyPrice(products, maxPrice) {
  return products.filter(p => typeof p.price === 'number' && p.price <= maxPrice);
}

function applySort(products, sort) {
  const arr = [...products];
  if (sort === 'price_asc') arr.sort((a,b)=> (a.price||0)-(b.price||0));
  else if (sort === 'price_desc') arr.sort((a,b)=> (b.price||0)-(a.price||0));
  else if (sort === 'new') arr.sort((a,b)=> (b.id||'').localeCompare(a.id||''));
  return arr;
}

async function loadProducts() {
  try {
    // Fuente base: catálogo local (afiliados)
    allProducts = Array.isArray(localProducts) ? localProducts : [];

    // Estado UI
    const activeFilter = document.querySelector('.filter-option.active');
    const category = activeFilter?.dataset?.category || 'all';
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const priceRange = document.getElementById('price-range');
    const maxPrice = Number(priceRange?.value || 5000);
    const query = (searchInput?.value || '').trim();
    const sort = sortSelect?.value || 'relevance';

    // Pipeline de filtrado
    let filtered = filterByCategory(allProducts, category);
    filtered = applySearch(filtered, query);
    filtered = applyPrice(filtered, maxPrice);
    filtered = applySort(filtered, sort);

    // Render
    renderProducts(filtered);
    renderCarousel(allProducts);
  } catch (e) {
    console.error('Error cargando productos', e);
    allProducts = Array.isArray(localProducts) ? localProducts : [];
    renderProducts(allProducts);
    renderCarousel(allProducts);
  }
}

let currentModalProduct = null;
let allProducts = []; // Almacena todos los productos (local o ML)

// ===== CARRUSEL =====
let carouselIndex = 0;
let carouselInterval = null;
let carouselProducts = [];
let carouselMaxIndex = 0;

function renderCarousel(products) {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  
  // Usar productosCarrusel (ofertas limitadas) en lugar de productos del grid
  carouselProducts = productosCarrusel || [];
  
  track.innerHTML = carouselProducts.map(p => `
    <article class="carousel-item carousel-limited" data-product-id="${p.id}">
      <div class="carousel-item-image">
        <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='../../img/Calendario/2024/T2024.avif'">
        <div class="limited-badge">Oferta Limitada</div>
      </div>
      <div class="carousel-item-body">
        <div class="carousel-item-title">${p.title}</div>
        <div class="carousel-item-price">${formatCurrency(p.price)}</div>
      </div>
    </article>
  `).join('');
  
  carouselIndex = 0;
  // Calcular indicadores según el número visible
  recalculateCarouselLayout();
  startCarouselAutoScroll();
}

function scrollCarousel(direction) {
  const track = document.getElementById('carousel-track');
  const container = document.getElementById('carousel-container');
  if (!track || !container || carouselProducts.length === 0) return;
  
  const itemEl = track.querySelector('.carousel-item');
  const gap = parseInt(getComputedStyle(track).gap || '16', 10);
  const itemWidth = (itemEl ? itemEl.offsetWidth : 280) + gap; // ancho del item + gap
  const visibleItems = Math.max(1, Math.floor(container.offsetWidth / itemWidth));
  const maxIndex = Math.max(0, carouselProducts.length - visibleItems);
  
  if (direction === 'next') {
    carouselIndex = (carouselIndex + 1) % (maxIndex + 1);
  } else {
    carouselIndex = (carouselIndex - 1 + (maxIndex + 1)) % (maxIndex + 1);
  }
  
  track.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
  updateIndicators();
}

function startCarouselAutoScroll() {
  if (carouselInterval) clearInterval(carouselInterval);
  carouselInterval = setInterval(() => scrollCarousel('next'), CAROUSEL_CONFIG.AUTO_SCROLL_INTERVAL);
}

function stopCarouselAutoScroll() {
  if (carouselInterval) clearInterval(carouselInterval);
}

function renderIndicators(count) {
  const indicators = document.getElementById('carousel-indicators');
  if (!indicators) return;
  indicators.innerHTML = Array.from({ length: count }).map((_, i) => `
    <button class="indicator-dot" data-index="${i}" aria-label="Ir a sección ${i+1}"></button>
  `).join('');
  if (!indicators.dataset.bound) {
    indicators.addEventListener('click', (e) => {
      const dot = e.target.closest('.indicator-dot');
      if (!dot) return;
      stopCarouselAutoScroll();
      jumpCarouselTo(Number(dot.dataset.index));
      startCarouselAutoScroll();
    });
    indicators.dataset.bound = 'true';
  }
}

function updateIndicators() {
  const indicators = document.getElementById('carousel-indicators');
  if (!indicators) return;
  indicators.querySelectorAll('.indicator-dot').forEach((d, i) => {
    d.classList.toggle('active', i === carouselIndex);
  });
}

function jumpCarouselTo(index) {
  const track = document.getElementById('carousel-track');
  const container = document.getElementById('carousel-container');
  if (!track || !container) return;
  const itemEl = track.querySelector('.carousel-item');
  const gap = parseInt(getComputedStyle(track).gap || '16', 10);
  const itemWidth = (itemEl ? itemEl.offsetWidth : 280) + gap;
  carouselIndex = Math.min(Math.max(index, 0), carouselMaxIndex);
  track.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
  updateIndicators();
}

function recalculateCarouselLayout() {
  const track = document.getElementById('carousel-track');
  const container = document.getElementById('carousel-container');
  if (!track || !container || carouselProducts.length === 0) return;
  const itemEl = track.querySelector('.carousel-item');
  const gap = parseInt(getComputedStyle(track).gap || '16', 10);
  const itemWidth = (itemEl ? itemEl.offsetWidth : 280) + gap;
  const visibleItems = Math.max(1, Math.floor(container.offsetWidth / itemWidth));
  carouselMaxIndex = Math.max(0, carouselProducts.length - visibleItems);
  if (carouselIndex > carouselMaxIndex) carouselIndex = carouselMaxIndex;
  track.style.transform = `translateX(-${carouselIndex * itemWidth}px)`;
  renderIndicators(carouselMaxIndex + 1);
  updateIndicators();
}

window.addEventListener('DOMContentLoaded', () => {
  const filterBtn = document.getElementById('filter-btn');
  const filterMenu = document.getElementById('filter-menu');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const priceRange = document.getElementById('price-range');
  const priceLabel = document.getElementById('price-label');
  const carouselPrev = document.getElementById('carousel-prev');
  const carouselNext = document.getElementById('carousel-next');
  const carouselContainer = document.getElementById('carousel-container');

  const refresh = () => loadProducts();
  searchInput?.addEventListener('input', refresh);
  sortSelect?.addEventListener('change', refresh);
  priceRange?.addEventListener('input', () => {
    priceLabel.textContent = `Hasta ${formatCurrency(Number(priceRange.value))}`;
    refresh();
  });
  // Inicializar etiqueta de rango de precio
  if (priceRange && priceLabel) {
    priceLabel.textContent = `Hasta ${formatCurrency(Number(priceRange.value || 5000))}`;
  }

  // Menú desplegable de filtro
  let filterOpen = false;
  const closeFilter = () => {
    filterOpen = false;
    filterMenu?.classList.add('closed');
    filterBtn?.setAttribute('aria-expanded', 'false');
  };
  const openFilter = () => {
    filterOpen = true;
    filterMenu?.classList.remove('closed');
    filterBtn?.setAttribute('aria-expanded', 'true');
  };

  if (filterBtn && filterMenu) {
    // Inicializar etiqueta del botón con la opción activa
    const initial = document.querySelector('.filter-option.active');
    if (initial) filterBtn.textContent = `Filtro: ${initial.textContent.trim()} \u25BC`;
    filterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      filterOpen ? closeFilter() : openFilter();
    });
    document.addEventListener('click', (e) => {
      if (!filterBtn.contains(e.target) && !filterMenu.contains(e.target)) {
        closeFilter();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeFilter();
    });
    filterMenu.addEventListener('click', e => {
      if (e.target.classList.contains('filter-option')) {
        document.querySelectorAll('.filter-option').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        // Actualizar etiqueta del botón Filtro con la opción seleccionada
        const label = e.target.textContent.trim();
        if (filterBtn && label) filterBtn.textContent = `Filtro: ${label} \u25BC`;
        refresh();
        closeFilter();
      }
    });
  }

  // Modal de producto desde grid
  document.getElementById('product-grid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-product-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-product-id');
    const p = allProducts.find(x => x.id === id);
    const modal = document.getElementById('product-modal');
    if (p && modal) {
      document.getElementById('modal-image').src = p.image;
      document.getElementById('modal-title').textContent = p.title;
      document.getElementById('modal-price').textContent = formatCurrency(p.price);
      const link = document.getElementById('modal-link');
      link.href = p.link;
      currentModalProduct = { id: p.id, title: p.title, price: p.price, image: p.image };
      modal.hidden = false;
    }
  });
  document.getElementById('modal-close')?.addEventListener('click', ()=>{
    document.getElementById('product-modal').hidden = true;
  });
  document.querySelector('.modal-backdrop')?.addEventListener('click', ()=>{
    document.getElementById('product-modal').hidden = true;
  });

  // Carrito deshabilitado: no se registran eventos ni contadores

  // Carrusel: navegación manual y pausa al hover
  carouselPrev?.addEventListener('click', () => {
    stopCarouselAutoScroll();
    scrollCarousel('prev');
    startCarouselAutoScroll();
  });
  carouselNext?.addEventListener('click', () => {
    stopCarouselAutoScroll();
    scrollCarousel('next');
    startCarouselAutoScroll();
  });
  carouselContainer?.addEventListener('mouseenter', () => stopCarouselAutoScroll());
  carouselContainer?.addEventListener('mouseleave', () => startCarouselAutoScroll());
  window.addEventListener('resize', () => {
    stopCarouselAutoScroll();
    recalculateCarouselLayout();
    startCarouselAutoScroll();
  });
  
  // Carrusel: click en item abre modal
  document.getElementById('carousel-track')?.addEventListener('click', (e) => {
    const item = e.target.closest('.carousel-item');
    if (!item) return;
    const id = item.getAttribute('data-product-id');
    // Buscar en productosCarrusel primero, luego en localProducts
    let p = productosCarrusel?.find(x => x.id === id);
    if (!p) p = allProducts.find(x => x.id === id);
    const modal = document.getElementById('product-modal');
    if (p && modal) {
      document.getElementById('modal-image').src = p.image;
      document.getElementById('modal-title').textContent = p.title;
      document.getElementById('modal-price').textContent = formatCurrency(p.price);
      const link = document.getElementById('modal-link');
      link.href = p.link;
      currentModalProduct = { id: p.id, title: p.title, price: p.price, image: p.image };
      modal.hidden = false;
    }
  });

  refresh();
});
