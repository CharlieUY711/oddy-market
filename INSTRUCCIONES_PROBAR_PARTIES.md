# 🚀 INSTRUCCIONES: Cómo Probar el Módulo PARTIES

**Fecha**: 12 de Febrero, 2026  
**Módulo**: `parties.tsx`  
**Estado**: ✅ LISTO PARA PROBAR

---

## 📋 QUÉ SE IMPLEMENTÓ

✅ **Backend completo**: `supabase/functions/server/parties.tsx` (850 líneas)  
✅ **Schema SQL**: `supabase/migrations/002_parties.sql`  
✅ **Documentación API**: `PARTIES_API_DOCUMENTACION.md`  

---

## 🚀 PASO 0: Iniciar el Servidor

### **Windows:**

Desde la raíz del proyecto, ejecuta:

```bash
start-server.bat
```

### **Mac/Linux:**

```bash
cd supabase/functions
deno run --allow-all --watch server/index.tsx
```

**Deberías ver:**

```
🚀 ODDY Market API Server starting...
📦 Loaded modules: parties, products, orders, inventory, categories, integrations
Listening on http://localhost:8000/
```

**Verifica que funciona:**

```bash
curl http://localhost:8000/
```

Deberías ver:

```json
{
  "status": "ok",
  "message": "ODDY Market API Server",
  "version": "1.0.0",
  "modules": ["parties", "products", "orders", "inventory", "categories", "integrations"]
}
```

---

## 🔧 PASO 1: Ejecutar Migración SQL

### **Opción A: Supabase Dashboard (Recomendado)**

1. Abre tu proyecto en **Supabase Dashboard**
2. Ve a **SQL Editor** (en el menú lateral)
3. Crea un nuevo query
4. Copia y pega el contenido de `supabase/migrations/002_parties.sql`
5. Haz clic en **RUN**

### **Opción B: CLI**

```bash
cd supabase
supabase db push
```

---

## 🧪 PASO 2: Crear tu Primera Party

### **1. Crear una Persona como Cliente**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "default",
    "type": "PERSON",
    "person_data": {
      "first_name": "Juan",
      "last_name": "Pérez",
      "date_of_birth": "1985-03-15",
      "gender": "MALE",
      "nationality": "UY"
    },
    "contact": {
      "email": "juan.perez@gmail.com",
      "phone": "+598 99 123 456",
      "address": {
        "street": "Av. 18 de Julio 1234",
        "city": "Montevideo",
        "postal_code": "11200",
        "country": "UY"
      }
    },
    "tax_data": {
      "tax_id": "12345678",
      "tax_id_type": "DNI",
      "country": "UY"
    },
    "roles": ["CUSTOMER"],
    "context_data": {
      "customer": {
        "credit_limit": 50000,
        "payment_terms": "NET_30",
        "loyalty_points": 0
      }
    }
  }'
```

**Deberías ver:**

```json
{
  "party": {
    "id": "party:1707753600000",
    "type": "PERSON",
    "person_data": { ... },
    "roles": ["CUSTOMER"],
    "status": "ACTIVE"
  }
}
```

---

### **2. Listar Parties**

```bash
curl http://localhost:8000/make-server-0dd48dc4/parties?entity_id=default&limit=10
```

---

### **3. Buscar por Nombre**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/parties/search?entity_id=default&q=juan"
```

---

### **4. Agregar Rol de Proveedor**

```bash
# Reemplaza PARTY_ID con el ID de la party creada
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties/PARTY_ID/roles \
  -H "Content-Type: application/json" \
  -d '{
    "role": "SUPPLIER",
    "context": {
      "supplier_type": "SERVICE",
      "payment_terms": "NET_60",
      "lead_time_days": 7,
      "rating": 4.5
    }
  }'
```

---

### **5. Ver Estadísticas**

```bash
curl http://localhost:8000/make-server-0dd48dc4/parties/PARTY_ID/stats
```

---

### **6. Dashboard General**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/parties/dashboard?entity_id=default"
```

---

## 📮 PASO 3 (Opcional): Probar con Postman

### **Importar Colección**

1. Abre **Postman**
2. Import → Raw text
3. Pega esta colección:

```json
{
  "info": {
    "name": "ODDY Parties API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Person (Customer)",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:8000/make-server-0dd48dc4/parties",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"entity_id\": \"default\",\n  \"type\": \"PERSON\",\n  \"person_data\": {\n    \"first_name\": \"María\",\n    \"last_name\": \"González\"\n  },\n  \"contact\": {\n    \"email\": \"maria@email.com\",\n    \"phone\": \"+598 99 555 666\"\n  },\n  \"roles\": [\"CUSTOMER\"],\n  \"context_data\": {\n    \"customer\": {\n      \"credit_limit\": 30000\n    }\n  }\n}"
        }
      }
    },
    {
      "name": "List Parties",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/make-server-0dd48dc4/parties?entity_id=default&limit=20"
      }
    },
    {
      "name": "Search Parties",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/make-server-0dd48dc4/parties/search?entity_id=default&q=maria"
      }
    },
    {
      "name": "Get Party by ID",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/make-server-0dd48dc4/parties/{{party_id}}"
      }
    },
    {
      "name": "Add Supplier Role",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:8000/make-server-0dd48dc4/parties/{{party_id}}/roles",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"role\": \"SUPPLIER\",\n  \"context\": {\n    \"supplier_type\": \"SERVICE\",\n    \"payment_terms\": \"NET_45\",\n    \"lead_time_days\": 7\n  }\n}"
        }
      }
    }
  ]
}
```

---

## 🎯 CASOS DE PRUEBA

### **Caso 1: Cliente Regular (B2C)**

```bash
# 1. Crear
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "default",
    "type": "PERSON",
    "person_data": {"first_name": "Ana", "last_name": "López"},
    "contact": {"email": "ana@email.com", "phone": "+598 99 777 888"},
    "roles": ["CUSTOMER"],
    "context_data": {
      "customer": {"credit_limit": 20000, "accepts_marketing": true}
    }
  }'

