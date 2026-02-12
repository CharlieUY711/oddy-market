# 🏗️ Arquitectura: Multi-Entity y Multi-Territory como Módulos

## 🎯 LA PREGUNTA CLAVE

**¿Multi-Entity y Multi-Territory deberían ser módulos opcionales que se acoplan al sistema, o parte fundamental de la arquitectura base?**

Esta es una decisión arquitectural crítica que afecta:
- 💰 Modelo de pricing
- 🏗️ Complejidad técnica
- 📈 Escalabilidad del negocio
- 🎯 Go-to-market strategy

---

## 🔀 OPCIÓN A: Arquitectura Monolítica (Multi-Tenant Desde el Inicio)

### Cómo Funciona
```
Sistema Base:
├── Multi-Tenant (siempre activo)
├── Multi-Territory (siempre activo)
├── RLS (siempre activo)
└── Todos los módulos construidos sobre esta base
```

### ✅ Ventajas

1. **Simplicidad Arquitectural**
   - Una sola arquitectura de datos
   - No hay "modos" del sistema
   - Menos complejidad técnica
   - Más fácil de desarrollar inicialmente

2. **Performance Consistente**
   - No hay overhead de "activar/desactivar" features
   - Queries optimizadas para un solo caso de uso
   - Sin lógica condicional en runtime

3. **Menos Bugs**
   - Una sola base de código
   - No hay "si está activado multi-territory entonces..."
   - Testing más simple

4. **Posicionamiento Premium**
   - Todas las features incluidas
   - Vender como solución empresarial completa
   - Competir en la alta gama

### ❌ Desventajas

1. **Barrera de Entrada Alta**
   - Cliente pequeño no necesita multi-territory
   - Precio fijo alto puede alejar clientes pequeños
   - "Over-engineering" para casos simples

2. **No Escalabilidad en Pricing**
   - No puedes cobrar extra por multi-territory
   - Dejas dinero en la mesa
   - Cliente grande paga igual que cliente pequeño

3. **Rigidez Comercial**
   - Un solo producto
   - No puedes hacer upselling de features
   - Difícil competir en precio con soluciones más simples

4. **Complejidad Percibida**
   - Cliente simple se siente abrumado
   - "Esto es demasiado para mí"
   - Puede frenar conversiones

---

## 🧩 OPCIÓN B: Arquitectura Modular (Multi-Entity y Multi-Territory como Add-Ons)

### Cómo Funciona
```
Sistema Base (Single-Tenant):
├── Tenant único
├── Territorio único
├── Módulos core
└── RLS básico

+
Módulo Multi-Entity (Add-On):
├── Gestión de múltiples tenants
├── Aislamiento de datos
├── Dashboard super admin
└── +$2,000/mes

+
Módulo Multi-Territory (Add-On):
├── Gestión de territorios
├── Localización (i18n)
├── Multi-moneda
└── +$1,500/mes por territorio adicional
```

### ✅ Ventajas

1. **Escalabilidad en Pricing** 🔥
   ```
   Starter:     $999/mes  (single-tenant, single-territory)
   Growth:      $2,999/mes (single-tenant, multi-territory)
   Enterprise:  $6,999/mes (multi-tenant, multi-territory)
   
   Add-ons:
   + Multi-Entity Module:    $2,000/mes
   + Additional Territory:   $1,500/mes c/u
   ```

2. **Menor Barrera de Entrada**
   - Cliente pequeño paga menos
   - Empieza simple, crece cuando necesita
   - Más conversiones iniciales

3. **Upselling y Expansion Revenue**
   - Cliente empieza con $999/mes
   - Luego activa multi-territory → +$1,500/mes
   - Luego activa multi-entity → +$2,000/mes
   - Cliente final paga $4,499/mes (4.5x más)
   - **Expansion MRR** (clave para SaaS)

4. **Segmentación de Mercado**
   - Producto para cada tipo de cliente
   - Competir en diferentes rangos de precio
   - Posicionamiento flexible

5. **Marketing Más Claro**
   ```
   "Empieza con $999/mes"
   vs
   "Mínimo $6,999/mes"
   
   La primera convierte mucho más
   ```

