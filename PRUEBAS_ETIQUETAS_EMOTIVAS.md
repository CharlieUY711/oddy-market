# 🧪 Pruebas Rápidas: Etiquetas Emotivas

## 🚀 Prerequisitos

1. ✅ Servidor corriendo: `start-server.bat`
2. ✅ URL base: `http://localhost:8000`

---

## 📋 Tests Paso a Paso

### **Test 1: Generar Etiqueta Emotiva**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/emotive/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"package\": {
      \"tracking_number\": \"PKG-12345\",
      \"order_id\": \"order:123\",
      \"weight\": \"2.5kg\"
    },
    \"sender\": {
      \"party_id\": \"party:juan\",
      \"name\": \"Juan Pérez\",
      \"phone\": \"+598 99 123 456\",
      \"email\": \"juan@email.com\",
      \"address\": \"Av. Principal 123, Montevideo, Uruguay\"
    },
    \"recipient\": {
      \"party_id\": \"party:maria\",
      \"name\": \"María González\",
      \"phone\": \"+54 11 1234 5678\",
      \"email\": \"maria@email.com\",
      \"address\": \"Calle Falsa 456, Buenos Aires, Argentina\"
    },
    \"emotive_message\": {
      \"title\": \"¡Feliz Cumpleaños, María!\",
      \"message\": \"Espero que este regalo te traiga tanta alegría como tú me traes a mí cada día. Te quiero mucho. ❤️\",
      \"sender_signature\": \"Con todo mi cariño, Juan\",
      \"reveal_on_scan\": true
    },
    \"base_url\": \"http://localhost:8000\"
  }"
```

**Respuesta esperada:**
```json
{
  "emotive_label": {
    "id": "emotive:1707735000000",
    "label_type": "emotive",
    "package": {
      "tracking_number": "PKG-12345"
    },
    "sender": {
      "name": "Juan Pérez"
    },
    "recipient": {
      "name": "María González"
    },
    "emotive_message": {
      "title": "¡Feliz Cumpleaños, María!",
      "message": "Espero que este regalo te traiga tanta alegría..."
    },
    "qr_tracking": {
      "url": "http://localhost:8000/track/PKG-12345",
      "scanned": false
    },
    "qr_emotive": {
      "url": "http://localhost:8000/emotive/emotive:1707735000000",
      "scanned": false
    },
    "match": {
      "matched": false,
      "recipient_acknowledged": false
    },
    "status": "pending"
  },
  "message": "Emotive label generated successfully",
  "qr_codes": {
    "tracking": { "url": "...", "svg": "<svg>...</svg>" },
    "emotive": { "url": "...", "svg": "<svg>...</svg>" }
  },
  "printer_data": { ... }
}
```

**Guarda el `id` de la etiqueta** (ej: `emotive:1707735000000`)

---

### **Test 2: Actualizar Estado a "Entregado"**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/emotive/emotive:1707735000000/update-status \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"delivered\",
    \"delivered_to\": \"Portero del edificio\",
    \"tracking_update\": {
      \"location\": \"Buenos Aires, Argentina\",
      \"timestamp\": \"2026-02-12T10:00:00Z\",
      \"notes\": \"Entregado exitosamente\"
    }
  }"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "emotive_label": {
    "status": "delivered",
    "delivered_at": "2026-02-12T10:00:00Z"
  }
}
```

---

### **Test 3: Destinatario Escanea QR Emotivo**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/emotive/emotive:1707735000000/scan"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "emotive_label": {
    "id": "emotive:1707735000000",
    "package": {
      "tracking_number": "PKG-12345"
    },
    "sender": {
      "name": "Juan Pérez"
    },
    "recipient": {
      "name": "María González"
    },
    "emotive_message": {
      "title": "¡Feliz Cumpleaños, María!",
      "message": "Espero que este regalo te traiga tanta alegría como tú me traes a mí cada día. Te quiero mucho. ❤️",
      "sender_signature": "Con todo mi cariño, Juan"
    },
    "delivered_at": "2026-02-12T10:00:00Z",
    "days_since_delivery": 0
  },
  "can_acknowledge": true
}
```

**Esto simula:**
- El destinatario escanea el QR emotivo
- El sistema registra el escaneo
- Realiza el "match" entre remitente y destinatario
- Retorna los datos para mostrar la landing page

---

### **Test 4: Destinatario Agradece el Envío**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/emotive/emotive:1707735000000/acknowledge \
  -H "Content-Type: application/json" \
  -d "{
    \"thank_you_message\": \"¡Muchas gracias, Juan! Me encantó el regalo. Eres el mejor hermano del mundo. ❤️\"
  }"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Thank you message sent successfully!",
  "emotive_label": {
    "sender": { "name": "Juan Pérez" },
    "recipient": { "name": "María González" },
    "acknowledged_at": "2026-02-12T15:30:00Z"
  }
}
```

