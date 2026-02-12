# 🔐 GUÍA COMPLETA: Solucionar "Invalid login credentials"

## 🎯 TU SITUACIÓN
- **Usuario existente en Supabase**: cvarlla@gmail.com (Carlos Varalla)
- **Problema**: No puedes iniciar sesión
- **Error**: "Invalid login credentials"

---

## ✅ SOLUCIONES (Elige UNA)

### **OPCIÓN 1: Resetear Contraseña desde Supabase Dashboard** ⭐ MÁS FÁCIL

1. Ve a: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth/users
2. Encuentra tu usuario: **cvarlla@gmail.com**
3. Click en el usuario
4. En el panel derecho, busca **"Reset Password"** o **"Update User"**
5. Establece una nueva contraseña
6. Guarda los cambios
7. ✅ Inicia sesión en ODDY Market con la nueva contraseña

---

### **OPCIÓN 2: Usar el Script de Reset (RÁPIDO)**

1. **Edita el archivo** `/RESET_PASSWORD.js`:
   ```javascript
   const CONFIG = {
     email: "cvarlla@gmail.com",      // ✅ Ya está correcto
     nuevaContrasena: "MiNuevaPassword123", // 👈 CAMBIA ESTO
     projectId: "TU_PROJECT_ID"       // 👈 CAMBIA ESTO
   };
   ```

2. **Opción A - Desde la terminal del servidor:**
   ```bash
   deno run --allow-net RESET_PASSWORD.js
   ```

3. **Opción B - Desde la consola del navegador:**
   - Abre ODDY Market
   - F12 → Console
   - Copia y pega TODO el contenido de `RESET_PASSWORD.js`
   - Presiona Enter

4. ✅ Si ves "CONTRASEÑA ACTUALIZADA", ya puedes iniciar sesión

---

### **OPCIÓN 3: Eliminar y Crear Usuario Nuevo**

Si las anteriores no funcionan:

1. **En Supabase Dashboard:**
   - Ve a Authentication → Users
   - Encuentra tu usuario (cvarlla@gmail.com)
   - Click en el icono de "🗑️ Delete"
   - Confirma la eliminación

2. **En ODDY Market:**
   - Ve a la página de registro
   - Regístrate con:
     - Email: cvarlla@gmail.com
     - Nombre: Carlos Varalla
     - Contraseña: La que prefieras (mínimo 6 caracteres)
   
3. ✅ Ahora inicia sesión con las nuevas credenciales

---

### **OPCIÓN 4: Usar SQL en Supabase (AVANZADO)**

1. Ve a: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

2. Ejecuta este SQL:
   ```sql
   -- Ver información del usuario
   SELECT id, email, encrypted_password 
   FROM auth.users 
   WHERE email = 'cvarlla@gmail.com';
   
   -- Si ves que encrypted_password está vacío, ese es el problema
   ```

3. Para establecer una contraseña usa el endpoint que creamos

---

## 🚀 DESPUÉS DE RESETEAR LA CONTRASEÑA

### Hacerte Admin:

**Opción A - Desde Supabase Dashboard:**
1. Authentication → Users → cvarlla@gmail.com
2. Click en "Raw User Meta Data" o "User Metadata"
3. Edita el JSON:
   ```json
   {
     "name": "Carlos Varalla",
     "role": "admin"
   }
   ```
4. Guarda
5. Recarga ODDY Market

**Opción B - Desde el navegador (después de loguearte):**
```javascript
async function hacermeAdmin() {
  const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
  const token = authData.currentSession?.access_token;
  const projectId = "TU_PROJECT_ID"; // Cambiar
  
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/make-admin`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  console.log(data);
  
  if (response.ok) {
    alert('¡Ahora eres admin!');
    window.location.reload();
  }
}

hacermeAdmin();
```

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

Después de resetear la contraseña y hacerte admin:

```javascript
// Ejecuta en la consola del navegador
const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
console.log("✅ Email:", authData.currentSession?.user?.email);
console.log("✅ Rol:", authData.currentSession?.user?.user_metadata?.role);
console.log("✅ Token:", authData.currentSession?.access_token ? "Presente" : "Ausente");
```

Deberías ver:
- Email: cvarlla@gmail.com
- Rol: admin
- Token: Presente

---

## ❓ ¿QUÉ OPCIÓN USAR?

| Situación | Usa |
|-----------|-----|
| Tienes acceso a Supabase Dashboard | **Opción 1** ⭐ |
| Prefieres script automático | **Opción 2** |
| Nada funciona | **Opción 3** |
| Eres desarrollador avanzado | **Opción 4** |

---

## 🆘 SI NADA FUNCIONA

Comparte conmigo:
1. El mensaje de error exacto de la consola
2. Si puedes ver tu usuario en Supabase Dashboard
3. Si el campo "encrypted_password" está lleno o vacío en la base de datos
4. Los logs del servidor (si tienes acceso)

---

**¡Usa la Opción 1 o 2 y estarás listo en menos de 2 minutos!** 🚀