### ❌ Desventajas

1. **Complejidad Técnica** 🔥
   - Dos arquitecturas de datos:
     - Single-tenant mode
     - Multi-tenant mode
   - Lógica condicional en todo el código
   - Migraciones complejas (single → multi)
   - Testing exponencialmente más complejo

2. **Riesgo de Bugs**
   ```javascript
   // Código lleno de esto:
   if (tenant.has_multi_territory_enabled) {
     // Lógica multi-territory
   } else {
     // Lógica single-territory
   }
   
   // Bugs esperando a suceder
   ```

3. **Performance Overhead**
   - Checks constantes de "¿está activado?"
   - Queries más complejas
   - Cache más difícil

4. **Migración de Datos Compleja**
   ```
   Cliente en plan Starter con 10,000 productos
   Quiere activar multi-territory
   
   → Migración masiva de datos
   → Downtime
   → Riesgo de pérdida de datos
   ```

5. **Mantenimiento Doble**
   - Dos flujos de código
   - Testing para ambos modos
   - Bugs en ambos lados

---

## 🎯 OPCIÓN C: HÍBRIDO - La Mejor de Ambos Mundos

### Arquitectura Base Multi-Tenant, Features como Módulos

```
Sistema Base (SIEMPRE multi-tenant):
├── Multi-Tenant architecture (hardcoded)
│   ├── tenant_id en todas las tablas
│   ├── RLS siempre activo
│   └── Aislamiento de datos garantizado
│
└── Modules (opcionales):
    ├── ✅ Single Territory (base - incluido)
    ├── 💎 Multi-Territory Module (add-on)
    ├── 📦 Products Module (base - incluido)
    ├── 📊 Advanced Analytics (add-on)
    ├── 🤖 AI Features (add-on)
    ├── 🔌 Premium Integrations (add-on)
    └── 🚀 White Label (add-on)
```

### Cómo Funciona

#### 1. La Base es SIEMPRE Multi-Tenant
```sql
-- Esto SIEMPRE existe
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL, -- SIEMPRE
  name VARCHAR(255),
  price DECIMAL,
  -- ...
);

-- RLS SIEMPRE activo
CREATE POLICY "tenant_isolation"
  ON products FOR ALL
  USING (tenant_id = current_tenant_id());
```

**Por qué:**
- ✅ Arquitectura de datos consistente
- ✅ No hay "modo single-tenant" vs "modo multi-tenant"
- ✅ Escalable desde día 1
- ✅ Seguridad por diseño

#### 2. Los Módulos Controlan Features, No Arquitectura

```typescript
// Tabla de módulos del tenant
CREATE TABLE tenant_modules (
  tenant_id UUID REFERENCES tenants(id),
  module_id VARCHAR(50), -- 'multi_territory', 'advanced_analytics', etc.
  enabled BOOLEAN DEFAULT false,
  settings JSONB,
  enabled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ -- Para trials
);

// En el código
const { hasModule } = useTenantModules();

// En lugar de arquitectura diferente:
if (hasModule('multi_territory')) {
  // Mostrar selector de territorios
  // Permitir crear territorios
  // Filtros por territorio
} else {
  // Ocultar features
  // Un solo territorio (el default)
}
```

**Lo clave:**
- La data SIEMPRE soporta multi-territory (tiene territory_id)
- Pero el UI y las funcionalidades se habilitan/deshabilitan
- No hay migración de datos, solo activar un flag

#### 3. Territories: Base vs Premium

```sql
-- TODOS los tenants tienen al menos 1 territorio
CREATE TABLE territories (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  code VARCHAR(2),
  name VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  -- ...
);

-- Al crear tenant, se crea su territorio default
INSERT INTO territories (tenant_id, code, name, is_default)
VALUES (new_tenant_id, 'UY', 'Uruguay', true);
```

**Regla de negocio:**
```typescript
// Lógica en frontend/backend
const MAX_TERRITORIES = tenant.modules.has('multi_territory') 
  ? 999 // Ilimitado
  : 1;  // Solo el default

if (territories.length >= MAX_TERRITORIES) {
  throw new Error('Upgrade to Enterprise para más territorios');
}
```

