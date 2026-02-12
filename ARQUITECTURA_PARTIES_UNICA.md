# 🏗️ ARQUITECTURA CORRECTA: PARTIES ÚNICA

**Fecha**: 12 de Febrero, 2026  
**Decisión**: Una sola entidad con roles contextuales

---

## 🎯 VISIÓN DEL USUARIO (CORRECTA)

> "Las entidades son una sola, son proveedores, clientes o lo que fuere desde el punto de vista contextual. Por eso no uso clientes ni proveedores, siempre persona o entidades."

---

## ✅ ARQUITECTURA APROBADA

### **Concepto**

```
┌───────────────────────────────────────────────────┐
│  PARTIES (Única tabla)                            │
├───────────────────────────────────────────────────┤
│  - id: UUID                                       │
│  - type: PERSON | ORGANIZATION                    │
│  - person_data: { first_name, last_name, DNI }   │
│  - org_data: { legal_name, RUT, company_type }   │
│  - contact: { email, phone, address }            │
│  - roles: [CUSTOMER, SUPPLIER, EMPLOYEE, ...]    │
│  - context_data: JSONB (datos específicos)       │
└───────────────────────────────────────────────────┘
```

**Principio:**
- Una **party** puede tener múltiples **roles** (contextos)
- Los datos específicos del contexto se guardan en `context_data` (JSONB)

---

## 🗄️ SCHEMA SQL SIMPLIFICADO

### **1. Tabla: parties**

```sql
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id), -- Multi-tenant
  
  -- Tipo de party
  type VARCHAR(20) NOT NULL CHECK (type IN ('PERSON', 'ORGANIZATION')),
  
  -- Datos según tipo (JSONB para flexibilidad)
  person_data JSONB,
  -- {
  --   "first_name": "Juan",
  --   "last_name": "Pérez",
  --   "date_of_birth": "1985-03-15",
  --   "gender": "MALE",
  --   "nationality": "UY"
  -- }
  
  organization_data JSONB,
  -- {
  --   "legal_name": "Empresa SA",
  --   "trade_name": "Empresa",
  --   "company_type": "SA",
  --   "incorporation_date": "2020-01-01",
  --   "industry": "RETAIL"
  -- }
  
  -- Contacto (común para ambos)
  contact JSONB NOT NULL,
  -- {
  --   "email": "contacto@email.com",
  --   "phone": "+598 99 123 456",
  --   "mobile": "+598 99 987 654",
  --   "website": "https://empresa.com",
  --   "address": {
  --     "street": "Av. 18 de Julio 1234",
  --     "city": "Montevideo",
  --     "state": "Montevideo",
  --     "postal_code": "11200",
  --     "country": "UY"
  --   }
  -- }
  
  -- Identificación fiscal
  tax_data JSONB,
  -- {
  --   "tax_id": "12345678",
  --   "tax_id_type": "DNI", -- DNI, RUT, CUIT, RFC, etc.
  --   "tax_status": "ACTIVE",
  --   "country": "UY"
  -- }
  
  -- Roles contextuales (array)
  roles VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR[],
  -- ['CUSTOMER', 'SUPPLIER', 'EMPLOYEE', etc.]
  
  -- Datos contextuales específicos
  context_data JSONB DEFAULT '{}'::JSONB,
  -- {
  --   "customer": {
  --     "credit_limit": 50000,
  --     "payment_terms": "NET_30",
  --     "loyalty_points": 1500,
  --     "total_orders": 45,
  --     "total_spent": 125000
  --   },
  --   "supplier": {
  --     "payment_terms": "NET_60",
  --     "lead_time_days": 15,
  --     "rating": 4.5,
  --     "total_orders": 12
  --   },
  --   "employee": {
  --     "department": "Sales",
  --     "position": "Manager",
  --     "hire_date": "2021-01-15",
  --     "salary": 50000
  --   }
  -- }
  
  -- Status
  status VARCHAR(20) DEFAULT 'ACTIVE',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  -- Cualquier otro dato adicional
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT parties_type_data_check CHECK (
    (type = 'PERSON' AND person_data IS NOT NULL) OR
    (type = 'ORGANIZATION' AND organization_data IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_parties_entity ON parties(entity_id);
CREATE INDEX idx_parties_type ON parties(type);
CREATE INDEX idx_parties_roles ON parties USING GIN(roles);
CREATE INDEX idx_parties_contact_email ON parties USING GIN((contact->'email'));
CREATE INDEX idx_parties_tax_id ON parties USING GIN((tax_data->'tax_id'));
CREATE INDEX idx_parties_status ON parties(status);

-- Full-text search
CREATE INDEX idx_parties_search ON parties USING GIN(
  to_tsvector('spanish', 
    COALESCE(person_data->>'first_name', '') || ' ' ||
    COALESCE(person_data->>'last_name', '') || ' ' ||
    COALESCE(organization_data->>'legal_name', '') || ' ' ||
    COALESCE(organization_data->>'trade_name', '') || ' ' ||
    COALESCE(contact->>'email', '')
  )
);
```

