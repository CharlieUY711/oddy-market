# 🎯 Guía de Configuración: Mercado Pago + Supabase

## ✅ CHECKLIST RÁPIDO

- [ ] Obtener Access Token y Public Key de Mercado Pago
- [ ] Pegar credenciales en ODDY Market
- [ ] Configurar Webhook en Mercado Pago
- [ ] ⚠️ **NO necesitas hacer nada en Supabase** (ya está configurado)

---

## 📋 PARTE 1: Obtener Credenciales de Mercado Pago

### Paso 1: Acceder al Panel de Desarrolladores

1. Ve a: **https://www.mercadopago.com.ar/developers/**
2. Inicia sesión con tu cuenta de Mercado Pago
3. Si no tienes cuenta, créala primero en: **https://www.mercadopago.com.ar/**

### Paso 2: Crear una Aplicación

1. En el panel de Desarrolladores, click en **"Tus integraciones"**
2. Click en **"Crear aplicación"**
3. Completa el formulario:
   - **Nombre**: "ODDY Market" (o el nombre de tu tienda)
   - **Descripción**: "Ecommerce integrado"
   - **Modelo de integración**: "Online Payments"
4. Click en **"Crear aplicación"**

### Paso 3: Obtener las Credenciales

Una vez creada la aplicación, verás dos ambientes:

#### 🔵 MODO PRUEBA (Para desarrollo)
1. Click en la pestaña **"Credenciales de prueba"**
2. Verás dos credenciales:
   - **Access Token**: Empieza con `TEST-1234567890123456-...`
   - **Public Key**: Empieza con `TEST-xxxxxxxx-xxxx-...`
3. **Copia ambas** (las usarás en el siguiente paso)

#### 🟢 MODO PRODUCCIÓN (Para ventas reales)
1. Click en la pestaña **"Credenciales de producción"**
2. Puede pedirte verificación adicional
3. Verás dos credenciales:
   - **Access Token**: Empieza con `APP_USR-1234567890123456-...`
   - **Public Key**: Empieza con `APP_USR-xxxxxxxx-xxxx-...`
4. **Copia ambas**

> ⚠️ **IMPORTANTE**: Comienza con las credenciales de **PRUEBA** para testear. Cambia a **PRODUCCIÓN** solo cuando todo funcione.

---

## 📋 PARTE 2: Configurar en ODDY Market

### Paso 1: Acceder al Gestor de API Keys

1. **Login** en ODDY Market como **Administrador**
2. Ve a **AdminDashboard**
3. Busca la sección **"Gestor de API Keys"** o **"Integraciones"**
4. Click en la pestaña **💳 Pagos**

### Paso 2: Pegar las Credenciales

Encontrarás dos campos:

#### Campo 1: Mercado Pago - Access Token
```
Label: Mercado Pago - Access Token
Descripción: Token de acceso para procesar pagos
```

**Pegar aquí**: Tu Access Token completo
- Modo prueba: `TEST-1234567890123456-...`
- Modo producción: `APP_USR-1234567890123456-...`

Click en el botón **💾 Guardar**

#### Campo 2: Mercado Pago - Public Key
```
Label: Mercado Pago - Public Key
Descripción: Public Key para frontend de Mercado Pago
```

**Pegar aquí**: Tu Public Key completa
- Modo prueba: `TEST-xxxxxxxx-xxxx-...`
- Modo producción: `APP_USR-xxxxxxxx-xxxx-...`

Click en el botón **💾 Guardar**

### Paso 3: Verificar

Deberías ver:
- ✅ Check verde al lado de cada campo
- Mensaje: **"Configuración guardada exitosamente"**

---

## 📋 PARTE 3: Configurar Webhook en Mercado Pago

### ¿Qué es un Webhook?

Un webhook es una URL donde Mercado Pago enviará notificaciones automáticas cuando:
- ✅ Un pago es aprobado
- ⏳ Un pago está pendiente
- ❌ Un pago fue rechazado

### ¿Dónde pego la URL?

#### Paso 1: Copiar tu URL de Webhook

Tu URL de webhook es:
```
https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-0dd48dc4/payments/mercadopago-webhook
```

**¿Cómo saber mi PROJECT_ID?**
1. En ODDY Market, ve al **AdminDashboard**
2. Busca la sección **"Gestor de API Keys"**
3. Click en la pestaña **🏗️ Infraestructura**
4. Verás el campo **"Supabase - Project URL"**
5. Tu URL se ve así: `https://xxxxxxxxxxxxx.supabase.co`
6. La parte `xxxxxxxxxxxxx` es tu **PROJECT_ID**

**Ejemplo completo**:
```
Si tu Supabase URL es: https://abcd1234efgh5678.supabase.co

Tu Webhook URL es:
https://abcd1234efgh5678.supabase.co/functions/v1/make-server-0dd48dc4/payments/mercadopago-webhook
```

#### Paso 2: Configurar en Mercado Pago

1. Ve al panel de Mercado Pago: **https://www.mercadopago.com.ar/developers/**
2. Selecciona tu aplicación **"ODDY Market"**
3. En el menú lateral, busca **"Webhooks"** o **"Notificaciones IPN"**
4. Click en **"Configurar notificaciones"**
5. En el campo **"URL de notificación"**, pega tu webhook:
   ```
   https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-0dd48dc4/payments/mercadopago-webhook
   ```
