# 🎛️ Plan de Acción: Dashboard Profesional - Charlie Market Place

## 🎯 OBJETIVO

Implementar un **Dashboard de administración profesional, modular, escalable y seguro** para la plataforma Charlie Market Place, considerando:

- ✅ Arquitectura multi-tenant
- ✅ Multi-territorio
- ✅ Seguridad avanzada
- ✅ Performance optimizado
- ✅ Modularidad y reutilización
- ✅ Escalabilidad para múltiples clientes

---

## 📋 ÍNDICE DEL PLAN

1. [Análisis y Arquitectura](#fase-1-análisis-y-arquitectura)
2. [Seguridad y Autenticación](#fase-2-seguridad-y-autenticación)
3. [Infraestructura Base](#fase-3-infraestructura-base)
4. [Módulos Core del Dashboard](#fase-4-módulos-core)
5. [Visualización de Datos](#fase-5-visualización-de-datos)
6. [Módulos Avanzados](#fase-6-módulos-avanzados)
7. [Optimización y Performance](#fase-7-optimización)
8. [Testing y Seguridad](#fase-8-testing)
9. [Documentación y Deploy](#fase-9-documentación)

---

## 🏗️ ARQUITECTURA GENERAL

### Stack Tecnológico

```
Frontend Dashboard:
├── React 18 + Vite
├── React Router v6 (routing)
├── TanStack Query v5 (data fetching, caching)
├── Zustand (state management)
├── Recharts (gráficos y analytics)
├── TailwindCSS + shadcn/ui (UI components)
└── React Hook Form + Zod (forms y validación)

Backend:
├── Supabase PostgreSQL (database)
├── Supabase Edge Functions + Hono (APIs)
├── Row Level Security (RLS)
├── Redis (caching - opcional)
└── Supabase Realtime (actualizaciones en tiempo real)

Seguridad:
├── Supabase Auth (JWT)
├── Role-Based Access Control (RBAC)
├── Multi-Tenant Isolation
└── API Rate Limiting
```

### Arquitectura Multi-Tenant

```
┌─────────────────────────────────────────────┐
│         Dashboard Frontend                   │
│      (Un solo código base)                  │
└──────────────────┬──────────────────────────┘
                   │
           Tenant Detection
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌────────┐    ┌────────┐    ┌────────┐
│Tenant 1│    │Tenant 2│    │Tenant 3│
│ ODDY UY│    │ ODDY AR│    │Cliente X│
└────────┘    └────────┘    └────────┘
    │              │              │
    └──────────────┼──────────────┘
                   │
            Backend Central
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   Multi-Tenant          Row Level
    Database              Security
```

---

## 📅 ROADMAP DE IMPLEMENTACIÓN

### Timeline: 6-8 Semanas

| Fase | Duración | Prioridad |
|------|----------|-----------|
| Fase 1: Análisis y Arquitectura | 3-5 días | 🔴 Crítica |
| Fase 2: Seguridad y Autenticación | 5-7 días | 🔴 Crítica |
| Fase 3: Infraestructura Base | 5-7 días | 🔴 Crítica |
| Fase 4: Módulos Core | 7-10 días | 🟡 Alta |
| Fase 5: Visualización de Datos | 5-7 días | 🟡 Alta |
| Fase 6: Módulos Avanzados | 7-10 días | 🟢 Media |
| Fase 7: Optimización | 3-5 días | 🟡 Alta |
| Fase 8: Testing | 5-7 días | 🔴 Crítica |
| Fase 9: Documentación y Deploy | 3-5 días | 🟡 Alta |

---

# FASE 1: Análisis y Arquitectura

## 🎯 Objetivo
Definir la arquitectura completa del Dashboard y preparar el terreno.

## 📋 Tareas

### 1.1 Análisis de Requerimientos ✅
**Duración:** 1 día

- [x] **Revisar Dashboard existente en ODDY_Market.zip**
  - Identificar todos los módulos
  - Listar funcionalidades
  - Extraer diseño y UX
  
- [x] **Documentar requerimientos funcionales**
  - Casos de uso por rol (Admin, Manager, Usuario)
  - Flujos de trabajo
  - Reportes necesarios

- [x] **Definir requerimientos no funcionales**
  - Performance (tiempo de carga < 2s)
  - Seguridad (OWASP Top 10)
  - Escalabilidad (hasta 10,000 usuarios concurrentes)
  - Disponibilidad (99.9% uptime)

**Entregables:**
- `docs/REQUERIMIENTOS_DASHBOARD.md`
- `docs/CASOS_USO_DASHBOARD.md`

---

### 1.2 Diseño de Arquitectura de Datos ✅
**Duración:** 2 días

#### Base de Datos Multi-Tenant

```sql
-- Schema principal para multi-tenancy
CREATE SCHEMA IF NOT EXISTS charlie_mp;

-- ================================
-- TABLAS DE MULTI-TENANCY
-- ================================

-- Territorios (países)
CREATE TABLE charlie_mp.territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(2) UNIQUE NOT NULL, -- UY, AR, BR, US, ES
  name VARCHAR(100) NOT NULL,
  currency VARCHAR(3) NOT NULL, -- UYU, ARS, BRL, USD, EUR
  currency_symbol VARCHAR(5) NOT NULL,
  locale VARCHAR(10) NOT NULL, -- es-UY, es-AR, pt-BR
  timezone VARCHAR(50) NOT NULL,
  flag_emoji VARCHAR(10),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenants (clientes de Charlie MP)
CREATE TABLE charlie_mp.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL, -- oddy-uy, cliente-ar
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  tax_id VARCHAR(50), -- RUT, CUIT, CNPJ, etc.
  
  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7), -- #FF5733
  secondary_color VARCHAR(7),
  
  -- Contact
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  website VARCHAR(255),
  
  -- Subscription
  plan VARCHAR(50) NOT NULL, -- starter, growth, enterprise
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Relación Tenant <-> Territory
CREATE TABLE charlie_mp.tenant_territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES charlie_mp.tenants(id) ON DELETE CASCADE,
  territory_id UUID NOT NULL REFERENCES charlie_mp.territories(id) ON DELETE CASCADE,
  
  -- Configuración específica por territorio
  custom_domain VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  enabled BOOLEAN DEFAULT true,
  
  -- Settings por territorio
  settings JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, territory_id)
);

-- ================================
-- ROLES Y PERMISOS
-- ================================

CREATE TYPE charlie_mp.user_role AS ENUM (
  'super_admin',    -- Charlie MP admin (tú)
  'tenant_owner',   -- Dueño del tenant
  'tenant_admin',   -- Admin del tenant
  'manager',        -- Gerente
  'operator',       -- Operador
  'viewer'          -- Solo lectura
);

CREATE TABLE charlie_mp.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES charlie_mp.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role charlie_mp.user_role NOT NULL,
  
  -- Permisos específicos
  permissions JSONB DEFAULT '[]', -- ["orders.write", "products.delete"]
  
  -- Restricción por territorio
  territory_ids UUID[], -- Si NULL = acceso a todos
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, user_id)
);

-- ================================
-- AUDITORÍA Y LOGS
-- ================================

CREATE TABLE charlie_mp.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES charlie_mp.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Acción
  action VARCHAR(50) NOT NULL, -- create, update, delete, login, etc.
  resource_type VARCHAR(50) NOT NULL, -- product, order, user, etc.
  resource_id UUID,
  
  -- Contexto
  ip_address INET,
  user_agent TEXT,
  territory_id UUID REFERENCES charlie_mp.territories(id),
  
  -- Datos
  old_data JSONB,
  new_data JSONB,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para auditoría
CREATE INDEX idx_audit_logs_tenant ON charlie_mp.audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON charlie_mp.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON charlie_mp.audit_logs(resource_type, resource_id);

-- ================================
-- FUNCIONES DE UTILIDAD
-- ================================

-- Función para obtener el tenant_id del usuario actual
CREATE OR REPLACE FUNCTION charlie_mp.current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id 
  FROM charlie_mp.tenant_users 
  WHERE user_id = auth.uid()
  AND is_active = true
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Función para verificar permisos
CREATE OR REPLACE FUNCTION charlie_mp.has_permission(
  required_permission TEXT
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM charlie_mp.tenant_users 
    WHERE user_id = auth.uid()
    AND is_active = true
    AND (
      role IN ('super_admin', 'tenant_owner', 'tenant_admin')
      OR permissions ? required_permission
    )
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION charlie_mp.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_territories_updated_at
  BEFORE UPDATE ON charlie_mp.territories
  FOR EACH ROW EXECUTE FUNCTION charlie_mp.update_updated_at();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON charlie_mp.tenants
  FOR EACH ROW EXECUTE FUNCTION charlie_mp.update_updated_at();

CREATE TRIGGER update_tenant_territories_updated_at
  BEFORE UPDATE ON charlie_mp.tenant_territories
  FOR EACH ROW EXECUTE FUNCTION charlie_mp.update_updated_at();

CREATE TRIGGER update_tenant_users_updated_at
  BEFORE UPDATE ON charlie_mp.tenant_users
  FOR EACH ROW EXECUTE FUNCTION charlie_mp.update_updated_at();
```

**Entregables:**
- `supabase/migrations/001_multi_tenant_schema.sql`
- `docs/ARQUITECTURA_DATOS.md`

---

### 1.3 Diseño de Arquitectura de Componentes ✅
**Duración:** 1 día

#### Estructura de Carpetas

```
src/
├── dashboard/
│   ├── layouts/
│   │   ├── DashboardLayout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── Breadcrumbs.jsx
│   │
│   ├── pages/
│   │   ├── Overview/
│   │   │   ├── OverviewPage.jsx
│   │   │   ├── hooks/
│   │   │   └── components/
│   │   │
│   │   ├── Products/
│   │   ├── Orders/
│   │   ├── Customers/
│   │   ├── Analytics/
│   │   ├── Marketing/
│   │   ├── Settings/
│   │   └── Territories/
│   │
│   ├── components/
│   │   ├── ui/ (shadcn/ui components)
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── table.jsx
│   │   │   └── ...
│   │   │
│   │   ├── charts/
│   │   │   ├── LineChart.jsx
│   │   │   ├── BarChart.jsx
│   │   │   ├── PieChart.jsx
│   │   │   └── AreaChart.jsx
│   │   │
│   │   ├── tables/
│   │   │   ├── DataTable.jsx
│   │   │   ├── DataTablePagination.jsx
│   │   │   └── DataTableFilters.jsx
│   │   │
│   │   └── widgets/
│   │       ├── StatCard.jsx
│   │       ├── RevenueWidget.jsx
│   │       ├── OrdersWidget.jsx
│   │       └── TopProductsWidget.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTenant.js
│   │   ├── useTerritory.js
│   │   ├── usePermissions.js
│   │   └── useAnalytics.js
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── customers.js
│   │   │   └── analytics.js
│   │   │
│   │   └── supabase/
│   │       ├── auth.js
│   │       ├── tenants.js
│   │       └── realtime.js
│   │
│   ├── store/
│   │   ├── authStore.js
│   │   ├── tenantStore.js
│   │   ├── territoryStore.js
│   │   └── uiStore.js
│   │
│   ├── utils/
│   │   ├── formatting.js
│   │   ├── validation.js
│   │   ├── permissions.js
│   │   └── constants.js
│   │
│   └── types/
│       ├── tenant.ts
│       ├── territory.ts
│       ├── user.ts
│       └── analytics.ts
│
└── App.jsx
```

**Entregables:**
- `docs/ARQUITECTURA_COMPONENTES.md`
- Estructura de carpetas implementada

---

### 1.4 Diseño de Sistema de Módulos ✅
**Duración:** 1 día

#### Sistema de Módulos Dinámicos

```typescript
// src/dashboard/core/modules/ModuleRegistry.ts

export interface ModuleConfig {
  id: string;
  name: string;
  icon: React.ComponentType;
  path: string;
  component: React.LazyExoticComponent<React.ComponentType>;
  
  // Permisos
  requiredPermission?: string;
  requiredRole?: UserRole[];
  
  // Disponibilidad
  availableInPlans?: string[]; // ['growth', 'enterprise']
  enabledByDefault?: boolean;
  
  // Navegación
  showInSidebar?: boolean;
  sidebarOrder?: number;
  parentModule?: string;
  
  // Features
  hasRealtime?: boolean;
  hasAnalytics?: boolean;
  hasExport?: boolean;
}

export class ModuleRegistry {
  private static modules: Map<string, ModuleConfig> = new Map();
  
  static register(config: ModuleConfig) {
    this.modules.set(config.id, config);
  }
  
  static getAll(): ModuleConfig[] {
    return Array.from(this.modules.values());
  }
  
  static get(id: string): ModuleConfig | undefined {
    return this.modules.get(id);
  }
  
  static getAvailableForTenant(
    tenant: Tenant,
    user: User
  ): ModuleConfig[] {
    return this.getAll().filter(module => {
      // Check plan
      if (module.availableInPlans && 
          !module.availableInPlans.includes(tenant.plan)) {
        return false;
      }
      
      // Check permission
      if (module.requiredPermission &&
          !hasPermission(user, module.requiredPermission)) {
        return false;
      }
      
      // Check role
      if (module.requiredRole &&
          !module.requiredRole.includes(user.role)) {
        return false;
      }
      
      return true;
    });
  }
}

// Ejemplo de registro de módulos
ModuleRegistry.register({
  id: 'products',
  name: 'Productos',
  icon: PackageIcon,
  path: '/dashboard/products',
  component: lazy(() => import('@/dashboard/pages/Products')),
  requiredPermission: 'products.read',
  availableInPlans: ['starter', 'growth', 'enterprise'],
  showInSidebar: true,
  sidebarOrder: 2,
  hasRealtime: true,
  hasAnalytics: true,
  hasExport: true,
});
```

**Entregables:**
- `src/dashboard/core/modules/ModuleRegistry.ts`
- `docs/SISTEMA_MODULOS.md`

---

# FASE 2: Seguridad y Autenticación

## 🎯 Objetivo
Implementar un sistema de seguridad robusto con autenticación multi-tenant.

## 📋 Tareas

### 2.1 Sistema de Autenticación ⭐
**Duración:** 2 días
**Prioridad:** 🔴 Crítica

#### Implementación

```typescript
// src/dashboard/services/auth/authService.ts

import { supabase } from '@/utils/supabase';

export const authService = {
  // Login con tenant
  async login(email: string, password: string, tenantSlug?: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Verificar acceso al tenant
    if (tenantSlug) {
      const hasAccess = await this.verifyTenantAccess(
        data.user.id,
        tenantSlug
      );
      
      if (!hasAccess) {
        await supabase.auth.signOut();
        throw new Error('No tienes acceso a este tenant');
      }
    }
    
    return data;
  },
  
  // Verificar acceso a tenant
  async verifyTenantAccess(userId: string, tenantSlug: string) {
    const { data } = await supabase
      .from('tenant_users')
      .select(`
        *,
        tenant:tenants!inner(slug)
      `)
      .eq('user_id', userId)
      .eq('tenant.slug', tenantSlug)
      .eq('is_active', true)
      .single();
      
    return !!data;
  },
  
  // Obtener tenant del usuario
  async getUserTenant(userId: string) {
    const { data } = await supabase
      .from('tenant_users')
      .select(`
        role,
        permissions,
        tenant:tenants(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
      
    return data;
  },
  
  // Logout
  async logout() {
    await supabase.auth.signOut();
  },
};
```

**Entregables:**
- `src/dashboard/services/auth/authService.ts`
- `src/dashboard/hooks/useAuth.js`
- `src/dashboard/components/auth/LoginForm.jsx`
- Tests unitarios

---

### 2.2 Row Level Security (RLS) ⭐
**Duración:** 2 días
**Prioridad:** 🔴 Crítica

#### Políticas RLS

```sql
-- ================================
-- ROW LEVEL SECURITY POLICIES
-- ================================

-- Habilitar RLS en todas las tablas
ALTER TABLE charlie_mp.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE charlie_mp.tenant_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE charlie_mp.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE charlie_mp.territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ================================
-- POLÍTICAS PARA TENANTS
-- ================================

-- Los usuarios solo ven su tenant
CREATE POLICY "Users can view their own tenant"
  ON charlie_mp.tenants
  FOR SELECT
  USING (
    id IN (
      SELECT tenant_id 
      FROM charlie_mp.tenant_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Solo owners y admins pueden actualizar
CREATE POLICY "Owners and admins can update tenant"
  ON charlie_mp.tenants
  FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id 
      FROM charlie_mp.tenant_users 
      WHERE user_id = auth.uid() 
      AND role IN ('tenant_owner', 'tenant_admin')
      AND is_active = true
    )
  );

-- ================================
-- POLÍTICAS PARA PRODUCTOS
-- ================================

-- Los usuarios solo ven productos de su tenant
CREATE POLICY "Users can view tenant products"
  ON public.products
  FOR SELECT
  USING (
    tenant_id = charlie_mp.current_tenant_id()
  );

-- Solo usuarios con permiso pueden crear productos
CREATE POLICY "Authorized users can create products"
  ON public.products
  FOR INSERT
  WITH CHECK (
    tenant_id = charlie_mp.current_tenant_id()
    AND charlie_mp.has_permission('products.write')
  );

-- Solo usuarios con permiso pueden actualizar productos
CREATE POLICY "Authorized users can update products"
  ON public.products
  FOR UPDATE
  USING (
    tenant_id = charlie_mp.current_tenant_id()
    AND charlie_mp.has_permission('products.write')
  );

-- Solo usuarios con permiso pueden eliminar productos
CREATE POLICY "Authorized users can delete products"
  ON public.products
  FOR DELETE
  USING (
    tenant_id = charlie_mp.current_tenant_id()
    AND charlie_mp.has_permission('products.delete')
  );

-- ================================
-- POLÍTICAS PARA ÓRDENES
-- ================================

CREATE POLICY "Users can view tenant orders"
  ON public.orders
  FOR SELECT
  USING (
    tenant_id = charlie_mp.current_tenant_id()
  );

CREATE POLICY "Authorized users can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    tenant_id = charlie_mp.current_tenant_id()
    AND charlie_mp.has_permission('orders.write')
  );

CREATE POLICY "Authorized users can update orders"
  ON public.orders
  FOR UPDATE
  USING (
    tenant_id = charlie_mp.current_tenant_id()
    AND charlie_mp.has_permission('orders.write')
  );

-- ================================
-- POLÍTICAS PARA TERRITORIOS
-- ================================

-- Todos pueden ver territorios (catálogo)
CREATE POLICY "Anyone can view territories"
  ON charlie_mp.territories
  FOR SELECT
  USING (enabled = true);

-- Solo super admin puede gestionar
CREATE POLICY "Super admin can manage territories"
  ON charlie_mp.territories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM charlie_mp.tenant_users 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- ================================
-- POLÍTICAS PARA TENANT_TERRITORIES
-- ================================

CREATE POLICY "Users can view their tenant territories"
  ON charlie_mp.tenant_territories
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id 
      FROM charlie_mp.tenant_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- ================================
-- POLÍTICAS PARA AUDIT LOGS
-- ================================

-- Los usuarios solo ven logs de su tenant
CREATE POLICY "Users can view their tenant logs"
  ON charlie_mp.audit_logs
  FOR SELECT
  USING (
    tenant_id = charlie_mp.current_tenant_id()
    AND charlie_mp.has_permission('audit.read')
  );

-- Solo el sistema puede insertar logs
CREATE POLICY "System can insert logs"
  ON charlie_mp.audit_logs
  FOR INSERT
  WITH CHECK (true); -- Se controla desde Edge Functions
```

**Entregables:**
- `supabase/migrations/002_rls_policies.sql`
- Tests de seguridad
- `docs/SEGURIDAD_RLS.md`

---

### 2.3 Sistema de Permisos (RBAC) ⭐
**Duración:** 2 días
**Prioridad:** 🔴 Crítica

#### Definición de Permisos

```typescript
// src/dashboard/utils/permissions.ts

export const PERMISSIONS = {
  // Productos
  'products.read': 'Ver productos',
  'products.write': 'Crear y editar productos',
  'products.delete': 'Eliminar productos',
  'products.export': 'Exportar productos',
  
  // Órdenes
  'orders.read': 'Ver órdenes',
  'orders.write': 'Gestionar órdenes',
  'orders.cancel': 'Cancelar órdenes',
  'orders.refund': 'Procesar reembolsos',
  
  // Clientes
  'customers.read': 'Ver clientes',
  'customers.write': 'Gestionar clientes',
  'customers.delete': 'Eliminar clientes',
  
  // Marketing
  'marketing.campaigns': 'Gestionar campañas',
  'marketing.coupons': 'Gestionar cupones',
  
  // Analytics
  'analytics.read': 'Ver reportes',
  'analytics.export': 'Exportar reportes',
  
  // Configuración
  'settings.read': 'Ver configuración',
  'settings.write': 'Modificar configuración',
  
  // Usuarios
  'users.read': 'Ver usuarios',
  'users.invite': 'Invitar usuarios',
  'users.manage': 'Gestionar usuarios',
  
  // Auditoría
  'audit.read': 'Ver logs de auditoría',
  
  // Territorios
  'territories.read': 'Ver territorios',
  'territories.manage': 'Gestionar territorios',
} as const;

export type Permission = keyof typeof PERMISSIONS;

// Permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: Object.keys(PERMISSIONS) as Permission[],
  
  tenant_owner: [
    'products.read', 'products.write', 'products.delete', 'products.export',
    'orders.read', 'orders.write', 'orders.cancel', 'orders.refund',
    'customers.read', 'customers.write', 'customers.delete',
    'marketing.campaigns', 'marketing.coupons',
    'analytics.read', 'analytics.export',
    'settings.read', 'settings.write',
    'users.read', 'users.invite', 'users.manage',
    'audit.read',
    'territories.read', 'territories.manage',
  ],
  
  tenant_admin: [
    'products.read', 'products.write', 'products.export',
    'orders.read', 'orders.write', 'orders.cancel',
    'customers.read', 'customers.write',
    'marketing.campaigns', 'marketing.coupons',
    'analytics.read', 'analytics.export',
    'settings.read',
    'users.read', 'users.invite',
    'audit.read',
    'territories.read',
  ],
  
  manager: [
    'products.read', 'products.write',
    'orders.read', 'orders.write',
    'customers.read', 'customers.write',
    'analytics.read',
    'settings.read',
  ],
  
  operator: [
    'products.read',
    'orders.read', 'orders.write',
    'customers.read',
  ],
  
  viewer: [
    'products.read',
    'orders.read',
    'customers.read',
    'analytics.read',
  ],
};

// Hook para verificar permisos
export function usePermissions() {
  const { user, tenant } = useAuth();
  
  const hasPermission = useCallback((permission: Permission) => {
    if (!user || !tenant) return false;
    
    // Super admin tiene todos los permisos
    if (user.role === 'super_admin') return true;
    
    // Verificar permisos del rol
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    if (rolePermissions.includes(permission)) return true;
    
    // Verificar permisos personalizados
    return user.permissions?.includes(permission) || false;
  }, [user, tenant]);
  
  const hasAnyPermission = useCallback((permissions: Permission[]) => {
    return permissions.some(p => hasPermission(p));
  }, [hasPermission]);
  
  const hasAllPermissions = useCallback((permissions: Permission[]) => {
    return permissions.every(p => hasPermission(p));
  }, [hasPermission]);
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
```

**Entregables:**
- `src/dashboard/utils/permissions.ts`
- `src/dashboard/hooks/usePermissions.js`
- `src/dashboard/components/auth/PermissionGate.jsx`
- Tests unitarios

---

### 2.4 Audit Logging Automático ⭐
**Duración:** 1 día
**Prioridad:** 🟡 Alta

#### Sistema de Auditoría

```typescript
// src/dashboard/services/audit/auditService.ts

export const auditService = {
  async log(action: {
    action: string;
    resourceType: string;
    resourceId?: string;
    oldData?: any;
    newData?: any;
    metadata?: any;
  }) {
    const { user, tenant } = useAuthStore.getState();
    
    await supabase.from('audit_logs').insert({
      tenant_id: tenant.id,
      user_id: user.id,
      action: action.action,
      resource_type: action.resourceType,
      resource_id: action.resourceId,
      old_data: action.oldData,
      new_data: action.newData,
      metadata: action.metadata,
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
    });
  },
};

// Middleware para loguear acciones automáticamente
export function withAudit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: {
    action: string;
    resourceType: string;
    getResourceId?: (...args: Parameters<T>) => string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const oldData = config.getResourceId 
      ? await getCurrentData(config.resourceType, config.getResourceId(...args))
      : undefined;
    
    const result = await fn(...args);
    
    await auditService.log({
      action: config.action,
      resourceType: config.resourceType,
      resourceId: config.getResourceId?.(...args),
      oldData,
      newData: result,
    });
    
    return result;
  }) as T;
}

// Ejemplo de uso
export const productService = {
  updateProduct: withAudit(
    async (id: string, data: ProductUpdate) => {
      const { data: product, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return product;
    },
    {
      action: 'update',
      resourceType: 'product',
      getResourceId: (id) => id,
    }
  ),
};
```

**Entregables:**
- `src/dashboard/services/audit/auditService.ts`
- Middleware de auditoría
- Tests unitarios

---

# FASE 3: Infraestructura Base

## 🎯 Objetivo
Construir la base del Dashboard con routing, layouts y componentes fundamentales.

## 📋 Tareas

### 3.1 Setup de Routing y Layouts ⭐
**Duración:** 2 días
**Prioridad:** 🔴 Crítica

#### React Router con Lazy Loading

```typescript
// src/dashboard/routes/routes.tsx

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout';
import { PermissionGate } from '@/dashboard/components/auth/PermissionGate';

// Lazy load de páginas
const Overview = lazy(() => import('@/dashboard/pages/Overview'));
const Products = lazy(() => import('@/dashboard/pages/Products'));
const Orders = lazy(() => import('@/dashboard/pages/Orders'));
const Customers = lazy(() => import('@/dashboard/pages/Customers'));
const Analytics = lazy(() => import('@/dashboard/pages/Analytics'));

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Overview />,
      },
      {
        path: 'products',
        element: (
          <PermissionGate permission="products.read">
            <Products />
          </PermissionGate>
        ),
      },
      {
        path: 'orders',
        element: (
          <PermissionGate permission="orders.read">
            <Orders />
          </PermissionGate>
        ),
      },
      // ... más rutas
    ],
  },
];
```

**Entregables:**
- `src/dashboard/routes/routes.tsx`
- `src/dashboard/layouts/DashboardLayout.jsx`
- `src/dashboard/layouts/Sidebar.jsx`
- `src/dashboard/layouts/Header.jsx`

---

### 3.2 Sistema de Theming y UI Base ⭐
**Duración:** 2 días
**Prioridad:** 🟡 Alta

#### Setup de shadcn/ui + TailwindCSS

```bash
# Instalar shadcn/ui
npx shadcn-ui@latest init

# Agregar componentes base
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add select
npx shadcn-ui@latest add input
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
```

#### Theming Multi-Tenant

```typescript
// src/dashboard/hooks/useTheming.ts

export function useTheming() {
  const { tenant } = useTenant();
  
  useEffect(() => {
    if (tenant?.primary_color) {
      document.documentElement.style.setProperty(
        '--color-primary',
        tenant.primary_color
      );
    }
    
    if (tenant?.secondary_color) {
      document.documentElement.style.setProperty(
        '--color-secondary',
        tenant.secondary_color
      );
    }
  }, [tenant]);
}
```

**Entregables:**
- shadcn/ui configurado
- Sistema de theming multi-tenant
- Componentes UI base

---

### 3.3 Data Fetching con TanStack Query ⭐
**Duración:** 2 días
**Prioridad:** 🔴 Crítica

#### Setup y Configuración

```typescript
// src/dashboard/lib/queryClient.ts

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      cacheTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Ejemplo de query
// src/dashboard/services/api/products.ts

export const productsQueries = {
  all: () => ['products'],
  lists: () => [...productsQueries.all(), 'list'],
  list: (filters: ProductFilters) => 
    [...productsQueries.lists(), filters],
  details: () => [...productsQueries.all(), 'detail'],
  detail: (id: string) => 
    [...productsQueries.details(), id],
};

export function useProducts(filters: ProductFilters) {
  const { tenant } = useTenant();
  
  return useQuery({
    queryKey: productsQueries.list(filters),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenant.id)
        .match(filters);
        
      if (error) throw error;
      return data;
    },
  });
}

