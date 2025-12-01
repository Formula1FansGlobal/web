// ===== REFERENCIAS A ELEMENTOS DEL DOM =====
let loginModal, signupModal, loginBtn, signupBtn, closeLoginBtn, closeSignupBtn;
let switchToSignup, switchToLogin, loginForm, signupForm;
let userMenu, userName, logoutBtn;

// ===== FUNCIONES DE MODALES =====
function openLoginModal() {
    if (loginModal && signupModal) {
        loginModal.classList.remove('hidden');
        signupModal.classList.add('hidden');
    }
}

function openSignupModal() {
    if (signupModal && loginModal) {
        signupModal.classList.remove('hidden');
        loginModal.classList.add('hidden');
    }
}

function closeModals() {
    if (loginModal && signupModal) {
        loginModal.classList.add('hidden');
        signupModal.classList.add('hidden');
    }
}

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
    if (loginBtn && signupBtn && userMenu && userName) {
        loginBtn.parentElement.style.display = 'none';
        signupBtn.parentElement.style.display = 'none';
        
        const navAuth = document.querySelector('.nav-auth');
        if (navAuth) navAuth.style.display = 'flex';
        
        userMenu.classList.remove('hidden');
        userName.textContent = `Bienvenido, ${name}`;
    }
}

// Ocultar menú de usuario
function hideUserMenu() {
    if (loginBtn && signupBtn && userMenu) {
        loginBtn.parentElement.style.display = 'block';
        signupBtn.parentElement.style.display = 'block';
        userMenu.classList.add('hidden');
    }
}

// ===== REGISTRO =====
function handleSignup(e) {
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
}

// ===== INICIO DE SESIÓN =====
function handleLogin(e) {
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
}

// ===== CERRAR SESIÓN =====
function handleLogout() {
    localStorage.removeItem('currentUser');
    hideUserMenu();
    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
    alert('Sesión cerrada');
}

// Función para obtener referencias a elementos
function getAuthElements() {
    loginModal = document.getElementById('login-modal');
    signupModal = document.getElementById('signup-modal');
    loginBtn = document.getElementById('login-btn');
    signupBtn = document.getElementById('signup-btn');
    closeLoginBtn = document.getElementById('close-login');
    closeSignupBtn = document.getElementById('close-signup');
    switchToSignup = document.getElementById('switch-to-signup');
    switchToLogin = document.getElementById('switch-to-login');
    loginForm = document.getElementById('login-form');
    signupForm = document.getElementById('signup-form');
    userMenu = document.getElementById('user-menu');
    userName = document.getElementById('user-name');
    logoutBtn = document.getElementById('logout-btn');
    
    setupEventListeners();
}

// Función para configurar event listeners
function setupEventListeners() {
    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
    if (signupBtn) signupBtn.addEventListener('click', openSignupModal);
    if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeModals);
    if (closeSignupBtn) closeSignupBtn.addEventListener('click', closeModals);
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            openSignupModal();
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            openLoginModal();
        });
    }

    // Cerrar modales al hacer clic fuera
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) closeModals();
        });
    }
    
    if (signupModal) {
        signupModal.addEventListener('click', (e) => {
            if (e.target === signupModal) closeModals();
        });
    }

    // Event listeners del formulario
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

// ===== INICIALIZAR =====
// Esperar a que el menú esté cargado antes de inicializar
function initAuth() {
    const requiredElements = [
        'login-modal',
        'signup-modal',
        'login-btn',
        'signup-btn',
        'close-login',
        'close-signup',
        'switch-to-signup',
        'switch-to-login',
        'login-form',
        'signup-form',
        'user-menu',
        'user-name',
        'logout-btn'
    ];

    // Verificar que todos los elementos existan
    const allElementsExist = requiredElements.every(id => document.getElementById(id));
    
    if (allElementsExist) {
        getAuthElements();
        checkUserSession();
    } else {
        // Reintentar después de 100ms
        setTimeout(initAuth, 100);
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
