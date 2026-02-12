# 🌍 Módulo CUSTOMS - Aduanas + Exportación/Importación

**Archivo**: `supabase/functions/server/customs.tsx`  
**Líneas de código**: ~820

---

## 📋 Descripción General

El módulo **CUSTOMS** facilita la gestión aduanera y exportación/importación para ODDY Market. Incluye generación de documentos oficiales y soporte para operaciones internacionales.

### **Características Principales**

- ✅ **DUA Uruguay** (Declaración Única Aduanera)
- ✅ **Packing Lists Profesionales**
- ✅ **Factura Comercial** (Commercial Invoice)
- ✅ **Certificado de Origen**
- ✅ **Clasificación Arancelaria** (HS Code / NCM)
- ✅ **Cálculo de Derechos Aduaneros**
- ✅ **Valoración Aduanera** (FOB, CIF)
- ✅ **Integración con DNA Uruguay** (preparado)
- ✅ **Dashboard Aduanero**

---

## 🇺🇾 DUA - Declaración Única Aduanera (Uruguay)

### **¿Qué es el DUA?**
El DUA es el documento oficial exigido por la **Dirección Nacional de Aduanas (DNA) de Uruguay** para todas las operaciones de importación y exportación.

### **Campos Incluidos:**
- ✅ Exportador e Importador
- ✅ Agente de Aduanas
- ✅ Transporte (modo, buque, puerto)
- ✅ Términos comerciales (INCOTERM)
- ✅ Items con código arancelario (HS Code)
- ✅ Valoración FOB/CIF
- ✅ Derechos aduaneros
- ✅ Documentos de soporte

---

## 📦 Packing List Profesional

### **Formato Estándar Internacional**

El Packing List incluye:
- ✅ **Marcas y Números** de cada bulto
- ✅ **Descripción** del contenido
- ✅ **Cantidad de bultos**
- ✅ **Tipo** (cartón, pallet, crate, etc.)
- ✅ **Dimensiones** (L x W x H en cm)
- ✅ **Volumen** (m³)
- ✅ **Peso Neto** (kg)
- ✅ **Peso Bruto** (kg)
- ✅ **Totales** consolidados

---

## 🔧 Endpoints Implementados (11)

### **1. Crear Declaración Aduanera (DUA)**

```bash
POST /make-server-0dd48dc4/customs/declarations
```

**Body:**
```json
{
  "entity_id": "default",
  "operation_type": "EXPORT",
  "exporter": {
    "name": "ODDY Market Uruguay S.A.",
    "rut": "217654320018",
    "address": "Av. Italia 1234, Montevideo"
  },
  "importer": {
    "name": "Import Company Inc",
    "tax_id": "123456789",
    "address": "123 Main St, Miami, USA"
  },
  "transport": {
    "mode": "MARITIME",
    "vessel_name": "MSC GÜLSÜN",
    "voyage_number": "2024001",
    "departure_port": "Montevideo (UY)",
    "arrival_port": "Miami (US)",
    "departure_date": "2026-03-01"
  },
  "incoterm": "FOB",
  "items": [
    {
      "description": "Camisetas de algodón",
      "hs_code": "6109.10.00",
      "quantity": 1000,
      "unit": "UN",
      "unit_value": 5,
      "net_weight_kg": 2500,
      "gross_weight_kg": 2650,
      "country_of_origin": "UY",
      "manufacturer": "ODDY Textiles"
    }
  ],
  "valuation": {
    "currency": "USD",
    "fob_value": 5000,
    "freight_value": 500,
    "insurance_value": 100
  }
}
```

**Respuesta:**
```json
{
  "declaration": {
    "id": "customs_declaration:...",
    "dua_number": "DUA-2026-000001",
    "operation_type": "EXPORT",
    "exporter": {...},
    "importer": {...},
    "items": [...],
    "valuation": {
      "fob_value": 5000,
      "freight_value": 500,
      "insurance_value": 100,
      "cif_value": 5600,
      "customs_duties": 560,
      "total_value": 6160
    },
    "status": "DRAFT"
  },
  "message": "Customs declaration created successfully"
}
```

---

### **2. Generar Packing List**

```bash
POST /make-server-0dd48dc4/customs/packing-list/generate
```

