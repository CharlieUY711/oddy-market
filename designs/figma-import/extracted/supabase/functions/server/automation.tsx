import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Motor de automatizaciones - Procesador de eventos
async function processAutomationEvents() {
  try {
    // Obtener eventos pendientes
    const events = await kv.getByPrefix("automation_event:");
    
    console.log(`Processing ${events.length} automation events...`);

    for (const event of events) {
      try {
        await processEvent(event);
        
        // Marcar como procesado
        const eventKey = `automation_event:${event.event}:${Date.now()}`;
        await kv.set(`automation_processed:${event.event}:${Date.now()}`, {
          ...event,
          processedAt: new Date().toISOString(),
        });
        
        // Eliminar evento original
        const keys = await kv.getByPrefix("automation_event:");
        for (const key of keys) {
          if (JSON.stringify(key) === JSON.stringify(event)) {
            // Note: In a real implementation, we'd need the actual key
            // For now, we'll leave events in place and mark as processed
          }
        }
      } catch (error) {
        console.error("Error processing automation event:", error);
      }
    }

    return { processed: events.length };
  } catch (error) {
    console.error("Error in automation processor:", error);
    throw error;
  }
}

// Procesar un evento individual
async function processEvent(event: any) {
  console.log(`Processing event: ${event.event}`);

  switch (event.event) {
    case "purchase":
      await handlePurchaseEvent(event);
      break;
    
    case "cart_abandoned":
      await handleCartAbandonedEvent(event);
      break;
    
    case "new_customer":
      await handleNewCustomerEvent(event);
      break;
    
    case "customer_inactive":
      await handleInactiveCustomerEvent(event);
      break;
    
    case "birthday":
      await handleBirthdayEvent(event);
      break;
    
    case "low_stock":
      await handleLowStockEvent(event);
      break;

    default:
      console.log(`Unknown event type: ${event.event}`);
  }
}

// Handler: Compra completada
async function handlePurchaseEvent(event: any) {
  console.log("Processing purchase event for order:", event.orderId);

  // 1. Enviar email de confirmación (simulado)
  await kv.set(`email_queue:${Date.now()}`, {
    to: event.customerId,
    subject: "¡Gracias por tu compra!",
    template: "purchase_confirmation",
    data: event.data,
    createdAt: new Date().toISOString(),
  });

  // 2. Actualizar puntos de fidelización
  const customer = await kv.get(`customer:${event.customerId}`);
  if (customer) {
    const pointsEarned = Math.floor(event.data.total / 1000); // 1 punto por cada $1000
    await kv.set(`customer:${event.customerId}`, {
      ...customer,
      loyaltyPoints: (customer.loyaltyPoints || 0) + pointsEarned,
      lastPurchase: new Date().toISOString(),
      totalPurchases: (customer.totalPurchases || 0) + 1,
    });
  }

  // 3. Trigger campaign de "productos relacionados" después de 3 días
  await kv.set(`scheduled_action:${Date.now()}`, {
    action: "send_related_products",
    customerId: event.customerId,
    orderId: event.orderId,
    executeAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  });

  console.log("Purchase event processed successfully");
}

