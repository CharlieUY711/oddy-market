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
    const id = `webhook:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newWebhook = {
      ...webhook,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: webhook.status || "active", // active, inactive
      events: webhook.events || [], // order.created, invoice.paid, etc.
      secret: webhook.secret || `whsec_${Math.random().toString(36).substring(2)}`,
      retries: webhook.retries || 3,
      stats: { total_calls: 0, successful: 0, failed: 0 },
    };

    await kv.set(id, newWebhook);
    return c.json({ webhook: newWebhook });
  } catch (error) {
    return c.json({ error: "Error creating webhook" }, 500);
  }
});

// Get webhooks
app.get("/make-server-0dd48dc4/webhooks", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const webhooks = [];

    for await (const entry of kv.list({ prefix: "webhook:" })) {
      const webhook = entry.value as any;
      if (webhook.entity_id === entity_id) webhooks.push(webhook);
    }

    return c.json({ webhooks, total: webhooks.length });
  } catch (error) {
    return c.json({ error: "Error fetching webhooks" }, 500);
  }
});

// Trigger webhook (simulate)
app.post("/make-server-0dd48dc4/webhooks/trigger", async (c) => {
  try {
    const { event, data } = await c.req.json();
    const entity_id = data.entity_id || "default";

    // Find webhooks subscribed to this event
    const webhooks = [];
    for await (const entry of kv.list({ prefix: "webhook:" })) {
      const webhook = entry.value as any;
      if (webhook.entity_id === entity_id && webhook.events.includes(event) && webhook.status === "active") {
        webhooks.push(webhook);
      }
    }

    // Log webhook call
    const log_id = `webhook_log:${Date.now()}`;
    const log = {
      id: log_id,
      event,
      data,
      webhooks_triggered: webhooks.length,
      timestamp: new Date().toISOString(),
    };
    await kv.set(log_id, log);

    return c.json({ message: `Triggered ${webhooks.length} webhooks`, log });
  } catch (error) {
    return c.json({ error: "Error triggering webhook" }, 500);
  }
});

// Get webhook logs
app.get("/make-server-0dd48dc4/webhooks/:id/logs", async (c) => {
  try {
    const webhook_id = c.req.param("id");
    const logs = [];

    for await (const entry of kv.list({ prefix: "webhook_log:" })) {
      const log = entry.value as any;
      logs.push(log);
    }

    return c.json({ logs: logs.slice(-50), total: logs.length });
  } catch (error) {
    return c.json({ error: "Error fetching webhook logs" }, 500);
  }
});

export default app;
