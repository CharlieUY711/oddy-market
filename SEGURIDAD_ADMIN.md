# 🔐 Seguridad del Panel de Admin

## ⚠️ Medidas de Seguridad Implementadas

### 1. Autenticación con Contraseña
- El panel de admin requiere contraseña en **producción**
- En **desarrollo** es accesible sin contraseña (para facilitar testing)

### 2. Sesión Temporal
- La autenticación se guarda en `sessionStorage` (se borra al cerrar el navegador)
- NO se guarda en `localStorage` para mayor seguridad

### 3. Link Oculto en Producción
- El link "🎛️ Admin" en el footer **solo aparece en desarrollo**
- En producción hay que conocer la URL: `/admin`

### 4. Contraseña Configurable
- La contraseña se configura con variable de entorno: `VITE_ADMIN_PASSWORD`
- Por defecto: `admin2024` (solo en desarrollo)

---

## 🔧 Configurar Contraseña en Producción

### Paso 1: Agregar Variable en Vercel

1. Ve a: https://vercel.com/carlos-varallas-projects/oddy-market/settings/environment-variables
2. Click en **"Add New"**
3. **Name:** `VITE_ADMIN_PASSWORD`
4. **Value:** `TU_CONTRASEÑA_SEGURA` (¡CÁMBIALA!)
5. **Environments:** ✅ Production, ✅ Preview, ✅ Development
6. Click **"Save"**

### Paso 2: Redeploy

1. Ve a: https://vercel.com/carlos-varallas-projects/oddy-market/deployments
2. Click en el último deployment
3. Click en **"..."** → **"Redeploy"**
4. Espera 2-3 minutos

---

## 🔑 Recomendaciones de Contraseña

### ❌ NO usar:
- `admin`
- `password`
- `123456`
- Fechas personales
- Palabras del diccionario

### ✅ SÍ usar:
- Al menos 12 caracteres
- Mayúsculas y minúsculas
- Números
- Caracteres especiales

**Ejemplo de contraseña segura:**
```
Oddy$Market2024!Secure#Admin
```

---

## 🚀 Cómo Acceder

### En Desarrollo (Local)
1. Ve a: http://localhost:3000/admin
2. ✅ Acceso directo (sin contraseña)
3. Verás el badge "🔧 Modo Desarrollo"

### En Producción
1. Ve a: https://oddy-market.vercel.app/admin
2. 🔒 Ingresa la contraseña configurada en Vercel
3. Click en "Ingresar"
4. La sesión durará hasta que cierres el navegador

---

## 🔐 Seguridad Adicional (Futuro)

Para mayor seguridad, se puede implementar:

### Nivel 1 (Actual)
- ✅ Contraseña simple
- ✅ SessionStorage
- ✅ Link oculto en producción

### Nivel 2 (Recomendado)
- [ ] Autenticación con Supabase Auth
- [ ] Roles de usuario (admin, editor, viewer)
- [ ] Logs de acceso
- [ ] Límite de intentos fallidos

### Nivel 3 (Máximo)
- [ ] Autenticación de dos factores (2FA)
- [ ] IP whitelist
- [ ] Tokens de acceso temporal
- [ ] Auditoría completa de acciones

---

## ⚠️ Importante

1. **NUNCA** compartas la contraseña públicamente
2. **CAMBIA** la contraseña cada 3 meses
3. **NO** uses la misma contraseña que otros servicios
4. **REVISA** los logs de acceso regularmente

---

## 🆘 Si Olvidaste la Contraseña

1. Ve a: https://vercel.com/carlos-varallas-projects/oddy-market/settings/environment-variables
2. Busca `VITE_ADMIN_PASSWORD`
3. Click en **"Edit"**
4. Cambia el valor
5. **Redeploy** el proyecto

---

## 📱 Acceso desde Móvil

La autenticación funciona igual en móvil:
1. Abre: https://oddy-market.vercel.app/admin
2. Ingresa la contraseña
3. La sesión se mantiene hasta cerrar el navegador

---

## ✅ Checklist de Seguridad

- [ ] Contraseña segura configurada en Vercel
- [ ] Link de admin oculto en footer (producción)
- [ ] Contraseña diferente a otros servicios
- [ ] Solo personas autorizadas conocen la URL `/admin`
- [ ] Contraseña guardada en lugar seguro (no en el código)

---

**Última actualización:** 2026-02-12  
**Nivel de seguridad:** MEDIO (suficiente para proyectos pequeños/medianos)

---

## 🔄 Para Desactivar Completamente el Admin

Si quieres desactivar el panel de admin en producción:

1. Comenta la ruta en `src/App.jsx`:
```javascript
// <Route path="/admin" element={<Admin />} />
```

2. Haz commit y push:
```bash
git add -A
git commit -m "disable admin panel in production"
git push
```

El panel solo estará disponible en desarrollo.
