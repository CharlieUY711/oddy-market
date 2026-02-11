# 📦 Cómo Importar tu Proyecto .zip de Figma

## 🚀 Proceso Rápido

### Paso 1: Coloca el archivo .zip
```
1. Exporta o guarda tu proyecto de Figma como .zip
2. Colócalo en: designs/figma-import/figma-project.zip
```

### Paso 2: Analiza el contenido
```bash
npm run analyze-zip
```

O manualmente:
```bash
node scripts/analyze-figma-zip.js
```

### Paso 3: Revisa los resultados
- El script intentará extraer colores, fuentes y otros valores
- Revisa la salida en la terminal

### Paso 4: Actualiza configuración
1. Abre `designs/figma-config.json`
2. Actualiza con los valores encontrados o extrae manualmente desde Figma
3. Ejecuta `npm run sync-figma`

---

## 📋 Nota Importante sobre .zip de Figma

**Figma no exporta directamente un .zip con valores de diseño.**

El .zip de Figma generalmente contiene:
- ✅ Assets exportados (imágenes, iconos)
- ✅ Archivos de proyecto (si usas Figma Desktop)
- ❌ NO contiene valores de diseño directamente extraíbles

### Soluciones:

#### Opción A: Extraer manualmente desde Figma (Recomendado)
1. Abre tu proyecto en Figma
2. Sigue `FIGMA_SYNC_GUIDE.md` para extraer valores
3. Anota en `MY_FIGMA_VALUES.md`
4. Actualiza `figma-config.json`

#### Opción B: Usar el .zip para assets
1. Coloca el .zip en `designs/figma-import/`
2. Extrae manualmente los assets que necesites
3. Mueve assets a `designs/figma-exports/` o `public/`
4. Extrae valores de diseño manualmente desde Figma

#### Opción C: Plugin de Figma (Futuro)
- Considera usar plugins como "Design Tokens" para exportar valores automáticamente

---

## 🔄 Sincronización Continua

Como tu proyecto en Figma aún está en desarrollo:

### Cuando hagas cambios en Figma:

1. **Anota los cambios:**
   - Abre `designs/MY_FIGMA_VALUES.md`
   - Documenta qué cambió

2. **Actualiza configuración:**
   - Edita `designs/figma-config.json`
   - Solo actualiza lo que cambió

3. **Sincroniza:**
   ```bash
   npm run sync-figma
   ```

4. **Verifica:**
   - Revisa `src/styles/variables.css`
   - Compara visualmente con Figma

---

## 📁 Estructura de Carpetas

```
designs/
├── figma-import/
│   ├── figma-project.zip      ← Coloca tu .zip aquí
│   ├── extracted/             ← Se extrae aquí
│   └── README.md
├── figma-exports/             ← Assets exportados
├── MY_FIGMA_VALUES.md         ← Anota valores aquí
├── figma-config.json          ← Configuración (edita esto)
└── ...
```

---

## 💡 Recomendación

Para proyectos en desarrollo activo:

1. **Sincroniza valores base primero:**
   - Colores principales
   - Fuentes principales
   - Sistema de espaciado

2. **Actualiza incrementalmente:**
   - No esperes a terminar todo
   - Sincroniza cambios importantes de inmediato

3. **Mantén documentación:**
   - `MY_FIGMA_VALUES.md` como referencia
   - Notas sobre decisiones

---

## ✅ Checklist

- [ ] .zip colocado en `designs/figma-import/`
- [ ] Script de análisis ejecutado (opcional)
- [ ] Valores extraídos manualmente desde Figma
- [ ] `figma-config.json` actualizado
- [ ] `npm run sync-figma` ejecutado
- [ ] Variables CSS verificadas
- [ ] `MY_FIGMA_VALUES.md` documentado

---

**¿Listo para empezar?** Coloca tu .zip y sigue los pasos arriba, o extrae valores manualmente desde Figma usando `FIGMA_SYNC_GUIDE.md`.