### ✅ Ventajas del Híbrido

1. **Arquitectura Consistente**
   - ✅ Siempre multi-tenant (seguro)
   - ✅ Una sola base de código
   - ✅ Sin migraciones de datos

2. **Pricing Flexible**
   - ✅ Puedes cobrar por módulos
   - ✅ Upselling fácil
   - ✅ Expansion revenue

3. **Simplicidad Técnica**
   - ✅ No hay "modos" de arquitectura
   - ✅ Solo feature flags
   - ✅ Testing más simple

4. **UX Gradual**
   - ✅ Cliente nuevo: UI simple (un territorio)
   - ✅ Cliente crece: Activa multi-territory
   - ✅ UI se expande, no cambia

5. **Zero Downtime en Upgrades**
   ```sql
   -- Cliente quiere multi-territory
   UPDATE tenant_modules 
   SET enabled = true 
   WHERE tenant_id = 'xxx' 
   AND module_id = 'multi_territory';
   
   -- Listo, ahora puede crear territorios
   -- Sin migración, sin downtime
   ```

### ❌ Desventajas del Híbrido

1. **Overhead de Features No Usadas**
   - Tenant con 1 territorio tiene `territory_id` en todas las tablas
   - Queries ligeramente más complejas
   - Pero: overhead mínimo (~5%)

2. **Complejidad en UI**
   - Código con `if (hasModule('...'))`
   - Pero: solo en UI, no en arquitectura
   - Manejable con componentes wrapper

---

## 💰 IMPACTO EN PRICING

### Monolítico (Todo Incluido)
```
Un solo plan:
Enterprise: $6,999/mes (todo incluido)

Problema: Cliente pequeño no paga esto
```

### Modular (Add-Ons)
```
Starter:     $999/mes
  ✅ 1 territorio
  ✅ Productos, órdenes, clientes
  ✅ Analytics básico
  
Growth:      $2,999/mes
  ✅ Todo de Starter
  ✅ Multi-Territory (hasta 3)
  ✅ Advanced Analytics
  
Enterprise:  $6,999/mes
  ✅ Todo de Growth
  ✅ White Label
  ✅ Multi-Entity
  ✅ Territorios ilimitados
  ✅ Premium Integrations
  
Add-ons:
+ Territorio adicional: $1,500/mes
+ AI Features:          $500/mes
+ Custom integrations:  $2,000/mes
```

### Expansión del Cliente (Ideal)
```
Mes 1:   Starter          $999/mes
Mes 6:   + 1 territorio   $2,499/mes
Mes 12:  Upgrade Growth   $2,999/mes
Mes 18:  + 2 territorios  $5,999/mes
Mes 24:  Upgrade Enterprise $6,999/mes

Lifetime Value (2 años): $99,000
vs Monolítico:           $168,000 (asumiendo que no firmaría inicialmente)
```

**Pero**: Con modular, conviertes. Con monolítico, cliente no firma.

---

## 🏗️ IMPLEMENTACIÓN TÉCNICA DEL HÍBRIDO

### 1. Base de Datos (Siempre Multi-Tenant)

```sql
-- ✅ SIEMPRE incluir tenant_id
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  territory_id UUID REFERENCES territories(id), -- Siempre, puede ser NULL o default
  name VARCHAR(255),
  -- ...
);

-- ✅ RLS SIEMPRE activo
CREATE POLICY "tenant_products"
  ON products FOR ALL
  USING (tenant_id = current_tenant_id());
```

### 2. Módulos del Tenant

```sql
-- Tabla de módulos disponibles
CREATE TABLE modules (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  category VARCHAR(50), -- 'core', 'premium', 'enterprise'
  base_price DECIMAL, -- Precio mensual
  settings_schema JSONB -- Schema de configuración
);

-- Módulos activos por tenant
CREATE TABLE tenant_modules (
  tenant_id UUID REFERENCES tenants(id),
  module_id VARCHAR(50) REFERENCES modules(id),
  enabled BOOLEAN DEFAULT true,
  settings JSONB,
  enabled_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ,
  PRIMARY KEY (tenant_id, module_id)
);

-- Insertar módulos base
INSERT INTO modules (id, name, category, base_price) VALUES
('core_commerce', 'E-commerce Core', 'core', 0),
('multi_territory', 'Multi-Territory', 'premium', 2000),
('advanced_analytics', 'Advanced Analytics', 'premium', 500),
('ai_features', 'AI Features', 'premium', 800),
('white_label', 'White Label', 'enterprise', 3000),
('multi_entity', 'Multi-Entity Management', 'enterprise', 2000);
```

