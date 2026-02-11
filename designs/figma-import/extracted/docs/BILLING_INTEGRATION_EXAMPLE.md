# 🔧 Ejemplo de Integración - Sistema de Facturación

## Integrar Facturación Automática en el Checkout

Este documento muestra cómo integrar el sistema de facturación electrónica en el flujo de checkout de tu ecommerce.

---

## 📋 Escenario

Cuando un cliente completa una compra:
1. Se procesa el pago
2. Se crea la orden
3. **Se genera automáticamente la factura electrónica**
4. Se envía email de confirmación con la factura

---

## 💻 Código de Ejemplo

### 1. Importar el Helper

```typescript
import {
  createInvoiceFromOrder,
  createRemitoFromOrder,
  calculateIVA,
  formatUYU,
} from "/src/app/utils/billing-helper";
```

### 2. Modificar el Checkout Component

```typescript
// src/app/components/Checkout.tsx

const handleCompletePurchase = async () => {
  try {
    setLoading(true);

    // 1. Procesar pago (Mercado Pago, PayPal, Plexo, etc.)
    const payment = await processPayment(paymentMethod, cartTotal);
    
    if (!payment.success) {
      throw new Error("Payment failed");
    }

    // 2. Crear orden en la base de datos
    const order = await createOrder({
      customer: {
        documentType: formData.documentType || "CI",
        documentNumber: formData.documentNumber,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          number: formData.streetNumber,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: "Uruguay",
        },
      },
      items: cartItems,
      paymentMethod: paymentMethod,
      paymentId: payment.id,
      status: "completed",
    });

    // 3. 🆕 GENERAR FACTURA ELECTRÓNICA AUTOMÁTICAMENTE
    const invoiceResult = await createInvoiceFromOrder(order.id, {
      customer: {
        documentType: formData.documentType || "CI",
        documentNumber: formData.documentNumber,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          number: formData.streetNumber,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: "Uruguay",
        },
      },
      items: cartItems.map(item => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
      })),
      totals: {
        subtotal: cartSubtotal,
        discount: cartDiscount,
        tax: calculateIVA(cartSubtotal - cartDiscount), // IVA 22%
        total: cartTotal,
      },
      paymentMethod: paymentMethod,
      notes: formData.notes || "",
    });

    if (invoiceResult.success) {
      console.log("✅ Factura generada:", invoiceResult.invoice.invoiceNumber);
      
      // 4. 🆕 GENERAR REMITO SI ES ENVÍO A DOMICILIO
      if (formData.requiresShipping) {
        const remitoResult = await createRemitoFromOrder(order.id, {
          customer: {
            documentType: formData.documentType || "CI",
            documentNumber: formData.documentNumber,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: {
              street: formData.street,
              number: formData.streetNumber,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: "Uruguay",
            },
          },
          items: cartItems.map(item => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            quantity: item.quantity,
          })),
          deliveryDate: formData.deliveryDate || new Date().toISOString().split("T")[0],
          notes: `Entregar a: ${formData.name}. Tel: ${formData.phone}`,
        });

        if (remitoResult.success) {
          console.log("✅ Remito generado:", remitoResult.remito.remitoNumber);
        }
      }
    } else {
      console.error("❌ Error generando factura:", invoiceResult.error);
      // No bloqueamos la compra si falla la factura
      // Se puede generar manualmente después
    }

    // 5. Limpiar carrito y mostrar éxito
    clearCart();
    showSuccessMessage({
      orderId: order.id,
      invoiceNumber: invoiceResult.invoice?.invoiceNumber,
      total: cartTotal,
    });

    // 6. Redireccionar a página de confirmación
    navigate(`/order-confirmation/${order.id}`);

  } catch (error) {
    console.error("Error completing purchase:", error);
    showErrorMessage(error.message);
  } finally {
    setLoading(false);
  }
};
```

### 3. Agregar Campos de Documento en el Formulario

