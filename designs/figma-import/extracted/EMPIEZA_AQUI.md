# 🚀 EMPIEZA AQUÍ - Proyecto E-commerce

## 📍 ¿Primera vez? Lee esto primero

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  👋 ¡Bienvenido al proyecto!                       │
│                                                     │
│  Tienes la carpeta raíz del proyecto abierta.     │
│  Aquí está todo lo que necesitas saber.           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 3 Formas de Empezar

### 1️⃣ Forma MÁS RÁPIDA (Scripts Automáticos)

**Si estás en Windows:**
1. Haz doble click en `start.bat`
2. ¡Listo! El script hace todo automáticamente

**Si estás en Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

---

### 2️⃣ Forma VISUAL (Recomendada para principiantes)

1. Abre este archivo en Cursor: `/GUIA_VISUAL_4_PASOS.md`
2. Sigue los 4 pasos con diagramas
3. ¡En 10 minutos estarás desarrollando!

---

### 3️⃣ Forma MANUAL (Si ya conoces el proyecto)

```bash
# 1. Instala dependencias
pnpm install

# 2. Inicia el servidor
pnpm run dev
```

**¿No tienes pnpm?**
```bash
npm install -g pnpm
```

---

## 📚 Guías Disponibles

| Archivo | Descripción | Tiempo |
|---------|-------------|--------|
| `/INDICE.md` | **EMPIEZA AQUÍ** - Índice de toda la documentación | 2 min |
| `/GUIA_VISUAL_4_PASOS.md` | Guía visual paso a paso | 5 min |
| `/INICIO_RAPIDO.md` | Resumen ejecutivo | 3 min |
| `/CURSOR_GUIDE.md` | Tutorial completo de Cursor | 10 min |
| `/CHECKLIST.md` | Verificación del proyecto | 5 min |
| `/README.md` | Documentación técnica completa | 15 min |

---

## ⚡ Comandos Rápidos

```bash
# Desarrollo
pnpm run dev          # Inicia servidor (http://localhost:5173)

# Producción  
pnpm run build        # Compila el proyecto

# Utilidades
pnpm add <paquete>    # Instala nueva dependencia
Ctrl+C                # Detiene el servidor
```

---

## 🆘 ¿Problemas?

### Error: "pnpm not found"
```bash
npm install -g pnpm
```

### Error: "Port 5173 is already in use"
```bash
pnpm run dev -- --port 3000
```

### Página en blanco
1. Abre consola del navegador (`F12`)
2. Lee los errores
3. Consulta `/CURSOR_GUIDE.md` (Troubleshooting)

### Más ayuda
→ Lee `/CURSOR_GUIDE.md` completo

---

## 📂 ¿Dónde está cada cosa?

```
📦 Carpeta Raíz/
│
├── 📄 EMPIEZA_AQUI.md           ← ESTÁS AQUÍ
├── 📄 INDICE.md                 ← Índice completo
├── 📄 GUIA_VISUAL_4_PASOS.md   ← Mejor para empezar
│
├── start.bat / start.sh         ← Scripts automáticos
│
├── 📁 src/                      ← Código fuente
│   ├── main.tsx                 ← Entrada React
│   └── app/
│       └── App.tsx              ← Componente principal
│
├── 📁 docs/                     ← Documentación técnica
├── 📁 supabase/functions/       ← Backend (Supabase)
│
└── package.json                 ← Dependencias
```

---

## ✅ Checklist Rápido

Antes de empezar a desarrollar:

- [ ] ¿Node.js instalado? (`node --version`)
- [ ] ¿pnpm instalado? (`pnpm --version`)
- [ ] ¿Ejecutaste `pnpm install`?
- [ ] ¿El servidor corre? (`pnpm run dev`)
- [ ] ¿Ves la app en http://localhost:5173?
- [ ] ¿Leíste al menos una guía?

**¿Todo OK?** → ¡Estás listo para desarrollar! 🎉

---

## 🎨 Colores del Proyecto

- **Principal:** Naranja `#FF6B35`
- **Secundario:** Celeste `#4ECDC4`
- **Diseño:** Mobile-first y clean

---

## 🚀 Tecnologías

- React 18.3.1
- Vite 6.3.5
- Tailwind CSS v4
- TypeScript
- Supabase (Backend)

---

## 📊 Estado Actual

### ✅ Completado
- Sistema de Pagos (5 integraciones)
- Facturación Electrónica (Fixed)
- Panel de Administración

### 🔜 Próximo
- Mini CRM
- Sistema de Mailing
- Gestión de Departamentos

**Detalles:** Ver `/ROADMAP.md`

---

## 🎯 Flujo Recomendado

```
1. Lee /INDICE.md (orientarte)
   ↓
2. Lee /GUIA_VISUAL_4_PASOS.md
   ↓
3. Levanta el proyecto
   ↓
4. Verifica con /CHECKLIST.md
   ↓
5. Lee /ROADMAP.md
   ↓
6. ¡Empieza a desarrollar! 🚀
```

---

## 💡 Tips para Cursor

### Atajos útiles
- `` Ctrl+` `` → Abre terminal
- `Cmd/Ctrl+P` → Busca archivos
- `Cmd/Ctrl+Shift+F` → Busca en todos los archivos

### Hot Reload
- Guarda archivo (`Ctrl+S`)
- Los cambios aparecen automáticamente
- No necesitas recargar el navegador

---

## 📞 Más Información

| Pregunta | Archivo |
|----------|---------|
| ¿Cómo levantar el proyecto? | `/GUIA_VISUAL_4_PASOS.md` |
| ¿Qué tecnologías usa? | `/README.md` |
| ¿Qué está hecho? | `/ROADMAP.md` |
| ¿Problemas técnicos? | `/CURSOR_GUIDE.md` |
| ¿Scripts automáticos? | `/SCRIPTS_INFO.md` |
| ¿Verificar configuración? | `/CHECKLIST.md` |
| ¿Índice completo? | `/INDICE.md` |

---

```
╔═════════════════════════════════════════════════════╗
║                                                     ║
║  🎊 ¡Proyecto listo para desarrollo!               ║
║                                                     ║
║  📖 Siguiente paso:                                ║
║     Lee /INDICE.md o /GUIA_VISUAL_4_PASOS.md      ║
║                                                     ║
║  💪 ¡Éxito con tu E-commerce!                      ║
║                                                     ║
╚═════════════════════════════════════════════════════╝
```

---

**Última actualización:** 11 de febrero de 2026
