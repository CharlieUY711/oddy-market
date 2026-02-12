# 🗺️ ROADMAP - Charlie Market Place

## 🎯 VISIÓN GENERAL

**Objetivo:** Construir Charlie Market Place, una plataforma SaaS multi-tenant de Fulfillment as a Service para distribuidores regionales.

**Timeline:** 3-4 meses hasta MVP en producción con primer cliente
**Enfoque:** Iterativo, validando con clientes reales desde el principio

---

## 📅 ROADMAP VISUAL

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHARLIE MARKET PLACE                         │
│                      ROADMAP 2026                               │
└─────────────────────────────────────────────────────────────────┘

MES 1 (Feb-Mar)          MES 2 (Mar-Abr)         MES 3 (Abr-May)         MES 4 (May-Jun)
│                        │                       │                       │
├─ FASE 1: FUNDAMENTOS  ├─ FASE 2: DASHBOARD   ├─ FASE 3: FULFILLMENT ├─ FASE 4: SCALE
│  Backend Base         │  Admin Profesional    │  Operación Real       │  Multi-Cliente
│  Multi-Tenant         │  Módulos Core         │  Integración Real     │  White Label
│  Seguridad RLS        │  Analytics            │  Remitos/Couriers     │  Optimización
│                       │                       │                       │
│  [Semanas 1-4]       │  [Semanas 5-8]        │  [Semanas 9-12]       │  [Semanas 13-16]
│                       │                       │                       │
├─ HITO 1              ├─ HITO 2               ├─ HITO 3              ├─ HITO 4
│  🎯 Arquitectura     │  🎯 Dashboard MVP     │  🎯 Primer Cliente    │  🎯 Producción
│     Definida         │     Funcional         │     Operando          │     Escalable
│                       │                       │                       │
└─────────────────────┴───────────────────────┴───────────────────────┴─────────────────

        ↓                      ↓                      ↓                      ↓
    DB Setup            UI Components         Real Operations         Multi-Tenant
    API Base            Data Fetching         Logistics               White Label
    Auth/RLS            Charts/Tables         Remitos/Tracking        Optimization
    Testing             Module System         Courier Integration     Scale Testing
