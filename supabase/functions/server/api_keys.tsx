import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// API KEYS - Gestión de Claves API
// ==========================================

// Create API key
app.post("/make-server-0dd48dc4/api-keys", async (c) => {
  try {
    const apiKey = await c.req.json();
    const id = `apikey:${Date.now()}`;
    const key = `sk_${Math.random().toString(36).substring(2)}_${Math.random().toString(36).substring(2)}`;
    const timestamp = new Date().toISOString();

    const newApiKey = {
      ...apiKey,
      id,
      key,
      created_at: timestamp,
      last_used_at: null,
      status: "active",
      permissions: apiKey.permissions || ["read"],
      rate_limit: apiKey.rate_limit || 1000,
      usage_count: 0,
    };

    await kv.set(id, newApiKey);
    await kv.set(`apikey_lookup:${key}`, id);
    return c.json({ api_key: newApiKey });
  } catch (error) {
    return c.json({ error: "Error creating API key" }, 500);
  }
});

// Get API keys
app.get("/make-server-0dd48dc4/api-keys", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const apiKeys = [];

    for await (const entry of kv.list({ prefix: "apikey:" })) {
      const key = entry.value as any;
      if (key.entity_id === entity_id) {
        apiKeys.push({ ...key, key: key.key.substring(0, 12) + "..." }); // Mask key
      }
    }

    return c.json({ api_keys: apiKeys, total: apiKeys.length });
  } catch (error) {
    return c.json({ error: "Error fetching API keys" }, 500);
  }
});

// Revoke API key
app.delete("/make-server-0dd48dc4/api-keys/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const apiKey = await kv.get(id);

    if (!apiKey.value) {
      return c.json({ error: "API key not found" }, 404);
    }

    apiKey.value.status = "revoked";
    apiKey.value.revoked_at = new Date().toISOString();
    await kv.set(id, apiKey.value);

    return c.json({ message: "API key revoked successfully" });
  } catch (error) {
    return c.json({ error: "Error revoking API key" }, 500);
  }
});

// Validate API key
app.post("/make-server-0dd48dc4/api-keys/validate", async (c) => {
  try {
    const { key } = await c.req.json();
    const lookup = await kv.get(`apikey_lookup:${key}`);

    if (!lookup.value) {
      return c.json({ valid: false, error: "Invalid API key" }, 401);
    }

    const apiKey = await kv.get(lookup.value);
    if (!apiKey.value || apiKey.value.status !== "active") {
      return c.json({ valid: false, error: "API key inactive" }, 401);
    }

    // Update usage
    apiKey.value.usage_count = (apiKey.value.usage_count || 0) + 1;
    apiKey.value.last_used_at = new Date().toISOString();
    await kv.set(lookup.value, apiKey.value);

    return c.json({ valid: true, permissions: apiKey.value.permissions });
  } catch (error) {
    return c.json({ error: "Error validating API key" }, 500);
  }
});

export default app;
