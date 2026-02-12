# 📦 MÓDULO ARTÍCULOS - Análisis Completo

**Fecha**: 12 de Febrero, 2026  
**Estado**: 🔍 Análisis y comparación con ZIP  
**Estrategia**: 3 niveles progresivos (Básica → Intermedia → Avanzada)

---

## 📸 CAPTURAS RECIBIDAS

### 1. **Formulario "Nuevo Artículo"** (3 vistas)
- ✅ Vista Básica
- ✅ Vista Intermedia
- ✅ Vista Avanzada (con scroll adicional)

### 2. **Catálogo de Artículos**
- ✅ Vista principal (vacía, 0 artículos)
- ✅ Búsqueda multimodal
- ✅ KPIs

---

## 🎨 DISEÑO DE 3 NIVELES (Análisis)

### 🟢 NIVEL 1: BÁSICA
**Propósito**: Información esencial  
**Target User**: Cualquier usuario que carga productos  
**Tiempo**: 2-3 minutos

```
┌────────────────────────────────────────┐
│         INFORMACIÓN ESENCIAL           │
├────────────────────────────────────────┤
│                                        │
│  📝 Nombre del Artículo *              │
│  📄 Descripción *                      │
│  💰 Precio *                           │
│  🏷️ Categoría *                        │
│  📷 Imágenes * (1200x1200px)          │
│                                        │
│  Botón: Siguiente →                   │
│                                        │
└────────────────────────────────────────┘
```

**Campos identificados:**
1. ✅ Nombre del Artículo (requerido)
2. ✅ Descripción (requerido, textarea)
3. ✅ Precio (requerido, número con $)
4. ✅ Categoría (requerido, select)
5. ✅ Imágenes (requerido, 1200x1200px, upload)

**Casos de Uso - Nivel Básica:**

#### 👤 Usuario 1: Vendedor Rápido
```
Perfil:
- Vende productos simples
- No tiene stock complejo
- No necesita sincronización
- Quiere publicar rápido

Flujo:
1. Completa SOLO nivel Básica
2. Guarda artículo
3. Ya puede vender

Ejemplo: 
- Artesano que vende productos únicos
- Comerciante pequeño con pocos productos
- Test de mercado (MVP)
```

#### 👤 Usuario 2: Emprendedor Digital
```
Perfil:
- Vende productos digitales o servicios
- No necesita inventario físico
- No tiene proveedores
- Marketing simple

Flujo:
1. Nivel Básica completo
2. Salta Intermedia y Avanzada
3. Producto listo

Ejemplo:
- Cursos online
- Ebooks
- Servicios
- Membresías
```

#### 👤 Usuario 3: Dropshipper Simple
```
Perfil:
- Revende sin stock propio
- Necesita publicar rápido
- Margen bajo, volumen alto
- No gestiona logística

Flujo:
1. Básica con info del proveedor
2. Siguiente nivel para SKU mínimo
3. Listo para vender

Ejemplo:
- Dropshipping AliExpress
- Print on demand
- Afiliados con productos
```

---

### 🟡 NIVEL 2: INTERMEDIA
**Propósito**: Inventario y logística  
**Target User**: Usuario con stock físico y control de inventario  
**Tiempo**: 5-7 minutos

```
┌────────────────────────────────────────┐
│      INVENTARIO Y LOGÍSTICA            │
├────────────────────────────────────────┤
│                                        │
│  🔢 SKU                                │
│  📊 Código de Barras                   │
│  🏷️ Marca                              │
│  📦 Stock Disponible                   │
│  ⚠️ Stock Mínimo                       │
│  ⚖️ Peso (kg)                          │
│  📏 Dimensiones (cm) - 3 inputs        │
│  🏷️ Etiquetas                          │
│  💸 Descuento (%)                      │
│                                        │
│  ← Anterior    Siguiente →            │
│                                        │
└────────────────────────────────────────┘
```

