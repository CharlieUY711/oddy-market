# 🎯 GUÍA RÁPIDA: Abrir ODDY Market en Cursor

Esta es la guía paso a paso para abrir y desarrollar el proyecto ODDY Market en Cursor IDE.

---

## 📋 Pre-requisitos

Antes de empezar, asegúrate de tener instalado:

1. **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
2. **pnpm** - Instalar con: `npm install -g pnpm`
3. **Cursor IDE** - [Descargar aquí](https://cursor.sh/)

---

## 🚀 Pasos para abrir el proyecto

### 1. Abrir la carpeta en Cursor

1. Abre **Cursor IDE**
2. Haz clic en `File > Open Folder` (o usa `Cmd+O` en Mac / `Ctrl+O` en Windows)
3. Navega hasta la carpeta raíz del proyecto **ODDY Market**
4. Haz clic en "Seleccionar carpeta"

### 2. Instalar dependencias

Una vez abierto el proyecto:

1. Abre la terminal integrada en Cursor:
   - `Terminal > New Terminal` 
   - O usa el atajo: `` Ctrl + ` ``

2. Ejecuta el comando de instalación:
   ```bash
   pnpm install
   ```

3. Espera a que se instalen todas las dependencias (puede tomar 1-2 minutos)

### 3. Levantar el servidor de desarrollo

Con las dependencias instaladas, ejecuta:

```bash
pnpm run dev
```

O alternativamente (si prefieres usar scripts):

**Windows:**
```bash
./start.bat
```

**Mac/Linux:**
```bash
./start.sh
```

### 4. Abrir en el navegador

- El proyecto se abrirá automáticamente en `http://localhost:5173`
- Si no se abre automáticamente, copia y pega esa URL en tu navegador

---

## 🎨 Estructura del proyecto en Cursor

Una vez abierto, verás esta estructura en el explorador de archivos:

```
ODDY-Market/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── App.tsx           ← Componente principal
│   │   └── 📁 components/    ← Todos los componentes React
│   └── 📁 styles/            ← Estilos CSS y Tailwind
├── 📁 supabase/
│   └── 📁 functions/
│       └── 📁 server/        ← Backend (Hono + Supabase)
├── 📁 docs/                  ← Documentación completa
├── 📁 public/                ← Assets públicos (logos, etc)
├── package.json              ← Dependencias
└── README.md                 ← Este archivo
```

---

## 🔧 Comandos útiles en la terminal de Cursor

| Comando | Descripción |
|---------|-------------|
| `pnpm install` | Instala todas las dependencias |
| `pnpm run dev` | Inicia el servidor de desarrollo |
| `pnpm run build` | Compila para producción |
| `pnpm run preview` | Preview del build de producción |

---

## 💡 Tips para trabajar en Cursor

### Navegación rápida
- `Cmd/Ctrl + P` - Buscar archivos
- `Cmd/Ctrl + Shift + F` - Buscar en todos los archivos
- `Cmd/Ctrl + B` - Toggle sidebar
- `` Ctrl + ` `` - Toggle terminal

### AI Assistant
- `Cmd/Ctrl + K` - Abrir chat con AI
- Puedes hacer preguntas sobre el código directamente en Cursor

### Desarrollo
- Los cambios se reflejan automáticamente (Hot Module Replacement)
- Revisa la consola del navegador para ver errores
- Revisa la terminal de Cursor para errores del servidor

---

## 🎨 Personalización del tema

El proyecto usa **Tailwind CSS v4** con colores personalizados de ODDY Market:

- **Naranja principal**: `#FF6B35` → clase `text-primary` o `bg-primary`
- **Celeste secundario**: `#4ECDC4` → clase `text-secondary` o `bg-secondary`

Estos colores están definidos en `/src/styles/theme.css`

---

## 🔑 Variables de entorno

Las siguientes variables ya están configuradas en el entorno de Figma Make:

- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ STRIPE_PUBLISHABLE_KEY
- ✅ PLEXO_CLIENT_ID
- ✅ FIXED_API_KEY

**No necesitas crear un archivo `.env`** - estas variables se gestionan automáticamente.

---

## 🐛 Troubleshooting común

### Error: "Cannot find module 'pnpm'"
**Solución:** Instala pnpm globalmente
```bash
npm install -g pnpm
```

### Error: "Port 5173 is already in use"
**Solución:** Cierra otros procesos de Vite o cambia el puerto en `vite.config.ts`

### Error: "Module not found"
**Solución:** Reinstala dependencias
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Los cambios no se reflejan en el navegador
**Solución:** Haz un hard refresh
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## 📚 Documentación adicional

Una vez que tengas el proyecto corriendo, revisa:

- [GUÍA VISUAL 4 PASOS](/GUIA_VISUAL_4_PASOS.md) - Walkthrough visual
- [ROADMAP](/ROADMAP.md) - Próximas funcionalidades
- [Documentación de integraciones](/docs/) - Detalles técnicos

---

## ✅ Checklist de inicio

Marca cada paso conforme lo completes:

- [ ] Node.js 18+ instalado
- [ ] pnpm instalado globalmente
- [ ] Cursor IDE instalado
- [ ] Proyecto abierto en Cursor
- [ ] `pnpm install` ejecutado exitosamente
- [ ] `pnpm run dev` corriendo
- [ ] Navegador abierto en `localhost:5173`
- [ ] Página de ODDY Market visible

---

🎉 **¡Listo!** Ya puedes empezar a desarrollar en ODDY Market con Cursor.

Si tienes dudas, revisa el [README principal](/README.md) o la [documentación completa](/docs/).
