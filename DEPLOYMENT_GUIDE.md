# 🚀 Guía de Despliegue - ODDY Market

## Stack de Producción

```
Frontend → Vercel (Free)
Backend → Supabase (Free)
CDN/Security → Cloudflare (Free)
Cache → Redis Cloud (Free)
Monitoring → Sentry (Free)
```

---

## 📋 Pre-requisitos

- [ ] Cuenta en GitHub
- [ ] Variables de entorno configuradas (ver `SETUP_VARIABLES.md`)
- [ ] Código commiteado y pusheado
- [ ] Build funciona localmente (`npm run build`)

---

## 1️⃣ Deploy en Vercel

### Opción A: Deploy Automático (Recomendado)

1. **Ir a Vercel**
   - https://vercel.com/
   - Login con GitHub

2. **Importar Proyecto**
   - Click en "Add New" → "Project"
   - Seleccionar el repositorio `ODDY_Market`
   - Click en "Import"

3. **Configurar Build**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Agregar Variables de Entorno**
   - Click en "Environment Variables"
   - Agregar todas las variables con `VITE_` de tu `.env.local`
   - Ejemplo:
     ```
     VITE_SUPABASE_URL=https://xxxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJ...
     VITE_SENTRY_DSN=https://...
     VITE_APP_URL=https://oddymarket.vercel.app
     ```

5. **Deploy**
   - Click en "Deploy"
   - Esperar 1-2 minutos
   - ✅ Tu sitio estará en: `https://oddymarket.vercel.app`

### Opción B: Deploy desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variables
vercel env add VITE_SUPABASE_URL
# ... agregar todas las variables

# Deploy a producción
vercel --prod
```

---

## 2️⃣ Configurar Supabase

### Crear Proyecto

1. **Ir a Supabase**
   - https://supabase.com/dashboard
   - Click en "New project"

2. **Configurar Proyecto**
   ```
   Name: oddymarket
   Database Password: [genera uno fuerte]
   Region: South America (São Paulo)
   Pricing: Free
   ```

3. **Obtener Credenciales**
   - Ir a Settings → API
   - Copiar:
     - `Project URL` → Variable `VITE_SUPABASE_URL`
     - `anon public` key → Variable `VITE_SUPABASE_ANON_KEY`

4. **Actualizar Variables en Vercel**
   - Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
   - Agregar/Actualizar las variables de Supabase
   - Redeploy el proyecto

### Configurar Base de Datos

```sql
-- Crear tabla de productos (ejemplo)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  category TEXT,
  discount INT DEFAULT 0,
  rating DECIMAL(2, 1),
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (true);

-- Crear tabla de usuarios (opcional - Supabase Auth lo maneja)
-- Supabase ya tiene auth.users por defecto
```

---

## 3️⃣ Configurar Cloudflare (Opcional)

### Agregar Dominio

1. **Registrar/Transferir Dominio**
   - Puedes usar cualquier registrar
   - Ejemplo: oddymarket.com

2. **Agregar a Cloudflare**
   - Dashboard → Add a Site
   - Ingresar tu dominio
   - Elegir plan Free

3. **Cambiar Nameservers**
   - Cloudflare te dará 2 nameservers
   - Cambiarlos en tu registrar
   - Esperar 24-48hrs

4. **Configurar DNS**
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy: ✅ Proxied (naranja)
   ```

5. **Configurar SSL**
   - SSL/TLS → Overview → Full
   - Edge Certificates → Always Use HTTPS: ✅

6. **Habilitar Cache**
   - Caching → Configuration
   - Browser Cache TTL: 4 hours
   - Cache Level: Standard

---

## 4️⃣ Configurar Sentry (Monitoring)

### Crear Proyecto

1. **Ir a Sentry**
   - https://sentry.io/
   - Create Account

2. **Crear Proyecto**
   ```
   Platform: React
   Name: oddymarket
   Alert frequency: Every event
   ```

3. **Obtener DSN**
   - Settings → Projects → oddymarket
   - Client Keys (DSN)
   - Copiar el DSN

4. **Instalar Sentry**
   ```bash
   npm install @sentry/react
   ```

5. **Inicializar en el Proyecto**
   - Ver `src/utils/sentry.js`
   - Descomentar código
   - Actualizar `src/main.jsx`:
     ```javascript
     import { initSentry } from './utils/sentry';
     
     initSentry();
     ```

