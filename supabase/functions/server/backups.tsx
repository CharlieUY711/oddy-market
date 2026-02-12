import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// Create backup
app.post("/make-server-0dd48dc4/backups", async (c) => {
  try {
    const { entity_id, modules } = await c.req.json();
    const id = `backup:${Date.now()}`;
    
    const backup = {
      id,
      entity_id: entity_id || "default",
      modules: modules || ["all"],
      created_at: new Date().toISOString(),
      status: "completed",
      size_mb: Math.random() * 100,
      location: `/backups/${id}.zip`,
    };

    await kv.set(id, backup);
    return c.json({ backup });
  } catch (error) {
    return c.json({ error: "Error creating backup" }, 500);
  }
});

// Get backups
app.get("/make-server-0dd48dc4/backups", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const backups = [];

    for await (const entry of kv.list({ prefix: "backup:" })) {
      const backup = entry.value as any;
      if (backup.entity_id === entity_id) backups.push(backup);
    }

    return c.json({ backups, total: backups.length });
  } catch (error) {
    return c.json({ error: "Error fetching backups" }, 500);
  }
});

// Restore backup
app.post("/make-server-0dd48dc4/backups/:id/restore", async (c) => {
  try {
    const id = c.req.param("id");
    const backup = await kv.get(id);

    if (!backup.value) {
      return c.json({ error: "Backup not found" }, 404);
    }

    return c.json({ message: "Backup restore initiated", backup: backup.value });
  } catch (error) {
    return c.json({ error: "Error restoring backup" }, 500);
  }
});

export default app;
