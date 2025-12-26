// Configuración: coloca aquí tu seller_id de Mercado Libre (numérico)
// Mexico: sitio MLM. Cambia el SITE si vendes en otro país.
const ML_CONFIG = {
  ENABLED_BY_DEFAULT: false,
  SITE: 'MLM',
  SELLER_ID: null // Ejemplo: 123456789
};

// Configuración de la tienda (checkout)
const SHOP_CONFIG = {
  WHATSAPP_PHONE: null // Ejemplo: '5215512345678' para México. Si es null, abre WhatsApp sin número.
};

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
        <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='img/Calendario/2024/T2024.avif'">
      </div>
      <div class="product-body">
        <div class="product-title">${p.title}</div>
        <div class="product-price">${formatCurrency(p.price)}</div>
        <div class="product-actions">
          <a class="btn-primary btn-buy" href="${p.link}" target="_blank" rel="noopener">🛒 Comprar</a>
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
    const products = localProducts;
    allProducts = products;
    
    // Vista simplificada: sin filtros ni búsqueda
    renderProducts(products.slice(0, 4));
    renderCarousel(products);
  } catch (e) {
    console.error('Error cargando productos', e);
    allProducts = localProducts;
    renderProducts(localProducts.slice(0, 4));
    renderCarousel(localProducts);
  }
}

// ===== Carrito =====
const CART_KEY = 'f1_cart';
let currentModalProduct = null;
let allProducts = []; // Almacena todos los productos (local o ML)

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  const cart = getCart();
  const count = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  if (countEl) countEl.textContent = String(count);
}
function addToCart(prod) {
  if (!prod || !prod.id) return;
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === prod.id);
  if (idx >= 0) {
    cart[idx].qty = (cart[idx].qty || 1) + 1;
  } else {
    cart.push({ id: prod.id, title: prod.title, price: prod.price, image: prod.image, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  renderCart();
}
function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartCount();
  renderCart();
}
function updateQty(id, delta) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx >= 0) {
    cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + delta);
    saveCart(cart);
    updateCartCount();
    renderCart();
  }
}
function cartTotal() {
  const cart = getCart();
  return cart.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);
}
function buildWhatsAppLink() {
  const cart = getCart();
  const lines = cart.map(i => `• ${i.title} x${i.qty} – ${formatCurrency(i.price)} c/u`).join('\n');
  const totalLine = `Total: ${formatCurrency(cartTotal())}`;
  const text = encodeURIComponent(`Hola, quiero comprar:\n${lines}\n${totalLine}`);
  const base = SHOP_CONFIG.WHATSAPP_PHONE ? `https://wa.me/${SHOP_CONFIG.WHATSAPP_PHONE}` : `https://wa.me/`;
  return `${base}?text=${text}`;
}
function renderCart() {
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const checkoutEl = document.getElementById('cart-checkout');
  if (!itemsEl || !totalEl || !checkoutEl) return;
  const cart = getCart();
  if (!cart.length) {
    itemsEl.innerHTML = '<p>Tu carrito está vacío.</p>';
  } else {
    itemsEl.innerHTML = cart.map(i => `
      <div class="cart-item">
        <img src="${i.image}" alt="${i.title}" onerror="this.src='img/Calendario/2024/T2024.avif'" />
        <div>
          <div class="cart-item-title">${i.title}</div>
          <div class="cart-item-meta">${formatCurrency(i.price)} • Cantidad: ${i.qty}</div>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn" data-action="dec" data-id="${i.id}">−</button>
          <button class="qty-btn" data-action="inc" data-id="${i.id}">+</button>
          <button class="remove-btn" data-action="remove" data-id="${i.id}">Quitar</button>
        </div>
      </div>
    `).join('');
  }
  totalEl.textContent = formatCurrency(cartTotal());
  checkoutEl.href = buildWhatsAppLink();
}
function openCart() { const m = document.getElementById('cart-modal'); if (m) { m.hidden = false; renderCart(); } }
function closeCart() { const m = document.getElementById('cart-modal'); if (m) m.hidden = true; }

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
        <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='img/Calendario/2024/T2024.avif'">
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
  const cartOpenBtn = document.getElementById('cart-open');
  const cartCloseBtn = document.getElementById('cart-close');
  const cartClearBtn = document.getElementById('cart-clear');
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

  // (Carrito deshabilitado) Se elimina la lógica de agregar al carrito desde modal y tarjetas

  // Carrito: abrir/cerrar/acciones
  cartOpenBtn?.addEventListener('click', () => openCart());
  cartCloseBtn?.addEventListener('click', () => closeCart());
  document.querySelector('#cart-modal .modal-backdrop')?.addEventListener('click', () => closeCart());
  cartClearBtn?.addEventListener('click', () => { saveCart([]); updateCartCount(); renderCart(); });
  document.getElementById('cart-items')?.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const id = t.getAttribute('data-id');
    const action = t.getAttribute('data-action');
    if (action === 'inc') updateQty(id, +1);
    else if (action === 'dec') updateQty(id, -1);
    else if (action === 'remove') removeFromCart(id);
  });

  // Inicializa contador del carrito
  updateCartCount();

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
