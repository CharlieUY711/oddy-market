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

app.get("/make-server-0dd48dc4/categories", async (c) => {
  try {
    const categories = await kv.getByPrefix("category:");
    return c.json({ categories });
  } catch (error) {
    console.log("Error fetching categories:", error);
    return c.json({ error: "Error fetching categories" }, 500);
  }
});

app.post("/make-server-0dd48dc4/categories", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const category = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    const newCategory = {
      id,
      ...category,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`category:${id}`, newCategory);
    return c.json({ category: newCategory });
  } catch (error) {
    console.log("Error creating category:", error);
    return c.json({ error: "Error creating category" }, 500);
  }
});

export default app;
