# 🚀 Scripts de Inicio Automático

Este proyecto incluye scripts automáticos para facilitar el inicio del proyecto.

---

## 🖥️ Para Windows

### Opción 1: Doble click
1. Navega a la carpeta del proyecto
2. Haz **doble click** en `start.bat`
3. ¡Listo! El script hará todo automáticamente

### Opción 2: Desde CMD/PowerShell
```cmd
start.bat
```

---

## 🍎 Para Mac / 🐧 Linux

### Primero: Dale permisos de ejecución (solo la primera vez)
```bash
chmod +x start.sh
```

### Luego: Ejecuta el script
```bash
./start.sh
```

---

## ✨ ¿Qué hacen estos scripts?

Los scripts automatizan todo el proceso de inicio:

1. ✅ **Verifican Node.js** - Se aseguran que esté instalado
2. ✅ **Instalan pnpm** - Si no lo tienes, lo instalan automáticamente
3. ✅ **Instalan dependencias** - Ejecutan `pnpm install` si es necesario
4. ✅ **Inician el servidor** - Ejecutan `pnpm run dev`

---

## 🎯 Ventajas

### Sin scripts:
```bash
# Manualmente tienes que recordar:
npm install -g pnpm    # Si no lo tienes
pnpm install           # Instalar deps
pnpm run dev           # Iniciar servidor
```

### Con scripts:
```bash
# Windows
start.bat

# Mac/Linux
./start.sh
```

¡Solo un comando y todo funciona! 🎉

---

## 🔄 Uso diario recomendado

### Primera vez en el proyecto:
- Usa los scripts automáticos (`start.bat` o `./start.sh`)
- Ellos se encargan de todo

### Desarrollo diario en Cursor:
1. Abre Cursor
2. Abre la terminal integrada (`` Ctrl+` ``)
3. Ejecuta directamente: `pnpm run dev`

---

## 🆘 Solución de problemas

### Windows: "No se puede ejecutar scripts"

Si ves un error de permisos en PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego intenta de nuevo con `start.bat`

### Mac/Linux: "Permission denied"

```bash
# Dale permisos de ejecución
chmod +x start.sh

# Luego ejecuta
./start.sh
```

### El script no encuentra Node.js

1. Asegúrate de tener Node.js instalado: https://nodejs.org/
2. Reinicia la terminal
3. Verifica con: `node --version`

---

## 📝 Alternativas sin scripts

Si prefieres no usar los scripts, puedes ejecutar manualmente:

```bash
# 1. Instala pnpm (si no lo tienes)
npm install -g pnpm

# 2. Instala dependencias
pnpm install

# 3. Inicia el servidor
pnpm run dev
```

---

## 📚 Más información

- **Guía visual**: Lee `/GUIA_VISUAL_4_PASOS.md`
- **Inicio rápido**: Lee `/INICIO_RAPIDO.md`
- **Guía de Cursor**: Lee `/CURSOR_GUIDE.md`
- **README completo**: Lee `/README.md`

---

**¡Feliz desarrollo! 🎊**
