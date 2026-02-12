# 🚀 PLAN DE EXPANSIÓN COMPLETA - ODDY Market

**Fecha**: 12 de Febrero, 2026  
**Propósito**: Expandir el ecosistema completo ODDY → Charlie Market Place  
**Estrategia**: No mirar atrás, avanzar con lo que tenemos

---

## 🎯 VISIÓN GENERAL

### Lo Que Tenemos:

```
✅ Backend COMPLETO (37 Edge Functions con Hono)
✅ Frontend BASE (React + Vite + Tailwind v4)
✅ Dashboard PROFESIONAL (AdminDashboard.tsx)
✅ Sistema de Artículos DEFINIDO (3 niveles + variantes)
✅ Integraciones de Pago (5: MP, ML, PayPal, Stripe, Plexo)
✅ Facturación DGI Uruguay (Fixed)
✅ UI Components (48 de shadcn/ui)
```

### Lo Que Vamos a Expandir:

```
1. 🖥️ BACKEND (37 módulos) → Completar funcionalidad
2. 🎨 FRONTEND & DASHBOARD → Conectar con backend
3. 📦 FULFILLMENT & LOGÍSTICA → Nuevo sistema completo
4. 🌍 MULTI-TERRITORIO → Preparar para Charlie MP
5. 🔐 MULTI-ENTITY → Sistema multi-tenant
```

---

## 📊 INVENTARIO COMPLETO DEL BACKEND

### 37 Edge Functions Existentes:

#### **CORE (Fundamentos)**
```
1. ✅ products.tsx         - Gestión de artículos (KV Store)
2. ✅ orders.tsx           - Gestión de pedidos
3. ✅ customers-basic.tsx  - Gestión de clientes
4. ✅ inventory-basic.tsx  - Control de inventario
5. ✅ categories.tsx       - Categorías de productos
6. ✅ cart.tsx             - Carrito de compras
7. ✅ auth.tsx             - Autenticación
8. ✅ users.tsx            - Gestión de usuarios
```

#### **INTEGRACIONES (Canales de Venta)**
```
9.  ✅ integrations.tsx    - Hub principal de integraciones
10. ✅ billing.tsx         - Facturación (Fixed DGI Uruguay)
11. ✅ shipping.tsx        - Envíos y logística
12. ✅ secondhand.tsx      - Marketplace second hand
```

#### **MARKETING Y VENTAS**
```
13. ✅ mailing.tsx         - Email marketing
14. ✅ marketing.tsx       - Campañas de marketing
15. ✅ social.tsx          - Redes sociales
16. ✅ automation.tsx      - Automatizaciones
17. ✅ wheel.tsx           - Ruleta promocional
```

#### **GESTIÓN (ERP/CRM)**
```
18. ✅ erp.tsx             - Sistema ERP
19. ✅ crm.tsx             - CRM
20. ✅ departments.tsx     - Departamentos
21. ✅ entities.tsx        - Multi-entidad
22. ✅ provider.tsx        - Proveedores
```

#### **CONTENIDO Y MEDIA**
```
23. ✅ images.tsx          - Gestión de imágenes
24. ✅ media.tsx           - Media general
25. ✅ documents.tsx       - Documentos
26. ✅ verification.tsx    - Verificación de contenido
```

#### **ANALYTICS Y DATOS**
```
27. ✅ analytics.tsx       - Analytics
28. ✅ dashboard.tsx       - Dashboard data
29. ✅ audit.tsx           - Auditoría de acciones
```

#### **IA Y HERRAMIENTAS**
```
30. ✅ ai.tsx              - Herramientas AI
```

#### **SEGURIDAD Y CONFIG**
```
31. ✅ api-keys.tsx        - Gestión de API keys
```

#### **ADICIONALES (sin confirmar en lista)**
```
32-37. Posibles módulos adicionales por identificar
```

---

## 🏗️ PLAN DE EXPANSIÓN POR ÁREA

---

## 1️⃣ BACKEND - COMPLETAR LOS 37 MÓDULOS

### Estrategia:

```
Para cada módulo:
1. Revisar código existente en ZIP
2. Identificar funcionalidad implementada
3. Identificar funcionalidad faltante
4. Expandir según necesidades de Artículos
5. Documentar APIs
6. Testing
```

### Prioridad por Módulo:

#### **FASE 1: Core Crítico (Semanas 1-2)**

