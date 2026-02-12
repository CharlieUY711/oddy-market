# 🧪 Guía de Pruebas: Tickets + E-Invoice + Party Dashboard

## 🚀 Prerequisitos

1. ✅ Servidor corriendo: `start-server.bat`
2. ✅ URL base: `http://localhost:8000`
3. ✅ Tener una party creada (cliente)

---

## 📋 Paso a Paso

### **Paso 1: Crear un Cliente**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"type\": \"PERSON\",
    \"person_data\": {
      \"first_name\": \"Carlos\",
      \"last_name\": \"González\"
    },
    \"contact\": {
      \"email\": \"carlos@email.com\",
      \"phone\": \"+598 99 123 456\"
    },
    \"roles\": [\"CUSTOMER\"],
    \"context_data\": {
      \"customer\": {
        \"credit_limit\": 50000
      }
    }
  }"
```

**Guarda el `id` de la respuesta**, por ejemplo: `party:1707735000000`

---

### **Paso 2: Generar un Ticket**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/documents/generate-ticket \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"from\": {
      \"name\": \"ODDY Market\",
      \"address\": {
        \"street\": \"Av. Principal 123\",
        \"city\": \"Montevideo\",
        \"country\": \"UY\"
      }
    },
    \"to\": {
      \"party_id\": \"party:1707735000000\",
      \"name\": \"Carlos González\"
    },
    \"items\": [
      {
        \"product_id\": \"prod:001\",
        \"description\": \"Camiseta Deportiva\",
        \"quantity\": 2,
        \"unit_price\": 100,
        \"tax_rate\": 0.22,
        \"discount\": 0
      },
      {
        \"product_id\": \"prod:002\",
        \"description\": \"Pantalón Jeans\",
        \"quantity\": 1,
        \"unit_price\": 250,
        \"tax_rate\": 0.22,
        \"discount\": 0
      }
    ],
    \"payment_method\": \"cash\",
    \"thermal_format\": {
      \"width\": 58,
      \"font_size\": \"normal\",
      \"print_logo\": true,
      \"print_qr\": true
    },
    \"notes\": \"Gracias por su compra\"
  }"
```

**Respuesta esperada:**
```json
{
  "ticket": {
    "id": "doc:1707735100000",
    "document_type": "ticket",
    "document_number": "T-00001",
    "status": "paid",
    "total": 549,
    "...": "..."
  },
  "message": "Ticket generated successfully",
  "thermal_data": {
    "width": 58,
    "commands": [
      "ALIGN CENTER",
      "LOGO",
      "TEXT BOLD ON",
      "TEXT ODDY Market",
      "TEXT BOLD OFF",
      "LINE",
      "TEXT TICKET: T-00001",
      "TEXT FECHA: 12/02/2026 10:30:00",
      "LINE",
      "ALIGN LEFT",
      "TEXT Camiseta Deportiva x2 $244",
      "TEXT Pantalón Jeans x1 $305",
      "LINE",
      "ALIGN RIGHT",
      "TEXT BOLD ON",
      "TEXT TOTAL: $549",
      "TEXT BOLD OFF",
      "LINE",
      "ALIGN CENTER",
      "TEXT Gracias por su compra",
      "QR doc:1707735100000",
      "CUT"
    ]
  }
}
```

---

### **Paso 3: Generar una Factura**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/documents/generate-invoice \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"from\": {
      \"name\": \"ODDY Market S.A.\",
      \"tax_id\": \"123456789012\",
      \"address\": {
        \"street\": \"Av. Principal 123\",
        \"city\": \"Montevideo\",
        \"country\": \"UY\"
      }
    },
    \"to\": {
      \"party_id\": \"party:1707735000000\",
      \"name\": \"Carlos González\",
      \"tax_id\": \"987654321098\"
    },
    \"items\": [
      {
        \"product_id\": \"prod:001\",
        \"description\": \"Camiseta Deportiva\",
        \"quantity\": 5,
        \"unit_price\": 100,
        \"tax_rate\": 0.22
      }
    ],
    \"notes\": \"Factura contado\"
  }"
