# 🔍 Debug: URLs en Blanco en Deno Deploy

**Problema:** Las URLs no cargan, quedan en blanco.

---

## ✅ Verificaciones Inmediatas

### **1. Verificar Estado del Deployment**

En el dashboard de Deno Deploy:
- Ve a tu proyecto `oddy-market-73aqwm3q7n9j`
- Mira el último build
- ¿Dice "Serving traffic" o hay algún error?

### **2. Ver Logs en Tiempo Real**

1. En Deno Deploy, haz clic en tu app
2. Ve a la pestaña **"Logs"**
3. Busca errores en rojo

---

## 🔧 Soluciones Posibles

### **Solución 1: El Entry Point está mal configurado**

**Síntoma:** Build exitoso pero la app no responde

**Causa:** Deno Deploy no sabe qué archivo ejecutar

**Solución:**
1. En Deno Deploy Dashboard → Tu App → **Settings**
2. Busca **"Entry Point"**
3. Debe ser: `supabase/functions/server/index.tsx`
4. Si está vacío o es otro archivo, cámbialo
5. Guarda y **Redeploy**

---

### **Solución 2: El servidor no está escuchando correctamente**

**Causa:** El archivo `index.tsx` puede no estar exportando correctamente

**Verificación:** Vamos a revisar el archivo

```typescript
// supabase/functions/server/index.tsx
// Debe tener esta estructura:

import { Hono } from "npm:hono";
// ... otros imports ...

const app = new Hono();

// ... rutas ...

Deno.serve(app.fetch);  // ← CRÍTICO: Esta línea debe estar al final
```

---

### **Solución 3: Puerto incorrecto**

**Causa:** En Deno Deploy, NO necesitas especificar puerto

**Verificación:** El archivo `index.tsx` NO debe tener:
```typescript
// ❌ MALO - NO usar en Deno Deploy:
app.listen(8000);

// ✅ BUENO - Usar en Deno Deploy:
Deno.serve(app.fetch);
```

---

## 🚀 Plan de Acción Inmediato

### **Paso 1: Revisar `index.tsx`**

Voy a verificar que el archivo esté correcto...

### **Paso 2: Si el archivo está mal**

Te mostraré la versión correcta

### **Paso 3: Redeploy**

Haremos `git push` y Deno Deploy se actualizará automáticamente

---

## 📊 Arquitectura Correcta para Deno Deploy

```typescript
// supabase/functions/server/index.tsx

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";

// Importar todos los módulos
import { partiesApp } from "./parties.tsx";
import { productsApp } from "./products.tsx";
// ... etc ...

const app = new Hono();

// CORS
app.use("/*", cors());

// Ruta principal
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "ODDY Market API Server",
    version: "1.0.0",
    modules: ["parties", "products", ...]
  });
});

// Montar módulos
app.route("/", partiesApp);
app.route("/", productsApp);
// ... etc ...

// ⚠️ CRÍTICO: Esta línea debe estar al final
Deno.serve(app.fetch);
```

---

## ❓ ¿Qué estás viendo?

Por favor dime:

1. **¿El build dice "Serving traffic"?**
   - Sí → El deploy funcionó, pero hay un problema de configuración
   - No → El deploy falló, necesitamos ver los logs

2. **¿Qué ves en los Logs?**
   - Errores en rojo
   - "Listening on..." o similar
   - Nada

3. **¿Cuál es el Entry Point configurado?**
   - Visible en Settings → Production Deployment

---

Con esta información puedo ayudarte a solucionar el problema específico.
