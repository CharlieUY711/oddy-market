# 🔍 Guía Visual: Dónde Está TODO en Mercado Pago

## 🚀 INICIO: Acceder al Panel Correcto

### Opción 1: Panel de Desarrolladores (RECOMENDADO)

**URL DIRECTA**: https://www.mercadopago.com.ar/developers/panel

O también:
- https://www.mercadopago.com/developers/panel (sin el .ar)
- https://www.mercadopago.com.mx/developers/panel (México)
- https://www.mercadopago.com.uy/developers/panel (Uruguay)

### Opción 2: Desde el Panel Principal

1. Ve a: https://www.mercadopago.com.ar/
2. **Login** con tu cuenta
3. En el menú superior derecho, busca **"Tu negocio"** o **"Herramientas"**
4. Click en **"Desarrolladores"** o **"Integraciones"**

---

## 📍 PASO 1: Ver/Crear tu Aplicación

### Si es tu primera vez:

1. Llegarás a una pantalla que dice: **"¡Creá tu primera aplicación!"**
2. Click en el botón azul grande: **"Crear aplicación"**
3. Completa:
   - **Nombre de la aplicación**: `ODDY Market`
   - **¿Para qué usarás esta aplicación?**: "Ecommerce / Tienda online"
   - **Modelo de integración**: Selecciona "Checkout API" o "Checkout Pro"
4. Click **"Crear aplicación"**

### Si ya tenés aplicaciones:

1. Verás una lista de tus aplicaciones existentes
2. Si ves "ODDY Market" o similar, click en ella
3. Si no, click en **"+ Crear aplicación"** (botón arriba a la derecha)

---

## 📍 PASO 2: Obtener las Credenciales (Access Token y Public Key)

Una vez dentro de tu aplicación:

### Navegación Exacta:

```
Panel de Desarrolladores
  └─ Tus aplicaciones
      └─ [Tu Aplicación - ODDY Market]
          └─ Credenciales  ← CLICK AQUÍ
```

### Deberías ver estas pestañas:

```
┌─────────────────────────────────────────────┐
│  Producción  |  Pruebas  |  Configuración   │
└─────────────────────────────────────────────┘
```

### Pestaña "Pruebas" (Para testear primero)

Click en **"Pruebas"** y verás:

```
┌──────────────────────────────────────────────────────────────┐
│  🔵 Credenciales de prueba                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Public Key                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TEST-c8b5e7f3-xxxx-xxxx-xxxx-xxxxxxxxxxxx          │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Copiar] 👈 CLICK AQUÍ                                    │
│                                                              │
│  Access Token                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TEST-1234567890123456-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxx│   │
│  └─────────────────────────────────────────────────────┘   │
│  [Copiar] 👈 CLICK AQUÍ                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**IMPORTANTE**: 
- Copia **AMBAS** credenciales
- Guardalas en un lugar seguro (bloc de notas)
- Las necesitarás para pegar en ODDY Market

### Pestaña "Producción" (Para ventas reales)

Click en **"Producción"** y verás lo mismo pero con credenciales reales:

```
┌──────────────────────────────────────────────────────────────┐
│  🟢 Credenciales de producción                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Public Key                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ APP_USR-c8b5e7f3-xxxx-xxxx-xxxx-xxxxxxxxxxxx       │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Copiar]                                                   │
│                                                              │
│  Access Token                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ APP_USR-1234567890123456-xxxxxx-xxxxxxxxxxxxxxx     │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Copiar]                                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📍 PASO 3: Configurar Webhooks (Notificaciones)

### Navegación Exacta en el Panel:

**IMPORTANTE**: Los Webhooks NO están dentro de "Credenciales".

Tienes que ir a:

```
Panel de Desarrolladores
  └─ Tus aplicaciones
      └─ [Tu Aplicación - ODDY Market]
          └─ Webhooks  ← Busca este menú en el lateral izquierdo
```

### Opciones de nombres del menú:

