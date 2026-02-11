# 📚 Documentación - Ecommerce Departamental

Bienvenido a la documentación completa del sistema de ecommerce.

---

## 🗂️ Índice de Documentación

### 💳 Integraciones de Pago

#### Resumen General
- **[Integraciones de Pago - Resumen](/INTEGRACIONES_PAGO.md)**
  - Descripción general de todas las integraciones
  - Configuración básica
  - Variables de entorno

#### Documentación Específica
- **[Payment Integrations Summary](/docs/PAYMENT_INTEGRATIONS_SUMMARY.md)**
  - Resumen técnico de integraciones
  - Endpoints disponibles
  - Ejemplos de uso

#### Plexo (Pasarela Uruguay)
- **[Plexo Integration](/docs/PLEXO_INTEGRATION.md)**
  - Guía completa de integración
  - Configuración detallada
  - API endpoints
- **[Plexo Quick Start](/docs/PLEXO_QUICKSTART.md)**
  - Configuración rápida
  - Primeros pasos
  - Ejemplos básicos

---

### 📄 Sistema de Facturación Electrónica

#### Documentación Principal
- **[Sistema de Facturación con Fixed](/docs/BILLING_SYSTEM.md)** ⭐
  - Documentación completa
  - Arquitectura del sistema
  - Funcionalidades implementadas
  - Cumplimiento legal DGI Uruguay
  - API Reference
  - Estadísticas y reportes

#### Guías de Inicio Rápido
- **[Billing Quick Start](/docs/BILLING_QUICKSTART.md)** 🚀
  - Configuración en 5 minutos
  - Primeros pasos
  - Uso básico
  - Ejemplos comunes
  - Troubleshooting

#### Integración
- **[Billing Integration Example](/docs/BILLING_INTEGRATION_EXAMPLE.md)** 💻
  - Integración con checkout
  - Ejemplos de código
  - Flujo completo
  - Manejo de errores
  - Testing

---

### 📋 Roadmap y Planificación

- **[ROADMAP](/ROADMAP.md)**
  - Funcionalidades completadas
  - Funcionalidades pendientes
  - Prioridades
  - Métricas de progreso
  - Próximos pasos

---

## 🎯 Guías por Rol

### Para Desarrolladores
1. Comenzar con [ROADMAP](/ROADMAP.md) para entender el estado del proyecto
2. Leer [Integraciones de Pago](/INTEGRACIONES_PAGO.md) para configurar pasarelas
3. Seguir [Billing Quick Start](/docs/BILLING_QUICKSTART.md) para facturación
4. Implementar usando [Billing Integration Example](/docs/BILLING_INTEGRATION_EXAMPLE.md)

### Para Administradores de Tienda
1. Comenzar con [Billing Quick Start](/docs/BILLING_QUICKSTART.md)
2. Configurar credenciales siguiendo [Billing System](/docs/BILLING_SYSTEM.md)
3. Aprender a usar el panel en la sección UI/UX del documento de facturación

### Para Product Owners
1. Revisar [ROADMAP](/ROADMAP.md) para planificación
2. Entender capacidades en [Billing System](/docs/BILLING_SYSTEM.md)
3. Priorizar siguientes funcionalidades del roadmap

---

## 📊 Estado del Proyecto

### ✅ Completado (15%)

- ✅ Integraciones de Pago (Mercado Libre, Mercado Pago, PayPal, Stripe, Plexo)
- ✅ Sistema de Facturación Electrónica con Fixed
- ✅ Panel de Administración
- ✅ Dashboard con estadísticas
- ✅ Checkout integrado

### 🔄 En Progreso (0%)

- Ninguna funcionalidad en progreso actualmente

### 📋 Próximas Prioridades

1. **Mini CRM Básico** - Gestión de clientes
2. **Sistema de Mailing con Resend** - Emails transaccionales
3. **Gestión de Departamentos** - Categorías expandibles
4. **Centro de RRSS** - Facebook, Instagram, WhatsApp

---

## 🔗 Enlaces Externos Importantes

### Plataformas de Pago
- [Mercado Libre Developers](https://developers.mercadolibre.com.ar/)
- [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/)
- [PayPal Developer](https://developer.paypal.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Plexo](https://www.plexo.com.uy/)

### Facturación Electrónica
- [Fixed Uruguay](https://fixed.uy)
- [Fixed Docs](https://docs.fixed.uy)
- [DGI Uruguay](https://dgi.gub.uy)
- [CFE DGI](https://cfe.dgi.gub.uy)

### Infraestructura
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Docs](https://supabase.com/docs)

---

## 🆘 Soporte

### Problemas Técnicos
- Revisar sección **Troubleshooting** en cada guía
- Consultar logs en Supabase Edge Functions
- Verificar variables de entorno

### Preguntas sobre Facturación
- Ver [Billing System - FAQ section](/docs/BILLING_SYSTEM.md)
- Consultar [DGI Uruguay](https://dgi.gub.uy)
- Contactar soporte de Fixed: soporte@fixed.uy

### Preguntas sobre Pagos
- Verificar estado en Panel de Integraciones
- Consultar documentación de la plataforma específica
- Revisar webhooks y logs

---

## 📝 Contribuir a la Documentación

Para mantener la documentación actualizada:

1. **Al completar una funcionalidad:**
   - Actualizar [ROADMAP.md](/ROADMAP.md)
   - Crear documentación específica si es necesario
   - Actualizar este índice

2. **Al agregar integraciones:**
   - Crear guía específica en `/docs/`
   - Agregar a [INTEGRACIONES_PAGO.md](/INTEGRACIONES_PAGO.md)
   - Incluir Quick Start guide

3. **Al encontrar errores:**
   - Documentar en sección Troubleshooting
   - Agregar ejemplo de solución

---

## 🎓 Glosario

- **CFE**: Comprobante Fiscal Electrónico (Uruguay)
- **DGI**: Dirección General Impositiva (Uruguay)
- **e-factura**: Factura electrónica con validez fiscal
- **e-remito**: Remito electrónico (documento de entrega)
- **KV Store**: Key-Value Store (base de datos NoSQL de Supabase)
- **Webhook**: Endpoint HTTP para recibir notificaciones automáticas
- **IVA**: Impuesto al Valor Agregado (22% en Uruguay)

---

**Última actualización:** 11 de febrero de 2026

**Versión de documentación:** 2.0

**Estado del proyecto:** En desarrollo activo 🚀
