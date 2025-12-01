🚀 INICIO RÁPIDO - SISTEMA DE AUTENTICACIÓN F1 STREAM

═══════════════════════════════════════════════════════════════════════

📍 UBICACIONES
═══════════════════════════════════════════════════════════════════════

Registro:          http://localhost:8000/registro.html
Login:             http://localhost:8000/login.html
Pruebas:           http://localhost:8000/test-auth.html

═══════════════════════════════════════════════════════════════════════

⚡ 5 PASOS PARA EMPEZAR
═══════════════════════════════════════════════════════════════════════

1️⃣  INICIA UN SERVIDOR LOCAL
    PowerShell (Windows):
    $ cd C:\Users\e5dtrf\Documents\web
    $ python -m http.server 8000
    
    O si usas Python 2:
    $ python -m SimpleHTTPServer 8000
    
    O si usas Node.js:
    $ npx http-server -p 8000

2️⃣  ABRE EL NAVEGADOR
    http://localhost:8000

3️⃣  PRUEBA EL REGISTRO
    - Haz clic en "Registrarse"
    - O accede directamente: http://localhost:8000/registro.html
    - Completa el formulario con:
      • Nombre: Juan
      • Apellido: Pérez
      • Email: juan@example.com
      • Usuario: juanperez
      • Contraseña: Password123! (debe cumplir requisitos)
      • Confirma todos los campos
      • Acepta términos
    - Haz clic en "Crear Cuenta"
    - ✅ Deberías ser redirigido a index.html

4️⃣  PRUEBA EL LOGIN
    - Accede a: http://localhost:8000/login.html
    - Ingresa:
      • Email: juan@example.com (o juanperez)
      • Contraseña: Password123!
    - Haz clic en "Iniciar Sesión"
    - ✅ Deberías ver tu nombre en el menú

5️⃣  VISUALIZA LOS DATOS
    - Abre DevTools (F12)
    - Ve a: Application → Local Storage
    - Busca: usuarios, currentUser
    - ✅ Deberías ver tus datos almacenados

═══════════════════════════════════════════════════════════════════════

🧪 SUITE DE PRUEBAS AUTOMÁTICAS
═══════════════════════════════════════════════════════════════════════

Para probar todas las funcionalidades automáticamente:

1. Abre: http://localhost:8000/test-auth.html
2. Verás botones para probar:
   - Registro
   - Duplicados (email/usuario)
   - Validación de contraseña
   - Validación de edad
   - Login correcto
   - Login con error
   - Etc.
3. Haz clic en cada botón y observa:
   - Historial de pruebas ✓/✗
   - Estado del localStorage
   - Usuarios registrados

═══════════════════════════════════════════════════════════════════════

✅ REQUISITOS BÁSICOS DE CONTRASEÑA
═══════════════════════════════════════════════════════════════════════

La contraseña DEBE cumplir TODOS estos requisitos:

✓ Mínimo 8 caracteres
✓ Incluir UNA mayúscula (A-Z)
✓ Incluir UN número (0-9)
✓ Incluir UN símbolo: @$!%*?&

EJEMPLOS VÁLIDOS:
  ✅ Password123!
  ✅ MyP@ss2024
  ✅ Secure#5678
  ✅ Test@Pass99

EJEMPLOS NO VÁLIDOS:
  ❌ password123! (sin mayúscula)
  ❌ PASSWORD!    (sin número)
  ❌ Pass123      (sin símbolo)
  ❌ Pass@12      (solo 7 caracteres)

═══════════════════════════════════════════════════════════════════════

🎨 PERSONALIZAR (OPCIONAL)
═══════════════════════════════════════════════════════════════════════

CAMBIAR COLORES F1:
  Archivo: css/auth-pages.css
  Busca: --color-red, --color-gold, etc.
  O busca: #ff1e00 (rojo) y #ffd700 (oro)
  Reemplaza con tus colores

AGREGAR PAÍSES:
  Archivo: registro.html
  Línea: ~178 (busca <select id="pais">)
  Agrega: <option value="XX">País</option>

CAMBIAR MENSAJES:
  Archivos: js/registro.js, js/login.js
  Busca: mostrarMensaje("texto")
  Cambia el texto según necesites

