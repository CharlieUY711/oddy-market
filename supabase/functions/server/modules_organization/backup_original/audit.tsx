import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// AUDIT LOGS - Logs de Auditoría
// ==========================================

// Create audit log
app.post("/make-server-0dd48dc4/audit/logs", async (c) => {
  try {
    const log = await c.req.json();
    const id = log.id || `audit:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newLog = {
      ...log,
      id,
      timestamp,
      action: log.action, // create, read, update, delete, login, logout, etc.
      resource_type: log.resource_type, // user, product, order, etc.
      resource_id: log.resource_id || null,
      user_id: log.user_id,
      user_email: log.user_email || null,
      ip_address: log.ip_address || c.req.header("x-forwarded-for") || "unknown",
      user_agent: log.user_agent || c.req.header("user-agent") || "unknown",
      changes: log.changes || null, // { before: {}, after: {} }
      status: log.status || "success", // success, failed, error
      error_message: log.error_message || null,
      metadata: log.metadata || {},
    };

    await kv.set(id, newLog);
    return c.json({ log: newLog });
  } catch (error) {
    console.log("Error creating audit log:", error);
    return c.json({ error: "Error creating audit log" }, 500);
  }
});

// Get audit logs
app.get("/make-server-0dd48dc4/audit/logs", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const user_id = c.req.query("user_id");
    const resource_type = c.req.query("resource_type");
    const resource_id = c.req.query("resource_id");
    const action = c.req.query("action");
    const start_date = c.req.query("start_date");
    const end_date = c.req.query("end_date");
    const logs = [];

    for await (const entry of kv.list({ prefix: "audit:" })) {
      const log = entry.value as any;
      if (log.entity_id === entity_id) {
        if (user_id && log.user_id !== user_id) continue;
        if (resource_type && log.resource_type !== resource_type) continue;
        if (resource_id && log.resource_id !== resource_id) continue;
        if (action && log.action !== action) continue;
        
        if (start_date && end_date) {
          const logDate = new Date(log.timestamp);
          if (logDate < new Date(start_date) || logDate > new Date(end_date)) continue;
        }
        
        logs.push(log);
      }
    }

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({ logs, total: logs.length });
  } catch (error) {
    console.log("Error fetching audit logs:", error);
    return c.json({ error: "Error fetching audit logs" }, 500);
  }
});

// Get audit trail for specific resource
app.get("/make-server-0dd48dc4/audit/trail/:resource_type/:resource_id", async (c) => {
  try {
    const resource_type = c.req.param("resource_type");
    const resource_id = c.req.param("resource_id");
    const logs = [];

    for await (const entry of kv.list({ prefix: "audit:" })) {
      const log = entry.value as any;
      if (log.resource_type === resource_type && log.resource_id === resource_id) {
        logs.push(log);
      }
    }

    // Sort chronologically
    logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return c.json({ resource_type, resource_id, trail: logs, total: logs.length });
  } catch (error) {
    console.log("Error fetching audit trail:", error);
    return c.json({ error: "Error fetching audit trail" }, 500);
  }
});

// Get user activity
app.get("/make-server-0dd48dc4/audit/users/:user_id/activity", async (c) => {
  try {
    const user_id = c.req.param("user_id");
    const logs = [];

    for await (const entry of kv.list({ prefix: "audit:" })) {
      const log = entry.value as any;
      if (log.user_id === user_id) logs.push(log);
    }

    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({ user_id, activity: logs, total: logs.length });
  } catch (error) {
    console.log("Error fetching user activity:", error);
    return c.json({ error: "Error fetching user activity" }, 500);
  }
});

// ==========================================
// COMPLIANCE - Reportes de Cumplimiento
// ==========================================

// Get compliance report
app.get("/make-server-0dd48dc4/audit/compliance/report", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const start_date = c.req.query("start_date");
    const end_date = c.req.query("end_date");
    const logs = [];

    for await (const entry of kv.list({ prefix: "audit:" })) {
      const log = entry.value as any;
      if (log.entity_id === entity_id) {
        if (start_date && end_date) {
          const logDate = new Date(log.timestamp);
          if (logDate >= new Date(start_date) && logDate <= new Date(end_date)) {
            logs.push(log);
          }
        } else {
          logs.push(log);
        }
      }
    }

    const report = {
      period: { start_date, end_date },
      total_actions: logs.length,
      by_action: this.groupBy(logs, "action"),
      by_user: this.groupBy(logs, "user_id"),
      by_resource: this.groupBy(logs, "resource_type"),
      failed_actions: logs.filter((l) => l.status === "failed").length,
      sensitive_actions: logs.filter((l) => 
        ["delete", "update_permissions", "export_data"].includes(l.action)
      ).length,
    };

    return c.json({ report });
  } catch (error) {
    console.log("Error generating compliance report:", error);
    return c.json({ error: "Error generating compliance report" }, 500);
  }
});

// Helper: Group by field
function groupBy(array: any[], field: string): any {
  return array.reduce((acc, item) => {
    const key = item[field] || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

// ==========================================
// SECURITY - Eventos de Seguridad
// ==========================================

// Get security events
app.get("/make-server-0dd48dc4/audit/security/events", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const logs = [];

    const securityActions = [
      "login", "logout", "login_failed", "password_reset", 
      "permission_change", "role_change", "api_key_created",
      "api_key_deleted", "suspicious_activity"
    ];

    for await (const entry of kv.list({ prefix: "audit:" })) {
      const log = entry.value as any;
      if (log.entity_id === entity_id && securityActions.includes(log.action)) {
        logs.push(log);
      }
    }

    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({ events: logs, total: logs.length });
  } catch (error) {
    console.log("Error fetching security events:", error);
    return c.json({ error: "Error fetching security events" }, 500);
  }
});

// ==========================================
// STATISTICS - Estadísticas de Auditoría
// ==========================================

// Get audit statistics
app.get("/make-server-0dd48dc4/audit/statistics", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const logs = [];

    for await (const entry of kv.list({ prefix: "audit:" })) {
      const log = entry.value as any;
      if (log.entity_id === entity_id) logs.push(log);
    }

    const now = new Date();
    const last24h = logs.filter((l) => 
      (now.getTime() - new Date(l.timestamp).getTime()) < 24 * 60 * 60 * 1000
    );
    const last7d = logs.filter((l) => 
      (now.getTime() - new Date(l.timestamp).getTime()) < 7 * 24 * 60 * 60 * 1000
    );

    const statistics = {
      total_logs: logs.length,
      last_24h: last24h.length,
      last_7d: last7d.length,
      most_active_users: this.getTopUsers(logs),
      most_common_actions: this.getTopActions(logs),
      failure_rate: logs.length > 0 
        ? (logs.filter((l) => l.status === "failed").length / logs.length) * 100 
        : 0,
    };

    return c.json({ statistics });
  } catch (error) {
    console.log("Error fetching audit statistics:", error);
    return c.json({ error: "Error fetching audit statistics" }, 500);
  }
});

// Helper: Get top users
function getTopUsers(logs: any[]): any[] {
  const userCounts = this.groupBy(logs, "user_id");
  return Object.entries(userCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 10)
    .map(([user_id, count]) => ({ user_id, actions: count }));
}

// Helper: Get top actions
function getTopActions(logs: any[]): any[] {
  const actionCounts = this.groupBy(logs, "action");
  return Object.entries(actionCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 10)
    .map(([action, count]) => ({ action, count }));
}

// Dashboard
app.get("/make-server-0dd48dc4/audit/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const logs = [];

    for await (const entry of kv.list({ prefix: "audit:" })) {
      const log = entry.value as any;
      if (log.entity_id === entity_id) logs.push(log);
    }

    const now = new Date();
    const today = logs.filter((l) => 
      new Date(l.timestamp).toDateString() === now.toDateString()
    );

    const dashboard = {
      entity_id,
      total_logs: logs.length,
      today_logs: today.length,
      by_action: this.groupBy(logs, "action"),
      by_status: this.groupBy(logs, "status"),
      recent_logs: logs.slice(-20).reverse(),
    };

    return c.json({ dashboard });
  } catch (error) {
    console.log("Error fetching audit dashboard:", error);
    return c.json({ error: "Error fetching audit dashboard" }, 500);
  }
});

export default app;
