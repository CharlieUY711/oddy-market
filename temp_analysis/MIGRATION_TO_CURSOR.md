# Plan de Migración a Cursor - ODDY Market

## 📋 Resumen Ejecutivo

Este documento detalla el proceso completo para migrar el proyecto ODDY Market desde Figma Make a Cursor IDE, manteniendo toda la funcionalidad y preparando el código para producción.

---

## 🎯 Objetivos de la Migración

1. **Portabilidad**: Mover todo el código a un entorno de desarrollo local
2. **Escalabilidad**: Preparar la estructura para crecimiento
3. **Mantenibilidad**: Mejorar la organización del código
4. **Performance**: Optimizar assets y bundle size
5. **Producción**: Preparar para deployment real

---

## 📦 Fase 1: Preparación del Entorno (Día 1)

### 1.1 Instalación de Herramientas Base

```bash
# Node.js LTS (v20.x recomendado)
# Descargar desde: https://nodejs.org/

# Verificar instalación
node --version  # debe mostrar v20.x
npm --version   # debe mostrar v10.x

# Instalar pnpm globalmente (gestor de paquetes usado en el proyecto)
npm install -g pnpm@latest

# Verificar pnpm
pnpm --version  # debe mostrar v9.x
```

### 1.2 Instalar Cursor IDE

```bash
# Descargar desde: https://cursor.sh/
# Instalar extensiones recomendadas:
# - ESLint
# - Prettier
# - Tailwind CSS IntelliSense
# - TypeScript Vue Plugin (Volar)
# - Error Lens
```

### 1.3 Instalar Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (con Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Verificar instalación
supabase --version
```

---

## 📂 Fase 2: Extracción del Código (Día 1-2)

### 2.1 Estructura del Proyecto a Crear

```
oddy-market/
├── .cursorrules                    # Reglas de AI para Cursor
├── .env.local                      # Variables de entorno (NO subir a git)
├── .env.example                    # Template de variables
├── .gitignore                      # Archivos a ignorar
├── package.json                    # Dependencias del proyecto
├── tsconfig.json                   # Configuración TypeScript
├── vite.config.ts                  # Configuración Vite
├── tailwind.config.js              # Configuración Tailwind v4
├── README.md                       # Documentación principal
├── MIGRATION_TO_CURSOR.md          # Este documento
├── PRODUCTION_DEPLOYMENT.md        # Plan de deployment
├── docs/                           # Documentación adicional
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── FEATURES.md
├── public/                         # Assets estáticos
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── App.tsx                # Componente principal
│   │   ├── components/            # Componentes React
│   │   │   ├── admin/            # Componentes de admin
│   │   │   ├── auth/             # Componentes de autenticación
│   │   │   ├── cart/             # Carrito de compras
│   │   │   ├── checkout/         # Proceso de pago
│   │   │   ├── products/         # Productos
│   │   │   ├── crm/              # CRM components
│   │   │   ├── erp/              # ERP components
│   │   │   ├── marketing/        # Herramientas de marketing
│   │   │   ├── social/           # Integración RRSS
│   │   │   └── ui/               # Componentes UI base
│   │   └── hooks/                # Custom React hooks
│   ├── imports/                   # Assets importados de Figma
│   ├── styles/
│   │   ├── theme.css             # Theme tokens CSS
│   │   ├── fonts.css             # Fuentes
│   │   └── globals.css           # Estilos globales
│   ├── utils/
│   │   ├── supabase/             # Utilidades Supabase
│   │   └── helpers/              # Funciones helper
│   └── main.tsx                  # Entry point
├── supabase/
│   ├── config.toml               # Configuración local Supabase
│   ├── functions/
│   │   └── server/
│   │       ├── index.tsx         # Servidor Hono
│   │       ├── kv_store.tsx      # KV Store utilities
│   │       ├── routes/           # Rutas del servidor
│   │       │   ├── auth.tsx
│   │       │   ├── products.tsx
│   │       │   ├── orders.tsx
│   │       │   ├── mercadolibre.tsx
│   │       │   ├── mercadopago.tsx
│   │       │   ├── social.tsx
│   │       │   └── admin.tsx
│   │       └── middleware/       # Middleware del servidor
│   └── migrations/               # Migraciones DB (futuro)
└── tests/                        # Tests (opcional)
```

### 2.2 Copiar Archivos desde Figma Make

**Proceso Manual:**

1. **Copiar estructura src/**
   - Abrir cada archivo en Figma Make
   - Copiar contenido completo
   - Pegar en Cursor en la ubicación correspondiente

2. **Copiar configuración**
   - `package.json` → copiar todas las dependencias
   - `tsconfig.json` → copiar configuración TypeScript
   - Archivos CSS en `src/styles/`

3. **Copiar Supabase functions**
   - Todo el contenido de `/supabase/functions/server/`
   - Mantener estructura de carpetas

### 2.3 Archivos de Configuración a Crear

**`.gitignore`**
```
# Dependencies
node_modules
.pnpm-store

