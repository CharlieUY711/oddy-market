# 🎨 Colores del Proyecto ODDY Market

## Colores Principales (del Logo)

### 🟧 Naranja - Primary
- **Hex:** `#ff6b35`
- **RGB:** `255, 107, 53`
- **Uso:** 
  - Logo (hexágonos y texto)
  - Botones primarios
  - Links hover
  - Acentos principales
  - Badge del carrito

### 🔷 Celeste - Secondary
- **Hex:** `#4ecdc4`
- **RGB:** `78, 205, 196`
- **Uso:**
  - Fondo del logo
  - Badges de descuento
  - Iconos de features
  - Notificaciones de éxito
  - Acentos secundarios

## Variables CSS Principales

```css
--color-primary: #ff6b35;           /* Naranja */
--color-primary-foreground: #ffffff; /* Blanco */
--color-secondary: #4ecdc4;           /* Celeste */
--color-secondary-foreground: #ffffff; /* Blanco */
```

## Colores Adicionales

```css
--color-accent: #ffe0d6;             /* Naranja claro */
--color-accent-foreground: #1a1a1a;  /* Negro */
--color-background: #ffffff;          /* Blanco */
--color-foreground: #1a1a1a;         /* Negro */
--color-error: #ef4444;              /* Rojo */
--color-error-foreground: #ffffff;   /* Blanco */
--color-success: #4ecdc4;            /* Celeste */
--color-warning: #ffc107;            /* Amarillo */
--color-info: #17a2b8;               /* Azul */
```

### Resumen de Colores Adicionales

- **Accent:** `#ffe0d6` (Naranja claro) - Fondos sutiles, hover states
- **Background:** `#ffffff` (Blanco) - Fondo principal de la aplicación
- **Foreground:** `#1a1a1a` (Negro) - Texto principal
- **Error:** `#ef4444` (Rojo) - Mensajes de error, acciones destructivas
- **Warning:** `#ffc107` (Amarillo) - Advertencias
- **Info:** `#17a2b8` (Azul) - Información general

## Uso en Componentes

### Header
- Top bar: `var(--color-primary)` (naranja)
- Badge carrito: `var(--color-secondary)` (celeste)

### ProductCard
- Badge descuento: `var(--color-secondary)` (celeste)
- Precio: `var(--color-primary)` (naranja)
- Categoría: `var(--color-secondary)` (celeste)

### HomePage
- Hero gradient: Naranja y celeste con opacidad
- Features icons: Fondo celeste claro
- Newsletter: Gradiente naranja a celeste

### Toast/Notificaciones
- Success: `var(--color-success)` = Celeste (#4ecdc4)

---

**Última actualización:** 11/02/2026  
**Sincronizado con:** Logo oficial ODDY Market
