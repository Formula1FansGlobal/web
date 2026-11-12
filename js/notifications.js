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

        // Se construye con el DOM (textContent) para que el mensaje nunca se interprete como HTML
        const iconEl = document.createElement('span');
        iconEl.className = 'notification-icon';
        iconEl.textContent = icons[type] || '•';

        const messageEl = document.createElement('span');
        messageEl.className = 'notification-message';
        messageEl.textContent = message;

        const closeEl = document.createElement('button');
        closeEl.className = 'notification-close';
        closeEl.setAttribute('aria-label', 'Cerrar');
        closeEl.textContent = '×';

        notification.append(iconEl, messageEl, closeEl);

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