// Handler: Carrito abandonado
async function handleCartAbandonedEvent(event: any) {
  console.log("Processing cart abandoned event for customer:", event.customerId);

  // Verificar si no completó la compra en las últimas 24h
  const orders = await kv.getByPrefix(`order:`);
  const recentOrders = orders.filter((o: any) => 
    o.customerId === event.customerId && 
    new Date(o.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  if (recentOrders.length === 0) {
    // Enviar email de recuperación
    await kv.set(`email_queue:${Date.now()}`, {
      to: event.customerId,
      subject: "¡Todavía tenés productos en tu carrito!",
      template: "cart_abandoned",
      data: event.data,
      createdAt: new Date().toISOString(),
    });

    // Crear cupón de descuento del 10%
    const couponCode = `CART${Date.now()}`;
    await kv.set(`coupon:${couponCode}`, {
      code: couponCode,
      discount: 10,
      type: "percentage",
      customerId: event.customerId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    console.log("Cart abandoned event processed, coupon created:", couponCode);
  }
}

// Handler: Nuevo cliente
async function handleNewCustomerEvent(event: any) {
  console.log("Processing new customer event:", event.customerId);

  // Enviar email de bienvenida
  await kv.set(`email_queue:${Date.now()}`, {
    to: event.customerId,
    subject: "¡Bienvenido a ODDY Market!",
    template: "welcome",
    data: event.data,
    createdAt: new Date().toISOString(),
  });

  // Crear cupón de primera compra del 15%
  const couponCode = `WELCOME${Date.now()}`;
  await kv.set(`coupon:${couponCode}`, {
    code: couponCode,
    discount: 15,
    type: "percentage",
    customerId: event.customerId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    firstPurchaseOnly: true,
  });

  console.log("New customer event processed, welcome coupon created");
}

// Handler: Cliente inactivo (30 días sin comprar)
async function handleInactiveCustomerEvent(event: any) {
  console.log("Processing inactive customer event:", event.customerId);

  // Enviar email de reactivación
  await kv.set(`email_queue:${Date.now()}`, {
    to: event.customerId,
    subject: "¡Te extrañamos! Volvé con un 20% OFF",
    template: "winback",
    data: event.data,
    createdAt: new Date().toISOString(),
  });

  // Crear cupón especial del 20%
  const couponCode = `WINBACK${Date.now()}`;
  await kv.set(`coupon:${couponCode}`, {
    code: couponCode,
    discount: 20,
    type: "percentage",
    customerId: event.customerId,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  });

  console.log("Inactive customer event processed, win-back coupon created");
}

// Handler: Cumpleaños
async function handleBirthdayEvent(event: any) {
  console.log("Processing birthday event:", event.customerId);

  // Enviar email de cumpleaños
  await kv.set(`email_queue:${Date.now()}`, {
    to: event.customerId,
    subject: "¡Feliz cumpleaños! 🎉 Regalo especial",
    template: "birthday",
    data: event.data,
    createdAt: new Date().toISOString(),
  });

  // Crear cupón de cumpleaños del 25%
  const couponCode = `BDAY${Date.now()}`;
  await kv.set(`coupon:${couponCode}`, {
    code: couponCode,
    discount: 25,
    type: "percentage",
    customerId: event.customerId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  });

  console.log("Birthday event processed, birthday coupon created");
}

// Handler: Stock bajo
async function handleLowStockEvent(event: any) {
  console.log("Processing low stock event for product:", event.productId);

  // Crear tarea para administrador
  await kv.set(`task:${Date.now()}`, {
    title: `Stock bajo: ${event.data.productName}`,
    description: `El producto ${event.data.productName} tiene solo ${event.data.currentStock} unidades restantes.`,
    type: "low_stock",
    priority: "high",
    productId: event.productId,
    assignedTo: "admin",
    createdAt: new Date().toISOString(),
  });

  // Enviar notificación a administradores
  const admins = await kv.getByPrefix("user:");
  for (const user of admins) {
    if (user.role === "admin") {
      await kv.set(`notification:${user.id}:${Date.now()}`, {
        userId: user.id,
        title: "Stock bajo",
        message: `El producto ${event.data.productName} tiene stock bajo (${event.data.currentStock} unidades)`,
        type: "warning",
        createdAt: new Date().toISOString(),
      });
    }
  }

  console.log("Low stock event processed, admin notified");
}

// Endpoint: Ejecutar motor de automatizaciones manualmente
app.post("/make-server-0dd48dc4/automation/process", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const result = await processAutomationEvents();
    
    return c.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error processing automations:", error);
    return c.json({ error: "Error processing automations" }, 500);
  }
});

// Endpoint: Crear evento de automatización manualmente
app.post("/make-server-0dd48dc4/automation/trigger", async (c) => {
  try {
    const { event, data } = await c.req.json();

    if (!event) {
      return c.json({ error: "Event type required" }, 400);
    }

    const eventId = `automation_event:${event}:${Date.now()}`;
    await kv.set(eventId, {
      event,
      data,
      timestamp: new Date().toISOString(),
    });

    // Procesar inmediatamente
    const eventData = await kv.get(eventId);
    await processEvent(eventData);

    return c.json({
      success: true,
      event,
      message: "Event triggered and processed",
    });
  } catch (error) {
    console.error("Error triggering automation:", error);
    return c.json({ error: "Error triggering automation" }, 500);
  }
});

// Endpoint: Obtener automaciones configuradas
app.get("/make-server-0dd48dc4/automation/config", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const automations = [
      {
        id: "purchase_confirmation",
        name: "Confirmación de compra",
        trigger: "purchase",
        enabled: true,
        actions: ["send_email", "update_loyalty_points", "schedule_followup"],
      },
      {
        id: "cart_abandoned",
        name: "Carrito abandonado",
        trigger: "cart_abandoned",
        enabled: true,
        delay: "5 minutes",
        actions: ["send_email", "create_coupon"],
      },
      {
        id: "welcome_new_customer",
        name: "Bienvenida nuevos clientes",
        trigger: "new_customer",
        enabled: true,
        actions: ["send_email", "create_welcome_coupon"],
      },
      {
        id: "winback_inactive",
        name: "Recuperar clientes inactivos",
        trigger: "customer_inactive",
        enabled: true,
        condition: "30 days without purchase",
        actions: ["send_email", "create_special_coupon"],
      },
      {
        id: "birthday_campaign",
        name: "Campaña de cumpleaños",
        trigger: "birthday",
        enabled: true,
        actions: ["send_email", "create_birthday_coupon"],
      },
      {
        id: "low_stock_alert",
        name: "Alerta de stock bajo",
        trigger: "low_stock",
        enabled: true,
        condition: "stock < 5",
        actions: ["notify_admin", "create_task"],
      },
    ];

    return c.json({ automations });
  } catch (error) {
    console.error("Error fetching automation config:", error);
    return c.json({ error: "Error fetching automation config" }, 500);
  }
});

// Endpoint: Obtener emails en cola
app.get("/make-server-0dd48dc4/automation/email-queue", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const emails = await kv.getByPrefix("email_queue:");
    
    return c.json({
      queue: emails.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error) {
    console.error("Error fetching email queue:", error);
    return c.json({ error: "Error fetching email queue" }, 500);
  }
});

// Endpoint: Obtener tareas creadas por automatizaciones
app.get("/make-server-0dd48dc4/automation/tasks", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const tasks = await kv.getByPrefix("task:");
    
    return c.json({
      tasks: tasks.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return c.json({ error: "Error fetching tasks" }, 500);
  }
});

export default app;
