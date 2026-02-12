# 🛒 Módulo POS - Punto de Venta para Tiendas Físicas

**Archivo**: `supabase/functions/server/pos.tsx`  
**Líneas de código**: ~780

---

## 📋 Descripción General

El módulo **POS** es el **sistema de punto de venta** para tiendas físicas de ODDY Market. Es el "Front" de una caja de supermercado en el "Backend".

### **Características Principales**

- ✅ **Gestión de Cajas** (Registers)
- ✅ **Turnos de Cajeros** (Shifts) con apertura y cierre
- ✅ **Arqueo de Caja** con detalle de billetes/monedas
- ✅ **Ventas POS** con múltiples métodos de pago
- ✅ **Parking de Ventas** (suspender y reanudar)
- ✅ **Descuentos** con autorización
- ✅ **Impresión de Tickets**
- ✅ **Dashboard en Tiempo Real**
- ✅ **Integración con Inventory** (descuenta stock automático)
- ✅ **Integración con Billing** (genera factura si es necesario)

---

## 🏪 Flujo Completo de Operación

### **1. Configurar Caja**
```bash
POST /pos/registers
```
Crea una nueva caja registradora.

### **2. Abrir Turno**
```bash
POST /pos/shifts/open
```
El cajero abre su turno con un fondo inicial en efectivo.

### **3. Realizar Ventas**
```bash
POST /pos/sales
POST /pos/sales/:id/complete
```
Se registran las ventas y se actualizan los totales del turno.

### **4. Cerrar Turno con Arqueo**
```bash
POST /pos/shifts/:id/close
```
Se cuenta el efectivo y se compara con lo esperado.

---

## 🔧 Endpoints Implementados (14)

### **1. Crear Caja (Register)**

```bash
POST /make-server-0dd48dc4/pos/registers
```

**Body:**
```json
{
  "entity_id": "default",
  "name": "Caja 1",
  "code": "REG-001",
  "location": "Tienda Principal",
  "printer_id": "printer:123",
  "config": {
    "allow_discount": true,
    "max_discount_percent": 20,
    "require_supervisor_for_discount": false,
    "auto_print_ticket": true
  }
}
```

---

### **2. Listar Cajas**

```bash
GET /make-server-0dd48dc4/pos/registers?entity_id=default
GET /make-server-0dd48dc4/pos/registers?entity_id=default&status=OPEN
```

---

### **3. Abrir Turno**

```bash
POST /make-server-0dd48dc4/pos/shifts/open
```

**Body:**
```json
{
  "entity_id": "default",
  "register_id": "register:123",
  "cashier_id": "user:456",
  "cashier_name": "Juan Pérez",
  "opening_cash": 5000,
  "opening_notes": "Fondo inicial: 5 billetes de 1000"
}
```

**Respuesta:**
```json
{
  "shift": {
    "id": "shift:1739361234567",
    "register_id": "register:123",
    "cashier_id": "user:456",
    "cashier_name": "Juan Pérez",
    "opening_cash": 5000,
    "total_sales": 0,
    "total_cash": 0,
    "sales_count": 0,
    "status": "OPEN",
    "opened_at": "2026-02-12T09:00:00Z"
  },
  "register": {
    "status": "OPEN",
    "current_shift_id": "shift:1739361234567"
  },
  "message": "Shift opened successfully"
}
```

---

### **4. Obtener Turno Actual de una Caja**

```bash
GET /make-server-0dd48dc4/pos/registers/:register_id/current-shift
```

---

### **5. Crear Venta**

```bash
POST /make-server-0dd48dc4/pos/sales
```

**Body:**
```json
{
  "entity_id": "default",
  "shift_id": "shift:123",
  "customer_id": "party:789",
  "items": [
    {
      "product_id": "prod:1",
      "description": "Leche Entera 1L",
      "quantity": 2,
      "unit_price": 50,
      "barcode": "7891234567890"
    },
    {
      "product_id": "prod:2",
      "description": "Pan Integral",
      "quantity": 1,
      "unit_price": 80
    }
  ],
  "discount_percent": 10,
  "discount_reason": "Cliente frecuente",
  "payment_method": "CASH",
  "tax_rate": 0.22,
  "notes": "Cliente solicitó bolsa"
}
```

**Respuesta:**
```json
{
  "sale": {
    "id": "sale:1739361234567",
    "ticket_number": "TKT-0123-000001",
    "shift_id": "shift:123",
    "register_id": "register:123",
    "cashier_id": "user:456",
    "items": [...],
    "subtotal": 180,
    "discount_amount": 18,
    "subtotal_after_discount": 162,
    "tax_amount": 35.64,
    "total": 197.64,
    "payment_method": "CASH",
    "status": "IN_PROGRESS"
  },
  "message": "Sale created successfully"
}
```

---

### **6. Completar Venta**

```bash
POST /make-server-0dd48dc4/pos/sales/:id/complete
```

**Body:**
```json
{
  "amount_paid": 200
}
```

