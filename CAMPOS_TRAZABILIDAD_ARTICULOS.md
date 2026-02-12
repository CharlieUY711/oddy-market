# 🔬 CAMPOS DE TRAZABILIDAD - Módulo Artículos

**Fecha**: 12 de Febrero, 2026  
**Actualización**: Campos críticos de trazabilidad agregados

---

## 🆕 CAMPOS NUEVOS IDENTIFICADOS

El usuario ha solicitado agregar campos **CRÍTICOS** de trazabilidad que son esenciales para:
- ✅ Productos alimenticios
- ✅ Productos farmacéuticos
- ✅ Productos con vencimiento
- ✅ Control de calidad
- ✅ Cumplimiento regulatorio
- ✅ Trazabilidad completa

---

## 📦 CAMPOS DE TRAZABILIDAD (Nivel Intermedia)

### 1. **Lote** 📦
```
Campo: lote
Tipo: String
Obligatorio: Condicional (si producto tiene vencimiento)
Ejemplo: "LOTE-2026-001", "L20260212", "BATCH-ABC123"

Uso:
- Identificar origen del producto
- Rastrear problemas de calidad
- Recalls de productos
- Control de inventario por lote
```

### 2. **Fecha de Elaboración** 🏭
```
Campo: fecha_elaboracion
Tipo: Date
Obligatorio: Condicional (productos elaborados)
Ejemplo: 2026-01-15

Uso:
- Control de frescura
- Cálculo de vida útil
- Auditorías de calidad
- Trazabilidad de producción
```

### 3. **Fecha de Compra** 📅
```
Campo: fecha_compra
Tipo: Date
Obligatorio: Opcional
Ejemplo: 2026-02-10

Uso:
- Control FIFO (First In, First Out)
- Rotación de inventario
- Análisis de costos
- Gestión de proveedores
```

### 4. **Proveedor** 🏢
```
Campo: proveedor
Tipo: String o Relación a tabla proveedores
Obligatorio: Opcional
Ejemplo: "Distribuidora XYZ S.A.", "Proveedor-001"

Uso:
- Trazabilidad de origen
- Gestión de proveedores
- Calidad por proveedor
- Negociaciones
- Auditorías

NOTA: Este campo YA EXISTE en Nivel Avanzada, pero es más crítico
para trazabilidad → MOVER a Nivel Intermedia
```

### 5. **Fecha de Vencimiento** ⚠️
```
Campo: fecha_vencimiento
Tipo: Date
Obligatorio: Condicional (productos perecederos)
Ejemplo: 2026-06-30

Uso:
- Alertas de vencimiento cercano
- Prevención de ventas vencidas
- Cumplimiento legal
- Rotación FEFO (First Expired, First Out)
- Gestión de descuentos por proximidad
```

---

## 🎯 UBICACIÓN EN LOS 3 NIVELES

### Propuesta de Re-organización:

```
┌────────────────────────────────────────────────────┐
│                  NIVEL INTERMEDIA                  │
│          INVENTARIO, LOGÍSTICA Y TRAZABILIDAD      │
├────────────────────────────────────────────────────┤
│                                                    │
│  📦 INVENTARIO BÁSICO                              │
│  ├─ SKU                                           │
│  ├─ Código de Barras                              │
│  ├─ Marca                                         │
│  ├─ Stock Disponible                              │
│  ├─ Stock Mínimo                                  │
│  ├─ Peso (kg)                                     │
│  ├─ Dimensiones (cm)                              │
│  ├─ Etiquetas                                     │
│  └─ Descuento (%)                                 │
│                                                    │
│  🔬 TRAZABILIDAD (Opcional, se muestra si se activa)│
│  ├─ 📦 Lote                                       │
│  ├─ 🏭 Fecha de Elaboración                       │
│  ├─ 📅 Fecha de Compra                            │
│  ├─ 🏢 Proveedor                                  │
│  └─ ⚠️ Fecha de Vencimiento                       │
│                                                    │
│  [☐ Este producto requiere trazabilidad]         │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Diseño UI propuesto:**
- Checkbox: "Este producto requiere trazabilidad"
- Si NO se activa: campos de trazabilidad ocultos
- Si SÍ se activa: campos de trazabilidad se muestran
- Esto mantiene la simplicidad para productos que no lo necesitan

---

## 👥 NUEVOS CASOS DE USO CON TRAZABILIDAD

### 🍎 Usuario 4: Comercio de Alimentos
```
Perfil:
- Vende productos frescos y envasados
- Regulaciones sanitarias estrictas
- Control de fechas crítico
- Necesita alertas de vencimiento