**Body:**
```json
{
  "entity_id": "default",
  "shipper": {
    "name": "ODDY Market Uruguay S.A.",
    "address": "Av. Italia 1234, Montevideo, Uruguay"
  },
  "consignee": {
    "name": "Import Company Inc",
    "address": "123 Main St, Miami, FL 33101, USA"
  },
  "transport": {
    "mode": "MARITIME",
    "vessel_name": "MSC GÜLSÜN",
    "container_number": "MSCU1234567",
    "seal_number": "SEAL987654",
    "port_of_loading": "Montevideo, Uruguay",
    "port_of_discharge": "Miami, USA"
  },
  "packages": [
    {
      "marks": "ODDY-001",
      "description": "Camisetas algodón - Talla M",
      "quantity": 50,
      "type": "CARTON",
      "length_cm": 60,
      "width_cm": 40,
      "height_cm": 40,
      "net_weight_kg": 25,
      "gross_weight_kg": 27,
      "contents": [
        {"item": "Camisetas blancas M", "qty": 25},
        {"item": "Camisetas negras M", "qty": 25}
      ]
    },
    {
      "marks": "ODDY-002",
      "description": "Camisetas algodón - Talla L",
      "quantity": 50,
      "type": "CARTON",
      "length_cm": 60,
      "width_cm": 40,
      "height_cm": 40,
      "net_weight_kg": 30,
      "gross_weight_kg": 32
    }
  ],
  "special_instructions": "Mantener en lugar seco. No apilar más de 5 cajas."
}
```

**Respuesta:**
```json
{
  "packing_list": {
    "id": "packing_list:...",
    "packing_list_number": "PL-000001",
    "shipper": {...},
    "consignee": {...},
    "packages": [
      {
        "package_number": 1,
        "marks": "ODDY-001",
        "volume_m3": 0.096,
        "net_weight_kg": 25,
        "gross_weight_kg": 27
      },
      {
        "package_number": 2,
        "marks": "ODDY-002",
        "volume_m3": 0.096,
        "net_weight_kg": 30,
        "gross_weight_kg": 32
      }
    ],
    "totals": {
      "total_packages": 2,
      "total_net_weight_kg": 55,
      "total_gross_weight_kg": 59,
      "total_volume_m3": 0.192
    }
  },
  "pdf_content": "================================================================================\n                     PACKING LIST / LISTA DE EMPAQUE\n...",
  "message": "Packing list generated successfully"
}
```

---

### **3. Generar Factura Comercial**

```bash
POST /make-server-0dd48dc4/customs/commercial-invoice/generate
```

**Body:**
```json
{
  "entity_id": "default",
  "seller": {
    "name": "ODDY Market Uruguay S.A.",
    "address": "Av. Italia 1234, Montevideo, Uruguay",
    "tax_id": "217654320018"
  },
  "buyer": {
    "name": "Import Company Inc",
    "address": "123 Main St, Miami, USA",
    "tax_id": "98-7654321"
  },
  "incoterm": "FOB",
  "payment_terms": "30 días desde la fecha de factura",
  "items": [
    {
      "description": "Camisetas de algodón 100% - Talla M",
      "hs_code": "6109.10.00",
      "quantity": 500,
      "unit": "UN",
      "unit_price": 5,
      "country_of_origin": "UY"
    },
    {
      "description": "Camisetas de algodón 100% - Talla L",
      "hs_code": "6109.10.00",
      "quantity": 500,
      "unit": "UN",
      "unit_price": 5,
      "country_of_origin": "UY"
    }
  ],
  "freight": 500,
  "insurance": 100,
  "currency": "USD",
  "shipping_method": "Maritime",
  "port_of_loading": "Montevideo, Uruguay",
  "port_of_discharge": "Miami, USA"
}
```

---

### **4. Generar Certificado de Origen**

```bash
POST /make-server-0dd48dc4/customs/certificate-of-origin/generate
```

