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

## Variables CSS

```css
--color-primary: #ff6b35;           /* Naranja */
--color-primary-foreground: #ffffff; /* Blanco */
--color-secondary: #4ecdc4;           /* Celeste */
--color-secondary-foreground: #ffffff; /* Blanco */
--color-success: #4ecdc4;            /* Celeste (antes verde) */
```

## Colores Adicionales

- **Accent:** `#ffe0d6` (Naranja claro)
- **Background:** `#ffffff` (Blanco)
- **Foreground:** `#1a1a1a` (Negro)
- **Error:** `#ef4444` (Rojo)
- **Warning:** `#ffc107` (Amarillo)
- **Info:** `#17a2b8` (Azul)

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