# Environment variables
.env
.env.local
.env.production

# Build outputs
dist
build
.vite

# Supabase
.supabase
supabase/.branches
supabase/.temp

# Logs
*.log
npm-debug.log*

# IDE
.vscode
.idea
*.swp
*.swo
.DS_Store

# Testing
coverage
.nyc_output

# Misc
.cache
temp
tmp
```

**`.env.example`**
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# APIs de Terceros
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOLIBRE_ACCESS_TOKEN=APP-USR-xxx
MERCADOLIBRE_USER_ID=xxx
RESEND_API_KEY=re_xxx
REPLICATE_API_KEY=r8_xxx
REMOVE_BG_API_KEY=xxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+1xxx

# Meta/Facebook
META_ACCESS_TOKEN=xxx
META_APP_ID=xxx
META_APP_SECRET=xxx

# Google
GOOGLE_ADS_CLIENT_ID=xxx
GOOGLE_ADS_CLIENT_SECRET=xxx
GOOGLE_ADS_DEVELOPER_TOKEN=xxx

# PayPal
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx

# Fixed/Plexo
PLEXO_CLIENT_ID=xxx
PLEXO_ENVIRONMENT=production
FIXED_API_KEY=xxx

# Configuración
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:5173
```

**`vite.config.ts`**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/app/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'recharts', 'react-slick'],
          'form-vendor': ['react-hook-form'],
          'motion-vendor': ['motion'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'motion'],
  },
})
```

**`.cursorrules`**
```
# ODDY Market - Cursor Rules

## Contexto del Proyecto
Este es un ecommerce completo mobile-first con integración de RRSS, CRM, ERP, y múltiples pasarelas de pago.

## Stack Tecnológico
- React 18 + TypeScript
- Tailwind CSS v4
- Vite
- Supabase (Backend, Auth, Storage)
- Hono (Edge Functions Server)

## Reglas de Código

### React
- Usar functional components con hooks
- Preferir named exports sobre default exports (excepto App.tsx)
- Usar TypeScript para todos los componentes
- Implementar error boundaries donde sea crítico