```

**Guarda el `id` de la factura** para el siguiente paso.

---

### **Paso 4: Configurar E-Invoice (Uruguay)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/documents/e-invoice/configure \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"country\": \"UY\",
    \"credentials\": {
      \"certificate\": \"-----BEGIN CERTIFICATE-----...\",
      \"key\": \"-----BEGIN PRIVATE KEY-----...\",
      \"rut\": \"123456789012\",
      \"username\": \"ODDY_USER\",
      \"password\": \"SECURE_PASSWORD\"
    },
    \"environment\": \"testing\",
    \"auto_send\": true,
    \"enabled\": true
  }"
```

**Respuesta esperada:**
```json
{
  "config": {
    "id": "e-invoice-config:default:UY",
    "entity_id": "default",
    "country": "UY",
    "provider": "dgi",
    "credentials": "***hidden***",
    "environment": "testing",
    "auto_send": true,
    "enabled": true
  },
  "message": "E-invoice configuration saved successfully"
}
```

---

### **Paso 5: Enviar Factura a DGI (Uruguay)**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/documents/doc:XXXXXXXX/submit-to-provider
```

*(Reemplaza `doc:XXXXXXXX` con el ID de la factura del Paso 3)*

**Respuesta esperada:**
```json
{
  "document": {
    "id": "doc:XXXXXXXX",
    "document_number": "A-00001",
    "status": "approved",
    "fiscal_validation": {
      "validated": true,
      "validation_date": "2026-02-12T10:00:00Z",
      "cfe": "CFE-1707735200000",
      "validation_code": "UY-1707735200000-abc123",
      "provider": "dgi",
      "environment": "testing"
    }
  },
  "message": "Document submitted successfully to Dirección General Impositiva",
  "validation": {
    "provider": "Dirección General Impositiva",
    "validation_code": "UY-1707735200000-abc123",
    "cae": null,
    "cfe": "CFE-1707735200000"
  }
}
```

---

### **Paso 6: Ver Dashboard de Documentos del Cliente**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/documents/party/party:1707735000000/dashboard?entity_id=default"
```

**Respuesta esperada:**
```json
{
  "dashboard": {
    "party_id": "party:1707735000000",
    "summary": {
      "total_documents": 2,
      "total_quotes": 0,
      "total_invoices": 1,
      "total_tickets": 1,
      "total_delivery_notes": 0
    },
    "financial": {
      "total_invoiced": 610,
      "total_paid": 549,
      "total_pending": 61
    },
    "recent_documents": [
      {
        "id": "doc:1707735100000",
        "document_type": "invoice",
        "document_number": "A-00001",
        "issue_date": "2026-02-12T10:00:00Z",
        "total": 610,
        "status": "approved",
        "pdf_url": "/files/invoices/A-00001.pdf"
      },
      {
        "id": "doc:1707735000000",
        "document_type": "ticket",
        "document_number": "T-00001",
        "issue_date": "2026-02-12T09:45:00Z",
        "total": 549,
        "status": "paid",
        "pdf_url": null
      }
    ]
  }
}
```

---

### **Paso 7: Ver Mis Documentos (desde la perspectiva del cliente)**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/documents/my-documents?party_id=party:1707735000000&entity_id=default"
```

**Respuesta esperada:**
```json
{
  "documents": [
    {
      "id": "doc:1707735100000",
      "document_type": "invoice",
      "document_number": "A-00001",
      "issue_date": "2026-02-12T10:00:00Z",
      "due_date": "2026-03-12T10:00:00Z",
      "total": 610,
      "currency": "USD",
      "status": "approved",
      "pdf_url": "/files/invoices/A-00001.pdf",
      "fiscal_validation": {
        "validated": true,
        "validation_code": "UY-1707735200000-abc123"
      }
    },
    {
      "id": "doc:1707735000000",
      "document_type": "ticket",
      "document_number": "T-00001",
      "issue_date": "2026-02-12T09:45:00Z",
      "due_date": null,
      "total": 549,
      "currency": "USD",
      "status": "paid",
      "pdf_url": null,
      "fiscal_validation": {
        "validated": false
      }
    }
  ],
  "total": 2
}
```

---

## 🌎 Pruebas Multi-País

### **Argentina (AFIP):**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/documents/e-invoice/configure \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"country\": \"AR\",
    \"credentials\": {
      \"cuit\": \"20123456789\",
      \"certificate\": \"...\",
      \"key\": \"...\"
    },
    \"environment\": \"testing\",
    \"enabled\": true
  }"
```

