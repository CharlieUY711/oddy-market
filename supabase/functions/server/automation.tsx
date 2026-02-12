import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// WORKFLOWS - Flujos de Automatización
// ==========================================

// Create workflow
app.post("/make-server-0dd48dc4/automation/workflows", async (c) => {
  try {
    const workflow = await c.req.json();
    const id = workflow.id || `workflow:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newWorkflow = {
      ...workflow,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: workflow.status || "draft", // draft, active, paused, archived
      trigger: workflow.trigger || { type: "manual", config: {} },
      actions: workflow.actions || [],
      conditions: workflow.conditions || [],
      executions: 0,
      last_executed_at: null,
    };

    await kv.set(id, newWorkflow);
    return c.json({ workflow: newWorkflow });
  } catch (error) {
    return c.json({ error: "Error creating workflow" }, 500);
  }
});

// Get workflows
app.get("/make-server-0dd48dc4/automation/workflows", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const workflows = [];
    for await (const entry of kv.list({ prefix: "workflow:" })) {
      const workflow = entry.value as any;
      if (workflow.entity_id === entity_id) workflows.push(workflow);
    }
    return c.json({ workflows, total: workflows.length });
  } catch (error) {
    return c.json({ error: "Error fetching workflows" }, 500);
  }
});

// Execute workflow
app.post("/make-server-0dd48dc4/automation/workflows/:id/execute", async (c) => {
  try {
    const id = c.req.param("id");
    const { context } = await c.req.json();
    const workflow = await kv.get(id);

    if (!workflow.value) {
      return c.json({ error: "Workflow not found" }, 404);
    }

    // Execute actions (simulated)
    const execution_id = `execution:${Date.now()}`;
    const execution = {
      id: execution_id,
      workflow_id: id,
      status: "completed",
      context,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      actions_executed: workflow.value.actions.length,
    };

    await kv.set(execution_id, execution);

    // Update workflow stats
    const updatedWorkflow = {
      ...workflow.value,
      executions: (workflow.value.executions || 0) + 1,
      last_executed_at: new Date().toISOString(),
    };
    await kv.set(id, updatedWorkflow);

    return c.json({ execution, workflow: updatedWorkflow });
  } catch (error) {
    return c.json({ error: "Error executing workflow" }, 500);
  }
});

// ==========================================
// TRIGGERS - Disparadores
// ==========================================

// Create trigger
app.post("/make-server-0dd48dc4/automation/triggers", async (c) => {
  try {
    const trigger = await c.req.json();
    const id = trigger.id || `trigger:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newTrigger = {
      ...trigger,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      type: trigger.type || "event", // event, schedule, webhook, manual
      event: trigger.event || null,
      schedule: trigger.schedule || null,
      enabled: trigger.enabled !== false,
    };

    await kv.set(id, newTrigger);
    return c.json({ trigger: newTrigger });
  } catch (error) {
    return c.json({ error: "Error creating trigger" }, 500);
  }
});

// Get triggers
app.get("/make-server-0dd48dc4/automation/triggers", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const triggers = [];
    for await (const entry of kv.list({ prefix: "trigger:" })) {
      const trigger = entry.value as any;
      if (trigger.entity_id === entity_id) triggers.push(trigger);
    }
    return c.json({ triggers, total: triggers.length });
  } catch (error) {
    return c.json({ error: "Error fetching triggers" }, 500);
  }
});

// ==========================================
// RULES - Reglas de Negocio
// ==========================================

// Create rule
app.post("/make-server-0dd48dc4/automation/rules", async (c) => {
  try {
    const rule = await c.req.json();
    const id = rule.id || `rule:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newRule = {
      ...rule,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      conditions: rule.conditions || [],
      actions: rule.actions || [],
      priority: rule.priority || 0,
      enabled: rule.enabled !== false,
    };

    await kv.set(id, newRule);
    return c.json({ rule: newRule });
  } catch (error) {
    return c.json({ error: "Error creating rule" }, 500);
  }
});

// Evaluate rule
app.post("/make-server-0dd48dc4/automation/rules/:id/evaluate", async (c) => {
  try {
    const id = c.req.param("id");
    const { data } = await c.req.json();
    const rule = await kv.get(id);

    if (!rule.value) {
      return c.json({ error: "Rule not found" }, 404);
    }

    // Simple evaluation (in production, use proper rules engine)
    const result = {
      rule_id: id,
      passed: true,
      actions_to_execute: rule.value.actions,
      evaluated_at: new Date().toISOString(),
    };

    return c.json({ result });
  } catch (error) {
    return c.json({ error: "Error evaluating rule" }, 500);
  }
});

// Dashboard
app.get("/make-server-0dd48dc4/automation/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    
    const workflows = [];
    const executions = [];
    
    for await (const entry of kv.list({ prefix: "workflow:" })) {
      const workflow = entry.value as any;
      if (workflow.entity_id === entity_id) workflows.push(workflow);
    }
    
    for await (const entry of kv.list({ prefix: "execution:" })) {
      const execution = entry.value as any;
      executions.push(execution);
    }

    return c.json({
      dashboard: {
        workflows: {
          total: workflows.length,
          active: workflows.filter((w) => w.status === "active").length,
        },
        executions: {
          total: executions.length,
          today: executions.filter((e) => 
            new Date(e.started_at).toDateString() === new Date().toDateString()
          ).length,
        },
      },
    });
  } catch (error) {
    return c.json({ error: "Error fetching dashboard" }, 500);
  }
});

export default app;
