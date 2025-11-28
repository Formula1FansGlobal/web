// ===== MODALES DE AUTENTICACIÓN =====
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const closeLoginBtn = document.getElementById('close-login');
const closeSignupBtn = document.getElementById('close-signup');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Elementos de usuario
const userMenu = document.getElementById('user-menu');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// ===== FUNCIONES DE MODALES =====
function openLoginModal() {
    loginModal.classList.remove('hidden');
    signupModal.classList.add('hidden');
}

function openSignupModal() {
    signupModal.classList.remove('hidden');
    loginModal.classList.add('hidden');
}

function closeModals() {
    loginModal.classList.add('hidden');
    signupModal.classList.add('hidden');
}

// ===== EVENT LISTENERS MODALES =====
loginBtn.addEventListener('click', openLoginModal);
signupBtn.addEventListener('click', openSignupModal);
closeLoginBtn.addEventListener('click', closeModals);
closeSignupBtn.addEventListener('click', closeModals);
switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    openSignupModal();
});
switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    openLoginModal();
});

// Cerrar modales al hacer clic fuera
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModals();
});
signupModal.addEventListener('click', (e) => {
    if (e.target === signupModal) closeModals();
});

// ===== FUNCIONES DE AUTENTICACIÓN =====

// Verificar si hay usuario logueado
function checkUserSession() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        const userData = JSON.parse(user);
        showUserMenu(userData.name);
    }
}

// Mostrar menú de usuario
function showUserMenu(name) {
    loginBtn.parentElement.style.display = 'none';
    signupBtn.parentElement.style.display = 'none';
    
    document.querySelector('.nav-auth').style.display = 'flex';
    userMenu.classList.remove('hidden');
    userName.textContent = `Bienvenido, ${name}`;
}

// Ocultar menú de usuario
function hideUserMenu() {
    loginBtn.parentElement.style.display = 'block';
    signupBtn.parentElement.style.display = 'block';
    
    userMenu.classList.add('hidden');
}

// ===== REGISTRO =====
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const inputs = signupForm.querySelectorAll('input');
    const fullName = inputs[0].value;
    const email = inputs[1].value;
    const password = inputs[2].value;
    const confirmPassword = inputs[3].value;

    // Validaciones
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    // Obtener usuarios existentes
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Verificar si el email ya existe
    if (users.some(u => u.email === email)) {
        alert('Este email ya está registrado');
        return;
    }

    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        name: fullName,
        email: email,
        password: btoa(password), // Codificación simple (NO usar en producción)
        createdAt: new Date().toISOString()
    };

    // Guardar usuario
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Guardar sesión
    localStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    }));

    alert('¡Registro exitoso! Bienvenido ' + fullName);
    closeModals();
    showUserMenu(fullName);
    signupForm.reset();
});

// ===== INICIO DE SESIÓN =====
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs = loginForm.querySelectorAll('input');
    const email = inputs[0].value;
    const password = inputs[1].value;

    // Obtener usuarios
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Buscar usuario
    const user = users.find(u => u.email === email && u.password === btoa(password));

    if (!user) {
        alert('Email o contraseña incorrectos');
        return;
    }

    // Guardar sesión
    localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
    }));

    alert('¡Bienvenido ' + user.name + '!');
    closeModals();
    showUserMenu(user.name);
    loginForm.reset();
});

// ===== CERRAR SESIÓN =====
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    hideUserMenu();
    loginForm.reset();
    signupForm.reset();
    alert('Sesión cerrada');
});

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
});
