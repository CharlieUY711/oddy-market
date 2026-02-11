# 🔧 Ejemplo de Integración del Sistema de Auditoría

## Integración en ArticleCatalog.tsx

Aquí te muestro cómo integrar el sistema de auditoría en un componente existente:

### **Paso 1: Importar el hook**

```tsx
import { useAuditLogger } from "/src/app/hooks/useAuditLog";
```

### **Paso 2: Inicializar el logger**

```tsx
export function ArticleCatalog({ session }) {
  const logger = useAuditLogger(session);
  
  // ... resto del código
}
```

### **Paso 3: Agregar logs a las acciones**

```tsx
// Al crear un artículo
const handleCreateArticle = async (article) => {
  try {
    const response = await fetch(/* ... */);
    
    if (response.ok) {
      logger.logInventory("Article created", {
        articleId: article.id,
        name: article.name,
        price: article.price,
        category: article.category
      });
      toast.success("Artículo creado exitosamente");
    }
  } catch (error) {
    logger.logError("Failed to create article", {
      error: error.message,
      articleName: article.name
    });
    toast.error("Error al crear artículo");
  }
};

// Al actualizar un artículo
const handleUpdateArticle = async (article) => {
  try {
    const response = await fetch(/* ... */);
    
    if (response.ok) {
      logger.logInventory("Article updated", {
        articleId: article.id,
        changes: Object.keys(article)
      });
      toast.success("Artículo actualizado");
    }
  } catch (error) {
    logger.logError("Failed to update article", {
      error: error.message,
      articleId: article.id
    });
    toast.error("Error al actualizar");
  }
};

// Al eliminar un artículo
const handleDeleteArticle = async (articleId) => {
  try {
    const response = await fetch(/* ... */);
    
    if (response.ok) {
      logger.logInventory("Article deleted", {
        articleId,
        deletedBy: session?.user?.email
      });
      toast.success("Artículo eliminado");
    }
  } catch (error) {
    logger.logError("Failed to delete article", {
      error: error.message,
      articleId
    });
    toast.error("Error al eliminar");
  }
};

// Al sincronizar con Mercado Libre
const handleMLSync = async () => {
  try {
    const response = await fetch(/* ... */);
    
    if (response.ok) {
      const data = await response.json();
      logger.logIntegration("Mercado Libre sync completed", true, {
        syncedArticles: data.synced,
        duration: data.duration
      });
      toast.success(`${data.synced} artículos sincronizados`);
    }
  } catch (error) {
    logger.logIntegration("Mercado Libre sync failed", false, {
      error: error.message
    });
    toast.error("Error en sincronización ML");
  }
};
```

---

## Integración en el Backend (Ejemplo: orders.tsx)

```tsx
import { logAction } from "./audit.tsx";

// Al crear una orden
app.post("/make-server-0dd48dc4/orders", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    const orderData = await c.req.json();
    
    // Crear orden
    const orderId = `order:${Date.now()}`;
    await kv.set(orderId, {
      id: orderId,
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString(),
      customerId: user.id,
    });

    // Log de auditoría
    await logAction({
      category: "transaction",
      severity: "info",
      action: "Order created",
      userId: user.id,
      user: user.email,
      details: {
        orderId,
        total: orderData.total,
        items: orderData.items.length,
        paymentMethod: orderData.paymentMethod
      },
      ip: c.req.header("x-forwarded-for"),
      userAgent: c.req.header("user-agent"),
    });

    return c.json({ success: true, orderId });
  } catch (error) {
    // Log de error
    await logAction({
      category: "error",
      severity: "error",
      action: "Order creation failed",
      details: {
        error: error.message,
        stack: error.stack
      },
    });
    
    return c.json({ error: "Failed to create order" }, 500);
  }
});

// Al actualizar estado de orden
app.patch("/make-server-0dd48dc4/orders/:id/status", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    const orderId = c.req.param("id");
    const { status } = await c.req.json();
    
    // Actualizar orden
    const order = await kv.get(orderId);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }
    
    const oldStatus = order.status;
    await kv.set(orderId, { ...order, status });

    // Log de auditoría
    await logAction({
      category: "order_status",
      severity: "info",
      action: `Order status changed: ${oldStatus} → ${status}`,
      userId: user.id,
      user: user.email,
      details: {
        orderId,
        oldStatus,
        newStatus: status,
      },
      ip: c.req.header("x-forwarded-for"),
      userAgent: c.req.header("user-agent"),
    });

    return c.json({ success: true });
  } catch (error) {
    await logAction({
      category: "error",
      severity: "error",
      action: "Order status update failed",
      details: { error: error.message },
    });
    
    return c.json({ error: "Failed to update order" }, 500);
  }
});
```

