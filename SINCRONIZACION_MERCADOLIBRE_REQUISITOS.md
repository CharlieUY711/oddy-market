# 🔗 SINCRONIZACIÓN MERCADO LIBRE - Requisitos de Campos

**Fecha**: 12 de Febrero, 2026  
**Propósito**: Mapear campos de ODDY a requisitos de Mercado Libre API

---

## 📋 CAMPOS OBLIGATORIOS DE MERCADO LIBRE

### API de Mercado Libre - Items Endpoint

```javascript
// POST https://api.mercadolibre.com/items

{
  "title": "String",                    // OBLIGATORIO - Título producto (max 60 chars)
  "category_id": "String",              // OBLIGATORIO - ID categoría ML
  "price": Number,                      // OBLIGATORIO - Precio en moneda local
  "currency_id": "String",              // OBLIGATORIO - ej: "UYU", "ARS", "USD"
  "available_quantity": Number,         // OBLIGATORIO - Stock disponible
  "buying_mode": "String",              // OBLIGATORIO - "buy_it_now" o "auction"
  "condition": "String",                // OBLIGATORIO - "new" o "used"
  "listing_type_id": "String",          // OBLIGATORIO - "gold_special", "free", etc.
  
  // RECOMENDADOS (mejoran visibilidad)
  "description": {                      // Descripción HTML
    "plain_text": "String"
  },
  "pictures": [                         // Array de imágenes
    { "source": "URL" }
  ],
  "video_id": "String",                 // ID video YouTube (opcional)
  
  // ATRIBUTOS (varían por categoría)
  "attributes": [                       // Atributos específicos
    {
      "id": "BRAND",                    // Marca
      "value_name": "Nike"
    },
    {
      "id": "MODEL",                    // Modelo
      "value_name": "Air Max"
    },
    {
      "id": "COLOR",                    // Color
      "value_name": "Rojo"
    },
    {
      "id": "SIZE",                     // Talle
      "value_name": "42"
    }
    // ... más atributos según categoría
  ],
  
  // ENVÍO
  "shipping": {
    "mode": "me2",                      // "me2" (ML envía) o "custom"
    "free_shipping": Boolean,
    "dimensions": "String",             // Dimensiones empaquetado
    "local_pick_up": Boolean
  },
  
  // OTROS
  "warranty": "String",                 // Garantía
  "official_store_id": Number,          // Si es tienda oficial
  "sale_terms": [                       // Términos de venta
    {
      "id": "WARRANTY_TIME",
      "value_name": "12 meses"
    }
  ]
}
```

---

## 🔍 MAPEO: ODDY → MERCADO LIBRE

### ✅ CAMPOS QUE YA TENEMOS EN ODDY

```
┌─────────────────────┬──────────────────┬────────────────┐
│   CAMPO ODDY        │  CAMPO ML        │  NIVEL ODDY    │
├─────────────────────┼──────────────────┼────────────────┤
│ Nombre              │ title            │ Básica         │
│ Descripción         │ description      │ Básica         │
│ Precio              │ price            │ Básica         │
│ Categoría           │ category_id*     │ Básica         │
│ Imágenes            │ pictures         │ Básica         │
│ Stock Disponible    │ available_qty    │ Intermedia     │
│ Marca               │ attributes.BRAND │ Intermedia     │
│ Peso                │ shipping.weight  │ Intermedia     │
│ Dimensiones         │ shipping.dims    │ Intermedia     │
│ Descuento           │ -**              │ Intermedia     │
│ Garantía            │ warranty         │ Avanzada       │
│ Color               │ attributes.COLOR │ Avanzada       │
│ Talle/Tamaño        │ attributes.SIZE  │ Avanzada       │
│ Material            │ attributes.MAT   │ Avanzada       │
└─────────────────────┴──────────────────┴────────────────┘

*  Necesita mapeo de categorías ODDY → ML
** ML maneja descuentos de forma diferente
```

---

## ❌ CAMPOS QUE FALTAN EN ODDY

### Para Sincronización Completa con ML

