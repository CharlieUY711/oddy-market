# 🚀 DEPLOY FRONTEND EN VERCEL - GUÍA PASO A PASO

**Fecha**: 2026-02-12  
**Backend**: https://oddy-market-62.oddy123.deno.net  
**Frontend**: Por deployar en Vercel

---

## 📋 PASO 1: VERIFICAR QUE EL CÓDIGO ESTÉ LISTO

✅ Backend funcionando: https://oddy-market-62.oddy123.deno.net  
✅ Código en GitHub: https://github.com/CharlieUY711/oddy-market  
✅ Branch: main  

---

## 🌐 PASO 2: CREAR PROYECTO EN VERCEL

### **2.1. Ve a Vercel**

Abre en tu navegador:
```
https://vercel.com/new
```

### **2.2. Importar Repositorio**

1. Click en **"Import Git Repository"**
2. Si no ves tu repositorio, click en **"Adjust GitHub App Permissions"**
3. Autoriza acceso a `CharlieUY711/oddy-market`
4. Selecciona el repositorio: **oddy-market**
5. Click en **"Import"**

---

## ⚙️ PASO 3: CONFIGURAR EL PROYECTO

### **3.1. Configure Project**

En la pantalla de configuración:

```
Project Name: oddy-market
Framework Preset: Vite
Root Directory: ./ (dejar por defecto)
Build Command: npm run build (o yarn build)
Output Directory: dist
Install Command: npm install (o yarn install)
```

### **3.2. Environment Variables** ⭐ **IMPORTANTE**

Click en **"Environment Variables"** y agrega:

#### **Variable 1:**
```
Name: VITE_API_URL
Value: https://oddy-market-62.oddy123.deno.net
```

#### **Variable 2:**
```
Name: VITE_API_PREFIX
Value: /make-server-0dd48dc4
```

#### **Variable 3 (Opcional - si usas Supabase en el frontend):**
```
Name: VITE_SUPABASE_URL
Value: [Tu URL de Supabase]
```

#### **Variable 4 (Opcional):**
```
Name: VITE_SUPABASE_ANON_KEY
Value: [Tu Supabase Anon Key]
```

---

## 🚀 PASO 4: DEPLOY

1. Click en **"Deploy"**
2. Vercel comenzará a:
   - ✅ Clonar el repositorio
   - ✅ Instalar dependencias
   - ✅ Ejecutar `npm run build`
   - ✅ Deployar el sitio

**Tiempo estimado**: 2-3 minutos

---

## ✅ PASO 5: VERIFICAR EL DEPLOY

### **5.1. Obtener la URL**

Una vez completado, Vercel te dará una URL como:
```
https://oddy-market.vercel.app
o
https://oddy-market-[usuario].vercel.app
```

### **5.2. Verificar que Funcione**

Abre la URL en tu navegador y verifica:

- ✅ La página carga correctamente
- ✅ No hay errores en la consola (F12)
- ✅ Los links funcionan
- ✅ El frontend puede comunicarse con el backend

### **5.3. Probar la Consola del Navegador**

1. Abre la página
2. Presiona **F12** (DevTools)
3. Ve a la pestaña **Console**
4. **NO debe haber errores rojos**
5. Si hay errores de CORS, avísame

---

## 🔧 PASO 6: CONFIGURAR DOMINIO (Opcional)

Si tienes un dominio personalizado:

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **"Settings"** → **"Domains"**
3. Agrega tu dominio
4. Configura los DNS según las instrucciones

---

## 🐛 TROUBLESHOOTING

### **Error: "Build failed"**

**Posible causa**: Dependencias faltantes o errores en el código.

**Solución**:
1. Ve a los **Build Logs** en Vercel
2. Copia el error completo
3. Compártelo para diagnosticar

---

### **Error: CORS al llamar al backend**

**Síntoma**: Error en consola: "CORS policy blocked"

**Solución temporal**:
El backend ya tiene CORS configurado para `*` (todos los orígenes), así que esto no debería pasar. Si pasa, me avisas.

**Solución permanente** (después):
Actualizar el backend para aceptar solo:
```javascript
cors({
  origin: [
    "https://oddy-market.vercel.app",
    "http://localhost:5173"
  ]
})
```

---

### **Error: Variables de entorno no funcionan**

**Síntoma**: El frontend no se conecta al backend

**Solución**:
1. Verifica que las variables en Vercel empiecen con `VITE_`
2. Verifica que estén en "Production" (no solo en "Preview")
3. Redeploy el sitio:
   - Ve a **Deployments**
   - Click en el deployment
   - Click en **"Redeploy"**

---

## 📱 PASO 7: CONFIGURAR DEPLOY AUTOMÁTICO

Vercel ya configuró el deploy automático por defecto:

✅ **Cada push a `main`** → Deploy automático a producción  
✅ **Cada pull request** → Preview deployment  

---

## 🎯 RESULTADO FINAL

Después de completar estos pasos, tendrás:

```
Frontend: https://oddy-market.vercel.app
Backend:  https://oddy-market-62.oddy123.deno.net
```

**✅ Aplicación completa funcionando en producción**

---

## 📊 VERIFICACIÓN POST-DEPLOY

### **Checklist:**

- [ ] Frontend carga sin errores
- [ ] Sin errores en consola del navegador (F12)
- [ ] Navegación funciona
- [ ] Puede llamar al backend (verificar en Network tab)
- [ ] Imágenes cargan correctamente
- [ ] Responsive (funciona en móvil)

---

## 🔄 PARA FUTURAS ACTUALIZACIONES

Cuando quieras actualizar el frontend:

```bash
# 1. Hacer cambios en tu código
# 2. Commit
git add .
git commit -m "Descripción de los cambios"

# 3. Push
git push

# 4. Vercel detecta el push y deploy automáticamente
```

**No necesitas hacer nada más**, Vercel lo hace automático.

---

## 📝 NOTAS IMPORTANTES

### **URLs que el Frontend necesita conocer:**

El frontend debe usar estas variables de entorno para construir las URLs de las peticiones:

```javascript
// En tu código React:
const API_URL = import.meta.env.VITE_API_URL;
const API_PREFIX = import.meta.env.VITE_API_PREFIX;

// Ejemplo de uso:
const fetchProducts = async () => {
  const response = await fetch(
    `${API_URL}${API_PREFIX}/articles?entity_id=default`
  );
  const data = await response.json();
  return data;
};
```

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DEL DEPLOY

1. ✅ Deploy completado
2. ⚪ Testing básico (crear productos, pedidos)
3. ⚪ Migrar a Supabase PostgreSQL
4. ⚪ Testing exhaustivo
5. ⚪ Optimización y seguridad

---

**✅ LISTO PARA DEPLOYAR**  
**🚀 Sigue los pasos y comparte la URL cuando termine**
