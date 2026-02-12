# 🌐 Módulo SYSTEM - Definiciones Globales

**Archivo**: `supabase/functions/server/system.tsx`  
**Líneas de código**: ~850

---

## 📋 Descripción General

El módulo **SYSTEM** es el **corazón de las definiciones globales** de ODDY Market. Centraliza toda la configuración relacionada con:

- ✅ **Impuestos por país** (IVA, IEPS, ICMS, etc.)
- ✅ **Monedas y tasas de cambio**
- ✅ **Unidades de medida** (peso, longitud, volumen)
- ✅ **Configuración del sistema**
- ✅ **Cálculos automáticos**

Este módulo es **crítico** porque:
1. **Evita hardcodear valores** en otros módulos
2. **Facilita multi-territorio** (8+ países soportados)
3. **Permite personalización** por entidad
4. **Automatiza cálculos** fiscales y conversiones

---

## 🌎 Impuestos Soportados (8 Países)

### 1️⃣ **Uruguay**
- ✅ IVA Básico (22%)
- ✅ IVA Mínimo (10%)

### 2️⃣ **Argentina**
- ✅ IVA General (21%)
- ✅ IVA Reducido (10.5%)
- ✅ IIBB (5%)

### 3️⃣ **Brasil**
- ✅ ICMS (18%)
- ✅ PIS (1.65%)
- ✅ COFINS (7.6%)

### 4️⃣ **Chile**
- ✅ IVA (19%)

### 5️⃣ **Perú**
- ✅ IGV (18%)
- ✅ IPM (2%)

### 6️⃣ **México**
- ✅ IVA (16%)
- ✅ IVA Frontera (8%)
- ✅ IEPS (8%)

### 7️⃣ **Colombia**
- ✅ IVA (19%)
- ✅ IVA Reducido (5%)

### 8️⃣ **Ecuador**
- ✅ IVA (12%)

**BONUS: Estados Unidos**
- ✅ California Sales Tax (7.25%)
- ✅ New York Sales Tax (4%)
- ✅ Texas Sales Tax (6.25%)

---

## 💱 Monedas Soportadas

| Código | Nombre | Símbolo | Decimales |
|--------|--------|---------|-----------|
| USD | US Dollar | $ | 2 |
| EUR | Euro | € | 2 |
| UYU | Peso Uruguayo | $ | 2 |
| ARS | Peso Argentino | $ | 2 |
| BRL | Real Brasileño | R$ | 2 |
| CLP | Peso Chileno | $ | 0 |
| PEN | Sol Peruano | S/ | 2 |
| MXN | Peso Mexicano | $ | 2 |
| COP | Peso Colombiano | $ | 0 |

---

## 📏 Unidades de Medida

### **Peso**
- kg, g, lb, oz

### **Longitud**
- m, cm, mm, in, ft

### **Volumen**
- l, ml, gal

Cada unidad tiene su **factor de conversión** a la unidad base.

---

## 🔧 Endpoints Implementados (13)

### **1. Obtener Impuestos**
```bash
GET /make-server-0dd48dc4/system/taxes
GET /make-server-0dd48dc4/system/taxes?country=UY
```

### **2. Configurar Impuestos Personalizados**
```bash
POST /make-server-0dd48dc4/system/taxes/configure
```

**Body:**
```json
{
  "entity_id": "default",
  "primary_country": "UY",
  "custom_taxes": {
    "IVA_ESPECIAL": {
      "name": "IVA Especial",
      "rate": 0.15,
      "type": "vat",
      "applies_to": ["digital_services"]
    }
  },
  "rules": {
    "tax_by_customer_location": true,
    "tax_by_product_category": true,
    "tax_exempt_parties": ["party:123"],
    "tax_exempt_categories": ["books", "education"]
  }
}
```

### **3. Calcular Impuestos**
```bash
POST /make-server-0dd48dc4/system/taxes/calculate
```

**Body:**
```json
{
  "amount": 1000,
  "country": "UY",
  "product_category": "goods",
  "entity_id": "default"
}
```

**Respuesta:**
```json
{
  "calculation": {
    "subtotal": 1000,
    "taxes": [
      {
        "tax_key": "IVA_BASICO",
        "name": "IVA Básico",
        "rate": 0.22,
        "amount": 220,
        "type": "vat"
      }
    ],
    "total_tax": 220,
    "total": 1220,
    "currency": "UYU"
  }
}
```

### **4. Obtener Monedas**
```bash
GET /make-server-0dd48dc4/system/currencies
```

### **5. Configurar Tasas de Cambio**
```bash
POST /make-server-0dd48dc4/system/exchange-rates
```

**Body:**
```json
{
  "entity_id": "default",
  "base_currency": "USD",
  "rates": {
    "UYU": 40.5,
    "ARS": 350,
    "BRL": 5.2,
    "EUR": 0.92
  },
  "source": "manual",
  "valid_from": "2026-02-12T00:00:00Z"
}
```

### **6. Obtener Tasas de Cambio**
```bash
GET /make-server-0dd48dc4/system/exchange-rates?entity_id=default
```

### **7. Convertir Moneda**
```bash
POST /make-server-0dd48dc4/system/convert-currency
```

**Body:**
```json
{
  "amount": 100,
  "from_currency": "USD",
  "to_currency": "UYU",
  "entity_id": "default"
}
```

**Respuesta:**
```json
{
  "conversion": {
    "amount": 100,
    "from_currency": "USD",
    "to_currency": "UYU",
    "converted_amount": 4050,
    "rate": 40.5
  }
}
```

### **8. Obtener Unidades de Medida**
```bash
GET /make-server-0dd48dc4/system/units
GET /make-server-0dd48dc4/system/units?type=weight
```