**En la consola del servidor verás:**
```
[NOTIFICATION] Sender Juan Pérez should be notified: Recipient acknowledged!
```

---

### **Test 5: Ver Etiqueta Emotiva Completa**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/emotive/emotive:1707735000000"
```

**Respuesta esperada:**
```json
{
  "emotive_label": {
    "id": "emotive:1707735000000",
    "package": { ... },
    "sender": { ... },
    "recipient": { ... },
    "emotive_message": { ... },
    "qr_tracking": {
      "scanned": false
    },
    "qr_emotive": {
      "scanned": true,
      "scanned_at": "2026-02-12T15:00:00Z"
    },
    "match": {
      "matched": true,
      "matched_at": "2026-02-12T15:00:00Z",
      "recipient_acknowledged": true,
      "acknowledged_at": "2026-02-12T15:30:00Z",
      "thank_you_message": "¡Muchas gracias, Juan! Me encantó el regalo. Eres el mejor hermano del mundo. ❤️"
    },
    "status": "acknowledged",
    "interactions": [
      {
        "type": "package_delivered",
        "timestamp": "2026-02-12T10:00:00Z",
        "delivered_to": "Portero del edificio"
      },
      {
        "type": "qr_emotive_scanned",
        "timestamp": "2026-02-12T15:00:00Z"
      },
      {
        "type": "recipient_acknowledged",
        "timestamp": "2026-02-12T15:30:00Z",
        "message": "¡Muchas gracias, Juan! ❤️"
      }
    ]
  }
}
```

---

### **Test 6: Listar Etiquetas Emotivas**

```bash
# Todas las etiquetas
curl "http://localhost:8000/make-server-0dd48dc4/emotive?entity_id=default"

# Por remitente
curl "http://localhost:8000/make-server-0dd48dc4/emotive?sender_id=party:juan"

# Por destinatario
curl "http://localhost:8000/make-server-0dd48dc4/emotive?recipient_id=party:maria"

# Por estado
curl "http://localhost:8000/make-server-0dd48dc4/emotive?status=acknowledged"
```

---

### **Test 7: Dashboard de Estadísticas**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/emotive/stats/dashboard?entity_id=default"
```

**Respuesta esperada:**
```json
{
  "stats": {
    "total": 1,
    "by_status": {
      "pending": 0,
      "shipped": 0,
      "delivered": 0,
      "revealed": 0,
      "acknowledged": 1
    },
    "qr_scans": {
      "tracking": 0,
      "emotive": 1
    },
    "matches": {
      "total": 1,
      "acknowledged": 1,
      "pending": 0
    },
    "avg_days_to_reveal": 0,
    "avg_days_to_acknowledge": 0
  }
}
```

---

## 🎯 Caso de Uso Completo: Regalo de Cumpleaños

### **Paso 1: Juan crea el envío**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/emotive/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"package\": {\"tracking_number\": \"GIFT-2024-001\"},
    \"sender\": {
      \"name\": \"Juan\",
      \"email\": \"juan@email.com\"
    },
    \"recipient\": {
      \"name\": \"María\",
      \"email\": \"maria@email.com\"
    },
    \"emotive_message\": {
      \"title\": \"¡Feliz Cumpleaños!\",
      \"message\": \"Espero que te guste el regalo. Te quiero mucho, hermanita.\",
      \"sender_signature\": \"Tu hermano, Juan\"
    }
  }"
```

Guarda el `id`: `emotive:XXXX`

---

### **Paso 2: Paquete enviado**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/emotive/emotive:XXXX/update-status \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"shipped\"}"
```

---

### **Paso 3: Paquete entregado (lo recibe el portero)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/emotive/emotive:XXXX/update-status \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"delivered\",
    \"delivered_to\": \"Portero\"
  }"
