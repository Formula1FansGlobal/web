// ===== CONFIGURACIÓN DE FIREBASE =====
// IMPORTANTE: Reemplaza estos valores con tus credenciales de Firebase
// NUNCA hagas commit de credenciales reales. Usa .env o variables de entorno.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
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