```
┌──────────────────────────┬─────────────┬─────────────────┐
│   CAMPO NECESARIO        │  OBLIGATORIO│  NIVEL SUGERIDO │
├──────────────────────────┼─────────────┼─────────────────┤
│ Condición                │     ✅      │ Avanzada        │
│ (nuevo/usado)            │             │                 │
├──────────────────────────┼─────────────┼─────────────────┤
│ Tipo de Listado          │     ✅      │ Avanzada        │
│ (gold_special/free/etc)  │             │                 │
├──────────────────────────┼─────────────┼─────────────────┤
│ Modo de Compra           │     ✅      │ Avanzada        │
│ (buy_it_now/auction)     │             │ (auto: buy_it)  │
├──────────────────────────┼─────────────┼─────────────────┤
│ Moneda                   │     ✅      │ Avanzada        │
│ (UYU/ARS/USD)            │             │ (auto: UYU)     │
├──────────────────────────┼─────────────┼─────────────────┤
│ Modo de Envío            │     🟡      │ Avanzada        │
│ (me2/custom)             │             │                 │
├──────────────────────────┼─────────────┼─────────────────┤
│ Envío Gratis             │     🟡      │ Avanzada        │
│ (ya existe)              │             │ ✅              │
├──────────────────────────┼─────────────┼─────────────────┤
│ Retiro en Persona        │     🟡      │ Avanzada        │
│ (local_pick_up)          │             │                 │
├──────────────────────────┼─────────────┼─────────────────┤
│ Modelo                   │     🟡      │ Avanzada        │
│ (si aplica)              │             │                 │
├──────────────────────────┼─────────────┼─────────────────┤
│ Video ID                 │     ❌      │ Avanzada        │
│ (YouTube opcional)       │             │                 │
└──────────────────────────┴─────────────┴─────────────────────┘

✅ = Obligatorio
🟡 = Recomendado
❌ = Opcional
```

---

## 📊 CAMPOS ADICIONALES PROPUESTOS

### Para Nivel Avanzada - Sección Mercado Libre

```
┌────────────────────────────────────────────────────────┐
│              NIVEL 3: AVANZADA                         │
│         (Sección SINCRONIZACIÓN ML agregada)           │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ... (campos existentes) ...                          │
│                                                        │
│  🔗 SINCRONIZACIÓN MERCADO LIBRE                       │
│  ├─ ☐ Publicar en Mercado Libre                      │
│  │                                                     │
│  │  (Si checkbox activo, mostrar:)                    │
│  │                                                     │
│  ├─ 📦 Condición del Producto *                       │
│  │   ● Nuevo                                          │
│  │   ○ Usado                                          │
│  │                                                     │
│  ├─ 🏷️ Tipo de Listado *                             │
│  │   [Select: Gold Special ▼]                         │
│  │   Opciones:                                        │
│  │   - Gold Special (recomendado)                     │
│  │   - Gold Pro                                       │
│  │   - Premium                                        │
│  │   - Clásico                                        │
│  │   - Gratis                                         │
│  │                                                     │
│  ├─ 💰 Moneda                                         │
│  │   [Select: UYU (Peso Uruguayo) ▼]                 │
│  │   Opciones: UYU, ARS, USD, BRL, etc.              │
│  │                                                     │
│  ├─ 🚚 Modo de Envío                                  │
│  │   ● Mercado Envíos (me2) - Recomendado            │
│  │   ○ Envío a cargo del vendedor (custom)           │
│  │                                                     │
│  ├─ ☐ Retiro en Persona Disponible                   │
│  │                                                     │
│  ├─ 🏷️ Modelo (opcional)                             │
│  │   [Input: ej. "Air Max 2024"]                     │
│  │                                                     │
│  ├─ 🎥 Video ID (YouTube, opcional)                  │
│  │   [Input: ej. "dQw4w9WgXcQ"]                      │
│  │                                                     │
│  └─ 🔄 Estado Sincronización                          │
│      [ Última sync: -- ] [Sincronizar Ahora]         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE SINCRONIZACIÓN

### Escenario 1: Usuario Activa Sincronización ML

```
1. Usuario completa Nivel Básica
   ✅ Título, Descripción, Precio, Categoría, Imágenes

