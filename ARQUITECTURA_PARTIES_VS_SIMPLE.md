# 🏗️ ARQUITECTURA: PARTIES vs SIMPLE

**Fecha**: 12 de Febrero, 2026  
**Decisión**: Estructura de Personas y Entidades

---

## 🎯 EL PROBLEMA

**Usuario pregunta:**
> "Para mí hay que hacer Entidades o son dos módulos, o es Personas y Entidades. ¿Qué decís?"

**Contexto:**
- Sistema ERP completo con multi-tenant
- Necesitamos manejar:
  - Personas físicas (clientes, proveedores, empleados)
  - Entidades jurídicas (empresas, organizaciones)
  - Multi-documento (DNI, RUT, CUIT, Passport)
  - Roles múltiples (una persona puede ser cliente Y proveedor)

---

## 🏗️ OPCIÓN A: PARTY MODEL (RECOMENDADO)

### **Arquitectura**

```
┌─────────────────────────────────────────────────────────┐
│  TABLE: parties (Base abstracta)                        │
├─────────────────────────────────────────────────────────┤
│  id              UUID PRIMARY KEY                       │
│  party_type      ENUM ('PERSON', 'ORGANIZATION')        │
│  email           VARCHAR                                │
│  phone           VARCHAR                                │
│  address         JSONB                                  │
│  tax_id          VARCHAR (DNI/RUT/CUIT/etc)            │
│  tax_id_type     ENUM ('DNI', 'RUT', 'CUIT', ...)      │
│  country         VARCHAR                                │
│  entity_id       UUID (FK → entities, multi-tenant)    │
│  created_at      TIMESTAMP                              │
│  updated_at      TIMESTAMP                              │
└─────────────────────────────────────────────────────────┘
           │
           ├────────────────────┬────────────────────┐
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  persons         │  │  organizations   │  │  party_roles     │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│  party_id (FK)   │  │  party_id (FK)   │  │  party_id (FK)   │
│  first_name      │  │  legal_name      │  │  role_type ENUM  │
│  last_name       │  │  trade_name      │  │  ('CUSTOMER',    │
│  date_of_birth   │  │  company_type    │  │   'SUPPLIER',    │
│  gender          │  │  (SA, SRL, SAS)  │  │   'EMPLOYEE',    │
│  nationality     │  │  incorporation_  │  │   'CONTACT')     │
│                  │  │    date          │  │  active BOOL     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### **Módulos Backend**

```
1. parties.tsx
   - CRUD base para parties
   - Crear persona o organización
   - Gestión de documentos fiscales
   - Multi-territorio

2. customers.tsx
   - Extiende parties con role='CUSTOMER'
   - Límite de crédito
   - Términos de pago
   - Historial de compras
   - Puntos de fidelidad

3. suppliers.tsx
   - Extiende parties con role='SUPPLIER'
   - Términos de pago
   - Lead time
   - Productos que suministra
   - Evaluación de proveedores