---

## 📝 EJEMPLOS DE USO

### **1. Crear persona como cliente**

```javascript
POST /make-server-0dd48dc4/parties
{
  "entity_id": "uuid-oddy",
  "type": "PERSON",
  "person_data": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "date_of_birth": "1985-03-15",
    "gender": "MALE"
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
      "loyalty_points": 0,
      "total_orders": 0,
      "total_spent": 0
    }
  }
}
```

### **2. Agregar rol de proveedor a la misma persona**

```javascript
PATCH /make-server-0dd48dc4/parties/uuid-juan
{
  "roles": ["CUSTOMER", "SUPPLIER"],
  "context_data": {
    "customer": { /* ... existente ... */ },
    "supplier": {
      "payment_terms": "NET_60",
      "lead_time_days": 15,
      "rating": 0,
      "total_orders": 0
    }
  }
}
```

### **3. Crear organización como cliente B2B**

```javascript
POST /make-server-0dd48dc4/parties
{
  "entity_id": "uuid-oddy",
  "type": "ORGANIZATION",
  "organization_data": {
    "legal_name": "Empresa SA",
    "trade_name": "Empresa",
    "company_type": "SA",
    "incorporation_date": "2020-01-01",
    "industry": "RETAIL",
    "employee_count": 50
  },
  "contact": {
    "email": "contacto@empresa.com",
    "phone": "+598 2 123 4567",
    "website": "https://empresa.com",
    "address": {
      "street": "Rambla 2500",
      "city": "Montevideo",
      "country": "UY"
    }
  },
  "tax_data": {
    "tax_id": "211234567890",
    "tax_id_type": "RUT",
    "country": "UY"
  },
  "roles": ["CUSTOMER"],
  "context_data": {
    "customer": {
      "customer_type": "B2B",
      "credit_limit": 500000,
      "payment_terms": "NET_60",
      "total_orders": 0
    }
  }
}
```

---

## 🔍 QUERIES COMUNES

### **1. Buscar todos los clientes**

```sql
SELECT 
  id,
  type,
  CASE 
    WHEN type = 'PERSON' 
      THEN CONCAT(person_data->>'first_name', ' ', person_data->>'last_name')
    WHEN type = 'ORGANIZATION' 
      THEN organization_data->>'legal_name'
  END as display_name,
  contact->>'email' as email,
  contact->>'phone' as phone,
  context_data->'customer'->>'credit_limit' as credit_limit,
  context_data->'customer'->>'total_spent' as total_spent
FROM parties
WHERE entity_id = 'uuid-oddy'
  AND 'CUSTOMER' = ANY(roles)
  AND status = 'ACTIVE'
ORDER BY created_at DESC;
```

### **2. Buscar proveedores con rating alto**

```sql
SELECT 
  id,
  CASE 
    WHEN type = 'PERSON' 
      THEN CONCAT(person_data->>'first_name', ' ', person_data->>'last_name')
    ELSE organization_data->>'legal_name'
  END as name,
  contact->>'email' as email,
  (context_data->'supplier'->>'rating')::DECIMAL as rating,
  (context_data->'supplier'->>'total_orders')::INT as total_orders
FROM parties
WHERE entity_id = 'uuid-oddy'
  AND 'SUPPLIER' = ANY(roles)
  AND (context_data->'supplier'->>'rating')::DECIMAL >= 4.0
ORDER BY (context_data->'supplier'->>'rating')::DECIMAL DESC;
```

