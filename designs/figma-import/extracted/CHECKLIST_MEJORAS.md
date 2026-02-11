# ✅ CHECKLIST DE MEJORAS - ODDY MARKET

Este documento es tu guía para alcanzar 9.0/10 y luego 10/10.

---

## 🔥 FASE 1: Alcanzar 9.0/10 (Próximos 30 días)

### Semana 1-2: Seguridad y UX

#### 🔴 CRÍTICO: 2FA para Administradores
- [ ] Instalar paquetes: `pnpm add @supabase/auth-helpers-react speakeasy qrcode`
- [ ] Crear componente `TwoFactorSetup.tsx`
- [ ] Implementar generación de TOTP secret
- [ ] Crear pantalla de escaneo QR
- [ ] Implementar validación de código en login
- [ ] Hacer 2FA obligatorio para rol Admin
- [ ] Testing exhaustivo
- [ ] Documentación de usuario

**Tiempo estimado:** 2-3 días  
**Desarrollador:** Senior Full-Stack  
**Prioridad:** 🔴 CRÍTICO

---

#### 🟠 ALTO: Rate Limiting
- [ ] Agregar middleware de rate limiting en Hono
- [ ] Configurar límites por endpoint:
  - [ ] Auth: 5 intentos / 15 min
  - [ ] API pública: 100 req / min
  - [ ] API autenticada: 1000 req / min
- [ ] Implementar respuesta 429 Too Many Requests
- [ ] Logging de intentos excesivos
- [ ] Dashboard de monitoreo
- [ ] Testing de límites

**Tiempo estimado:** 1-2 días  
**Desarrollador:** Backend  
**Prioridad:** 🟠 ALTO

---

#### 🟠 ALTO: PWA Support
- [ ] Crear `manifest.json` con metadata
- [ ] Crear `service-worker.js` para cache
- [ ] Configurar Vite para PWA
- [ ] Implementar estrategia de cache:
  - [ ] Cache-first para assets estáticos
  - [ ] Network-first para datos dinámicos
- [ ] Agregar prompt de instalación
- [ ] Testing en iOS y Android
- [ ] Iconos en todos los tamaños necesarios

**Tiempo estimado:** 1-2 días  
**Desarrollador:** Frontend  
**Prioridad:** 🟠 ALTO

---

### Semana 3-4: Logística y Marketing

#### 🟠 ALTO: Integración con Carriers
- [ ] Investigar APIs disponibles en Uruguay/región
- [ ] Seleccionar 2-3 carriers principales
- [ ] Obtener API keys de carriers
- [ ] Crear endpoint `/shipping/calculate-rates`
- [ ] Implementar cálculo de tarifas en tiempo real
- [ ] Crear endpoint `/shipping/create-label`
- [ ] Implementar tracking de envíos
- [ ] Agregar webhook para actualizaciones
- [ ] UI para selección de carrier en checkout
- [ ] Testing end-to-end

**Carriers sugeridos:**
- UPS / FedEx (internacional)
- Correo Uruguayo (local)
- DAC / Mirtrans (regional)

**Tiempo estimado:** 5-7 días  
**Desarrollador:** Full-Stack + integración  
**Prioridad:** 🟠 ALTO

---

#### 🟠 ALTO: Google Shopping Feed
- [ ] Crear endpoint `/integrations/google-shopping/feed`
- [ ] Implementar generación de XML según spec de Google
- [ ] Mapear campos de producto a Google schema:
  - [ ] id, title, description
  - [ ] link, image_link
  - [ ] price, availability
  - [ ] brand, condition
  - [ ] google_product_category
- [ ] Configurar actualización automática (cada 6h)
- [ ] Registrar feed en Google Merchant Center
- [ ] Configurar cuenta de Google Ads
- [ ] Crear campañas de Shopping
- [ ] Monitoreo y optimización

**Tiempo estimado:** 3-4 días  
**Desarrollador:** Backend + Marketing  
**Prioridad:** 🟠 ALTO

---

#### 🟡 MEDIO: Sistema Completo de Reviews
- [ ] Crear tabla `product_reviews` en DB
- [ ] Implementar CRUD de reviews
- [ ] Sistema de moderación:
  - [ ] Auto-aprobación de usuarios verificados
  - [ ] Queue de moderación para nuevos usuarios
  - [ ] Filtro de palabras inapropiadas
- [ ] Rating promedio por producto
- [ ] Ordenamiento por útiles/recientes
- [ ] Imágenes en reviews (opcional)
- [ ] Sistema de "review útil" (votos)
- [ ] Email de follow-up post-compra
- [ ] Incentivos por dejar review (puntos loyalty)

