# ODDY Market 🛍️

E-commerce moderno mobile-first con integración completa de pagos, facturación electrónica (DGI Uruguay), y múltiples herramientas de gestión.

![ODDY Market](https://img.shields.io/badge/ODDY-Market-FF6B35?style=for-the-badge&logo=react)
![Status](https://img.shields.io/badge/Status-Production%20Ready-4ECDC4?style=for-the-badge)

---

## 📚 Documentación Rápida

**🆕 ¿Primera vez aquí? Empieza con una de estas guías:**

- 📖 **[ÍNDICE COMPLETO](/INDICE.md)** - Navegación de toda la documentación
- ⚡ **[GUÍA VISUAL 4 PASOS](/GUIA_VISUAL_4_PASOS.md)** - La forma más rápida de empezar
- 🚀 **[INICIO RÁPIDO](/INICIO_RAPIDO.md)** - Resumen ejecutivo
- 💻 **[GUÍA DE CURSOR](/CURSOR_GUIDE.md)** - Tutorial completo paso a paso
- 🎬 **[SCRIPTS AUTOMÁTICOS](/SCRIPTS_INFO.md)** - `start.bat` / `start.sh`

---

## 🚀 Cómo levantar el proyecto en Cursor

### Paso 1: Abrir el proyecto
1. Abre **Cursor**
2. Ve a `File > Open Folder` (o `Cmd/Ctrl + O`)
3. Selecciona la carpeta raíz del proyecto

### Paso 2: Instalar dependencias
Abre la terminal en Cursor (`Terminal > New Terminal` o `` Ctrl + ` ``) y ejecuta:

```bash
pnpm install
```

Si no tienes `pnpm` instalado, primero instálalo:
```bash
npm install -g pnpm
```

### Paso 3: Configurar variables de entorno
Las siguientes secrets ya están configuradas en el sistema:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ STRIPE_PUBLISHABLE_KEY
- ✅ PLEXO_CLIENT_ID
- ✅ FIXED_API_KEY

**No necesitas crear un archivo `.env` local** - estas variables se gestionan automáticamente en el entorno de Figma Make.

### Paso 4: Levantar el servidor de desarrollo
Este proyecto usa **Vite** como bundler. Para iniciar el servidor de desarrollo:

```bash
pnpm run dev
```

O si prefieres usar npm:
```bash
npm run dev
```

El proyecto se abrirá automáticamente en tu navegador en `http://localhost:5173`

### Paso 5: Build para producción
Para compilar el proyecto para producción:

```bash
pnpm run build
```

## 📁 Estructura del Proyecto

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Componente principal
│   │   ├── components/                # Componentes React
│   │   │   ├── AdminDashboard.tsx     # Dashboard administrativo
│   │   │   ├── BillingManagement.tsx  # Gestión de facturación (Fixed)
│   │   │   ├── PaymentIntegrations.tsx # Integraciones de pago
│   │   │   ├── Cart.tsx               # Carrito de compras
│   │   │   ├── Checkout.tsx           # Proceso de checkout
│   │   │   ├── Header.tsx             # Header con logo ODDY
│   │   │   └── ui/                    # Componentes UI reutilizables
│   │   └── utils/
│   │       └── billing-helper.ts      # Utilidades de facturación
│   └── styles/
│       ├── index.css                  # Estilos principales
│       ├── theme.css                  # Tokens de diseño (naranja/celeste)
│       └── tailwind.css               # Configuración Tailwind v4
│
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx              # Servidor Hono principal
│           ├── billing.tsx            # API de facturación
│           ├── integrations.tsx       # API de integraciones
│           └── kv_store.tsx           # Base de datos KV
│
├── docs/                              # Documentación completa
├── public/                            # Assets públicos
└── package.json
```

## 🎨 Diseño

- **Nombre**: ODDY Market
- **Mobile-first**: Diseño optimizado para dispositivos móviles
- **Color principal**: Naranja (`#FF6B35`)
- **Color secundario**: Celeste (`#4ECDC4`)
- **Framework CSS**: Tailwind CSS v4
- **Componentes UI**: Radix UI + shadcn/ui
- **Logo**: Hexágonos distintivos con fondo transparente

## 🔧 Tecnologías Principales

- **Frontend**: React 18.3.1 + Vite 6.3.5
- **Backend**: Supabase Edge Functions (Hono)
- **Base de datos**: Supabase (PostgreSQL)
- **Auth**: Firebase Authentication
- **Estilos**: Tailwind CSS v4
- **Iconos**: Lucide React
- **Animaciones**: Motion (anteriormente Framer Motion)

## 💳 Integraciones de Pago Activas

- ✅ **Mercado Pago** - Pagos en Latinoamérica
- ✅ **Mercado Libre** - Marketplace integration
- ✅ **PayPal** - Pagos internacionales
- ✅ **Stripe** - Procesamiento de tarjetas
- ✅ **Plexo** - Pasarela crítica para Uruguay

## 🧾 Sistema de Facturación Electrónica

- ✅ **Fixed (DGI Uruguay)** - Sistema completo de facturación electrónica
  - Generación de facturas y remitos
  - Numeración automática
  - Descarga de PDFs
  - Cumplimiento con regulaciones DGI

## 📋 Próximas Funcionalidades (según ROADMAP)

### 🔴 Prioridad CRÍTICA/ALTA
1. Mini CRM Básico
2. Sistema de Mailing con Resend
3. Gestión de Departamentos y Categorías

### 🟡 Pendientes
- Centro operativo de RRSS (Meta, Facebook, Instagram, WhatsApp)
- Edición de imágenes en plataforma
- Generador de códigos QR
- Rueda configurable para sorteos
- Integración con Google Ads
- Mini ERP completo

## 📚 Documentación Adicional

- [Sistema de Facturación](/docs/BILLING_SYSTEM.md)
- [Quick Start Facturación](/docs/BILLING_QUICKSTART.md)
- [Integración Plexo](/docs/PLEXO_INTEGRATION.md)
- [Resumen de Integraciones de Pago](/docs/PAYMENT_INTEGRATIONS_SUMMARY.md)
- [Roadmap Completo](/ROADMAP.md)

## 🐛 Troubleshooting

### El proyecto no levanta
1. Asegúrate de tener Node.js 18+ instalado
2. Borra `node_modules` y `pnpm-lock.yaml`, luego reinstala: `pnpm install`
3. Verifica que no haya otro proceso usando el puerto 5173

### Errores de compilación
1. Limpia la caché de Vite: `pnpm run build --force`
2. Reinicia el servidor de desarrollo

### Problemas con las integraciones
1. Verifica que las variables de entorno estén configuradas
2. Revisa los logs del servidor en `/supabase/functions/server/index.tsx`
3. Consulta la documentación específica en `/docs/`

## 📞 Soporte

Para issues o preguntas, revisa la documentación en `/docs/` o consulta el ROADMAP para ver el estado actual del proyecto.

---

**ODDY Market** - Tu tienda departamental del futuro
**Última actualización**: Febrero 2026