export function useProductMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: ProductCreate) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(productsQueries.lists());
    },
  });
}
```

**Entregables:**
- TanStack Query configurado
- Queries y mutations para productos
- Cache strategy documentada

---

### 3.4 State Management con Zustand ⭐
**Duración:** 1 día
**Prioridad:** 🟡 Alta

#### Stores Globales

```typescript
// src/dashboard/store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setTenant: (tenant: Tenant | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      setTenant: (tenant) => set({ tenant }),
      
      logout: () => set({ 
        user: null, 
        tenant: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
      }),
    }
  )
);

// src/dashboard/store/uiStore.ts

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentTerritory: Territory | null;
  setCurrentTerritory: (territory: Territory) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  currentTerritory: null,
  setCurrentTerritory: (territory) => set({ 
    currentTerritory: territory 
  }),
}));
```

**Entregables:**
- `src/dashboard/store/authStore.ts`
- `src/dashboard/store/tenantStore.ts`
- `src/dashboard/store/uiStore.ts`

---

# FASE 4: Módulos Core del Dashboard

## 🎯 Objetivo
Implementar los módulos principales del Dashboard.

## 📋 Tareas

### 4.1 Módulo de Overview / Home ⭐
**Duración:** 3 días
**Prioridad:** 🔴 Crítica

#### Widgets y Métricas

```typescript
// src/dashboard/pages/Overview/OverviewPage.tsx