### **9. Convertir Unidades**
```bash
POST /make-server-0dd48dc4/system/convert-unit
```

**Body:**
```json
{
  "value": 5,
  "from_unit": "kg",
  "to_unit": "lb",
  "unit_type": "weight"
}
```

**Respuesta:**
```json
{
  "conversion": {
    "value": 5,
    "from_unit": "kg",
    "to_unit": "lb",
    "converted_value": 11.023
  }
}
```

### **10. Configurar Sistema**
```bash
POST /make-server-0dd48dc4/system/config
```

**Body:**
```json
{
  "entity_id": "default",
  "regional": {
    "default_country": "UY",
    "default_currency": "USD",
    "default_language": "es",
    "default_timezone": "America/Montevideo"
  },
  "business": {
    "name": "ODDY Market",
    "tax_id": "123456789",
    "address": {
      "street": "Av. Principal 123",
      "city": "Montevideo",
      "country": "UY"
    },
    "phone": "+598 99 123 456",
    "email": "contact@oddymarket.com",
    "website": "https://oddymarket.com"
  },
  "pricing": {
    "include_tax": true,
    "round_prices": true,
    "decimal_places": 2
  },
  "inventory": {
    "track_stock": true,
    "allow_negative_stock": false,
    "low_stock_threshold": 10
  }
}
```

### **11. Obtener Configuración**
```bash
GET /make-server-0dd48dc4/system/config?entity_id=default
```

---

## 🎯 Casos de Uso

### **Caso 1: Calcular Precio con IVA en Uruguay**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/taxes/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "country": "UY",
    "product_category": "goods"
  }'
```

### **Caso 2: Convertir USD a Peso Uruguayo**

```bash
# 1. Configurar tasa de cambio
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/exchange-rates \
  -H "Content-Type: application/json" \
  -d '{
    "base_currency": "USD",
    "rates": { "UYU": 40.5 }
  }'

# 2. Convertir moneda
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/convert-currency \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "from_currency": "USD",
    "to_currency": "UYU"
  }'
```

### **Caso 3: Convertir Kilogramos a Libras**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/convert-unit \
  -H "Content-Type: application/json" \
  -d '{
    "value": 5,
    "from_unit": "kg",
    "to_unit": "lb",
    "unit_type": "weight"
  }'
```

### **Caso 4: Configurar Impuestos Personalizados**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/taxes/configure \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "default",
    "primary_country": "UY",
    "custom_taxes": {
      "IVA_LIBROS": {
        "name": "IVA para Libros",
        "rate": 0.0,
        "type": "vat",
        "applies_to": ["books"]
      }
    },
    "rules": {
      "tax_exempt_categories": ["books", "education"]
    }
  }'
```

---

## 🏗️ Arquitectura

### **Definiciones Estáticas**
Las definiciones de impuestos, monedas y unidades están **hardcodeadas** en el código porque:
- ✅ Son datos oficiales (no cambian frecuentemente)
- ✅ Mejora el rendimiento (sin consultas a DB)
- ✅ Simplifica el mantenimiento
- ✅ Facilita actualizaciones via código

### **Configuraciones Dinámicas**
Las configuraciones personalizadas (tasas de cambio, reglas fiscales, config del sistema) se almacenan en **Deno KV**:
- ✅ Cada entidad tiene su configuración
- ✅ Se puede sobrescribir defaults
- ✅ Histórico de cambios

---

## 🔐 Seguridad

- ✅ **Multi-tenant**: Cada entidad tiene su propia configuración
- ✅ **Sin hardcodeo**: Los valores no están dispersos en el código
- ✅ **Validación**: Se valida que país, moneda, unidad existan
- ✅ **Trazabilidad**: Se registra cuándo se cambian las tasas

---

## 📊 Integración con Otros Módulos

### **billing.tsx**
```typescript
// Calcular impuestos automáticamente
const taxCalc = await fetch("/make-server-0dd48dc4/system/taxes/calculate", {
  method: "POST",
  body: JSON.stringify({
    amount: invoice.subtotal,
    country: customer.country,
    product_category: "goods",
  })
});
```

### **products.tsx**
```typescript
// Convertir precio de USD a moneda local
const conversion = await fetch("/make-server-0dd48dc4/system/convert-currency", {
  method: "POST",
  body: JSON.stringify({
    amount: product.price_usd,
    from_currency: "USD",
    to_currency: customer.currency,
  })
});
```

### **shipping.tsx**
```typescript
// Convertir peso de kg a lb
const weightConversion = await fetch("/make-server-0dd48dc4/system/convert-unit", {
  method: "POST",
  body: JSON.stringify({
    value: package.weight_kg,
    from_unit: "kg",
    to_unit: "lb",
    unit_type: "weight",
  })
});
```

---

## 🚀 Próximos Pasos

1. ✅ **Probar módulo system**
2. ⚪ Integrar con `billing.tsx`
3. ⚪ Agregar más países (Paraguay, Venezuela, Bolivia)
4. ⚪ Automatizar tasas de cambio (API externa)
5. ⚪ Dashboard de configuración

---

## 📝 Resumen Técnico

| Característica | Detalle |
|----------------|---------|
| **Archivo** | `supabase/functions/server/system.tsx` |
| **Líneas** | ~850 |
| **Endpoints** | 13 |
| **Países** | 8 + USA |
| **Monedas** | 9 |
| **Unidades** | 3 tipos (peso, longitud, volumen) |
| **Storage** | Deno KV |

---

**¡El módulo SYSTEM centraliza toda la configuración global de ODDY Market! 🌐**