### **México (SAT):**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/documents/e-invoice/configure \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"country\": \"MX\",
    \"credentials\": {
      \"rfc\": \"ABC123456789\",
      \"certificate\": \"...\",
      \"key\": \"...\",
      \"password\": \"...\"
    },
    \"environment\": \"testing\",
    \"enabled\": true
  }"
```

### **Brasil (SEFAZ):**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/documents/e-invoice/configure \
  -H "Content-Type: application/json" \
  -d "{
    \"entity_id\": \"default\",
    \"country\": \"BR\",
    \"credentials\": {
      \"cnpj\": \"12345678000195\",
      \"certificate\": \"...\",
      \"key\": \"...\"
    },
    \"environment\": \"testing\",
    \"enabled\": true
  }"
```

---

## 🖨️ Cómo Interpretar los Comandos de Impresora Térmica

El campo `thermal_data.commands` contiene instrucciones para la impresora:

| Comando | Descripción |
|---------|-------------|
| `ALIGN CENTER` | Alinear texto al centro |
| `ALIGN LEFT` | Alinear texto a la izquierda |
| `ALIGN RIGHT` | Alinear texto a la derecha |
| `LOGO` | Imprimir logo (si disponible) |
| `TEXT BOLD ON` | Activar texto en negrita |
| `TEXT BOLD OFF` | Desactivar texto en negrita |
| `TEXT contenido` | Imprimir texto |
| `LINE` | Imprimir línea separadora |
| `QR datos` | Imprimir código QR con datos |
| `CUT` | Cortar papel |

---

## 🔍 Verificación

### ✅ **Checklist de Pruebas:**

- [ ] ✅ Cliente creado correctamente
- [ ] ✅ Ticket generado con comandos de impresora
- [ ] ✅ Factura generada
- [ ] ✅ Configuración de e-invoice guardada
- [ ] ✅ Factura enviada a proveedor
- [ ] ✅ Validación fiscal recibida (CFE/CAE)
- [ ] ✅ Dashboard de party muestra todos los documentos
- [ ] ✅ Endpoint "Mis Documentos" retorna lista correcta

---

## 🚨 Errores Comunes

### **Error: "Party not found"**
- **Solución:** Verifica que el `party_id` sea correcto

### **Error: "E-invoice not configured for this country"**
- **Solución:** Ejecuta el Paso 4 primero

### **Error: "Document not found"**
- **Solución:** Verifica que el ID del documento sea correcto

---

## 📊 Próximos Pasos

### **Implementar en Frontend:**
1. Componente de ticketera con vista previa
2. Dashboard de documentos del cliente
3. Configuración de e-invoice (admin panel)
4. Conexión USB/Network a impresora térmica

### **Mejoras Futuras:**
1. Integración real con APIs de proveedores
2. Firma digital de documentos
3. Generación de XML según formato de cada país
4. Webhooks de proveedores
5. Encriptación de credenciales

---

## ✅ Conclusión

Ahora tienes:
- ✅ Sistema de tickets para punto de venta
- ✅ Dashboard de documentos por cliente
- ✅ Integración preparada para 8 países de Latam
- ✅ Validación fiscal automática

**¡Todo listo para facturación electrónica profesional!** 🎉
