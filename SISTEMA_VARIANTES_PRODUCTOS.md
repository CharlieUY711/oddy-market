# 🎨 SISTEMA DE VARIANTES DE PRODUCTOS

**Fecha**: 12 de Febrero, 2026  
**Propósito**: Diseñar sistema de variantes para productos con opciones múltiples

---

## 🤔 ¿QUÉ SON LAS VARIANTES?

### Concepto:

```
PRODUCTO BASE: Remera Nike Dry-Fit
    ├─ VARIANTE 1: Remera Nike Dry-Fit - Rojo - Talle S
    ├─ VARIANTE 2: Remera Nike Dry-Fit - Rojo - Talle M
    ├─ VARIANTE 3: Remera Nike Dry-Fit - Rojo - Talle L
    ├─ VARIANTE 4: Remera Nike Dry-Fit - Azul - Talle S
    ├─ VARIANTE 5: Remera Nike Dry-Fit - Azul - Talle M
    └─ VARIANTE 6: Remera Nike Dry-Fit - Azul - Talle L

RESULTADO: 1 producto base → 6 variantes (2 colores × 3 talles)
```

### Características:

- **Producto Base**: Información compartida (nombre, descripción, categoría)
- **Variantes**: Información específica (color, talle, stock, SKU, precio)
- **Combinaciones**: Color × Talle × Sabor × etc.

---

## 🛍️ CASOS DE USO COMUNES

### 1. **Ropa y Calzado** 👕👟
```
Atributos variables:
- Color (Rojo, Azul, Negro, Blanco, etc.)
- Talle (XS, S, M, L, XL, XXL)
- Tipo (Manga corta, Manga larga)

Ejemplo: Remera Adidas
- 5 colores × 6 talles = 30 variantes
```

### 2. **Calzado** 👞
```
Atributos variables:
- Color
- Número (35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45)

Ejemplo: Zapatillas Nike Air Max
- 3 colores × 11 números = 33 variantes
```

### 3. **Tecnología** 📱💻
```
Atributos variables:
- Capacidad (64GB, 128GB, 256GB, 512GB)
- Color (Blanco, Negro, Azul)

Ejemplo: iPhone 15
- 4 capacidades × 3 colores = 12 variantes
```

### 4. **Alimentos y Bebidas** 🍫☕
```
Atributos variables:
- Sabor (Chocolate, Vainilla, Frutilla)
- Tamaño (250g, 500g, 1kg)

Ejemplo: Proteína Whey
- 3 sabores × 3 tamaños = 9 variantes
```

### 5. **Hogar y Deco** 🛋️
```
Atributos variables:
- Color
- Tamaño (Pequeño, Mediano, Grande)
- Material (Algodón, Poliéster, Lino)

Ejemplo: Almohadón Decorativo
- 5 colores × 3 tamaños × 2 materiales = 30 variantes
```

---

## 🏗️ ARQUITECTURA DE BASE DE DATOS

### Opción A: Tabla Separada (Recomendado) ⭐

```sql
-- Tabla productos (base)
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  marca VARCHAR(100),
  imagenes TEXT[],
  
  -- Indica si tiene variantes
  tiene_variantes BOOLEAN DEFAULT FALSE,
  
  -- Campos compartidos
  garantia VARCHAR(100),
  material VARCHAR(100),
  -- ... más campos compartidos
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla variantes
CREATE TABLE product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  
  -- SKU único por variante
  sku VARCHAR(100) UNIQUE NOT NULL,
  
  -- Atributos de la variante
  atributos JSONB, -- { "color": "Rojo", "talle": "M" }
  
  -- Campos específicos de variante
  precio DECIMAL(10,2) NOT NULL,
  stock_disponible INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  codigo_barras VARCHAR(50),
  peso_kg DECIMAL(8,2),
  
  -- Imagen específica (opcional, si difiere del base)
  imagen_principal TEXT,
  imagenes_adicionales TEXT[],
  
  -- Trazabilidad (por variante)
  lote VARCHAR(100),
  fecha_elaboracion DATE,
  fecha_compra DATE,
  fecha_vencimiento DATE,
  
  -- Sincronización ML (por variante)
  ml_item_id VARCHAR(50),
  ml_permalink TEXT,
  ml_sincronizado BOOLEAN DEFAULT FALSE,
  
  -- Estados
  activo BOOLEAN DEFAULT TRUE,
  agotado BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_atributos ON product_variants USING GIN(atributos);
CREATE INDEX idx_variants_ml_item ON product_variants(ml_item_id);

-- Tabla de opciones de atributos (para definir posibles valores)
CREATE TABLE product_attributes (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL, -- 'color', 'talle', 'sabor', etc.
  valores TEXT[], -- ['Rojo', 'Azul', 'Verde']
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE
);
```

