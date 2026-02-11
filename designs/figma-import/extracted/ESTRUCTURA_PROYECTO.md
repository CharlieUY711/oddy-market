# 📂 ODDY Market - Mapa Completo del Proyecto

Este archivo contiene la estructura completa del proyecto para referencia rápida.

## 🎯 Archivos de Entrada Rápida

### Para abrir en Cursor
1. **Abre la carpeta raíz del proyecto en Cursor**
2. **Lee**: `/CURSOR_START.md` - Guía de inicio rápido
3. **Lee**: `/README.md` - Documentación completa
4. **Lee**: `/.cursorrules` - Reglas del proyecto para Cursor

### Scripts de inicio automático
- **Windows**: `start.bat`
- **Mac/Linux**: `start.sh`

---

## 📁 Estructura Completa del Proyecto

```
ODDY-Market/
│
├── 📄 ARCHIVOS DE CONFIGURACIÓN Y DOCUMENTACIÓN PRINCIPAL
│   ├── .cursorrules                    # ⭐ Reglas para Cursor AI
│   ├── README.md                       # ⭐ Documentación principal
│   ├── CURSOR_START.md                 # ⭐ Guía de inicio rápido para Cursor
│   ├── package.json                    # Dependencias del proyecto
│   ├── tsconfig.json                   # Configuración TypeScript
│   ├── tsconfig.node.json              # TypeScript para Node
│   ├── vite.config.ts                  # Configuración Vite
│   ├── postcss.config.mjs              # Configuración PostCSS
│   ├── index.html                      # HTML principal (punto de entrada)
│   ├── start.bat                       # Script inicio Windows
│   └── start.sh                        # Script inicio Mac/Linux
│
├── 📚 DOCUMENTACIÓN ADICIONAL
│   ├── ATTRIBUTIONS.md                 # Atribuciones
│   ├── CHECKLIST.md                    # Checklist de desarrollo
│   ├── CONFIGURACION_COMPLETA.md       # Config completa del proyecto
│   ├── CURSOR_GUIDE.md                 # Guía detallada Cursor
│   ├── CURSOR_SETUP.md                 # Setup inicial Cursor
│   ├── EMPIEZA_AQUI.md                 # Punto de inicio
│   ├── GUIA_VISUAL_4_PASOS.md          # Tutorial visual rápido
│   ├── INDICE.md                       # Índice de documentación
│   ├── INICIO_RAPIDO.md                # Inicio rápido
│   ├── INTEGRACIONES_PAGO.md           # Doc de integraciones de pago
│   ├── ROADMAP.md                      # Roadmap del proyecto
│   └── SCRIPTS_INFO.md                 # Info sobre scripts
│
├── 📂 docs/ - DOCUMENTACIÓN TÉCNICA DETALLADA
│   ├── BILLING_INTEGRATION_EXAMPLE.md  # Ejemplo integración facturación
│   ├── BILLING_QUICKSTART.md           # Inicio rápido facturación
│   ├── BILLING_SYSTEM.md               # Sistema de facturación completo
│   ├── PAYMENT_INTEGRATIONS_SUMMARY.md # Resumen integraciones pago
│   ├── PLEXO_INTEGRATION.md            # Integración Plexo (Uruguay)
│   ├── PLEXO_QUICKSTART.md             # Inicio rápido Plexo
│   └── README.md                       # Índice de docs técnica
│
├── 📂 guidelines/ - GUÍAS DE ESTILO
│   └── Guidelines.md                   # Guías de desarrollo
│
├── 📂 public/ - ARCHIVOS PÚBLICOS ESTÁTICOS
│   ├── logo-icon.png                   # Logo favicon
│   └── vite.svg                        # Logo Vite
│
├── 📂 src/ - CÓDIGO FUENTE PRINCIPAL
│   │
│   ├── 📂 app/ - APLICACIÓN REACT
│   │   │
│   │   ├── App.tsx                     # ⭐ COMPONENTE PRINCIPAL
│   │   │
│   │   ├── 📂 components/ - COMPONENTES REACT
│   │   │   ├── AdminDashboard.tsx      # Dashboard admin completo
│   │   │   ├── BillingManagement.tsx   # Gestión facturación (Fixed)
│   │   │   ├── Cart.tsx                # Carrito de compras
│   │   │   ├── Checkout.tsx            # Proceso de checkout
│   │   │   ├── Header.tsx              # ⭐ Header con logo ODDY
│   │   │   ├── HomePage.tsx            # Página de inicio
│   │   │   ├── PaymentIntegrations.tsx # Panel integraciones pago
│   │   │   ├── ProductCard.tsx         # Card de producto
│   │   │   │
│   │   │   ├── 📂 figma/
│   │   │   │   └── ImageWithFallback.tsx # Componente imagen (protegido)
│   │   │   │
│   │   │   └── 📂 ui/ - COMPONENTES UI BASE (Radix UI + shadcn)
│   │   │       ├── accordion.tsx
│   │   │       ├── alert-dialog.tsx
│   │   │       ├── alert.tsx
│   │   │       ├── aspect-ratio.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── breadcrumb.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── carousel.tsx
│   │   │       ├── chart.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── collapsible.tsx
│   │   │       ├── command.tsx
│   │   │       ├── context-menu.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── drawer.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── form.tsx
│   │   │       ├── hover-card.tsx
│   │   │       ├── input-otp.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── menubar.tsx
│   │   │       ├── navigation-menu.tsx
│   │   │       ├── pagination.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── progress.tsx
│   │   │       ├── radio-group.tsx
│   │   │       ├── resizable.tsx
│   │   │       ├── scroll-area.tsx
│   │   │       ├── select.tsx
│   │   │       ├── separator.tsx
│   │   │       ├── sheet.tsx
│   │   │       ├── sidebar.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── slider.tsx
│   │   │       ├── sonner.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── textarea.tsx
│   │   │       ├── toggle-group.tsx
│   │   │       ├── toggle.tsx
│   │   │       ├── tooltip.tsx
│   │   │       ├── use-mobile.ts
│   │   │       └── utils.ts
│   │   │
│   │   └── 📂 utils/
│   │       └── billing-helper.ts       # Helpers de facturación
│   │
│   ├── main.tsx                        # Punto de entrada React
│   │
│   └── 📂 styles/ - ESTILOS GLOBALES
│       ├── fonts.css                   # Importación de fuentes
│       ├── index.css                   # Estilos principales
│       ├── tailwind.css                # Base Tailwind v4
│       └── theme.css                   # ⭐ TOKENS DE DISEÑO (colores)
│
├── 📂 supabase/ - BACKEND SUPABASE
│   └── 📂 functions/
│       └── 📂 server/ - SERVIDOR HONO
│           ├── index.tsx               # ⭐ Servidor principal
│           ├── billing.tsx             # API facturación
│           ├── integrations.tsx        # API integraciones pago
│           └── kv_store.tsx            # Base datos KV (protegido)
│
├── 📂 utils/
│   └── 📂 supabase/
│       └── info.tsx                    # Info Supabase (protegido)
│
└── 📄 OTROS ARCHIVOS
    ├── ml-auth-helper.html             # Helper auth Mercado Libre
    └── pnpm-lock.yaml                  # Lock file pnpm (no editar)
```

