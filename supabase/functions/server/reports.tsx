import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// Create custom report
app.post("/make-server-0dd48dc4/reports", async (c) => {
  try {
    const report = await c.req.json();
    const id = `report:${Date.now()}`;
    
    const newReport = {
      ...report,
      id,
      created_at: new Date().toISOString(),
      type: report.type || "custom",
      schedule: report.schedule || null,
      recipients: report.recipients || [],
      status: "active",
    };

    await kv.set(id, newReport);
    return c.json({ report: newReport });
  } catch (error) {
    return c.json({ error: "Error creating report" }, 500);
  }
});

// Get reports
app.get("/make-server-0dd48dc4/reports", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const reports = [];

    for await (const entry of kv.list({ prefix: "report:" })) {
      const report = entry.value as any;
      if (report.entity_id === entity_id) reports.push(report);
    }

    return c.json({ reports, total: reports.length });
  } catch (error) {
    return c.json({ error: "Error fetching reports" }, 500);
  }
});

// Generate report
app.post("/make-server-0dd48dc4/reports/:id/generate", async (c) => {
  try {
    const id = c.req.param("id");
    const report = await kv.get(id);

    if (!report.value) {
      return c.json({ error: "Report not found" }, 404);
    }

    const generated_id = `generated_report:${Date.now()}`;
    const generatedReport = {
      id: generated_id,
      report_id: id,
      generated_at: new Date().toISOString(),
      data: { message: "Report data would be here" },
      format: report.value.format || "pdf",
    };

    await kv.set(generated_id, generatedReport);
    return c.json({ generated_report: generatedReport });
  } catch (error) {
    return c.json({ error: "Error generating report" }, 500);
  }
});

export default app;
