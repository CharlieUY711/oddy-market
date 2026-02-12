# 📚 API DOCUMENTATION: PARTIES

**Módulo**: `parties.tsx`  
**Versión**: 1.0.0  
**Fecha**: 12 de Febrero, 2026  
**Base URL**: `/make-server-0dd48dc4`

---

## 📋 TABLA DE CONTENIDOS

1. [Introducción](#introducción)
2. [Conceptos Clave](#conceptos-clave)
3. [CRUD Básico](#crud-básico)
4. [Búsqueda](#búsqueda)
5. [Gestión de Roles](#gestión-de-roles)
6. [Actualización de Contexto](#actualización-de-contexto)
7. [Filtros Específicos](#filtros-específicos)
8. [Estadísticas](#estadísticas)
9. [Ejemplos Completos](#ejemplos-completos)

---

## 🎯 INTRODUCCIÓN

El módulo `parties` maneja **todas las entidades** (personas y organizaciones) del sistema con un enfoque de **roles contextuales**.

### **Filosofía:**
- ✅ Una tabla para **TODAS** las entidades
- ✅ Una party puede tener **múltiples roles** (CUSTOMER, SUPPLIER, EMPLOYEE)
- ✅ Datos específicos del rol en `context_data` (JSONB)
- ✅ No duplicación de información de contacto

---

## 🔑 CONCEPTOS CLAVE

### **Party Types**

```typescript
type PartyType = "PERSON" | "ORGANIZATION";
```

- **PERSON**: Persona física (first_name, last_name, DNI)
- **ORGANIZATION**: Entidad jurídica (legal_name, RUT, company_type)

### **Roles**

```typescript
type Role = "CUSTOMER" | "SUPPLIER" | "EMPLOYEE" | "CONTACT" | "PARTNER";
```

Una party puede tener **múltiples roles** simultáneamente.

### **Context Data**

Datos específicos por rol:

```typescript
interface ContextData {
  customer?: CustomerContext;
  supplier?: SupplierContext;
  employee?: EmployeeContext;
}
```

---

## 📦 CRUD BÁSICO

### **1. CREATE - Crear Party**

```http
POST /make-server-0dd48dc4/parties
Content-Type: application/json
```

#### **Ejemplo: Persona como Cliente**

```json
{
  "entity_id": "uuid-oddy",
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
    "mobile": "+598 99 987 654",
    "address": {
      "street": "Av. 18 de Julio 1234",
      "city": "Montevideo",
      "state": "Montevideo",
      "postal_code": "11200",
      "country": "UY"
    }
  },
  "tax_data": {
    "tax_id": "12345678",
    "tax_id_type": "DNI",
    "country": "UY",
    "tax_status": "ACTIVE"
  },
  "roles": ["CUSTOMER"],
  "context_data": {
    "customer": {
      "customer_type": "B2C",
      "credit_limit": 50000,
      "payment_terms": "NET_30",
      "loyalty_points": 0,
      "preferred_language": "es",
      "preferred_currency": "UYU",
      "accepts_marketing": true
    }
  }
}
```

**Response:**

```json
{
  "party": {
    "id": "party:1707753600000",
    "entity_id": "uuid-oddy",
    "type": "PERSON",
    "person_data": { ... },
    "contact": { ... },
    "tax_data": { ... },
    "roles": ["CUSTOMER"],
    "context_data": { ... },
    "status": "ACTIVE",
    "created_at": "2026-02-12T10:00:00Z",
    "updated_at": "2026-02-12T10:00:00Z"
  }
}
```

---

#### **Ejemplo: Organización como Proveedor**

```json
{
  "entity_id": "uuid-oddy",
  "type": "ORGANIZATION",
  "organization_data": {
    "legal_name": "Distribuidora SA",
    "trade_name": "Distribuidora",
    "company_type": "SA",
    "incorporation_date": "2020-01-01",
    "industry": "WHOLESALE",
    "employee_count": 25
  },
  "contact": {
    "email": "contacto@distribuidora.com",
    "phone": "+598 2 123 4567",
    "website": "https://distribuidora.com",
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
  "roles": ["SUPPLIER"],
  "context_data": {
    "supplier": {
      "supplier_type": "DISTRIBUTOR",
      "payment_terms": "NET_60",
      "lead_time_days": 15,
      "minimum_order_value": 5000,
      "rating": 4.5,
      "preferred": true
    }
  }
}
```

---

### **2. READ - Listar Parties**

```http
GET /make-server-0dd48dc4/parties?entity_id=uuid-oddy&limit=50&offset=0
```

#### **Query Parameters:**

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `entity_id` | string | ID de la entidad (multi-tenant) | `"default"` |
| `type` | `PERSON\|ORGANIZATION` | Filtrar por tipo | - |
| `status` | `ACTIVE\|INACTIVE\|...` | Filtrar por status | - |
| `role` | string | Filtrar por rol (ej: `CUSTOMER`) | - |
| `limit` | number | Límite de resultados | `50` |
| `offset` | number | Offset para paginación | `0` |

**Response:**

```json
{
  "parties": [
    {
      "id": "party:123",
      "type": "PERSON",
      "display_name": "Juan Pérez",
      "contact": { ... },
      "roles": ["CUSTOMER"],
      "status": "ACTIVE",
      "created_at": "2026-02-12T10:00:00Z"
    },
    ...
  ],
  "total": 125,
  "limit": 50,
  "offset": 0,
  "has_more": true
}
```

---

### **3. READ - Obtener Party por ID**

```http
GET /make-server-0dd48dc4/parties/:id
```

**Response:**

```json
{
  "party": {
    "id": "party:123",
    "entity_id": "uuid-oddy",
    "type": "PERSON",
    "person_data": { ... },
    "contact": { ... },
    "tax_data": { ... },
    "roles": ["CUSTOMER", "SUPPLIER"],
    "context_data": {
      "customer": { ... },
      "supplier": { ... }
    },
    "status": "ACTIVE",
    "display_name": "Juan Pérez",
    "created_at": "2026-02-12T10:00:00Z",
    "updated_at": "2026-02-12T10:00:00Z"
  }
}
```

---

### **4. UPDATE - Actualizar Party**

```http
PATCH /make-server-0dd48dc4/parties/:id
Content-Type: application/json
```

**Body:**

```json
{
  "person_data": {
    "first_name": "Juan Carlos"
  },
  "contact": {
    "phone": "+598 99 999 999"
  },
  "status": "ACTIVE"
}
```

**Response:**

```json
{
  "party": {
    "id": "party:123",
    "person_data": {
      "first_name": "Juan Carlos",
      "last_name": "Pérez",
      ...
    },
    "contact": {
      "email": "juan.perez@gmail.com",
      "phone": "+598 99 999 999",
      ...
    },
    "display_name": "Juan Carlos Pérez",
    "updated_at": "2026-02-12T11:00:00Z"
  }
}
```

---

### **5. DELETE - Eliminar Party**

```http
DELETE /make-server-0dd48dc4/parties/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Party deleted"
}
```

---

## 🔍 BÚSQUEDA

### **1. Búsqueda Exhaustiva**

```http
GET /make-server-0dd48dc4/parties/search?entity_id=uuid-oddy&q=juan&limit=20
```

#### **Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entity_id` | string | ID de la entidad |
| `q` | string | Término de búsqueda |
| `type` | string | Filtrar por tipo |
| `role` | string | Filtrar por rol |
| `limit` | number | Límite (default: 50) |

**Busca en:**
- ✅ first_name + last_name (personas)
- ✅ legal_name + trade_name (organizaciones)
- ✅ email
- ✅ phone
- ✅ tax_id

**Response:**

```json
{
  "parties": [
    {
      "id": "party:123",
      "type": "PERSON",
      "display_name": "Juan Pérez",
      "contact": {
        "email": "juan.perez@gmail.com",
        "phone": "+598 99 123 456"
      },
      "roles": ["CUSTOMER"]
    }
  ],
  "total": 1,
  "query": "juan"
}
```

---

### **2. Buscar por Email**

```http
GET /make-server-0dd48dc4/parties/by-email/:email
```

**Ejemplo:**

```http
GET /make-server-0dd48dc4/parties/by-email/juan.perez@gmail.com
```

**Response:**

```json
{
  "parties": [
    {
      "id": "party:123",
      "type": "PERSON",
      "display_name": "Juan Pérez",
      "contact": {
        "email": "juan.perez@gmail.com"
      },
      "roles": ["CUSTOMER"]
    }
  ]
}
```

---

## 👥 GESTIÓN DE ROLES

### **1. Agregar Rol**

```http
POST /make-server-0dd48dc4/parties/:id/roles
Content-Type: application/json
```

**Body:**

```json
{
  "role": "SUPPLIER",
  "context": {
    "supplier_type": "SERVICE",
    "payment_terms": "NET_45",
    "lead_time_days": 7,
    "rating": 0
  }
}
```

**Response:**

```json
{
  "party": {
    "id": "party:123",
    "roles": ["CUSTOMER", "SUPPLIER"],
    "context_data": {
      "customer": { ... },
      "supplier": {
        "supplier_type": "SERVICE",
        "payment_terms": "NET_45",
        "lead_time_days": 7,
        "rating": 0,
        ...
      }
    },
    "display_name": "Juan Pérez",
    "updated_at": "2026-02-12T12:00:00Z"
  }
}
```

---

### **2. Quitar Rol**

```http
DELETE /make-server-0dd48dc4/parties/:id/roles/:role
```

**Ejemplo:**

```http
DELETE /make-server-0dd48dc4/parties/party:123/roles/SUPPLIER
```

**Response:**

```json
{
  "party": {
    "id": "party:123",
    "roles": ["CUSTOMER"],
    "context_data": {
      "customer": { ... }
      // supplier context eliminado
    },
    "display_name": "Juan Pérez"
  }
}
```

---

## 🔧 ACTUALIZACIÓN DE CONTEXTO

### **Actualizar Context Data de un Rol**

```http
PATCH /make-server-0dd48dc4/parties/:id/context/:role
Content-Type: application/json
```

**Ejemplo: Actualizar datos de cliente**

```http
PATCH /make-server-0dd48dc4/parties/party:123/context/CUSTOMER
```

**Body:**

```json
{
  "credit_limit": 100000,
  "loyalty_points": 2500,
  "loyalty_tier": "GOLD"
}
```

**Response:**

```json
{
  "party": {
    "id": "party:123",
    "context_data": {
      "customer": {
        "customer_type": "B2C",
        "credit_limit": 100000,
        "loyalty_points": 2500,
        "loyalty_tier": "GOLD",
        "payment_terms": "NET_30",
        ...
      }
    },
    "display_name": "Juan Pérez",
    "updated_at": "2026-02-12T13:00:00Z"
  }
}
```

---

## 🎯 FILTROS ESPECÍFICOS

### **1. Solo Clientes**

```http
GET /make-server-0dd48dc4/parties/customers?entity_id=uuid-oddy&limit=50
```

**Response:**

```json
{
  "customers": [
    {
      "id": "party:123",
      "type": "PERSON",
      "display_name": "Juan Pérez",
      "contact": { ... },
      "roles": ["CUSTOMER"],
      "customer_data": {
        "credit_limit": 50000,
        "loyalty_points": 1500,
        "total_orders": 25,
        "total_spent": 75000
      }
    }
  ],
  "total": 125
}
```

**Ordenado por:** `total_spent` (mayor a menor)

---

### **2. Solo Proveedores**

```http
GET /make-server-0dd48dc4/parties/suppliers?entity_id=uuid-oddy&limit=50
```

**Response:**

```json
{
  "suppliers": [
    {
      "id": "party:456",
      "type": "ORGANIZATION",
      "display_name": "Distribuidora SA",
      "contact": { ... },
      "roles": ["SUPPLIER"],
      "supplier_data": {
        "supplier_type": "DISTRIBUTOR",
        "payment_terms": "NET_60",
        "lead_time_days": 15,
        "rating": 4.5,
        "total_orders": 12
      }
    }
  ],
  "total": 45
}
```

**Ordenado por:** `rating` (mayor a menor)

---

## 📊 ESTADÍSTICAS

### **1. Stats de una Party**

```http
GET /make-server-0dd48dc4/parties/:id/stats
```

**Response:**

```json
{
  "stats": {
    "id": "party:123",
    "display_name": "Juan Pérez",
    "type": "PERSON",
    "roles": ["CUSTOMER", "SUPPLIER"],
    "created_at": "2026-01-15T10:00:00Z",
    "customer": {
      "total_orders": 45,
      "total_spent": 125000,
      "average_order_value": 2777.78,
      "loyalty_points": 2500,
      "loyalty_tier": "GOLD",
      "last_order_date": "2026-02-10T10:00:00Z"
    },
    "supplier": {
      "rating": 4.8,
      "total_orders": 8,
      "total_purchased": 35000,
      "lead_time_days": 7,
      "preferred": true,
      "last_order_date": "2026-02-08T14:30:00Z"
    }
  }
}
```

---

### **2. Dashboard General**

```http
GET /make-server-0dd48dc4/parties/dashboard?entity_id=uuid-oddy
```

**Response:**

```json
{
  "dashboard": {
    "total_parties": 250,
    "total_persons": 180,
    "total_organizations": 70,
    "total_customers": 200,
    "total_suppliers": 50,
    "total_employees": 25,
    "multi_role_parties": 15,
    "total_revenue": 5750000,
    "total_purchased": 1250000,
    "top_customers": [
      {
        "id": "party:123",
        "name": "Juan Pérez",
        "total_spent": 125000,
        "total_orders": 45
      },
      ...
    ],
    "top_suppliers": [
      {
        "id": "party:456",
        "name": "Distribuidora SA",
        "rating": 4.8,
        "total_orders": 12
      },
      ...
    ]
  }
}
```

---

## 💡 EJEMPLOS COMPLETOS

### **Caso 1: Cliente Regular (B2C)**

```bash
# 1. Crear cliente
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "uuid-oddy",
    "type": "PERSON",
    "person_data": {
      "first_name": "María",
      "last_name": "González",
      "date_of_birth": "1990-06-20",
      "gender": "FEMALE"
    },
    "contact": {
      "email": "maria@email.com",
      "phone": "+598 99 555 666"
    },
    "tax_data": {
      "tax_id": "87654321",
      "tax_id_type": "DNI",
      "country": "UY"
    },
    "roles": ["CUSTOMER"],
    "context_data": {
      "customer": {
        "customer_type": "B2C",
        "credit_limit": 30000,
        "accepts_marketing": true
      }
    }
  }'

# 2. Actualizar puntos de lealtad después de una compra
curl -X PATCH http://localhost:8000/make-server-0dd48dc4/parties/party:789/context/CUSTOMER \
  -H "Content-Type: application/json" \
  -d '{
    "loyalty_points": 500,
    "total_orders": 1,
    "total_spent": 2500,
    "last_order_date": "2026-02-12T15:00:00Z"
  }'
```

---

### **Caso 2: Proveedor Corporativo**

```bash
# 1. Crear proveedor
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "uuid-oddy",
    "type": "ORGANIZATION",
    "organization_data": {
      "legal_name": "Importadora XYZ SA",
      "trade_name": "XYZ",
      "company_type": "SA",
      "industry": "IMPORT_EXPORT"
    },
    "contact": {
      "email": "ventas@xyz.com",
      "phone": "+598 2 999 8888",
      "website": "https://xyz.com"
    },
    "tax_data": {
      "tax_id": "219876543210",
      "tax_id_type": "RUT",
      "country": "UY"
    },
    "roles": ["SUPPLIER"],
    "context_data": {
      "supplier": {
        "supplier_type": "MANUFACTURER",
        "payment_terms": "NET_90",
        "lead_time_days": 30,
        "minimum_order_value": 10000,
        "certifications": ["ISO_9001", "ISO_14001"]
      }
    }
  }'

# 2. Actualizar rating después de una evaluación
curl -X PATCH http://localhost:8000/make-server-0dd48dc4/parties/party:999/context/SUPPLIER \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4.7,
    "quality_score": 4.8,
    "delivery_score": 4.5,
    "communication_score": 4.8,
    "preferred": true
  }'
```

---

### **Caso 3: Party con Múltiples Roles**

```bash
# 1. Crear persona como cliente
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "uuid-oddy",
    "type": "PERSON",
    "person_data": {
      "first_name": "Carlos",
      "last_name": "Rodríguez"
    },
    "contact": {
      "email": "carlos@email.com",
      "phone": "+598 99 111 222"
    },
    "roles": ["CUSTOMER"],
    "context_data": {
      "customer": {
        "credit_limit": 50000
      }
    }
  }'

# 2. Agregar rol de proveedor (es artesano y también compra materiales)
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties/party:555/roles \
  -H "Content-Type: application/json" \
  -d '{
    "role": "SUPPLIER",
    "context": {
      "supplier_type": "ARTISAN",
      "payment_terms": "NET_30",
      "lead_time_days": 5
    }
  }'

# 3. Ver estadísticas completas
curl http://localhost:8000/make-server-0dd48dc4/parties/party:555/stats
```

---

## 🔐 AUTENTICACIÓN

Todos los endpoints requieren autenticación. Incluir header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## ⚠️ ERRORES COMUNES

### **400 Bad Request**

```json
{
  "error": "first_name y last_name son requeridos para PERSON"
}
```

### **404 Not Found**

```json
{
  "error": "Party not found"
}
```

### **500 Internal Server Error**

```json
{
  "error": "Error creating party"
}
```

---

## 📚 TIPOS TYPESCRIPT

```typescript
interface Party {
  id: string;
  entity_id: string;
  type: "PERSON" | "ORGANIZATION";
  person_data?: PersonData;
  organization_data?: OrganizationData;
  contact: Contact;
  tax_data?: TaxData;
  roles: Role[];
  context_data: ContextData;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED";
  metadata?: any;
  created_at: string;
  updated_at: string;
  display_name?: string;
}

interface PersonData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  nationality?: string;
}

interface OrganizationData {
  legal_name: string;
  trade_name?: string;
  company_type?: string;
  incorporation_date?: string;
  industry?: string;
  employee_count?: number;
}

interface Contact {
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: Address;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface TaxData {
  tax_id?: string;
  tax_id_type?: "DNI" | "RUT" | "CUIT" | "RFC" | "PASSPORT";
  tax_status?: string;
  country?: string;
}

type Role = "CUSTOMER" | "SUPPLIER" | "EMPLOYEE" | "CONTACT" | "PARTNER";

interface ContextData {
  customer?: CustomerContext;
  supplier?: SupplierContext;
  employee?: EmployeeContext;
}

interface CustomerContext {
  customer_type: "B2C" | "B2B";
  credit_limit: number;
  credit_used: number;
  payment_terms: string;
  loyalty_points: number;
  loyalty_tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  preferred_language: string;
  preferred_currency: string;
  accepts_marketing: boolean;
  marketing_source?: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date?: string;
}

interface SupplierContext {
  supplier_type: "MANUFACTURER" | "DISTRIBUTOR" | "SERVICE" | "ARTISAN";
  payment_terms: string;
  lead_time_days: number;
  minimum_order_value: number;
  rating: number;
  quality_score: number;
  delivery_score: number;
  communication_score: number;
  total_orders: number;
  total_purchased: number;
  last_order_date?: string;
  certifications: string[];
  preferred: boolean;
}

interface EmployeeContext {
  department?: string;
  position?: string;
  hire_date?: string;
  salary: number;
  employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  manager_id?: string;
}
```

---

## 🎉 RESUMEN

```
✅ CRUD completo
✅ Búsqueda exhaustiva
✅ Gestión de roles
✅ Actualización de contexto
✅ Filtros específicos (customers, suppliers)
✅ Estadísticas y dashboard
✅ Multi-tenant
✅ Validaciones
✅ Indexación optimizada
```

---

**¿Preguntas?**  
Consulta el código fuente en `supabase/functions/server/parties.tsx`
