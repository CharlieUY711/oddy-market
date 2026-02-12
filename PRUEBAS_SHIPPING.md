# 🧪 Pruebas Rápidas: Módulo de Shipping

## 🚀 Prerequisitos

1. ✅ Servidor corriendo: `start-server.bat`
2. ✅ URL base: `http://localhost:8000`

---

## 📋 Tests Paso a Paso

### **Test 1: Crear Envío**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/shipments \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"order_id\": \"order:123\",
    \"sender\": {
      \"party_id\": \"party:juan\",
      \"name\": \"Juan Pérez\",
      \"phone\": \"+598 99 123 456\",
      \"email\": \"juan@email.com\",
      \"address\": {
        \"street\": \"Av. Principal 123\",
        \"city\": \"Montevideo\",
        \"state\": \"Montevideo\",
        \"postal_code\": \"11000\",
        \"country\": \"UY\",
        \"coordinates\": {
          \"lat\": -34.9011,
          \"lng\": -56.1645
        }
      }
    },
    \"recipient\": {
      \"party_id\": \"party:maria\",
      \"name\": \"María González\",
      \"phone\": \"+54 11 1234 5678\",
      \"email\": \"maria@email.com\",
      \"address\": {
        \"street\": \"Calle Falsa 456\",
        \"city\": \"Buenos Aires\",
        \"state\": \"CABA\",
        \"postal_code\": \"C1000\",
        \"country\": \"AR\",
        \"coordinates\": {
          \"lat\": -34.6037,
          \"lng\": -58.3816
        }
      }
    },
    \"package\": {
      \"weight\": 2.5,
      \"dimensions\": {
        \"length\": 30,
        \"width\": 20,
        \"height\": 10
      },
      \"declared_value\": 100,
      \"currency\": \"USD\",
      \"contents\": \"Ropa deportiva\",
      \"quantity\": 3,
      \"fragile\": false,
      \"requires_signature\": true
    },
    \"service\": {
      \"type\": \"express\",
      \"courier\": \"fedex\"
    }
  }"
```

**Respuesta esperada:**
```json
{
  "shipment": {
    "id": "shipment:1707735000000",
    "tracking_number": "ODYABC123XYZ",
    "status": "pending",
    "google_maps": {
      "distance": 230,
      "duration": 230,
      "eta": "2026-02-14T10:00:00Z"
    },
    "events": [
      {
        "type": "created",
        "status": "pending",
        "description": "Envío creado"
      }
    ]
  },
  "message": "Shipment created successfully"
}
```

**Guarda:**
- `id`: `shipment:1707735000000`
- `tracking_number`: `ODYABC123XYZ`

---

### **Test 2: Actualizar a "Recolectado"**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/shipments/shipment:1707735000000/update-status \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"picked_up\",
    \"location\": \"Montevideo\",
    \"description\": \"Paquete recolectado por FedEx\",
    \"coordinates\": {
      \"lat\": -34.9011,
      \"lng\": -56.1645
    }
  }"
```

---

### **Test 3: Actualizar Ubicación (En tránsito)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/shipments/shipment:1707735000000/update-location \
  -H "Content-Type: application/json" \
  -d "{
    \"coordinates\": {
      \"lat\": -34.75,
      \"lng\": -57.0
    },
    \"address\": \"Ruta 1 km 150\",
    \"city\": \"Colonia\",
    \"country\": \"UY\",
    \"description\": \"Pasando por Colonia\"
  }"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "shipment": {
    "current_location": {
      "coordinates": { "lat": -34.75, "lng": -57.0 },
      "city": "Colonia",
      "timestamp": "2026-02-12T15:30:00Z"
    },
    "google_maps": {
      "distance": 120,
      "duration": 120,
      "eta": "2026-02-13T18:00:00Z"
    }
  },
  "message": "Location updated successfully"
}
```

---

### **Test 4: Actualizar a "En tránsito"**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/shipments/shipment:1707735000000/update-status \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"in_transit\",
    \"location\": \"Colonia\",
    \"description\": \"En tránsito hacia Buenos Aires\"
  }"
```

---

