# 🧪 Pruebas Rápidas: Sistema de Etiquetas

## 🚀 Inicio Rápido

1. ✅ Servidor corriendo: `start-server.bat`
2. ✅ URL base: `http://localhost:8000`

---

## 📋 Tests Paso a Paso

### **Test 1: Etiqueta de Precio Simple**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"label_type\": \"price\",
    \"format\": {\"width\": 40, \"height\": 30, \"name\": \"Pequeña\"},
    \"content\": {
      \"title\": \"Camiseta A\",
      \"price\": 999,
      \"currency\": \"USD\",
      \"sku\": \"CAM-001\"
    }
  }"
```

**Respuesta esperada:**
```json
{
  "label": {
    "id": "label:XXX",
    "label_type": "price",
    "content": {
      "title": "Camiseta A",
      "price": 999,
      "currency": "USD",
      "sku": "CAM-001"
    }
  },
  "message": "Label generated successfully",
  "printer_data": {
    "format": "TSPL",
    "commands": [
      "SIZE 40mm,30mm",
      "GAP 3mm,0mm",
      "CLS",
      "TEXT 10,10,\"3\",0,1,1,\"Camiseta A\"",
      "TEXT 10,70,\"4\",0,1,1,\"USD 999\"",
      "TEXT 10,230,\"1\",0,1,1,\"SKU: CAM-001\"",
      "PRINT 1,1"
    ]
  }
}
```

---

### **Test 2: Etiqueta con Código de Barras**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"label_type\": \"barcode\",
    \"format\": {\"width\": 70, \"height\": 50, \"name\": \"Mediana\"},
    \"content\": {
      \"title\": \"Producto Premium\",
      \"sku\": \"PREM-001\",
      \"barcode_data\": \"7501234567890\",
      \"barcode_type\": \"ean13\"
    }
  }"
```

**Respuesta incluye:**
```json
{
  "label": {
    "content": {
      "barcode": {
        "type": "ean13",
        "data": "7501234567890",
        "image_base64": "data:image/png;base64,...",
        "svg": "<svg>...</svg>"
      }
    }
  },
  "printer_data": {
    "commands": [
      ...
      "BARCODE 10,200,\"EAN13\",50,1,0,2,2,\"7501234567890\""
    ]
  }
}
```

---

### **Test 3: Etiqueta con Código QR**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"label_type\": \"product\",
    \"format\": {\"width\": 100, \"height\": 70, \"name\": \"Grande\"},
    \"content\": {
      \"title\": \"Producto Digital\",
      \"price\": 2500,
      \"currency\": \"USD\",
      \"qr_data\": \"https://oddy.market/products/prod-001\"
    }
  }"
```

**Respuesta incluye:**
```json
{
  "label": {
    "content": {
      "qr": {
        "type": "qr",
        "data": "https://oddy.market/products/prod-001",
        "image_base64": "data:image/png;base64,...",
        "svg": "<svg>...</svg>"
      }
    }
  },
  "printer_data": {
    "commands": [
      ...
      "QRCODE 400,10,H,5,A,0,\"https://oddy.market/products/prod-001\""
    ]
  }
}
```

---

### **Test 4: Etiquetas en Lote (5 productos)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/generate-batch \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"label_type\": \"product\",
    \"format\": {\"width\": 70, \"height\": 50, \"name\": \"Mediana\"},
    \"products\": [
      {\"name\": \"Camiseta A\", \"price\": 1000, \"sku\": \"CAM-A\", \"barcode\": \"7501111111111\", \"quantity\": 10},
      {\"name\": \"Camiseta B\", \"price\": 1100, \"sku\": \"CAM-B\", \"barcode\": \"7501111111112\", \"quantity\": 15},
      {\"name\": \"Pantalón A\", \"price\": 2000, \"sku\": \"PAN-A\", \"barcode\": \"7501222222221\", \"quantity\": 8},
      {\"name\": \"Pantalón B\", \"price\": 2200, \"sku\": \"PAN-B\", \"barcode\": \"7501222222222\", \"quantity\": 12},
      {\"name\": \"Gorra A\", \"price\": 500, \"sku\": \"GOR-A\", \"barcode\": \"7501333333331\", \"quantity\": 20}
    ]
  }"
```

