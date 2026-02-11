# 🛡️ Sistema de Auditoría y Logs - ODDY Market

## 📋 Resumen

El sistema de auditoría de ODDY Market proporciona **trazabilidad completa** de todas las acciones del sistema, métricas de performance, alertas en tiempo real, y compliance automático con normativas de seguridad y privacidad.

---

## ✨ Funcionalidades Principales

### 1️⃣ **Vista General (Overview)**
- ✅ Métricas de performance en tiempo real
- ✅ Verificaciones de seguridad automáticas
- ✅ Compliance SEO y Legal
- ✅ Alertas activas destacadas

### 2️⃣ **Logs**
- 📝 Registro completo de todas las acciones del sistema
- 🔍 Búsqueda y filtrado avanzado (por categoría, severidad, usuario, fecha)
- 📤 Exportación a CSV
- 🗑️ Limpieza automática de logs antiguos

### 3️⃣ **Analíticas**
- 📊 Actividad por hora (últimas 24h)
- 📈 Distribución por severidad
- 👥 Usuarios más activos
- ⚠️ Errores más frecuentes
- 📉 Tasa de errores y tendencias

### 4️⃣ **Alertas en Tiempo Real**
- 🚨 Alta tasa de errores
- 🔐 Intentos de login fallidos
- 🌐 Actividad sospechosa por IP
- 🔌 Fallas en integraciones

### 5️⃣ **Compliance**
- ✅ Retención de datos
- ✅ Registro de accesos
- ✅ Auditoría de acciones administrativas
- ✅ Trazabilidad de transacciones
- ✅ GDPR compliance
- ✅ PCI DSS compliance

### 6️⃣ **Sesiones**
- 👤 Control de sesiones activas
- 🔑 Token management (JWT)
- 📱 Multi-device tracking
- 🤖 Detección de anomalías con ML

### 7️⃣ **Integraciones**
- 🔗 Estado de todas las integraciones
- ⏰ Sync jobs programados
- 📊 Monitoreo de health checks

---

## 🚀 Cómo Usar el Sistema de Logs

### **Opción 1: Usar el Hook `useAuditLogger`** (Recomendado)

```tsx
import { useAuditLogger } from "/src/app/hooks/useAuditLog";

function MyComponent({ session }) {
  const logger = useAuditLogger(session);

  const handleProductCreation = async (product) => {
    try {
      // ... crear producto ...
      
      logger.logInventory("Product created", { 
        productId: product.id, 
        name: product.name 
      });
    } catch (error) {
      logger.logError("Failed to create product", { 
        error: error.message 
      });
    }
  };

  return <div>...</div>;
}
```

### **Opción 2: Usar el Hook Base `useAuditLog`**

```tsx
import { useAuditLog } from "/src/app/hooks/useAuditLog";

function MyComponent({ session }) {
  const { log } = useAuditLog(session);

  const handleAction = async () => {
    log({
      category: "admin",
      severity: "info",
      action: "User role changed",
      details: { userId: "123", newRole: "editor" }
    });
  };

  return <div>...</div>;
}
```

### **Opción 3: Llamada Directa desde Backend**

```tsx
// En cualquier archivo del servidor
import { logAction } from "./audit.tsx";

await logAction({
  category: "transaction",
  severity: "info",
  action: "Payment processed",
  userId: user.id,
  user: user.email,
  details: {
    orderId: order.id,
    amount: order.total,
    paymentMethod: "mercadopago"
  },
  ip: clientIp,
  userAgent: request.headers.get("user-agent"),
});
```

---

## 📊 Categorías de Logs

| Categoría | Uso | Ejemplos |
|-----------|-----|----------|
| **access** | Acceso a recursos | "User viewed product", "Page loaded" |
| **error** | Errores del sistema | "API call failed", "Database error" |
| **transaction** | Transacciones comerciales | "Payment processed", "Order created" |
| **auth** | Autenticación | "Login successful", "Password reset" |
| **inventory** | Gestión de inventario | "Product created", "Stock updated" |
| **admin** | Acciones administrativas | "User role changed", "Settings updated" |
| **user_profile** | Perfiles de usuario | "Profile updated", "Avatar changed" |
| **order_status** | Estado de órdenes | "Order shipped", "Order cancelled" |
| **system** | Sistema | "Backup completed", "Sync job started" |
| **integration** | Integraciones | "ML sync completed", "Payment gateway error" |

---

## ⚠️ Niveles de Severidad

