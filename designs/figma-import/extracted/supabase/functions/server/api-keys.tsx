import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Simple encryption (base64 + reverse) - for production use proper encryption
function encryptKey(key: string): string {
  return btoa(key.split('').reverse().join(''));
}

function decryptKey(encrypted: string): string {
  try {
    return atob(encrypted).split('').reverse().join('');
  } catch {
    return encrypted; // Return as-is if decryption fails
  }
}

// Get all API keys (returns masked values for security)
app.get("/make-server-0dd48dc4/api-keys", async (c) => {
  try {
    const allKeys = await kv.getByPrefix("apikey:");
    
    const keys: Record<string, string> = {};
    
    // Add infrastructure keys from environment
    keys["supabase_url"] = Deno.env.get("SUPABASE_URL") || "";
    keys["supabase_anon_key"] = Deno.env.get("SUPABASE_ANON_KEY") || "";
    keys["supabase_service_role_key"] = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "********" : "";
    
    allKeys.forEach((item: any) => {
      if (item.key && item.value) {
        const keyName = item.key.replace("apikey:", "");
        // Mask the value for security (show only if explicitly requested)
        keys[keyName] = item.value ? "********" : "";
      }
    });
    
    return c.json({ keys });
  } catch (error) {
    console.log("Error fetching API keys:", error);
    return c.json({ error: "Error fetching API keys" }, 500);
  }
});

// Get single API key (decrypted, for server use only)
app.get("/make-server-0dd48dc4/api-keys/:keyName", async (c) => {
  try {
    const keyName = c.req.param("keyName");
    const stored = await kv.get(`apikey:${keyName}`);
    
    if (!stored) {
      return c.json({ value: null });
    }
    
    const decrypted = decryptKey(stored.value);
    return c.json({ value: decrypted });
  } catch (error) {
    console.log("Error fetching API key:", error);
    return c.json({ error: "Error fetching API key" }, 500);
  }
});

// Save single API key
app.post("/make-server-0dd48dc4/api-keys", async (c) => {
  try {
    const { key, value } = await c.req.json();
    
    if (!key || !value) {
      return c.json({ error: "Key and value are required" }, 400);
    }
    
    // Encrypt the value before storing
    const encrypted = encryptKey(value);
    
    await kv.set(`apikey:${key}`, {
      key: `apikey:${key}`,
      value: encrypted,
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving API key:", error);
    return c.json({ error: "Error saving API key" }, 500);
  }
});

// Save multiple API keys at once
app.post("/make-server-0dd48dc4/api-keys/bulk", async (c) => {
  try {
    const { keys } = await c.req.json();
    
    if (!keys || typeof keys !== "object") {
      return c.json({ error: "Keys object is required" }, 400);
    }
    
    const timestamp = new Date().toISOString();
    const kvData: Record<string, any> = {};
    
    Object.entries(keys).forEach(([key, value]) => {
      if (value && typeof value === "string" && value.trim() !== "" && value !== "********") {
        const encrypted = encryptKey(value);
        kvData[`apikey:${key}`] = {
          key: `apikey:${key}`,
          value: encrypted,
          updatedAt: timestamp,
        };
      }
    });
    
    if (Object.keys(kvData).length > 0) {
      await kv.mset(kvData);
    }
    
    return c.json({ success: true, saved: Object.keys(kvData).length });
  } catch (error) {
    console.log("Error saving API keys:", error);
    return c.json({ error: "Error saving API keys" }, 500);
  }
});

// Delete API key
app.delete("/make-server-0dd48dc4/api-keys/:keyName", async (c) => {
  try {
    const keyName = c.req.param("keyName");
    await kv.del(`apikey:${keyName}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting API key:", error);
    return c.json({ error: "Error deleting API key" }, 500);
  }
});

// Helper function to get decrypted API key (for internal server use)
export async function getApiKey(keyName: string): Promise<string | null> {
  try {
    // First try to get from KV store
    const stored = await kv.get(`apikey:${keyName}`);
    if (stored?.value) {
      return decryptKey(stored.value);
    }
    
    // Fallback to environment variable
    const envKey = Deno.env.get(keyName.toUpperCase());
    return envKey || null;
  } catch (error) {
    console.log(`Error getting API key ${keyName}:`, error);
    return null;
  }
}

export default app;
