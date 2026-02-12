# 🌐 URLs de Producción - ODDY Market Backend

**Deploy completado:** 12 de febrero de 2026  
**Status:** ✅ ACTIVO

---

## 🚀 URLs Disponibles

### **🎯 BACKEND API (PRODUCCIÓN) - USA ESTA**
```
https://oddy-market-62.oddy123.deno.net
```
**Uso:** API REST para tu frontend en producción
**Status:** ✅ FUNCIONANDO - 18 módulos activos

### **Frontend (Producción)**
```
https://oddy-market.oddy123.deno.net
```
**Uso:** Sitio web React

---

## ✅ Test Rápido

### **1. Health Check**
```bash
curl https://oddy-market.oddy123.deno.net
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

### **2. Test SYSTEM - Calcular IVA Uruguay**
```bash
curl -X POST https://oddy-market.oddy123.deno.net/make-server-0dd48dc4/system/taxes/calculate \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "country": "UY", "product_category": "goods"}'
```

**Respuesta esperada:**
```json
{
  "calculation": {
    "subtotal": 1000,
    "taxes": [{"name": "IVA Básico", "rate": 0.22, "amount": 220}],
    "total_tax": 220,
    "total": 1220,
    "currency": "UYU"
  }
}
```

### **3. Test BILLING - Crear Factura**
```bash
curl -X POST https://oddy-market.oddy123.deno.net/make-server-0dd48dc4/billing/invoices \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "default", "customer": {"name": "Juan Perez", "country": "UY"}, "items": [{"description": "Producto A", "quantity": 2, "unit_price": 100}], "currency": "USD"}'
```

### **4. Test CUSTOMS - Generar Packing List**
```bash
curl -X POST https://oddy-market.oddy123.deno.net/make-server-0dd48dc4/customs/packing-list/generate \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "default", "shipper": {"name": "ODDY Market"}, "consignee": {"name": "Import Co"}, "packages": [{"marks": "ODDY-001", "description": "Camisetas", "quantity": 50, "type": "CARTON", "length_cm": 60, "width_cm": 40, "height_cm": 40, "net_weight_kg": 25, "gross_weight_kg": 27}]}'
```

### **5. Test POS - Dashboard**
```bash
curl https://oddy-market.oddy123.deno.net/make-server-0dd48dc4/pos/dashboard?entity_id=default
```

### **6. Test FULFILLMENT - Dashboard**
```bash
curl https://oddy-market.oddy123.deno.net/make-server-0dd48dc4/fulfillment/dashboard?entity_id=default
```

---

## 📊 Endpoints Disponibles

### **18 Módulos Activos:**

1. **system** (13 endpoints) - Impuestos, monedas, unidades
2. **billing** (16 endpoints) - Facturación, pagos, reportes
3. **pos** (14 endpoints) - Punto de venta, turnos, arqueo
4. **customs** (11 endpoints) - DUA, packing lists, certificados
5. **fulfillment** (12 endpoints) - Picking, packing, warehouse
6. **entities** (8 endpoints) - Multi-tenant
7. **parties** (14 endpoints) - Clientes, proveedores
8. **products** (12 endpoints) - Artículos, variantes
9. **orders** (10 endpoints) - Pedidos
10. **cart** (9 endpoints) - Carrito
11. **auth** (7 endpoints) - Autenticación
12. **users** (9 endpoints) - Usuarios, RBAC
13. **documents** (34 endpoints) - Documentos, tickets, etiquetas
14. **library** (9 endpoints) - Archivos
15. **shipping** (9 endpoints) - Envíos, GPS
16. **inventory** (8 endpoints) - Stock
17. **categories** (8 endpoints) - Categorías
18. **integrations** (18 endpoints) - ML, FB, IG, WA

**Total: 201 endpoints en producción** 🔥

---

## 🔧 Configurar Frontend

### **En tu frontend React (src/config.js):**

```javascript
// Desarrollo
export const API_URL = 'https://oddy-market-73aqwm3q7n9j.oddy123.deno.net';

// Producción
export const API_URL = 'https://oddy-market.oddy123.deno.net';
```

### **Ejemplo de uso:**

```javascript
// Calcular IVA
const response = await fetch(`${API_URL}/make-server-0dd48dc4/system/taxes/calculate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 1000,
    country: 'UY',
    product_category: 'goods'
  })
});

const data = await response.json();
console.log(data); // { total_tax: 220, total: 1220 }
```

---

## 📈 Métricas de Deploy

- **Build time:** 2m 10s
- **Deploy time:** 6.2s
- **Status:** ✅ Serving traffic
- **Context:** Production
- **Branch:** main

---

## 🔄 Auto-Deploy Configurado

Cada vez que hagas `git push` a la rama `main`:
- ✅ Deno Deploy detecta el cambio automáticamente
- ✅ Rebuilds el proyecto
- ✅ Deploya la nueva versión
- ✅ Sin downtime (zero-downtime deployment)

---

## 📝 Notas Importantes

1. **Storage:** Usando SimpleKV (in-memory) para desarrollo
   - Los datos se pierden al reiniciar
   - Para producción real, migrar a Deno KV

2. **CORS:** Está configurado para aceptar todos los orígenes (`*`)
   - Para producción, restringir a tu dominio

3. **Rate Limits (Deno Deploy Gratis):**
   - 100,000 requests/día
   - 100 horas CPU/mes
   - 100 GB bandwidth/mes

---

## 🎯 Próximos Pasos

1. ✅ Probar todos los endpoints (usar `PRUEBAS_MODULOS_NUEVOS.md`)
2. ✅ Conectar frontend con estas URLs
3. ✅ Configurar dominio custom (opcional): `api.oddymarket.com`
4. ✅ Configurar Deno KV para persistencia de datos
5. ✅ Configurar variables de entorno en Deno Deploy

---

**¡Tu ERP completo está en producción! 🎉**