**Respuesta:**
```json
{
  "labels": [
    { "id": "label:1", "content": {...}, "quantity": 10 },
    { "id": "label:2", "content": {...}, "quantity": 15 },
    { "id": "label:3", "content": {...}, "quantity": 8 },
    { "id": "label:4", "content": {...}, "quantity": 12 },
    { "id": "label:5", "content": {...}, "quantity": 20 }
  ],
  "total": 5,
  "message": "5 labels generated successfully",
  "printer_data": [ ... ]
}
```

---

### **Test 5: Listar Plantillas Disponibles**

```bash
curl http://localhost:8000/make-server-0dd48dc4/labels/templates/list
```

**Respuesta:**
```json
{
  "templates": [
    {
      "id": "price-basic",
      "name": "Precio Simple",
      "type": "price",
      "format": { "width": 40, "height": 30 },
      "fields": ["title", "price", "currency"]
    },
    {
      "id": "barcode-ean13",
      "name": "Código de Barras EAN-13",
      "type": "barcode",
      "format": { "width": 70, "height": 50 },
      "fields": ["title", "sku", "barcode_data"]
    },
    {
      "id": "product-full",
      "name": "Producto Completo",
      "type": "product",
      "format": { "width": 100, "height": 70 },
      "fields": ["title", "subtitle", "description", "price", "barcode_data", "qr_data"]
    },
    {
      "id": "shipping-address",
      "name": "Etiqueta de Envío",
      "type": "shipping",
      "format": { "width": 100, "height": 150 },
      "fields": ["title", "subtitle", "description", "barcode_data", "qr_data"]
    }
  ]
}
```

---

### **Test 6: Generar desde Plantilla**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/from-template \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"template_id\": \"price-basic\",
    \"content\": {
      \"title\": \"Producto Especial\",
      \"price\": 1599,
      \"currency\": \"USD\"
    },
    \"product_id\": \"prod:999\"
  }"
```

---

### **Test 7: Etiqueta de Envío Completa**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"label_type\": \"shipping\",
    \"format\": {\"width\": 100, \"height\": 150, \"name\": \"Envío\"},
    \"content\": {
      \"title\": \"PEDIDO #00123\",
      \"subtitle\": \"Juan Pérez\",
      \"description\": \"Calle Falsa 456, Buenos Aires, Argentina\",
      \"barcode_data\": \"PKG-00123\",
      \"barcode_type\": \"code128\",
      \"qr_data\": \"https://oddy.market/track/PKG-00123\",
      \"custom_fields\": {
        \"peso\": \"2.5 kg\",
        \"piezas\": \"3\"
      }
    }
  }"
```

---

### **Test 8: Etiqueta Promocional**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"label_type\": \"promotional\",
    \"format\": {\"width\": 100, \"height\": 70, \"name\": \"Grande\"},
    \"content\": {
      \"title\": \"SUPER OFERTA\",
      \"subtitle\": \"Camiseta Premium\",
      \"price\": 1200,
      \"currency\": \"USD\",
      \"discount\": 30
    },
    \"style\": {
      \"background_color\": \"#FF0000\",
      \"text_color\": \"#FFFFFF\",
      \"border\": true,
      \"border_color\": \"#FFFF00\"
    }
  }"
```

---

### **Test 9: Listar Etiquetas Generadas**

```bash
# Todas las etiquetas
curl "http://localhost:8000/make-server-0dd48dc4/labels?entity_id=default"

# Por tipo
curl "http://localhost:8000/make-server-0dd48dc4/labels?entity_id=default&label_type=price"

# Por producto
curl "http://localhost:8000/make-server-0dd48dc4/labels?entity_id=default&product_id=prod:123"
```

---

### **Test 10: Obtener Etiqueta Específica**

```bash
curl http://localhost:8000/make-server-0dd48dc4/labels/label:1707735000000
```

---

## 📊 Casos de Uso Reales

### **Caso A: Tienda de Ropa - Etiquetas de Precio**

1. Importar 100 productos desde Excel
2. Generar etiquetas de precio en lote
3. Enviar a impresora de etiquetas
4. Colocar en productos físicos

**Comando:**
```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/generate-batch \
  -H "Content-Type: application/json" \
  -d @products.json
