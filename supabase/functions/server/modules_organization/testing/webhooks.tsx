import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// WEBHOOKS - Gestión de Webhooks
// ==========================================

// Create webhook
app.post("/make-server-0dd48dc4/webhooks", async (c) => {
  try {
    const webhook = await c.req.json();
    const id = webhook.id || `webhook:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newWebhook = {
      ...webhook,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      url: webhook.url, // Endpoint URL
      events: webhook.events || [], // order.created, product.updated, etc.
      status: webhook.status || "active", // active, paused, disabled
      secret: webhook.secret || this.generateSecret(),
      headers: webhook.headers || {},
      retry_policy: {
        max_retries: webhook.max_retries || 3,
        retry_delay: webhook.retry_delay || 60, // seconds
      },
      stats: {
        total_deliveries: 0,
        successful: 0,
        failed: 0,
        last_delivery_at: null,
      },
    };

    await kv.set(id, newWebhook);
    return c.json({ webhook: newWebhook });
  } catch (error) {
    return c.json({ error: "Error creating webhook" }, 500);
  }
});

// Helper: Generate secret
function generateSecret(): string {
  return `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

// Get webhooks
app.get("/make-server-0dd48dc4/webhooks", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const webhooks = [];

    for await (const entry of kv.list({ prefix: "webhook:" })) {
      const webhook = entry.value as any;
      if (webhook.entity_id === entity_id) {
        if (status && webhook.status !== status) continue;
        webhooks.push(webhook);
      }
    }

    return c.json({ webhooks, total: webhooks.length });
  } catch (error) {
    return c.json({ error: "Error fetching webhooks" }, 500);
  }
});

// Update webhook
app.patch("/make-server-0dd48dc4/webhooks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const webhook = await kv.get(id);

    if (!webhook.value) {
      return c.json({ error: "Webhook not found" }, 404);
    }

    const updatedWebhook = {
      ...webhook.value,
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedWebhook);
    return c.json({ webhook: updatedWebhook });
  } catch (error) {
    return c.json({ error: "Error updating webhook" }, 500);
  }
});

// Delete webhook
app.delete("/make-server-0dd48dc4/webhooks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const webhook = await kv.get(id);

    if (!webhook.value) {
      return c.json({ error: "Webhook not found" }, 404);
    }

    await kv.delete(id);
    return c.json({ message: "Webhook deleted successfully" });
  } catch (error) {
    return c.json({ error: "Error deleting webhook" }, 500);
  }
});

// Test webhook
app.post("/make-server-0dd48dc4/webhooks/:id/test", async (c) => {
  try {
    const id = c.req.param("id");
    const webhook = await kv.get(id);

    if (!webhook.value) {
      return c.json({ error: "Webhook not found" }, 404);
    }

    const testPayload = {
      event: "webhook.test",
      timestamp: new Date().toISOString(),
      data: { message: "This is a test webhook" },
    };

    const delivery = await this.deliverWebhook(webhook.value, testPayload);
    
    return c.json({ message: "Test webhook sent", delivery });
  } catch (error) {
    return c.json({ error: "Error testing webhook" }, 500);
  }
});

// Helper: Deliver webhook
async function deliverWebhook(webhook: any, payload: any): Promise<any> {
  const delivery_id = `delivery:${Date.now()}`;
  const timestamp = new Date().toISOString();

  try {
    // Simulate webhook delivery (in production, use fetch())
    const delivery = {
      id: delivery_id,
      webhook_id: webhook.id,
      event: payload.event,
      payload,
      status: "success",
      http_status: 200,
      response: { success: true },
      attempts: 1,
      delivered_at: timestamp,
      created_at: timestamp,
    };

    await kv.set(delivery_id, delivery);

    // Update webhook stats
    webhook.stats.total_deliveries += 1;
    webhook.stats.successful += 1;
    webhook.stats.last_delivery_at = timestamp;
    await kv.set(webhook.id, webhook);

    return delivery;
  } catch (error) {
    const delivery = {
      id: delivery_id,
      webhook_id: webhook.id,
      event: payload.event,
      payload,
      status: "failed",
      http_status: 0,
      error: error.message,
      attempts: 1,
      created_at: timestamp,
    };

    await kv.set(delivery_id, delivery);

    webhook.stats.total_deliveries += 1;
    webhook.stats.failed += 1;
    await kv.set(webhook.id, webhook);

    return delivery;
  }
}

// ==========================================
// DELIVERIES - Historial de Entregas
// ==========================================