**Campos identificados:**
1. ✅ SKU (ej: SKU-001)
2. ✅ Código de Barras (ej: 123456789012)
3. ✅ Marca (ej: Nike, Adidas, etc.)
4. ✅ Stock Disponible (número)
5. ✅ Stock Mínimo (número, para alertas)
6. ✅ Peso en kg (número)
7. ✅ Dimensiones en cm (3 inputs: alto, ancho, profundo)
8. ✅ Etiquetas (input + botón agregar)
9. ✅ Descuento en % (número)

**Casos de Uso - Nivel Intermedia:**

#### 👤 Usuario 4: Tienda Física con Inventario
```
Perfil:
- Local físico + online
- Control de stock crítico
- Múltiples productos
- Necesita alertas de stock bajo

Flujo:
1. Básica completa
2. Intermedia con Stock Disponible y Mínimo
3. Sistema alerta cuando stock < mínimo
4. Puede saltear Avanzada si no sincroniza

Ejemplo:
- Ferretería local
- Boutique de ropa
- Librería
- Tienda de electrónica pequeña
```

#### 👤 Usuario 5: Distribuidor Multicanal
```
Perfil:
- Vende en múltiples plataformas
- Necesita SKU único
- Control preciso de inventario
- Códigos de barras para escaneo

Flujo:
1. Básica completa
2. Intermedia con SKU y Código de Barras
3. Peso y Dimensiones para envíos
4. Sincroniza stock en tiempo real

Ejemplo:
- Distribuidor que vende en ML + propia tienda
- Mayorista con múltiples canales
- B2B + B2C simultáneo
```

#### 👤 Usuario 6: E-commerce con Fulfillment
```
Perfil:
- Envía productos (no digital)
- Necesita cálculo de envío automático
- Peso y dimensiones críticos
- Trabaja con couriers

Flujo:
1. Básica completa
2. Intermedia con Peso y Dimensiones obligatorios
3. Sistema calcula costo envío automático
4. Genera etiquetas con medidas correctas

Ejemplo:
- Tienda online pura
- Marketplace propio
- E-commerce B2C
```

---

### 🔴 NIVEL 3: AVANZADA
**Propósito**: SEO y sincronización multi-canal  
**Target User**: Usuario profesional con integraciones  
**Tiempo**: 10-15 minutos

```
┌────────────────────────────────────────┐
│      SEO Y SINCRONIZACIÓN              │
├────────────────────────────────────────┤
│                                        │
│  💵 Costo                              │
│  🏭 Proveedor                          │
│  📈 Tasa de Impuesto (%)               │
│  🛡️ Garantía (ej: 12 meses)           │
│  🌍 Origen (país)                      │
│  🧵 Material                           │
│  🎨 Color                              │
│  📏 Talle/Tamaño                       │
│                                        │
│  🌐 OPTIMIZACIÓN SEO                   │
│  ├─ Título SEO                        │
│  ├─ Descripción SEO                   │
│  └─ Palabras Clave SEO                │
│                                        │
│  🔗 CANALES DE VENTA                   │
│  ├─ ☐ Mercado Libre                   │
│  ├─ ☐ Facebook Marketplace            │
│  └─ ☐ Instagram Shopping              │
│                                        │
│  📦 INFORMACIÓN DE ENVÍO               │
│  ├─ ☐ Envío Gratis                    │
│  ├─ Costo de Envío                    │
│  └─ Tiempo Estimado (días)            │
│                                        │
│  ← Anterior    💾 Guardar Artículo    │
│                                        │
└────────────────────────────────────────┘
```

**Campos identificados:**
1. ✅ Costo (para calcular margen)
2. ✅ Proveedor (texto)
3. ✅ Tasa de Impuesto % (número)
4. ✅ Garantía (texto, ej: "12 meses")
5. ✅ Origen (país)
6. ✅ Material (texto)
7. ✅ Color (texto)
8. ✅ Talle/Tamaño (texto)