```

---

### **Caso B: Supermercado - Productos Perecederos**

1. Generar etiqueta con fecha de vencimiento
2. Incluir código de barras
3. Imprimir en impresora de góndola

**Comando:**
```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"label_type\": \"product\",
    \"content\": {
      \"title\": \"Yogur Natural\",
      \"price\": 250,
      \"barcode_data\": \"7501234567890\",
      \"custom_fields\": {
        \"vencimiento\": \"15/03/2026\",
        \"lote\": \"L-2024-001\"
      }
    }
  }"
```

---

### **Caso C: E-commerce - Etiquetas de Envío**

1. Procesar pedido
2. Generar etiqueta de envío automáticamente
3. Incluir tracking number
4. Imprimir y pegar en paquete

**Comando:**
```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"label_type\": \"shipping\",
    \"format\": {\"width\": 100, \"height\": 150},
    \"content\": {
      \"title\": \"Pedido #12345\",
      \"subtitle\": \"Carlos González\",
      \"description\": \"Av. Brasil 1234, Montevideo, Uruguay\",
      \"barcode_data\": \"TRK-99887766\",
      \"qr_data\": \"https://track.courier.com/TRK-99887766\"
    }
  }"
```

---

### **Caso D: Depósito - Etiquetas de Ubicación**

1. Recibir mercadería
2. Asignar ubicación en depósito
3. Generar etiqueta con ubicación + código de barras
4. Escanear para ubicar productos

**Comando:**
```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/labels/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"label_type\": \"inventory\",
    \"content\": {
      \"title\": \"Camiseta Nike Pro\",
      \"sku\": \"CAM-001\",
      \"barcode_data\": \"CAM-001\",
      \"custom_fields\": {
        \"ubicacion\": \"A-12-3\",
        \"pasillo\": \"A\",
        \"estante\": \"12\",
        \"nivel\": \"3\"
      }
    }
  }"
```

---

## ✅ Checklist de Verificación

- [ ] ✅ Servidor corriendo en puerto 8000
- [ ] ✅ Etiqueta simple generada correctamente
- [ ] ✅ Código de barras incluido en respuesta
- [ ] ✅ Código QR incluido en respuesta
- [ ] ✅ Etiquetas en lote funcionan (5+ productos)
- [ ] ✅ Plantillas listadas correctamente
- [ ] ✅ Generación desde plantilla funciona
- [ ] ✅ Comandos TSPL generados
- [ ] ✅ Etiquetas listadas por tipo
- [ ] ✅ Etiquetas listadas por producto

---

## 🖨️ Cómo Enviar a Impresora

### **Opción A: Via Web (qz-tray)**

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/qz-tray@2.2.0/qz-tray.min.js"></script>
</head>
<body>
  <button onclick="printLabel()">Imprimir Etiqueta</button>
  
  <script>
    async function printLabel() {
      // Obtener etiqueta del backend
      const response = await fetch('/labels/label:123');
      const { label } = await response.json();
      const commands = label.printer_data.raw;
      
      // Conectar a impresora
      await qz.websocket.connect();
      const printer = await qz.printers.find("Zebra");
      const config = qz.configs.create(printer);
      
      // Imprimir
      await qz.print(config, [commands]);
    }
  </script>
</body>
</html>
```

### **Opción B: Via USB/Serial (Node.js)**

```javascript
import SerialPort from 'serialport';

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });

// Obtener comandos de etiqueta
const commands = label.printer_data.raw;

// Enviar a impresora
port.write(commands, (err) => {
  if (err) console.error('Error:', err);
  else console.log('¡Etiqueta impresa!');
});
```

### **Opción C: Via Red (TCP/IP)**

```javascript
import net from 'net';

const client = new net.Socket();
client.connect(9100, '192.168.1.100', () => {
  // Enviar comandos a impresora en red
  client.write(label.printer_data.raw);
  client.destroy();
});
```

---

## 📝 Notas Importantes

1. **Códigos de Barras:** Actualmente simulados. En producción usar librería como `bwip-js`
2. **Formato TSPL:** Compatible con la mayoría de impresoras (Zebra, TSC, Datamax)
3. **Tamaños:** Verificar que la impresora soporte el tamaño de etiqueta configurado
4. **Drivers:** Instalar drivers de impresora en el sistema operativo

---

## 🚀 Próximos Pasos

1. Probar generación de etiquetas ✅
2. Visualizar comandos TSPL
3. Conectar impresora física
4. Imprimir etiqueta de prueba
5. Ajustar formato según necesidad

---

**¡Sistema de etiquetas listo para usar!** 🎉