```

---

### **Paso 4: María encuentra el paquete 3 días después**

(Simula pasar el tiempo... ⏰)

---

### **Paso 5: María ve el QR emotivo y lo escanea**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/emotive/emotive:XXXX/scan"
```

**María ve:**
- Mensaje de Juan
- "¡Feliz Cumpleaños!"
- "Espero que te guste el regalo..."

---

### **Paso 6: María agradece**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/emotive/emotive:XXXX/acknowledge \
  -H "Content-Type: application/json" \
  -d "{
    \"thank_you_message\": \"¡Gracias, Juan! Me hiciste llorar. Te amo ❤️\"
  }"
```

---

### **Paso 7: Juan recibe notificación**

(En la consola verás el log de notificación)

Juan puede ver el agradecimiento:

```bash
curl "http://localhost:8000/make-server-0dd48dc4/emotive/emotive:XXXX"
```

---

## 🎨 Visualización del Flujo

```
┌────────────────────────────────────────────────────────────┐
│  DÍA 1: Juan crea el envío con mensaje emotivo            │
│  ✅ Etiqueta generada con 2 QR codes                       │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  DÍA 2: Paquete enviado                                    │
│  📦 Status: shipped                                         │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  DÍA 3: Paquete entregado (lo recibe el portero)          │
│  ✅ Status: delivered                                       │
└────────────────────────────────────────────────────────────┘
                          ↓
                    ⏰ 3 días pasan...
                          ↓
┌────────────────────────────────────────────────────────────┐
│  DÍA 6: María encuentra el paquete y ve QR emotivo        │
│  👁️ María escanea el QR                                    │
│  💌 Match realizado                                         │
│  📱 María ve el mensaje de Juan                            │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  DÍA 6 (10 min después): María agradece                   │
│  ❤️ "¡Gracias, Juan! Te amo"                              │
│  🔔 Juan recibe notificación                               │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Verificación

Después de ejecutar todas las pruebas, verifica:

- [ ] ✅ Etiqueta emotiva generada con 2 QR codes
- [ ] ✅ QR tracking tiene URL correcta
- [ ] ✅ QR emotivo tiene URL correcta
- [ ] ✅ Estado actualizado a "delivered"
- [ ] ✅ `delivered_at` tiene timestamp
- [ ] ✅ Escaneo de QR emotivo registrado
- [ ] ✅ Status cambió a "revealed"
- [ ] ✅ Match realizado (`matched: true`)
- [ ] ✅ Agradecimiento registrado
- [ ] ✅ Status cambió a "acknowledged"
- [ ] ✅ `thank_you_message` guardado
- [ ] ✅ Interacciones registradas
- [ ] ✅ Log de notificación en consola
- [ ] ✅ Dashboard muestra estadísticas correctas

---

## 🚨 Errores Comunes

### **Error: "Emotive label not found"**
- **Causa:** ID incorrecto
- **Solución:** Verifica el ID de la etiqueta generada

### **Error: "Already acknowledged"**
- **Causa:** Ya se agradeció anteriormente
- **Solución:** Solo se puede agradecer una vez

---

## 🎯 Próximos Pasos

### **Implementar en Frontend:**

1. **Landing page para QR emotivo:**
   - Diseño hermoso con gradientes
   - Mostrar mensaje, imagen, video
   - Formulario de agradecimiento
   - Animaciones emotivas

2. **Dashboard para remitentes:**
   - Ver todos los envíos emotivos
   - Ver agradecimientos recibidos
   - Estadísticas de engagement

3. **Notificaciones en tiempo real:**
   - Email al remitente cuando se escanea el QR
   - Email cuando se agradece
   - Push notifications

---

## 💡 Ideas para Mejorar

1. **Mensajes con Audio:**
   - Permitir grabar mensaje de voz
   - Incluir URL de audio en `emotive_message`

2. **Mensajes con Video:**
   - Ya soportado con `video_url`
   - Implementar player en landing page

3. **Múltiples QR Emotivos:**
   - Un QR por cada familiar/amigo
   - Mensajes personalizados

4. **Gamificación:**
   - Badges por cantidad de agradecimientos
   - Leaderboard de remitentes más emotivos

---

**¡Sistema de Etiquetas Emotivas listo para pruebas! 💌**