### Opción B: Todo en Una Tabla (No Recomendado)

```sql
-- products con campos de variante
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255),
  parent_id BIGINT REFERENCES products(id), -- NULL si es base
  es_variante BOOLEAN DEFAULT FALSE,
  atributos_variante JSONB,
  -- ... todos los campos
);

❌ Problemas:
- Difícil de consultar
- Duplicación de datos
- Confusión entre base y variante
```

---

## 🎨 DISEÑO DE UI - GESTIÓN DE VARIANTES

### Formulario "Nuevo Artículo" Actualizado

#### Nivel Básica - Checkbox Nuevo

```
┌────────────────────────────────────────┐
│         NIVEL 1: BÁSICA                │
├────────────────────────────────────────┤
│                                        │
│  📝 Nombre del Artículo *              │
│  📄 Descripción *                      │
│  💰 Precio *                           │
│  🏷️ Categoría *                        │
│  📷 Imágenes *                         │
│                                        │
│  [☐ Este producto tiene variantes]    │
│      (color, talle, tamaño, etc.)     │
│                                        │
│  Botón: Siguiente →                   │
│                                        │
└────────────────────────────────────────┘
```

#### Si Checkbox Activado → Nivel Intermedia Cambia

```
┌────────────────────────────────────────────────────┐
│         NIVEL 2: INTERMEDIA (CON VARIANTES)        │
├────────────────────────────────────────────────────┤
│                                                    │
│  🎨 DEFINIR OPCIONES DE VARIANTES                  │
│                                                    │
│  Opción 1: Color                                   │
│  ├─ [Rojo] [Azul] [Negro] [+ Agregar color]      │
│  └─ [🗑️ Eliminar opción]                          │
│                                                    │
│  Opción 2: Talle                                   │
│  ├─ [S] [M] [L] [XL] [+ Agregar talle]           │
│  └─ [🗑️ Eliminar opción]                          │
│                                                    │
│  [+ Agregar otra opción]                          │
│                                                    │
│  ────────────────────────────────────────         │
│                                                    │
│  📊 VARIANTES GENERADAS (6)                        │
│                                                    │
│  Tabla de variantes:                              │
│  ┌─────────┬──────┬───────┬──────┬────────┐      │
│  │ Color   │ Talle│ SKU   │ Stock│ Precio │      │
│  ├─────────┼──────┼───────┼──────┼────────┤      │
│  │ Rojo    │ S    │ [input│[input│ [input]│      │
│  │ Rojo    │ M    │ [input│[input│ [input]│      │
│  │ Rojo    │ L    │ [input│[input│ [input]│      │
│  │ Azul    │ S    │ [input│[input│ [input]│      │
│  │ Azul    │ M    │ [input│[input│ [input]│      │
│  │ Azul    │ L    │ [input│[input│ [input]│      │
│  └─────────┴──────┴───────┴──────┴────────┘      │
│                                                    │
│  [Aplicar mismo precio a todas: $XXX] [Aplicar]  │
│  [Generar SKUs automáticos] [Generar]            │
│                                                    │
│  ← Anterior    Siguiente →                        │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE CREACIÓN CON VARIANTES

### Paso a Paso:

```
1. Usuario completa Nivel Básica
   ✅ Nombre: "Remera Nike Dry-Fit"
   ✅ Descripción, Precio base, Categoría
   ☑ Checkbox "Tiene variantes" activado

2. Sistema en Nivel Intermedia:
   ✅ Muestra "Definir opciones de variantes"
   ✅ Usuario agrega Opción 1: Color
      - Rojo, Azul, Negro
   ✅ Usuario agrega Opción 2: Talle
      - S, M, L, XL
   
3. Sistema genera combinaciones:
   ✅ 3 colores × 4 talles = 12 variantes
   ✅ Muestra tabla con 12 filas

4. Usuario completa tabla:
   ✅ SKUs (o auto-genera)
   ✅ Stock por variante
   ✅ Precio (puede variar o ser mismo)
   ✅ Código de barras (si aplica)

