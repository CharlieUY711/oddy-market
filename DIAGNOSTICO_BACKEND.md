# 🔍 Diagnóstico Backend - ODDY Market

## Problema Reportado
"No entra al BE" - Los productos no cargan desde Supabase en producción

---

## ✅ Verificación Paso a Paso

### 1. Verificar Variables de Entorno en Vercel

Ve a: https://vercel.com/carlos-varallas-projects/oddy-market/settings/environment-variables

**Debe tener estas variables:**
- `VITE_SUPABASE_URL` = `https://yomgqobfmgatavnbtvdz.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (el token largo)

**Verifica que estén marcadas para:**
- ✅ Production
- ✅ Preview
- ✅ Development

---

### 2. Verificar en la Consola del Navegador

1. Abre: https://oddy-market.vercel.app/products
2. Presiona F12 → Console
3. Busca estos mensajes:

**Si funciona correctamente:**
```
📡 Fetching products from Supabase...
✅ 12 products fetched from Supabase
```

**Si NO funciona (usando mock):**
```
📡 Fetching products from Supabase...
⚠️ Error fetching from Supabase, using mock data: [error message]
```

---

### 3. Verificar las Variables en el Build

1. Ve a: https://vercel.com/carlos-varallas-projects/oddy-market
2. Click en el último deployment
3. Click en "Logs" o "Runtime Logs"
4. Busca errores relacionados con Supabase

---

## 🔧 Soluciones

### Solución 1: Verificar y Re-agregar Variables

Si faltan las variables o están mal:

1. Ve a: https://vercel.com/carlos-varallas-projects/oddy-market/settings/environment-variables
2. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` existan
3. Si no existen o están mal, agrégalas:

**Nombre:** `VITE_SUPABASE_URL`  
**Value:** `https://yomgqobfmgatavnbtvdz.supabase.co`  
**Environments:** ✅ Production, ✅ Preview, ✅ Development

**Nombre:** `VITE_SUPABASE_ANON_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbWdxb2JmbWdhdGF2bmJ0dmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzAzMTksImV4cCI6MjA4NjAwNjMxOX0.yZ9Zb6Jz9BKZTkn7Ld8TzeLyHsb8YhBAoCvFLPBiqZk`  
**Environments:** ✅ Production, ✅ Preview, ✅ Development

4. **IMPORTANTE:** Después de agregar/modificar variables, debes hacer **Redeploy**:
   - Ve a: https://vercel.com/carlos-varallas-projects/oddy-market/deployments
   - Click en el último deployment
   - Click en "..." → "Redeploy"

---

### Solución 2: Force Redeploy

Si las variables están correctas pero no funcionan:

```bash
# En tu terminal local:
git commit --allow-empty -m "force redeploy"
git push
```

Esto forzará un nuevo deployment que leerá las variables.

---

### Solución 3: Verificar Supabase

Verifica que Supabase esté funcionando:

1. Ve a: https://app.supabase.com/project/yomgqobfmgatavnbtvdz/editor
2. Verifica que la tabla `products` tenga 20 productos
3. Ve a: https://app.supabase.com/project/yomgqobfmgatavnbtvdz/settings/api
4. Copia la **URL** y la **anon public key**
5. Compáralas con las que tienes en Vercel

---

## 🧪 Test Rápido

Para probar si Supabase funciona, ejecuta esto en la consola del navegador:

```javascript
// En https://oddy-market.vercel.app/
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

**Resultado esperado:**
```
Supabase URL: https://yomgqobfmgatavnbtvdz.supabase.co
Supabase Key: eyJhbGciOiJIUzI1NiI...
```

**Si muestra `undefined`:**
- Las variables NO están configuradas en Vercel
- Necesitas agregarlas y hacer redeploy

---

## 📊 Estado Actual

**Código local:** ✅ Configurado correctamente  
**Variables locales (.env.local):** ✅ Configuradas  
**Supabase:** ✅ Funcionando (20 productos)  

**Variables en Vercel:** ❓ A verificar  
**Producción:** ❓ A verificar después de arreglar variables

---

## ✅ Checklist

- [ ] Variables existen en Vercel
- [ ] Variables tienen los valores correctos
- [ ] Variables están marcadas para Production, Preview, Development
- [ ] Se hizo redeploy después de agregar variables
- [ ] La consola del navegador muestra las variables correctamente
- [ ] Los productos cargan desde Supabase

---

## 🎯 Próximo Paso Inmediato

1. **Abre:** https://vercel.com/carlos-varallas-projects/oddy-market/settings/environment-variables
2. **Verifica** que las variables existan
3. **Si faltan:** Agrégalas como se indica arriba
4. **Redeploy:** Deployments → "..." → Redeploy
5. **Espera 2-3 minutos**
6. **Verifica:** https://oddy-market.vercel.app/products (F12 → Console)

---

**Última actualización:** 2026-02-12
