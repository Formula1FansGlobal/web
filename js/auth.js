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
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.log('Firebase no está disponible. Usando sesión local.');
        const user = localStorage.getItem('currentUser');
        if (user) {
            const userData = JSON.parse(user);
            showUserMenu(userData.name);
        }
        return;
    }

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Usuario logueado en Firebase
            firebase.database().ref('usuarios/' + user.uid).once('value').then(snapshot => {
                const userData = snapshot.val();
                if (userData) {
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: user.uid,
                        name: userData.name,
                        email: userData.email
                    }));
                    showUserMenu(userData.name);
                }
            });
        } else {
            hideUserMenu();
        }
    });
}

// ===== REGISTRO CON FIREBASE =====
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

    if (!fullName || fullName.length < 2) {
        alert('Por favor ingresa un nombre válido');
        return;
    }

    // Usar Firebase Authentication
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const uid = userCredential.user.uid;
                
                // Guardar datos en Realtime Database
                return firebase.database().ref('usuarios/' + uid).set({
                    name: fullName,
                    email: email,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                });
            })
            .then(() => {
                alert('¡Registro exitoso! Bienvenido ' + fullName);
                closeModals();
                signupForm.reset();
                checkUserSession();
            })
            .catch((error) => {
                console.error('Error en registro:', error);
                if (error.code === 'auth/email-already-in-use') {
                    alert('Este email ya está registrado');
                } else if (error.code === 'auth/invalid-email') {
                    alert('Email inválido');
                } else {
                    alert('Error en registro: ' + error.message);
                }
            });
    } else {
        // Fallback a localStorage si Firebase no está disponible
        console.log('Firebase no disponible. Usando localStorage.');
        let users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(u => u.email === email)) {
            alert('Este email ya está registrado');
            return;
        }

        const newUser = {
            id: Date.now(),
            name: fullName,
            email: email,
            password: btoa(password),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
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
}

// ===== INICIO DE SESIÓN CON FIREBASE =====
function handleLogin(e) {
    e.preventDefault();

    const inputs = loginForm.querySelectorAll('input');
    const email = inputs[0].value;
    const password = inputs[1].value;

    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    // Usar Firebase Authentication
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const uid = userCredential.user.uid;
                
                // Actualizar último login
                return firebase.database().ref('usuarios/' + uid + '/lastLogin').set(new Date().toISOString());
            })
            .then(() => {
                // Obtener datos del usuario
                const user = firebase.auth().currentUser;
                return firebase.database().ref('usuarios/' + user.uid).once('value');
            })
            .then(snapshot => {
                const userData = snapshot.val();
                if (userData) {
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: firebase.auth().currentUser.uid,
                        name: userData.name,
                        email: userData.email
                    }));
                    alert('¡Bienvenido ' + userData.name + '!');
                    closeModals();
                    showUserMenu(userData.name);
                    loginForm.reset();
                }
            })
            .catch((error) => {
                console.error('Error en login:', error);
                if (error.code === 'auth/user-not-found') {
                    alert('Usuario no encontrado');
                } else if (error.code === 'auth/wrong-password') {
                    alert('Contraseña incorrecta');
                } else {
                    alert('Error en login: ' + error.message);
                }
            });
    } else {
        // Fallback a localStorage si Firebase no está disponible
        console.log('Firebase no disponible. Usando localStorage.');
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === btoa(password));

        if (!user) {
            alert('Email o contraseña incorrectos');
            return;
        }

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
}

// ===== CERRAR SESIÓN =====
function handleLogout() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().then(() => {
            localStorage.removeItem('currentUser');
            hideUserMenu();
            if (loginForm) loginForm.reset();
            if (signupForm) signupForm.reset();
            alert('Sesión cerrada');
        }).catch((error) => {
            console.error('Error al cerrar sesión:', error);
            // Cerrar sesión localmente de todas formas
            localStorage.removeItem('currentUser');
            hideUserMenu();
        });
    } else {
        // Fallback a localStorage
        localStorage.removeItem('currentUser');
        hideUserMenu();
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
        alert('Sesión cerrada');
    }
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
        
        // Esperar a que Firebase esté disponible
        waitForFirebase().then(() => {
            console.log('Firebase inicializado correctamente');
            checkUserSession();
        }).catch(() => {
            console.log('Firebase no disponible. Usando sesión local.');
            checkUserSession();
        });
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