```

### **Ventajas ✅**

```
✅ DRY (Don't Repeat Yourself)
   - No duplicamos email, teléfono, dirección

✅ Roles Múltiples
   - Una party puede ser cliente Y proveedor
   - Un empleado puede también ser cliente

✅ Escalabilidad
   - Agregar nuevos roles es trivial
   - Agregar tipos de documentos es simple

✅ Multi-Territorio
   - Soporta DNI (Uruguay), RUT (Chile), CUIT (Argentina)
   - Fácil agregar nuevos países

✅ Normalización
   - Base de datos normalizada (3NF)
   - Integridad referencial

✅ Auditoría
   - Un solo lugar para auditar cambios
   - Historial unificado
```

### **Desventajas ⚠️**

```
⚠️ Complejidad
   - Más tablas
   - JOINs más complejos

⚠️ Tiempo de Desarrollo
   - ~3-4 días vs 2 días

⚠️ Curva de Aprendizaje
   - Requiere entender el modelo Party
```

---

## 🏗️ OPCIÓN B: MODELO SIMPLE

### **Arquitectura**

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  customers       │  │  suppliers       │  │  employees       │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│  id              │  │  id              │  │  id              │
│  type ENUM       │  │  type ENUM       │  │  type ENUM       │
│  (PERSON | ORG)  │  │  (PERSON | ORG)  │  │  (PERSON | ORG)  │
│  name            │  │  name            │  │  name            │
│  email           │  │  email           │  │  email           │
│  phone           │  │  phone           │  │  phone           │
│  address         │  │  address         │  │  address         │
│  tax_id          │  │  tax_id          │  │  tax_id          │
│  ...             │  │  ...             │  │  ...             │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### **Módulos Backend**

```
1. customers.tsx
   - CRUD clientes
   - Tipo: PERSON | ORGANIZATION
   - Si PERSON: first_name, last_name, DNI
   - Si ORG: legal_name, RUT, company_type

2. suppliers.tsx
   - CRUD proveedores
   - Tipo: PERSON | ORGANIZATION
   - (Campos duplicados con customers)

3. employees.tsx
   - CRUD empleados
   - Tipo: PERSON
   - (Campos duplicados)
```

### **Ventajas ✅**

```
✅ Simplicidad
   - Fácil de entender
   - Menos JOINs

✅ Rapidez
   - Desarrollo más rápido
   - ~2 días

✅ Independencia
   - Cada módulo es independiente
```

### **Desventajas ⚠️**

```
❌ Duplicación de Datos
   - Email, teléfono, dirección repetidos
   - Riesgo de inconsistencias

❌ No Soporta Roles Múltiples
   - ¿Qué pasa si un proveedor es también cliente?
   - Tendríamos 2 registros duplicados

❌ Mantenimiento
   - Cambiar un email requiere actualizar N tablas

❌ Difícil Auditoría
   - Historial fragmentado
   - Difícil rastrear cambios

❌ Escalabilidad Limitada
   - Agregar "Partners" requiere nueva tabla completa
```

---

## 🎯 RECOMENDACIÓN: **OPCIÓN A (PARTY MODEL)**

### **Justificación**

```
1. PROFESIONALISMO
   ✅ Es el estándar en ERPs profesionales
   ✅ SAP, Oracle, Dynamics usan Party Model

2. ESCALABILIDAD
   ✅ Charlie Market Place tendrá múltiples tenants
   ✅ Multi-territorio (UY, AR, CL, BR, etc.)
   ✅ Fácil agregar nuevos roles

3. CALIDAD DE DATOS
   ✅ Single source of truth
   ✅ No duplicación
   ✅ Integridad referencial

4. FULFILLMENT
   ✅ Un mismo contacto puede ser:
      - Cliente (compra productos)
      - Proveedor (suministra productos)
      - Contacto de almacén (recibe mercadería)
   ✅ Con Party Model: 1 registro, 3 roles
   ✅ Con Simple: 3 registros duplicados
```

### **Inversión vs Valor**

```
OPCIÓN A (Party Model):
  Tiempo:    +2 días adicionales
  Valor:     +10x en mantenibilidad
  ROI:       ⭐⭐⭐⭐⭐

OPCIÓN B (Simple):
  Tiempo:    2 días
  Valor:     Funcional pero limitado
  ROI:       ⭐⭐⭐
  Deuda técnica: ALTA
```

---

## 📦 NUEVA FASE 1 (6 Módulos)

### **PLAN ACTUALIZADO**

```
FASE 1: Core Crítico + Party Model
─────────────────────────────────────

1. parties.tsx (NUEVO)        - Base abstracta
   ├─ CRUD parties
   ├─ Personas: first_name, last_name, DNI
   ├─ Orgs: legal_name, RUT, company_type
   ├─ Multi-documento (DNI, RUT, CUIT)
   └─ Multi-territorio
   Tiempo: 1.5 días

2. customers.tsx (EXPANDIR)   - Clientes
   ├─ Extiende parties
   ├─ Límite de crédito
   ├─ Términos de pago
   ├─ Historial de compras
   └─ Puntos de fidelidad
   Tiempo: 1 día

3. suppliers.tsx (NUEVO)      - Proveedores
   ├─ Extiende parties
   ├─ Términos de pago
   ├─ Lead time
   └─ Productos que suministra
   Tiempo: 1 día

4. cart.tsx                   - Carrito
   Tiempo: 0.5 días

5. auth.tsx                   - Autenticación
   Tiempo: 1 día

6. users.tsx                  - Usuarios y RBAC
   Tiempo: 1 día

─────────────────────────────────────
TOTAL: 6 días (vs 4 días con Simple)
VALOR: +200% en escalabilidad
```

---

## 🗄️ SCHEMA SQL (Party Model)

### **1. Tabla: parties**

```sql
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id),
  party_type VARCHAR(20) NOT NULL CHECK (party_type IN ('PERSON', 'ORGANIZATION')),
  
  -- Contacto (común para ambos tipos)
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  website VARCHAR(255),
  
  -- Dirección (JSONB para flexibilidad multi-país)
  address JSONB,
  -- {
  --   "street": "Av. 18 de Julio 1234",
  --   "city": "Montevideo",
  --   "state": "Montevideo",
  --   "postal_code": "11200",
  --   "country": "UY"
  -- }
  
  -- Fiscal
  tax_id VARCHAR(50),
  tax_id_type VARCHAR(20), -- DNI, RUT, CUIT, RFC, etc.
  tax_status VARCHAR(50), -- ACTIVE, SUSPENDED, etc.
  country VARCHAR(2), -- ISO 3166-1 alpha-2
  
  -- Status
  status VARCHAR(20) DEFAULT 'ACTIVE',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Indexes
  CONSTRAINT parties_entity_id_idx UNIQUE (entity_id, email)
);