Necesita:
✅ Lote → Identificar remesas
✅ Fecha Elaboración → Control de frescura
✅ Fecha Compra → FIFO (primero que entra, primero que sale)
✅ Proveedor → Responsabilidad sanitaria
✅ Fecha Vencimiento → Prevención legal + alertas

Flujo:
1. Básica completa
2. Intermedia con TRAZABILIDAD ACTIVADA
3. Sistema genera alertas:
   - 30 días antes: Alerta amarilla
   - 15 días antes: Alerta naranja
   - 7 días antes: Alerta roja
   - Vencido: Bloqueo de venta

Ejemplos:
- Supermercado
- Tienda de productos orgánicos
- Carnicería
- Panadería
- Lácteos
```

### 💊 Usuario 5: Farmacia
```
Perfil:
- Vende medicamentos
- Regulaciones MUY estrictas
- Trazabilidad obligatoria por ley
- Control de lotes crítico

Necesita:
✅ Lote → Obligatorio por ley
✅ Fecha Elaboración → Control fabricante
✅ Fecha Compra → Auditorías
✅ Proveedor → Licencias y permisos
✅ Fecha Vencimiento → CRÍTICO (legal)

Flujo:
1. Básica completa
2. Intermedia con TRAZABILIDAD OBLIGATORIA
3. Sistema BLOQUEA venta si:
   - No tiene lote
   - No tiene fecha vencimiento
   - Producto vencido
4. Reportes para auditorías sanitarias

Ejemplos:
- Farmacia
- Droguería
- Distribuidor farmacéutico
```

### 💄 Usuario 6: Cosméticos y Belleza
```
Perfil:
- Productos con vencimiento (cremas, maquillaje)
- Control de calidad importante
- Marcas variadas

Necesita:
✅ Lote → Identificar batch de producción
✅ Fecha Elaboración → Vida útil del producto
✅ Fecha Vencimiento → Calidad y seguridad
✅ Proveedor → Marca/Distribuidor

Flujo:
1. Básica completa
2. Intermedia con trazabilidad parcial:
   - Lote (si marca lo provee)
   - Fecha Vencimiento (obligatorio)
   - Proveedor (para garantías)

Ejemplos:
- Perfumería
- Tienda de cosméticos
- Beauty supply
```

### 🍷 Usuario 7: Bebidas y Licores
```
Perfil:
- Productos con fecha de vencimiento
- Control de lotes para recalls
- Regulaciones de edad del consumidor

Necesita:
✅ Lote → Batch de producción
✅ Fecha Elaboración → Año de cosecha (vinos)
✅ Fecha Vencimiento → Aunque sea largo plazo
✅ Proveedor → Importador/Distribuidor

Flujo:
1. Básica completa
2. Intermedia con trazabilidad activada
3. Verificación de edad en venta (separado)

Ejemplos:
- Licorería
- Vinoteca
- Distribuidora de bebidas
```

---

## ⚠️ ALERTAS Y NOTIFICACIONES AUTOMÁTICAS

### Sistema de Alertas por Vencimiento

```typescript
// Lógica de alertas propuesta

interface AlertaVencimiento {
  nivel: 'info' | 'warning' | 'danger' | 'critical';
  diasRestantes: number;
  accion: string;
}

