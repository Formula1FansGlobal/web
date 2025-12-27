// Sistema de Notificaciones Toast
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crear contenedor de notificaciones
        this.container = document.createElement('div');
        this.container.id = 'notifications-container';
        this.container.className = 'notifications-container';
        document.body.appendChild(this.container);

        // Exponer función global
        window.showNotification = (message, type = 'success', duration = 3000) => {
            this.show(message, type, duration);
        };
    }

    show(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Icono según tipo
        const icons = {
            'success': '✓',
            'error': '✕',
            'info': 'ℹ',
            'warning': '⚠'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || '•'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Cerrar">×</button>
        `;

        // Agregar al contenedor
        this.container.appendChild(notification);

        // Cerrar manualmente
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.remove(notification);
        });

        // Auto-cerrar después de duration
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        // Animación de entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        return notification;
    }

    remove(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Inicializar sistema de notificaciones
const notificationSystem = new NotificationSystem();