2. Usuario completa Nivel Intermedia
   ✅ Stock, Marca, Peso, Dimensiones

3. Usuario va a Nivel Avanzada
   ☐ Activa checkbox "Publicar en Mercado Libre"
   
4. Sistema muestra campos adicionales ML
   ✅ Usuario completa:
      - Condición: Nuevo
      - Tipo Listado: Gold Special
      - Moneda: UYU
      - Modo Envío: Mercado Envíos
      - ☑ Retiro en Persona
   
5. Usuario hace click "Guardar Artículo"

6. Sistema:
   a) Guarda producto en ODDY
   b) Valida campos requeridos por ML
   c) Mapea categoría ODDY → ML
   d) Crea payload para ML API
   e) POST a ML API
   f) Guarda ml_item_id en ODDY
   g) Muestra confirmación

7. Sincronización Automática:
   - Cada vez que usuario edita producto
   - Sistema actualiza en ML automáticamente
   - PUT a ML API con cambios
```

---

## ⚠️ VALIDACIONES NECESARIAS

### Antes de Sincronizar con ML

```javascript
// Validaciones pre-sync

function validarParaML(producto) {
  const errores = [];
  
  // OBLIGATORIOS
  if (!producto.nombre || producto.nombre.length > 60) {
    errores.push('Título debe tener máx 60 caracteres');
  }
  
  if (!producto.precio || producto.precio <= 0) {
    errores.push('Precio debe ser mayor a 0');
  }
  
  if (!producto.categoria) {
    errores.push('Debe seleccionar una categoría');
  }
  
  if (!producto.stock_disponible || producto.stock_disponible < 1) {
    errores.push('Stock disponible debe ser al menos 1');
  }
  
  if (!producto.imagenes || producto.imagenes.length === 0) {
    errores.push('Debe tener al menos 1 imagen');
  }
  
  // CAMPOS ML ESPECÍFICOS
  if (producto.sincronizar_ml) {
    if (!producto.ml_condicion) {
      errores.push('Debe indicar si es nuevo o usado');
    }
    
    if (!producto.ml_tipo_listado) {
      errores.push('Debe seleccionar tipo de listado');
    }
    
    if (!producto.ml_moneda) {
      errores.push('Debe seleccionar moneda');
    }
    
    // RECOMENDADOS
    if (!producto.descripcion || producto.descripcion.length < 50) {
      errores.push('⚠️ Recomendamos descripción de al menos 50 caracteres');
    }
    
    if (!producto.marca) {
      errores.push('⚠️ Recomendamos agregar marca');
    }
    
    if (producto.imagenes.length < 3) {
      errores.push('⚠️ Recomendamos al menos 3 imágenes');
    }
  }
  
  return errores;
}
```

---

## 🗂️ MAPEO DE CATEGORÍAS

### ODDY → Mercado Libre

```javascript
// Tabla de mapeo categorías
// Esto debe configurarse por el admin

const mapeoCategoriasML = {
  // ODDY Category ID → ML Category ID
  'tecnologia': 'MLA1051',           // Celulares y Teléfonos
  'electronica': 'MLA1000',          // Electrónica, Audio y Video
  'moda-hombre': 'MLA1430',          // Ropa y Accesorios > Hombre
  'moda-mujer': 'MLA1430',           // Ropa y Accesorios > Mujer
  'deportes': 'MLA1276',             // Deportes y Fitness
  'hogar': 'MLA1574',                // Hogar, Muebles y Jardín
  'juguetes': 'MLA1132',             // Juegos y Juguetes
  'libros': 'MLA3025',               // Libros, Revistas y Comics
  'belleza': 'MLA1246',              // Salud y Belleza
  'bebes': 'MLA1384',                // Bebés
  'automotor': 'MLA1743',            // Accesorios para Vehículos
  'mascotas': 'MLA1071',             // Animales y Mascotas
  // ... más mapeos
};