function calcularAlerta(fechaVencimiento: Date): AlertaVencimiento {
  const hoy = new Date();
  const diasRestantes = Math.floor(
    (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diasRestantes < 0) {
    return {
      nivel: 'critical',
      diasRestantes,
      accion: 'BLOQUEAR VENTA - Producto vencido'
    };
  } else if (diasRestantes <= 7) {
    return {
      nivel: 'danger',
      diasRestantes,
      accion: 'Retirar de góndola - Vencimiento inminente'
    };
  } else if (diasRestantes <= 15) {
    return {
      nivel: 'warning',
      diasRestantes,
      accion: 'Aplicar descuento - Vencimiento próximo'
    };
  } else if (diasRestantes <= 30) {
    return {
      nivel: 'info',
      diasRestantes,
      accion: 'Monitorear - Vencimiento en 1 mes'
    };
  }

  return {
    nivel: 'info',
    diasRestantes,
    accion: 'OK'
  };
}
```

### Dashboard de Vencimientos

```
┌────────────────────────────────────────┐
│      PRODUCTOS POR VENCER              │
├────────────────────────────────────────┤
│                                        │
│  🔴 VENCIDOS (0)                       │
│  🟠 VENCEN EN 7 DÍAS (3)               │
│  🟡 VENCEN EN 15 DÍAS (8)              │
│  🔵 VENCEN EN 30 DÍAS (15)             │
│                                        │
│  📊 Ver detalles →                     │
│                                        │
└────────────────────────────────────────┘
```

---

## 📊 ROTACIÓN DE INVENTARIO

### Estrategias Soportadas

#### 1. **FIFO (First In, First Out)**
```
Basado en: Fecha de Compra
Lógica: Vender primero lo que se compró primero
Uso: Productos con vencimiento

Sistema ordena productos por:
1. Fecha de Compra (ascendente)
2. Fecha de Vencimiento (ascendente)
```

#### 2. **FEFO (First Expired, First Out)**
```
Basado en: Fecha de Vencimiento
Lógica: Vender primero lo que vence primero
Uso: Productos perecederos críticos

Sistema ordena productos por:
1. Fecha de Vencimiento (ascendente)
2. Fecha de Compra (ascendente)
```

#### 3. **LIFO (Last In, First Out)**
```
Basado en: Fecha de Compra
Lógica: Vender primero lo más nuevo
Uso: Productos sin vencimiento, moda

Sistema ordena productos por:
1. Fecha de Compra (descendente)
```

---

## 🔍 REPORTES DE TRAZABILIDAD

### Reportes Necesarios

#### 1. **Reporte de Vencimientos**
```
Columnas:
- Producto
- Lote
- Fecha Vencimiento
- Días Restantes
- Stock
- Valor Total
- Acción Recomendada
```

#### 2. **Reporte por Lote**
```
Input: Número de lote
Output:
- Productos en ese lote
- Fecha elaboración
- Fecha vencimiento
- Proveedor
- Stock actual
- Ubicaciones (si multi-almacén)
```

#### 3. **Reporte de Proveedores**
```
Columnas:
- Proveedor
- Productos activos
- Lotes en stock
- Próximos vencimientos
- Histórico de calidad
```

#### 4. **Reporte de Auditoría**
```
Para regulaciones:
- Todos los productos con vencimiento
- Historial de movimientos por lote
- Fechas de entrada/salida
- Stock actual vs registrado
- Productos retirados (recalls)
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Actualización de Schema

```sql
-- Agregar campos de trazabilidad a la tabla products

ALTER TABLE products ADD COLUMN IF NOT EXISTS
  lote VARCHAR(100),
  fecha_elaboracion DATE,
  fecha_compra DATE,
  fecha_vencimiento DATE,
  requiere_trazabilidad BOOLEAN DEFAULT FALSE;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fecha_vencimiento 
  ON products(fecha_vencimiento) 
  WHERE fecha_vencimiento IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lote 
  ON products(lote) 
  WHERE lote IS NOT NULL;

-- Tabla de alertas de vencimiento (opcional, para histórico)
CREATE TABLE IF NOT EXISTS alertas_vencimiento (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  nivel VARCHAR(20), -- 'info', 'warning', 'danger', 'critical'
  dias_restantes INTEGER,
  fecha_alerta TIMESTAMP DEFAULT NOW(),
  accion_tomada VARCHAR(500),
  usuario_id BIGINT
);
```

---

## ✅ ACTUALIZACIÓN DEL GAP ANALYSIS

### 🟡 NIVEL 2: INTERMEDIA - Gap Analysis ACTUALIZADO

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
│                        │          │            │
│ TRAZABILIDAD:          │          │            │
│ - Lote                 │    ❌    │     ✅     │
│ - Fecha Elaboración    │    ❌    │     ✅     │
│ - Fecha Compra         │    ❌    │     ✅     │
│ - Proveedor            │   🔄    │     ✅     │
│ - Fecha Vencimiento    │    ❌    │     ✅     │
├────────────────────────┼──────────┼────────────┤
│ STATUS NIVEL INTERM.   │  🟡 65%  │            │
└────────────────────────┴──────────┴────────────┘

GAPS CRÍTICOS:
1. ❌ Lote - Campo nuevo (CRÍTICO)
2. ❌ Fecha Elaboración - Campo nuevo (CRÍTICO)
3. ❌ Fecha Compra - Campo nuevo (IMPORTANTE)
4. 🔄 Proveedor - Mover de Avanzada a Intermedia
5. ❌ Fecha Vencimiento - Campo nuevo (CRÍTICO)
6. ❌ Stock Mínimo - Campo nuevo (IMPORTANTE)

GAPS MENORES:
7. 🟡 Código de Barras - Mejorar validación
8. 🟡 Marca - Mejorar UI
```

---

## 📋 LISTA DE TAREAS ACTUALIZADA

### 🔴 PRIORIDAD CRÍTICA (Bloqueantes)

**Backend:**
1. [ ] Agregar campo `lote` (VARCHAR)
2. [ ] Agregar campo `fecha_elaboracion` (DATE)
3. [ ] Agregar campo `fecha_compra` (DATE)
4. [ ] Agregar campo `fecha_vencimiento` (DATE)
5. [ ] Agregar campo `requiere_trazabilidad` (BOOLEAN)
6. [ ] Agregar campo `stock_minimo` (INTEGER)
7. [ ] Mover campo `proveedor` de avanzada a intermedia
8. [ ] Crear índices para fechas
9. [ ] Actualizar validaciones

**Frontend:**
10. [ ] Checkbox "Requiere trazabilidad" en Nivel Intermedia
11. [ ] Campos de trazabilidad (ocultos por defecto)
12. [ ] Date pickers para fechas
13. [ ] Validaciones condicionales
14. [ ] Indicadores visuales de vencimiento

**Lógica de Negocio:**
15. [ ] Sistema de alertas de vencimiento
16. [ ] Cálculo de días restantes
17. [ ] Bloqueo de venta para productos vencidos
18. [ ] Dashboard de vencimientos
19. [ ] Reportes de trazabilidad

---

## ⏱️ ESTIMACIÓN ACTUALIZADA

### Con Campos de Trazabilidad:

```
Semana 1: Backend + Básica           (3-4 días)
  ├─ Backend con trazabilidad         (2 días) ⬆️ +1 día
  └─ Frontend Básica                  (1-2 días)

Semana 2: Intermedia + Trazabilidad  (4-5 días) ⬆️ +1 día
  ├─ Frontend Intermedia              (2 días)
  ├─ Campos de trazabilidad           (1-2 días) 🆕
  └─ Sistema de alertas               (1 día) 🆕

Semana 3: Avanzada + Catálogo        (4-5 días)
  ├─ Frontend Avanzada                (2 días)
  ├─ Catálogo                         (2 días)
  └─ Dashboard vencimientos           (1 día) 🆕

Semana 4: Testing + Deploy           (3-4 días) ⬆️ +1 día
  ├─ Testing exhaustivo               (2 días)
  ├─ Testing trazabilidad             (1 día) 🆕
  └─ Deploy                           (1 día)

TOTAL: 14-18 días laborables (antes: 12-15 días)
```

---

## 💎 VALOR AGREGADO DE LA TRAZABILIDAD

### Beneficios:

1. **Cumplimiento Legal** ✅
   - Regulaciones sanitarias
   - Auditorías gubernamentales
   - Evitar multas

2. **Control de Calidad** ✅
   - Identificar lotes problemáticos
   - Recalls eficientes
   - Responsabilidad de proveedor

3. **Gestión Inteligente** ✅
   - FIFO/FEFO automático
   - Alertas proactivas
   - Reducción de pérdidas

4. **Confianza del Cliente** ✅
   - Transparencia
   - Productos frescos
   - Seguridad alimentaria

5. **Optimización Financiera** ✅
   - Menos productos vencidos
   - Descuentos estratégicos
   - Mejor rotación

---

## 💬 RESUMEN

### Campos de Trazabilidad Agregados:

```
✅ Lote               → Identificación batch
✅ Fecha Elaboración  → Control de frescura
✅ Fecha Compra       → FIFO/FEFO
✅ Proveedor          → Responsabilidad (movido)
✅ Fecha Vencimiento  → Alertas críticas
```

### Usuarios que lo Necesitan:

```
🍎 Alimentos
💊 Farmacia
💄 Cosméticos
🍷 Bebidas
🥩 Carnicería
🥖 Panadería
🥛 Lácteos
🌿 Productos orgánicos
```

### Complejidad Adicional:

```
Backend:   +1 día
Frontend:  +2-3 días
Testing:   +1 día
TOTAL:     +4-5 días (14-18 días totales)
```

---

**¿Aprobamos la inclusión de campos de trazabilidad en el Nivel Intermedia?** ✅

**¿Empezamos con la implementación?** 🚀