### 3. Hook para Verificar Módulos

```typescript
// src/dashboard/hooks/useTenantModules.ts

export function useTenantModules() {
  const { tenant } = useTenant();
  
  const { data: modules } = useQuery({
    queryKey: ['tenant-modules', tenant.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('tenant_modules')
        .select('module_id, enabled, settings')
        .eq('tenant_id', tenant.id)
        .eq('enabled', true);
        
      return data;
    },
  });
  
  const hasModule = useCallback((moduleId: string) => {
    return modules?.some(m => m.module_id === moduleId) || false;
  }, [modules]);
  
  const getModuleSettings = useCallback((moduleId: string) => {
    return modules?.find(m => m.module_id === moduleId)?.settings;
  }, [modules]);
  
  const canAddTerritory = useCallback(() => {
    if (!hasModule('multi_territory')) return false;
    
    const settings = getModuleSettings('multi_territory');
    const maxTerritories = settings?.max_territories ?? 3;
    
    return tenant.territories.length < maxTerritories;
  }, [hasModule, getModuleSettings, tenant]);
  
  return {
    modules,
    hasModule,
    getModuleSettings,
    canAddTerritory,
  };
}
```

### 4. Componente de Upsell

```typescript
// src/dashboard/components/ModuleUpsell.tsx

export function ModuleUpsell({ 
  moduleId, 
  children 
}: { 
  moduleId: string; 
  children: React.ReactNode;
}) {
  const { hasModule } = useTenantModules();
  const { data: module } = useModule(moduleId);
  
  if (hasModule(moduleId)) {
    return <>{children}</>;
  }
  
  return (
    <Card className="p-6 text-center">
      <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">
        {module.name} Requerido
      </h3>
      <p className="text-muted-foreground mb-4">
        {module.description}
      </p>
      <div className="text-2xl font-bold mb-4">
        ${module.base_price}/mes
      </div>
      <Button onClick={() => contactSales(moduleId)}>
        Upgrade Ahora
      </Button>
    </Card>
  );
}

// Uso
<ModuleUpsell moduleId="multi_territory">
  <TerritorySelector />
  <TerritoryManagement />
</ModuleUpsell>
```

### 5. Lógica de Negocio

```typescript
// src/dashboard/services/territoryService.ts

export const territoryService = {
  async create(data: TerritoryCreate) {
    const { tenant } = useTenantStore.getState();
    const { hasModule, canAddTerritory } = useTenantModules();
    
    // Verificar si puede agregar territorios
    if (!canAddTerritory()) {
      if (!hasModule('multi_territory')) {
        throw new Error(
          'Upgrade a Growth o Enterprise para agregar territorios'
        );
      } else {
        throw new Error(
          'Límite de territorios alcanzado. Contacta ventas.'
        );
      }
    }
    
    // Crear territorio
    const { data: territory, error } = await supabase
      .from('territories')
      .insert({
        ...data,
        tenant_id: tenant.id,
      })
      .select()
      .single();
      
    if (error) throw error;
    return territory;
  },
};
```

---

## 📊 COMPARACIÓN FINAL

| Aspecto | Monolítico | Modular Puro | Híbrido (Recomendado) |
|---------|-----------|--------------|----------------------|
| **Complejidad Técnica** | 🟢 Baja | 🔴 Alta | 🟡 Media |
| **Complejidad de Datos** | 🟢 Baja | 🔴 Alta | 🟢 Baja |
| **Pricing Flexibility** | 🔴 Nula | 🟢 Alta | 🟢 Alta |
| **Barrera de Entrada** | 🔴 Alta | 🟢 Baja | 🟢 Baja |
| **Expansion Revenue** | 🔴 No | 🟢 Sí | 🟢 Sí |
| **Upselling** | 🔴 No | 🟢 Sí | 🟢 Sí |
| **Performance** | 🟢 Alta | 🟡 Media | 🟢 Alta |
| **Mantenimiento** | 🟢 Simple | 🔴 Complejo | 🟡 Medio |
| **Testing** | 🟢 Simple | 🔴 Complejo | 🟡 Medio |
| **Migraciones** | 🟢 No necesarias | 🔴 Complejas | 🟢 No necesarias |
| **Seguridad** | 🟢 Alta | 🟡 Variable | 🟢 Alta |

