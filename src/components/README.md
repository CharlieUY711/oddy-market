# Componentes

Esta carpeta contiene todos los componentes reutilizables del proyecto.

## Estructura recomendada

Cada componente debería tener su propia carpeta:

```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.module.css (o Button.css)
│   └── index.ts
├── Card/
│   ├── Card.tsx
│   ├── Card.module.css
│   └── index.ts
└── ...
```

## Flujo de trabajo con Figma

1. **Identificar componente en Figma:**
   - Busca componentes o frames que se repiten
   - Anota las propiedades (colores, espaciados, estados)

2. **Crear el componente:**
   - Crea la carpeta del componente
   - Implementa según el diseño de Figma
   - Usa las variables de `src/styles/variables.css`

3. **Validar:**
   - Compara visualmente con el diseño de Figma
   - Ajusta hasta que coincida

## Convenciones

- Usa nombres descriptivos y consistentes
- Sigue el mismo orden de props que en Figma
- Documenta props y estados importantes