```tsx
// Agregar estos campos al formulario de checkout:

<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium mb-2">
      Tipo de Documento
    </label>
    <select
      value={formData.documentType}
      onChange={(e) => setFormData({...formData, documentType: e.target.value})}
      className="w-full px-4 py-2 border rounded-lg"
      required
    >
      <option value="CI">Cédula de Identidad (CI)</option>
      <option value="RUT">RUT</option>
      <option value="DNI">DNI</option>
      <option value="PASAPORTE">Pasaporte</option>
    </select>
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">
      Número de Documento *
    </label>
    <input
      type="text"
      value={formData.documentNumber}
      onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
      placeholder="12345678"
      className="w-full px-4 py-2 border rounded-lg"
      required
    />
    <p className="text-xs text-muted-foreground mt-1">
      Requerido para emitir factura electrónica
    </p>
  </div>

  {/* Resto de campos: nombre, email, dirección, etc. */}
</div>
```

### 4. Mostrar Factura en Página de Confirmación

```tsx
// src/app/components/OrderConfirmation.tsx

import { downloadInvoicePDF, formatUYU } from "/src/app/utils/billing-helper";

export function OrderConfirmation({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    // Cargar orden
    const orderData = await fetchOrder(orderId);
    setOrder(orderData);

    // Cargar factura si existe
    if (orderData.invoiceId) {
      const invoiceData = await fetchInvoice(orderData.invoiceId);
      setInvoice(invoiceData);
    }
  };

  const handleDownloadInvoice = async () => {
    if (invoice) {
      await downloadInvoicePDF(invoice.id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">¡Compra Exitosa!</h1>
        <p className="text-muted-foreground">
          Tu orden #{order?.id} ha sido confirmada
        </p>
      </div>

      {/* Información de la Factura */}
      {invoice && (
        <div className="bg-white border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Factura Electrónica</h3>
              <p className="text-sm text-muted-foreground">
                {invoice.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatUYU(invoice.totals.total)}
              </p>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                {invoice.status}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Cliente:</span>
              <span className="font-medium">{invoice.customer.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Documento:</span>
              <span className="font-medium">
                {invoice.customer.documentType} {invoice.customer.documentNumber}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fecha:</span>
              <span className="font-medium">
                {new Date(invoice.createdAt).toLocaleDateString("es-UY")}
              </span>
            </div>
          </div>

          <button
            onClick={handleDownloadInvoice}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="w-5 h-5" />
            Descargar Factura (PDF)
          </button>
        </div>
      )}

      {/* Resumen de la Orden */}
      <div className="bg-white border border-border rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4">Resumen de la Orden</h3>
        
        {order?.items.map((item) => (
          <div key={item.id} className="flex justify-between py-2">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                Cantidad: {item.quantity}
              </p>
            </div>
            <p className="font-medium">{formatUYU(item.price * item.quantity)}</p>
          </div>
        ))}

        <div className="border-t border-border mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatUYU(order?.totals.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA (22%):</span>
            <span>{formatUYU(order?.totals.tax || 0)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">{formatUYU(order?.totals.total || 0)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Se ha enviado un email de confirmación con tu factura a:</p>
        <p className="font-medium">{order?.customer.email}</p>
      </div>
    </div>
  );
}
```

---

## 📧 Email con Factura (Opcional con Resend)

```typescript
// Cuando implementes Resend, podrás enviar la factura por email:

import { sendEmail } from "/src/app/utils/email-helper";

// Después de generar la factura:
if (invoiceResult.success) {
  await sendEmail({
    to: customer.email,
    subject: `Factura ${invoiceResult.invoice.invoiceNumber} - Tu Tienda`,
    template: "invoice",
    data: {
      customerName: customer.name,
      invoiceNumber: invoiceResult.invoice.invoiceNumber,
      total: formatUYU(invoiceResult.invoice.totals.total),
      pdfUrl: invoiceResult.invoice.pdfUrl,
      items: invoiceResult.invoice.items,
    },
  });
}
```