---

## 🎯 Archivos Clave para Empezar a Desarrollar

### 1. Frontend Principal
- `/src/app/App.tsx` - Componente raíz, lógica principal
- `/src/app/components/Header.tsx` - Header con logo ODDY Market
- `/src/app/components/HomePage.tsx` - Página de inicio

### 2. Estilos y Diseño
- `/src/styles/theme.css` - Tokens de color (naranja #FF6B35, celeste #4ECDC4)
- `/src/styles/index.css` - Estilos globales

### 3. Backend API
- `/supabase/functions/server/index.tsx` - Servidor Hono
- `/supabase/functions/server/billing.tsx` - Facturación
- `/supabase/functions/server/integrations.tsx` - Pagos

### 4. Componentes UI
- `/src/app/components/ui/` - Todos los componentes base reutilizables

### 5. Configuración
- `/package.json` - Dependencias
- `/vite.config.ts` - Configuración Vite
- `/.cursorrules` - Reglas para Cursor AI

---

## 🚀 Próximos Pasos

1. **Abre el proyecto en Cursor**
2. **Lee `/CURSOR_START.md`**
3. **Ejecuta `pnpm install`**
4. **Ejecuta `pnpm run dev`**
5. **Empieza a desarrollar** 🎉

---

## 📊 Estadísticas del Proyecto

- **Archivos principales**: ~120 archivos
- **Componentes React**: ~50 componentes
- **Componentes UI base**: 45+ componentes
- **Integraciones**: 6 (5 pagos + 1 facturación)
- **Líneas de código**: ~15,000+ líneas
- **Documentación**: 20+ archivos de docs

---

**ODDY Market** - Todo listo para desarrollar 🚀
