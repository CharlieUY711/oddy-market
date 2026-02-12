# 📘 Guía Completa para Cursor

## 🎯 Pasos detallados para levantar el proyecto

### 1. Abrir el proyecto en Cursor

1. **Inicia Cursor** en tu computadora
2. Haz clic en `File` → `Open Folder` (o usa el atajo `Cmd+O` en Mac / `Ctrl+O` en Windows/Linux)
3. Navega hasta la **carpeta raíz** de tu proyecto y selecciónala
4. Cursor abrirá el proyecto y cargará todos los archivos

### 2. Abrir la Terminal Integrada

Hay varias formas de abrir la terminal en Cursor:

- **Opción 1**: Menú `Terminal` → `New Terminal`
- **Opción 2**: Atajo de teclado `` Ctrl + ` `` (tecla backtick)
- **Opción 3**: Atajo `Cmd+J` en Mac / `Ctrl+J` en Windows/Linux

### 3. Instalar dependencias

En la terminal que acabas de abrir, ejecuta:

```bash
pnpm install
```

Este comando instalará todas las dependencias listadas en `package.json`. El proceso puede tardar 2-5 minutos la primera vez.

#### ⚠️ ¿No tienes pnpm instalado?

Si aparece un error como `pnpm: command not found`, primero instálalo:

```bash
npm install -g pnpm
```

Luego vuelve a ejecutar `pnpm install`.

#### 💡 Alternativas con npm o yarn

Si prefieres usar npm o yarn:

```bash
# Con npm
npm install

# Con yarn
yarn install
```

### 4. Iniciar el servidor de desarrollo

Una vez instaladas las dependencias, ejecuta:

```bash
pnpm run dev
```

Verás una salida similar a:

```
  VITE v6.3.5  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 5. Abrir en el navegador

- El proyecto se abrirá automáticamente en tu navegador predeterminado
- Si no se abre automáticamente, **abre manualmente**: `http://localhost:5173`
- Presiona `Cmd+Click` (Mac) o `Ctrl+Click` (Windows/Linux) sobre la URL en la terminal para abrirla

### 6. ¡Listo para desarrollar! 🎉

El servidor está en **modo hot-reload**, lo que significa que:
- Cualquier cambio que hagas en los archivos se reflejará automáticamente en el navegador
- No necesitas recargar manualmente
- Puedes ver errores en tiempo real en la consola del navegador y en la terminal

---

## 🔧 Comandos útiles en Cursor

### Terminal

```bash
# Iniciar desarrollo
pnpm run dev

# Compilar para producción
pnpm run build

# Vista previa del build de producción
pnpm run preview

# Instalar nueva dependencia
pnpm add nombre-paquete

# Instalar dependencia de desarrollo
pnpm add -D nombre-paquete

# Remover dependencia
pnpm remove nombre-paquete

# Actualizar dependencias
pnpm update
```

### Atajos de teclado en Cursor

