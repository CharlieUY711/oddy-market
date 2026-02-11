# 🎨 Guía de Sincronización con Figma

Esta guía te ayudará a extraer los valores de tu design system en Figma y sincronizarlos con el código.

## 📋 Paso 1: Extraer Colores

### En Figma:
1. Abre tu archivo de Figma
2. Ve a la pestaña **"Design"** en el panel derecho (o busca el estilo de color)
3. Busca la sección de **"Color Styles"** o **"Local Styles"**
4. Anota los colores principales que uses

### Valores a copiar:
- **Primary**: Color principal de tu marca
- **Secondary**: Color secundario
- **Background**: Color de fondo
- **Text**: Color de texto principal
- **Text Secondary**: Color de texto secundario
- **Border**: Color de bordes
- **Error/Success/Warning**: Colores de estados (si los tienes)

### Formato:
- Copia el valor HEX (ej: `#FF5733`)
- O RGB/RGBA si necesitas transparencia

---

## 📝 Paso 2: Extraer Tipografía

### En Figma:
1. Selecciona un texto en tu diseño
2. En el panel derecho, verás:
   - **Font Family** (ej: Inter, Roboto, etc.)
   - **Font Size** (ej: 16px, 24px, etc.)
   - **Font Weight** (ej: Regular 400, Bold 700)
   - **Line Height** (ej: 24px o 1.5)

### Valores a documentar:
- **Font Families**: Nombres de las fuentes que usas
- **Font Sizes**: Tamaños comunes (12px, 14px, 16px, 20px, 24px, etc.)
- **Font Weights**: Regular (400), Medium (500), Bold (700), etc.
- **Line Heights**: Valores de interlineado

---

## 📏 Paso 3: Extraer Espaciado

### En Figma:
1. Selecciona dos elementos que tengan espacio entre ellos
2. Usa la herramienta de **"Inspect"** o revisa el espaciado en el panel
3. Anota los valores comunes que uses (ej: 8px, 16px, 24px, 32px)

### Sistema común:
- Muchos proyectos usan múltiplos de 4px o 8px
- Ejemplo: 4, 8, 12, 16, 24, 32, 48, 64

---

## 🔲 Paso 4: Extraer Border Radius

### En Figma:
1. Selecciona elementos con bordes redondeados (botones, cards, etc.)
2. Revisa el valor de **"Corner Radius"** en el panel
3. Anota los valores comunes (ej: 4px, 8px, 12px, 16px)

---

## 🌑 Paso 5: Extraer Sombras

### En Figma:
1. Selecciona elementos con sombras
2. En el panel, busca **"Effects"** → **"Drop Shadow"**
3. Anota los valores:
   - **X, Y**: Desplazamiento
   - **Blur**: Desenfoque
   - **Spread**: Extensión
   - **Color**: Color de la sombra (con opacidad)

---

## 📱 Paso 6: Extraer Breakpoints (Responsive)

### En Figma:
1. Revisa si tienes frames para diferentes tamaños de pantalla
2. Anota los anchos comunes:
   - Mobile: 375px, 414px
   - Tablet: 768px
   - Desktop: 1024px, 1280px, 1440px

---

## ✅ Paso 7: Actualizar el Archivo de Configuración

1. Abre `designs/figma-config.json`
2. Reemplaza los valores de ejemplo con los valores reales de tu Figma
3. Guarda el archivo
4. Ejecuta el script de sincronización (si está disponible)

---

## 💡 Tips

- **Usa el plugin "Design Tokens"** en Figma para exportar automáticamente
- **Toma capturas de pantalla** de tu design system en Figma y guárdalas en `designs/screenshots/`
- **Documenta decisiones** en `designs/DESIGN_SYSTEM.md`
- Si cambias algo en Figma, actualiza también el código para mantener sincronización

---

## 🔄 Proceso Rápido

1. Abre Figma → Design System
2. Copia valores → `designs/figma-config.json`
3. Ejecuta sincronización → Actualiza `src/styles/variables.css`
4. Verifica → Compara visualmente
