# 🚀 Deployment a Vercel - ODDY Market

## Paso a Paso Completo

### 1. Crear Cuenta / Iniciar Sesión en Vercel

1. Ve a: https://vercel.com/signup
2. Click en **"Continue with GitHub"**
3. Autoriza a Vercel para acceder a tus repositorios

---

### 2. Importar el Proyecto

1. En el Dashboard de Vercel, click en **"Add New..."** → **"Project"**
2. Busca tu repositorio: **`oddy-market`**
3. Click en **"Import"**

---

### 3. Configurar el Proyecto

**Framework Preset:** Vite (debería detectarlo automáticamente)

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

---

### 4. Configurar Variables de Entorno

Antes de hacer deploy, necesitas agregar las variables de entorno.

Click en **"Environment Variables"** y agrega:

#### Variables Requeridas:

```env
VITE_SUPABASE_URL = https://yomgqobfmgatavnbtvdz.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbWdxb2JmbWdhdGF2bmJ0dmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzAzMTksImV4cCI6MjA4NjAwNjMxOX0.yZ9Zb6Jz9BKZTkn7Ld8TzeLyHsb8YhBAoCvFLPBiqZk
VITE_SENTRY_DSN = (tu DSN de Sentry - opcional por ahora)
VITE_SENTRY_ENVIRONMENT = production
VITE_APP_NAME = ODDY Market
VITE_APP_URL = (lo tendrás después del deploy)
VITE_MERCADOPAGO_PUBLIC_KEY = (si lo tienes)
VITE_ENABLE_PWA = false
VITE_ENABLE_SECOND_HAND = true
VITE_ENABLE_WHATSAPP = false
```

**⚠️ IMPORTANTE:** 
- Agrega cada variable en una línea
- Click en **"Add"** después de cada una
- Asegúrate de que estén en **"Production"**, **"Preview"** y **"Development"**

---

### 5. Deploy

1. Después de configurar las variables, click en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel construye tu aplicación
3. Verás un mensaje: **"Congratulations! Your project has been deployed"**

---

### 6. Verificar el Deploy

1. Click en **"Visit"** para ver tu aplicación en producción
2. Tu URL será algo como: `https://oddy-market-xxx.vercel.app`
3. Copia esa URL

---

### 7. Actualizar la Variable VITE_APP_URL

1. Ve a: **Settings** → **Environment Variables**
2. Edita `VITE_APP_URL` y ponle tu URL de producción
3. Ejemplo: `https://oddy-market-xxx.vercel.app`
4. **Redeploy** (Settings → Deployments → Re-deploy)

---

## ✅ Verificación Final

Tu aplicación debería estar funcionando en producción con:

- ✅ Interfaz funcionando
- ✅ Productos cargando desde Supabase
- ✅ Carrito funcionando
- ✅ Navegación funcionando

---

## 🔄 Deploys Automáticos

Ahora, cada vez que hagas `git push` a GitHub, Vercel **automáticamente** hará un nuevo deploy.

```bash
git add -A
git commit -m "feat: nueva funcionalidad"
git push
```

Vercel detectará el cambio y desplegará la nueva versión.

---

## 🆘 Troubleshooting

### Error: "Build failed"

**Solución:** Revisa los logs en Vercel. Probablemente falta una variable de entorno.

### Error: "Page not found"

**Solución:** Verifica que el Output Directory sea `dist` y no `build`.

### Error: "Failed to load products"

**Solución:** Verifica que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctas.

---

## 📊 Próximos Pasos (Opcionales)

1. **Dominio Personalizado:** Settings → Domains → Add Domain
2. **Analytics:** Settings → Analytics → Enable
3. **Edge Functions:** Para funcionalidades backend adicionales
4. **Monitoring con Sentry:** Configurar DSN de Sentry

---

## 🎉 ¡Felicitaciones!

Tu aplicación está en **producción** y accesible desde cualquier parte del mundo.

URL: `https://oddy-market-xxx.vercel.app`