CREATE INDEX idx_parties_entity ON parties(entity_id);
CREATE INDEX idx_parties_type ON parties(party_type);
CREATE INDEX idx_parties_tax_id ON parties(tax_id);
CREATE INDEX idx_parties_email ON parties(email);
```

### **2. Tabla: persons**

```sql
CREATE TABLE persons (
  party_id UUID PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
  
  -- Nombre
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  
  -- Datos personales
  date_of_birth DATE,
  gender VARCHAR(20), -- MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
  nationality VARCHAR(2), -- ISO 3166-1 alpha-2
  
  -- Documentos adicionales
  passport_number VARCHAR(50),
  driver_license VARCHAR(50),
  
  -- Redes sociales
  social_media JSONB,
  -- {
  --   "facebook": "...",
  --   "instagram": "...",
  --   "linkedin": "..."
  -- }
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **3. Tabla: organizations**

```sql
CREATE TABLE organizations (
  party_id UUID PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
  
  -- Razón social
  legal_name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255), -- Nombre comercial
  
  -- Tipo de sociedad
  company_type VARCHAR(50), -- SA, SRL, SAS, UNIPERSONAL, etc.
  
  -- Datos legales
  incorporation_date DATE,
  fiscal_year_end VARCHAR(5), -- "12-31" (31 de diciembre)
  
  -- Estructura
  parent_organization_id UUID REFERENCES organizations(party_id),
  
  -- Contacto principal
  primary_contact_id UUID REFERENCES persons(party_id),
  
  -- Industria
  industry VARCHAR(100),
  employee_count INT,
  annual_revenue DECIMAL(15, 2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **4. Tabla: party_roles**

```sql
CREATE TABLE party_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id),
  
  role_type VARCHAR(50) NOT NULL,
  -- CUSTOMER, SUPPLIER, EMPLOYEE, CONTACT, PARTNER, etc.
  
  active BOOLEAN DEFAULT TRUE,
  
  -- Metadata específica del rol (opcional)
  role_metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT party_roles_unique UNIQUE (party_id, entity_id, role_type)
);