```
1. products.tsx → AMPLIAR
   Actual: CRUD básico en KV Store
   Expandir: 
     ✅ Sistema de 3 niveles (Básica, Intermedia, Avanzada)
     ✅ Variantes completas
     ✅ Trazabilidad (lote, fechas, vencimiento)
     ✅ Búsqueda exhaustiva
     ✅ Validación de completitud por canal
     ✅ Importación desde ML
   
   APIs nuevas:
     POST   /articulos/import/ml
     GET    /articulos/search/exhaustive
     GET    /articulos/:id/completitud/:canal
     POST   /articulos/:id/variantes
     GET    /articulos/:id/variantes
     PUT    /articulos/:id/variantes/:vid
     DELETE /articulos/:id/variantes/:vid

2. inventory-basic.tsx → AMPLIAR
   Actual: Control básico
   Expandir:
     ✅ Stock por variante
     ✅ Alertas de stock mínimo
     ✅ Alertas de vencimiento (15, 30, 60 días)
     ✅ FIFO/FEFO automático
     ✅ Movimientos de stock (entrada/salida)
     ✅ Ajustes de inventario
     ✅ Inventario físico vs sistema
   
   APIs nuevas:
     GET    /inventario/alertas/stock-bajo
     GET    /inventario/alertas/vencimiento
     POST   /inventario/movimientos
     POST   /inventario/ajustes
     GET    /inventario/reporte/fifo

3. orders.tsx → AMPLIAR
   Actual: CRUD básico
   Expandir:
     ✅ Estados de pedido (pendiente, confirmado, enviado, entregado)
     ✅ Integración con variantes
     ✅ Integración con fulfillment
     ✅ Tracking de envío
     ✅ Facturación automática
     ✅ Webhooks de cambio de estado
   
   APIs nuevas:
     PUT    /pedidos/:id/estado
     GET    /pedidos/:id/tracking
     POST   /pedidos/:id/facturar
     GET    /pedidos/reporte/ventas

4. integrations.tsx → AMPLIAR
   Actual: Sync básico ML, FB, etc.
   Expandir:
     ✅ Sync ML con variantes
     ✅ Validación de completitud antes de sync
     ✅ Sync bidireccional (ML ↔ ODDY)
     ✅ Webhooks de ML (cambio stock, precio)
     ✅ Sync Facebook Marketplace
     ✅ Sync Instagram Shopping
     ✅ Gestión de credenciales por canal
   
   APIs nuevas:
     POST   /integraciones/ml/sync-con-variantes
     POST   /integraciones/ml/importar
     POST   /integraciones/fb/sync
     POST   /integraciones/ig/sync
     POST   /integraciones/:canal/webhook

5. categories.tsx → AMPLIAR
   Actual: CRUD básico
   Expandir:
     ✅ Categorías jerárquicas (padre/hijo)
     ✅ Atributos por categoría
     ✅ Mapeo a categorías ML/FB/IG
     ✅ SEO por categoría
   
   APIs nuevas:
     GET    /categorias/arbol
     GET    /categorias/:id/atributos
     POST   /categorias/:id/mapeo/:canal
```

#### **FASE 2: Fulfillment & Logística (Semanas 3-4)**

```
6. shipping.tsx → AMPLIAR (CRÍTICO para Fulfillment)
   Actual: Integración básica
   Expandir:
     ✅ Integración con couriers (UES, DAC, FedEx, DHL)
     ✅ Generación de waybills (guías de remisión)
     ✅ Cálculo de tarifas en tiempo real
     ✅ Tracking en tiempo real
     ✅ Coordinación con almacenes del cliente
     ✅ Gestión de picking y packing
     ✅ Etiquetas de envío
     ✅ Notificaciones al cliente
   
   APIs nuevas:
     POST   /envios/calcular-tarifa
     POST   /envios/crear-waybill
     GET    /envios/:id/tracking
     POST   /envios/:id/picking
     POST   /envios/:id/packing
     GET    /envios/etiqueta/:id
     POST   /envios/:id/notificar

7. provider.tsx → NUEVO MÓDULO FULFILLMENT
   Actual: Gestión básica proveedores
   Expandir:
     ✅ Almacenes del cliente (ubicaciones)
     ✅ Coordinación de picking
     ✅ Gestión de inventory en almacenes
     ✅ Agenda de retiros
     ✅ Confirmación de disponibilidad
     ✅ Documentación de retiro
   
   APIs nuevas:
     GET    /proveedores/:id/almacenes
     POST   /proveedores/:id/agenda-retiro
     POST   /proveedores/:id/confirmar-disponibilidad
     GET    /proveedores/:id/inventario-disponible

8. NUEVO: fulfillment.tsx
   Crear nuevo módulo:
     ✅ Dashboard de fulfillment
     ✅ Cola de pedidos pendientes
     ✅ Asignación a couriers
     ✅ Gestión de rutas
     ✅ Tracking end-to-end
     ✅ Reportes de performance
     ✅ Costos y facturación de fulfillment
   
   APIs:
     GET    /fulfillment/cola
     POST   /fulfillment/asignar-courier
     GET    /fulfillment/rutas
     GET    /fulfillment/tracking/:pedido_id
     GET    /fulfillment/reportes/performance
     POST   /fulfillment/facturar
```

