# 🎡 SpinWheelPro - Rueda de la Suerte Profesional

Componente React profesional y altamente interactivo para crear ruedas de la suerte con animaciones fluidas, efectos visuales 3D, sonidos, vibración y mucho más.

## ✨ Características

### 🎨 Diseño Visual
- ✅ Rueda circular con segmentos de colores vibrantes y diferenciados
- ✅ Indicador/flecha fija en la parte superior para señalar el ganador
- ✅ Diseño 3D con sombras y efectos de profundidad
- ✅ Bordes dorados/brillantes para aspecto premium
- ✅ Animación de partículas/confetti al ganar
- ✅ Responsive: se adapta a móvil, tablet y desktop

### ⚙️ Funcionalidad
- ✅ Botón grande "GIRAR" con hover effects
- ✅ Animación de giro suave con aceleración y desaceleración realista (easing)
- ✅ Sonido opcional al girar y al ganar (Web Audio API)
- ✅ Vibración en móvil al ganar (Vibration API)
- ✅ Bloquear múltiples giros simultáneos
- ✅ Mostrar resultado final con modal/popup animado

### 🎯 Personalización
- ✅ Array configurable de premios/opciones con:
  - Texto del premio
  - Color del segmento
  - Probabilidad/peso
  - Icono/emoji
- ✅ Mínimo 8 segmentos, máximo 16 (configurable)
- ✅ Editor visual para agregar/quitar/editar premios
- ✅ Exportar/importar configuración en JSON

### 💫 Animaciones
- ✅ Usa Framer Motion para animaciones fluidas
- ✅ Giro con duración aleatoria (3-5 segundos)
- ✅ Efecto de "clicks" mientras gira (tictac)
- ✅ Bounce suave al detenerse
- ✅ Highlight del segmento ganador con pulsación

### 🏗️ Arquitectura
- ✅ React con TypeScript
- ✅ CSS Modules para estilos
- ✅ Framer Motion para animaciones
- ✅ Canvas 2D para la rueda (optimizado)
- ✅ Hooks personalizados: useSound, useVibration, useWheelAnimation
- ✅ Estado local con useState

### 📱 Extras
- ✅ Historial de últimos 10 giros
- ✅ Estadísticas: cuántas veces ganó cada premio
- ✅ Modo "presentación" fullscreen
- ✅ Tema claro/oscuro
- ✅ Responsive completo

## 📦 Instalación

Las dependencias ya están instaladas:
- `framer-motion`
- `canvas-confetti`
- `@types/canvas-confetti`

## 🚀 Uso Básico

```tsx
import { SpinWheelPro } from './components/marketing/SpinWheelPro';

function App() {
  return (
    <SpinWheelPro
      enableSounds={true}
      enableVibration={true}
      spinDuration={4000}
      onSpinComplete={(prize) => {
        console.log('Premio ganado:', prize);
      }}
    />
  );
}
```

## 📝 Props

### SpinWheelProProps

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `prizes` | `Prize[]` | `DEFAULT_PRIZES` | Array de premios para la rueda |
| `onSpinComplete` | `(prize: Prize) => void` | `undefined` | Callback cuando se completa un giro |
| `enableSounds` | `boolean` | `true` | Habilitar sonidos |
| `enableVibration` | `boolean` | `true` | Habilitar vibración en móvil |
| `spinDuration` | `number` | `4000` | Duración del giro en ms |
| `minSegments` | `number` | `8` | Mínimo de segmentos |
| `maxSegments` | `number` | `16` | Máximo de segmentos |
| `theme` | `'light' \| 'dark'` | `'light'` | Tema claro u oscuro |
| `showHistory` | `boolean` | `true` | Mostrar historial de giros |
| `showStats` | `boolean` | `true` | Mostrar estadísticas |
| `fullscreenMode` | `boolean` | `false` | Iniciar en modo pantalla completa |

### Prize Interface

```typescript
interface Prize {
  id: string;              // ID único del premio
  label: string;            // Texto del premio
  color: string;            // Color del segmento (hex)
  probability?: number;     // Probabilidad (1-50)
  weight?: number;          // Peso alternativo
  icon?: string;            // Icono (no usado actualmente)
  emoji?: string;           // Emoji para mostrar
}
```

