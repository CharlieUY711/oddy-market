# 🧪 Pruebas Rápidas - Módulo SYSTEM

**Fecha**: 12 de febrero de 2026  
**Módulo**: `supabase/functions/server/system.tsx`

---

## ⚡ Inicio Rápido

### **1. Iniciar el Servidor**

**Windows:**
```bash
start-server.bat
```

**Mac/Linux:**
```bash
cd supabase/functions
deno run --allow-all --watch server/index.tsx
```

El servidor estará en: **http://localhost:8000**

---

## 🧪 Batería de Pruebas

### **✅ Test 1: Obtener Todos los Impuestos**

```bash
curl http://localhost:8000/make-server-0dd48dc4/system/taxes
```

**✅ Respuesta esperada:**
```json
{
  "taxes": {
    "UY": { "country": "Uruguay", "currency": "UYU", "taxes": {...} },
    "AR": { "country": "Argentina", "currency": "ARS", "taxes": {...} },
    ...
  }
}
```

---

### **✅ Test 2: Obtener Impuestos de Uruguay**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/system/taxes?country=UY"
```

**✅ Respuesta esperada:**
```json
{
  "taxes": {
    "country": "Uruguay",
    "currency": "UYU",
    "taxes": {
      "IVA_BASICO": {
        "name": "IVA Básico",
        "rate": 0.22,
        "type": "vat",
        "applies_to": ["goods", "services"]
      },
      "IVA_MINIMO": {
        "name": "IVA Mínimo",
        "rate": 0.10,
        "type": "vat",
        "applies_to": ["food", "medicine", "books"]
      }
    }
  }
}
```

---

### **✅ Test 3: Calcular IVA en Uruguay (22%)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/taxes/calculate \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 1000, \"country\": \"UY\", \"product_category\": \"goods\"}"
```

**✅ Respuesta esperada:**
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

---

### **✅ Test 4: Calcular IVA Mínimo (10%) para Alimentos**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/taxes/calculate \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 1000, \"country\": \"UY\", \"product_category\": \"food\"}"
```

**✅ Respuesta esperada:**
```json
{
  "calculation": {
    "subtotal": 1000,
    "taxes": [
      {
        "tax_key": "IVA_MINIMO",
        "name": "IVA Mínimo",
        "rate": 0.10,
        "amount": 100,
        "type": "vat"
      }
    ],
    "total_tax": 100,
    "total": 1100,
    "currency": "UYU"
  }
}
```

---

### **✅ Test 5: Calcular IVA en Argentina (21%)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/taxes/calculate \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 1000, \"country\": \"AR\", \"product_category\": \"goods\"}"
```

**✅ Respuesta esperada:**
```json
{
  "calculation": {
    "subtotal": 1000,
    "taxes": [
      {
        "tax_key": "IVA_GENERAL",
        "name": "IVA General",
        "rate": 0.21,
        "amount": 210,
        "type": "vat"
      },
      {
        "tax_key": "IIBB",
        "name": "Ingresos Brutos",
        "rate": 0.05,
        "amount": 50,
        "type": "provincial"
      }
    ],
    "total_tax": 260,
    "total": 1260,
    "currency": "ARS"
  }
}
```

---

### **✅ Test 6: Obtener Todas las Monedas**

```bash
curl http://localhost:8000/make-server-0dd48dc4/system/currencies
```

**✅ Respuesta esperada:**
```json
{
  "currencies": {
    "USD": { "name": "US Dollar", "symbol": "$", "decimals": 2 },
    "EUR": { "name": "Euro", "symbol": "€", "decimals": 2 },
    "UYU": { "name": "Peso Uruguayo", "symbol": "$", "decimals": 2 },
    ...
  }
}
```

---

### **✅ Test 7: Configurar Tasas de Cambio**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/exchange-rates \
  -H "Content-Type: application/json" \
  -d "{\"entity_id\": \"default\", \"base_currency\": \"USD\", \"rates\": {\"UYU\": 40.5, \"ARS\": 350, \"BRL\": 5.2, \"EUR\": 0.92}}"
```

**✅ Respuesta esperada:**
```json
{
  "rate": {
    "id": "exchange-rate:default:...",
    "entity_id": "default",
    "base_currency": "USD",
    "rates": {
      "UYU": 40.5,
      "ARS": 350,
      "BRL": 5.2,
      "EUR": 0.92
    },
    "source": "manual",
    "valid_from": "2026-02-12T...",
    "valid_until": null,
    "created_at": "2026-02-12T..."
  },
  "message": "Exchange rates saved successfully"
}
```

---

### **✅ Test 8: Obtener Tasas de Cambio**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/system/exchange-rates?entity_id=default"
```

**✅ Respuesta esperada:**
```json
{
  "exchange_rates": {
    "id": "exchange-rate:default:...",
    "base_currency": "USD",
    "rates": {
      "UYU": 40.5,
      "ARS": 350,
      "BRL": 5.2,
      "EUR": 0.92
    }
  }
}
```

