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

app.get("/make-server-0dd48dc4/orders", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const orders = await kv.getByPrefix("order:");
    return c.json({ orders });
  } catch (error) {
    console.log("Error fetching orders:", error);
    return c.json({ error: "Error fetching orders" }, 500);
  }
});

app.post("/make-server-0dd48dc4/orders", async (c) => {
  try {
    const order = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    const newOrder = {
      id,
      ...order,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`order:${id}`, newOrder);
    return c.json({ order: newOrder });
  } catch (error) {
    console.log("Error creating order:", error);
    return c.json({ error: "Error creating order" }, 500);
  }
});

app.put("/make-server-0dd48dc4/orders/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`order:${id}`);
    
    if (!existing) {
      return c.json({ error: "Order not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`order:${id}`, updated);
    return c.json({ order: updated });
  } catch (error) {
    console.log("Error updating order:", error);
    return c.json({ error: "Error updating order" }, 500);
  }
});

export default app;