**SEO:**
9. ✅ Título SEO (input)
10. ✅ Descripción SEO (textarea)
11. ✅ Palabras Clave SEO (input)

**Canales de Venta:**
12. ✅ Sincronizar con Mercado Libre (checkbox)
13. ✅ Sincronizar con Facebook Marketplace (checkbox)
14. ✅ Sincronizar con Instagram Shopping (checkbox)

**Información de Envío:**
15. ✅ Envío Gratis (checkbox)
16. ✅ Costo de Envío (número)
17. ✅ Tiempo Estimado de Entrega en días (número)

**Casos de Uso - Nivel Avanzada:**

#### 👤 Usuario 7: Comerciante Profesional Multi-Canal
```
Perfil:
- Vende en 3+ plataformas simultáneamente
- Sincronización automática crítica
- SEO importante para tráfico orgánico
- Gestión de márgenes y costos

Flujo:
1. Básica completa
2. Intermedia completa
3. Avanzada con TODOS los campos
4. Activa sincronización ML + FB + IG
5. Producto se publica en todos los canales automáticamente

Ejemplo:
- Tienda online establecida
- Marca propia con múltiples canales
- Distribuidor oficial
```

#### 👤 Usuario 8: Importador/Mayorista
```
Perfil:
- Importa productos
- Necesita tracking de costos y márgenes
- Proveedores internacionales
- Cálculos de impuestos complejos

Flujo:
1. Básica completa
2. Intermedia completa
3. Avanzada enfocada en:
   - Costo (para margen)
   - Proveedor (control)
   - Origen (país importación)
   - Tasa de Impuesto (cálculo preciso)
4. NO necesariamente activa canales de venta

Ejemplo:
- Importador electrónica
- Mayorista textil
- Distribuidor exclusivo
```

#### 👤 Usuario 9: SEO/Marketing Specialist
```
Perfil:
- Prioriza posicionamiento orgánico
- Optimiza cada producto para búsquedas
- Trabaja con palabras clave específicas
- Contenido optimizado

Flujo:
1. Básica completa
2. Puede saltear Intermedia (si no tiene inventario físico)
3. Avanzada enfocada 100% en SEO:
   - Título SEO optimizado
   - Descripción SEO rica en keywords
   - Palabras clave estratégicas
4. Activa canales con contenido optimizado

Ejemplo:
- Agencia de marketing
- Content creator vendiendo productos
- Nicho específico (ej: productos orgánicos)
```

#### 👤 Usuario 10: Operador Logístico Complejo
```
Perfil:
- Gestiona envíos complejos
- Múltiples opciones de envío
- Costos variables por zona
- Tiempos de entrega precisos

Flujo:
1. Básica completa
2. Intermedia con Peso y Dimensiones precisos
3. Avanzada enfocada en Información de Envío:
   - Envío gratis en condiciones específicas
   - Costos de envío por producto
   - Tiempos estimados realistas
4. Integra con courier para tracking

Ejemplo:
- E-commerce con fulfillment propio
- Tienda con envíos express
- Productos frágiles con logística especial
```

---

## 🎯 MATRIZ DE CASOS DE USO

### Resumen Visual

