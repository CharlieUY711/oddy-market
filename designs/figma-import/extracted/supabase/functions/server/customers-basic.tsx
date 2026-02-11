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

app.get("/make-server-0dd48dc4/customers", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const customers = await kv.getByPrefix("customer:");
    return c.json({ customers });
  } catch (error) {
    console.log("Error fetching customers:", error);
    return c.json({ error: "Error fetching customers" }, 500);
  }
});

app.post("/make-server-0dd48dc4/customers", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const customer = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    const newCustomer = {
      id,
      ...customer,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`customer:${id}`, newCustomer);
    return c.json({ customer: newCustomer });
  } catch (error) {
    console.log("Error creating customer:", error);
    return c.json({ error: "Error creating customer" }, 500);
  }
});

app.get("/make-server-0dd48dc4/customers/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const customer = await kv.get(`customer:${id}`);
    
    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }
    
    return c.json({ customer });
  } catch (error) {
    console.log("Error fetching customer:", error);
    return c.json({ error: "Error fetching customer" }, 500);
  }
});

app.put("/make-server-0dd48dc4/customers/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`customer:${id}`);
    
    if (!existing) {
      return c.json({ error: "Customer not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`customer:${id}`, updated);
    return c.json({ customer: updated });
  } catch (error) {
    console.log("Error updating customer:", error);
    return c.json({ error: "Error updating customer" }, 500);
  }
});

app.delete("/make-server-0dd48dc4/customers/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    await kv.del(`customer:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting customer:", error);
    return c.json({ error: "Error deleting customer" }, 500);
  }
});

app.get("/make-server-0dd48dc4/customers/:id/orders", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const customer = await kv.get(`customer:${id}`);
    
    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    const allOrders = await kv.getByPrefix("order:");
    const customerOrders = allOrders.filter(
      (order: any) => order.customer?.email === customer.email
    );
    
    return c.json({ orders: customerOrders });
  } catch (error) {
    console.log("Error fetching customer orders:", error);
    return c.json({ error: "Error fetching customer orders" }, 500);
  }
});

export default app;