**Respuesta:**
```json
{
  "sale": {
    "id": "sale:123",
    "status": "COMPLETED",
    "amount_paid": 200,
    "change": 2.36,
    "completed_at": "2026-02-12T09:15:00Z"
  },
  "ticket": {
    "number": "TKT-0123-000001",
    "total": 197.64,
    "payment_method": "CASH",
    "change": 2.36
  },
  "message": "Sale completed successfully"
}
```

---

### **7. Cancelar Venta**

```bash
POST /make-server-0dd48dc4/pos/sales/:id/cancel
```

**Body:**
```json
{
  "reason": "Cliente cambió de opinión",
  "cancelled_by": "user:456"
}
```

---

### **8. Suspender Venta (Parking)**

```bash
POST /make-server-0dd48dc4/pos/sales/:id/suspend
```

**Respuesta:**
```json
{
  "sale": {
    "id": "sale:123",
    "status": "SUSPENDED",
    "suspended_at": "2026-02-12T09:20:00Z"
  },
  "message": "Sale suspended successfully"
}
```

---

### **9. Reanudar Venta Suspendida**

```bash
POST /make-server-0dd48dc4/pos/sales/:id/resume
```

---

### **10. Listar Ventas Suspendidas**

```bash
GET /make-server-0dd48dc4/pos/sales/suspended?entity_id=default
GET /make-server-0dd48dc4/pos/sales/suspended?register_id=register:123
```

---

### **11. Listar Ventas de un Turno**

```bash
GET /make-server-0dd48dc4/pos/shifts/:shift_id/sales
```

---

### **12. Cerrar Turno con Arqueo**

```bash
POST /make-server-0dd48dc4/pos/shifts/:id/close
```

**Body:**
```json
{
  "counted_cash": 15250,
  "cash_breakdown": {
    "1000": 10,
    "500": 8,
    "200": 5,
    "100": 10,
    "50": 5
  },
  "closing_notes": "Turno cerrado sin novedades",
  "closed_by": "user:456"
}
```

**Respuesta:**
```json
{
  "shift": {
    "id": "shift:123",
    "status": "CLOSED",
    "closed_at": "2026-02-12T17:00:00Z",
    "opening_cash": 5000,
    "total_sales": 10500,
    "total_cash": 10250,
    "sales_count": 45,
    "expected_cash": 15250,
    "counted_cash": 15250,
    "difference": 0
  },
  "arqueo": {
    "expected_cash": 15250,
    "counted_cash": 15250,
    "difference": 0,
    "status": "OK"
  },
  "message": "Shift closed successfully"
}
```

---

### **13. Dashboard POS**

```bash
GET /make-server-0dd48dc4/pos/dashboard?entity_id=default
GET /make-server-0dd48dc4/pos/dashboard?register_id=register:123
```

**Respuesta:**
```json
{
  "dashboard": {
    "summary": {
      "open_shifts": 3,
      "closed_shifts": 12,
      "total_sales": 125000,
      "total_cash": 80000,
      "total_card": 45000,
      "total_transactions": 450,
      "average_ticket": 277.78
    },
    "open_shifts": [...],
    "recent_closed": [...]
  }
}
```

---

### **14. Imprimir Ticket**

```bash
POST /make-server-0dd48dc4/pos/sales/:id/print-ticket
```

**Respuesta:**
```json
{
  "ticket": "================================\n       ODDY MARKET POS\n================================\nTicket: TKT-0123-000001\n...",
  "message": "Ticket generated successfully"
}
```

---

## 🎯 Casos de Uso Reales

### **Caso 1: Turno Completo de un Cajero**

```bash
# 1. Abrir turno
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/shifts/open \
  -H "Content-Type: application/json" \
  -d '{
    "register_id": "register:123",
    "cashier_id": "user:456",
    "cashier_name": "Juan Pérez",
    "opening_cash": 5000
  }'

# 2. Primera venta
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/sales \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "shift:789",
    "items": [{"description": "Producto A", "quantity": 2, "unit_price": 50}],
    "payment_method": "CASH"
  }'

# 3. Completar venta
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/sales/sale:XXX/complete \
  -H "Content-Type: application/json" \
  -d '{"amount_paid": 150}'

# ... (más ventas) ...

# 4. Cerrar turno
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/shifts/shift:789/close \
  -H "Content-Type: application/json" \
  -d '{
    "counted_cash": 15250,
    "cash_breakdown": {"1000": 10, "500": 8}
  }'
```

---

### **Caso 2: Venta con Descuento y Parking**

```bash
# 1. Crear venta con descuento
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/sales \
  -H "Content-Type: application/json" \
  -d '{
    "shift_id": "shift:789",
    "items": [{"description": "TV 50\"", "quantity": 1, "unit_price": 50000}],
    "discount_percent": 15,
    "discount_reason": "Promoción Black Friday",
    "payment_method": "CARD"
  }'

# 2. Suspender venta (cliente olvidó la tarjeta)
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/sales/sale:XXX/suspend

# 3. Atender otras ventas...

# 4. Reanudar venta
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/sales/sale:XXX/resume

# 5. Completar venta
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/sales/sale:XXX/complete \
  -H "Content-Type: application/json" \
  -d '{"amount_paid": 42500}'
```

