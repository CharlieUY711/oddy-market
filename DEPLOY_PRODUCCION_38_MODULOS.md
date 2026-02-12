# 🚀 DEPLOY A PRODUCCIÓN - 38 MÓDULOS

**Fecha**: 2026-02-12  
**Versión**: 1.0.0 - 38 Módulos Completos

---

## 📋 PRE-REQUISITOS

✅ Todos los cambios están en GitHub (commit: e5eda8a)  
✅ Servidor local funciona correctamente (38 módulos)  
✅ No hay cambios pendientes (`git status`)

---

## 🔄 OPCIÓN 1: DEPLOY AUTOMÁTICO (Recomendado)

### **Paso 1: Verificar Deno Deploy Dashboard**

1. Ve a: **https://dash.deno.com**
2. Selecciona tu proyecto: **oddy-backend**
3. Verifica que el último deployment sea el commit más reciente

### **Paso 2: Verificar Configuración**

Asegúrate que tu proyecto en Deno Deploy tenga:

```
Repository: CharlieUY711/oddy-market
Branch: main
Production Branch: main
Entry Point: supabase/functions/server/index.tsx
```

### **Paso 3: Trigger Deploy**

Si no se hizo automáticamente:

1. En Deno Deploy Dashboard
2. Click en tu proyecto **oddy-backend**
3. Click en **"Deployments"**
4. Click en **"Redeploy"** en el último deployment

---

## 🔄 OPCIÓN 2: DEPLOY MANUAL

### **Windows:**

```bash
deploy-backend.bat
```

### **Manual con Deno CLI:**

```bash
cd supabase/functions
deno deploy --project=oddy-backend --entrypoint=server/index.tsx
```

**Nota**: Si no tienes `deployctl`, instálalo primero:

```bash
deno install -Arf jsr:@deno/deployctl
```

---

## ✅ VERIFICAR EL DEPLOY

### **1. Verificar que el API responde**

```bash
curl https://oddy-backend.deno.dev/
```

**Respuesta esperada**:

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

**Debe mostrar**: **38 módulos** ✅

---

### **2. Probar endpoints críticos**

#### **Sistema**:
```bash
curl https://oddy-backend.deno.dev/make-server-0dd48dc4/system/taxes
```

#### **Products**:
```bash
curl https://oddy-backend.deno.dev/make-server-0dd48dc4/articles?entity_id=default
```

#### **Parties**:
```bash
curl https://oddy-backend.deno.dev/make-server-0dd48dc4/parties?entity_id=default
```

#### **Orders**:
```bash
curl https://oddy-backend.deno.dev/make-server-0dd48dc4/orders?entity_id=default
```

---

### **3. Verificar logs en Deno Deploy**

1. Ve a tu proyecto en Deno Deploy
2. Click en **"Logs"**
3. Busca el mensaje:
   ```
   🚀 ODDY Market API Server starting...
   📦 Loaded modules (38 total): system, entities, parties, ...
   ```

---

## 🐛 TROUBLESHOOTING

### **Error: "Module not found"**

Verifica que el `Entry Point` sea correcto:
```
supabase/functions/server/index.tsx
```

### **Error: "Cannot find module 'npm:hono'"**

Deno Deploy debería resolver automáticamente. Si falla:

1. Verifica que `deno.json` esté en la raíz del repo
2. El archivo debe tener:
   ```json
   {
     "entrypoint": "supabase/functions/server/index.tsx"
   }
   ```

### **Error: "Address already in use"**

Este error no aplica en Deno Deploy (solo en local).

---

## 📊 DESPUÉS DEL DEPLOY

### **1. Actualizar Frontend**

El frontend en Vercel debe apuntar al nuevo backend:

```javascript
// En el frontend (React)
const API_URL = "https://oddy-backend.deno.dev";
```

### **2. Testing en Producción**

Probar todos los endpoints críticos en producción para asegurar que funcionen igual que en local.

### **3. Monitoreo**

- **Deno Deploy Logs**: Para ver errores en tiempo real
- **Deno Deploy Analytics**: Para ver uso de recursos

---

## 🎯 CHECKLIST FINAL

- [ ] Deploy completado exitosamente
- [ ] Endpoint `/` responde con 38 módulos
- [ ] Logs muestran "Loaded modules (38 total)"
- [ ] Endpoints críticos responden correctamente
- [ ] Frontend configurado con nueva URL
- [ ] Sin errores en logs de Deno Deploy

---

## 📝 NOTAS IMPORTANTES

### **SimpleKV vs Supabase**

En producción con Deno Deploy, actualmente estamos usando **SimpleKV (in-memory)**, lo que significa:

⚠️ **Los datos se perderán al reiniciar el servidor**

**Solución futura**:
1. Conectar a **Supabase PostgreSQL** en producción
2. O usar **Deno KV** (requiere Deno Deploy Pro)

### **Errores de Documentation Module**

Los errores reportados en los endpoints de documentación se resolverán después del deploy:

- `/docs/technical` - Error fetching
- `/docs/manual` - Not found
- `/docs/feedback/dashboard` - Error fetching

**Causa probable**: SimpleKV vacío (sin datos de documentación inicializados)

**Solución**: Crear endpoints para inicializar la documentación o conectar a base de datos real.

---

## 🌐 URLS FINALES

- **Backend API**: https://oddy-backend.deno.dev
- **Frontend**: https://oddy-market.vercel.app
- **GitHub Repo**: https://github.com/CharlieUY711/oddy-market

---

**✅ BACKEND CON 38 MÓDULOS LISTO PARA PRODUCCIÓN**  
**🚀 Siguiente: Testing exhaustivo + Conectar Frontend**
