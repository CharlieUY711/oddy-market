// ===  GUÍA DE DEBUG PASO A PASO ===

## PASO 1: Verificar que estás logueado
1. Abre la consola del navegador (F12)
2. Pega este código:

```javascript
const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
console.log("Usuario:", authData.currentSession?.user?.email);
console.log("Rol:", authData.currentSession?.user?.user_metadata?.role);
console.log("Token presente:", !!authData.currentSession?.access_token);
```

Si ves "Token presente: false", necesitas cerrar sesión y volver a iniciar.

## PASO 2: Verificar el error específico
Cuando intentes solicitar un rol y te dé error, abre la consola (F12) y:
1. Ve a la pestaña "Console"
2. Busca mensajes en rojo
3. Copia el mensaje de error exacto

## PASO 3: Errores Comunes y Soluciones

### Error: "No hay sesión activa"
**Solución**: Cierra sesión y vuelve a iniciar sesión

### Error: "You already have this role"
**Solución**: Ya tienes el rol que estás solicitando. Ve a tu perfil para verificar tu rol actual.

### Error: "You already have a pending role request"
**Solución**: Ya tienes una solicitud pendiente. Espera a que el administrador la revise.

### Error: "Unauthorized" o 401
**Solución**: Tu sesión expiró. Cierra sesión y vuelve a iniciar.

### Error: 500 (Internal Server Error)
**Solución**: Revisa los logs del servidor en la terminal donde está corriendo Deno.

## PASO 4: Test Manual desde la Consola

Pega esto en la consola para hacer una solicitud manual:

```javascript
async function testRoleRequest() {
  try {
    // Obtener token
    const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
    const token = authData.currentSession?.access_token;
    
    if (!token) {
      console.error("❌ No hay token disponible");
      return;
    }
    
    console.log("✅ Token encontrado");
    console.log("📤 Enviando solicitud...");
    
    // Cambiar YOUR_PROJECT_ID por tu ID real de Supabase
    const projectId = "YOUR_PROJECT_ID"; // <-- CAMBIAR ESTO
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/request-role`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestedRole: 'admin',  // o 'editor', 'proveedor'
          message: 'Test desde consola'
        })
      }
    );
    
    const data = await response.json();
    console.log("📥 Status:", response.status);
    console.log("📥 Response:", data);
    
    if (response.ok) {
      console.log("✅ ¡Solicitud enviada correctamente!");
    } else {
      console.log("❌ Error:", data.error);
    }
    
  } catch (error) {
    console.error("❌ Error completo:", error);
  }
}

// Ejecutar la prueba
testRoleRequest();
```

## PASO 5: Verificar Logs del Servidor

Si estás usando Deno/Supabase Functions localmente, revisa la terminal donde está corriendo el servidor.
Deberías ver logs como:

```
=== Role Request Started ===
User authenticated: usuario@email.com Current role: cliente
Requested role: admin
```

## PASO 6: Si nada funciona

1. **Cierra sesión completamente**
2. **Limpia el localStorage**: 
   ```javascript
   localStorage.clear();
   ```
3. **Recarga la página** (F5)
4. **Regístrate nuevamente** o inicia sesión
5. **Intenta de nuevo** solicitar el rol

## INFORMACIÓN ADICIONAL

### Endpoint de solicitud de rol:
```
POST /make-server-0dd48dc4/auth/request-role
```

### Body requerido:
```json
{
  "requestedRole": "editor" | "proveedor" | "admin",
  "message": "opcional"
}
```

### Headers requeridos:
```
Content-Type: application/json
Authorization: Bearer {ACCESS_TOKEN}
```

---

**Si después de seguir todos estos pasos sigue sin funcionar, por favor comparte:**
1. El mensaje de error exacto de la consola
2. Los logs del servidor (si tienes acceso)
3. Tu rol actual
4. El rol que estás intentando solicitar