---

## ✅ RECOMENDACIÓN: HÍBRIDO

### Por Qué

1. **Mejor de Ambos Mundos**
   - Arquitectura consistente (multi-tenant siempre)
   - Pricing flexible (módulos opcionales)
   - Complejidad manejable

2. **Escalabilidad de Negocio**
   ```
   Starter → Growth → Enterprise
   $999 → $2,999 → $6,999/mes
   
   + Add-ons según necesidad
   ```

3. **Implementación Pragmática**
   - Base de datos simple (siempre multi-tenant)
   - Feature flags en UI (simple)
   - Sin migraciones complejas

4. **UX Progresivo**
   - Cliente nuevo: Simple
   - Cliente crece: Más features
   - Sin cambios disruptivos

---

## 🎯 APLICACIÓN AL DASHBOARD

### Módulos Propuestos

```typescript
// Módulos Core (incluidos en todos los planes)
const CORE_MODULES = [
  'core_commerce',      // Productos, Órdenes, Clientes
  'basic_analytics',    // Métricas básicas
  'single_territory',   // Un territorio
];

// Módulos Premium (Growth)
const PREMIUM_MODULES = [
  'multi_territory',    // +$2,000/mes (hasta 3 territorios)
  'advanced_analytics', // +$500/mes
  'email_marketing',    // +$300/mes
  'loyalty_program',    // +$400/mes
];

// Módulos Enterprise
const ENTERPRISE_MODULES = [
  'white_label',        // +$3,000/mes
  'multi_entity',       // +$2,000/mes
  'ai_features',        // +$800/mes
  'custom_integrations',// +$2,000/mes
  'unlimited_territories', // Incluido
];
```

### Dashboard con Módulos

```typescript
// Sidebar dinámico según módulos
export function Sidebar() {
  const { hasModule } = useTenantModules();
  
  const menuItems = [
    // Siempre visible
    { id: 'overview', icon: Home, label: 'Overview', path: '/dashboard' },
    { id: 'products', icon: Package, label: 'Productos', path: '/dashboard/products' },
    { id: 'orders', icon: ShoppingCart, label: 'Órdenes', path: '/dashboard/orders' },
    
    // Condicionales
    hasModule('multi_territory') && {
      id: 'territories',
      icon: Globe,
      label: 'Territorios',
      path: '/dashboard/territories',
    },
    
    hasModule('advanced_analytics') && {
      id: 'analytics',
      icon: BarChart,
      label: 'Analytics',
      path: '/dashboard/analytics',
    },
    
    hasModule('white_label') && {
      id: 'branding',
      icon: Palette,
      label: 'Branding',
      path: '/dashboard/branding',
    },
  ].filter(Boolean);
  
  return (
    <nav>
      {menuItems.map(item => (
        <NavLink key={item.id} to={item.path}>
          <item.icon />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

---

## 📝 PRÓXIMO PASO

### Decisión Necesaria

**¿Vamos con el enfoque HÍBRIDO?**

Si sí:
1. Actualizar `PLAN_DASHBOARD_PROFESIONAL.md`
2. Agregar sistema de módulos a Fase 1
3. Diseñar tabla de módulos
4. Definir lista de módulos y pricing

**Ventajas:**
- ✅ Pricing más flexible
- ✅ Más conversiones (barrera baja)
- ✅ Expansion revenue (crecimiento MRR)
- ✅ Arquitectura sólida

**Costo:**
- Feature flags en UI (manejable)
- Sistema de módulos (1-2 días extra)

---

**¿Qué te parece? ¿Vamos con el HÍBRIDO?** 🚀