### **3. Parties con múltiples roles**

```sql
SELECT 
  id,
  CASE 
    WHEN type = 'PERSON' 
      THEN CONCAT(person_data->>'first_name', ' ', person_data->>'last_name')
    ELSE organization_data->>'legal_name'
  END as name,
  contact->>'email' as email,
  roles,
  ARRAY_LENGTH(roles, 1) as role_count
FROM parties
WHERE entity_id = 'uuid-oddy'
  AND ARRAY_LENGTH(roles, 1) > 1
ORDER BY role_count DESC;
```

### **4. Búsqueda exhaustiva (full-text)**

```sql
SELECT 
  id,
  type,
  CASE 
    WHEN type = 'PERSON' 
      THEN CONCAT(person_data->>'first_name', ' ', person_data->>'last_name')
    ELSE organization_data->>'legal_name'
  END as name,
  contact->>'email' as email,
  roles,
  ts_rank(
    to_tsvector('spanish', 
      COALESCE(person_data->>'first_name', '') || ' ' ||
      COALESCE(person_data->>'last_name', '') || ' ' ||
      COALESCE(organization_data->>'legal_name', '') || ' ' ||
      COALESCE(contact->>'email', '')
    ),
    plainto_tsquery('spanish', 'juan perez')
  ) as relevance
FROM parties
WHERE entity_id = 'uuid-oddy'
  AND to_tsvector('spanish', 
    COALESCE(person_data->>'first_name', '') || ' ' ||
    COALESCE(person_data->>'last_name', '') || ' ' ||
    COALESCE(organization_data->>'legal_name', '') || ' ' ||
    COALESCE(contact->>'email', '')
  ) @@ plainto_tsquery('spanish', 'juan perez')
ORDER BY relevance DESC;
```

---

## 📦 MÓDULO: parties.tsx

### **Funcionalidades**

```typescript
// CRUD básico
POST   /make-server-0dd48dc4/parties              - Crear party
GET    /make-server-0dd48dc4/parties              - Listar parties
GET    /make-server-0dd48dc4/parties/:id          - Obtener party
PATCH  /make-server-0dd48dc4/parties/:id          - Actualizar party
DELETE /make-server-0dd48dc4/parties/:id          - Eliminar party

// Búsqueda
GET    /make-server-0dd48dc4/parties/search       - Búsqueda exhaustiva
  ?q=juan
  ?type=PERSON|ORGANIZATION
  ?roles=CUSTOMER,SUPPLIER
  ?status=ACTIVE

// Roles
POST   /make-server-0dd48dc4/parties/:id/roles    - Agregar rol
DELETE /make-server-0dd48dc4/parties/:id/roles/:role - Quitar rol

// Contexto
PATCH  /make-server-0dd48dc4/parties/:id/context/:role - Actualizar datos contextuales
  Ej: PATCH /parties/uuid-juan/context/customer
      { "credit_limit": 100000 }

// Filtros específicos
GET    /make-server-0dd48dc4/parties/customers    - Solo clientes
GET    /make-server-0dd48dc4/parties/suppliers    - Solo proveedores
GET    /make-server-0dd48dc4/parties/employees    - Solo empleados

// Estadísticas
GET    /make-server-0dd48dc4/parties/:id/stats    - Estadísticas de la party
  {
    "customer": { "total_orders": 45, "total_spent": 125000 },
    "supplier": { "total_orders": 12, "rating": 4.5 }
  }
```

---

## 🎯 VENTAJAS DE ESTA ARQUITECTURA

### **1. Simplicidad**
```
✅ Una sola tabla
✅ Un solo módulo
✅ No JOINs complejos
```

### **2. Flexibilidad**
```
✅ Agregar nuevos roles sin modificar schema
✅ Datos contextuales en JSONB (schema-less)
✅ Fácil agregar nuevos campos
```

### **3. Escalabilidad**
```
✅ Una party puede tener N roles
✅ Soporta cualquier tipo de relación
✅ Multi-documento, multi-país
```

