# 🧪 Pruebas Rápidas - Módulo BILLING

**Fecha**: 12 de febrero de 2026  
**Módulo**: `supabase/functions/server/billing.tsx`

---

## ⚡ Inicio Rápido

### **1. Iniciar el Servidor**

**Windows:**
```bash
start-server.bat
```

El servidor estará en: **http://localhost:8000**

---

## 🧪 Batería de Pruebas

### **✅ Test 1: Crear Primera Factura**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices \
  -H "Content-Type: application/json" \
  -d "{\"entity_id\": \"default\", \"customer_id\": \"party:123\", \"customer\": {\"name\": \"Juan Perez\", \"email\": \"juan@email.com\", \"tax_id\": \"12345678\", \"country\": \"UY\"}, \"items\": [{\"description\": \"Producto A\", \"quantity\": 2, \"unit_price\": 100}], \"currency\": \"USD\", \"notes\": \"Gracias por su compra\"}"
```

**✅ Respuesta esperada:**
```json
{
  "invoice": {
    "id": "invoice:...",
    "invoice_number": "A-00000001",
    "series": "A",
    "type": "INVOICE",
    "customer": {...},
    "subtotal": 200,
    "total_tax": 44,
    "total": 244,
    "currency": "USD",
    "payment_status": "PENDING",
    "einvoice_status": "PENDING"
  },
  "message": "Invoice created successfully"
}
```

**📝 Guarda el `invoice_number` para los siguientes tests**

---

### **✅ Test 2: Listar Todas las Facturas**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/billing/invoices?entity_id=default"
```

**✅ Respuesta esperada:**
```json
{
  "invoices": [
    {
      "id": "invoice:...",
      "invoice_number": "A-00000001",
      "total": 244,
      "payment_status": "PENDING"
    }
  ],
  "total": 1
}
```

---

### **✅ Test 3: Filtrar Facturas Pendientes**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/billing/invoices?entity_id=default&status=PENDING"
```

---

### **✅ Test 4: Obtener Factura por ID**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX"
```

*(Reemplaza `invoice:XXXXX` con el ID de tu factura)*

---

### **✅ Test 5: Registrar Pago Parcial (100 USD en Efectivo)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/payments \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 100, \"method\": \"CASH\", \"notes\": \"Pago parcial en efectivo\"}"
```

**✅ Respuesta esperada:**
```json
{
  "invoice": {
    "id": "invoice:...",
    "total": 244,
    "total_paid": 100,
    "payment_status": "PARTIAL",
    "payments": [
      {
        "id": "payment:...",
        "amount": 100,
        "method": "CASH",
        "notes": "Pago parcial en efectivo"
      }
    ]
  },
  "payment": {...},
  "message": "Payment registered successfully"
}
```

---

### **✅ Test 6: Registrar Segundo Pago (144 USD por Transferencia)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/payments \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 144, \"method\": \"TRANSFER\", \"reference\": \"TRANSFER-ABC123\", \"notes\": \"Pago final\"}"
```

**✅ Respuesta esperada:**
```json
{
  "invoice": {
    "total": 244,
    "total_paid": 244,
    "payment_status": "PAID",
    "payments": [
      {"amount": 100, "method": "CASH"},
      {"amount": 144, "method": "TRANSFER"}
    ]
  },
  "message": "Payment registered successfully"
}
```

---

### **✅ Test 7: Crear Segunda Factura**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices \
  -H "Content-Type: application/json" \
  -d "{\"entity_id\": \"default\", \"customer_id\": \"party:456\", \"customer\": {\"name\": \"Maria Lopez\", \"country\": \"AR\"}, \"items\": [{\"description\": \"Producto B\", \"quantity\": 1, \"unit_price\": 500}], \"currency\": \"USD\"}"
```

**✅ Respuesta esperada:**
```json
{
  "invoice": {
    "invoice_number": "A-00000002",
    "total": 500,
    "customer": {"name": "Maria Lopez"}
  }
}
```

---

### **✅ Test 8: Crear Nota de Crédito**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/credit-note \
  -H "Content-Type: application/json" \
  -d "{\"reason\": \"Devolucion de producto\", \"items\": [{\"description\": \"Producto A devuelto\", \"quantity\": 1, \"unit_price\": 100}], \"subtotal\": 100, \"total_tax\": 22, \"total\": 122}"
```