CREATE INDEX idx_party_roles_party ON party_roles(party_id);
CREATE INDEX idx_party_roles_entity ON party_roles(entity_id);
CREATE INDEX idx_party_roles_type ON party_roles(role_type);
```

### **5. Tabla: customers**

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id),
  
  -- Tipo de cliente
  customer_type VARCHAR(20) DEFAULT 'B2C', -- B2C, B2B
  customer_segment VARCHAR(50), -- VIP, REGULAR, NEW, etc.
  
  -- Crédito
  credit_limit DECIMAL(15, 2) DEFAULT 0,
  credit_used DECIMAL(15, 2) DEFAULT 0,
  payment_terms VARCHAR(50), -- NET_30, NET_60, IMMEDIATE, etc.
  
  -- Fidelidad
  loyalty_points INT DEFAULT 0,
  loyalty_tier VARCHAR(50), -- BRONZE, SILVER, GOLD, PLATINUM
  
  -- Preferencias
  preferred_language VARCHAR(2), -- es, en, pt
  preferred_currency VARCHAR(3), -- USD, UYU, ARS, BRL
  
  -- Marketing
  accepts_marketing BOOLEAN DEFAULT FALSE,
  marketing_source VARCHAR(100), -- Instagram, Facebook, Referral, etc.
  
  -- Estadísticas
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(15, 2) DEFAULT 0,
  average_order_value DECIMAL(15, 2) DEFAULT 0,
  last_order_date TIMESTAMP,
  
  -- Status
  status VARCHAR(20) DEFAULT 'ACTIVE',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT customers_party_entity_unique UNIQUE (party_id, entity_id)
);

CREATE INDEX idx_customers_party ON customers(party_id);
CREATE INDEX idx_customers_entity ON customers(entity_id);
CREATE INDEX idx_customers_status ON customers(status);
```

### **6. Tabla: suppliers**

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id),
  
  -- Tipo de proveedor
  supplier_type VARCHAR(50), -- MANUFACTURER, DISTRIBUTOR, SERVICE, etc.
  
  -- Términos comerciales
  payment_terms VARCHAR(50), -- NET_30, NET_60, ADVANCE, etc.
  lead_time_days INT DEFAULT 0, -- Días de entrega
  minimum_order_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Evaluación
  rating DECIMAL(3, 2), -- 0.00 a 5.00
  quality_score DECIMAL(3, 2),
  delivery_score DECIMAL(3, 2),
  communication_score DECIMAL(3, 2),
  
  -- Estadísticas
  total_orders INT DEFAULT 0,
  total_purchased DECIMAL(15, 2) DEFAULT 0,
  last_order_date TIMESTAMP,
  
  -- Certificaciones
  certifications JSONB,
  -- ["ISO_9001", "ISO_14001", "ORGANIC", etc.]
  
  -- Status
  status VARCHAR(20) DEFAULT 'ACTIVE',
  preferred BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT suppliers_party_entity_unique UNIQUE (party_id, entity_id)
);

CREATE INDEX idx_suppliers_party ON suppliers(party_id);
CREATE INDEX idx_suppliers_entity ON suppliers(entity_id);
CREATE INDEX idx_suppliers_status ON suppliers(status);
```

---

## 📝 EJEMPLO DE USO

### **Caso 1: Crear un cliente persona física**

```javascript
// 1. Crear party
POST /make-server-0dd48dc4/parties
{
  "entity_id": "uuid-oddy",
  "party_type": "PERSON",
  "email": "juan.perez@gmail.com",
  "phone": "+598 99 123 456",
  "tax_id": "12345678",
  "tax_id_type": "DNI",
  "country": "UY",
  "address": {
    "street": "Av. 18 de Julio 1234",
    "city": "Montevideo",
    "postal_code": "11200",
    "country": "UY"
  }
}

// Response: { party_id: "uuid-1" }

// 2. Crear person
POST /make-server-0dd48dc4/parties/uuid-1/person
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "date_of_birth": "1985-03-15"
}

// 3. Asignar rol de CUSTOMER
POST /make-server-0dd48dc4/parties/uuid-1/roles
{
  "role_type": "CUSTOMER"
}

// 4. Crear customer
POST /make-server-0dd48dc4/customers
{
  "party_id": "uuid-1",
  "customer_type": "B2C",
  "credit_limit": 50000,
  "payment_terms": "NET_30"
}
```

### **Caso 2: Misma persona ahora es proveedor**

```javascript
// Solo agregar el rol y crear supplier
POST /make-server-0dd48dc4/parties/uuid-1/roles
{
  "role_type": "SUPPLIER"
}

