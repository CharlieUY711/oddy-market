## Instrucciones de Setup

1. Copia el contenido de este archivo
2. Crea un archivo `.env.local` en la raíz del proyecto
3. Completa las variables con tus credenciales reales
4. ⚠️ **NUNCA** commitees `.env.local` al repositorio

---

## 📋 Template Completo

```bash
# ========================================
# ODDY MARKET - Variables de Entorno
# ========================================

# ========================================
# VITE - Variables Públicas
# ========================================
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=ODDY Market
VITE_APP_URL=http://localhost:5173

# ========================================
# SUPABASE - Backend
# ========================================
# Obtener en: https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ========================================
# SENTRY - Error Tracking
# ========================================
# Obtener en: https://sentry.io/settings/projects/
VITE_SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/123456
VITE_SENTRY_ENVIRONMENT=development

# ========================================
# REDIS CLOUD - Cache (Opcional)
# ========================================
# Obtener en: https://app.redislabs.com/
REDIS_URL=redis://default:password@redis-xxxxx.cloud.redislabs.com:12345

# ========================================
# CLOUDFLARE - CDN & Security (Opcional)
# ========================================
# Obtener en: https://dash.cloudflare.com/
CLOUDFLARE_API_TOKEN=tu-cloudflare-token
CLOUDFLARE_ZONE_ID=tu-zone-id

# ========================================
# MERCADO PAGO - Pagos Uruguay
# ========================================
# Obtener en: https://www.mercadopago.com.uy/developers/
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ========================================
# FEATURES FLAGS
# ========================================
VITE_ENABLE_PWA=false
VITE_ENABLE_SECOND_HAND=true
VITE_ENABLE_WHATSAPP=false

# ========================================
# OTROS
# ========================================
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

---

## 📚 Guía de Configuración por Servicio

### 1. **Supabase** (PRIORITARIO)

**¿Qué es?** Backend as a Service (Base de datos + Auth + Storage)

**Pasos:**
1. Ir a https://supabase.com/
2. Crear cuenta (free tier)
3. Crear nuevo proyecto
4. Ir a Settings → API
5. Copiar:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

**Variables:**
```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2. **Sentry** (Recomendado)

**¿Qué es?** Error tracking y monitoring

**Pasos:**
1. Ir a https://sentry.io/
2. Crear cuenta (free tier)
3. Crear nuevo proyecto → React
4. Copiar el DSN

**Variables:**
```bash
VITE_SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/123456
VITE_SENTRY_ENVIRONMENT=development
```

**Instalación adicional:**
```bash
npm install @sentry/react
```

---

### 3. **Redis Cloud** (Opcional - Cache)

**¿Qué es?** Cache in-memory para mejorar performance

**Pasos:**
1. Ir a https://redis.com/try-free/
2. Crear cuenta free
3. Crear base de datos
4. Copiar la connection string

**Variables:**
```bash
REDIS_URL=redis://default:password@redis-xxxxx.cloud.redislabs.com:12345
```

---

### 4. **Cloudflare** (Opcional - CDN)

**¿Qué es?** CDN global + Security + DDoS protection

**Pasos:**
1. Ir a https://dash.cloudflare.com/
2. Agregar tu dominio
3. Crear API Token (permisos: Zone/Cache Purge)
4. Copiar Zone ID

**Variables:**
```bash
CLOUDFLARE_API_TOKEN=tu-token
CLOUDFLARE_ZONE_ID=tu-zone-id
```

---

### 5. **Mercado Pago** (Para pagos en Uruguay)

**¿Qué es?** Pasarela de pagos

**Pasos:**
1. Ir a https://www.mercadopago.com.uy/developers/
2. Crear aplicación
3. Obtener credenciales de prueba

**Variables:**
```bash
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxx (para testing)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx (para testing)
```

---

## 🚀 Variables por Entorno

### Development (local)
```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_URL=http://localhost:5173
VITE_SENTRY_ENVIRONMENT=development
NODE_ENV=development
DEBUG=true
```

### Production (Vercel)
```bash
VITE_API_URL=https://api.oddymarket.com
VITE_APP_URL=https://oddymarket.com
VITE_SENTRY_ENVIRONMENT=production
NODE_ENV=production
DEBUG=false
```

---

## ✅ Checklist de Configuración

- [ ] Crear `.env.local` en la raíz
- [ ] Configurar Supabase (PRIORITARIO)
- [ ] Configurar Sentry (recomendado)
- [ ] Verificar que `.env.local` esté en `.gitignore`
- [ ] Probar que las variables se cargan: `console.log(import.meta.env)`
- [ ] Configurar variables en Vercel (para production)

---

## 🔒 Seguridad

### ⚠️ Variables PÚBLICAS (VITE_)
- Estas van al bundle del cliente
- Cualquiera puede verlas en el navegador
- Solo poner datos públicos aquí

### ⚠️ Variables PRIVADAS (sin VITE_)
- Solo para backend/Edge Functions
- NUNCA las expongas en el frontend
- Ejemplos: `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN`

---

## 📦 Archivos a Crear

```bash
# Desarrollo local
.env.local

# Para compartir con el equipo (sin secretos)
.env.example
```

---

## 🆘 Troubleshooting

### Variables no se cargan
1. Verifica que el archivo se llame `.env.local`
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Verifica que las variables empiecen con `VITE_` (para frontend)

### Error en Supabase
- Verifica que la URL termine en `.supabase.co`
- Verifica que copiaste el `anon public` key (no el `service_role`)

### Error en Sentry
- Verifica el DSN (debe empezar con `https://`)
- Instala el paquete: `npm install @sentry/react`