# 2. Simular compra (actualizar context)
curl -X PATCH http://localhost:8000/make-server-0dd48dc4/parties/PARTY_ID/context/CUSTOMER \
  -H "Content-Type: application/json" \
  -d '{
    "loyalty_points": 250,
    "total_orders": 1,
    "total_spent": 5000,
    "last_order_date": "2026-02-12T10:00:00Z"
  }'

# 3. Ver stats
curl http://localhost:8000/make-server-0dd48dc4/parties/PARTY_ID/stats
```

---

### **Caso 2: Empresa Proveedora**

```bash
# 1. Crear
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "default",
    "type": "ORGANIZATION",
    "organization_data": {
      "legal_name": "Importadora XYZ SA",
      "trade_name": "XYZ",
      "company_type": "SA"
    },
    "contact": {
      "email": "ventas@xyz.com",
      "phone": "+598 2 999 8888",
      "website": "https://xyz.com"
    },
    "tax_data": {"tax_id": "219876543210", "tax_id_type": "RUT", "country": "UY"},
    "roles": ["SUPPLIER"],
    "context_data": {
      "supplier": {
        "supplier_type": "MANUFACTURER",
        "payment_terms": "NET_90",
        "lead_time_days": 30,
        "certifications": ["ISO_9001"]
      }
    }
  }'

# 2. Evaluar después de orden
curl -X PATCH http://localhost:8000/make-server-0dd48dc4/parties/PARTY_ID/context/SUPPLIER \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4.8,
    "quality_score": 5.0,
    "delivery_score": 4.5,
    "preferred": true
  }'
```

---

### **Caso 3: Party con Múltiples Roles**

```bash
# 1. Crear como cliente
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "default",
    "type": "PERSON",
    "person_data": {"first_name": "Carlos", "last_name": "Rodríguez"},
    "contact": {"email": "carlos@email.com", "phone": "+598 99 111 222"},
    "roles": ["CUSTOMER"],
    "context_data": {"customer": {"credit_limit": 40000}}
  }'

# 2. Agregar rol de proveedor (es artesano)
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties/PARTY_ID/roles \
  -H "Content-Type: application/json" \
  -d '{
    "role": "SUPPLIER",
    "context": {
      "supplier_type": "ARTISAN",
      "payment_terms": "NET_30",
      "lead_time_days": 5
    }
  }'

# 3. Ver stats (verás customer Y supplier)
curl http://localhost:8000/make-server-0dd48dc4/parties/PARTY_ID/stats
```

---

## 🔍 VERIFICAR EN SUPABASE

1. Ve a **Supabase Dashboard**
2. **Table Editor** → `parties`
3. Verás todas las parties creadas con sus datos en JSONB

---

## ✅ CHECKLIST DE PRUEBAS

```
□ Crear persona como cliente
□ Crear organización como proveedor
□ Listar parties
□ Buscar por nombre
□ Buscar por email
□ Agregar rol a party existente
□ Quitar rol
□ Actualizar context_data
□ Ver stats de una party
□ Ver dashboard general
□ Listar solo customers
□ Listar solo suppliers
```

---

## 🐛 TROUBLESHOOTING

### **Error: "Entity not found"**

Asegúrate de ejecutar la migración `001_entities.sql` primero (si existe).

### **Error: "Connection refused"**

Verifica que el servidor Deno esté corriendo:

```bash
cd supabase/functions
deno run --allow-all server/index.tsx
```

### **Error: "Party not found"**

Verifica que el `PARTY_ID` sea correcto. Usa el ID retornado al crear la party.

---

## 📚 DOCUMENTACIÓN COMPLETA

Ver: `PARTIES_API_DOCUMENTACION.md`

---

## 🎉 ¡LISTO PARA PROBAR!

```
✅ Backend implementado
✅ Schema SQL creado
✅ Documentación completa
✅ Ejemplos de prueba listos
```

**¡Cualquier duda, pregúntame!** 🚀
