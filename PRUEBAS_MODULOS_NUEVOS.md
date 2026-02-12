# 🧪 Pruebas Rápidas - 5 Módulos Nuevos

**Fecha**: 12 de febrero de 2026  
**Módulos**: system, billing, pos, customs, fulfillment

---

## ⚡ Inicio Rápido

### **1. Iniciar el Servidor**

**Windows:**
```powershell
cd C:\ODDY_Market
start-server.bat
```

**Verificar que arrancó:**
```powershell
curl http://localhost:8000
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "message": "ODDY Market API Server",
  "version": "1.0.0",
  "modules": [
    "system", "entities", "parties", "products", "orders",
    "cart", "auth", "users", "billing", "pos", "customs",
    "fulfillment", "documents", "library", "shipping",
    "inventory", "categories", "integrations"
  ]
}
```

---

## 🌐 TEST MÓDULO SYSTEM

### **Test 1: Calcular IVA en Uruguay**
```powershell
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/taxes/calculate `
  -H "Content-Type: application/json" `
  -d "{\"amount\": 1000, \"country\": \"UY\", \"product_category\": \"goods\"}"
```

**✅ Esperado:** `{"total_tax": 220, "total": 1220}`

### **Test 2: Convertir USD a Peso Uruguayo**
```powershell
# 1. Configurar tasa
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/exchange-rates `
  -H "Content-Type: application/json" `
  -d "{\"base_currency\": \"USD\", \"rates\": {\"UYU\": 40.5}}"

# 2. Convertir
curl -X POST http://localhost:8000/make-server-0dd48dc4/system/convert-currency `
  -H "Content-Type: application/json" `
  -d "{\"amount\": 100, \"from_currency\": \"USD\", \"to_currency\": \"UYU\"}"
```

**✅ Esperado:** `{"converted_amount": 4050, "rate": 40.5}`

---

## 💰 TEST MÓDULO BILLING

### **Test 3: Crear Factura**
```powershell
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices `
  -H "Content-Type: application/json" `
  -d "{\"entity_id\": \"default\", \"customer\": {\"name\": \"Juan Perez\", \"country\": \"UY\"}, \"items\": [{\"description\": \"Producto A\", \"quantity\": 2, \"unit_price\": 100}], \"currency\": \"USD\"}"
```

**✅ Esperado:** Factura con número `A-00000001`, total calculado con IVA

### **Test 4: Registrar Pago**
```powershell
# Reemplaza INVOICE_ID con el ID de la factura creada
curl -X POST http://localhost:8000/make-server-0dd48dc4/billing/invoices/INVOICE_ID/payments `
  -H "Content-Type: application/json" `
  -d "{\"amount\": 100, \"method\": \"CASH\"}"
```

### **Test 5: Dashboard Billing**
```powershell
curl "http://localhost:8000/make-server-0dd48dc4/billing/dashboard?entity_id=default"
```

---

## 🛒 TEST MÓDULO POS

### **Test 6: Crear Caja**
```powershell
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/registers `
  -H "Content-Type: application/json" `
  -d "{\"entity_id\": \"default\", \"name\": \"Caja 1\", \"location\": \"Tienda Principal\"}"
```

### **Test 7: Abrir Turno**
```powershell
# Reemplaza REGISTER_ID con el ID de la caja creada
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/shifts/open `
  -H "Content-Type: application/json" `
  -d "{\"entity_id\": \"default\", \"register_id\": \"REGISTER_ID\", \"cashier_id\": \"user:1\", \"cashier_name\": \"Juan Lopez\", \"opening_cash\": 5000}"
```

### **Test 8: Crear Venta**
```powershell
# Reemplaza SHIFT_ID con el ID del turno creado
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/sales `
  -H "Content-Type: application/json" `
  -d "{\"entity_id\": \"default\", \"shift_id\": \"SHIFT_ID\", \"items\": [{\"description\": \"Leche 1L\", \"quantity\": 2, \"unit_price\": 50}], \"payment_method\": \"CASH\"}"
```