CAMBIAR REQUISITOS DE CONTRASEÑA:
  Archivo: js/registro.js
  Función: validarContraseña()
  Modifica la regex según necesites

═══════════════════════════════════════════════════════════════════════

🔍 VERIFICAR QUE TODO FUNCIONA
═══════════════════════════════════════════════════════════════════════

1. REVISA LA CONSOLA (F12):
   - Abre DevTools
   - Ve a Console
   - Shouldn't haber errores rojos
   - Si hay errores, verifica que los archivos JS existan

2. VERIFICA STORAGE (F12):
   - Ve a Application → Local Storage
   - Busca http://localhost:8000
   - Deberías ver: usuarios, currentUser, loginRemember

3. PRUEBA FLUJO COMPLETO:
   - Limpia storage (F12 → Storage → Delete All)
   - Crea nuevo usuario en /registro.html
   - Verifica que aparece en localStorage
   - Cierra sesión
   - Inicia sesión en /login.html
   - Verifica que currentUser se actualiza

═══════════════════════════════════════════════════════════════════════

❌ PROBLEMAS COMUNES
═══════════════════════════════════════════════════════════════════════

PROBLEMA: "Error en consola: Cannot find element with id"
SOLUCIÓN: Los IDs en HTML y JS no coinciden
         Verifica que los IDs sean exactos en registro.html y login.html

PROBLEMA: "Datos no se guardan"
SOLUCIÓN: localStorage no está disponible
         - Asegúrate que JavaScript está habilitado
         - Prueba en una pestaña privada/incognito
         - Limpia cookies y caché

PROBLEMA: "Contraseña no se acepta"
SOLUCIÓN: No cumple requisitos. Necesita:
         - 8+ caracteres
         - Una MAYÚSCULA
         - Un número
         - Un símbolo (@$!%*?&)
         Prueba: Password123!

PROBLEMA: "No puedo loguearme"
SOLUCIÓN: Verifica:
         - Email o usuario correcto
         - Contraseña exacta (mayúsculas/minúsculas)
         - Que el usuario exista (revisa localStorage)

PROBLEMA: "DevTools no muestra localStorage"
SOLUCIÓN: 
         - Abre DevTools con F12
         - Ve a "Application"
         - Asegúrate de estar en la pestaña correcta
         - Haz refresh (F5) para ver cambios

═══════════════════════════════════════════════════════════════════════

📚 DOCUMENTACIÓN COMPLETA
═══════════════════════════════════════════════════════════════════════

Para más información, consulta:

- GUIA_AUTENTICACION.md    → Guía completa con ejemplos
- AUTH_SETUP.md             → Documentación técnica
- RESUMEN_FINAL.txt         → Resumen de features
- test-auth.html            → Ejemplos funcionales
- Comentarios en el código  → Explicaciones inline

═══════════════════════════════════════════════════════════════════════

🎯 CASOS DE USO
═══════════════════════════════════════════════════════════════════════

CASO 1: Nuevo usuario
  → Va a /registro.html
  → Completa formulario
  → Click "Crear Cuenta"
  → Se guarda en localStorage
  → Ve index.html con sesión activa

CASO 2: Usuario existente
  → Va a /login.html
  → Ingresa credenciales
  → Click "Iniciar Sesión"
  → Se autentica desde localStorage
  → Ve index.html con sesión activa

CASO 3: "Recuérdame"
  → En login.html marca el checkbox
  → Se guarda el email
  → En próximo login, email ya está rellenado

CASO 4: Validaciones
  → Ingresa email sin @
  → Muestra error: "correo válido"
  → Ingresa contraseña débil
  → Muestra error: "Debe contener mayúscula, número y símbolo"

═══════════════════════════════════════════════════════════════════════

🔐 NOTAS DE SEGURIDAD
═══════════════════════════════════════════════════════════════════════

⚠️ PARA DESARROLLO LOCAL:
  ✓ Perfecto como está
  ✓ Usa localStorage
  ✓ Contraseñas codificadas con btoa()
  ✓ Ideal para demos y testing

