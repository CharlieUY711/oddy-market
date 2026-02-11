# 🛒 Guía de Integración: Mercado Libre y Mercado Pago

Esta guía completa te ayudará a configurar las integraciones con Mercado Libre (marketplace) y Mercado Pago (pasarela de pagos) en ODDY Market.

---

## 📋 Tabla de Contenidos

1. [Mercado Libre - Marketplace](#mercado-libre---marketplace)
2. [Mercado Pago - Pasarela de Pagos](#mercado-pago---pasarela-de-pagos)
3. [Variables de Entorno](#variables-de-entorno)
4. [Testing y Producción](#testing-y-producción)
5. [Troubleshooting](#troubleshooting)

---

## 🛍️ Mercado Libre - Marketplace

### Paso 1: Crear una aplicación en Mercado Libre

1. Ve a [Mercado Libre Developers](https://developers.mercadolibre.com.ar/apps)
2. Haz clic en **"Crear aplicación"**
3. Completa los datos:
   - **Nombre de la aplicación**: ODDY Market
   - **Descripción corta**: E-commerce integrado
   - **URL de callback**: `https://tu-dominio.com/ml-oauth-callback` (o usa el archivo HTML incluido)
   - **Categoría**: E-commerce

### Paso 2: Configurar OAuth

1. En tu aplicación, ve a la sección **"Configuración"**
2. Agrega esta URL de redirección:
   ```
   https://tu-dominio.com/ml-oauth-callback
   ```
   > 💡 También puedes usar `/ml-oauth-callback.html` que está incluido en el proyecto

3. Guarda el **App ID** (Client ID) y el **Secret Key**

### Paso 3: Autorizar la aplicación

Visita esta URL en tu navegador (reemplaza `YOUR_APP_ID` con tu App ID real):

```
https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=YOUR_APP_ID&redirect_uri=https://tu-dominio.com/ml-oauth-callback
```

**Para otros países:**
- 🇦🇷 Argentina: `auth.mercadolibre.com.ar`
- 🇲🇽 México: `auth.mercadolibre.com.mx`
- 🇧🇷 Brasil: `auth.mercadolivre.com.br`
- 🇨🇱 Chile: `auth.mercadolibre.cl`
- 🇨🇴 Colombia: `auth.mercadolibre.com.co`
- 🇺🇾 Uruguay: `auth.mercadolibre.com.uy`

### Paso 4: Intercambiar código por access token

Después de autorizar, recibirás un código. Úsalo para obtener el access token:

```bash
curl -X POST \
  https://api.mercadolibre.com/oauth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code' \
  -d 'client_id=YOUR_APP_ID' \
  -d 'client_secret=YOUR_APP_SECRET' \
  -d 'code=EL_CODIGO_QUE_RECIBISTE' \
  -d 'redirect_uri=https://tu-dominio.com/ml-oauth-callback'
```

Respuesta esperada:
```json
{
  "access_token": "APP_USR-1234567890123456-...",
  "token_type": "bearer",
  "expires_in": 21600,
  "scope": "offline_access read write",
  "user_id": 123456789,
  "refresh_token": "TG-..."
}
```

### Paso 5: Obtener tu User ID

```bash
curl -X GET \
  https://api.mercadolibre.com/users/me \
  -H 'Authorization: Bearer TU_ACCESS_TOKEN'
```

### Paso 6: Configurar en Supabase

Ve a **Supabase Dashboard → Settings → Edge Functions → Secrets** y agrega:

```
MERCADOLIBRE_ACCESS_TOKEN=APP_USR-1234567890123456-...
MERCADOLIBRE_REFRESH_TOKEN=TG-...
MERCADOLIBRE_USER_ID=123456789
MERCADOLIBRE_APP_ID=1234567890
MERCADOLIBRE_APP_SECRET=abcdefghijklmnop
```

### 🔄 Renovar el Access Token

Los tokens de ML expiran cada 6 horas. Para renovarlos:

```bash
curl -X POST \
  https://api.mercadolibre.com/oauth/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=refresh_token' \
  -d 'client_id=YOUR_APP_ID' \
  -d 'client_secret=YOUR_APP_SECRET' \
  -d 'refresh_token=TU_REFRESH_TOKEN'
```

---

## 💳 Mercado Pago - Pasarela de Pagos

### Paso 1: Crear una aplicación en Mercado Pago

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app)
2. Haz clic en **"Crear aplicación"**
3. Completa los datos:
   - **Nombre**: ODDY Market
   - **Modelo de integración**: Checkout Pro o Checkout API
   - **País**: Selecciona tu país

### Paso 2: Obtener credenciales

1. En tu aplicación, ve a **"Credenciales"**
2. Verás dos tipos de credenciales:

#### 🧪 Credenciales de PRUEBA (Test)
```
Public Key: TEST-abc123...
Access Token: TEST-1234567890123456-...
```

#### ✅ Credenciales de PRODUCCIÓN (Production)
```
Public Key: APP_USR-abc123...
Access Token: APP_USR-1234567890123456-...
```

> ⚠️ **Importante**: Usa primero las credenciales de PRUEBA para testing.

### Paso 3: Configurar URLs de notificación

En tu aplicación de Mercado Pago, configura:

**URL de éxito:**
```
https://tu-dominio.com/payment/success
```

**URL de fallo:**
```
https://tu-dominio.com/payment/failure
```

**URL de Webhook (IPN):**
```
https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-0dd48dc4/integrations/mercadopago/webhook
```

### Paso 4: Configurar en Supabase

Agrega estas variables de entorno:

#### Para PRUEBA:
```
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890123456-...
MERCADOPAGO_PUBLIC_KEY=TEST-abc123...
```

#### Para PRODUCCIÓN:
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-1234567890123456-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-abc123...
```

---

## 🔧 Variables de Entorno

### Resumen de todas las variables necesarias

```bash
# Mercado Libre
MERCADOLIBRE_ACCESS_TOKEN=APP_USR-1234567890123456-...
MERCADOLIBRE_REFRESH_TOKEN=TG-...
MERCADOLIBRE_USER_ID=123456789
MERCADOLIBRE_APP_ID=1234567890
MERCADOLIBRE_APP_SECRET=abcdefghijklmnop

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890123456-...  # o APP_USR- para producción
MERCADOPAGO_PUBLIC_KEY=TEST-abc123...  # o APP_USR- para producción
```

---

## 🧪 Testing y Producción

### Tarjetas de prueba de Mercado Pago

#### ✅ Tarjetas que APRUEBAN el pago:

**Visa:**
```
Número: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25
Nombre: APRO
```

**Mastercard:**
```
Número: 5031 7557 3453 0604
CVV: 123
Vencimiento: 11/25
Nombre: APRO
```

**American Express:**
```
Número: 3711 803032 57522
CVV: 1234
Vencimiento: 11/25
Nombre: APRO
```

#### ❌ Tarjeta que RECHAZA el pago:

**Visa:**
```
Número: 4074 0945 3159 5316
CVV: 123
Vencimiento: 11/25
Nombre: OTHE
```

#### ⏳ Tarjeta que queda PENDIENTE:

**Visa:**
```
Número: 4389 3540 4283 4398
CVV: 123
Vencimiento: 11/25
Nombre: CONT
```

### Usuarios de prueba

Para testing completo, crea usuarios de prueba:

```bash
curl -X POST \
  https://api.mercadopago.com/users/test_user \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  -d '{
    "site_id": "MLA"
  }'
```

---

## 🚀 Funcionalidades implementadas

### Mercado Libre
- ✅ Sincronización de artículos a Mercado Libre
- ✅ Actualización automática de stock
- ✅ Importación de órdenes desde ML
- ✅ Mapeo bidireccional de productos
- ✅ Webhooks para actualizaciones en tiempo real

### Mercado Pago
- ✅ Checkout Pro (Preferencias de pago)
- ✅ Procesamiento de tarjetas de crédito/débito
- ✅ Pagos en efectivo (Rapipago, Pago Fácil)
- ✅ Cuotas sin interés
- ✅ Webhooks para notificaciones de pago
- ✅ Estadísticas de pagos

---

## 🔍 Troubleshooting

### Error: "Invalid access token"
- Verifica que el token no haya expirado
- Renueva el token usando el refresh_token
- Verifica que el token sea para el país correcto

### Error: "Invalid category"
- Asegúrate de usar categorías válidas para tu país
- Usa la API de categorías: `GET https://api.mercadolibre.com/sites/MLA/categories`

### Error: "Webhook not received"
- Verifica que la URL del webhook sea accesible públicamente
- Revisa los logs del Edge Function en Supabase
- Confirma que la URL esté configurada en el panel de MP/ML

### Productos no se sincronizan
- Verifica que el artículo tenga todos los campos requeridos:
  - Nombre/Título
  - Precio
  - Stock
  - Imágenes
  - Descripción

### Pagos en modo test no funcionan
- Asegúrate de usar las credenciales TEST
- Usa las tarjetas de prueba exactamente como se indican
- El nombre del titular debe ser uno de los códigos: APRO, OTHE, CONT

---

## 📞 Soporte

### Documentación oficial:
- [Mercado Libre Developers](https://developers.mercadolibre.com.ar/)
- [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/)

### Comunidad:
- [Stack Overflow - Mercado Libre](https://stackoverflow.com/questions/tagged/mercadolibre)
- [Stack Overflow - Mercado Pago](https://stackoverflow.com/questions/tagged/mercadopago)

---

## ✅ Checklist de configuración

### Mercado Libre:
- [ ] Aplicación creada en ML Developers
- [ ] URL de callback configurada
- [ ] Aplicación autorizada (OAuth)
- [ ] Access token obtenido
- [ ] User ID obtenido
- [ ] Variables de entorno configuradas en Supabase
- [ ] Edge Function reiniciado

### Mercado Pago:
- [ ] Aplicación creada en MP Developers
- [ ] Credenciales de prueba obtenidas
- [ ] URLs de notificación configuradas
- [ ] Variables de entorno configuradas en Supabase
- [ ] Prueba con tarjetas de test exitosa
- [ ] (Opcional) Credenciales de producción configuradas

---

¡Ya estás listo para vender en Mercado Libre y aceptar pagos con Mercado Pago! 🎉