```
┌──────────────┬─────────┬────────────┬──────────┐
│   USUARIO    │ BÁSICA  │ INTERMEDIA │ AVANZADA │
├──────────────┼─────────┼────────────┼──────────┤
│ Vendedor     │   ✅    │     ❌     │    ❌    │
│ Rápido       │   100%  │      -     │     -    │
├──────────────┼─────────┼────────────┼──────────┤
│ Emprendedor  │   ✅    │     ❌     │    ❌    │
│ Digital      │   100%  │      -     │     -    │
├──────────────┼─────────┼────────────┼──────────┤
│ Dropshipper  │   ✅    │     🟡     │    ❌    │
│ Simple       │   100%  │    30%     │     -    │
├──────────────┼─────────┼────────────┼──────────┤
│ Tienda       │   ✅    │     ✅     │    ❌    │
│ Física       │   100%  │    100%    │     -    │
├──────────────┼─────────┼────────────┼──────────┤
│ Distribuidor │   ✅    │     ✅     │    🟡    │
│ Multicanal   │   100%  │    100%    │    50%   │
├──────────────┼─────────┼────────────┼──────────┤
│ E-commerce   │   ✅    │     ✅     │    🟡    │
│ Fulfillment  │   100%  │    100%    │    40%   │
├──────────────┼─────────┼────────────┼──────────┤
│ Comerciante  │   ✅    │     ✅     │    ✅    │
│ Profesional  │   100%  │    100%    │   100%   │
├──────────────┼─────────┼────────────┼──────────┤
│ Importador   │   ✅    │     ✅     │    ✅    │
│ Mayorista    │   100%  │    100%    │    80%   │
├──────────────┼─────────┼────────────┼──────────┤
│ SEO/Mktg     │   ✅    │     🟡     │    ✅    │
│ Specialist   │   100%  │    20%     │   100%   │
├──────────────┼─────────┼────────────┼──────────┤
│ Operador     │   ✅    │     ✅     │    ✅    │
│ Logístico    │   100%  │    100%    │    90%   │
└──────────────┴─────────┴────────────┴──────────┘

Leyenda:
✅ = Usa completamente este nivel
🟡 = Usa parcialmente este nivel
❌ = No necesita este nivel
```

---

## 💎 VENTAJAS DEL DISEÑO DE 3 NIVELES

### 1. **Progresividad** ✅
```
Usuario empieza simple → Crece en complejidad según necesidad
```

### 2. **No Intimidar** ✅
```
Ver 25 campos asusta → Ver 5 campos es manejable
```

### 3. **Flexibilidad** ✅
```
Usuario simple: Solo nivel 1
Usuario avanzado: 3 niveles completos
```

### 4. **Guía Visual** ✅
```
Checkmarks verdes muestran progreso
Usuario sabe dónde está
```

### 5. **Validación por Etapas** ✅
```
Validar Básica antes de Intermedia
Evita errores acumulados
```

### 6. **Onboarding Gradual** ✅
```
Usuario aprende el sistema de a poco
No overwhelm
```

---

## 📊 CATÁLOGO DE ARTÍCULOS (Análisis)

### Vista Principal

```
┌────────────────────────────────────────────────────────────┐
│  ODDY Market - Panel de Administración                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📦 Artículos                            + Nuevo Artículo │
│  Gestión y administración                                 │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Catálogo de Artículos                             │  │
│  │  Gestión completa con búsqueda multimodal...       │  │
│  │                                                     │  │
│  │  🔍 Buscar artículos por nombre, SKU, marca...     │  │
│  │                                                     │  │
│  │  🎤 Voz   📷 Imagen   [Todas las categorías ▼]    │  │
│  │                                                     │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┐    │  │
│  │  │  📦      │  🔍      │  ⚠️      │  🏷️      │    │  │
│  │  │  Total   │  Resul-  │  Stock   │  Catego- │    │  │
│  │  │  Artíc.  │  tados   │  Bajo    │  rías    │    │  │
│  │  │    0     │    0     │    0     │    0     │    │  │
│  │  └──────────┴──────────┴──────────┴──────────┘    │  │
│  │                                                     │  │
│  │           📦                                        │  │
│  │      No hay artículos                              │  │
│  │   Crea tu primer artículo                          │  │
│  │                                                     │  │
│  │         [+ Nuevo Artículo]                         │  │
│  │                                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Características identificadas:**

### Búsqueda Multimodal
1. ✅ **Búsqueda por texto** (nombre, SKU, marca)
2. ✅ **Búsqueda por voz** 🎤 (icono micrófono)
3. ✅ **Búsqueda por imagen** 📷 (icono cámara)
4. ✅ **Filtro por categorías** (dropdown)

### KPIs/Métricas
1. ✅ **Total Artículos** (icono 📦)
2. ✅ **Resultados** (icono 🔍)
3. ✅ **Stock Bajo** (icono ⚠️)
4. ✅ **Categorías** (icono 🏷️)

### Vistas
1. ✅ **Vista Grid** (icono cuadrícula) - activa
2. ✅ **Vista Lista** (icono lista)

### Acciones
1. ✅ **Nuevo Artículo** (botón naranja superior derecho)
2. ✅ **Nuevo Artículo** (botón naranja centro - empty state)

### Empty State
1. ✅ Icono grande de caja 📦
2. ✅ Mensaje "No hay artículos"
3. ✅ CTA "Crea tu primer artículo"
4. ✅ Botón de acción

---

## 🔍 COMPARACIÓN CON EL CÓDIGO DEL ZIP

### Backend (Edge Functions)

#### ✅ products.tsx - EXISTE
```typescript
// Rutas identificadas en el ZIP:
GET  /make-server-0dd48dc4/articles         // Listar todos
GET  /make-server-0dd48dc4/articles/:id     // Obtener uno
POST /make-server-0dd48dc4/articles         // Crear
PUT  /make-server-0dd48dc4/articles/:id     // Actualizar
DELETE /make-server-0dd48dc4/articles/:id   // Eliminar

