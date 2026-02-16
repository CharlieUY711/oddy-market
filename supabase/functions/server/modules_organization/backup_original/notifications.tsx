import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// NOTIFICATIONS - Sistema de Notificaciones
// ==========================================

// Create notification
app.post("/make-server-0dd48dc4/notifications", async (c) => {
  try {
    const notification = await c.req.json();
    const id = notification.id || `notification:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newNotification = {
      ...notification,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      type: notification.type || "info", // info, success, warning, error, alert
      channel: notification.channel || "in_app", // in_app, email, sms, push
      status: "pending", // pending, sent, delivered, failed, read
      priority: notification.priority || "normal", // low, normal, high, urgent
      recipient_id: notification.recipient_id,
      recipient_email: notification.recipient_email || null,
      recipient_phone: notification.recipient_phone || null,
      sent_at: null,
      delivered_at: null,
      read_at: null,
      metadata: notification.metadata || {},
    };

    await kv.set(id, newNotification);
    
    // Auto-send if immediate
    if (notification.send_immediately) {
      await this.sendNotification(id, newNotification);
    }

    return c.json({ notification: newNotification });
  } catch (error) {
    console.log("Error creating notification:", error);
    return c.json({ error: "Error creating notification" }, 500);
  }
});

// Helper: Send notification
async function sendNotification(id: string, notification: any) {
  // Simulate sending (in production, integrate with SendGrid, Twilio, FCM, etc.)
  notification.status = "sent";
  notification.sent_at = new Date().toISOString();
  
  // Simulate delivery
  setTimeout(async () => {
    notification.status = "delivered";
    notification.delivered_at = new Date().toISOString();
    await kv.set(id, notification);
  }, 100);

  await kv.set(id, notification);
}

// Get notifications
app.get("/make-server-0dd48dc4/notifications", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const recipient_id = c.req.query("recipient_id");
    const status = c.req.query("status");
    const type = c.req.query("type");
    const channel = c.req.query("channel");
    const unread_only = c.req.query("unread_only") === "true";
    const notifications = [];

    for await (const entry of kv.list({ prefix: "notification:" })) {
      const notif = entry.value as any;
      if (notif.entity_id === entity_id) {
        if (recipient_id && notif.recipient_id !== recipient_id) continue;
        if (status && notif.status !== status) continue;
        if (type && notif.type !== type) continue;
        if (channel && notif.channel !== channel) continue;
        if (unread_only && notif.read_at) continue;
        notifications.push(notif);
      }
    }

    return c.json({ notifications, total: notifications.length });
  } catch (error) {
    console.log("Error fetching notifications:", error);
    return c.json({ error: "Error fetching notifications" }, 500);
  }
});

// Mark as read
app.patch("/make-server-0dd48dc4/notifications/:id/read", async (c) => {
  try {
    const id = c.req.param("id");
    const notification = await kv.get(id);

    if (!notification.value) {
      return c.json({ error: "Notification not found" }, 404);
    }

    notification.value.status = "read";
    notification.value.read_at = new Date().toISOString();
    notification.value.updated_at = new Date().toISOString();

    await kv.set(id, notification.value);
    return c.json({ notification: notification.value });
  } catch (error) {
    console.log("Error marking notification as read:", error);
    return c.json({ error: "Error marking notification as read" }, 500);
  }
});

// Mark all as read
app.post("/make-server-0dd48dc4/notifications/read-all", async (c) => {
  try {
    const { recipient_id } = await c.req.json();
    let count = 0;

    for await (const entry of kv.list({ prefix: "notification:" })) {
      const notif = entry.value as any;
      if (notif.recipient_id === recipient_id && !notif.read_at) {
        notif.status = "read";
        notif.read_at = new Date().toISOString();
        notif.updated_at = new Date().toISOString();
        await kv.set(notif.id, notif);
        count++;
      }
    }

    return c.json({ message: `${count} notifications marked as read` });
  } catch (error) {
    console.log("Error marking all as read:", error);
    return c.json({ error: "Error marking all as read" }, 500);
  }
});

// Send bulk notifications
app.post("/make-server-0dd48dc4/notifications/bulk", async (c) => {
  try {
    const { recipient_ids, title, message, type, channel } = await c.req.json();
    const notifications = [];

    for (const recipient_id of recipient_ids) {
      const id = `notification:${Date.now()}_${recipient_id}`;
      const timestamp = new Date().toISOString();

      const notification = {
        id,
        entity_id: "default",
        recipient_id,
        title,
        message,
        type: type || "info",
        channel: channel || "in_app",
        status: "sent",
        priority: "normal",
        created_at: timestamp,
        sent_at: timestamp,
      };

      await kv.set(id, notification);
      notifications.push(notification);
    }

    return c.json({ notifications, total: notifications.length });
  } catch (error) {
    console.log("Error sending bulk notifications:", error);
    return c.json({ error: "Error sending bulk notifications" }, 500);
  }
});

// ==========================================
// TEMPLATES - Plantillas de Notificaciones
// ==========================================

// Create notification template
app.post("/make-server-0dd48dc4/notifications/templates", async (c) => {
  try {
    const template = await c.req.json();
    const id = template.id || `notif_template:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newTemplate = {
      ...template,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      variables: template.variables || [], // {{user_name}}, {{order_id}}, etc.
    };

    await kv.set(id, newTemplate);
    return c.json({ template: newTemplate });
  } catch (error) {
    console.log("Error creating notification template:", error);
    return c.json({ error: "Error creating notification template" }, 500);
  }
});

