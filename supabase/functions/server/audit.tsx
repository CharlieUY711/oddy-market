import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// Log audit event
app.post("/make-server-0dd48dc4/audit/log", async (c) => {
  try {
    const event = await c.req.json();
    const id = `audit:${Date.now()}`;
    
    const auditLog = {
      ...event,
      id,
      timestamp: new Date().toISOString(),
      ip_address: c.req.header("x-forwarded-for") || "unknown",
      user_agent: c.req.header("user-agent"),
    };

    await kv.set(id, auditLog);
    return c.json({ audit_log: auditLog });
  } catch (error) {
    return c.json({ error: "Error logging audit event" }, 500);
  }
});

// Get audit logs
app.get("/make-server-0dd48dc4/audit/logs", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const user_id = c.req.query("user_id");
    const action = c.req.query("action");
    const logs = [];

    for await (const entry of kv.list({ prefix: "audit:" })) {
      const log = entry.value as any;
      if (log.entity_id === entity_id) {
        if (user_id && log.user_id !== user_id) continue;
        if (action && log.action !== action) continue;
        logs.push(log);
      }
    }

    return c.json({ logs: logs.slice(-100), total: logs.length });
  } catch (error) {
    return c.json({ error: "Error fetching audit logs" }, 500);
  }
});

export default app;
