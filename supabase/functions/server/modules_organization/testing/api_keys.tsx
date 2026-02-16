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
    const id = apiKey.id || `api_key:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const key = this.generateApiKey();

    const newApiKey = {
      ...apiKey,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      key, // The actual API key
      key_prefix: key.substring(0, 12), // For display purposes
      name: apiKey.name,
      description: apiKey.description || "",
      status: apiKey.status || "active", // active, revoked, expired
      permissions: apiKey.permissions || ["read"], // read, write, delete, admin
      scope: apiKey.scope || "all", // all, products, orders, etc.
      rate_limit: {
        requests_per_minute: apiKey.rate_limit || 60,
        requests_per_day: apiKey.rate_limit_day || 10000,
      },
      expires_at: apiKey.expires_at || null,
      last_used_at: null,
      usage: {
        total_requests: 0,
        last_24h: 0,
        last_30d: 0,
      },
    };

    await kv.set(id, newApiKey);
    
    // Also store by key for quick lookup
    await kv.set(`key:${key}`, { id, entity_id: newApiKey.entity_id });

    return c.json({ api_key: newApiKey });
  } catch (error) {
    return c.json({ error: "Error creating API key" }, 500);
  }
});

// Helper: Generate API key
function generateApiKey(): string {
  const prefix = "oddy_";
  const random = Array.from({ length: 32 }, () => 
    Math.random().toString(36).substring(2, 3)
  ).join("");
  return `${prefix}${random}`;
}

// Get API keys
app.get("/make-server-0dd48dc4/api-keys", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const apiKeys = [];

    for await (const entry of kv.list({ prefix: "api_key:" })) {
      const apiKey = entry.value as any;
      if (apiKey.entity_id === entity_id) {
        if (status && apiKey.status !== status) continue;
        
        // Don't return the full key, only the prefix
        const sanitized = {
          ...apiKey,
          key: undefined,
          key_display: `${apiKey.key_prefix}...`,
        };
        apiKeys.push(sanitized);
      }
    }

    return c.json({ api_keys: apiKeys, total: apiKeys.length });
  } catch (error) {
    return c.json({ error: "Error fetching API keys" }, 500);
  }
});

// Get API key by ID (with full key - use carefully)
app.get("/make-server-0dd48dc4/api-keys/:id/reveal", async (c) => {
  try {
    const id = c.req.param("id");
    const apiKey = await kv.get(id);

    if (!apiKey.value) {
      return c.json({ error: "API key not found" }, 404);
    }

    return c.json({ api_key: apiKey.value });
  } catch (error) {
    return c.json({ error: "Error fetching API key" }, 500);
  }
});

// Revoke API key
app.post("/make-server-0dd48dc4/api-keys/:id/revoke", async (c) => {
  try {
    const id = c.req.param("id");
    const apiKey = await kv.get(id);

    if (!apiKey.value) {
      return c.json({ error: "API key not found" }, 404);
    }

    apiKey.value.status = "revoked";
    apiKey.value.revoked_at = new Date().toISOString();
    apiKey.value.updated_at = new Date().toISOString();

    await kv.set(id, apiKey.value);

    // Remove from quick lookup
    await kv.delete(`key:${apiKey.value.key}`);

    return c.json({ message: "API key revoked successfully", api_key: apiKey.value });
  } catch (error) {
    return c.json({ error: "Error revoking API key" }, 500);
  }
});

// Rotate API key (create new, revoke old)
app.post("/make-server-0dd48dc4/api-keys/:id/rotate", async (c) => {
  try {
    const id = c.req.param("id");
    const oldKey = await kv.get(id);

    if (!oldKey.value) {
      return c.json({ error: "API key not found" }, 404);
    }

    // Create new key
    const newKeyValue = this.generateApiKey();
    const timestamp = new Date().toISOString();
    
    const newKey = {
      ...oldKey.value,
      id: `api_key:${Date.now()}`,
      key: newKeyValue,
      key_prefix: newKeyValue.substring(0, 12),
      created_at: timestamp,
      updated_at: timestamp,
      usage: {
        total_requests: 0,
        last_24h: 0,
        last_30d: 0,
      },
    };

    await kv.set(newKey.id, newKey);
    await kv.set(`key:${newKeyValue}`, { id: newKey.id, entity_id: newKey.entity_id });

    // Revoke old key
    oldKey.value.status = "revoked";
    oldKey.value.revoked_at = timestamp;
    oldKey.value.updated_at = timestamp;
    await kv.set(id, oldKey.value);
    await kv.delete(`key:${oldKey.value.key}`);

    return c.json({ 
      message: "API key rotated successfully", 
      old_key: { ...oldKey.value, key: undefined },
      new_key: newKey 
    });
  } catch (error) {
    return c.json({ error: "Error rotating API key" }, 500);
  }
});

// ==========================================
// VALIDATION - Validar API Key
// ==========================================

// Validate API key
app.post("/make-server-0dd48dc4/api-keys/validate", async (c) => {
  try {
    const { api_key } = await c.req.json();
    
    const keyLookup = await kv.get(`key:${api_key}`);
    if (!keyLookup.value) {
      return c.json({ valid: false, error: "Invalid API key" }, 401);
    }

    const apiKeyData = await kv.get(keyLookup.value.id);
    if (!apiKeyData.value) {
      return c.json({ valid: false, error: "API key not found" }, 404);
    }

    // Check status
    if (apiKeyData.value.status !== "active") {
      return c.json({ valid: false, error: "API key is not active" }, 401);
    }

    // Check expiration
    if (apiKeyData.value.expires_at && new Date(apiKeyData.value.expires_at) < new Date()) {
      return c.json({ valid: false, error: "API key has expired" }, 401);
    }

    // Update last used
    apiKeyData.value.last_used_at = new Date().toISOString();
    apiKeyData.value.usage.total_requests += 1;
    apiKeyData.value.usage.last_24h += 1;
    apiKeyData.value.usage.last_30d += 1;
    await kv.set(keyLookup.value.id, apiKeyData.value);

    return c.json({ 
      valid: true, 
      entity_id: apiKeyData.value.entity_id,
      permissions: apiKeyData.value.permissions,
      scope: apiKeyData.value.scope,
    });
  } catch (error) {
    return c.json({ error: "Error validating API key" }, 500);
  }
});

// Check permissions
app.post("/make-server-0dd48dc4/api-keys/check-permission", async (c) => {
  try {
    const { api_key, required_permission, resource } = await c.req.json();
    
    const keyLookup = await kv.get(`key:${api_key}`);
    if (!keyLookup.value) {
      return c.json({ authorized: false, error: "Invalid API key" }, 401);
    }

    const apiKeyData = await kv.get(keyLookup.value.id);
    if (!apiKeyData.value || apiKeyData.value.status !== "active") {
      return c.json({ authorized: false, error: "API key not authorized" }, 401);
    }

    // Check permissions
    const hasPermission = apiKeyData.value.permissions.includes(required_permission) ||
                         apiKeyData.value.permissions.includes("admin");

    // Check scope
    const hasScope = apiKeyData.value.scope === "all" || 
                     apiKeyData.value.scope === resource;

    return c.json({ 
      authorized: hasPermission && hasScope,
      permissions: apiKeyData.value.permissions,
      scope: apiKeyData.value.scope,
    });
  } catch (error) {
    return c.json({ error: "Error checking permission" }, 500);
  }
});

// ==========================================
// USAGE - Uso y Estadísticas
// ==========================================

// Get API key usage
app.get("/make-server-0dd48dc4/api-keys/:id/usage", async (c) => {
  try {
    const id = c.req.param("id");
    const apiKey = await kv.get(id);

    if (!apiKey.value) {
      return c.json({ error: "API key not found" }, 404);
    }

    const usage = {
      api_key_id: id,
      api_key_name: apiKey.value.name,
      total_requests: apiKey.value.usage.total_requests,
      last_24h: apiKey.value.usage.last_24h,
      last_30d: apiKey.value.usage.last_30d,
      last_used_at: apiKey.value.last_used_at,
      rate_limit: apiKey.value.rate_limit,
    };

    return c.json({ usage });
  } catch (error) {
    return c.json({ error: "Error fetching usage" }, 500);
  }
});

// Get all usage stats
app.get("/make-server-0dd48dc4/api-keys/usage/stats", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const apiKeys = [];

    for await (const entry of kv.list({ prefix: "api_key:" })) {
      const apiKey = entry.value as any;
      if (apiKey.entity_id === entity_id) apiKeys.push(apiKey);
    }

    const stats = {
      total_keys: apiKeys.length,
      active_keys: apiKeys.filter(k => k.status === "active").length,
      total_requests: apiKeys.reduce((sum, k) => sum + (k.usage?.total_requests || 0), 0),
      requests_last_24h: apiKeys.reduce((sum, k) => sum + (k.usage?.last_24h || 0), 0),
      requests_last_30d: apiKeys.reduce((sum, k) => sum + (k.usage?.last_30d || 0), 0),
      top_keys: apiKeys
        .sort((a, b) => (b.usage?.total_requests || 0) - (a.usage?.total_requests || 0))
        .slice(0, 5)
        .map(k => ({
          name: k.name,
          key_prefix: k.key_prefix,
          total_requests: k.usage?.total_requests || 0,
        })),
    };

    return c.json({ stats });
  } catch (error) {
    return c.json({ error: "Error fetching usage stats" }, 500);
  }
});

// Dashboard
app.get("/make-server-0dd48dc4/api-keys/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const apiKeys = [];

    for await (const entry of kv.list({ prefix: "api_key:" })) {
      const apiKey = entry.value as any;
      if (apiKey.entity_id === entity_id) apiKeys.push(apiKey);
    }

    const dashboard = {
      total_keys: apiKeys.length,
      active: apiKeys.filter(k => k.status === "active").length,
      revoked: apiKeys.filter(k => k.status === "revoked").length,
      expired: apiKeys.filter(k => k.status === "expired").length,
      total_requests: apiKeys.reduce((sum, k) => sum + (k.usage?.total_requests || 0), 0),
      requests_today: apiKeys.reduce((sum, k) => sum + (k.usage?.last_24h || 0), 0),
    };

    return c.json({ dashboard });
  } catch (error) {
    return c.json({ error: "Error fetching API keys dashboard" }, 500);
  }
});

export default app;
