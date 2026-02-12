# ✅ Checklist de Verificación del Proyecto

## 📋 Antes de Empezar a Desarrollar

### 1️⃣ Instalación Base

- [ ] Node.js instalado (v18 o superior)
  ```bash
  node --version
  ```

- [ ] pnpm instalado
  ```bash
  pnpm --version
  ```
  Si no: `npm install -g pnpm`

- [ ] Git instalado (para control de versiones)
  ```bash
  git --version
  ```

---

### 2️⃣ Proyecto Abierto en Cursor

- [ ] Cursor instalado y funcionando
- [ ] Carpeta del proyecto abierta en Cursor
- [ ] Puedes ver todos los archivos en el explorador lateral
- [ ] Terminal integrada funciona (`` Ctrl+` ``)

---

### 3️⃣ Dependencias Instaladas

- [ ] Carpeta `node_modules/` existe
- [ ] Ejecutaste `pnpm install` sin errores
- [ ] No hay mensajes de error en rojo en la terminal

**Verificación:**
```bash
ls node_modules/    # Linux/Mac
dir node_modules\   # Windows
```

---

### 4️⃣ Servidor de Desarrollo

- [ ] Ejecutaste `pnpm run dev`
- [ ] Ves mensaje "ready in X ms"
- [ ] Ves URL: `http://localhost:5173`
- [ ] No hay errores en la terminal

**Salida esperada:**
```
VITE v6.3.5  ready in 450 ms
➜  Local:   http://localhost:5173/
```

---

### 5️⃣ Aplicación en el Navegador

- [ ] Navegador abrió automáticamente
- [ ] Si no: abriste manualmente `http://localhost:5173`
- [ ] Ves la interfaz del e-commerce
- [ ] No hay pantalla en blanco
- [ ] No hay errores en consola (`F12`)

---

### 6️⃣ Hot Reload Funciona

- [ ] Hiciste un cambio pequeño en algún archivo
- [ ] El cambio se refleja automáticamente en el navegador
- [ ] No necesitaste recargar manualmente

**Prueba rápida:**
1. Abre `/src/app/App.tsx`
2. Cambia algún texto
3. Guarda (`Ctrl+S`)
4. Verifica que el cambio aparece en el navegador

---

### 7️⃣ Documentación Leída

- [ ] Leíste `/INDICE.md` (índice general)
- [ ] Leíste al menos una guía de inicio:
  - [ ] `/GUIA_VISUAL_4_PASOS.md` (recomendado)
  - [ ] `/INICIO_RAPIDO.md`
  - [ ] `/CURSOR_GUIDE.md`
- [ ] Sabes dónde está el `/ROADMAP.md`

---

## 🧪 Pruebas Funcionales

### Navegación Básica

- [ ] Puedes ver la página principal
- [ ] El header/navbar es visible
- [ ] Puedes navegar entre secciones
- [ ] Los productos se muestran correctamente

### Funcionalidades Core

- [ ] Puedes agregar productos al carrito
- [ ] El carrito muestra los productos agregados
- [ ] Puedes acceder al panel de administración
- [ ] Las imágenes cargan correctamente

---

## 🔧 Configuración Avanzada

### Variables de Entorno (Ya configuradas ✅)

- [x] SUPABASE_URL
- [x] SUPABASE_ANON_KEY
- [x] SUPABASE_SERVICE_ROLE_KEY
- [x] STRIPE_PUBLISHABLE_KEY
- [x] PLEXO_CLIENT_ID
- [x] FIXED_API_KEY

**Nota:** Estas ya están configuradas en el sistema. No necesitas hacer nada.

---

## 📂 Archivos Críticos Verificados

### Archivos de Configuración

- [x] `/package.json` - Dependencias y scripts
- [x] `/vite.config.ts` - Configuración de Vite
- [x] `/tsconfig.json` - Configuración TypeScript
- [x] `/index.html` - Punto de entrada HTML
- [x] `/src/main.tsx` - Punto de entrada React

### Archivos de Código Principal

- [x] `/src/app/App.tsx` - Componente principal
- [x] `/src/styles/index.css` - Estilos principales
- [x] `/supabase/functions/server/index.tsx` - Backend

### Scripts de Inicio

- [x] `/start.sh` - Script para Mac/Linux
- [x] `/start.bat` - Script para Windows

---

## 🎨 Estilos y Diseño

- [ ] Tailwind CSS funciona correctamente
- [ ] Los colores principales son visibles:
  - [ ] Naranja (`#FF6B35`) - Color principal
  - [ ] Celeste (`#4ECDC4`) - Color secundario
- [ ] El diseño es responsive (prueba en diferentes tamaños)
- [ ] El diseño es mobile-first

---

## 🐛 Debugging Básico

### Herramientas de Debug

- [ ] Sabes abrir la consola del navegador (`F12`)
- [ ] Sabes leer errores en la terminal
- [ ] Conoces el comando `Ctrl+C` para detener el servidor
- [ ] Sabes reiniciar el servidor

### Comandos de Diagnóstico

```bash
# Ver versiones
node --version
pnpm --version

# Limpiar y reinstalar
rm -rf node_modules
pnpm install

# Ver logs del servidor
pnpm run dev

# Compilar producción
pnpm run build
```

---

## 📚 Conocimiento del Proyecto

### Arquitectura

- [ ] Entiendes que usa React + Vite
- [ ] Sabes que el backend está en Supabase Edge Functions
- [ ] Conoces la estructura de carpetas básica
- [ ] Sabes dónde están los componentes (`/src/app/components/`)

### Funcionalidades Implementadas

- [ ] Conoces las 5 integraciones de pago activas
- [ ] Sabes que hay facturación electrónica (Fixed)
- [ ] Entiendes que hay un panel de admin
- [ ] Conoces el ROADMAP de próximas features

---

## 🎯 Próximos Pasos

Una vez completado este checklist:

1. [ ] Revisa el `/ROADMAP.md` para ver qué hay que hacer
2. [ ] Familiarízate con los componentes existentes
3. [ ] Lee la documentación específica de la feature que implementarás
4. [ ] ¡Empieza a desarrollar! 🚀

---

## 📊 Estado del Checklist

**Progreso:**
- [ ] 0-25% - Necesitas configurar más cosas
- [ ] 25-50% - Vas bien, sigue adelante
- [ ] 50-75% - Casi listo para desarrollar
- [ ] 75-100% - ¡Listo para empezar! 🎉

---

## 🆘 Si algo falla

### ❌ No puedes instalar dependencias
→ Lee `/CURSOR_GUIDE.md` (sección "Errores de módulos")

### ❌ El servidor no inicia
→ Lee `/CURSOR_GUIDE.md` (sección "El puerto está ocupado")

### ❌ Página en blanco
→ Lee `/CURSOR_GUIDE.md` (sección "La página está en blanco")

### ❌ Hot reload no funciona
→ Lee `/CURSOR_GUIDE.md` (sección "Hot reload no funciona")

### ❌ Otro problema
→ Lee `/CURSOR_GUIDE.md` completo

---

## ✅ Checklist Completo

Si marcaste todo (o casi todo), estás listo para:

```
╔════════════════════════════════════════════════════╗
║                                                    ║
║  🎉 ¡Felicitaciones!                              ║
║                                                    ║
║  ✅ Proyecto configurado correctamente           ║
║  ✅ Servidor funcionando                         ║
║  ✅ Aplicación corriendo                         ║
║  ✅ Documentación revisada                       ║
║                                                    ║
║  🚀 ¡Listo para desarrollar!                     ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

## 📝 Notas Adicionales

**Fecha de verificación:** _____________

**Problemas encontrados:**
- _____________________________________________
- _____________________________________________
- _____________________________________________

**Soluciones aplicadas:**
- _____________________________________________
- _____________________________________________
- _____________________________________________

---

**Última actualización:** Febrero 11, 2026