export function OverviewPage() {
  const { data: metrics, isLoading } = useOverviewMetrics();
  const { data: recentOrders } = useRecentOrders({ limit: 10 });
  const { data: topProducts } = useTopProducts({ limit: 5 });
  
  if (isLoading) return <OverviewSkeleton />;
  
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventas Totales"
          value={formatCurrency(metrics.totalRevenue)}
          change={metrics.revenueChange}
          icon={DollarSignIcon}
        />
        <StatCard
          title="Órdenes"
          value={metrics.totalOrders}
          change={metrics.ordersChange}
          icon={ShoppingCartIcon}
        />
        <StatCard
          title="Clientes"
          value={metrics.totalCustomers}
          change={metrics.customersChange}
          icon={UsersIcon}
        />
        <StatCard
          title="Productos"
          value={metrics.totalProducts}
          icon={PackageIcon}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={metrics.dailyRevenue} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Órdenes por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersStatusChart data={metrics.ordersByStatus} />
          </CardContent>
        </Card>
      </div>
      
      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Órdenes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={recentOrders} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsTable products={topProducts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Entregables:**
- Página de Overview completa
- 4 KPI cards
- 2 gráficos
- 2 tablas de datos
- Tests

---

### 4.2 Módulo de Productos ⭐
**Duración:** 3 días
**Prioridad:** 🔴 Crítica

#### CRUD Completo de Productos

```typescript
// src/dashboard/pages/Products/ProductsPage.tsx

export function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const { data: products, isLoading } = useProducts(filters);
  const createMutation = useProductMutation();
  
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'image',
      header: 'Imagen',
      cell: ({ row }) => (
        <Avatar>
          <AvatarImage src={row.original.image} />
          <AvatarFallback>{row.original.name[0]}</AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Producto',
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
    },
    {
      accessorKey: 'price',
      header: 'Precio',
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => (
        <Badge variant={row.original.stock > 0 ? 'success' : 'destructive'}>
          {row.original.stock}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => <ProductActions product={row.original} />,
    },
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Productos</h1>
        <PermissionGate permission="products.write">
          <Button onClick={() => setDialogOpen(true)}>
            <PlusIcon className="mr-2" />
            Nuevo Producto
          </Button>
        </PermissionGate>
      </div>
      
      <ProductFilters filters={filters} onChange={setFilters} />
      
      <DataTable
        columns={columns}
        data={products || []}
        isLoading={isLoading}
      />
      
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={createMutation.mutate}
      />
    </div>
  );
}
```

**Entregables:**
- Listado de productos con DataTable
- Filtros y búsqueda
- Formulario de creación/edición
- Importación/Exportación CSV
- Tests

---

### 4.3 Módulo de Órdenes ⭐
**Duración:** 3 días
**Prioridad:** 🔴 Crítica

#### Gestión de Órdenes

```typescript
// src/dashboard/pages/Orders/OrdersPage.tsx

export function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const { data: orders, isLoading } = useOrders({ status });
  const updateStatusMutation = useOrderStatusMutation();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Órdenes</h1>
        
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="processing">Procesando</TabsTrigger>
            <TabsTrigger value="shipped">Enviadas</TabsTrigger>
            <TabsTrigger value="delivered">Entregadas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <OrdersTable
        orders={orders || []}
        isLoading={isLoading}
        onUpdateStatus={updateStatusMutation.mutate}
      />
    </div>
  );
}
```

**Entregables:**
- Listado de órdenes
- Filtros por estado
- Detalle de orden
- Gestión de estado
- Generación de remitos
- Tests

---

### 4.4 Módulo de Clientes ⭐
**Duración:** 2 días
**Prioridad:** 🟡 Alta

**Entregables:**
- Listado de clientes
- Perfil de cliente
- Historial de compras
- Segmentación
- Tests

---

# FASE 5: Visualización de Datos

## 🎯 Objetivo
Implementar gráficos y reportes con Recharts.

## 📋 Tareas

### 5.1 Componentes de Gráficos Reutilizables ⭐
**Duración:** 3 días
**Prioridad:** 🟡 Alta

#### Charts Library

```typescript
// src/dashboard/components/charts/LineChart.tsx

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: Array<{ name: string; value: number }>;
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
}

export function LineChart({
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  color = 'hsl(var(--primary))',
  height = 300,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke={color} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
```

**Entregables:**
- LineChart component
- BarChart component
- PieChart component
- AreaChart component
- ComposedChart component

---

### 5.2 Módulo de Analytics ⭐
**Duración:** 4 días
**Prioridad:** 🟡 Alta

**Entregables:**
- Página de Analytics
- Filtros por fecha y territorio
- Métricas de ventas
- Métricas de productos
- Métricas de clientes
- Exportación de reportes

---

# FASE 6: Módulos Avanzados

## 🎯 Objetivo
Implementar funcionalidades avanzadas del Dashboard.

## 📋 Tareas

### 6.1 Selector Multi-Territorio ⭐
**Duración:** 2 días
**Prioridad:** 🔴 Crítica

```typescript
// src/dashboard/components/TerritorySelector.tsx

export function TerritorySelector() {
  const { territories } = useTenantTerritories();
  const { currentTerritory, setCurrentTerritory } = useUIStore();
  
  return (
    <Select
      value={currentTerritory?.id}
      onValueChange={(id) => {
        const territory = territories.find(t => t.id === id);
        setCurrentTerritory(territory);
      }}
    >
      <SelectTrigger>
        <SelectValue>
          {currentTerritory?.flag_emoji} {currentTerritory?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {territories.map(territory => (
          <SelectItem key={territory.id} value={territory.id}>
            {territory.flag_emoji} {territory.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

**Entregables:**
- Selector de territorios
- Filtrado automático de datos
- Persistencia en localStorage

---

### 6.2 Módulo de Configuración ⭐
**Duración:** 3 días
**Prioridad:** 🟡 Alta

**Entregables:**
- Configuración del tenant
- Gestión de territorios
- Branding y theming
- Integraciones
- Gestión de usuarios

---

### 6.3 Notificaciones en Tiempo Real ⭐
**Duración:** 2 días
**Prioridad:** 🟢 Media

```typescript
// src/dashboard/hooks/useRealtimeNotifications.ts

export function useRealtimeNotifications() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel(`tenant:${tenant.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${tenant.id}`,
        },
        (payload) => {
          // Nueva orden
          toast({
            title: 'Nueva orden recibida',
            description: `Orden #${payload.new.id}`,
          });
          
          // Invalidar queries
          queryClient.invalidateQueries(['orders']);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant.id]);
}
```

**Entregables:**
- Notificaciones en tiempo real
- Toast notifications
- Badge de notificaciones

---

### 6.4 Módulo de Gestión de Usuarios ⭐
**Duración:** 3 días
**Prioridad:** 🟡 Alta

**Entregables:**
- Listado de usuarios del tenant
- Invitar usuarios
- Asignar roles y permisos
- Gestionar acceso a territorios
- Tests

---

# FASE 7: Optimización y Performance

## 🎯 Objetivo
Optimizar el Dashboard para máxima performance.

## 📋 Tareas

### 7.1 Code Splitting y Lazy Loading ⭐
**Duración:** 1 día
**Prioridad:** 🟡 Alta

**Tareas:**
- Lazy load de todas las páginas
- Dynamic imports de módulos pesados
- Optimizar bundle size

---

### 7.2 Optimización de Queries ⭐
**Duración:** 2 días
**Prioridad:** 🟡 Alta

**Tareas:**
- Implementar paginación
- Optimizar queries SQL
- Agregar índices a la BD
- Cache strategy con TanStack Query

---

### 7.3 Virtualización de Tablas ⭐
**Duración:** 1 día
**Prioridad:** 🟢 Media

**Tareas:**
- Implementar virtualización para tablas grandes
- Lazy loading de filas

---

### 7.4 Performance Monitoring ⭐
**Duración:** 1 día
**Prioridad:** 🟢 Media

**Tareas:**
- Integrar Sentry
- Web Vitals tracking
- Performance budgets

---

# FASE 8: Testing y Seguridad

## 🎯 Objetivo
Asegurar la calidad y seguridad del Dashboard.

## 📋 Tareas

### 8.1 Unit Testing ⭐
**Duración:** 3 días
**Prioridad:** 🔴 Crítica

**Tareas:**
- Tests de hooks
- Tests de utilidades
- Tests de stores
- Coverage > 80%

---

### 8.2 Integration Testing ⭐
**Duración:** 2 días
**Prioridad:** 🟡 Alta

**Tareas:**
- Tests de flujos completos
- Tests de autenticación
- Tests de permisos

---

### 8.3 Security Audit ⭐
**Duración:** 2 días
**Prioridad:** 🔴 Crítica

**Tareas:**
- Audit de RLS policies
- Audit de permisos
- Penetration testing
- OWASP Top 10 check

---

# FASE 9: Documentación y Deploy

## 🎯 Objetivo
Documentar todo y preparar para producción.

## 📋 Tareas

### 9.1 Documentación ⭐
**Duración:** 3 días
**Prioridad:** 🟡 Alta

**Entregables:**
- README del Dashboard
- Guía de usuario
- Guía de desarrollo
- API documentation
- Storybook para componentes

---

### 9.2 Deploy a Producción ⭐
**Duración:** 2 días
**Prioridad:** 🔴 Crítica

**Tareas:**
- CI/CD pipeline
- Environment variables
- Deploy a Vercel
- Migración de BD a producción
- Monitoreo post-deploy

---

## 📊 RESUMEN DEL PLAN

### Duración Total: 6-8 Semanas

| Fase | Duración | Estado |
|------|----------|--------|
| 1. Análisis y Arquitectura | 3-5 días | ⏸️ Pendiente |
| 2. Seguridad y Autenticación | 5-7 días | ⏸️ Pendiente |
| 3. Infraestructura Base | 5-7 días | ⏸️ Pendiente |
| 4. Módulos Core | 7-10 días | ⏸️ Pendiente |
| 5. Visualización de Datos | 5-7 días | ⏸️ Pendiente |
| 6. Módulos Avanzados | 7-10 días | ⏸️ Pendiente |
| 7. Optimización | 3-5 días | ⏸️ Pendiente |
| 8. Testing | 5-7 días | ⏸️ Pendiente |
| 9. Documentación y Deploy | 3-5 días | ⏸️ Pendiente |

---

## 🎯 PRÓXIMO PASO

**¿Por dónde empezamos?**

Recomiendo empezar por:
1. **Fase 1: Análisis** (revisar el Dashboard del ZIP original)
2. **Fase 2: Seguridad** (multi-tenant + RLS)
3. **Fase 3: Infraestructura** (layouts + routing)

---

**Fecha:** 2026-02-12  
**Estado:** Plan completo definido  
**Próximo paso:** Iniciar Fase 1 - Análisis y Arquitectura
