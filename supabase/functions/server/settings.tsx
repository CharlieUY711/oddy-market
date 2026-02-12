import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// Get settings
app.get("/make-server-0dd48dc4/settings", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const settings_id = `settings:${entity_id}`;
    const settings = await kv.get(settings_id);

    if (!settings.value) {
      const defaultSettings = {
        entity_id,
        general: { timezone: "UTC", language: "es", currency: "USD" },
        notifications: { email: true, sms: false, push: true },
        security: { two_factor: false, session_timeout: 3600 },
        integrations: {},
        updated_at: new Date().toISOString(),
      };
      await kv.set(settings_id, defaultSettings);
      return c.json({ settings: defaultSettings });
    }

    return c.json({ settings: settings.value });
  } catch (error) {
    return c.json({ error: "Error fetching settings" }, 500);
  }
});

// Update settings
app.patch("/make-server-0dd48dc4/settings", async (c) => {
  try {
    const updates = await c.req.json();
    const entity_id = updates.entity_id || "default";
    const settings_id = `settings:${entity_id}`;
    const settings = await kv.get(settings_id);

    const updatedSettings = {
      ...(settings.value || {}),
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await kv.set(settings_id, updatedSettings);
    return c.json({ settings: updatedSettings });
  } catch (error) {
    return c.json({ error: "Error updating settings" }, 500);
  }
});

export default app;