---

### **✅ Test 9: Convertir USD a Peso Uruguayo**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/convert-currency \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 100, \"from_currency\": \"USD\", \"to_currency\": \"UYU\", \"entity_id\": \"default\"}"
```

**✅ Respuesta esperada:**
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

---

### **✅ Test 10: Convertir Peso Uruguayo a Peso Argentino**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/convert-currency \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 1000, \"from_currency\": \"UYU\", \"to_currency\": \"ARS\", \"entity_id\": \"default\"}"
```

**✅ Respuesta esperada:**
```json
{
  "conversion": {
    "amount": 1000,
    "from_currency": "UYU",
    "to_currency": "ARS",
    "converted_amount": 8642.86,
    "rate": 8.6429
  }
}
```

---

### **✅ Test 11: Obtener Unidades de Peso**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/system/units?type=weight"
```

**✅ Respuesta esperada:**
```json
{
  "units": {
    "kg": { "name": "Kilogramo", "symbol": "kg", "base": 1 },
    "g": { "name": "Gramo", "symbol": "g", "base": 0.001 },
    "lb": { "name": "Libra", "symbol": "lb", "base": 0.453592 },
    "oz": { "name": "Onza", "symbol": "oz", "base": 0.0283495 }
  }
}
```

---

### **✅ Test 12: Convertir Kilogramos a Libras**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/convert-unit \
  -H "Content-Type: application/json" \
  -d "{\"value\": 5, \"from_unit\": \"kg\", \"to_unit\": \"lb\", \"unit_type\": \"weight\"}"
```

**✅ Respuesta esperada:**
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

---

### **✅ Test 13: Configurar Sistema**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/config \
  -H "Content-Type: application/json" \
  -d "{\"entity_id\": \"default\", \"regional\": {\"default_country\": \"UY\", \"default_currency\": \"USD\", \"default_language\": \"es\"}, \"business\": {\"name\": \"ODDY Market\", \"tax_id\": \"123456789\"}, \"pricing\": {\"include_tax\": true}, \"inventory\": {\"track_stock\": true}}"
```

**✅ Respuesta esperada:**
```json
{
  "config": {
    "id": "system-config:default",
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
      ...
    },
    ...
  },
  "message": "System configuration saved successfully"
}
```

---

### **✅ Test 14: Obtener Configuración del Sistema**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/system/config?entity_id=default"
```

---

### **✅ Test 15: Configurar Impuestos Personalizados**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/taxes/configure \
  -H "Content-Type: application/json" \
  -d "{\"entity_id\": \"default\", \"primary_country\": \"UY\", \"custom_taxes\": {\"IVA_LIBROS\": {\"name\": \"IVA para Libros\", \"rate\": 0.0, \"type\": \"vat\", \"applies_to\": [\"books\"]}}, \"rules\": {\"tax_exempt_categories\": [\"books\", \"education\"]}}"
```

---

## ✅ Checklist de Verificación

- [ ] Todos los impuestos se obtienen correctamente
- [ ] IVA en Uruguay (22%) calcula correctamente
- [ ] IVA Mínimo (10%) para alimentos funciona
- [ ] IVA en Argentina (21% + IIBB 5%) funciona
- [ ] Tasas de cambio se configuran correctamente
- [ ] Conversión USD → UYU funciona (x40.5)
- [ ] Conversión cruzada UYU → ARS funciona
- [ ] Unidades de peso se obtienen correctamente
- [ ] Conversión kg → lb funciona (x2.2046)
- [ ] Configuración del sistema se guarda
- [ ] Impuestos personalizados funcionan

---

## 🐛 Troubleshooting

### **Error: "Country not found"**

✅ Verifica que el código de país sea correcto:
- `UY` (Uruguay)
- `AR` (Argentina)
- `BR` (Brasil)
- `MX` (México)

### **Error: "Exchange rates not configured"**

✅ Primero configura las tasas de cambio con:
```bash
POST /make-server-0dd48dc4/system/exchange-rates
```

### **Error: "Unit type not found"**

✅ Usa uno de estos tipos:
- `weight` (peso)
- `length` (longitud)
- `volume` (volumen)

---

## 📊 Dashboard de Pruebas

| Funcionalidad | Endpoint | Método | Estado |
|---------------|----------|--------|--------|
| Listar impuestos | `/system/taxes` | GET | ⚪ |
| Calcular IVA | `/system/taxes/calculate` | POST | ⚪ |
| Listar monedas | `/system/currencies` | GET | ⚪ |
| Configurar tasas | `/system/exchange-rates` | POST | ⚪ |
| Convertir moneda | `/system/convert-currency` | POST | ⚪ |
| Listar unidades | `/system/units` | GET | ⚪ |
| Convertir unidad | `/system/convert-unit` | POST | ⚪ |
| Configurar sistema | `/system/config` | POST | ⚪ |

---

**¡Prueba todos los endpoints y marca con ✅ los que funcionen correctamente! 🎯**
