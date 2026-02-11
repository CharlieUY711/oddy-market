# 🎉 ¡Bienvenido a ODDY Market!

```
  ██████╗ ██████╗ ██████╗ ██╗   ██╗    ███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗████████╗
 ██╔═══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝    ████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝╚══██╔══╝
 ██║   ██║██║  ██║██║  ██║ ╚████╔╝     ██╔████╔██║███████║██████╔╝█████╔╝ █████╗     ██║   
 ██║   ██║██║  ██║██║  ██║  ╚██╔╝      ██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝     ██║   
 ╚██████╔╝██████╔╝██████╔╝   ██║       ██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗   ██║   
  ╚═════╝ ╚═════╝ ╚═════╝    ╚═╝       ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   
```

## 🚀 INICIO RÁPIDO - 3 PASOS

### 1️⃣ Instalar Dependencias
```bash
pnpm install
```

### 2️⃣ Iniciar Servidor de Desarrollo
```bash
pnpm run dev
```

### 3️⃣ Abrir en el Navegador
El proyecto se abrirá automáticamente en: **http://localhost:5173**

---

## 📚 GUÍAS ESENCIALES

| Archivo | Descripción |
|---------|-------------|
| **[CURSOR_START.md](./CURSOR_START.md)** | ⭐ Guía de inicio rápido para Cursor |
| **[README.md](./README.md)** | 📖 Documentación completa del proyecto |
| **[ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md)** | 🗂️ Mapa completo de archivos |
| **[ROADMAP.md](./ROADMAP.md)** | 🎯 Plan de desarrollo y prioridades |
| **[.cursorrules](./.cursorrules)** | 🤖 Reglas del proyecto para Cursor AI |

---

## 🎨 BRANDING ODDY MARKET

- **Color Principal**: Naranja `#FF6B35`
- **Color Secundario**: Celeste `#4ECDC4`
- **Logo**: Hexágonos distintivos (fondo transparente)
- **Diseño**: Mobile-first, moderno, clean

---

## 🛠️ STACK TECNOLÓGICO

```
Frontend:  React 18.3.1 + TypeScript + Vite 6.3.5
Estilos:   Tailwind CSS v4
UI:        Radix UI + shadcn/ui
Backend:   Supabase Edge Functions (Hono)
Database:  Supabase (PostgreSQL + KV Store)
```

---

## 💳 INTEGRACIONES COMPLETADAS

✅ **Pagos**: Mercado Pago | Mercado Libre | PayPal | Stripe | Plexo (UY)
✅ **Facturación**: Fixed (DGI Uruguay) - Sistema completo

---

## 📂 ARCHIVOS CLAVE PARA EMPEZAR

```
/src/app/App.tsx              → Componente principal
/src/app/components/          → Todos los componentes React
/src/styles/theme.css         → Tokens de diseño (colores)
/supabase/functions/server/   → Backend API
```

---

## ⚡ COMANDOS RÁPIDOS

```bash
# Desarrollo
pnpm run dev

# Build para producción
pnpm run build

# Preview del build
pnpm run preview

# Instalar nueva dependencia
pnpm add [nombre-paquete]

# Scripts automáticos
./start.sh    # Mac/Linux
start.bat     # Windows
```

---

## 🎯 PRÓXIMAS FUNCIONALIDADES (Prioridad)

1. 🔴 **CRÍTICO**: Mini CRM Básico
2. 🔴 **CRÍTICO**: Sistema de Mailing con Resend
3. 🟡 **ALTA**: Gestión de Departamentos y Categorías
4. 🟡 **ALTA**: Centro Operativo RRSS (Meta, WhatsApp, Instagram)
5. 🟢 **MEDIA**: Herramientas de Marketing (QR, Rueda Sorteos)

---

## 💡 TIPS PARA DESARROLLO EN CURSOR

1. **Usa Cursor AI**: El archivo `.cursorrules` ya está configurado con las reglas del proyecto
2. **Intellisense**: Tailwind CSS autocomplete está activado
3. **Snippets**: Extensiones React recomendadas en `.vscode/extensions.json`
4. **Format on Save**: Prettier configurado automáticamente
5. **TypeScript**: Strict mode activado para mejor type safety

---

## 🔐 VARIABLES DE ENTORNO

**Ya están configuradas en el sistema** (no requieren acción):
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ STRIPE_PUBLISHABLE_KEY
- ✅ PLEXO_CLIENT_ID
- ✅ FIXED_API_KEY

---

## 📞 SOPORTE Y DOCUMENTACIÓN

- **Docs Técnica**: [/docs/](./docs/)
- **Sistema de Facturación**: [/docs/BILLING_SYSTEM.md](./docs/BILLING_SYSTEM.md)
- **Integraciones de Pago**: [/docs/PAYMENT_INTEGRATIONS_SUMMARY.md](./docs/PAYMENT_INTEGRATIONS_SUMMARY.md)
- **Integración Plexo**: [/docs/PLEXO_INTEGRATION.md](./docs/PLEXO_INTEGRATION.md)

---

## ✨ ¡TODO LISTO PARA DESARROLLAR!

El proyecto está **100% configurado** y listo para usar. Solo ejecuta `pnpm install` y `pnpm run dev`.

**¿Primera vez con el proyecto?** 
👉 Empieza leyendo [CURSOR_START.md](./CURSOR_START.md)

---

<div align="center">

**ODDY Market** - Tu tienda departamental del futuro 🚀

Hecho con ❤️ usando React + Vite + Tailwind CSS v4

</div>