```

---

## 📋 FASES DETALLADAS

---

# 🏗️ FASE 1: FUNDAMENTOS (4 Semanas)

## 🎯 Objetivo
Establecer la arquitectura base multi-tenant segura y escalable.

## 📅 Duración: Semanas 1-4 (Feb 12 - Mar 11)

## 🎬 SEMANA 1: Análisis y Setup Inicial

### Lunes (Día 1-2)
- [x] ✅ Análisis del backend original (ODDY_Market.zip)
- [x] ✅ Definición de arquitectura modular comercial / híbrida técnica
- [x] ✅ Documentación de estrategia completa

### Martes-Miércoles (Día 3-4)
- [ ] 📋 Revisar Dashboard del ZIP original
  - Listar todos los módulos existentes
  - Extraer componentes reutilizables
  - Documentar flujos de trabajo
  - Identificar qué conservar vs rehacer

### Jueves-Viernes (Día 5-7)
- [ ] 🗄️ Diseño de schema multi-tenant final
  - Tablas de tenants, territories, modules
  - Definir RLS policies
  - Planear índices y optimizaciones
  - Crear migration scripts

**Entregable Semana 1:**
- ✅ Documentación completa (3 docs creados)
- 📋 Lista de módulos del Dashboard original
- 🗄️ Schema SQL completo documentado
- 📊 Plan de migración de datos

---

## 🔒 SEMANA 2: Seguridad y Base de Datos

### Lunes-Martes (Día 8-10)
- [ ] 🗄️ Crear schema multi-tenant en Supabase
  ```sql
  - territories (países)
  - tenants (clientes)
  - tenant_territories (relación)
  - modules (catálogo de módulos)
  - tenant_modules (módulos activos)
  - tenant_users (usuarios + roles)
  - audit_logs (auditoría)
  ```

### Miércoles (Día 11-12)
- [ ] 🔒 Implementar Row Level Security (RLS)
  - Políticas de aislamiento por tenant
  - Políticas por rol y permiso
  - Testing de RLS
  - Documentar políticas

### Jueves-Viernes (Día 13-14)
- [ ] 👤 Sistema de autenticación multi-tenant
  - Login con selección de tenant
  - Verificación de acceso
  - JWT con tenant_id en claims
  - Hook `useAuth()` y `useTenant()`

**Entregable Semana 2:**
- 🗄️ Base de datos multi-tenant funcional
- 🔒 RLS implementado y testeado
- 👤 Auth multi-tenant funcionando
- 📄 Tests de seguridad pasando

---

## 🏗️ SEMANA 3: Infraestructura Frontend

### Lunes (Día 15-16)
- [ ] ⚙️ Setup del proyecto frontend
  - Instalar dependencias (React, Vite, TanStack Query, Zustand, shadcn/ui)
  - Configurar TailwindCSS
  - Setup de shadcn/ui
  - Estructura de carpetas

### Martes-Miércoles (Día 17-19)
- [ ] 🎨 Layouts y routing base
  - DashboardLayout con Sidebar + Header
  - React Router con lazy loading
  - Breadcrumbs
  - Navegación básica
  - Theming multi-tenant

### Jueves-Viernes (Día 20-21)
- [ ] 📦 Sistema de módulos
  - Tabla `modules` y `tenant_modules`
  - Hook `useTenantModules()`
  - Componente `<ModuleGate>`
  - Componente `<ModuleUpsell>`
  - Registry de módulos

**Entregable Semana 3:**
- ⚙️ Proyecto frontend configurado
- 🎨 Layout del Dashboard funcional
- 📦 Sistema de módulos operativo
- 🎯 Primera pantalla del Dashboard visible

---

## 🔌 SEMANA 4: Integración y Estado

### Lunes-Martes (Día 22-24)
- [ ] 🔌 TanStack Query setup
  - Query client configurado
  - Queries base (products, orders, customers)
  - Mutations base
  - Cache strategy
  - Optimistic updates

### Miércoles (Día 25-26)
- [ ] 📊 Zustand stores
  - `authStore` (usuario + tenant)
  - `uiStore` (sidebar, territory actual)
  - `notificationStore` (toasts)
  - Persistencia con localStorage

### Jueves-Viernes (Día 27-28)
- [ ] ✅ Testing y documentación Fase 1
  - Unit tests de hooks
  - Integration tests de auth
  - Security audit
  - Documentación de arquitectura
  - Demo interno

**Entregable Semana 4 (HITO 1):**
- ✅ Arquitectura multi-tenant completa
- ✅ Dashboard base funcional
- ✅ Sistema de módulos operativo
- ✅ Tests pasando
- 🎯 **HITO 1 ALCANZADO: Fundamentos Sólidos**

---

# 🎨 FASE 2: DASHBOARD PROFESIONAL (4 Semanas)

## 🎯 Objetivo
Construir un Dashboard profesional con módulos core y analytics.

## 📅 Duración: Semanas 5-8 (Mar 12 - Abr 8)

---

## 📊 SEMANA 5: Módulo Overview + UI Components

### Lunes-Martes (Día 29-31)
- [ ] 🎨 UI Components base (shadcn/ui)
  - Button, Card, Dialog, Table
  - Input, Select, Dropdown
  - Badge, Avatar, Tabs
  - Skeleton loaders
  - Toast notifications

### Miércoles-Jueves (Día 32-34)
- [ ] 📊 Componentes de gráficos
  - LineChart reutilizable
  - BarChart reutilizable
  - PieChart reutilizable
  - AreaChart reutilizable
  - Wrapper con Recharts

### Viernes (Día 35)
- [ ] 🏠 Página Overview/Home
  - 4 KPI cards (Ventas, Órdenes, Clientes, Productos)
  - Gráfico de ventas por día
  - Gráfico de órdenes por estado
  - Tabla de órdenes recientes
  - Tabla de top productos

**Entregable Semana 5:**
- 🎨 Librería de UI components completa
- 📊 Sistema de gráficos funcionando
- 🏠 Dashboard home presentable

---

## 📦 SEMANA 6: Módulo de Productos

### Lunes-Martes (Día 36-38)
- [ ] 📦 Listado de productos
  - DataTable con paginación
  - Filtros (categoría, stock, territorio)
  - Búsqueda en tiempo real
  - Ordenamiento
  - Skeleton loading

### Miércoles (Día 39-40)
- [ ] ➕ CRUD de productos
  - Formulario de creación
  - Formulario de edición
  - Validación con Zod
  - Upload de imágenes
  - Multi-territorio

### Jueves-Viernes (Día 41-42)
- [ ] 📤 Import/Export de productos
  - Exportar CSV/Excel
  - Importar CSV con validación
  - Bulk operations
  - Progress indicators

**Entregable Semana 6:**
- 📦 Módulo de Productos completo
- ➕ CRUD funcionando
- 📤 Import/Export operativo

---

## 📋 SEMANA 7: Módulo de Órdenes

### Lunes-Martes (Día 43-45)
- [ ] 📋 Listado de órdenes
  - DataTable con estados
  - Filtros avanzados
  - Timeline de estados
  - Detalles de orden

### Miércoles-Jueves (Día 46-48)
- [ ] 🔄 Gestión de estados
  - Cambiar estado de orden
  - Validaciones de transiciones
  - Notificaciones automáticas
  - Audit log de cambios

### Viernes (Día 49)
- [ ] 📄 Generación de remitos
  - Template de remito en PDF
  - Datos de orden + productos
  - Logo del tenant
  - Descarga automática

**Entregable Semana 7:**
- 📋 Módulo de Órdenes completo
- 🔄 Estados gestionables
- 📄 Remitos generables

---

## 👥 SEMANA 8: Módulo de Clientes + Analytics

### Lunes-Martes (Día 50-52)
- [ ] 👥 Módulo de Clientes
  - Listado de clientes
  - Perfil de cliente
  - Historial de compras
  - Segmentación básica

### Miércoles-Jueves (Día 53-55)
- [ ] 📊 Módulo de Analytics
  - Métricas de ventas
  - Métricas de productos
  - Métricas de clientes
  - Filtros por fecha y territorio
  - Exportación de reportes

### Viernes (Día 56)
- [ ] ✅ Testing y demo Fase 2
  - Tests de componentes
  - Tests de flujos
  - Demo completo del Dashboard
  - Refinamientos

**Entregable Semana 8 (HITO 2):**
- ✅ Dashboard completo con 4 módulos core
- ✅ Analytics funcional
- ✅ Remitos generables
- 🎯 **HITO 2 ALCANZADO: Dashboard MVP Funcional**

---

# 🚚 FASE 3: FULFILLMENT REAL (4 Semanas)

## 🎯 Objetivo
Implementar operación real de fulfillment con integración a couriers y clientes.

## 📅 Duración: Semanas 9-12 (Abr 9 - May 6)

---

## 🔌 SEMANA 9: Integraciones Base

### Lunes-Martes (Día 57-59)
- [ ] 🛍️ Integración Mercado Libre
  - OAuth setup
  - API client
  - Sincronización de órdenes
  - Actualización de stock
  - Testing con cuenta sandbox

### Miércoles-Jueves (Día 60-62)
- [ ] 💳 Integración Mercado Pago
  - Webhooks
  - Verificación de pagos
  - Estado de transacciones
  - Notificaciones

### Viernes (Día 63)
- [ ] 🔧 API client robusto
  - Retry logic
  - Error handling
  - Rate limiting
  - Logging de requests

**Entregable Semana 9:**
- 🛍️ ML conectado y sincronizando
- 💳 MP procesando pagos
- 🔧 API client production-ready

---

## 📦 SEMANA 10: Sistema de Remitos y Coordinación

### Lunes-Martes (Día 64-66)
- [ ] 📄 Sistema de remitos avanzado
  - Templates por territorio
  - Campos personalizables
  - Numeración automática
  - Multi-idioma
  - Envío por email

### Miércoles-Jueves (Día 67-69)
- [ ] 📧 Sistema de notificaciones
  - Email con Resend
  - Templates profesionales
  - Notificaciones de estado
  - Confirmaciones automáticas

### Viernes (Día 70)
- [ ] 🔔 Notificaciones en tiempo real
  - Supabase Realtime
  - Toasts en Dashboard
  - Badge de notificaciones
  - Centro de notificaciones

**Entregable Semana 10:**
- 📄 Sistema de remitos completo
- 📧 Emails automáticos
- 🔔 Notificaciones real-time

---

## 🚚 SEMANA 11: Integración con Couriers

### Lunes-Martes (Día 71-73)
- [ ] 🚚 Integración Courier #1 (DAC/Andreani/Local)
  - API client
  - Generación de etiquetas
  - Solicitud de retiro
  - Tracking de envíos

### Miércoles-Jueves (Día 74-76)
- [ ] 📍 Sistema de tracking
  - Dashboard de envíos activos
  - Estados de tracking
  - Webhooks de courier
  - Notificaciones al cliente final

### Viernes (Día 77)
- [ ] 🔄 Flujo completo end-to-end
  - Orden → Remito → Courier → Entrega
  - Testing con orden real
  - Refinamientos

**Entregable Semana 11:**
- 🚚 Courier integrado
- 📍 Tracking funcionando
- 🔄 Flujo completo operativo

---

## 🎯 SEMANA 12: Primer Cliente Piloto

### Lunes-Martes (Día 78-80)
- [ ] 👤 Setup primer cliente piloto
  - Crear tenant
  - Configurar territorios
  - Importar productos
  - Capacitación

### Miércoles-Jueves (Día 81-83)
- [ ] 🚀 Ir a producción con piloto
  - Procesar primeras órdenes reales
  - Generar remitos reales
  - Coordinar couriers reales
  - Monitorear de cerca

### Viernes (Día 84)
- [ ] 📊 Review y refinamiento
  - Feedback del cliente
  - Ajustes necesarios
  - Documentar aprendizajes
  - Preparar para escalar

**Entregable Semana 12 (HITO 3):**
- ✅ Primer cliente operando en producción
- ✅ Órdenes reales procesadas
- ✅ Fulfillment funcionando
- 🎯 **HITO 3 ALCANZADO: Operación Real Validada**

---

# 🚀 FASE 4: ESCALA Y WHITE LABEL (4 Semanas)

## 🎯 Objetivo
Preparar la plataforma para múltiples clientes y white label.

## 📅 Duración: Semanas 13-16 (May 7 - Jun 3)

---

## 🏢 SEMANA 13: Multi-Tenant Avanzado

### Lunes-Martes (Día 85-87)
- [ ] 🎨 White Label base
  - Custom domains
  - Branding por tenant (logo, colores)
  - Email branding
  - PDF branding

### Miércoles-Jueves (Día 88-90)
- [ ] 🌐 Selector de territorios mejorado
  - UI/UX optimizado
  - Dashboards por territorio
  - Métricas comparativas
  - Reportes consolidados

### Viernes (Día 91)
- [ ] 👥 Gestión de usuarios avanzada
  - Invitar usuarios
  - Roles y permisos granulares
  - Restricción por territorio
  - Audit de acciones

**Entregable Semana 13:**
- 🎨 White Label funcional
- 🌐 Multi-territorio optimizado
- 👥 Gestión de usuarios completa

---

## ⚡ SEMANA 14: Performance y Optimización

### Lunes-Martes (Día 92-94)
- [ ] ⚡ Optimización de queries
  - Índices en BD
  - Query optimization
  - Paginación eficiente
  - Lazy loading

### Miércoles-Jueves (Día 95-97)
- [ ] 💨 Frontend performance
  - Code splitting
  - Bundle optimization
  - Image optimization
  - Caching strategy

### Viernes (Día 98)
- [ ] 📊 Monitoring y observabilidad
  - Sentry para errors
  - Web Vitals
  - Performance metrics
  - Alertas automáticas

**Entregable Semana 14:**
- ⚡ Performance optimizado
- 📊 Monitoring activo
- 🎯 Tiempo de carga < 2s

---

## 🧪 SEMANA 15: Testing Exhaustivo

### Lunes-Martes (Día 99-101)
- [ ] 🧪 Unit tests completos
  - Hooks
  - Utilities
  - Services
  - Coverage > 80%

### Miércoles-Jueves (Día 102-104)
- [ ] 🔗 Integration tests
  - Flujos completos
  - Auth flows
  - Order flows
  - Payment flows

### Viernes (Día 105)
- [ ] 🔒 Security audit
  - Penetration testing
  - OWASP Top 10 check
  - RLS verification
  - Vulnerability scan

**Entregable Semana 15:**
- 🧪 Test suite completo
- 🔒 Security audit pasado
- ✅ Production ready

---

## 📚 SEMANA 16: Documentación y Onboarding

### Lunes-Martes (Día 106-108)
- [ ] 📚 Documentación completa
  - User guide
  - Admin guide
  - API documentation
  - Video tutorials

### Miércoles-Jueves (Día 109-111)
- [ ] 🎓 Material de onboarding
  - Onboarding checklist
  - Training materials
  - FAQ
  - Support playbook

### Viernes (Día 112)
- [ ] 🎉 Launch preparation
  - Marketing materials
  - Demo environment
  - Sales deck
  - Pricing page

**Entregable Semana 16 (HITO 4):**
- ✅ Plataforma production-ready
- ✅ Documentación completa
- ✅ Material de ventas listo
- 🎯 **HITO 4 ALCANZADO: Listo para Escalar**

---

## 🎯 HITOS Y PUNTOS DE DECISIÓN

### 🎯 HITO 1: Fundamentos Sólidos (Semana 4)
**Criterio de éxito:**
- ✅ DB multi-tenant funcionando
- ✅ RLS implementado y testeado
- ✅ Dashboard base visible
- ✅ Sistema de módulos operativo

**Punto de decisión:**
- ¿La arquitectura multi-tenant funciona correctamente?
- ¿RLS está suficientemente seguro?
- ¿Sistema de módulos es flexible?

**Si NO:** Ajustar arquitectura antes de continuar

---

### 🎯 HITO 2: Dashboard MVP (Semana 8)
**Criterio de éxito:**
- ✅ 4 módulos core funcionando
- ✅ Analytics con gráficos
- ✅ CRUD de productos y órdenes
- ✅ Remitos generables

**Punto de decisión:**
- ¿Dashboard es usable?
- ¿Performance es aceptable?
- ¿Listo para mostrar a clientes potenciales?

**Si SÍ:** Buscar primer cliente piloto  
**Si NO:** Refinar hasta que sea presentable

---

### 🎯 HITO 3: Primer Cliente (Semana 12)
**Criterio de éxito:**
- ✅ Cliente procesando órdenes reales
- ✅ Remitos siendo enviados
- ✅ Couriers coordinados
- ✅ Cliente satisfecho

**Punto de decisión:** **EL MÁS CRÍTICO**
- ¿El fulfillment funciona en la práctica?
- ¿Cliente está feliz con el servicio?
- ¿Hay bugs críticos?
- ¿Modelo de negocio valida?

**Si SÍ:** Escalar a más clientes  
**Si NO:** Iterar hasta que funcione bien

---

### 🎯 HITO 4: Production Ready (Semana 16)
**Criterio de éxito:**
- ✅ Múltiples clientes soportados
- ✅ White label funcional
- ✅ Tests pasando
- ✅ Documentación completa

**Punto de decisión:**
- ¿Listo para marketing agresivo?
- ¿Puede soportar 10+ clientes?
- ¿Equipo listo para soporte?

**Si SÍ:** Go to market  
**Si NO:** Fortalecer antes de escalar

---

## 📊 MÉTRICAS DE ÉXITO POR FASE

### Fase 1: Fundamentos
```
✅ 0 vulnerabilidades de seguridad críticas
✅ 100% de tests de RLS pasando
✅ Tiempo de carga inicial < 3s
✅ 0 errores en consola
```

### Fase 2: Dashboard
```
✅ Tiempo de carga de páginas < 2s
✅ 80%+ coverage en tests
✅ 0 errores en flujos principales
✅ Dashboard usable sin training
```

### Fase 3: Fulfillment
```
✅ 95%+ de órdenes procesadas exitosamente
✅ Tiempo de generación de remito < 5s
✅ 0 órdenes perdidas
✅ Cliente satisfecho (NPS > 8)
```

### Fase 4: Scale
```
✅ Soporta 10+ tenants simultáneos
✅ 99.9% uptime
✅ Performance < 2s en todas las páginas
✅ Onboarding nuevo cliente < 2 horas
```

---

## 🚨 RIESGOS Y MITIGACIONES

### Riesgo 1: Complejidad Multi-Tenant
**Probabilidad:** Media  
**Impacto:** Alto

**Mitigación:**
- Testing exhaustivo de RLS desde semana 2
- Code reviews de seguridad
- Penetration testing en semana 15

---

### Riesgo 2: Integraciones de Couriers Fallan
**Probabilidad:** Alta  
**Impacto:** Crítico

**Mitigación:**
- Empezar integración temprano (semana 11)
- Tener plan B (proceso manual)
- Buffer de 2 semanas antes de primer cliente

---

### Riesgo 3: Primer Cliente no Funciona
**Probabilidad:** Media  
**Impacto:** Alto

**Mitigación:**
- Elegir cliente piloto comprensivo
- Dar soporte intenso
- Iterar rápido basado en feedback
- No cobrar hasta que funcione bien

---

### Riesgo 4: Performance con Múltiples Clientes
**Probabilidad:** Media  
**Impacto:** Alto

**Mitigación:**
- Load testing en semana 14
- Optimización proactiva
- Monitoring desde día 1
- Plan de escalado con Vercel/Supabase

---

## 📅 CALENDARIO DE REVISIONES

### Weekly Review (Todos los Viernes)
- ¿Qué se completó esta semana?
- ¿Qué está bloqueado?
- ¿Hay que ajustar el plan?
- Demo de lo construido

### Monthly Review (Último Viernes del Mes)
- Review de hitos alcanzados
- Ajuste de roadmap si necesario
- Planificación del próximo mes
- Decisiones estratégicas

### Milestone Review (Al alcanzar cada hito)
- Demo completo
- Validación de criterios de éxito
- Go/No-Go para siguiente fase
- Documentación de aprendizajes

---

## 🎯 SIGUIENTE PASO INMEDIATO

### ¿Dónde estamos hoy?

```
✅ COMPLETADO:
- Análisis y estrategia
- Documentación de arquitectura
- Definición de pricing
- Plan de roadmap

