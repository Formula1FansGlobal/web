// Chat en vivo simple sin backend
// Usa localStorage para simular mensajes (solo visible para el usuario)
// Para chat real entre usuarios, necesitarías Firebase o similar

class SimpleChat {
    constructor() {
        this.messages = [];
        this.maxMessages = 50;
        this.form = document.getElementById('chat-form');
        this.messagesContainer = document.getElementById('chat-messages');
        this.usernameInput = document.getElementById('chat-username');
        this.messageInput = document.getElementById('chat-message');
        this.onlineCount = document.getElementById('online-count');
        
        this.init();
    }

    init() {
        // Cargar mensajes previos
        this.loadMessages();
        
        // Configurar envío de mensajes
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Simular usuarios online (número aleatorio)
        this.updateOnlineCount();
        setInterval(() => this.updateOnlineCount(), 30000);

        // Guardar nombre de usuario en localStorage
        const savedUsername = localStorage.getItem('chatUsername');
        if (savedUsername) {
            this.usernameInput.value = savedUsername;
        }
    }

    loadMessages() {
        const saved = localStorage.getItem('chatMessages');
        if (saved) {
            try {
                this.messages = JSON.parse(saved);
                this.renderMessages();
            } catch (e) {
                console.error('Error cargando mensajes:', e);
            }
        }
    }

    saveMessages() {
        try {
            localStorage.setItem('chatMessages', JSON.stringify(this.messages));
        } catch (e) {
            console.error('Error guardando mensajes:', e);
        }
    }

    sendMessage() {
        const username = this.usernameInput.value.trim();
        const messageText = this.messageInput.value.trim();

        if (!username || !messageText) return;

        // Guardar nombre de usuario
        localStorage.setItem('chatUsername', username);

        // Crear mensaje
        const message = {
            username: username,
            text: messageText,
            timestamp: Date.now()
        };

        // Agregar mensaje
        this.messages.push(message);

        // Limitar cantidad de mensajes
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }

        // Guardar y renderizar
        this.saveMessages();
        this.renderMessages();

        // Limpiar input
        this.messageInput.value = '';
        this.messageInput.focus();
    }

    renderMessages() {
        // Limpiar contenedor
        this.messagesContainer.innerHTML = '';

        if (this.messages.length === 0) {
            this.messagesContainer.innerHTML = `
                <div class="chat-welcome">
                    <p>¡Bienvenido al chat! Comparte tu emoción por la carrera.</p>
                </div>
            `;
            return;
        }

        // Renderizar mensajes
        this.messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = 'chat-message';
            
            const time = new Date(msg.timestamp);
            const timeStr = time.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            messageEl.innerHTML = `
                <div class="chat-message-header">
                    <span class="chat-username">${this.escapeHtml(msg.username)}</span>
                    <span class="chat-time">${timeStr}</span>
                </div>
                <div class="chat-message-text">${this.escapeHtml(msg.text)}</div>
            `;

            this.messagesContainer.appendChild(messageEl);
        });

        // Scroll al final
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    updateOnlineCount() {
        // Simular usuarios online (entre 15 y 45)
        const count = Math.floor(Math.random() * 30) + 15;
        this.onlineCount.textContent = `${count} en línea`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar chat cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new SimpleChat();
});