**Tiempo estimado:** 4-5 días  
**Desarrollador:** Full-Stack  
**Prioridad:** 🟡 MEDIO

---

### Semana 5: Testing y Optimización
- [ ] Testing de carga (Artillery, k6)
- [ ] Testing de seguridad (OWASP Top 10)
- [ ] Auditoría de performance (Lighthouse)
- [ ] Optimización de imágenes (WebP, lazy loading)
- [ ] Auditoría de accesibilidad (WCAG 2.1)
- [ ] Documentación técnica actualizada
- [ ] Documentación de usuario final
- [ ] Capacitación del equipo

---

## 🎯 FASE 2: Alcanzar 9.5/10 (60-90 días)

### Conversion Funnel Analytics
- [ ] Implementar tracking de eventos:
  - [ ] Página vista
  - [ ] Producto visto
  - [ ] Agregar al carrito
  - [ ] Iniciar checkout
  - [ ] Completar compra
- [ ] Dashboard de funnel con Recharts
- [ ] Identificación de puntos de fuga
- [ ] A/B testing automatizado
- [ ] Recomendaciones de optimización

**Tiempo estimado:** 4-5 días  
**Prioridad:** 🟡 MEDIO

---

### Multi-idioma (i18n)
- [ ] Instalar: `pnpm add react-i18next i18next`
- [ ] Crear archivos de traducción:
  - [ ] `es.json` (español - base)
  - [ ] `en.json` (inglés)
  - [ ] `pt.json` (portugués)
- [ ] Traducir todos los strings del UI
- [ ] Selector de idioma en header
- [ ] Detección automática de idioma browser
- [ ] Persistencia de preferencia
- [ ] SEO multi-idioma (hreflang)

**Tiempo estimado:** 5-7 días  
**Prioridad:** 🟡 MEDIO

---

### Automatizaciones Email Avanzadas
- [ ] Flujo: Carrito Abandonado
  - [ ] Email 1: 1 hora después (recordatorio)
  - [ ] Email 2: 24 horas después (urgencia)
  - [ ] Email 3: 48 horas después (cupón descuento)
- [ ] Flujo: Welcome Series
  - [ ] Email 1: Bienvenida + cupón
  - [ ] Email 2: Productos destacados
  - [ ] Email 3: Historia de marca
  - [ ] Email 4: Invitación a seguir en RRSS
  - [ ] Email 5: Caso de éxito / testimonial
- [ ] Flujo: Post-Compra
  - [ ] Email 1: Confirmación inmediata
  - [ ] Email 2: Tracking de envío
  - [ ] Email 3: Solicitud de review
  - [ ] Email 4: Upsell / cross-sell
- [ ] Triggers configurables por admin

**Tiempo estimado:** 5-6 días  
**Prioridad:** 🟡 MEDIO

---

### PayPal Completo
- [ ] Registrar cuenta PayPal Business
- [ ] Obtener API credentials
- [ ] Instalar: `pnpm add @paypal/react-paypal-js`
- [ ] Implementar PayPal Smart Buttons
- [ ] Integrar en checkout
- [ ] Testing sandbox
- [ ] Testing producción
- [ ] Documentación

**Tiempo estimado:** 1 día  
**Prioridad:** 🟡 MEDIO

---

### Fraud Detection con ML
- [ ] Instalar: `pnpm add @tensorflow/tfjs brain.js`
- [ ] Recopilar data histórica:
  - [ ] Transacciones normales
  - [ ] Transacciones fraudulentas (si existen)
- [ ] Entrenar modelo con features:
  - [ ] Monto de compra
  - [ ] Velocidad de compra
  - [ ] IP del usuario
  - [ ] Historial del usuario
  - [ ] Método de pago
- [ ] Implementar scoring de riesgo (0-100)
- [ ] Reglas automáticas:
  - [ ] Score < 30: Aprobación automática
  - [ ] Score 30-70: Revisión manual
  - [ ] Score > 70: Rechazo automático
- [ ] Dashboard de fraud management
- [ ] Mejora continua del modelo

**Tiempo estimado:** 7-10 días  
**Prioridad:** 🟠 ALTO

---

### Split Payments (Marketplace)
- [ ] Investigar Mercado Pago Split Payments
- [ ] Configurar cuentas de proveedores
- [ ] Implementar lógica de split:
  - [ ] % comisión configurable
  - [ ] Split automático en cada venta
- [ ] Dashboard de comisiones para proveedores
- [ ] Reportes de earnings
- [ ] Sistema de pagos a proveedores
- [ ] Testing exhaustivo

**Tiempo estimado:** 5-7 días  
**Prioridad:** 🟡 MEDIO

---