// Almacenamiento: KV Store
// Prefix: "article:"
```

**Estado**: ✅ Backend completo existe

---

### Frontend (Componentes)

#### ✅ ArticleForm.tsx - EXISTE (en ZIP)
**Ubicación**: `temp_analysis/src/app/components/ArticleForm.tsx`

#### ✅ ArticleCatalog.tsx - EXISTE (en ZIP)
**Ubicación**: `temp_analysis/src/app/components/ArticleCatalog.tsx`

**Estado**: ✅ Componentes base existen

---

## 📋 GAP ANALYSIS - ¿Qué Falta?

### 🔴 NIVEL 1: BÁSICA - Gap Analysis

```
┌────────────────────────┬──────────┬────────────┐
│       CAMPO            │   ZIP    │  CAPTURAS  │
├────────────────────────┼──────────┼────────────┤
│ Nombre                 │    ✅    │     ✅     │
│ Descripción            │    ✅    │     ✅     │
│ Precio                 │    ✅    │     ✅     │
│ Categoría              │    ✅    │     ✅     │
│ Imágenes (1200x1200)   │    ✅    │     ✅     │
├────────────────────────┼──────────┼────────────┤
│ STATUS NIVEL BÁSICA    │  ✅ 95%  │            │
└────────────────────────┴──────────┴────────────┘

GAP: Validar tamaño imágenes 1200x1200px
```

---

### 🟡 NIVEL 2: INTERMEDIA - Gap Analysis

```
┌────────────────────────┬──────────┬────────────┐
│       CAMPO            │   ZIP    │  CAPTURAS  │
├────────────────────────┼──────────┼────────────┤
│ SKU                    │    ✅    │     ✅     │
│ Código de Barras       │    🟡    │     ✅     │
│ Marca                  │    🟡    │     ✅     │
│ Stock Disponible       │    ✅    │     ✅     │
│ Stock Mínimo           │    ❌    │     ✅     │
│ Peso (kg)              │    ✅    │     ✅     │
│ Dimensiones (cm)       │    ✅    │     ✅     │
│ Etiquetas              │    ✅    │     ✅     │
│ Descuento (%)          │    ✅    │     ✅     │
├────────────────────────┼──────────┼────────────┤
│ STATUS NIVEL INTERM.   │  🟡 80%  │            │
└────────────────────────┴──────────┴────────────┘

