// ===== VALIDACIONES =====
const form = document.getElementById('signup-page-form');
const formMessage = document.getElementById('form-message');

// Validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validar contraseña fuerte (mínimo 8 caracteres, mayúscula, número, símbolo)
function validarContraseña(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

// Validar teléfono
function validarTelefono(telefono) {
    const regex = /^[\d\s\-\+\(\)]{10,}$/;
    return regex.test(telefono);
}

// Calcular edad
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return edad;
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

// ===== EVENTO SUBMIT =====
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtener valores
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email = document.getElementById('email').value.trim();
    const confirmarEmail = document.getElementById('confirmar-email').value.trim();
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;
    const confirmarPassword = document.getElementById('confirmar-password').value;
    const fechaNacimiento = document.getElementById('fecha-nacimiento').value;
    const pais = document.getElementById('pais').value;
    const estado = document.getElementById('estado').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const terminos = document.getElementById('terminos').checked;

    // Validaciones
    if (!nombre || !apellido) {
        mostrarMensaje('Por favor ingresa nombre y apellido', 'error');
        return;
    }

    if (nombre.length < 2 || apellido.length < 2) {
        mostrarMensaje('Nombre y apellido deben tener al menos 2 caracteres', 'error');
        return;
    }

    if (!validarEmail(email)) {
        mostrarMensaje('Por favor ingresa un correo válido', 'error');
        return;
    }

    if (email !== confirmarEmail) {
        mostrarMensaje('Los correos no coinciden', 'error');
        return;
    }

    if (!usuario || usuario.length < 3) {
        mostrarMensaje('Nombre de usuario debe tener al menos 3 caracteres', 'error');
        return;
    }

    if (!validarContraseña(password)) {
        mostrarMensaje('Contraseña debe tener 8+ caracteres, mayúscula, número y símbolo (@$!%*?&)', 'error');
        return;
    }

    if (password !== confirmarPassword) {
        mostrarMensaje('Las contraseñas no coinciden', 'error');
        return;
    }

    if (!fechaNacimiento) {
        mostrarMensaje('Por favor selecciona tu fecha de nacimiento', 'error');
        return;
    }

    const edad = calcularEdad(fechaNacimiento);
    if (edad < 13) {
        mostrarMensaje('Debes ser mayor de 13 años para registrarte', 'error');
        return;
    }

    if (!pais) {
        mostrarMensaje('Por favor selecciona tu país', 'error');
        return;
    }

    if (!estado) {
        mostrarMensaje('Por favor ingresa tu estado o región', 'error');
        return;
    }

    if (!validarTelefono(telefono)) {
        mostrarMensaje('Por favor ingresa un teléfono válido', 'error');
        return;
    }

    if (!terminos) {
        mostrarMensaje('Debes aceptar los términos y condiciones', 'error');
        return;
    }

    // ===== GUARDAR USUARIO =====
    try {
        // Obtener usuarios existentes
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        // Verificar si el email ya existe
        if (usuarios.some(u => u.email === email)) {
            mostrarMensaje('Este correo ya está registrado', 'error');
            return;
        }

        // Verificar si el usuario ya existe
        if (usuarios.some(u => u.usuario === usuario)) {
            mostrarMensaje('Este nombre de usuario ya está en uso', 'error');
            return;
        }

        // Crear nuevo usuario
        const nuevoUsuario = {
            id: Date.now(),
            nombre: nombre,
            apellido: apellido,
            email: email,
            usuario: usuario,
            password: btoa(password), // Codificación simple (NO usar en producción - usar bcrypt en servidor real)
            fechaNacimiento: fechaNacimiento,
            pais: pais,
            estado: estado,
            telefono: telefono,
            edad: edad,
            createdAt: new Date().toISOString(),
            verificado: false // Email no verificado aún
        };

        // Guardar usuario
        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Guardar sesión
        localStorage.setItem('currentUser', JSON.stringify({
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            apellido: nuevoUsuario.apellido,
            usuario: nuevoUsuario.usuario,
            email: nuevoUsuario.email,
            pais: nuevoUsuario.pais
        }));

        mostrarMensaje('✅ ¡Registro exitoso! Redirigiendo...', 'success');

        // Redirigir después de 2 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error('Error al registrar:', error);
        mostrarMensaje('Hubo un error al registrar. Intenta de nuevo.', 'error');
    }
});

// ===== VALIDACIÓN EN TIEMPO REAL =====

// Validar contraseña mientras se escribe
document.getElementById('password').addEventListener('input', (e) => {
    const password = e.target.value;
    const requerimientos = {
        longitud: password.length >= 8,
        mayuscula: /[A-Z]/.test(password),
        numero: /\d/.test(password),
        simbolo: /[@$!%*?&]/.test(password)
    };

    // Mostrar indicador de seguridad
    let texto = '';
    if (password.length === 0) texto = '';
    else if (Object.values(requerimientos).filter(v => v).length < 2) texto = '⚠️ Débil';
    else if (Object.values(requerimientos).filter(v => v).length < 4) texto = '🟡 Medio';
    else texto = '✅ Fuerte';

    const small = document.querySelector('#password ~ small');
    if (small) {
        small.textContent = small.textContent.split('\n')[0] + '\n' + texto;
    }
});

// Mostrar/ocultar contraseña
document.getElementById('confirmar-password').addEventListener('input', (e) => {
    const password = document.getElementById('password').value;
    const confirmar = e.target.value;
    
    if (confirmar && password !== confirmar) {
        e.target.style.borderColor = '#f44336';
    } else if (confirmar && password === confirmar) {
        e.target.style.borderColor = '#4caf50';
    } else {
        e.target.style.borderColor = '#ff1e00';
    }
});

// Validar email en tiempo real
document.getElementById('email').addEventListener('blur', (e) => {
    if (e.target.value && !validarEmail(e.target.value)) {
        e.target.style.borderColor = '#f44336';
    } else {
        e.target.style.borderColor = '#ff1e00';
    }
});
