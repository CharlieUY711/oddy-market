import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// BACKUPS - Gestión de Backups
// ==========================================

// Create backup
app.post("/make-server-0dd48dc4/backups/create", async (c) => {
  try {
    const { entities, description } = await c.req.json();
    const entity_id = entities?.entity_id || "default";
    const id = `backup:${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Collect all data
    const data: any = {};
    const modules = [
      "product", "order", "invoice", "inventory", "contact", "user",
      "campaign", "deal", "lead", "notification", "webhook"
    ];

    for (const module of modules) {
      data[module] = [];
      for await (const entry of kv.list({ prefix: `${module}:` })) {
        const item = entry.value as any;
        if (item.entity_id === entity_id) {
          data[module].push(item);
        }
      }
    }

    const backup = {
      id,
      entity_id,
      description: description || `Backup ${timestamp}`,
      created_at: timestamp,
      size_bytes: JSON.stringify(data).length,
      modules_included: Object.keys(data),
      record_count: Object.values(data).reduce((sum: number, arr: any) => sum + arr.length, 0),
      status: "completed",
      data, // In production, store in S3/Cloud Storage
    };

    await kv.set(id, backup);
    return c.json({ backup: { ...backup, data: undefined }, message: "Backup created successfully" });
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
      if (backup.entity_id === entity_id) {
        // Don't return data, just metadata
        backups.push({
          ...backup,
          data: undefined,
        });
      }
    }

    backups.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ backups, total: backups.length });
  } catch (error) {
    return c.json({ error: "Error fetching backups" }, 500);
  }
});

// Download backup
app.get("/make-server-0dd48dc4/backups/:id/download", async (c) => {
  try {
    const id = c.req.param("id");
    const backup = await kv.get(id);

    if (!backup.value) {
      return c.json({ error: "Backup not found" }, 404);
    }

    return c.json(backup.value.data, 200, {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="backup_${id}.json"`,
    });
  } catch (error) {
    return c.json({ error: "Error downloading backup" }, 500);
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

    // Restore all data
    let restoredCount = 0;
    for (const [module, items] of Object.entries(backup.value.data)) {
      for (const item of items as any[]) {
        await kv.set(item.id, item);
        restoredCount++;
      }
    }

    return c.json({ 
      message: "Backup restored successfully", 
      restored_records: restoredCount 
    });
  } catch (error) {
    return c.json({ error: "Error restoring backup" }, 500);
  }
});

// Delete backup
app.delete("/make-server-0dd48dc4/backups/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.delete(id);
    return c.json({ message: "Backup deleted successfully" });
  } catch (error) {
    return c.json({ error: "Error deleting backup" }, 500);
  }
});

// ==========================================
// SCHEDULED BACKUPS - Backups Automáticos
// ==========================================

// Create backup schedule
app.post("/make-server-0dd48dc4/backups/schedules", async (c) => {
  try {
    const schedule = await c.req.json();
    const id = `backup_schedule:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newSchedule = {
      ...schedule,
      id,
      created_at: timestamp,
      frequency: schedule.frequency || "daily", // hourly, daily, weekly, monthly
      retention_days: schedule.retention_days || 30,
      status: "active",
      last_run: null,
      next_run: this.calculateNextRun(schedule.frequency),
    };

    await kv.set(id, newSchedule);
    return c.json({ schedule: newSchedule });
  } catch (error) {
    return c.json({ error: "Error creating backup schedule" }, 500);
  }
});

// Helper: Calculate next run
function calculateNextRun(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case "hourly": now.setHours(now.getHours() + 1); break;
    case "daily": now.setDate(now.getDate() + 1); break;
    case "weekly": now.setDate(now.getDate() + 7); break;
    case "monthly": now.setMonth(now.getMonth() + 1); break;
  }
  return now.toISOString();
}

// Dashboard
app.get("/make-server-0dd48dc4/backups/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const backups = [];

    for await (const entry of kv.list({ prefix: "backup:" })) {
      const backup = entry.value as any;
      if (backup.entity_id === entity_id) backups.push(backup);
    }

    const totalSize = backups.reduce((sum, b) => sum + (b.size_bytes || 0), 0);

    const dashboard = {
      total_backups: backups.length,
      total_size_mb: (totalSize / 1024 / 1024).toFixed(2),
      latest_backup: backups[0] || null,
      oldest_backup: backups[backups.length - 1] || null,
    };

    return c.json({ dashboard });
  } catch (error) {
    return c.json({ error: "Error fetching backups dashboard" }, 500);
  }
});

export default app;
