# 🚀 GUÍA: DEPLOY CORRECTO DEL BACKEND

**Problema**: Página en blanco en `oddy-market.oddy123.deno.net`  
**Causa**: Entry point incorrecto  
**Solución**: Configurar correctamente el proyecto

---

## 📋 PASO 1: RECONFIGURAR PROYECTO ACTUAL

### **En Deno Deploy Dashboard:**

1. Ve a: https://dash.deno.com
2. Selecciona el proyecto: **oddy-market**
3. Click en **"Settings"** (menú lateral izquierdo)
4. Busca la sección **"Build"** o **"Configuration"**
5. Haz clic en **"Edit"** junto a "Build settings"

### **Configuración correcta:**

```
Repository: CharlieUY711/oddy-market
Branch: main
Root Directory: supabase/functions
Entry Point: server/index.tsx
```

**O si no hay opción de Root Directory:**

```
Entry Point: supabase/functions/server/index.tsx
```

6. **Guarda los cambios**
7. Ve a **"Deployments"** (menú lateral)
8. Click en **"Redeploy"** en el último deployment

---

## ✅ PASO 2: VERIFICAR EL DEPLOY

Después de ~30 segundos, prueba:

```bash
curl https://oddy-market.oddy123.deno.net/
```

**Debe responder**:

```json
{
  "status": "ok",
  "message": "ODDY Market API Server",
  "version": "1.0.0",
  "modules": [
    "system", "entities", "parties", "products", "orders", "cart",
    "auth", "users", "billing", "pos", "customs", "fulfillment",
    "documents", "library", "shipping", "inventory", "categories",
    "integrations", "mailing", "marketing", "automation", "social",
    "wheel", "crm", "erp", "departments", "provider", "notifications",
    "webhooks", "api_keys", "audit", "analytics", "reports",
    "backups", "settings", "help", "support", "documentation"
  ]
}
```

---

## 🔄 ALTERNATIVA: CREAR PROYECTO NUEVO

Si la reconfiguración no funciona:

### **1. Crear Nuevo Proyecto en Deno Deploy**

1. Ve a: https://dash.deno.com
2. Click en **"New Project"**
3. **Select GitHub Repository**: `CharlieUY711/oddy-market`
4. **App name**: `oddy-backend-api` (o el nombre que prefieras)
5. **IMPORTANTE**: Click en **"Edit app config"**

### **2. Configurar correctamente**:

```
App Directory: supabase/functions
  (Click en el lápiz ✏️ para cambiar esto)

Entry Point: server/index.tsx
```

### **3. Deploy**:

Click en **"Create App"**

### **4. Tu nueva URL será**:

```
https://oddy-backend-api.deno.dev/
```

---

## 📱 PASO 3: DEPLOYAR EL FRONTEND EN VERCEL

El frontend (React) debe estar en Vercel, no en Deno Deploy.

### **1. Ve a Vercel**:

https://vercel.com/new

### **2. Import Repository**:

- Select: `CharlieUY711/oddy-market`
- Framework Preset: **Vite**
- Root Directory: `.` (dejar por defecto)
- Build Command: `npm run build`
- Output Directory: `dist`

### **3. Environment Variables**:

Agregar:

```
VITE_API_URL=https://oddy-backend-api.deno.dev
```

(O la URL que tengas del backend)

### **4. Deploy**:

Click en **"Deploy"**

---

## 🎯 RESULTADO FINAL

Tendrás 2 URLs funcionando:

1. **Backend API**: `https://oddy-backend-api.deno.dev/`
   - 38 módulos funcionando
   - 290+ endpoints

2. **Frontend**: `https://oddy-market.vercel.app/`
   - React + Vite
   - UI completa
   - Conectado al backend

---

## 🐛 TROUBLESHOOTING

### **Si sigue en blanco después de reconfigurar:**

1. Ve a **"Logs"** en Deno Deploy
2. Busca errores
3. Copia el error y compártelo

### **Si no encuentras "Edit app config":**

Significa que Deno Deploy no puede detectar un preset. Solución:

1. Crea el archivo `deno.json` en la raíz del repo (ya lo tenemos)
2. Asegúrate que tenga:

```json
{
  "name": "oddy-market-backend",
  "version": "1.0.0",
  "entrypoint": "supabase/functions/server/index.tsx"
}
```

3. Push a GitHub
4. Redeploy

---

## 📞 SIGUIENTE PASO

1. **Reconfigura el proyecto actual** siguiendo el Paso 1
2. Si no funciona, **crea un proyecto nuevo** siguiendo la Alternativa
3. **Verifica** que responda con el JSON de 38 módulos
4. **Comparte** la URL para validar que funcione

---

**✅ Una vez que el backend responda correctamente, deployamos el frontend en Vercel.**
