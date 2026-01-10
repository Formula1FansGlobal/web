# Política de Seguridad

## Versiones Soportadas

Actualmente soportamos la versión en producción desplegada en GitHub Pages:

| Versión | Soportada          |
| ------- | ------------------ |
| Producción (main branch) | :white_check_mark: |
| Versiones anteriores     | :x:                |

## Reportar una Vulnerabilidad

Formula 1 Fans Global toma en serio la seguridad de nuestro sitio web y la privacidad de nuestros usuarios.

### ¿Encontraste una vulnerabilidad de seguridad?

**Por favor NO la hagas pública.** Repórtala de forma responsable siguiendo estos pasos:

1. **Reporta de forma privada** usando [GitHub Security Advisories](https://github.com/Formula1FansGlobal/web/security/advisories/new)
2. Proporciona detalles completos (ver sección "Información a Incluir" abajo)
3. Espera nuestra confirmación (respondemos en 48-72 horas)

### Información a Incluir en tu Reporte

Para ayudarnos a entender y corregir el problema rápidamente, incluye:

- **Descripción clara** del problema de seguridad
- **Pasos para reproducir** la vulnerabilidad
- **Impacto potencial** (¿qué podría hacer un atacante?)
- **Versión afectada** (URL de la página, navegador, etc.)
- **Prueba de concepto** (si es posible, sin causar daño)
- **Tu información de contacto** (para seguimiento)

### Qué Esperar

1. **Confirmación**: Confirmaremos la recepción en 48-72 horas
2. **Evaluación**: Evaluaremos el problema en 5-7 días
3. **Corrección**: Trabajaremos en una solución
4. **Divulgación**: Una vez corregido, coordinaremos la divulgación pública
5. **Reconocimiento**: Con tu permiso, te acreditaremos en nuestro README

### Alcance de Seguridad

Este proyecto es un **sitio web estático** alojado en GitHub Pages. Nuestras áreas de enfoque incluyen:

✅ **En alcance:**
- Cross-Site Scripting (XSS)
- Content Security Policy (CSP) bypasses
- Inyección de código en páginas
- Problemas de privacidad de usuarios
- Exposición de información sensible
- Problemas de autenticación/autorización

❌ **Fuera de alcance:**
- Vulnerabilidades en GitHub Pages (reportar a GitHub)
- Vulnerabilidades en CDNs de terceros (jsdelivr, Google Fonts)
- APIs externas (NewsData.io, etc.)
- Ataques de ingeniería social
- Spam o abuso de formularios
- Problemas de disponibilidad (DoS/DDoS)

### Limitaciones Conocidas

Como sitio estático en GitHub Pages:
- No tenemos control sobre headers HTTP del servidor
- DNSSEC no está disponible (limitación de GitHub Pages)
- Algunos headers de seguridad solo pueden configurarse via CSP

### Divulgación Responsable

Seguimos los principios de **divulgación responsable**:

- No divulgaremos detalles hasta que se corrija el problema
- Te daremos crédito por tu descubrimiento (si lo deseas)
- Trabajaremos contigo para entender y corregir el problema
- Actualizaremos esta política según sea necesario

## Contacto

- **Reportar vulnerabilidad**: [GitHub Security Advisories](https://github.com/Formula1FansGlobal/web/security/advisories/new)
- **Repositorio**: [Formula1FansGlobal/web](https://github.com/Formula1FansGlobal/web)
- **Security.txt**: [/.well-known/security.txt](https://formula1fansglobal.github.io/web/.well-known/security.txt)

## Agradecimientos

Agradecemos a los investigadores de seguridad que nos ayudan a mantener Formula 1 Fans Global seguro:

<!-- Los contribuyentes serán listados aquí -->

---

**Última actualización**: 9 de enero de 2025