#### **FASE 3: CRM, Marketing & Sales (Semanas 5-6)**

```
9. customers-basic.tsx → AMPLIAR
   Expandir:
     ✅ Segmentación de clientes
     ✅ Historial de compras
     ✅ Puntos de fidelidad
     ✅ Preferencias y favoritos
     ✅ Direcciones múltiples
     ✅ Métodos de pago guardados
   
10. crm.tsx → AMPLIAR
    Expandir:
      ✅ Pipeline de ventas
      ✅ Lead management
      ✅ Oportunidades
      ✅ Contacto y seguimiento
      ✅ Tareas y recordatorios

11. mailing.tsx → AMPLIAR
    Expandir:
      ✅ Templates personalizados
      ✅ Campañas segmentadas
      ✅ Automatizaciones (carritos abandonados, etc.)
      ✅ A/B testing
      ✅ Analytics de emails

12. marketing.tsx → AMPLIAR
    Expandir:
      ✅ Campañas multi-canal
      ✅ Cupones y descuentos
      ✅ Códigos promocionales
      ✅ Afiliados
      ✅ Referidos

13. social.tsx → AMPLIAR
    Expandir:
      ✅ Publicación automática
      ✅ Calendario de contenido
      ✅ Gestión de comentarios
      ✅ Mensajería integrada (WhatsApp Business)
      ✅ Analytics de redes

14. automation.tsx → AMPLIAR
    Expandir:
      ✅ Workflows personalizados
      ✅ Triggers y acciones
      ✅ Condiciones lógicas
      ✅ Integraciones con otros módulos
```

#### **FASE 4: ERP & Analytics (Semanas 7-8)**

```
15. erp.tsx → AMPLIAR
    Expandir:
      ✅ Compras y proveedores
      ✅ Órdenes de compra
      ✅ Recepción de mercadería
      ✅ Cuentas por pagar
      ✅ Cuentas por cobrar
      ✅ Contabilidad básica

16. billing.tsx → AMPLIAR
    Actual: Facturación DGI Uruguay (Fixed)
    Expandir:
      ✅ Multi-país (Argentina, Brasil, etc.)
      ✅ Diferentes sistemas (AFIP, SEFAZ, etc.)
      ✅ Notas de crédito
      ✅ Notas de débito
      ✅ Reportes fiscales

17. analytics.tsx → AMPLIAR
    Expandir:
      ✅ Dashboard ejecutivo
      ✅ Ventas por canal
      ✅ Ventas por producto
      ✅ Ventas por cliente
      ✅ Análisis de márgenes
      ✅ Predicciones (IA)
      ✅ Comparativas período anterior

18. dashboard.tsx → AMPLIAR
    Expandir:
      ✅ Widgets personalizables
      ✅ KPIs en tiempo real
      ✅ Alertas y notificaciones
      ✅ Accesos rápidos
```

#### **FASE 5: Multi-Entity & Territorio (Semanas 9-10)**

```
19. entities.tsx → AMPLIAR (CRÍTICO para Charlie MP)
    Actual: Gestión básica
    Expandir:
      ✅ Multi-tenant completo
      ✅ Tenants (clientes de Charlie MP)
      ✅ Configuración por tenant
      ✅ Branding por tenant
      ✅ Dominio custom por tenant
      ✅ Base de datos por tenant (schema separation)
      ✅ Row Level Security (RLS)
      ✅ Facturación por tenant

20. NUEVO: territories.tsx
    Crear nuevo módulo:
      ✅ Países disponibles
      ✅ Monedas por país
      ✅ Idiomas por país
      ✅ Integraciones locales (ML Argentina, ML Uruguay, etc.)
      ✅ Sistemas de facturación locales
      ✅ Couriers locales
      ✅ Métodos de pago locales

21. NUEVO: white-label.tsx
    Crear nuevo módulo:
      ✅ Configuración de branding
      ✅ Logos, colores, fonts
      ✅ Dominios personalizados
      ✅ Emails personalizados
      ✅ Templates personalizados
```

#### **FASE 6: IA, Media & Herramientas (Semanas 11-12)**