### **Test 5: Tracking por Número**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/shipments/track/ODYABC123XYZ?entity_id=default"
```

**Respuesta esperada:**
```json
{
  "tracking": {
    "tracking_number": "ODYABC123XYZ",
    "status": "in_transit",
    "current_location": {
      "coordinates": { "lat": -34.75, "lng": -57.0 },
      "city": "Colonia"
    },
    "recipient": {
      "name": "María González",
      "city": "Buenos Aires"
    },
    "service": {
      "type": "express",
      "estimated_delivery_date": "2026-02-14T10:00:00Z"
    },
    "events": [
      {
        "type": "created",
        "description": "Envío creado",
        "location": "Montevideo"
      },
      {
        "type": "status_change",
        "description": "Paquete recolectado",
        "location": "Montevideo"
      },
      {
        "type": "location_update",
        "description": "Pasando por Colonia",
        "location": "Colonia"
      }
    ],
    "google_maps": {
      "distance": 120,
      "duration": 120,
      "eta": "2026-02-13T18:00:00Z"
    }
  }
}
```

---

### **Test 6: Actualizar Ubicación (Cerca de destino)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/shipments/shipment:1707735000000/update-location \
  -H "Content-Type: application/json" \
  -d "{
    \"coordinates\": {
      \"lat\": -34.62,
      \"lng\": -58.40
    },
    \"address\": \"Av. 9 de Julio\",
    \"city\": \"Buenos Aires\",
    \"country\": \"AR\",
    \"description\": \"Entrando a Buenos Aires\"
  }"
```

---

### **Test 7: Actualizar a "En reparto"**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/shipments/shipment:1707735000000/update-status \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"out_for_delivery\",
    \"location\": \"Buenos Aires\",
    \"description\": \"En reparto - Llegará hoy\"
  }"
```

---

### **Test 8: Marcar como "Entregado"**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/shipments/shipment:1707735000000/update-status \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"delivered\",
    \"location\": \"Buenos Aires\",
    \"description\": \"Entregado exitosamente\",
    \"coordinates\": {
      \"lat\": -34.6037,
      \"lng\": -58.3816
    },
    \"delivery_info\": {
      \"delivered_to\": \"María González\",
      \"signature\": \"base64_signature_image\",
      \"photo_proof\": \"base64_photo\",
      \"notes\": \"Entregado en mano\"
    }
  }"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "shipment": {
    "status": "delivered",
    "delivered_at": "2026-02-14T09:30:00Z",
    "delivery_info": {
      "delivered_to": "María González",
      "signature": "base64_signature_image",
      "photo_proof": "base64_photo",
      "notes": "Entregado en mano"
    }
  },
  "message": "Status updated successfully"
}
```

---

### **Test 9: Ver Envío Completo**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/shipments/shipment:1707735000000"
```

---

### **Test 10: Listar Todos los Envíos**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/shipments?entity_id=default"
```

---

### **Test 11: Listar por Estado**

```bash
# Envíos en tránsito
curl "http://localhost:8000/make-server-0dd48dc4/shipments?entity_id=default&status=in_transit"

# Envíos entregados
curl "http://localhost:8000/make-server-0dd48dc4/shipments?entity_id=default&status=delivered"
```

---

### **Test 12: Dashboard de Estadísticas**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/shipments/stats/dashboard?entity_id=default"
```

**Respuesta esperada:**
```json
{
  "stats": {
    "total": 1,
    "by_status": {
      "delivered": 1
    },
    "by_service_type": {
      "express": 1
    },
    "by_courier": {
      "fedex": 1
    },
    "total_shipping_cost": 0,
    "avg_delivery_time": 2,
    "on_time_delivery_rate": 100
  }
}
```

---

### **Test 13: Mapa en Vivo (Envíos Activos)**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/shipments/live-map?entity_id=default"
```

**Respuesta esperada:**
```json
{
  "active_shipments": [
    {
      "id": "shipment:2",
      "tracking_number": "ODYXYZ789",
      "status": "in_transit",
      "current_location": {
        "coordinates": { "lat": -34.75, "lng": -57.0 },
        "city": "Colonia"
      },
      "recipient": {
        "name": "Carlos López",
        "city": "Buenos Aires",
        "coordinates": { "lat": -34.6037, "lng": -58.3816 }
      },
      "google_maps": {
        "distance": 120,
        "duration": 120,
        "eta": "2026-02-13T18:00:00Z"
      }
    }
  ],
  "total": 1
}
```

---

### **Test 14: Calcular Tarifa de Envío**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/shipments/calculate-rate \
  -H "Content-Type: application/json" \
  -d "{
    \"from_coordinates\": {
      \"lat\": -34.9011,
      \"lng\": -56.1645
    },
    \"to_coordinates\": {
      \"lat\": -34.6037,
      \"lng\": -58.3816
    },
    \"weight\": 2.5,
    \"service_type\": \"express\",
    \"courier\": \"fedex\"
  }"