// Get templates
app.get("/make-server-0dd48dc4/notifications/templates", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const templates = [];

    for await (const entry of kv.list({ prefix: "notif_template:" })) {
      const template = entry.value as any;
      if (template.entity_id === entity_id) templates.push(template);
    }

    return c.json({ templates, total: templates.length });
  } catch (error) {
    console.log("Error fetching templates:", error);
    return c.json({ error: "Error fetching templates" }, 500);
  }
});

// ==========================================
// PREFERENCES - Preferencias de Usuario
// ==========================================

// Get user preferences
app.get("/make-server-0dd48dc4/notifications/preferences/:user_id", async (c) => {
  try {
    const user_id = c.req.param("user_id");
    const pref_id = `notif_pref:${user_id}`;
    const preferences = await kv.get(pref_id);

    if (!preferences.value) {
      // Default preferences
      const defaultPrefs = {
        id: pref_id,
        user_id,
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        in_app_enabled: true,
        categories: {
          orders: { email: true, push: true, sms: false },
          marketing: { email: true, push: false, sms: false },
          system: { email: true, push: true, sms: false },
        },
      };
      await kv.set(pref_id, defaultPrefs);
      return c.json({ preferences: defaultPrefs });
    }

    return c.json({ preferences: preferences.value });
  } catch (error) {
    console.log("Error fetching preferences:", error);
    return c.json({ error: "Error fetching preferences" }, 500);
  }
});

// Update user preferences
app.patch("/make-server-0dd48dc4/notifications/preferences/:user_id", async (c) => {
  try {
    const user_id = c.req.param("user_id");
    const updates = await c.req.json();
    const pref_id = `notif_pref:${user_id}`;
    const preferences = await kv.get(pref_id);

    const updatedPrefs = {
      ...(preferences.value || {}),
      ...updates,
      id: pref_id,
      user_id,
      updated_at: new Date().toISOString(),
    };

    await kv.set(pref_id, updatedPrefs);
    return c.json({ preferences: updatedPrefs });
  } catch (error) {
    console.log("Error updating preferences:", error);
    return c.json({ error: "Error updating preferences" }, 500);
  }
});

// Dashboard
app.get("/make-server-0dd48dc4/notifications/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const notifications = [];

    for await (const entry of kv.list({ prefix: "notification:" })) {
      const notif = entry.value as any;
      if (notif.entity_id === entity_id) notifications.push(notif);
    }

    const dashboard = {
      entity_id,
      total: notifications.length,
      by_status: {
        sent: notifications.filter((n) => n.status === "sent").length,
        delivered: notifications.filter((n) => n.status === "delivered").length,
        read: notifications.filter((n) => n.status === "read").length,
        failed: notifications.filter((n) => n.status === "failed").length,
      },
      by_channel: {
        email: notifications.filter((n) => n.channel === "email").length,
        sms: notifications.filter((n) => n.channel === "sms").length,
        push: notifications.filter((n) => n.channel === "push").length,
        in_app: notifications.filter((n) => n.channel === "in_app").length,
      },
      by_type: {
        info: notifications.filter((n) => n.type === "info").length,
        success: notifications.filter((n) => n.type === "success").length,
        warning: notifications.filter((n) => n.type === "warning").length,
        error: notifications.filter((n) => n.type === "error").length,
      },
    };

    return c.json({ dashboard });
  } catch (error) {
    console.log("Error fetching notifications dashboard:", error);
    return c.json({ error: "Error fetching notifications dashboard" }, 500);
  }
});

export default app;