```
22. ai.tsx → AMPLIAR
    Expandir:
      ✅ Editor de imágenes con IA
      ✅ Generación de descripciones
      ✅ Generación de títulos SEO
      ✅ Predicciones de precio
      ✅ Recomendaciones de productos
      ✅ Chatbot

23. images.tsx / media.tsx → AMPLIAR
    Expandir:
      ✅ Optimización automática
      ✅ Conversión de formatos
      ✅ CDN integration
      ✅ Watermarks
      ✅ Galerías

24. documents.tsx → AMPLIAR
    Expandir:
      ✅ Generación de documentos
      ✅ Facturas, remitos, presupuestos
      ✅ Contratos
      ✅ Reportes PDF
      ✅ QR codes

25. verification.tsx → AMPLIAR
    Expandir:
      ✅ Verificación de identidad
      ✅ KYC (Know Your Customer)
      ✅ Verificación de teléfono
      ✅ Verificación de email
      ✅ 2FA
```

#### **FASE 7: Seguridad & Auditoría (Semana 13)**

```
26. audit.tsx → AMPLIAR
    Expandir:
      ✅ Log de todas las acciones
      ✅ Cambios en productos
      ✅ Cambios en pedidos
      ✅ Accesos al sistema
      ✅ Exportar logs
      ✅ Búsqueda de logs

27. api-keys.tsx → AMPLIAR
    Expandir:
      ✅ Gestión de API keys por tenant
      ✅ Scopes y permisos
      ✅ Rate limiting
      ✅ Webhooks
      ✅ Documentación automática (OpenAPI)
```

---

## 2️⃣ FRONTEND & DASHBOARD - CONECTAR TODO

### Dashboard Existente:

```
Archivo: src/app/components/AdminDashboard.tsx
Estado: COMPLETO pero sin backend conectado
```

### Módulos del Dashboard a Conectar:

#### **1. Dashboard Principal**
```jsx
Widgets a implementar:
  ✅ Ventas del día/semana/mes
  ✅ Pedidos pendientes
  ✅ Stock bajo
  ✅ Productos por vencer
  ✅ Alertas del sistema
  ✅ Gráficos de ventas (Recharts)
  ✅ Top productos
  ✅ Top clientes
```

#### **2. Módulo Artículos**
```jsx
Componentes a crear:
  ✅ ArticulosList (tabla con búsqueda exhaustiva)
  ✅ ArticuloForm (3 niveles colapsables)
  ✅ VariantesConfigurator
  ✅ TrazabilidadFields
  ✅ ChannelSyncPanel
  ✅ ImportFromMLModal
  ✅ CompletitudIndicators
```

#### **3. Módulo Pedidos**
```jsx
Componentes a crear:
  ✅ PedidosList
  ✅ PedidoDetail
  ✅ EstadoPedidoStepper
  ✅ TrackingEnvio
  ✅ FacturacionPanel
```

#### **4. Módulo Clientes (CRM)**
```jsx
Componentes a crear:
  ✅ ClientesList
  ✅ ClienteDetail
  ✅ HistorialCompras
  ✅ Segmentacion
  ✅ FidelidadPanel
```

#### **5. Módulo Inventario**
```jsx
Componentes a crear:
  ✅ InventarioList
  ✅ AlertasStockBajo
  ✅ AlertasVencimiento
  ✅ MovimientosStock
  ✅ AjustesInventario
  ✅ ReporteFIFO
```

#### **6. Módulo Fulfillment** (NUEVO)
```jsx
Componentes a crear:
  ✅ FulfillmentDashboard
  ✅ ColaPedidosPendientes
  ✅ AsignarCourierModal
  ✅ RutasPanel
  ✅ TrackingEndToEnd
  ✅ PerformanceReports
  ✅ CostosYFacturacion
```

#### **7. Módulo Integraciones**
```jsx
Componentes existentes a mejorar:
  ✅ PaymentIntegrations (existente)
  ✅ BillingManagement (existente)
  
Componentes a crear:
  ✅ IntegracionesList
  ✅ ConfigMLPanel
  ✅ ConfigFBPanel
  ✅ ConfigIGPanel
  ✅ ConfigWhatsAppBusiness
  ✅ WebhooksPanel
```

#### **8. Módulo Marketing**
```jsx
Componentes a crear:
  ✅ CampañasList
  ✅ CampañaForm
  ✅ EmailTemplates
  ✅ AutomatizacionesBuilder
  ✅ CuponesYDescuentos
  ✅ RuletaPromoConfig
```

#### **9. Módulo Analytics**
```jsx
Componentes a crear:
  ✅ DashboardEjecutivo
  ✅ VentasPorCanal (gráfico)
  ✅ VentasPorProducto (gráfico)
  ✅ VentasPorCliente (gráfico)
  ✅ AnalisisMargenesChart
  ✅ PrediccionesIA
```

#### **10. Módulo Multi-Entity (Super Admin)** (NUEVO para Charlie MP)
```jsx
Componentes a crear:
  ✅ TenantsList
  ✅ TenantForm
  ✅ TenantConfig
  ✅ BrandingEditor
  ✅ DominioCustomConfig
  ✅ FacturacionTenant
  ✅ MetricasGlobales
```

