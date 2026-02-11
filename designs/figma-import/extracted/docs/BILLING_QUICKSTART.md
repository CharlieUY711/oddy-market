# 🚀 Quick Start - Sistema de Facturación con Fixed

## ⚡ Configuración Rápida (5 minutos)

### 1️⃣ Obtener Credenciales de Fixed

1. **Registrate en Fixed:**
   - Ir a [https://fixed.uy](https://fixed.uy)
   - Crear cuenta empresarial
   - Completar datos fiscales (RUT, razón social, etc.)

2. **Acceder al Panel de Desarrolladores:**
   - Login en [https://app.fixed.uy](https://app.fixed.uy)
   - Ir a **Configuración → API**
   - Generar nueva API Key

3. **Copiar credenciales:**
   ```
   API Key: fxd_sk_xxxxxxxxxxxxxxxxxx
   Environment: sandbox (para testing)
   ```

---

### 2️⃣ Configurar Variables de Entorno

En el dashboard de Supabase:

1. Ir a **Edge Functions → Settings → Environment Variables**
2. Agregar las siguientes variables:

```env
FIXED_API_KEY=fxd_sk_xxxxxxxxxxxxxxxxxx
FIXED_ENVIRONMENT=sandbox
```

⚠️ **Importante:** 
- Usar `sandbox` para testing (no tiene validez fiscal)
- Usar `production` cuando estés listo para facturas reales

---

### 3️⃣ Verificar Instalación

1. **Abrir el panel de administración:**
   - Ir a tu ecommerce
   - Login como administrador
   - Abrir panel de administración

2. **Acceder a Facturación:**
   - Click en "Facturación" en el sidebar
   - Deberías ver el dashboard vacío (sin errores)

3. **Verificar conexión:**
   - Las estadísticas deberían mostrarse (todo en 0)
   - No deberían aparecer mensajes de error

✅ **Si ves el dashboard → ¡Todo configurado correctamente!**

---

## 📋 Uso Básico

### Crear Primera Factura

**Opción A: Desde una Orden (Automático)**

Cuando un cliente completa una compra, puedes generar la factura automáticamente:

```typescript
// En el checkout, después de confirmar el pago:
const response = await fetch(`${baseUrl}/billing/facturas/create`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: order.id,
    customer: {
      documentType: 'CI',           // CI, RUT, DNI, etc.
      documentNumber: '12345678',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+598 99 123 456',
      address: {
        street: '18 de Julio',
        number: '1234',
        city: 'Montevideo',
        state: 'Montevideo',
        zipCode: '11100',
        country: 'Uruguay',
      },
    },
    items: order.items,             // Array de productos
    totals: {
      subtotal: order.subtotal,     // En centavos
      discount: order.discount || 0,
      tax: order.tax,               // IVA
      total: order.total,
    },
    notes: 'Gracias por su compra',
  }),
});

const { invoice } = await response.json();
console.log('Factura creada:', invoice.invoiceNumber);
```

**Opción B: Manual desde el Panel**

1. Ir a **Panel Admin → Facturación**
2. Click en **"Nueva Factura"**
3. Completar formulario (próximamente)
4. Click en **"Generar Factura"**

---

### Ver Facturas

1. **Panel de Administración:**
   - Ir a **Facturación**
   - Ver listado completo de facturas

2. **Buscar factura específica:**
   - Usar barra de búsqueda
   - Buscar por número (ej: FAC-00001)
   - O buscar por nombre de cliente

3. **Filtrar por estado:**
   - Todas
   - Emitidas
   - Anuladas

---

### Descargar PDF

**Desde la UI:**
1. En el listado de facturas
2. Click en ícono de descarga (Download)
3. Se abre PDF en nueva pestaña

**Programáticamente:**
```typescript
const response = await fetch(
  `${baseUrl}/billing/facturas/${invoiceId}/pdf`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
const { pdfUrl } = await response.json();
window.open(pdfUrl, '_blank');
```

---

### Anular Factura

⚠️ **Importante:** Solo se pueden anular facturas con estado "emitida"

**Desde la UI:**
1. Click en factura para ver detalles
2. Click en botón **"Anular"** (rojo)
3. Confirmar acción
4. Ingresar motivo de anulación
5. Confirmar

**Programáticamente:**
```typescript
await fetch(`${baseUrl}/billing/facturas/${invoiceId}/anular`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    motivo: 'Cliente solicitó devolución',
  }),
});
```

---

### Crear Remito

Similar a factura, pero sin información de precios:

```typescript
const response = await fetch(`${baseUrl}/billing/remitos/create`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    orderId: order.id,
    customer: {
      documentType: 'CI',
      documentNumber: '12345678',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      address: {...},
    },
    items: order.items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      sku: item.sku,
    })),
    deliveryDate: '2026-02-15',
    notes: 'Entregar entre 9am y 5pm',
  }),
});
```

---

## 📊 Ver Estadísticas

Las estadísticas se actualizan en tiempo real en el dashboard:

- **Total de facturas:** Todas las facturas creadas
- **Total de remitos:** Todos los remitos creados
- **Facturas activas:** Facturas emitidas (no anuladas)
- **Facturación total:** Suma de todas las facturas emitidas
- **Facturas del mes:** Facturas del mes actual
- **Facturación mensual:** Total facturado este mes

---

## 🎯 Ejemplos de Uso Común

### Ejemplo 1: Factura Simple

```typescript
// Cliente compró 1 producto por $500 + IVA
const invoice = await createInvoice({
  customer: {
    documentType: 'CI',
    documentNumber: '12345678',
    name: 'María González',
    email: 'maria@example.com',
  },
  items: [{
    id: 'prod-123',
    name: 'Smartphone Galaxy S24',
    quantity: 1,
    price: 50000, // $500.00 en centavos
  }],
  totals: {
    subtotal: 50000,
    discount: 0,
    tax: 11000,    // 22% IVA
    total: 61000,
  },
});
```

### Ejemplo 2: Factura con Descuento

```typescript
const invoice = await createInvoice({
  customer: {...},
  items: [{
    id: 'prod-456',
    name: 'Laptop HP Pavilion',
    quantity: 1,
    price: 100000,    // $1,000.00
    discount: 10000,  // 10% descuento
  }],
  totals: {
    subtotal: 100000,
    discount: 10000,
    tax: 19800,       // 22% IVA sobre $900
    total: 109800,
  },
});
```

### Ejemplo 3: Factura Múltiples Items

```typescript
const invoice = await createInvoice({
  customer: {...},
  items: [
    {
      id: 'prod-1',
      name: 'Mouse Logitech',
      quantity: 2,
      price: 3000,    // $30 c/u
    },
    {
      id: 'prod-2',
      name: 'Teclado Mecánico',
      quantity: 1,
      price: 8000,    // $80
    },
  ],
  totals: {
    subtotal: 14000,  // (30*2) + 80
    discount: 0,
    tax: 3080,        // 22% IVA
    total: 17080,
  },
});
```

---

## ⚠️ Troubleshooting

### Error: "Fixed API not configured"

**Solución:**
- Verificar que `FIXED_API_KEY` esté configurada
- Verificar que no haya espacios extras en la key
- Reiniciar Edge Functions después de agregar variables

### Error: "Unauthorized"

**Solución:**
- Verificar que estés logueado
- Verificar token de autenticación
- Endpoints de facturación requieren autenticación

### No se genera el PDF

**Solución:**
- Verificar que la factura exista en Fixed
- Esperar unos segundos (Fixed genera PDF asíncronamente)
- Intentar de nuevo

### Numeración incorrecta

**Solución:**
- La numeración es automática y correlativa
- No se puede modificar manualmente
- Si necesitas reiniciar la numeración, contactar soporte

---

## 📱 Soporte

### Fixed
- **Email:** soporte@fixed.uy
- **Docs:** https://docs.fixed.uy
- **Status:** https://status.fixed.uy

### DGI Uruguay
- **Web:** https://dgi.gub.uy
- **CFE:** https://cfe.dgi.gub.uy
- **Tel:** 1344

---

## 🎓 Conceptos Clave

### CFE (Comprobante Fiscal Electrónico)
- Documento digital con validez fiscal
- Firmado digitalmente
- Registrado ante DGI
- Reemplaza factura de papel

### e-Factura vs e-Remito
- **e-Factura:** Documento fiscal con precios (comprobante de venta)
- **e-Remito:** Documento de entrega sin precios (comprobante de envío)

### Numeración Correlativa
- Obligatoria por DGI
- No se pueden saltar números
- No se pueden duplicar
- Secuencia continua: FAC-00001, FAC-00002, FAC-00003...

### Anulación
- Registra la anulación ante DGI
- Requiere motivo
- No se puede revertir
- La numeración NO se reutiliza

---

## 🚀 ¡Listo!

Ya tenés todo configurado para empezar a facturar electrónicamente.

**Próximos pasos recomendados:**
1. ✅ Crear factura de prueba en sandbox
2. ✅ Verificar que se genere correctamente
3. ✅ Descargar PDF de prueba
4. ✅ Probar anulación
5. 🔄 Cuando todo funcione, cambiar a `production`

**¡Buena facturación! 📄💰**