⚠️ PARA PRODUCCIÓN:
  ❌ NO usar tal como está
  ✅ Necesitas:
     - Servidor backend (Node, Python, PHP, etc.)
     - HTTPS obligatorio
     - Contraseñas hasheadas con bcrypt/scrypt
     - JWT tokens o sesiones seguras
     - Validación de email real
     - Rate limiting
     - 2FA

═══════════════════════════════════════════════════════════════════════

✨ CARACTERÍSTICAS ESPECIALES
═══════════════════════════════════════════════════════════════════════

✓ Validación en tiempo real
  - Indicador de fortaleza de contraseña
  - Cambio de color de bordes
  - Mensajes inmediatos

✓ User-friendly
  - Toggle de visibilidad de contraseña
  - "Recuérdame" funcional
  - Búsqueda por email O usuario
  - Mensajes auto-ocultables

✓ Diseño responsivo
  - Dos columnas en desktop
  - Una columna en móvil
  - Colores F1 temáticos
  - Animaciones suaves

✓ Integración
  - Se conecta con el menú
  - Muestra usuario logueado
  - Botón logout funcional

═══════════════════════════════════════════════════════════════════════

🚀 PRÓXIMOS PASOS
═══════════════════════════════════════════════════════════════════════

Fase 1 (AHORA):
  ✓ Prueba en desarrollo local
  ✓ Familiarízate con las validaciones
  ✓ Usa test-auth.html para testing

Fase 2 (PRONTO):
  □ Integra con backend
  □ Usa bcrypt para contraseñas
  □ Implementa JWT tokens
  □ Agregar email verification

Fase 3 (DESPUÉS):
  □ 2FA (two-factor authentication)
  □ OAuth (Google, GitHub, Facebook)
  □ Perfil de usuario
  □ Social features

═══════════════════════════════════════════════════════════════════════

💡 TIPS PRO
═══════════════════════════════════════════════════════════════════════

1. EXPORTAR DATOS:
   F12 → Application → Local Storage → Clic derecho → Copy as JSON

2. IMPORTAR DATOS:
   Abre DevTools → Console
   Pega: localStorage.setItem('usuarios', '[...]')

3. LIMPIAR TODO:
   F12 → Storage → Clear Site Data
   O copia esto en Console:
   localStorage.clear(); location.reload();

4. DEBUGGEAR:
   F12 → Console
   Pega: JSON.parse(localStorage.getItem('usuarios'))
   Para ver todos los usuarios

5. PRUEBAS RÁPIDAS:
   Ve a test-auth.html para pruebas automáticas
   Sin necesidad de llenar formularios

═══════════════════════════════════════════════════════════════════════

❓ PREGUNTAS FRECUENTES
═══════════════════════════════════════════════════════════════════════

P: ¿Puedo cambiar los requisitos de contraseña?
R: Sí, edita la función validarContraseña() en js/registro.js

P: ¿Cómo agrego más países?
R: Agrega opciones en el <select id="pais"> de registro.html

P: ¿Dónde se guardan los datos?
R: En localStorage del navegador (F12 → Application → Local Storage)

P: ¿Qué pasa si limpio el caché?
R: Se pierden todos los datos (usuarios y sesión)

P: ¿Cómo hago que funcione sin Internet?
R: Ya funciona offline, todo está en localStorage

P: ¿Puedo usar esto en producción?
R: No, necesitas agregar un servidor backend

P: ¿Las contraseñas son seguras?
R: En desarrollo: btoa() (básico). En producción: bcrypt requerido

═══════════════════════════════════════════════════════════════════════

📞 SOPORTE
═══════════════════════════════════════════════════════════════════════

Si tienes problemas:

1. Revisa la CONSOLA (F12):
   - Busca errores en rojo
   - Lee el mensaje de error
   - Corrige según lo indicado

2. Consulta DOCUMENTACIÓN:
   - GUIA_AUTENTICACION.md
   - AUTH_SETUP.md
   - Comentarios en el código

3. USA TEST-AUTH.HTML:
   - Ejecuta pruebas automáticas
   - Visualiza el estado
   - Verifica sin formularios

4. LIMPIA DATOS:
   - F12 → Storage → Clear Site Data
   - Intenta de nuevo

═══════════════════════════════════════════════════════════════════════

                    ¡Listo para empezar! 🚀🏎️✨

═══════════════════════════════════════════════════════════════════════
