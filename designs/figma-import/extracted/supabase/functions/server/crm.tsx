import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const crmApp = new Hono();

// ============== LEADS (PIPELINE) ==============

// Get all leads
crmApp.get("/make-server-0dd48dc4/crm/leads", async (c) => {
  try {
    const leads = await kv.getByPrefix("lead:");
    const sortedLeads = leads.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return c.json({ leads: sortedLeads });
  } catch (error) {
    console.log("Error fetching leads:", error);
    return c.json({ error: "Error fetching leads" }, 500);
  }
});

// Get single lead
crmApp.get("/make-server-0dd48dc4/crm/leads/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const lead = await kv.get(`lead:${id}`);

    if (!lead) {
      return c.json({ error: "Lead not found" }, 404);
    }

    return c.json({ lead });
  } catch (error) {
    console.log("Error fetching lead:", error);
    return c.json({ error: "Error fetching lead" }, 500);
  }
});

// Create lead
crmApp.post("/make-server-0dd48dc4/crm/leads", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const lead = {
      id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`lead:${id}`, lead);
    return c.json({ lead });
  } catch (error) {
    console.log("Error creating lead:", error);
    return c.json({ error: "Error creating lead" }, 500);
  }
});

// Update lead
crmApp.put("/make-server-0dd48dc4/crm/leads/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`lead:${id}`);

    if (!existing) {
      return c.json({ error: "Lead not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`lead:${id}`, updated);
    return c.json({ lead: updated });
  } catch (error) {
    console.log("Error updating lead:", error);
    return c.json({ error: "Error updating lead" }, 500);
  }
});

// Update lead stage
crmApp.put("/make-server-0dd48dc4/crm/leads/:id/stage", async (c) => {
  try {
    const id = c.req.param("id");
    const { stage } = await c.req.json();
    const lead = await kv.get(`lead:${id}`);

    if (!lead) {
      return c.json({ error: "Lead not found" }, 404);
    }

    const updated = {
      ...lead,
      stage,
      updatedAt: new Date().toISOString(),
    };

    // If won or lost, add closed timestamp
    if (stage === "won" || stage === "lost") {
      updated.closedAt = new Date().toISOString();
    }

    await kv.set(`lead:${id}`, updated);
    return c.json({ lead: updated });
  } catch (error) {
    console.log("Error updating lead stage:", error);
    return c.json({ error: "Error updating stage" }, 500);
  }
});

// Delete lead
crmApp.delete("/make-server-0dd48dc4/crm/leads/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`lead:${id}`);

    if (!existing) {
      return c.json({ error: "Lead not found" }, 404);
    }

    await kv.del(`lead:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting lead:", error);
    return c.json({ error: "Error deleting lead" }, 500);
  }
});

// ============== CUSTOMERS ==============

// Calculate customer score based on activity
function calculateCustomerScore(customer: any): number {
  let score = 0;

  // Points for purchases
  score += Math.min(customer.totalPurchases * 5, 30);

  // Points for total spent (every $1000 = 5 points, max 30)
  score += Math.min(Math.floor(customer.totalSpent / 1000) * 5, 30);

  // Points for recent activity (max 20)
  if (customer.lastPurchaseDate) {
    const daysSinceLastPurchase = Math.floor(
      (Date.now() - new Date(customer.lastPurchaseDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastPurchase < 30) score += 20;
    else if (daysSinceLastPurchase < 90) score += 10;
    else if (daysSinceLastPurchase < 180) score += 5;
  }

  // Points for average order value (max 20)
  if (customer.averageOrderValue > 1000) score += 20;
  else if (customer.averageOrderValue > 500) score += 10;
  else if (customer.averageOrderValue > 200) score += 5;

  return Math.min(score, 100);
}

// Get all customers
crmApp.get("/make-server-0dd48dc4/crm/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");

    // Calculate score for each customer
    const customersWithScore = customers.map((customer: any) => ({
      ...customer,
      score: calculateCustomerScore(customer),
    }));

    return c.json({ customers: customersWithScore });
  } catch (error) {
    console.log("Error fetching customers:", error);
    return c.json({ error: "Error fetching customers" }, 500);
  }
});

// Get single customer
crmApp.get("/make-server-0dd48dc4/crm/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const customer = await kv.get(`customer:${id}`);

    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    const customerWithScore = {
      ...customer,
      score: calculateCustomerScore(customer),
    };

    return c.json({ customer: customerWithScore });
  } catch (error) {
    console.log("Error fetching customer:", error);
    return c.json({ error: "Error fetching customer" }, 500);
  }
});

// Create customer
crmApp.post("/make-server-0dd48dc4/crm/customers", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const customer = {
      id,
      ...data,
      totalPurchases: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      createdAt: timestamp,
    };

    await kv.set(`customer:${id}`, customer);
    return c.json({ customer });
  } catch (error) {
    console.log("Error creating customer:", error);
    return c.json({ error: "Error creating customer" }, 500);
  }
});

// Update customer
crmApp.put("/make-server-0dd48dc4/crm/customers/:id", async (c) => {
  try {
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
    };

    await kv.set(`customer:${id}`, updated);
    return c.json({ customer: updated });
  } catch (error) {
    console.log("Error updating customer:", error);
    return c.json({ error: "Error updating customer" }, 500);
  }
});

// Delete customer
crmApp.delete("/make-server-0dd48dc4/crm/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`customer:${id}`);

    if (!existing) {
      return c.json({ error: "Customer not found" }, 404);
    }

    await kv.del(`customer:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting customer:", error);
    return c.json({ error: "Error deleting customer" }, 500);
  }
});

