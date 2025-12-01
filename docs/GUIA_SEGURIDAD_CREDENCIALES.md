📋 GUÍA PARA ASEGURAR CREDENCIALES Y CONFIGURAR GITHUB SECRETS

═════════════════════════════════════════════════════════════════════════

✅ PASO 1: ROTAR LAS CLAVES EN FIREBASE (URGENTE)
═════════════════════════════════════════════════════════════════════════

Por qué: Las credenciales estaban en el repositorio público (aunque movidas a placeholders).

Cómo hacerlo:

1. Ve a Firebase Console:
   https://console.firebase.google.com/

2. Selecciona tu proyecto:
   "Formula1FansGlobal"

3. Haz clic en ⚙️ (Settings) en la esquina superior derecha

4. Ve a la pestaña "Service Accounts"

5. Haz clic en "Database Secrets"

6. Busca tu API Key actual y haz clic en 🗑️ (eliminar)

7. Confirma la eliminación

8. La nueva API key se generará automáticamente

9. Copia la nueva clave y guárdala de forma segura

⚠️ IMPORTANTE: 
   - Las claves viejas expuestas quedan inactivas después de ~7 días
   - Para acelerar, elimínalas manualmente como se indica arriba
   - Opcionalmente, en Google Cloud Console, restringe el HTTP referrer

═════════════════════════════════════════════════════════════════════════

✅ PASO 2: CONFIGURAR GITHUB SECRETS
═════════════════════════════════════════════════════════════════════════

Esto permite que GitHub Actions inyecte las credenciales en el build.

1. Ve a tu repositorio en GitHub:
   https://github.com/Formula1FansGlobal/web

2. Haz clic en Settings (pestaña)

3. En el menú izquierdo, ve a:
   "Secrets and variables" → "Actions"

4. Haz clic en "New repository secret" (botón verde)

5. Crea un secret con el nombre y valor:
   
   Nombre: FIREBASE_API_KEY
   Valor: <tu_nueva_api_key>
   
   (Repite para cada variable)

6. Las variables a crear son:
   
   ┌─────────────────────────────────────┬──────────────────────────────┐
   │ Nombre del Secret                   │ Valor (de Firebase Console)  │
   ├─────────────────────────────────────┼──────────────────────────────┤
   │ FIREBASE_API_KEY                    │ Tu API Key (nueva)           │
   │ FIREBASE_AUTH_DOMAIN                │ tu-proyecto.firebaseapp.com  │
   │ FIREBASE_DATABASE_URL               │ https://...firebaseio.com    │
   │ FIREBASE_PROJECT_ID                 │ tu-proyecto-id               │
   │ FIREBASE_STORAGE_BUCKET             │ tu-proyecto.appspot.com      │
   │ FIREBASE_MESSAGING_SENDER_ID        │ Tu Sender ID                 │
   │ FIREBASE_APP_ID                     │ Tu App ID                    │
   │ FIREBASE_MEASUREMENT_ID             │ Tu Measurement ID            │
   └─────────────────────────────────────┴──────────────────────────────┘

7. Cada vez que hagas push a main, GitHub Actions:
   - Leerá estos secretos
   - Generará js/firebase-config.js con las credenciales reales
   - Deployará a GitHub Pages
   - El archivo js/firebase-config.js NO se guardará en el repo

═════════════════════════════════════════════════════════════════════════

✅ PASO 3: VERIFICAR QUE FUNCIONA
═════════════════════════════════════════════════════════════════════════

1. Ve a tu repositorio → "Actions" (pestaña)

2. Deberías ver un workflow llamado "Build and Deploy to GitHub Pages"

3. Si el último push fue después de configurar Secrets, 
   debería haber un run ejecutándose (o completado)

4. Haz clic en el run más reciente

5. Verifica que pasó sin errores:
   ✅ "Create firebase-config.js from secrets" → Success
   ✅ "Deploy to GitHub Pages" → Success

6. Si hay errores, revisa:
   - Que los nombres de los Secrets sean exactos
   - Que los valores sean correctos
   - Los logs del workflow

═════════════════════════════════════════════════════════════════════════

✅ PASO 4: PROBAR LOCALMENTE (OPCIONAL)
═════════════════════════════════════════════════════════════════════════

Para seguir desarrollando localmente sin credenciales en el repo:

1. Copia .env.example a .env:
   cp .env.example .env

2. Abre .env en tu editor y reemplaza los placeholders con tus valores

