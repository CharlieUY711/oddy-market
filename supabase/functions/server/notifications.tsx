import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// NOTIFICATIONS - Sistema de Notificaciones
// ==========================================

// Send notification
app.post("/make-server-0dd48dc4/notifications/send", async (c) => {
  try {
    const notification = await c.req.json();
    const id = `notification:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newNotification = {
      ...notification,
      id,
      created_at: timestamp,
      type: notification.type || "info", // info, warning, error, success
      channel: notification.channel || "in_app", // in_app, email, sms, push
      status: "pending",
      sent_at: null,
      read_at: null,
    };

    await kv.set(id, newNotification);

    // Simulate sending based on channel
    if (notification.channel === "in_app") {
      newNotification.status = "sent";
      newNotification.sent_at = timestamp;
      await kv.set(id, newNotification);
    }

    return c.json({ notification: newNotification });
  } catch (error) {
    return c.json({ error: "Error sending notification" }, 500);
  }
});

// Get user notifications
app.get("/make-server-0dd48dc4/notifications/user/:user_id", async (c) => {
  try {
    const user_id = c.req.param("user_id");
    const unread_only = c.req.query("unread_only") === "true";
    const notifications = [];

    for await (const entry of kv.list({ prefix: "notification:" })) {
      const notif = entry.value as any;
      if (notif.user_id === user_id) {
        if (unread_only && notif.read_at) continue;
        notifications.push(notif);
      }
    }

    return c.json({ notifications, total: notifications.length });
  } catch (error) {
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

    notification.value.read_at = new Date().toISOString();
    await kv.set(id, notification.value);

    return c.json({ notification: notification.value });
  } catch (error) {
    return c.json({ error: "Error marking notification as read" }, 500);
  }
});

// Get notification preferences
app.get("/make-server-0dd48dc4/notifications/preferences/:user_id", async (c) => {
  try {
    const user_id = c.req.param("user_id");
    const pref_id = `notification_preferences:${user_id}`;
    const preferences = await kv.get(pref_id);

    if (!preferences.value) {
      const defaultPreferences = {
        user_id,
        email: { enabled: true, frequency: "immediate" },
        sms: { enabled: false },
        push: { enabled: true },
        in_app: { enabled: true },
      };
      await kv.set(pref_id, defaultPreferences);
      return c.json({ preferences: defaultPreferences });
    }

    return c.json({ preferences: preferences.value });
  } catch (error) {
    return c.json({ error: "Error fetching preferences" }, 500);
  }
});

// Update preferences
app.patch("/make-server-0dd48dc4/notifications/preferences/:user_id", async (c) => {
  try {
    const user_id = c.req.param("user_id");
    const updates = await c.req.json();
    const pref_id = `notification_preferences:${user_id}`;
    const preferences = await kv.get(pref_id);

    const updatedPreferences = {
      ...(preferences.value || {}),
      ...updates,
      user_id,
      updated_at: new Date().toISOString(),
    };

    await kv.set(pref_id, updatedPreferences);
    return c.json({ preferences: updatedPreferences });
  } catch (error) {
    return c.json({ error: "Error updating preferences" }, 500);
  }
});

export default app;