| Severidad | Cuándo Usar | Color |
|-----------|-------------|-------|
| **info** 🔵 | Acciones normales del sistema | Azul |
| **warning** 🟡 | Situaciones que requieren atención | Amarillo |
| **error** 🟠 | Errores que afectan funcionalidad | Naranja |
| **critical** 🔴 | Errores graves que requieren acción inmediata | Rojo |

---

## 🎯 Ejemplos de Uso por Módulo

### **ERP / Inventario**
```tsx
logger.logInventory("Stock updated", { 
  productId: "prod-123", 
  oldStock: 100, 
  newStock: 95 
});
```

### **Órdenes**
```tsx
logger.logTransaction("Order created", { 
  orderId: order.id, 
  total: order.total,
  items: order.items.length 
});

logger.logOrderStatus("Order shipped", { 
  orderId: order.id, 
  trackingNumber: "XYZ123" 
});
```

### **Autenticación**
```tsx
logger.logAuth("Login attempt", success, { 
  email: user.email,
  method: "password" 
});
```

### **Integraciones**
```tsx
logger.logIntegration("Mercado Libre sync", success, {
  products: syncedProducts.length,
  duration: `${duration}ms`
});
```

### **Acciones Admin**
```tsx
logger.logAdmin("User role changed", {
  targetUser: user.email,
  oldRole: "customer",
  newRole: "editor",
  changedBy: session.user.email
});
```

---

## 🔧 Configuración y Mantenimiento

### **Generar Datos de Prueba**
```
Click en "Generar Datos Demo" en el dashboard de auditoría
```

### **Exportar Logs**
```
1. Ir a pestaña "Logs"
2. Aplicar filtros deseados
3. Click en botón de descarga
4. Se descarga archivo CSV
```

### **Limpiar Logs Antiguos**
```
Click en "Limpiar Logs Antiguos" (elimina logs >90 días)
```

### **Ejecutar Auditoría de Compliance**
```
1. Ir a pestaña "Compliance"
2. Click en "Ejecutar Auditoría de Compliance"
3. Revisar resultados y recomendaciones
```

---

## 📈 Métricas y Alertas

### **Alertas Automáticas**

El sistema genera alertas automáticamente cuando detecta:

- ⚠️ Más de 10 errores en 1 hora
- 🔐 Más de 5 intentos de login fallidos en 1 hora
- 🌐 Más de 100 requests desde la misma IP en 1 hora
- 🔌 Más de 3 errores de integración en 1 hora

### **Performance Monitoring**

- ⏱️ Tiempo de respuesta promedio
- ⬆️ Uptime del sistema
- 📊 Requests por minuto
- 📈 Comparación con períodos anteriores

---

## 🔐 Seguridad y Privacidad

### **Datos que SE registran:**
- ✅ ID de usuario
- ✅ Email de usuario
- ✅ Timestamp
- ✅ Acción realizada
- ✅ IP del cliente
- ✅ User agent (navegador/dispositivo)
- ✅ Detalles de la acción (sin datos sensibles)

### **Datos que NO SE registran:**
- ❌ Contraseñas
- ❌ Números de tarjeta de crédito
- ❌ Datos personales sensibles (DNI, etc.)
- ❌ Tokens de acceso completos

### **Retención de Datos**
- Logs se mantienen por defecto 90 días
- Limpieza automática recomendada mensualmente
- Logs críticos pueden archivarse antes de eliminarse

---

## 🛠️ Troubleshooting

### **No veo logs en el dashboard**
1. Verificar que el módulo de auditoría esté activo
2. Generar datos de muestra para testing
3. Revisar conexión con backend

### **Las alertas no se muestran**
1. Verificar que haya logs recientes
2. Refrescar la página
3. Revisar tab de "Alertas"

### **Error al exportar logs**
1. Verificar que haya logs para exportar
2. Verificar filtros aplicados
3. Intentar con rango de fechas más corto

---

## 📞 Próximas Mejoras

- [ ] Integración con Slack/Discord para alertas
- [ ] Dashboard público de uptime
- [ ] Reportes automáticos por email
- [ ] Machine Learning para detección de anomalías
- [ ] Integración con herramientas APM (Datadog, New Relic)
- [ ] Logs estructurados con OpenTelemetry
- [ ] Retención configurable por tipo de log

---

## 📚 Referencias

- **Backend:** `/supabase/functions/server/audit.tsx`
- **Frontend:** `/src/app/components/AuditLogs.tsx`
- **Hook:** `/src/app/hooks/useAuditLog.tsx`

---

**Última actualización:** Febrero 2026  
**Versión:** 2.0  
**Autor:** ODDY Market Team
