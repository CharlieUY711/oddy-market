# 💰 Módulo BILLING - Facturación Profesional Multi-País

**Archivo**: `supabase/functions/server/billing.tsx`  
**Líneas de código**: ~980

---

## 📋 Descripción General

El módulo **BILLING** es el **sistema completo de facturación** de ODDY Market. Maneja todo el ciclo de vida de las facturas, desde la emisión hasta el cobro.

### **Características Principales**

- ✅ **Facturación Multi-País** (integración con system.tsx)
- ✅ **Multi-Moneda** con tasas de cambio
- ✅ **E-Invoice** (DGI Uruguay, AFIP Argentina, etc.)
- ✅ **Notas de Crédito y Débito**
- ✅ **Gestión de Pagos** (efectivo, tarjeta, transferencia, etc.)
- ✅ **Dashboard** con métricas en tiempo real
- ✅ **Reportes Fiscales**
- ✅ **Planes de Facturación** (para SaaS)
- ✅ **Generación de PDF**
- ✅ **Envío por Email**
- ✅ **Control de Vencimientos**

---

## 📊 Tipos de Documentos Fiscales

| Tipo | Descripción | Serie |
|------|-------------|-------|
| **INVOICE** | Factura estándar | A, B, C |
| **CREDIT_NOTE** | Nota de Crédito | NC |
| **DEBIT_NOTE** | Nota de Débito | ND |
| **PROFORMA** | Factura Proforma | PF |
| **RECEIPT** | Recibo | R |

---

## 💳 Estados de Pago

| Estado | Descripción |
|--------|-------------|
| **PENDING** | Pendiente de pago |
| **PARTIAL** | Pago parcial |
| **PAID** | Pagado completamente |
| **OVERDUE** | Vencido |
| **CANCELLED** | Cancelado |

---

## 💵 Métodos de Pago Soportados

- 💵 **CASH** - Efectivo
- 💳 **CARD** - Tarjeta (débito/crédito)
- 🏦 **TRANSFER** - Transferencia bancaria
- 📝 **CHEQUE** - Cheque
- 🛒 **MERCADOPAGO** - Mercado Pago
- 🌐 **PAYPAL** - PayPal
- ₿ **CRYPTO** - Criptomoneda
- 📦 **OTHER** - Otro

---

## 🔧 Endpoints Implementados (16)

### **1. Crear Factura**

```bash
POST /make-server-0dd48dc4/billing/invoices
```

**Body:**
```json
{
  "entity_id": "default",
  "type": "INVOICE",
  "series": "A",
  "customer_id": "party:123",
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "tax_id": "12345678",
    "country": "UY"
  },
  "items": [
    {
      "product_id": "prod:1",
      "description": "Producto A",
      "quantity": 2,
      "unit_price": 100,
      "tax_rate": 0.22
    }
  ],
  "currency": "USD",
  "due_date": "2026-03-15T00:00:00Z",
  "notes": "Gracias por su compra",
  "auto_calculate_tax": true
}
```

**Respuesta:**
```json
{
  "invoice": {
    "id": "invoice:1739361234567",
    "invoice_number": "A-00000001",
    "series": "A",
    "type": "INVOICE",
    "customer": {...},
    "items": [...],
    "subtotal": 200,
    "total_tax": 44,
    "total": 244,
    "currency": "USD",
    "payment_status": "PENDING",
    "einvoice_status": "PENDING",
    "created_at": "2026-02-12T..."
  },
  "message": "Invoice created successfully"
}
```

---

### **2. Listar Facturas**

```bash
GET /make-server-0dd48dc4/billing/invoices?entity_id=default
GET /make-server-0dd48dc4/billing/invoices?customer_id=party:123
GET /make-server-0dd48dc4/billing/invoices?status=PENDING
GET /make-server-0dd48dc4/billing/invoices?type=INVOICE&limit=20
```

---

### **3. Obtener Factura por ID**

```bash
GET /make-server-0dd48dc4/billing/invoices/invoice:123
```

---

### **4. Actualizar Factura**

```bash
PATCH /make-server-0dd48dc4/billing/invoices/invoice:123
```

**Body:**
```json
{
  "notes": "Actualizado",
  "due_date": "2026-03-20T00:00:00Z"
}
```

---

### **5. Anular Factura**

```bash
POST /make-server-0dd48dc4/billing/invoices/invoice:123/cancel
```

