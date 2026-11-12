/**
 * Breadcrumb Navigation System
 * Sistema de navegación de migas de pan
 * (Breadcrumb trail navigation)
 */

class BreadcrumbManager {
    constructor() {
        this.pageMap = {
            'index.html': { name: 'Inicio', icon: '🏠' },
            'en-vivo.html': { name: 'En Vivo', icon: '📺' },
            'noticias.html': { name: 'Noticias', icon: '📰' },
            'temporadas.html': { name: 'Temporadas', icon: '📚' },
            'calendario_temporada.html': { name: 'Calendario', icon: '📅' },
            'video_gp.html': { name: 'Video del GP', icon: '🎥' },
            'videos.html': { name: 'Videos', icon: '🎬' },
            'tienda.html': { name: 'Tienda', icon: '🛍️' },
            'prueba.html': { name: 'Prueba', icon: '🧪' }
        };
    }

    /**
     * Obtiene la página actual basándose en el pathname
     * (Get current page from pathname)
     */
    getCurrentPage() {
        const pathname = window.location.pathname;
        const page = pathname.split('/').pop() || 'index.html';
        return page;
    }

    /**
     * Obtiene parámetros de query de la URL
     * (Get URL query parameters)
     */
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        params.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    /**
     * Genera los breadcrumbs dinámicamente
     * (Generate breadcrumbs dynamically)
     */
    generateBreadcrumbs() {
        const currentPage = this.getCurrentPage();
        const breadcrumbs = [
            { name: 'Inicio', icon: '🏠', href: 'index.html' }
        ];

        // Agregar página actual si no es index
        if (currentPage !== 'index.html' && currentPage !== '') {
            const pageInfo = this.pageMap[currentPage];
            if (pageInfo) {
                breadcrumbs.push({
                    name: pageInfo.name,
                    icon: pageInfo.icon,
                    href: currentPage,
                    isCurrent: true
                });
            }
        }

        // Agregar información adicional según query params
        const params = this.getQueryParams();
        if (params.year && currentPage === 'calendario_temporada.html') {
            breadcrumbs.push({
                name: `Temporada ${params.year}`,
                isCurrent: true
            });
        }

        if (params.gp && currentPage === 'video_gp.html') {
            const gpName = params.gp.replace(/_/g, ' ').replace(/2024|2025/g, '').trim();
            breadcrumbs.push({
                name: gpName,
                isCurrent: true
            });
        }

        return breadcrumbs;
    }

    /**
     * Crea el HTML de breadcrumbs
     * (Create breadcrumb HTML)
     */
    createBreadcrumbHTML(breadcrumbs) {
        const nav = document.createElement('nav');
        nav.className = 'breadcrumbs';
        nav.setAttribute('aria-label', 'Navegación');

        const ol = document.createElement('ol');
        ol.className = 'breadcrumbs-list';

        breadcrumbs.forEach((breadcrumb, index) => {
            const li = document.createElement('li');
            
            if (breadcrumb.isCurrent) {
                // Elemento actual (no es link)
                li.className = 'breadcrumb-item current';
                li.innerHTML = `<span class="breadcrumb-icon">${breadcrumb.icon || ''}</span>${breadcrumb.name}`;
                li.setAttribute('aria-current', 'page');
            } else {
                // Link a otra página
                li.className = 'breadcrumb-item';
                li.innerHTML = `
                    <a href="${breadcrumb.href}">
                        <span class="breadcrumb-icon">${breadcrumb.icon || ''}</span>
                        ${breadcrumb.name}
                    </a>
                `;
            }

            ol.appendChild(li);

            // Agregar separador (excepto en el último)
            if (index < breadcrumbs.length - 1) {
                const separator = document.createElement('li');
                separator.className = 'breadcrumb-separator';
                separator.innerHTML = '/';
                ol.appendChild(separator);
            }
        });

        nav.appendChild(ol);
        return nav;
    }

    /**
     * Inicializa el sistema de breadcrumbs
     * (Initialize breadcrumb system)
     */
    init() {
        // Esperar a que el nav-container esté cargado
        const checkNav = setInterval(() => {
            const navContainer = document.getElementById('nav-container');
            if (navContainer && navContainer.innerHTML) {
                clearInterval(checkNav);
                
                // Generar breadcrumbs
                const breadcrumbs = this.generateBreadcrumbs();
                const breadcrumbHTML = this.createBreadcrumbHTML(breadcrumbs);
                
                // Inyectar después del nav-container
                navContainer.insertAdjacentElement('afterend', breadcrumbHTML);
                
                console.log('✅ Breadcrumbs inyectados correctamente');
            }
        }, 300);

        // Timeout si nav-container no se carga en 5 segundos
        setTimeout(() => clearInterval(checkNav), 5000);
    }
}

// Inicializar breadcrumbs cuando el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BreadcrumbManager().init();
    });
} else {
    new BreadcrumbManager().init();
}
