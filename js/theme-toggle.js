/**
 * Theme Toggle System (Mejora 3 - Interfaz & UX)
 * Sistema de modo oscuro/claro con persistencia en localStorage
 * (Dark/light mode toggle with localStorage persistence)
 */

class ThemeToggle {
    constructor() {
        this.storageKey = 'f1_theme';
        this.defaultTheme = 'dark';
        this.lightTheme = 'light';
        this.darkTheme = 'dark';
        this.init();
    }

    /**
     * Obtiene el tema guardado o usa el tema por defecto
     * (Get saved theme or use default)
     */
    getSavedTheme() {
        return localStorage.getItem(this.storageKey) || this.defaultTheme;
    }

    /**
     * Aplica el tema actual al documento
     * (Apply theme to document)
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.storageKey, theme);
        
        // Actualizar meta theme-color para navegadores móviles
        const themeColor = theme === 'dark' ? '#1a1a1a' : '#f5f5f5';
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', themeColor);
        }
        
        console.log(`🎨 Tema aplicado: ${theme}`);
    }

    /**
     * Alterna entre tema oscuro y claro
     * (Toggle between dark and light themes)
     */
    toggleTheme() {
        const currentTheme = this.getSavedTheme();
        const newTheme = currentTheme === this.darkTheme ? this.lightTheme : this.darkTheme;
        this.applyTheme(newTheme);
        return newTheme;
    }

    /**
     * Crea el botón de alternancia de tema
     * (Create theme toggle button)
     */
    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle-btn';
        button.id = 'theme-toggle-btn';
        button.setAttribute('aria-label', 'Cambiar tema');
        button.setAttribute('title', 'Cambiar entre modo oscuro y claro');
        
        this.updateButtonContent(button);
        
        button.addEventListener('click', () => {
            const newTheme = this.toggleTheme();
            this.updateButtonContent(button);
            
            // Mostrar notificación
            if (window.showNotification) {
                const message = newTheme === 'dark' 
                    ? '🌙 Modo oscuro activado' 
                    : '☀️ Modo claro activado';
                window.showNotification(message, 'info');
            }
        });
        
        return button;
    }

    /**
     * Actualiza el contenido del botón según el tema actual
     * (Update button content based on current theme)
     */
    updateButtonContent(button) {
        const currentTheme = this.getSavedTheme();
        button.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }

    /**
     * Inyecta el botón en el menú de navegación
     * (Inject toggle button into nav menu)
     */
    injectButton() {
        const maxAttempts = 20; // Esperar máx 10 segundos (20 * 500ms)
        let attempts = 0;

        const checkNav = setInterval(() => {
            attempts++;
            const navContainer = document.getElementById('nav-container');
            const nav = navContainer ? navContainer.querySelector('nav.site-nav') : null;

            if (nav && nav.innerHTML) {
                clearInterval(checkNav);
                
                // Evitar duplicados
                if (document.getElementById('theme-toggle-btn')) {
                    console.log('✅ Botón de tema ya existe');
                    return;
                }
                
                // Crear y agregar botón al final del nav
                const toggleButton = this.createToggleButton();
                nav.appendChild(toggleButton);
                
                console.log('✅ Botón de tema inyectado correctamente');
            } else if (attempts >= maxAttempts) {
                clearInterval(checkNav);
                console.warn('⚠️ No se pudo inyectar el botón de tema (nav-container no encontrado)');
            }
        }, 500);
    }

    /**
     * Inicializa el sistema de temas
     * (Initialize theme system)
     */
    init() {
        // Aplicar tema guardado
        const savedTheme = this.getSavedTheme();
        this.applyTheme(savedTheme);
        
        // Inyectar botón
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.injectButton();
            });
        } else {
            this.injectButton();
        }
        
        // Escuchar cambios en preferencias del SO (respeta preferencia del usuario)
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Solo aplicar si no hay tema guardado
                if (!localStorage.getItem(this.storageKey)) {
                    const newTheme = e.matches ? this.darkTheme : this.lightTheme;
                    this.applyTheme(newTheme);
                }
            });
        }
    }
}

// Inicializar sistema de temas
const themeToggle = new ThemeToggle();
