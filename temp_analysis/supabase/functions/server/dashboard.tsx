import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.get("/make-server-0dd48dc4/dashboard-config/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const config = await kv.get(`dashboard-config:${userId}`);
    
    if (!config) {
      return c.json({ widgets: [] });
    }
    
    return c.json(config);
  } catch (error) {
    console.log("Error fetching dashboard config:", error);
    return c.json({ error: "Error fetching dashboard config" }, 500);
  }
});

app.post("/make-server-0dd48dc4/dashboard-config/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const { widgets } = await c.req.json();
    
    await kv.set(`dashboard-config:${userId}`, { widgets });
    
    return c.json({ success: true });
  } catch (error) {
    console.log("Error saving dashboard config:", error);
    return c.json({ error: "Error saving dashboard config" }, 500);
  }
});

export default app;