**Body:**
```json
{
  "entity_id": "default",
  "certificate_type": "MERCOSUR",
  "exporter": {
    "name": "ODDY Market Uruguay S.A.",
    "address": "Av. Italia 1234, Montevideo, Uruguay"
  },
  "importer": {
    "name": "Import Company Argentina S.A.",
    "address": "Av. Corrientes 1234, Buenos Aires, Argentina"
  },
  "goods": [
    {
      "description": "Camisetas de algodón",
      "hs_code": "6109.10.00",
      "quantity": 1000,
      "unit": "UN"
    }
  ],
  "country_of_origin": "UY",
  "origin_criterion": "WO",
  "remarks": "100% producido en Uruguay",
  "issuing_authority": "Cámara de Comercio y Servicios del Uruguay"
}
```

---

### **5. Clasificar Producto (Obtener HS Code)**

```bash
POST /make-server-0dd48dc4/customs/classify-product
```

**Body:**
```json
{
  "description": "Camiseta de algodón para hombre"
}
```

**Respuesta:**
```json
{
  "classification": {
    "suggested_hs_code": "6109.10.00",
    "suggested_description": "textiles",
    "confidence": "LOW",
    "note": "En producción, se integraría con la API de la DNA Uruguay para clasificación oficial"
  }
}
```

---

### **6. Calcular Derechos Aduaneros**

```bash
POST /make-server-0dd48dc4/customs/calculate-duties
```

**Body:**
```json
{
  "cif_value": 5600,
  "hs_code": "6109.10.00",
  "country_of_origin": "UY"
}
```

**Respuesta:**
```json
{
  "calculation": {
    "cif_value": 5600,
    "hs_code": "6109.10.00",
    "tariff_rate": 0.18,
    "customs_duty": 1008,
    "vat": 1453.76,
    "total_duties": 2461.76,
    "total_to_pay": 8061.76,
    "note": "Cálculo estimado. Verificar con DNA Uruguay para valores oficiales."
  }
}
```

---

### **7. Listar Declaraciones Aduaneras**

```bash
GET /make-server-0dd48dc4/customs/declarations?entity_id=default
GET /make-server-0dd48dc4/customs/declarations?entity_id=default&status=SUBMITTED
```

---

### **8. Enviar DUA a DNA Uruguay**

```bash
POST /make-server-0dd48dc4/customs/declarations/:id/submit
```

**Respuesta:**
```json
{
  "declaration": {
    "status": "SUBMITTED",
    "submission_date": "2026-02-12T10:00:00Z",
    "dna_reference": "DNA-1739361234567"
  },
  "message": "Declaration submitted to DNA Uruguay successfully",
  "note": "En producción, se enviaría a través de la plataforma VUCE de Uruguay"
}
```

---

### **9. Dashboard Aduanero**

```bash
GET /make-server-0dd48dc4/customs/dashboard?entity_id=default
```

**Respuesta:**
```json
{
  "dashboard": {
    "summary": {
      "total_declarations": 45,
      "draft": 5,
      "submitted": 10,
      "approved": 25,
      "cleared": 5,
      "total_fob_value": 125000,
      "total_customs_duties": 25000
    },
    "recent_declarations": [...]
  }
}
```

---

## 📄 Ejemplo de Packing List Generado

```
================================================================================
                           PACKING LIST / LISTA DE EMPAQUE
================================================================================

Packing List No: PL-000001
Date: 2/12/2026

SHIPPER / EXPEDIDOR:
  ODDY Market Uruguay S.A.
  Av. Italia 1234, Montevideo, Uruguay

CONSIGNEE / CONSIGNATARIO:
  Import Company Inc
  123 Main St, Miami, FL 33101, USA

TRANSPORT DETAILS / DETALLES DE TRANSPORTE:
  Mode: MARITIME
  Vessel/Flight: MSC GÜLSÜN
  Port of Loading: Montevideo, Uruguay
  Port of Discharge: Miami, USA

--------------------------------------------------------------------------------
 PKG# | MARKS         | DESCRIPTION      | QTY | NET WT  | GROSS WT | VOLUME
      |               |                  |     | (kg)    | (kg)     | (m³)  
--------------------------------------------------------------------------------
    1 | ODDY-001      | Camisetas M      |  50 |   25.00 |    27.00 |  0.096
    2 | ODDY-002      | Camisetas L      |  50 |   30.00 |    32.00 |  0.096
--------------------------------------------------------------------------------
 TOTAL: 2 packages | Net: 55.00 kg | Gross: 59.00 kg | Vol: 0.192 m³
================================================================================

SPECIAL INSTRUCTIONS / INSTRUCCIONES ESPECIALES:
Mantener en lugar seco. No apilar más de 5 cajas.

Prepared by: ODDY Market Customs Module
================================================================================
```