6. **Configurar en Vercel**
   ```
   VITE_SENTRY_DSN=https://xxxxx@xxx.ingest.sentry.io/xxxxx
   VITE_SENTRY_ENVIRONMENT=production
   ```

---

## 5️⃣ Configurar Redis Cloud (Opcional)

### Crear Database

1. **Ir a Redis Cloud**
   - https://redis.com/try-free/
   - Sign Up

2. **Crear Database**
   ```
   Name: oddymarket-cache
   Cloud: AWS
   Region: São Paulo (closest to users)
   Plan: Free (30MB)
   ```

3. **Obtener Connection String**
   - Database → Configuration
   - Copiar: `redis://default:password@redis-xxxxx.cloud.redislabs.com:12345`

4. **Configurar en Vercel**
   ```
   REDIS_URL=redis://default:password@...
   ```

---

## 6️⃣ Configurar Dominio Personalizado

### En Vercel

1. **Agregar Dominio**
   - Vercel Dashboard → Tu Proyecto → Settings → Domains
   - Add Domain: `oddymarket.com` y `www.oddymarket.com`

2. **Configurar DNS (si no usas Cloudflare)**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Configurar Redirect**
   - `www.oddymarket.com` → `oddymarket.com`
   - Settings → Domains → Configure

---

## 📊 Post-Deployment Checklist

### Verificación Técnica

- [ ] Sitio carga en producción
- [ ] Sin errores en la consola del navegador
- [ ] Links funcionan correctamente
- [ ] Imágenes cargan
- [ ] API conecta con Supabase
- [ ] Errores se reportan a Sentry
- [ ] SSL/HTTPS funcionando
- [ ] Cache funcionando (headers)

### Verificación de Funcionalidad

- [ ] Navegación entre páginas
- [ ] Búsqueda funciona
- [ ] Agregar al carrito
- [ ] Ver detalle de producto
- [ ] Login/Registro (si aplica)
- [ ] Checkout (si aplica)
- [ ] Responsive en móvil

### Performance

- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1

### SEO

- [ ] Meta tags presentes
- [ ] Open Graph configurado
- [ ] Sitemap.xml (opcional)
- [ ] Robots.txt (opcional)

---

## 🔄 Proceso de Deploy Continuo

### Configuración de Git

```bash
# Main branch → Production (oddymarket.com)
git push origin main

# Develop branch → Preview (develop.oddymarket.vercel.app)
git push origin develop

# Feature branches → Preview automático
git push origin feature/mi-feature
```

### Vercel Automático

- **Cada push a main** → Deploy a producción
- **Cada push a otra branch** → Preview deployment
- **Cada PR** → Preview deployment con comentario en GitHub

---

## 🆘 Troubleshooting

### Error: Build Failed

```bash
# Verificar localmente
npm run build

# Ver logs en Vercel
# Vercel Dashboard → Deployments → Click en el deployment → Function Logs
```

### Error: 404 en rutas

- Verifica `vercel.json` tenga los rewrites correctos
- React Router necesita redirigir todo a `index.html`

### Error: Variables de entorno no funcionan

- Deben empezar con `VITE_`
- Redeploy después de agregar variables
- Vercel Dashboard → Redeploy

### Error: Supabase no conecta

- Verifica URL y API key
- Verifica CORS en Supabase (debe permitir tu dominio)
- Supabase Dashboard → API → URL Configuration

---

## 📈 Monitoreo y Analytics

### Vercel Analytics (Incluido)

- Automático con plan free
- Ver: Dashboard → Analytics

### Sentry (Error Tracking)

- Errores en tiempo real
- Performance monitoring
- Release tracking

### Google Analytics (Opcional)

```javascript
// En src/main.jsx
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
```

---

## 🎉 ¡Listo!

Tu aplicación está en producción en:
- **Production:** https://oddymarket.com
- **Preview:** https://oddymarket.vercel.app

### Próximos Pasos

1. Configurar Google Analytics
2. Configurar Meta Pixel (Facebook)
3. Implementar SEO avanzado
4. Configurar CI/CD tests
5. Configurar backups automáticos

---

¿Problemas? Revisa:
- Logs de Vercel
- Logs de Sentry
- Console del navegador
- Documentación de cada servicio