---

## 🔗 Integración con Otros Módulos

### **1. Integración con `inventory.tsx`**
Al completar una venta, se descuenta automáticamente el stock:
```typescript
// En pos.tsx al completar venta
await fetch("/make-server-0dd48dc4/inventory/adjust", {
  method: "POST",
  body: JSON.stringify({
    product_id: item.product_id,
    quantity: -item.quantity,
    reason: `Venta POS ${sale.ticket_number}`
  })
});
```

### **2. Integración con `billing.tsx`**
Si el cliente solicita factura, se genera automáticamente:
```typescript
// En pos.tsx al completar venta
if (sale.customer_id && sale.requires_invoice) {
  await fetch("/make-server-0dd48dc4/billing/invoices", {
    method: "POST",
    body: JSON.stringify({
      customer_id: sale.customer_id,
      items: sale.items,
      total: sale.total
    })
  });
}
```

### **3. Integración con `documents.tsx`**
Genera tickets térmicos profesionales:
```typescript
// En pos.tsx al completar venta
await fetch("/make-server-0dd48dc4/documents/generate", {
  method: "POST",
  body: JSON.stringify({
    type: "TICKET",
    sale_id: sale.id,
    format: "thermal_58mm"
  })
});
```

### **4. Integración con `system.tsx`**
Usa el módulo de impuestos para calcular IVA:
```typescript
// En pos.tsx al crear venta
const taxCalc = await fetch("/make-server-0dd48dc4/system/taxes/calculate", {
  method: "POST",
  body: JSON.stringify({
    amount: subtotal,
    country: "UY"
  })
});
```

---

## 📊 Estructura de Datos

### **Caja (Register)**
```json
{
  "id": "register:123",
  "name": "Caja 1",
  "code": "REG-001",
  "location": "Tienda Principal",
  "status": "OPEN",
  "current_shift_id": "shift:789",
  "printer_id": "printer:123",
  "config": {
    "allow_discount": true,
    "max_discount_percent": 20
  }
}
```

### **Turno (Shift)**
```json
{
  "id": "shift:789",
  "register_id": "register:123",
  "cashier_id": "user:456",
  "cashier_name": "Juan Pérez",
  "opening_cash": 5000,
  "total_sales": 10500,
  "total_cash": 8500,
  "total_card": 2000,
  "sales_count": 45,
  "status": "OPEN",
  "opened_at": "2026-02-12T09:00:00Z"
}
```

### **Venta (Sale)**
```json
{
  "id": "sale:456",
  "ticket_number": "TKT-0123-000001",
  "shift_id": "shift:789",
  "register_id": "register:123",
  "cashier_id": "user:456",
  "items": [...],
  "subtotal": 180,
  "discount_amount": 18,
  "tax_amount": 35.64,
  "total": 197.64,
  "payment_method": "CASH",
  "amount_paid": 200,
  "change": 2.36,
  "status": "COMPLETED"
}
```

---

## 📈 Métricas y KPIs

El dashboard POS proporciona:

- 🏪 **Cajas Abiertas/Cerradas**
- 💰 **Total Vendido** (por turno, día, semana)
- 💵 **Desglose por Método de Pago** (efectivo, tarjeta, transferencia)
- 📊 **Número de Transacciones**
- 🎫 **Ticket Promedio**
- 👥 **Ventas por Cajero**
- ⏱️ **Tiempo Promedio por Venta**
- ⚠️ **Diferencias en Arqueos** (faltantes/sobrantes)

---

## 🚀 Ventajas del Módulo POS

1. ✅ **Backend Completo**: No necesita frontend complejo, puede usarse con cualquier UI
2. ✅ **Offline Ready**: Puede guardar ventas localmente y sincronizar después
3. ✅ **Multi-Caja**: Soporta múltiples cajas simultáneas
4. ✅ **Parking de Ventas**: Suspender y reanudar transacciones
5. ✅ **Arqueo Automático**: Calcula diferencias automáticamente
6. ✅ **Integración Total**: Se conecta con inventory, billing, documents
7. ✅ **Tickets Térmicos**: Genera tickets listos para imprimir
8. ✅ **Dashboard en Tiempo Real**: Métricas actualizadas al instante

---

## 📝 Resumen Técnico

| Característica | Detalle |
|----------------|---------|
| **Archivo** | `supabase/functions/server/pos.tsx` |
| **Líneas** | ~780 |
| **Endpoints** | 14 |
| **Estados de Caja** | 3 (Cerrado, Abierto, Suspendido) |
| **Estados de Venta** | 4 (En Progreso, Completada, Cancelada, Suspendida) |
| **Métodos de Pago** | 5 (Efectivo, Tarjeta, Transferencia, Mercado Pago, Múltiple) |
| **Integraciones** | inventory, billing, documents, system |
| **Storage** | Deno KV |

---

**¡El módulo POS convierte ODDY Market en una solución completa para retail físico! 🛒**