---

## 🎯 Flujo Completo

```
1. Cliente completa formulario de checkout
   ├─ Nombre, email, teléfono
   ├─ Tipo de documento (CI, RUT, DNI, etc.)
   ├─ Número de documento ⚠️ OBLIGATORIO
   └─ Dirección completa

2. Cliente selecciona método de pago
   └─ Mercado Pago / PayPal / Plexo / etc.

3. Se procesa el pago
   └─ ✅ Pago confirmado

4. Se crea la orden
   └─ Status: "completed"

5. 🆕 Se genera factura automáticamente
   ├─ Numeración automática (FAC-00001)
   ├─ CFE generado en Fixed
   ├─ PDF disponible
   └─ Guardado en base de datos

6. 🆕 Se genera remito (si aplica)
   └─ Para envíos a domicilio

7. Se envía email de confirmación
   ├─ Confirmación de orden
   ├─ Link de descarga de factura
   └─ Detalles de envío

8. Cliente ve página de confirmación
   ├─ Resumen de orden
   ├─ Factura electrónica
   └─ Botón de descarga PDF
```

---

## ⚠️ Manejo de Errores

```typescript
// Siempre manejar errores de facturación sin bloquear la compra:

try {
  const invoiceResult = await createInvoiceFromOrder(order.id, {...});
  
  if (!invoiceResult.success) {
    // Registrar error pero NO bloquear la compra
    console.error("Error generating invoice:", invoiceResult.error);
    
    // Notificar al admin
    await notifyAdmin({
      type: "invoice_error",
      orderId: order.id,
      error: invoiceResult.error,
    });
    
    // Guardar flag para generar factura manualmente después
    await updateOrder(order.id, {
      needsInvoice: true,
      invoiceError: invoiceResult.error,
    });
  }
} catch (error) {
  // Error crítico - registrar pero continuar
  console.error("Critical error in billing:", error);
}

// La compra continúa normalmente
// La factura se puede generar manualmente después desde el panel admin
```

---

## 🧪 Testing

### Datos de Prueba (Sandbox)

```typescript
// Cliente de prueba para sandbox:
const testCustomer = {
  documentType: "CI",
  documentNumber: "12345678",
  name: "Juan Pérez Test",
  email: "test@example.com",
  phone: "+598 99 123 456",
  address: {
    street: "18 de Julio",
    number: "1234",
    city: "Montevideo",
    state: "Montevideo",
    zipCode: "11100",
    country: "Uruguay",
  },
};

// Producto de prueba:
const testItems = [
  {
    id: "test-1",
    sku: "TEST-001",
    name: "Producto de Prueba",
    quantity: 1,
    price: 10000, // $100 en centavos
  },
];

// Totales de prueba:
const testTotals = {
  subtotal: 10000,
  discount: 0,
  tax: calculateIVA(10000), // 2200 (22%)
  total: 12200,
};
```

---

## ✅ Checklist de Implementación

- [x] Helper de facturación creado (`billing-helper.ts`)
- [ ] Campos de documento agregados al checkout
- [ ] Validación de documento implementada
- [ ] Integración con flujo de pago
- [ ] Generación automática de factura al completar orden
- [ ] Generación de remito para envíos
- [ ] Página de confirmación con factura
- [ ] Botón de descarga de PDF
- [ ] Manejo de errores implementado
- [ ] Testing en sandbox completado
- [ ] Email de confirmación con factura (opcional)
- [ ] Documentación para el equipo
- [ ] Variables de entorno configuradas
- [ ] Testing en producción

---

## 📚 Recursos Adicionales

- [Documentación Completa](/docs/BILLING_SYSTEM.md)
- [Quick Start Guide](/docs/BILLING_QUICKSTART.md)
- [Fixed API Docs](https://docs.fixed.uy)
- [DGI Uruguay - CFE](https://cfe.dgi.gub.uy)

---

**¡Listo para implementar!** 🚀📄