#### **11. Módulo Multi-Territorio** (NUEVO para Charlie MP)
```jsx
Componentes a crear:
  ✅ TerritoriosList
  ✅ TerritorioConfig
  ✅ MonedaYIdioma
  ✅ IntegracionesLocales
  ✅ FacturacionLocal
  ✅ CouriersLocales
```

---

## 3️⃣ FULFILLMENT & LOGÍSTICA - SISTEMA COMPLETO

### Arquitectura del Sistema de Fulfillment:

```
┌─────────────────────────────────────────────────────┐
│           CLIENTE CHARLIE MP (Tenant)               │
│                                                     │
│  Productos → Pedido → CHARLIE FULFILLMENT          │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│        CHARLIE FULFILLMENT (Operación)              │
│                                                     │
│  1. Recibe Pedido                                   │
│  2. Coordina con Almacén del Cliente                │
│  3. Genera Waybill (Guía de Remisión)              │
│  4. Asigna Courier                                  │
│  5. Gestiona Picking & Packing                      │
│  6. Tracking End-to-End                             │
│  7. Notificaciones al Cliente Final                 │
│  8. Factura a Charlie MP Client                     │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              ALMACÉN DEL CLIENTE                    │
│                                                     │
│  • Recibe solicitud de picking                      │
│  • Prepara pedido                                   │
│  • Confirma disponibilidad                          │
│  • Entrega a Courier                                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│                 COURIERS                            │
│                                                     │
│  UES, DAC, FedEx, DHL, etc.                        │
│  • Retira del almacén                               │
│  • Tracking en tiempo real                          │
│  • Entrega al cliente final                         │
└─────────────────────────────────────────────────────┘
```

### Módulos del Sistema Fulfillment:

#### **1. Gestión de Pedidos Fulfillment**
```
Funcionalidad:
  ✅ Cola de pedidos pendientes
  ✅ Asignación automática/manual a courier
  ✅ Priorización de pedidos
  ✅ Batch de pedidos (múltiples pedidos en una ruta)
  ✅ Cancelación de pedidos
  ✅ Devoluciones
```

#### **2. Coordinación con Almacenes**
```
Funcionalidad:
  ✅ Registro de almacenes del cliente
  ✅ Inventario disponible por almacén
  ✅ Solicitud de picking (automática o manual)
  ✅ Confirmación de disponibilidad
  ✅ Agenda de retiros (horarios, días)
  ✅ Documentación de retiro (remitos internos)
```

#### **3. Generación de Waybills**
```
Funcionalidad:
  ✅ Integración con APIs de couriers
  ✅ Generación automática de guías
  ✅ Impresión de etiquetas
  ✅ QR/Barcode para tracking
  ✅ Documentación aduanera (si aplica)
```

#### **4. Gestión de Couriers**
```
Funcionalidad:
  ✅ Registro de couriers
  ✅ Tarifas por zona
  ✅ Cálculo automático de tarifa
  ✅ Asignación de pedidos
  ✅ Tracking en tiempo real
  ✅ Gestión de reclamos
  ✅ Performance de couriers
```

#### **5. Tracking End-to-End**
```
Funcionalidad:
  ✅ Estados del pedido:
      - Pendiente
      - Coordinando retiro
      - En almacén (picking)
      - Listo para retirar
      - Retirado por courier
      - En tránsito
      - En reparto
      - Entregado
      - Devuelto
  
  ✅ Notificaciones automáticas en cada cambio
  ✅ Link de tracking para cliente final
  ✅ Historial completo
```

#### **6. Picking & Packing**
```
Funcionalidad:
  ✅ Lista de picking generada automáticamente
  ✅ App móvil para personal de almacén
  ✅ Escaneo de productos (barcode/QR)
  ✅ Verificación de cantidades
  ✅ Packing list
  ✅ Etiquetado de paquetes
  ✅ Fotografías de evidencia
```

#### **7. Notificaciones al Cliente Final**
```
Funcionalidad:
  ✅ Email automáticos
  ✅ SMS (opcional)
  ✅ WhatsApp (opcional)
  ✅ Notificaciones push (app móvil)
  
  Momentos:
    - Pedido confirmado
    - Pedido en preparación
    - Pedido listo para envío
    - Pedido en camino
    - Pedido entregado
    - Encuesta de satisfacción
```

#### **8. Facturación de Fulfillment**
```
Funcionalidad:
  ✅ Costos por pedido:
      - Setup fee (opcional)
      - Fee por transacción
      - Costo de courier (pass-through o markup)
      - Servicios adicionales (fotos, empaque especial, etc.)
  
  ✅ Facturación mensual a tenant
  ✅ Reportes de costos
  ✅ Descuentos por volumen
```