---

## 🇺🇾 Integración con DNA Uruguay (Preparado)

### **Plataforma VUCE**
El módulo está preparado para integrarse con la **Ventanilla Única de Comercio Exterior (VUCE)** de Uruguay.

### **Funcionalidades Planificadas:**
- ✅ Envío electrónico del DUA
- ✅ Consulta de estado del DUA
- ✅ Descarga de certificados oficiales
- ✅ Notificaciones de aprobación/rechazo
- ✅ Pago electrónico de tributos

### **Endpoint de Integración:**
```bash
POST /customs/declarations/:id/submit
```

---

## 📊 INCOTERMS Soportados

| INCOTERM | Descripción |
|----------|-------------|
| **EXW** | Ex Works (en fábrica) |
| **FCA** | Free Carrier (franco transportista) |
| **FOB** | Free On Board (franco a bordo) |
| **CFR** | Cost and Freight (costo y flete) |
| **CIF** | Cost, Insurance and Freight (costo, seguro y flete) |
| **CPT** | Carriage Paid To (transporte pagado hasta) |
| **CIP** | Carriage and Insurance Paid To (transporte y seguro pagados) |
| **DAP** | Delivered At Place (entregado en lugar) |
| **DPU** | Delivered at Place Unloaded (entregado en lugar descargado) |
| **DDP** | Delivered Duty Paid (entregado con derechos pagados) |

---

## 🎯 Casos de Uso Reales

### **Caso 1: Exportación a USA**

```bash
# 1. Crear DUA
POST /customs/declarations
{ "operation_type": "EXPORT", "exporter": {...}, "importer": {...} }

# 2. Generar Packing List
POST /customs/packing-list/generate
{ "shipper": {...}, "consignee": {...}, "packages": [...] }

# 3. Generar Factura Comercial
POST /customs/commercial-invoice/generate
{ "seller": {...}, "buyer": {...}, "items": [...] }

# 4. Enviar DUA a DNA
POST /customs/declarations/:id/submit

# 5. Descargar documentos en PDF
GET /customs/declarations/:id/documents
```

---

### **Caso 2: Importación desde Brasil (MERCOSUR)**

```bash
# 1. Crear DUA de importación
POST /customs/declarations
{ "operation_type": "IMPORT", "incoterm": "CIF" }

# 2. Generar Certificado de Origen MERCOSUR
POST /customs/certificate-of-origin/generate
{ "certificate_type": "MERCOSUR", "country_of_origin": "BR" }

# 3. Calcular derechos aduaneros
POST /customs/calculate-duties
{ "cif_value": 10000, "hs_code": "8517.12.00" }

# 4. Enviar documentación a DNA
POST /customs/declarations/:id/submit
```

---

## 🔗 Integración con Otros Módulos

### **1. Integración con `shipping.tsx`**
```typescript
// Al crear envío internacional, generar automáticamente Packing List
const shipment = await createShipment({...});
const packingList = await generatePackingList(shipment.id);
```

### **2. Integración con `billing.tsx`**
```typescript
// Convertir factura local en Factura Comercial para exportación
const invoice = await getInvoice(invoice_id);
const commercialInvoice = await generateCommercialInvoice(invoice);
```

### **3. Integración con `products.tsx`**
```typescript
// Obtener HS Code de productos
const product = await getProduct(product_id);
const hsCode = await classifyProduct(product.description);
```

---

## 📝 Resumen Técnico

| Característica | Detalle |
|----------------|---------|
| **Archivo** | `supabase/functions/server/customs.tsx` |
| **Líneas** | ~820 |
| **Endpoints** | 11 |
| **Documentos** | DUA, Packing List, Commercial Invoice, Certificate of Origin |
| **INCOTERMS** | 10 (EXW, FOB, CIF, etc.) |
| **Transporte** | 5 modos (Marítimo, Aéreo, Terrestre, Ferroviario, Multimodal) |
| **Integración DNA** | Preparado para VUCE Uruguay |
| **Storage** | Deno KV |

---

**¡El módulo CUSTOMS convierte ODDY Market en una plataforma lista para comercio internacional! 🌍**
