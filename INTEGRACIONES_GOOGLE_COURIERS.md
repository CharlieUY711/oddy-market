# 🔗 Integraciones: Google APIs + Couriers

## 🎯 Descripción

Sistema completo de integraciones con:
- ✅ **Google APIs** (Maps, Analytics, Tag Manager, reCAPTCHA)
- ✅ **APIs de Couriers** (FedEx, UPS, DHL, USPS, etc.)
- ✅ **ODDY Logística** como courier principal

---

## 🗺️ 1. INTEGRACIÓN CON GOOGLE

### **APIs Soportadas:**

| API | Propósito | Servicios |
|-----|-----------|-----------|
| **Google Maps** | Mapas, rutas, geocoding | Directions, Geocoding, Places, Distance Matrix |
| **Google Analytics** | Analítica web | GA4 |
| **Google Tag Manager** | Gestión de tags | GTM |
| **Google reCAPTCHA** | Protección anti-bot | v2, v3 |

---

### **Endpoints:**

#### **a) Configurar Google APIs**

```http
POST /make-server-0dd48dc4/integrations/google/configure
```

**Request:**
```json
{
  "entity_id": "default",
  "apis": {
    "maps": {
      "enabled": true,
      "api_key": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "services": {
        "directions": true,
        "geocoding": true,
        "places": true,
        "distance_matrix": true
      }
    },
    "analytics": {
      "enabled": true,
      "measurement_id": "G-XXXXXXXXXX"
    },
    "tag_manager": {
      "enabled": true,
      "container_id": "GTM-XXXXXXX"
    },
    "recaptcha": {
      "enabled": true,
      "site_key": "6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "secret_key": "6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  },
  "environment": "production"
}
```

**Response:**
```json
{
  "config": {
    "id": "google-config:default",
    "entity_id": "default",
    "platform": "google",
    "apis": {
      "maps": {
        "enabled": true,
        "api_key": "***hidden***",
        "services": {
          "directions": true,
          "geocoding": true,
          "places": true,
          "distance_matrix": true
        }
      },
      "analytics": {
        "enabled": true,
        "measurement_id": "G-XXXXXXXXXX"
      },
      "tag_manager": {
        "enabled": true,
        "container_id": "GTM-XXXXXXX"
      },
      "recaptcha": {
        "enabled": true,
        "site_key": "6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "secret_key": "***hidden***"
      }
    },
    "environment": "production"
  },
  "message": "Google APIs configured successfully"
}
```

---

#### **b) Obtener Configuración de Google**

```http
GET /make-server-0dd48dc4/integrations/google/config?entity_id=default
```

**Response:**
```json
{
  "config": {
    "apis": {
      "maps": {
        "enabled": true,
        "api_key": "***hidden***"
      },
      ...
    }
  }
}
```

---

### **Uso en el Frontend:**

#### **Google Maps:**
```javascript
// En el HTML
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>

// Inicializar mapa
const map = new google.maps.Map(document.getElementById('map'), {
  zoom: 10,
  center: { lat: -34.9011, lng: -56.1645 }
});

// Agregar marcador
new google.maps.Marker({
  position: { lat: -34.9011, lng: -56.1645 },
  map,
  title: 'ODDY Market'
});
```