### Estilo
- Mobile-first approach (empezar con mobile, luego desktop)
- Colores: naranja principal (#FF6B35), celeste secundario (#4ECDC4)
- Usar Tailwind classes, evitar CSS inline
- Componentes deben ser responsivos por defecto

### Imports
- Usar alias: @/... para src/, @components/... para componentes
- Ordenar imports: React, librerías externas, componentes locales, utils, tipos
- Agrupar imports relacionados

### Backend
- Todas las rutas server deben tener prefijo /make-server-0dd48dc4
- Usar middleware de autenticación para rutas protegidas
- Nunca exponer SUPABASE_SERVICE_ROLE_KEY al frontend
- Logging exhaustivo de errores

### Seguridad
- Validar inputs en servidor
- Sanitizar datos de usuario
- Usar prepared statements para queries
- Implementar rate limiting

### Performance
- Lazy load de componentes pesados
- Optimizar imágenes (usar ImageWithFallback)
- Implementar virtual scrolling para listas largas
- Memoizar componentes costosos

## Estructura de Componentes
Cada componente complejo debe seguir:
```
ComponentName/
├── index.tsx          # Export barrel
├── ComponentName.tsx  # Componente principal
├── types.ts          # TypeScript types
└── utils.ts          # Funciones helper
```

## Convenciones de Nombres
- Componentes: PascalCase (ProductCard.tsx)
- Hooks: camelCase con prefijo use (useAuth.ts)
- Utils: camelCase (formatPrice.ts)
- Constantes: SCREAMING_SNAKE_CASE
- Tipos: PascalCase con sufijo Type o Interface

## Testing (Futuro)
- Unit tests para utils
- Integration tests para flujos críticos
- E2E tests para checkout completo
```

---

## 🔧 Fase 3: Instalación de Dependencias (Día 2)

### 3.1 Instalar Dependencias desde package.json

```bash
# En la carpeta raíz del proyecto
cd oddy-market

# Instalar todas las dependencias
pnpm install

# Verificar que no haya errores
pnpm list
```

### 3.2 Verificar Dependencias Críticas

```bash
# Verificar que estas dependencias estén instaladas:
pnpm list react react-dom
pnpm list @supabase/supabase-js
pnpm list hono
pnpm list lucide-react
pnpm list recharts
pnpm list motion
pnpm list react-hook-form
pnpm list tailwindcss
```

---

## 🗄️ Fase 4: Configuración de Supabase Local (Día 2-3)

### 4.1 Inicializar Supabase Local

```bash
# En la carpeta raíz del proyecto
supabase init

# Iniciar Supabase local (Docker debe estar corriendo)
supabase start

# Esto iniciará:
# - PostgreSQL en puerto 54322
# - Studio en http://localhost:54323
# - API en http://localhost:54321
# - Edge Functions en http://localhost:54321/functions/v1
```

### 4.2 Obtener Credenciales Locales

```bash
# Ver credenciales locales
supabase status

# Copiar:
# - API URL
# - anon key
# - service_role key

# Agregar a .env.local
```

### 4.3 Configurar Edge Function Local

```bash
# La función ya existe en /supabase/functions/server/
# Desplegar localmente
supabase functions serve server

# Probar la función
curl http://localhost:54321/functions/v1/make-server-0dd48dc4/health
```

---

## 🎨 Fase 5: Ajustes de Assets (Día 3)

### 5.1 Manejo de Imágenes Figma

El código actual usa el esquema `figma:asset/...` que solo funciona en Figma Make.

**Estrategia de migración:**

1. **Identificar todos los imports figma:asset**
```bash
# Buscar en el código
grep -r "figma:asset" src/
```

2. **Reemplazar con imports normales**
```typescript
// Antes (Figma Make)
import img from "figma:asset/abc123.png"

// Después (Cursor)
import img from "@/assets/images/product-hero.png"
```

3. **Crear estructura de assets**
```
src/assets/
├── images/
│   ├── products/
│   ├── marketing/
│   └── ui/
├── icons/
└── fonts/
```

4. **Usar placeholder de Unsplash para desarrollo**
```typescript
// Temporal durante desarrollo
const imgUrl = "https://images.unsplash.com/photo-xxx?w=800"
```

### 5.2 SVGs Importados

Los SVGs ya están en `/src/imports/`, mantener esa estructura.

---

## 🚀 Fase 6: Testing Local (Día 3-4)

### 6.1 Iniciar Desarrollo

```bash
# Terminal 1: Frontend
pnpm dev

# Terminal 2: Supabase (si no está corriendo)
supabase start

# Terminal 3: Edge Functions
supabase functions serve
```

### 6.2 Checklist de Testing

**Funcionalidades Críticas a Verificar:**

- [ ] Login/Registro funciona
- [ ] Navegación entre páginas
- [ ] Visualización de productos
- [ ] Agregar al carrito
- [ ] Proceso de checkout
- [ ] Panel de admin accesible
- [ ] Dashboard de administrador carga
- [ ] Sistema de roles funciona
- [ ] Integración con Mercado Libre (mock o real)
- [ ] Integración con Mercado Pago (modo test)
- [ ] Upload de imágenes
- [ ] Generación de QR
- [ ] Envío de emails (Resend test)
- [ ] WhatsApp notifications (Twilio test)

### 6.3 Debugging Común

**Problema: Module not found**
```bash
# Solución: Verificar imports y reinstalar
rm -rf node_modules .pnpm-store
pnpm install
```

**Problema: Supabase connection error**
```bash
# Solución: Verificar .env.local y que Supabase esté corriendo
supabase status
```

**Problema: Edge function error**
```bash
# Solución: Ver logs detallados
supabase functions serve --debug
```

---

## 📝 Fase 7: Refactoring y Optimización (Día 4-7)

### 7.1 Code Splitting

```typescript
// En App.tsx
import { lazy, Suspense } from 'react'

const AdminDashboard = lazy(() => import('@components/admin/AdminDashboard'))
const ProductCatalog = lazy(() => import('@components/products/ProductCatalog'))

// Usar con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### 7.2 Optimizar Bundle Size

```bash
# Analizar bundle
pnpm build
pnpm dlx vite-bundle-visualizer

# Identificar paquetes grandes y hacer code splitting
```

### 7.3 Implementar Error Boundaries

```typescript
// src/app/components/ui/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

class ErrorBoundary extends Component<Props> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Error occurred</div>
    }
    return this.props.children
  }
}

export default ErrorBoundary
```

### 7.4 Agregar Logging

```bash
# Instalar herramienta de logging
pnpm add pino pino-pretty

# Configurar logger
# src/utils/logger.ts
```

---

## 🔐 Fase 8: Variables de Entorno (Día 7)

### 8.1 Organizar Variables

**Crear archivo `.env.local`** con todas las claves reales:

```bash
# Copiar desde Figma Make los valores actuales de:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - MERCADOPAGO_ACCESS_TOKEN
# - MERCADOLIBRE_ACCESS_TOKEN
# - TWILIO_*
# - Etc.
```

### 8.2 Implementar Validación

```typescript
// src/utils/env.ts
export function validateEnv() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'MERCADOPAGO_ACCESS_TOKEN',
  ]
  
  const missing = required.filter(key => !import.meta.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}
```

---

## 📊 Fase 9: Documentación (Día 7-8)

### 9.1 Actualizar README.md

```markdown
# ODDY Market - Ecommerce Completo

## Descripción
[Descripción del proyecto]

## Stack Tecnológico
- React 18 + TypeScript
- Tailwind CSS v4
- Vite
- Supabase
- Hono

## Instalación

```bash
pnpm install
cp .env.example .env.local
# Configurar variables en .env.local
supabase start
pnpm dev
```

## Scripts

```bash
pnpm dev          # Desarrollo
pnpm build        # Build producción
pnpm preview      # Preview build
pnpm lint         # Linting
supabase start    # Iniciar Supabase local
```

## Estructura del Proyecto
[Documentar estructura]

## Contribuir
[Guías de contribución]
```

### 9.2 Documentar APIs

Crear `docs/API.md` con todos los endpoints del servidor.

---

## ✅ Checklist Final de Migración

### Setup Inicial
- [ ] Cursor IDE instalado
- [ ] Node.js + pnpm instalados
- [ ] Supabase CLI instalado
- [ ] Docker instalado y corriendo

### Código
- [ ] Todo el código de src/ copiado
- [ ] Todos los componentes presentes
- [ ] Supabase functions copiadas
- [ ] Archivos de configuración creados
- [ ] .env.example creado
- [ ] .gitignore configurado

### Dependencias
- [ ] pnpm install exitoso
- [ ] No hay conflictos de dependencias
- [ ] Todas las dependencias críticas presentes

### Supabase
- [ ] Supabase local iniciado
- [ ] Edge functions funcionando
- [ ] Credenciales configuradas en .env.local
- [ ] KV Store operativo

### Assets
- [ ] Imágenes figma:asset reemplazadas
- [ ] SVGs accesibles
- [ ] Fonts cargando correctamente

### Testing
- [ ] Frontend inicia sin errores
- [ ] Login/registro funciona
- [ ] Navegación funciona
- [ ] APIs responden
- [ ] No hay errores de consola críticos

### Documentación
- [ ] README.md completo
- [ ] API.md documentada
- [ ] .cursorrules configurado
- [ ] Comentarios en código crítico

---

## 🚨 Problemas Comunes y Soluciones

### 1. Error: Cannot find module '@/...'

**Causa:** Alias no configurados en tsconfig.json

**Solución:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/app/components/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```

### 2. Error: Supabase connection refused

**Causa:** Supabase no está corriendo

**Solución:**
```bash
supabase start
# Verificar estado
supabase status
```

### 3. Error: Edge function 404

**Causa:** Ruta incorrecta o función no desplegada

**Solución:**
```bash
# Verificar que la ruta incluya el prefijo
# /make-server-0dd48dc4/...

# Re-desplegar función
supabase functions serve server --debug
```

### 4. Error: figma:asset not found

**Causa:** Esquema figma:asset no existe fuera de Figma Make

**Solución:**
- Reemplazar con imports normales
- Usar Unsplash temporalmente
- Organizar assets en src/assets/

### 5. Error: Module externalized for browser compatibility

**Causa:** Módulo Node.js en código browser

**Solución:**
- Mover lógica al servidor
- Usar alternativa browser-compatible

---

## 📈 Próximos Pasos Post-Migración

1. **Testing Exhaustivo** (2-3 días)
   - Probar todas las funcionalidades
   - Identificar bugs
   - Corregir incompatibilidades

2. **Optimización** (2-3 días)
   - Reducir bundle size
   - Mejorar performance
   - Implementar caching

3. **Preparar Producción** (ver PRODUCTION_DEPLOYMENT.md)
   - Configurar CI/CD
   - Setup hosting
   - Configurar dominio

4. **Implementar Funcionalidades Faltantes**
   - 2FA
   - Rate limiting
   - Integración carriers
   - Google Shopping feed

---

## 🆘 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs de consola
2. Verifica que Supabase esté corriendo
3. Confirma que todas las variables de entorno estén configuradas
4. Revisa la documentación de Cursor y Supabase
5. Consulta la documentación específica de cada integración

---

## 📅 Timeline Estimado

| Fase | Duración | Descripción |
|------|----------|-------------|
| 1. Preparación | 4-6 horas | Instalar herramientas |
| 2. Extracción | 1 día | Copiar código y configurar estructura |
| 3. Dependencias | 2-4 horas | Instalar y verificar |
| 4. Supabase | 4-6 horas | Configurar local |
| 5. Assets | 4-6 horas | Migrar imágenes y assets |
| 6. Testing | 1-2 días | Testing completo |
| 7. Refactoring | 3-4 días | Optimizar código |
| 8. Variables | 2-3 horas | Configurar env |
| 9. Documentación | 1 día | Documentar todo |
| **TOTAL** | **7-10 días** | Migración completa |

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0  
**Proyecto:** ODDY Market
