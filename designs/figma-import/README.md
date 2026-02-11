# 📦 Importación de Proyecto Figma

Coloca aquí el archivo .zip de tu proyecto de Figma.

## 📁 Estructura

```
figma-import/
├── figma-project.zip    ← Coloca tu archivo .zip aquí
└── extracted/           ← Se extraerá automáticamente aquí
```

## 🔄 Flujo de Trabajo

1. **Exporta desde Figma:**
   - En Figma: File → Save local copy (si está disponible)
   - O exporta los assets que necesites

2. **Coloca el .zip aquí:**
   - Mueve tu archivo .zip a esta carpeta

3. **Extrae y analiza:**
   - El sistema extraerá y analizará los archivos
   - Se identificarán colores, fuentes, espaciados, etc.

4. **Sincroniza:**
   - Los valores se actualizarán en `figma-config.json`
   - Ejecuta `npm run sync-figma` para actualizar CSS

## 💡 Nota

Si el proyecto en Figma aún está en desarrollo:
- Puedes actualizar el .zip periódicamente
- El sistema detectará cambios y actualizará solo lo necesario
- Mantén `designs/MY_FIGMA_VALUES.md` actualizado con cambios manuales
