# 🚀 Backend API en Producción - ODDY Market

**Status:** ✅ FUNCIONANDO  
**Deploy:** 12 de febrero de 2026  
**Módulos activos:** 18  
**Endpoints totales:** 201

---

## 🌐 URL Principal del Backend

```
https://oddy-market-62.oddy123.deno.net
```

---

## ✅ Test Rápido

Abre esta URL en tu navegador:
```
https://oddy-market-62.oddy123.deno.net
```

**Deberías ver:**
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

## 🔧 Configurar en tu Frontend

### **Opción 1: Crear archivo de configuración**

Crea `src/config/api.js`:

```javascript
// src/config/api.js

// URL del backend en producción
export const API_BASE_URL = 'https://oddy-market-62.oddy123.deno.net';

// Prefijo para todos los endpoints
export const API_PREFIX = '/make-server-0dd48dc4';

// URL completa
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

// Helper para hacer requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response.json();
};
```

### **Opción 2: Variable de entorno**

En tu archivo `.env` o `.env.production`:

```bash
VITE_API_URL=https://oddy-market-62.oddy123.deno.net/make-server-0dd48dc4
```

Luego en tu código:

```javascript
const API_URL = import.meta.env.VITE_API_URL;

// Ejemplo de uso
const response = await fetch(`${API_URL}/system/taxes/calculate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 1000,
    country: 'UY',
    product_category: 'goods'
  })
});
```

---

## 📝 Ejemplos de Uso

### **1. Calcular IVA (Uruguay)**

```javascript
const calcularIVA = async (monto) => {
  const response = await fetch('https://oddy-market-62.oddy123.deno.net/make-server-0dd48dc4/system/taxes/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: monto,
      country: 'UY',
      product_category: 'goods'
    })
  });
  const data = await response.json();
  return data; // { total_tax: 220, total: 1220 }
};
```

### **2. Crear Carrito**

```javascript
const crearCarrito = async (entityId, userId) => {
  const response = await fetch('https://oddy-market-62.oddy123.deno.net/make-server-0dd48dc4/carts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entity_id: entityId,
      user_id: userId,
      currency: 'USD'
    })
  });
  return await response.json();
};
```

### **3. Buscar Productos**

```javascript
const buscarProductos = async (query) => {
  const response = await fetch(
    `https://oddy-market-62.oddy123.deno.net/make-server-0dd48dc4/products/search?q=${encodeURIComponent(query)}&entity_id=default`
  );
  return await response.json();
};
```

### **4. Generar Factura**

```javascript
const generarFactura = async (datos) => {
  const response = await fetch('https://oddy-market-62.oddy123.deno.net/make-server-0dd48dc4/billing/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entity_id: 'default',
      customer: {
        name: datos.cliente,
        country: 'UY'
      },
      items: datos.items,
      currency: 'USD'
    })
  });
  return await response.json();
};
```

---

## 📊 Módulos Disponibles

| Módulo | Endpoints | Descripción |
|--------|-----------|-------------|
| **system** | 13 | Impuestos, monedas, unidades |
| **billing** | 16 | Facturación, pagos, reportes |
| **pos** | 14 | Punto de venta, turnos, arqueo |
| **customs** | 11 | DUA, packing lists, certificados |
| **fulfillment** | 12 | Picking, packing, warehouse |
| **entities** | 8 | Multi-tenant |
| **parties** | 14 | Clientes, proveedores |
| **products** | 12 | Artículos, variantes |
| **orders** | 10 | Pedidos |
| **cart** | 9 | Carrito |
| **auth** | 7 | Autenticación |
| **users** | 9 | Usuarios, RBAC |
| **documents** | 34 | Documentos, tickets, etiquetas |
| **library** | 9 | Archivos |
| **shipping** | 9 | Envíos, GPS |
| **inventory** | 8 | Stock |
| **categories** | 8 | Categorías |
| **integrations** | 18 | ML, FB, IG, WA |

**Total: 201 endpoints** 🔥

---

## 🧪 Probar Todos los Módulos

Para probar todos los endpoints, usa el archivo:

```
PRUEBAS_MODULOS_NUEVOS.md
```

Este archivo contiene 20 tests completos con ejemplos de cURL.

---

## 🔒 Seguridad

- ✅ CORS habilitado para todos los orígenes
- ✅ HTTPS obligatorio
- ✅ Headers de seguridad configurados
- ⚠️ Para producción real: configurar dominios permitidos

---

## 📈 Monitoreo

Dashboard de Deno Deploy:
```
https://dash.deno.com/projects/oddy-market-62
```

Aquí puedes ver:
- Logs en tiempo real
- Métricas de uso
- Requests por segundo
- Errores

---

## 🎯 Próximos Pasos

1. ✅ **Conectar frontend** con esta URL
2. ✅ **Probar endpoints** con `PRUEBAS_MODULOS_NUEVOS.md`
3. ✅ **Configurar dominio custom** (opcional): `api.oddymarket.com`
4. ✅ **Migrar a Deno KV** para persistencia real

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica la URL exacta
2. Revisa los logs en Deno Deploy
3. Asegúrate de incluir `/make-server-0dd48dc4` en todas las rutas

---

**¡Tu ERP completo está funcionando en producción! 🎉**
