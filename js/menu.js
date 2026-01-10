// Calcula prefijo relativo desde la ubicación actual al root del proyecto
const computeBasePrefix = () => {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/html/paginas/')) return '../../';
    if (path.includes('/html/layout/')) return '../../';
    return './';
};

const basePrefix = computeBasePrefix();
const menuPath = `${basePrefix}html/layout/menu.html`;

fetch(menuPath)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
    })
    .then(html => {
        const container = document.getElementById('nav-container');
        if (container) {
            container.innerHTML = html;
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }

        // Ajustar hrefs y recursos del menú al nuevo esquema de rutas
        const nav = document.querySelector('nav.site-nav');
        if (nav) {
            const logoLink = nav.querySelector('.logo-link');
            const logoImg = nav.querySelector('img.logo');
            if (logoLink) {
                const logoPath = (logoLink.dataset.path || 'index.html').replace(/^\.\//, '');
                logoLink.setAttribute('href', `${basePrefix}${logoPath}`);
            }
            if (logoImg) {
                const logoSrc = (logoImg.dataset.logoSrc || 'img/Formula-1-Fans-Global2.jpg').replace(/^\.\//, '');
                logoImg.setAttribute('src', `${basePrefix}${logoSrc}`);
            }

            const links = nav.querySelectorAll('.nav-links a');
            links.forEach(a => {
                const originalHref = a.dataset.path || a.getAttribute('href');
                if (!originalHref || originalHref.startsWith('http') || originalHref === '#') return;
                const normalizedHref = originalHref.replace(/^\.\//, '');
                a.setAttribute('href', `${basePrefix}${normalizedHref}`);
            });
        }

        // Ajustar enlace de temporada actual al año en curso
        const seasonLink = document.querySelector('nav.site-nav .nav-links a[data-nav-current-season]');
        const currentSeasonYear = new Date().getFullYear();
        if (seasonLink) {
            seasonLink.setAttribute('href', `${basePrefix}html/paginas/calendario_temporada.html?year=${currentSeasonYear}`);
            seasonLink.textContent = `📅 Temporada ${currentSeasonYear}`;
        }

        // Marcar enlace activo según la URL (ignorando query params)
        const links = document.querySelectorAll('nav.site-nav .nav-links a');
        const currentUrl = new URL(window.location.href);
        const currentPath = currentUrl.pathname.endsWith('/') ? `${currentUrl.pathname}index.html` : currentUrl.pathname;
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            const targetPath = new URL(href, currentUrl.origin).pathname;
            if (currentPath === targetPath) {
                a.setAttribute('aria-current', 'page');
                a.classList.add('is-active');
            }
        });

    })
    .catch(error => {
        console.error('Error cargando el menú:', error);
    });