#### **Google Analytics:**
```html
<!-- En el HEAD -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### **Google Tag Manager:**
```html
<!-- En el HEAD -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
```

#### **Google reCAPTCHA:**
```html
<!-- En el formulario -->
<script src="https://www.google.com/recaptcha/api.js" async defer></script>
<div class="g-recaptcha" data-sitekey="YOUR_SITE_KEY"></div>
```

---

## 🚚 2. INTEGRACIÓN CON COURIERS

### **Couriers Soportados:**

| Courier | API | Servicios |
|---------|-----|-----------|
| **ODDY Logística** | ✅ Interna | Todos |
| **FedEx** | FedEx Web Services | Shipping, Tracking, Rates |
| **UPS** | UPS API | Shipping, Tracking, Rates |
| **DHL** | DHL Express API | Shipping, Tracking, Rates |
| **USPS** | USPS Web Tools | Tracking, Rates |
| **Correo Argentino** | API Correo Argentino | Tracking, Rates |
| **Correo Uruguayo** | API Correo Uruguayo | Tracking |
| **Andreani** | Andreani API | Shipping, Tracking |
| **OCA** | OCA API | Shipping, Tracking |
| **Mercado Envíos** | Mercado Libre Shipping | Integrated |

---

### **Endpoints:**

#### **a) Configurar Courier**

```http
POST /make-server-0dd48dc4/integrations/courier/configure
```

**Request (FedEx):**
```json
{
  "entity_id": "default",
  "courier": "fedex",
  "credentials": {
    "fedex_account_number": "XXXXXXXXX",
    "fedex_meter_number": "XXXXXXXXX",
    "fedex_key": "XXXXXXXXXXXXXXXX",
    "fedex_password": "XXXXXXXXXXXXXXXX"
  },
  "environment": "production",
  "webhook_url": "https://oddy.market/webhooks/fedex",
  "services": {
    "create_shipment": true,
    "track_shipment": true,
    "calculate_rate": true,
    "print_label": true,
    "schedule_pickup": true
  },
  "enabled": true
}
```

**Request (UPS):**
```json
{
  "entity_id": "default",
  "courier": "ups",
  "credentials": {
    "ups_username": "username",
    "ups_password": "password",
    "ups_access_key": "XXXXXXXXXXXXXXXX"
  },
  "environment": "production",
  "enabled": true
}
```

**Request (DHL):**
```json
{
  "entity_id": "default",
  "courier": "dhl",
  "credentials": {
    "dhl_site_id": "XXXXXXXXX",
    "dhl_password": "XXXXXXXXX",
    "dhl_account_number": "XXXXXXXXX"
  },
  "environment": "production",
  "enabled": true
}
```

**Response:**
```json
{
  "config": {
    "id": "courier-config:default:fedex",
    "entity_id": "default",
    "platform": "courier",
    "courier": "fedex",
    "credentials": "***hidden***",
    "environment": "production",
    "services": {
      "create_shipment": true,
      "track_shipment": true,
      "calculate_rate": true,
      "print_label": true,
      "schedule_pickup": true
    },
    "enabled": true
  },
  "message": "FEDEX courier configured successfully"
}
```

---

#### **b) Obtener Configuración de Courier**

```http
GET /make-server-0dd48dc4/integrations/courier/:courier/config?entity_id=default
```

**Ejemplo:**
```bash
curl "http://localhost:8000/make-server-0dd48dc4/integrations/courier/fedex/config?entity_id=default"
```

---

#### **c) Listar Couriers Configurados**

```http
GET /make-server-0dd48dc4/integrations/couriers?entity_id=default
```

**Response:**
```json
{
  "couriers": [
    {
      "courier": "oddy_logistica",
      "enabled": true,
      "environment": "production",
      "services": {
        "create_shipment": true,
        "track_shipment": true,
        "calculate_rate": true,
        "print_label": true,
        "schedule_pickup": true
      }
    },
    {
      "courier": "fedex",
      "enabled": true,
      "environment": "production",
      "services": { ... }
    },
    {
      "courier": "ups",
      "enabled": true,
      "environment": "production",
      "services": { ... }
    }
  ],
  "total": 3
}
```

---

#### **d) Crear Envío en API del Courier**

```http
POST /make-server-0dd48dc4/integrations/courier/:courier/create-shipment?entity_id=default
```

**Request:**
```json
{
  "sender": {
    "name": "ODDY Market",
    "address": "Av. Principal 123, Montevideo, Uruguay",
    "phone": "+598 99 123 456"
  },
  "recipient": {
    "name": "María González",
    "address": "Calle Falsa 456, Buenos Aires, Argentina",
    "phone": "+54 11 1234 5678"
  },
  "package": {
    "weight": 2.5,
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 10
    },
    "declared_value": 100
  },
  "service_type": "express"
}
```

**Response:**
```json
{
  "courier_response": {
    "success": true,
    "courier": "fedex",
    "tracking_number": "FEDEX-1707735000000",
    "label_url": "https://api.fedex.com/labels/1707735000000.pdf",
    "estimated_delivery_date": "2026-02-15T10:00:00Z",
    "cost": {
      "total": 25.50,
      "currency": "USD"
    }
  },
  "message": "Shipment created successfully with fedex"
}
```

---

#### **e) Tracking desde API del Courier**

```http
GET /make-server-0dd48dc4/integrations/courier/:courier/track/:tracking_number?entity_id=default
```

**Ejemplo:**
```bash
curl "http://localhost:8000/make-server-0dd48dc4/integrations/courier/fedex/track/FEDEX-1707735000000?entity_id=default"
```

**Response:**
```json
{
  "tracking": {
    "courier": "fedex",
    "tracking_number": "FEDEX-1707735000000",
    "status": "in_transit",
    "current_location": {
      "city": "Memphis, TN",
      "country": "US",
      "timestamp": "2026-02-12T15:00:00Z"
    },
    "events": [
      {
        "status": "picked_up",
        "location": "Los Angeles, CA",
        "timestamp": "2026-02-11T10:00:00Z"
      },
      {
        "status": "in_transit",
        "location": "Memphis, TN",
        "timestamp": "2026-02-12T15:00:00Z"
      }
    ],
    "estimated_delivery": "2026-02-15T10:00:00Z"
  }
}
```

---

## 🏷️ 3. CÓDIGOS DE BARRAS Y QR PARA ENVÍOS

### **Generación Automática:**

Cuando se crea un envío, se generan automáticamente:

1. **Código de Barras (Code 128):**
   - Contiene el tracking number
   - Para escaneo rápido en almacén/courier

2. **Código QR:**
   - URL de tracking público
   - Para que el cliente lo escanee y vea el tracking

### **Estructura:**

```json
{
  "shipment": {
    "tracking_number": "ODYABC123XYZ",
    "codes": {
      "barcode": {
        "type": "code128",
        "data": "ODYABC123XYZ",
        "image_base64": "data:image/png;base64,...",
        "svg": "<svg>...</svg>"
      },
      "qr": {
        "type": "qr",
        "data": "https://oddy.market/track/ODYABC123XYZ",
        "image_base64": "data:image/png;base64,...",
        "svg": "<svg>...</svg>"
      }
    }
  }
}
```

### **Uso en Etiqueta de Envío:**

```html
<!-- Etiqueta imprimible -->
<div class="shipping-label">
  <h2>Envío #ODYABC123XYZ</h2>
  
  <!-- Código de Barras -->
  <img src="${shipment.codes.barcode.image_base64}" alt="Barcode" />
  <p>${shipment.tracking_number}</p>
  
  <!-- Información del envío -->
  <div>
    <strong>De:</strong> ${sender.name}<br>
    <strong>Para:</strong> ${recipient.name}<br>
    ${recipient.address}
  </div>
  
  <!-- Código QR -->
  <img src="${shipment.codes.qr.image_base64}" alt="QR" />
  <p>Escanea para tracking</p>
