# 🚀 Guía Rápida - Trabajo con Figma

## Primeros pasos

### 1. Exportar desde Figma
```
1. Abre tu proyecto en Figma
2. Selecciona los assets que necesites (iconos, imágenes)
3. Exporta a: designs/figma-exports/
4. Organiza los archivos exportados
```

### 2. Sincronizar Design System
```
1. Abre designs/DESIGN_SYSTEM.md
2. Revisa tu design system en Figma
3. Actualiza src/styles/variables.css con:
   - Colores
   - Tipografías
   - Espaciados
   - Breakpoints
```

### 3. Crear tu primer componente
```
1. Identifica un componente en Figma
2. Crea carpeta en src/components/
3. Implementa según el diseño
4. Usa las variables CSS definidas
```

## Estructura creada

✅ **designs/**: Carpeta para trabajar con Figma
   - `figma-exports/`: Assets exportados
   - `assets/`: Recursos organizados
   - `screenshots/`: Referencias visuales

✅ **src/**: Código fuente
   - `components/`: Componentes reutilizables
   - `styles/`: Variables y estilos globales
   - `pages/`: Páginas/Vistas
   - `assets/`: Assets del proyecto

✅ **public/**: Archivos estáticos
   - `images/`, `icons/`, `fonts/`

## Próximos pasos

1. **Configurar framework** (React, Next.js, Vue, etc.)
2. **Sincronizar variables CSS** con Figma
3. **Exportar assets** desde Figma
4. **Crear componentes base** según diseños

## Tips

- Mantén `designs/DESIGN_SYSTEM.md` actualizado
- Usa las variables CSS para mantener consistencia
- Compara visualmente con Figma durante el desarrollo
- Documenta decisiones importantes