### Dark Mode Completo
- [ ] Implementar hook `useDarkMode` con next-themes
- [ ] Crear paleta de colores dark en CSS
- [ ] Toggle en header/settings
- [ ] Persistencia de preferencia
- [ ] Detección de preferencia del sistema
- [ ] Testing de contraste (WCAG)
- [ ] Revisar todos los componentes

**Tiempo estimado:** 1-2 días  
**Prioridad:** 🟢 BAJO

---

## 🚀 FASE 3: Alcanzar 10/10 (6 meses)

### Contabilidad Integrada
- [ ] Investigar software contable local
- [ ] Evaluar APIs disponibles:
  - [ ] QuickBooks
  - [ ] Xero
  - [ ] Zoho Books
  - [ ] Software local uruguayo
- [ ] Implementar sincronización:
  - [ ] Ventas → Ingresos
  - [ ] Compras → Gastos
  - [ ] Inventario → Activos
- [ ] Generación de reportes contables
- [ ] Declaración de impuestos facilitada

**Tiempo estimado:** 2-3 semanas  
**Prioridad:** 🟡 MEDIO

---

### Expansión a Nuevos Marketplaces
#### Amazon
- [ ] Registrar cuenta Amazon Seller
- [ ] Obtener API credentials (MWS / SP-API)
- [ ] Implementar sincronización bidireccional
- [ ] Gestión de órdenes de Amazon
- [ ] FBA integration (opcional)

#### eBay
- [ ] Registrar cuenta eBay Seller
- [ ] Obtener API credentials
- [ ] Sincronización de listings
- [ ] Gestión de órdenes

**Tiempo estimado:** 3-4 semanas  
**Prioridad:** 🟢 BAJO

---

### IA Generativa Avanzada
- [ ] Generación de descripciones de productos
- [ ] Optimización automática de títulos (SEO)
- [ ] Generación de imágenes con DALL-E
- [ ] Chatbot avanzado con GPT-4
- [ ] Recomendaciones personalizadas con ML
- [ ] Predicción de demanda
- [ ] Optimización dinámica de precios

**Tiempo estimado:** 1-2 meses  
**Prioridad:** 🟡 MEDIO

---

### Multi-moneda
- [ ] Integrar API de conversión (ExchangeRate-API)
- [ ] Selector de moneda en header
- [ ] Conversión en tiempo real
- [ ] Precios en múltiples monedas
- [ ] Pagos en moneda seleccionada
- [ ] Reportes multi-moneda

**Tiempo estimado:** 1 semana  
**Prioridad:** 🟢 BAJO

---

### Programa de Afiliados
- [ ] Sistema de referral links únicos
- [ ] Tracking de conversiones
- [ ] Comisiones configurables
- [ ] Dashboard de afiliados
- [ ] Pagos automáticos
- [ ] Materiales de marketing para afiliados

**Tiempo estimado:** 2-3 semanas  
**Prioridad:** 🟢 BAJO

---

## 📊 TRACKING DE PROGRESO

### Score Actual: 8.4/10

**Para 9.0/10, completar:**
- [ ] 2FA (CRÍTICO)
- [ ] Rate Limiting
- [ ] PWA Support
- [ ] Carriers Integration
- [ ] Google Shopping Feed
- [ ] Sistema de Reviews

**Para 9.5/10, agregar:**
- [ ] Conversion Funnel
- [ ] Multi-idioma
- [ ] Email Automation Avanzada
- [ ] PayPal Completo
- [ ] Fraud Detection
- [ ] Split Payments

**Para 10/10, completar:**
- [ ] Contabilidad Integrada
- [ ] Amazon + eBay
- [ ] IA Generativa Completa
- [ ] Multi-moneda
- [ ] Programa de Afiliados
- [ ] Todas las optimizaciones

---

## 🎯 MÉTRICAS DE ÉXITO

### Técnicas
- [ ] Lighthouse Score > 90 en todas las categorías
- [ ] TTI (Time to Interactive) < 3s
- [ ] Cero vulnerabilidades críticas (OWASP)
- [ ] Uptime > 99.5%
- [ ] API response time < 200ms (p95)

### Negocio
- [ ] Conversión checkout > 3%
- [ ] Cart abandonment < 50%
- [ ] Customer satisfaction > 4.5/5
- [ ] Repeat purchase rate > 30%
- [ ] Revenue growth > 20% MoM

---

## 📝 NOTAS

- Este checklist debe revisarse semanalmente
- Prioridades pueden cambiar según necesidades del negocio
- Tiempos son estimaciones; ajustar según equipo
- Cada item completado debe ser testeado exhaustivamente
- Documentar cambios en CHANGELOG.md

---

**Última actualización:** Febrero 11, 2026  
**Mantenido por:** Equipo ODDY Market  
**Versión:** 1.0