5. Usuario pasa a Nivel Avanzada (opcional)
   ✅ SEO, Sincronización, etc.

6. Guardar
   ✅ Sistema crea:
      - 1 producto base
      - 12 variantes en tabla separada
   ✅ Confirmación
```

---

## 🛒 EXPERIENCIA DEL COMPRADOR

### En el Frontend (Tienda):

```
┌────────────────────────────────────────────┐
│     REMERA NIKE DRY-FIT                    │
│     $1,290 - $1,490                        │
│                                            │
│  [Imagen principal]                        │
│  [Miniaturas de colores]                   │
│                                            │
│  Selecciona tu color:                      │
│  ● Rojo  ○ Azul  ○ Negro                  │
│                                            │
│  Selecciona tu talle:                      │
│  ○ S  ● M  ○ L  ○ XL                      │
│                                            │
│  SKU: REM-NIKE-ROJO-M                     │
│  Stock: 15 unidades disponibles           │
│  Precio: $1,290                           │
│                                            │
│  Cantidad: [▼ 1]                          │
│                                            │
│  [🛒 Agregar al Carrito]                  │
│                                            │
└────────────────────────────────────────────┘
```

**Lógica:**
1. Usuario selecciona color → Imagen cambia
2. Usuario selecciona talle → Stock y precio se actualizan
3. Si variante agotada → Botón deshabilitado
4. Si variante no existe → "Combinación no disponible"

---

## 📊 GESTIÓN DE INVENTARIO CON VARIANTES

### Vista de Catálogo:

```
┌────────────────────────────────────────────────────────┐
│  CATÁLOGO DE ARTÍCULOS                                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🔍 Buscar... [Filtro: Con variantes ▼]               │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📦 Remera Nike Dry-Fit                           │ │
│  │    12 variantes | Stock total: 145              │ │
│  │    [Ver variantes ▼]                             │ │
│  │                                                   │ │
│  │    Expandido:                                    │ │
│  │    ┌─────────┬──────┬──────┬────────┬─────────┐ │ │
│  │    │ Color   │ Talle│ SKU  │ Stock  │ Precio  │ │ │
│  │    ├─────────┼──────┼──────┼────────┼─────────┤ │ │
│  │    │ Rojo    │ S    │ R-S  │ 12     │ $1,290  │ │ │
│  │    │ Rojo    │ M    │ R-M  │ 15     │ $1,290  │ │ │
│  │    │ Rojo    │ L    │ R-L  │ 8 ⚠️   │ $1,290  │ │ │
│  │    │ Rojo    │ XL   │ R-XL │ 0 🔴   │ $1,290  │ │ │
│  │    │ ...                                        │ │ │
│  │    └─────────┴──────┴──────┴────────┴─────────┘ │ │
│  │                                                   │ │
│  │    [Editar] [Agregar Stock] [Sincronizar]       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🔗 VARIANTES Y MERCADO LIBRE

### Sincronización:

Mercado Libre **SÍ soporta variantes** nativa​mente:

```javascript
// Crear producto con variantes en ML

POST https://api.mercadolibre.com/items

{
  "title": "Remera Nike Dry-Fit",
  "category_id": "MLA109027",
  "price": 1290,
  // ... campos base ...
  
  "variations": [
    {
      "attribute_combinations": [
        { "id": "COLOR", "name": "Color", "value_name": "Rojo" },
        { "id": "SIZE", "name": "Talle", "value_name": "S" }
      ],
      "price": 1290,
      "available_quantity": 12,
      "picture_ids": ["IMG123"],
      "seller_custom_field": "REM-NIKE-ROJO-S" // SKU ODDY
    },
    {
      "attribute_combinations": [
        { "id": "COLOR", "name": "Color", "value_name": "Rojo" },
        { "id": "SIZE", "name": "Talle", "value_name": "M" }
      ],
      "price": 1290,
      "available_quantity": 15,
      "picture_ids": ["IMG123"],
      "seller_custom_field": "REM-NIKE-ROJO-M"
    },
    // ... más variantes
  ]
}
```

**Ventaja**: Una sola publicación en ML con múltiples variantes  
**Mapeo**: 1 producto ODDY → 1 item ML con N variations

---

## ⚡ OPTIMIZACIONES

### 1. **Generación Automática de SKUs**