3. Crea un script local que lea .env y genere js/firebase-config.js:

   PowerShell (run-local.ps1):
   ──────────────────────────────
   $envContent = Get-Content .env
   $configContent = @"
   const firebaseConfig = {
   "@
   
   foreach ($line in $envContent) {
       if ($line.StartsWith("FIREBASE_")) {
           $key, $value = $line.Split('=')
           $jsKey = $key.Replace('FIREBASE_', '').ToLower()
           $jsKey = [regex]::Replace($jsKey, '([A-Z])', '_$1').ToLower().TrimStart('_')
           $configContent += "`n  $jsKey: `"$value`","
       }
   }
   
   $configContent += @"
   };
   
   firebase.initializeApp(firebaseConfig);
   const db = firebase.database();
   const auth = firebase.auth();
   ...
   "@
   
   Set-Content -Path "js/firebase-config.js" -Value $configContent

4. Ejecuta este script antes de hacer push (o después de git pull)

5. IMPORTANTE: .env nunca debe hacer commit (ya está en .gitignore)

═════════════════════════════════════════════════════════════════════════

✅ PASO 5: CONFIGURAR FIREBASE SECURITY RULES
═════════════════════════════════════════════════════════════════════════

AHORA que no hay credenciales expuestas, configura las reglas de Realtime Database:

1. Ve a Firebase Console:
   https://console.firebase.google.com/

2. Selecciona tu proyecto → Realtime Database

3. Ve a la pestaña "Rules" (Reglas)

4. Reemplaza todo con esto:

{
  "rules": {
    "usuarios": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid",
        ".validate": "newData.hasChildren(['email', 'nombre']) && newData.child('email').isString() && newData.child('nombre').isString()"
      }
    },
    ".read": false,
    ".write": false
  }
}

5. Haz clic en "Publish" (Publicar)

Qué hacen estas reglas:
  ✓ Solo usuarios autenticados pueden leer/escribir bajo /usuarios/{su-uid}
  ✓ Cada usuario solo ve/modifica sus propios datos
  ✓ Se valida que email y nombre existan
  ✓ El resto de la BD está bloqueada

═════════════════════════════════════════════════════════════════════════

✅ PASO 6: VERIFICAR LA SEGURIDAD
═════════════════════════════════════════════════════════════════════════

Abre tu navegador en consola y prueba:

// Esto debería fallar (no autenticado):
firebase.database().ref('usuarios').on('value', (snap) => console.log(snap.val()));
// Error: Permission denied

// Después de login, esto debería funcionar (tu UID):
firebase.database().ref(`usuarios/${currentUser.uid}`).get().then(snap => console.log(snap.val()));
// ✓ Datos de ese usuario

═════════════════════════════════════════════════════════════════════════

✅ RESUMEN DE LO QUE HICIMOS
═════════════════════════════════════════════════════════════════════════

1. ✓ Movimos documentación a /docs
2. ✓ Reemplazamos credenciales en js/firebase-config.js por placeholders
3. ✓ Creamos .github/workflows/deploy.yml que inyecta secretos desde GitHub
4. ✓ Actualizamos .env.example con instrucciones claras
5. ✓ Hicimos commit y push sin credenciales en el repo

PRÓXIMAS ACCIONES (POR HACER):

□ PASO 1: Rotar API key en Firebase Console
□ PASO 2: Configurar GitHub Secrets con las nuevas credenciales
□ PASO 3: Verificar que GitHub Actions funciona correctamente
□ PASO 4: Crear .env local para desarrollo (sin commit)
□ PASO 5: Configurar Firebase Security Rules
□ PASO 6: Probar que todo funciona

═════════════════════════════════════════════════════════════════════════

📊 FLUJO DE SEGURIDAD FINAL
═════════════════════════════════════════════════════════════════════════

Desarrollo Local:
  → .env (archivo local, no en repo)
  → genera js/firebase-config.js
  → Funciona en localhost

Push a GitHub:
  → Código SIN credenciales
  → GitHub Actions se dispara
  → Lee GitHub Secrets
  → Genera js/firebase-config.js con credenciales reales
  → Deploy a GitHub Pages

GitHub Pages (Público):
  → js/firebase-config.js con credenciales inyectadas
  → Funcionando en producción

═════════════════════════════════════════════════════════════════════════

💡 VENTAJAS DE ESTE ENFOQUE
═════════════════════════════════════════════════════════════════════════

✅ Credenciales NUNCA en el repositorio
✅ Credenciales NUNCA en el historio de git
✅ GitHub Pages obtiene credenciales reales en runtime
✅ Desarrolladores locales usan .env (no en repo)
✅ Fácil rotación de credenciales (solo actualizar GitHub Secrets)
✅ Firebase Rules protege el acceso a datos
✅ Workflow automático en cada push

═════════════════════════════════════════════════════════════════════════

¿PREGUNTAS FRECUENTES?
═════════════════════════════════════════════════════════════════════════

P: ¿Las credenciales en GitHub Secrets se ven en el código?
R: No. Son secretos cifrados. Solo GitHub Actions puede leerlas.

P: ¿Qué pasa si alguien hace git clone?
R: Obtiene el código SIN credenciales. Si quiere ejecutar localmente, 
   necesita crear su propio .env con sus credenciales.

P: ¿Qué pasa si expongo accidentalmente .env?
R: Solo afecta a TI. El .env.example en el repo no tiene credenciales.
   Cambia tus keys en Firebase Console.

P: ¿Cómo roto las credenciales después?
R: Genera nuevas en Firebase → Actualiza GitHub Secrets → Done.

P: ¿Y si el workflow falla?
R: Revisa Actions → últimas ejecuciones → logs.
   Causas comunes: nombres incorrectos de Secrets, valores vacíos.

═════════════════════════════════════════════════════════════════════════

SIGUIENTE PASO:
Sigue los 6 pasos de arriba para completar la configuración.
Después de eso, tu página estará segura para publicar. 🚀

═════════════════════════════════════════════════════════════════════════