</div>
```

---

## 🎯 ODDY Logística (Courier Principal)

### **Características:**

- ✅ **Courier interno** de la organización
- ✅ Integración directa con el sistema
- ✅ No requiere API externa
- ✅ Control total del proceso
- ✅ Costos más bajos

### **Uso:**

```javascript
// Al crear envío con ODDY Logística
const shipment = await createShipment({
  service: {
    type: "express",
    courier: "oddy_logistica"  // ← Usar ODDY Logística
  },
  ...
});

// ODDY Logística maneja:
// - Recolección
// - Transporte
// - Última milla
// - Entrega
```

---

## 📊 Flujo de Integración Completo

```
┌────────────────────────────────────────────────────────┐
│  1. Cliente hace pedido en ODDY Market                │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│  2. Sistema crea envío                                 │
│     - Genera tracking number                           │
│     - Genera códigos (barras + QR)                     │
│     - Calcula ruta con Google Maps                     │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│  3. ¿Qué courier usar?                                 │
│     A. ODDY Logística (interno)                        │
│     B. FedEx / UPS / DHL (API externa)                 │
└────────────────────────────────────────────────────────┘
                        ↓
         ┌──────────────┴──────────────┐
         ↓                              ↓
┌──────────────────┐         ┌──────────────────┐
│  ODDY Logística  │         │  Courier Externo │
│  (Manejo interno)│         │  (Llamada API)   │
└──────────────────┘         └──────────────────┘
         ↓                              ↓
┌────────────────────────────────────────────────────────┐
│  4. Courier recoge paquete                             │
│     - Actualiza estado a "picked_up"                   │
│     - GPS tracking activo                              │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│  5. En tránsito                                        │
│     - Actualización de ubicación GPS cada 5 min       │
│     - ETA recalculado con Google Maps                  │
│     - Cliente ve tracking en tiempo real              │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│  6. Entregado                                          │
│     - Captura firma digital                            │
│     - Foto de prueba                                   │
│     - Notificación al cliente                          │
└────────────────────────────────────────────────────────┘
```

---

## 📝 Documentación de APIs Oficiales

### **FedEx:**
- https://developer.fedex.com/api/en-us/catalog.html
- Servicios: Tracking, Shipping, Rates

### **UPS:**
- https://www.ups.com/upsdeveloperkit
- Servicios: Tracking, Shipping, Rates, Address Validation

### **DHL:**
- https://developer.dhl.com/
- Servicios: Tracking, Shipping, Rates

### **USPS:**
- https://www.usps.com/business/web-tools-apis/
- Servicios: Tracking, Rates

### **Google Maps:**
- https://developers.google.com/maps/documentation
- Servicios: Directions, Geocoding, Places, Distance Matrix

---

## ✅ Resumen

Ahora el sistema incluye:

✅ **Integración con Google:**
   - Maps API (rutas, geocoding, places)
   - Analytics
   - Tag Manager
   - reCAPTCHA

✅ **Integración con Couriers:**
   - ODDY Logística (courier principal)
   - FedEx, UPS, DHL, USPS
   - Correo Argentino, Correo Uruguayo
   - Andreani, OCA
   - Mercado Envíos

✅ **Generación de Códigos:**
   - Código de barras (Code 128)
   - Código QR con URL de tracking

✅ **APIs Unificadas:**
   - Crear envío en cualquier courier
   - Tracking desde cualquier courier
   - Configuración centralizada

**¡Sistema completo de integraciones listo!** 🔗🚀
