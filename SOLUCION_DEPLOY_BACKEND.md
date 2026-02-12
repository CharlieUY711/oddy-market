# 🔧 Solución: Deploy Correcto del Backend

**Problema:** Deno Deploy está sirviendo el frontend en lugar del backend API.

**Causa:** El Entry Point no está configurado correctamente.

---

## ✅ SOLUCIÓN RÁPIDA

### **Crear Nueva App para el Backend**

1. **Ve a Deno Deploy Dashboard:**
   ```
   https://dash.deno.com
   ```

2. **Haz clic en "+ New app"**

3. **Configura así:**
   ```
   ┌─────────────────────────────────────────┐
   │ Project Name:  oddy-market-backend      │
   │ Repository:    CharlieUY711/oddy-market │
   │ Branch:        main                     │
   │ Entry Point:   supabase/functions/server/index.tsx │
   │ Build Step:    (vacío)                  │
   │ Install Step:  (vacío)                  │
   └─────────────────────────────────────────┘
   ```

4. **⚠️ CRÍTICO:** 
   - **NO marcar** "Static Site"
   - **NO seleccionar** ningún framework (Fresh, Next.js, etc.)
   - **Entry Point debe ser exactamente:** `supabase/functions/server/index.tsx`

5. **Deploy!**

---

## 🎯 Estructura de URLs Final

Después de este deploy correcto:

### **Frontend (ya tienes):**
```
https://oddy-market.oddy123.deno.net
```
→ Tu sitio web React

### **Backend (nuevo):**
```
https://oddy-market-backend.oddy123.deno.net
```
→ Tu API REST

---

## ✅ Verificar que Funciona

Una vez deployado el backend correcto, prueba:

```bash
curl https://oddy-market-backend.oddy123.deno.net
```

**Respuesta CORRECTA (JSON):**
```json
{
  "status": "ok",
  "message": "ODDY Market API Server",
  "version": "1.0.0",
  "modules": [...]
}
```

**❌ Respuesta INCORRECTA (HTML):**
```html
<!doctype html>
<html lang="es">
...
```

---

## 📊 Arquitectura Correcta

```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  https://oddy-market.oddy123.deno.net   │
│  (Ya deployado ✅)                      │
└─────────────────────────────────────────┘
                  │
                  │ API calls
                  ▼
┌─────────────────────────────────────────┐
│  Backend (Deno + Hono)                  │
│  https://oddy-market-backend...deno.net │
│  (Necesita deploy correcto ⚠️)          │
└─────────────────────────────────────────┘
```

---

## 🔍 Detalles Técnicos

### **¿Por qué pasó esto?**

Deno Deploy detectó tu `index.html` en la raíz y automáticamente configuró el proyecto como un **sitio estático** en lugar de un **servidor Deno**.

### **¿Cómo evitarlo?**

Al crear la app en Deno Deploy, **especificar explícitamente el Entry Point:**
- ✅ `supabase/functions/server/index.tsx` → Servidor API
- ❌ `index.html` → Sitio estático (auto-detectado)

---

## 🚀 Próximos Pasos

1. **Crear nueva app** para backend con Entry Point correcto
2. **Obtener nueva URL** (ej: `https://oddy-market-backend.oddy123.deno.net`)
3. **Actualizar frontend** para usar la URL correcta del backend
4. **Probar endpoints** con `PRUEBAS_MODULOS_NUEVOS.md`

---

## 📝 Configuración del Frontend

Una vez tengas la URL correcta del backend, actualiza tu frontend:

```javascript
// src/config.js
export const API_URL = 'https://oddy-market-backend.oddy123.deno.net';
```

---

## ❓ ¿Necesitas Ayuda?

Si tienes problemas:
1. Verifica que el Entry Point sea exactamente: `supabase/functions/server/index.tsx`
2. Asegúrate de NO marcar "Static Site"
3. Revisa los logs del build en Deno Deploy

---

**¡Vamos a deployar el backend correctamente! 🚀**