```javascript
function generarSKU(productoBase, variante) {
  const base = productoBase.nombre
    .substring(0, 10)
    .toUpperCase()
    .replace(/\s/g, '-');
  
  const attrs = Object.values(variante.atributos)
    .map(v => v.substring(0, 3).toUpperCase())
    .join('-');
  
  return `${base}-${attrs}`;
}

// Ejemplo:
// Producto: "Remera Nike Dry-Fit"
// Variante: { color: "Rojo", talle: "M" }
// SKU: "REMERA-NIK-ROJ-M"
```

### 2. **Aplicación Masiva**

```
[Aplicar a todas las variantes:]
- Mismo precio
- Mismo stock inicial
- Mismo proveedor
- Mismas fechas (trazabilidad)
```

### 3. **Importación CSV**

```csv
color,talle,sku,stock,precio
Rojo,S,R-S,12,1290
Rojo,M,R-M,15,1290
Rojo,L,R-L,8,1290
Azul,S,A-S,10,1340
Azul,M,A-M,20,1340
```

---

## 📊 REPORTES CON VARIANTES

### Reporte de Stock por Variante:

```
PRODUCTO: Remera Nike Dry-Fit

Variantes con stock bajo (< 10):
┌─────────┬──────┬───────┬─────────────┐
│ Color   │ Talle│ Stock │ Acción      │
├─────────┼──────┼───────┼─────────────┤
│ Rojo    │ L    │ 8     │ Reponer     │
│ Negro   │ S    │ 5     │ Reponer     │
│ Azul    │ XL   │ 3     │ Urgente     │
└─────────┴──────┴───────┴─────────────┘

Variantes agotadas:
- Rojo XL (última venta: 3 días atrás)
- Negro M (última venta: 1 día atrás)

Variantes más vendidas (últimos 30 días):
1. Azul M - 45 unidades
2. Rojo L - 38 unidades
3. Negro M - 32 unidades
```

---

## 🎯 CASOS EXTREMOS Y CONSIDERACIONES

### 1. **Demasiadas Variantes**

```
Problema:
- 5 colores × 10 talles × 2 tipos = 100 variantes
- UI se vuelve compleja

Solución:
- Paginación en tabla de variantes
- Filtros (mostrar solo Rojo, solo Talle M, etc.)
- Edición por lotes
```

### 2. **Variantes con Precio Diferente**

```
Ejemplo: iPhone
- 64GB: $999
- 128GB: $1,099
- 256GB: $1,299

Solución:
- Campo precio editable por variante
- En frontend: mostrar rango "$999 - $1,299"
```

### 3. **Variantes con Imágenes Diferentes**

```
Ejemplo: Remera
- Rojo: foto con modelo rojo
- Azul: foto con modelo azul

Solución:
- Campo imagen_principal por variante (opcional)
- Si no tiene, usar imagen del producto base
```

### 4. **Stock por Variante vs Stock Total**

```
Stock Total = Suma de stock de todas las variantes

Si usuario busca "Remera Nike":
- Mostrar "145 unidades disponibles" (suma)
- Al seleccionar variante: "15 unidades" (específico)
```

---

## 🗄️ MIGRACIONES DE DATOS

### Si ya existen productos sin variantes:

```sql
-- Migración: Convertir producto simple a producto con variante única

-- 1. Identificar productos a migrar
SELECT * FROM products WHERE tiene_variantes = FALSE;

-- 2. Para cada producto, crear variante "default"
INSERT INTO product_variants (
  product_id,
  sku,
  atributos,
  precio,
  stock_disponible,
  -- ... copiar campos del producto
)
SELECT 
  id,
  sku,
  '{}'::jsonb, -- Sin atributos
  precio,
  stock_disponible,
  -- ... resto de campos
FROM products
WHERE tiene_variantes = FALSE;

-- 3. Marcar productos como con variantes
UPDATE products SET tiene_variantes = TRUE WHERE id IN (...);
```

---

## ⏱️ IMPACTO EN TIEMPO DE DESARROLLO

### Sistema de Variantes Completo:

```
Análisis y diseño:         1 día ✅ (hecho)
Backend:
  - Schema variantes:      0.5 días
  - APIs CRUD variantes:   1.5 días
  - Lógica combinaciones:  1 día
  - Validaciones:          0.5 días

Frontend:
  - UI definir opciones:   1.5 días
  - Tabla variantes:       1.5 días
  - Vista catálogo:        1 día
  - Frontend tienda:       2 días (selector variantes)

Testing:
  - Casos extremos:        1 día
  
Sync ML con variantes:     1 día adicional

TOTAL VARIANTES: +11 días

ESTIMACIÓN ACTUALIZADA:
- Sin variantes: 19-23 días
- Con variantes: 30-34 días (+11 días)
```