6. Selecciona los eventos a notificar:
   - ✅ **payment** (pagos)
   - ✅ **merchant_order** (órdenes)
7. Click en **"Guardar"**

#### Paso 3: Probar el Webhook

1. Mercado Pago tiene un botón **"Enviar prueba"**
2. Click ahí para verificar que tu servidor recibe notificaciones
3. Si todo está bien, verás: ✅ **"200 OK"**

---

## 📋 PARTE 4: Sobre Supabase (NO NECESITAS HACER NADA)

### ¿Por qué no necesito configurar nada?

**Supabase ya está configurado automáticamente** en tu proyecto de Figma Make.

Las credenciales de Supabase ya están en las **variables de entorno** del sistema:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

### ¿Dónde están estas credenciales?

En el **Gestor de API Keys**, pestaña **🏗️ Infraestructura**:
- Verás las credenciales de Supabase
- Tienen el badge **"Solo lectura"** 🔒
- **No puedes editarlas** porque vienen de las variables de entorno

### ¿Qué hace Supabase en ODDY Market?

Supabase es la **base de datos y backend** que guarda:
- 🔐 Las API keys que configuraste
- 👤 Usuarios y roles
- 🛒 Productos y pedidos
- 📊 Todo el ERP y CRM

**Todo funciona automáticamente**, no necesitas tocar nada en Supabase.

### ¿Y si quiero ver la base de datos?

Si quieres explorar o modificar la base de datos directamente:

1. Ve a: **https://supabase.com/dashboard**
2. Inicia sesión (usa la misma cuenta con la que configuraste el proyecto)
3. Selecciona tu proyecto
4. Explora:
   - **Table Editor**: Ver y editar datos
   - **SQL Editor**: Ejecutar queries
   - **API**: Ver documentación de la API

---

## 🎯 RESUMEN: ¿Qué necesito pegar y dónde?

### EN ODDY MARKET (Gestor de API Keys)

| Campo | ¿Dónde pegar? | Valor |
|-------|---------------|-------|
| **Mercado Pago - Access Token** | ODDY → Pagos | `TEST-xxx...` o `APP_USR-xxx...` |
| **Mercado Pago - Public Key** | ODDY → Pagos | `TEST-xxx...` o `APP_USR-xxx...` |

### EN MERCADO PAGO (Panel de Desarrolladores)

| Campo | ¿Dónde pegar? | Valor |
|-------|---------------|-------|
| **Webhook URL** | Mercado Pago → Tu App → Webhooks | `https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-0dd48dc4/payments/mercadopago-webhook` |

### EN SUPABASE

| Campo | ¿Dónde pegar? | Valor |
|-------|---------------|-------|
| **NADA** | ❌ No necesitas hacer nada | Ya está configurado ✅ |

---

## 🚀 FLUJO COMPLETO

```
1. Usuario hace una compra en ODDY Market
   ↓
2. ODDY envía la solicitud a Mercado Pago (usa Access Token)
   ↓
3. Mercado Pago procesa el pago
   ↓
4. Mercado Pago envía notificación al Webhook
   ↓
5. ODDY recibe la notificación y actualiza el pedido
   ↓
6. Usuario recibe confirmación
```

---

## ❓ Preguntas Frecuentes

### ¿Diferencia entre Access Token y Public Key?

- **Access Token**: 🔴 **Privado** - Solo en el backend, nunca lo expongas
  - Se usa para: Crear pagos, consultar órdenes, procesar reembolsos
  
- **Public Key**: 🟢 **Público** - Se puede usar en el frontend
  - Se usa para: Cargar el SDK de Mercado Pago, mostrar métodos de pago

### ¿Puedo cambiar de TEST a PRODUCCIÓN después?

✅ Sí, simplemente:
1. Ve al Gestor de API Keys
2. Reemplaza las credenciales de TEST por las de PRODUCCIÓN
3. Click en Guardar

### ¿Cómo sé si mi configuración funciona?

1. Haz una compra de prueba en tu tienda
2. Usa las tarjetas de prueba de Mercado Pago:
   - **Aprobado**: `4509 9535 6623 3704` - CVV: 123 - Exp: 11/25
   - **Rechazado**: `5031 7557 3453 0604` - CVV: 123 - Exp: 11/25
3. El pago debería procesarse y ver el estado en tu AdminDashboard

### ¿El webhook es obligatorio?

⚠️ **Sí, es muy importante** porque:
- Sin webhook, ODDY no sabrá si el pago fue aprobado
- Los pedidos quedarían en estado "pendiente" forever
- No se actualizará el inventario automáticamente

### ¿Qué pasa con los datos sensibles?

🔐 **Seguridad garantizada**:
- El Access Token se guarda **encriptado** en Supabase
- Solo el backend puede leerlo
- Nunca se expone en el frontend
- El Public Key sí se puede exponer (por eso se llama "public")

---

## 📞 ¿Necesitas Ayuda?

### Documentación Oficial
- **Mercado Pago**: https://www.mercadopago.com.ar/developers/es/docs
- **Webhooks**: https://www.mercadopago.com.ar/developers/es/docs/notifications/webhooks
- **Supabase**: https://supabase.com/docs

### Tarjetas de Prueba
- **Mercado Pago Test Cards**: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/integration-test/test-cards

---

**✅ ¡Listo! Ahora tienes Mercado Pago completamente configurado en ODDY Market.**
