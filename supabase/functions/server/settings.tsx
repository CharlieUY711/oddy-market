import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// SETTINGS - Configuración del Sistema
// ==========================================

// Get all settings
app.get("/make-server-0dd48dc4/settings", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const category = c.req.query("category"); // general, security, notifications, etc.
    
    const settings_id = `settings:${entity_id}`;
    const settings = await kv.get(settings_id);

    if (!settings.value) {
      // Return default settings
      const defaultSettings = this.getDefaultSettings(entity_id);
      await kv.set(settings_id, defaultSettings);
      return c.json({ settings: defaultSettings });
    }

    if (category) {
      return c.json({ settings: settings.value[category] || {} });
    }

    return c.json({ settings: settings.value });
  } catch (error) {
    return c.json({ error: "Error fetching settings" }, 500);
  }
});

// Helper: Default settings
function getDefaultSettings(entity_id: string): any {
  return {
    entity_id,
    general: {
      company_name: "",
      timezone: "UTC",
      date_format: "YYYY-MM-DD",
      currency: "USD",
      language: "es",
    },
    security: {
      password_min_length: 8,
      require_2fa: false,
      session_timeout: 30, // minutes
      allowed_ips: [],
    },
    notifications: {
      email_enabled: true,
      sms_enabled: false,
      push_enabled: true,
    },
    integrations: {
      mercadolibre_enabled: false,
      whatsapp_enabled: false,
      facebook_enabled: false,
    },
    billing: {
      tax_included: true,
      default_tax_rate: 22,
      invoice_prefix: "INV",
    },
    updated_at: new Date().toISOString(),
  };
}

// Update settings
app.patch("/make-server-0dd48dc4/settings", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const updates = await c.req.json();
    
    const settings_id = `settings:${entity_id}`;
    const settings = await kv.get(settings_id);

    const updatedSettings = {
      ...(settings.value || this.getDefaultSettings(entity_id)),
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await kv.set(settings_id, updatedSettings);
    return c.json({ settings: updatedSettings });
  } catch (error) {
    return c.json({ error: "Error updating settings" }, 500);
  }
});

// Update specific category
app.patch("/make-server-0dd48dc4/settings/:category", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const category = c.req.param("category");
    const updates = await c.req.json();
    
    const settings_id = `settings:${entity_id}`;
    const settings = await kv.get(settings_id);

    const currentSettings = settings.value || this.getDefaultSettings(entity_id);
    currentSettings[category] = {
      ...currentSettings[category],
      ...updates,
    };
    currentSettings.updated_at = new Date().toISOString();

    await kv.set(settings_id, currentSettings);
    return c.json({ settings: currentSettings[category] });
  } catch (error) {
    return c.json({ error: "Error updating settings category" }, 500);
  }
});

// Reset to defaults
app.post("/make-server-0dd48dc4/settings/reset", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const settings_id = `settings:${entity_id}`;
    
    const defaultSettings = this.getDefaultSettings(entity_id);
    await kv.set(settings_id, defaultSettings);
    
    return c.json({ message: "Settings reset to defaults", settings: defaultSettings });
  } catch (error) {
    return c.json({ error: "Error resetting settings" }, 500);
  }
});

export default app;
