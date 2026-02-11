# 🔄 Flujo de Trabajo - Sincronización Continua

Este documento explica cómo mantener sincronizado tu proyecto mientras sigues trabajando en Figma.

## 📋 Escenario: Proyecto en Desarrollo

Tu proyecto en Figma aún no está terminado, pero quieres:
- ✅ Tener los valores actuales sincronizados
- ✅ Poder actualizar fácilmente cuando hagas cambios
- ✅ Mantener el código alineado con el diseño

---

## 🎯 Estrategia de Sincronización

### Opción 1: Sincronización Manual (Recomendado para proyectos en desarrollo)

**Cuando hacer cambios en Figma:**
1. Anota los cambios en `designs/MY_FIGMA_VALUES.md`
2. Actualiza `designs/figma-config.json` con los nuevos valores
3. Ejecuta `npm run sync-figma`
4. Verifica que todo se vea bien

**Ventajas:**
- Control total sobre qué actualizar
- Puedes probar cambios antes de sincronizar todo
- Ideal para proyectos en desarrollo activo

### Opción 2: Sincronización con .zip (Para actualizaciones mayores)

**Cuando exportes un .zip actualizado de Figma:**
1. Coloca el nuevo .zip en `designs/figma-import/`
2. Extrae y analiza (si tienes script de análisis)
3. Compara con valores actuales
4. Actualiza solo lo que cambió

---

## 📝 Checklist de Sincronización

### Al hacer cambios en Figma:

- [ ] ¿Agregaste nuevos colores?
  - → Actualiza `figma-config.json` → `colors`
  - → Anota en `MY_FIGMA_VALUES.md`

- [ ] ¿Cambiaste fuentes o tamaños?
  - → Actualiza `figma-config.json` → `typography`
  - → Anota en `MY_FIGMA_VALUES.md`

- [ ] ¿Modificaste espaciados?
  - → Actualiza `figma-config.json` → `spacing`
  - → Anota en `MY_FIGMA_VALUES.md`

- [ ] ¿Cambiaste border radius o sombras?
  - → Actualiza `figma-config.json` → `borderRadius` o `shadows`
  - → Anota en `MY_FIGMA_VALUES.md`

- [ ] Ejecuta sincronización:
  ```bash
  npm run sync-figma
  ```

- [ ] Verifica visualmente que todo coincida

---

## 🔍 Detección de Cambios

### Cómo saber qué cambió:

1. **Compara visualmente:**
   - Abre Figma y tu proyecto
   - Compara colores, espaciados, etc.

2. **Revisa `MY_FIGMA_VALUES.md`:**
   - Tiene los valores anteriores
   - Compara con los nuevos

3. **Usa el historial:**
   - Git puede ayudarte a ver cambios en `figma-config.json`

---

## 💡 Tips para Proyectos en Desarrollo

### Valores Estables vs. Cambiantes

**Valores que probablemente NO cambien:**
- Sistema de espaciado base (ej: 8px)
- Breakpoints
- Estructura de fuentes

**Valores que pueden cambiar frecuentemente:**
- Colores específicos
- Tamaños de fuente específicos
- Border radius de componentes nuevos

### Estrategia Recomendada:

1. **Sincroniza valores base primero:**
   - Colores principales
   - Fuentes principales
   - Sistema de espaciado

2. **Actualiza incrementos pequeños:**
   - No esperes a terminar todo en Figma
   - Sincroniza cambios importantes de inmediato

3. **Mantén documentación:**
   - `MY_FIGMA_VALUES.md` como referencia
   - Notas sobre decisiones de diseño

---

## 🚀 Proceso Rápido (5 minutos)

Cuando hagas un cambio importante en Figma:

```bash
# 1. Anota el cambio
# Edita designs/MY_FIGMA_VALUES.md

# 2. Actualiza configuración
# Edita designs/figma-config.json

# 3. Sincroniza
npm run sync-figma

# 4. Verifica
# Revisa src/styles/variables.css
```

---

## 📦 Trabajar con .zip de Figma

Si traes el proyecto completo en .zip:

1. **Coloca el archivo:**
   ```
   designs/figma-import/figma-project.zip
   ```

2. **Extrae manualmente o con script:**
   - Extrae a `designs/figma-import/extracted/`

3. **Analiza los archivos:**
   - Busca archivos JSON, CSS, o assets
   - Extrae valores de diseño

4. **Actualiza configuración:**
   - Copia valores a `figma-config.json`
   - Ejecuta sincronización

---

## ✅ Estado Actual vs. Futuro

**Ahora (proyecto en desarrollo):**
- Sincroniza valores base
- Actualiza cuando hagas cambios importantes
- Mantén documentación actualizada

**Cuando termines el proyecto:**
- Sincronización final completa
- Revisión de todos los valores
- Documentación final del design system

---

## 🔗 Archivos Relacionados

- `designs/MY_FIGMA_VALUES.md` - Anota cambios aquí
- `designs/figma-config.json` - Configuración actual
- `designs/figma-import/` - Carpeta para .zip
- `src/styles/variables.css` - Variables generadas