### **Test 9: Completar Venta**
```powershell
# Reemplaza SALE_ID con el ID de la venta creada
curl -X POST http://localhost:8000/make-server-0dd48dc4/pos/sales/SALE_ID/complete `
  -H "Content-Type: application/json" `
  -d "{\"amount_paid\": 150}"
```

### **Test 10: Dashboard POS**
```powershell
curl "http://localhost:8000/make-server-0dd48dc4/pos/dashboard?entity_id=default"
```

---

## 🌍 TEST MÓDULO CUSTOMS

### **Test 11: Crear DUA (Exportación)**
```powershell
curl -X POST http://localhost:8000/make-server-0dd48dc4/customs/declarations `
  -H "Content-Type: application/json" `
  -d "{\"entity_id\": \"default\", \"operation_type\": \"EXPORT\", \"exporter\": {\"name\": \"ODDY Market\", \"rut\": \"217654320018\"}, \"importer\": {\"name\": \"Import Co\", \"tax_id\": \"123456\"}, \"transport\": {\"mode\": \"MARITIME\", \"vessel_name\": \"MSC GULSUN\", \"departure_port\": \"Montevideo\", \"arrival_port\": \"Miami\"}, \"incoterm\": \"FOB\", \"items\": [{\"description\": \"Camisetas\", \"hs_code\": \"6109.10.00\", \"quantity\": 1000, \"unit_value\": 5, \"net_weight_kg\": 2500, \"gross_weight_kg\": 2650, \"country_of_origin\": \"UY\"}], \"valuation\": {\"currency\": \"USD\", \"fob_value\": 5000, \"freight_value\": 500, \"insurance_value\": 100}}"
```

**✅ Esperado:** DUA con número `DUA-2026-000001`, CIF y derechos calculados

### **Test 12: Generar Packing List**
```powershell
curl -X POST http://localhost:8000/make-server-0dd48dc4/customs/packing-list/generate `
  -H "Content-Type: application/json" `
  -d "{\"entity_id\": \"default\", \"shipper\": {\"name\": \"ODDY Market\", \"address\": \"Av. Italia 1234\"}, \"consignee\": {\"name\": \"Import Co\", \"address\": \"123 Main St, Miami\"}, \"transport\": {\"mode\": \"MARITIME\", \"vessel_name\": \"MSC GULSUN\", \"port_of_loading\": \"Montevideo\", \"port_of_discharge\": \"Miami\"}, \"packages\": [{\"marks\": \"ODDY-001\", \"description\": \"Camisetas M\", \"quantity\": 50, \"type\": \"CARTON\", \"length_cm\": 60, \"width_cm\": 40, \"height_cm\": 40, \"net_weight_kg\": 25, \"gross_weight_kg\": 27}]}"
```

**✅ Esperado:** Packing List con número `PL-000001`, totales calculados, PDF generado

### **Test 13: Clasificar Producto (HS Code)**
```powershell
curl -X POST http://localhost:8000/make-server-0dd48dc4/customs/classify-product `
  -H "Content-Type: application/json" `
  -d "{\"description\": \"Camiseta de algodon\"}"
```

### **Test 14: Calcular Derechos Aduaneros**
```powershell
curl -X POST http://localhost:8000/make-server-0dd48dc4/customs/calculate-duties `
  -H "Content-Type: application/json" `
  -d "{\"cif_value\": 5600, \"hs_code\": \"6109.10.00\"}"
```

---

## 📦 TEST MÓDULO FULFILLMENT

### **Test 15: Crear Orden de Fulfillment**
```powershell
curl -X POST http://localhost:8000/make-server-0dd48dc4/fulfillment/orders `
  -H "Content-Type: application/json" `
  -d "{\"entity_id\": \"default\", \"order_id\": \"order:123\", \"customer\": {\"name\": \"Carlos Garcia\", \"email\": \"carlos@email.com\"}, \"shipping_address\": {\"street\": \"Av. Italia 1234\", \"city\": \"Montevideo\", \"country\": \"UY\"}, \"items\": [{\"product_id\": \"prod:1\", \"sku\": \"CAM-BLA-M\", \"description\": \"Camiseta Blanca M\", \"quantity\": 2, \"location\": \"A-12-3\", \"barcode\": \"7891234567890\"}], \"priority\": \"NORMAL\"}"
```

