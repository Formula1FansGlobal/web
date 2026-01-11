/**
 * Footer Injection System
 * Inyecta dinámicamente el footer en todas las páginas
 * (Footer injection for all pages)
 */

class FooterManager {
    constructor() {
        const path = window.location.pathname.replace(/\\/g, '/');
        if (path.includes('/html/paginas/') || path.includes('/html/layout/')) {
            this.footerFile = '../../html/layout/footer.html';
        } else {
            this.footerFile = 'html/layout/footer.html';
        }
    }

    /**
     * Carga e inyecta el footer en la página
     * (Load and inject footer into page)
     */
    async init() {
        try {
            const response = await fetch(this.footerFile);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const footerHTML = await response.text();
            
            // Inyectar antes del cierre de body
            document.body.insertAdjacentHTML('beforeend', footerHTML);
            
            // Reescribir rutas dinámicamente
            this.rewriteFooterPaths();
            
            // Inicializar formulario de newsletter
            this.initNewsletter();
            
            console.log('✅ Footer inyectado correctamente');
        } catch (error) {
            console.error('❌ Error cargando footer:', error);
        }
    }

    /**
     * Reescribe las rutas del footer según la ubicación actual
     * (Rewrite footer paths based on current location)
     */
    rewriteFooterPaths() {
        // Calcular prefijo base - detectar profundidad actual
        const currentUrl = window.location.pathname;
        console.log('📍 Current pathname:', currentUrl);
        
        let basePrefix = './';
        
        if (currentUrl.includes('/html/paginas/')) {
            basePrefix = '../../';
            console.log('✓ Detectado: /html/paginas/ → basePrefix = "../../"');
        } else if (currentUrl.includes('/html/layout/')) {
            basePrefix = '../../';
            console.log('✓ Detectado: /html/layout/ → basePrefix = "../../"');
        } else {
            console.log('✓ Detectado: raíz o index → basePrefix = "./"');
        }
        
        // Buscar todos los enlaces con data-path en el footer
        const footer = document.querySelector('footer');
        if (!footer) {
            console.warn('⚠️ Footer no encontrado en el DOM');
            return;
        }
        
        const links = footer.querySelectorAll('a[data-path]');
        console.log(`📊 Se encontraron ${links.length} enlaces con data-path`);
        
        links.forEach((link, index) => {
            const dataPath = link.getAttribute('data-path');
            console.log(`   [${index}] dataPath="${dataPath}"`);
            
            // Solo procesar si tiene data-path válido y no es un ancla
            if (dataPath && !dataPath.startsWith('http') && !dataPath.startsWith('#')) {
                const normalizedPath = dataPath.replace(/^\.\//, '');
                const finalHref = `${basePrefix}${normalizedPath}`;
                
                // Establecer href con la ruta correcta
                link.setAttribute('href', finalHref);
                
                // Asegurar que es clickeable
                link.style.cursor = 'pointer';
                
                // Para mejor accesibilidad, si no tiene href previamente, agregar atributos
                if (!link.hasAttribute('role')) {
                    link.setAttribute('role', 'link');
                }
                if (!link.hasAttribute('tabindex')) {
                    link.setAttribute('tabindex', '0');
                }
                
                console.log(`   ✓ Actualizado a href="${finalHref}"`);
            }
        });
        
        console.log('✅ rewriteFooterPaths completado');
    }

    /**
     * Inicializa el manejador del formulario de newsletter
     * (Initialize newsletter form handler)
     */
    initNewsletter() {
        const form = document.getElementById('newsletter-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = form.querySelector('input[type="email"]').value;
            
            // Validar email
            if (!this.isValidEmail(email)) {
                if (window.showNotification) {
                    window.showNotification('Por favor ingresa un email válido', 'error');
                }
                return;
            }
            
            // Guardar email en localStorage
            const subscribers = JSON.parse(localStorage.getItem('f1_subscribers') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('f1_subscribers', JSON.stringify(subscribers));
            }
            
            // Mostrar confirmación
            if (window.showNotification) {
                window.showNotification('¡Gracias por suscribirse! 🎉', 'success');
            }
            
            // Limpiar formulario
            form.reset();
        });
    }

    /**
     * Valida formato de email
     * (Validate email format)
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
}

// Inicializar footer cuando el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FooterManager().init();
    });
} else {
    new FooterManager().init();
}
