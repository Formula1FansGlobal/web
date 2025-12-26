// Configuración: coloca aquí tu seller_id de Mercado Libre (numérico)
// Mexico: sitio MLM. Cambia el SITE si vendes en otro país.
const ML_CONFIG = {
  ENABLED_BY_DEFAULT: false,
  SITE: 'MLM',
  SELLER_ID: null // Ejemplo: 123456789
};

const localProducts = [
  { id: 'p1', title: 'Gorra F1 Fans Global', price: 399, category: 'gorras', team: 'redbull', image: 'img/Formula-1-Fans-Global2.jpg', link: 'https://mercadolibre.com.mx/', badge: 'Novedad' },
  { id: 'p2', title: 'Playera F1 Fans Global', price: 499, category: 'ropa', team: 'ferrari', image: 'img/ParrillaF1.jpg', link: 'https://mercadolibre.com.mx/', badge: 'Exclusivo' },
  { id: 'p3', title: 'Termo edición F1', price: 299, category: 'accesorios', team: 'mercedes', image: 'img/Pilotos-f1-2025.jpg', link: 'https://mercadolibre.com.mx/' },
  { id: 'p4', title: 'Sudadera F1 negra', price: 799, category: 'ropa', team: 'mclaren', image: 'img/Formula-1-Fans-Global.jpg', link: 'https://mercadolibre.com.mx/' },
  { id: 'p5', title: 'Poster circuito Monza', price: 259, category: 'posters', image: 'img/Circuitos-Live/Italy_carrera.avif', link: 'https://mercadolibre.com.mx/' },
  { id: 'p6', title: 'Miniatura RB20 1:43', price: 1299, category: 'miniaturas', team: 'redbull', image: 'img/Calendario/2024/Australia-2024.avif', link: 'https://mercadolibre.com.mx/' },
  { id: 'p7', title: 'Taza F1 edición 2025', price: 199, category: 'accesorios', image: 'img/Calendario/2024/T2024.avif', link: 'https://mercadolibre.com.mx/' },
  { id: 'p8', title: 'Chaqueta Ferrari', price: 1499, category: 'ropa', team: 'ferrari', image: 'img/Calendario/2024/T2024.avif', link: 'https://mercadolibre.com.mx/' },
  { id: 'p9', title: 'Llaveros Escuderías', price: 149, category: 'accesorios', image: 'img/Calendario/2024/T2024.avif', link: 'https://mercadolibre.com.mx/' },
  { id: 'p10', title: 'Sticker pack F1', price: 99, category: 'coleccionables', image: 'img/Calendario/2024/T2024.avif', link: 'https://mercadolibre.com.mx/' }
];

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
          <a class="btn-primary" href="${p.link}" target="_blank" rel="noopener">Ver en Mercado Libre</a>
          <button class="btn-secondary" aria-label="Ver detalles" data-product-id="${p.id}">Detalles</button>
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

function filterByTeam(products, team) {
  if (!team) return products;
  return products.filter(p => p.team === team);
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

async function loadProducts(useMercadoLibre) {
  try {
    let products = [];
    if (useMercadoLibre && ML_CONFIG.SELLER_ID) {
      products = await fetchMercadoLibreProducts(ML_CONFIG.SITE, ML_CONFIG.SELLER_ID);
    } else {
      products = localProducts;
    }
    const activeCategory = document.querySelector('.filter-option.active')?.dataset.category || 'all';
    const activeTeam = document.querySelector('#chip-equipos .chip.active')?.dataset.team || '';
    const query = document.getElementById('search-input')?.value || '';
    const sort = document.getElementById('sort-select')?.value || 'relevance';
    const maxPrice = Number(document.getElementById('price-range')?.value || 5000);

    let filtered = products;
    filtered = filterByCategory(filtered, activeCategory);
    filtered = filterByTeam(filtered, activeTeam);
    filtered = applySearch(filtered, query);
    filtered = applyPrice(filtered, maxPrice);
    filtered = applySort(filtered, sort);

    renderProducts(filtered);
  } catch (e) {
    console.error('Error cargando productos', e);
    renderProducts(localProducts);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('ml-source-toggle');
  const filterBtn = document.getElementById('filter-btn');
  const filterMenu = document.getElementById('filter-menu');
  const chipsEquipos = document.getElementById('chip-equipos');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const priceRange = document.getElementById('price-range');
  const priceLabel = document.getElementById('price-label');

  if (toggle) toggle.checked = ML_CONFIG.ENABLED_BY_DEFAULT;

  const refresh = () => loadProducts(toggle?.checked);
  toggle?.addEventListener('change', refresh);
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

  chipsEquipos?.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    const wasActive = btn.classList.contains('active');
    chipsEquipos.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    if (!wasActive) btn.classList.add('active');
    refresh();
  });

  // Modal de producto
  document.getElementById('product-grid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-product-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-product-id');
    const p = [...localProducts].find(x => x.id === id);
    const modal = document.getElementById('product-modal');
    if (p && modal) {
      document.getElementById('modal-image').src = p.image;
      document.getElementById('modal-title').textContent = p.title;
      document.getElementById('modal-price').textContent = formatCurrency(p.price);
      const link = document.getElementById('modal-link');
      link.href = p.link;
      modal.hidden = false;
    }
  });
  document.getElementById('modal-close')?.addEventListener('click', ()=>{
    document.getElementById('product-modal').hidden = true;
  });
  document.querySelector('.modal-backdrop')?.addEventListener('click', ()=>{
    document.getElementById('product-modal').hidden = true;
  });

  refresh();
});