**Body:**
```json
{
  "reason": "Error en la emisión",
  "cancelled_by": "user:456"
}
```

---

### **6. Registrar Pago**

```bash
POST /make-server-0dd48dc4/billing/invoices/invoice:123/payments
```

**Body:**
```json
{
  "amount": 100,
  "method": "TRANSFER",
  "reference": "TRANSFER-ABC123",
  "date": "2026-02-12T10:30:00Z",
  "notes": "Pago recibido vía transferencia"
}
```

**Respuesta:**
```json
{
  "invoice": {
    "id": "invoice:123",
    "total": 244,
    "total_paid": 100,
    "payment_status": "PARTIAL",
    "payments": [
      {
        "id": "payment:...",
        "amount": 100,
        "method": "TRANSFER",
        "reference": "TRANSFER-ABC123",
        "date": "2026-02-12T10:30:00Z"
      }
    ]
  },
  "payment": {...},
  "message": "Payment registered successfully"
}
```

---

### **7. Crear Nota de Crédito**

```bash
POST /make-server-0dd48dc4/billing/invoices/invoice:123/credit-note
```

**Body:**
```json
{
  "reason": "Devolución de productos",
  "items": [
    {
      "product_id": "prod:1",
      "description": "Producto A devuelto",
      "quantity": 1,
      "unit_price": 100
    }
  ],
  "subtotal": 100,
  "total_tax": 22,
  "total": 122,
  "notes": "Nota de crédito parcial"
}
```

**Respuesta:**
```json
{
  "credit_note": {
    "id": "invoice:...",
    "invoice_number": "NC-00000001",
    "series": "NC",
    "type": "CREDIT_NOTE",
    "total": 122,
    "payment_status": "PAID",
    "related_invoices": ["invoice:123"]
  },
  "message": "Credit note created successfully"
}
```

---

### **8. Generar PDF**

```bash
POST /make-server-0dd48dc4/billing/invoices/invoice:123/generate-pdf
```

**Respuesta:**
```json
{
  "invoice": {
    "id": "invoice:123",
    "pdf_url": "/pdfs/A-00000001.pdf",
    "pdf_generated_at": "2026-02-12T..."
  },
  "pdf_url": "/pdfs/A-00000001.pdf",
  "message": "PDF generated successfully"
}
```

---

### **9. Enviar Factura por Email**

```bash
POST /make-server-0dd48dc4/billing/invoices/invoice:123/send
```

**Body:**
```json
{
  "to": "cliente@email.com",
  "subject": "Factura A-00000001 - ODDY Market",
  "message": "Adjuntamos su factura..."
}
```

---

### **10. Enviar a E-Invoice (DGI, AFIP, etc.)**

```bash
POST /make-server-0dd48dc4/billing/invoices/invoice:123/submit-einvoice
```

**Body:**
```json
{
  "provider": "DGI_UY"
}
```

**Respuesta:**
```json
{
  "invoice": {
    "id": "invoice:123",
    "einvoice_status": "APPROVED",
    "einvoice_provider": "DGI_UY",
    "einvoice_id": "CFE-1739361234567",
    "einvoice_cae": "CAEABCDEF123456789",
    "einvoice_qr": "https://einvoice.example.com/verify/A-00000001",
    "einvoice_submitted_at": "2026-02-12T..."
  },
  "einvoice": {
    "status": "APPROVED",
    "einvoice_id": "CFE-1739361234567",
    "cae": "CAEABCDEF123456789",
    "qr_data": "https://einvoice.example.com/verify/A-00000001",
    "approved_at": "2026-02-12T..."
  },
  "message": "Invoice submitted to e-invoice provider successfully"
}
```

---

### **11. Dashboard de Facturación**

```bash
GET /make-server-0dd48dc4/billing/dashboard?entity_id=default
GET /make-server-0dd48dc4/billing/dashboard?entity_id=default&period=month
```

**Respuesta:**
```json
{
  "dashboard": {
    "summary": {
      "total_invoices": 150,
      "total_amount": 125000,
      "total_paid": 100000,
      "total_pending": 20000,
      "total_overdue": 5000,
      "collection_rate": 80
    },
    "by_status": {
      "PENDING": 20,
      "PARTIAL": 5,
      "PAID": 120,
      "OVERDUE": 3,
      "CANCELLED": 2
    },
    "by_type": {
      "INVOICE": 140,
      "CREDIT_NOTE": 8,
      "DEBIT_NOTE": 2,
      "PROFORMA": 0
    },
    "top_customers": [
      {
        "customer_id": "party:123",
        "total": 50000
      },
      ...
    ]
  }
}
```

