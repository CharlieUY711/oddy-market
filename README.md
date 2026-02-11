# ODDY Market

Proyecto desarrollado en colaboración con Figma.

## 📁 Estructura del Proyecto

```
ODDY_Market/
├── designs/                 # Archivos relacionados con Figma
│   ├── figma-exports/      # Assets exportados desde Figma
│   ├── assets/             # Recursos de diseño (iconos, imágenes)
│   └── screenshots/        # Capturas de pantalla de diseños
├── src/                    # Código fuente
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas/Vistas
│   ├── styles/            # Estilos globales y temas
│   ├── assets/            # Assets del proyecto
│   ├── utils/             # Utilidades y helpers
│   └── hooks/             # Custom hooks
└── public/                # Archivos estáticos públicos
    ├── images/            # Imágenes públicas
    ├── icons/             # Iconos
    └── fonts/             # Fuentes personalizadas
```

## 🎨 Trabajo con Figma

### Flujo de trabajo recomendado:

1. **Exportar desde Figma:**
   - Exporta assets (iconos, imágenes) a `designs/figma-exports/`
   - Guarda capturas de pantalla de diseños en `designs/screenshots/`

2. **Organizar assets:**
   - Mueve assets finales a `public/images/` o `public/icons/`
   - Mantén referencias de diseño en `designs/assets/`

3. **Desarrollo:**
   - Crea componentes en `src/components/` basados en los diseños
   - Implementa estilos en `src/styles/` siguiendo el design system de Figma

## 🚀 Próximos pasos

- [ ] Configurar framework (React, Next.js, Vue, etc.)
- [ ] Configurar sistema de diseño (colores, tipografías, espaciados)
- [ ] Crear componentes base según diseños de Figma
- [ ] Configurar build y desarrollo