| Acción | Mac | Windows/Linux |
|--------|-----|---------------|
| Abrir terminal | `` Cmd+` `` | `` Ctrl+` `` |
| Panel de comandos | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| Buscar archivos | `Cmd+P` | `Ctrl+P` |
| Buscar en archivos | `Cmd+Shift+F` | `Ctrl+Shift+F` |
| Guardar archivo | `Cmd+S` | `Ctrl+S` |
| Guardar todos | `Cmd+K S` | `Ctrl+K S` |
| Cerrar terminal | `Cmd+W` | `Ctrl+W` |
| Split editor | `Cmd+\` | `Ctrl+\` |

---

## 🌐 Navegación en el proyecto

### Páginas disponibles

Una vez levantado el proyecto, podrás navegar entre:

1. **Home** (`/`) - Página principal con productos
2. **Admin Dashboard** - Panel de administración
3. **Carrito** - Vista del carrito de compras
4. **Checkout** - Proceso de pago
5. **Gestión de Pagos** - Configuración de integraciones
6. **Facturación** - Sistema de facturación electrónica

### Estructura de carpetas clave

```
📁 tu-proyecto/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📄 App.tsx              ← Componente principal
│   │   └── 📁 components/          ← Todos tus componentes React
│   ├── 📁 styles/                  ← Estilos CSS y Tailwind
│   └── 📄 main.tsx                 ← Punto de entrada
├── 📁 supabase/
│   └── 📁 functions/server/        ← Backend (Edge Functions)
├── 📁 docs/                        ← Documentación
├── 📄 package.json                 ← Dependencias
├── 📄 vite.config.ts               ← Configuración de Vite
└── 📄 index.html                   ← HTML base
```

---

## 🐛 Solución de problemas comunes

### El puerto 5173 está ocupado

Si ves un error como `Port 5173 is already in use`, tienes dos opciones:

**Opción 1**: Detén el proceso que está usando ese puerto
- En Mac/Linux: `lsof -ti:5173 | xargs kill -9`
- En Windows: Busca el proceso en el Administrador de tareas

**Opción 2**: Usa otro puerto
```bash
pnpm run dev -- --port 3000
```

### Errores de módulos no encontrados

Si ves errores como `Cannot find module 'xxx'`:

1. Borra `node_modules` y reinstala:
```bash
rm -rf node_modules
pnpm install
```

2. Si persiste, borra también el lock file:
```bash
rm pnpm-lock.yaml
pnpm install
```

### La página está en blanco

1. Abre la **Consola del navegador** (`F12` o `Cmd+Option+I`)
2. Busca errores en rojo
3. Revisa la **terminal** donde corre `pnpm run dev`
4. Verifica que todos los imports en `App.tsx` sean correctos

### Problemas con TypeScript

Si ves errores de TypeScript pero el código funciona:

1. Reinicia el servidor TypeScript en Cursor:
   - `Cmd+Shift+P` → `TypeScript: Restart TS Server`

2. O simplemente reinicia Cursor

### Hot reload no funciona

Si los cambios no se reflejan automáticamente:

1. Guarda el archivo (`Cmd+S` / `Ctrl+S`)
2. Recarga el navegador manualmente (`Cmd+R` / `Ctrl+R`)
3. Reinicia el servidor (`Ctrl+C` en terminal, luego `pnpm run dev`)

---

## 💾 Variables de entorno

Este proyecto usa **Supabase** como backend. Las siguientes variables ya están configuradas:

- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `STRIPE_PUBLISHABLE_KEY`
- ✅ `PLEXO_CLIENT_ID`
- ✅ `FIXED_API_KEY`

**No necesitas crear un archivo `.env`** - estas variables se gestionan automáticamente en el sistema de Figma Make.

---

## 📚 Documentación adicional

- **Inicio rápido**: Lee `/INICIO_RAPIDO.md`
- **README completo**: Lee `/README.md`
- **Documentación técnica**: Carpeta `/docs/`
- **Roadmap**: Lee `/ROADMAP.md`

---

## 🆘 ¿Necesitas ayuda?

1. **Revisa los logs**: Siempre lee los mensajes de error en la terminal y consola del navegador
2. **Consulta la documentación**: Revisa los archivos `.md` en la raíz y en `/docs/`
3. **Verifica el código**: Usa la búsqueda de Cursor (`Cmd+P`) para encontrar archivos rápidamente

---

## ✅ Checklist final

Antes de empezar a desarrollar, verifica que:

- [ ] Cursor está abierto con la carpeta del proyecto cargada
- [ ] La terminal está abierta dentro de Cursor
- [ ] Ejecutaste `pnpm install` sin errores
- [ ] El servidor está corriendo con `pnpm run dev`
- [ ] El navegador muestra la aplicación en `http://localhost:5173`
- [ ] Puedes ver la consola del navegador (`F12`) sin errores críticos

---

**¡Feliz desarrollo! 🚀**
