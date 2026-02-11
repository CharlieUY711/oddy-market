# 📝 Template para Copiar Valores de Figma

Usa este template para anotar los valores de tu design system en Figma. Luego copia estos valores a `figma-config.json`.

---

## 🎨 COLORES

Copia los valores HEX de tus colores principales:

```
Primary:        #_______
Secondary:      #_______
Accent:         #_______
Background:     #_______
Text:           #_______
Text Secondary: #_______
Border:         #_______
Error:          #_______
Success:        #_______
Warning:        #_______
Info:           #_______
```

**Cómo encontrarlo en Figma:**
1. Selecciona un elemento con color
2. Panel derecho → Fill → Copia el valor HEX

---

## 📝 TIPOGRAFÍA

### Familias de Fuentes:
```
Primary:  _____________________
Heading:  _____________________
Mono:     _____________________
```

### Tamaños de Fuente (en px):
```
xs:   ___px
sm:   ___px
base: ___px
lg:   ___px
xl:   ___px
2xl:  ___px
3xl:  ___px
4xl:  ___px
```

### Pesos de Fuente:
```
Light:    300
Normal:   400
Medium:   500
Semibold: 600
Bold:     700
```

### Alturas de Línea:
```
Tight:    ___
Normal:   ___
Relaxed:  ___
```

**Cómo encontrarlo en Figma:**
1. Selecciona un texto
2. Panel derecho → Text → Ver Font, Size, Weight, Line Height

---

## 📏 ESPACIADO

Sistema base (múltiplo): `___px` (ej: 4px, 8px)

Valores comunes:
```
xs:   ___px
sm:   ___px
md:   ___px
lg:   ___px
xl:   ___px
2xl:  ___px
3xl:  ___px
```

**Cómo encontrarlo en Figma:**
1. Selecciona dos elementos con espacio entre ellos
2. Usa la herramienta de medición o revisa el espaciado en el panel

---

## 🔲 BORDER RADIUS

```
sm:   ___px
md:   ___px
lg:   ___px
xl:   ___px
full: 9999px (siempre)
```

**Cómo encontrarlo en Figma:**
1. Selecciona un elemento con bordes redondeados
2. Panel derecho → Corner Radius

---

## 🌑 SOMBRAS

### Sombra Pequeña (sm):
```
X:      ___px
Y:      ___px
Blur:   ___px
Spread: ___px
Color:  rgba(_, _, _, _)
```

### Sombra Media (md):
```
X:      ___px
Y:      ___px
Blur:   ___px
Spread: ___px
Color:  rgba(_, _, _, _)
```

### Sombra Grande (lg):
```
X:      ___px
Y:      ___px
Blur:   ___px
Spread: ___px
Color:  rgba(_, _, _, _)
```

**Cómo encontrarlo en Figma:**
1. Selecciona un elemento con sombra
2. Panel derecho → Effects → Drop Shadow
3. Anota todos los valores

---

## 📱 BREAKPOINTS

```
sm:   ___px  (Mobile)
md:   ___px  (Tablet)
lg:   ___px  (Desktop pequeño)
xl:   ___px  (Desktop)
2xl:  ___px  (Desktop grande)
```

**Cómo encontrarlo en Figma:**
- Revisa los frames de diferentes tamaños de pantalla en tu diseño

---

## ✅ Después de completar:

1. Abre `designs/figma-config.json`
2. Reemplaza los valores de ejemplo con los que anotaste aquí
3. Ejecuta: `npm run sync-figma` (o `node scripts/sync-figma.js`)
4. Revisa `src/styles/variables.css` para ver los cambios