---

### **12. Reporte Fiscal**

```bash
GET /make-server-0dd48dc4/billing/reports/fiscal?entity_id=default
GET /make-server-0dd48dc4/billing/reports/fiscal?entity_id=default&start_date=2026-01-01&end_date=2026-01-31
```

**Respuesta:**
```json
{
  "report": {
    "period": {
      "start_date": "2026-01-01",
      "end_date": "2026-01-31"
    },
    "summary": {
      "total_invoices": 50,
      "total_credit_notes": 2,
      "total_sales": 45000,
      "total_tax": 9900,
      "total_invoiced": 54900
    },
    "tax_breakdown": [
      {
        "name": "IVA",
        "amount": 9900
      }
    ],
    "invoices": [...]
  }
}
```

---

### **13. Crear Plan de Facturación**

```bash
POST /make-server-0dd48dc4/billing/plans
```

**Body:**
```json
{
  "entity_id": "default",
  "name": "Plan Profesional",
  "description": "Para empresas medianas",
  "price": 199,
  "currency": "USD",
  "billing_period": "monthly",
  "limits": {
    "max_users": 10,
    "max_invoices": 500,
    "max_storage_gb": 100
  },
  "features": [
    "E-Invoice ilimitado",
    "Multi-moneda",
    "Reportes avanzados",
    "API accesso"
  ],
  "active": true
}
```

---

## 🔗 Integración con Otros Módulos

### **1. Integración con `system.tsx`**

El módulo `billing` usa `system.tsx` para:
- ✅ Calcular impuestos automáticamente por país
- ✅ Convertir monedas
- ✅ Aplicar configuración fiscal

```typescript
// En billing.tsx
const taxCalculation = await fetch("/make-server-0dd48dc4/system/taxes/calculate", {
  method: "POST",
  body: JSON.stringify({
    amount: subtotal,
    country: customer.country,
    product_category: "goods",
  })
});
```

### **2. Integración con `documents.tsx`**

- ✅ Generar PDFs profesionales de facturas
- ✅ Generar tickets térmicos
- ✅ Enviar a proveedores de e-invoicing (DGI, AFIP, etc.)

### **3. Integración con `parties.tsx`**

- ✅ Vincular clientes/proveedores
- ✅ Acceder a datos fiscales
- ✅ Dashboard de facturas por cliente

### **4. Integración con `orders.tsx`**

- ✅ Facturar pedidos automáticamente
- ✅ Vincular facturas con pedidos
- ✅ Actualizar estado de pedido al pagar factura

### **5. Integración con `cart.tsx`**

- ✅ Generar factura desde carrito
- ✅ Aplicar descuentos y cupones

---

## 🎯 Casos de Uso

### **Caso 1: Facturar un Pedido Completo**

```bash
# 1. Crear factura
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "default",
    "customer_id": "party:123",
    "customer": {
      "name": "Juan Pérez",
      "country": "UY"
    },
    "items": [
      {"description": "Producto A", "quantity": 2, "unit_price": 100}
    ],
    "auto_calculate_tax": true
  }'

# 2. Enviar a DGI (Uruguay)
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:123/submit-einvoice \
  -H "Content-Type: application/json" \
  -d '{"provider": "DGI_UY"}'

# 3. Generar PDF
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:123/generate-pdf

# 4. Enviar por email
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:123/send \
  -H "Content-Type: application/json" \
  -d '{"to": "cliente@email.com"}'
```

---

### **Caso 2: Registrar Pagos Parciales**

```bash
# 1. Registrar primer pago
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:123/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "method": "CASH"
  }'

# 2. Registrar segundo pago
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:123/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 144,
    "method": "TRANSFER",
    "reference": "TRANSFER-ABC123"
  }'

# Total: 244 (factura pagada completamente)
```

---

### **Caso 3: Crear Nota de Crédito por Devolución**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:123/credit-note \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Devolución de 1 producto",
    "items": [
      {"description": "Producto A devuelto", "quantity": 1, "unit_price": 100}
    ],
    "subtotal": 100,
    "total_tax": 22,
    "total": 122
  }'
```

---

### **Caso 4: Dashboard Financiero**

```bash
# Ver resumen de facturación
curl "http://localhost:8000/make-server-0dd48dc4/billing/dashboard?entity_id=default"

