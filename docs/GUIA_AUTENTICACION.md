📋 GUÍA COMPLETA - SISTEMA DE AUTENTICACIÓN F1 STREAM

═══════════════════════════════════════════════════════════════════

📁 ESTRUCTURA DE ARCHIVOS NUEVOS
═════════════════════════════════

registro.html           - Página de registro de usuarios
login.html              - Página de login/inicio de sesión
test-auth.html          - Suite de pruebas del sistema
AUTH_SETUP.md           - Documentación técnica

js/registro.js          - Manejador de lógica del formulario de registro
js/login.js             - Manejador de lógica del formulario de login

css/auth-pages.css      - Estilos para páginas de autenticación (creado anteriormente)

═══════════════════════════════════════════════════════════════════

🚀 CÓMO USAR
════════════

1. ACCEDER A REGISTRO:
   - Abre: /registro.html
   - O haz clic en "Regístrate aquí" desde el login
   - Completa todos los campos requeridos (*)
   - Haz clic en "Crear Cuenta"

2. VALIDACIONES DE REGISTRO:
   ✓ Nombre/Apellido: 2+ caracteres
   ✓ Email: Formato válido (ej: user@example.com)
   ✓ Email confirmación: Debe coincidir exactamente
   ✓ Usuario: 3+ caracteres, sin duplicados
   ✓ Contraseña: 
     - Mínimo 8 caracteres
     - Debe incluir: MAYÚSCULA, número, símbolo (@$!%*?&)
   ✓ Confirmar contraseña: Debe coincidir
   ✓ Fecha nacimiento: Mínimo 13 años
   ✓ País: Seleccionar de lista
   ✓ Teléfono: 10+ dígitos
   ✓ Términos: Debe aceptarse

3. ACCEDER A LOGIN:
   - Abre: /login.html
   - Ingresa tu email o nombre de usuario
   - Ingresa tu contraseña
   - (Opcional) Marca "Recuérdame" para guardar email
   - Haz clic en "Iniciar Sesión"

4. FUNCIONES ESPECIALES:
   ✓ Toggle de contraseña: Haz clic en 👁️ para mostrar/ocultar
   ✓ Recuérdame: Guarda tu email para próximo login
   ✓ Recuperar contraseña: Enlace para funcionalidad futura
   ✓ Login social: Placeholders para Google/GitHub (próximamente)

═══════════════════════════════════════════════════════════════════

📊 PRUEBAS
══════════

Accede a: /test-auth.html

Funcionalidades testeable:
✓ Registro de usuario
✓ Detección de email duplicado
✓ Detección de usuario duplicado
✓ Validación de contraseña débil
✓ Validación de edad
✓ Login correcto
✓ Rechazo de contraseña incorrecta
✓ Detección de usuario no existente
✓ Función "Recuérdame"

═══════════════════════════════════════════════════════════════════

💾 ALMACENAMIENTO
═════════════════

Los datos se guardan en localStorage del navegador.

ESTRUCTURA EN STORAGE:

1. usuarios (Array)
   └─ Todos los usuarios registrados
      ├─ id: Timestamp único
      ├─ nombre: String
      ├─ apellido: String
      ├─ email: String (único)
      ├─ usuario: String (único)
      ├─ password: String (codificado con btoa)
      ├─ fechaNacimiento: Date
      ├─ pais: String
      ├─ estado: String
      ├─ telefono: String
      ├─ edad: Number
      ├─ createdAt: ISO DateTime
      └─ verificado: Boolean

2. currentUser (Object)
   └─ Usuario actualmente logueado
      ├─ id: Number
      ├─ nombre: String
      ├─ apellido: String
      ├─ usuario: String
      ├─ email: String
      └─ pais: String

3. loginRemember (Object)
   └─ Email guardado con "Recuérdame"
      ├─ email: String
      └─ recordado: Boolean

═══════════════════════════════════════════════════════════════════

🎨 DISEÑO Y UX
═══════════════

