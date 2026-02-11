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

app.get("/make-server-0dd48dc4/inventory", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const inventory = await kv.getByPrefix("inventory:");
    return c.json({ inventory });
  } catch (error) {
    console.log("Error fetching inventory:", error);
    return c.json({ error: "Error fetching inventory" }, 500);
  }
});

app.post("/make-server-0dd48dc4/inventory", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const item = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    const newItem = {
      id,
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`inventory:${id}`, newItem);
    return c.json({ item: newItem });
  } catch (error) {
    console.log("Error creating inventory item:", error);
    return c.json({ error: "Error creating inventory item" }, 500);
  }
});

app.put("/make-server-0dd48dc4/inventory/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`inventory:${id}`);
    
    if (!existing) {
      return c.json({ error: "Inventory item not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`inventory:${id}`, updated);
    return c.json({ item: updated });
  } catch (error) {
    console.log("Error updating inventory item:", error);
    return c.json({ error: "Error updating inventory item" }, 500);
  }
});

export default app;
