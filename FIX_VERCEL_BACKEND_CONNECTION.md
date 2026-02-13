# 🔧 FIX: CONECTAR FRONTEND CON BACKEND

**Problema**: Frontend deployado pero no se conecta al backend  
**Causa**: Variables de entorno faltantes en Vercel  
**Solución**: Configurar variables de entorno y redeploy  

---

## 📋 PASO 1: CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

### **1.1. Ir al Dashboard de Vercel**

```
https://dash.vercel.com/projects
```

### **1.2. Seleccionar el Proyecto**

Click en: **oddy-market**

### **1.3. Ir a Settings**

En el menú lateral izquierdo: **Settings** → **Environment Variables**

### **1.4. Agregar las Variables**

Click en **"Add Variable"** y agrega:

#### **Variable 1:**
```
Name:  VITE_API_URL
Value: https://oddy-market-62.oddy123.deno.net
Environment: Production, Preview, Development
```

#### **Variable 2:**
```
Name:  VITE_API_PREFIX
Value: /make-server-0dd48dc4
Environment: Production, Preview, Development
```

**IMPORTANTE**: Selecciona los 3 ambientes (Production, Preview, Development)

### **1.5. Guardar**

Click en **"Save"**

---

## 🔄 PASO 2: REDEPLOY EL FRONTEND

### **2.1. Ir a Deployments**

En el menú lateral: **Deployments**

### **2.2. Redeploy**

1. Click en el **último deployment** (el más reciente)
2. Click en el botón **"Redeploy"** (esquina superior derecha)
3. Confirma haciendo click en **"Redeploy"**

### **2.3. Esperar**

⏱️ El redeploy toma 2-3 minutos

---

## ✅ PASO 3: VERIFICAR QUE FUNCIONE

### **3.1. Abrir el Sitio**

Una vez completado el redeploy, abre:
```
https://tu-url.vercel.app
```

### **3.2. Abrir la Consola del Navegador**

1. Presiona **F12**
2. Ve a la pestaña **"Console"**
3. Deberías ver logs como:
   ```
   🌐 API Request: https://oddy-market-62.oddy123.deno.net/make-server-0dd48dc4/...
   ```

### **3.3. Verificar Network**

1. En DevTools, ve a la pestaña **"Network"**
2. Recarga la página (**Ctrl + R**)
3. Busca peticiones a: `oddy-market-62.oddy123.deno.net`
4. **Deben estar con status 200 (verde)** ✅

---

## 🧪 PASO 4: PROBAR FUNCIONALIDADES

### **Prueba 1: Listar Productos**

En la consola del navegador (F12), ejecuta:

```javascript
fetch('https://oddy-market-62.oddy123.deno.net/make-server-0dd48dc4/articles?entity_id=default')
  .then(r => r.json())
  .then(console.log)
```

**Debe retornar** una lista de productos (puede estar vacía si no has creado productos aún).

### **Prueba 2: Verificar Backend**

```javascript
fetch('https://oddy-market-62.oddy123.deno.net/')
  .then(r => r.json())
  .then(console.log)
```

**Debe retornar** los 38 módulos del backend.

---

## 🐛 TROUBLESHOOTING

### **Error: CORS**

**Síntoma**:
```
Access to fetch at '...' has been blocked by CORS policy
```

**Solución**:
El backend ya tiene CORS configurado para `*` (todos los orígenes). Si sigue fallando, avísame.

---

### **Error: Variables no se aplican**

**Síntoma**: Después del redeploy, sigue sin funcionar.

**Solución**:
1. Verifica que las variables empiecen con `VITE_` (obligatorio para Vite)
2. Verifica que estén en "Production" environment
3. Limpia cache del navegador (Ctrl + Shift + R)
4. Prueba en modo incógnito

---

### **Error: 404 en el sitio**

**Síntoma**: La URL de Vercel muestra "404: NOT_FOUND"

**Solución**:
1. Ve al Dashboard de Vercel
2. Busca la URL correcta en "Domains"
3. Puede que la URL haya cambiado
4. Usa la URL que aparece en "Production Deployment"

---

## 📝 VERIFICACIÓN FINAL

Después de configurar todo, verifica:

- [ ] Variables de entorno agregadas en Vercel
- [ ] Redeploy completado exitosamente
- [ ] Sitio carga sin errores
- [ ] Console muestra logs de API requests
- [ ] Network tab muestra peticiones al backend (200 OK)
- [ ] Backend responde correctamente

---

## 🌐 URLs CORRECTAS

```
✅ Backend:  https://oddy-market-62.oddy123.deno.net
✅ Frontend: [Tu URL de Vercel]
✅ GitHub:   https://github.com/CharlieUY711/oddy-market
```

---

## 🎯 RESULTADO ESPERADO

Después de seguir estos pasos:

- ✅ Frontend se conecta al backend
- ✅ Login funciona
- ✅ Productos se cargan desde el backend
- ✅ Todas las funcionalidades operativas

---

**🚀 SIGUE ESTOS PASOS Y LUEGO COMPARTE EL RESULTADO**