## 🎨 Ejemplo Completo

```tsx
import { SpinWheelPro } from './components/marketing/SpinWheelPro';

const customPrizes = [
  { id: '1', label: '10% OFF', color: '#FF6B35', probability: 20, emoji: '🎁' },
  { id: '2', label: '20% OFF', color: '#004E89', probability: 15, emoji: '🎉' },
  { id: '3', label: 'Envío Gratis', color: '#F7B801', probability: 15, emoji: '🚚' },
  { id: '4', label: '30% OFF', color: '#6A0572', probability: 10, emoji: '🏆' },
  { id: '5', label: '50% OFF', color: '#00C9A7', probability: 5, emoji: '💎' },
  { id: '6', label: 'Inténtalo otra vez', color: '#C5283D', probability: 20, emoji: '🔄' },
  { id: '7', label: 'Producto Gratis', color: '#FFB627', probability: 10, emoji: '🎁' },
  { id: '8', label: '15% OFF', color: '#4ECDC4', probability: 5, emoji: '✨' },
];

function App() {
  const handleSpinComplete = (prize) => {
    console.log('¡Ganaste:', prize.label);
    // Aquí puedes enviar el premio al backend, mostrar notificación, etc.
  };

  return (
    <SpinWheelPro
      prizes={customPrizes}
      enableSounds={true}
      enableVibration={true}
      spinDuration={4000}
      theme="light"
      showHistory={true}
      showStats={true}
      onSpinComplete={handleSpinComplete}
    />
  );
}
```

## 🎮 Controles

- **⚙️ Editor**: Abre el editor visual para agregar, editar o eliminar premios
- **📊 Estadísticas**: Muestra estadísticas de giros y premios ganados
- **🌙/☀️ Tema**: Alterna entre tema claro y oscuro
- **⛶ Pantalla Completa**: Activa el modo presentación fullscreen
- **💾 Exportar**: Exporta la configuración actual en JSON
- **📥 Importar**: Importa una configuración desde un archivo JSON

## 🎨 Paleta de Colores por Defecto

El componente incluye una paleta de colores vibrantes:
- `#FF6B35` - Naranja
- `#004E89` - Azul oscuro
- `#F7B801` - Amarillo
- `#6A0572` - Púrpura
- `#00C9A7` - Turquesa
- `#C5283D` - Rojo
- `#FFB627` - Amarillo claro
- `#4ECDC4` - Cyan
- `#95E1D3` - Verde claro
- `#F38181` - Rosa
- `#AA96DA` - Lavanda
- `#FCBAD3` - Rosa claro

## 📱 Responsive

El componente es completamente responsive y se adapta a:
- **Desktop**: Rueda grande con todos los controles visibles
- **Tablet**: Layout optimizado con controles reorganizados
- **Móvil**: Rueda adaptada al tamaño de pantalla, controles táctiles

## 🔧 Personalización Avanzada

### Modificar Estilos

Los estilos están en `SpinWheelPro.module.css`. Puedes sobrescribir clases CSS o modificar el archivo directamente.

### Agregar Más Funcionalidades

El componente está diseñado para ser extensible. Puedes:
- Agregar más tipos de premios
- Integrar con APIs de backend
- Agregar más efectos visuales
- Personalizar sonidos

## 🐛 Solución de Problemas

### Los sonidos no funcionan
- Asegúrate de que `enableSounds={true}`
- Algunos navegadores requieren interacción del usuario antes de reproducir audio

### La vibración no funciona
- Solo funciona en dispositivos móviles
- Asegúrate de que `enableVibration={true}`
- El navegador debe soportar la Vibration API

### El canvas no se ve
- Verifica que el contenedor tenga dimensiones definidas
- El canvas se ajusta automáticamente al tamaño del contenedor

## 📄 Licencia

Este componente es parte del proyecto ODDY Market.

## 🤝 Contribuciones

Las mejoras y sugerencias son bienvenidas. Por favor, crea un issue o pull request.

---

¡Disfruta de tu Rueda de la Suerte! 🎡✨