---

## Integración en Acciones Administrativas

```tsx
// Cambiar rol de usuario
const handleRoleChange = async (userId, newRole) => {
  try {
    const response = await fetch(/* ... */);
    
    if (response.ok) {
      logger.logAdmin("User role changed", {
        targetUserId: userId,
        newRole,
        changedBy: session.user.email,
        timestamp: new Date().toISOString()
      });
      toast.success("Rol actualizado");
    }
  } catch (error) {
    logger.logError("Failed to change user role", {
      error: error.message,
      userId,
      attemptedRole: newRole
    });
    toast.error("Error al cambiar rol");
  }
};

// Configurar integración
const handleIntegrationConfig = async (integration, config) => {
  try {
    const response = await fetch(/* ... */);
    
    if (response.ok) {
      logger.logAdmin(`${integration} integration configured`, {
        integration,
        configKeys: Object.keys(config),
        // NO incluir claves API aquí
      });
      toast.success("Integración configurada");
    }
  } catch (error) {
    logger.logError(`Failed to configure ${integration}`, {
      error: error.message,
      integration
    });
    toast.error("Error en configuración");
  }
};
```

---

## Best Practices 🌟

### ✅ **DO:**
- Registrar todas las acciones importantes del usuario
- Incluir contexto relevante en `details`
- Usar severidades apropiadas
- Registrar tanto éxitos como errores
- Incluir información de "quién hizo qué"

### ❌ **DON'T:**
- NO registrar contraseñas o datos sensibles
- NO registrar números de tarjeta completos
- NO hacer logging excesivo en loops
- NO bloquear la UI esperando que el log se complete
- NO incluir datos de terceros sin consentimiento

---

## Casos de Uso Comunes

### **1. Login/Logout**
```tsx
// Login exitoso
logger.logAuth("Login successful", true, { 
  method: "email/password" 
});

// Login fallido
logger.logAuth("Login failed", false, { 
  email: email,
  reason: "invalid_password"
});

// Logout
logger.logAuth("Logout", true, { 
  sessionDuration: calculateDuration() 
});
```

### **2. Compras**
```tsx
// Inicio de compra
logger.logTransaction("Checkout started", {
  cartTotal: cart.total,
  itemCount: cart.items.length
});

// Pago procesado
logger.logTransaction("Payment processed", {
  orderId: order.id,
  amount: order.total,
  paymentMethod: "mercadopago",
  status: "approved"
});
```

### **3. Sincronizaciones**
```tsx
// Sync con Mercado Libre
logger.logIntegration("ML sync started", true, {
  productsCount: products.length
});

// Sync completado
logger.logIntegration("ML sync completed", true, {
  synced: result.synced,
  failed: result.failed,
  duration: `${duration}ms`
});
```

### **4. Errores del Sistema**
```tsx
// Error de API
logger.logSystem("External API error", "error", {
  api: "Mercado Pago",
  endpoint: "/payments",
  statusCode: response.status,
  error: error.message
});

// Error crítico
logger.logSystem("Database connection lost", "critical", {
  timestamp: new Date().toISOString(),
  attempts: reconnectAttempts
});
```

---

## Monitoreo y Alertas

El sistema automáticamente generará alertas cuando:

- 🚨 Se detecten >10 errores en 1 hora
- 🔐 Haya >5 intentos de login fallidos en 1 hora
- 🌐 Una IP genere >100 requests en 1 hora
- 🔌 Fallen >3 integraciones en 1 hora

Estas alertas aparecerán en:
- Banner superior del dashboard de auditoría
- Pestaña "Alertas" con detalles completos
- (Futuro) Notificaciones por Slack/Discord/Email

---

## 📊 Visualización de Datos

Una vez que tengas logs en el sistema, podrás:

1. **Ver actividad en tiempo real** en la pestaña Overview
2. **Buscar logs específicos** con filtros avanzados
3. **Analizar tendencias** en la pestaña Analytics
4. **Exportar datos** para análisis externo
5. **Verificar compliance** automáticamente

---

¡El sistema está listo para usar! 🎉