---

## 🎯 DECISIÓN: ¿IMPLEMENTAR VARIANTES?

### Opción A: SÍ, desde el principio ⭐ (Recomendado)
```
✅ Arquitectura correcta desde el inicio
✅ No hay migración dolorosa después
✅ Soporta todos los casos de uso
✅ ML con variantes funciona mejor
❌ +11 días de desarrollo

Usuarios beneficiados:
- Ropa y calzado (crítico)
- Tecnología (importante)
- Alimentos con opciones
- Cualquier producto con variaciones
```

### Opción B: NO, solo productos simples
```
✅ Más rápido (19-23 días)
✅ Menos complejo inicialmente
❌ Limitación severa para ropa/calzado
❌ Migración dolorosa después
❌ Workarounds feos (crear 30 productos para 1 remera)

Solo viable si:
- No vendes ropa/calzado
- Solo productos únicos
- Demo/MVP muy rápido
```

### Opción C: Híbrido - Fase 1 sin, Fase 2 con
```
✅ MVP rápido (Fase 1)
✅ Variantes después (Fase 2)
❌ Arquitectura cambia después
❌ Migración de datos necesaria
❌ Posibles bugs en migración

Timeline:
- Fase 1 (sin): 19-23 días
- Fase 2 (variantes): +11 días
- Migración: +2 días
= Total: 32-36 días
```

---

## 💡 RECOMENDACIÓN FINAL

### Mi Sugerencia: **Opción A con MVP Inteligente**

```
Implementar variantes PERO de forma progresiva:

SPRINT 1 (MVP Variantes): +5 días
✅ Schema de variantes
✅ UI básica (definir opciones + tabla)
✅ Generación automática combinaciones
✅ Gestión stock por variante
❌ Sin sync ML variantes (viene después)
❌ Sin selector avanzado frontend
❌ Sin reportes variantes

SPRINT 2 (Variantes Completas): +6 días
✅ Sync ML con variantes
✅ Selector frontend tienda
✅ Reportes por variante
✅ Optimizaciones

RESULTADO:
- Día 1-19: Producto base funcional
- Día 20-24: Variantes MVP
- Día 25-30: Variantes completas
= 30 días total con variantes completas
```

---

## 📊 COMPARACIÓN FINAL

```
┌──────────────────┬─────────┬──────────┬────────────┐
│   ENFOQUE        │ TIEMPO  │ COMPLETO │ MIGRACIÓN  │
├──────────────────┼─────────┼──────────┼────────────┤
│ Sin variantes    │ 19-23 d │    ❌    │   Dolorosa │
│ Con variantes    │ 30-34 d │    ✅    │   No aplica│
│ Híbrido          │ 32-36 d │    ✅    │   Compleja │
│ MVP + completo   │ 24-30 d │    ✅    │   No aplica│
└──────────────────┴─────────┴──────────┴────────────┘

Recomendación: MVP + Completo (24-30 días)
```

---

## 💬 RESUMEN

### Variantes son CRÍTICAS para:
```
✅ Ropa (talles + colores)
✅ Calzado (números + colores)
✅ Tecnología (capacidades + colores)
✅ Alimentos (sabores + tamaños)
✅ Cualquier producto con opciones
```

### Impacto:
```
+11 días para sistema completo
+5 días para MVP básico
```

### Alternativas:
```
A. Implementar desde inicio (recomendado)
B. Solo productos simples (limitante)
C. Híbrido - después (más tiempo total)
```

---

## 🎯 ¿QUÉ HACEMOS?

**Pregunto:**

1. **¿Implementamos sistema de variantes?**
   - SÍ → Necesario para tu negocio
   - NO → Solo productos simples

2. **Si SÍ, ¿qué enfoque?**
   - MVP primero (+5 días)
   - Completo desde inicio (+11 días)

3. **¿Qué tipos de productos con variantes tenés?**
   - Ropa/Calzado
   - Tecnología
   - Alimentos
   - Otros

---

**Este es un tema GRANDE que afecta toda la arquitectura. Necesito tu decisión antes de avanzar** 🎯

**Documento completo:**  
📄 **`SISTEMA_VARIANTES_PRODUCTOS.md`**
