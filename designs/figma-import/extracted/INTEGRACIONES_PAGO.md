# 🛒 Sistema de Integraciones de Pago y Facturación - Ecommerce

## 📋 Resumen

Sistema completo de integraciones de pago y facturación electrónica que incluye:

### ✅ Implementado

1. **Mercado Libre** - Sincronización bidireccional completa
   - Publicación automática de productos
   - Sincronización de inventario
   - Importación de órdenes
   - Actualización de stock desde ML

2. **Mercado Pago** - Pasarela de pago
   - Creación de preferencias de pago
   - Webhooks para notificaciones
   - Soporte para todos los métodos de pago de MP

3. **PayPal** - Pagos internacionales
   - Creación de órdenes
   - Captura de pagos
   - Redirección segura

4. **Stripe** - Procesamiento de tarjetas
   - Payment Intents
   - Soporte para Visa, Mastercard, Amex
   - Webhooks de confirmación

5. **Plexo** 🆕 - Pasarela uruguaya
   - Procesamiento de pagos en UYU
   - Tarjetas locales e internacionales
   - Webhooks de estado
   - Ver [Documentación de Plexo](/docs/PLEXO_INTEGRATION.md)

6. **Fixed** 🆕 📄 - **Facturación Electrónica Uruguay**
   - Generación de facturas electrónicas (CFE)
   - Generación de remitos
   - Numeración automática
   - Cumplimiento DGI Uruguay
   - PDFs descargables
   - Anulación de facturas
   - Dashboard de facturación
   - Ver [Documentación de Facturación](/docs/BILLING_SYSTEM.md)

7. **Panel de Administración**
   - Dashboard de estado de integraciones
   - Panel completo de facturación
   - Sincronización manual/automática
   - Logs y resultados de sincronización
   - Configuración de API keys

8. **Checkout Mejorado**
   - Selección de método de pago
   - Formulario de datos del cliente
   - Campos para facturación (documento, dirección)
   - Resumen de orden
   - Integración con todas las pasarelas
   - Generación automática de factura

## 🔧 Configuración

### 1. Variables de Entorno

Agrega las siguientes variables de entorno en tu proyecto de Supabase:
**Settings → Edge Functions → Secrets**

#### Mercado Libre
```
MERCADOLIBRE_ACCESS_TOKEN=tu_access_token
MERCADOLIBRE_USER_ID=tu_user_id
```

Para obtener las credenciales:
1. Registrate en https://developers.mercadolibre.com.ar/
2. Crea una aplicación
3. Obtén el access token mediante OAuth
4. Tu user_id está en tu perfil de ML

#### Mercado Pago
```
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
```

Para obtener las credenciales:
1. Ingresa a https://www.mercadopago.com.ar/developers/
2. Ve a "Tus integraciones" → "Credenciales"
3. Copia el Access Token de producción

#### PayPal
```
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_SECRET=tu_secret
```

Para obtener las credenciales:
1. Ingresa a https://developer.paypal.com/
2. Crea una aplicación en "My Apps & Credentials"
3. Copia el Client ID y Secret

#### Stripe
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Para obtener las credenciales:
1. Ingresa a https://dashboard.stripe.com/
2. Ve a "Developers" → "API keys"
3. Copia las claves de test o producción

### 2. Webhooks

Configura los siguientes webhooks en cada plataforma:

**Mercado Pago:**
- URL: `https://tu-proyecto.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadopago/webhook`
- Eventos: payment

**Stripe:**
- URL: `https://tu-proyecto.supabase.co/functions/v1/make-server-0dd48dc4/integrations/stripe/webhook`
- Eventos: payment_intent.succeeded, payment_intent.payment_failed

## 🚀 Uso

### Panel de Administración

1. Accede al Panel Admin desde el menú de usuario
2. Ve a la sección **"Integraciones de Pago"**
3. Verifica el estado de cada integración (✅ o ❌)
4. Usa los botones de sincronización para Mercado Libre:
   - **Publicar Productos**: Publica todos los productos locales en ML
   - **Actualizar Stock**: Sincroniza el stock desde ML a tu tienda
   - **Sincronizar Órdenes**: Importa las órdenes de ML

### Checkout

1. Los clientes agregan productos al carrito
2. Al hacer checkout, seleccionan el método de pago
3. Completan sus datos de contacto
4. Son redirigidos a la pasarela correspondiente
5. Al confirmar el pago, se crea la orden en el sistema

## 📦 Estructura de Archivos

```
/supabase/functions/server/
├── index.tsx                  # Servidor principal
├── integrations.tsx           # Rutas de integraciones
└── kv_store.tsx              # Base de datos KV

/src/app/components/
├── PaymentIntegrations.tsx   # Panel de integraciones
├── Checkout.tsx              # Checkout mejorado
└── AdminDashboard.tsx        # Dashboard admin
```

## 🔄 Flujo de Sincronización con Mercado Libre

### Publicar Productos

1. Se obtienen todos los productos locales
2. Para cada producto:
   - Se verifica si ya existe en ML (usando mapeo local)
   - Si existe: se actualiza (PUT)
   - Si no existe: se crea (POST)
3. Se guarda el mapeo entre ID local e ID de ML
4. Se genera un log de sincronización

### Sincronizar Stock

1. Se obtienen todos los productos activos de ML
2. Para cada producto de ML:
   - Se busca el producto local correspondiente
   - Se actualiza el stock local con el de ML
3. Se genera un reporte de productos actualizados

### Importar Órdenes

1. Se obtienen las órdenes del vendedor en ML
2. Para cada orden nueva:
   - Se crea una orden local
   - Se mapea la orden de ML con la local
   - Se actualiza el estado según el pago
3. Las órdenes se sincronizan automáticamente

## 🎯 Próximos Pasos Sugeridos

1. **Automatización**:
   - Implementar cron jobs para sincronización automática
   - Webhook de ML para cambios de inventario en tiempo real

2. **Validaciones**:
   - Validar categorías de ML antes de publicar
   - Prevenir duplicados en la sincronización

3. **Mejoras UI**:
   - Progreso en tiempo real de sincronización
   - Filtros y búsqueda en logs
   - Notificaciones push para órdenes nuevas

4. **Seguridad**:
   - Implementar rate limiting
   - Validar webhooks con signatures
   - Logs de auditoría para todas las operaciones

## ⚠️ Notas Importantes

- **Ambiente de prueba**: Las integraciones de PayPal y Stripe usan endpoints de sandbox por defecto
- **Categorías de ML**: El código usa "MLA1051" como categoría por defecto. Ajusta según tus productos
- **Conversión de moneda**: PayPal usa una conversión simple ARS→USD (/1000). Implementa una API de conversión real
- **Webhooks**: Los webhooks requieren URLs públicas. En desarrollo, usa herramientas como ngrok

## 🐛 Debugging

Para ver los logs del servidor:
```bash
# En el dashboard de Supabase
Edge Functions → server → Invocations → View logs
```

Para probar endpoints manualmente:
```bash
curl -X POST https://tu-proyecto.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadolibre/sync-products \
  -H "Authorization: Bearer tu_anon_key" \
  -H "Content-Type: application/json" \
  -d '{"productIds": null}'
```

## 📚 Documentación de APIs

- [Mercado Libre API](https://developers.mercadolibre.com.ar/es_ar/api-docs)
- [Mercado Pago API](https://www.mercadopago.com.ar/developers/es/docs)
- [PayPal API](https://developer.paypal.com/api/rest/)
- [Stripe API](https://stripe.com/docs/api)

---

**Última actualización**: 11 de febrero de 2026