```

**Respuesta esperada:**
```json
{
  "rate": {
    "distance": 230,
    "duration": 230,
    "service_type": "express",
    "courier": "fedex",
    "costs": {
      "base_cost": 5.00,
      "distance_cost": 115.00,
      "weight_cost": 5.00,
      "service_cost": 62.50,
      "total_cost": 187.50,
      "currency": "USD"
    },
    "estimated_delivery_date": "2026-02-14T10:00:00Z"
  }
}
```

---

## 🎯 Flujo Completo: Montevideo → Buenos Aires

```
┌────────────────────────────────────────────────────────────┐
│  DÍA 1 (10:00): Envío creado                               │
│  📍 Ubicación: Montevideo (-34.9011, -56.1645)            │
│  📊 Status: pending                                        │
│  📦 Distancia total: 230 km                               │
│  ⏰ ETA: 14/02 10:00                                       │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  DÍA 1 (11:00): Paquete recolectado                       │
│  📍 Ubicación: Montevideo                                  │
│  📊 Status: picked_up                                      │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  DÍA 1 (15:30): En tránsito                               │
│  📍 Ubicación: Colonia (-34.75, -57.0)                    │
│  📊 Status: in_transit                                     │
│  📦 Distancia restante: 120 km                            │
│  ⏰ ETA actualizado: 13/02 18:00                           │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  DÍA 2 (08:00): Entrando a Buenos Aires                   │
│  📍 Ubicación: Av. 9 de Julio (-34.62, -58.40)           │
│  📊 Status: out_for_delivery                               │
│  📦 Distancia restante: 5 km                              │
│  ⏰ ETA: Hoy 09:30                                         │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  DÍA 2 (09:30): Entregado ✅                               │
│  📍 Ubicación: Calle Falsa 456 (-34.6037, -58.3816)      │
│  📊 Status: delivered                                      │
│  ✍️ Firma: María González                                 │
│  📸 Foto de prueba: ✅                                     │
└────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Visualización en Mapa

### **HTML con Google Maps:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Tracking en Vivo</title>
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
  <style>
    #map { height: 600px; width: 100%; }
  </style>
</head>
<body>
  <h1>Tracking: ODYABC123XYZ</h1>
  <div id="map"></div>
  
  <script>
    async function showTracking() {
      // Obtener datos del envío
      const response = await fetch('/shipments/track/ODYABC123XYZ?entity_id=default');
      const { tracking } = await response.json();
      
      // Inicializar mapa
      const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: tracking.current_location.coordinates
      });
      
      // Marcador: Ubicación actual (camión)
      new google.maps.Marker({
        position: tracking.current_location.coordinates,
        map,
        title: 'Ubicación actual',
        icon: {
          url: 'truck-icon.png',
          scaledSize: new google.maps.Size(50, 50)
        }
      });
      
      // Marcador: Destino
      new google.maps.Marker({
        position: { lat: -34.6037, lng: -58.3816 },
        map,
        title: 'Destino: Buenos Aires',
        icon: {
          url: 'destination-icon.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      });
      
      // Línea de ruta
      new google.maps.Polyline({
        path: [
          tracking.current_location.coordinates,
          { lat: -34.6037, lng: -58.3816 }
        ],
        map,
        strokeColor: '#0000FF',
        strokeOpacity: 0.7,
        strokeWeight: 3
      });
      
      // Info
      document.body.innerHTML += `
        <div style="padding: 20px;">
          <h2>Estado: ${tracking.status}</h2>
          <p>📍 Ubicación actual: ${tracking.current_location.city}</p>
          <p>📦 Distancia restante: ${tracking.google_maps.distance} km</p>
          <p>⏰ ETA: ${new Date(tracking.google_maps.eta).toLocaleString()}</p>
        </div>
      `;
      
      // Actualizar cada 30 segundos
      setInterval(() => {
        location.reload();
      }, 30000);
    }
    
    showTracking();
  </script>
</body>
</html>
```

---

## ✅ Checklist de Verificación

Después de las pruebas:

- [ ] ✅ Envío creado con coordenadas
- [ ] ✅ Tracking number generado
- [ ] ✅ Google Maps calculó distancia y ETA
- [ ] ✅ Status actualizado correctamente
- [ ] ✅ Ubicación actualizada en tiempo real
- [ ] ✅ ETA recalculado al actualizar ubicación
- [ ] ✅ Historial de ubicaciones guardado
- [ ] ✅ Eventos registrados correctamente
- [ ] ✅ Entrega completada con firma y foto
- [ ] ✅ Tracking público funciona
- [ ] ✅ Dashboard muestra estadísticas
- [ ] ✅ Mapa en vivo muestra envíos activos
- [ ] ✅ Cálculo de tarifas funciona

---

## 🚀 Próximos Pasos

1. **Integrar Google Maps API real**
2. **Implementar notificaciones** (SMS, email, push)
3. **App móvil para courier** (actualización GPS automática)
4. **Landing page de tracking** para clientes
5. **Chat en vivo** con el courier

---

**¡Sistema de shipping con geoposicionamiento listo! 🚚📍**