// Helper para obtener categoría ML
function obtenerCategoriaML(categoriaODDY) {
  const mlCategoryId = mapeoCategoriasML[categoriaODDY];
  
  if (!mlCategoryId) {
    throw new Error(
      `No hay mapeo de categoría para: ${categoriaODDY}. ` +
      `Configure el mapeo en Sistema > Integraciones > Mercado Libre`
    );
  }
  
  return mlCategoryId;
}
```

---

## 📦 PAYLOAD COMPLETO DE EJEMPLO

### Request a Mercado Libre API

```javascript
// Construir payload desde producto ODDY

function construirPayloadML(productoODDY) {
  return {
    // OBLIGATORIOS
    title: productoODDY.nombre.substring(0, 60), // Max 60 chars
    category_id: obtenerCategoriaML(productoODDY.categoria),
    price: productoODDY.precio,
    currency_id: productoODDY.ml_moneda || 'UYU',
    available_quantity: productoODDY.stock_disponible,
    buying_mode: productoODDY.ml_modo_compra || 'buy_it_now',
    condition: productoODDY.ml_condicion || 'new',
    listing_type_id: productoODDY.ml_tipo_listado || 'gold_special',
    
    // DESCRIPCIÓN
    description: {
      plain_text: productoODDY.descripcion
    },
    
    // IMÁGENES
    pictures: productoODDY.imagenes.map(url => ({
      source: url
    })),
    
    // VIDEO (si existe)
    ...(productoODDY.ml_video_id && {
      video_id: productoODDY.ml_video_id
    }),
    
    // ATRIBUTOS
    attributes: [
      // Marca
      ...(productoODDY.marca ? [{
        id: 'BRAND',
        value_name: productoODDY.marca
      }] : []),
      
      // Modelo
      ...(productoODDY.ml_modelo ? [{
        id: 'MODEL',
        value_name: productoODDY.ml_modelo
      }] : []),
      
      // Color
      ...(productoODDY.color ? [{
        id: 'COLOR',
        value_name: productoODDY.color
      }] : []),
      
      // Talle
      ...(productoODDY.talle_tamano ? [{
        id: 'SIZE',
        value_name: productoODDY.talle_tamano
      }] : []),
      
      // Material
      ...(productoODDY.material ? [{
        id: 'MATERIAL',
        value_name: productoODDY.material
      }] : []),
    ],
    
    // ENVÍO
    shipping: {
      mode: productoODDY.ml_modo_envio || 'me2',
      free_shipping: productoODDY.envio_gratis || false,
      local_pick_up: productoODDY.ml_retiro_persona || false,
      dimensions: productoODDY.dimensiones 
        ? `${productoODDY.dimensiones.alto}x${productoODDY.dimensiones.ancho}x${productoODDY.dimensiones.profundo}`
        : null,
    },
    
    // GARANTÍA
    ...(productoODDY.garantia && {
      warranty: productoODDY.garantia,
      sale_terms: [{
        id: 'WARRANTY_TIME',
        value_name: productoODDY.garantia
      }]
    }),
  };
}