// Get webhook deliveries
app.get("/make-server-0dd48dc4/webhooks/:id/deliveries", async (c) => {
  try {
    const webhook_id = c.req.param("id");
    const deliveries = [];

    for await (const entry of kv.list({ prefix: "delivery:" })) {
      const delivery = entry.value as any;
      if (delivery.webhook_id === webhook_id) deliveries.push(delivery);
    }

    deliveries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ deliveries, total: deliveries.length });
  } catch (error) {
    return c.json({ error: "Error fetching deliveries" }, 500);
  }
});

// Retry failed delivery
app.post("/make-server-0dd48dc4/webhooks/deliveries/:id/retry", async (c) => {
  try {
    const delivery_id = c.req.param("id");
    const delivery = await kv.get(delivery_id);

    if (!delivery.value) {
      return c.json({ error: "Delivery not found" }, 404);
    }

    if (delivery.value.status === "success") {
      return c.json({ error: "Delivery already successful" }, 400);
    }

    const webhook = await kv.get(delivery.value.webhook_id);
    if (!webhook.value) {
      return c.json({ error: "Webhook not found" }, 404);
    }

    const newDelivery = await this.deliverWebhook(webhook.value, delivery.value.payload);
    
    return c.json({ message: "Delivery retried", delivery: newDelivery });
  } catch (error) {
    return c.json({ error: "Error retrying delivery" }, 500);
  }
});

// ==========================================
// EVENTS - Disparar Webhooks
// ==========================================

// Trigger webhook event
app.post("/make-server-0dd48dc4/webhooks/trigger", async (c) => {
  try {
    const { event_name, data } = await c.req.json();
    const entity_id = data.entity_id || "default";
    const webhooks = [];

    // Find webhooks subscribed to this event
    for await (const entry of kv.list({ prefix: "webhook:" })) {
      const webhook = entry.value as any;
      if (webhook.entity_id === entity_id && 
          webhook.status === "active" && 
          webhook.events.includes(event_name)) {
        webhooks.push(webhook);
      }
    }

    const payload = {
      event: event_name,
      timestamp: new Date().toISOString(),
      data,
    };

    // Deliver to all subscribed webhooks
    const deliveries = [];
    for (const webhook of webhooks) {
      const delivery = await this.deliverWebhook(webhook, payload);
      deliveries.push(delivery);
    }

    return c.json({ 
      message: `Triggered ${webhooks.length} webhooks`,
      deliveries 
    });
  } catch (error) {
    return c.json({ error: "Error triggering webhooks" }, 500);
  }
});

// ==========================================
// SIGNATURE - Validación de Firmas
// ==========================================

// Verify webhook signature
app.post("/make-server-0dd48dc4/webhooks/verify-signature", async (c) => {
  try {
    const { webhook_id, payload, signature } = await c.req.json();
    const webhook = await kv.get(webhook_id);

    if (!webhook.value) {
      return c.json({ error: "Webhook not found" }, 404);
    }

    // Simulate signature verification (in production, use crypto)
    const expectedSignature = `sha256=${webhook.value.secret}`;
    const isValid = signature === expectedSignature;

    return c.json({ valid: isValid });
  } catch (error) {
    return c.json({ error: "Error verifying signature" }, 500);
  }
});

// Dashboard
app.get("/make-server-0dd48dc4/webhooks/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const webhooks = [];
    const deliveries = [];

    for await (const entry of kv.list({ prefix: "webhook:" })) {
      const webhook = entry.value as any;
      if (webhook.entity_id === entity_id) webhooks.push(webhook);
    }

    for await (const entry of kv.list({ prefix: "delivery:" })) {
      deliveries.push(entry.value);
    }

    const dashboard = {
      webhooks: {
        total: webhooks.length,
        active: webhooks.filter(w => w.status === "active").length,
        paused: webhooks.filter(w => w.status === "paused").length,
      },
      deliveries: {
        total: deliveries.length,
        successful: deliveries.filter(d => d.status === "success").length,
        failed: deliveries.filter(d => d.status === "failed").length,
        success_rate: deliveries.length > 0 
          ? (deliveries.filter(d => d.status === "success").length / deliveries.length) * 100 
          : 0,
      },
      recent_deliveries: deliveries.slice(-10).reverse(),
    };

    return c.json({ dashboard });
  } catch (error) {
    return c.json({ error: "Error fetching webhooks dashboard" }, 500);
  }
});

export default app;