🔄 PRÓXIMO:
Semana 1, Día 3-4: Revisar Dashboard del ZIP original
```

### Acción Concreta para Mañana

1. **Revisar ODDY_Market.zip**
   - Extraer el Dashboard completo
   - Listar todos los módulos
   - Identificar componentes reutilizables
   - Documentar en `ANALISIS_DASHBOARD_ORIGINAL.md`

2. **Diseñar Schema SQL Final**
   - Basado en análisis del Dashboard
   - Agregar tablas necesarias para fulfillment
   - Documentar en `supabase/migrations/001_initial_schema.sql`

---

## ✅ RESUMEN EJECUTIVO

### Timeline
```
Mes 1: Fundamentos (Backend + Auth + Layout)
Mes 2: Dashboard (UI + Módulos Core + Analytics)
Mes 3: Fulfillment (Integraciones + Cliente Piloto)
Mes 4: Scale (White Label + Optimización + Docs)
```

### Inversión de Tiempo
```
Total: ~450 horas (3-4 meses)
Por semana: 25-35 horas
Por día: 5-7 horas
```

### Hitos Críticos
```
🎯 Semana 4:  Arquitectura sólida
🎯 Semana 8:  Dashboard presentable
🎯 Semana 12: Primer cliente operando ⭐ MÁS IMPORTANTE
🎯 Semana 16: Production ready
```

### Resultado Final
```
✅ Plataforma SaaS multi-tenant
✅ Fulfillment as a Service funcionando
✅ Primer cliente feliz y pagando
✅ Base para escalar a 10+ clientes
✅ Documentación completa
✅ Team listo para vender
```

---

## 💬 ¿CÓMO LO LLEVAMOS JUNTOS?

### Propuesta de Trabajo

1. **Daily Standups (Opcional)**
   - Check-in de 5-10 min
   - ¿Qué hiciste ayer?
   - ¿Qué harás hoy?
   - ¿Hay bloqueadores?

2. **Weekly Reviews (Viernes)**
   - Demo de lo construido
   - Review del plan
   - Ajustes para próxima semana

3. **Milestone Reviews (Cada 4 semanas)**
   - Demo completo
   - Go/No-Go decision
   - Planificación siguiente fase

### Herramientas

- **Roadmap:** Este documento (actualizar semanalmente)
- **Tareas:** GitHub Issues o Trello
- **Código:** GitHub
- **Comunicación:** Como prefieran (Slack, Discord, etc.)
- **Demos:** Vercel preview deployments

---

## 🚀 ¿EMPEZAMOS?

**Próximo paso concreto:**

📋 **Semana 1, Día 3-4: Analizar Dashboard Original**

¿Quieres que:
1. Empiece a revisar el Dashboard del ODDY_Market.zip?
2. Diseñe el schema SQL completo?
3. Ajustemos algo del roadmap primero?

**¿Qué prefieres hacer ahora?** 🎯