**✅ Esperado:** Orden con número `FFL-00000001`, estado `PENDING`

### **Test 16: Asignar Picker**
```powershell
# Reemplaza FULFILLMENT_ORDER_ID con el ID de la orden creada
curl -X POST http://localhost:8000/make-server-0dd48dc4/fulfillment/orders/FULFILLMENT_ORDER_ID/assign-picker `
  -H "Content-Type: application/json" `
  -d "{\"picker_id\": \"user:456\"}"
```

**✅ Esperado:** Estado cambia a `PICKING`

### **Test 17: Picking Item**
```powershell
# Reemplaza FULFILLMENT_ORDER_ID con el ID de la orden
curl -X POST http://localhost:8000/make-server-0dd48dc4/fulfillment/orders/FULFILLMENT_ORDER_ID/pick-item `
  -H "Content-Type: application/json" `
  -d "{\"product_id\": \"prod:1\", \"picked_quantity\": 2}"
```

**✅ Esperado:** Item marcado como picked, estado cambia a `PACKING` si todos completados

### **Test 18: Packing**
```powershell
# Reemplaza FULFILLMENT_ORDER_ID con el ID de la orden
curl -X POST http://localhost:8000/make-server-0dd48dc4/fulfillment/orders/FULFILLMENT_ORDER_ID/pack `
  -H "Content-Type: application/json" `
  -d "{\"packer_id\": \"user:789\", \"packages\": [{\"type\": \"BOX_MEDIUM\", \"weight_kg\": 1.5, \"length_cm\": 40, \"width_cm\": 30, \"height_cm\": 20, \"items\": [{\"product_id\": \"prod:1\", \"quantity\": 2}]}]}"
```

**✅ Esperado:** Estado cambia a `READY`

### **Test 19: Generar Picking List**
```powershell
# Reemplaza FULFILLMENT_ORDER_ID con el ID de la orden
curl -X POST http://localhost:8000/make-server-0dd48dc4/fulfillment/orders/FULFILLMENT_ORDER_ID/picking-list
```

**✅ Esperado:** Picking List en formato texto profesional

### **Test 20: Dashboard Fulfillment**
```powershell
curl "http://localhost:8000/make-server-0dd48dc4/fulfillment/dashboard?entity_id=default"
```

---

## ✅ Checklist de Verificación

### SYSTEM
- [ ] Impuestos de Uruguay calculan correctamente (22%)
- [ ] Conversión USD → UYU funciona
- [ ] Conversión kg → lb funciona

### BILLING
- [ ] Factura creada con número automático
- [ ] Pago registrado correctamente
- [ ] Dashboard muestra métricas

### POS
- [ ] Caja creada
- [ ] Turno abierto
- [ ] Venta completada
- [ ] Dashboard muestra totales

### CUSTOMS
- [ ] DUA generado con CIF calculado
- [ ] Packing List profesional generado
- [ ] Derechos aduaneros calculados

### FULFILLMENT
- [ ] Orden de fulfillment creada
- [ ] Picking completado
- [ ] Packing completado
- [ ] Picking List generado

---

## 🐛 Troubleshooting

### **Error: "Module not found"**
```powershell
# Verificar que el servidor esté corriendo
curl http://localhost:8000
```

### **Error: "Deno.openKv is not a function"**
✅ Ya está solucionado con SimpleKV en storage.tsx

### **Error: "Entity not found"**
✅ Usa `entity_id: "default"` en todos los requests

---

## 📊 Resultados Esperados

Después de ejecutar todos los tests:

- ✅ **SYSTEM**: Tasas de cambio configuradas, impuestos calculados
- ✅ **BILLING**: 1+ facturas creadas, dashboard con métricas
- ✅ **POS**: 1+ caja, 1+ turno, 1+ venta
- ✅ **CUSTOMS**: 1+ DUA, 1+ Packing List
- ✅ **FULFILLMENT**: 1+ orden con picking completado

---

**¡Completa todos los tests y marca con ✅ los que funcionen correctamente! 🎯**