POST /make-server-0dd48dc4/suppliers
{
  "party_id": "uuid-1",
  "supplier_type": "SERVICE",
  "payment_terms": "NET_60"
}

// ✅ Misma party, 2 roles
// ✅ No duplicación de email, teléfono, dirección
```

### **Caso 3: Crear empresa cliente**

```javascript
// 1. Crear party
POST /make-server-0dd48dc4/parties
{
  "party_type": "ORGANIZATION",
  "email": "contacto@empresa.com",
  "tax_id": "211234567890",
  "tax_id_type": "RUT",
  "country": "UY"
}

// 2. Crear organization
POST /make-server-0dd48dc4/parties/uuid-2/organization
{
  "legal_name": "Empresa SA",
  "trade_name": "Empresa",
  "company_type": "SA",
  "incorporation_date": "2020-01-01"
}

// 3. Rol de cliente
POST /make-server-0dd48dc4/parties/uuid-2/roles
{ "role_type": "CUSTOMER" }

POST /make-server-0dd48dc4/customers
{
  "party_id": "uuid-2",
  "customer_type": "B2B",
  "credit_limit": 500000
}
```

---

## 🔍 QUERIES COMUNES

### **1. Obtener todos los clientes (personas y empresas)**

```sql
SELECT 
  p.id,
  p.party_type,
  p.email,
  p.phone,
  CASE 
    WHEN p.party_type = 'PERSON' THEN CONCAT(per.first_name, ' ', per.last_name)
    WHEN p.party_type = 'ORGANIZATION' THEN org.legal_name
  END as display_name,
  c.customer_type,
  c.credit_limit,
  c.total_orders,
  c.total_spent
FROM parties p
LEFT JOIN persons per ON p.id = per.party_id
LEFT JOIN organizations org ON p.id = org.party_id
INNER JOIN customers c ON p.id = c.party_id
WHERE c.entity_id = 'uuid-oddy'
  AND c.status = 'ACTIVE';
```

### **2. Parties con múltiples roles**

```sql
SELECT 
  p.id,
  p.email,
  ARRAY_AGG(pr.role_type) as roles
FROM parties p
INNER JOIN party_roles pr ON p.id = pr.party_id
WHERE pr.entity_id = 'uuid-oddy'
  AND pr.active = TRUE
GROUP BY p.id, p.email
HAVING COUNT(pr.role_type) > 1;
```

### **3. Clientes VIP con más de $10k gastados**

```sql
SELECT 
  p.id,
  CONCAT(per.first_name, ' ', per.last_name) as name,
  c.total_spent,
  c.total_orders,
  c.loyalty_tier
FROM customers c
INNER JOIN parties p ON c.party_id = p.id
INNER JOIN persons per ON p.id = per.party_id
WHERE c.entity_id = 'uuid-oddy'
  AND c.total_spent > 10000
ORDER BY c.total_spent DESC;
```

---

## ✅ DECISIÓN FINAL

### **IMPLEMENTAR: OPCIÓN A (PARTY MODEL)**

```
✅ parties.tsx           - 1.5 días
✅ customers.tsx         - 1 día
✅ suppliers.tsx         - 1 día
⚪ cart.tsx              - 0.5 días
⚪ auth.tsx              - 1 día
⚪ users.tsx             - 1 día
─────────────────────────────────
TOTAL: 6 días

Valor agregado: +200% en escalabilidad
Deuda técnica: CERO
Profesionalismo: ⭐⭐⭐⭐⭐
```

---

## 🚀 PRÓXIMA ACCIÓN

**¿Empiezo con la implementación de `parties.tsx`?**

O prefieres que primero hagamos el Schema SQL completo en Supabase?

```
A. Implementar parties.tsx + customers.tsx + suppliers.tsx
B. Crear Schema SQL en Supabase
C. Ambos en paralelo
```

**¿Qué prefieres?** 🎯