# Reporte fiscal mensual
curl "http://localhost:8000/make-server-0dd48dc4/billing/reports/fiscal?entity_id=default&start_date=2026-02-01&end_date=2026-02-29"
```

---

## 🏗️ Estructura de Datos

### **Factura Completa**

```json
{
  "id": "invoice:1739361234567",
  "entity_id": "default",
  
  "invoice_number": "A-00000001",
  "series": "A",
  "type": "INVOICE",
  
  "customer_id": "party:123",
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "tax_id": "12345678",
    "country": "UY"
  },
  
  "issue_date": "2026-02-12T00:00:00Z",
  "due_date": "2026-03-14T00:00:00Z",
  
  "items": [
    {
      "product_id": "prod:1",
      "description": "Producto A",
      "quantity": 2,
      "unit_price": 100,
      "subtotal": 200
    }
  ],
  
  "subtotal": 200,
  "tax_details": [
    {
      "name": "IVA",
      "rate": 0.22,
      "amount": 44,
      "type": "vat"
    }
  ],
  "total_tax": 44,
  "discount": 0,
  "shipping_cost": 0,
  "total": 244,
  
  "currency": "USD",
  "exchange_rate": 1,
  
  "payment_status": "PARTIAL",
  "payment_method": null,
  "payments": [
    {
      "id": "payment:...",
      "amount": 100,
      "method": "CASH",
      "date": "2026-02-12T10:00:00Z"
    }
  ],
  "total_paid": 100,
  
  "notes": "Gracias por su compra",
  "terms": "Pago a 30 días",
  
  "fiscal_data": {
    "tax_id": "12345678",
    "address": {...},
    "fiscal_regime": "General"
  },
  
  "einvoice_status": "APPROVED",
  "einvoice_provider": "DGI_UY",
  "einvoice_id": "CFE-1739361234567",
  "einvoice_cae": "CAEABCDEF123456789",
  "einvoice_qr": "https://einvoice.dgi.gub.uy/...",
  
  "pdf_url": "/pdfs/A-00000001.pdf",
  "pdf_generated_at": "2026-02-12T11:00:00Z",
  
  "email_logs": [
    {
      "to": "juan@email.com",
      "sent_at": "2026-02-12T11:05:00Z"
    }
  ],
  "last_sent_at": "2026-02-12T11:05:00Z",
  
  "created_at": "2026-02-12T09:00:00Z",
  "updated_at": "2026-02-12T11:05:00Z",
  "created_by": "user:456",
  
  "order_id": "order:789",
  "related_invoices": []
}
```

---

## 📈 Métricas y KPIs

El dashboard de facturación proporciona:

- 💰 **Monto Total Facturado**
- 💵 **Monto Total Cobrado**
- ⏳ **Monto Pendiente de Cobro**
- ⚠️ **Monto Vencido**
- 📊 **Tasa de Cobranza** (% cobrado vs facturado)
- 📅 **Plazo Promedio de Cobro**
- 👥 **Top Clientes** (por monto facturado)
- 📋 **Distribución por Estado** (pendiente, pagado, vencido, etc.)
- 📝 **Distribución por Tipo** (factura, NC, ND, etc.)

---

## 🚀 Próximas Mejoras

1. ⚪ **Recordatorios automáticos** de vencimiento por email
2. ⚪ **Facturación recurrente** (suscripciones)
3. ⚪ **Cobro automático** via Mercado Pago/Stripe
4. ⚪ **Multi-serie** por tipo de cliente (A, B, C)
5. ⚪ **Retenciones fiscales**
6. ⚪ **Facturación en lote**
7. ⚪ **Exportación a contabilidad** (CSV, Excel)
8. ⚪ **Integración con bancos** (conciliación automática)

---

## 📝 Resumen Técnico

| Característica | Detalle |
|----------------|---------|
| **Archivo** | `supabase/functions/server/billing.tsx` |
| **Líneas** | ~980 |
| **Endpoints** | 16 |
| **Tipos de Documentos** | 5 (Factura, NC, ND, Proforma, Recibo) |
| **Estados de Pago** | 5 (Pendiente, Parcial, Pagado, Vencido, Cancelado) |
| **Métodos de Pago** | 8 |
| **Integraciones** | system, documents, parties, orders, cart |
| **Storage** | Deno KV |

---

**¡El módulo BILLING completa el flujo de ventas de ODDY Market! 💰**
