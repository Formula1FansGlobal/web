// ===== ELEMENTOS DEL DOM =====
const form = document.getElementById('login-page-form');
const formMessage = document.getElementById('form-message');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');
const rememberMeCheckbox = document.getElementById('remember-me');
const emailInput = document.getElementById('email-usuario');

// ===== FUNCIONES =====

// Mostrar/ocultar contraseña
if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
}

// Mostrar mensaje
function mostrarMensaje(texto, tipo) {
    formMessage.textContent = texto;
    formMessage.className = `form-message show ${tipo}`;
    
    // Auto ocultar después de 5 segundos
    setTimeout(() => {
        formMessage.classList.add('hidden');
    }, 5000);
}

// Validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Cargar datos guardados (Remember me)
function cargarDatosGuardados() {
    const datosGuardados = localStorage.getItem('loginRemember');
    if (datosGuardados) {
        try {
            const datos = JSON.parse(datosGuardados);
            emailInput.value = datos.email;
            rememberMeCheckbox.checked = true;
        } catch (error) {
            console.error('Error al cargar datos guardados:', error);
        }
    }
}

// ===== EVENTO SUBMIT =====
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const emailUsuario = emailInput.value.trim();
    const password = passwordInput.value;
    const recuerdame = rememberMeCheckbox.checked;

    // Validaciones
    if (!emailUsuario) {
        mostrarMensaje('Por favor ingresa tu correo o nombre de usuario', 'error');
        return;
    }

    if (!password) {
        mostrarMensaje('Por favor ingresa tu contraseña', 'error');
        return;
    }

    try {
        // Obtener usuarios registrados
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        // Buscar usuario por email o nombre de usuario
        let usuarioEncontrado = usuarios.find(u => 
            u.email === emailUsuario || u.usuario === emailUsuario
        );

        if (!usuarioEncontrado) {
            mostrarMensaje('Correo o usuario no encontrado', 'error');
            return;
        }

        // Verificar contraseña
        const passwordDecodificada = atob(usuarioEncontrado.password);
        if (password !== passwordDecodificada) {
            mostrarMensaje('Contraseña incorrecta', 'error');
            return;
        }

        // Guardar Remember Me
        if (recuerdame) {
            localStorage.setItem('loginRemember', JSON.stringify({
                email: emailUsuario,
                recordado: true
            }));
        } else {
            localStorage.removeItem('loginRemember');
        }

        // Guardar sesión actual
        localStorage.setItem('currentUser', JSON.stringify({
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre,
            apellido: usuarioEncontrado.apellido,
            usuario: usuarioEncontrado.usuario,
            email: usuarioEncontrado.email,
            pais: usuarioEncontrado.pais
        }));

        mostrarMensaje(`✅ ¡Bienvenido ${usuarioEncontrado.nombre}!`, 'success');

        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        mostrarMensaje('Hubo un error al iniciar sesión. Intenta de nuevo.', 'error');
    }
});

// ===== ENLACES ÚTILES =====

// Enlace a registro
const signupLink = document.getElementById('signup-link');
if (signupLink) {
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'registro.html';
    });
}

// Enlace a recuperar contraseña (placeholder)
const forgotPasswordLink = document.getElementById('forgot-password');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarMensaje('Función de recuperación de contraseña - próximamente', 'info');
    });
}

// ===== SOCIAL LOGIN (Placeholders) =====

// Google Login
document.getElementById('google-btn')?.addEventListener('click', () => {
    mostrarMensaje('Integración de Google - próximamente', 'info');
    // Aquí iría el código de OAuth de Google
});

// GitHub Login
document.getElementById('github-btn')?.addEventListener('click', () => {
    mostrarMensaje('Integración de GitHub - próximamente', 'info');
    // Aquí iría el código de OAuth de GitHub
});

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosGuardados();
});