### **4. Performance**
```
✅ GIN indexes para búsquedas rápidas
✅ Full-text search nativo
✅ Menos queries (no JOINs)
```

### **5. Mantenibilidad**
```
✅ Single source of truth
✅ Auditoría unificada
✅ Cambios centralizados
```

---

## 📊 COMPARACIÓN: ANTES vs AHORA

### **ANTES (Party Model con tablas separadas)**
```
parties (base)
  ├─ persons (detalles persona)
  ├─ organizations (detalles org)
  ├─ party_roles (roles)
  ├─ customers (datos cliente)
  └─ suppliers (datos proveedor)

Total: 5 tablas
JOINs: 3-4 por query
Complejidad: ALTA
```

### **AHORA (Party Model unificado)**
```
parties (todo en una)
  ├─ type: PERSON | ORGANIZATION
  ├─ person_data: JSONB
  ├─ organization_data: JSONB
  ├─ roles: ARRAY
  └─ context_data: JSONB

Total: 1 tabla
JOINs: 0
Complejidad: BAJA
```

---

## ⚠️ CONSIDERACIONES

### **1. JSONB vs Tablas Normalizadas**

**JSONB (Elegido):**
```
✅ Más flexible
✅ Más rápido de desarrollar
✅ Fácil agregar campos
✅ Indexes GIN para búsquedas
⚠️ Menos validaciones a nivel DB
⚠️ Consultas más complejas (JSONB syntax)
```

**Tablas Normalizadas:**
```
✅ Validaciones estrictas
✅ Foreign keys
✅ Consultas SQL estándar
⚠️ Menos flexible
⚠️ Más lento de cambiar
⚠️ Más tablas
```

**Decisión:** JSONB para `context_data` porque:
- Cada contexto tiene diferentes campos
- Flexibilidad para agregar nuevos roles sin migrations
- Performance con GIN indexes es excelente

### **2. Validaciones**

Dado que usamos JSONB, las validaciones deben hacerse a nivel de aplicación:

```typescript
// En parties.tsx
function validateCustomerContext(data: any) {
  return {
    credit_limit: Number(data.credit_limit) || 0,
    payment_terms: data.payment_terms || 'NET_30',
    loyalty_points: Number(data.loyalty_points) || 0,
    total_orders: Number(data.total_orders) || 0,
    total_spent: Number(data.total_spent) || 0,
  };
}

function validateSupplierContext(data: any) {
  return {
    payment_terms: data.payment_terms || 'NET_60',
    lead_time_days: Number(data.lead_time_days) || 0,
    rating: Number(data.rating) || 0,
    total_orders: Number(data.total_orders) || 0,
  };
}
```

---

## 🚀 NUEVA FASE 1 (5 Módulos)

```
1. parties.tsx           - Única entidad con roles contextuales
   ├─ CRUD completo
   ├─ Búsqueda exhaustiva
   ├─ Gestión de roles
   ├─ Multi-documento
   └─ Multi-territorio
   Tiempo: 2 días

2. cart.tsx              - Carrito de compras
   Tiempo: 0.5 días

3. auth.tsx              - Autenticación
   Tiempo: 1 día

4. users.tsx             - Usuarios y RBAC
   Tiempo: 1 día

5. billing.tsx           - Facturación multi-país
   Tiempo: 1.5 días

─────────────────────────────────────
TOTAL: 6 días
```

---

## ✅ DECISIÓN FINAL

### **IMPLEMENTAR:**

```
✅ parties.tsx (única tabla con JSONB)
✅ NO customers.tsx separado
✅ NO suppliers.tsx separado
✅ Roles contextuales en array
✅ Datos contextuales en JSONB
```

### **BENEFICIOS:**

```
✅ Más simple
✅ Más flexible
✅ Más escalable
✅ Menos código
✅ Menos mantenimiento
```

---

## 🚀 PRÓXIMA ACCIÓN

**¿Empiezo con la implementación de `parties.tsx`?**

O prefieres que primero creemos el Schema SQL en Supabase?

```
A. Implementar parties.tsx (backend completo)
B. Crear Schema SQL en Supabase
C. Ambos en paralelo
```

**¿Qué prefieres?** 🎯
