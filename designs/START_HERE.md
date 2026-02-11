# 🚀 EMPIEZA AQUÍ - Sincronización con Figma

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Abre tu proyecto en Figma
- Ve a tu archivo de Figma
- Identifica tu design system (colores, fuentes, espaciados)

### 2️⃣ Anota los valores
- Abre `FIGMA_VALUES_TEMPLATE.md` 
- Copia los valores de Figma al template
- O actualiza directamente `figma-config.json`

### 3️⃣ Sincroniza
```bash
npm run sync-figma
```

¡Listo! Tus variables CSS están actualizadas.

---

## 📚 Guías Disponibles

### Para principiantes:
1. **`SYNC_INSTRUCTIONS.md`** ← Empieza aquí
   - Instrucciones paso a paso
   - Dos métodos (automático y manual)

### Para extraer valores de Figma:
2. **`FIGMA_SYNC_GUIDE.md`**
   - Guía detallada de cómo encontrar cada valor en Figma
   - Explicaciones con capturas de pantalla conceptuales

### Para anotar valores:
3. **`FIGMA_VALUES_TEMPLATE.md`**
   - Template para copiar y pegar valores
   - Formato claro y organizado

### Para referencia:
4. **`DESIGN_SYSTEM.md`**
   - Checklist de sincronización
   - Documentación de decisiones

---

## 🎯 Valores Mínimos para Empezar

Si tienes prisa, solo necesitas:

✅ **3-4 colores principales** (primary, background, text)  
✅ **1 fuente principal** y tamaño base  
✅ **1 valor de espaciado base** (ej: 8px o 16px)  
✅ **1 border radius común** (ej: 8px)

El resto lo puedes agregar después.

---

## 🔄 Flujo de Trabajo Recomendado

```
Figma → Anotar Valores → figma-config.json → npm run sync-figma → variables.css
```

1. **Figma**: Extrae valores de tu design system
2. **Anotar**: Usa el template o actualiza directamente el JSON
3. **Sincronizar**: Ejecuta el script
4. **Usar**: Las variables están en `src/styles/variables.css`

---

## ❓ ¿Problemas?

- **No tengo Node.js**: Usa el método manual en `SYNC_INSTRUCTIONS.md`
- **No sé qué valores copiar**: Lee `FIGMA_SYNC_GUIDE.md`
- **Quiero ver un ejemplo**: Revisa `figma-config.json` (tiene valores de ejemplo)

---

## 📝 Archivos Clave

- `designs/figma-config.json` - Configuración de Figma (edita esto)
- `src/styles/variables.css` - Variables CSS (se genera automáticamente)
- `scripts/sync-figma.js` - Script de sincronización

---

**¡Empieza con `SYNC_INSTRUCTIONS.md` y estarás sincronizado en minutos!** 🎨