// Usar en sincronización
async function sincronizarConML(productoODDY, accessToken) {
  const payload = construirPayloadML(productoODDY);
  
  try {
    const response = await fetch('https://api.mercadolibre.com/items', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const mlItem = await response.json();
    
    // Guardar ml_item_id en ODDY
    await actualizarProductoODDY(productoODDY.id, {
      ml_item_id: mlItem.id,
      ml_permalink: mlItem.permalink,
      ml_sincronizado: true,
      ml_ultima_sync: new Date(),
    });
    
    return mlItem;
  } catch (error) {
    console.error('Error sincronizando con ML:', error);
    throw error;
  }
}
```

---

## 🆕 CAMPOS A AGREGAR EN BASE DE DATOS

### Tabla `products` - Campos ML

```sql
-- Campos para sincronización Mercado Libre

ALTER TABLE products ADD COLUMN IF NOT EXISTS
  -- Sincronización
  sincronizar_ml BOOLEAN DEFAULT FALSE,
  ml_item_id VARCHAR(50),              -- ID del item en ML
  ml_permalink TEXT,                   -- URL pública en ML
  ml_sincronizado BOOLEAN DEFAULT FALSE,
  ml_ultima_sync TIMESTAMP,
  
  -- Campos específicos ML
  ml_condicion VARCHAR(10),            -- 'new' o 'used'
  ml_tipo_listado VARCHAR(20),         -- 'gold_special', 'free', etc.
  ml_moneda VARCHAR(3) DEFAULT 'UYU',  -- 'UYU', 'ARS', 'USD', etc.
  ml_modo_compra VARCHAR(20) DEFAULT 'buy_it_now',
  ml_modo_envio VARCHAR(20) DEFAULT 'me2',
  ml_retiro_persona BOOLEAN DEFAULT FALSE,
  ml_modelo VARCHAR(100),
  ml_video_id VARCHAR(20);

-- Índice
CREATE INDEX IF NOT EXISTS idx_ml_item_id 
  ON products(ml_item_id) 
  WHERE ml_item_id IS NOT NULL;
```

---

## 🔄 SINCRONIZACIÓN BIDIRECCIONAL

### ODDY → ML (Ya Cubierto)

```
Usuario edita en ODDY → Sistema actualiza en ML
```

### ML → ODDY (Webhooks)

```javascript
// Endpoint para recibir notificaciones de ML
// POST /webhooks/mercadolibre

app.post('/webhooks/mercadolibre', async (req, res) => {
  const { resource, topic, user_id } = req.body;
  
  // Validar firma de ML
  if (!validarFirmaML(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Procesar según topic
  switch (topic) {
    case 'items':
      // Producto actualizado en ML
      await sincronizarDesdeML(resource);
      break;
      
    case 'orders':
      // Nueva orden en ML
      await procesarOrdenML(resource);
      break;
      
    case 'questions':
      // Nueva pregunta en ML
      await procesarPreguntaML(resource);
      break;
  }
  
  res.status(200).json({ success: true });
});

async function sincronizarDesdeML(itemId) {
  // Obtener producto de ODDY por ml_item_id
  const productoODDY = await obtenerProductoPorMLId(itemId);
  
  if (!productoODDY) return;
  
  // Obtener datos actualizados de ML
  const mlItem = await fetch(
    `https://api.mercadolibre.com/items/${itemId}`
  ).then(r => r.json());
  
  // Actualizar en ODDY
  await actualizarProductoODDY(productoODDY.id, {
    stock_disponible: mlItem.available_quantity,
    precio: mlItem.price,
    ml_ultima_sync: new Date(),
  });
}
```

---

## 📊 DASHBOARD DE SINCRONIZACIÓN

### Vista Propuesta

```
┌────────────────────────────────────────────────────┐
│         SINCRONIZACIÓN MERCADO LIBRE               │
├────────────────────────────────────────────────────┤
│                                                    │
│  📊 ESTADÍSTICAS                                   │
│  ├─ Productos sincronizados:  45 / 120           │
│  ├─ Última sincronización:    hace 5 min         │
│  ├─ Sincronizaciones hoy:     23                 │
│  └─ Errores hoy:              2                  │
│                                                    │
│  ⚠️ PRODUCTOS CON ERRORES (2)                     │
│  ├─ Zapatillas Nike - Error: Categoría inválida │
│  └─ Campera Adidas - Error: Stock = 0           │
│                                                    │
│  🔄 ÚLTIMAS SINCRONIZACIONES                       │
│  ├─ ✅ Remera Puma - Hace 2 min                   │
│  ├─ ✅ Pantalón Levi's - Hace 5 min              │
│  └─ ✅ Zapatillas Reebok - Hace 10 min           │
│                                                    │
│  [Sincronizar Todos] [Configuración ML]          │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## ✅ RESUMEN DE CAMBIOS NECESARIOS

### Nivel Avanzada - Sección ML Nueva

```
Campos a agregar:
✅ Checkbox "Publicar en Mercado Libre"
✅ Condición (nuevo/usado) - Radio buttons
✅ Tipo de Listado - Select
✅ Moneda - Select
✅ Modo de Envío - Radio buttons
✅ Retiro en Persona - Checkbox
✅ Modelo - Input texto
✅ Video ID - Input texto
✅ Estado Sincronización - Display + botón
```

### Base de Datos

```
Campos a agregar:
✅ sincronizar_ml (boolean)
✅ ml_item_id (varchar)
✅ ml_permalink (text)
✅ ml_sincronizado (boolean)
✅ ml_ultima_sync (timestamp)
✅ ml_condicion (varchar)
✅ ml_tipo_listado (varchar)
✅ ml_moneda (varchar)
✅ ml_modo_compra (varchar)
✅ ml_modo_envio (varchar)
✅ ml_retiro_persona (boolean)
✅ ml_modelo (varchar)
✅ ml_video_id (varchar)
```

### Backend

```
Funciones a implementar:
✅ construirPayloadML()
✅ validarParaML()
✅ sincronizarConML()
✅ actualizarEnML()
✅ sincronizarDesdeML()
✅ procesarWebhookML()
✅ obtenerCategoriaML()
```

---

## ⏱️ IMPACTO EN ESTIMACIÓN

### Sincronización ML Completa

```
Análisis de requisitos:      0.5 días ✅ (hecho)
Backend - Campos ML:         0.5 días
Backend - Sincronización:    1.5 días
Frontend - Sección ML:       1 día
Testing sincronización:      1 día
Webhooks bidireccionales:    1 día (opcional fase 2)
Mapeo de categorías:         0.5 días

TOTAL: +5 días

ESTIMACIÓN ACTUALIZADA:
- Sin ML: 14-18 días
- Con ML: 19-23 días
```

---

## 💡 OTRAS INTEGRACIONES

### Facebook Marketplace & Instagram Shopping

Campos similares necesarios:
```
✅ Condición (nuevo/usado)
✅ Marca
✅ Categoría (mapeo diferente)
✅ Imágenes (mínimo 1)
✅ Precio
✅ Disponibilidad
✅ Descripción
✅ URL producto
```

**Buena noticia**: Muchos campos overlap con ML  
**Estrategia**: Diseño genérico de "Canales de Venta"

---

## 🎯 RECOMENDACIÓN

### Implementación por Fases

**FASE 1: MVP (Semana 1-4)**
```
✅ Campos básicos + intermedia + avanzada
✅ Checkbox "Sincronizar ML" (básico)
✅ Sincronización manual one-way (ODDY → ML)
❌ Sin webhooks
❌ Sin sincronización automática
```

**FASE 2: Sync Avanzada (Semana 5)**
```
✅ Sincronización automática
✅ Webhooks ML → ODDY
✅ Dashboard de sincronización
✅ Manejo de errores robusto
```

**FASE 3: Multi-Canal (Semana 6+)**
```
✅ Facebook Marketplace
✅ Instagram Shopping
✅ Sincronización unificada
```

---

## 💬 RESUMEN

### Campos Críticos para ML:

```
NUEVOS (Nivel Avanzada):
✅ Condición (nuevo/usado)
✅ Tipo de Listado
✅ Moneda
✅ Modo de Envío
✅ Retiro en Persona
✅ Modelo
✅ Video ID

YA EXISTEN (varios niveles):
✅ Título, Precio, Descripción
✅ Categoría, Imágenes
✅ Stock, Marca, Peso, Dimensiones
✅ Garantía, Color, Talle, Material
```

### Complejidad:

```
+5 días para sincronización ML completa
+3 días para cada canal adicional (FB, IG)
```

---

## 🎯 PRÓXIMO PASO

**¿Incluimos campos de ML en el diseño?** ✅  
**¿Implementamos sync básica en Fase 1?** 🎯  
**¿O lo dejamos para Fase 2?** 🤔

**Documento completo:**  
📄 **`SINCRONIZACION_MERCADOLIBRE_REQUISITOS.md`**
