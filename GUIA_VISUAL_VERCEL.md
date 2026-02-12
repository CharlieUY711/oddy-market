# 🎯 GUÍA VISUAL: DEPLOY EN VERCEL

**Duración**: 5-10 minutos  
**Dificultad**: Fácil  

---

## 🚀 PASO 1: IR A VERCEL

**Abre en tu navegador**:
```
https://vercel.com/new
```

**O si ya tienes cuenta**:
```
https://vercel.com/login
```

---

## 📱 PASO 2: PANTALLA PRINCIPAL

Verás algo como:

```
┌─────────────────────────────────────────┐
│  Import Git Repository                  │
├─────────────────────────────────────────┤
│  [GitHub icon] Continue with GitHub     │
│  [GitLab icon] Continue with GitLab     │
│  [Bitbucket] Continue with Bitbucket    │
└─────────────────────────────────────────┘
```

**👉 Haz clic en "Continue with GitHub"**

---

## 🔐 PASO 3: AUTORIZAR (si es necesario)

Si es tu primera vez, GitHub te pedirá autorización:

```
┌────────────────────────────────────┐
│  Authorize Vercel                  │
│  --------------------------------  │
│  Vercel by Vercel wants to:        │
│  ✓ Read your repositories          │
│  ✓ Read your user info             │
│                                    │
│  [Authorize Vercel]                │
└────────────────────────────────────┘
```

**👉 Haz clic en "Authorize Vercel"**

---

## 📂 PASO 4: SELECCIONAR REPOSITORIO

Busca tu repositorio:

```
┌──────────────────────────────────────────┐
│  Import Git Repository                   │
│  ──────────────────────────────────────  │
│  Search repositories...                  │
│  [🔍 oddy-market             ]           │
│                                          │
│  CharlieUY711/oddy-market   [Import]    │
│  ✓ Access granted                        │
└──────────────────────────────────────────┘
```

**👉 Haz clic en "Import" junto a `oddy-market`**

---

## ⚙️ PASO 5: CONFIGURAR PROYECTO

Verás esta pantalla:

```
┌────────────────────────────────────────────────────┐
│  Configure Project                                 │
│  ────────────────────────────────────────────────  │
│                                                    │
│  Project Name:                                     │
│  [oddy-market                           ]          │
│                                                    │
│  Framework Preset:                                 │
│  [Vite ▼]  ✓ Auto-detected                       │
│                                                    │
│  Root Directory:                                   │
│  [./                                    ]          │
│                                                    │
│  Build and Output Settings ▼                       │
│    Build Command:    [npm run build    ]          │
│    Output Directory: [dist              ]          │
│    Install Command:  [npm install       ]          │
│                                                    │
│  Environment Variables ▼                           │
│    [+ Add Variable]                                │
│                                                    │
│                              [Deploy]              │
└────────────────────────────────────────────────────┘
```

---

## 🔑 PASO 6: AGREGAR VARIABLES DE ENTORNO ⭐

**👉 Haz clic en "Environment Variables ▼"**

Se expandirá:

```
┌────────────────────────────────────────────────────┐
│  Environment Variables                             │
│  ────────────────────────────────────────────────  │
│                                                    │
│  Key:   [                               ]          │
│  Value: [                               ]          │
│  [+ Add]                                           │
└────────────────────────────────────────────────────┘
```

### **Variable 1:**
```
Key:   VITE_API_URL
Value: https://oddy-market-62.oddy123.deno.net
```
**👉 Haz clic en "+ Add"**

### **Variable 2:**
```
Key:   VITE_API_PREFIX
Value: /make-server-0dd48dc4
```
**👉 Haz clic en "+ Add"**

---

## 🚀 PASO 7: DEPLOY

```
┌────────────────────────────────────────────────────┐
│                                                    │
│                    [Deploy]                        │
│                                                    │
└────────────────────────────────────────────────────┘
```

**👉 Haz clic en el botón azul grande "Deploy"**

---

## ⏳ PASO 8: ESPERAR

Verás una pantalla de progreso:

```
┌────────────────────────────────────────────────────┐
│  Building...                                       │
│  ────────────────────────────────────────────────  │
│                                                    │
│  ✓ Cloning repository                             │
│  ✓ Installing dependencies                        │
│  ⟳ Building project...                            │
│  ⚪ Deploying...                                   │
│                                                    │
│  [View Build Logs]                                 │
└────────────────────────────────────────────────────┘
```

**⏱️ Esto toma 2-3 minutos**

---

## 🎉 PASO 9: ¡ÉXITO!

Cuando termine, verás:

```
┌────────────────────────────────────────────────────┐
│  🎉 Congratulations!                               │
│  ────────────────────────────────────────────────  │
│                                                    │
│  Your project is live!                             │
│                                                    │
│  https://oddy-market.vercel.app                    │
│  or                                                │
│  https://oddy-market-charlieuy711.vercel.app       │
│                                                    │
│  [Visit]  [View Project]  [Share]                 │
└────────────────────────────────────────────────────┘
```

**👉 Haz clic en "Visit" para ver tu sitio**

---

## ✅ PASO 10: VERIFICAR

**Abre tu sitio y verifica:**

1. **La página carga** ✅
2. **Presiona F12** (DevTools)
3. **Ve a Console**
4. **NO debe haber errores rojos** ✅
5. **Ve a Network**
6. **Verifica que las llamadas al backend funcionen** ✅

---

## 📸 ¿QUÉ HACER SI HAY ERRORES?

### **Si el build falla:**

1. En Vercel, haz clic en **"View Build Logs"**
2. **Copia el error completo**
3. **Compártelo aquí** para diagnosticar

### **Si hay errores CORS:**

En la consola del navegador (F12) verás algo como:
```
Access to fetch at '...' has been blocked by CORS policy
```

**No debería pasar** (el backend tiene CORS configurado), pero si pasa, avísame.

---

## 🔄 PARA FUTURAS ACTUALIZACIONES

Cuando hagas cambios en el código:

```bash
# 1. Commit
git add .
git commit -m "Tu mensaje"

# 2. Push
git push

# 3. ¡Listo! Vercel detecta el cambio y deploy automático
```

**No necesitas hacer nada más en Vercel**, todo es automático.

---

## 🎯 RESULTADO ESPERADO

```
✅ Frontend: https://oddy-market.vercel.app
✅ Backend:  https://oddy-market-62.oddy123.deno.net
✅ Aplicación completa funcionando
```

---

**👉 COMPARTE LA URL CUANDO ESTÉ LISTO** 🚀