**✅ Respuesta esperada:**
```json
{
  "credit_note": {
    "invoice_number": "NC-00000001",
    "series": "NC",
    "type": "CREDIT_NOTE",
    "total": 122,
    "payment_status": "PAID",
    "related_invoices": ["invoice:..."]
  },
  "message": "Credit note created successfully"
}
```

---

### **✅ Test 9: Actualizar Factura**

```bash
curl -X PATCH http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX \
  -H "Content-Type: application/json" \
  -d "{\"notes\": \"Nota actualizada\", \"terms\": \"Pago a 45 dias\"}"
```

---

### **✅ Test 10: Anular Factura**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/cancel \
  -H "Content-Type: application/json" \
  -d "{\"reason\": \"Error en la emision\", \"cancelled_by\": \"user:admin\"}"
```

**✅ Respuesta esperada:**
```json
{
  "invoice": {
    "payment_status": "CANCELLED",
    "cancelled_at": "2026-02-12T...",
    "cancelled_reason": "Error en la emision"
  },
  "message": "Invoice cancelled successfully"
}
```

---

### **✅ Test 11: Generar PDF**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/generate-pdf
```

**✅ Respuesta esperada:**
```json
{
  "invoice": {
    "pdf_url": "/pdfs/A-00000001.pdf",
    "pdf_generated_at": "2026-02-12T..."
  },
  "pdf_url": "/pdfs/A-00000001.pdf",
  "message": "PDF generated successfully"
}
```

---

### **✅ Test 12: Enviar por Email**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/send \
  -H "Content-Type: application/json" \
  -d "{\"to\": \"cliente@email.com\", \"subject\": \"Factura A-00000001\", \"message\": \"Adjuntamos su factura\"}"
```

---

### **✅ Test 13: Enviar a E-Invoice (DGI Uruguay)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/submit-einvoice \
  -H "Content-Type: application/json" \
  -d "{\"provider\": \"DGI_UY\"}"
```

**✅ Respuesta esperada:**
```json
{
  "invoice": {
    "einvoice_status": "APPROVED",
    "einvoice_provider": "DGI_UY",
    "einvoice_id": "CFE-...",
    "einvoice_cae": "CAEABCDEF...",
    "einvoice_qr": "https://einvoice.example.com/verify/...",
    "einvoice_submitted_at": "2026-02-12T..."
  },
  "einvoice": {
    "status": "APPROVED",
    "einvoice_id": "CFE-...",
    "cae": "CAEABCDEF...",
    "qr_data": "https://...",
    "approved_at": "2026-02-12T..."
  },
  "message": "Invoice submitted to e-invoice provider successfully"
}
```

---

### **✅ Test 14: Dashboard de Facturación**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/billing/dashboard?entity_id=default"
```

**✅ Respuesta esperada:**
```json
{
  "dashboard": {
    "summary": {
      "total_invoices": 2,
      "total_amount": 744,
      "total_paid": 244,
      "total_pending": 500,
      "total_overdue": 0,
      "collection_rate": 33
    },
    "by_status": {
      "PENDING": 1,
      "PARTIAL": 0,
      "PAID": 1,
      "OVERDUE": 0,
      "CANCELLED": 0
    },
    "by_type": {
      "INVOICE": 2,
      "CREDIT_NOTE": 1,
      "DEBIT_NOTE": 0,
      "PROFORMA": 0
    },
    "top_customers": [...]
  }
}
```

---

### **✅ Test 15: Reporte Fiscal**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/billing/reports/fiscal?entity_id=default&start_date=2026-02-01&end_date=2026-02-29"
```

**✅ Respuesta esperada:**
```json
{
  "report": {
    "period": {
      "start_date": "2026-02-01",
      "end_date": "2026-02-29"
    },
    "summary": {
      "total_invoices": 2,
      "total_credit_notes": 1,
      "total_sales": 600,
      "total_tax": 132,
      "total_invoiced": 732
    },
    "tax_breakdown": [
      {
        "name": "IVA",
        "amount": 132
      }
    ],
    "invoices": [...]
  }
}
```

