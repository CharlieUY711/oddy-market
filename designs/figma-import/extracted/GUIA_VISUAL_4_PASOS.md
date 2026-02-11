# 🎬 LEVANTA TU PROYECTO EN 4 PASOS

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🎯 OBJETIVO: Levantar el e-commerce en Cursor                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 PASO 1: Abre Cursor

```
┌──────────────────────┐
│   Abrir Cursor       │
│   ↓                  │
│   File > Open Folder │
│   ↓                  │
│   Selecciona carpeta │
│   del proyecto       │
└──────────────────────┘
```

✅ **Listo cuando**: Veas todos los archivos en el explorador lateral de Cursor

---

## 📋 PASO 2: Abre la Terminal

```
┌────────────────────────┐
│  Atajo rápido:         │
│                        │
│  Ctrl + `              │
│  (tecla backtick)      │
│                        │
│  o                     │
│                        │
│  Terminal > New        │
└────────────────────────┘
```

✅ **Listo cuando**: Veas una terminal en la parte inferior de Cursor

---

## 📋 PASO 3: Instala dependencias

```bash
pnpm install
```

```
┌────────────────────────────────────┐
│  Espera 2-5 minutos...             │
│  ⏳ Descargando e instalando...    │
│  📦 node_modules/                  │
│  ✓ Dependencias instaladas         │
└────────────────────────────────────┘
```

⚠️ **¿Error "pnpm not found"?** Ejecuta primero:
```bash
npm install -g pnpm
```

✅ **Listo cuando**: La terminal muestre mensajes de éxito y vuelva al prompt

---

## 📋 PASO 4: Inicia el servidor

```bash
pnpm run dev
```

```
┌─────────────────────────────────────────┐
│  VITE v6.3.5  ready in 450 ms          │
│                                         │
│  ➜  Local:   http://localhost:5173/    │ ← Click aquí
│  ➜  Network: use --host to expose      │
│                                         │
│  ready in 450 ms.                       │
└─────────────────────────────────────────┘
```

💡 **Tip**: Haz `Ctrl+Click` sobre la URL para abrirla automáticamente

✅ **Listo cuando**: 
- El navegador se abra en `http://localhost:5173`
- Veas la tienda e-commerce funcionando

---

## 🎉 ¡PROYECTO LEVANTADO!

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│   ✓ Cursor abierto                                    │
│   ✓ Dependencias instaladas                          │
│   ✓ Servidor corriendo                               │
│   ✓ Navegador mostrando la app                       │
│                                                       │
│   🚀 ¡Listo para desarrollar!                         │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de trabajo diario

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. Abre Cursor                                     │
│  2. Abre terminal (Ctrl + `)                        │
│  3. pnpm run dev                                    │
│  4. Edita archivos                                  │
│  5. Los cambios se reflejan automáticamente 🔥      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📂 Archivos importantes

```
📦 tu-proyecto/
│
├── 📄 README.md                  ← Documentación completa
├── 📄 INICIO_RAPIDO.md          ← Guía rápida
├── 📄 CURSOR_GUIDE.md           ← Guía detallada Cursor
├── 📄 ESTA_GUIA.md              ← Estás aquí
│
├── 📁 src/
│   ├── main.tsx                 ← Punto de entrada
│   └── app/
│       └── App.tsx              ← Componente principal
│
├── 📁 docs/                     ← Documentación técnica
└── 📁 supabase/functions/       ← Backend
```

---

## ⚡ Comandos esenciales

| Comando | Qué hace |
|---------|----------|
| `pnpm run dev` | Inicia servidor de desarrollo |
| `pnpm run build` | Compila para producción |
| `pnpm add paquete` | Instala nueva dependencia |
| `Ctrl+C` | Detiene el servidor |

---

## 🆘 ¿Problemas?

### Puerto ocupado
```bash
# Usa otro puerto
pnpm run dev -- --port 3000
```

### Módulos no encontrados
```bash
# Reinstala todo
rm -rf node_modules
pnpm install
```

### Página en blanco
1. Abre la consola del navegador: `F12`
2. Lee los errores en rojo
3. Verifica la terminal

---

## 📚 Más ayuda

- **Guía rápida**: Lee `/INICIO_RAPIDO.md`
- **Guía completa**: Lee `/CURSOR_GUIDE.md`
- **Documentación técnica**: Lee `/README.md`
- **Roadmap**: Lee `/ROADMAP.md`

---

## ✅ Checklist final

Antes de empezar a desarrollar:

- [ ] ¿Cursor está abierto?
- [ ] ¿Terminal está abierta?
- [ ] ¿Ejecutaste `pnpm install`?
- [ ] ¿El servidor está corriendo?
- [ ] ¿Ves la app en el navegador?
- [ ] ¿No hay errores en la consola?

---

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  🎊 ¡Todo listo para desarrollar tu e-commerce!      ║
║                                                       ║
║  💪 ¡Éxito con tu proyecto!                          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```
