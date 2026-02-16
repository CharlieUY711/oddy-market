import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// REPORTS - Reportes Personalizados
// ==========================================

// Create report template
app.post("/make-server-0dd48dc4/reports/templates", async (c) => {
  try {
    const template = await c.req.json();
    const id = template.id || `report_template:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newTemplate = {
      ...template,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      name: template.name,
      description: template.description || "",
      type: template.type || "standard", // standard, scheduled, dynamic
      data_sources: template.data_sources || [], // products, orders, users, etc.
      filters: template.filters || {},
      columns: template.columns || [],
      grouping: template.grouping || [],
      sorting: template.sorting || [],
      format: template.format || "table", // table, chart, pivot
      schedule: template.schedule || null, // cron expression
    };

    await kv.set(id, newTemplate);
    return c.json({ template: newTemplate });
  } catch (error) {
    return c.json({ error: "Error creating report template" }, 500);
  }
});

// Get report templates
app.get("/make-server-0dd48dc4/reports/templates", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const templates = [];

    for await (const entry of kv.list({ prefix: "report_template:" })) {
      const template = entry.value as any;
      if (template.entity_id === entity_id) templates.push(template);
    }

    return c.json({ templates, total: templates.length });
  } catch (error) {
    return c.json({ error: "Error fetching templates" }, 500);
  }
});

// Generate report
app.post("/make-server-0dd48dc4/reports/generate", async (c) => {
  try {
    const { template_id, parameters } = await c.req.json();
    const template = await kv.get(template_id);

    if (!template.value) {
      return c.json({ error: "Template not found" }, 404);
    }

    const report_id = `report:${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Fetch data based on data sources
    const data = await this.fetchReportData(template.value, parameters);

    const report = {
      id: report_id,
      template_id,
      template_name: template.value.name,
      parameters,
      data,
      generated_at: timestamp,
      status: "completed",
      row_count: data.length,
    };

    await kv.set(report_id, report);
    return c.json({ report });
  } catch (error) {
    return c.json({ error: "Error generating report" }, 500);
  }
});

// Helper: Fetch report data
async function fetchReportData(template: any, parameters: any): Promise<any[]> {
  const data: any[] = [];

  for (const source of template.data_sources) {
    for await (const entry of kv.list({ prefix: `${source}:` })) {
      const item = entry.value as any;
      
      // Apply filters
      let include = true;
      if (template.filters) {
        for (const [field, value] of Object.entries(template.filters)) {
          if (item[field] !== value) {
            include = false;
            break;
          }
        }
      }

      if (include) {
        // Select only specified columns
        if (template.columns.length > 0) {
          const filtered: any = {};
          template.columns.forEach((col: string) => {
            filtered[col] = item[col];
          });
          data.push(filtered);
        } else {
          data.push(item);
        }
      }
    }
  }

  return data;
}

// Get generated reports
app.get("/make-server-0dd48dc4/reports", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const reports = [];

    for await (const entry of kv.list({ prefix: "report:" })) {
      const report = entry.value as any;
      if (report.entity_id === entity_id) {
        // Don't return full data, just metadata
        reports.push({
          ...report,
          data: undefined,
          row_count: report.data?.length || 0,
        });
      }
    }

    reports.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());

    return c.json({ reports, total: reports.length });
  } catch (error) {
    return c.json({ error: "Error fetching reports" }, 500);
  }
});

// Get report by ID (with full data)
app.get("/make-server-0dd48dc4/reports/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const report = await kv.get(id);

    if (!report.value) {
      return c.json({ error: "Report not found" }, 404);
    }

    return c.json({ report: report.value });
  } catch (error) {
    return c.json({ error: "Error fetching report" }, 500);
  }
});

// Export report
app.get("/make-server-0dd48dc4/reports/:id/export", async (c) => {
  try {
    const id = c.req.param("id");
    const format = c.req.query("format") || "json"; // json, csv, pdf
    const report = await kv.get(id);

    if (!report.value) {
      return c.json({ error: "Report not found" }, 404);
    }

    if (format === "csv") {
      const csv = this.convertToCSV(report.value.data);
      return c.text(csv, 200, {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="report_${id}.csv"`,
      });
    }

    // Default to JSON
    return c.json(report.value.data);
  } catch (error) {
    return c.json({ error: "Error exporting report" }, 500);
  }
});

// Helper: Convert to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === "string" ? `"${value}"` : value;
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}

// ==========================================
// SCHEDULED REPORTS - Reportes Programados
// ==========================================

// Schedule report
app.post("/make-server-0dd48dc4/reports/schedules", async (c) => {
  try {
    const schedule = await c.req.json();
    const id = schedule.id || `schedule:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newSchedule = {
      ...schedule,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      template_id: schedule.template_id,
      frequency: schedule.frequency || "daily", // daily, weekly, monthly
      cron: schedule.cron || null,
      recipients: schedule.recipients || [], // email addresses
      format: schedule.format || "pdf",
      status: schedule.status || "active",
      last_run: null,
      next_run: this.calculateNextRun(schedule.frequency),
    };

    await kv.set(id, newSchedule);
    return c.json({ schedule: newSchedule });
  } catch (error) {
    return c.json({ error: "Error creating schedule" }, 500);
  }
});

// Helper: Calculate next run
function calculateNextRun(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1);
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      break;
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      break;
  }
  return now.toISOString();
}

// Get schedules
app.get("/make-server-0dd48dc4/reports/schedules", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const schedules = [];

    for await (const entry of kv.list({ prefix: "schedule:" })) {
      const schedule = entry.value as any;
      if (schedule.entity_id === entity_id) schedules.push(schedule);
    }

    return c.json({ schedules, total: schedules.length });
  } catch (error) {
    return c.json({ error: "Error fetching schedules" }, 500);
  }
});

// Dashboard
app.get("/make-server-0dd48dc4/reports/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const templates = [];
    const reports = [];

    for await (const entry of kv.list({ prefix: "report_template:" })) {
      const template = entry.value as any;
      if (template.entity_id === entity_id) templates.push(template);
    }

    for await (const entry of kv.list({ prefix: "report:" })) {
      const report = entry.value as any;
      if (report.entity_id === entity_id) reports.push(report);
    }

    const dashboard = {
      templates: {
        total: templates.length,
      },
      reports: {
        total: reports.length,
        today: reports.filter(r => 
          new Date(r.generated_at).toDateString() === new Date().toDateString()
        ).length,
        recent: reports.slice(-5).reverse(),
      },
    };

    return c.json({ dashboard });
  } catch (error) {
    return c.json({ error: "Error fetching reports dashboard" }, 500);
  }
});

export default app;