---

### **✅ Test 16: Crear Plan de Facturación**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/plans \
  -H "Content-Type: application/json" \
  -d "{\"entity_id\": \"default\", \"name\": \"Plan Profesional\", \"description\": \"Para empresas medianas\", \"price\": 199, \"currency\": \"USD\", \"billing_period\": \"monthly\", \"limits\": {\"max_users\": 10, \"max_invoices\": 500}, \"features\": [\"E-Invoice ilimitado\", \"Multi-moneda\"]}"
```

---

## 📊 Escenario Completo: Flujo de Facturación

### **Paso 1: Crear Cliente**
```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties \
  -H "Content-Type: application/json" \
  -d "{\"entity_id\": \"default\", \"type\": \"PERSON\", \"person_data\": {\"first_name\": \"Carlos\", \"last_name\": \"Garcia\"}, \"contact\": {\"email\": \"carlos@email.com\", \"phone\": \"+598 99 123 456\"}, \"roles\": [\"CUSTOMER\"]}"
```

### **Paso 2: Crear Factura**
```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices \
  -H "Content-Type: application/json" \
  -d "{\"entity_id\": \"default\", \"customer_id\": \"party:XXXXX\", \"customer\": {\"name\": \"Carlos Garcia\", \"country\": \"UY\"}, \"items\": [{\"description\": \"Servicio de Consultoria\", \"quantity\": 10, \"unit_price\": 50}], \"currency\": \"USD\", \"notes\": \"10 horas de consultoria\"}"
```

### **Paso 3: Enviar a DGI**
```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/submit-einvoice \
  -H "Content-Type: application/json" \
  -d "{\"provider\": \"DGI_UY\"}"
```

### **Paso 4: Generar PDF**
```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/generate-pdf
```

### **Paso 5: Enviar por Email**
```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/send \
  -H "Content-Type: application/json" \
  -d "{\"to\": \"carlos@email.com\"}"
```

### **Paso 6: Registrar Pago**
```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/invoice:XXXXX/payments \
  -H "Content-Type: application/json" \
  -d "{\"amount\": 610, \"method\": \"TRANSFER\", \"reference\": \"TRANSFER-XYZ789\"}"
```

### **Paso 7: Verificar Dashboard**
```bash
curl "http://localhost:8000/make-server-0dd48dc4/billing/dashboard?entity_id=default"
```

---

## ✅ Checklist de Verificación

- [ ] Factura creada con numeración automática (A-00000001)
- [ ] Impuestos calculados correctamente (22% IVA en Uruguay)
- [ ] Pago parcial registrado (estado: PARTIAL)
- [ ] Pago completo registrado (estado: PAID)
- [ ] Nota de crédito creada (NC-00000001)
- [ ] Factura anulada (estado: CANCELLED)
- [ ] PDF generado
- [ ] Email enviado
- [ ] E-Invoice aprobado por DGI
- [ ] Dashboard muestra métricas correctas
- [ ] Reporte fiscal generado
- [ ] Plan de facturación creado

---

## 🎯 Métricas a Verificar

Después de ejecutar todos los tests, el dashboard debería mostrar:

- ✅ **Total Facturas**: 2+
- ✅ **Total Facturado**: ~744 USD
- ✅ **Total Cobrado**: ~244 USD
- ✅ **Tasa de Cobranza**: ~33%
- ✅ **Facturas Pendientes**: 1
- ✅ **Facturas Pagadas**: 1
- ✅ **Notas de Crédito**: 1

---

## 🐛 Troubleshooting

### **Error: "Invoice not found"**

✅ Verifica que el ID de la factura sea correcto. Usa el ID retornado al crearla.

### **Error: "Cannot register payment on cancelled invoice"**

✅ No puedes registrar pagos en facturas canceladas. Crea una nueva factura.

### **Pago no actualiza el estado a "PAID"**

✅ Verifica que la suma de pagos sea >= al total de la factura.

---

**¡Prueba todos los endpoints y marca con ✅ los que funcionen correctamente! 💰**