Dependiendo del país y versión, puede llamarse:
- **"Webhooks"**
- **"Notificaciones IPN"**
- **"Notificaciones"**
- **"Eventos"**

### Si encuentras "Webhooks":

1. Click en **"Webhooks"** en el menú lateral izquierdo
2. Verás un botón: **"Agregar endpoint"** o **"Configurar URL"**
3. Click ahí

### Si encuentras "Notificaciones IPN":

1. Click en **"Notificaciones IPN"**
2. Verás un campo: **"URL de notificaciones"**
3. Activa el toggle o checkbox

### Configuración del Webhook:

```
┌──────────────────────────────────────────────────────────────┐
│  Configurar notificaciones                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  URL de notificaciones *                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pega aquí tu URL del webhook                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Eventos a notificar:                                        │
│  ☑️ payment (Pagos)                                         │
│  ☑️ merchant_order (Órdenes de comercio)                    │
│  ☐ chargebacks (Contracargos)                              │
│                                                              │
│  [Cancelar]  [Guardar]                                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**TU URL SERÁ**:
```
https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-0dd48dc4/payments/mercadopago-webhook
```

---

## 🆘 SI NO ENCUENTRAS LOS WEBHOOKS

### Alternativa 1: Búsqueda en el Panel

En la barra de búsqueda del panel (si existe), busca:
- "webhook"
- "notificaciones"
- "IPN"

### Alternativa 2: URLs Directas

Intenta acceder directamente:

**Argentina**:
```
https://www.mercadopago.com.ar/developers/panel/notifications/ipn
```

**México**:
```
https://www.mercadopago.com.mx/developers/panel/notifications/ipn
```

**Uruguay**:
```
https://www.mercadopago.com.uy/developers/panel/notifications/ipn
```

### Alternativa 3: Menú Desplegable de la Aplicación

1. Dentro de tu aplicación
2. Busca un menú desplegable o "..." (tres puntos)
3. Busca opciones como:
   - "Configuración avanzada"
   - "Notificaciones"
   - "Integraciones"

### Alternativa 4: Desde el Checkout API

1. En el panel, busca **"Checkout API"**
2. Dentro de Checkout API, busca:
   - "Configuración"
   - "Notificaciones"
   - "Webhooks"

---

## 📱 ESTRUCTURA COMPLETA DEL MENÚ (Para que te ubiques)

Cuando estás dentro de tu aplicación, el menú lateral izquierdo debería verse así:

```
📁 ODDY Market (Tu Aplicación)
   │
   ├─ 📊 Dashboard
   │
   ├─ 🔑 Credenciales
   │   ├─ Producción
   │   └─ Pruebas
   │
   ├─ 🔔 Webhooks / Notificaciones  ← AQUÍ
   │
   ├─ ⚙️ Configuración
   │
   ├─ 📈 Reportes
   │
   └─ 🧪 Modo prueba
```

---

## ✅ CHECKLIST: ¿Qué debo copiar?

### Desde Mercado Pago → Para pegar en ODDY Market:

| # | ¿Qué copiar? | Empieza con... | ¿Dónde está? |
|---|--------------|----------------|--------------|
| 1️⃣ | **Public Key de PRUEBA** | `TEST-c8b5e7f3-...` | Credenciales → Pruebas |
| 2️⃣ | **Access Token de PRUEBA** | `TEST-1234567890...` | Credenciales → Pruebas |
| 3️⃣ | *(Opcional)* Public Key de PRODUCCIÓN | `APP_USR-c8b5e7f3-...` | Credenciales → Producción |
| 4️⃣ | *(Opcional)* Access Token de PRODUCCIÓN | `APP_USR-1234567890...` | Credenciales → Producción |

### Desde ODDY Market → Para pegar en Mercado Pago:

| # | ¿Qué pegar? | Valor | ¿Dónde está? |
|---|-------------|-------|--------------|
| 1️⃣ | **Webhook URL** | `https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-0dd48dc4/payments/mercadopago-webhook` | Webhooks → URL de notificaciones |

---

## 🎬 FLUJO COMPLETO VISUAL

```
MERCADO PAGO                           ODDY MARKET
┌────────────────┐                     ┌────────────────┐
│                │                     │                │
│  Credenciales  │  ─────1. Copiar──→  │  API Keys      │
│  • Public Key  │     credenciales    │  Manager       │
│  • Access Token│                     │                │
│                │                     │  Pegar ambas   │
└────────────────┘                     └────────────────┘
        │                                      │
        │                                      │
        │                                      ▼
        │                              ┌────────────────┐
        │                              │   Supabase     │
        │                              │   Project URL  │
        │                              │                │
        │                              │  Copiar        │
        │                              │  PROJECT_ID    │
        │                              └────────────────┘
        │                                      │
        │                                      │
        ▼                                      │