GAPS:
1. Stock Mínimo (nuevo campo, falta agregar)
2. Código de Barras (existe pero puede mejorarse)
3. Marca (existe pero puede mejorarse)
```

---

### 🔴 NIVEL 3: AVANZADA - Gap Analysis

```
┌────────────────────────┬──────────┬────────────┐
│       CAMPO            │   ZIP    │  CAPTURAS  │
├────────────────────────┼──────────┼────────────┤
│ Costo                  │    ✅    │     ✅     │
│ Proveedor              │    ✅    │     ✅     │
│ Tasa de Impuesto       │    🟡    │     ✅     │
│ Garantía               │    🟡    │     ✅     │
│ Origen (país)          │    ❌    │     ✅     │
│ Material               │    ❌    │     ✅     │
│ Color                  │    ❌    │     ✅     │
│ Talle/Tamaño           │    ❌    │     ✅     │
│                        │          │            │
│ OPTIMIZACIÓN SEO:      │          │            │
│ - Título SEO           │    🟡    │     ✅     │
│ - Descripción SEO      │    🟡    │     ✅     │
│ - Palabras Clave       │    ❌    │     ✅     │
│                        │          │            │
│ CANALES DE VENTA:      │          │            │
│ - Mercado Libre        │    ✅    │     ✅     │
│ - Facebook Market.     │    ✅    │     ✅     │
│ - Instagram Shopping   │    ✅    │     ✅     │
│                        │          │            │
│ INFO DE ENVÍO:         │          │            │
│ - Envío Gratis         │    🟡    │     ✅     │
│ - Costo de Envío       │    ✅    │     ✅     │
│ - Tiempo Estimado      │    ✅    │     ✅     │
├────────────────────────┼──────────┼────────────┤
│ STATUS NIVEL AVANZADA  │  🟡 65%  │            │
└────────────────────────┴──────────┴────────────┘

GAPS MAYORES:
1. Origen (país) - Campo nuevo
2. Material - Campo nuevo
3. Color - Campo nuevo
4. Talle/Tamaño - Campo nuevo
5. Palabras Clave SEO - Campo nuevo

GAPS MENORES (existen parcialmente):
6. Tasa de Impuesto - Mejorar UI
7. Garantía - Mejorar UI
8. Título/Desc SEO - Mejorar UI
9. Envío Gratis - Mejorar UI
```

---

## 🎯 ESTADO GLOBAL DEL MÓDULO

```
┌──────────────────────────────────────────┐
│   MÓDULO ARTÍCULOS - ESTADO ACTUAL       │
├──────────────────────────────────────────┤
│                                          │
│  Backend:              ████████ 95%      │
│  Frontend Base:        ███████░ 85%      │
│  Nivel Básica:         ████████ 95%      │
│  Nivel Intermedia:     ██████░░ 80%      │
│  Nivel Avanzada:       █████░░░ 65%      │
│  Búsqueda Multimodal:  ████░░░░ 50%      │
│  Sincronización ML:    ████████ 95%      │
│  Sincronización FB/IG: ███████░ 85%      │
│                                          │
│  COMPLETITUD TOTAL:    ████████ 82%      │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📝 LISTA DE TAREAS PARA COMPLETAR

### 🔴 PRIORIDAD ALTA (Bloqueantes)

1. **Agregar campos faltantes al backend**
   - [ ] `stock_minimo` (número)
   - [ ] `origen` (texto - país)
   - [ ] `material` (texto)
   - [ ] `color` (texto)
   - [ ] `talle_tamano` (texto)
   - [ ] `palabras_clave_seo` (array/texto)

2. **Adaptar ArticleForm.tsx a 3 niveles**
   - [ ] Crear componente multi-step
   - [ ] Tab 1: Básica
   - [ ] Tab 2: Intermedia
   - [ ] Tab 3: Avanzada
   - [ ] Navegación Anterior/Siguiente
   - [ ] Validación por nivel
   - [ ] Indicadores visuales de progreso (checkmarks verdes)