#### **9. Reportes y Analytics**
```
Funcionalidad:
  ✅ Dashboard de fulfillment
  ✅ Tiempo promedio de procesamiento
  ✅ Tasa de éxito de entregas
  ✅ Tasa de devoluciones
  ✅ Performance por courier
  ✅ Costos por pedido
  ✅ Rentabilidad
```

---

## 4️⃣ MULTI-TERRITORIO (Charlie Market Place)

### Conceptos Clave:

```
1 BACKEND CHARLIE MP
    ├─ Tenant 1: Uruguay (UYU, Español)
    │   ├─ ML Uruguay
    │   ├─ DGI Uruguay (Fixed)
    │   ├─ Couriers Uruguay (UES, DAC)
    │   └─ Mercado Pago Uruguay
    │
    ├─ Tenant 2: Argentina (ARS, Español)
    │   ├─ ML Argentina
    │   ├─ AFIP Argentina
    │   ├─ Couriers Argentina (Andreani, OCA)
    │   └─ Mercado Pago Argentina
    │
    └─ Tenant 3: Brasil (BRL, Português)
        ├─ ML Brasil
        ├─ SEFAZ Brasil
        ├─ Couriers Brasil (Correios, Loggi)
        └─ Mercado Pago Brasil
```

### Implementación:

#### **1. Base de Datos Multi-Tenant**
```sql
-- Tabla principal de tenants
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  dominio_custom VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  plan VARCHAR(50), -- 'starter', 'growth', 'enterprise'
  territorio_principal VARCHAR(3), -- 'URY', 'ARG', 'BRA'
  moneda_principal VARCHAR(3), -- 'UYU', 'ARS', 'BRL'
  idioma_principal VARCHAR(2), -- 'es', 'pt'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de territorios de cada tenant
CREATE TABLE tenant_territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  pais VARCHAR(3) NOT NULL, -- 'URY', 'ARG', 'BRA'
  moneda VARCHAR(3) NOT NULL,
  idioma VARCHAR(2) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  configuracion JSONB, -- Configuración específica del territorio
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS) en todas las tablas
-- Ejemplo para products:
CREATE POLICY products_tenant_isolation ON products
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

#### **2. Sistema de Branding (White Label)**
```sql
CREATE TABLE tenant_branding (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
  logo_url TEXT,
  logo_small_url TEXT,
  favicon_url TEXT,
  color_primary VARCHAR(7), -- #FF6B35
  color_secondary VARCHAR(7),
  color_accent VARCHAR(7),
  font_primary VARCHAR(100),
  font_secondary VARCHAR(100),
  email_from_name VARCHAR(255),
  email_from_address VARCHAR(255),
  footer_text TEXT,
  terminos_url TEXT,
  privacidad_url TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **3. Integraciones por Territorio**
```sql
CREATE TABLE tenant_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  territorio VARCHAR(3), -- 'URY', 'ARG', 'BRA'
  tipo VARCHAR(50), -- 'ml', 'fb', 'ig', 'whatsapp', 'facturacion', 'courier'
  proveedor VARCHAR(100), -- 'mercadolibre_uy', 'afip', 'andreani'
  credenciales JSONB ENCRYPTED, -- Credenciales encriptadas
  activo BOOLEAN DEFAULT TRUE,
  configuracion JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **4. Precios Multi-Moneda**
```sql
-- Agregar columna a products
ALTER TABLE products 
  ADD COLUMN precios JSONB;

-- Estructura de precios:
{
  "UYU": 1290,
  "ARS": 5000,
  "BRL": 70,
  "USD": 35
}

-- Función para obtener precio en moneda específica
CREATE FUNCTION obtener_precio(product_id UUID, moneda VARCHAR(3))
RETURNS DECIMAL AS $$
  SELECT (precios->>moneda)::DECIMAL 
  FROM products 
  WHERE id = product_id;
$$ LANGUAGE SQL;
```

---

## 5️⃣ MULTI-ENTITY (Sistema Multi-Tenant)

### Arquitectura:

```
NIVEL 1: SUPER ADMIN (Charlie MP)
  ├─ Gestiona todos los tenants
  ├─ Facturación global
  ├─ Métricas agregadas
  └─ Configuración global

NIVEL 2: TENANT ADMIN (Cliente de Charlie MP)
  ├─ Gestiona su instancia
  ├─ Configuración de territorios
  ├─ Gestión de usuarios
  ├─ Branding
  └─ Integraciones

NIVEL 3: USUARIOS DEL TENANT
  ├─ Acceso según rol
  ├─ Dashboard específico
  └─ Funcionalidad limitada según plan
```

### RBAC (Role-Based Access Control):

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  permisos JSONB, -- Array de permisos
  created_at TIMESTAMP DEFAULT NOW()
);

-- Roles por defecto:
-- Super Admin (Charlie MP)
-- Tenant Admin
-- Gerente
-- Vendedor
-- Almacén
-- Solo Lectura

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  role_id UUID REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, tenant_id)
);

-- Permisos granulares:
{
  "productos": ["crear", "leer", "editar", "eliminar"],
  "pedidos": ["leer", "editar_estado"],
  "clientes": ["leer", "editar"],
  "inventario": ["leer", "ajustar"],
  "configuracion": [],
  "analytics": ["leer"],
  "fulfillment": ["leer", "asignar_courier"]
}
```

---

## 📊 ESTIMACIÓN DE TIEMPO TOTAL

### Desglose por Fase:

```
BACKEND (37 Módulos):
  Fase 1: Core Crítico             4 semanas
  Fase 2: Fulfillment & Logística  4 semanas
  Fase 3: CRM, Marketing & Sales   3 semanas
  Fase 4: ERP & Analytics          3 semanas
  Fase 5: Multi-Entity & Territorio 3 semanas
  Fase 6: IA, Media & Herramientas 2 semanas
  Fase 7: Seguridad & Auditoría    1 semana
  SUBTOTAL BACKEND:                20 semanas

FRONTEND & DASHBOARD:
  Conectar módulos existentes      4 semanas
  Nuevos módulos (Fulfillment, etc.) 4 semanas
  Multi-Entity Dashboard           2 semanas
  SUBTOTAL FRONTEND:               10 semanas

TESTING & QA:
  Testing por módulo               4 semanas
  Testing de integración           2 semanas
  Testing de carga                 1 semana
  SUBTOTAL TESTING:                7 semanas

DEPLOY & INFRAESTRUCTURA:
  Setup multi-tenant               2 semanas
  Setup multi-territorio           2 semanas
  Optimizaciones                   2 semanas
  SUBTOTAL DEPLOY:                 6 semanas

────────────────────────────────────────────
TOTAL:                             43 semanas
                                   (~10 meses)
```

### Timeline con Paralelización:

```
Asumiendo equipo de 3 devs:
- 1 Backend
- 1 Frontend
- 1 Full-Stack (Fulfillment + Multi-Tenant)

Trabajo en paralelo:
TOTAL: 20-24 semanas (5-6 meses)
```

---

## 🎯 ESTRATEGIA DE EJECUCIÓN

### Opción A: Módulo por Módulo (Secuencial)

```
Ventajas:
  ✅ Completar 100% cada módulo antes de siguiente
  ✅ Menos bugs
  ✅ Documentación completa por módulo

Desventajas:
  ❌ Más lento (43 semanas)
  ❌ No valida product-market fit rápido

Timeline: 10 meses
```

### Opción B: MVP de Todos + Completar (Híbrido) ⭐ RECOMENDADO

```
FASE 1: MVP de TODOS los módulos (8 semanas)
  ✅ Artículos (MVP con variantes básicas)
  ✅ Pedidos (CRUD + estados básicos)
  ✅ Clientes (CRUD básico)
  ✅ Inventario (control básico)
  ✅ Fulfillment (funcional básico)
  ✅ Integraciones (ML básico)
  ✅ Dashboard (conectado a todos)
  ✅ Multi-Tenant (RLS + básico)
  
  Resultado: ODDY funcionando END-TO-END

FASE 2: Completar Críticos (8 semanas)
  ✅ Artículos completo (3 niveles + variantes completas)
  ✅ Fulfillment completo (waybills + couriers)
  ✅ Sync ML avanzado (bidireccional + variantes)
  ✅ Multi-Territorio (UY, AR, BR)

FASE 3: Completar Avanzados (8 semanas)
  ✅ CRM completo
  ✅ Marketing completo
  ✅ Analytics avanzado
  ✅ IA tools

FASE 4: Testing & Deploy (4 semanas)
  ✅ Testing exhaustivo
  ✅ Optimizaciones
  ✅ Deploy producción

Timeline: 28 semanas (7 meses)

Ventajas:
  ✅ Valida rápido (8 semanas)
  ✅ Feedback temprano
  ✅ MVP funcionando pronto
  ✅ Generación de revenue early
```

### Opción C: Solo Críticos Primero (Ágil)

```
FASE 1: Solo lo CRÍTICO (12 semanas)
  ✅ Artículos completo
  ✅ Pedidos completo
  ✅ Fulfillment completo
  ✅ ML sync completo
  ✅ Multi-Tenant básico
  
  Resultado: Charlie MP con fulfillment funcionando

FASE 2: Resto de módulos (según demanda)

Timeline: 12 semanas (3 meses) para MVP robusto

Ventajas:
  ✅ Muy rápido
  ✅ Revenue rápido
  ✅ Valida modelo de negocio
  ✅ Expande según necesidad real
```

---

## 💰 MODELO DE REVENUE

### Pricing para Charlie Market Place:

```
SETUP FEE (una vez):
  Starter:     $2,500 USD
  Growth:      $5,000 USD
  Enterprise:  $10,000 USD

MENSUALIDAD BASE:
  Starter:     $199/mes  (1 territorio)
  Growth:      $499/mes  (hasta 3 territorios)
  Enterprise:  $999/mes  (territorios ilimitados)

ADD-ONS:
  Territorio adicional:    $150/mes
  Fulfillment básico:      $0.50/pedido
  Fulfillment premium:     $1.50/pedido
  Usuario adicional:       $25/mes
  Módulo IA:               $99/mes
  Multi-entity:            $299/mes
```

### Proyección con 10 Clientes (Año 1):

```
Clientes:
  5 × Starter  = $995/mes  × 12 = $11,940
  3 × Growth   = $1,497/mes × 12 = $17,964
  2 × Enterprise = $1,998/mes × 12 = $23,976

Setup Fees:
  5 × $2,500 = $12,500
  3 × $5,000 = $15,000
  2 × $10,000 = $20,000
  TOTAL Setup: $47,500

Add-ons (promedio):
  2 territorios adicionales por cliente Growth: $900/mes
  Fulfillment: 100 pedidos/mes/cliente promedio: $1,000/mes

TOTAL AÑO 1: ~$120,000 USD
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### 1. Confirmar Estrategia:

```
¿Qué opción elegimos?

A. Módulo por Módulo (10 meses, completo)
B. MVP Todos + Completar (7 meses, híbrido) ⭐
C. Solo Críticos (3 meses, ágil)
```

### 2. Comenzar con:

```
Recomendación: Opción B (MVP Híbrido)

Sprint 1-2 (2 semanas):
  ✅ Backend: products.tsx expandir (3 niveles básicos)
  ✅ Frontend: ArticuloForm (3 niveles UI)
  ✅ DB: Schema de variantes

Sprint 3-4 (2 semanas):
  ✅ Backend: orders.tsx expandir
  ✅ Backend: fulfillment.tsx crear (básico)
  ✅ Frontend: PedidosList + FulfillmentPanel

Sprint 5-6 (2 semanas):
  ✅ Backend: shipping.tsx expandir (waybills básico)
  ✅ Backend: integrations.tsx (ML sync básico)
  ✅ Frontend: IntegracionesPanel

Sprint 7-8 (2 semanas):
  ✅ Backend: entities.tsx (multi-tenant RLS)
  ✅ Frontend: Dashboard conectado
  ✅ Testing integración

= 8 semanas para MVP END-TO-END funcionando
```

---

## 💬 RESUMEN EJECUTIVO

### Lo Que Tenemos:

```
✅ Backend completo (37 módulos Hono)
✅ Frontend base (React + Tailwind v4)
✅ Dashboard profesional (AdminDashboard.tsx)
✅ UI Components (48 de shadcn/ui)
✅ Integraciones (5 pagos + DGI)
✅ Arquitectura sólida
```

### Lo Que Vamos a Construir:

```
1. BACKEND: Expandir 37 módulos
2. FRONTEND: Conectar Dashboard + nuevos componentes
3. FULFILLMENT: Sistema completo de logística
4. MULTI-TERRITORIO: UY, AR, BR con integraciones locales
5. MULTI-TENANT: White-label para Charlie MP
```

### Estimación:

```
MVP Híbrido: 7 meses (28 semanas)
Solo Críticos: 3 meses (12 semanas)
Completo: 10 meses (43 semanas)
```

### Proyección Revenue:

```
10 clientes año 1: ~$120,000 USD
20 clientes año 2: ~$300,000 USD
50 clientes año 3: ~$900,000 USD
```

---

## 🚀 DECISIÓN REQUERIDA

**¿Qué estrategia aprobamos?**

1. **Opción B (MVP Híbrido)** - 7 meses ⭐ RECOMENDADO
2. **Opción C (Solo Críticos)** - 3 meses (más rápido)
3. **Opción A (Completo)** - 10 meses (más robusto)

**¿Comenzamos con Artículos o con todo en paralelo?**

---

**📄 Documento:**  
`PLAN_EXPANSION_COMPLETA_ODDY.md`

**¡Listo para avanzar!** 🚀
