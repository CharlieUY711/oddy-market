# 🔄 Instrucciones de Sincronización Rápida

## Método 1: Usando el Script Automático (Recomendado)

### Paso 1: Extraer valores de Figma
1. Abre tu proyecto en Figma
2. Sigue la guía en `FIGMA_SYNC_GUIDE.md` para extraer valores
3. O usa el template en `FIGMA_VALUES_TEMPLATE.md` para anotarlos

### Paso 2: Actualizar configuración
1. Abre `designs/figma-config.json`
2. Reemplaza los valores de ejemplo con los valores reales de Figma
3. Guarda el archivo

### Paso 3: Ejecutar sincronización
```bash
npm run sync-figma
```

O si no tienes npm instalado:
```bash
node scripts/sync-figma.js
```

### Paso 4: Verificar
1. Abre `src/styles/variables.css`
2. Verifica que los valores se hayan actualizado correctamente
3. ¡Listo! Ya puedes usar las variables en tu código

---

## Método 2: Manual (Sin Node.js)

### Paso 1: Extraer valores de Figma
- Usa `FIGMA_VALUES_TEMPLATE.md` para anotar valores

### Paso 2: Actualizar variables.css directamente
1. Abre `src/styles/variables.css`
2. Reemplaza manualmente los valores:
   - Colores: `--color-primary: #TU_COLOR;`
   - Fuentes: `--font-family-primary: 'Tu Fuente';`
   - Espaciados: `--spacing-md: 16px;`
   - etc.

### Paso 3: Guardar y usar
- Guarda el archivo
- Las variables ya están disponibles en tu código

---

## 🎯 Valores Mínimos Necesarios

Para empezar rápido, solo necesitas estos valores básicos:

1. **Colores principales** (al menos 3-4)
2. **Fuente principal** y tamaño base
3. **Espaciado base** (ej: 8px o 16px)
4. **Border radius** común (ej: 8px)

El resto puedes agregarlo después según lo necesites.

---

## 💡 Tips Rápidos

- **Colores**: Si tienes un design system en Figma, busca "Color Styles"
- **Tipografía**: Selecciona cualquier texto y copia los valores del panel
- **Espaciado**: Mide el espacio entre elementos comunes
- **Sombra**: Si no usas sombras complejas, puedes omitirlas por ahora

---

## 🔍 Verificación

Después de sincronizar, verifica que:
- ✅ Los colores coinciden visualmente
- ✅ Las fuentes se ven iguales
- ✅ Los espaciados son consistentes
- ✅ Los componentes se ven como en Figma