┌────────────────┐                            │
│   Webhooks     │  ◄────2. Pegar URL─────────┘
│                │     del webhook
│  URL: https:// │
│  PROJECT_ID... │
│                │
└────────────────┘
```

---

## 🔍 SOLUCIÓN DE PROBLEMAS COMUNES

### ❌ "No veo el botón Crear Aplicación"

**Posible causa**: Tu cuenta no está activada como desarrollador

**Solución**:
1. Ve a tu perfil de Mercado Pago
2. Completa todos los datos de tu cuenta
3. Verifica tu identidad si te lo pide
4. Espera 24-48hs para activación

### ❌ "Credenciales de producción bloqueadas"

**Posible causa**: Mercado Pago requiere verificación adicional

**Solución**:
1. Usa las credenciales de PRUEBA primero
2. Completa la verificación de tu negocio
3. Puede tomar 1-3 días hábiles

### ❌ "No encuentro Webhooks en ningún lado"

**Posible causa 1**: Versión antigua del panel

**Solución**:
1. Intenta las URLs directas mencionadas arriba
2. O configura IPN desde el código (te ayudo con esto)

**Posible causa 2**: Panel de país diferente

**Solución**:
- Cambia el país en la URL (.ar, .mx, .uy, etc.)
- Usa la URL del país donde registraste la cuenta

### ❌ "El webhook dice 'URL inválida'"

**Posible causa**: Mercado Pago valida que la URL responda

**Solución**:
1. Primero completa la configuración en ODDY
2. Luego configura el webhook
3. Si persiste, escríbeme y te ayudo a crear el endpoint

---

## 📞 ¿AÚN NO LO ENCUENTRAS?

### Dime exactamente qué ves:

Para ayudarte mejor, necesito saber:

1. **¿En qué país estás?** (Argentina, México, Uruguay, etc.)
2. **¿Qué URL estás usando?** (Copia y pega la URL completa)
3. **¿Qué opciones ves en el menú lateral izquierdo?** (Lista todo lo que ves)
4. **¿Creaste una aplicación?** (¿Sí/No?)
5. **¿Qué buscas específicamente?**
   - [ ] Credenciales (Public Key / Access Token)
   - [ ] Webhooks (URL de notificaciones)
   - [ ] Ambas

### Mándame captura de pantalla:

Si puedes, toma una captura de pantalla de:
- El menú lateral izquierdo completo
- La pantalla principal donde estás

---

## 🎯 RESUMEN EXPRESS

### Para obtener credenciales:
1. Ve a: https://www.mercadopago.com.ar/developers/panel
2. Click en tu aplicación
3. Click en **"Credenciales"**
4. Copia **Public Key** y **Access Token** de la pestaña **"Pruebas"**

### Para configurar webhook:
1. Dentro de tu aplicación
2. Busca **"Webhooks"** o **"Notificaciones IPN"** en el menú lateral
3. Pega tu URL de webhook
4. Guarda

---

**¿Qué específicamente no encontrás? Te guío paso a paso 👆**
