# Logo Library - ODDY Market

## 📂 Ubicación de Logos

Todos los logos están ubicados en `/public/` para acceso directo.

### Archivos Disponibles:

#### 1. **logo.svg** (Principal - Recomendado)
- **Ubicación:** `/public/logo.svg`
- **Formato:** SVG (Vector)
- **Color:** Naranja #FF6B35 (color principal de ODDY Market)
- **Uso:** Logo principal del sitio, escalable sin pérdida de calidad
- **Dimensiones:** Adaptable (SVG vectorial)
- **Componentes:**
  - Diseño de 3 hexágonos interconectados (representa modularidad y estructura)
  - Texto "ODDY" en negrita
  - Texto "Market" debajo
- **Implementación:**
  ```tsx
  <img src="/logo.svg" alt="ODDY Market" className="h-12 w-auto" />
  ```

#### 2. **logo-icon.png** (Versión PNG)
- **Ubicación:** `/public/logo-icon.png`
- **Formato:** PNG con transparencia
- **Color:** Naranja #FF6B35
- **Uso:** Favicon, iconos pequeños, cuando se necesite formato raster
- **Nota:** Si necesitas regenerar o actualizar, usa el SVG como fuente

## 🎨 Especificaciones de Marca

### Color Principal
- **Naranja ODDY:** `#FF6B35`
- **RGB:** `255, 107, 53`
- **HSL:** `16, 100%, 60%`

### Color Secundario
- **Celeste:** `#4ECDC4`
- **RGB:** `78, 205, 196`
- **HSL:** `176, 57%, 55%`

### Tipografía del Logo
- **Familia:** Arial, Helvetica, sans-serif
- **Peso ODDY:** Bold (700)
- **Peso Market:** Bold (700)
- **Proporción:** "ODDY" más grande que "Market"

## 📐 Diseño del Símbolo

El símbolo de los 3 hexágonos representa:
1. **Modularidad:** Sistema compuesto de múltiples partes que trabajan juntas
2. **Conexión:** Integración entre ecommerce, RRSS, CRM y ERP
3. **Estructura:** Organización y solidez del sistema

### Disposición:
```
    ⬡
   ⬡ ⬡
```

## 🔧 Cómo Usar

### En React Components:
```tsx
// Opción 1: Desde public (recomendado)
<img src="/logo.svg" alt="ODDY Market" className="h-12" />

// Opción 2: Con tamaño específico
<img 
  src="/logo.svg" 
  alt="ODDY Market" 
  className="w-32 h-32"
/>

// Opción 3: En el Header (actual)
<img 
  src="/logo.svg" 
  alt="ODDY Market" 
  className="h-12 w-auto"
/>
```

### En HTML:
```html
<img src="/logo.svg" alt="ODDY Market" style="height: 48px;">
```

### Como Background:
```css
.logo-background {
  background-image: url('/logo.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
```

## 📱 Versiones Responsivas

### Mobile (< 768px)
```tsx
<img src="/logo.svg" alt="ODDY Market" className="h-10 w-auto" />
```

### Tablet (768px - 1024px)
```tsx
<img src="/logo.svg" alt="ODDY Market" className="h-12 w-auto" />
```

### Desktop (> 1024px)
```tsx
<img src="/logo.svg" alt="ODDY Market" className="h-14 w-auto" />
```

## 🎯 Ubicaciones de Uso Actual

1. **Header Component:** `/src/app/components/Header.tsx`
   - Tamaño: h-12 (48px)
   - Clickeable, navega a home
   
2. **Admin Dashboard:** `/src/app/components/AdminDashboard.tsx`
   - Texto: "ODDY Market" (sin logo visual actualmente)
   - Oportunidad de agregar logo SVG

3. **Footer:** `/src/app/App.tsx`
   - Texto: "© 2026 ODDY Market"
   - Oportunidad de agregar logo SVG

4. **Auth Modal:** `/src/app/components/AuthComponent.tsx`
   - Texto: "ODDY Market" en descripciones
   - Oportunidad de agregar logo SVG en header

## 🔄 Actualizar Logo

Si necesitas actualizar el logo en el futuro:

1. Edita `/public/logo.svg`
2. Mantén el color #FF6B35
3. Mantén las proporciones del diseño hexagonal
4. El cambio se reflejará automáticamente en toda la app

## 📋 Checklist de Implementación

- [x] Logo SVG creado con color naranja #FF6B35
- [x] Logo guardado en `/public/logo.svg`
- [x] Header actualizado para usar nuevo logo
- [ ] Considerar agregar logo en AdminDashboard sidebar
- [ ] Considerar agregar logo en AuthModal header
- [ ] Considerar agregar logo en Footer
- [ ] Crear favicon basado en el logo
- [ ] Crear Open Graph image con logo

## 🖼️ Generar Variaciones

### Favicon (16x16, 32x32, 64x64):
Usa el logo-icon.png o extrae solo los hexágonos del SVG.

### Open Graph / Social Media (1200x630):
```svg
<!-- Logo centrado con fondo blanco o naranja suave -->
```

### Email Templates:
Usa el SVG en tamaño apropiado (150-200px de ancho)

---

**Última actualización:** Febrero 11, 2026  
**Versión del Logo:** 1.0  
**Diseñador:** Sistema ODDY Market
