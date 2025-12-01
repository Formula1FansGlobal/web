// ===== CONFIGURACIÓN DE FIREBASE =====
// IMPORTANTE: Reemplaza estos valores con tus credenciales de Firebase
// NUNCA hagas commit de credenciales reales. Usa .env o variables de entorno.

const firebaseConfig = {
  apiKey: "AIzaSyDMXUg5B3IorDbKKOhrim-uUbYNCbCk2fY",
  authDomain: "formula1fansglobal.firebaseapp.com",
  databaseURL: "https://formula1fansglobal-default-rtdb.firebaseio.com",
  projectId: "formula1fansglobal",
  storageBucket: "formula1fansglobal.firebasestorage.app",
  messagingSenderId: "452676306454",
  appId: "1:452676306454:web:06fecfe1387fc2aa3f1737",
  measurementId: "G-2ZZP6CRH1V"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a las bases de datos
const db = firebase.database();
const auth = firebase.auth();

// ===== FUNCIONES AUXILIARES =====

// Guardar usuario en Realtime Database
function saveUserToDatabase(uid, userData) {
  return db.ref('usuarios/' + uid).set({
    name: userData.name,
    email: userData.email,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  });
}

// Obtener usuario de la base de datos
function getUserFromDatabase(uid) {
  return db.ref('usuarios/' + uid).once('value').then(snapshot => {
    return snapshot.val();
  });
}

// Actualizar último login
function updateLastLogin(uid) {
  return db.ref('usuarios/' + uid + '/lastLogin').set(new Date().toISOString());
}
