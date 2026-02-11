import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.get("/make-server-0dd48dc4/entities", async (c) => {
  try {
    const entities = await kv.getByPrefix("entity:");
    return c.json({ entities });
  } catch (error) {
    console.log("Error fetching entities:", error);
    return c.json({ error: "Error fetching entities" }, 500);
  }
});

app.post("/make-server-0dd48dc4/entities", async (c) => {
  try {
    const entityData = await c.req.json();
    await kv.set(entityData.id, entityData);
    return c.json({ entity: entityData });
  } catch (error) {
    console.log("Error creating entity:", error);
    return c.json({ error: "Error creating entity" }, 500);
  }
});

app.put("/make-server-0dd48dc4/entities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const entityData = await c.req.json();
    await kv.set(id, entityData);
    return c.json({ entity: entityData });
  } catch (error) {
    console.log("Error updating entity:", error);
    return c.json({ error: "Error updating entity" }, 500);
  }
});

app.delete("/make-server-0dd48dc4/entities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting entity:", error);
    return c.json({ error: "Error deleting entity" }, 500);
  }
});

export default app;