3. **Implementar búsqueda multimodal**
   - [ ] Búsqueda por texto (ya existe)
   - [ ] Búsqueda por voz (nuevo)
   - [ ] Búsqueda por imagen (nuevo)
   - [ ] Filtros por categoría

---

### 🟡 PRIORIDAD MEDIA

4. **Mejorar validaciones**
   - [ ] Validar tamaño imágenes (1200x1200px)
   - [ ] Validar formato código de barras
   - [ ] Validar SKU único
   - [ ] Validar precio > 0
   - [ ] Validar stock >= 0

5. **Implementar KPIs en Catálogo**
   - [ ] Total Artículos (contador)
   - [ ] Resultados de búsqueda
   - [ ] Stock Bajo (artículos con stock < stock_minimo)
   - [ ] Categorías únicas

6. **Vistas del catálogo**
   - [ ] Vista Grid (activa por defecto)
   - [ ] Vista Lista
   - [ ] Toggle entre vistas

---

### 🟢 PRIORIDAD BAJA (Nice to have)

7. **Búsqueda por voz**
   - [ ] Integrar Web Speech API
   - [ ] Botón micrófono funcional
   - [ ] Transcripción a texto
   - [ ] Búsqueda automática

8. **Búsqueda por imagen**
   - [ ] Upload imagen
   - [ ] IA para reconocimiento (Clarifai/Google Vision)
   - [ ] Match con productos existentes
   - [ ] Resultados similares

9. **Optimizaciones**
   - [ ] Auto-guardar borrador cada 30s
   - [ ] Sugerencias IA para descripción
   - [ ] Sugerencias IA para SEO
   - [ ] Preview en tiempo real

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Semana 1: Backend + Básica (3-4 días)

```
Día 1-2: Backend
- Agregar campos nuevos a products.tsx
- Actualizar validaciones
- Testing endpoints

Día 3-4: Frontend Básica
- Adaptar ArticleForm a multi-step
- Implementar Tab Básica
- Validaciones nivel 1
- Testing manual
```

### Semana 2: Intermedia + Avanzada (3-4 días)

```
Día 5-6: Frontend Intermedia
- Implementar Tab Intermedia
- Campos de inventario
- Alertas stock mínimo
- Testing manual

Día 7-8: Frontend Avanzada
- Implementar Tab Avanzada
- SEO fields
- Canales de venta (checkboxes)
- Info de envío
- Testing manual
```

### Semana 3: Catálogo + Búsqueda (3-4 días)

```
Día 9-10: Catálogo
- KPIs funcionales
- Vistas Grid/Lista
- Empty state
- Testing manual

Día 11-12: Búsqueda
- Búsqueda por texto optimizada
- Filtros por categoría
- (Opcional) Voz
- (Opcional) Imagen
- Testing manual
```

### Semana 4: Testing + Deploy (2-3 días)

```
Día 13-14: Testing exhaustivo
- Flujos completos
- Edge cases
- Responsive
- Bugs fixes

Día 15: Deploy
- Commit + push
- Deploy a producción
- Documentación
```

---

## 💬 PRÓXIMO PASO

### Preguntas para el usuario:

1. **¿Te gusta el análisis de los 3 niveles?**
   - ¿Los casos de uso tienen sentido?
   - ¿Falta algún tipo de usuario?

2. **¿Empezamos con la implementación?**
   - Backend primero (agregar campos)
   - Frontend después (3 tabs)

3. **¿Hay algún campo o funcionalidad que falta?**
   - ¿Necesitas algo más en Básica?
   - ¿Algo más en Intermedia?
   - ¿Algo más en Avanzada?

4. **¿Qué tan prioritaria es la búsqueda por voz/imagen?**
   - Crítica → Implementamos ahora
   - Media → Fase 2
   - Baja → Futuro

---

**Estado**: ⏳ Esperando confirmación para empezar implementación

**Tiempo estimado total**: 12-15 días laborables