// ============== TASKS ==============

// Get all tasks
crmApp.get("/make-server-0dd48dc4/crm/tasks", async (c) => {
  try {
    const tasks = await kv.getByPrefix("task:");
    const sortedTasks = tasks.sort((a: any, b: any) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    return c.json({ tasks: sortedTasks });
  } catch (error) {
    console.log("Error fetching tasks:", error);
    return c.json({ error: "Error fetching tasks" }, 500);
  }
});

// Get single task
crmApp.get("/make-server-0dd48dc4/crm/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const task = await kv.get(`task:${id}`);

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json({ task });
  } catch (error) {
    console.log("Error fetching task:", error);
    return c.json({ error: "Error fetching task" }, 500);
  }
});

// Create task
crmApp.post("/make-server-0dd48dc4/crm/tasks", async (c) => {
  try {
    const data = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const task = {
      id,
      ...data,
      createdAt: timestamp,
    };

    await kv.set(`task:${id}`, task);
    return c.json({ task });
  } catch (error) {
    console.log("Error creating task:", error);
    return c.json({ error: "Error creating task" }, 500);
  }
});

// Update task
crmApp.put("/make-server-0dd48dc4/crm/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`task:${id}`);

    if (!existing) {
      return c.json({ error: "Task not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
    };

    await kv.set(`task:${id}`, updated);
    return c.json({ task: updated });
  } catch (error) {
    console.log("Error updating task:", error);
    return c.json({ error: "Error updating task" }, 500);
  }
});

// Complete task
crmApp.put("/make-server-0dd48dc4/crm/tasks/:id/complete", async (c) => {
  try {
    const id = c.req.param("id");
    const task = await kv.get(`task:${id}`);

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    const updated = {
      ...task,
      status: "completed",
      completedAt: new Date().toISOString(),
    };

    await kv.set(`task:${id}`, updated);
    return c.json({ task: updated });
  } catch (error) {
    console.log("Error completing task:", error);
    return c.json({ error: "Error completing task" }, 500);
  }
});

// Delete task
crmApp.delete("/make-server-0dd48dc4/crm/tasks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`task:${id}`);

    if (!existing) {
      return c.json({ error: "Task not found" }, 404);
    }

    await kv.del(`task:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting task:", error);
    return c.json({ error: "Error deleting task" }, 500);
  }
});

// ============== ANALYTICS ==============

crmApp.get("/make-server-0dd48dc4/crm/analytics", async (c) => {
  try {
    const range = c.req.query("range") || "month";
    
    const leads = await kv.getByPrefix("lead:");
    const customers = await kv.getByPrefix("customer:");
    
    // Calculate basic analytics
    const analytics = {
      leads: {
        total: leads.length,
        byStage: leads.reduce((acc: any, lead: any) => {
          acc[lead.stage] = (acc[lead.stage] || 0) + 1;
          return acc;
        }, {}),
        totalValue: leads.reduce((sum: number, lead: any) => sum + (lead.value || 0), 0),
      },
      customers: {
        total: customers.length,
        byCategory: customers.reduce((acc: any, customer: any) => {
          acc[customer.category] = (acc[customer.category] || 0) + 1;
          return acc;
        }, {}),
        totalRevenue: customers.reduce((sum: number, customer: any) => sum + (customer.totalSpent || 0), 0),
      },
    };

    return c.json(analytics);
  } catch (error) {
    console.log("Error fetching analytics:", error);
    return c.json({ error: "Error fetching analytics" }, 500);
  }
});

export default crmApp;