✓ Layout responsivo: Funciona en desktop, tablet y móvil
✓ Dos columnas: Info izq. + Formulario der.
✓ Tema F1: Colores rojo (#ff1e00), oro (#ffd700)
✓ Animaciones: Transiciones suaves para campos y modales
✓ Validación visual:
  - Borde rojo: Campo inválido
  - Borde verde: Campo válido
  - Mensaje de error: Auto-oculta después de 5 seg
  - Indicador seguridad contraseña: Débil/Medio/Fuerte

═══════════════════════════════════════════════════════════════════

🔐 SEGURIDAD (IMPORTANTE)
═════════════════════════

⚠️ ESTADO ACTUAL: DESARROLLO LOCAL
   - Las contraseñas se codifican con btoa() (básica)
   - Datos en localStorage (accesible por consola)
   - Sin encriptación HTTPS
   - Sin validación en servidor

✅ PARA PRODUCCIÓN NECESITAS:
   - Servidor backend (Node.js, Python, etc.)
   - HTTPS obligatorio
   - Contraseñas hasheadas con bcrypt/scrypt
   - JWT tokens para sesiones
   - Validación de email real
   - Rate limiting para prevenir fuerza bruta
   - 2FA (autenticación de dos factores)
   - Pruebas de seguridad

═══════════════════════════════════════════════════════════════════

🔧 INTEGRACIÓN CON EL MENÚ
════════════════════════════

El sistema se integra automáticamente con el menú:

1. Sin sesión activa:
   - Muestra botones "Iniciar Sesión" y "Registrarse"
   - Al hacer clic → Abre las páginas respectivas

2. Con sesión activa:
   - Muestra nombre del usuario
   - Botón "Cerrar Sesión"
   - El menú se actualiza desde currentUser

Requisitos:
- js/menu.js (inyecta menú desde menu.html)
- js/auth.js (maneja sesiones)
- menu.html (estructura del menú)
- css/menu.css (estilos del menú)

═══════════════════════════════════════════════════════════════════

📱 FLUJO DE USUARIO
═══════════════════

NUEVO USUARIO:
  index.html 
    → clic "Registrarse" 
    → registro.html 
    → completa formulario 
    → validaciones en tiempo real 
    → clic "Crear Cuenta" 
    → se guarda en localStorage 
    → redirige a index.html 
    → menú muestra usuario

USUARIO EXISTENTE:
  index.html 
    → clic "Iniciar Sesión" 
    → login.html 
    → ingresa credenciales 
    → validación en tiempo real 
    → clic "Iniciar Sesión" 
    → se valida en localStorage 
    → redirige a index.html 
    → menú muestra usuario

CERRAR SESIÓN:
  → clic "Cerrar Sesión" en menú 
  → se limpia currentUser 
    → menú vuelve a mostrar botones de login

═══════════════════════════════════════════════════════════════════

🎯 EJEMPLOS DE PRUEBA
═══════════════════════

USUARIO DE PRUEBA:
  Email: juan@example.com
  Usuario: juanperez
  Contraseña: Password123!
  
  (Crear en test-auth.html con botón "Probar Registro")

ERRORES A PROBAR:
  ✗ Email inválido: "notanemail"
  ✗ Contraseña débil: "weak123"
  ✗ Emails no coinciden: juan@test.com vs juan@email.com
  ✗ Contraseñas no coinciden: Password123! vs Password123
  ✗ Menor de edad: 2010-01-01 (14 años)
  ✗ Usuario muy corto: "ab"
  ✗ Teléfono inválido: "123"

═══════════════════════════════════════════════════════════════════

📝 PERSONALIZACIÓN
═══════════════════

Para modificar países:
  - Abre: registro.html (línea ~178)
  - Busca: <select id="pais">
  - Agrega/modifica opciones <option>

Para cambiar validaciones:
  - Abre: js/registro.js
  - Modifica funciones validarContraseña(), validarEmail(), etc.
  - Ajusta regex según necesidades

Para cambiar mensajes:
  - Abre: js/registro.js o js/login.js
  - Busca: mostrarMensaje("texto")
  - Cambia el texto

Para cambiar colores F1:
  - Abre: css/auth-pages.css
  - Variables de color principal:
    - Rojo: #ff1e00
    - Oro: #ffd700
    - Naranja: #ff6600
    - Azul oscuro: #0f3460, #1a1a2e

═══════════════════════════════════════════════════════════════════

🐛 TROUBLESHOOTING
═══════════════════

PROBLEMA: "El botón no hace nada"
SOLUCIÓN: Verifica que el archivo .js está referenciado en el HTML
          y que no hay errores en la consola (F12)

PROBLEMA: "No se guarda el usuario"
SOLUCIÓN: Verifica que localStorage está habilitado
          (Menú Dev Tools → Application → Local Storage)

PROBLEMA: "Validaciones no funcionan"
SOLUCIÓN: Abre consola (F12) y busca mensajes de error
          Verifica que los IDs en HTML coincidan con JS

PROBLEMA: "Contraseña no se valida"
SOLUCIÓN: La regex requiere: 8+ chars, MAYÚSCULA, número, símbolo
          Ejemplo correcto: Pass@123

PROBLEMA: "El email no se acepta"
SOLUCIÓN: Debe ser formato válido con @
          Ejemplos válidos: user@gmail.com, nombre@empresa.com

═══════════════════════════════════════════════════════════════════

📚 REFERENCIAS DE CÓDIGO
═════════════════════════

Validar email en JS:
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

Validar contraseña fuerte:
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

Validar teléfono:
  /^[\d\s\-\+\(\)]{10,}$/

Calcular edad:
  const edad = hoy.getFullYear() - nacimiento.getFullYear();

Decodificar contraseña:
  const original = atob(encrypted);

Codificar contraseña:
  const encrypted = btoa(password);

═══════════════════════════════════════════════════════════════════

✅ CHECKLIST DE IMPLEMENTACIÓN
════════════════════════════════

☑ registro.html creado y funcional
☑ login.html creado y funcional
☑ js/registro.js con validaciones completas
☑ js/login.js con lógica de sesión
☑ css/auth-pages.css con diseño responsivo
☑ Integración con localStorage
☑ Integración con menú.html
☑ test-auth.html para pruebas
☑ Documentación completa

PRÓXIMOS PASOS (OPCIONAL):
☐ Email verification real
☐ Password recovery functionality
☐ Firebase integration
☐ Google OAuth
☐ GitHub OAuth
☐ 2FA setup
☐ User profile page
☐ Password change
☐ Account deletion
☐ Backup/Export data

═══════════════════════════════════════════════════════════════════

¡El sistema está listo para usar! 🎉

Preguntas frecuentes:
Q: ¿Puedo usar esto en producción?
A: No aún. Se recomienda agregar un servidor backend con bcrypt.

Q: ¿Cómo agrego más países?
A: Edita el <select> en registro.html

Q: ¿Cómo cambio la contraseña requerida?
A: Modifica la regex en js/registro.js

Q: ¿Cómo integro Firebase?
A: Reemplaza localStorage con Firebase Realtime Database

═══════════════════════════════════════════════════════════════════
